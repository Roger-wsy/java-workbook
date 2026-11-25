import { chromium } from 'playwright';
import { readdir, readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const files=(await readdir(root)).filter(f=>f.endsWith('.html'));
const pages=new Map(await Promise.all(files.map(async f=>[f,await readFile(path.join(root,f),'utf8')])));
assert.equal(pages.size,44);
let links=0;
for(const [file,html] of pages){
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`Duplicate ID in ${file}`);
  for(const [,href]of html.matchAll(/href="([^"]+)"/g)){
    if(/^(https?:|mailto:|\.\.\/)/.test(href))continue;
    const [target,anchor]=href.split('#');
    if(target && !target.endsWith('.html'))continue;
    const destination=pages.get(target||file);
    assert.ok(destination,`Missing ${href} in ${file}`);
    if(anchor)assert.ok(destination.includes(`id="${anchor}"`),`Missing anchor ${href} in ${file}`);
    links++;
  }
}
console.log(`Validated ${files.length} HTML pages and ${links} internal links.`);
const executablePath=process.env.CHROME_PATH || (process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined);
const browser=await chromium.launch({executablePath,headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const url=file=>pathToFileURL(path.join(root,file)).href;
await mkdir(path.join(root,'screenshots'),{recursive:true});
await page.goto(url('index.html'));
await page.evaluate(()=>document.fonts.ready);
assert.ok(await page.evaluate(()=>document.fonts.check('19px "Source Sans 3"')),'Local reading font did not load');
assert.ok(await page.locator('#chapter-nav').evaluate(el=>el.inert));
await page.screenshot({path:path.join(root,'screenshots/desktop.png'),fullPage:true});
await page.locator('.menu-button').click();
assert.ok(await page.locator('.workspace').evaluate(el=>el.inert));
await page.locator('.sidebar a').last().focus();
await page.keyboard.press('Tab');
assert.ok(await page.locator('.sidebar a').first().evaluate(el=>el===document.activeElement),'Drawer focus escaped');
await page.locator('.close-menu').click();
assert.equal(await page.locator('.workspace').evaluate(el=>el.inert),false);
await page.screenshot({path:path.join(root,'screenshots/desktop.png'),fullPage:true});
await page.locator('#chapter-search').fill('garbage collection');
assert.ok(await page.locator('.chapter-row:visible').count()>0);
assert.ok(await page.locator('.chapter-row:visible').count()<14);
await page.locator('#chapter-search').fill('does-not-exist-xyz');
assert.ok(await page.locator('#no-results').isVisible());
await page.goto(url('ch01.html'));
await page.screenshot({path:path.join(root,'screenshots/chapter-desktop.png')});
await page.locator('#notes').fill('Remember reference reassignment.');
await page.reload();assert.equal(await page.locator('#notes').inputValue(),'Remember reference reassignment.');
await page.locator('#complete-chapter').click();assert.equal(await page.locator('#complete-chapter').getAttribute('aria-pressed'),'true');
await page.locator('#text-size').click();assert.ok(await page.evaluate(()=>getComputedStyle(document.querySelector('.prose')).fontSize==='21px'));
await page.locator('#text-size').click();await page.locator('#text-size').click();
await page.locator('#focus-mode').click();assert.ok(await page.locator('body').evaluate(el=>el.classList.contains('focus-reading')));await page.locator('#focus-mode').click();
await page.locator('.code-block').first().scrollIntoViewIfNeeded();
await page.screenshot({path:path.join(root,'screenshots/chapter-code.png')});
await page.locator('.copy-code').first().click();await page.waitForFunction(()=>document.querySelector('.copy-code span').textContent==='Copied');
await page.goto(url('ch01a.html'));
assert.ok(await page.locator('.answer-item').count()>0);assert.equal(await page.locator('.answer-item[open]').count(),0);
await page.locator('.answer-item summary').first().click();assert.equal(await page.locator('.answer-item[open]').count(),1);
await page.screenshot({path:path.join(root,'screenshots/answers-desktop.png')});
for(const width of [1440,1280,1024,768,390,360]){
  await page.setViewportSize({width,height:900});
  for(const file of ['index.html','ch01.html','ch06.html','ch10.html','ch14a.html']){
    await page.goto(url(file));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${file} at ${width}px`);
  }
}
await page.setViewportSize({width:390,height:844});await page.goto(url('index.html'));await page.screenshot({path:path.join(root,'screenshots/mobile.png'),fullPage:true});
assert.ok(await page.locator('#chapter-nav').evaluate(el=>el.inert));
await page.locator('.menu-button').click();assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'),'true');assert.equal(await page.locator('#chapter-nav').evaluate(el=>el.inert),false);await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'),'false');assert.ok(await page.locator('#chapter-nav').evaluate(el=>el.inert));
await page.goto(url('ch01.html'));await page.screenshot({path:path.join(root,'screenshots/chapter-mobile.png')});
assert.equal(await page.locator('.contents details').getAttribute('open'),null);
await page.locator('.contents summary').click();assert.ok(await page.locator('.contents nav').isVisible());
for(const file of files){await page.goto(url(file));assert.equal(await page.locator('h1').count(),1);}
assert.deepEqual(errors,[]);
await browser.close();
console.log('Browser checks passed: offline reading, search, persistence, completion, copy, focus, answer reveal, navigation, and six responsive widths.');
