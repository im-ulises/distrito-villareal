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
 const dir = path.join(process.cwd(),'staging-screenshots');
 fs.mkdirSync(dir,{recursive:true});
 const target = process.env.STAGING_TEST_URL || 'http://127.0.0.1:8787/';
 let failures = 0;
 try {
  for (const w of [320,375,390,430,768,1280]) {
   const ctx = await browser.newContext({viewport:{width:w,height:w>=768?900:844},deviceScaleFactor:w<768?2:1,isMobile:w<768,hasTouch:w<768});
   const page = await ctx.newPage();
   await page.goto(target,{waitUntil:'load'});
   const stopTag = await page.locator('#stop').evaluate(el => el.tagName);
   if (stopTag !== 'BUTTON') throw new Error(w+': expected native Stop button, got '+stopTag);
   if (await page.locator('glass-button').count() !== 0) throw new Error('Unexpected glass custom controls');
   const layout = await page.evaluate(() => {
    const ids = ['app','heading','thread','inner','compose','input','send'];
    const rects = {};
    for (const id of ids) {
     const el=id==='send'?document.querySelector('.send'):document.getElementById(id);
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
    const zoomConfig = await page.evaluate(() => ({
      meta:document.querySelector('meta[name=viewport]')?.content||'',
      textareaFont:parseFloat(getComputedStyle(document.querySelector('#input')).fontSize),
      scale:window.visualViewport?.scale??1
    }));
    if (!/user-scalable=no/.test(zoomConfig.meta) || !/maximum-scale=1/.test(zoomConfig.meta))
      throw new Error(w+': viewport still allows Safari pinch zoom '+zoomConfig.meta);
    if (zoomConfig.textareaFont<16) throw new Error(w+': textarea can autozoom on focus');
    if (Math.abs(zoomConfig.scale-1)>0.02) throw new Error(w+': unexpected initial zoom '+zoomConfig.scale);
    const stop=await page.locator('#stop').evaluate(el => {const a=el.getBoundingClientRect(),b=el.querySelector('.stop-glyph').getBoundingClientRect();return Math.abs((a.left+a.width/2)-(b.left+b.width/2))});
    if (stop>2) throw new Error(w+': Stop glyph misaligned '+stop);
    await page.getByRole('button',{name:'Abrir equipo y actividad'}).click();
    const panel=page.locator('#right');
    if (!(await panel.evaluate(el=>el.classList.contains('open')))) throw new Error(w+': team panel did not open');
    async function assertPanel(stage) {
      const m=await panel.evaluate(el=>{
        const a=el.getBoundingClientRect(), h=el.querySelector('.right-head').getBoundingClientRect(),
        body=el.querySelector('#team-body'),b=body.getBoundingClientRect(),
        app=document.getElementById('app').getBoundingClientRect(),cs=getComputedStyle(el);
        return {top:a.top,bottom:a.bottom,left:a.left,right:a.right,
          headTop:h.top,headBottom:h.bottom,bodyTop:b.top,bodyBottom:b.bottom,
          sheetScroll:el.scrollTop,bodyScroll:body.scrollTop,bodyOverflow:body.scrollHeight>body.clientHeight+2,
          bottomRadius:parseFloat(cs.borderBottomLeftRadius),topRadius:parseFloat(cs.borderTopLeftRadius),
          appTop:app.top,appBottom:app.bottom,viewportH:app.height};
      });
      if(m.top < m.appTop+4 || m.bottom > m.appBottom-8 || m.headTop<m.top-3 || m.headBottom>m.bodyTop+2)
        throw new Error(w+': floating sheet clipped at '+stage+' '+JSON.stringify(m));
      if(m.left < 8 || m.right > w-8 || m.topRadius<20 || m.bottomRadius<20)
        throw new Error(w+': sheet has no floating gutters/rounded bottom '+stage+' '+JSON.stringify(m));
      if(m.bodyBottom>m.bottom+2 || m.sheetScroll>2)
        throw new Error(w+': scrolling escaped inner body '+stage+' '+JSON.stringify(m));
      return m;
    }
    let metrics=await assertPanel('open');
    if(metrics.bodyScroll>2)throw new Error(w+': panel opened mid-scroll '+metrics.bodyScroll);
    await page.screenshot({path:path.join(dir,'team-sheet-'+w+'.png'),fullPage:false});
    await panel.locator('#team-body').evaluate(el=>{el.scrollTop=el.scrollHeight});
    metrics=await assertPanel('scrolled');
    if(metrics.bodyOverflow && metrics.bodyScroll<10)throw new Error(w+': content did not scroll internally');
    // Reopen at the top: users must see Claude and heading, not the bottom of Activity.
    await page.getByRole('button',{name:'Cerrar panel'}).click();
    await page.getByRole('button',{name:'Abrir equipo y actividad'}).click();
    metrics=await assertPanel('reopen');
    if(metrics.bodyScroll>2)throw new Error(w+': team body retained old scroll '+metrics.bodyScroll);
    // Model keyboard/address-bar resizing: sheet stays within available visual viewport.
    await page.evaluate(()=>document.documentElement.style.setProperty('--vvh','510px'));
    metrics=await assertPanel('compact viewport');
    if(metrics.viewportH>511)throw new Error(w+': virtual viewport was not respected');
    await page.evaluate(()=>{document.documentElement.style.removeProperty('--vvh')});
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
