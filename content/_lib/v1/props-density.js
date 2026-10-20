(function(global){
'use strict';
const PROPS = global.PROPS = global.PROPS || {};
const P25 = PROPS.P25 || {dx: 0.35, dy: -0.35};
const rand = PROPS.rand || function(seed){
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/* ============================================================
 * props-density.js — 第六章「质量与密度」标准器材件 v12（c6s34 修复轮9，14件）
 * v12 变更清单（2026-10-20，c6s34 修复轮9 任务书，蔡总 18:55 反馈 N1；已有件 opt API 与返回几何字段名零变化）：
 *   ~ beaker_ice 杯口椭圆内部上下分色根治（蔡总 N1）：v11 侧壁填充 path 顶边=水平直弦，弦以下（含杯口椭圆下半内部）叠玻璃渐变、
 *     弦以上（杯口椭圆上半内部）无填充露页面底色 → 杯口内部被顶弦切两截色；
 *     改：①绘制第一步先 fill 整个杯口椭圆（与侧壁共用同一水平渐变 gg → 边界无缝）②侧壁填充 path 顶边改杯口下半弧
 *     （moveTo 左切点 → ellipse(topY, π→0, ccw) 经下弧到右切点 → lineTo 右壁底 → 底椭圆前弧 → lineTo 左壁回 topY → closePath）；
 *     次序总表：①杯口内壁填充(gg) → ②侧壁+底填充(gg) → ③内容物(盐/水/冰) → ④液面/盐面顶面椭圆 → ⑤所有描边最后（v11 M2 描边最后次序不变）；
 *     salt/pour/liquidColor/contents/返回几何零改动
 *   ~ cylinder_grad 同族同治（背层色浅、色差较轻）：先 fill 口内壁椭圆 (x, yc, w/2−wall, ry) 用背层色 rgba(220,240,246,0.30)，
 *     背层主体 path 顶边改口椭圆下半弧（beaker 同手法）再下到底；水体/inside/contents/刻度/rect 契约零改动、描边最后次序保持
 *   = 其余件零改动；DENSITY_IDS 14 件不变；gallery ?v=11→12
 * v11 变更清单（2026-10-20，c6s34 修复轮8 任务书，蔡总 18:13 三条反馈 M1-M3；已有件 opt API 与返回几何字段名零变化）：
 *   ~ beaker_ice 盐堆 2.5D 化（蔡总 M1）：旧盐堆顶=quadraticCurveTo 拱线+近白平 fill(#f7f6f0) 与上方浅玻璃渐变几乎同色 → 直立态看成"满杯"；
 *     改与水体同族画法——盐体 fill(略深米白 #efece2) + 盐面顶面椭圆 fill(亮米白 #fbfaf5，ry=该高度半宽×0.28 与水面同族) + 盐面椭圆描边(rgba(170,165,150,0.85))；
 *     直立态盐面椭圆世界水平，pour 态沿用反转语义；颗粒点缀保留(clip 盐体内)；初始 2/3 高度语义不变（页面传 salt 值不动）
 *   ~ beaker_ice/cylinder_grad 椭圆"两截色"根治（蔡总 M2，全族绘制次序规则）：①杯/筒体半透明 fill → ②内容物(盐/水/inside/contents 回调)体 fill →
 *     ③各液面/盐面顶面椭圆 fill → ④所有椭圆与轮廓描边最后画(最上层，单一 strokeStyle 不被任何半透明层叠色)；
 *     水体顶边改贴合液面椭圆下半弧（旧平直顶弦切过已画椭圆=两截色根因）；验收目视：任一椭圆一周颜色均匀
 *   ~ cylinder_grad 口/底椭圆加宽（蔡总 M3）：筒口 ry=wall*0.9(ry/rx≈0.10) → ry=w*0.14 烧杯族同比例，中心 yc=y−h+ry（顶缘仍 y−h）；
 *     底 ryB=w*0.12→w*0.14、botY=y−ryB*0.2 语义保留；inTop=y−h+ry+wall、inBot=botY 随新几何单源重算
 *     （rect 字段名 inL/inR/inTop/inBot/wy 与刻度/水位映射/liquidColor/contents 回调契约不变）；水面改顶面椭圆 fill+描边同族（替旧 quadratic 拱线顶弦）
 *   = 其余件（balance_pan/stone/salt_jar/seed_grains 等）零改动；DENSITY_IDS 14 件不变；gallery ?v=10→11
 * v10 变更清单（2026-10-20，c6s34 修复轮4 任务书，蔡总 12:51 五条反馈 J1-J5；已有件 opt API 与返回几何字段全部不变）：
 *   ~ balance_pan 底座木→金属（蔡总 J2）：暖棕木渐变三色（旧 a3815c 系）→ 金属灰 #c9ced6/#9aa1ab/#6f747c 三段（与立柱 #9ca3af 同族）
 *     + 顶面一条浅色高光线（金属反光语义）；形状/圆角/尺寸/锚点/返回字段全部不变；c6s1/c6s2 消费件同步变金属（蔡总意图=全库统一）
 *   ~ cylinder_grad 筒底平面→2.5D 椭圆底（蔡总 J3，照 beaker_ice v6 底处理先例）：ryB=w*0.12 族、底椭圆中心 botY=y−ryB*0.2、
 *     前半弧亮线、侧壁切点连到底椭圆切点、前弧落点略沉、锚点不变；水体/inside/contents 的 inBot 改=底椭圆中心 botY（v=0 刻度线在 inBot）；
 *     刻度/筒口/高光/liquidColor/contents 回调契约（rect 字段名 inL/inR/inTop/inBot/wy 不变）全部保留
 *   ~ beaker_ice 加 salt/pour 参数（c6s3 盐杯统一用烧杯件装盐，蔡总 J4/J5；纯新增参数，不传=渲染与 v9 逐像素等价）：
 *     opt.salt 0~100（缺省 0=不画）杯内白色盐粒堆积——底椭圆上起、高度=salt 百分比×内腔高、sin 伪随机细颗粒、确定性同参数同图；
 *     与 ice/water 共存时盐堆在下层；pour 态盐面保持世界水平（salt_jar 同语义）；
 *     opt.pour 0~1（缺省 0）整体绕锚点（底面中心）旋转 pour×45°（同 salt_jar.pour 语义）；件本身不画粒流（流由页面画）
 *   ~ DENSITY_IDS 14 件不变；gallery ?v=9→10
 * v9 变更清单（2026-10-20，c6s34 任务书，蔡总 05:59 拍板：3 新件 + 2 件扩参，已有件 opt API 全向后兼容、缺省路径渲染零变化）：
 *   + stone 小石块：不规则多面体 2.5D（投影常量同 material_block dx=0.35d/dy=-0.35d），灰青 #8a9a94 系 + sin 伪随机斑点棱角纹；
 *     顶点轮廓 seed 确定性生成（顶点数 6~8、半径/角度扰动，同 seed 永远同形）；opt: size=60 / seed=1 / wet(0~1 湿水态加深约15%+顶面高光增强)
 *   + salt_jar 盐罐：广口玻璃罐（玻璃族同 cylinder_grad/beaker_ice）+ 白盐堆积（sin 伪随机细颗粒）；saltLevel=80(0~100) / pour(0~1 绕底面中心倾 ~45°，
 *     pour>0.3 罐口确定性盐粒流 4 条抛物线白点) / h=120；无 mount（主动件）；返回 {w,h,mouth:{x,y}}（罐口世界坐标）
 *   + seed_grains 种粒（Q6 选种联动专用）：矩形液体区域内 饱满粒(#d9b36c 系,ρ≈1.3 恒沉底) + 空瘪粒(#b8975a 系,更小更扁)；
 *     组件内常量 HOLLOW_CRIT=1.05：rho≥1.05 时空瘪粒 t=1 → 液面下缘轻微悬浮；t 浮沉 smoothstep 插值（禁回弹震荡）；opt: rho/level/w/h/count=12(饱满8+空瘪4)/t/seed
 *   ~ beaker_ice / cylinder_grad 加 opt.liquidColor：水体渐变/水面线色改由 liquidColor 派生——{top,bottom,line} 对象或单色字符串
 *     （单色派生：top=原样、bottom=加深、line=提亮）；缺省不传 = 现蓝系原值，c6s1/c6s2 页面不传此参数渲染完全不变（盐水入量筒与烧杯同色用）
 *   ~ beaker_ice / cylinder_grad 加 opt.contents(ctx,rect) 绘制钩子：水体（cylinder 含 inside 占位）之后、前壁描边/竖高光/筒口（beaker 为冰块/杯口）之前调用，
 *     页面把种粒/石块画进液体里；save/restore 组件包办、try/catch 静默失败；
 *     rect：cylinder={x,w,inL,inR,inTop,inBot,wy}（water=0→wy=inBot）；beaker={x,w,yTop,yBot,rxT,rxB,halfAt,wy}（water≤0.01→wy=yBot）
 *   ~ DENSITY_IDS 11→14 件（+ stone / salt_jar / seed_grains）；gallery ?v=8→9
 * v8 变更清单（2026-10-20，蔡总 R39：烧杯杯口两处残留线删除；opt API 与返回几何字段全部不变，页面零改动消费）：
 *   ~ beaker_ice R39-a 杯口中间横线：侧壁段(2) fill 与 stroke 分离——fill 用闭路径（顶弦仅填色不可见）；
 *     stroke 另开路径只描三边（左壁 moveTo→lineTo 左底→ellipse 底前弧→lineTo 右切点），不 closePath 不描顶弦（蔡总图一）
 *   ~ beaker_ice R39-b 杯口外侧小斜线：删段(5)喙三角（原 moveTo(x−rxT+1,…) 三行 fill+stroke），v6「喙三角保留」注释作废；
 *     rim 椭圆完整描边(771)与水体 guard(water>0.01)保留，返回无值不变
 * v7 变更清单（2026-10-20，蔡总 R37/R38：烧杯杯口横线删除 + 加热底座顶底弧一致；opt API 与返回几何字段全部不变，页面零改动消费）：
 *   ~ heat_source R38：底椭圆 ryB=w*0.08 → ryB=ryT(=w*0.16)，顶/底椭圆 ry 相等→台面不再视觉倾斜（蔡总图四）；
 *     底弧路径(866)/底弧描边(879)/体块渐变末端(869)均引用 ryB 变量→自动跟随，段内无第二处硬编码 0.08；
 *     boxTop(=y−h+ryT)/botCy(=boxTop+w*0.34)/knob 均不含 ryB → 返回 {w,h,boxTop,knob} 数值精确不变（前弧落点随 ryB 下移 w*0.08，底座略沉，锚点/boxTop 不动）
 *   = beaker_ice R37：水体段 if(water>0.01) 守卫 v6 已在（734 行）——water=0（ice=100 全冰）时水体柱/水面线/水面椭圆整段跳过，
 *     杯口只余 rim 椭圆(771)，无「中间横线」（蔡总图三）；本轮仅 gallery 追加 ice:100/water:0 审核变体，库件守卫复用零改动
 * v6 变更清单（2026-10-19，蔡总 R33：杯底/加热底座是平面直线→两件 2.5D 化，opt API 与返回几何字段全部不变，页面零改动消费）：
 *   ~ beaker_ice 2.5D 重写：底椭圆(rx=w/2,ry=w*0.14,前弧亮线)+锥度侧壁(内收4%,左亮右暗渐变+左壁白高光竖条)
 *     +水体(水面椭圆亮边)+冰块堆底椭圆中心(基线 y−ry*0.5,确定性 rand 种子不变)+杯口椭圆描边/喙三角保留；段内直线底边清零
 *   ~ heat_source 2.5D 重写：顶盘椭圆(rx=w/2,ry=w*0.16,金属径向渐变,level>0 盘心橙红热晕)+前立面体块(h_body=w*0.34,
 *     #4b5563→#374151,左亮右暗两段)+底椭圆前弧落地(前弧恰落 y)+旋钮/指示灯随新立面居中；boxTop=顶盘椭圆中心 y(语义不变,数值=y−h+ryT)；
 *     返回 {w,h,boxTop,knob} 字段不变
 * v5 变更清单（2026-10-19，蔡总反馈 R31：页面自绘真旋钮，库件旋钮让位）：
 *   ~ heat_source 增加 opt.knob===false：跳过自绘旋钮与档位指示灯（底座/热盘/热晕照常画）；
 *     缺省/数值(角度°) 保持现行为，返回几何不变 {w,h,boxTop,knob:{x,y,r}}（knob 圆心坐标仍返回，页面自绘旋钮可复用定位）
 * v4 变更清单（2026-10-19，蔡总四轮反馈 R24：挂载语义改盘心 + 两处导出欠账）：
 *   + PROPS.weightGeom(g,u) 导出命名空间（v3 单源函数补挂，页面禁复制公式）
 *   + balGeom/balance_pan 返回补 panH 字段（盘厚 =Math.max(4,h*0.03)，与 panL/panR 同级；替代页面取 G._.panH 内部量）
 *   ~ balance_pan 挂载回调 y 语义改盘心：panL/panR 回调第三参 py-panH（盘顶）→ py（盘椭圆中心）；
 *     挂载件底面中心=盘心 y，坐进盘里而非悬在盘沿上（R24：物体底面椭圆中心要跟托盘椭圆中心重合）；balGeom 返回对象不变（panL.y 本就是盘心）
 * v3 变更清单（2026-10-19，蔡总三轮反馈 R11/R12：砝码几何统一+几何返回补全）：
 *   + weightGeom(g,u) 砝码几何单源：{w:u×(g/100)^⅓, h:w×0.55}——直径与高度都随规格变（立方根律=同密度金属真实比例）；
 *     weight_single 与 weight_set 盒内槽位都调它，同一枚砝码两处造型一致（修「形状都变了」）
 *   ~ weight_single 默认 u 36→44（蔡总：砝码太小）
 *   ~ weight_set 盒默认 w 200→240；盒内六枚按 w 降序排槽（大左小右），槽位 u=(w-2pad)/4.9 单点派生；
 *     pick 态盒外砝码同用槽位几何；返回 {w, boxH, slots:[{id,cx,cy,r,hgt}]}（cy=底面y，r=w/2，页面命中/missing 联动，禁复制盒内公式）
 *   + PROPS.balGeom(x,y,h,tilt[,riderG]) 导出：天平几何单源，返回与 balance_pan 绘制 return 同构对象
 *     {beamY, panL, panR, rider:{x0,x1,y,g2x}, nutL, nutR, dial, base}；balance_pan 绘制改调它（页面本地副本应删）
 *   ~ heat_source 返回 {w, h, boxTop, knob:{x,y,r}}（顶盘 y + 旋钮圆心/半径，页面点旋钮命中用）
 *   ~ density_scale 返回 {w, h}（h=含标题条总高，页面避让它用；collapsed 态同样返回）
 * v2 变更清单（2026-10-19，蔡总首轮体验反馈）：
 *   + weight_single 单枚砝码原语：g∈{5,10,20,50,100} / u(100g基准宽) / held(镊子夹持) / label(刻字,缺省true)；返回 {w,h}
 *   + weight_set opt.missing：已拖出盒外的砝码 id 数组（['100','50','20','20b','10','5'] 同源），盒内不画；pick 保留兼容
 *   ~ balance_pan 大尺寸清晰刻度：标尺每1g长刻度+数字、每0.2g短刻度，全部线长/字高 ∝ h（禁固定px）；opt.labels===false 才隐藏数字；分度盘中位红色长刻度
 *   ~ balance_pan 返回几何对象（v3 起由 balGeom 单源）
 *   ~ clay opt.morph 连续实数0-2（0球1饼2条，超椭圆关键帧插值=直接揉捏）；shape 保留为别名；返回 {w,h}
 * 锚点约定：一律底面中心，(x,y)=底边中点（第13条）
 * 确定性绘制：禁原生随机数，纹理/冰块用 PROPS.rand(seed) sin 伪随机
 * 组件清单：
 *   1. balance_pan    托盘天平(P0)  opt: h=220 / tilt(-8~+8°) / rider(0-5g) / riderShow / labels(false隐藏刻度数字) / panL,panR(挂载回调 fn(ctx,cx,cy,panR)，v4 起 cy=盘椭圆中心)；返回 balGeom 同构几何对象（含 panH）
 *   2. weight_set     砝码组(P0)    opt: w=240 / open(盒盖开合,默认开) / pick('100'|'50'|'20'|'10'|'5' 镊子夹起) / missing(已拖出id数组)；返回 {w,boxH,slots}
 *   3. rider          游码特写(P0)  opt: pos(0-1) / scaleLen=160
 *   4. material_block 材质块(P0)    opt: size=60 / mat(aluminum|iron|wood|ice|gold|copper|wax|styrofoam|pvc|brick) / label / mystery
 *   5. cylinder_grad  量筒(P1)      opt: h=240 / cap=100 / div=10 / water(0-1) / inside(浸没块占位色) / liquidColor(v9) / contents(v9 钩子 fn(ctx,rect))
 *   6. density_scale  密度标尺(P1)  opt: w=420 / value(0-10 红标) / marks / collapsed；返回 {w,h}
 *   7. clay           橡皮泥(P2)    opt: size=70 / morph(0-2连续,shape别名)；返回 {w,h}
 *   8. beaker_ice     烧杯盛冰(P2,2.5D v7)  opt: h=140 / ice(0-100) / water(0-1，water≤0.01 不画水体) / liquidColor(v9) / contents(v9 钩子 fn(ctx,rect)) / salt(v10,0~100 白盐堆积,缺省0不画) / pour(v10,0~1 绕底面中心倾 pour×45°,缺省0)
 *   9. doll           玩偶(P2)      opt: scale=1 / arm(0|1 举手)
 *  10. heat_source    通用热源(P2,2.5D v7)  opt: level(0-3档) / knob(旋钮角度°,缺省随level；false=不画旋钮与指示灯,v5)；返回 {w,h,boxTop,knob}
 *  11. weight_single  单枚砝码(v2)  opt: g∈{5,10,20,50,100} / u=44 / held / label；返回 {w,h}
 *  12. stone          小石块(v9)    opt: size=60 / seed=1(同seed同形) / wet(0~1)；不规则多面体 2.5D，锚点底面中心
 *  13. salt_jar       盐罐(v9)      opt: saltLevel=80(0~100) / pour(0~1 倾倒) / h=120；返回 {w,h,mouth:{x,y}}
 *  14. seed_grains    种粒(v9)      opt: rho=1.10 / level=0.8 / w=160 / h=120 / count=12 / t(0~1 smoothstep 浮沉) / seed=1
 * 挂载白名单（第13条）：
 *   balance_pan 托盘(panL/panR 回调) ← material_block / weight_set 砝码 / weight_single / 被测物（页面层绘制）
 *   cylinder_grad.inside           ← material_block 占位色块（入筒水位=原水位+V块，页面层计算）
 *   water_tank（库内已有件）        ← material_block（入水浮沉，页面层处理）
 *   heat_source 顶盘               ← beaker_ice（页面层放置）
 *   cylinder_grad/beaker_ice opt.contents ← stone / seed_grains（v9 钩子，页面层画进液体里）
 * ============================================================ */

// ---- 内部小工具 ----
function rr(ctx, x, y, w, h, r){
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
// hex 色插值（stone 湿水态加深用，确定性）
function mixHex(a, b, t){
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = function(sh){
    return Math.round(((pa >> sh) & 255) + (((pb >> sh) & 255) - ((pa >> sh) & 255)) * t);
  };
  return 'rgb(' + ch(16) + ',' + ch(8) + ',' + ch(0) + ')';
}
// ---- liquidColor 派生（c6s34 v9：beaker_ice / cylinder_grad 共用；不传 = 原蓝系缺省值，渲染零变化）----
function parseCol(c){
  let m = /^rgba?\(([^)]+)\)$/i.exec(c);
  if (m){
    const p = m[1].split(',');
    return {r: +p[0], g: +p[1], b: +p[2], a: p.length > 3 ? +p[3] : 1};
  }
  m = /^#([0-9a-f]{6})$/i.exec(c);
  if (m){
    const v = parseInt(m[1], 16);
    return {r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255, a: 1};
  }
  return null;
}
function colStr(c){
  return 'rgba(' + Math.round(c.r) + ',' + Math.round(c.g) + ',' + Math.round(c.b) + ',' + (Math.round(c.a * 100) / 100) + ')';
}
function mixCol(c, tr, tg, tb, k){
  return {r: c.r + (tr - c.r) * k, g: c.g + (tg - c.g) * k, b: c.b + (tb - c.b) * k, a: c.a};
}
// lc=null→缺省；{top,bottom,line} 对象→逐项兜底缺省；单色字符串→top=原样、bottom=加深28%、line=向白提亮60%
function deriveLiquid(lc, defTop, defBot, defLine){
  if (!lc) return {top: defTop, bottom: defBot, line: defLine};
  if (typeof lc === 'object')
    return {top: lc.top || defTop, bottom: lc.bottom || defBot, line: lc.line || defLine};
  const c = parseCol(String(lc));
  if (!c) return {top: defTop, bottom: defBot, line: defLine};
  const ln = mixCol(c, 255, 255, 255, 0.6);
  ln.a = Math.max(ln.a, 0.9);
  return {top: colStr(c), bottom: colStr(mixCol(c, 0, 0, 0, 0.28)), line: colStr(ln)};
}

// ================= 1. balance_pan 托盘天平 =================
// 已知坑：横梁倾角旋转时托盘保持水平（吊挂语义：挂点随横梁端点走，盘体不转）
// 游码层次：标尺在下层、游码在标尺上层（同组内顺序保证）
// v3: 几何单源 PROPS.balGeom(x,y,h,tilt[,riderG]) —— 返回与 balance_pan 绘制 return 同构对象
//     {beamY, panL, panR, rider:{x0,x1,y,g2x}, nutL, nutR, dial, base}（_: 绘制内部量，页面勿依赖）
//     balance_pan 绘制时调它取几何（禁绘制内另算）；页面命中/拖拽直接调此导出，禁本地副本
PROPS.balGeom = function(x, y, h, tilt, riderG){
  h = h || 220;
  const tRad = Math.max(-8, Math.min(8, tilt || 0)) * Math.PI / 180;
  const cosT = Math.cos(tRad), sinT = Math.sin(tRad);
  const baseW = h * 0.72, baseH = Math.max(8, h * 0.065);
  const pivotY = y - baseH - h * 0.52;
  const beamLen = h * 0.86, beamH = Math.max(5, h * 0.032);
  const panDrop = h * 0.26, panW = beamLen * 0.22, panH = Math.max(4, h * 0.03);
  const armX = beamLen / 2 - h * 0.02;
  const scaleW = h * 0.40, scaleH = h * 0.075, sy = beamH / 2 + h * 0.012;
  const plateCy = pivotY + h * 0.145, plateR = h * 0.10, ptrL = h * 0.19;
  const nutOff = beamLen / 2 - h * 0.025, nutR = h * 0.024;
  const lyC = sy + scaleH / 2;
  const rotX = function(lx, ly){ return x + lx * cosT - ly * sinT; };
  const rotY = function(lx, ly){ return pivotY + lx * sinT + ly * cosT; };
  const gL = function(g){ return -scaleW / 2 + scaleW * Math.max(0, Math.min(5, g)) / 5; };
  const rg = Math.max(0, Math.min(5, riderG || 0));
  return {
    beamY: pivotY,
    panL: {x: x - armX * cosT, y: pivotY - armX * sinT + panDrop, r: panW / 2},
    panR: {x: x + armX * cosT, y: pivotY + armX * sinT + panDrop, r: panW / 2},
    panH: panH, // v4: 盘厚显式导出（页面勿再取 _.panH）
    rider: {
      x0: rotX(-scaleW / 2, lyC), x1: rotX(scaleW / 2, lyC),
      y: rotY(gL(rg), lyC),
      g2x: function(g){ return rotX(gL(g), lyC); }
    },
    nutL: {x: rotX(-nutOff, 0), y: rotY(-nutOff, 0), r: nutR},
    nutR: {x: rotX(nutOff, 0), y: rotY(nutOff, 0), r: nutR},
    dial: {x: x, y: plateCy, r: plateR},
    base: {x: x - baseW / 2, y: y - baseH, w: baseW, h: baseH},
    _: {tilt: tRad, pivotY: pivotY, baseH: baseH, beamLen: beamLen, beamH: beamH,
        panDrop: panDrop, panW: panW, panH: panH, armX: armX,
        scaleW: scaleW, scaleH: scaleH, sy: sy, plateR: plateR, ptrL: ptrL,
        nutOff: nutOff, nutR: nutR, lyC: lyC, gL: gL}
  };
};
PROPS.balance_pan = function(ctx, x, y, opt){
  opt = opt || {};
  const h = opt.h || 220;
  const riderG = Math.max(0, Math.min(5, opt.rider || 0));
  const G = PROPS.balGeom(x, y, h, opt.tilt || 0, riderG); // v3: 几何单源
  const _ = G._;
  const tilt = _.tilt, pivotY = _.pivotY;
  const beamLen = _.beamLen, beamH = _.beamH;
  const panW = _.panW, panH = _.panH;
  const baseW = G.base.w, baseH = G.base.h;
  const scaleW = _.scaleW, scaleH = _.scaleH, sy = _.sy;
  const plateR = _.plateR, ptrL = _.ptrL, nutOff = _.nutOff;
  ctx.save(); ctx.lineJoin = 'round';

  // v10 J2 金属灰底座（与立柱 #9ca3af 同族；原暖棕木纹删除，蔡总 J2）；形状/圆角/尺寸/锚点/返回字段全部不变
  const gb = ctx.createLinearGradient(0, y - baseH, 0, y);
  gb.addColorStop(0, '#c9ced6'); gb.addColorStop(0.5, '#9aa1ab'); gb.addColorStop(1, '#6f747c');
  rr(ctx, x - baseW / 2, y - baseH, baseW, baseH, baseH * 0.3);
  ctx.fillStyle = gb; ctx.fill();
  ctx.strokeStyle = 'rgba(45,50,58,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  // 顶面浅色高光线（金属反光语义）
  ctx.beginPath();
  ctx.moveTo(x - baseW / 2 + baseH * 0.35, y - baseH + 1.5);
  ctx.lineTo(x + baseW / 2 - baseH * 0.35, y - baseH + 1.5);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1; ctx.stroke();

  // 立柱（金属灰，下宽上窄）
  const colWb = h * 0.10, colWt = h * 0.05;
  ctx.beginPath();
  ctx.moveTo(x - colWb / 2, y - baseH);
  ctx.lineTo(x + colWb / 2, y - baseH);
  ctx.lineTo(x + colWt / 2, pivotY + h * 0.01);
  ctx.lineTo(x - colWt / 2, pivotY + h * 0.01);
  ctx.closePath();
  const gc = ctx.createLinearGradient(x - colWb / 2, 0, x + colWb / 2, 0);
  gc.addColorStop(0, '#7d838c'); gc.addColorStop(0.4, '#b8bdc4'); gc.addColorStop(1, '#6b7280');
  ctx.fillStyle = gc; ctx.fill();
  ctx.strokeStyle = 'rgba(40,44,50,0.55)'; ctx.lineWidth = 1; ctx.stroke();

  // 吊挂 + 托盘（画在横梁之前，盘体恒水平；盘位=balGeom.panL/panR 单源）
  [G.panL, G.panR].forEach(function(p, i){
    const ex = p.x, py = p.y, ey = py - _.panDrop;
    ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(ex, ey); ctx.lineTo(ex - panW * 0.4, py);
    ctx.moveTo(ex, ey); ctx.lineTo(ex + panW * 0.4, py);
    ctx.stroke();
    ctx.beginPath(); ctx.ellipse(ex, py, panW / 2, panH, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#b8bdc4'; ctx.fill();
    ctx.strokeStyle = '#5b6068'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(ex, py - panH * 0.25, panW * 0.36, panH * 0.45, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1; ctx.stroke();
    const cb = i === 0 ? opt.panL : opt.panR;
    if (typeof cb === 'function') cb(ctx, ex, py, panW / 2); // v4: 第三参=盘椭圆中心 y（R24 挂载件底面中心与盘心重合）
  });

  // 白分度盘（挂立柱前方，黑刻度沿指针尖端扫过的弧）
  const plateCy = G.dial.y;
  ctx.beginPath(); ctx.arc(x, plateCy, plateR, 0, Math.PI * 2);
  ctx.fillStyle = '#fafafa'; ctx.fill();
  ctx.strokeStyle = '#374151'; ctx.lineWidth = Math.max(1.5, h * 0.008); ctx.stroke();
  for (let t = -20; t <= 20; t += 5){
    const a = t * Math.PI / 180;
    const r0 = t === 0 ? ptrL * 0.68 : ptrL * 0.86, r1 = ptrL * 0.97;
    ctx.beginPath();
    ctx.moveTo(x - r0 * Math.sin(a), pivotY + r0 * Math.cos(a));
    ctx.lineTo(x - r1 * Math.sin(a), pivotY + r1 * Math.cos(a));
    ctx.strokeStyle = t === 0 ? '#dc2626' : '#1f2937'; // v2: 中位红色长刻度，倾角归零一目了然
    ctx.lineWidth = t === 0 ? h * 0.009 : h * 0.005;
    ctx.stroke();
  }

  // 横梁组（随 tilt 旋转：梁体 + 平衡螺母 + 标尺 + 游码）
  ctx.save(); ctx.translate(x, pivotY); ctx.rotate(tilt);
  const gbm = ctx.createLinearGradient(0, -beamH / 2, 0, beamH / 2);
  gbm.addColorStop(0, '#c8ced6'); gbm.addColorStop(0.5, '#9ca3af'); gbm.addColorStop(1, '#71777f');
  rr(ctx, -beamLen / 2, -beamH / 2, beamLen, beamH, beamH * 0.35);
  ctx.fillStyle = gbm; ctx.fill();
  ctx.strokeStyle = 'rgba(40,44,50,0.7)'; ctx.lineWidth = 1; ctx.stroke();
  // 平衡螺母（横梁两端）
  [-1, 1].forEach(function(s){
    const nx = s * nutOff;
    ctx.beginPath(); ctx.arc(nx, 0, _.nutR, 0, Math.PI * 2);
    ctx.fillStyle = '#b8bdc4'; ctx.fill();
    ctx.strokeStyle = '#5b6068'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(nx - h * 0.016, 0); ctx.lineTo(nx + h * 0.016, 0);
    ctx.strokeStyle = 'rgba(70,75,82,0.7)'; ctx.lineWidth = 1; ctx.stroke();
  });
  // 标尺（横梁前侧，下层）+ 游码（上层）
  // v2 大尺寸清晰刻度：每 1g 长刻度+数字、每 0.2g 短刻度，全部线长/字高 ∝ h（禁固定 px）；opt.labels===false 才隐藏数字
  rr(ctx, -scaleW / 2, sy, scaleW, scaleH, h * 0.006);
  ctx.fillStyle = '#e5e7eb'; ctx.fill();
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = h * 0.004; ctx.stroke();
  const showNum = opt.labels !== false;
  for (let i = 0; i <= 25; i++){
    const major = i % 5 === 0;
    const gx = -scaleW / 2 + scaleW * i / 25;
    ctx.strokeStyle = '#374151'; ctx.lineWidth = major ? h * 0.005 : h * 0.003;
    ctx.beginPath(); ctx.moveTo(gx, sy + h * 0.004);
    ctx.lineTo(gx, sy + scaleH * (major ? 0.45 : 0.26)); ctx.stroke();
    if (major && showNum){
      ctx.fillStyle = '#1f2937';
      ctx.font = Math.round(h * 0.034) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(i / 5), gx, sy + scaleH - h * 0.012);
    }
  }
  if (opt.riderShow !== false){
    const rx = _.gL(riderG);
    const rw = Math.max(7, h * 0.034);
    ctx.beginPath();
    ctx.moveTo(rx - rw / 2, sy + scaleH + h * 0.008);
    ctx.lineTo(rx - rw / 2, sy - h * 0.035);
    ctx.lineTo(rx - rw * 0.16, sy - h * 0.05);
    ctx.lineTo(rx + rw * 0.16, sy - h * 0.05);
    ctx.lineTo(rx + rw / 2, sy - h * 0.035);
    ctx.lineTo(rx + rw / 2, sy + scaleH + h * 0.008);
    ctx.closePath();
    ctx.fillStyle = '#ef4444'; ctx.fill();
    ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = h * 0.004; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx - rw * 0.2, sy - h * 0.038); ctx.lineTo(rx + rw * 0.2, sy - h * 0.038);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = h * 0.004; ctx.stroke();
  }
  ctx.restore();

  // 中央指针（红尖，与横梁同源摆动，画在分度盘之上）
  ctx.save(); ctx.translate(x, pivotY); ctx.rotate(tilt);
  ctx.beginPath();
  ctx.moveTo(-h * 0.011, -h * 0.01);
  ctx.lineTo(h * 0.011, -h * 0.01);
  ctx.lineTo(h * 0.005, ptrL * 0.82);
  ctx.lineTo(0, ptrL);
  ctx.lineTo(-h * 0.005, ptrL * 0.82);
  ctx.closePath();
  ctx.fillStyle = '#dc2626'; ctx.fill();
  ctx.strokeStyle = '#991b1b'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.restore();

  // 支点轴帽
  ctx.beginPath(); ctx.arc(x, pivotY, h * 0.02, 0, Math.PI * 2);
  ctx.fillStyle = '#5b6068'; ctx.fill();
  ctx.strokeStyle = 'rgba(30,33,38,0.8)'; ctx.lineWidth = h * 0.004; ctx.stroke();
  ctx.restore();

  return G; // v3: 直接返回 balGeom 同构对象（页面拖拽/命中检测依赖）
};

// ================= 2. weight_set 砝码组 =================
// 木盒 + 砝码阵列(100/50/20×2/10/5g 银灰圆柱带提钮)；pick=镊子夹起画盒外上方
// v3: 盒内槽位几何与 weight_single 单源化（weightGeom），直径+高度都随规格变（立方根律=同密度金属真实比例）
function weightGeom(g, u){
  const w = u * Math.pow(g / 100, 1 / 3);
  return {w: w, h: w * 0.55};
}
PROPS.weightGeom = weightGeom; // v4: 单源导出（页面禁复制公式）
function drawWeight(ctx, cx, by, r, hgt, label){
  const g = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
  g.addColorStop(0, '#9ca3af'); g.addColorStop(0.35, '#e5e7eb'); g.addColorStop(0.65, '#d1d5db'); g.addColorStop(1, '#7d838c');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.rect(cx - r, by - hgt, r * 2, hgt); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, by, r, r * 0.32, 0, 0, Math.PI);
  ctx.strokeStyle = 'rgba(80,85,92,0.8)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, by - hgt, r, r * 0.34, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e5e7eb'; ctx.fill();
  ctx.strokeStyle = '#6b7280'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, by - hgt - r * 0.42, r * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = '#b8bdc4'; ctx.fill(); ctx.stroke();
  if (label){
    ctx.fillStyle = '#374151';
    ctx.font = Math.max(8, r * 0.62) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, by - hgt * 0.4);
  }
}
PROPS.weight_set = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 240, boxH = w * 0.32, lidH = w * 0.11; // v3: 盒默认 200→240（砝码变大盒随之变大）
  const open = opt.open !== false;
  const pick = opt.pick || null;
  const missing = opt.missing || null; // v2: 已被页面拖出的砝码 id 数组，盒内不画
  ctx.save(); ctx.lineJoin = 'round';

  // v3: 槽位几何单源（weightGeom），六枚按 w 降序排槽：大左小右；返回 slots 供页面命中/missing 联动，禁页面复制盒内公式
  // u 由盒宽派生单点算：六枚立方根宽和 ≈3.9u + 5 个间隙 ≈1.0u → 总占 ≈4.9u = 内腔宽 → u = (w-2*pad)/4.9
  const WS = [
    {id:'100', g:100, label:'100'}, {id:'50', g:50, label:'50'},
    {id:'20', g:20, label:'20'}, {id:'20b', g:20, label:'20'},
    {id:'10', g:10, label:'10'}, {id:'5', g:5, label:'5'}
  ];
  const pad = w * 0.05, inL = x - w / 2 + pad, inW = w - 2 * pad, by = y - boxH * 0.28;
  const u = inW / 4.9;
  const sumW = WS.reduce(function(a, it){ return a + weightGeom(it.g, u).w; }, 0);
  const gap = (inW - sumW) / (WS.length - 1);
  const slots = [];
  let curL = inL;
  WS.forEach(function(it){
    const gm = weightGeom(it.g, u);
    slots.push({id: it.id, g: it.g, label: it.label, cx: curL + gm.w / 2, cy: by, r: gm.w / 2, hgt: gm.h});
    curL += gm.w + gap;
  });

  // 盒盖（开=向后掀开，绕左铰链）
  if (open){
    ctx.save(); ctx.translate(x - w / 2, y - boxH); ctx.rotate(-0.85);
    rr(ctx, 0, -lidH, w, lidH, 3);
    const gl = ctx.createLinearGradient(0, -lidH, 0, 0);
    gl.addColorStop(0, '#a3815c'); gl.addColorStop(1, '#7d5f40');
    ctx.fillStyle = gl; ctx.fill();
    ctx.strokeStyle = 'rgba(60,42,26,0.7)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
  }

  // 盒体（暖棕木）
  const gbx = ctx.createLinearGradient(0, y - boxH, 0, y);
  gbx.addColorStop(0, '#a3815c'); gbx.addColorStop(1, '#75593c');
  rr(ctx, x - w / 2, y - boxH, w, boxH, 4);
  ctx.fillStyle = gbx; ctx.fill();
  ctx.strokeStyle = 'rgba(60,42,26,0.7)'; ctx.lineWidth = 1.2; ctx.stroke();

  if (!open){
    // 合盖态：盖覆盒口 + 搭扣
    rr(ctx, x - w / 2 - 2, y - boxH - lidH, w + 4, lidH + 3, 4);
    const gl2 = ctx.createLinearGradient(0, y - boxH - lidH, 0, y - boxH);
    gl2.addColorStop(0, '#a3815c'); gl2.addColorStop(1, '#7d5f40');
    ctx.fillStyle = gl2; ctx.fill();
    ctx.strokeStyle = 'rgba(60,42,26,0.7)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y - boxH - lidH * 0.35, lidH * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a227'; ctx.fill();
    ctx.strokeStyle = 'rgba(90,70,20,0.8)'; ctx.stroke();
    ctx.restore();
    return {w: w, boxH: boxH, slots: slots};
  }

  // 内腔（深色衬里）
  rr(ctx, inL, y - boxH + pad * 0.8, inW, boxH - pad * 1.5, 3);
  ctx.fillStyle = '#54392a'; ctx.fill();

  // 砝码阵列（missing/pick 的从盒内跳过；几何=slots 单源）
  slots.forEach(function(sl){
    if (missing && missing.indexOf(sl.id) >= 0) return;
    if (pick && sl.id === pick || (pick === '20' && sl.id === '20b')) return;
    drawWeight(ctx, sl.cx, sl.cy, sl.r, sl.hgt, sl.label);
  });

  // pick 态：盒外上方被夹砝码 + 镊子简形（金属灰两脚）；砝码几何同槽位单源（同一枚两处造型一致）
  if (pick){
    const sl = slots.filter(function(o){ return o.id === pick || (pick === '20' && o.id === '20b'); })[0]
      || slots[2];
    const px = x + w * 0.22, pby = y - boxH - w * 0.24;
    const r = sl.r, hgt = sl.hgt;
    // 镊子两脚（先砝码后脚，脚尖落在提钮上）
    drawWeight(ctx, px, pby, r, hgt, sl.label);
    const tipY = pby - hgt - r * 0.42, topY = tipY - w * 0.16;
    ctx.strokeStyle = '#8a9099'; ctx.lineWidth = Math.max(2.5, w * 0.014); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px - r * 1.6, topY); ctx.lineTo(px - r * 0.25, tipY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + r * 1.6, topY); ctx.lineTo(px + r * 0.25, tipY); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, topY - r * 0.2, r * 1.62, Math.PI * 0.15, Math.PI * 0.85, true);
    ctx.lineWidth = Math.max(2, w * 0.011); ctx.stroke();
  }
  ctx.restore();
  // v3: 返回 {w, boxH, slots:[{id,cx,cy,r,hgt}]}（cy=该枚底面 y，r=w/2）——页面命中/missing 联动用
  return {w: w, boxH: boxH, slots: slots};
};

