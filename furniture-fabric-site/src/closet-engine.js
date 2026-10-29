import {layoutSheets, csvOf, hardwareCsv} from './engine.js';

// All measurements are millimeters. Project is a spatial design / quoting draft,
// not an approved shop drawing or an approved manufacturer's drill template.
export const CLOSET_DEFAULTS = Object.freeze({
  name:'Clóset Nogales · configuración agosto', nicheWidth:1870,nicheHeight:2050,nicheDepth:790,
  sideClearance:10, topClearance:20,bottomClearance:10,depth:600, thickness:15,
  leftBay:470,rightBay:470, drawerCount:4, drawerTop:870, toeKick:70,
  slideLength:500,drawerOpen:0,activeDrawer:'all', finish:'roble',
  boardWidth:2400,boardHeight:1200,kerf:3.2,sheetPrice:900,
  slidePairPrice:0,railPrice:0,handlePrice:0,edgingPriceM:0,cutPricePerPiece:0,
  hdfPriceM2:0,laborPrice:0,miscPrice:0,ledPrice:0,profitPercent:0,taxPercent:0,
  doors:false
});
const rnd=n=>Math.round(n*10)/10;
const nearest=n=>Math.round(n);
export const PRESETS={
  roble:{name:'Roble natural',main:'#caa478',edge:'#957454',inside:'#dec3a0'},
  nogal:{name:'Nogal ahumado',main:'#72503b',edge:'#3f2a20',inside:'#a37a59'},
  blanco:{name:'Blanco mate',main:'#eae9e3',edge:'#b4b3ac',inside:'#f7f6ef'},
  arena:{name:'Arena',main:'#cfc6b3',edge:'#a99a81',inside:'#e5d9c6'}
};
export function validateCloset(raw={}){
 const p={...CLOSET_DEFAULTS,...raw},issues=[];
 const bounded=(k,lo,hi)=>{if(!Number.isFinite(+p[k])||+p[k]<lo||+p[k]>hi)issues.push(`${k}: valor fuera de rango (${lo}–${hi} mm).`)};
 for(const [key,lo,hi] of [['nicheWidth',900,3200],['nicheHeight',1200,3000],['nicheDepth',400,1200],['depth',420,1000],['sideClearance',0,60],['topClearance',0,100],['bottomClearance',0,100],['leftBay',300,900],['rightBay',300,900],['drawerTop',550,1250],['toeKick',35,120],['slideLength',250,650]])bounded(key,lo,hi);
 if(![15,16,18].includes(+p.thickness))issues.push('Espesor de melamina: elige 15, 16 o 18 mm.');
 if(!Number.isInteger(+p.drawerCount)||p.drawerCount<2||p.drawerCount>6)issues.push('Cantidad de cajones: entre 2 y 6.');
 const t=+p.thickness,W=p.nicheWidth-2*p.sideClearance,H=p.nicheHeight-p.topClearance-p.bottomClearance,center=W-4*t-p.leftBay-p.rightBay;
 if(center<450)issues.push('La zona central requiere al menos 450 mm de claro útil.');
 if(p.drawerTop>H-680)issues.push('La cajonera deja poco espacio para las repisas superiores.');
 if((p.drawerTop-p.toeKick-3*(+p.drawerCount+1))/p.drawerCount<120)issues.push('Los frentes de cajón resultarían demasiado bajos.');
 if(p.depth>p.nicheDepth-5)issues.push('Faltan al menos 5 mm de profundidad libre entre el mueble y el fondo del hueco.');
 if(p.slideLength>p.depth-+p.thickness-35)issues.push('La corredera no cabe en el fondo seleccionado.');
 if(!PRESETS[p.finish])issues.push('Acabado no reconocido.');
 return issues;
}
export function createCloset(raw={}){
 const p={...CLOSET_DEFAULTS,...raw},issues=validateCloset(p);
 if(issues.length)return {params:p,issues,parts:[],solids:[],hardware:[],metrics:null,notes:[]};
 const t=+p.thickness,W=p.nicheWidth-2*p.sideClearance,H=p.nicheHeight-p.topClearance-p.bottomClearance,D=+p.depth,carcassD=D-t;
 const left=p.leftBay,right=p.rightBay,center=W-4*t-left-right;
 const xLeft=t,xDivider1=t+left,xCenter=xDivider1+t,xDivider2=xCenter+center,xRight=xDivider2+t;
 const solids=[],pieceList=[];
 const add=(id,name,w,h,d,x,y,z,{material='melamina',edge='',group='estructura',note='',role='panel',drawer=null}={})=>{
   const dims=[w,h,d].sort((a,b)=>b-a); // two larger dimensions = blank cut size
   const panelThick=material==='hdf'? (name.includes('Fondo')?6:3):t;
   // All stock in this model is a rectangular panel with a known thickness.
   const cut=([w,h,d].filter(v=>Math.abs(v-panelThick)>0.01).length===2)?[w,h,d].filter(v=>Math.abs(v-panelThick)>0.01).sort((a,b)=>b-a):dims.slice(0,2);
   pieceList.push({id,name,quantity:1,x:rnd(cut[0]),y:rnd(cut[1]),material,edge,group,note});
   solids.push({id,w,h,d,x,y,z,material,role,drawer});
 };
 // four full-height structural walls and a top/bottom frame. Back is in three sections.
 add('P01','Costado exterior izquierdo',t,H,carcassD,t/2,H/2,carcassD/2,{edge:'F',group:'estructura'});
 add('P02','Costado exterior derecho',t,H,carcassD,W-t/2,H/2,carcassD/2,{edge:'F',group:'estructura'});
 add('P03','Divisor izquierdo',t,H-2*t,carcassD,xDivider1+t/2,H/2,carcassD/2,{edge:'F',group:'estructura'});
 add('P04','Divisor derecho',t,H-2*t,carcassD,xDivider2+t/2,H/2,carcassD/2,{edge:'F',group:'estructura'});
 add('P05','Tapa superior',W-2*t,t,carcassD,W/2,H-t/2,carcassD/2,{edge:'F',group:'estructura'});
 add('P06','Base inferior',W-2*t,t,carcassD,W/2,t/2,carcassD/2,{edge:'F',group:'estructura'});
 const shelf=(id,name,x0,width,bottom,depth=570,role='shelf')=>add(id,name,width,t,depth,x0+width/2,bottom+t/2,depth/2,{edge:'F',group:'entrepaños',role,note:'Fijación y flecha a verificar según carga'});
 shelf('C01','Cubierta superior de cajonera',xCenter,center,p.drawerTop,carcassD);
 // three adjustable shelves plus fixed upper storage shelf, minimizing unused void.
 const shelfLevels=[1110,1340,1570,1800].map(h=>nearest(p.drawerTop+(h-870)*(H-30-p.drawerTop)/(2020-30-870)));
 shelfLevels.forEach((y,i)=>{shelf('C'+String(i+2).padStart(2,'0'),i===3?'Entrepaño maletero central':`Entrepaño ajustable central ${i+1}`,xCenter,center,y,560);
   // stiffening strip; >800mm spans of 15mm melamine need sag engineering.
   add('R'+(i+1),'Refuerzo inferior de repisa central',center,50,t,xCenter+center/2,y-25,560-t/2,{edge:'F',group:'refuerzos',role:'reinforcement',note:'Refuerzo a validar estructuralmente'});
 });
 shelf('L01','Maletero izquierdo',xLeft,left,H-270,560);
 shelf('D01','Maletero derecho',xRight,right,H-270,560);
 shelf('L02','Zapatera izquierda 1',xLeft,left,200,510);
 shelf('L03','Zapatera izquierda 2',xLeft,left,370,510);
 shelf('D02','Zapatera derecha 1',xRight,right,195,510);
 shelf('D03','Zapatera derecha 2',xRight,right,355,510);
 // Four flush drawer faces and their moving internal boxes. All drawer pieces get same ID.
 const g=3,faceW=center-2*g,faceH=(p.drawerTop-p.toeKick-(p.drawerCount+1)*g)/p.drawerCount;
 const boxW=center-25.4, boxH=Math.min(145,faceH-44),boxD=p.slideLength;
 for(let i=0;i<p.drawerCount;i++){
   const y0=p.toeKick+g+i*(faceH+g),cy=y0+faceH/2;
   add('F'+(i+1),`Frente de cajón ${i+1}`,faceW,faceH,t,xCenter+center/2,cy,carcassD+t/2,{edge:'4C',group:'frentes',role:'face',drawer:i,note:'Frente exterior, canto en cuatro lados'});
   const bz=carcassD-8-boxD/2, xmid=xCenter+center/2;
   for(let k=0;k<2;k++) add('J'+(i+1)+(k?'R':'L'),`Costado de caja cajón ${i+1}`,t,boxH,boxD,xmid+(k?1:-1)*(boxW/2-t/2),cy,bz,{edge:'F',group:'cajones',role:'drawer',drawer:i});
   for(let k=0;k<2;k++)add('J'+(i+1)+(k?'B':'F'),`Travesaño de caja cajón ${i+1}`,boxW-2*t,boxH,t,xmid,cy,bz+(k?-1:1)*(boxD/2-t/2),{edge:'F',group:'cajones',role:'drawer',drawer:i});
   add('H'+(i+1),`Fondo caja cajón ${i+1}`,boxW,6,boxD,xmid,cy-boxH/2+3,bz,{material:'hdf',group:'fondos',role:'drawer',drawer:i,note:'HDF 6 mm, sobrepuesto; ajuste de ensamble pendiente'});
 }
 add('Z01','Zócalo central remetido',center,70,t,xCenter+center/2,35,carcassD-35,{edge:'F',group:'zócalo',role:'plinth'});
 // HDF back split by the real inner bay widths (optional if installed against wall).
 [['B01',left,xLeft],['B02',center,xCenter],['B03',right,xRight]].forEach(([id,w,x])=>{
   add(id,'Respaldo seccionado HDF 3 mm',w,H-2*t,3,x+w/2,H/2,-1.5,{material:'hdf',group:'trasera',role:'back',note:'Opcional, no incluido como melamina; revisar acceso y fijación'});
 });
 // Group cut parts only when type, dimensions, group, finish and edge match.
 const groups=new Map(); for(const item of pieceList){const key=[item.name,item.x,item.y,item.material,item.edge,item.group,item.note].join('|');if(groups.has(key))groups.get(key).quantity++;else groups.set(key,{...item});}
 const parts=[...groups.values()];
 // Note: 500mm soft-close slides require matching SKU and drawer side clearances.
 const melamine=parts.filter(a=>a.material==='melamina');
 const edgeMeters=rnd(melamine.reduce((sum,a)=>sum+(a.edge==='4C'?2*(a.x+a.y):a.edge==='F'?a.x:0)*a.quantity,0)/1000);
 const hardware=[
  {name:`Correderas cierre suave ${p.slideLength} mm`,qty:p.drawerCount,unit:'pares',detail:'DTC / Cerrajes / Häfele. Elegir SKU, capacidad y holgura real.',status:'Referencia no confirmada'},
  {name:'Barras de colgar',qty:3,unit:'piezas',detail:'1 izquierda (ropa larga) + 2 derecha (doble colgado), claro 470 mm',status:'Medir y cortar según soportes'},
  {name:'Soportes de barra',qty:6,unit:'piezas',detail:'2 por barra',status:'Modelo pendiente'},
  {name:'Pasadores de repisa ajustable',qty:12,unit:'piezas',detail:'4 por repisa ajustable (3 repisas)',status:'Perforaciones pendientes'},
  {name:'Jaladeras',qty:p.drawerCount,unit:'piezas',detail:'Uñero perfil o jaladera lineal, a definir',status:'Modelo pendiente'},
  {name:'Bisagras',qty:0,unit:'piezas',detail:'Clóset abierto sin puertas en este diseño',status:'No aplica'},
  {name:'Canto PVC',qty:edgeMeters,unit:'m estimados',detail:'Incluye frentes cuatro lados y cantos visibles; añadir merma',status:'Confirmar caras visibles'},
  {name:'Anclajes a muro / escuadras anti-vuelco',qty:4,unit:'juegos estimados',detail:'Anclaje estructural obligatorio; depende del muro',status:'Especificar en sitio'},
  {name:'Tornillos, tarugos y fijación',qty:1,unit:'lote',detail:'Definir según ensamble y muro',status:'Pendiente'}
 ];
 // Hanger bars are visual metal components and are intentionally not cut panels.
 const rod=(xmid,y)=>solids.push({id:'RAIL',w:left-32,h:18,d:18,x:xmid,y,z:carcassD*.57,role:'rail',material:'metal',drawer:null});
 rod(xLeft+left/2,1640);rod(xRight+right/2,1630);rod(xRight+right/2,890);
 const stats={outerW:W,outerH:H,outerD:D,center, left,right,faceH:rnd(faceH),boxW:rnd(boxW),sheetArea:2.88,
    melamineM2:rnd(melamine.reduce((a,b)=>a+b.x*b.y*b.quantity,0)/1e6),hdfM2:rnd(parts.filter(x=>x.material==='hdf').reduce((a,b)=>a+b.x*b.y*b.quantity,0)/1e6),shelfLevels,edgeMeters,
    pieces:parts.reduce((s,a)=>s+a.quantity,0),sideTotal:p.sideClearance*2,topFree:p.topClearance,bottomFree:p.bottomClearance,
    clearanceBehind:p.nicheDepth-D,rodLength:left-32};
 const notes=[
  'Hueco 1870 × 2050 × 790 mm declarado. Verificar en 3 alturas, 3 anchuras y profundidad mínima antes de fabricar.',
  'Se consideran holguras de instalación (10 mm por lado, 20 mm arriba, 10 mm abajo). Revisar nivel, desplome y zoclo del sitio.',
  'Cajas de cajón con holgura lateral de 12.7 mm por lado como referencia; NO cortar ni barrenar sin confirmar el SKU.',
  'Entrepaños centrales de 850 mm: los refuerzos de 50 mm están incluidos, pero deben verificarse flexión, carga y anclajes.',
  'Espalda HDF opcional y fondos de cajón HDF 6 mm incluidos en el despiece, con precio por m² pendiente.',
  'No existen puertas ni bisagras en este proyecto. Barras y anclajes a muro requieren especificación en sitio.',
  'Nesting sencillo sin rotación y sin certificación industrial; el proveedor debe validar veta, kerf, canteado y plan de corte.'
 ];
 return {params:p,issues:[],parts,solids,hardware,stats,notes,manufacturingReady:false};
}
export function quoteCloset(config={},design=createCloset(config)){
 const p={...CLOSET_DEFAULTS,...config};if(design.issues.length)return {issues:design.issues};
 const nesting=layoutSheets(design.parts,p.boardWidth,p.boardHeight,p.kerf);
 const qty=(name)=>design.hardware.find(x=>x.name===name)?.qty||0;
 const read=(key)=>{const n=Number(p[key]);return Number.isFinite(n)&&n>=0?n:0};
 const panelCount=design.parts.filter(x=>x.material==='melamina').reduce((a,b)=>a+b.quantity,0);
 const items=[
  ['Melamina 15 mm · tableros completos',nesting.sheets.length,'hojas','sheetPrice'],
  ['HDF traseras y fondos (m²)',design.stats.hdfM2,'m²','hdfPriceM2'],
  ['Correderas de cierre suave',p.drawerCount,'pares','slidePairPrice'],
  ['Barras de colgar',3,'pzas','railPrice'],
  ['Jaladeras / uñeros',p.drawerCount,'pzas','handlePrice'],
  ['Canto PVC',design.stats.edgeMeters,'m','edgingPriceM'],
  ['Cortes de melamina',panelCount,'pzas','cutPricePerPiece'],
  ['Iluminación LED (opcional)',1,'servicio','ledPrice',false],
  ['Armado e instalación',1,'servicio','laborPrice'],
  ['Tornillería, anclajes y transporte',1,'lote','miscPrice']
 ].map(([name,quantity,unit,key,required=true])=>({name,quantity,unit,unitPrice:read(key),cost:rnd(quantity*read(key)),key,required}));
 const known=rnd(items.reduce((sum,x)=>sum+x.cost,0)),markup=rnd(known*read('profitPercent')/100),tax=rnd((known+markup)*read('taxPercent')/100);
 const missing=items.filter(x=>x.required&&x.unitPrice===0).map(x=>x.name);
 if(nesting.unplaced.length)missing.push(`${nesting.unplaced.length} piezas no caben en hoja`);
 if(p.thickness!==15)missing.push('El precio de hoja fue proporcionado para 15 mm, no para este espesor');
 return {items,nesting,known,markup,tax,total:rnd(known+markup+tax),boardCount:nesting.sheets.length,boardCost:rnd(nesting.sheets.length*read('sheetPrice')),missing,complete:missing.length===0};
}
export function closetCsv(d){return csvOf(d.parts)}
export function closetHardwareCsv(d){return hardwareCsv(d.hardware)}
export function closetQuoteCsv(q){
 const lines=[['Concepto','Cantidad','Unidad','Precio unidad MXN','Total MXN'],...q.items.map(x=>[x.name,x.quantity,x.unit,x.unitPrice,x.cost]),['Total parcial','','','',q.total],['PENDIENTE','','','',q.missing.join(' | ')]];
 return '\uFEFF'+lines.map(a=>a.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n');
}
