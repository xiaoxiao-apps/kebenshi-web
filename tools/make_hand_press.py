#!/usr/bin/env python3
# 生成 content/_lib/v1/sprites/hand_press.png — 手指按压 sprite（512×512 RGBA）
# 造型：食指伸出下按的卡通手（肤色 #E8B48C 系 + 指甲 + 灰袖口），透明底，2x 超采样抗锯齿
# 原创绘制，禁抓网图。可复跑：python3 tools/make_hand_press.py
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'content', '_lib', 'v1', 'sprites', 'hand_press.png')

S = 1024  # 2x 超采样 → 输出 512
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

SKIN = (232, 180, 140, 255)          # #E8B48C
SKIN_DARK = (198, 144, 106, 255)
SKIN_LIGHT = (245, 208, 178, 255)
NAIL = (247, 216, 200, 255)
OUTLINE = (152, 104, 72, 255)
CUFF = (152, 158, 166, 255)          # 灰袖口
CUFF_DARK = (114, 120, 128, 255)

LW = 7  # 描边宽（2x 空间）

# --- 前臂/袖口（右上 → 手背） ---
# 袖子主体
d.polygon([(612, -10), (980, -10), (980, 250), (858, 330), (640, 250), (586, 96)],
          fill=CUFF)
# 袖口收边带（深色一条）
d.polygon([(586, 96), (640, 250), (858, 330), (980, 250), (980, 316), (866, 396), (596, 300), (540, 140)],
          fill=CUFF_DARK)
# 袖子描边
d.line([(586, 96), (640, 250), (858, 330), (980, 250)], fill=CUFF_DARK, width=LW, joint='curve')

# --- 手背（大圆角团块） ---
d.ellipse((390, 200, 880, 660), fill=SKIN, outline=OUTLINE, width=LW)
# 手背高光
d.ellipse((470, 250, 700, 400), fill=SKIN_LIGHT)

# --- 蜷起的三指（手背右下侧鼓包） ---
d.ellipse((600, 500, 850, 620), fill=SKIN, outline=OUTLINE, width=LW)
d.ellipse((612, 580, 846, 700), fill=SKIN, outline=OUTLINE, width=LW)
d.ellipse((628, 656, 830, 768), fill=SKIN, outline=OUTLINE, width=LW)

# --- 拇指（左侧斜贴） ---
d.ellipse((332, 430, 500, 610), fill=SKIN, outline=OUTLINE, width=LW)

# --- 食指（从手背左下伸出，垂直下按，指尖在底部中央） ---
# 指身：上宽下略窄的圆角条
d.polygon([(430, 520), (580, 520), (566, 880), (452, 880)], fill=SKIN)
d.line([(430, 520), (444, 880)], fill=OUTLINE, width=LW)
d.line([(580, 520), (566, 880)], fill=OUTLINE, width=LW)
# 指尖圆弧（底部）
d.ellipse((446, 828, 572, 954), fill=SKIN, outline=OUTLINE, width=LW)
# 遮住指尖椭圆与指身接缝的描边横杠
d.polygon([(448, 850), (570, 850), (568, 884), (450, 884)], fill=SKIN)
# 指关节两条横纹
d.arc((452, 640, 566, 700), 20, 160, fill=SKIN_DARK, width=5)
d.arc((454, 736, 566, 792), 20, 160, fill=SKIN_DARK, width=5)
# 指甲（指尖正面亮甲片）
d.ellipse((476, 872, 546, 946), fill=NAIL, outline=SKIN_DARK, width=4)

# --- 手背与食指接缝融合（去掉手背椭圆压在指身上的下缘描边） ---
# （食指整体在手背椭圆之下层绘制区域重叠，这里补一层指根皮肤融合块）
d.polygon([(436, 500), (576, 500), (578, 560), (434, 560)], fill=SKIN)
d.arc((436, 512, 578, 596), 10, 170, fill=SKIN_DARK, width=5)

# 输出：2x 超采样缩到 512（LANCZOS 抗锯齿）
img = img.resize((512, 512), Image.LANCZOS)
out = os.path.normpath(OUT)
os.makedirs(os.path.dirname(out), exist_ok=True)
img.save(out)
print('written:', out, img.size, img.mode)
