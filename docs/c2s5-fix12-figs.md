# c2s5 修复单F：图2.5-1/2.5-2 v3 重绘（2026-09-21）

## 背景
蔡总二轮反馈：v2 风格/2:1 通过但内容不明确，按新规格重绘内容；沿用 v2 全套管线，本人执行。

## prompt 要点（wan2.7-image-pro token plan，size=2048*1024 原生2:1）
- home_music_scene v3：左中右三段式——客厅小孩坐弹立式钢琴+音符飘出；隔墙窗框明确可开启状的窗；邻居卧室躺床捂耳皱眉+烦躁符号；音符串从钢琴飞出穿窗入卧室，辅以细弧线声波；禁抽象声波穿墙无场景。
- soundproof_box_model v3：甲乙同色同款纸箱盖斜掀；甲内壁裸露纸板+响铃闹钟（振动线/小音符）；乙内壁四周一圈+盖内侧整面蜂窝海绵（泡棉黄醒目）+同款响铃闹钟；乙外分贝计65dB；甲乙汉字。核心：乙=甲+全铺海绵内衬。

## 入库（素材库=workspace/可交互教材/素材库）
- raw/{name}_v3_raw.png（2048×1024）、raw/{name}_v3.png（1600×800）。
- sprites/{name}.png 覆盖为 800×400 透明 sprite；沿用 v2 教训：抠图后 alpha MinFilter(3)+blur0.5 腐蚀1px 去白边。
- 网页图 content/physics_g8_v1_c2_s5/img/fig-2-5-1.png、fig-2-5-2.png = sprite×2 居中白底1600×800；HTML 零改动。
- README.md 两行更新为 v3。

## 验证
- PIL：两网页图 (1600,800) 比例2.0。
- curl localhost:8124 均 HTTP 200，served 与磁盘 md5 一致：fig-2-5-1=6e71ef164c469d8ffaf4489b2c5f73af，fig-2-5-2=f9356958de25566401f1c84160deb3fc。
- view_image：图1 弹琴小孩/音符轨迹穿窗/窗框明确/捂耳皱眉+烦躁符号齐；图2 甲裸箱+响铃振动线、乙内壁一周+盖内蜂窝海绵、同色同款、65dB、甲乙汉字齐；灰底+2x放大无白边无硬切；无乱码水印。验收合格。

## 管线坑（记录）
- poll 解析须先取 output.choices[0].message.content[0].image，results 路径在 wan2.7 为空（首跑 IndexError）。
