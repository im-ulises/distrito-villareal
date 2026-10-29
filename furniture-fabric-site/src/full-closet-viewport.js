import {PRESETS} from './closet-engine.js';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const mix=(hex,k)=>{const n=parseInt(hex.slice(1),16),v=[(n>>16)&255,(n>>8)&255,n&255];return `rgb(${v.map(x=>Math.round(clamp(x*k,0,255))).join(',')})`};
function boxFaces(s,color,opacity=1){const {x,y,z,w,h,d}=s;const X=[x-w/2,x+w/2],Y=[y-h/2,y+h/2],Z=[z-d/2,z+d/2];const vs=[[X[0],Y[0],Z[0]],[X[1],Y[0],Z[0]],[X[1],Y[1],Z[0]],[X[0],Y[1],Z[0]],[X[0],Y[0],Z[1]],[X[1],Y[0],Z[1]],[X[1],Y[1],Z[1]],[X[0],Y[1],Z[1]]];return [{a:[4,5,6,7],k:1.04,n:[0,0,1]},{a:[1,0,3,2],k:.67,n:[0,0,-1]},{a:[5,1,2,6],k:.81,n:[1,0,0]},{a:[0,4,7,3],k:.91,n:[-1,0,0]},{a:[7,6,2,3],k:1.20,n:[0,1,0]},{a:[0,1,5,4],k:.57,n:[0,-1,0]}].map(f=>({pts:f.a.map(i=>vs[i]),normal:f.n,color:mix(color,f.k),opacity,role:s.role}))}
export class FullClosetViewport{
 constructor(canvas){this.canvas=canvas;this.azimuth=.28;this.elevation=.17;this.zoom=1;this.open=0;this.active='all';this.concrete=true;this.renderMode='furnished';this.d=null;this.drag=false;
  this.observer=new ResizeObserver(()=>this.draw());this.observer.observe(canvas);
  canvas.addEventListener('pointerdown',e=>{this.drag=true;this.sx=e.clientX;this.sy=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing'});
  canvas.addEventListener('pointermove',e=>{if(!this.drag)return;this.azimuth+=(e.clientX-this.sx)*.004;this.elevation=clamp(this.elevation+(e.clientY-this.sy)*.004,-.23,.85);this.sx=e.clientX;this.sy=e.clientY;this.draw()});
  for(const kind of ['pointerup','pointercancel'])canvas.addEventListener(kind,()=>{this.drag=false;canvas.style.cursor='grab'});
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom=clamp(this.zoom*(e.deltaY>0?.93:1.07),.55,2.2);this.draw()},{passive:false});
 }
 setDesign(d){this.d=d;this.draw()}
 reset(){this.azimuth=.28;this.elevation=.17;this.zoom=1;this.draw()}
 draw(){const canvas=this.canvas,w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h||!this.d||this.d.issues.length)return;const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);ctx.clearRect(0,0,w,h);
  const pl=this.d,cs=pl.cavity,p=pl.params,W=cs.totalWidth,H=cs.totalHeight||2280,D=cs.openingDepth;
  const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#fafaf8');bg.addColorStop(1,'#eef1ed');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(69,89,71,.055)';ctx.lineWidth=1;for(let a=0;a<w;a+=52){ctx.beginPath();ctx.moveTo(a,0);ctx.lineTo(a,h);ctx.stroke()}for(let a=0;a<h;a+=52){ctx.beginPath();ctx.moveTo(0,a);ctx.lineTo(w,a);ctx.stroke()}
  const palette=PRESETS[p.finish],base=Math.min(w/(W*1.25),h/(H*1.48))*this.zoom,focus=Math.max(W,H)*5;
  const project=point=>{let x=point[0]-W/2,y=point[1]-H/2,z=point[2]-D/2;let rx=Math.cos(this.azimuth)*x+Math.sin(this.azimuth)*z;let rz=-Math.sin(this.azimuth)*x+Math.cos(this.azimuth)*z;let ry=Math.cos(this.elevation)*y-Math.sin(this.elevation)*rz;let zz=Math.sin(this.elevation)*y+Math.cos(this.elevation)*rz;let perspective=focus/(focus-zz);return [w/2+rx*base*perspective,h*.55-ry*base*perspective,zz]};
  const parts=[];const ext=this.open*Math.min(p.slideLength*.82,390);
  for(const raw of pl.solids){if(raw.role==='back'&&this.renderMode==='structure')continue;const s={...raw};if(s.drawer!=null&&(this.active==='all'||Number(this.active)===s.drawer))s.z+=ext;
   let co=s.material==='hdf'?'#c7b497':s.role==='face'?palette.main:s.role==='rail'?'#747f7c':s.role==='wing'?'#bfa78a':s.role==='wing-shelf'?'#d8c1a2':s.role==='altillo'?'#d0a56b':s.role==='reinforcement'?palette.edge:palette.inside;
   parts.push(...boxFaces(s,co,s.role==='altillo'?.90:1));
  }
  // Nonmanufacturing hints for useful perception of size, no dimensions used in BOM.
  if(this.renderMode==='furnished'){
   const offset=cs.left+p.sideClearance;const ofD=cs.openingDepth-p.depth;
   for(let j=0;j<4;j++){
    let x=offset+40+j*106,y=1480+20*(j%2);parts.push(...boxFaces({x,y,z:ofD+340,w:78,h:420,d:150,role:'clothing'},['#c3b6a4','#475557','#d4c6b8','#798b86'][j],.96));
    x=offset+pl.base.stats.outerW-pl.base.stats.right-25+j*99;
    parts.push(...boxFaces({x,y,z:ofD+340,w:73,h:420,d:150,role:'clothing'},['#ded7c9','#525f63','#9c8876','#6b797c'][j],.96));
   }
  }
  // Concrete mask: left and right piers plus lintel across opening;
  // translucent so user understands the physical access restriction.
  if(this.concrete){const cz=D+30;
   for(const s of [{x:cs.left/2,y:cs.openingHeight/2,z:cz,w:cs.left,h:cs.openingHeight,d:80,role:'concrete'},
    {x:cs.left+cs.openingWidth+cs.right/2,y:cs.openingHeight/2,z:cz,w:cs.right,h:cs.openingHeight,d:80,role:'concrete'},
    {x:W/2,y:cs.openingHeight+(cs.top||230)/2,z:cz,w:W,h:cs.top||230,d:80,role:'concrete'}])parts.push(...boxFaces(s,'#a2aaa5',.24));
  }
  const eye=[-Math.sin(this.azimuth)*Math.cos(this.elevation),Math.sin(this.elevation),Math.cos(this.azimuth)*Math.cos(this.elevation)];
  const faces=parts.map(f=>{let coords=f.pts.map(project);return {...f,coords,depth:coords.reduce((sum,x)=>sum+x[2],0)/4}}).filter(f=>f.normal[0]*eye[0]+f.normal[1]*eye[1]+f.normal[2]*eye[2]>-.001).sort((a,b)=>a.depth-b.depth);
  ctx.lineJoin='round';for(const f of faces){ctx.beginPath();f.coords.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.globalAlpha=f.opacity;ctx.fillStyle=f.color;ctx.fill();ctx.lineWidth=f.role==='concrete'?1.35:.65;ctx.strokeStyle=f.role==='concrete'?'#647269':'rgba(50,48,44,.17)';ctx.stroke();}ctx.globalAlpha=1;
  const line=(a,b)=>{let x=project(a),y=project(b);ctx.beginPath();ctx.moveTo(x[0],x[1]);ctx.lineTo(y[0],y[1]);ctx.strokeStyle='#7c8b7e';ctx.lineWidth=1;ctx.stroke()};
  const txt=(a,s)=>{let q=project(a);ctx.fillStyle='#385a47';ctx.font='700 12px Arial,sans-serif';ctx.textAlign='center';ctx.fillText(s,q[0],q[1])};
  line([0,-85,D],[W,-85,D]);line([-85,0,D],[-85,H,D]);txt([W/2,-125,D],`${W} mm total`);txt([-115,H/2,D],`${H} mm alto`);
  ctx.textAlign='left';ctx.font='700 10px Arial,sans-serif';ctx.fillStyle='#7a847b';ctx.fillText('MODELO COMPLETO · ALAS Y ALTILLO PROVISIONALES',18,h-18);
 }
}
