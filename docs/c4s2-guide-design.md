# c4s2 光的反射实验室 · 语音讲解层设计书（B 版标配）

> 目标页面：`content/physics_g8_v1_c4_s2/exp-reflect.html`（单实验页，无模式切换）
> 规范依据：`可交互教材/实验语音讲解层改造规范-B版标配.md`（2026-10-26 定稿）——steps 全 `repeat:true`+3s 冷却、状态闸门、五类全覆盖（intro/steps/errors/free/tasks 全带 audio）、事件型 trigger 用 `event:` 前缀、延时结论 `after:xxx@6000`。
> 格式模板：`docs/c4s3-guide-variants-design.md`。
> **物理口径权威源 = `explain.html`**：反射定律三条（三线共面 / 分居法线两侧 / 反射角等于入射角，explain.html:94-96）、三线共面折纸板验证（:98）、光路可逆（:99）、镜面反射（:114）、漫反射（:115）、两种反射都遵守反射定律（:118）、垂直入射两角 0° 原路返回（:82）、法线定义与量角基准（:72）。本文全部文案与其一致，无冲突。
> 本文档为纯设计产出，零代码改动。**所有 trigger 中的 R 字段均已对照 `exp-reflect-render.js`（`window.RFX` 定义处）与 `exp-reflect-core.js`（唯一 mutate 处）逐一 grep 核实，每条附出处；禁臆造字段，未使用任何 c4_s3 私有 G.xxxCount。**

---

## §-1 状态暴露核查（已核实）

### 结论：状态已在 window 上，无需加暴露代码

- **定义处**：`exp-reflect-render.js:4` → `var R = window.RFX = {…}`（render.js:4-13 初始化全部字段）。
- **引用与 mutate**：`exp-reflect-core.js:7` → `var R=window.RFX;`，此后 core 全部**原地 mutate 同一对象**（core:17-18 追加初始化、core:41/63/70/76/78/84/88/96-98/126/136/142/147/150 各处写入），全文无任何对 `window.RFX` 的重新赋值（grep 核实仅 render:4 一处赋值）→ **引用稳定，guide 引擎可像 c4s3 持 `window.MRR` 一样持 `window.RFX`，零暴露改动**。
- ⚠️ 唯一陷阱字段：`R.showRead`（render:9 初始化 true）**从未被 mutate**——`#cb-read` 只切 DOM display（core:99-102），不写 R。**禁止用于 trigger**（下表已标注）。

### 已核实状态字段速查表（trigger 只准用这些）

