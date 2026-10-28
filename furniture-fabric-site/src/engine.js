// Geometry is calculated in millimeters. Do not use these values as a substitute
// for the selected slide/hinge manufacturer's installation instructions.
export const DEFAULTS = Object.freeze({
  name:'Cajonera / Clóset 01', width:800, height:750, depth:450,
  thickness:16, drawers:4, gap:3, back:3, kerf:3.2,
  boardWidth:2440, boardHeight:1220, grain:'vertical',
  finish:'roble', hardware:'balanced', handles:'bar',
  slideLength:400, drawerOpen:0, exploded:false
});

export const FINISHES = {
  roble:{label:'Roble natural',hex:'#caa478',side:'#9c7654',edge:'#e6cbab'},
  nogal:{label:'Nogal ahumado',hex:'#78523a',side:'#483021',edge:'#9f7658'},
  blanco:{label:'Blanco mate',hex:'#edece7',side:'#c4c4be',edge:'#ffffff'},
  grafito:{label:'Grafito',hex:'#565c5d',side:'#363b3d',edge:'#828687'},
  arena:{label:'Arena',hex:'#ccc5b3',side:'#a79f8e',edge:'#eae4d6'}
};
export const HARDWARE = {
  budget:{name:'Esencial',brand:'DTC (referencia)',slide:'Corredera lateral con cierre suave',clearance:12.7,notes:'Verificar la ficha de la referencia elegida.'},
  balanced:{name:'Equilibrado',brand:'Häfele / equivalente',slide:'Corredera lateral con cierre suave',clearance:12.7,notes:'El modelo exacto determina holguras, carga y patrón de barrenos.'},
  premium:{name:'Premium',brand:'Blum TANDEM (referencia)',slide:'Corredera oculta de cierre suave',clearance:null,notes:'El cajón TANDEM requiere mecanizado específico. Las piezas del cajón no están listas para fabricar hasta seleccionar SKU y plantilla Blum.'}
};
const round=(v)=>Math.round(v*10)/10;
const safeNum=(v)=>Number.isFinite(+v)?+v:0;
export function validate(config){
  const p={...DEFAULTS,...config}; const issues=[];
  const integer=(k,min,max)=>{if(!Number.isInteger(safeNum(p[k]))||safeNum(p[k])<min||safeNum(p[k])>max)issues.push(`${k}: debe ser un entero entre ${min} y ${max}.`);};
  integer('width',300,2400); integer('height',250,2600); integer('depth',200,1200);
  integer('drawers',1,10); if(![15,16,18,19].includes(+p.thickness))issues.push('Selecciona un espesor de melamina válido.');
  if(+p.gap<2||+p.gap>8)issues.push('La junta de frentes debe ser de 2 a 8 mm.');
  const freeH=p.height-2*p.thickness;
  const faceH=(p.height-(p.drawers+1)*p.gap)/p.drawers;
  if(faceH<115)issues.push('Cada frente de cajón debe medir al menos 115 mm de alto en este prototipo.');
  if(freeH/p.drawers<100)issues.push('Altura interior insuficiente para los cajones.');
  if(p.width-2*p.thickness-2*12.7<220)issues.push('No hay ancho útil suficiente para la caja de cajón.');
  if(p.depth-p.back-p.thickness-25<200)issues.push('Fondo insuficiente para una corredera estándar.');
  if(!FINISHES[p.finish])issues.push('Acabado no reconocido.');
  if(!HARDWARE[p.hardware])issues.push('Gama de herrajes no reconocida.');
  if(p.slideLength > p.depth-p.back-p.thickness-10)issues.push('La corredera seleccionada excede la profundidad disponible.');
  if(p.slideLength<250)issues.push('Selecciona una longitud de corredera de al menos 250 mm.');
  if(+p.boardWidth<+p.width||+p.boardHeight<1000)issues.push('Comprueba el tamaño del tablero.');
  return issues;
}

