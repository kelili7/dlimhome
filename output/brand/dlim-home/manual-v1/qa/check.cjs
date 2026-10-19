const { chromium } = require(process.cwd() + '/frontend/node_modules/@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const context = await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
  const page = await context.newPage();
  const errors=[]; page.on('pageerror', e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:8766/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.chapter').count(),21);
  assert.equal(await page.locator('.rule').count(),203);
  const localLinks = await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(h=>!h.startsWith('https:')));
  const missing=[];
  for(const href of new Set(localLinks)) {
    if(href.startsWith('#')) { if(!await page.locator('[id="'+href.slice(1)+'"]').count()) missing.push(href); }
    else if(!(await page.request.get('http://127.0.0.1:8766/'+href)).ok()) missing.push(href);
  }
  assert.deepEqual(missing,[],'Broken local links');
  await page.evaluate(()=>document.querySelectorAll('img[src]').forEach(i=>i.loading='eager'));
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('img[src]')).every(i=>i.complete && i.naturalWidth>0));
  await page.evaluate(()=>Promise.all(Array.from(document.querySelectorAll('img[src]')).map(i=>i.decode())));
  await page.emulateMedia({reducedMotion:'reduce'});
  const ratios = await page.locator('.photo .image-open img, .board img').evaluateAll(es=>es.map(i=>({src:i.getAttribute('src'),error:Math.abs(i.clientWidth/i.clientHeight-i.naturalWidth/i.naturalHeight),fit:getComputedStyle(i).objectFit})).filter(v=>v.error>.02 && v.fit!=='contain'));
  assert.deepEqual(ratios,[],'Image distortion');
  await page.screenshot({path:path.join(__dirname,'desktop-cover.png')});
  await page.locator('#chapter-02').screenshot({path:path.join(__dirname,'desktop-logo.png')});
  await page.locator('#chapter-04').screenshot({path:path.join(__dirname,'desktop-colors.png')});
  const firstCopy=page.locator('[data-copy]').first(); await firstCopy.click();
  await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('已复制'));
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'#342F2B');
  const imageButton=page.locator('[data-image]').first(); await imageButton.click();
  assert.equal(await page.locator('#image-dialog').evaluate(d=>d.open),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#image-dialog').evaluate(d=>d.open),false);
  assert.equal(await imageButton.evaluate(b=>document.activeElement===b),true);
  await page.locator('#sample-email').fill('invalid'); await page.locator('#sample-form button').click();
  assert.equal(await page.locator('#sample-email').getAttribute('aria-invalid'),'true');
  await page.locator('#sample-email').fill('test@example.com'); await page.locator('#sample-form button').click();
  assert.equal(await page.locator('#sample-email').getAttribute('aria-invalid'),'false');
  const widths=[];
  for(const width of [1440,1024,768,390,375]) {
    await page.setViewportSize({width,height:900});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    widths.push({width,overflow}); assert.equal(overflow,false,'Overflow at '+width);
  }
  await page.setViewportSize({width:390,height:844}); await page.goto('http://127.0.0.1:8766/',{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(__dirname,'mobile-cover.png')});
  await page.locator('#menu-toggle').click(); assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
  await page.locator('nav a[href="#chapter-15"]').click();
  assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
  await page.waitForTimeout(800);
  assert.equal(await page.locator('nav a[aria-current="location"]').getAttribute('href'),'#chapter-15');
  await page.screenshot({path:path.join(__dirname,'mobile-packaging.png')});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
  await page.locator('#replay').click();
  assert.equal(await page.locator('#motion-mark').evaluate(e=>getComputedStyle(e).animationName),'none');
  assert.deepEqual(errors,[]);
  const filePage=await context.newPage(); await filePage.goto('file://'+path.resolve(__dirname,'../index.html'));
  assert.equal(await filePage.locator('.rule').count(),203);
  const fileCopy=filePage.locator('[data-copy]').first(); await fileCopy.click();
  await filePage.waitForFunction(()=>document.querySelector('#toast').textContent.includes('已复制'));
  fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify({result:'PASS',chapters:21,subsections:203,localLinks:'all valid',images:'loaded with preserved aspect ratios',clipboard:'HTTP and file URL passed',dialog:'Escape and focus restoration passed',form:'invalid and valid cases passed',responsive:widths,reducedMotion:'passed',runtimeErrors:errors},null,2));
  await browser.close(); console.log('PASS: 21 chapters, 203 subsections, links, images, copy, dialog, form, responsive layouts, reduced motion and offline file.');
})().catch(e=>{console.error(e);process.exit(1)});