| 字段 | 类型 | 取值 | 含义 | 出处（定义 / mutate） |
|---|---|---|---|---|
| `R.angleI` | number(弧度) | 0~80°→0~1.396，初始 45° | **唯一角度状态**；∠r≡∠i 同变量，无独立反射角 | render:5 定义；core:41 `setAngleDeg()` 唯一写入（clamp 0..80 core:40）；滑杆 core:61、± 钮 core:80-81、canvas 拖笔 core:130-134 都汇入它 |
| `R.laserOn` | bool | 初始 false | 光源开关（single=激光笔红钮；beam=点太阳） | core:17 初始化；core:147 红钮 toggle、core:142 太阳 toggle、core:88 reset→false |
| `R.fold` | number | 0~85，初始 0 | 折纸板角度（度）；>0 时反射光被 clip 不进折起半板（render:42） | core:17；core:63 `#fold-slider` input；core:88 reset→0 |
| `R.rough` | number | 0~100，初始 0 | 粗糙度；**smooth 面被 syncSurface 强制 0** | core:17；core:70 `syncSurface()`、core:76 `#rough-slider` input；core:88 reset |
| `R.beamMode` | string | `'single'`\|`'beam'` | 单光线 / 平行光束（太阳） | core:17；core:78 radio change；core:88 reset→'single' |
| `R.showNormal` | bool | 默认 **true** | 法线金色虚线显示（render:44-51 画，N 标 render:49） | render:9；core:96 `#cb-normal` change |
| `R.showArc` | bool | 默认 **true** | ∠i/∠r 青色角弧+读数（laserOn 且 angleI>0.02 才画，render:124） | render:9；core:97 `#cb-arc` change |
| `R.showArrow` | bool | 默认 **false** | 光线中点红色箭头（render:83） | core:17；core:98 `#cb-arrow` change |
| `R.showRead` | bool | 恒 true | ⚠️ **从不 mutate，禁用于 trigger**（cb-read 只切 DOM，core:99-102） | render:9 |
| `R.pulse.reverse` | bool | 初始 false | **光路可逆态**（光线/箭头/光点全部反向，render:96-97,119,143-160） | render:8；core:18；core:84 `#btn-reverse` click toggle；core:88 reset→false |
| `R.pulse.active` | bool | 初始 false | 金色光点动画播放中（render:140-166） | render:8；core:18；core:84 置 true |
| `R.dragFb` | bool | 初始 false | 正拖着激光笔笔身（金色描边反馈 render:179） | render:11；core:150 置 true / core:136 `stopDrag()` 置 false |
| `R.sunHover` | bool | 初始 false | beam 模式鼠标悬停太阳 | core:17；core:126 |
| `R.sunHit` | null\|{x,y,r} | beam 模式才有 | 太阳命中区（render:86-87 设；single 模式 render:116 置 null） | render:87/116 |
| `R.fold>0` 时光路 clip | — | — | 折痕左侧为有效光路平面（三线共面演示的渲染基础） | render:42 |
| 几何类 `R.W/H/O/L/by/mirrorY/mirrorLen/mirrorDepth/boardH/penW/penH` | number/obj | resize 重算 | 布局几何，不用于语义 trigger | core:20-33 `layout()`、render:29-34 |
| `R.ripple` / `R.ctx` | obj | — | 点击波纹 / canvas 上下文，不用于 trigger | render:11-12 |

### 控件 id 速查（exp-reflect.html，grep 核实行号）

| id / name | 行号 | 说明 |
|---|---|---|
| `#scene` canvas / `#scene-wrap` | 45 | 主画布；激光笔红钮、太阳、笔身拖拽全在 canvas 内（无 DOM 按钮） |
| `#ang-minus` / `#ang-slider` / `#ang-plus` / `#ang-val` | 51/52/53/54 | 入射角 0~80 step1（core:61 input、core:80-81 click） |
| `#fold-slider` / `#fold-val` | 60/61 | 折纸板 0~85（core:62） |
| radio `name=beam-mode` value `single`(checked)/`beam` | 67/68 | 光源模式（core:77-79） |
| `#surface` select：`smooth`\|`rough` | 69 | 平面镜/粗糙面（core:75 change→syncSurface） |
| `#rough-slider`(0~100 step5 默认40 disabled) / `#rough-val` | 70/71 | 仅 rough 面启用（core:69 disabled 切换、core:76 input） |
| `#cb-normal`(checked) / `#cb-arc`(checked) / `#cb-arrow` / `#cb-read`(checked) | 77/78/79/80 | 显示开关（core:96-102） |
| `#read-i` / `#read-r` | 81 | ∠i/∠r 读数（同 angleI，core:43 同步写） |
| `#btn-reverse` | 87 | 光路可逆 toggle（core:83-86） |
| `#btn-reset` / `#btn-mute` / `#btn-full` | 93/94/95 | 重置（core:87-94）/静音/全屏 |
| `#hint` | header | 原生提示条；core:105-112 `updateHint()` 优先级链：beam→fold→reverse→rough→laserOff→默认 |

### 引导层私有 G 字段（引擎自建，只读 RFX+DOM，绝不写实验状态）

