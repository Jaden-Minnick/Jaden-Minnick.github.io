(()=>{'use strict';
const overlay=document.getElementById('cinematic-intro');
const cv=document.getElementById('cinematic-canvas');
const skip=document.getElementById('skip-cinematic');
const replay=document.getElementById('replay-cinematic');
const progress=document.getElementById('cinematic-progress-fill');
const playPause=document.getElementById('cinematic-play-pause');
const scrubber=document.getElementById('cinematic-scrubber');
const timeReadout=document.getElementById('cinematic-time');
if(!overlay||!cv||!skip||!progress||!playPause||!scrubber||!timeReadout)return;
const cx=cv.getContext('2d',{alpha:false});if(!cx)return;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let W=0,H=0,dpr=1,active=false,leaving=false,raf=0,lastFocus=null,finishTimer=0,currentMs=0,lastNow=0,paused=false,wasPlayingBeforeScrub=false;
const TOTAL=12000;
const TAU=Math.PI*2;let seed=1049;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}const stars=Array.from({length:170},()=>({x:rand(),y:rand(),r:rand()*1.3+.3,a:rand()*.5+.15}));const ions=Array.from({length:63},(_,i)=>({x:(rand()-.5)*5,y:(rand()-.5)*3.3,z:(rand()-.5)*4.7,phase:rand()*TAU,sz:i%5===0?1:0,rv:.25+rand()*.9}));function resize(){dpr=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cx.setTransform(dpr,0,0,dpr,0,0)}const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,t)=>{let u=clamp((t-a)/(b-a),0,1);return u*u*(3-2*u)};function rgba(rgb,alpha){return `rgba(${rgb},${alpha})`}function background(t){cx.fillStyle='#07111e';cx.fillRect(0,0,W,H);let gx=W*.5+Math.sin(t*.25)*W*.12,gy=H*.47;let g=cx.createRadialGradient(gx,gy,0,gx,gy,Math.max(W,H)*.75);g.addColorStop(0,t>4.6&&t<7.6?'#18213e':t>7.3?'#261a1c':'#182338');g.addColorStop(.47,'#0a1422');g.addColorStop(1,'#030811');cx.fillStyle=g;cx.fillRect(0,0,W,H);for(const s of stars){cx.globalAlpha=s.a*(.85+.15*Math.sin(t+s.x*20));cx.fillStyle='#9cbfdd';cx.fillRect(s.x*W,s.y*H,s.r,s.r)}cx.globalAlpha=1;const cx0=W/2,cy0=H/2;let gg=cx.createLinearGradient(0,cy0,W,cy0);gg.addColorStop(0,'#16365100');gg.addColorStop(.5,'#486a8040');gg.addColorStop(1,'#16365100');cx.fillStyle=gg;cx.fillRect(0,cy0-1,W,2)}function point(p,rot=0,scale=1){const cy=Math.cos(rot),sy=Math.sin(rot),cyx=Math.cos(-.2),syx=Math.sin(-.2);let x=p[0]*cy-p[2]*sy,z=p[0]*sy+p[2]*cy,y=p[1]*cyx-z*syx;z=p[1]*syx+z*cyx;let f=5.8/(5.8+z*.4);return {x:W/2+x*scale*f,y:H*.48-y*scale*f,z,f}}function sphere(x,y,r,color,glow=.35){if(r<.15)return;cx.save();cx.shadowColor=color;cx.shadowBlur=r*glow;const g=cx.createRadialGradient(x-r*.35,y-r*.42,r*.05,x,y,r);g.addColorStop(0,'#fff8');g.addColorStop(.23,color);g.addColorStop(.72,color);g.addColorStop(1,'#070b13');cx.fillStyle=g;cx.beginPath();cx.arc(x,y,r,0,TAU);cx.fill();cx.shadowBlur=0;cx.strokeStyle='#ffffff18';cx.lineWidth=Math.max(.4,r*.05);cx.stroke();cx.restore()}function line(a,b,col='#84d1ff',alpha=.6,width=1){cx.strokeStyle=col;cx.globalAlpha=alpha;cx.lineWidth=width;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke();cx.globalAlpha=1}function bloom(x,y,r,color,alpha=.9){let g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(color,alpha));g.addColorStop(.12,rgba(color,alpha*.6));g.addColorStop(1,rgba(color,0));cx.fillStyle=g;cx.fillRect(x-r,y-r,2*r,2*r)}function ring(x,y,rx,ry,angle,color,opacity=.7,thick=2){cx.save();cx.translate(x,y);cx.rotate(angle);cx.strokeStyle=color;cx.globalAlpha=opacity;cx.lineWidth=thick;cx.beginPath();cx.ellipse(0,0,rx,ry,0,0,TAU);cx.stroke();cx.restore();cx.globalAlpha=1}function nucleonCluster(x,y,R,t,n=50){let balls=[];for(let i=0;i<n;i++){let rr=Math.sqrt((i+.5)/n),a=i*2.39996+t*.21,yy=Math.cos(a)*rr,xx=Math.sin(a)*rr,z=Math.sin(i*17.3);balls.push({x:x+xx*R*.79+z*R*.08,y:y+yy*R*.79,r:mix(R*.12,R*.19,clamp((z+1)/2,0,1)),z,c:i%3===0?'#7dace0':i%3===1?'#cf4c50':'#c9cedc'})}balls.sort((a,b)=>a.z-b.z);for(let b of balls)sphere(b.x,b.y,b.r,b.c,.06)}function neutron(x,y,r=6){bloom(x,y,r*5,'125,193,255',.28);sphere(x,y,r,'#9bc9f4',.18)}function sceneFission(t){let q=smooth(.55,1.15,t),r=Math.min(W,H)*.19;let x=W*.5,y=H*.47;let inx=mix(-90,x-r*.42,smooth(0,.8,t)),iny=y+Math.sin(t*2)*6;neutron(inx,iny,Math.max(4,r*.075));if(t<.95)nucleonCluster(x,y,r,t,66);else{let d=smooth(.9,1.55,t)*r*1.6;nucleonCluster(x-d*.55,y-d*.2,r*.69,t,39);nucleonCluster(x+d*.6,y+d*.24,r*.53,t,29);bloom(x,y,r*2,'255,149,64',(1-smooth(1,1.8,t))*.9);for(let i=0;i<3;i++){let a=-.7+i*1.3,dist=(t-.95)*W*.45;neutron(x+Math.cos(a)*dist,y+Math.sin(a)*dist,4.5)}}if(t>.7&&t<1.6){bloom(x,y,r*1.4,'255,237,177',Math.sin(Math.PI*smooth(.7,1.6,t))*.55)} }function sceneChain(t){let q=smooth(2,3.5,t),S=Math.min(W,H),sep=S*(.23+q*.09),n=10;for(let i=0;i<n;i++){let k=i+1,layer=Math.ceil(Math.sqrt(k)),a=k*2.3999;let px=W/2+Math.cos(a)*sep*Math.sqrt(k)/3.3,py=H*.48+Math.sin(a)*sep*Math.sqrt(k)/3.3;let active=smooth(i*.12, i*.12+.22,t-2),h=(Math.sin(t*7-i)*.5+.5)*active;let size=(1-q*.5)*S*.082;nucleonCluster(px,py,size,t+i,18);if(active>.05){bloom(px,py,S*.15,'255,134,65',h*.38);for(let j=0;j<2;j++){let a2=a+j*.8,dd=S*.18*active;line({x:px,y:py},{x:px+Math.cos(a2)*dd,y:py+Math.sin(a2)*dd},'#ffa768',h*.6,1.1)}}}for(let i=0;i<16;i++){let a=i*2.4;let d=(t-2)*S*.4+i*7;neutron(W/2+Math.cos(a)*d,H*.48+Math.sin(a)*d,2.8)}}function wireCylinder(cx0,cy0,r,h,rot,glow){let S=Math.min(W,H),pieces=38;let at=(a,y)=>point([Math.cos(a)*r,y,Math.sin(a)*r],rot,S*.27);for(let side of [-h/2,h/2])for(let i=0;i<pieces;i++){let a=i*TAU/pieces,b=(i+1)*TAU/pieces;let p=at(a,side),q=at(b,side);line(p,q,glow,.38,2)}for(let i=0;i<18;i++){let a=i*TAU/18;line(at(a,-h/2),at(a,h/2),glow,.24,2.2)} }function sceneReactor(t){
 const s=Math.min(W/5.7,H/5.9), ox=W*.5,oy=H*.485;
 cx.save();cx.translate(ox,oy);cx.scale(s,s);cx.lineJoin='round';cx.lineCap='round';
 function stroke(path,c,w=0.025,a=1){cx.save();cx.strokeStyle=c;cx.lineWidth=w;cx.globalAlpha=a;cx.stroke(path);cx.restore()}
 function fill(path,c,a=1){cx.save();cx.fillStyle=c;cx.globalAlpha=a;cx.fill(path);cx.restore()}
 function line2(x1,y1,x2,y2,c,w=.025,a=1){cx.save();cx.strokeStyle=c;cx.lineWidth=w;cx.globalAlpha=a;cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke();cx.restore()}
 function capsule(x,y,w,h,r){let p=new Path2D();p.roundRect(x,y,w,h,r);return p}
 const shell=new Path2D();shell.moveTo(-1.55,-1.65);shell.bezierCurveTo(-1.63,-2.14,-1.18,-2.37,-.76,-2.39);shell.lineTo(.76,-2.39);shell.bezierCurveTo(1.18,-2.37,1.63,-2.14,1.55,-1.65);shell.lineTo(1.55,1.49);shell.bezierCurveTo(1.54,2.28,.75,2.48,0,2.49);shell.bezierCurveTo(-.75,2.48,-1.54,2.28,-1.55,1.49);shell.closePath();
 let metal=cx.createLinearGradient(-1.6,0,1.6,0);metal.addColorStop(0,'#4d6176');metal.addColorStop(.16,'#9eafc1');metal.addColorStop(.38,'#46586b');metal.addColorStop(.76,'#b0c0cb');metal.addColorStop(1,'#526578');fill(shell,metal,.55);stroke(shell,'#c6d4e0',.055,.76);
 let inside=new Path2D();inside.moveTo(-1.29,-1.53);inside.bezierCurveTo(-1.27,-1.87,-1.0,-2.03,-.72,-2.07);inside.lineTo(.72,-2.07);inside.bezierCurveTo(1.0,-2.03,1.27,-1.87,1.29,-1.53);inside.lineTo(1.29,1.42);inside.bezierCurveTo(1.25,2.05,.7,2.23,0,2.23);inside.bezierCurveTo(-.7,2.23,-1.25,2.05,-1.29,1.42);inside.closePath();fill(inside,'#07131f',.91);stroke(inside,'#c1d4de',.026,.58);
 // vessel ribs, internal downcomer and core barrel
 for(let x of [-1.2,1.2]){line2(x,-1.48,x,1.57,'#99abb9',.065,.3);line2(x*.91,-1.18,x*.91,1.48,'#7a91a6',.035,.4)}
 fill(capsule(-.98,-.95,1.96,2.20,.16),'#1a2e40',.62);stroke(capsule(-.98,-.95,1.96,2.20,.16),'#97aabc',.043,.6);
 // fuel assemblies in the central core with lower red/orange active region
 for(let j=-7;j<=7;j++){
  let x=j*.111,shade=Math.cos(j*.41);
  line2(x,-.86,x,1.16,'#7593ae',.035,.75);
  line2(x,-.20,x,.97,shade>.5?'#eb8864':'#a9534b',.073,.76);
  line2(x,-.16,x,.94,'#ffb481',.012,.30);
 }
 for(let y of [-.93,-.35,.30,.98,1.24]){
  let plate=capsule(-1.01,y,2.02,.115,.025);fill(plate,'#8598a8',.78);stroke(plate,'#d9e5ed',.018,.65);
  for(let i=-7;i<=7;i++)fill(capsule(i*.111-.014,y+.020,.028,.068,.008),'#17283a',.85);
 }
 // upper guide tubes and control rods descending from head
 for(let j=-5;j<=5;j++){
   let x=j*.15;
   line2(x,-2.65,x,-.96,'#657f94',.055,.8);
   line2(x+.015,-2.65,x+.015,-1.05,'#ebeff0',.012,.60);
   fill(capsule(x-.042,-2.75,.084,.22,.02),'#aebbc8',.87);
 }
 // upper head flange and vessel bolting
 fill(capsule(-1.68,-1.70,3.36,.25,.04),'#899dab',.93);
 line2(-1.67,-1.56,1.67,-1.56,'#e7edf2',.019,.65);
 for(let i=-8;i<=8;i++)fill(capsule(i*.187-.025,-1.83,.05,.125,.012),'#aab9c4',.85);
 // curved nozzles and flanged inlet/outlet
 for(let dir of [-1,1]){
   fill(capsule(dir<0?-2.25:1.48,-.56,.80,.52,.13),'#596c7c',.92);
   fill(capsule(dir<0?-2.34:2.19,-.68,.18,.75,.06),'#9eafb9',.94);
   line2(dir*1.65,-.48,dir*2.18,-.48,'#d3e1ec',.05,.67);
   line2(dir*1.65,-.16,dir*2.18,-.16,'#64798f',.04,.70);
   fill(capsule(dir<0?-2.32:2.21,-.35,.14,.14,.04),'#1e3244',.6);
 }
 // lower hemisphere and support/base
 stroke(shell,'#d9e6ef',.025,.45);
 fill(capsule(-.92,2.39,.36,.18,.03),'#5b7284',.88);
 fill(capsule(.56,2.39,.36,.18,.03),'#5b7284',.88);
 // soft neutron activation glow from core and a few light sweeps
 let gl=cx.createRadialGradient(0,.2,.04,0,.2,1.3);gl.addColorStop(0,'rgba(108,187,253,.21)');gl.addColorStop(1,'rgba(108,187,253,0)');fill(capsule(-1.2,-.96,2.4,2.28,.13),gl,.8);
 
 // Rounded inlet and outlet nozzles, with metallic shading and flanges.
 for(const side of [-1,1]){
   const nx=side*1.54;
   let nozzle=cx.createLinearGradient(nx,0,nx+side*.74,0);
   nozzle.addColorStop(0,'#7f92a5');nozzle.addColorStop(.32,'#dae6ef');nozzle.addColorStop(.65,'#465b70');nozzle.addColorStop(1,'#a8b8c6');
   cx.fillStyle=nozzle;
   cx.beginPath();cx.moveTo(nx,-.35);cx.bezierCurveTo(nx+side*.15,-.38,nx+side*.26,-.30,nx+side*.33,-.28);
   cx.lineTo(nx+side*.67,-.28);cx.lineTo(nx+side*.67,.30);cx.lineTo(nx+side*.33,.30);
   cx.bezierCurveTo(nx+side*.16,.32,nx+.02*side,.36,nx,.34);cx.closePath();cx.fill();
   cx.strokeStyle='#d5e0ea';cx.lineWidth=.030;cx.globalAlpha=.72;cx.stroke();cx.globalAlpha=1;
   cx.strokeStyle='#c5d4df';cx.lineWidth=.095;cx.beginPath();cx.ellipse(nx+side*.69,.01,.09,.33,0,0,TAU);cx.stroke();
   cx.strokeStyle='#4e667b';cx.lineWidth=.025;cx.beginPath();cx.ellipse(nx+side*.69,.01,.065,.24,0,0,TAU);cx.stroke();
   for(let k=0;k<8;k++){let a=k*TAU/8;cx.fillStyle='#d6e2ec';cx.beginPath();cx.arc(nx+side*.69+.09*Math.cos(a),.01+.29*Math.sin(a),.017,0,TAU);cx.fill()}
 }
 // Mechanical detail on the vessel head, control rod drive housings.
 for(let i=-4;i<=4;i++){
   let x=i*.28;
   let g=cx.createLinearGradient(x-.045,-2.62,x+.045,-2.62);g.addColorStop(0,'#71849b');g.addColorStop(.5,'#e1e9ef');g.addColorStop(1,'#6b7e92');
   cx.fillStyle=g;cx.fillRect(x-.034,-2.68,.068,.45);
   cx.fillStyle='#9aabb9';cx.fillRect(x-.075,-2.27,.15,.07);
   cx.fillStyle='#cdd8e3';cx.beginPath();cx.ellipse(x,-2.69,.043,.035,0,0,TAU);cx.fill();
 }
 // Fuel bundle spacers and coolant motion, retained inside the barrel.
 for(let y of [.05,.49,.93,1.35]){
   cx.strokeStyle='rgba(181,207,227,.30)';cx.lineWidth=.036;cx.beginPath();cx.moveTo(-.87,y);cx.lineTo(.87,y);cx.stroke();
   for(let k=-4;k<=4;k++){
     let x=k*.2;cx.fillStyle='rgba(176,203,220,.38)';cx.fillRect(x-.018,y-.043,.036,.086)
   }
 }
 for(let i=0;i<37;i++){
   let x=((i*41)%97)/97*1.82-.91;
   let phase=((i*.177+t*.34)%1),y=1.46-phase*1.95;
   cx.fillStyle=`rgba(115,203,249,${.12+.30*Math.sin(Math.PI*phase)})`;
   cx.beginPath();cx.ellipse(x,y,.011,.055,0,0,TAU);cx.fill();
 }
 // Edge light catches on domed vessel, subtle to preserve readable cutaway.
 cx.strokeStyle='rgba(242,250,255,.19)';cx.lineWidth=.043;cx.beginPath();cx.moveTo(-1.5,-1.42);cx.bezierCurveTo(-1.57,-2.1,-1.13,-2.3,-.73,-2.34);cx.stroke();
 cx.strokeStyle='rgba(20,29,41,.45)';cx.lineWidth=.055;cx.beginPath();cx.moveTo(1.5,-1.4);cx.lineTo(1.5,1.44);cx.stroke();

 cx.restore();
}function sceneFusion(t){let S=Math.min(W,H),u=smooth(4.85,5.65,t),x=W*.5,y=H*.48,sep=(1-u)*S*.34;for(let i=0;i<10;i++){let a=i*TAU/10+t*.9;ring(x,y,S*(.15+i*.014),S*(.13+i*.004),a*.1,'#7a7cfa',.07+i*.009,1.5)}nucleonCluster(x-sep,y,Math.max(10,S*.075),t,4);nucleonCluster(x+sep,y,Math.max(10,S*.075),t+3,6);bloom(x,y,S*.38,'143,159,255',u*.5);if(u>.9){bloom(x,y,S*.24,'243,235,255',.65*(1-smooth(5.8,6,t)));let p=point([(t-5.7)*4.5,0,0],.2,S*.22);neutron(p.x,p.y,5)}}function sceneTokamak(t){
 const s=Math.min(W/7.0,H/5.65),cx0=W*.5,cy0=H*.49;
 cx.save();cx.translate(cx0,cy0);cx.scale(s,s);cx.lineJoin='round';cx.lineCap='round';
 function ellipse(x,y,rx,ry,color,width=.035,alpha=1,start=0,end=TAU){cx.save();cx.globalAlpha=alpha;cx.strokeStyle=color;cx.lineWidth=width;cx.beginPath();cx.ellipse(x,y,rx,ry,0,start,end);cx.stroke();cx.restore()}
 function strokeCurve(points,color,width,alpha=1){cx.save();cx.strokeStyle=color;cx.lineWidth=width;cx.globalAlpha=alpha;cx.beginPath();cx.moveTo(...points[0]);for(let i=1;i<points.length;i++)cx.lineTo(...points[i]);cx.stroke();cx.restore()}
 // Cutaway tokamak: a recessed vacuum vessel, with its near-facing sector removed.
 // Rear half of the metallic chamber and toroidal field coils.
 ellipse(0,.03,2.31,.91,'#45556b',.34,.38);
 ellipse(0,.07,2.12,.76,'#a6bacf',.10,.48);
 for(let i=0;i<17;i++){
   let a=Math.PI+(i/16)*Math.PI,x=Math.cos(a)*2.22,dep=Math.sin(a);
   cx.save();cx.lineWidth=.13;cx.strokeStyle='#5c8ca8';cx.globalAlpha=.26;
   cx.beginPath();cx.moveTo(x-.12,1.38);
   cx.bezierCurveTo(x-.48,.74,x-.48,-.88,x-.12,-1.39);
   cx.quadraticCurveTo(x,-1.58,x+.12,-1.39);
   cx.bezierCurveTo(x+.48,-.88,x+.48,.74,x+.12,1.38);
   cx.stroke();cx.restore();
 }
 // Central solenoid stays visible from top to bottom.
 let g=cx.createLinearGradient(-.36,0,.36,0);g.addColorStop(0,'#243e48');g.addColorStop(.30,'#7ca8a9');g.addColorStop(.56,'#a4c8b6');g.addColorStop(1,'#385967');
 cx.fillStyle=g;cx.beginPath();cx.roundRect(-.29,-1.74,.58,3.38,.09);cx.fill();
 cx.strokeStyle='#bad8cd';cx.lineWidth=.035;cx.stroke();
 for(let y=-1.63;y<1.55;y+=.17)strokeCurve([[-.27,y],[.27,y]],'#c4ded4',.027,.56);
 // Inner chamber and plasma cavity, still visibly open to the viewer.
 ellipse(0,.07,1.87,.68,'#8093b2',.40,.28);
 ellipse(0,.09,1.95,.60,'#bc9cda',.30,.27);
 let pg=cx.createRadialGradient(0,.11,.14,0,.1,2.3);
 pg.addColorStop(0,'rgba(191,120,255,.06)');pg.addColorStop(.55,'rgba(243,134,214,.20)');pg.addColorStop(1,'rgba(100,122,230,0)');
 cx.fillStyle=pg;cx.fillRect(-2.6,-1.4,5.2,2.8);
 ellipse(0,.10,1.88,.56,'#d89aef',.24,.68);
 ellipse(0,.10,1.90,.56,'#ffd3f7',.048,.80);
 ellipse(0,.10,1.63,.38,'#bca0ff',.10,.49);
 for(let k=0;k<8;k++){
   let pts=[];for(let i=0;i<=180;i++){
     const a=i*TAU/180+t*.20+k*.28,w=.04*Math.sin(a*12+t*2.2+k);
     pts.push([(1.77+w)*Math.cos(a),.10+(.52+w)*Math.sin(a)]);
   }
   strokeCurve(pts,k%2?'#81bafa':'#f9b8f7',.019,.37);
 }
 // Outer poloidal field coils, split at the FRONT so the assembly looks sectioned.
 ellipse(0,-1.49,2.53,.23,'#a58b99',.13,.57,Math.PI+.13,TAU-.13);
 ellipse(0,1.49,2.53,.23,'#a58b99',.13,.57,.14,Math.PI-.14);
 // Recessed D-shaped toroidal coils only on the left and right side.
 for(let side of [-1,1])for(let j=0;j<5;j++){
   const x=side*(1.45+j*.19),h=1.37+(j%2)*.05;
   cx.save();cx.globalAlpha=.52+j*.04;cx.strokeStyle='#68a9ca';cx.lineWidth=.085;
   cx.beginPath();cx.moveTo(x-side*.08,h);
   cx.bezierCurveTo(x-side*.36,h*.78,x-side*.37,-h*.75,x-side*.07,-h);
   cx.quadraticCurveTo(x,-h*1.14,x+side*.07,-h);
   cx.bezierCurveTo(x+side*.32,-h*.76,x+side*.32,h*.75,x+side*.09,h);
   cx.stroke();cx.restore();
 }
 // Distinct cut faces at the open front of the vacuum vessel.
 for(let side of [-1,1]){
   const x=side*2.12;
   cx.save();cx.translate(x,.12);cx.rotate(side*.17);
   const metal=cx.createLinearGradient(-.16,0,.16,0);
   metal.addColorStop(0,'#263b4e');metal.addColorStop(.38,'#90aabc');metal.addColorStop(.72,'#d0dbe4');metal.addColorStop(1,'#3b5369');
   cx.fillStyle=metal;cx.strokeStyle='#b4cfde';cx.lineWidth=.048;
   cx.beginPath();cx.roundRect(-.16,-.78,.32,1.57,.1);cx.fill();cx.stroke();
   cx.strokeStyle='#223648';cx.lineWidth=.045;
   cx.beginPath();cx.moveTo(-.095,-.69);cx.lineTo(-.095,.70);cx.stroke();cx.restore();
 }
 // A few isolated front-side coil segments only along the outer edges,
 // never crossing or closing the central viewing window.
 for(let side of [-1,1]){
   cx.save();cx.strokeStyle='rgba(38,78,109,.79)';cx.lineWidth=.20;
   cx.beginPath();cx.moveTo(side*2.05,1.30);
   cx.bezierCurveTo(side*2.63,.78,side*2.61,-.79,side*2.06,-1.33);cx.stroke();
   cx.strokeStyle='rgba(153,214,235,.63)';cx.lineWidth=.067;cx.stroke();cx.restore();
 }
 // Visible magnetic-field and plasma current traces in the open window.
 for(let lane=0;lane<4;lane++){
   cx.save();cx.strokeStyle=lane===1?'rgba(253,205,245,.69)':'rgba(127,181,255,.42)';
   cx.lineWidth=.021+lane*.003;cx.shadowBlur=.09;
   cx.shadowColor=lane===1?'#f3abf4':'#8fbaff';cx.beginPath();
   for(let i=0;i<=200;i++){
     const a=i*TAU/200+t*.32+lane*.7;
     const x=(1.80+.045*Math.sin(a*9+t*2+lane))*Math.cos(a);
     const y=.11+(.54+.035*Math.cos(a*6-t+lane))*Math.sin(a);
     if(i===0)cx.moveTo(x,y);else cx.lineTo(x,y);
   }cx.stroke();cx.restore();
 }
 // Small plasma highlights remain inside the cutaway.
 for(let i=0;i<30;i++){
   const a=i*TAU/30+t*.47,x=1.77*Math.cos(a),y=.1+.53*Math.sin(a);
   cx.fillStyle=i%4===0?'#ffd7fb':'#98c2ff';cx.globalAlpha=.42;
   cx.beginPath();cx.arc(x,y,i%5===0?.031:.013,0,TAU);cx.fill();
 }cx.globalAlpha=1;
 cx.restore();
}function sceneSalt(t){
 const s=Math.min(W/10.6,H/5.7),cx0=W*.5,cy0=H*.48;
 cx.save();cx.translate(cx0,cy0);cx.scale(s,s);cx.lineCap='round';cx.lineJoin='round';
 function line2(x1,y1,x2,y2,color,width=.035,a=1){cx.save();cx.strokeStyle=color;cx.lineWidth=width;cx.globalAlpha=a;cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke();cx.restore()}
 function path(points){let p=new Path2D();p.moveTo(...points[0]);for(let i=1;i<points.length;i++){let a=points[i];if(a.length===2)p.lineTo(...a);else if(a.length===4)p.quadraticCurveTo(...a);else if(a.length===6)p.bezierCurveTo(...a)}return p}
 function pipe(points,col='#f6a23a',width=.165){let p=path(points);cx.save();cx.strokeStyle='#526372';cx.lineWidth=width+.09;cx.stroke(p);cx.strokeStyle='#b8c2ca';cx.lineWidth=width+.04;cx.stroke(p);cx.strokeStyle=col;cx.lineWidth=width;cx.shadowColor=col;cx.shadowBlur=.12;cx.stroke(p);cx.shadowBlur=0;cx.strokeStyle='#ffe6aa';cx.lineWidth=.025;cx.globalAlpha=.6;cx.stroke(p);cx.restore()}
 // cutaway reactor vessel on the left
 let vessel=path([[-4.45,-1.36],[-4.45,1.56],[-4.25,1.90,-3.76,2.01],[-3.25,1.96,-3.01,1.52],[-3.01,-1.36]]);
 cx.fillStyle='#303c48';cx.fill(vessel);cx.strokeStyle='#b9c5d0';cx.lineWidth=.075;cx.stroke(vessel);
 let inner=path([[-4.25,-1.19],[-4.25,1.43],[-4.06,1.68,-3.76,1.69],[-3.48,1.64,-3.24,1.42],[-3.24,-1.19]]);
 cx.fillStyle='#6b3f20';cx.fill(inner);cx.strokeStyle='#e0a56a';cx.lineWidth=.035;cx.stroke(inner);
 // fuel salt flowing through core, orange and amber
 let rg=cx.createLinearGradient(-4.2,0,-3.27,0);rg.addColorStop(0,'#c46726');rg.addColorStop(.48,'#ffc263');rg.addColorStop(1,'#dd7b30');cx.fillStyle=rg;cx.fill(inner);
 cx.fillStyle='#1b2733';cx.fillRect(-4.08,-.42,.69,1.63);
 cx.strokeStyle='#596e80';cx.lineWidth=.032;cx.strokeRect(-4.08,-.42,.69,1.63);
 for(let x=-4.03;x<-3.4;x+=.13){line2(x,-.39,x,1.14,'#a8aeb0',.040,.73)}
 for(let i=0;i<18;i++){
  let x=-4.15+(i%6)*.18,y=-.88+Math.floor(i/6)*.18+.05*Math.sin(t*2+i);
  sphere(cx0+x*s,cy0+y*s,s*.022,'#ffd88a',1.0);
 }
 // upper cover, nozzle details and pumps
 line2(-4.53,-1.35,-2.95,-1.35,'#c4cdd5',.16,.83);
 for(let x of [-4.19,-3.73,-3.28]){
  cx.fillStyle='#88929b';cx.fillRect(x-.17,-1.76,.34,.38);
  line2(x,-1.76,x,-2.07,'#a5b7c5',.045,.8);
 }
 // salt pipes, two paths feeding external heat exchanger
 pipe([[-3.03,-1.11],[-2.34,-1.11],[-2.06,-1.11,-2.06,-.84],[-2.06,-.35],[-1.77,-.02,-1.44,-.02],[-.4,-.02]],'#eb963b',.16);
 pipe([[-.4,1.37],[-1.44,1.37],[-1.84,1.30,-1.84,1.05],[-1.84,.50],[-2.04,.28,-2.34,.28],[-3.03,.28]],'#f1b053',.16);
 // exchanger shell and transfer coils
 let hx=new Path2D();hx.roundRect(-.57,-.55,1.62,2.3,.42);cx.fillStyle='#3b4b59';cx.fill(hx);cx.strokeStyle='#9eacb7';cx.lineWidth=.07;cx.stroke(hx);
 let coil=path([[-.37,-.24],[.65,-.24],[.81,-.19,.81,.03],[.81,.16],[.65,.32,.49,.32],[-.08,.32],[-.29,.32,-.29,.56],[-.29,.70],[-.23,.88,.03,.88],[.64,.88],[.78,.94,.78,1.14],[.78,1.36],[.55,1.52,-.23,1.52]]);
 cx.strokeStyle='#f6a23f';cx.lineWidth=.14;cx.stroke(coil);
 cx.strokeStyle='#ffdb81';cx.lineWidth=.03;cx.stroke(coil);
 // blue secondary coolant loop and turbine/generator
 pipe([[1.05,1.21],[1.62,1.21],[1.9,1.17,1.9,.9],[1.9,-.65],[2.18,-.94,2.53,-.94],[3.12,-.94]],'#87bedb',.13);
 pipe([[3.13,1.45],[2.22,1.45],[1.96,1.43,1.96,1.18],[1.96,.25],[1.74,-.05,1.05,-.05]],'#f7cf6d',.13);
 // turbine housing with multiple blades
 let th=new Path2D();th.roundRect(3.02,-1.19,1.55,1.07,.23);cx.fillStyle='#6d7a87';cx.fill(th);cx.strokeStyle='#bcc8d1';cx.lineWidth=.06;cx.stroke(th);
 for(let i=0;i<7;i++){
  let x=3.25+i*.16,y=-.64;
  cx.save();cx.translate(x,y);cx.rotate(.25+Math.sin(t*2)*.10);cx.fillStyle=i%2?'#c0cbd3':'#8fa7ba';cx.beginPath();cx.moveTo(-.08,-.29);cx.lineTo(.10,0);cx.lineTo(-.08,.29);cx.closePath();cx.fill();cx.restore();
 }
 line2(4.46,-.65,4.84,-.65,'#cdd9e0',.09,.8);
 let gen=new Path2D();gen.roundRect(4.77,-1.13,.72,1.0,.13);cx.fillStyle='#4c5b6d';cx.fill(gen);cx.strokeStyle='#aab8c5';cx.lineWidth=.05;cx.stroke(gen);
 for(let i=0;i<4;i++)line2(4.86+i*.16,-.97,4.86+i*.16,-.30,'#b1c0cd',.023,.65);
 // gentle guided-flow particles in pipe lines
 for(let i=0;i<25;i++){
  let x=-2.0+(i%8)*.17,y=-.02+Math.sin(t*1.9+i*1.3)*.05;
  sphere(cx0+x*s,cy0+y*s,s*.013,'#ffb46b',.7);
 }
 // faint plant ambient glow
 let glow=cx.createRadialGradient(-3.6,.4,0,-3.6,.4,2.7);glow.addColorStop(0,'rgba(255,150,55,.14)');glow.addColorStop(1,'rgba(255,150,55,0)');cx.fillStyle=glow;cx.fillRect(-5,-2.7,10,5.2);
 
 // A physically legible recirculating loop: flowing highlights on the salt pipes.
 // Bezier paths are sampled in local reactor coordinates for smooth motion.
 const B=(a,b,c,u)=>((1-u)*(1-u)*a+2*(1-u)*u*b+u*u*c);
 const topSalt=[[-3.03,-1.11],[-2.34,-1.11],[-2.06,-.84],[-2.06,-.35],[-1.44,-.02],[-.4,-.02]];
 const lowerSalt=[[-.4,1.37],[-1.44,1.37],[-1.84,1.05],[-1.84,.5],[-2.34,.28],[-3.03,.28]];
 function flowMarkers(route,color,amount,speed,phase=0){
   const legs=route.length-1;
   for(let k=0;k<amount;k++){
     let v=((k/amount)+t*speed+phase)%1, leg=Math.min(legs-1,Math.floor(v*legs)),u=v*legs-leg;
     let a=route[leg],b=route[leg+1];
     // Smoothstep eases marker through elbows to avoid jagged movement.
     let h=u*u*(3-2*u),x=mix(a[0],b[0],h),y=mix(a[1],b[1],h);
     cx.fillStyle=color;cx.globalAlpha=.42+.40*Math.sin(Math.PI*u);
     cx.shadowColor=color;cx.shadowBlur=.075;
     cx.beginPath();cx.arc(x,y,.017+(k%4)*.003,0,TAU);cx.fill();
   }cx.shadowBlur=0;cx.globalAlpha=1;
 }
 flowMarkers(topSalt,'#ffe0a2',17,.13);
 flowMarkers(lowerSalt,'#ffc176',15,.13,.44);
 flowMarkers([[1.05,1.21],[1.62,1.21],[1.9,.9],[1.9,-.65],[2.53,-.94],[3.12,-.94]],'#a9dded',14,.10);
 // Heat exchanger plates, curved coil highlights and inlet headers.
 for(let j=0;j<7;j++){
   let yy=-.25+j*.28;
   cx.strokeStyle='rgba(223,231,239,.23)';cx.lineWidth=.024;
   cx.beginPath();cx.moveTo(-.55,yy);cx.lineTo(1.05,yy);cx.stroke();
 }
 // A secondary pump and turbine/generator detailing.
 cx.strokeStyle='rgba(238,246,255,.34)';cx.lineWidth=.035;
 cx.beginPath();cx.arc(2.05,.82,.22,0,TAU);cx.stroke();
 for(let i=0;i<5;i++){
   let a=i*TAU/5+t*.60;
   cx.beginPath();cx.moveTo(2.05,.82);cx.lineTo(2.05+.17*Math.cos(a),.82+.17*Math.sin(a));cx.stroke();
 }
 for(let i=0;i<7;i++){
   let x=4.84+i*.085;
   cx.strokeStyle='rgba(194,211,226,.18)';cx.lineWidth=.019;
   cx.beginPath();cx.moveTo(x,-1.1);cx.lineTo(x,-.18);cx.stroke();
 }
 // Liquid movement in the hot salt vessel, with variable brightness.
 for(let i=0;i<22;i++){
   let x=-4.14+(i%7)*.125;
   let v=(i*.133+t*.25)%1,y=1.55-v*2.5;
   cx.fillStyle=`rgba(255,224,133,${.16+.33*Math.sin(Math.PI*v)})`;
   cx.beginPath();cx.ellipse(x,y,.013,.036,0,0,TAU);cx.fill();
 }
 // Consistent ambient contact shadows below the equipment.
 const floor=cx.createRadialGradient(0,1.87,0,0,1.87,5);
 floor.addColorStop(0,'rgba(2,7,14,.38)');floor.addColorStop(1,'rgba(2,7,14,0)');
 cx.fillStyle=floor;cx.fillRect(-5.6,1.6,11.2,.8);

 cx.restore();
}function sceneIons(t){const S=Math.min(W,H),scale=S*.22,rot=t*.09;let dots=ions.map((d,i)=>{let x=d.x+.17*Math.sin(t*d.rv+d.phase),y=d.y+.13*Math.cos(t*d.rv*.84+d.phase),z=d.z+.18*Math.sin(t*d.rv*.7+d.phase*1.1);let p=point([x,y,z],rot,scale);p.sz=d.sz;p.z=z;p.i=i;return p});dots.sort((a,b)=>b.z-a.z);for(let i=0;i<dots.length;i++){let a=dots[i];if(a.sz!==1)continue;let nb=[];for(let j=0;j<dots.length;j++){let b=dots[j];if(b.sz!==0)continue;let d=Math.hypot(a.x-b.x,a.y-b.y);if(d<S*.18)nb.push({b,d})}nb.sort((a,b)=>a.d-b.d);for(let k=0;k<Math.min(4,nb.length);k++){let {b,d}=nb[k];line(a,b,'#89cbe8',clamp((S*.18-d)/(S*.18),0,.5),1.1)}}for(let p of dots){let r=(p.sz===1?S*.016:S*.011)*p.f;sphere(p.x,p.y,r,p.sz===1?'#ffa75d':'#87d0e4',.3)}bloom(W*.5,H*.49,S*.42,'39,109,145',.14)}function render(t){background(t);const scenes=[[0,2,sceneFission],[2,3.5,sceneChain],[3.5,4.8,sceneReactor],[4.8,6,sceneFusion],[6,7.5,sceneTokamak],[7.5,9.5,sceneSalt],[9.5,12.01,sceneIons]];for(let i=0;i<scenes.length;i++){let [a,b,fn]=scenes[i];if(t>=a&&t<b){fn(t);break}}const tr=0.20;for(let i=1;i<scenes.length;i++){let boundary=scenes[i][0];if(Math.abs(t-boundary)<tr){cx.save();cx.globalAlpha=clamp((t-(boundary-tr))/(2*tr),0,1);scenes[i][2](Math.max(t,boundary));cx.restore()}}if(t>=11.6){let a=smooth(11.6,12,t);cx.fillStyle=`rgba(5,13,23,${a*.42})`;cx.fillRect(0,0,W,H)}}
function formatTime(ms){let total=Math.max(0,Math.min(TOTAL,Math.round(ms)));let secs=Math.floor(total/1000);return `0:${String(secs).padStart(2,'0')}`}
function syncControls(){
  const pct=currentMs/TOTAL*100;
  progress.style.width=`${pct}%`;
  scrubber.value=String(Math.round(currentMs));
  timeReadout.textContent=`${formatTime(currentMs)} / 0:12`;
  playPause.textContent=paused?'Play':'Pause';
  playPause.setAttribute('aria-pressed', String(paused));
}
function setCurrentMs(ms,shouldRender=true){
  currentMs=Math.max(0,Math.min(TOTAL,ms));
  if(shouldRender)render(currentMs/1000);
  syncControls();
}
function togglePaused(force){
  paused=(typeof force==='boolean')?force:!paused;
  lastNow=performance.now();
  syncControls();
}

