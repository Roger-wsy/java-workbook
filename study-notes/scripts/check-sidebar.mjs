import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
const executablePath=process.env.CHROME_PATH || (process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined);
const browser=await chromium.launch({executablePath,headless:true});
try {
  for(const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:900}});
    await page.goto(pathToFileURL(fileURLToPath(new URL('../ch01.html',import.meta.url))).href);
    await page.evaluate(()=>document.fonts.ready);
    const position=()=>page.evaluate(()=>({
      scroll:scrollY,
      width:document.documentElement.clientWidth,
      heading:document.querySelector('#declaring-methods').getBoundingClientRect().top
    }));
    // Use pointer coordinates so the test itself does not scroll sticky controls into view.
    const clickVisible=async selector=>{
      const box=await page.locator(selector).boundingBox();
      await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
    };
    for(const depth of [1800,12000]) {
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),depth);
      const before=await position();
      for(const close of ['button','escape','scrim']) {
        await clickVisible('.menu-button');
        await page.locator('#chapter-nav').evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished)));
        assert.deepEqual(await position(),before,`Opening moved the article at ${width}px (${close})`);
        await page.locator('.sidebar a').last().evaluate(el=>el.focus({preventScroll:true}));
        await page.keyboard.press('Tab');
        assert.ok(await page.locator('.sidebar a').first().evaluate(el=>el===document.activeElement));
        if(close==='button')await clickVisible('.close-menu');
        if(close==='escape')await page.keyboard.press('Escape');
        if(close==='scrim'){
          const box=await page.locator('.nav-scrim').boundingBox();
          await page.mouse.click(box.x+box.width-8,450);
        }
        // Allow any unwanted browser focus-scroll animation to complete.
        await page.waitForTimeout(400);
        assert.deepEqual(await position(),before,`Closing moved the article at ${width}px (${close})`);
        assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'),'false',`${close} did not close the drawer at ${width}px`);
        assert.ok(await page.locator('.menu-button').evaluate(el=>el===document.activeElement));
      }
    }
    await page.close();
  }
  console.log('Sidebar preserves scroll position, article layout, and keyboard focus at desktop and mobile widths for all closing methods.');
} finally {await browser.close();}
