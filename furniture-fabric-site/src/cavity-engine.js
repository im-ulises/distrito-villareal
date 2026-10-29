// Envelope dimensions are user measurements, not approved shop dimensions.
// Hidden space is shown as potential storage, not automatically added to cut lists.
export const CAVITY_DEFAULTS=Object.freeze({hiddenLeft:720,hiddenRight:587,extraTop:null});
export const mm=v=>new Intl.NumberFormat('es-MX',{maximumFractionDigits:1}).format(v);
export function planCavity(raw={}){
 const openingWidth=Number(raw.nicheWidth??1870), openingHeight=Number(raw.nicheHeight??2050), openingDepth=Number(raw.nicheDepth??790);
 const left=Number(raw.hiddenLeft??CAVITY_DEFAULTS.hiddenLeft),right=Number(raw.hiddenRight??CAVITY_DEFAULTS.hiddenRight);
 const top=raw.extraTop==null||raw.extraTop===''?null:Number(raw.extraTop);
 const issues=[];
 if(!Number.isFinite(openingWidth)||openingWidth<500)issues.push('La abertura visible debe tener un ancho válido.');
 if(!Number.isFinite(openingHeight)||openingHeight<500)issues.push('La abertura visible debe tener una altura válida.');
 if(!Number.isFinite(openingDepth)||openingDepth<250)issues.push('Confirma el fondo de la abertura.');
 if(!Number.isFinite(left)||left<0||left>2500||!Number.isFinite(right)||right<0||right>2500)issues.push('Los anchos laterales deben ser positivos y medibles.');
 if(top!==null&&(!Number.isFinite(top)||top<0||top>2000))issues.push('La altura oculta superior no es válida.');
 const totalWidth=openingWidth+left+right;
 return {openingWidth,openingHeight,openingDepth,left,right,top,totalWidth,totalHeight:top===null?null:top+openingHeight,issues,measurementKnown:{openingWidth:true,openingHeight:true,openingDepth:true,left:true,right:true,top:top!==null},
  hypotheses:['El ancho total se interpreta en el mismo plano horizontal, sin sumar espesores del concreto.','Los volúmenes laterales se representan como reservas; profundidad lateral, altura libre y acceso deben verificarse.','No fabricar piezas de los laterales ni del altillo sin verificar las medidas, la ruta de montaje y la accesibilidad.']};
}
