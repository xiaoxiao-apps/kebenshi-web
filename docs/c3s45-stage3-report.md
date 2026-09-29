# c3_s4《升华凝华观察站》阶段三报告

## 一、文件清单与行数

| 文件 | 行数 | 说明 |
|------|------|------|
| `exp-subl-core.js` | 334 | 模式①碘演示引擎，未改动逻辑 |
| `exp-subl-lab.js` | 422 | 模式②粒子实验室，未改动 |
| `exp-subl-audio.js` | 140 | 新增搅拌循环声 + 结霜叮铃 |
| `exp-subl-frost.js` | 491 | 新建模式③易拉罐制霜 |
| `exp-subl.js` | 194 | 接入 frost enter/exit/update/reset |
| `exp-subl.html` | 185 | 挂载 `exp-subl-frost.js?v=3`，全版本号升 3 |
| `index.html` | 56 | 无改动；`assets/thumb-subl.png` 已生成 |
| `assets/thumb-subl.png` | 1387×875 | 参照 c3_s3 缩略图规格截图/缩放 |

## 二、模式③实现要点

- **3D 场景**：金属易拉罐（圆柱+底+卷边）+ 罐内冰块 InstancedMesh + 盐粒 + 筷子 + 复用器材库 `buildThermometer` 条目改编的温度计（刻度 -20~35℃，红液随温缩放）。
- **控件**：盐量滑杆 0~100%、搅拌开始/停止按钮、温度计实时读数、状态 pill、暂停/重置复用底部通用按钮。
- **物理**：默认盐量 80%；搅拌时冰盐水温度从室温向 `20-30×salt%` ℃ 趋近（max 时约 -10℃），壁温滞后于混合液；壁温 <0℃ 后外壁/底部霜晶渐显。
- **T-t 曲线**：纵轴 -15~25℃，0℃ 蓝色虚线参考线；从首次搅拌起每 0.5 sim-min 记录一点，无上限；小图固定 span=6 min，live 窗口自动跟随，可拖回零点，双击回当下，滚轮不缩放。
- **数据记录表**：与曲线同源，实时追加最近 40 行。
- **结论卡**：霜量 >0.55 或温度 <-2℃ 时自动揭示“水蒸气遇冷直接凝华成小冰晶=白霜，凝华放热”。

## 三、自查结果

1. `node --check`：5 个 JS 文件全过。
2. `wc -l`：见上表；新增 `exp-subl-frost.js` 491 行。
3. `curl -s -o /dev/null -w "%{http_code}"`：`exp-subl.html` 200、`exp-subl-frost.js?v=3` 200、`assets/thumb-subl.png` 200。
4. 浏览器运行：console errors = 0；pill③ 不再弹“即将上线”；点搅拌后温度计跌破 0℃、霜晶可见、T-t 曲线描点、时间轴可拖回/双击回当下、数据表追加；模式①浇热水蒸气充满度到 1、模式②温度升高粒子全部升华。
5. `grep -n "https://" *.html *.js`：无 CDN 外链（w3.org 命名空间外）。
6. 未 `git commit`，未改动仓库根目录 `app.js`，未改动 c3_s4 与 docs 之外文件。

## 四、2026-09-29 修复轮

- Bug1 猜测卡串台：`exp-subl.js` switchMode 增加 guess-card 显隐控制（切出①隐藏，切回①且未揭晓时恢复）。
- Bug2 chart 首进 1×1：`exp-subl-frost.js` enter 里双 requestAnimationFrame 后 resizeChart，resizeChart 增加 rect≤0 守卫。
- 缓存版本：`exp-subl.html` 全部 script 由 `?v=3` 统一升到 `?v=4`。
- 复验通过：pill③ guess-card 隐藏且 chart=254×140；搅拌后 T=-9.68℃、frost=1.0、曲线非单色、数据表追加；pill① guess-card 恢复、碘蒸气充满；pill② guess-card 隐藏、粒子升华；console errors=0。
