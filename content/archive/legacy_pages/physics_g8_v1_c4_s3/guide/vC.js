'use strict';
/* c4s3 变体 C · 分步引导版（「跟我做」，设计书 §5：M1 8步 / M2 6步 / M3 6步）
   DOM 控件 → outline 脉冲圈（.guide-hl）；canvas 区域 → 聚光灯遮罩（SVG mask 挖洞）+ 洞旁指示气泡。
   每步 done 满足 → 绿闪庆祝 → 自动进下一步；done=null 的纯观察步走「下一步」按钮手动推进。
   顶部「第 n/N 步」+ 上一步/下一步/退出引导；退出 = 撤遮罩回自由态（§7 中性解说兜底 + steps/errors 照常）。
   M2/M3（含 M1）序列在切模式时重置。每步同时出字幕条（复用 engine.Caption）显示聚焦说明。
   坐标全部运行时取 R 实时字段，resize 自适应；只读 R/DOM。 */
(function(){
var SVGNS='http://www.w3.org/2000/svg';
function start(){
  if(!window.GuideEngine||!window.C4S3_SCRIPT)return;
  var DATA=window.C4S3_SCRIPT;
  var R=window.MRR;
  var LAYER=document.getElementById('guide-layer')||document.body;

  var badge=document.createElement('span');
  badge.className='guide-badge';
  badge.textContent='C · 分步引导';
  LAYER.appendChild(badge);

  /* ---- 聚光灯遮罩（pointer-events:none，不影响 canvas 拖放） ---- */
  var svg=document.createElementNS(SVGNS,'svg');
  svg.setAttribute('class','guide-spot');
  var defs=document.createElementNS(SVGNS,'defs');
  var mask=document.createElementNS(SVGNS,'mask');
  mask.setAttribute('id','guideSpotMask');
  var mRect=document.createElementNS(SVGNS,'rect');
  mRect.setAttribute('x','0');mRect.setAttribute('y','0');
  mRect.setAttribute('width','100%');mRect.setAttribute('height','100%');
  mRect.setAttribute('fill','#fff');
  var holesG=document.createElementNS(SVGNS,'g');
  mask.appendChild(mRect);mask.appendChild(holesG);defs.appendChild(mask);
  var dim=document.createElementNS(SVGNS,'rect');
  dim.setAttribute('x','0');dim.setAttribute('y','0');
  dim.setAttribute('width','100%');dim.setAttribute('height','100%');
  dim.setAttribute('fill','rgba(0,0,0,.35)');
  dim.setAttribute('mask','url(#guideSpotMask)');
  svg.appendChild(defs);svg.appendChild(dim);
  LAYER.appendChild(svg);

  /* ---- 洞旁指示气泡 ---- */
  var spotB=document.createElement('div');
  spotB.className='guide-spotbubble';
  spotB.style.display='none';
  LAYER.appendChild(spotB);

  /* ---- 绿闪庆祝 ---- */
  var flash=document.createElement('div');
  flash.className='guide-flash';
  LAYER.appendChild(flash);

  /* ---- 顶部进度条 ---- */
  var topbar=document.createElement('div');
  topbar.className='guide-topbar';
  topbar.innerHTML='<span class="guide-progress">第 1/1 步</span>'+
    '<span class="guide-btns">'+
      '<button type="button" class="g-nav" id="g-prev">← 上一步</button>'+
      '<button type="button" class="g-nav" id="g-next">下一步 →</button>'+
      '<button type="button" class="g-nav g-exit" id="g-exit">退出引导</button>'+
    '</span>';
  LAYER.appendChild(topbar);
  var progEl=topbar.querySelector('.guide-progress');
  var btnPrev=topbar.querySelector('#g-prev');
  var btnNext=topbar.querySelector('#g-next');
  var btnExit=topbar.querySelector('#g-exit');

  var cap=new GuideEngine.Caption();
  var guiding=true;
  var idx={m1:0,m2:0,m3:0};
  var completed={m1:{},m2:{},m3:{}};
  var advTimer=null;
  var curHlEl=null;

  GuideEngine.init({
    onIntro:function(mode,intro){
      if(intro&&intro.text)cap.show(intro.text,'intro',intro.audio);
    },
    onStep:function(step){
      if(!guiding)cap.show(step.say,'step',step.audio);/* 引导中聚焦说明优先，退出后步骤解说照常 */
    },
    onError:function(err){
      cap.show(err.fix,'error',err.audio);
    },
    onFree:function(free){
      if(!guiding)cap.show(free.note,'free',null);/* §5：C 版关闭态用 §7 中性解说兜底 */
    },
    onModeChange:function(mode){
      idx[mode]=0;completed[mode]={};/* M2/M3 序列切模式重置 */
    }
  });

  btnPrev.addEventListener('click',function(){
    var mode=curMode();if(!mode)return;
    if(idx[mode]>0){idx[mode]--;completed[mode][idx[mode]+1]=false;}
  });
  btnNext.addEventListener('click',function(){
    var mode=curMode();if(!mode)return;
    var seq=DATA.cSequence[mode];
    if(seq&&idx[mode]<seq.length-1)idx[mode]++;
  });
  btnExit.addEventListener('click',function(){
    guiding=false;
    svg.style.display='none';
    spotB.style.display='none';
    topbar.style.display='none';
    clearHl();
  });

  function curMode(){return (R&&R.mode)||null;}

  /* ---- 表达式求值（数值/对象路径，缓存编译） ---- */
  var ceCache={};
  function ceval(v){
    if(typeof v==='number')return v;
    if(typeof v==='string'){
      if(!Object.prototype.hasOwnProperty.call(ceCache,v)){
        try{ceCache[v]=new Function('R','return ('+v+');');}catch(e){ceCache[v]=null;}
      }
      var fn=ceCache[v];
      if(!fn)return null;
      try{return fn(R);}catch(e){return null;}
    }
    if(v&&typeof v==='object'){
      var o={};for(var k in v)o[k]=ceval(v[k]);return o;
    }
    return null;
  }
  function elVisible(el){return !!el&&!!(el.offsetParent||el.getClientRects().length);}
  function clearHl(){if(curHlEl){curHlEl.classList.remove('guide-hl');curHlEl=null;}}

  /* ---- 目标几何：holes（canvas 视口坐标）+ domEl ---- */
  function wrapOff(){
    var w=document.getElementById('scene-wrap');
    var r=w?w.getBoundingClientRect():{left:0,top:34};
    return {dx:r.left,dy:r.top};
  }
  function holeOf(h,pad){
    if(h.rect!=null){
      var r=ceval(h.rect);
      if(!r||typeof r!=='object')return null;
      var x=+r.x,y=+r.y,w=+r.w,hh=+r.h;
      if(!isFinite(x)||!isFinite(y)||!isFinite(w)||!isFinite(hh))return null;
      return {type:'rect',x:x-pad,y:y-pad,w:w+pad*2,h:hh+pad*2};
    }
    var cx=ceval(h.cx),cy=ceval(h.cy),rr=ceval(h.r);
    if(cx==null||cy==null||!isFinite(cx)||!isFinite(cy))return null;
    return {type:'circle',cx:cx,cy:cy,r:(rr!=null&&isFinite(rr))?Math.max(8,rr):30};
  }
  function geomOf(tg){
    var holes=[],domEl=null,useMask=false;
    if(!tg)return {holes:holes,domEl:domEl,useMask:useMask};
    var pad=tg.pad||0;
    if(tg.kind==='dom'){
      domEl=document.querySelector(tg.el);
      if(domEl&&!elVisible(domEl)&&tg.fallback){
        var f=document.querySelector(tg.fallback);
        if(f)domEl=f;
      }
    }else if(tg.kind==='canvas'){
      useMask=true;
      var list=tg.holes||[tg];
      for(var i=0;i<list.length;i++){
        var hh=holeOf(list[i],pad);
        if(hh)holes.push(hh);
      }
      if(tg.dom)domEl=document.querySelector(tg.dom);
    }else if(tg.kind==='wedge'){
      useMask=true;
      /* 托盘眼睛件（右槽）→ 反射光束区域（R.m2.wedgePoly 外接矩形） */
      if(R.m2&&R.m2.tray&&R.m2.eye&&R.m2.eye.state==='tray'){
        var s1=R.m2.tray.slots[1];
        if(s1)holes.push({type:'circle',cx:s1.x,cy:s1.y,r:34});
      }
      var poly=R.m2?R.m2.wedgePoly:null;
      if(poly&&poly.length>=3){
        var minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
        for(var j=0;j<poly.length;j++){
          var p=poly[j];
          if(p.x<minX)minX=p.x;if(p.x>maxX)maxX=p.x;
          if(p.y<minY)minY=p.y;if(p.y>maxY)maxY=p.y;
        }
        if(isFinite(minX))holes.push({type:'rect',x:minX-10,y:minY-10,w:maxX-minX+20,h:maxY-minY+20});
      }
    }
    return {holes:holes,domEl:domEl,useMask:useMask};
  }

  /* ---- 遮罩 holes 渲染（canvas 坐标 → 视口坐标） ---- */
  var lastHoleSig='';
  function renderHoles(holes,flashMode){
    var list=holes;
    if(flashMode&&holes.length>=2){
      list=[holes[Math.floor(performance.now()/600)%holes.length]];/* 两块区域轮闪 */
    }
    var off=wrapOff();
    var sig=list.map(function(h){
      return h.type==='circle'
        ?'c'+h.cx.toFixed(1)+','+h.cy.toFixed(1)+','+h.r.toFixed(1)
        :'r'+h.x.toFixed(1)+','+h.y.toFixed(1)+','+h.w.toFixed(1)+','+h.h.toFixed(1);
    }).join(';')+'@'+off.dx+','+off.dy;
    if(sig===lastHoleSig)return list;
    lastHoleSig=sig;
    while(holesG.firstChild)holesG.removeChild(holesG.firstChild);
    list.forEach(function(h){
      var n;
      if(h.type==='circle'){
        n=document.createElementNS(SVGNS,'circle');
        n.setAttribute('cx',(h.cx+off.dx).toFixed(1));
        n.setAttribute('cy',(h.cy+off.dy).toFixed(1));
        n.setAttribute('r',Math.max(8,h.r).toFixed(1));
      }else{
        n=document.createElementNS(SVGNS,'rect');
        n.setAttribute('x',(h.x+off.dx).toFixed(1));
        n.setAttribute('y',(h.y+off.dy).toFixed(1));
        n.setAttribute('width',Math.max(8,h.w).toFixed(1));
        n.setAttribute('height',Math.max(8,h.h).toFixed(1));
        n.setAttribute('rx','10');
      }
      n.setAttribute('fill','#000');
      holesG.appendChild(n);
    });
    return list;
  }

  /* ---- 气泡定位：洞旁（优先右侧，放不下换左侧），DOM 步在控件上方 ---- */
  function placeBubble(text,holes,domEl){
    spotB.textContent=text;
    spotB.style.display='block';
    var bw=spotB.offsetWidth,bh=spotB.offsetHeight;
    var vw=window.innerWidth,vh=window.innerHeight;
    var bx,by;
    if(domEl&&elVisible(domEl)){
      var r=domEl.getBoundingClientRect();
      bx=r.left+r.width/2-bw/2;
      by=r.top-bh-12;
      if(by<40)by=r.bottom+12;
    }else if(holes.length){
      var h=holes[0];
      var off=wrapOff();
      var cx=h.type==='circle'?h.cx+off.dx:h.x+off.dx+h.w/2;
      var cy=h.type==='circle'?h.cy+off.dy:h.y+off.dy+h.h/2;
      var right=h.type==='circle'?cx+h.r:cx+h.w/2;
      var left=h.type==='circle'?cx-h.r:cx-h.w/2;
      bx=right+14;
      if(bx+bw>vw-8)bx=left-14-bw;
      if(bx<8)bx=8;
      by=Math.min(Math.max(40,cy-bh/2),vh-bh-110);
    }else{
      bx=vw/2-bw/2;by=80;
    }
    spotB.style.left=Math.round(Math.max(8,bx))+'px';
    spotB.style.top=Math.round(by)+'px';
  }

  /* ---- 主渲染循环 ---- */
  function frame(){
    var mode=curMode();
    if(!guiding||!mode){requestAnimationFrame(frame);return;}
    var seq=DATA.cSequence[mode];
    if(!seq){requestAnimationFrame(frame);return;}
    var i=idx[mode];
    if(i>=seq.length){
      progEl.textContent='引导完成 🎉 自由探索吧';
      svg.style.display='none';
      spotB.style.display='none';
      clearHl();
      requestAnimationFrame(frame);
      return;
    }
    var step=seq[i];
    progEl.textContent='第 '+(i+1)+'/'+seq.length+' 步';
    btnPrev.disabled=(i===0);
    btnNext.disabled=(i>=seq.length-1);

    var g=geomOf(step.target);
    /* DOM 高亮 */
    if(g.domEl&&elVisible(g.domEl)){
      if(curHlEl!==g.domEl){clearHl();g.domEl.classList.add('guide-hl');curHlEl=g.domEl;}
    }else clearHl();
    /* 聚光灯 */
    if(g.useMask&&g.holes.length){
      svg.style.display='block';
      var shown=renderHoles(g.holes,!!(step.target&&step.target.flash));
      placeBubble(step.focus,shown,g.domEl);
    }else{
      svg.style.display='none';
      lastHoleSig='';
      placeBubble(step.focus,[],g.domEl);
    }
    /* 完成判定 → 绿闪 → 自动进下一步（done=null 的纯观察步等「下一步」按钮） */
    if(step.done&&!completed[mode][i]&&GuideEngine.evalExpr(step.done)){
      completed[mode][i]=true;
      flash.classList.remove('go');
      void flash.offsetWidth;
      flash.classList.add('go');
      if(advTimer)clearTimeout(advTimer);
      advTimer=setTimeout(function(){
        advTimer=null;
        if(guiding&&curMode()===mode&&idx[mode]===i)idx[mode]++;
      },480);
    }
    /* 字幕条：空闲时回填聚焦说明（错误/自由玩字幕可临时接管，过期后自动回来） */
    if(cap.isIdle())cap.show(step.focus,'step',null);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();
