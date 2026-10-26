# c4s4 光的折射实验台 · 语音讲解层（B 版标配）设计书

> 目标页面：`content/physics_g8_v1_c4_s4/exp-refract.html`（单场景实验，无模式切换，mode key 统一 `refract`）
> 定位：B 语音版讲解层从 c4s3 铺开到其他实验的**第一个试点**。本文=后续 TTS 配音单与 Qoder 接线单的**唯一数据源**。
> 本文档为纯设计产出，零代码改动。所有 trigger 中的 R 字段均已逐行对照 `exp-refract-core.js`（134 行，唯一写 window.RR 的地方，第 12 行初始化 / 第 29 行 reset）核实，禁臆造字段；可视元素对照 `exp-refract-render.js`；物理口径以 `explain.html` 为权威源，本文与其零冲突。
> 规范依据：`可交互教材/实验语音讲解层改造规范-B版标配.md`（2026-10-26 定稿）§2 播报行为规则全遵守：全部 steps `repeat:true`（§2.2）、free/errors 挂状态闸门（§2.6）、延时结论 `after:…@6000`（§2.4）、五类语音全覆盖含 audio（§2.7）、纠错「不对哟～」只说该先做什么（§2.8）。
> 格式模板：`docs/c4s3-guide-variants-design.md` §1/§2/§4/§7 写法与文案风格。

---

## §0 状态字段速查表（window.RR，trigger 只准用这些）

核实自 `exp-refract-core.js` 第 12 行（初始化）、第 29 行（reset 同值）：

```js
window.RR={medium:'water',iDeg:40,laserOn:false,showNormal:false,showAngles:false,showReflect:false,reverse:false}
```

| 字段 | 取值 | 含义 | 写入处（核实自 exp-refract-core.js） |
|---|---|---|---|
| `R.medium` | `'water'` \| `'glass'` | 介质：水槽 / 玻璃砖 | 第 18~22 行 `setMedium()`；第 38~39 行 btn-water/btn-glass click |
| `R.iDeg` | 数字 0~80（step 0.1，初始 40） | 入射角（度） | 第 33~37 行 `#slider-i` input；第 110~115 行 canvas 拖笔身（第 113 行 clamp 0~80） |
| `R.laserOn` | bool（初始 false） | 激光笔开关 | 第 44~47 行 `toggleLaser()`；触发=canvas 点笔身红钮（第 84~87、122~124 行） |
| `R.showNormal` | bool | 法线标注（chk-normal） | 第 40 行 change 监听 |
| `R.showAngles` | bool | 角度标签（chk-angles） | 第 41 行 change 监听 |
| `R.showReflect` | bool | 微弱反射（chk-reflect） | 第 42 行 change 监听 |
| `R.reverse` | bool | 光路可逆（chk-reverse） | 第 43 行 change 监听 |

**没有 mode 字段**（单场景）。折射角 r 不是状态字段，是算出来的（core 第 14~16 行 `n2()`/`refrDeg()`：水 n=1.333、玻璃 n=1.500；render 第 178 行同值），trigger 禁引用。

控件 id（核实自 exp-refract.html）：`slider-i`（第 49 行，min=0 max=80 step=0.1 value=40）、`btn-water`/`btn-glass`（第 57~58 行）、`chk-normal`/`chk-angles`/`chk-reflect`/`chk-reverse`（第 64~67 行）、`btn-reset`（第 73 行）。

可视元素（核实自 exp-refract-render.js，供文案对景）：光路折线+动画光点（第 199~208 行，reverse 时第 199 行反序→箭头第 251~253 行反向）；法线灰虚线+O/N 字母（第 211~221 行）；角度弧 i=蓝 `#2563eb`、r=浅蓝 `#0ea5e9`（第 222~239 行）；微弱反射线**仅 laserOn 时画**（第 240~249 行）；玻璃态出射点小法线+「出射光与入射光平行」灰字（第 254~264 行）。

trigger 语法沿用 c4s3 `guide/engine.js` `parseTrigger`（第 29~40 行）：普通表达式（repeat 上升沿+3s 冷却）、`expr@N`（持续 N ms 才触发）、`after:ID@N`（依赖步触发后延时）、`event:事件:选择器[:表达式]`（capture 即时判定，读到点击前状态）。**不使用任何 G.\* 私有字段**（G.xxxGestureCount 等是 c4s3 专属，通用引擎不为其他实验维护）。

---

