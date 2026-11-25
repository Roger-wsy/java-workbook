import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { corrections } from './book-corrections.mjs';

// Recognize question/option boundaries only outside Markdown code fences.
function splitOutsideFences(markdown, pattern) {
  const parts=[];
  let current=null, fence=null;
  for(const line of markdown.replace(/\r\n/g,'\n').split('\n')) {
    const marker=line.match(/^\s*(`{3,}|~{3,})/);
    if(marker){
      if(!fence)fence={char:marker[1][0],length:marker[1].length};
      else if(marker[1][0]===fence.char&&marker[1].length>=fence.length)fence=null;
    }
    const match=!fence&&!marker?line.match(pattern):null;
    if(match){
      current={match,lines:[line.slice(match[0].length)]};parts.push(current);
    } else if(current)current.lines.push(line);
  }
  return parts.map(part=>({...part,text:part.lines.join('\n').trim()}));
}

export async function loadBookPractice(root) {
  const entries=await Promise.all(Array.from({length:14},async(_,i)=>{
    const id=`ch${String(i+1).padStart(2,'0')}`;
    const [chapter,answers]=await Promise.all([readFile(path.join(root,`${id}.md`),'utf8'),readFile(path.join(root,`${id}a.md`),'utf8')]);
    const section=chapter.split(/^## Practice Questions\s*$/m)[1];
    if(!section)throw Error(`${id}: missing practice questions`);
    const keys=new Map(splitOutsideFences(answers,/^\*\*(\d+)\s*\.\s*/).map(part=>{
      const header=part.text.match(/^The correct answers? (?:is|are) ([^\n]+?)[.:]\*\*/i);
      if(!header)throw Error(`${id} answer ${part.match[1]}: unrecognized answer heading`);
      const letters=[...header[1].matchAll(/\b([A-Z])\b/g)].map(match=>match[1]);
      return [Number(part.match[1]),{letters,explanationMarkdown:part.text.slice(header[0].length).replace(/^\s*\*\*Explanation:\*\*\s*/,'').trim()}];
    }));
    const questions=splitOutsideFences(section,/^\*\*(\d+)\.\s+/).map(part=>{
      const number=Number(part.match[1]);
      const question=part.text.replace('**','');
      const options=splitOutsideFences(question,/^\*\*([A-Z])[).]\*\*\s*/);
      if(options.length<2)throw Error(`${id} question ${number}: missing options`);
      const firstOption=question.search(/^\*\*[A-Z][).]\*\*/m);
      const key=keys.get(number);
      if(!key)throw Error(`${id} question ${number}: no answer key`);
      const letters=options.map(option=>option.match[1]);
      if(letters.some((letter,index)=>letter!==String.fromCharCode(65+index)))throw Error(`${id} question ${number}: option letters are not consecutive`);
      const answer=key.letters.map(letter=>letters.indexOf(letter));
      if(!answer.length||answer.some(index=>index<0))throw Error(`${id} question ${number}: answer does not match choices`);
      const result={number,topic:`Book question ${number}`,promptMarkdown:question.slice(0,firstOption).trim(),options:options.map(option=>option.text),answer,explanationMarkdown:key.explanationMarkdown};
      const correction=corrections[`${id}:${number}`];
      if(correction){
        result.reviewNote=correction.reviewNote;
        result.reference=correction.reference;
        if(correction.answer)result.answer=correction.answer;
        if(correction.explanationMarkdown)result.explanationMarkdown=correction.explanationMarkdown;
        for(const [index,text]of Object.entries(correction.optionChanges||{}))result.options[Number(index)]=text;
        if(correction.extraOption)result.options.push(correction.extraOption);
      }
      return result;
    });
    if(keys.size!==questions.length)throw Error(`${id}: question/answer count differs`);
    return [id,{questions}];
  }));
  return Object.fromEntries(entries);
}