| G 字段 | 含义 | 采集方式 |
|---|---|---|
| `G.t` | 当前 performance.now() | 引擎每帧更新（c4s3 同构） |
| `G.modeEnterT` | 进入页面（guide init）时间戳 | init 时记录；c4s2 无模式切换，只记一次 |
| `G.angChangeCount` | 入射角改动「手势」计数 | 监听 `R.angleI` 变化（**唯一写入点 core:41，滑杆/±钮/canvas 拖笔三条路径全覆盖**）；变化且已武装→+1 并解除武装，静默 350ms 重新武装（镜像 c4s3 objChangeCount，规范 §3.2） |
| `G.lastAngChangeT` | 最近一次 `R.angleI` 变化时间戳 | 同上 |

> **最小暴露方案：不需要。** `window.RFX` 已是全局稳定引用、字段齐备（angleI/laserOn/fold/rough/beamMode/showNormal/showArc/showArrow/pulse.reverse/dragFb 覆盖本设计全部 trigger）。若未来落地时发现引擎拿不到（如脚本加载顺序），兜底方案为在 core IIFE 末尾加一行 `window.RFX_STATE=R;`——当前核查结论：**无需加**。

---

## §1 步骤解说稿 steps（10 条，全 repeat:true）

触发纪律：全部边沿触发+3s 冷却（REP_COOLDOWN，规范 §2.2）；延时链一律 `after:xxx@6000`（规范 §2.4，即时打断制下 @值必须 ≥6s）；开场步 s1 挂 intro 闸门（规范 §2.3，`G.t-G.modeEnterT>15500` = intro 预估 14.5s+1s 余量，**落地必须 afinfo 实测校准**，规范 §4.4）。互斥审计：s1/s3/s4 限 single+fold0+rough0+!reverse，s6 限 fold>0，s7 限 reverse，s8 限 beam+rough0+fold0+!reverse，s9 限 rough>0+fold0+!reverse——任意时刻至多一条电平为真，不会互相掐音频（延时链 s2/s5/concl 天然错开 6s）。

