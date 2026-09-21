# c2s5 修复单G：图2.5-2 v4 重绘盖子（2026-09-21）

## 背景
蔡总三轮反馈：v3 乙盒盖画成竖立独立黄板、不像纸箱翻盖；「盖子按之前的样子生成」= 甲盒/v2 那种自然后掀翻盖（带侧耳）。仅改盖子，其余保持 v3；fig-2-5-1 不动。

## prompt 要点（wan2.7-image-pro token plan，2048*1024 原生2:1）
甲乙完全同款同色纸箱，盖子同倾角同侧耳轮廓自然后掀、姿态一眼同款；甲盖内裸纸板+盒内响铃闹钟（振动线/音符）+「甲」；乙盖内侧整面+内壁四周一圈蜂窝海绵+同款响铃闹钟+「乙」；乙外分贝计65dB。核心自检：甲乙盖轮廓姿态同款、仅内侧铺垫不同。

## 入库（素材库=workspace/可交互教材/素材库）
- raw/soundproof_box_model_v4_raw.png（2048×1024）、raw/soundproof_box_model_v4.png（1600×800）。
- sprites/soundproof_box_model.png 覆盖为 800×400 透明 sprite（沿用 alpha MinFilter(3)+blur0.5 去白边）。
- 网页图 content/physics_g8_v1_c2_s5/img/fig-2-5-2.png = sprite×2 居中白底1600×800；HTML 零改动；fig-2-5-1.png 未动。
- README.md 该行更新为 v4。

## 验证
- PIL：fig-2-5-2 (1600,800) 比例2.0；fig-2-5-1 未变。
- curl localhost:8124 HTTP 200，served 与磁盘 md5 一致：6efde0eed193426c94829b670291efd9。
- view_image：甲乙盖同款翻盖同倾角带侧耳、乙盖内+内壁一周蜂窝海绵、甲裸纸板、响铃音符、65dB、甲乙汉字齐；灰底+2x放大无白边无硬切；无乱码水印。验收合格。

## 管线坑（记录）
- 长轮询脚本勿与生成串联在同一 exec 前台跑（会话会被杀）：nohup 后台 + 日志文件判读。
