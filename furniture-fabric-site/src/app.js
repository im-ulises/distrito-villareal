import {DEFAULTS,FINISHES,HARDWARE,createDesign,layoutSheets,csvOf,hardwareCsv,calculateQuote,quoteCsv} from './engine.js';
import {FurnitureViewport} from './viewport.js';
import {activeProject,persistActiveProject} from './project-store.js';
const $=s=>document.querySelector(s);
const fmt=n=>new Intl.NumberFormat('es-MX',{maximumFractionDigits:1}).format(n);
const money=n=>new Intl.NumberFormat('es-MX',{style:'decimal',maximumFractionDigits:2}).format(n);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
activeProject('drawer');
const stored=(()=>{try{return JSON.parse(localStorage.getItem('furniture-fabric-v1')||'{}')}catch{return {}}})();
// Migrate the old untouched 16 mm / 2440 × 1220 defaults to the local supplier's 15 mm / 2400 × 1200 sheet.
if(stored.thickness===16 && stored.boardWidth===2440 && stored.boardHeight===1220){stored.thickness=15;stored.boardWidth=2400;stored.boardHeight=1200;}
let p={...DEFAULTS,...stored},page='design',view=null,saveTimer=null;
const icons={
 logo:'<path d="M7 3h13v4H11v4h7v4h-7v6H7z"/>',
 cube:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 9 9 5 9-5M12 14v7"/>',
 layers:'<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
 package:'<path d="m12 2 9 5v10l-9 5-9-5V7l9-5ZM3 7l9 5 9-5M12 12v10"/>',
 ruler:'<path d="M4 4h16v16H4zM8 4v5M12 4v3M16 4v5M4 12h5M4 16h3"/>',
 settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M12 2v3m0 14v3M4.9 4.9 7 7m10 10 2.1 2.1M2 12h3m14 0h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 arrow:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 file:'<path d="M6 2h8l5 5v15H6zM14 2v6h5M9 13h7M9 17h7"/>',
 check:'<path d="m5 12 5 5L20 7"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10v.5"/>',
 rotate:'<path d="M4 11a8 8 0 1 1 2 6M4 4v7h7"/>',
 eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
 save:'<path d="M4 3h14l3 3v15H4zM8 3v6h9V3M8 21v-8h9v8"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 chevron:'<path d="m9 18 6-6-6-6"/>',
 alert:'<path d="M12 3 2 21h20L12 3ZM12 10v5m0 3v.5"/>',
 grip:'<circle cx="8" cy="6" r="1"/><circle cx="16" cy="6" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/>',
 upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>'
};
const icon=(name,size=18)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.cube}</svg>`;
const svgBadge=(val,unit)=>`<span class="metric-value">${fmt(val)}</span><span class="metric-unit">${unit}</span>`;
function persist(){localStorage.setItem('furniture-fabric-v1',JSON.stringify(p));persistActiveProject('drawer',p);const s=$('#save-label');if(s)s.textContent='Guardado localmente';}
function design(){return createDesign(p)}
function quote(d=design()){return calculateQuote(p,d)}
function pesos(n){return '$'+new Intl.NumberFormat('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}
function navLink(key,ico,title,sub=''){return `<button class="nav-link ${page===key?'active':''}" data-page="${key}">${icon(ico,18)}<span>${title}</span>${sub?`<small>${sub}</small>`:''}</button>`}
function shell(){
 const d=design();
 $('#app').innerHTML=`<div class="app-shell">
  <aside class="sidebar" id="sidebar">
    <div class="brand"><span class="brand-symbol">${icon('logo',24)}</span><span class="brand-type"><b>FURNITURE</b><em>FABRIC<span class="brand-dot">.</span></em></span></div>
    <div class="sidebar-caption">ESPACIO DE TRABAJO</div>
    <a href="./projects.html" class="project-switch" style="text-decoration:none;color:inherit"><span class="project-ico">${icon('cube',19)}</span><span><strong>Mi taller</strong><small>Proyectos personales</small></span>${icon('chevron',15)}</a>
    <div class="sidebar-caption nav-cap">MIS PROYECTOS</div><a href="./projects.html" class="nav-link ff-projects-entry" style="text-decoration:none;display:flex;align-items:center;gap:11px">${icon('layers',18)} <span>Biblioteca de proyectos</span> ${icon('chevron',14)}</a><div class="sidebar-caption nav-cap" style="margin-top:22px">HERRAMIENTAS</div>
    <nav>${navLink('design','cube','Diseñador 3D')}${navLink('cuts','layers','Lista de cortes')}${navLink('hardware','package','Herrajes')}${navLink('quote','file','Cotizador')}${navLink('plans','ruler','Planos técnicos')}</nav>
    <div class="sidebar-bottom"><div class="version-tag"><span class="status-dot"></span> MVP / VERSIÓN 0.3</div><div class="sidebar-help">Diseño paramétrico para melamina.<br/>Hecho para crear, ajustar y fabricar.</div><div class="sidebar-foot">FURNITURE FABRIC <span>© 2026</span></div></div>
  </aside>
  <div class="work-area">
   <header class="topbar"><button class="mobile-menu" id="mobile-menu" aria-label="Abrir menú">${icon('menu')}</button><div class="breadcrumb">WORKSPACE <span>/</span> MIS DISEÑOS <span>/</span> <b>${esc(p.name)}</b></div><div class="top-actions"><span class="saved-indicator">${icon('check',13)} <span id="save-label">Guardado localmente</span></span><button class="btn btn-light" id="save-btn">${icon('save',16)} Guardar</button><button class="btn btn-black" id="export-btn">${icon('download',16)} Exportar <span class="btn-chevron">⌄</span></button><div class="export-dropdown" id="export-menu" hidden><button data-export="csv">${icon('layers',16)} Cortes CSV</button><button data-export="hardware">${icon('package',16)} Herrajes CSV</button><button data-export="quote">${icon('file',16)} Cotización CSV</button><button data-export="json">${icon('file',16)} Proyecto JSON</button><button data-export="print">${icon('ruler',16)} Planos PDF / Imprimir</button></div></div></header>
   <main id="main-content"></main>
  </div>
 </div><input type="file" accept=".json,application/json" id="import-file" hidden/><div id="toast" class="toast" role="status" aria-live="polite"></div>`;
 $('#mobile-menu').onclick=()=>$('#sidebar').classList.toggle('sidebar-open');
 document.querySelectorAll('[data-page]').forEach(x=>x.addEventListener('click',()=>{page=x.dataset.page;$('#sidebar').classList.remove('sidebar-open');shell()}));
 $('#save-btn').onclick=()=>{persist();toast('Proyecto guardado en este navegador')};
 $('#export-btn').onclick=()=>{$('#export-menu').hidden=!$('#export-menu').hidden};
 document.querySelectorAll('[data-export]').forEach(x=>x.onclick=()=>{exportAs(x.dataset.export);$('#export-menu').hidden=true});
 $('#import-file').onchange=async(e)=>{let f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());const next={...DEFAULTS,...data};if(!createDesign(next).issues.length){p=next;persist();shell();toast('Proyecto importado')}else toast('El archivo contiene medidas inválidas')}catch{toast('No se pudo abrir el archivo JSON')}};
 renderMain();
}
function inputField(label,key,step=1,min=1,max=9999){return `<label class="form-field"><span>${label}</span><div class="field-box"><input type="number" data-param="${key}" value="${p[key]}" min="${min}" max="${max}" step="${step}"/><small>mm</small></div></label>`}
function selector(label,key,options){return `<label class="form-field"><span>${label}</span><select data-param="${key}">${options.map(([v,name])=>`<option value="${v}" ${String(p[key])===String(v)?'selected':''}>${esc(name)}</option>`).join('')}</select></label>`}
function inspector(d){return `<aside class="inspector">
 <div class="inspector-header"><div><span class="eyebrow">PROPIEDADES DEL MODELO</span><h2>Configuración</h2></div><span class="panel-kebab">${icon('settings',19)}</span></div>
 <div class="inspector-scroll">
  <div class="section-label"><span>01</span> ESTRUCTURA <span class="line"></span></div>
  <label class="form-field full"><span>Nombre del proyecto</span><input type="text" maxlength="60" data-param="name" value="${esc(p.name)}"/></label>
  <div class="form-grid">${inputField('Ancho','width',1,300,2400)}${inputField('Alto','height',1,250,2600)}${inputField('Profundidad','depth',1,200,1200)}${selector('Espesor','thickness',[[15,'15 mm'],[16,'16 mm'],[18,'18 mm'],[19,'19 mm']])}</div>
  <div class="section-label"><span>02</span> CAJONES <span class="line"></span></div>
  <div class="form-grid">${selector('Cantidad','drawers',Array.from({length:10},(_,i)=>[i+1,`${i+1} cajón${i?'es':''}`]))}${inputField('Junta entre frentes','gap',1,2,8)}${selector('Longitud de corredera','slideLength',[[250,'250 mm'],[300,'300 mm'],[350,'350 mm'],[400,'400 mm'],[450,'450 mm'],[500,'500 mm'],[550,'550 mm'],[600,'600 mm']])}${selector('Jaladeras','handles',[['bar','Barra negra'],['none','Sin jaladera*']])}</div>
  <div class="section-label"><span>03</span> MATERIALES <span class="line"></span></div>
  <span class="form-label">Acabado melamina</span><div class="swatch-grid">${Object.entries(FINISHES).map(([key,v])=>`<button class="swatch ${p.finish===key?'selected':''}" data-finish="${key}" title="${v.label}"><span style="background:${v.hex}"></span><small>${v.label}</small></button>`).join('')}</div>
  <div class="section-label"><span>04</span> HERRAJES <span class="line"></span></div>
  <div class="hardware-select">${Object.entries(HARDWARE).map(([key,h])=>`<button data-hardware="${key}" class="hardware-choice ${p.hardware===key?'selected':''}"><span class="radio-dot"></span><span><strong>${h.name}</strong><small>${h.brand}</small></span>${key==='premium'?'<i>PRO</i>':''}</button>`).join('')}</div>
  <div class="info-note">${icon('info',15)} <span>Las correderas premium requieren SKU y mecanizado específico. Las medidas se validan con la ficha técnica antes de fabricar.</span></div>
 </div><div class="inspector-footer"><button class="btn btn-black block" id="create-pdf">${icon('file',16)} Generar planos para cotizar</button></div>
 </aside>`;}
function renderMain(){let d=design();if(page==='design')return renderDesign(d);if(page==='cuts')return renderCuts(d);if(page==='hardware')return renderHardware(d);if(page==='quote')return renderQuote(d);if(page==='plans')return renderPlans(d);}
function pageHeading(eyebrow,title,description){return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div><button class="btn btn-light" id="import-btn">${icon('upload',16)} Importar proyecto</button></div>`}
function renderDesign(d){
 $('#main-content').innerHTML=`<div class="designer-layout"><section class="designer-main">
  <div class="content-header"><div><span class="eyebrow">EDITOR / MUEBLE 001</span><h1>Diseña sin límites<span class="accent-dot">.</span></h1><p>De la idea al corte exacto, en un mismo espacio.</p></div><div class="content-tags"><span class="chip dark-chip">● En edición</span><span class="chip">MM / MÉTRICO</span></div></div>
  <div class="stage"><div class="stage-top"><div class="stage-label"><span class="live-dot"></span> VISTA PERSPECTIVA <span class="separator">/</span> <b>MODELO 3D</b></div><div class="stage-tools"><button aria-label="Restablecer cámara" id="reset-view" title="Restablecer cámara">${icon('rotate',17)}</button><button id="explode-view" title="Vista de despiece">${icon('layers',17)}</button></div></div>
   <canvas id="model-canvas" role="img" aria-label="Modelo 3D interactivo de cajonera de melamina. Arrastra para rotar y usa la rueda para zoom."></canvas>
   <div class="stage-bottom"><div class="stage-hint">${icon('rotate',14)} Arrastra para rotar <span>·</span> Desliza para zoom</div><div class="drawers-tool"><label for="drawer-target" class="sr-only">Seleccionar cajón</label><select id="drawer-target" aria-label="Seleccionar cajón"><option value="all" ${p.activeDrawer==='all'?'selected':''}>Todos</option>${Array.from({length:p.drawers},(_,i)=>`<option value="${i}" ${String(p.activeDrawer)===String(i)?'selected':''}>Cajón ${i+1}</option>`).join('')}</select><span>Abrir</span><input id="open-drawers" type="range" min="0" max="100" value="${p.drawerOpen*100}"/><b id="drawer-percent">${Math.round(p.drawerOpen*100)}%</b></div></div>
  </div>
  <div class="metric-row"><div class="metric"><span>ANCHO TOTAL</span>${svgBadge(p.width,'mm')}</div><div class="metric"><span>ALTURA TOTAL</span>${svgBadge(p.height,'mm')}</div><div class="metric"><span>PROFUNDIDAD</span>${svgBadge(p.depth,'mm')}</div><div class="metric"><span>PIEZAS CALCULADAS</span>${svgBadge(d.stats?.pieces||'—','pzas')}</div></div>
  <div class="quote-mini"><div><span>ESTIMADO DE MELAMINA · ${p.thickness} MM${p.thickness===15?'':' (PRECIO REF. 15 MM)'}</span><strong>${pesos(quote(d).totals?.boardCost||0)} MXN</strong><small>${quote(d).totals?.boardCount||0} tablero(s) × ${pesos(p.sheetPrice)} · no incluye herrajes</small></div><button class="btn btn-black" data-page="quote">${icon('file',15)} Cotizar mueble</button></div>
  <div class="under-stage"><div class="quick-info"><span class="mini-icon">${icon('info',17)}</span><span><strong>Precisión de fabricación</strong><small>Diseño preliminar. Verifica correderas y mecanizados antes de mandar a cortar.</small></span></div><button class="text-link" data-page="cuts">Ver lista de piezas ${icon('arrow',16)}</button></div>
 </section>${inspector(d)}</div>`;
 view=new FurnitureViewport($('#model-canvas'));view.setDesign(d);view.setOpen(+p.drawerOpen);view.setExploded(!!p.exploded);
 $('#reset-view').onclick=()=>view.reset();$('#explode-view').onclick=()=>{p.exploded=!p.exploded;view.setExploded(p.exploded);$('#explode-view').classList.toggle('tool-active',p.exploded);persist()};$('#explode-view').classList.toggle('tool-active',p.exploded);
 $('#drawer-target').onchange=e=>{p.activeDrawer=e.target.value;view.setDesign(design());persist()};
  $('#open-drawers').oninput=e=>{p.drawerOpen=+e.target.value/100;$('#drawer-percent').textContent=e.target.value+'%';view.setOpen(p.drawerOpen);persist()};
 bindParams();$('#create-pdf').onclick=printPlan;
 document.querySelectorAll('[data-finish]').forEach(el=>el.onclick=()=>{p.finish=el.dataset.finish;persist();renderMain()});
 document.querySelectorAll('[data-hardware]').forEach(el=>el.onclick=()=>{p.hardware=el.dataset.hardware;persist();renderMain()});
 bindPageButtons();
}
function bindParams(){document.querySelectorAll('[data-param]').forEach(el=>{
 el.addEventListener('change',()=>{const k=el.dataset.param;const isnum=typeof DEFAULTS[k]==='number';const next={...p,[k]:isnum?+el.value:el.value};const issues=createDesign(next).issues;if(issues.length){toast(issues[0]);el.classList.add('invalid');return;}p=next;persist();renderMain();});
 el.addEventListener('input',()=>el.classList.remove('invalid'));
});}
function bindPageButtons(){document.querySelectorAll('#main-content [data-page]').forEach(b=>b.addEventListener('click',()=>{page=b.dataset.page;shell()}));$('#import-btn')?.addEventListener('click',()=>$('#import-file').click());}
function pieceTable(d){return `<div class="table-scroll"><table><thead><tr><th>PIEZA / REFERENCIA</th><th>UNIDADES</th><th>LARGO</th><th>ANCHO</th><th>MATERIAL</th><th>CANTOS</th></tr></thead><tbody>${d.parts.map((x,i)=>`<tr><td><div class="part-name"><span class="part-code">${x.id}</span><span><b>${x.name}</b><small>${x.group}</small></span></div></td><td>${x.quantity}</td><td>${fmt(x.x)} mm</td><td>${fmt(x.y)} mm</td><td><span class="material-tag">${x.material.toUpperCase()}</span></td><td>${x.edge||'—'}</td></tr>`).join('')}</tbody></table></div>`;}
function tabBanner(title,detail,secondary='',button=''){return `<div class="page-intro"><div><div class="eyebrow">FABRICACIÓN / ${secondary}</div><h2>${title}</h2><p>${detail}</p></div>${button}</div>`;}
function renderCuts(d){const nest=layoutSheets(d.parts,p.boardWidth,p.boardHeight,p.kerf);
 $('#main-content').innerHTML=`${pageHeading('PRODUCCIÓN / DESPIECE','Lista de cortes','Todas las piezas se recalculan automáticamente al cambiar la geometría.')}
 <div class="page-body">${tabBanner('Despiece inteligente','Dimensiones expresadas en milímetros. Corrobora sentido de veta y cantos antes de entregar la orden.','LISTA 01',`<button class="btn btn-black" data-export="csv">${icon('download',16)} Descargar CSV</button>`)}
 <div class="summary-strip"><div><span>PIEZAS TOTALES</span><strong>${d.stats.pieces}</strong></div><div><span>MELAMINA ESTIMADA</span><strong>${fmt(d.stats.area)} <small>m²</small></strong></div><div><span>TABLEROS ESTIMADOS</span><strong>${nest.sheets.length} <small>pzas</small></strong></div><div><span>APROVECHAMIENTO SIMPLE</span><strong>${nest.utilization}<small>%</small></strong></div></div>
 <section class="white-panel"><div class="panel-head"><h3>Inventario de piezas</h3><span>${d.parts.length} referencias</span></div>${pieceTable(d)}</section>
 <section class="white-panel"><div class="panel-head"><div><h3>Distribución preliminar en tableros</h3><p>Empaquetado simple sin rotación de veta. No reemplaza el nesting de la fábrica.</p></div><div class="board-fields"><label>Ancho <input type="number" id="board-width" value="${p.boardWidth}" min="1000" max="4000"/></label><label>Alto <input type="number" id="board-height" value="${p.boardHeight}" min="1000" max="3000"/></label></div></div><div class="sheet-grid">${nest.sheets.map((s,i)=>boardSVG(s,i)).join('')||'<div class="empty">Sin piezas</div>'}</div>${nest.unplaced.length?`<p class="error-text">${nest.unplaced.length} piezas no caben en el tamaño de tablero configurado.</p>`:''}</section>
 <div class="warning-band">${icon('alert',19)} Los cortes son preliminares: deben confirmarse herrajes, juntas, fijaciones, sentido de veta y capacidad de la fábrica.</div></div>`;
 $('#board-width').onchange=e=>{p.boardWidth=+e.target.value;persist();renderCuts(design())};$('#board-height').onchange=e=>{p.boardHeight=+e.target.value;persist();renderCuts(design())};bindExport();bindPageButtons();}