// ================= 2b. weight_single 单枚砝码（v2 新增，c6s1 拖拽用原语） =================
// opt: g∈{5,10,20,50,100} / u(100g基准宽,缺省44，v3:36→44 蔡总反馈砝码太小) / held(镊子夹持态) / label(正面刻字,缺省true)
// v3: 几何调 weightGeom 单源（与 weight_set 盒内槽位同公式，同一枚两处造型一致）；锚点=底面中心；返回 {w,h}
PROPS.weight_single = function(ctx, x, y, opt){
  opt = opt || {};
  const g = [5, 10, 20, 50, 100].indexOf(opt.g) >= 0 ? opt.g : 100;
  const u = opt.u || 44;
  const gm = weightGeom(g, u);
  const w = gm.w, hgt = gm.h;
  const r = w / 2;
  ctx.save(); ctx.lineJoin = 'round';
  drawWeight(ctx, x, y, r, hgt, opt.label !== false ? g + 'g' : null);
  if (opt.held){
    // 镊子夹持态（weight_set pick 同款造型，尺寸随 r 缩放）：先砝码后脚，脚尖落在提钮上
    const tipY = y - hgt - r * 0.42, topY = tipY - r * 1.7;
    ctx.strokeStyle = '#8a9099'; ctx.lineWidth = Math.max(1.5, r * 0.16); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - r * 1.6, topY); ctx.lineTo(x - r * 0.25, tipY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + r * 1.6, topY); ctx.lineTo(x + r * 0.25, tipY); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, topY - r * 0.2, r * 1.62, Math.PI * 0.15, Math.PI * 0.85, true);
    ctx.lineWidth = Math.max(1.2, r * 0.12); ctx.stroke();
  }
  ctx.restore();
  return {w: w, h: hgt};
};

