import {FINISHES} from './engine.js';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const hexRgb=h=>{const v=parseInt(h.replace('#',''),16);return [(v>>16)&255,(v>>8)&255,v&255];};
const shade=(hex,k)=>{const arr=hexRgb(hex);return `rgb(${arr.map(v=>clamp(Math.round(v*k),0,255)).join(',')})`;};
function cuboid(cx,cy,cz,w,h,d,base,kind='body'){
 const X=[cx-w/2,cx+w/2],Y=[cy-h/2,cy+h/2],Z=[cz-d/2,cz+d/2];
 const v=[[X[0],Y[0],Z[0]],[X[1],Y[0],Z[0]],[X[1],Y[1],Z[0]],[X[0],Y[1],Z[0]],[X[0],Y[0],Z[1]],[X[1],Y[0],Z[1]],[X[1],Y[1],Z[1]],[X[0],Y[1],Z[1]]];
 const faces=[{ids:[4,5,6,7],k:1.06,n:[0,0,1]}, {ids:[1,0,3,2],k:.57,n:[0,0,-1]}, {ids:[5,1,2,6],k:.75,n:[1,0,0]}, {ids:[0,4,7,3],k:.88,n:[-1,0,0]}, {ids:[7,6,2,3],k:1.21,n:[0,1,0]}, {ids:[0,1,5,4],k:.60,n:[0,-1,0]}];
 return faces.map(f=>({vertices:f.ids.map(i=>v[i]),color:shade(base,f.k),normal:f.n,kind}));
}
export class FurnitureViewport{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.azimuth=.52;this.elevation=.28;this.zoom=1;this.open=0;this.exploded=false;this.design=null;this.drag=false;this.onChange=()=>{};
  this.resizeObserver=new ResizeObserver(()=>this.draw());this.resizeObserver.observe(canvas);
  canvas.addEventListener('pointerdown',e=>{this.drag=true;this.sx=e.clientX;this.sy=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.classList.add('grabbing');});
  canvas.addEventListener('pointermove',e=>{if(!this.drag)return;this.azimuth+=((e.clientX-this.sx)*.006);this.elevation=clamp(this.elevation+(e.clientY-this.sy)*.005,-.15,1.15);this.sx=e.clientX;this.sy=e.clientY;this.draw();});
  const stop=()=>{this.drag=false;canvas.classList.remove('grabbing')};canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom=clamp(this.zoom*(e.deltaY>0?.91:1.09),.48,2.2);this.draw()},{passive:false});
 }
 setDesign(d){this.design=d;this.draw();} setOpen(n){this.open=n;this.draw();} setExploded(e){this.exploded=e;this.draw();}
 reset(){this.azimuth=.52;this.elevation=.28;this.zoom=1;this.draw();}
 draw(){const canvas=this.canvas,c=canvas.getContext('2d'),w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
  const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);c.scale(dpr,dpr);c.clearRect(0,0,w,h);
  const line=(a,b,color='#dde0dc',width=1)=>{c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=color;c.lineWidth=width;c.stroke();};
  // Subtle architectural paper grid.
  c.save();for(let x=(w%34)/2;x<w;x+=34)line([x,0],[x,h],'rgba(20,35,33,.036)');for(let y=(h%34)/2;y<h;y+=34)line([0,y],[w,y],'rgba(20,35,33,.036)');c.restore();
  const d=this.design;if(!d||d.issues?.length)return;
  const p=d.params,t=+p.thickness,W=+p.width,H=+p.height,D=+p.depth;
  const size=Math.max(W,H,D);const focal=size*3.6;
  const base=Math.min(w/(W*1.8),h/(H*1.55))*this.zoom;
  const project=(xyz)=>{
   const [x,y,z]=xyz;let rx=Math.cos(this.azimuth)*x+Math.sin(this.azimuth)*z;
   let rz=-Math.sin(this.azimuth)*x+Math.cos(this.azimuth)*z;
   let ry=Math.cos(this.elevation)*y-Math.sin(this.elevation)*rz;
   let depth=Math.sin(this.elevation)*y+Math.cos(this.elevation)*rz;
   const ps=focal/(focal-depth);
   return [w*.50+rx*base*ps,h*.50-ry*base*ps,depth];
  };
  let faces=[];const wood=FINISHES[p.finish].hex;const ex=this.exploded?80:0;
  const put=(x,y,z,ww,hh,dd,color=wood,kind='body')=>{if(ww<=0||hh<=0||dd<=0)return;faces.push(...cuboid(x,y,z,ww,hh,dd,color,kind))};
  // Free-standing carcass, back applied on its exterior.
  put(-W/2+t/2-ex,0,p.back/2,t,H,D-p.back);
  put(W/2-t/2+ex,0,p.back/2,t,H,D-p.back);
  put(0,H/2-t/2+ex,p.back/2,W-2*t,t,D-p.back);
  put(0,-H/2+t/2-ex,p.back/2,W-2*t,t,D-p.back);
  put(0,0,-D/2+p.back/2,W,H,p.back,shade(wood,.77));
  const g=+p.gap,faceH=d.stats.faceH,faceW=d.stats.faceW;
  for(let i=0;i<p.drawers;i++){
   const cy=H/2-g-faceH/2-i*(faceH+g),forward=(this.open*(D*.65)),frontZ=D/2+t/2+forward+ex;
   if(this.open>.05 && p.hardware!=='premium'){
    const bw=d.stats.boxW,boxH=d.stats.boxH,bd=+p.slideLength;
    const bodyZ=D/2-t-bd/2+forward*.72;
    put(-bw/2+t/2,cy,bodyZ,t,boxH,bd,shade(wood,.89),'drawer');
    put(bw/2-t/2,cy,bodyZ,t,boxH,bd,shade(wood,.89),'drawer');
    put(0,cy,bodyZ-bd/2+t/2,bw-2*t,boxH,t,shade(wood,.8),'drawer');
    put(0,cy-boxH/2+3,bodyZ,bw,6,bd,'#c3ab8b','drawer');
   }
   put(0,cy,frontZ,faceW,faceH,t,wood,'front');
   if(p.handles!=='none'){
     put(0,cy,frontZ+t/2+6,Math.min(148,faceW*.22),7,12,p.finish==='grafito'?'#d0d3cf':'#323839','handle');
     put(-Math.min(148,faceW*.22)/2+14,cy,frontZ+t/2+1,7,10,14,'#4b5050','handle');
     put(Math.min(148,faceW*.22)/2-14,cy,frontZ+t/2+1,7,10,14,'#4b5050','handle');
   }
  }
  // Only draw faces pointing toward camera; painter ordering.
  const vy=-Math.sin(this.azimuth)*0+Math.cos(this.azimuth)*1;
  const frontDir=[Math.sin(this.azimuth)*Math.cos(this.elevation),Math.sin(this.elevation),Math.cos(this.azimuth)*Math.cos(this.elevation)];
  faces=faces.map(f=>{const pts=f.vertices.map(project);return {...f,pts,depth:pts.reduce((a,b)=>a+b[2],0)/pts.length};})
    .filter(f=>f.normal[0]*frontDir[0]+f.normal[1]*frontDir[1]+f.normal[2]*frontDir[2]>-.01).sort((a,b)=>a.depth-b.depth);
  c.lineJoin='round';for(const f of faces){c.beginPath();f.pts.forEach((pt,i)=>i?c.lineTo(pt[0],pt[1]):c.moveTo(pt[0],pt[1]));c.closePath();c.fillStyle=f.color;c.fill();c.strokeStyle=f.kind==='handle'?'rgba(0,0,0,.3)':'rgba(22,28,26,.14)';c.lineWidth=.75;c.stroke();}
  // Projection dimension annotations.
  const dim=(a,b,txt,offset)=>{const pa=project(a),pb=project(b),ox=offset[0],oy=offset[1];line([pa[0]+ox,pa[1]+oy],[pb[0]+ox,pb[1]+oy],'#83908a',1);line([pa[0],pa[1]],[pa[0]+ox*1.25,pa[1]+oy*1.25],'#b8c0ba');line([pb[0],pb[1]],[pb[0]+ox*1.25,pb[1]+oy*1.25],'#b8c0ba');c.font='600 11px Inter, sans-serif';c.textAlign='center';c.fillStyle='#626e69';c.fillText(txt,(pa[0]+pb[0])/2+ox,(pa[1]+pb[1])/2+oy-7);};
  dim([-W/2,-H/2,-D/2],[W/2,-H/2,-D/2],`${W} mm`,[0,38]);
  dim([-W/2,-H/2,-D/2],[-W/2,H/2,-D/2],`${H} mm`,[-48,0]);
  if(w>500)dim([W/2,-H/2,-D/2],[W/2,-H/2,D/2],`${D} mm`,[35,20]);
  c.textAlign='left';c.font='500 10px Inter,sans-serif';c.fillStyle='#89938d';c.fillText('MODELO PARAMÉTRICO · MM',20,h-18);
 }
}
