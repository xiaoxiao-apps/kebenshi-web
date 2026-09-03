/* ============================================================
   光的反射 · 可交互教材原型 v2
   模块：悬念动画 / 探究实验 / 知识点讲解 / 小练习 / 本节小结
   ============================================================ */

/* ---------- 通用：高清屏适配 ---------- */
function fitCanvas(cv, cssH){
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const w = cv.clientWidth || cv.parentElement.clientWidth;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(cssH * dpr);
  cv.style.height = cssH + 'px';
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h: cssH };
}
function roundRectPath(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function distToSeg(px,py,x1,y1,x2,y2){
  const dx=x2-x1, dy=y2-y1;
  const L2=dx*dx+dy*dy;
  let t=((px-x1)*dx+(py-y1)*dy)/L2;
  t=Math.max(0,Math.min(1,t));
  const cx=x1+t*dx, cy=y1+t*dy;
  return Math.hypot(px-cx,py-cy);
}

/* ============================================================
   模块一：悬念小剧场 —— 月光下的亮与暗
   ============================================================ */
(function(){
  const cv = document.getElementById('animCv');
  const cap = document.getElementById('cap');
  const bar = document.getElementById('animBar');
  let g = fitCanvas(cv, 300);
  let t0 = null, raf = null, elapsed = 0, lastNow = 0, paused = false;
  const DUR = 36000;

  const scenes = [
    [0,      7000, '夜晚，一轮明月挂在天上。<br>小明走在回家的路上……', 'night'],
    [7000,   17000,'路面有的地方亮闪闪，有的地方黑乎乎。<br><span class="reveal">迎着月光走——亮的是水，暗的是路。</span>', 'toward'],
    [17000,  25000,'可是调个头，背着月光走呢？<br><span class="reveal">这时候，暗的地方反而是水！</span>', 'away'],
    [25000,  31000,'同样是月光照在水面和路面上，<br>为什么换个方向走，亮的暗的就对调了？', 'question'],
    [31000,  36000,'秘密就在——<span class="reveal">光的反射</span>。<br>跟着下面的实验一起找答案吧！', 'reveal'],
  ];

  function stars(ctx,w,h,now){
    ctx.save();
    for(let i=0;i<40;i++){
      const x=(i*97)%w, y=(i*57)%(h*0.45);
      ctx.globalAlpha=0.25+0.5*Math.abs(Math.sin(now*0.002+i));
      ctx.fillStyle='#dfe9ff';
      ctx.beginPath(); ctx.arc(x,y,i%3===0?1.6:1,0,7); ctx.fill();
    }
    ctx.restore();
  }
  function moon(ctx,w,h){
    const mx=w*0.78, my=h*0.20, r=26;
    const halo=ctx.createRadialGradient(mx,my,r*0.4,mx,my,r*3.2);
    halo.addColorStop(0,'rgba(255,240,200,.5)'); halo.addColorStop(1,'rgba(255,240,200,0)');
    ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(mx,my,r*3.2,0,7); ctx.fill();
    ctx.fillStyle='#ffedb8'; ctx.beginPath(); ctx.arc(mx,my,r,0,7); ctx.fill();
    ctx.fillStyle='rgba(220,200,150,.35)';
    ctx.beginPath(); ctx.arc(mx-8,my-5,5,0,7); ctx.fill();
    ctx.beginPath(); ctx.arc(mx+7,my+8,3.5,0,7); ctx.fill();
  }
  function ground(ctx,w,h){
    const gy=h*0.68;
    ctx.fillStyle='#2a3350'; ctx.fillRect(0,gy,w,h-gy);
    return gy;
  }
  function puddles(ctx,w,h,gy,glint){
    for(const [fx,rw] of [[0.18,40],[0.45,55],[0.70,34]]){
      const cx=w*fx, cy=gy+(h-gy)*0.45, rh=rw*0.32;
      ctx.save();
      ctx.beginPath(); ctx.ellipse(cx,cy,rw,rh,0,0,7);
      ctx.fillStyle='#1b2745'; ctx.fill();
      if(glint>0){ ctx.clip(); ctx.fillStyle=`rgba(255,236,180,${0.55*glint})`; ctx.fillRect(cx-rw,cy-rh,rw*2,rh*2); }
      ctx.restore();
    }
  }
  function person(ctx,x,y,s,dir,phase){
    ctx.save(); ctx.translate(x,y); ctx.scale(dir*s,s);
    const skin='#fce0cd', hair='#3e3025', blush='#ffb3b3', jacket='#ff9a5e', shorts='#4a7cc7';
    const sw=Math.sin(phase), sw2=Math.sin(phase+0.6);
    const legSwingR=sw*10, legSwingL=-sw*10, armSwingR=sw2*8, armSwingL=-sw2*8;

    ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0,0,22,5,0,0,7); ctx.fill();

    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.strokeStyle=shorts; ctx.lineWidth=9;
    ctx.beginPath(); ctx.moveTo(-5,-22); ctx.lineTo(-8+legSwingR,0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5,-22); ctx.lineTo(8+legSwingL,0); ctx.stroke();
    ctx.fillStyle='#3a2e2a'; ctx.beginPath(); ctx.ellipse(-8+legSwingR,2,7,4,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8+legSwingL,2,7,4,0,0,7); ctx.fill();

    ctx.fillStyle=jacket; ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1;
    roundRectPath(ctx,-13,-48,26,28,7); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#ffffff'; roundRectPath(ctx,-3,-45,6,14,2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.beginPath(); ctx.moveTo(0,-45); ctx.lineTo(0,-31); ctx.stroke();

    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.strokeStyle=jacket; ctx.lineWidth=8;
    ctx.beginPath(); ctx.moveTo(-11,-42); ctx.lineTo(-18+armSwingL,-28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(11,-42); ctx.lineTo(18+armSwingR,-28); ctx.stroke();
    ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(-18+armSwingL,-26,4,0,7); ctx.fill();
    ctx.beginPath(); ctx.arc(18+armSwingR,-26,4,0,7); ctx.fill();

    ctx.fillStyle=shorts; roundRectPath(ctx,-12,-25,24,9,3); ctx.fill();

    ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(0,-55,13,0,7); ctx.fill();
    ctx.fillStyle=hair; ctx.beginPath(); ctx.arc(0,-56,13.5,Math.PI,0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-13,-55); ctx.quadraticCurveTo(-7,-61,0,-57); ctx.quadraticCurveTo(7,-61,13,-55); ctx.quadraticCurveTo(13,-64,0,-65); ctx.quadraticCurveTo(-13,-64,-13,-55); ctx.fill();
    const blink=Math.sin(phase*0.5)>0.92;
    ctx.fillStyle='#2a2a2a';
    if(blink){ ctx.lineWidth=2; ctx.strokeStyle='#2a2a2a'; ctx.beginPath(); ctx.moveTo(-6,-54); ctx.lineTo(-2,-54); ctx.stroke(); ctx.beginPath(); ctx.moveTo(2,-54); ctx.lineTo(6,-54); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(-4,-54,2.2,0,7); ctx.arc(4,-54,2.2,0,7); ctx.fill(); }
    ctx.fillStyle=blush; ctx.globalAlpha=0.35; ctx.beginPath(); ctx.arc(-7,-49,2.8,0,7); ctx.arc(7,-49,2.8,0,7); ctx.fill(); ctx.globalAlpha=1;
    ctx.strokeStyle='#d47c6e'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,-52,2.5,0.2,Math.PI-0.2); ctx.stroke();

    ctx.fillStyle='#d94e4e'; roundRectPath(ctx,-17,-45,7,18,3); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-17,-43); ctx.quadraticCurveTo(-22,-35,-17,-28); ctx.stroke();

    ctx.restore();
  }
  function ray(ctx,x1,y1,x2,y2,color,wdt,alpha){
    ctx.save();
    ctx.strokeStyle=color; ctx.lineWidth=wdt; ctx.globalAlpha=alpha;
    ctx.shadowColor=color; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    ctx.restore();
  }

  function drawFrame(now){
    if(t0===null) t0=now;
    if(paused){ raf=requestAnimationFrame(drawFrame); lastNow=now; return; }
    const dt=lastNow? now-lastNow : 0; lastNow=now;
    elapsed=(elapsed+dt)%DUR;
    const el=elapsed;
    bar.style.width=(el/DUR*100)+'%';
    const sc=scenes.find(s=>el>=s[0]&&el<s[1])||scenes[scenes.length-1];
    if(cap.dataset.t!==String(sc[0])){ cap.dataset.t=String(sc[0]); cap.innerHTML=sc[2]; }
    const {ctx,w,h}=g;
    ctx.clearRect(0,0,w,h);
    const sky=ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,'#0a1130'); sky.addColorStop(1,'#101a3d');
    ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
    stars(ctx,w,h,now); moon(ctx,w,h);
    const gy=ground(ctx,w,h);
    const mx=w*0.78, my=h*0.20;
    const wp=now*0.012;

    if(sc[3]==='night'){
      puddles(ctx,w,h,gy,0);
      person(ctx,w*0.28+(el/5000)*w*0.1,gy+14,1.4,1,wp);
    } else if(sc[3]==='toward'){
      puddles(ctx,w,h,gy,0.6+0.4*Math.sin(now*0.004));
      for(const fx of [0.18,0.45,0.70]){
        const px=w*fx, py=gy+(h-gy)*0.45;
        ray(ctx,mx,my,px,py,'#ffe9a8',2,.45);
        ray(ctx,px,py,w*0.35,gy-30,'#ffe9a8',2.5,.85);
      }
      person(ctx,w*0.35,gy+14,1.4,1,wp);
      ctx.save();
      ctx.fillStyle='rgba(255,209,102,.95)'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center';
      ctx.shadowColor='rgba(0,0,0,.6)'; ctx.shadowBlur=4;
      const txt='水面镜面反射 → 光进入眼睛 → 亮！';
      const tx=w*0.5, ty=h*0.22;
      const tm=ctx.measureText(txt), pad=10;
      ctx.fillStyle='rgba(10,14,30,.75)'; roundRectPath(ctx,tx-tm.width/2-pad,ty-18,tm.width+pad*2,28,8); ctx.fill();
      ctx.fillStyle='rgba(255,209,102,.95)'; ctx.fillText(txt,tx,ty);
      ctx.restore();
    } else if(sc[3]==='away'){
      puddles(ctx,w,h,gy,0.12);
      for(const fx of [0.18,0.45,0.70]){
        const px=w*fx, py=gy+(h-gy)*0.45;
        ray(ctx,mx,my,px,py,'#ffe9a8',2,.35);
        ray(ctx,px,py,w*0.05,gy-6,'#ffe9a8',2,.5);
      }
      person(ctx,w*0.42,gy+14,1.4,-1,wp);
      ctx.save();
      ctx.fillStyle='rgba(174,185,212,.95)'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center';
      ctx.shadowColor='rgba(0,0,0,.6)'; ctx.shadowBlur=4;
      const txt='反射光朝另一侧去了 → 眼睛接不到 → 暗';
      const tx=w*0.5, ty=h*0.22;
      const tm=ctx.measureText(txt), pad=10;
      ctx.fillStyle='rgba(10,14,30,.75)'; roundRectPath(ctx,tx-tm.width/2-pad,ty-18,tm.width+pad*2,28,8); ctx.fill();
      ctx.fillStyle='rgba(174,185,212,.95)'; ctx.fillText(txt,tx,ty);
      ctx.restore();
    } else if(sc[3]==='question'){
      puddles(ctx,w,h,gy,0.3+0.3*Math.sin(now*0.005));
      person(ctx,w*0.30,gy+14,1.4,1,0);
      ctx.save();
      ctx.fillStyle='#ffd166'; ctx.font='bold 26px sans-serif'; ctx.textAlign='center';
      ctx.fillText('?', w*0.30, gy-46);
      ctx.restore();
    } else {
      puddles(ctx,w,h,gy,0.5+0.5*Math.sin(now*0.006));
      person(ctx,w*0.30,gy+14,1.4,1,wp);
      ctx.save();
      ctx.font='bold 24px sans-serif'; ctx.textAlign='center';
      ctx.fillStyle='#ffd166'; ctx.shadowColor='rgba(255,209,102,.8)'; ctx.shadowBlur=16;
      ctx.fillText('光的反射', w*0.55, h*0.38);
      ctx.restore();
    }
    raf=requestAnimationFrame(drawFrame);
  }
  const pauseBtn = document.getElementById('pauseBtn');
  function start(){ if(raf) cancelAnimationFrame(raf); t0=null; elapsed=0; lastNow=0; paused=false; pauseBtn.textContent='⏸ 暂停'; raf=requestAnimationFrame(drawFrame); }
  document.getElementById('replayBtn').addEventListener('click', start);
  pauseBtn.addEventListener('click', ()=>{
    paused=!paused;
    pauseBtn.textContent=paused?'▶ 继续':'⏸ 暂停';
  });
  document.getElementById('toLabBtn').addEventListener('click', ()=>{
    document.getElementById('labWrap').scrollIntoView({behavior:'smooth', block:'center'});
  });
  window.addEventListener('resize', ()=>{ g=fitCanvas(cv,300); });
  start();
})();

