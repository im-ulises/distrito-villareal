import {PRESETS} from './closet-engine.js';
const clamp=(a,b,c)=>Math.max(b,Math.min(c,a));
const rgb=h=>{const n=parseInt(h.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255]};
const shade=(hex,k)=>`rgb(${rgb(hex).map(n=>Math.round(clamp(n*k,0,255))).join(',')})`;
const cube=(cx,cy,cz,w,h,d,base,role)=>{
 const X=[cx-w/2,cx+w/2],Y=[cy-h/2,cy+h/2],Z=[cz-d/2,cz+d/2];
 const v=[[X[0],Y[0],Z[0]],[X[1],Y[0],Z[0]],[X[1],Y[1],Z[0]],[X[0],Y[1],Z[0]],[X[0],Y[0],Z[1]],[X[1],Y[0],Z[1]],[X[1],Y[1],Z[1]],[X[0],Y[1],Z[1]]];
 return [{i:[4,5,6,7],k:1.1,n:[0,0,1]},{i:[1,0,3,2],k:.62,n:[0,0,-1]},{i:[5,1,2,6],k:.77,n:[1,0,0]},{i:[0,4,7,3],k:.87,n:[-1,0,0]},{i:[7,6,2,3],k:1.20,n:[0,1,0]},{i:[0,1,5,4],k:.60,n:[0,-1,0]}].map(f=>({pts:f.i.map(j=>v[j]),normal:f.n,color:shade(base,f.k),role}));
};
export class ClosetViewport{
 constructor(canvas){this.canvas=canvas;this.azimuth=.34;this.elevation=.17;this.zoom=1;this.open=.0;this.active='all';this.d=null;this.renderMode='furnished';this.drag=false;
  this.observer=new ResizeObserver(()=>this.draw());this.observer.observe(canvas);
  canvas.onpointerdown=e=>{this.drag=true;this.sx=e.clientX;this.sy=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';};
  canvas.onpointermove=e=>{if(!this.drag)return;this.azimuth+=((e.clientX-this.sx)*.0045);this.elevation=clamp(this.elevation+(e.clientY-this.sy)*.004,-.10,.70);this.sx=e.clientX;this.sy=e.clientY;this.draw();};
  const up=()=>{this.drag=false;canvas.style.cursor='grab'};canvas.onpointerup=up;canvas.onpointercancel=up;
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom=clamp(this.zoom*(e.deltaY>0?.93:1.07),.55,1.7);this.draw()},{passive:false});
 }
 setDesign(d){this.d=d;this.draw()}
 reset(){this.azimuth=.34;this.elevation=.17;this.zoom=1;this.draw()}
 draw(){const {canvas}=this,w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=w*ratio;canvas.height=h*ratio;const c=canvas.getContext('2d');c.scale(ratio,ratio);c.clearRect(0,0,w,h);
  if(!this.d||this.d.issues.length)return;
  const d=this.d,p=d.params,st=d.stats,{outerW:W,outerH:H,outerD:D}=st;
  const palette=PRESETS[p.finish],base=Math.min(w/(W*1.48),h/(H*1.38))*this.zoom;
  const ext=this.open*Math.min(p.slideLength*.82,390),zp=ext*.21;
  const focal=Math.max(W,H,D)*5;
  const project=point=>{const x=point[0]-W/2,y=point[1]-H/2,z=point[2]-D/2-zp;
   const rx=Math.cos(this.azimuth)*x+Math.sin(this.azimuth)*z;
   const rz=-Math.sin(this.azimuth)*x+Math.cos(this.azimuth)*z;
   const ry=Math.cos(this.elevation)*y-Math.sin(this.elevation)*rz;
   const depth=Math.sin(this.elevation)*y+Math.cos(this.elevation)*rz;
   const perspective=focal/(focal-depth);return [w*.50+rx*base*perspective,h*.53-ry*base*perspective,depth]};
  // studio background and floor plane
  c.strokeStyle='#deded4';c.lineWidth=.7;for(let x=0;x<w;x+=42){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}for(let y=0;y<h;y+=42){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}
  let faces=[];const put=(x,y,z,ww,hh,dd,color,role='panel')=>{if(ww>0&&hh>0&&dd>0)faces.push(...cube(x,y,z,ww,hh,dd,color,role));};
  for(const panel of d.solids){if(panel.role==='back'&&this.renderMode==='structure')continue;
   const moving=panel.drawer!==null&&(this.active==='all'||Number(this.active)===panel.drawer)?ext:0;
   const color=panel.material==='hdf'?'#d2bd9f':panel.role==='face'?palette.main:panel.role==='rail'?'#777c79':panel.role==='plinth'?shade(palette.edge,.87):panel.role==='reinforcement'?palette.edge:palette.inside;
   put(panel.x,panel.y,panel.z+moving,panel.w,panel.h,panel.d,color,panel.role);
  }
  if(this.renderMode==='furnished'){
   const l=15, rightStart=W-p.thickness-st.right;
   const pieces=[
    [l+75,1388,345,86,480,175,'#e9e7de'],[l+172,1405,345,84,455,175,'#575d5e'],
    [l+268,1405,345,86,460,175,'#a48f7e'],[l+365,1390,345,76,495,175,'#c9c4b8'],
    [rightStart+78,1375,340,80,478,160,'#d9d8ce'],[rightStart+168,1390,340,77,450,160,'#424d52'],
    [rightStart+265,1390,340,85,455,160,'#a79984'],[rightStart+363,1402,340,70,445,160,'#d9d2c5'],
    [rightStart+85,640,345,78,455,150,'#555b65'],[rightStart+182,660,345,80,438,150,'#a99a88'],
    [rightStart+285,650,345,80,445,150,'#424d51'],[rightStart+380,653,345,68,444,150,'#dfdace']
   ];
   for(const [x,y,z,ww,hh,dd,co] of pieces)put(x,y,z,ww,hh,dd,co,'clothing');
   // folded stacks on four central shelves, deliberately visual-only, excluded from BOM
   for(let i=0;i<4;i++){const yy=st.shelfLevels[i]+15;
    for(let k=0;k<3;k++)for(let layer=0;layer<2;layer++)put(p.thickness+st.left+p.thickness+135+k*270,yy+22+layer*34,320,150,26,220,['#d6d0c5','#858b89','#b9a894'][(i+k)%3],'fabric');
   }
   for(let j=0;j<3;j++){const x=l+100+j*135;
    put(x,430,330,95,24,210,['#a99c88','#333b42','#e8e7dc'][j],'shoe');}
  }
  const dir=[-Math.sin(this.azimuth)*Math.cos(this.elevation),Math.sin(this.elevation),Math.cos(this.azimuth)*Math.cos(this.elevation)];
  faces=faces.map(f=>{const pts=f.pts.map(project);return {...f,pts,depth:pts.reduce((a,b)=>a+b[2],0)/4}}).filter(f=>f.normal[0]*dir[0]+f.normal[1]*dir[1]+f.normal[2]*dir[2]>-.001).sort((a,b)=>a.depth-b.depth);
  c.lineJoin='round';for(const f of faces){c.beginPath();f.pts.forEach((pt,i)=>i?c.lineTo(pt[0],pt[1]):c.moveTo(pt[0],pt[1]));c.closePath();c.fillStyle=f.color;c.fill();c.strokeStyle=['clothing','fabric','shoe'].includes(f.role)?'rgba(0,0,0,.08)':'rgba(24,24,22,.15)';c.lineWidth=.65;c.stroke();}
  // Front dimension lines and callouts (all from calculated model)
  const line=(a,b)=>{const q=project(a),r=project(b);c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(r[0],r[1]);c.strokeStyle='#7a827a';c.lineWidth=1;c.stroke()};
  line([0,-70,D],[W,-70,D]);line([-68,0,D],[-68,H,D]);
  const label=(pt,str)=>{const q=project(pt);c.font='600 12px Inter,Arial,sans-serif';c.textAlign='center';c.fillStyle='#4c554e';c.fillText(str,q[0],q[1]);};
  label([W/2,-95,D],`${W} mm`);label([-98,H/2,D],`${H} mm`);
  c.font='500 10px Inter,Arial,sans-serif';c.textAlign='left';c.fillStyle='#727e76';c.fillText('MODELO ESPACIAL • PRELIMINAR',20,h-20);
 }
}