## §1 步骤解说稿 steps（8 步 + 1 结论，全部 `repeat:true` 可重复播报）

触发时机=状态**变为真**（上升沿）播一次，3s 冷却防刷屏（引擎 REP_COOLDOWN）；同帧多条按数组序只发第一条。探究链：开激光(水)→换玻璃→拖入射角→垂直入射特例→法线→角度标签→微弱反射→光路可逆→结论。

| id | trigger（逐字） | say（≤25字） | audio | 知识点 + 核实来源 |
|---|---|---|---|---|
| s1 | `R.laserOn===true && R.medium==='water'` | 灯亮啦！激光斜射进水里，光路在水面拐了个弯。 | c4s4-s1 | 光从空气斜射入水发生偏折（explain.html 第 70、93 行）。字段核实自 exp-refract-core.js 第 12、44~46 行（laserOn）、第 18~22 行（medium）；与 s2 按 medium 互斥，防同帧打架 |
| s2 | `R.laserOn===true && R.medium==='glass'` | 换成玻璃砖啦！光弯得更狠，玻璃偏折本领比水强。 | c4s4-s2 | 介质折射率越大偏折越明显，玻璃>水（explain.html 第 89 行原句「玻璃的偏折本领比水更强」；n 值核实自 exp-refract-core.js 第 14 行）。字段同上 |
| s3 | `event:input:#slider-i:R.laserOn===true` | 入射角一变，折射角跟着变，但总是比入射角小。 | c4s4-s3 | 折射角随入射角增大而增大（explain.html 第 94 行）+ 折射角<入射角（第 93 行）。事件型「移动才说」；`R.laserOn===true` 是状态闸门（规范 §2.6：没开灯拖滑杆不出声，走 §2 e2 纠错）。控件核实自 exp-refract.html 第 49 行、exp-refract-core.js 第 33~37 行 |
| s4 | `R.iDeg===0 && R.laserOn===true@1500` | 垂直入射不拐弯，入射角折射角都是零度。 | c4s4-s4 | 垂直入射方向不变、两角均 0°（explain.html 第 80、94 行）。`@1500` 持续判定：拖到 0° 停住才说，避免与 s3 的 input 事件同帧打架。字段核实自 exp-refract-core.js 第 12 行（iDeg）、第 113 行（clamp 下界 0 可达） |
| s5 | `R.showNormal===true` | 虚线是法线，过入射点垂直界面，角都以它为准。 | c4s4-s5 | 法线定义、i/r 都以法线为基准（explain.html 第 73 行）。字段核实自 exp-refract-core.js 第 40 行；虚线+O/N 字母画法核实自 exp-refract-render.js 第 211~221 行 |
| s6 | `R.showAngles===true` | 蓝弧是入射角i，浅蓝是折射角r，比比谁大？ | c4s4-s6 | 认角+引导比较 r<i（explain.html 第 73、93 行）。字段核实自 exp-refract-core.js 第 41 行；颜色对景核实自 exp-refract-render.js 第 225 行（i 弧 #2563eb 蓝）、第 228 行（r 弧 #0ea5e9 浅蓝） |
| s7 | `R.showReflect===true && R.laserOn===true` | 还有一条淡淡的光——界面处折射和反射同时发生。 | c4s4-s7 | 折射与反射同时发生（explain.html 第 70 行）。laserOn 闸门与渲染一致：反射线仅在 `showReflect && laserOn` 时画（exp-refract-render.js 第 240 行）；字段核实自 exp-refract-core.js 第 42 行 |
| s8 | `R.reverse===true && R.laserOn===true` | 光路可逆！光逆着折射光线射入，会逆着入射光线射出。 | c4s4-s8 | 折射现象中光路可逆（explain.html 第 95 行原句）。字段核实自 exp-refract-core.js 第 43 行；反序箭头绘制依赖 laserOn，核实自 exp-refract-render.js 第 199、201、251~253 行 |
| concl | `after:s8@6000` | 因此我们得出结论：光从空气斜射入水或玻璃时，向法线偏折，折射角小于入射角；入射角增大折射角也增大，折射中光路可逆。 | c4s4-concl | 收拢折射定律考点（explain.html 第 93~95 行折射规律②③④）。`@6000` 按规范 §2.4（即时打断制下延时必须 ≥6s，防把 s8 的音频拦腰砍断）；挂在最后一步 s8 之后 |

