import { Marked } from 'marked';
import hljs from 'highlight.js';
import { bank } from '../practice/bank.mjs';

const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = new Marked({renderer:{
  html({text}){return esc(text);},
  code({text,lang}){
    const language=(lang||'text').trim().split(/\s/)[0];
    const content=hljs.getLanguage(language)?hljs.highlight(text,{language}).value:esc(text);
    return `<div class="code-block"><pre tabindex="0"><code class="hljs">${content}</code></pre></div>`;
  }
}});

export function renderBookPractice(chapter,entry){
  return `<section class="chapter-quiz book-practice" id="book-practice" aria-labelledby="book-practice-title">
    <h2 id="book-practice-title">Book practice questions</h2>
    <p class="quiz-intro">${entry.questions.length} questions from the chapter, with the book’s explanations. Single-answer questions show immediate feedback. For checkbox questions, select your answers, then choose Check answer. Reviewed corrections and clarifications are identified beside the question.</p>
    <form class="quiz-form" data-quiz="book-${chapter}"><p class="quiz-score"></p>
      ${entry.questions.map(question=>{
        const id=`book-q${question.number}`;
        return `<fieldset class="quiz-question" id="${id}" data-answer="${question.answer.join(',')}" aria-describedby="${id}-feedback">
          <legend>Question ${question.number}</legend>
          <div class="quiz-question-meta">${question.answer.length>1?`Select ${question.answer.length} answers`:'Select one answer'}</div>
          <div class="book-question-prompt">${md.parse(question.promptMarkdown)}</div>
          ${question.reviewNote?`<p class="question-review-note"><strong>Reviewed note:</strong> ${esc(question.reviewNote)}</p>`:''}
          <div class="quiz-options">${question.options.map((option,i)=>{
            const optionId=`${id}-option-${i}`;
            return `<div class="quiz-option" data-selectable><input id="${optionId}" type="${question.answer.length>1?'checkbox':'radio'}" name="${id}" value="${i}" aria-labelledby="${optionId}-letter ${optionId}-text"><span class="option-letter" id="${optionId}-letter">${String.fromCharCode(65+i)}</span><div class="quiz-option-content" id="${optionId}-text">${md.parse(option)}</div></div>`;
          }).join('')}</div>
          ${question.answer.length>1?'<button type="button" class="quiz-check primary-button" disabled>Check answer</button>':''}
          <div class="quiz-feedback" id="${id}-feedback" role="status" aria-live="polite" hidden><p class="quiz-verdict"></p><div class="quiz-explanation">${md.parse(question.explanationMarkdown)}</div><p class="answer-origin">${question.reviewNote?'Includes a reviewed clarification or correction.':'Answer and explanation adapted from the book’s answer sheet.'} ${question.reference?`<a href="${esc(question.reference)}" target="_blank" rel="noopener noreferrer">Check the Java reference<span class="sr-only"> (opens in a new tab)</span></a>`:''}</p><button type="button" class="quiz-retry">Try this question again</button></div>
        </fieldset>`;
      }).join('')}
      <div class="quiz-controls"><button type="reset" class="primary-button">Restart book practice</button></div>
    </form>
  </section>`;
}
export function renderPractice(chapter) {
  const entry=bank[chapter];
  if(!entry)return '';
  const {questions,resources}=entry;
  return `<section class="chapter-quiz" id="chapter-quiz" aria-labelledby="quiz-title">
    <h2 id="quiz-title">Extra quiz</h2>
    <p class="quiz-intro">Choose an answer to see its explanation immediately. Correct choices appear in green; incorrect selections appear in red. For checkbox questions, select your answers, then choose Check answer.</p>
    <details class="practice-context"><summary>About these questions</summary><p>${questions.length} original learning exercises, not official exam questions. Use Java 21 without preview features. Assume standard imports and a valid enclosing class or method, which may declare checked exceptions.</p></details>
    <p class="quiz-saving">Your selections and feedback are saved in this browser.</p>
    <noscript><p>Enable JavaScript for scoring. The book’s practice questions and separate answer sheet remain available without it.</p></noscript>
    <form class="quiz-form" data-quiz="${chapter}">
      <p class="quiz-score"></p>
      ${questions.map((question,i)=>{
        const id=`quiz-q${i+1}`;
        return `<fieldset class="quiz-question" id="${id}" data-answer="${question.answer.join(',')}" aria-describedby="${id}-feedback">
          <legend><span class="quiz-number">${i+1}.</span> ${md.parseInline(question.prompt)}</legend>
          <div class="quiz-question-meta">${esc(question.topic)} · ${question.answer.length>1?`Select ${question.answer.length} answers`:'Select one answer'}</div>
          ${question.code?`<div class="code-block quiz-code"><pre tabindex="0"><code class="hljs language-java">${hljs.highlight(question.code,{language:'java'}).value}</code></pre></div>`:''}
          <div class="quiz-options">${question.options.map((option,j)=>`<label class="quiz-option"><input type="${question.answer.length>1?'checkbox':'radio'}" name="${id}" value="${j}"><span class="option-letter">${String.fromCharCode(65+j)}</span><span>${md.parseInline(option)}</span></label>`).join('')}</div>
          ${question.answer.length>1?'<button type="button" class="quiz-check primary-button" disabled>Check answer</button>':''}
          <div class="quiz-feedback" id="${id}-feedback" role="status" aria-live="polite" hidden><p class="quiz-verdict"></p><div class="quiz-explanation">${md.parseInline(question.explanation)}</div><button type="button" class="quiz-retry">Try this question again</button></div>
        </fieldset>`;
      }).join('')}
      <div class="quiz-controls"><button type="reset" class="primary-button">Restart extra quiz</button></div>
    </form>
  </section>
  <section class="study-resources" id="free-resources" aria-labelledby="resources-title"><h2 id="resources-title">Free resources</h2><p>Use these to revisit the rules or try more examples. Links open in a new tab and need an internet connection. Some tutorials also cover Java versions newer than 21.</p>
    <ul>${resources.map(resource=>`<li><a href="${esc(resource.url)}" target="_blank" rel="noopener noreferrer">${esc(resource.title)}<span class="sr-only"> (opens in a new tab)</span></a><p>${esc(resource.note)}</p></li>`).join('')}</ul>
    <p class="resource-date">Links reviewed 31 October 2026.</p>
  </section>`;
}