| step id | trigger（只用已核实字段） | 核实出处 | say（≤25字） | audio |
|---|---|---|---|---|
| c4s2-s1 开激光 | `R.laserOn===true && R.beamMode==='single' && R.fold===0 && R.rough===0 && !R.pulse.reverse && (G.t-G.modeEnterT)>15500` | laserOn core:17/147；beamMode core:17/78；fold core:17/63；rough core:17/70；pulse.reverse core:18/84 | 激光开啦！这束红光射向平面镜，叫入射光线。 | c4s2-s1 |
| c4s2-s2 入射点O | `after:c4s2-s1@6000` | 延时链（引擎 after: 型，规范 §2.4）；O 点渲染 render:172，入射点定义 explain:72 | 光打在镜面的 O 点——入射点；反射光也从 O 射出。 | c4s2-s2 |
| c4s2-s3 改入射角 | `event:input:#ang-slider:R.laserOn===true && R.beamMode==='single' && R.fold===0 && !R.pulse.reverse` | #ang-slider html:52、core:61 input 监听；状态闸门 laserOn（规范 §2.6）。canvas 拖笔改角不走滑杆事件，由 f1（R.dragFb）兜底解说 | 拖动滑杆改入射角，看反射角马上跟着变！ | c4s2-s3 |
| c4s2-s4 显示法线 | `R.laserOn===true && R.showNormal===true && R.beamMode==='single' && R.fold===0 && R.rough===0 && !R.pulse.reverse && G.angChangeCount>=1 && (G.t-G.lastAngChangeT)>800` | showNormal render:9/core:96（默认 true）；法线渲染 render:44-51；静止>800ms 挂引导语（规范 §2.5），与 s3 事件型错开 | 金色虚线是法线，垂直镜面，两个角都从它量起。 | c4s2-s4 |
| c4s2-s5 验证∠r=∠i | `after:c4s2-s4@6000` | 角弧+读数渲染 render:124-137（∠r 恒等 ∠i 同变量 render:5）；口径 explain:96 | 看角弧：∠r 和 ∠i 相等，反射角=入射角！ | c4s2-s5 |
| c4s2-s6 三线共面 | `R.fold>0 && R.laserOn===true && R.beamMode==='single' && !R.pulse.reverse` | fold core:17/63；折起后光路 clip render:42；口径 explain:94/98 + core:107 hint 同义 | 纸板一折，反射光不在折起的纸板上——三线共面！ | c4s2-s6 |
| c4s2-s7 光路可逆 | `R.pulse.reverse===true && R.laserOn===true && R.fold===0` | pulse.reverse core:84 toggle；反向光路 render:96-97/119；口径 explain:99 + core:108 hint 同义。**电平触发不用 event:click**——capture 事件读到的是点击前状态，toggle 钮语义会反（适配点 A7） | 光路可逆！沿原反射光路射入，光就沿原入射路射出。 | c4s2-s7 |
| c4s2-s8 镜面反射 | `R.beamMode==='beam' && R.laserOn===true && R.rough===0 && R.fold===0 && !R.pulse.reverse` | beamMode core:78；beam 平行光渲染 render:99-107；太阳开关 laserOn core:142；口径 explain:114 | 平行光照镜面，反射光仍平行——这是镜面反射。 | c4s2-s8 |
| c4s2-s9 漫反射 | `R.rough>0 && R.laserOn===true && R.fold===0 && !R.pulse.reverse` | rough core:70（切 rough 面即 40）/76；逐点局部法线反射 render:94,104；口径 explain:115/118 | 表面变粗糙，反射光散向四面八方——漫反射。 | c4s2-s9 |
| c4s2-concl 结论 | `after:c4s2-s9@6000` | 延时结论（任务书：after:最后步骤@6000）；口径 explain:159-162 小结四条 | 记住啦：三线共面、分居法线两侧、反射角等于入射角；镜面反射和漫反射都遵守反射定律，光路还可逆！ | c4s2-concl |

> 步骤流对照任务要求：开激光(s1)→入射光射向镜面(s2)→改入射角看反射角(s3)→显示法线(s4)→验证反射角=入射角(s5)→三线共面加餐(s6)→光路可逆(s7)→镜面反射(s8)vs漫反射(s9)→结论(concl)。
> 备注：若蔡总希望结论无条件兜底（不进粗糙面也播），可把 concl 改锚 `after:c4s2-s5@6000`——本稿按任务书锚最后步骤 s9。

---

## §2 纠错 errors（3 条「不对哟～」）

原则：活泼不打击、只说应该先做什么（规范 §2.8）；全部事件型 `event:` 前缀+状态闸门；引擎 capture 即时判态、同条 5s 节流。

| id | trigger | 核实出处 | fix（橙色字幕） | audio |
|---|---|---|---|---|
| c4s2-e1 | `event:input:#ang-slider:R.laserOn===false` | #ang-slider html:52/core:61；laserOn core:17（未开光拖角滑杆，画面无任何光线） | 不对哟～先点激光笔的红钮开光，再改入射角呀。 | c4s2-e1 |
| c4s2-e2 | `event:click:#btn-reverse:R.laserOn===false` | #btn-reverse html:87/core:83；capture 读点击前 laserOn（此处恰为所需：点之前就没开光） | 不对哟～光还没开呢，先开光源再演示光路可逆。 | c4s2-e2 |
| c4s2-e3 | `event:change:#surface:R.laserOn===false` | #surface html:69/core:75 change→syncSurface | 不对哟～先打开光源，再换粗糙面看漫反射哦。 | c4s2-e3 |

---

## §3 自由解说 free（4 条，全带 audio+状态闸门）

原则：只描述现象不判对错；边沿+8s 节流；每条挂前置状态闸门（规范 §2.6，不该出声的操作不出声）。