> 互斥自检（规范 §2.5 禁条件重叠）：s1/s2 按 `medium` 互斥；s3（事件）与 s4（电平+持续1.5s）时间上错开；s7/s8 各自带 laserOn 闸门且与 §3 free 的 f2/f3（laserOn===false 侧）互斥；s6 与 §2 e1/e3（都在 chk-angles 上）按 laserOn 真假分流，不会同帧双响。

---

## §2 纠错清单 errors（3 条，「不对哟～」风格，只说该先做什么）

事件型 trigger 走 capture 即时判定（读到点击前状态），节流 5s（引擎 errLast）。复选框监听 click：core 的 change 在其后触发（exp-refract-core.js 第 40~43 行），三条表达式只读 `laserOn/showNormal/showAngles`，capture 时序无影响；`R.showAngles===false` 前缀保证只在「勾上」时说、取消勾选不唠叨。

| id | trigger（逐字） | fix | audio | 场景 + 核实来源 |
|---|---|---|---|---|
| e1 | `event:click:#chk-angles:R.showAngles===false && R.laserOn===false` | 不对哟～先点亮激光笔，有了光路才好研究角呀。 | c4s4-e1 | 没开激光就看角度。laserOn 核实自 exp-refract-core.js 第 12、44~46 行；控件核实自 exp-refract.html 第 65 行 |
| e2 | `event:input:#slider-i:R.laserOn===false` | 不对哟～先点亮激光笔，光都没射出去，看不到折射哟。 | c4s4-e2 | 没开激光就拖入射角（兼作 s3 的闸门兜底，规范 §2.6）。控件核实自 exp-refract.html 第 49 行、exp-refract-core.js 第 33~37 行 |
| e3 | `event:click:#chk-angles:R.showAngles===false && R.laserOn===true && R.showNormal===false` | 不对哟～先勾「法线标注」，两个角都以法线为基准呢。 | c4s4-e3 | 法线没开就谈入射角（explain.html 第 73 行：两角都以法线为基准）。showNormal 核实自 exp-refract-core.js 第 40 行 |

---

## §3 自由解说 free（4 条，中性观察不判对错，全部带 audio，规范 §2.7）

电平型=边沿+8s 节流（引擎 tickFree/freeLast）；事件型=click/input capture+8s 节流。每条都挂前置状态闸门，不该出声的操作不出声。

| # | trigger（逐字） | note | audio | 说明 + 核实来源 |
|---|---|---|---|---|
| f1 | `event:click:#btn-water:R.laserOn===true && R.medium==='glass'` | 换回水槽啦，光在水面弯得温和了一点。 | c4s4-f1 | 切换介质即时描述。capture 读到**点击前**状态，`medium==='glass'` 保证只在真从玻璃切回水时说（已在水里再点不唠叨）；水的偏折弱于玻璃（explain.html 第 89 行）。控件核实自 exp-refract.html 第 57 行、exp-refract-core.js 第 38 行 |
| f2 | `R.medium==='glass' && R.laserOn===false` | 玻璃砖就位，点亮激光笔就能看到光路。 | c4s4-f2 | 换了介质没开灯的引导性中性描述；与 s2（laserOn 真侧）互斥。字段核实自 exp-refract-core.js 第 12、18~22、44~46 行 |
| f3 | `R.showReflect===true && R.laserOn===false` | 微弱反射线要亮着灯才现身，开下激光笔吧。 | c4s4-f3 | 勾了微弱反射但没开灯→画面上确实什么都没有（exp-refract-render.js 第 240 行 `showReflect && laserOn` 才绘制）；与 s7（laserOn 真侧）互斥。字段核实自 exp-refract-core.js 第 42 行 |
| f4 | `event:click:#btn-reset` | 回到起点：水槽、入射角四十度、激光关闭。 | c4s4-f4 | 重置即时描述。逐项对照 reset()：medium='water'、iDeg=40、laserOn=false（exp-refract-core.js 第 28~31 行）；控件核实自 exp-refract.html 第 73 行 |

---

## §4 音频 clip 清单（批量 TTS 用，共 17 条 = 1 intro + 9 steps含concl + 3 errors + 4 free）

预估秒数=字数÷4字/秒+0.5s，向上取整到 0.5s。**下游凡要"等这条讲完"的延时值，一律以 afinfo 实测为准，禁用本表预估**（规范 §4.4）。