// ================= 3. rider 游码（独立放大演示件） =================
// 层次：标尺在下、游码在上（骑跨鞍形）
PROPS.rider = function(ctx, x, y, opt){
  opt = opt || {};
  const len = opt.scaleLen || 160, barH = Math.max(10, len * 0.085);
  const pos = Math.max(0, Math.min(1, opt.pos === undefined ? 0.4 : opt.pos));
  const x0 = x - len / 2;
  ctx.save();
  // 标尺
  rr(ctx, x0, y - barH, len, barH, 2);
  const gs = ctx.createLinearGradient(0, y - barH, 0, y);
  gs.addColorStop(0, '#f3f4f6'); gs.addColorStop(1, '#d1d5db');
  ctx.fillStyle = gs; ctx.fill();
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1.2; ctx.stroke();
  for (let i = 0; i <= 20; i++){
    const gx = x0 + len * i / 20, major = i % 4 === 0;
    ctx.strokeStyle = '#374151'; ctx.lineWidth = major ? 1.4 : 0.8;
    ctx.beginPath(); ctx.moveTo(gx, y - barH + 1.5);
    ctx.lineTo(gx, y - barH + (major ? barH * 0.55 : barH * 0.3)); ctx.stroke();
    if (i % 4 === 0){
      ctx.fillStyle = '#1f2937';
      ctx.font = Math.max(8, barH * 0.42) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(i / 4), gx, y - barH * 0.12);
    }
  }
  // 游码（上层，鞍形骑跨）
  const rx = x0 + len * pos;
  const rw = Math.max(12, len * 0.075), finH = barH * 0.75, legD = barH * 0.45;
  ctx.beginPath();
  ctx.moveTo(rx - rw / 2, y + legD * 0.4);
  ctx.lineTo(rx - rw / 2, y - barH - finH);
  ctx.lineTo(rx - rw * 0.18, y - barH - finH * 1.3);
  ctx.lineTo(rx + rw * 0.18, y - barH - finH * 1.3);
  ctx.lineTo(rx + rw / 2, y - barH - finH);
  ctx.lineTo(rx + rw / 2, y + legD * 0.4);
  ctx.lineTo(rx + rw * 0.22, y + legD * 0.4);
  ctx.lineTo(rx + rw * 0.22, y - barH * 0.55);
  ctx.lineTo(rx - rw * 0.22, y - barH * 0.55);
  ctx.lineTo(rx - rw * 0.22, y + legD * 0.4);
  ctx.closePath();
  ctx.fillStyle = '#ef4444'; ctx.fill();
  ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rx - rw * 0.28, y - barH - finH * 0.85);
  ctx.lineTo(rx + rw * 0.28, y - barH - finH * 0.85);
  ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
};

