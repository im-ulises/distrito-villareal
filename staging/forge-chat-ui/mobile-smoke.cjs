/* Self-contained visual staging smoke test.
   Runs against a local static fixture only: never calls production Forge API. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');

(async () => {
 const candidates = ['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'];
 const executablePath = process.env.CHROME_BIN || candidates.find(x => fs.existsSync(x));
 if (!executablePath) throw new Error('Chrome browser missing from GitHub Actions runner');
 const browser = await chromium.launch({ executablePath, headless: true, args:['--no-sandbox'] });
 const dir = path.join(__dirname,'screenshots');
 fs.mkdirSync(dir,{recursive:true});
 const target = 'file://' + path.join(__dirname,'index.html');
 let failures = 0;
 try {
  for (const w of [320,375,390,430,768,1280]) {
   const ctx = await browser.newContext({viewport:{width:w,height:w>=768?900:844},deviceScaleFactor:w<768?2:1,isMobile:w<768,hasTouch:w<768});
   const page = await ctx.newPage();
   await page.goto(target,{waitUntil:'load'});
   const layout = await page.evaluate(() => {
    const ids = ['app','heading','thread','inner','compose','input','send'];
    const rects = {};
    for (const id of ids) {
     const el=document.getElementById(id);
     if (!el) throw new Error('Element missing: '+id);
     const r=el.getBoundingClientRect();
     rects[id]={left:r.left,right:r.right,width:r.width};
    }
    return {vw:document.documentElement.clientWidth,doc:document.documentElement.scrollWidth,rects};
   });
   const margin=2;
   if (layout.doc>layout.vw+margin) throw new Error(w+': document horizontally overflows by '+(layout.doc-layout.vw)+'px');
   for (const id of ['app','heading','thread','compose','send']) {
    const rect=layout.rects[id];
    if (rect.left < -margin || rect.right > layout.vw+margin)
     throw new Error(w+': '+id+' outside viewport: '+JSON.stringify(rect)+' vs '+layout.vw);
   }
   if (w<768) {
    const stop=await page.locator('#stop').evaluate(el => {const a=el.getBoundingClientRect(),b=el.querySelector('.stop-glyph').getBoundingClientRect();return Math.abs((a.left+a.width/2)-(b.left+b.width/2))});
    if (stop>2) throw new Error(w+': Stop glyph misaligned '+stop);
    await page.getByRole('button',{name:'Abrir equipo y actividad'}).click();
    if (!(await page.locator('#right').evaluate(el=>el.classList.contains('open')))) throw new Error(w+': team panel did not open');
    await page.getByRole('button',{name:'Cerrar panel'}).click();
   }
   await page.locator('#input').fill('Una misión de prueba visual');
   await page.locator('#compose button[type=submit]').click();
   const owners=await page.locator('.msg.owner').count();
   if (owners!==2) throw new Error(w+': demo message was not appended ('+owners+')');
   await page.screenshot({path:path.join(dir,'viewport-'+w+'.png'),fullPage:false});
   console.log('PASS '+w+'px: no horizontal overflow, centered controls, message entry');
   await ctx.close();
  }
 } finally {
  await browser.close();
 }
})().catch(e=>{console.error('STAGING UI CHECK FAILED:',e);process.exit(1)});
