import {layoutSheets,csvOf} from './engine.js';
import {createCloset,quoteCloset,CLOSET_DEFAULTS} from './closet-engine.js';
import {planCavity} from './cavity-engine.js';

// A clearly provisional fabrication OPTION. Unmeasured side cavity depth,
// side headroom and concrete accessibility must be measured before manufacture.
// All distances are mm; no cutting authorization is implied.
const round=n=>Math.round(n*10)/10;
export function planFullCloset(raw={}){
 const p={...CLOSET_DEFAULTS,...raw},c=planCavity(p),base=createCloset(p);
 if(base.issues.length||c.issues.length)return {issues:[...base.issues,...c.issues],params:p,base,cavity:c};
 const t=+p.thickness, depth=550,wingH=1940,sideInset=40;
 const proposed=[];const solids=[];
 function panel(id,name,qty,a,b,zone,note,kind='shelf'){
  proposed.push({id,name,quantity:qty,x:round(a),y:round(b),material:'melamina',edge:'F',group:zone,note,provisional:true});
 }
 const leftW=c.left-2*sideInset,rightW=c.right-2*sideInset;
 if(leftW<=150||rightW<=150)return {issues:['Los laterales no permiten los módulos provisionales.'],params:p,base,cavity:c};
 // Wing objects have no permanent front/doors: masonry covers their front face.
 // Access from central opening must be solved with verified hardware/geometry.
 for(const [side,width,x0] of [['izquierda',leftW,sideInset],['derecha',rightW,c.left+c.openingWidth+sideInset]]){
  const prefix=side==='izquierda'?'AI':'AD',bay=width-2*t;
  panel(prefix+'-01',`Costados módulo oculto ${side}`,2,wingH,depth,side,'Alto y fondo provisionales; validar maniobra y acceso.','upright');
  panel(prefix+'-02',`Entrepaños módulo oculto ${side}`,6,bay,depth,side,'Incluye base, tapa y 4 repisas; apoyo y acceso lateral por resolver.');
  for(const dx of [t/2,width-t/2])solids.push({x:x0+dx,y:wingH/2,z:c.openingDepth-depth/2-15,w:t,h:wingH,d:depth,role:'wing',zone:side});
  for(const yy of [t/2,350,730,1110,1490,wingH-t/2])solids.push({x:x0+width/2,y:yy,z:c.openingDepth-depth/2-15,w:bay,h:t,d:depth,role:'wing-shelf',zone:side});
 }
 // Short modular platforms above visible opening; not one untransportable board.
 const upperY=c.openingHeight+18;const upperDepth=500;
 // Existing central cabinet top is at 2020, opening top at 2050. Keep a reachable
 // shallow shelf above this line, contingent on masonry support and installation.
 for(const [code,name,width,x0] of [['TI','Altillo zona izquierda',leftW,sideInset],['TC','Altillo zona central',p.nicheWidth-2*p.sideClearance,c.left+p.sideClearance],['TD','Altillo zona derecha',rightW,c.left+c.openingWidth+sideInset]]){
  panel(code,`Bandeja superior ${name}`,1,width,upperDepth,'altillo','Sólo si la altura total realmente es 2280 mm; requiere soporte y acceso.');
  solids.push({x:x0+width/2,y:upperY,z:c.openingDepth-upperDepth/2-20,w:width,h:t,d:upperDepth,role:'altillo',zone:'superior'});
 }
 // Core from the existing approved opening-only design; center it inside opening.
 const coreX=c.left+p.sideClearance,coreY=p.bottomClearance,coreZ=c.openingDepth-p.depth;
 for(const s of base.solids)solids.push({x:s.x+coreX,y:s.y+coreY,z:s.z+coreZ,w:s.w,h:s.h,d:s.d,role:s.role,material:s.material,drawer:s.drawer,zone:'central'});
 const totalParts=[...base.parts.map(x=>({...x,group:'CENTRAL / '+x.group,provisional:false})),...proposed];
 const nested=layoutSheets(totalParts,p.boardWidth,p.boardHeight,p.kerf);
 const baseQuote=quoteCloset(p,base);
 const addedOnly=layoutSheets(proposed,p.boardWidth,p.boardHeight,p.kerf);
 const baseBoards=baseQuote.boardCount;
 const fullBoards=nested.sheets.length;
 const sheetPrice=Number(p.sheetPrice)||0;
 const materialPrice=fullBoards*sheetPrice;
 const extraUnits=proposed.reduce((s,x)=>s+x.quantity,0);
 const baseUnits=base.parts.filter(x=>x.material==='melamina').reduce((s,x)=>s+x.quantity,0);
 const edgeExtra=round(proposed.reduce((s,x)=>s+x.x*x.quantity,0)/1000);
 return {issues:[],params:p,base,cavity:c,proposed,allParts:totalParts,solids,nesting:nested,addedOnly,
  stats:{fullWidth:c.totalWidth,fullHeight:c.totalHeight,openingWidth:c.openingWidth,openingHeight:c.openingHeight,wingLeft:leftW,wingRight:rightW,wingHeight:wingH,wingDepth:depth,upperDepth,baseBoards,baseBoardCost:baseQuote.boardCost,fullBoards,fullBoardCost:materialPrice,additionalBoardsFromCombined:fullBoards-baseBoards,additionalBoardCost:materialPrice-baseQuote.boardCost,extraPieces:extraUnits,basePieces:baseUnits,edgeExtra,provisionalM2:round(proposed.reduce((s,x)=>s+x.x*x.y*x.quantity,0)/1e6),totalM2:round(totalParts.filter(x=>x.material==='melamina').reduce((s,x)=>s+x.x*x.y*x.quantity,0)/1e6)},
  warnings:['La altura total de 228 cm se interpreta de forma PROVISIONAL; confirmar si incluye la abertura de 205 cm.','Los fondos y alturas libres detrás de ambos laterales NO se han medido. Los módulos ocultos modelados a 55 cm de fondo y 194 cm de alto son hipótesis, NO piezas autorizadas.','El concreto frontal tapa 72 cm a la izquierda y 58.7 cm a la derecha. No fabricar módulos laterales hasta resolver cómo acceder e introducirlos por la abertura de 187 cm.','Las bandejas superiores requieren verificar resistencia del muro y acceso desde el frente.','El optimizador actual es un empacador de filas sin giro y no garantiza mínimo desperdicio ni dirección de veta. Validar cortes y margen de sierra con el proveedor.','No se incluyen el precio de herrajes, HDF, canteado, cortes ni instalación en el costo confirmado de tableros.']};
}
export function fullClosetCsv(plan){const rows=[['ID','Pieza','Cantidad','Largo mm','Ancho mm','Material','Canto','Zona','Estado','Notas'],...plan.allParts.map(p=>[p.id,p.name,p.quantity,p.x,p.y,p.material,p.edge,p.group,p.provisional?'PROVISIONAL - NO CORTAR':'MÓDULO CENTRAL - VALIDAR',p.note])];return '\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('\"','\"\"')+'"').join(';')).join('\r\n')}
export function fullClosetQuoteCsv(plan){const a=plan.stats;const rows=[['Concepto','Cantidad','Precio unidad MXN','Importe MXN','Estado'],['Melamina módulo visible (referencia anterior)',a.baseBoards,plan.params.sheetPrice,a.baseBoardCost,'Base validada sólo geométricamente'],['Tableros COMBINADOS tras nesting',a.fullBoards,plan.params.sheetPrice,a.fullBoardCost,'Propuesta completa preliminar'],['Diferencia contra módulo central',a.additionalBoardsFromCombined,plan.params.sheetPrice,a.additionalBoardCost,'Provisional'],['Piezas adicionales (alas + altillo)',a.extraPieces,'','', 'Por validar profundidad, acceso y fijación'],['Herrajes, fondos, cortes y armado','','','','Cotizar con el proveedor']];return '\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n')}
