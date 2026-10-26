# 任务书 V0 验收报告：通用语音讲解层核心 `content/_lib/guide/`

日期：2026-10-26 · 母版：`content/physics_g8_v1_c4_s3/guide/`（r7 定稿，金标准，本轮零改动）

## 1. 产出文件（仅新建 3 个 + 本报告）

| 文件 | 来源 | 改动 |
|---|---|---|
| `content/_lib/guide/engine-core.js` | 拷贝 `guide/engine.js`（433 行全部逻辑一字不改） | 仅 2 处绑定 + 1 行顶部注释 |
| `content/_lib/guide/vB-core.js` | 拷贝 `guide/vB.js`（277 行逻辑一字不改） | 仅 2 处数据源引用 |
| `content/_lib/guide/guide-core.css` | 拷贝 `guide/guide.css`（261 行） | 原样零改动 |

## 2. 验收证据（逐条对应任务书 §3）

### ① node --check
```
node --check content/_lib/guide/engine-core.js  → 通过
node --check content/_lib/guide/vB-core.js      → 通过（SYNTAX OK）
```

### ② git status
```
$ git status --short
?? .DS_Store            ← 会话开始前既有的未跟踪文件，非本轮产物
?? content/_lib/guide/  ← 本轮新建（3 文件）

$ git status --short content/physics_g8_v1_c4_s3/ | wc -l
0                       ← c4_s3 目录零改动
```

### ③ diff 证据（逻辑零改动）

engine（母版先做 R 绑定同款替换后 vs engine-core，只剩注释 + DATA 两处）：
```
$ diff <(sed 's/^var R=window\.MRR;$/var R=(window.GUIDE_CFG&&window.GUIDE_CFG.state)||window.MRR;/' \
        content/physics_g8_v1_c4_s3/guide/engine.js) content/_lib/guide/engine-core.js
1a2
> /* 通用版：状态源=window.GUIDE_CFG.state（宿主实验的稳定状态对象，须原地 mutate 不重赋值）；数据源=window.GUIDE_DATA（各实验 guide-data）。未配置时回退 c4_s3 默认，向后兼容。 */
12c13
< var DATA=window.C4S3_SCRIPT;
---
> var DATA=window.GUIDE_DATA||window.C4S3_SCRIPT;
```
即 engine-core 相对母版全部差异 = 注释 1 行 + 绑定 2 处：
- `var R=window.MRR;` → `var R=(window.GUIDE_CFG&&window.GUIDE_CFG.state)||window.MRR;`
- `var DATA=window.C4S3_SCRIPT;` → `var DATA=window.GUIDE_DATA||window.C4S3_SCRIPT;`

vB（母版 vs vB-core，只有 C4S3_SCRIPT→GUIDE_DATA 的 2 处）：
```
$ diff content/physics_g8_v1_c4_s3/guide/vB.js content/_lib/guide/vB-core.js
12c12
<   if(!window.GuideEngine||!window.C4S3_SCRIPT)return;
---
>   if(!window.GuideEngine||!window.GUIDE_DATA)return;
14c14
<   var AUDIOS=window.C4S3_SCRIPT.audios||{};
---
>   var AUDIOS=(window.GUIDE_DATA&&window.GUIDE_DATA.audios)||{};
```
（母版中 `window.C4S3_SCRIPT` 全部命中即这 2 行，grep 核清无遗漏；第 14 行按任务书原文采用 `&&` 防御形式。）

css：
```
$ diff content/physics_g8_v1_c4_s3/guide/guide.css content/_lib/guide/guide-core.css
（空，exit 0）
```

### ④ grep 对账
```
engine-core.js:
  window.GUIDE_CFG.state 命中 2 = 代码 1 处（L12 绑定）+ 注释 1 处（规格指定的注释原文含该串）
  window.GUIDE_DATA     命中 2 = 代码 1 处（L13 绑定）+ 注释 1 处（同上）
  window.C4S3_SCRIPT    命中 1 = 仅 L13 回退默认（规格允许），无其他残留
vB-core.js:
  window.GUIDE_DATA     命中 2（L12 守卫 + L14 audios）≥2 ✓
  C4S3_SCRIPT           命中 0 ✓
guide-core.css: 与母版 diff 为空 ✓
```

### ⑤ 保留不变的关键点
- DOM 结构/类名全部保持：`.gvb-fab` / `.gvb-start` / `.guide-caption` / `.gvb-caption` / `.gvb-replay` / `.gvb-speaking` / `#guide-layer`。
- engine 全部逻辑原样：DSL 解析（`delay:` / `expr@` / `event:` / `after:`）、repeat 边沿+3s 冷却、`delayFired` 守卫、手势计数（objChange/eqMoveGesture）、fireCount/seenCount 计数链、onModeEnter/clearRepeatState、tasks 链、Caption 组件、`window.GuideEngine` 导出签名。
- 只读纪律不变：engine 绝不写宿主状态对象任何字段；G 进度字段引擎私有。
- **关键约束**：engine 在 load 时捕获一次 `GUIDE_CFG.state` 的对象引用，宿主状态对象必须稳定、原地 mutate（如 window.MRR/RR/DSP 这类），禁每帧 new 或重赋值。

## 3. 宿主实验接线三步（A 档 17 实验通用）

前提顺序：**宿主实验 core 脚本先加载并暴露状态对象，guide 层后加载**（engine-core 在脚本求值时即捕获 `GUIDE_CFG.state` 引用；vB-core 在 DOMContentLoaded/立即执行时读 `GUIDE_DATA`）。

1. **设状态源**：在 include guide 之前，设一行
   ```html
   <script>window.GUIDE_CFG={state:window.RR};/* RR=本实验稳定状态对象，原地 mutate */</script>
   ```
2. **设数据源**：编写本实验的 `guide-data.js`（steps/errors/free/intro/tasks + audios 映射，trigger 表达式对着自己实验的真实状态字段），并在 include 时设
   ```html
   <script src=".../guide-data.js"></script><!-- 内部执行 window.GUIDE_DATA={m1:{...},audios:{...}} -->
   ```
3. **include 共享核心**（顺序：宿主 core → GUIDE_CFG/GUIDE_DATA → engine-core → vB-core；css 任意位置）：
   ```html
   <link rel="stylesheet" href="../_lib/guide/guide-core.css">
   <script src="../_lib/guide/engine-core.js"></script>
   <script src="../_lib/guide/vB-core.js"></script>
   ```
   页面需有 `#guide-layer` 容器（无则回退 document.body）；字幕条底部定位自动适配 `.ctrlbar` 高度。

未配置 `GUIDE_CFG`/`GUIDE_DATA` 时回退 c4_s3 默认（`window.MRR`/`window.C4S3_SCRIPT`），向后兼容。

事件类 trigger 注意：engine 的 `bindEventTriggers` 目前仍硬编码 `#btn-rec`(click) / `#obj-slider`(input) 两个选择器（母版原样，本轮按规格未参数化）；其他实验若无这两个元素则事件类 trigger 不生效（无副作用），如需支持需后续轮次把选择器提进 GUIDE_CFG。

## 4. 红线自查
- c4_s3 目录零改动（git status 干净）✓
- 未动其余任何实验页 ✓
- 未 git commit / push ✓
- 未做全库探索（只读了 3 个母版文件 + 目录 ls）✓
- 轮次消耗：约 7 轮 ≤ 12 ✓

=== DONE === docs/guide-core-lib-report.md