function boardSVG(s,i){const W=p.boardWidth,H=p.boardHeight;const boxes=s.parts.map((x,idx)=>`<rect x="${x.x}" y="${x.y}" width="${x.w}" height="${x.h}" fill="${idx%2?'#d1b38f':'#e2cfb3'}" stroke="#faf9f6" stroke-width="4"/><text x="${x.x+x.w/2}" y="${x.y+x.h/2}" text-anchor="middle" dominant-baseline="middle" font-size="30" font-weight="700" fill="#4a4235">${x.id}</text>`).join('');return `<div class="sheet-card"><div class="sheet-title"><b>TABLERO ${String(i+1).padStart(2,'0')}</b><span>${W} × ${H} mm</span></div><svg viewBox="-15 -15 ${W+30} ${H+30}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Distribución preliminar de piezas del tablero ${i+1}"><rect width="${W}" height="${H}" fill="#eee8df"/>${boxes}</svg><small>${s.parts.length} piezas · ${fmt(s.usedArea/1e6)} m² utilizados</small></div>`;}
function renderHardware(d){$('#main-content').innerHTML=`${pageHeading('PRODUCCIÓN / COMPONENTES','Herrajes y accesorios','Elige el nivel de herrajes. Precios y compatibilidades definitivas requieren un SKU.')}
 <div class="page-body">${tabBanner('Lista de compra','Piezas de ensamble calculadas a partir de los cajones y la estructura.','HERRAJES 02',`<button data-export="hardware" class="btn btn-black">${icon('download',16)} Exportar CSV</button>`)}
 <div class="hardware-hero"><div><div class="eyebrow">CONFIGURACIÓN ACTIVA</div><h3>${HARDWARE[p.hardware].name}</h3><p>${HARDWARE[p.hardware].brand} · ${HARDWARE[p.hardware].slide}</p></div><select id="hardware-tier">${Object.entries(HARDWARE).map(([k,h])=>`<option ${k===p.hardware?'selected':''} value="${k}">${h.name}</option>`).join('')}</select></div>
 <div class="hardware-list">${d.hardware.map((x,i)=>`<article class="hardware-card"><div class="hardware-index">${String(i+1).padStart(2,'0')}</div><div class="hardware-detail"><b>${esc(x.name)}</b><span>${esc(x.detail)}</span><small>${esc(x.status)}</small></div><div class="hardware-qty"><strong>${x.qty}</strong><span>${x.unit}</span></div></article>`).join('')}</div>
 <div class="warning-band">${icon('alert',19)} ${esc(HARDWARE[p.hardware].notes)} La cantidad de tornillos y metros de canto es estimada; confirmar especificaciones y método de unión.</div></div>`;
 $('#hardware-tier').onchange=e=>{p.hardware=e.target.value;persist();renderHardware(design())};bindExport();bindPageButtons();}