| id | trigger | 核实出处 | note（≤25字） | audio |
|---|---|---|---|---|
| c4s2-f1 | `R.dragFb===true && R.laserOn===true && R.beamMode==='single'` | dragFb core:150 true/core:136 false；闸门 laserOn+single | 拖着激光笔转，入射角实时在变哦。 | c4s2-f1 |
| c4s2-f2 | `R.laserOn===true && R.angleI<0.02 && R.beamMode==='single' && R.fold===0 && !R.pulse.reverse` | angleI 弧度 render:5/core:41；<0.02 阈值同 render:124 画弧判定；口径 explain:82（垂直入射两角 0°原路返回） | 垂直入射：两个角都是 0°，光沿原路返回。 | c4s2-f2 |
| c4s2-f3 | `R.showArrow===true && R.laserOn===true` | showArrow core:17/98；箭头 render:83；E/O/F 标签 render:172-176 | 箭头标出传播方向：从 E 经 O 到 F。 | c4s2-f3 |
| c4s2-f4 | `event:input:#rough-slider:R.rough>0 && R.laserOn===true` | #rough-slider html:70/core:76；rough core:70/76；口径 explain:118（各点法线方向不同） | 越粗糙，各点法线方向越乱，反射光散得越开。 | c4s2-f4 |

---

## §4 音频 clip 清单表（18 条）

规则（规范 §4）：edge-tts `zh-CN-XiaoxiaoNeural`（与 c4s3 全批一致，禁换音色）、语速 1.0x；文件名=clip id+`.mp3`，存 `content/physics_g8_v1_c4_s2/guide/audio/`（目录待建）；预估秒数=中文 TTS≈4字/秒+0.5s 尾静音向上取整 0.5s，**仅供参考——落地时延时值一律 afinfo 实测**（规范 §4.4）。
发音预处理（只进 mp3，屏幕文案原样）：∠r→角r、∠i→角i、0°→零度、45°→四十五度、～→逗号停顿、「——」→短停顿。

| clip id | 文本 | 预估秒数 |
|---|---|---|
| c4s2-intro | 欢迎来到光的反射实验室！桌上有激光笔、平面镜和白纸板。点开激光，拖一拖、折一折，反射定律的秘密等你亲手找出来！ | 14.5s |
| c4s2-s1 | 激光开啦！这束红光射向平面镜，叫入射光线。 | 6.0s |
| c4s2-s2 | 光打在镜面的 O 点——入射点；反射光也从 O 射出。 | 6.5s |
| c4s2-s3 | 拖动滑杆改入射角，看反射角马上跟着变！ | 5.0s |
| c4s2-s4 | 金色虚线是法线，垂直镜面，两个角都从它量起。 | 6.0s |
| c4s2-s5 | 看角弧：∠r 和 ∠i 相等，反射角=入射角！ | 6.0s |
| c4s2-s6 | 纸板一折，反射光不在折起的纸板上——三线共面！ | 6.5s |
| c4s2-s7 | 光路可逆！沿原反射光路射入，光就沿原入射路射出。 | 6.5s |
| c4s2-s8 | 平行光照镜面，反射光仍平行——这是镜面反射。 | 6.0s |
| c4s2-s9 | 表面变粗糙，反射光散向四面八方——漫反射。 | 6.0s |
| c4s2-concl | 记住啦：三线共面、分居法线两侧、反射角等于入射角；镜面反射和漫反射都遵守反射定律，光路还可逆！ | 12.0s |
| c4s2-e1 | 不对哟～先点激光笔的红钮开光，再改入射角呀。 | 6.0s |
| c4s2-e2 | 不对哟～光还没开呢，先开光源再演示光路可逆。 | 6.0s |
| c4s2-e3 | 不对哟～先打开光源，再换粗糙面看漫反射哦。 | 5.5s |
| c4s2-f1 | 拖着激光笔转，入射角实时在变哦。 | 4.5s |
| c4s2-f2 | 垂直入射：两个角都是 0°，光沿原路返回。 | 5.5s |
| c4s2-f3 | 箭头标出传播方向：从 E 经 O 到 F。 | 4.5s |
| c4s2-f4 | 越粗糙，各点法线方向越乱，反射光散得越开。 | 5.5s |