// ================= 4. material_block 材质块 =================
// 正方体 2.5D（P25 投影），同体积不同材质严格同尺寸；纹理=材质参数
const MATS = {
  aluminum:  {top:'#e8ebef', front:'#c9ced5', side:'#a7adb6', edge:'#8a9099', sheen:true},
  iron:      {top:'#7a8089', front:'#5b6068', side:'#474c54', edge:'#33373d', sheen:true},
  wood:      {top:'#d9b379', front:'#c89b5f', side:'#a87f49', edge:'#8a6739', grain:true},
  ice:       {top:'rgba(222,239,249,0.85)', front:'rgba(190,222,240,0.72)', side:'rgba(165,205,230,0.72)', edge:'rgba(140,185,215,0.9)', glassy:true},
  gold:      {top:'#f2cd5b', front:'#e6b422', side:'#c2951a', edge:'#9d7814', sheen:true},
  copper:    {top:'#c98a5e', front:'#b0683a', side:'#91532d', edge:'#77431f', sheen:true},
  wax:       {top:'#f7f1e0', front:'#f0e7cf', side:'#ddd2b4', edge:'#c2b697'},
  styrofoam: {top:'#fbfbfb', front:'#f2f2f2', side:'#e2e2e2', edge:'#c9c9c9', speck:true},
  pvc:       {top:'#f7f7f7', front:'#ececec', side:'#d8d8d8', edge:'#bdbdbd'},
  brick:     {top:'#b06a52', front:'#9c5a44', side:'#7f4634', edge:'#68382a'}
};
PROPS.material_block = function(ctx, x, y, opt){
  opt = opt || {};
  const s = opt.size || 60;
  const dx = s * P25.dx * 0.6, dy = s * P25.dy * 0.6;
  const mystery = !!opt.mystery;
  const matName = mystery ? 'mystery' : (MATS[opt.mat] ? opt.mat : 'aluminum');
  const m = mystery
    ? {top:'#b8bcc2', front:'#9ca3af', side:'#7d838c', edge:'#5b6068'}
    : MATS[matName];
  const fx = x - s / 2, fy = y - s;
  ctx.save(); ctx.lineJoin = 'round';
  // 顶面
  ctx.beginPath();
  ctx.moveTo(fx, fy); ctx.lineTo(fx + dx, fy + dy);
  ctx.lineTo(fx + s + dx, fy + dy); ctx.lineTo(fx + s, fy);
  ctx.closePath();
  ctx.fillStyle = m.top; ctx.fill();
  ctx.strokeStyle = m.edge; ctx.lineWidth = 1; ctx.stroke();
  // 右侧面
  ctx.beginPath();
  ctx.moveTo(fx + s, fy); ctx.lineTo(fx + s + dx, fy + dy);
  ctx.lineTo(fx + s + dx, fy + dy + s); ctx.lineTo(fx + s, fy + s);
  ctx.closePath();
  ctx.fillStyle = m.side; ctx.fill(); ctx.stroke();
  // 前面
  ctx.fillStyle = m.front; ctx.fillRect(fx, fy, s, s);
  ctx.strokeStyle = m.edge; ctx.strokeRect(fx, fy, s, s);
  // 材质纹理（sin 伪随机，确定性）
  if (m.grain){
    ctx.strokeStyle = 'rgba(140,100,55,0.45)'; ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++){
      const yy = fy + s * i / 5;
      ctx.beginPath();
      for (let t = 0; t <= s; t += 4){
        const off = Math.sin(t * 0.14 + i * 2.3 + rand(i * 13 + 7) * 3) * s * 0.035;
        if (t === 0) ctx.moveTo(fx + t, yy + off); else ctx.lineTo(fx + t, yy + off);
      }
      ctx.stroke();
    }
  }
  if (m.sheen){
    const gsh = ctx.createLinearGradient(fx, fy, fx + s, fy + s);
    gsh.addColorStop(0, 'rgba(255,255,255,0.30)');
    gsh.addColorStop(0.45, 'rgba(255,255,255,0.02)');
    gsh.addColorStop(1, 'rgba(255,255,255,0.12)');
    ctx.fillStyle = gsh; ctx.fillRect(fx, fy, s, s);
  }
  if (m.glassy){
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(1.5, s * 0.03);
    ctx.beginPath(); ctx.moveTo(fx + s * 0.18, fy + s * 0.85); ctx.lineTo(fx + s * 0.55, fy + s * 0.15); ctx.stroke();
  }
  if (m.speck){
    for (let i = 0; i < 30; i++){
      const px = fx + rand(i * 3 + 1) * s, py = fy + rand(i * 3 + 2) * s;
      ctx.fillStyle = rand(i * 3 + 3) > 0.5 ? 'rgba(195,195,195,0.8)' : 'rgba(255,255,255,0.95)';
      ctx.fillRect(px, py, Math.max(1, s * 0.025), Math.max(1, s * 0.025));
    }
  }
  if (mystery){
    ctx.fillStyle = '#4b5563';
    ctx.font = 'bold ' + Math.round(s * 0.5) + 'px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', x, y - s / 2);
    ctx.textBaseline = 'alphabetic';
  }
  // 质量标签（顶面上方挂点，null 不画）
  if (opt.label){
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold ' + Math.max(11, s * 0.22) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(opt.label), x + dx / 2, fy + dy - Math.max(6, s * 0.12));
  }
  ctx.restore();
};

