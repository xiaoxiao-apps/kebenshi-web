# c2s5 修复单E：图2.5-1/2.5-2 v2 重渲染（2026-09-21）

## prompt 要点（wan2.7-image-pro token plan，size=2048*1024 原生 2:1 横幅，API 直接支持无需裁切）
- home_music_scene v2：左右分幅房屋剖面；左=小孩坐弹黑色立式钢琴+音符飘出；声波/音符**穿过隔墙窗户进入邻居卧室内部**飘向躺床捂耳皱眉的邻居（首版声波止于窗外，收紧 prompt 重渲染一次）。
- soundproof_box_model v2：甲乙同色牛皮纸箱并列掀盖；甲内仅闹钟、内壁与盖内侧无海绵（首版甲盖误铺海绵，重渲染一次）；乙内壁一周蜂窝海绵+盖内侧同款+盒外分贝计探头读数 65 dB；甲/乙汉字。
- 两图均教材插画风、白底、无文字水印（除甲/乙/65 dB）。

## 尺寸与入库（素材库=workspace/可交互教材/素材库）
- raw/home_music_scene_v2_raw.png、raw/soundproof_box_model_v2_raw.png（2048×1024）
- raw/home_music_scene_v2.png、raw/soundproof_box_model_v2.png（1600×800，2:1）
- sprites/home_music_scene.png、sprites/soundproof_box_model.png 覆盖为 800×400 透明 sprite；首版灰底自查见 1px 白边光环 → alpha MinFilter(3)+blur0.5 腐蚀后重存，灰底+2x 放大复查无白边/硬切。
- 网页图：content/physics_g8_v1_c2_s5/img/fig-2-5-1.png、fig-2-5-2.png = sprite×2 居中合成白底 1600×800；HTML 零改动。
- README.md 索引两行更新为 v2（2026-09-21）。

## 验证
- PIL：两网页图均 (1600, 800)，比例 2.0。
- curl localhost:8124 两图 HTTP 200，served 与磁盘 md5 一致：fig-2-5-1=213b73f068137af4ca71fd72c15188a8，fig-2-5-2=eb1afbd9d6447c8fd308c9a9a111dea2。
- view_image 目视：弹琴小孩+穿窗声波+捂耳邻居；甲乙同色箱、乙内壁一周+盖内蜂窝海绵、65 dB、甲乙汉字清晰；无乱码无水印。验收合格。