| clip id | 文本 | 预估秒数 |
|---|---|---|
| c4s4-intro | 欢迎来到光的折射实验台！空碗里的硬币看不见，倒水后又出现了——光在水面拐了弯。点亮激光笔，一起揭开折射的秘密吧。 | 14.5s |
| c4s4-s1 | 灯亮啦！激光斜射进水里，光路在水面拐了个弯。 | 6.0s |
| c4s4-s2 | 换成玻璃砖啦！光弯得更狠，玻璃偏折本领比水强。 | 6.5s |
| c4s4-s3 | 入射角一变，折射角跟着变，但总是比入射角小。 | 6.0s |
| c4s4-s4 | 垂直入射不拐弯，入射角折射角都是零度。 | 5.5s |
| c4s4-s5 | 虚线是法线，过入射点垂直界面，角都以它为准。 | 6.0s |
| c4s4-s6 | 蓝弧是入射角i，浅蓝是折射角r，比比谁大？ | 6.0s |
| c4s4-s7 | 还有一条淡淡的光——界面处折射和反射同时发生。 | 6.5s |
| c4s4-s8 | 光路可逆！光逆着折射光线射入，会逆着入射光线射出。 | 7.0s |
| c4s4-concl | 因此我们得出结论：光从空气斜射入水或玻璃时，向法线偏折，折射角小于入射角；入射角增大折射角也增大，折射中光路可逆。 | 15.0s |
| c4s4-e1 | 不对哟～先点亮激光笔，有了光路才好研究角呀。 | 6.0s |
| c4s4-e2 | 不对哟～先点亮激光笔，光都没射出去，看不到折射哟。 | 7.0s |
| c4s4-e3 | 不对哟～先勾「法线标注」，两个角都以法线为基准呢。 | 7.0s |
| c4s4-f1 | 换回水槽啦，光在水面弯得温和了一点。 | 5.0s |
| c4s4-f2 | 玻璃砖就位，点亮激光笔就能看到光路。 | 5.0s |
| c4s4-f3 | 微弱反射线要亮着灯才现身，开下激光笔吧。 | 5.5s |
| c4s4-f4 | 回到起点：水槽、入射角四十度、激光关闭。 | 5.5s |

TTS 生产注意（照规范 §4 + c4s3 判例）：
1. 全批统一 `zh-CN-XiaoxiaoNeural`（晓晓女声，与 c4s3 既有 50 条一致，禁换音色），语速 1.0x，edge-tts 在 `~/Library/Python/3.9/bin/edge-tts`；
2. 发音预处理只做进 mp3、屏幕文案保持原样：「i」读英文字母 i、「r」读英文字母 r、「0°/四十度」按中文读、「～」不发音（作逗号停顿）、「——」作停顿；本批文本已避免 S′/数字符号，s4/f4 的「零度/四十度」直接是中文；
3. 文件名=clip id（`c4s4-{intro|sN|concl|eN|fN}.mp3`），clip id 与 §5 audios 映射、本表**三处同名**；每条落盘后核 ≥2000 字节；
4. concl 时长实测后若有「等讲完」需求（本轮无 delay 型步骤，暂无），一律 afinfo 实测+1s 余量。

---

## §5 完整 guide-data.js 内容（Qoder 直接落盘用，文案逐字=§1~§4，trigger 逐字=§0 核实字段）

落盘建议路径：`content/physics_g8_v1_c4_s4/guide/script.js`（目录结构照 c4s3 `guide/`：engine.js/vB.js/guide.css/audio/ 由接线单另行复制适配，不在本文范围）。

