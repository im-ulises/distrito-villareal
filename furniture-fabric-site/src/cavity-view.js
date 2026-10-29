import {planCavity,mm} from './cavity-engine.js';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const label=(v)=>mm(v/10)+' cm';
export function cavityFront(p){
 const c=planCavity(p), sx=830/c.totalWidth, x=v=>30+v*sx, h=270, y=290, t=20;
 const openX=x(c.left),openW=c.openingWidth*sx, rightX=x(c.left+c.openingWidth),leftW=c.left*sx,rightW=c.right*sx;
 const topH=c.top===null?0:Math.min(48,h*c.top/(c.openingHeight+c.top)); const openingY=73+topH;const openingH=h-topH;
 // A cross-section of the measured width, NOT a fabricated front elevation for hidden wings.
 return `<svg class="cavity-front" viewBox="0 0 900 380" role="img" aria-label="Diagrama de 317.7 centímetros: izquierda oculta 72, abertura 187, derecha oculta 58.7">
 <text x="30" y="26" class="cv-title">VISTA FRONTAL · MEDIDAS DEL VOLUMEN</text>
 <line x1="30" y1="48" x2="860" y2="48" stroke="#557765" stroke-width="1.2"/><text x="445" y="40" class="cv-dim" text-anchor="middle">${esc(label(c.totalWidth))} TOTAL</text>
 <rect x="30" y="73" width="830" height="${h}" fill="#eef2e9" stroke="#627a6c" stroke-width="1.3" stroke-dasharray="6 4"/>
 <rect x="30" y="73" width="${leftW}" height="${h}" fill="#dce5e0" stroke="#7b9990" stroke-dasharray="6 4"/>
 <rect x="${rightX}" y="73" width="${rightW}" height="${h}" fill="#dce5e0" stroke="#7b9990" stroke-dasharray="6 4"/>
 <rect x="${openX}" y="${openingY}" width="${openW}" height="${openingH}" fill="#fbf7ed" stroke="#7e8a7e" stroke-width="1.8"/>
 ${c.top===null?'':`<rect x="${openX}" y="73" width="${openW}" height="${topH}" fill="#cbd7d1" stroke="#638577" stroke-width="1" stroke-dasharray="5 3"/><text x="${openX+openW/2}" y="${73+topH/2+4}" text-anchor="middle" class="cv-tiny">ALTILLO +${esc(label(c.top))} · PROVISIONAL</text>`}
 <rect x="${openX+5}" y="${y-113}" width="${openW-10}" height="113" fill="#ead8bc" fill-opacity=".7" stroke="#ac9573"/>
 <line x1="${openX+openW*.275}" x2="${openX+openW*.275}" y1="${y-113}" y2="${y}" stroke="#a78c69" stroke-width="5"/>
 <line x1="${openX+openW*.725}" x2="${openX+openW*.725}" y1="${y-113}" y2="${y}" stroke="#a78c69" stroke-width="5"/>
 ${[0,1,2,3].map(i=>`<rect x="${openX+openW*.275+7}" y="${y-110+i*27.5}" width="${openW*.45-14}" height="${27.5-3}" fill="#c4a17a" stroke="#926e49"/>`).join('')}
 ${[0,1,2].map(i=>`<line x1="${openX+openW*.275+8}" x2="${openX+openW*.725-8}" y1="${114+i*22}" y2="${114+i*22}" stroke="#ad956f" stroke-width="5"/>`).join('')}
 <rect x="30" y="73" width="${leftW}" height="${h}" fill="none" stroke="#567d74" stroke-dasharray="6 4"/>
 <rect x="${rightX}" y="73" width="${rightW}" height="${h}" fill="none" stroke="#567d74" stroke-dasharray="6 4"/>
 <text x="${x(c.left/2)}" y="95" class="cv-head" text-anchor="middle">IZQUIERDA</text><text x="${x(c.left/2)}" y="119" class="cv-big" text-anchor="middle">${esc(label(c.left))}</text><text x="${x(c.left/2)}" y="136" class="cv-tiny" text-anchor="middle">OCULTO</text>
 <text x="${x(c.left+c.openingWidth/2)}" y="319" class="cv-mid" text-anchor="middle">ABERTURA VISIBLE · ${esc(label(c.openingWidth))}</text>
 <text x="${x(c.left+c.openingWidth+c.right/2)}" y="95" class="cv-head" text-anchor="middle">DERECHA</text><text x="${x(c.left+c.openingWidth+c.right/2)}" y="119" class="cv-big" text-anchor="middle">${esc(label(c.right))}</text><text x="${x(c.left+c.openingWidth+c.right/2)}" y="136" class="cv-tiny" text-anchor="middle">OCULTO</text>
 <text x="30" y="369" class="cv-foot">ZONAS SOMBREADAS = VOLUMEN POTENCIAL, NO MUEBLE FABRICABLE · VALIDAR ALTURA TOTAL</text></svg>`;
}
export function cavityTop(p){
 const c=planCavity(p),xx=v=>35+v*(820/c.totalWidth), yy=v=>45+v*.27;
 const x0=xx(0),xl=xx(c.left),xr=xx(c.left+c.openingWidth),xe=xx(c.totalWidth),y0=yy(0),y1=yy(c.openingDepth),fw=xx(c.totalWidth)-xx(0);
 return `<svg class="cavity-top" viewBox="0 0 900 340" role="img" aria-label="Planta conceptual del hueco y acceso frontal, con alas laterales pendientes de verificar">
 <text x="35" y="24" class="cv-title">VISTA SUPERIOR · GEOMETRÍA DE ACCESO</text>
 <rect x="${x0}" y="${y0}" width="${fw}" height="${y1-y0}" fill="#eef2e9" stroke="#6e8979" stroke-width="1.5" stroke-dasharray="5 4"/>
 <rect x="${x0}" y="${y0}" width="${xl-x0}" height="${y1-y0}" fill="#e0e7e5" stroke="#74978a" stroke-dasharray="4 4"/>
 <rect x="${xr}" y="${y0}" width="${xe-xr}" height="${y1-y0}" fill="#e0e7e5" stroke="#74978a" stroke-dasharray="4 4"/>
 <rect x="${x0}" y="${y1-20}" width="${xl-x0}" height="20" fill="#888984"/>
 <rect x="${xr}" y="${y1-20}" width="${xe-xr}" height="20" fill="#888984"/>
 <line x1="${xl}" x2="${xr}" y1="${y1}" y2="${y1}" stroke="#54876a" stroke-width="4"/>
 <line x1="${xl+15}" x2="${xr-15}" y1="${y1-40}" y2="${y1-40}" stroke="#ad926d" stroke-width="8"/>
 <path d="M ${xl+35} ${y1+38} L ${xl+35} ${y1+6} L ${xl+25} ${y1+18} M ${xl+35} ${y1+6} L ${xl+45} ${y1+18}" stroke="#557b63" stroke-width="2" fill="none"/>
 <text x="${(xl+xr)/2}" y="${y1+36}" class="cv-mid" text-anchor="middle">ENTRADA: ${esc(label(c.openingWidth))}</text>
 <text x="${(x0+xl)/2}" y="${y0+80}" text-anchor="middle" class="cv-mini">FONDO PENDIENTE</text><text x="${(xr+xe)/2}" y="${y0+80}" text-anchor="middle" class="cv-mini">FONDO PENDIENTE</text>
 <text x="${(xl+xr)/2}" y="${y0+26}" text-anchor="middle" class="cv-head">FONDO CONOCIDO ${esc(label(c.openingDepth))}</text>
 <text x="35" y="330" class="cv-foot">LOS 79 CM DE FONDO SOLO ESTÁN CONFIRMADOS EN LA ABERTURA CENTRAL.</text>
 </svg>`;
}
export function cavityPanel(p,quoted){const c=planCavity(p);return `<section class="panel cavity-panel"><div class="panel-head"><div><span class="eyebrow">VOLUMEN REAL / REPLANTEO</span><h2>La abertura no es todo el clóset.</h2><p>Hay ${esc(label(c.left+c.right))} adicionales detrás del concreto. Separamos dimensiones verificadas de supuestos para no cortar piezas equivocadas.</p></div><span class="small-badge">PROPUESTA V2</span></div>
 <div class="cavity-kpis"><article><span>ANCHO TOTAL</span><strong>${esc(label(c.totalWidth))}</strong></article><article><span>IZQUIERDA OCULTA</span><strong>${esc(label(c.left))}</strong></article><article><span>ABERTURA</span><strong>${esc(label(c.openingWidth))}</strong></article><article><span>DERECHA OCULTA</span><strong>${esc(label(c.right))}</strong></article></div><p class="cavity-height-banner"><b>ALTURA INTERIOR TOTAL: ${c.totalHeight===null?'SIN MEDIR':esc(label(c.totalHeight))}</b> · Abertura: ${esc(label(c.openingHeight))} · Altura sobre concreto: ${c.top===null?'sin medir':esc(label(c.top))} · <strong>228 cm interpretados como altura total; confirmar en sitio.</strong></p>
 ${cavityFront(p)}${cavityTop(p)}
 <div class="cavity-grid"><div class="cavity-note"><h3>Propuesta de distribución</h3><p><b>Centro:</b> cajonera de cuatro cajones y repisas; colgado en ambos laterales visibles.</p><p><b>Izquierda oculta (72 cm):</b> reserva para ropa de temporada / módulo de entrepaños accesible lateralmente, sujeto a una prueba de alcance.</p><p><b>Derecha oculta (58.7 cm):</b> reserva para almacenaje ocasional; no se recomienda diseñar cajones que salgan perpendicularmente contra el muro.</p><p><b>Sobre el marco:</b> ${c.top===null?'altura por medir':esc(label(c.top))} de reserva vertical estimada; por ser solo 23 cm, conviene evaluar una bandeja o repisa baja y comprobar que el marco deje acceso real.</p></div><div class="cavity-note warn"><h3>No está incluido en el precio</h3><p>El cálculo de <b>${quoted.boardCount} hojas · ${new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(quoted.boardCost)}</b> corresponde <b>solo al módulo central anterior</b>, no al volumen total.</p><p>Faltan altura y fondo útil de ambas alas, validación de altura superior declarada y medidas del canto frontal de concreto. Para instalar, los módulos deben entrar por 187 cm de ancho.</p><button id="measurements-csv" class="action">Descargar medidas pendientes ↓</button></div></div>
 <div class="alert">Este diagrama es una interpretación geométrica; no equivale a plano de fabricación. No usar para pedir corte de tableros ocultos.</div></section>`;}
export function surveyCsv(p){const c=planCavity(p);const rows=[['Medida','Valor (mm)','Estado'],['Ancho total interior',c.totalWidth,'confirmado por suma'],['Abertura visible ancho',c.openingWidth,'declarado'],['Abertura visible alto',c.openingHeight,'declarado'],['Fondo de abertura',c.openingDepth,'declarado'],['Lateral izquierdo adicional',c.left,'declarado'],['Lateral derecho adicional',c.right,'calculado'],['Altura extra superior',c.top??'',c.top===null?'sin medir':'derivado de 2280 - 2050; confirmar'],['Altura total interior estimada',c.totalHeight??'',c.totalHeight===null?'sin medir':'228 cm se asumieron como altura total; confirmar'],['Altura útil tras concreto izquierda','','sin medir'],['Altura útil tras concreto derecha','','sin medir'],['Fondo útil izquierda','','sin medir'],['Fondo útil derecha','','sin medir'],['Espesor del marco de concreto','','sin medir'],['Ruta de acceso para instalación','','por revisar']];return '\uFEFF'+rows.map(x=>x.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n');}
