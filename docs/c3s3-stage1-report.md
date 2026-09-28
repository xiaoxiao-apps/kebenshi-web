# c3s3 阶段一验收报告

## 交付文件清单

| 文件 | 行数 | 说明 |
|---|---|---|
| content/physics_g8_v1_c3_s3/index.html | 46 | 节卡片页 |
| content/physics_g8_v1_c3_s3/exp-vapor.html | 79 | 沸腾探究实验页 |
| content/physics_g8_v1_c3_s3/exp-vapor.css | 76 | UI 样式（含开场演示） |
| content/physics_g8_v1_c3_s3/exp-vapor-physics.js | 66 | 可 node 冒烟的纯热循环 |
| content/physics_g8_v1_c3_s3/exp-vapor-core.js | 317 | 3D 场景/气泡/温度计/火焰 |
| content/physics_g8_v1_c3_s3/exp-vapor-chart.js | 117 | T-t 曲线 + 数据表 |
| content/physics_g8_v1_c3_s3/exp-vapor-audio.js | 61 | WebAudio 音效 |
| content/physics_g8_v1_c3_s3/exp-vapor.js | 145 | UI 绑定 + 开场动画 |
| content/physics_g8_v1_c3_s3/three.min.js | - | 从 c3s2 cp |

## 核心几何常量

| 常量 | 值 | 用途 |
|---|---|---|
| BEAKER_R | 3.4 | 烧杯半径 |
| BEAKER_H | 8.5 | 烧杯高度 |
| WATER_H | 5.8 | 初始水深 |
| BATH_BOTTOM_Y | 1.8 | 烧杯底部 Y |
| RING_Y | 1.2 | 铁圈/石棉网高度 |
| TOP_Y | 20.2 | 上横杆/温度计夹 |
| renderOrder | 火焰0→玻璃1→水体2→纸板3→温度计4 | 防止透明层级翻转 |

## 物理自测结果（node 冒烟）

室温25℃、中火、中水量、×60：
- 低温到沸：4.65 min；中火：2.00 min；大火：0.95 min — 三档递减。
- 最高温度 100.00 ℃，平台温度 100.00 ℃，峰值 ≤100.0 无过冲。
- 数据记录间隔 0.5 min，首条从水温 ≥90℃ 开始。

## 浏览器实测

- 本地 `python3 -m http.server 8123` 启动。
- exp-vapor.html 加载后：3D 场景可见（烧杯/水/纸板盖/温度计/铁架台/酒精灯）。
- 点击「开始」→「点燃酒精灯」：水温升至 100.00℃，状态切为沸腾，数据表追加。
- 返回链路 exp-vapor.html → index.html 闭合。
- Console errors：仅 favicon.ico 404 与 assets/thumb-vapor.png 404（缩略图收尾轮生成，符合预期）。

## 自查清单

- [x] 全部 JS `node --check` 通过
- [x] 物理自测通过（三档到沸时间递减、平台 100℃、无过冲）
- [x] 浏览器实测 errors 仅预期 404
- [x] HTML 引用 CSS/JS 全部带 `?v=s1`
- [x] 未动 app.js、data/、c3s2、c3_summary、c3_practice
- [x] 未使用 git / 未派子代理