```js
'use strict';
/* c4s4 光的折射 · B 语音版讲解层数据（设计书 docs/c4s4-guide-design.md §0~§4 逐条搬入；文案逐字照抄，禁改写）
   单场景实验：无 R.mode，mode key 恒为 'refract'（引擎接线时初始化即视为进入该模式）。
   R=window.RR，字段核实自 exp-refract-core.js 第 12/29 行：medium('water'|'glass')、iDeg(0~80)、
   laserOn、showNormal、showAngles、showReflect、reverse。禁臆造字段、禁用 G.* 私有进度字段。
   特殊 trigger 约定（同 c4s3 engine.js parseTrigger，第 29~40 行）：
     "expr@1500"                  = 条件须持续 1.5s 才触发（§1 s4，避开与 s3 input 事件同帧打架）
     "event:input:#slider-i:EXPR" = 滑杆 input 时即时判态（§1 s3 / §2 e2，capture，EXPR=状态闸门）
     "event:click:#chk-angles:EXPR" / "#btn-water" / "#btn-reset" = 点击时即时判态（§2 e1/e3、§3 f1/f4；
                                    capture 读到点击前状态，f1 借此用 medium==='glass' 判"真在切换"）
     "after:s8@6000"              = s8 触发后延时 6s（§1 concl；规范 §2.4 延时必须 ≥6s）
   全部 steps repeat:true（规范 §2.2 可重复播报+引擎 3s 冷却），禁一次性 saidFlag。 */
window.C4S4_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到光的折射实验台！空碗里的硬币看不见，倒水后又出现了——光在水面拐了弯。点亮激光笔，一起揭开折射的秘密吧。',
      audio:'c4s4-intro'
    },
    steps:[
      {id:'s1',repeat:true,trigger:"R.laserOn===true && R.medium==='water'",say:'灯亮啦！激光斜射进水里，光路在水面拐了个弯。',audio:'c4s4-s1'},
      {id:'s2',repeat:true,trigger:"R.laserOn===true && R.medium==='glass'",say:'换成玻璃砖啦！光弯得更狠，玻璃偏折本领比水强。',audio:'c4s4-s2'},
      {id:'s3',repeat:true,trigger:"event:input:#slider-i:R.laserOn===true",say:'入射角一变，折射角跟着变，但总是比入射角小。',audio:'c4s4-s3'},
      {id:'s4',repeat:true,trigger:"R.iDeg===0 && R.laserOn===true@1500",say:'垂直入射不拐弯，入射角折射角都是零度。',audio:'c4s4-s4'},
      {id:'s5',repeat:true,trigger:"R.showNormal===true",say:'虚线是法线，过入射点垂直界面，角都以它为准。',audio:'c4s4-s5'},
      {id:'s6',repeat:true,trigger:"R.showAngles===true",say:'蓝弧是入射角i，浅蓝是折射角r，比比谁大？',audio:'c4s4-s6'},
      {id:'s7',repeat:true,trigger:"R.showReflect===true && R.laserOn===true",say:'还有一条淡淡的光——界面处折射和反射同时发生。',audio:'c4s4-s7'},
      {id:'s8',repeat:true,trigger:"R.reverse===true && R.laserOn===true",say:'光路可逆！光逆着折射光线射入，会逆着入射光线射出。',audio:'c4s4-s8'},
      {id:'concl',repeat:true,trigger:"after:s8@6000",say:'因此我们得出结论：光从空气斜射入水或玻璃时，向法线偏折，折射角小于入射角；入射角增大折射角也增大，折射中光路可逆。',audio:'c4s4-concl'}
    ],
    errors:[
      {id:'e1',trigger:"event:click:#chk-angles:R.showAngles===false && R.laserOn===false",fix:'不对哟～先点亮激光笔，有了光路才好研究角呀。',audio:'c4s4-e1'},
      {id:'e2',trigger:"event:input:#slider-i:R.laserOn===false",fix:'不对哟～先点亮激光笔，光都没射出去，看不到折射哟。',audio:'c4s4-e2'},
      {id:'e3',trigger:"event:click:#chk-angles:R.showAngles===false && R.laserOn===true && R.showNormal===false",fix:'不对哟～先勾「法线标注」，两个角都以法线为基准呢。',audio:'c4s4-e3'}
    ],
    free:[
      {trigger:"event:click:#btn-water:R.laserOn===true && R.medium==='glass'",note:'换回水槽啦，光在水面弯得温和了一点。',audio:'c4s4-f1'},
      {trigger:"R.medium==='glass' && R.laserOn===false",note:'玻璃砖就位，点亮激光笔就能看到光路。',audio:'c4s4-f2'},
      {trigger:"R.showReflect===true && R.laserOn===false",note:'微弱反射线要亮着灯才现身，开下激光笔吧。',audio:'c4s4-f3'},
      {trigger:"event:click:#btn-reset",note:'回到起点：水槽、入射角四十度、激光关闭。',audio:'c4s4-f4'}
    ],
    tasks:[]   /* 本轮不做 POE 任务链（设计书任务单约定），留空数组 */
  },
  audios:{
    'c4s4-intro':'guide/audio/c4s4-intro.mp3',
    'c4s4-s1':'guide/audio/c4s4-s1.mp3',
    'c4s4-s2':'guide/audio/c4s4-s2.mp3',
    'c4s4-s3':'guide/audio/c4s4-s3.mp3',
    'c4s4-s4':'guide/audio/c4s4-s4.mp3',
    'c4s4-s5':'guide/audio/c4s4-s5.mp3',
    'c4s4-s6':'guide/audio/c4s4-s6.mp3',
    'c4s4-s7':'guide/audio/c4s4-s7.mp3',
    'c4s4-s8':'guide/audio/c4s4-s8.mp3',
    'c4s4-concl':'guide/audio/c4s4-concl.mp3',
    'c4s4-e1':'guide/audio/c4s4-e1.mp3',
    'c4s4-e2':'guide/audio/c4s4-e2.mp3',
    'c4s4-e3':'guide/audio/c4s4-e3.mp3',
    'c4s4-f1':'guide/audio/c4s4-f1.mp3',
    'c4s4-f2':'guide/audio/c4s4-f2.mp3',
    'c4s4-f3':'guide/audio/c4s4-f3.mp3',
    'c4s4-f4':'guide/audio/c4s4-f4.mp3'
  }
};
```

