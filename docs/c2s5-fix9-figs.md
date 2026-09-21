# c2s5 修复单B：图2.5-1/2.5-2 插图重渲染与落盘（2026-09-21）

## 渲染 prompt 要点（wan2.7-image-pro token plan，一次成功）
- home_music_scene：男孩坐弹黑色立式钢琴、头顶飘音符，教材 P53 图2.5-1 插画风、白底、无文字水印。
- soundproof_box_model：左右并列甲/乙汉字标注；甲=纸盒内闹钟，乙=内壁黄色隔音棉+闹钟+盒外分贝计探头读数 65 dB，教材 P54 图2.5-2 构图。

## 入库路径（素材库=/Users/personal/.openclaw/workspace/可交互教材/素材库）
- sprites/home_music_scene.png、sprites/soundproof_box_model.png（各 800×800 透明底）
- raw/home_music_scene_raw.png、raw/soundproof_box_model_raw.png（2048×2048）
- README.md 索引表已补两行（来源 wan2.7-image-pro token plan，日期 2026-09-21）

## 网页落盘
- sprites 合成白底后覆盖 content/physics_g8_v1_c2_s5/img/fig-2-5-1.png、fig-2-5-2.png；sprite 宽 800≤1600 无需缩放，比例与白底保留，PNG。
- 网页 HTML 零改动。

## 验证
- curl localhost:8124 两图均 HTTP 200，served 与磁盘 md5 一致：fig-2-5-1=2794d32d8eae3c7f9e64f462e939f901，fig-2-5-2=c1347e9c0daf79c8010163c8d8136157。
- view_image 目视：sprite 主体完整无残缺误抠、无乱码方块字、无水印；甲/乙汉字与 65 dB 读数清晰，与教材语义一致；验收合格。
