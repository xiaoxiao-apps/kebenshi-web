# c1s4「速度的测量」第一批开发报告

日期：2026-09-16
批次：第 1 批 / 共 4 批
范围：目录骨架 + 首页/实验区导航 + 速度计算器 + 单位换算器

## 完成清单

- [x] 1. 建目录 `content/physics_g8_v1_c1_s4/`
- [x] 2. 复制基线文件：`common.css`、`exp-common.js`、`fullscreen.js`、`exp-back.js`（整份复制，未改动）
- [x] 3. `app.js` 的 `AVAILABLE` 路由表追加登记 `physics_g8_v1_c1_s4`，标题「第4节 速度的测量」；`node --check app.js` 通过
- [x] 4. `index.html`：3 卡片导航（知识讲解 / 互动探索区 / 小练习），标题「速度的测量」，副标题「测路程 · 测时间 · 算平均速度」
- [x] 5. `experiment.html`：4 张工具卡片：斜面小车实验（标注「必做实验」）、速度计算器、超声波传感器、单位换算器
- [x] 6. `exp-calc.html` + `exp-calc.js`：整份复制并微调文案为「平均速度计算」语境；`node --check exp-calc.js` 通过
- [x] 7. `exp-unit.html`：整份复制，标题与快捷载入标签微调为本节语境

## 自查结果

```text
$ ls -la content/physics_g8_v1_c1_s4/
total 96
drwx------  11 personal  staff    352 Sep 16 10:27 .
drwx------   8 personal  staff    256 Sep 16 10:26 ..
-rw-------   1 personal  staff   11843 Sep 16 10:26 common.css
-rw-------   1 personal  staff   759 Sep 16 10:26 exp-back.js
-rw-------   1 personal  staff   3341 Sep 16 10:27 exp-calc.html
-rw-------   1 personal  staff   4045 Sep 16 10:27 exp-calc.js
-rw-------   1 personal  staff   1172 Sep 16 10:26 exp-common.js
-rw-------   1 personal  staff   7879 Sep 16 10:28 exp-unit.html
-rw-------   1 personal  staff   1760 Sep 16 10:27 experiment.html
-rw-------   1 personal  staff   3100 Sep 16 10:26 fullscreen.js
-rw-------   1 personal  staff   1379 Sep 16 10:27 index.html

$ grep -n "c1_s4" app.js
37:  'physics_g8_v1_c1_s4': { title: '第4节 速度的测量', file: 'content/physics_g8_v1_c1_s4/index.html' },
```

## 遗留问题

1. `explain.html`、`quiz.html`、`exp-slope.html`、`exp-sensor.html` 尚未创建，待第 2~4 批完成。
2. `experiment.html` 中链接的 `exp-slope.html`、`exp-sensor.html` 当前为 404，需后续批次补齐。
3. `app.js` 已登记路由，但 `physics_renjiao.json` 中本节目录结构需确认是否同步（按任务要求未改动）。
