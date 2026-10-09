'use strict';
/* c4s5 光的色散 · 渲染层（R12：暖黄满幅墙+整屏木纹桌带，参照 PhET 风格） */
(function(){
var R=window.DSP={W:0,H:0,by:0,fy:0,ctx:null,mode:'m1',source:null,prism:null,sourceOn:false,showRays:true,showLabels:false,dragHint:true,R:255,G:255,B:255,ripple:{t0:0,x:0,y:0},sunR:40,sunHover:false,bandX0:null,bandX1:null,faceW:null};
var C7=['#ff0000','#ff7f00','#ffff00','#00a000','#0066ff','#4b0082','#9400d3'];
var L7=['红','橙','黄','绿','蓝','靛','紫'];
function ray(c,x1,y1,x2,y2,col,w,a){
  c.strokeStyle=col; c.globalAlpha=a||0.85; c.lineWidth=w||2.2; c.lineCap='round';
  c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke(); c.globalAlpha=1;
}
function drawArrowCross(c,x,y){
  c.strokeStyle='#22c55e'; c.lineWidth=2; var s=18;
  [[0,-s],[0,s],[-s,0],[s,0]].forEach(function(d){
    c.beginPath(); c.moveTo(x,y); c.lineTo(x+d[0],y+d[1]); c.stroke();
    var ang=Math.atan2(d[1],d[0]);
    c.save(); c.translate(x+d[0],y+d[1]); c.rotate(ang);
    c.beginPath(); c.moveTo(0,0); c.lineTo(-7,3); c.lineTo(-7,-3); c.closePath(); c.fillStyle='#22c55e'; c.fill(); c.restore();
  });
}
function wallGeom(){
  var W=R.W;
  return {wxMid:0.74*W,wyT:0.12*R.H,wyB:R.by+40};
}
function drawRoom(c){ PROPS.room_25d(c,R.W,R.H,{fy:R.fy}); }
function drawDesk(c){ PROPS.wood_desk(c,R.W,R.H,{by:R.by,fy:R.by+109,x0:0,x1:R.W*0.5,bend:true,legTo:R.fy}); }
function prismMidY(){
  var r=R.prism.h*0.42, th=(R.prism.deg*1.6+30)*Math.PI/180;
  var s0=Math.sin(th), s1=Math.sin(th+2*Math.PI/3), s2=Math.sin(th+4*Math.PI/3);
  var maxs=Math.max(s0,s1,s2), mins=Math.min(s0,s1,s2);
  return R.prism.y-0.5*R.prism.h-0.15*r*(maxs-mins);
}
function prismSilX(){ var s=PROPS.silhouetteX(R.prism.x, R.prism.h*0.42, R.prism.deg*1.6+30); return {L:s.L, Rr:s.R}; }
function wallHits(){
  var w=wallGeom();
  var wxMid=w.wxMid, wyT=w.wyT, wyB=w.wyB;
  var exitY=prismMidY();
  var elev=Math.atan2(exitY-R.source.y, R.prism.x-R.source.x);
  var D=wxMid-R.prism.x;
  var shiftRaw=D*Math.tan(elev);
  var shift=Math.max(wyT-(R.prism.y-R.prism.h)+24, Math.min(wyB-R.prism.y-24, shiftRaw));
  var bT=Math.max(R.prism.y-R.prism.h+shift, wyT);
  var bB=Math.min(R.prism.y+shift, wyB);
  var bandMid=(bT+bB)/2;
  var vOff=bB<=bT;
  var hits=[];
  for(var i=0;i<7;i++){
    var az=(R.prism.deg*0.3+(i-3)*3)*Math.PI/180;
    var lateral=D*Math.tan(az);
    hits.push({i:i,x:wxMid+lateral,y:0,lateral:lateral,onFace:!vOff});
  }
  var minX=hits[0].x, maxX=hits[6].x, shiftX=0;
  if(minX<0.62*R.W+24) shiftX=0.62*R.W+24-minX;
  else if(maxX>R.W-6) shiftX=R.W-6-maxX;
  hits.forEach(function(q){
    q.x+=shiftX;
    var sxx=0.85+0.5*Math.max(0,q.x-0.62*R.W)/(R.W-0.62*R.W);
    q.y=bandMid+(q.i-3)*3*sxx;
  });
  R.faceW=340; R.faceXMid=wxMid; R.bandY=bandMid;
  return {hits:hits,wyT:wyT,wyB:wyB,wxMid:wxMid,bT:bT,bB:bB,bandMid:bandMid,elev:elev,vOff:vOff,D:D,shift:shift,exitY:exitY};
}
R.draw=function(){
  var c=R.ctx,W=R.W,H=R.H;if(!c)return;
  c.clearRect(0,0,W,H);
  if(R.mode==='m2'){
    var col='rgb('+R.R+','+R.G+','+R.B+')',lum=(R.R*0.299+R.G*0.587+R.B*0.114)/255;
    c.fillStyle='#000'; c.fillRect(W*0.05,H*0.12,W*0.9,H*0.56);
    var cx=W/2, cy=H*0.40, r=Math.min(W,H)*0.16, d=r*1.15;
    var cR={x:cx,y:cy-0.577*d}, cG={x:cx-0.5*d,y:cy+0.289*d}, cB={x:cx+0.5*d,y:cy+0.289*d};
    c.save(); c.globalCompositeOperation='lighter';
    c.fillStyle='rgb('+R.R+',0,0)'; c.beginPath(); c.arc(cR.x,cR.y,r,0,7); c.fill();
    c.fillStyle='rgb(0,'+R.G+',0)'; c.beginPath(); c.arc(cG.x,cG.y,r,0,7); c.fill();
    c.fillStyle='rgb(0,0,'+R.B+')'; c.beginPath(); c.arc(cB.x,cB.y,r,0,7); c.fill();
    c.restore();
    c.textAlign='center'; c.font='bold 15px sans-serif'; c.lineWidth=3; c.strokeStyle='rgba(0,0,0,0.5)';
    var full=(R.R===255&&R.G===255&&R.B===255);
    var lbls=[
      {t:'红',x:cR.x,y:cR.y-r*0.45,c:'#ff8787'},
      {t:'绿',x:cG.x-r*0.40,y:cG.y+r*0.30,c:'#8ce99a'},
      {t:'蓝',x:cB.x+r*0.40,y:cB.y+r*0.30,c:'#91d5ff'},
      {t:'黄',x:(cR.x+cG.x)/2,y:(cR.y+cG.y)/2,c:'#ffe066'},
      {t:'青',x:(cG.x+cB.x)/2,y:(cG.y+cB.y)/2+r*0.10,c:'#96f2d7'},
      {t:'品红',x:(cR.x+cB.x)/2,y:(cR.y+cB.y)/2,c:'#eebefa'},
      {t:'白',x:cx,y:cy,c:lum<0.5?'#fff':'#111'}
    ];
    if(full)for(var li=0;li<lbls.length;li++){var L=lbls[li]; c.fillStyle=L.c; c.strokeText(L.t,L.x,L.y); c.fillText(L.t,L.x,L.y);}
    c.fillStyle='rgba(255,255,255,0.85)'; c.font='bold 16px sans-serif';
    c.fillText('混合 '+col,cx,H*0.12+H*0.56-14);
    c.textAlign='left'; R.bandX0=R.bandX1=null; return;
  }
  drawRoom(c);
  if(R.sourceOn){
    var sh=wallHits();
    var sil=prismSilX();
    var aL=Math.max(sil.L+2,R.source.x+24), aR=sil.Rr-2;
    ray(c,R.source.x,R.source.y,aL,sh.exitY,'#ffffff',3.2,0.9);
    if(R.showRays){
      for(var i=0;i<sh.hits.length;i++){
        var h=sh.hits[i];
        ray(c,aR,sh.exitY,h.x,h.y,C7[h.i],2.2,0.85);

      }
    }
    var rd=document.getElementById('read-spread');
    if(!sh.vOff){
      var xs=sh.hits.map(function(q){return q.x;});
      var x0c=Math.min.apply(null,xs), x1c=Math.max.apply(null,xs);
      var bw2=(x1c-x0c)/2, hh0=(sh.bB-sh.bT)/2, mx=(x0c+x1c)/2;
      var xcw=R.W*0.62;
      var sfun=function(x){return 0.85+0.5*Math.max(0,x-xcw)/(R.W-xcw);};
      var hhL=hh0*sfun(x0c), hhR=hh0*sfun(x1c);
      var gc=c.createRadialGradient(mx,sh.bandMid,10,mx,sh.bandMid,bw2+90);
      gc.addColorStop(0,'rgba(255,255,255,0.40)'); gc.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=gc; c.fillRect(mx-bw2-90,sh.bandMid-hhR-90,bw2*2+180,hhR*2+180);
      c.save(); c.filter='blur(6px)'; c.beginPath();
      c.moveTo(x0c,sh.bandMid-hhL); c.lineTo(x1c,sh.bandMid-hhR); c.lineTo(x1c,sh.bandMid+hhR); c.lineTo(x0c,sh.bandMid+hhL); c.closePath();
      var gr=c.createLinearGradient(x0c,0,x1c,0), den=Math.max(1,x1c-x0c);
      sh.hits.forEach(function(q){gr.addColorStop(Math.max(0,Math.min(1,(q.x-x0c)/den)),C7[q.i]);});
      c.fillStyle=gr; c.globalAlpha=0.95; c.fill(); c.restore();
      if(R.showLabels){
        c.font='12px sans-serif'; c.lineWidth=3; c.strokeStyle='rgba(255,255,255,0.85)';
        for(var li=0;li<sh.hits.length;li++){var hq=sh.hits[li]; c.strokeText(L7[hq.i],hq.x+6,sh.bandMid-10); c.fillStyle=C7[hq.i]; c.fillText(L7[hq.i],hq.x+6,sh.bandMid-10);}
      }
      if(rd)rd.textContent=Math.round(x1c-x0c)+'px';
      R.bandX0=x0c; R.bandX1=x1c;
    }else{R.bandX0=R.bandX1=null; if(rd)rd.textContent='0px';}
  }else{R.bandX0=R.bandX1=null;}
  drawDesk(c);
  PROPS.prism(c,R.prism.x,R.prism.y,{h:R.prism.h,angle:R.prism.deg*1.6+30});
  PROPS.sun(c,R.source.x,R.source.y,{r:R.sunR,rays:12,hover:R.sunHover});
  if(R.dragHint){


  }
  if(R.ripple.t0){
    var k=1-(performance.now()-R.ripple.t0)/300;
    if(k<=0){R.ripple.t0=0;}
    else{c.strokeStyle='rgba(37,99,235,'+(0.5*k).toFixed(2)+')'; c.lineWidth=2;
      c.beginPath(); c.arc(R.ripple.x,R.ripple.y,20*(1-k)+6,0,7); c.stroke();}
  }
};
})();