### §5.1 接线注意（给后续 Qoder 接线单的备忘，非本设计书数据部分）

1. **引擎取数改造**：c4s3 engine.js 第 11 行 `var R=window.MRR`、第 12 行 `var DATA=window.C4S3_SCRIPT`、第 359~360 行轮询 `R.mode` 切模式——c4s4 无 mode，需改为 `R=window.RR`、`DATA=window.C4S4_GUIDE`，初始化即固定 `curMode='refract'` 并触发一次 onModeEnter（播 intro）。
2. **事件型 steps**：c4s3 `bindEventTriggers()`（engine.js 第 244~269 行）只扫 errors/free，不扫 steps；本设计 s3 是 `event:input` 型 **step**，接线时需把 steps 也纳入事件回调扫描（节流沿用 REP_COOLDOWN 3s），并绑定本实验选择器：`#slider-i`(input)、`#chk-angles`(click)、`#btn-water`(click)、`#btn-reset`(click)。
3. **canvas 拖笔身调角**不触发 `#slider-i` 的 input 事件（core 第 114 行只写 `sliderI.value`，程序赋值不派发事件）——s3 只覆盖滑杆拖动；若要覆盖笔身拖拽，需 Qoder 在 core pointermove 处补 `dispatchEvent`（属代码改动，另行派单，本设计书不改）。
4. **delayFired 守卫**（规范 §3.1）：本设计无 `delay:N` 型步骤，但引擎复制适配时守卫代码必须保留（concl 的 `after:` 型 repeat 依赖 fireCount/seenCount 机制，engine.js 第 173~181 行）。
5. **缓存**：接线落盘时 exp-refract.html 引入 guide 四件套并 bump `?v=YYYYMMDDgN`；交付提醒蔡总强刷（规范 §3.5）。
6. 音频资产先行：本设计书+17 条 TTS mp3 checkpoint commit 后再派接线单（规范 §5.2）。

---

## §6 文案风格红线自检（照 c4s3 §6 + B 版规范 §2）

1. 长度：steps/errors/free 全部 ≤25 字（node 脚本逐条实测，concl 结论句除外，照 c4s3 m1-concl 判例）；intro 56 字 ≤60 字。✅
2. 口语化：「啦/呀/哟/～」+短句+第二人称，零教材腔（无「综上所述」「如图所示」）。✅
3. 纠错统一「不对哟～」开头，只说该先做什么，不打击、不代操作。✅
4. 物理表述零臆造，逐条对齐 explain.html：斜射偏折（第 70 行）、r<i/向法线偏折/空气侧角大（第 93 行）、随入射角增大而增大+垂直入射两角 0°（第 80、94 行）、玻璃偏折本领比水强（第 89 行）、光路可逆原句（第 95 行）、折射反射同时发生（第 70 行）、法线/两角以法线为基准（第 73 行）。✅
5. 一条解说一个知识点：s1 只讲偏折、s2 只讲介质对比、s6 只讲认角比较、concl 才收拢定律。✅
6. 触发纪律：全 steps `repeat:true`+引擎 3s 冷却；errors 节流 5s、free 节流 8s；互斥关系见 §1 尾注，无同帧条件重叠。✅
7. 五类语音全覆盖：intro/steps(含concl)/errors/free 共 17 条全带 audio，tasks 本轮为空数组（无条目即无缺失）。✅

（完）