intro 文本（s1 闸门前置，≤60字）：`欢迎来到光的反射实验室！桌上有激光笔、平面镜和白纸板。点开激光，拖一拖、折一折，反射定律的秘密等你亲手找出来！`（55字）

---

## §5 完整 guide-data.js（落地文件 `content/physics_g8_v1_c4_s2/guide/guide-data.js`，文案逐字照抄禁改写）

```js
'use strict';
/* c4s2 光的反射 · 语音讲解层数据（B 版标配；设计书 docs/c4s2-guide-design.md §1~§4 逐条搬入，文案禁改写）
   模式 key 统一 'refract'（c4s2 为单实验页，引擎 init 后固定 curMode='refract'，无 R.mode 轮询）。
   trigger 存字符串，引擎 new Function 求值；R=window.RFX（render:4 定义，core 原地 mutate，已核实稳定）。
   G.* 为引导层私有字段：G.t / G.modeEnterT / G.angChangeCount / G.lastAngChangeT（监听 R.angleI，350ms 武装，规范§3.2）。
   特殊 trigger 约定（同 c4s3 引擎）：
     "after:c4s2-s1@6000"               = 依赖步触发后延时 6s（规范§2.4，禁 <6000）
     "event:input:#ang-slider:EXPR"     = 滑杆 input capture 即时判态（需引擎适配 A3/A4：tickSteps 跳过 evt 型，事件分发扩展到 steps）
   s1 闸门 15500 = intro 预估 14.5s + 1s 余量，落地必须 afinfo 实测替换（规范§2.3/§4.4）。 */
window.C4S2_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到光的反射实验室！桌上有激光笔、平面镜和白纸板。点开激光，拖一拖、折一折，反射定律的秘密等你亲手找出来！',
      audio:'c4s2-intro'
    },
    steps:[
      {id:'c4s2-s1',repeat:true,trigger:"R.laserOn===true && R.beamMode==='single' && R.fold===0 && R.rough===0 && !R.pulse.reverse && (G.t-G.modeEnterT)>15500",say:'激光开啦！这束红光射向平面镜，叫入射光线。',audio:'c4s2-s1'},
      {id:'c4s2-s2',repeat:true,trigger:'after:c4s2-s1@6000',say:'光打在镜面的 O 点——入射点；反射光也从 O 射出。',audio:'c4s2-s2'},
      {id:'c4s2-s3',repeat:true,trigger:"event:input:#ang-slider:R.laserOn===true && R.beamMode==='single' && R.fold===0 && !R.pulse.reverse",say:'拖动滑杆改入射角，看反射角马上跟着变！',audio:'c4s2-s3'},
      {id:'c4s2-s4',repeat:true,trigger:"R.laserOn===true && R.showNormal===true && R.beamMode==='single' && R.fold===0 && R.rough===0 && !R.pulse.reverse && G.angChangeCount>=1 && (G.t-G.lastAngChangeT)>800",say:'金色虚线是法线，垂直镜面，两个角都从它量起。',audio:'c4s2-s4'},
      {id:'c4s2-s5',repeat:true,trigger:'after:c4s2-s4@6000',say:'看角弧：∠r 和 ∠i 相等，反射角=入射角！',audio:'c4s2-s5'},
      {id:'c4s2-s6',repeat:true,trigger:"R.fold>0 && R.laserOn===true && R.beamMode==='single' && !R.pulse.reverse",say:'纸板一折，反射光不在折起的纸板上——三线共面！',audio:'c4s2-s6'},
      {id:'c4s2-s7',repeat:true,trigger:"R.pulse.reverse===true && R.laserOn===true && R.fold===0",say:'光路可逆！沿原反射光路射入，光就沿原入射路射出。',audio:'c4s2-s7'},
      {id:'c4s2-s8',repeat:true,trigger:"R.beamMode==='beam' && R.laserOn===true && R.rough===0 && R.fold===0 && !R.pulse.reverse",say:'平行光照镜面，反射光仍平行——这是镜面反射。',audio:'c4s2-s8'},
      {id:'c4s2-s9',repeat:true,trigger:"R.rough>0 && R.laserOn===true && R.fold===0 && !R.pulse.reverse",say:'表面变粗糙，反射光散向四面八方——漫反射。',audio:'c4s2-s9'},
      {id:'c4s2-concl',repeat:true,trigger:'after:c4s2-s9@6000',say:'记住啦：三线共面、分居法线两侧、反射角等于入射角；镜面反射和漫反射都遵守反射定律，光路还可逆！',audio:'c4s2-concl'}
    ],
    errors:[
      {id:'c4s2-e1',trigger:"event:input:#ang-slider:R.laserOn===false",fix:'不对哟～先点激光笔的红钮开光，再改入射角呀。',audio:'c4s2-e1'},
      {id:'c4s2-e2',trigger:"event:click:#btn-reverse:R.laserOn===false",fix:'不对哟～光还没开呢，先开光源再演示光路可逆。',audio:'c4s2-e2'},
      {id:'c4s2-e3',trigger:"event:change:#surface:R.laserOn===false",fix:'不对哟～先打开光源，再换粗糙面看漫反射哦。',audio:'c4s2-e3'}
    ],
    free:[
      {trigger:"R.dragFb===true && R.laserOn===true && R.beamMode==='single'",note:'拖着激光笔转，入射角实时在变哦。',audio:'c4s2-f1'},
      {trigger:"R.laserOn===true && R.angleI<0.02 && R.beamMode==='single' && R.fold===0 && !R.pulse.reverse",note:'垂直入射：两个角都是 0°，光沿原路返回。',audio:'c4s2-f2'},
      {trigger:"R.showArrow===true && R.laserOn===true",note:'箭头标出传播方向：从 E 经 O 到 F。',audio:'c4s2-f3'},
      {trigger:"event:input:#rough-slider:R.rough>0 && R.laserOn===true",note:'越粗糙，各点法线方向越乱，反射光散得越开。',audio:'c4s2-f4'}
    ],
    tasks:[]
  },
  /* §4 音频 clip 清单 18 条（1 intro + 10 steps + 3 errors + 4 free + 0 tasks，五类 audio 零缺失）；文件名=clip id+'.mp3' */
  audios:{
    'c4s2-intro':'guide/audio/c4s2-intro.mp3',
    'c4s2-s1':'guide/audio/c4s2-s1.mp3',
    'c4s2-s2':'guide/audio/c4s2-s2.mp3',
    'c4s2-s3':'guide/audio/c4s2-s3.mp3',
    'c4s2-s4':'guide/audio/c4s2-s4.mp3',
    'c4s2-s5':'guide/audio/c4s2-s5.mp3',
    'c4s2-s6':'guide/audio/c4s2-s6.mp3',
    'c4s2-s7':'guide/audio/c4s2-s7.mp3',
    'c4s2-s8':'guide/audio/c4s2-s8.mp3',
    'c4s2-s9':'guide/audio/c4s2-s9.mp3',
    'c4s2-concl':'guide/audio/c4s2-concl.mp3',
    'c4s2-e1':'guide/audio/c4s2-e1.mp3',
    'c4s2-e2':'guide/audio/c4s2-e2.mp3',
    'c4s2-e3':'guide/audio/c4s2-e3.mp3',
    'c4s2-f1':'guide/audio/c4s2-f1.mp3',
    'c4s2-f2':'guide/audio/c4s2-f2.mp3',
    'c4s2-f3':'guide/audio/c4s2-f3.mp3',
    'c4s2-f4':'guide/audio/c4s2-f4.mp3'
  }
};
```