/* ============================================================
   模块二：探究实验 —— 光的反射定律（拖拽联动）
   ============================================================ */
(function(){
  const cv = document.getElementById('labCv');
  let g = fitCanvas(cv, 400);
  const incEl = document.getElementById('incVal');
  const refEl = document.getElementById('refVal');

  const state = { theta: 45, spray: true, normal: false, reverse: false, dragging: false, fold: 0, folding: false };
  let particles = [];

  function geom(){
    const {w,h} = g;
    return { ox: w*0.5, oy: h*0.86, R: Math.min(w,h)*0.60 };
  }

  function seedParticles(){
    const {w,h} = g; const {ox,oy} = geom();
    particles = [];
    for(let i=0;i<90;i++){
      particles.push({
        x: ox + (Math.random()-0.5)*w*0.9,
        y: oy - Math.random()*h*0.62,
        r: 1+Math.random()*2.2,
        a: 0.04+Math.random()*0.18,
        vy: -0.04-Math.random()*0.08,
        ph: Math.random()*6.28,
      });
    }
  }
  seedParticles();

  function drawBeam(ctx, x1,y1,x2,y2, color, width, alpha, now){
    ctx.save();
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.globalAlpha=alpha;
    ctx.shadowColor=color; ctx.shadowBlur=10; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    const tt = ((now*0.0006) % 1);
    const px = x1+(x2-x1)*tt, py = y1+(y2-y1)*tt;
    ctx.globalAlpha=alpha*0.9; ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.arc(px,py,width*1.4,0,7); ctx.fill();
    ctx.restore();
  }

  function arrowHead(ctx, x1,y1,x2,y2, color){
    const ang = Math.atan2(y2-y1, x2-x1);
    ctx.save();
    ctx.translate(x2,y2); ctx.rotate(ang);
    ctx.fillStyle=color;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-12,-6); ctx.lineTo(-12,6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }

  function draw(now){
    const {ctx,w,h} = g;
    const {ox,oy,R} = geom();
    ctx.clearRect(0,0,w,h);

    ctx.save();
    const dial=ctx.createRadialGradient(ox,oy,R*0.2,ox,oy,R);
    dial.addColorStop(0,'rgba(32,50,88,.95)'); dial.addColorStop(1,'rgba(20,32,60,.95)');
    ctx.fillStyle=dial;
    ctx.beginPath(); ctx.arc(ox,oy,R,Math.PI,2*Math.PI); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.fillStyle='rgba(255,255,255,.5)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    for(let a=0;a<=180;a+=10){
      const rad=Math.PI+a*Math.PI/180;
      const big=a%30===0;
      ctx.lineWidth=big?1.6:1;
      ctx.beginPath();
      ctx.moveTo(ox+Math.cos(rad)*(R-(big?16:9)), oy+Math.sin(rad)*(R-(big?16:9)));
      ctx.lineTo(ox+Math.cos(rad)*(R-2), oy+Math.sin(rad)*(R-2));
      ctx.stroke();
      if(big&&a>0&&a<180) ctx.fillText(String(Math.abs(90-a)), ox+Math.cos(rad)*(R-28), oy+Math.sin(rad)*(R-28)+3);
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle='#3d4f78'; ctx.fillRect(ox-R*0.55, oy, R*1.1, 10);
    ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(ox-R*0.55,oy); ctx.lineTo(ox+R*0.55,oy); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.2)'; ctx.lineWidth=1.5;
    for(let x=ox-R*0.5;x<ox+R*0.5;x+=14){
      ctx.beginPath(); ctx.moveTo(x,oy+10); ctx.lineTo(x-8,oy+17); ctx.stroke();
    }
    ctx.restore();

    if(state.normal){
      ctx.save();
      ctx.setLineDash([6,6]); ctx.strokeStyle='rgba(174,185,212,.8)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox,oy-R); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='rgba(174,185,212,.9)'; ctx.font='12px sans-serif'; ctx.textAlign='left';
      ctx.fillText('法线', ox+8, oy-R+16);
      ctx.restore();
    }

    const th = state.theta*Math.PI/180;
    const inX = ox - Math.sin(th)*R*0.92, inY = oy - Math.cos(th)*R*0.92;
    const outX = ox + Math.sin(th)*R*0.92, outY = oy - Math.cos(th)*R*0.92;

    if(state.spray){
      for(const p of particles){
        p.y += p.vy; p.ph += 0.02;
        p.x += Math.sin(p.ph)*0.12;
        if(p.y < oy-R) { p.y = oy; p.x = ox+(Math.random()-0.5)*w*0.9; }
        const d1 = distToSeg(p.x,p.y,inX,inY,ox,oy);
        const d2 = distToSeg(p.x,p.y,ox,oy,outX,outY);
        const d = Math.min(d1,d2);
        const boost = d<14 ? (1-d/14)*0.9 : 0;
        ctx.save();
        ctx.globalAlpha = p.a + boost;
        ctx.fillStyle = boost>0 ? '#fff3c9' : '#aeb9d4';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
        ctx.restore();
      }
    }

    const incCol='#ff7d7d', refCol='#5ad7ff';
    const folded = state.fold;

    function drawFlatScreen(alpha){
      ctx.save(); ctx.globalAlpha=alpha;
      ctx.strokeStyle='rgba(174,185,212,.45)'; ctx.fillStyle='rgba(90,215,255,.06)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.ellipse(ox,oy,R*1.05,R*1.05,Math.PI,0,Math.PI); ctx.stroke(); ctx.fill();
      ctx.restore();
    }
    function drawFoldedScreen(alpha, foldT){
      ctx.save(); ctx.globalAlpha=alpha;
      ctx.strokeStyle='rgba(174,185,212,.45)'; ctx.fillStyle='rgba(90,215,255,.06)'; ctx.lineWidth=1;
      const bend = foldT * 0.9;
      ctx.beginPath();
      ctx.ellipse(ox,oy,R*1.05,R*1.05,Math.PI,0,Math.PI);
      const region = new Path2D(); region.ellipse(ox,oy,R*1.05,R*1.05,Math.PI,0,Math.PI); region.closePath();
      ctx.save(); ctx.clip(region, 'evenodd');
      const grad = ctx.createLinearGradient(ox,oy,ox+R,oy);
      grad.addColorStop(0, 'rgba(90,215,255,.08)'); grad.addColorStop(bend, 'rgba(90,215,255,.03)');
      ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
      ctx.restore();
      ctx.stroke();
      ctx.restore();
    }

    if(state.fold > 0.5){
      drawFoldedScreen(1, state.fold);
    } else {
      drawFlatScreen(1-state.fold*2);
    }

    if(!state.reverse){
      drawBeam(ctx,inX,inY,ox,oy,incCol,3.5,.9,now);
      if(state.fold < 0.85){
        drawBeam(ctx,ox,oy,outX,outY,refCol,3.5,.9,now+400);
        arrowHead(ctx,ox,oy,outX,outY,refCol);
      }
      arrowHead(ctx,inX,inY,ox,oy,incCol);
    } else {
      drawBeam(ctx,outX,outY,ox,oy,refCol,3.5,.9,now);
      if(state.fold < 0.85){
        drawBeam(ctx,ox,oy,inX,inY,incCol,3.5,.9,now+400);
        arrowHead(ctx,ox,oy,inX,inY,incCol);
      }
      arrowHead(ctx,outX,outY,ox,oy,refCol);
    }

    ctx.save();
    ctx.fillStyle='#ffd166';
    ctx.beginPath(); ctx.arc(ox,oy,5,0,7); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle='rgba(255,125,125,.9)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(ox,oy,46,-Math.PI/2-th,-Math.PI/2); ctx.stroke();
    ctx.strokeStyle='rgba(90,215,255,.9)';
    ctx.beginPath(); ctx.arc(ox,oy,46,-Math.PI/2,-Math.PI/2+th); ctx.stroke();
    ctx.restore();

    ctx.save();
    const hx = inX + (ox-inX)*0.12, hy = inY + (oy-inY)*0.12;
    ctx.translate(hx,hy); ctx.rotate(Math.atan2(oy-inY,ox-inX));
    ctx.fillStyle= state.dragging ? '#ff9d9d' : '#d85555';
    roundRect(ctx,-34,-11,46,22,8); ctx.fill();
    ctx.fillStyle='#2a1214'; roundRect(ctx,8,-7,8,14,3); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle='rgba(255,125,125,.6)'; ctx.lineWidth=1.5;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(hx,hy,26+3*Math.sin(now*0.004),0,7); ctx.stroke();
    ctx.restore();

    requestAnimationFrame(draw);
  }

  function updateReadout(){
    const d = Math.round(state.theta);
    incEl.textContent = d; refEl.textContent = d;
  }

  function angleFromPointer(cx, cy){
    const rect = cv.getBoundingClientRect();
    const x = cx - rect.left, y = cy - rect.top;
    const {ox,oy} = geom();
    const dx = ox - x, dy = oy - y;
    let ang = Math.atan2(Math.abs(dx), dy) * 180/Math.PI;
    ang = Math.max(8, Math.min(80, ang));
    state.theta = ang;
    updateReadout();
  }

  function onDown(e){
    state.dragging = true;
    const p = e.touches ? e.touches[0] : e;
    angleFromPointer(p.clientX, p.clientY);
    e.preventDefault();
  }
  function onMove(e){
    if(!state.dragging) return;
    const p = e.touches ? e.touches[0] : e;
    angleFromPointer(p.clientX, p.clientY);
    e.preventDefault();
  }
  function onUp(){ state.dragging = false; }

  cv.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  cv.addEventListener('touchstart', onDown, {passive:false});
  cv.addEventListener('touchmove', onMove, {passive:false});
  cv.addEventListener('touchend', onUp);

  function bindTg(id, key){
    const el = document.getElementById(id);
    el.addEventListener('click', ()=>{
      state[key] = !state[key];
      el.classList.toggle('on', state[key]);
      if(key==='fold'){
        const hint = document.getElementById('labHint');
        hint.textContent = state.fold > 0.5 ? '✅ 折叠后反射光线消失，说明入射光、法线、反射光必须在同一平面内。' : '👆 直接拖动激光笔的一端，改变入射光线的方向，观察反射角如何变化。反射角始终等于入射角。';
      }
    });
  }
  const foldBtn = document.getElementById('tgFold');
  foldBtn.addEventListener('click', ()=>{
    state.folding = true;
    const target = state.fold > 0.5 ? 0 : 1;
    animateFold(target);
    foldBtn.classList.toggle('on', target > 0.5);
    document.getElementById('labHint').textContent = target > 0.5
      ? '✅ 折叠后反射光线消失，说明入射光、法线、反射光必须在同一平面内。'
      : '👆 直接拖动激光笔的一端，改变入射光线的方向，观察反射角如何变化。反射角始终等于入射角。';
  });
  function animateFold(target){
    const start = state.fold, t0 = performance.now(), dur = 400;
    function step(t){
      const p = Math.min(1,(t-t0)/dur);
      state.fold = start + (target-start)*p;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  bindTg('tgSpray','spray'); bindTg('tgNormal','normal'); bindTg('tgReverse','reverse');
  window.addEventListener('resize', ()=>{ g=fitCanvas(cv,400); seedParticles(); });
  updateReadout();
  requestAnimationFrame(draw);
})();

/* ============================================================
   模块三：知识点讲解 —— 动画演示
   ============================================================ */
(function(){
  const cv = document.getElementById('knowledgeCv');
  let g = fitCanvas(cv, 300);
  const btns = document.getElementById('knowledgeBtns');
  const hint = document.getElementById('knowledgeHint');
  let mode = 'law';
  const modeTexts = {
    law: '反射定律三要素：入射光线、法线、反射光线在同一平面内；入射光线和反射光线分居法线两侧；反射角等于入射角。',
    types: '光滑表面发生镜面反射，平行光反射后仍然平行；粗糙表面发生漫反射，平行光向四面八方散开。',
    reversible: '光路可逆：沿着原来的反射光线方向入射，会沿原来的入射光线方向反射出去。'
  };

  btns.querySelectorAll('.tg').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      mode = btn.dataset.mode;
      btns.querySelectorAll('.tg').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      hint.textContent = modeTexts[mode];
    });
  });

  function drawLaw(ctx,w,h,now){
    const ox=w*0.5, oy=h*0.78, R=Math.min(w,h)*0.55;
    const stage = (now*0.0005)%6;
    const ease = (x)=>x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2;

    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(w,oy); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(174,185,212,.6)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox,oy-R); ctx.stroke();
    ctx.fillStyle='rgba(174,185,212,.9)'; ctx.font='12px sans-serif'; ctx.textAlign='left';
    ctx.fillText('法线', ox+6, oy-R+14);
    ctx.restore();

    const inX = ox - Math.sin(Math.PI/4)*R*0.7;
    const inY = oy - Math.cos(Math.PI/4)*R*0.7;
    const outX = ox + Math.sin(Math.PI/4)*R*0.7;
    const outY = inY;

    function drawLine(x1,y1,x2,y2,color,progress,label){
      const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy);
      const ex=dx/len, ey=dy/len;
      const p=progress;
      const xEnd = x1 + ex*len*p, yEnd = y1 + ey*len*p;
      ctx.save();
      ctx.strokeStyle=color; ctx.lineWidth=3; ctx.shadowColor=color; ctx.shadowBlur=8; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(xEnd,yEnd); ctx.stroke();
      ctx.restore();
      if(label && p>0.8){
        ctx.save(); ctx.fillStyle='#f4f7ff'; ctx.font='12px sans-serif'; ctx.textAlign='center';
        ctx.fillText(label, (x1+xEnd)/2, (y1+yEnd)/2 - 8); ctx.restore();
      }
      return {x:xEnd,y:yEnd};
    }

    let p1=0,p2=0,p3=0;
    if(stage<1) p1=ease(stage);
    else if(stage<3) p1=1+(stage<2?0:(stage-2)*0.5);
    if(stage>=1 && stage<2) p2=ease(stage-1);
    else if(stage>=2) p2=1;
    if(stage>=3 && stage<4) p3=ease(stage-3);
    else if(stage>=4) p3=1;

    if(stage<1){
      drawLine(inX,inY,ox,oy,'#ff7d7d',p1,'入射光线');
    } else {
      drawLine(inX,inY,ox,oy,'#ff7d7d',p1,'入射光线');
    }
    if(stage>=1){
      if(p2>0){
        ctx.save();
        ctx.strokeStyle='rgba(174,185,212,.6)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox,oy-R); ctx.stroke();
        ctx.restore();
      }
    }
    if(stage>=3){
      drawLine(ox,oy,outX,outY,'#5ad7ff',p3,'反射光线');
    }

    ctx.save();
    ctx.fillStyle='#ffd166';
    ctx.beginPath(); ctx.arc(ox,oy,5,0,7); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle='rgba(255,255,255,.9)'; ctx.font='13px sans-serif'; ctx.textAlign='center';
    const labels = ['① 先画入射光线','② 再画法线','③ 再画反射光线','两线分居法线两侧','反射角 = 入射角'];
    const idx = stage>=4?4:(stage>=3?3:(stage>=2?2:(stage>=1?1:0)));
    ctx.fillStyle='rgba(10,14,30,.75)'; roundRectPath(ctx,w*0.5-80,12,160,26,8); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='bold 13px sans-serif';
    ctx.fillText(labels[idx], w*0.5, 30);
    ctx.restore();
  }

  function drawTypes(ctx,w,h,now){
    const leftCenterX=w*0.25, rightCenterX=w*0.75, groundY=h*0.78, R=Math.min(w,h)*0.32;
    const lightY=h*0.18;

    ctx.save();
    ctx.fillStyle='rgba(255,255,255,.08)'; ctx.font='12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('镜面反射：光滑镜面', leftCenterX, groundY+42);
    ctx.fillText('漫反射：粗糙表面', rightCenterX, groundY+42);
    ctx.restore();

    function drawSurface(cx, mirror){
      ctx.save();
      if(mirror){
        ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(cx-R,groundY); ctx.lineTo(cx+R,groundY); ctx.stroke();
      } else {
        ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=2;
        for(let i=-R;i<R;i+=8){
          const j=i+8;
          ctx.beginPath(); ctx.moveTo(cx+i,groundY); ctx.lineTo(cx+j,groundY+Math.random()*6+2); ctx.stroke();
        }
      }
      ctx.restore();
    }
    drawSurface(leftCenterX, true);
    drawSurface(rightCenterX, false);

    const rays=5, spacing=12;
    const t=(now%4000)/4000;
    for(let i=0;i<rays;i++){
      const xOff=(i-rays/2+0.5)*spacing;
      const yTop=lightY;
      const yBot=groundY;
      const xLeft=leftCenterX+xOff, xRight=rightCenterX+xOff;

      ctx.save();
      ctx.strokeStyle='rgba(255,236,180,.7)'; ctx.lineWidth=1.5; ctx.globalAlpha=0.7;
      ctx.beginPath(); ctx.moveTo(xLeft-15,yTop-20); ctx.lineTo(xLeft,yBot); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle='rgba(255,236,180,.7)'; ctx.lineWidth=1.5; ctx.globalAlpha=0.7;
      ctx.beginPath(); ctx.moveTo(xRight-15,yTop-20); ctx.lineTo(xRight,yBot); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle='rgba(90,215,255,.7)'; ctx.lineWidth=1.5; ctx.globalAlpha=0.8;
      ctx.beginPath(); ctx.moveTo(xLeft,groundY); ctx.lineTo(xLeft+Math.sin(t*6.28+i)*8,groundY-50); ctx.stroke();
      ctx.restore();

      const spreadX = xRight + (i-rays/2+0.5)*12;
      ctx.save();
      ctx.strokeStyle='rgba(255,125,125,.55)'; ctx.lineWidth=1.3; ctx.globalAlpha=0.75;
      ctx.beginPath(); ctx.moveTo(xRight,groundY); ctx.lineTo(spreadX,groundY-50); ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle='rgba(255,255,255,.85)'; ctx.font='12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('平行光入射 → 平行反射', leftCenterX, lightY-10);
    ctx.fillText('平行光入射 → 向各方向散射', rightCenterX, lightY-10);
    ctx.fillStyle='rgba(255,209,102,.9)'; ctx.font='bold 12px sans-serif';
    ctx.fillText('黑板反光就是镜面反射', leftCenterX, groundY+58);
    ctx.fillStyle='rgba(95,227,161,.9)'; ctx.font='bold 12px sans-serif';
    ctx.fillText('课本能被各方向看到就是漫反射', rightCenterX, groundY+58);
    ctx.restore();
  }

  function drawReversible(ctx,w,h,now){
    const ox=w*0.5, oy=h*0.78, R=Math.min(w,h)*0.55;
    const t=(now%6000)/6000;
    const phase = t<0.5 ? 0 : 1;
    const progress = phase===0 ? t*2 : (t-0.5)*2;

    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(w,oy); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(174,185,212,.6)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox,oy-R); ctx.stroke();
    ctx.fillStyle='rgba(174,185,212,.9)'; ctx.font='12px sans-serif'; ctx.textAlign='left';
    ctx.fillText('法线', ox+6, oy-R+14);
    ctx.restore();

    const inX = ox - Math.sin(Math.PI/4)*R*0.7;
    const inY = oy - Math.cos(Math.PI/4)*R*0.7;
    const outX = ox + Math.sin(Math.PI/4)*R*0.7;
    const outY = inY;

    function rayLine(x1,y1,x2,y2,color,prog){
      const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy);
      const ex=dx/len, ey=dy/len;
      const xEnd=x1+ex*len*prog, yEnd=y1+ey*len*prog;
      ctx.save();
      ctx.strokeStyle=color; ctx.lineWidth=3; ctx.shadowColor=color; ctx.shadowBlur=8; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(xEnd,yEnd); ctx.stroke();
      ctx.restore();
      if(prog>0.8){
        ctx.save(); ctx.fillStyle='#fff';
        const ang=Math.atan2(y2-y1,x2-x1);
        ctx.translate(xEnd,yEnd); ctx.rotate(ang);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-10,-5); ctx.lineTo(-10,5); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      return {x:xEnd,y:yEnd};
    }

    if(phase===0){
      rayLine(inX,inY,ox,oy,'#ff7d7d',1);
      rayLine(ox,oy,outX,outY,'#5ad7ff',progress);
      ctx.save(); ctx.fillStyle='rgba(255,125,125,.9)'; ctx.font='12px sans-serif'; ctx.textAlign='center';
      ctx.fillText('原入射光', inX, inY-10);
      ctx.fillStyle='rgba(90,215,255,.9)'; ctx.font='12px sans-serif'; ctx.textAlign='center';
      ctx.fillText('原反射光', outX, outY-10);
      ctx.restore();
    } else {
      rayLine(outX,outY,ox,oy,'#5ad7ff',1);
      rayLine(ox,oy,inX,inY,'#ff7d7d',progress);
      ctx.save(); ctx.fillStyle='rgba(90,215,255,.9)'; ctx.font='12px sans-serif'; ctx.textAlign='center';
      ctx.fillText('沿原反射光方向入射', outX, outY-10);
      ctx.fillStyle='rgba(255,125,125,.9)'; ctx.font='12px sans-serif'; ctx.textAlign='center';
      ctx.fillText('沿原入射光方向射出', inX, inY-10);
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle='#ffd166';
    ctx.beginPath(); ctx.arc(ox,oy,5,0,7); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle='rgba(10,14,30,.75)'; roundRectPath(ctx,w*0.5-80,12,160,26,8); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='bold 13px sans-serif'; ctx.textAlign='center';
    ctx.fillText(phase===0?'① 原光路':'② 逆向入射，原路返回', w*0.5, 30);
    ctx.restore();
  }

  function draw(now){
    const {ctx,w,h} = g;
    ctx.clearRect(0,0,w,h);
    const bg = ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0a1130'); bg.addColorStop(1,'#101a3d');
    ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
    if(mode==='law') drawLaw(ctx,w,h,now);
    else if(mode==='types') drawTypes(ctx,w,h,now);
    else drawReversible(ctx,w,h,now);
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', ()=>{ g=fitCanvas(cv,300); });
  requestAnimationFrame(draw);
})();

