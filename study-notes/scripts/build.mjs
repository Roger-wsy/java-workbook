import { readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Marked } from 'marked';
import YAML from 'yaml';
import hljs from 'highlight.js';
import { renderPractice, renderBookPractice } from './render-practice.mjs';
import { bank } from '../practice/bank.mjs';
import { loadBookPractice } from '../practice/book-bank.mjs';

const out = fileURLToPath(new URL('../', import.meta.url));
const root = path.dirname(out);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain = s => s.replace(/<[^>]*>/g, '').replace(/[`*_]/g, '');
const slug = s => plain(s).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-');
const files = ['intro.md', ...(await readdir(root)).filter(f => /^ch\d\d(a)?\.md$/.test(f)).sort()];
const docs = await Promise.all(files.map(async file => {
  const raw = await readFile(path.join(root, file), 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const meta = match ? YAML.parse(match[1]) : {};
  const body = raw.slice(match?.[0].length || 0);
  return { file, id: file.replace('.md', ''), meta, body, answer: /a\.md$/.test(file), number: Number(file.match(/\d+/)?.[0] || 0) };
}));
const chapters = docs.filter(d => d.number && !d.answer);
const bookPractice = await loadBookPractice(root);
const title = d => d.meta.subtitle || 'Introduction';
const icon = (name) => {
  const paths = {book:'M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H4z M20 4h-4a3 3 0 0 0-3 3v14a4 4 0 0 1 4-3h3z',menu:'M4 6h16 M4 12h16 M4 18h16',arrow:'M5 12h14 M13 6l6 6-6 6',search:'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',check:'M5 12l4 4L19 6',copy:'M9 9h11v11H9z M5 15H3V3h12v2'};
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name].split(' M').map((p,i)=>`<path d="${i?'M':''}${p}"/>`).join('')}</svg>`;
};
function rail(active) {
  return `<aside class="sidebar" id="chapter-nav" role="dialog" aria-label="Chapter navigation" inert>
    <div class="drawer-heading"><a class="brand" href="index.html"><img class="site-logo" src="assets/favicon.svg" alt="" width="28" height="28">Java 21</a><button class="close-menu" aria-label="Close chapter navigation"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
    <nav aria-label="Chapters"><a class="overview ${active==='index'?'selected':''}" href="index.html" ${active==='index'?'aria-current="page"':''}>All chapters</a>
    <a class="chapter-link ${active==='intro'?'selected':''}" href="intro.html" ${active==='intro'?'aria-current="page"':''}><span class="chapter-number">—</span><span>Introduction</span></a>
    ${chapters.map(d=>`<a class="chapter-link ${active.replace(/a$/,'')===d.id?'selected':''}" href="${d.id}.html" ${active===d.id?'aria-current="page"':''} data-chapter="${d.id}"><span class="chapter-number">${String(d.number).padStart(2,'0')}</span><span>${esc(title(d))}</span><span class="completion-dot" aria-hidden="true"></span></a><a class="chapter-link practice-link ${active===`${d.id}-practice`?'selected':''}" href="${d.id}-practice.html" ${active===`${d.id}-practice`?'aria-current="page"':''}><span class="chapter-number">${d.number}.1</span><span>Practice</span></a>`).join('')}</nav>
    <div class="rail-footer">Java SE 21 Developer · 1Z0-830</div></aside>`;
}
function shell(id, pageTitle, content, toc='') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="application-name" content="Java 21 Study Notes"><meta name="theme-color" content="#ffffff"><title>Java 21 Study Notes · ${esc(pageTitle)}</title><link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
    <link rel="preload" href="assets/fonts/source-sans-3-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="assets/style.css"><script src="assets/app.js" defer></script></head>
    <body data-page="${id}"><a class="skip-link" href="#main">Skip to content</a><div class="reading-progress" aria-hidden="true"></div>${rail(id)}<div class="nav-scrim" hidden></div>
    <div class="workspace"><header class="topbar"><div class="header-inner"><a class="masthead" href="index.html"><img class="site-logo" src="assets/favicon.svg" alt="" width="28" height="28">Java 21<span>Study notes</span></a><div class="header-actions"><button class="menu-button" aria-label="Open chapter navigation" aria-expanded="false" aria-controls="chapter-nav">${icon('menu')}<span>Chapters</span></button><div class="reading-tools"><button id="text-size" title="Adjust reading text size" aria-label="Increase reading text size">Aa</button><button id="focus-mode" aria-pressed="false">Focus</button><button id="print-page" title="Print or save as PDF">Print</button></div></div></div></header>
    <div class="page-grid ${id==='index'?'library-grid':''}"><main id="main" tabindex="-1">${content}<footer class="page-footer">Based on <a href="https://github.com/eh3rrera/ocpj21-book">Esteban Herrera’s Java SE 21 Developer Study Guide</a>.<br>© 2024 Esteban Herrera · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> · <a href="LICENSE.txt">Original license</a></footer></main>${toc}</div></div><div class="toast" role="status"></div></body></html>`;
}
await mkdir(path.join(out, 'assets'), { recursive:true });
await mkdir(path.join(out,'assets/fonts'),{recursive:true});
for (const style of ['400-normal','400-italic','600-normal','700-normal']) {
  const file=`source-sans-3-latin-${style}.woff2`;
  await copyFile(path.join(out,'node_modules/@fontsource/source-sans-3/files',file),path.join(out,'assets/fonts',file));
}
await copyFile(path.join(out,'node_modules/@fontsource/source-sans-3/LICENSE'),path.join(out,'assets/fonts/OFL.txt'));
await writeFile(path.join(out,'LICENSE.txt'),await readFile(path.join(root,'LICENSE.txt')));
const catalog = [];
for (const d of docs) {
  let body = d.body.replace(/^## Chapter Content\r?\n[\s\S]*?^---\s*$/m, '');
  if(d.number&&!d.answer)body=body.replace(/^## Practice Questions\s*$[\s\S]*/m,`## Practice Questions\n\n[Open the interactive book questions on the Chapter ${d.number}.1 Practice page](${d.id}-practice.html#book-practice).\n`);
  const headings = [], seen = new Map();
  const md = new Marked({gfm:true, renderer:{
    heading({tokens,depth}) {
      const label = this.parser.parseInline(tokens);
      const base = slug(label); const count = seen.get(base) || 0; seen.set(base,count+1);
      const id = base + (count ? `-${count}` : '');
      if (depth <= 3) headings.push({id,label:plain(label),depth});
      return `<h${depth} id="${esc(id)}">${label}<a class="heading-anchor" href="#${esc(id)}" aria-label="Link to ${esc(plain(label))}">#</a></h${depth}>`;
    },
    code({text,lang}) {
      const language = (lang || 'text').trim().split(/\s/)[0];
      const highlighted = hljs.getLanguage(language) ? hljs.highlight(text,{language}).value : esc(text);
      return `<div class="code-block"><div class="code-toolbar"><span>${esc(language==='java'?'Java':language)}</span><button class="copy-code">${icon('copy')}<span>Copy</span></button></div><pre tabindex="0"><code class="hljs language-${esc(language)}">${highlighted}</code></pre></div>`;
    },
    link({href,title,tokens}) {
      href = href.replace(/^\/(?=(?:ch\d|intro|index))/, '').replace(/\.md(?=#|$)/,'.html');
      // The supplied Date API chapter points to an old Localization chapter number.
      if (href === 'ch15.html#the-datetimeformatter-class') href = 'ch14.html#the-datetimeformatter-class';
      return `<a href="${esc(href)}"${title?` title="${esc(title)}"`:''}>${this.parser.parseInline(tokens)}</a>`;
    },
    table(token) { return `<div class="table-scroll" role="region" aria-label="Reference table" tabindex="0">${`<table><thead><tr>${token.header.map(c=>`<th>${this.parser.parseInline(c.tokens)}</th>`).join('')}</tr></thead><tbody>${token.rows.map(row=>`<tr>${row.map(c=>`<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('')}</tbody></table>`}</div>`; }
  }});
  let html = md.parse(body);
  if (d.answer) html = html.replace(/<p><strong>(\d+)\. (The correct answers?[\s\S]*?)<\/strong><\/p>([\s\S]*?)(?=<p><strong>\d+\. The correct answer|$)/g, (_,n,answer,explanation)=>`<details class="answer-item" id="answer-${n}"><summary><span>Question ${n}</span><span class="answer-reveal">Explanation</span></summary><div class="answer-body"><p><strong>${answer}</strong></p>${explanation}</div></details>`);
  const minutes = Math.max(1,Math.ceil(plain(body).split(/\s+/).length/220));
  if(d.answer&&bookPractice[d.id.replace(/a$/,'')].questions.some(question=>question.reviewNote)){
    html=`<p class="question-review-note">This page preserves the original answer sheet. Reviewed corrections and clarifications appear beside the <a href="${d.id.replace(/a$/,'')}-practice.html#book-practice">interactive book questions</a>.</p>${html}`;
  }
  catalog.push({id:d.id,title:title(d),number:d.number,answer:d.answer,text:plain(body).replace(/\s+/g,' ')});
  const objectives = d.meta.exam_objectives || [];
  const chapterId=`ch${String(d.number).padStart(2,'0')}`;
  const actions = d.number ? `<div class="chapter-actions"><a class="${!d.answer?'active':''}" href="${chapterId}.html">Read chapter</a><a href="${chapterId}.html#key-points">Key points</a><a href="${chapterId}-practice.html#book-practice">Book questions</a><a href="${chapterId}-practice.html#chapter-quiz">Extra quiz</a><a class="${d.answer?'active':''}" href="${chapterId}a.html">Original answers</a></div>`:'';
  const priorChapter = chapters.find(x=>x.number===d.number-1);
  const previous = d.answer ? {id:chapterId,meta:{subtitle:title(d)}} : priorChapter ? {id:`${priorChapter.id}-practice`,meta:{subtitle:`Chapter ${priorChapter.number}.1 Practice`}} : docs[0];
  const next = d.number ? {id:`${chapterId}-practice`,meta:{subtitle:`Chapter ${d.number}.1 Practice`}} : chapters[0];
  const article = `<div class="document-heading"><h1>${esc(title(d))}${d.answer?'<span class="answer-title">Answers & explanations</span>':''}</h1><div class="document-meta">${d.number?`Chapter ${String(d.number).padStart(2,'0')}${d.answer?' / Answer sheet':''}`:'Introduction'}<span>·</span>${minutes} min read</div>${actions}</div>${objectives.length&&!d.answer?`<details class="objectives" open><summary>Exam objectives</summary><ul>${objectives.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></details>`:''}<article class="prose">${html}</article><section class="personal-notes" aria-labelledby="notes-heading"><h2 id="notes-heading">Your notes</h2><p>Notes for this ${d.answer?'answer sheet':'chapter'}.</p><label for="notes" class="sr-only">Your personal notes for this page</label><textarea id="notes" rows="5" placeholder="Add a note…"></textarea><span class="notes-status" role="status">Saved in this browser only.</span></section>${d.number&&!d.answer?`<div class="finish-chapter"><button class="primary-button" id="complete-chapter" data-id="${d.id}" aria-pressed="false">${icon('check')}<span>Mark chapter complete</span></button><a href="${d.id}a.html">Review the answers ${icon('arrow')}</a></div>`:''}<nav class="chapter-pagination" aria-label="Previous and next chapters">${d.number>0?`<a href="${previous.id}.html"><small>Previous</small>${esc(title(previous))}</a>`:''}${next?`<a href="${next.id}.html"><small>Next chapter</small>${esc(title(next))} ${icon('arrow')}</a>`:''}</nav>`;
  const toc = `<aside class="contents"><details open><summary>In this chapter</summary><nav aria-label="On this page">${headings.filter(h=>h.depth<=2).map(h=>`<a class="toc-link" href="#${esc(h.id)}">${esc(h.label)}</a>`).join('')}</nav></details><a class="back-top" href="#main">Back to top ${icon('arrow')}</a></aside>`;
  await writeFile(path.join(out,`${d.id}.html`),shell(d.id,title(d),article,toc));
}
for (const chapter of chapters) {
  const id=`${chapter.id}-practice`;
  const label=`Chapter ${chapter.number}.1 Practice`;
  const next=chapters.find(d=>d.number===chapter.number+1);
  const questions=bank[chapter.id].questions;
  const book=bookPractice[chapter.id];
  const content=`<div class="document-heading"><h1>${label}</h1><p class="practice-subtitle">${esc(title(chapter))}</p><div class="document-meta">${book.questions.length} book questions <span>·</span> ${questions.length} extra quiz questions</div><div class="chapter-actions"><a href="${chapter.id}.html">Read chapter ${chapter.number}</a><a class="active" aria-current="page" href="${id}.html">Practice ${chapter.number}.1</a><a href="${chapter.id}a.html">Original answers</a></div></div><nav class="practice-section-nav" aria-label="Practice sections"><a href="#book-practice">Book questions</a><a href="#chapter-quiz">Extra quiz</a><button type="button" class="reset-all-quizzes">Reset all questions</button></nav><article class="prose practice-prose">${renderBookPractice(chapter.id,book)}${renderPractice(chapter.id)}</article><nav class="chapter-pagination" aria-label="Previous and next chapters"><a href="${chapter.id}.html"><small>Previous · Chapter ${chapter.number}</small>${esc(title(chapter))}</a><a href="${next?`${next.id}.html`:'index.html'}"><small>${next?`Next · Chapter ${next.number}`:'Practice complete'}</small>${next?esc(title(next)):'Back to all chapters'} ${icon('arrow')}</a></nav>`;
  const contents=`<aside class="contents"><details open><summary>Practice sections</summary><nav aria-label="On this page"><a class="toc-link" href="#book-practice">Book questions · ${book.questions.length}</a><a class="toc-link" href="#chapter-quiz">Extra quiz · ${questions.length}</a><a class="toc-link" href="#free-resources">Free resources</a></nav></details><a class="back-top" href="#main">Back to top ${icon('arrow')}</a></aside>`;
  await writeFile(path.join(out,`${id}.html`),shell(id,label,content,contents));
}
const home = `<section class="library-heading"><h1>Java 21 study notes</h1><p>A chapter-by-chapter guide to the Java SE 21 Developer exam.</p><div class="library-links"><a class="continue-link" href="ch01.html"><span>Start with chapter 1</span>${icon('arrow')}</a><a class="intro-link" href="intro.html">Introduction</a></div></section>
  <section class="chapter-library" aria-labelledby="library-title"><div class="library-toolbar"><div><h2 id="library-title">Contents</h2><p><span id="completion-count">0</span> of 14 completed</p></div><label class="search-box">${icon('search')}<input id="chapter-search" type="search" placeholder="Search notes" aria-label="Search chapters and their content"><kbd>/</kbd></label></div><div class="search-status" role="status"></div>
  <div class="chapter-list">${chapters.map(d=>`<div class="chapter-entry"><a class="chapter-row" href="${d.id}.html" data-id="${d.id}"><span class="row-number">${String(d.number).padStart(2,'0')}</span><div><h3>${esc(title(d))}</h3><p>${[...d.body.matchAll(/^## (?!Chapter Content)/gm)].length} sections <span>·</span> ${Math.ceil(plain(d.body).split(/\s+/).length/220)} min read</p></div><span class="row-state">${icon('arrow')}</span></a><a class="index-practice-link" href="${d.id}-practice.html">${d.number}.1 Practice <span>· ${bookPractice[d.id].questions.length+bank[d.id].questions.length} questions</span></a></div>`).join('')}</div><p id="no-results" hidden>No chapters match. Try “streams”, “records”, or “exceptions”.</p></section>`;
await writeFile(path.join(out,'index.html'),shell('index','All chapters',home));
// A local script (rather than fetch) keeps search functional on file:// URLs.
await writeFile(path.join(out,'assets/search-data.js'),`window.STUDY_SEARCH=${JSON.stringify(catalog.filter(d=>!d.answer)).replace(/</g,'\\u003c')};`);
const indexPath = path.join(out,'index.html');
await writeFile(indexPath,(await readFile(indexPath,'utf8')).replace('<script src="assets/app.js"','<script src="assets/search-data.js" defer></script><script src="assets/app.js"'));
console.log(`Built ${docs.length + chapters.length + 1} offline HTML pages, including ${chapters.length} separate practice pages.`);

