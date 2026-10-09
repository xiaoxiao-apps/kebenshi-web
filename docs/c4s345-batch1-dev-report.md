# c4s345 批次1 开发报告（第5节 光的色散）

## 交付清单
| 文件 | 行数 | 说明 |
|---|---|---|
| content/physics_g8_v1_c4_s5/index.html | 42 | 节卡片页 |
| content/physics_g8_v1_c4_s5/thumb.svg | 25 | 三棱镜色散简图 |
| content/physics_g8_v1_c4_s5/exp-dispersion.html | 120 | 实验页（M1/M2 页内切换） |
| content/physics_g8_v1_c4_s5/exp-dispersion-core.js | 138 | 控制/交互/控件同步 |
| content/physics_g8_v1_c4_s5/exp-dispersion-render.js | 86 | 渲染（色散台+三原色台） |
| content/physics_g8_v1_c4_s5/exp-dispersion-audio.js | 34 | WebAudio 点击/滑杆音效 |

## 功能要点
- M1 三棱镜色散台：白光光源可点击开关；拖光源/白屏；入射方向、棱镜角度滑杆；白屏承接七色光带；红→紫偏折递增。
- M2 三原色混合台：R/G/B 三滑杆 0-255，实时色块 + 混合结果名（黄/青/品红/白/黑等）。
- 页底固定控制条：左侧器材托盘（拖出即成品），中部功能卡，右侧显示/系统卡；无浮动面板。
- 导航守恒：exp 页 back-btn 回 index.html。

## 自查结果
- `node --check` 三个 js 全部通过。
- html 控件 id 与 core getElementById 清单双向对齐（grep 17 处均命中）。
- `grep -c "PROPS\." exp-dispersion-render.js` = 5（bench/desk_lamp/prism/screen/screenGeom）。
- 私画棱镜函数 grep = 0；`typeof PROPS.prism==='function'` 守卫调用。
- 浏览器实测：M1 开灯后白屏承接七色光带，红上紫下，读数正常；M2 模式切换与 RGB 混色正常。
- `SPRITE_BASE`/`SPRITE_VER` 位于 core 顶部。
- hint 文案 / 300ms 点击光晕 / 绿色四向箭头 / 光源可点击开关 四项均存在。
- HTML head-3 / tail-2 完整。

## 已知保留
- PROPS.prism 与 prism.png 由并行标准件单负责入库；当前调用会正常跳过，不私画占位。
- 路由登记（data/*.json + app.js AVAILABLE）按上线轮处理，本批次未触碰。