export function createDesign(config={}){
  const p={...DEFAULTS,...config};
  const issues=validate(p);
  if(issues.length)return {params:p,issues,parts:[],hardware:[],stats:null,manufacturingReady:false};
  const t=+p.thickness,W=+p.width,H=+p.height,D=+p.depth,
        b=+p.back,g=+p.gap,n=+p.drawers,
        bodyD=D-b,innerW=W-2*t,innerH=H-2*t,
        faceW=W-2*g,faceH=(H-(n+1)*g)/n,
        hw=HARDWARE[p.hardware];
  const clearance=hw.clearance??12.7; // indicative proxy only for premium geometry
  const boxW=innerW-2*clearance;
  const boxD=+p.slideLength;
  const boxH=Math.min(160,Math.max(75,faceH-36));
  const parts=[];
  const add=(id,name,quantity,x,y,material,edge='',group='estructura',note='')=>parts.push({id,name,quantity,x:round(x),y:round(y),material,edge,group,note});
  add('L01','Costados',2,H,bodyD,'melamina','F','estructura');
  add('T01','Tapa y base',2,innerW,bodyD,'melamina','F','estructura');
  add('B01','Trasera sobrepuesta',1,W,H,'hdf','', 'estructura','HDF 3 mm: revisar método de fijación.');
  add('F01','Frentes de cajón',n,faceW,faceH,'melamina','4C','frentes','Veta vertical, cantos en los 4 lados.');
  if(p.hardware!=='premium'){
    add('C01','Costados caja de cajón',n*2,boxD,boxH,'melamina','S','cajón');
    add('C02','Frente/trasera caja de cajón',n*2,boxW-2*t,boxH,'melamina','S','cajón');
    add('C03','Fondo caja de cajón',n,boxW,boxD,'hdf','', 'cajón','Fondo sobrepuesto de 6 mm; fijación a definir.');
  }
  const hardware=[
    {name:`Pares de correderas de ${p.slideLength} mm`,qty:n,unit:'pares',detail:`${hw.brand} · ${hw.slide}`,status:p.hardware==='premium'?'SKU obligatorio':'Selección de SKU pendiente'},
    {name:'Jaladeras',qty:p.handles==='none'?0:n,unit:'piezas',detail:p.handles==='bar'?'Lineales negras · longitud a definir':'',status:'Modelo pendiente'},
    {name:'Tornillos confirmat / ensamble',qty:16,unit:'piezas aprox.',detail:'Calibre y longitud según ensamble',status:'Por verificar'},
    {name:'Tornillos para correderas',qty:n*8,unit:'piezas aprox.',detail:'Dependen del modelo de corredera',status:'Por verificar'},
    {name:'Bisagras',qty:0,unit:'piezas',detail:'No hay puertas en esta configuración',status:'No aplica'},
    {name:'Canto PVC',qty:round((2*H+2*innerW+n*(2*faceW+2*faceH))/1000),unit:'m aprox.',detail:'Incluye frente visible; confirmar cantos definitivos',status:'Estimado'}
  ].filter(h=>h.qty>0||h.name==='Bisagras');
  const area=parts.filter(x=>x.material==='melamina').reduce((s,x)=>s+x.x*x.y*x.quantity,0)/1e6;
  const hdfArea=parts.filter(x=>x.material==='hdf').reduce((s,x)=>s+x.x*x.y*x.quantity,0)/1e6;
  const stats={area:round(area),hdfArea:round(hdfArea),pieces:parts.reduce((s,x)=>s+x.quantity,0),faceH:round(faceH),boxW:round(boxW),boxH:round(boxH),innerW:round(innerW),innerH:round(innerH),bodyD,clearance,faceW:round(faceW)};
  return {params:p,issues:[],parts,hardware,stats,manufacturingReady:false,warnings:[
    'Diseño preliminar: no fabricar ni perforar hasta verificar correderas, tornillos y ensambles con fichas del proveedor.',
    p.hardware==='premium'?'Cajones Blum TANDEM: despiece de cajas pendiente de selección del SKU.':'Holgura lateral de 12.7 mm usada como referencia genérica; debe confirmarse con el modelo elegido.',
    'Orientación de veta y sentido de corte deben confirmarse antes de pedir tableros.'
  ]};
}

// Simple shelf packer, not a globally optimal CNC nesting solution.
export function layoutSheets(parts,boardWidth=2440,boardHeight=1220,kerf=3.2){
  const items=[];
  for(const p of parts.filter(p=>p.material==='melamina')) for(let i=0;i<p.quantity;i++)items.push({id:p.id,label:p.name,w:p.x,h:p.y,index:i+1});
  items.sort((a,b)=>Math.max(b.w,b.h)-Math.max(a.w,a.h));
  const sheets=[];let unplaced=[];
  for(const item of items){
    let placed=false;
    for(const sheet of sheets){
      let x=sheet.x,y=sheet.y,rowH=sheet.rowH;
      let w=item.w,h=item.h;
      if(x+w>boardWidth){x=0;y+=rowH+kerf;rowH=0;}
      if(y+h>boardHeight)continue;
      sheet.parts.push({...item,x:round(x),y:round(y)});
      sheet.x=x+w+kerf;sheet.y=y;sheet.rowH=Math.max(rowH,h);placed=true;break;
    }
    if(!placed){
      if(item.w>boardWidth||item.h>boardHeight){unplaced.push(item);continue;}
      sheets.push({parts:[{...item,x:0,y:0}],x:item.w+kerf,y:0,rowH:item.h});
    }
  }
  return {sheets:sheets.map(({parts})=>({parts,usedArea:parts.reduce((a,p)=>a+p.w*p.h,0)})),unplaced,
          utilization:sheets.length?round(100*sheets.reduce((s,sheet)=>s+sheet.usedArea,0)/(sheets.length*boardWidth*boardHeight)):0};
}

export function csvOf(parts){
  const q=x=>'"'+String(x).replaceAll('"','""')+'"';
  const rows=[['ID','Pieza','Cantidad','Largo mm','Ancho mm','Material','Cantos','Grupo','Notas'],
    ...parts.map(p=>[p.id,p.name,p.quantity,p.x,p.y,p.material,p.edge,p.group,p.note])];
  return '\uFEFF'+rows.map(row=>row.map(q).join(';')).join('\r\n');
}
export function hardwareCsv(items){
  const q=x=>'"'+String(x).replaceAll('"','""')+'"';
  return '\uFEFF'+[['Herraje','Cantidad','Unidad','Detalle','Estado'],...items.map(x=>[x.name,x.qty,x.unit,x.detail,x.status])].map(r=>r.map(q).join(';')).join('\r\n');
}