const COST_FIELDS=[
 ['sheetPrice','Tablero melamina · 15 mm','MXN / tablero','900 MXN según tu proveedor'],
 ['hdfPriceM2','HDF / fondos y trasera','MXN / m²','Agregar precio del material'],
 ['slidePairPrice','Correderas','MXN / par','Blum, Häfele o DTC'],
 ['handlePrice','Jaladera','MXN / pieza','Precio por jaladera'],
 ['edgingPriceM','Canto PVC','MXN / m','Precio por metro'],
 ['cutPricePerPiece','Servicio de corte','MXN / pieza','Precio por pieza cortada'],
 ['laborPrice','Armado / instalación','MXN total','Mano de obra'],
 ['miscPrice','Tornillos / otros / envío','MXN total','Otros gastos'],
 ['profitPercent','Utilidad sobre costos','%','Recargo opcional'],
 ['taxPercent','IVA aplicado','%','Configurable según el caso']
];
function costInput([key,title,unit,hint]){return `<label class="cost-field"><span>${esc(key==='sheetPrice'?`Tablero melamina · ${p.thickness} mm`:title)}</span><div class="cost-input"><b>${unit.includes('%')?'%':'$'}</b><input data-cost="${key}" type="number" step="0.01" min="0" max="${key==='taxPercent'?'100':key==='profitPercent'?'1000':'999999999'}" value="${p[key]}" aria-label="${esc(title)}" /><small>${unit}</small></div><em>${esc(hint)}</em></label>`}
function quoteBreakdown(q){return `<div class="quote-grand"><span>${q.complete?'TOTAL COTIZADO':'TOTAL PARCIAL · FALTAN PRECIOS'}</span><strong>${pesos(q.totals.grandTotal)} <small>MXN</small></strong><p>${q.complete?'Precios ingresados para todos los conceptos. Revisa el material y la ingeniería antes de fabricar.':'No es un precio final: los conceptos sin precio se calculan provisionalmente como $0.'}</p></div>`}
function renderQuote(d){
 const q=quote(d);if(!q.totals)return;
 $('#main-content').innerHTML=`${pageHeading('COSTOS / PRESUPUESTO','Cotizador de muebles','Tus tableros de 1,200 × 2,400 mm cuestan $900 MXN cada uno (15 mm, doble cara enchapada).')}
 <div class="page-body">${tabBanner('Presupuesto paramétrico','Los tableros se cobran completos. Las piezas se estiman con el mismo acomodo de Lista de cortes.','COTIZACIÓN 04',`<div class="quote-actions"><button id="quote-csv" class="btn btn-light">${icon('download',16)} CSV</button><button id="quote-pdf" class="btn btn-black">${icon('file',16)} Imprimir / PDF</button></div>`)}
 <div class="quote-overview"><div class="quote-pill"><span>TABLEROS COMPLETOS</span><strong>${q.totals.boardCount}</strong><small>${p.boardWidth} × ${p.boardHeight} mm</small></div><div class="quote-pill"><span>SOLO MELAMINA</span><strong>${pesos(q.totals.boardCost)}</strong><small>${pesos(p.sheetPrice)} por tablero</small></div><div class="quote-pill"><span>APROVECHAMIENTO SIMPLE</span><strong>${fmt(q.nesting.utilization)}%</strong><small>Sin rotar veta ni validar cortes</small></div></div>
 <div class="quote-layout"><section class="white-panel"><div class="panel-head"><div><h3>Precios unitarios</h3><p>Modifica el costo de tu proveedor. Se guarda automáticamente en este dispositivo.</p></div><span>MXN</span></div><div class="cost-grid">${COST_FIELDS.map(costInput).join('')}</div></section>
 <section class="quote-result">${quoteBreakdown(q)}<div class="quote-result-body"><h3>Desglose de costos</h3><div class="quote-rows">${q.lines.map(x=>`<div class="quote-row"><span>${esc(x.label)}<small>${fmt(x.quantity)} ${esc(x.unit)} × ${pesos(x.unitPrice)}</small></span><b>${pesos(x.total)}</b></div>`).join('')}</div><div class="quote-row quote-sub"><span>Costo directo</span><b>${pesos(q.totals.cost)}</b></div><div class="quote-row quote-sub"><span>Utilidad (${fmt(q.totals.profitPercent)}%)</span><b>${pesos(q.totals.profit)}</b></div><div class="quote-row quote-sub"><span>IVA (${fmt(q.totals.taxPercent)}%)</span><b>${pesos(q.totals.tax)}</b></div></div></section></div>
 ${q.missing.length?`<div class="quote-pending"><b>${icon('alert',17)} Pendiente de cotizar o validar:</b><p>${q.missing.map(esc).join(' · ')}</p></div>`:''}
 <div class="warning-band">${icon('alert',19)} Precio preliminar sujeto a optimización real del proveedor, espesor correcto, materiales auxiliares y especificaciones de herrajes. El corte puede requerir tableros adicionales. El IVA queda en 0% hasta que indiques qué tasa corresponde a tu cotización.</div></div>`;
 document.querySelectorAll('[data-cost]').forEach(el=>el.onchange=()=>{const n=+el.value;if(!Number.isFinite(n)||n<0||n>1e9){toast('Ingresa un precio válido');return}p[el.dataset.cost]=n;persist();renderQuote(design())});
 $('#quote-csv').onclick=()=>exportAs('quote');$('#quote-pdf').onclick=printQuote;bindPageButtons();
}
function printQuote(){const d=design(),q=quote(d);if(d.issues.length)return toast('Corrige el proyecto para cotizar');const w=window.open('','_blank');if(!w)return toast('Permite ventanas emergentes para imprimir');
 const rows=q.lines.map(x=>`<tr><td>${esc(x.label)}</td><td>${fmt(x.quantity)} ${esc(x.unit)}</td><td>${pesos(x.unitPrice)}</td><td>${pesos(x.total)}</td></tr>`).join('');
 w.document.open();w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(p.name)} · Cotización</title><style>body{font:13px Arial,sans-serif;color:#202822;margin:34px}h1{font-size:26px}p{color:#66766d}table{width:100%;border-collapse:collapse;margin:25px 0}td,th{padding:11px 8px;border-bottom:1px solid #ddd;text-align:left}th{background:#e9eee9}.total{background:#183026;color:white;padding:20px;font-size:21px;font-weight:700}.warning{padding:15px;background:#fff4dc;color:#7c5b2c;margin:20px 0}button{background:#183026;color:white;border:0;padding:12px 20px}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Guardar PDF / Imprimir</button><p>FURNITURE FABRIC · PRESUPUESTO ${q.complete?'COMPLETO':'PARCIAL'}</p><h1>${esc(p.name)}</h1><p>${p.width} × ${p.height} × ${p.depth} mm · ${p.drawers} cajones · ${p.thickness} mm melamina · ${q.totals.boardCount} tableros de ${p.boardWidth} × ${p.boardHeight} mm</p><table><thead><tr><th>Concepto</th><th>Cantidad</th><th>Precio unitario</th><th>Importe MXN</th></tr></thead><tbody>${rows}</tbody></table><p>Costo directo: ${pesos(q.totals.cost)} · Utilidad: ${pesos(q.totals.profit)} · IVA: ${pesos(q.totals.tax)}</p><div class="total">${q.complete?'TOTAL':'TOTAL PARCIAL'}: ${pesos(q.totals.grandTotal)} MXN</div><div class="warning">${q.missing.length?'Falta cotizar: '+q.missing.map(esc).join(', ')+'. ':''}No usar como presupuesto final ni para cortar sin validar herrajes, tablero, corte y despiece con la fábrica.</div></body></html>`);w.document.close();toast('Cotización lista para imprimir o guardar como PDF');}
function elevations(){const d=design(),W=p.width,H=p.height,D=p.depth,g=p.gap,n=p.drawers,fh=d.stats?.faceH||100;const l=570,scale=Math.min(1,(l-140)/Math.max(W,H,D)),x=90,y=70;
 const frontW=W*scale,frontH=H*scale,sideW=D*scale;
 let drawerSvg='';for(let i=0;i<n;i++)drawerSvg+=`<rect x="${x+g*scale}" y="${y+(g+i*(fh+g))*scale}" width="${(W-2*g)*scale}" height="${fh*scale}" fill="#f1e4d2" stroke="#bda98d" stroke-width=".7"/><line x1="${x+frontW/2-24}" x2="${x+frontW/2+24}" y1="${y+(g+i*(fh+g)+fh/2)*scale}" y2="${y+(g+i*(fh+g)+fh/2)*scale}" stroke="#4b514e" stroke-width="4"/>`;
 return `<svg class="plan-svg" viewBox="0 0 1100 640" role="img" aria-label="Plano de alzado frontal y lateral con medidas en milímetros"><defs><marker id="arrowplan" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0 0L6 3L0 6" fill="none" stroke="#656c69"/></marker></defs>
 <text x="${x}" y="40" font-size="15" fill="#5b625e" font-weight="700">ALZADO FRONTAL · 01</text><rect x="${x}" y="${y}" width="${frontW}" height="${frontH}" fill="#e6d3b5" stroke="#2d3733" stroke-width="2"/>${drawerSvg}
 <line x1="${x}" y1="${y-24}" x2="${x+frontW}" y2="${y-24}" stroke="#686f69" stroke-width="1" marker-start="url(#arrowplan)" marker-end="url(#arrowplan)"/><text x="${x+frontW/2}" y="${y-33}" text-anchor="middle" font-size="14">${W} mm</text>
 <line x1="${x-29}" y1="${y}" x2="${x-29}" y2="${y+frontH}" stroke="#686f69" stroke-width="1" marker-start="url(#arrowplan)" marker-end="url(#arrowplan)"/><text transform="translate(${x-41} ${y+frontH/2}) rotate(-90)" text-anchor="middle" font-size="14">${H} mm</text>
 <g transform="translate(640,0)"><text x="0" y="40" font-size="15" fill="#5b625e" font-weight="700">ALZADO LATERAL · 02</text><rect x="0" y="${y}" width="${sideW}" height="${frontH}" fill="#caa478" stroke="#2d3733" stroke-width="2"/><line x1="0" y1="${y-24}" x2="${sideW}" y2="${y-24}" stroke="#686f69" marker-start="url(#arrowplan)" marker-end="url(#arrowplan)"/><text x="${sideW/2}" y="${y-33}" text-anchor="middle" font-size="14">${D} mm</text></g>
 <text x="90" y="604" font-size="13" fill="#747b76">COTAS EN MILÍMETROS · ESQUEMA PRELIMINAR, NO CERTIFICADO DE FABRICACIÓN</text></svg>`;}
function renderPlans(d){$('#main-content').innerHTML=`${pageHeading('DOCUMENTACIÓN / FABRICACIÓN','Planos técnicos','Vistas acotadas de la cajonera con dimensiones en milímetros.')}
 <div class="page-body">${tabBanner('Planos para cotización','Genera una lámina imprimible con alzados, lista de piezas y herrajes.','PLANOS 03',`<button id="print-sheet" class="btn btn-black">${icon('download',16)} Exportar a PDF</button>`)}
 <section class="white-panel plan-wrapper"><div class="panel-head"><div><h3>${esc(p.name)}</h3><p>Alzado frontal y lateral · Escala ilustrativa</p></div><span>REF: FF-001</span></div>${elevations()}<div class="plan-stamp"><span>DIMENSIONES: ${p.width} × ${p.height} × ${p.depth} MM</span><span>ESPESOR: ${p.thickness} MM</span><span>${p.drawers} CAJONES</span></div></section>
 <div class="warning-band">${icon('alert',19)} Plano para cotización y revisión, no liberado para producción. Falta definir uniones y mecanizados según fabricante de herrajes.</div></div>`;
 $('#print-sheet').onclick=printPlan;bindPageButtons();}
function download(filename,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}
function exportAs(format){const d=design();if(d.issues.length){toast('Corrige las medidas antes de exportar.');return}if(format==='print')return printPlan();
 if(format==='csv')download('furniture-fabric-cortes.csv',csvOf(d.parts),'text/csv;charset=utf-8');
 else if(format==='hardware')download('furniture-fabric-herrajes.csv',hardwareCsv(d.hardware),'text/csv;charset=utf-8');
 else if(format==='quote')download('furniture-fabric-cotizacion.csv',quoteCsv(quote(d)),'text/csv;charset=utf-8');
 else if(format==='json')download('furniture-fabric-proyecto.json',JSON.stringify(p,null,2),'application/json');toast('Archivo preparado');}
function bindExport(){document.querySelectorAll('#main-content [data-export]').forEach(el=>el.onclick=()=>exportAs(el.dataset.export));}
function printPlan(){const d=design();if(d.issues.length)return toast('Corrige las medidas antes de exportar');const w=window.open('','_blank');if(!w)return toast('Permite ventanas emergentes para imprimir');
 const tr=d.parts.map(x=>`<tr><td>${x.id} · ${esc(x.name)}</td><td>${x.quantity}</td><td>${fmt(x.x)} × ${fmt(x.y)}</td><td>${x.material}</td><td>${x.edge||'—'}</td></tr>`).join('');
 const hr=d.hardware.map(x=>`<tr><td>${esc(x.name)}</td><td>${x.qty} ${esc(x.unit)}</td><td>${esc(x.detail)}</td></tr>`).join('');
 w.document.open();w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(p.name)} — Planos</title><style>body{font:13px Arial,sans-serif;color:#222;margin:24px}h1{font-size:26px}h2{margin-top:24px;font-size:16px}small,.muted{color:#777}.stamp{display:flex;justify-content:space-between;border-block:2px solid #333;padding:12px 0}svg{width:100%;max-height:480px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border-bottom:1px solid #ddd;padding:7px;text-align:left}th{background:#f2f2ef}.alert{background:#fff3dd;padding:10px;font-size:11px;margin-top:14px}button{padding:10px 15px;background:#111;color:white;border:0;cursor:pointer}@media print{button{display:none}body{margin:12mm}h2{break-after:avoid}table{break-inside:auto}tr{break-inside:avoid}}</style></head><body><button onclick="window.print()">Imprimir / Guardar PDF</button><p class="muted">FURNITURE FABRIC / DOCUMENTACIÓN TÉCNICA PRELIMINAR</p><h1>${esc(p.name)}</h1><div class="stamp"><b>${p.width} × ${p.height} × ${p.depth} mm</b><span>${p.drawers} cajones</span><span>Melamina ${p.thickness} mm</span><span>${esc(FINISHES[p.finish].label)}</span></div>${elevations()}<h2>Lista de corte</h2><table><thead><tr><th>Pieza</th><th>Cantidad</th><th>Dimensiones mm</th><th>Material</th><th>Cantos</th></tr></thead><tbody>${tr}</tbody></table><h2>Herrajes</h2><table><thead><tr><th>Herraje</th><th>Cantidad</th><th>Descripción</th></tr></thead><tbody>${hr}</tbody></table><div class="alert"><b>ATENCIÓN:</b> Estas dimensiones son preliminares y no están liberadas para fabricación. Verificar SKU, holguras y mecanizados de correderas, tornillería, métodos de unión, canto y sentido de veta.</div></body></html>`);w.document.close();toast('Plano listo para imprimir o guardar como PDF');}
let toastTimer;function toast(message){const el=$('#toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3400);}
shell();