---

## 附A 引擎适配点（c4s3 guide/engine.js → c4s2 复用时的必改项，落地开发单用）

| # | 适配点 | 依据 |
|---|---|---|
| A1 | `var R=window.MRR` → `window.RFX` | render:4 |
| A2 | `DATA=window.C4S3_SCRIPT` → `window.C4S2_GUIDE`；**无 `R.mode`**：删除模式轮询，init 后直接 `onModeEnter('refract')` 一次（播 intro、记 G.modeEnterT） | c4s2 单实验页，RFX 无 mode 字段（render:4-13 全量核实） |
| A3 | `tickSteps` 增加 `if(p.evt)continue;`——c4s3 现版对 event: 型 trigger 会把 expr 部分**每帧当电平求值**（c4s3 steps 无事件型所以未暴露），c4s2-s3 不改必误触发 | engine.js tickSteps `p.expr!=null` 分支 |
| A4 | `bindEventTriggers` 绑定表改为：`(#ang-slider,input)`、`(#btn-reverse,click)`、`(#surface,change)`、`(#rough-slider,input)`；分发范围从 errors/free **扩展到 steps**（共享 repLast/REP_COOLDOWN=3000） | §1 s3、§2 e1-e3、§3 f4 |
| A5 | `updateG` 采集 `G.angChangeCount/G.lastAngChangeT`：监听 `R.angleI`（唯一写入点 core:41，滑杆/±钮/canvas 拖笔全覆盖），变化+武装→计数、静默 350ms 重新武装 | 规范 §3.2 手势计数标准模式 |
| A6 | 删除 c4s3 私有 G 字段与 `countRec()`/#rec-table 逻辑（本页无记录表）；保留 clearRepeatState/delayFired 守卫原样 | 规范 §3.1/§3.3；任务红线禁 c4_s3 G.xxxCount |
| A7 | `#btn-reverse` 为 toggle 钮：capture 事件读到**点击前**状态，event:click 语义会反 → s7 用电平触发 `R.pulse.reverse===true`（本稿已如此设计）；e2 用 event:click 恰因需要「点击前没开光」语义 | engine bindEventTriggers 注释「读到点击前状态」 |
| A8 | s1 闸门 `15500` 与 s2/s5/concl 的 `@6000`：intro 及全部音频 afinfo 实测后校准（延时=实测+余量，禁预估） | 规范 §2.3/§4.4 |