// ================= 5. cylinder_grad 量筒 =================
// 层次：玻璃背层→水体→浸没块(inside)→前壁高光→刻度数字（块在水体之下、筒壁反光之上）
// v10 J3（蔡总：筒底平面→2.5D 椭圆底，照 beaker_ice v6 底处理先例）：底椭圆 ryB=w*0.12、中心 botY=y−ryB*0.2、前半弧亮线、
//   侧壁切点连到底椭圆切点、前弧落点略沉（y+ryB*0.8）、锚点不变；inBot=botY（v=0 刻度线在底椭圆中心）；rect 字段名/回调契约全部不变
PROPS.cylinder_grad = function(ctx, x, y, opt){
  opt = opt || {};
  const h = opt.h || 240, w = Math.max(30, h * 0.18);
  const cap = opt.cap || 100, div = opt.div || 10;
  const water = Math.max(0, Math.min(1, opt.water || 0));
  // v9: opt.liquidColor 派生水色（不传=原蓝系缺省值，页面零改动）
  const LC = deriveLiquid(opt.liquidColor, 'rgba(125,195,235,0.78)', 'rgba(85,160,215,0.88)', 'rgba(232,247,255,0.95)');
  const wall = Math.max(2, w * 0.055);
  const inL = x - w / 2 + wall, inR = x + w / 2 - wall;
  // v11 M3: 口/底椭圆加宽为烧杯族 ry/rx=0.28 同比例——筒口 ry=w*0.14 中心 yc=y−h+ry（顶缘仍 y−h）；底 ryB=w*0.14、botY=y−ryB*0.2 语义保留
  const ry = w * 0.14, yc = y - h + ry;
  const ryB = w * 0.14, botY = y - ryB * 0.2;   // v10 J3: 2.5D 椭圆底；inBot=botY（v=0 刻度线在 inBot）
  const inTop = yc + wall, inBot = botY;        // v11 M3: inTop=y−h+ry+wall 随新几何单源重算（rect 字段名与回调契约不变）
  const rxW = w / 2 - wall, ryW = rxW * 0.28;   // 水面顶面椭圆（烧杯族同比例）
  ctx.save();
  // v11 M2 全族绘制次序：①筒体半透明 fill（v12 N1 起含口内壁预填充）→ ②内容物(水体/inside/contents)体 fill → ③水面顶面椭圆 fill → ④所有椭圆与轮廓描边最后画
  // ①-0) v12 N1 口内壁填充：整个口椭圆（内腔半宽 w/2−wall）用背层色先填 → 口内部不再上下两截色（beaker_ice 同族同治）
  ctx.beginPath(); ctx.ellipse(x, yc, rxW, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(220,240,246,0.30)'; ctx.fill();
  // ①) 玻璃背层（浅青半透明，glass_brick 同族）：v12 N1 顶边改口椭圆下半弧（旧上半弧闭合=口下半内部无背层，同族两截色根因；fill 不描边）
  ctx.beginPath();
  ctx.moveTo(x - w / 2, yc);
  ctx.ellipse(x, yc, w / 2, ry, 0, Math.PI, 0, true);   // 左切点经口下弧到右切点
  ctx.lineTo(x + w / 2, botY);
  ctx.ellipse(x, botY, w / 2, ryB, 0, 0, Math.PI);        // 底椭圆前弧（右→左）
  ctx.lineTo(x - w / 2, yc);
  ctx.closePath();
  ctx.fillStyle = 'rgba(220,240,246,0.30)'; ctx.fill();
  // ②-a) 水体 fill（v11 M2：顶边贴合水面椭圆下半弧，旧 quadratic 拱线顶弦切过已画椭圆=两截色根因）
  let wy = inBot;
  if (water > 0.005){
    wy = inBot - (inBot - inTop) * water;
    const gw = ctx.createLinearGradient(0, wy, 0, inBot);
    gw.addColorStop(0, LC.top);
    gw.addColorStop(1, LC.bottom);
    ctx.beginPath();
    ctx.moveTo(x - rxW, wy);
    ctx.ellipse(x, wy, rxW, ryW, 0, Math.PI, 0, true);
    ctx.lineTo(inR, botY);
    ctx.ellipse(x, botY, rxW, ryB, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = gw; ctx.fill();
  }
  // ②-b) inside 浸没块占位色块（页面传 mat 色）
  if (opt.inside){
    const bw = (inR - inL) * 0.62, bh = bw;
    ctx.fillStyle = opt.inside;
    ctx.fillRect(x - bw / 2, inBot - bh, bw, bh);
    ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 1;
    ctx.strokeRect(x - bw / 2, inBot - bh, bw, bh);
  }
  // ②-c) v9: opt.contents 绘制钩子（页面把石块/种粒画进液体里）；save/restore 组件包办，try/catch 静默失败
  const wyC = water > 0.005 ? wy : inBot;
  if (typeof opt.contents === 'function'){
    ctx.save();
    try { opt.contents(ctx, {x: x, w: w, inL: inL, inR: inR, inTop: inTop, inBot: inBot, wy: wyC}); } catch(e){}
    ctx.restore();
  }
  // ③) 水面顶面椭圆 fill（v11 M3：替旧 quadratic 拱线顶弦，烧杯同族）
  if (water > 0.005){
    ctx.beginPath(); ctx.ellipse(x, wy, rxW, ryW, 0, 0, Math.PI * 2);
    ctx.fillStyle = LC.top; ctx.fill();
  }
  // ④) 所有描边最后画（v11 M2：最上层，单一 strokeStyle 不被任何半透明层叠色 → 椭圆一周颜色均匀）
  // 前壁三边描边（侧壁+底前弧，不闭顶弦——beaker_ice v8 同法）
  ctx.beginPath();
  ctx.moveTo(x - w / 2, yc);
  ctx.lineTo(x - w / 2, botY);
  ctx.ellipse(x, botY, w / 2, ryB, 0, Math.PI, 0, true);
  ctx.lineTo(x + w / 2, yc);
  ctx.strokeStyle = 'rgba(120,160,180,0.9)'; ctx.lineWidth = wall * 0.5; ctx.stroke();
  // 底前弧亮线 + 竖高光条
  ctx.beginPath(); ctx.ellipse(x, botY, w / 2, ryB, 0, 0, Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = Math.max(1.5, w * 0.022); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = Math.max(1.5, w * 0.045);
  ctx.beginPath(); ctx.moveTo(x - w * 0.27, y - h * 0.94); ctx.lineTo(x - w * 0.27, botY - ryB * 0.4); ctx.stroke();
  // 筒口椭圆描边（v11 M3：ry=w*0.14 加宽同烧杯族，旧 ry=wall*0.9 窄口清零）
  ctx.beginPath(); ctx.ellipse(x, yc, w / 2, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(140,175,195,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();
  // 水面椭圆描边
  if (water > 0.005){
    ctx.beginPath(); ctx.ellipse(x, wy, rxW, ryW, 0, 0, Math.PI * 2);
    ctx.strokeStyle = LC.line; ctx.lineWidth = 1.6; ctx.stroke();
  }
  // 白刻度黑数字（线性均匀；v 映射走 inBot/inTop 单源随新几何自动更新）
  for (let v = 0; v <= cap + 1e-6; v += div / 2){
    const yy = inBot - (inBot - inTop) * v / cap;
    const major = Math.abs(v % div) < 1e-6;
    ctx.strokeStyle = major ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)';
    ctx.lineWidth = major ? 1.6 : 1;
    ctx.beginPath(); ctx.moveTo(inR, yy);
    ctx.lineTo(inR - (major ? w * 0.32 : w * 0.18), yy); ctx.stroke();
    if (major){
      ctx.fillStyle = '#1f2937';
      ctx.font = Math.max(9, w * 0.21) + 'px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(String(Math.round(v)), x + w / 2 + 4, yy + 3);
    }
  }
  ctx.restore();
};

// ================= 6. density_scale 密度标尺 =================
// 亮底幽灵化面板家族：rgba(255,255,255,0.45) 底、16px 圆角、禁 blur；红三角标连续移动
PROPS.density_scale = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 420;
  const collapsed = !!opt.collapsed;
  const ph = collapsed ? 28 : 74;
  const marks = opt.marks || [{v:1.0,t:'人'},{v:2.5,t:'玻璃'},{v:4.5,t:'钛'},{v:7.9,t:'钢'},{v:8.9,t:'铜'}];
  ctx.save();
  rr(ctx, x - w / 2, y - ph, w, ph, 16);
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('密度 (kg/L)', x - w / 2 + 14, y - ph + 18);
  if (collapsed){ ctx.restore(); return {w: w, h: ph}; } // v3: h=含标题条总高（页面避让用）
  const ax0 = x - w / 2 + 24, ax1 = x + w / 2 - 24, ay = y - 34;
  const VX = function(v){ return ax0 + (ax1 - ax0) * Math.max(0, Math.min(10, v)) / 10; };
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(ax0, ay); ctx.lineTo(ax1, ay); ctx.stroke();
  for (let v = 0; v <= 10.001; v += 0.5){
    const xx = VX(v), major = Math.abs(v % 1) < 1e-6;
    ctx.strokeStyle = '#6b7280'; ctx.lineWidth = major ? 1.3 : 0.8;
    ctx.beginPath(); ctx.moveTo(xx, ay);
    ctx.lineTo(xx, ay + (major ? 6 : 3.5)); ctx.stroke();
    if (major && v % 2 === 0){
      ctx.fillStyle = '#4b5563'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(v), xx, ay - 5);
    }
  }
  // 实物参照刻度
  marks.forEach(function(mk){
    const xx = VX(mk.v);
    ctx.strokeStyle = '#92604a'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(xx, ay + 1); ctx.lineTo(xx, ay + 10); ctx.stroke();
    ctx.fillStyle = '#6b4a35'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(mk.t, xx, ay + 22);
  });
  // 红三角标（value 连续）
  if (opt.value !== undefined && opt.value !== null){
    const vx = VX(opt.value);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(vx, ay - 3); ctx.lineTo(vx - 6, ay - 14); ctx.lineTo(vx + 6, ay - 14);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(220,38,38,0.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(vx, ay - 2); ctx.lineTo(vx, ay + 4); ctx.stroke();
  }
  ctx.restore();
  return {w: w, h: ph}; // v3: h=含标题条总高（页面避让用）
};

// ================= 7. clay 橡皮泥 =================
// v2: opt.morph 连续实数 0-2（0球 1饼 2条），超椭圆轮廓关键帧线性插值=「直接揉捏」连续形变；shape 保留为 morph 别名；返回 {w,h}
PROPS.clay = function(ctx, x, y, opt){
  opt = opt || {};
  const s = opt.size || 70;
  const m = Math.max(0, Math.min(2, opt.morph !== undefined ? opt.morph : (opt.shape || 0)));
  // 关键帧：a/b=半宽/半高，yc=中心，n=超椭圆指数（2=椭圆，4≈圆角矩形条）
  const K = [
    {a: s * 0.50, b: s * 0.50, yc: y - s * 0.50, n: 2},
    {a: s * 0.62, b: s * 0.17, yc: y - s * 0.16, n: 2},
    {a: s * 0.65, b: s * 0.12, yc: y - s * 0.12, n: 4}
  ];
  const seg = m < 1 ? 0 : 1, t = m - seg;
  const A = K[seg], B = K[seg + 1];
  const a = A.a + (B.a - A.a) * t, b = A.b + (B.b - A.b) * t;
  const yc = A.yc + (B.yc - A.yc) * t, n = A.n + (B.n - A.n) * t;
  ctx.save();
  const gcl = ctx.createRadialGradient(x - a * 0.3, yc - b * 0.7, Math.min(a, b) * 0.25, x, yc, Math.max(a, b) * 1.3);
  gcl.addColorStop(0, '#c4714f'); gcl.addColorStop(0.6, '#b5654a'); gcl.addColorStop(1, '#8f4a34');
  ctx.fillStyle = gcl;
  ctx.strokeStyle = 'rgba(120,58,40,0.6)'; ctx.lineWidth = 1.2;
  // 超椭圆轮廓 64 点采样（对 morph 连续，插值中间态平滑）
  const e = 2 / n;
  ctx.beginPath();
  for (let i = 0; i <= 64; i++){
    const th = i / 64 * Math.PI * 2;
    const c = Math.cos(th), sn = Math.sin(th);
    const px = x + (c < 0 ? -1 : 1) * a * Math.pow(Math.abs(c), e);
    const py = yc + (sn < 0 ? -1 : 1) * b * Math.pow(Math.abs(sn), e);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // 左上高光（随轮廓插值）
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = Math.max(2, s * 0.05); ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.ellipse(x - a * 0.16, yc - b * 0.12, a * 0.52, b * 0.5, 0, Math.PI * 1.08, Math.PI * 1.62);
  ctx.stroke();
  ctx.restore();
  return {w: 2 * a, h: 2 * b};
};

// ================= 8. beaker_ice 烧杯盛冰 =================
// v6 2.5D（蔡总 R33：杯底不能是平面直线）：底椭圆+锥度侧壁+水面椭圆，禁直线底边；opt/锚点语义不变
// v8（蔡总 R39 2026-10-20）：侧壁 fill/stroke 分离→stroke 只描三边不闭顶弦（消杯口中间横线）；删喙三角（消杯口外侧小斜线）；rim 椭圆完整描边/水体 guard 保留
// v10（蔡总 J4/J5 2026-10-20，c6s3 盐杯统一用烧杯件装盐）：+opt.salt 0~100（缺省 0=不画，白盐粒堆积：底椭圆上起、高度=salt%×内腔高、sin 伪随机细颗粒、
//   确定性同参数同图、与 ice/water 共存时盐堆在下层、pour 态盐面保持世界水平）；+opt.pour 0~1（缺省 0，整体绕锚点(底面中心)旋转 pour×45°，同 salt_jar.pour 语义；
//   件本身不画粒流——流由页面画）；不传 salt/pour = 渲染与 v9 逐像素等价（ang=0 跳过变换、salt=0 跳过盐堆）
// 层次：底椭圆(前弧亮线)→盐堆(v10)→侧壁(玻璃渐变+左壁高光)→水体(水面椭圆亮边)→冰块(rand 确定性多边形堆)→杯口椭圆描边
PROPS.beaker_ice = function(ctx, x, y, opt){
  opt = opt || {};
  const h = opt.h || 140, w = h * 0.78;      // w=杯口宽
  const ice = Math.max(0, Math.min(100, opt.ice || 0));
  const water = Math.max(0, Math.min(1, opt.water || 0));
  const salt = Math.max(0, Math.min(100, opt.salt || 0));   // v10 J4: 白盐堆积 %（缺省 0=不画）
  const pour = Math.max(0, Math.min(1, opt.pour || 0));     // v10 J5: 倾倒 0~1（缺省 0=直立）
  const ang = pour * Math.PI / 4;                           // 绕锚点（底面中心）旋转 pour×45°（同 salt_jar.pour 语义）
  // v9: opt.liquidColor 派生水色（top=水面椭圆、bottom=水体柱、line=水面亮边；不传=原蓝系缺省值，页面零改动）
  const LC = deriveLiquid(opt.liquidColor, 'rgba(150,200,240,0.55)', 'rgba(120,180,230,0.45)', 'rgba(232,247,255,0.9)');
  const rxT = w / 2, ryT = w * 0.14;         // 杯口椭圆（ry=0.28rx 同比例，全件统一）
  const topY = y - h;                        // 杯口椭圆中心
  const botY = y - ryT * 0.2;                // 底椭圆中心
  const rxB = rxT * 0.96, ryB = ryT;         // 底椭圆（侧壁微内收 4% 锥度）
  const wall = Math.max(2, w * 0.035);
  const halfAt = function(yy){ return rxT + (rxB - rxT) * (yy - topY) / (botY - topY); };
  ctx.save(); ctx.lineJoin = 'round';
  if (ang){ ctx.translate(x, y); ctx.rotate(ang); ctx.translate(-x, -y); }   // v10 J5: ang=0 不进变换（v9 逐像素等价）
  // v12 N1 次序总表：①杯口内壁填充(gg) → ②侧壁+底填充(gg) → ③内容物(盐/水/冰块/contents)体 fill → ④液面/盐面/杯口顶面椭圆 fill → ⑤所有描边最后画
  // v11 M2 全族绘制次序：杯体半透明 fill 在内容物前、所有椭圆与轮廓描边最后画（v12 保持）
  // v11 M1 盐堆几何：盐面顶面椭圆与水面同族（ry=该高度半宽×0.28）；pour 态沿用反转世界水平语义；初始 2/3 高度语义不变
  const hs = salt > 0 ? (botY - topY) * salt / 100 : 0;      // 高度=salt 百分比×内腔高（底椭圆上起）
  const saltY = botY - hs * (1 - pour * 0.45);               // 倾倒时余盐面下降（salt_jar 同式）
  const rxS = Math.max(1, halfAt(Math.min(Math.max(saltY, topY), botY)));
  const ryS = rxS * 0.28;
  const saltClip = function(){                               // 盐内腔 clip 路径（体 fill/顶面 fill/描边三段共用）
    ctx.beginPath();
    ctx.moveTo(x - rxT + wall, topY);
    ctx.lineTo(x - rxB + wall, botY);
    ctx.ellipse(x, botY, Math.max(1, rxB - wall), ryB, 0, Math.PI, 0, true);
    ctx.lineTo(x + rxT - wall, topY);
    ctx.closePath();
    ctx.clip();
  };
  const saltFrame = function(){ ctx.translate(x, y); ctx.rotate(-ang); ctx.translate(-x, -y); };   // 盐面回世界水平（原点仍在杯底中心锚点）
  // ①) v12 N1 杯口内壁填充：整个杯口椭圆用与侧壁同一 gg（先建 gg 两处共用 → 边界无缝，杯口内部不再上下两截色）
  const gg = ctx.createLinearGradient(x - rxT, 0, x + rxT, 0);
  gg.addColorStop(0, 'rgba(210,230,240,0.55)');
  gg.addColorStop(1, 'rgba(180,210,225,0.35)');
  ctx.beginPath(); ctx.ellipse(x, topY, rxT, ryT, 0, 0, Math.PI * 2);
  ctx.fillStyle = gg; ctx.fill();
  // ②) 侧壁+底填充：底椭圆 fill + 侧壁玻璃渐变 fill（v12 N1：顶边改杯口下半弧，旧水平直弦切杯口=两截色根因；描边全部推迟到 ⑤）
  ctx.beginPath(); ctx.ellipse(x, botY, rxB, ryB, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(200,222,232,0.5)'; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - rxT, topY);
  ctx.ellipse(x, topY, rxT, ryT, 0, Math.PI, 0, true);   // 左切点经杯口下弧到右切点
  ctx.lineTo(x + rxB, botY);
  ctx.ellipse(x, botY, rxB, ryB, 0, 0, Math.PI);          // 底椭圆前弧（右→左）
  ctx.lineTo(x - rxT, topY);
  ctx.closePath();
  ctx.fillStyle = gg; ctx.fill();
  // ③-a) v10 J4 盐体 fill（v11 M1：略深米白 #efece2 与盐面顶面亮米白对比 → 直立态可见 2/3 盐面边界不再"满杯"）+ 颗粒点缀
  if (salt > 0){
    ctx.save();
    saltClip();
    saltFrame();
    ctx.beginPath();
    ctx.moveTo(x - w, saltY);
    ctx.lineTo(x + w, saltY);
    ctx.lineTo(x + w, y + h); ctx.lineTo(x - w, y + h);
    ctx.closePath();
    ctx.fillStyle = '#efece2'; ctx.fill();
    for (let k = 0; k < 30; k++){              // 细颗粒感（sin 伪随机，同参数重绘严格同图）
      const r1 = rand(k * 3 + 41), r2 = rand(k * 3 + 42), r3 = rand(k * 3 + 43);
      ctx.fillStyle = r3 > 0.5 ? 'rgba(214,211,196,0.75)' : 'rgba(255,255,255,0.9)';
      ctx.fillRect(x + (r1 - 0.5) * w * 2.2, saltY + r2 * h * 0.6, Math.max(1, h * 0.014), Math.max(1, h * 0.014));
    }
    ctx.restore();
  }
  // ③-b) 水体 fill（v11 M2：顶边贴合液面椭圆下半弧，旧平直顶弦切过已画椭圆=两截色根因）
  let wy = botY, hw = rxT, ryW = ryT;
  if (water > 0.01){
    const wTop = topY + ryT * 0.9;             // 满水位水面 y
    wy = botY - (botY - wTop) * water;
    hw = halfAt(wy); ryW = hw * 0.28;
    ctx.beginPath();
    ctx.moveTo(x - hw, wy);
    ctx.ellipse(x, wy, hw, ryW, 0, Math.PI, 0, true);
    ctx.lineTo(x + rxB, botY);
    ctx.ellipse(x, botY, rxB, ryB, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = LC.bottom; ctx.fill();
  }
  // ③-c) v9: opt.contents 绘制钩子（页面把种粒/石块画进液体里）；save/restore 组件包办，try/catch 静默失败
  const wyB = water > 0.01 ? wy : botY;
  if (typeof opt.contents === 'function'){
    ctx.save();
    try { opt.contents(ctx, {x: x, w: w, yTop: topY, yBot: botY, rxT: rxT, rxB: rxB, halfAt: halfAt, wy: wyB}); } catch(e){}
    ctx.restore();
  }
  // ③-d) 冰块堆（确定性 rand）：堆在底椭圆中心，基线 y−ry*0.5
  const n = Math.round(ice / 20);
  const baseY = y - ryT * 0.5;
  for (let i = 0; i < n; i++){
    const r1 = rand(i * 7 + 3), r2 = rand(i * 7 + 4), r3 = rand(i * 7 + 5);
    const sz = w * (0.15 + r2 * 0.09);
    const cxI = x + (r1 - 0.5) * (halfAt(baseY) * 1.1);
    const cyI = baseY - sz * (0.25 + r3 * 0.5) - (i % 2) * sz * 0.35;
    ctx.beginPath();
    for (let k = 0; k < 6; k++){
      const a = k * Math.PI / 3 + r3 * 0.8;
      const rk = sz * (0.42 + rand(i * 31 + k * 5 + 1) * 0.16);
      const pxx = cxI + Math.cos(a) * rk, pyy = cyI + Math.sin(a) * rk * 0.85;
      if (k === 0) ctx.moveTo(pxx, pyy); else ctx.lineTo(pxx, pyy);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(205,232,246,0.82)'; ctx.fill();
    ctx.strokeStyle = 'rgba(160,200,225,0.9)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cxI - sz * 0.2, cyI - sz * 0.12); ctx.lineTo(cxI + sz * 0.1, cyI - sz * 0.26);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.4; ctx.stroke();
  }
  // ④) 顶面椭圆 fill：盐面 → 液面 → 杯口（全部在内容物之上、描边之下）
  if (salt > 0){
    ctx.save();
    saltClip();
    saltFrame();
    ctx.beginPath(); ctx.ellipse(x, saltY, rxS, ryS, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fbfaf5'; ctx.fill();     // v11 M1: 盐面顶面椭圆（2.5D，与水面同族）
    ctx.restore();
  }
  if (water > 0.01){
    ctx.beginPath(); ctx.ellipse(x, wy, hw, ryW, 0, 0, Math.PI * 2);
    ctx.fillStyle = LC.top; ctx.fill();
  }
  ctx.beginPath(); ctx.ellipse(x, topY, rxT, ryT, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(223,240,246,0.25)'; ctx.fill();
  // ⑤) 所有描边最后画（v11 M2：最上层，单一 strokeStyle 不被任何半透明层叠色 → 椭圆一周颜色均匀）
  // 侧壁三边描边（v8 R39：不闭顶弦，消杯口中间横线）
  ctx.beginPath();
  ctx.moveTo(x - rxT, topY); ctx.lineTo(x - rxB, botY);
  ctx.ellipse(x, botY, rxB, ryB, 0, Math.PI, 0, true);
  ctx.lineTo(x + rxT, topY);
  ctx.strokeStyle = 'rgba(120,160,180,0.9)'; ctx.lineWidth = wall * 0.5; ctx.stroke();
  // 底前弧亮线（玻璃折射感）
  ctx.beginPath(); ctx.ellipse(x, botY, rxB, ryB, 0, 0, Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = Math.max(1.5, w * 0.022); ctx.stroke();
  // 左壁白高光竖条
  ctx.beginPath();
  ctx.moveTo(x - rxT * 0.78, topY + h * 0.06); ctx.lineTo(x - rxB * 0.78, botY - ryB * 0.4);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = Math.max(1.5, w * 0.035); ctx.stroke();
  // 盐面椭圆描边（v11 M1：直立态即见 2/3 盐面边界）
  if (salt > 0){
    ctx.save();
    saltClip();
    saltFrame();
    ctx.beginPath(); ctx.ellipse(x, saltY, rxS, ryS, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(170,165,150,0.85)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
  // 水面椭圆描边
  if (water > 0.01){
    ctx.beginPath(); ctx.ellipse(x, wy, hw, ryW, 0, 0, Math.PI * 2);
    ctx.strokeStyle = LC.line; ctx.lineWidth = 1.5; ctx.stroke();
  }
  // 杯口椭圆完整描边（rim 正常口沿线；v8 R39 已删喙三角）
  ctx.beginPath(); ctx.ellipse(x, topY, rxT, ryT, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(140,175,195,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
};

// ================= 9. doll 玩偶（通用圆滚简笔矢量，禁冰墩墩原版造型） =================
PROPS.doll = function(ctx, x, y, opt){
  opt = opt || {};
  const sc = opt.scale || 1, H = 110 * sc, arm = opt.arm ? 1 : 0;
  const headR = H * 0.18, headCy = y - H + headR;
  const bodyTop = headCy + headR * 0.92, bodyH = H * 0.34, bodyW = H * 0.34;
  const legBot = y - H * 0.02;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // 腿
  ctx.strokeStyle = '#4c6e8d'; ctx.lineWidth = H * 0.085;
  ctx.beginPath(); ctx.moveTo(x - bodyW * 0.22, bodyTop + bodyH - 4); ctx.lineTo(x - bodyW * 0.28, legBot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + bodyW * 0.22, bodyTop + bodyH - 4); ctx.lineTo(x + bodyW * 0.28, legBot); ctx.stroke();
  // 鞋
  ctx.fillStyle = '#7a4a32';
  ctx.beginPath(); ctx.ellipse(x - bodyW * 0.3, legBot + H * 0.012, H * 0.055, H * 0.026, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + bodyW * 0.3, legBot + H * 0.012, H * 0.055, H * 0.026, 0, 0, Math.PI * 2); ctx.fill();
  // 躯干（暖色衣服）
  rr(ctx, x - bodyW / 2, bodyTop, bodyW, bodyH, bodyW * 0.36);
  ctx.fillStyle = '#e8804c'; ctx.fill();
  ctx.strokeStyle = 'rgba(150,70,35,0.5)'; ctx.lineWidth = 1.2; ctx.stroke();
  // 手臂（arm=1 右臂举起持物姿态）
  ctx.strokeStyle = '#e8804c'; ctx.lineWidth = H * 0.068;
  ctx.beginPath(); ctx.moveTo(x - bodyW / 2 + 2, bodyTop + bodyH * 0.18);
  ctx.lineTo(x - bodyW / 2 - H * 0.055, bodyTop + bodyH * 0.78); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + bodyW / 2 - 2, bodyTop + bodyH * 0.18);
  if (arm) ctx.lineTo(x + bodyW / 2 + H * 0.13, bodyTop - H * 0.13);
  else ctx.lineTo(x + bodyW / 2 + H * 0.055, bodyTop + bodyH * 0.78);
  ctx.stroke();
  // 手
  ctx.fillStyle = '#f5d0a9';
  ctx.beginPath(); ctx.arc(x - bodyW / 2 - H * 0.062, bodyTop + bodyH * 0.84, H * 0.035, 0, Math.PI * 2); ctx.fill();
  const hx = arm ? x + bodyW / 2 + H * 0.145 : x + bodyW / 2 + H * 0.062;
  const hy = arm ? bodyTop - H * 0.155 : bodyTop + bodyH * 0.84;
  ctx.beginPath(); ctx.arc(hx, hy, H * 0.035, 0, Math.PI * 2); ctx.fill();
  // 头
  ctx.beginPath(); ctx.arc(x, headCy, headR, 0, Math.PI * 2);
  ctx.fillStyle = '#f5d0a9'; ctx.fill();
  ctx.strokeStyle = 'rgba(180,130,90,0.6)'; ctx.lineWidth = 1.2; ctx.stroke();
  // 呆毛
  ctx.strokeStyle = '#8a5a3a'; ctx.lineWidth = Math.max(1.2, H * 0.014);
  ctx.beginPath(); ctx.moveTo(x, headCy - headR);
  ctx.quadraticCurveTo(x + headR * 0.18, headCy - headR * 1.35, x + headR * 0.35, headCy - headR * 1.12);
  ctx.stroke();
  // 眼 + 腮红 + 微笑
  ctx.fillStyle = '#3b2f2a';
  ctx.beginPath(); ctx.arc(x - headR * 0.36, headCy - headR * 0.08, headR * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + headR * 0.36, headCy - headR * 0.08, headR * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(240,150,130,0.35)';
  ctx.beginPath(); ctx.arc(x - headR * 0.55, headCy + headR * 0.22, headR * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + headR * 0.55, headCy + headR * 0.22, headR * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b06a4e'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(x, headCy + headR * 0.14, headR * 0.32, Math.PI * 0.25, Math.PI * 0.75); ctx.stroke();
  ctx.restore();
};

// ================= 10. heat_source 通用热源 =================
// 可操作通用件（开发规则第6条：替代酒精灯）；与第二批热学件对齐接口：level 0=关/1-3 档，knob 随 level
// v5: opt.knob===false 跳过自绘旋钮+指示灯（页面自绘真旋钮用），其余照常画
// v6 2.5D（蔡总 R33：加热底座不能是平面方盒）：顶盘椭圆+前立面体块(左亮右暗)+底椭圆前弧落地；boxTop=顶盘椭圆中心 y（语义不变）
PROPS.heat_source = function(ctx, x, y, opt){
  opt = opt || {};
  const w = opt.w || 130, h = w * 0.58;
  const level = Math.max(0, Math.min(3, opt.level || 0));
  const drawKnob = opt.knob !== false;
  const knobA = ((drawKnob && opt.knob !== undefined ? opt.knob : level * 45) - 90) * Math.PI / 180;
  const rx = w / 2, ryT = w * 0.16, ryB = ryT;   // v7 R38：ryB=ryT，顶/底椭圆 ry 一致→台面不倾斜（原 w*0.08）
  const boxTop = y - h + ryT;              // 顶盘椭圆中心（盘顶=y−h，总高 h 语义不变）
  const botCy = boxTop + w * 0.34;         // 底椭圆中心（体块 h_body=w*0.34；v7 ryB=ryT 后前弧落 y+w*0.08，boxTop/返回不变）
  ctx.save(); ctx.lineJoin = 'round';
  // 热晕红光（自发光，level 越高越强，自顶盘向上径向，画在底座之上）
  if (level > 0){
    const gr = ctx.createRadialGradient(x, boxTop, w * 0.05, x, boxTop, w * (0.2 + level * 0.11));
    gr.addColorStop(0, 'rgba(255,80,40,' + (0.16 + level * 0.13) + ')');
    gr.addColorStop(0.55, 'rgba(255,60,30,' + (0.07 + level * 0.06) + ')');
    gr.addColorStop(1, 'rgba(255,60,30,0)');
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(x, boxTop, w * (0.2 + level * 0.11), 0, Math.PI * 2); ctx.fill();
  }
  // 体块：顶盘切点向下侧壁 + 底椭圆前弧（2.5D 落地感），前立面灰黑渐变
  ctx.beginPath();
  ctx.moveTo(x - rx, boxTop);
  ctx.lineTo(x - rx, botCy);
  ctx.ellipse(x, botCy, rx, ryB, 0, Math.PI, 0, true);
  ctx.lineTo(x + rx, boxTop);
  ctx.closePath();
  const gbs = ctx.createLinearGradient(0, boxTop, 0, botCy + ryB);
  gbs.addColorStop(0, '#4b5563'); gbs.addColorStop(1, '#374151');
  ctx.fillStyle = gbs; ctx.fill();
  // 侧面明暗：左立面略亮/右略暗两段（clip 在体块内）
  ctx.save(); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x - rx, boxTop - ryT, rx, h + ryT * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(x, boxTop - ryT, rx, h + ryT * 2);
  ctx.restore();
  ctx.strokeStyle = 'rgba(20,22,26,0.8)'; ctx.lineWidth = 1.2; ctx.stroke();
  // 底椭圆前半弧加深（落地描边）
  ctx.beginPath(); ctx.ellipse(x, botCy, rx, ryB, 0, 0, Math.PI);
  ctx.strokeStyle = 'rgba(20,22,26,0.85)'; ctx.lineWidth = 1.4; ctx.stroke();
  // 顶盘椭圆（金属暗灰径向渐变；level>0 盘心橙红热晕加强）
  ctx.beginPath(); ctx.ellipse(x, boxTop, rx, ryT, 0, 0, Math.PI * 2);
  const gp = ctx.createRadialGradient(x, boxTop, w * 0.05, x, boxTop, rx);
  if (level > 0){
    gp.addColorStop(0, 'rgba(255,' + (110 - level * 20) + ',50,0.95)');
    gp.addColorStop(0.6, '#4a4e55');
    gp.addColorStop(1, '#33373d');
  } else {
    gp.addColorStop(0, '#565b63'); gp.addColorStop(1, '#33373d');
  }
  ctx.fillStyle = gp; ctx.fill();
  ctx.strokeStyle = 'rgba(20,22,26,0.85)'; ctx.lineWidth = 1.2; ctx.stroke();
  // 热盘同心环纹
  ctx.beginPath(); ctx.ellipse(x, boxTop, w * 0.26, ryT * 0.5, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.stroke();
  // 旋钮（新前立面居中，角度随 level）；v5: opt.knob===false 时整段跳过（含指示灯）
  const kx = x - w * 0.3, ky = (boxTop + botCy) / 2, kr = w * 0.055;
  if (drawKnob){
    ctx.strokeStyle = 'rgba(200,205,212,0.5)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++){
      const a = (i * 45 - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(kx + Math.cos(a) * kr * 1.35, ky + Math.sin(a) * kr * 1.35);
      ctx.lineTo(kx + Math.cos(a) * kr * 1.65, ky + Math.sin(a) * kr * 1.65);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(kx, ky, kr, 0, Math.PI * 2);
    ctx.fillStyle = '#c8ced6'; ctx.fill();
    ctx.strokeStyle = '#5b6068'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(kx, ky);
    ctx.lineTo(kx + Math.cos(knobA) * kr * 0.8, ky + Math.sin(knobA) * kr * 0.8);
    ctx.strokeStyle = level > 0 ? '#dc2626' : '#374151'; ctx.lineWidth = 2; ctx.stroke();
    // 档位指示灯
    ctx.beginPath(); ctx.arc(x + w * 0.32, ky, w * 0.018, 0, Math.PI * 2);
    ctx.fillStyle = level > 0 ? '#f87171' : '#6b7280'; ctx.fill();
    ctx.strokeStyle = 'rgba(20,22,26,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.restore();
  // v3: 返回几何（页面点旋钮命中/顶盘放置避让用）；v6 字段不变，boxTop=顶盘椭圆中心
  return {w: w, h: h, boxTop: boxTop, knob: {x: kx, y: ky, r: kr}};
};

// ================= 12. stone 小石块（c6s34 v9 新件） =================
// 不规则多面体 2.5D（投影常量同 material_block：dx=0.35d/dy=-0.35d）；灰青岩石 #8a9a94 系 + sin 伪随机斑点与棱角纹
// opt: size=60（基准边长 px，页面按石块体积 V∈15~20cm³ 派生）/ seed=1（整数：顶点数 6~8 + 半径/角度扰动，同 seed 永远同形）/ wet 0~1（湿水态整体加深约15%+顶面高光增强，入水后页面传 1）
PROPS.stone = function(ctx, x, y, opt){
  opt = opt || {};
  const s = opt.size || 60;
  const seed = Math.round(opt.seed == null ? 1 : opt.seed);
  const wet = Math.max(0, Math.min(1, opt.wet || 0));
  const n = 6 + Math.floor(rand(seed * 13 + 1) * 2.999);        // 顶点数 6~8（seed 确定性）
  const dx = s * P25.dx * 0.6, dy = s * P25.dy * 0.6;
  // 色板：干态灰青 / 湿态整体加深约 15%（mixHex 插值）
  const cTop = mixHex('#9aa9a3', '#83908b', wet);
  const cFront = mixHex('#8a9a94', '#75837e', wet);
  const cEdge = mixHex('#5d6b66', '#4f5b57', wet);
  const cyT = y - s * 0.62 + dy * 0.35;                         // 顶面中心（含 2.5D 上移）
  const top = [], bot = [];
  for (let i = 0; i < n; i++){
    const a = i * Math.PI * 2 / n + (rand(seed * 29 + i * 7) - 0.5) * 0.6;
    const r = s * 0.5 * (0.72 + rand(seed * 41 + i * 11) * 0.42);
    top.push({x: x + Math.cos(a) * r + dx * 0.35, y: cyT + Math.sin(a) * r * 0.5, s: Math.sin(a)});
    bot.push({x: x + Math.cos(a) * r * 0.82, y: Math.min(y, y - s * 0.05 + Math.sin(a) * r * 0.22)});
  }
  ctx.save(); ctx.lineJoin = 'round';
  // 侧面棱面 quad（仅前面棱：sin(a) 均值 ≥ -0.2），每面明暗扰动 → 棱角感
  for (let i = 0; i < n; i++){
    const j = (i + 1) % n;
    if ((top[i].s + top[j].s) / 2 < -0.2) continue;
    ctx.beginPath();
    ctx.moveTo(top[i].x, top[i].y); ctx.lineTo(top[j].x, top[j].y);
    ctx.lineTo(bot[j].x, bot[j].y); ctx.lineTo(bot[i].x, bot[i].y);
    ctx.closePath();
    ctx.fillStyle = cFront; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,' + (rand(seed * 67 + i * 5) * 0.16).toFixed(3) + ')';
    ctx.fill();
    ctx.strokeStyle = cEdge; ctx.lineWidth = 1; ctx.stroke();
  }
  // 顶面（不规则多边形，2.5D 投影）
  ctx.beginPath();
  for (let i = 0; i < n; i++){
    if (i === 0) ctx.moveTo(top[i].x, top[i].y); else ctx.lineTo(top[i].x, top[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = cTop; ctx.fill();
  ctx.strokeStyle = cEdge; ctx.lineWidth = 1; ctx.stroke();
  // 顶面高光（wet 增强；复用顶面路径）
  const gsh = ctx.createLinearGradient(x - s * 0.4, cyT - s * 0.25, x + s * 0.4, cyT + s * 0.25);
  gsh.addColorStop(0, 'rgba(255,255,255,' + (0.10 + wet * 0.22).toFixed(2) + ')');
  gsh.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gsh; ctx.fill();
  // 棱角纹（前面顶点→底部落线）
  ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 1;
  for (let i = 0; i < n; i++){
    if (top[i].s < 0) continue;
    ctx.beginPath(); ctx.moveTo(top[i].x, top[i].y); ctx.lineTo(bot[i].x, bot[i].y); ctx.stroke();
  }
  // 斑点纹理（sin 伪随机，同参数重绘严格同图）
  for (let k = 0; k < 26; k++){
    const r1 = rand(seed * 97 + k * 3 + 1), r2 = rand(seed * 97 + k * 3 + 2), r3 = rand(seed * 97 + k * 3 + 3);
    const px = x + (r1 - 0.5) * s * 0.95;
    const py = cyT - s * 0.1 + r2 * s * 0.62;
    ctx.fillStyle = r3 > 0.5 ? 'rgba(255,255,255,' + (0.18 + wet * 0.12).toFixed(2) + ')' : 'rgba(40,50,45,0.25)';
    ctx.fillRect(px, py, Math.max(1, s * 0.022), Math.max(1, s * 0.022));
  }
  ctx.restore();
};

// ================= 13. salt_jar 盐罐（c6s34 v9 新件） =================
// 广口玻璃罐（玻璃族视觉语言同 cylinder_grad/beaker_ice：浅青半透明+竖高光条+口部椭圆）+ 罐内白色盐粒堆积（sin 伪随机细颗粒感）
// opt: saltLevel=80（0~100 余盐%，堆积高度联动）/ pour=0~1（0=直立、≥1=倾斜约45°，绕底面中心旋转；pour>0.3 罐口画盐粒流：4 条抛物线轨迹确定性伪随机白点）/ h=120（罐高）
// 无 mount（主动件，倾倒目标由页面层对准 beaker）；返回 {w,h,mouth:{x,y}}（罐口世界坐标，页面对准/盐粒流落点参考）
PROPS.salt_jar = function(ctx, x, y, opt){
  opt = opt || {};
  const h = opt.h || 120;
  const bw = h * 0.66;                        // 罐身宽
  const mw = bw * 1.14;                       // 罐口宽（广口外扩）
  const level = Math.max(0, Math.min(100, opt.saltLevel == null ? 80 : opt.saltLevel));
  const pour = Math.max(0, Math.min(1, opt.pour || 0));
  const ang = pour * Math.PI / 4;             // 倾倒 ~45°
  const wall = Math.max(2, bw * 0.05);
  const mouthY = -h * 0.88;                   // 罐口椭圆中心（局部坐标）
  const mry = mw * 0.14;
  const rb = bw * 0.12;                       // 底角圆角
  const bodyPath = function(){
    ctx.beginPath();
    ctx.moveTo(-bw / 2 + rb, 0);
    ctx.lineTo(bw / 2 - rb, 0);
    ctx.arcTo(bw / 2, 0, bw / 2, -rb, rb);
    ctx.lineTo(bw / 2, -h * 0.74);
    ctx.lineTo(mw / 2, mouthY);
    ctx.lineTo(-mw / 2, mouthY);
    ctx.lineTo(-bw / 2, -h * 0.74);
    ctx.lineTo(-bw / 2, -rb);
    ctx.arcTo(-bw / 2, 0, -bw / 2 + rb, 0, rb);
    ctx.closePath();
  };
  const innerPath = function(){               // 内腔（盐粒 clip 用）
    ctx.beginPath();
    ctx.moveTo(-bw / 2 + wall, -wall * 0.5);
    ctx.lineTo(bw / 2 - wall, -wall * 0.5);
    ctx.lineTo(bw / 2 - wall, -h * 0.74);
    ctx.lineTo(mw / 2 - wall, mouthY);
    ctx.lineTo(-mw / 2 + wall, mouthY);
    ctx.lineTo(-bw / 2 + wall, -h * 0.74);
    ctx.closePath();
  };
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  // 1) 玻璃背层 + 罐口椭圆底
  bodyPath();
  ctx.fillStyle = 'rgba(220,240,246,0.30)'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, mouthY, mw / 2, mry, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(223,240,246,0.25)'; ctx.fill();
  // 2) 盐堆：clip 内腔；pour 态盐面保持世界水平（反转旋转），直立态中央微拱
  if (level > 0){
    const hs = (h * 0.74 - wall) * level / 100;
    ctx.save();
    innerPath(); ctx.clip();
    ctx.rotate(-ang);                         // 回世界朝向（原点仍在罐底中心）
    const saltY = -hs * (1 - pour * 0.45);    // 倾倒时余盐面下降
    const dome = hs * 0.08 * (1 - pour);
    ctx.beginPath();
    ctx.moveTo(-h * 1.5, saltY);
    ctx.quadraticCurveTo(0, saltY - dome * 2, h * 1.5, saltY);
    ctx.lineTo(h * 1.5, h * 1.5); ctx.lineTo(-h * 1.5, h * 1.5);
    ctx.closePath();
    ctx.fillStyle = '#f7f6f0'; ctx.fill();
    for (let k = 0; k < 30; k++){             // 细颗粒感（sin 伪随机，确定性）
      const r1 = rand(k * 3 + 11), r2 = rand(k * 3 + 12), r3 = rand(k * 3 + 13);
      ctx.fillStyle = r3 > 0.5 ? 'rgba(214,211,196,0.75)' : 'rgba(255,255,255,0.9)';
      ctx.fillRect((r1 - 0.5) * bw * 2.6, saltY + r2 * h * 0.8, Math.max(1, h * 0.014), Math.max(1, h * 0.014));
    }
    ctx.restore();
  }
  // 3) 前壁描边 + 竖高光条 + 罐口椭圆描边
  bodyPath();
  ctx.strokeStyle = 'rgba(120,160,180,0.9)'; ctx.lineWidth = wall * 0.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = Math.max(1.5, bw * 0.05);
  ctx.beginPath(); ctx.moveTo(-bw * 0.27, -h * 0.06); ctx.lineTo(-bw * 0.27, -h * 0.68); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, mouthY, mw / 2, mry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(140,175,195,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
  // 罐口世界坐标（旋转后）：局部 (0,mouthY) → 世界 (x−mouthY·sin a, y+mouthY·cos a)
  const mx = x - mouthY * Math.sin(ang), my = y + mouthY * Math.cos(ang);
  // 4) 盐粒流（pour>0.3：3~5 条抛物线轨迹上的确定性伪随机白点，世界坐标）
  if (pour > 0.3 && level > 0){
    for (let k = 0; k < 4; k++){
      const jx = (rand(k * 17 + 3) - 0.5) * mw * 0.5;
      for (let j = 0; j < 9; j++){
        const t = (j + 1) / 9 + (rand(k * 31 + j * 7 + 5) - 0.5) * 0.06;
        const px = mx + jx + h * 0.16 * t + (rand(k * 13 + j) - 0.5) * h * 0.03;
        const py = my + h * 0.05 * t + h * 0.55 * t * t;
        ctx.beginPath(); ctx.arc(px, py, h * (0.008 + rand(k * 7 + j * 3 + 1) * 0.008), 0, Math.PI * 2);
        ctx.fillStyle = rand(k * 5 + j) > 0.5 ? 'rgba(255,255,255,0.95)' : 'rgba(240,238,228,0.9)';
        ctx.fill();
      }
    }
  }
  return {w: bw, h: h, mouth: {x: mx, y: my}};
};

// ================= 14. seed_grains 种粒（c6s34 v9 新件，Q6 选种联动专用） =================
// 在给定矩形液体区域内画一组种粒。锚点=区域底面中心，区域=[x±w/2]×[y−h, y]
// 两类粒：饱满粒（饱满谷粒形椭圆、暖黄 #d9b36c 系、密度语义约 1.3 g/cm³ 永远沉底）
//         空瘪粒（更小而扁、暗黄 #b8975a 系、密度语义约 0.95~1.05）
// opt: rho=1.10（盐水密度 1.00~1.20；rho≥HOLLOW_CRIT=1.05 时空瘪粒目标=漂浮液面）/ level=0.8（液面高度 0~1，与宿主容器水位对齐）
//      w=160 / h=120（区域宽高）/ count=12（饱满8+空瘪4）/ t=0~1（浮沉动画插值，页面 rAF 驱动；t=0 全在底、t=1 空瘪粒到液面下缘轻微悬浮；smoothstep 禁回弹震荡）/ seed=1（位置确定性）
PROPS.seed_grains = function(ctx, x, y, opt){
  opt = opt || {};
  const HOLLOW_CRIT = 1.05;                   // 空瘪粒临界密度（组件内常量）
  const w = opt.w || 160, h = opt.h || 120;
  const level = Math.max(0, Math.min(1, opt.level == null ? 0.8 : opt.level));
  const rho = opt.rho == null ? 1.10 : opt.rho;
  const count = Math.max(2, Math.round(opt.count || 12));
  const nHollow = Math.max(1, Math.round(count / 3));           // 12 → 4 空瘪
  const nPlump = count - nHollow;                               // 12 → 8 饱满
  const t = Math.max(0, Math.min(1, opt.t == null ? 1 : opt.t));
  const ts = t * t * (3 - 2 * t);             // smoothstep 插值
  const seed = Math.round(opt.seed == null ? 1 : opt.seed);
  const g = Math.max(4, Math.min(w, h) * 0.055);                // 饱满粒基准半长
  const waterY = y - h * level;
  const L = x - w / 2;
  const drawGrain = function(px, py, rx, ry, rot, fill, dark){
    ctx.save(); ctx.translate(px, py); ctx.rotate(rot);
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-rx * 0.55, 0); ctx.quadraticCurveTo(0, -ry * 0.4, rx * 0.55, 0);
    ctx.strokeStyle = dark; ctx.lineWidth = 0.8; ctx.stroke();  // 谷粒纵沟
    ctx.restore();
  };
  ctx.save();
  // 饱满粒：恒在底（堆底 1~2 层）
  for (let i = 0; i < nPlump; i++){
    const r1 = rand(seed * 17 + i * 5 + 1), r2 = rand(seed * 17 + i * 5 + 2), r3 = rand(seed * 17 + i * 5 + 3);
    drawGrain(L + w * 0.1 + r1 * w * 0.8, y - g * 0.5 - r2 * g * 1.6,
      g, g * 0.42, (r3 - 0.5) * 1.2, '#d9b36c', '#b08f4e');
  }
  // 空瘪粒：rho≥1.05 时 t 插值 → 液面下缘轻微悬浮（水平微漂移）；否则留底
  const canFloat = rho >= HOLLOW_CRIT;
  for (let j = 0; j < nHollow; j++){
    const r1 = rand(seed * 23 + j * 7 + 1), r2 = rand(seed * 23 + j * 7 + 2), r3 = rand(seed * 23 + j * 7 + 3);
    const bx = L + w * 0.12 + r1 * w * 0.76, by = y - g * 0.4 - r2 * g * 1.2;
    const fx = bx + (r3 - 0.5) * w * 0.18;                      // 漂浮目标 x（微漂移）
    const fy = waterY + g * 0.55 + r2 * g * 0.5;                // 液面下缘轻微悬浮
    const px = canFloat ? bx + (fx - bx) * ts : bx;
    const py = canFloat ? by + (fy - by) * ts : by;
    drawGrain(px, py, g * 0.68, g * 0.26, (r3 - 0.5) * 1.6, '#b8975a', '#96793f');
  }
  ctx.restore();
};

PROPS.DENSITY_IDS = ['balance_pan','weight_set','rider','material_block','cylinder_grad','density_scale','clay','beaker_ice','doll','heat_source','weight_single','stone','salt_jar','seed_grains'];

})(typeof window !== 'undefined' ? window : globalThis);