/* ============================================================
   模块四：趁热打铁 —— 小练习
   ============================================================ */
(function(){
  const quizEl = document.getElementById('quiz');
  const fbEl = document.getElementById('fb');
  const qidxEl = document.getElementById('qidx');
  const nextBtn = document.getElementById('nextQ');

  const questions = [
    {
      stem: '入射光线与镜面的夹角是 30°，那么入射角是多少？',
      opts: ['30°', '60°', '90°', '120°'],
      ans: 1,
      fb: '<b>入射角是入射光线与法线的夹角</b>，不是与镜面的夹角。法线垂直于镜面，所以入射角 = 90° − 30° = 60°。这是最容易踩的坑！'
    },
    {
      stem: '一束光射到平面镜上，入射角增大 10°，反射光线与入射光线的夹角会怎样变化？',
      opts: ['增大 10°', '增大 20°', '减小 10°', '不变'],
      ans: 1,
      fb: '反射角始终等于入射角。入射角增大 10°，反射角也增大 10°，两者之间的夹角 = 入射角 + 反射角，所以增大了 <b>20°</b>。'
    },
    {
      stem: '回到开头的问题：夜晚背着月光走，为什么暗的地方反而是水？',
      opts: [
        '水面发生了镜面反射，反射光几乎没有进入人眼',
        '水面发生了漫反射，反射光进入了人眼',
        '水面不反射光，所以是暗的',
        '路面发生了镜面反射，光全部进入了人眼'
      ],
      ans: 0,
      fb: '水面平滑，发生<b>镜面反射</b>：背着月光走时，水面的反射光朝前方射去，几乎没有光进入眼睛，所以看起来是暗的；路面粗糙发生漫反射，总有一部分光进入眼睛，反而显得亮一些。'
    },
    {
      stem: '黑板「反光」时，为什么看不清黑板上的字？',
      opts: [
        '因为黑板发生了镜面反射，强光把字盖住了',
        '因为黑板发生了漫反射，字变模糊了',
        '因为字本身不发光，所以看不见',
        '因为教室太暗，光线不够'
      ],
      ans: 0,
      fb: '黑板局部被磨得光滑，发生<b>镜面反射</b>，强光集中在某一方向反射进入眼睛，把粉笔字的漫反射光“盖住”了，所以看起来一片白、看不清字。'
    },
    {
      stem: '为什么能从各个方向看到本身不发光的课本？',
      opts: [
        '因为课本表面光滑，发生了镜面反射',
        '因为课本表面粗糙，发生了漫反射',
        '因为课本自己能发光',
        '因为光绕过了课本进入眼睛'
      ],
      ans: 1,
      fb: '课本纸面凹凸不平，发生<b>漫反射</b>：平行光照射后，反射光向四面八方散开，所以无论从哪个角度看，都有光进入眼睛，能看清课本。'
    }
  ];

  let qi = 0, answered = false;

  function render(){
    answered = false;
    const q = questions[qi];
    quizEl.innerHTML = '<div class="stem">' + q.stem + '</div>' +
      q.opts.map((o,i)=>'<button class="opt" data-i="'+i+'">'+String.fromCharCode(65+i)+'．'+o+'</button>').join('');
    fbEl.classList.remove('show');
    fbEl.innerHTML = '';
    qidxEl.textContent = '第 ' + (qi+1) + ' / ' + questions.length + ' 题';
    nextBtn.style.visibility = 'hidden';
    quizEl.querySelectorAll('.opt').forEach(btn=>{
      btn.addEventListener('click', ()=>onPick(btn));
    });
  }

  function onPick(btn){
    if(answered) return;
    answered = true;
    const i = +btn.dataset.i;
    const q = questions[qi];
    const opts = quizEl.querySelectorAll('.opt');
    opts.forEach(o=>o.classList.add('dim'));
    if(i === q.ans){
      btn.classList.add('right');
      fbEl.innerHTML = '✅ 答对了！<br>' + q.fb;
    } else {
      btn.classList.add('wrong');
      opts[q.ans].classList.remove('dim');
      opts[q.ans].classList.add('right');
      fbEl.innerHTML = '❌ 再想想——正确答案是 ' + String.fromCharCode(65+q.ans) + '。<br>' + q.fb;
    }
    fbEl.classList.add('show');
    nextBtn.style.visibility = 'visible';
    nextBtn.textContent = qi < questions.length-1 ? '下一题' : '再练一遍';
  }

  nextBtn.addEventListener('click', ()=>{
    qi = (qi + 1) % questions.length;
    render();
  });

  render();
})();