function frame(now){
  if(!active)return;
  if(!lastNow)lastNow=now;
  if(!paused){
    currentMs=Math.min(TOTAL,currentMs+(now-lastNow));
  }
  lastNow=now;
  render(currentMs/1000);
  syncControls();
  if(currentMs>=TOTAL){finish();return;}
  raf=requestAnimationFrame(frame);
}
function finish(){
  if(!active)return;
  active=false;
  cancelAnimationFrame(raf);
  paused=false;
  lastNow=0;
  document.body.classList.remove('cinematic-active');
  overlay.classList.add('is-leaving');
  leaving=true;
  clearTimeout(finishTimer);
  finishTimer=setTimeout(()=>{
    overlay.hidden=true;
    overlay.classList.remove('is-leaving');
    leaving=false;
    if(lastFocus&&lastFocus!==document.body&&document.contains(lastFocus))lastFocus.focus({preventScroll:true});
  },1050);
  try{sessionStorage.setItem('jaden-cinematic-seen-v16','yes')}catch(_){}
}
function start(){
  if(reduced.matches)return;
  cancelAnimationFrame(raf);
  clearTimeout(finishTimer);
  lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  overlay.hidden=false;
  overlay.classList.remove('is-leaving');
  document.body.classList.add('cinematic-active');
  active=true;
  leaving=false;
  currentMs=0;
  lastNow=0;
  paused=false;
  resize();
  setCurrentMs(0,true);
  skip.focus({preventScroll:true});
  raf=requestAnimationFrame(frame);
}
skip.addEventListener('click',finish);
replay?.addEventListener('click',start);
playPause.addEventListener('click',()=>togglePaused());
function beginScrub(){wasPlayingBeforeScrub=!paused;togglePaused(true)}
function endScrub(){if(wasPlayingBeforeScrub)togglePaused(false);wasPlayingBeforeScrub=false}
scrubber.addEventListener('pointerdown',beginScrub);
scrubber.addEventListener('pointerup',endScrub);
scrubber.addEventListener('touchstart',beginScrub,{passive:true});
scrubber.addEventListener('touchend',endScrub,{passive:true});
scrubber.addEventListener('input',()=>{setCurrentMs(Number(scrubber.value),true);lastNow=performance.now();});
scrubber.addEventListener('change',()=>{setCurrentMs(Number(scrubber.value),true);lastNow=performance.now();});
overlay.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();finish()}
 if(e.key===' ' && document.activeElement===playPause){e.preventDefault();togglePaused()}
 if(e.key==='Tab'){
   const focusables=[skip,playPause,scrubber].filter(Boolean);
   const index=Math.max(0,focusables.indexOf(document.activeElement));
   e.preventDefault();
   const next=e.shiftKey?(index-1+focusables.length)%focusables.length:(index+1)%focusables.length;
   focusables[next].focus({preventScroll:true});
 }
});
window.addEventListener('resize',()=>{if(active){resize();render(currentMs/1000);syncControls()}},{passive:true});
reduced.addEventListener('change',e=>{if(e.matches)finish()});
let seen=false;
try{seen=sessionStorage.getItem('jaden-cinematic-seen-v16')==='yes'}catch(_){}
if(!seen&&!reduced.matches)start();
})();
