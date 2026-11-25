import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { bank } from '../practice/bank.mjs';
import { loadBookPractice } from '../practice/book-bank.mjs';
const root=new URL('../',import.meta.url);
const book=await loadBookPractice(fileURLToPath(new URL('../../',import.meta.url)));
const keys=Object.keys(bank).sort();
assert.equal(keys.length,14);
let total=0,bookTotal=0;
for(const key of keys){
  assert.ok(bank[key].questions.length>=11);
  assert.ok(bank[key].resources.length>=2);
  const signatures=new Set();
  for(const [kind,questions]of [['extra',bank[key].questions],['book',book[key].questions]]){
    for(const [i,q]of questions.entries()){
      assert.ok(q.prompt||q.promptMarkdown,`${key}/${kind}/${i} missing prompt`);
      assert.ok(q.explanation||q.explanationMarkdown);
      assert.ok(q.options.length>=4);
      assert.ok(q.options.every(option=>option.trim().length));
      assert.equal(new Set(q.options).size,q.options.length);
      assert.ok(q.answer.length&&q.answer.length<q.options.length);
      assert.equal(new Set(q.answer).size,q.answer.length);
      for(const answer of q.answer)assert.ok(Number.isInteger(answer)&&answer>=0&&answer<q.options.length);
      const signature=JSON.stringify([q.prompt||q.promptMarkdown,q.code,q.options]);
      assert.ok(!signatures.has(signature),'Repeated question');signatures.add(signature);
      if(kind==='book'){bookTotal++;assert.equal(q.number,i+1);}else total++;
    }
  }
}
assert.equal(total,154);assert.equal(bookTotal,146);
// Known source defects must not silently become wrong automatic grading.
assert.deepEqual(book.ch04.questions[3].answer,[0]);
assert.deepEqual(book.ch07.questions[4].answer,[2]);
assert.deepEqual(book.ch11.questions[12].answer,[0,1]);
assert.deepEqual(book.ch13.questions[10].answer,[4]);
assert.equal(book.ch13.questions[10].options.length,5);
assert.ok(book.ch06.questions[8].reviewNote);
console.log(`Validated ${bookTotal} book questions plus ${total} extra questions.`);
const executablePath=process.env.CHROME_PATH||(process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined);
const browser=await chromium.launch({executablePath,headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await mkdir(fileURLToPath(new URL('screenshots/',root)),{recursive:true});
  const url=file=>pathToFileURL(fileURLToPath(new URL(file,root))).href;
  for(const key of keys){
    await page.goto(url(`${key}.html`));
    assert.equal(await page.locator('.quiz-form').count(),0);
    assert.equal(await page.locator('.chapter-pagination a').last().getAttribute('href'),`${key}-practice.html`);
    await page.goto(url(`${key}-practice.html`));
    assert.match(await page.locator('h1').textContent(),new RegExp(`Chapter ${Number(key.slice(2))}\\.1 Practice`));
    assert.equal(await page.locator('.quiz-form').count(),2);
    const order=await page.locator('.quiz-form').evaluateAll(forms=>forms.map(form=>form.dataset.quiz));
    assert.deepEqual(order,[`book-${key}`,key],'Book questions must appear before the extra quiz');
    for(const [quizId,questions]of [[`book-${key}`,book[key].questions],[key,bank[key].questions]]){
      const form=page.locator(`form[data-quiz="${quizId}"]`);
      const count=questions.length;
      assert.equal(await form.locator('.quiz-question').count(),count);
      assert.equal(await form.locator('.quiz-explanation:visible').count(),0);
      assert.equal(await form.locator('button[type=submit]').count(),0);
      const first=form.locator('.quiz-question').first();
      const wrong=questions[0].options.findIndex((_,i)=>!questions[0].answer.includes(i));
      // Click answer text itself on rich book options, not just its small input.
      if(quizId.startsWith('book-'))await first.locator('.quiz-option-content').nth(wrong).click();
      else await first.locator('input').nth(wrong).check();
      if(questions[0].answer.length>1){
        assert.equal(await first.locator('.quiz-feedback').isVisible(),false);
        await first.locator('.quiz-check').click();
      }
      assert.match(await first.locator('.quiz-verdict').textContent(),/^Incorrect\./);
      assert.ok(await first.locator('.quiz-explanation').isVisible());
      assert.equal(await first.locator('.is-wrong').count(),1);
      assert.equal(await first.locator('.is-answer').count(),questions[0].answer.length);
      const wrongColor=await first.locator('.is-wrong').evaluate(el=>getComputedStyle(el).backgroundColor);
      const correctColor=await first.locator('.is-answer').first().evaluate(el=>getComputedStyle(el).backgroundColor);
      assert.notEqual(wrongColor,correctColor);
      await first.locator('.quiz-retry').click();
      for(const answer of questions[0].answer)await first.locator('input').nth(answer).check();
      if(questions[0].answer.length>1)await first.locator('.quiz-check').click();
      assert.match(await first.locator('.quiz-verdict').textContent(),/^Correct\./);
      assert.equal(await first.locator('input:checked').first().evaluate(el=>getComputedStyle(el.closest('.quiz-option')).backgroundColor),correctColor);
      await form.evaluate((form,answers)=>{
        form.querySelectorAll('.quiz-question').forEach((field,i)=>{
          field.querySelectorAll('input').forEach(input=>{input.checked=answers[i].includes(Number(input.value));});
          field.querySelector('input').dispatchEvent(new Event('change',{bubbles:true}));
          field.querySelector('.quiz-check')?.click();
        });
      },questions.map(q=>q.answer));
      assert.equal(await form.locator('.quiz-verdict.correct').count(),count);
      assert.match(await form.locator('.quiz-score').textContent(),new RegExp(`${count} of ${count} answered · ${count} correct`));
      await page.reload();
      assert.equal(await form.locator('input:checked').count(),questions.reduce((n,q)=>n+q.answer.length,0));
      assert.equal(await form.locator('.quiz-explanation:visible').count(),count);
      await form.locator('.quiz-question').first().locator('.quiz-retry').click();
      assert.equal(await form.locator('.quiz-explanation:visible').count(),count-1);
      await form.locator('button[type=reset]').click();
      assert.equal(await form.locator('input:checked').count(),0);
      await page.reload();assert.equal(await form.locator('.quiz-explanation:visible').count(),0);
    }
    const number=Number(key.slice(2));
    assert.equal(await page.locator('.chapter-pagination a').last().getAttribute('href'),number<14?`ch${String(number+1).padStart(2,'0')}.html`:'index.html');
    console.log(`${key}: both practice sections passed`);
  }
  await page.goto(url('ch01-practice.html'));
  const extra=page.locator('form[data-quiz="ch01"]');
  const multi=extra.locator('.quiz-question').last();
  assert.ok(await multi.locator('.quiz-check').isDisabled());
  await multi.locator('input').nth(bank.ch01.questions.at(-1).answer[0]).check();
  assert.equal(await multi.locator('.quiz-feedback').isVisible(),false);
  assert.equal(await multi.locator('.is-answer').count(),0);
  await page.reload();
  assert.equal(await multi.locator('input:checked').count(),1);
  assert.equal(await multi.locator('.quiz-feedback').isVisible(),false,'Draft selections must stay hidden after reload');
  await multi.locator('.quiz-check').click();
  assert.match(await multi.locator('.quiz-verdict').textContent(),/^Partly correct\./);
  assert.equal(await multi.locator('.is-answer').count(),2);
  assert.ok(await multi.locator('.quiz-explanation').isVisible());
  await multi.locator('input').nth(bank.ch01.questions.at(-1).answer[1]).check();
  assert.equal(await multi.locator('.quiz-feedback').isVisible(),false,'Editing a checked answer must hide feedback');
  assert.equal(await multi.locator('.is-answer').count(),0);
  assert.match(await extra.locator('.quiz-score').textContent(),/^0 of 11 answered/);
  await multi.locator('.quiz-check').focus();
  await page.keyboard.press('Enter');
  assert.match(await multi.locator('.quiz-verdict').textContent(),/^Correct\./);
  await multi.locator('.quiz-retry').click();
  assert.equal(await multi.locator('input:checked').count(),0);
  assert.ok(await multi.locator('.quiz-check').isDisabled());
  assert.equal(await page.locator('form[data-quiz="book-ch01"] input:checked').count(),0,'Sections must have independent saved selections');
  await extra.locator('button[type=reset]').click();
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:fileURLToPath(new URL('screenshots/practice-desktop.png',root))});
  const first=page.locator('#book-q1');
  await first.locator('input').nth(0).check();
  await first.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.screenshot({path:fileURLToPath(new URL('screenshots/book-feedback.png',root))});
  await page.goto(url('ch03-practice.html'));
  const rich=page.locator('#book-q5');
  assert.ok(await rich.locator('.quiz-option-content pre').count()>0,'Code answer choices must be preserved');
  await rich.locator('input').first().check();
  await rich.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.screenshot({path:fileURLToPath(new URL('screenshots/book-code-options.png',root))});
  for(const width of [1280,768,390,360]){
    await page.setViewportSize({width,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}px`);
    if(width===390){await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:fileURLToPath(new URL('screenshots/practice-mobile.png',root))});}
  }
  await page.goto(url('ch01.html')+'#practice-questions');await page.waitForURL(/ch01-practice\.html#book-practice$/);
  await page.goto(url('ch01.html')+'#chapter-quiz');await page.waitForURL(/ch01-practice\.html#chapter-quiz$/);
  assert.deepEqual(errors,[]);
  console.log('All 300 questions pass interactive grading, color feedback, saved state, independent resets, code rendering, responsive layout, and legacy links.');
}finally{await browser.close();}
