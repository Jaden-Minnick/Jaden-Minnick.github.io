(() => {
  const canvas = document.getElementById('molecular-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const slider = document.getElementById('temperature-slider');
  const reading = document.getElementById('temperature-value');
  const toggle = document.getElementById('sim-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let temp = 900, running = !reduced.matches, raf = 0, last = 0;
  let width = 0, height = 0, dpr = 1, yaw = 0.25, pitch = -0.12;
  let dragging = false, lastX = 0, lastY = 0;
  const N = 67, particles = [];
  const random = (a,b) => a + Math.random()*(b-a);
  for(let i=0;i<N;i++) {
    const heavy = i % 9 === 0;
    particles.push({x:random(-1.15,1.15), y:random(-1,1), z:random(-1,1),
      vx:random(-.2,.2), vy:random(-.2,.2),vz:random(-.2,.2),heavy});
  }
  function resize() {
    const rect=canvas.getBoundingClientRect(); width=rect.width;height=rect.height;
    dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);draw();
  }
  function project(p) {
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    const x=p.x*cy-p.z*sy, z=p.x*sy+p.z*cy;
    const y=p.y*cp-z*sp, zz=p.y*sp+z*cp;
    const scale=Math.min(width*.31,height*.51)*(2.8/(3.5+zz));
    return {x:width*.73+x*scale,y:height*.53+y*scale,z:zz,scale};
  }
  function draw() {
    if(!width||!height)return;
    ctx.clearRect(0,0,width,height);
    const points=particles.map(project);
    // Transient, distance-dependent coordination guides. These are not chemical bonds.
    for(let i=0;i<N;i++)for(let j=i+1;j<N;j++) {
      if(particles[i].heavy===particles[j].heavy)continue;
      const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,dz=particles[i].z-particles[j].z;
      const d=Math.hypot(dx,dy,dz);
      if(d>0.77)continue;
      const strength=Math.max(0,Math.min(1,(0.77-d)/0.32));
      ctx.strokeStyle=`rgba(135,203,236,${(0.42*strength*strength).toFixed(3)})`;
      ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(points[i].x,points[i].y);ctx.lineTo(points[j].x,points[j].y);ctx.stroke();
    }
    const order=points.map((p,i)=>({...p,i})).sort((a,b)=>b.z-a.z);
    for(const p of order) {
      const a=particles[p.i],r=(a.heavy?6.4:3.0)*p.scale/Math.max(25,Math.min(width*.31,height*.51));
      const radius=Math.max(a.heavy?4:2,Math.min(10,(a.heavy?6.1:3.2)*2.8/(3.5+p.z)));
      const alpha=Math.max(.4,Math.min(1,.8-p.z*.12));
      ctx.beginPath();ctx.fillStyle=a.heavy?`rgba(255,165,84,${alpha})`:`rgba(137,210,243,${alpha})`;
      ctx.shadowColor=a.heavy?'#fa9246':'#7bcafa';ctx.shadowBlur=a.heavy?13:7;
      ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill();
    }
    ctx.shadowBlur=0;
  }
  function animate(t) {
    if (!running)return;
    const dt=Math.min(2.2,(t-last||16.67)/16.67);last=t;
    const v=Math.sqrt(temp/900)*dt*.0062;
    for(const p of particles) {
      p.x+=p.vx*v*15;p.y+=p.vy*v*15;p.z+=p.vz*v*15;
      for(const k of ['x','y','z']) if(Math.abs(p[k])>1.22){p[k]=Math.sign(p[k])*1.22;p['v'+k]*=-1;}
    }
    if(!dragging)yaw+=.0016*dt;
    draw();raf=requestAnimationFrame(animate);
  }
  function setPlay(on){running=on;toggle.textContent=on?'Pause':'Play';toggle.setAttribute('aria-pressed',String(!on));cancelAnimationFrame(raf);last=0;if(on)raf=requestAnimationFrame(animate);else draw();}
  slider.addEventListener('input',()=>{temp=Number(slider.value);reading.textContent=temp.toLocaleString()+' K';if(!running)draw();});
  toggle.addEventListener('click',()=>setPlay(!running));
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;yaw+=(e.clientX-lastX)*.006;pitch=Math.max(-1.3,Math.min(1.3,pitch+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;draw()});
  canvas.addEventListener('pointerup',()=>dragging=false);
  canvas.addEventListener('pointercancel',()=>dragging=false);
  reduced.addEventListener('change',e=>setPlay(!e.matches));
  window.addEventListener('resize',resize,{passive:true});
  resize();setPlay(running);
})();
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
