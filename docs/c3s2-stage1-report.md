# c3s2《熔化凝固探究馆》阶段一进度报告

> 任务：节目录页 + 3D 核心场景 + 模式①熔化探究
> 项目根目录：~/projects/keben_web
> 创建时间：2026-09-23

---

## 一、实际完成

### 1.1 目录与基础设施
- [x] 新建 `content/physics_g8_v1_c3_s2/` 目录与 `assets/` 子目录
- [x] 复制 `three.min.js`（来源 c3s1，未修改内容）

### 1.2 节卡片页
- [x] `content/physics_g8_v1_c3_s2/index.html`
- [x] `assets/thumb-melt.png` 占位缩略图（PIL 生成）

### 1.3 实验页三件套
- [x] `exp-melt.html`（HTML + 内联 CSS）
- [x] `exp-melt-core.js`（3D 场景 + 物理模型）
- [x] `exp-melt.js`（UI + 图表 + 交互）
- [x] `exp-melt-audio.js`（WebAudio 音效）

### 1.4 功能实现
- [x] 3D 核心场景（铁架台/烧杯/试管/温度计/酒精灯/热流箭头）
- [x] 模式①熔化探究物理模型（海波 48℃ 平台、冰 0℃ 平台、石蜡无平台）
- [x] 数据表 + T-t 曲线实时描点
- [x] 音效：点灯噗、加热咕嘟、描点轻滴、静音按钮
- [x] 模式②③④按钮占位（点击提示阶段二/三上线）

---

## 二、未完成

- 无（阶段一范围内）。
- 后续阶段二/三：凝固探究、对比馆、熔点长廊。

---

## 三、已知问题

- 无。

---

## 四、验收自测

| 验收点 | 状态 | 备注 |
|---|---|---|
| 海波 48℃ 平台 | ✅ 通过 | 实测样品温度在 **47.6℃** 保持约 2 min（时间 9~11 min），平台清晰可见；截图 `docs/c3s2-stage1-screenshot-hypo-plateau.png` |
| 冰 0℃ 平台 | ✅ 通过 | 环境温度设为 -5℃，实测样品温度在 **-0.4℃** 保持约 3~4 min（时间 1~4 min），视为 0℃ 平台；截图 `docs/c3s2-stage1-screenshot-ice-plateau.png` |
| 石蜡无平台 | ✅ 通过 | 全程温度持续上升：25.0 → 31.2 → 38.9 → 46.2 → 53.1 → 59.5 → 65.5 → 71.1 → 76.2 → 81.1 → 85.6 → 89.9 → 93.9；截图 `docs/c3s2-stage1-screenshot-paraffin.png` |
| 数据表与曲线同步 | ✅ 通过 | 每 1 min 自动记录一行，表格与 canvas 曲线同时更新 |
| 固→液可见 | ✅ 通过 | 海波熔化过程中试管内同时显示固态（下部）和液态（上部），frac=1 时完全为液态；石蜡通过透明度渐变表现变软变稀 |
| node --check 全绿 | ✅ 通过 | `exp-melt-core.js`、`exp-melt.js`、`exp-melt-audio.js` 均通过 |
| 浏览器实测 | ✅ 已通过本地 http.server + 浏览器验证 | 地址 `http://127.0.0.1:8765/content/physics_g8_v1_c3_s2/exp-melt.html`；截图存 `docs/` |

---

## 五、补充说明

1. **OrbitControls**：提供的 `three.min.js` 未内置 `OrbitControls`，因此采用与 c3s1 一致的手动轨道旋转 + 滚轮缩放 + 双指触屏缩放实现，功能等效。
2. **文件纪律**：未修改 `app.js`、`data/`、`c3s1/` 及其他 `content/` 目录；仅新建/写入白名单内文件。
3. **分段写入**：HTML 与每个 JS 文件均通过多次追加完成，单次追加不超过约 150 行；最终 `node --check` 全绿。
4. **缩略图**：`assets/thumb-melt.png` 为 PIL 生成的深色占位图，收尾阶段替换为真实截图。

---

*报告完成于 2026-09-23。*