## 附B 文案风格红线（摘要）

1. steps/free ≤25 字、intro ≤60 字；concl 为延时结论步，按 c4s3 判例可放宽至 ~45 字（音频 12s 级）。
2. 口语化「啦/呀/哦/哟/～」，一条字幕一个知识点，禁教材腔。
3. 纠错统一「不对哟～」开头，只说先做什么，不打击不给答案。
4. 物理口径零偏差（对齐 explain.html）：角以**法线**为基准（:72）；反射定律三条不可说反/漏条（:94-96）；三线共面=折纸板验证（:98）；光路可逆（:99）；镜面反射「反射光仍平行」（:114）；漫反射「射向四面八方」且**两种反射都遵守反射定律**、漫反射不是乱反射（:115/118）；垂直入射两角 0° 原路返回（:82）。

## 附C 计数对账

- steps：**10**（s1~s9 + concl，全 repeat:true，trigger 全部来自 §-1 已核实字段）
- errors：**3**（全 event: 前缀+状态闸门）
- free：**4**（全带 audio+状态闸门）
- intro：**1**；tasks：**0**（`tasks:[]`，按任务书）
- audios：**18** 条（1+10+3+4，五类 audio 字段零缺失，路径 `guide/audio/<clipid>.mp3`）
- 模式 key：统一 `refract`；全局对象：`window.C4S2_GUIDE`

（完）
