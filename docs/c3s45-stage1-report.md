# c3s45 阶段一报告：c3_s4 升华凝华观察站（模式①）

## 文件清单（content/physics_g8_v1_c3_s4/）
| 文件 | 行数 | 说明 |
|------|------|------|
| index.html | 56 | 第4节卡片页（章标识+1实验卡+返回章目录） |
| exp-subl.html | 183 | 实验页骨架 + 内联控件/猜测卡/定义卡/即将上线样式 |
| exp-subl.js | 183 | UI/交互/模式切换/相机事件/定义卡触发 |
| exp-subl-core.js | 334 | 3D 场景 + 升华凝华物理引擎 |
| exp-subl-audio.js | 87 | WebAudio 合成音效（零外部文件） |
| three.min.js | 6 | 从 c3_s3 本地拷贝（禁 CDN） |

## 模式①实现要点
- **场景**：buildTable（复用器材库实验桌）+ 密闭玻璃容器（烧杯建模加透明玻璃盖）+ 底部碘颗粒 InstancedMesh（0x3a2340 深紫黑）。
- **交互流程**：进场猜测卡（浇热水/冷水两个问题，各两选项）→「浇热水」「浇冷水」按钮：
  - 浇热水：紫色蒸气粒子（0x7b4a9e）升腾充满容器，颗粒减少（iodineLeft 1→0.2 下限），弹出定义卡「升华 sublimation 固态→气态 吸热」+ 热流箭头。
  - 浇冷水：蒸气回落、器壁结晶光泽（wallCrystal 渐增），弹出定义卡「凝华 deposition 气态→固态 放热」+ 放热箭头。
- **物理保真**：全程无液态碘；不用酒精灯（页内 hint 提示碘熔点 113.7℃<火焰温度）。
- **参数面板**：热水温度 60/80/100℃（档高蒸气生成快）+ 碘颗粒量少/中/多。
- **音效**：浇热水滋啦 (playSizzle)、蒸气轻啸 (playVaporWhoosh)、凝华细碎 (playDeposit)、模式切换咔哒 (playModeSwitch)、click、静音钮 + 首次交互 resume。
- **视角**：手写球坐标 polar 5°–85°、滚轮/pinch 缩放限幅，与 raycast 解耦。
- **模式切换骨架**：顶部 3 pill，②③点「即将上线」占位不实现内容。

## 自查结果
- node --check 全部 JS：✅ OK（3 个文件）。
- python3 -m http.server 起服务 curl 各新文件：✅ 全 200。
- grep CDN 引用 (http.*three)：✅ 无。
- 浏览器 errors：✅ 0。
- canvas 像素非空白：✅ drawingBuffer 1388×876, nonzero=1215888。
- 逻辑所见即所得（evaluate 实测）：
  - 升华：vapor 0→0.50，iodineLeft 1→0.725 ✅
  - 凝华：vapor 0.90→0.45，wallCrystal→0.40 ✅
  - 模式切换：②→overlay 显+面板隐+文案「② 粒子实验室 · 即将上线」，回①还原 ✅

## 遗留问题
- 缩略图 assets/thumb-subl.png 未生成（卡片页 onerror 兜底，阶段四补齐）。
- 模式②③仅骨架，内容待后续阶段。