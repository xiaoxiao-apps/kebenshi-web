# c3s3 纸锅烧水修复轮 R1
范围：exp-vapor-core.js + exp-vapor.html（core 的 ?v=s46→s47）
- A 温度条：64×1024 canvas 竖渐变 #4caf50→#ffeb3b(v=0.5)→#f44336(v=0.915→1) 作 CanvasTexture；updateEvapPaper 仍 scale.y=h 且 tex.repeat.y=h/barH、offset.y=0，183℃ 呈下绿中黄顶红、不整体变红；顶线色仍取 paperTempColor(T)。浏览器加热实测通过。
- B 刻度标签：makeTextLabel 增 opts.plain（去 fillRect 底、去 strokeRect 描边、measureText 收紧宽度）；纸锅两标签 plain:true，右缘停 tick 左 0.15 外、y 同 tick、z=0.18、#e8f4ff bold，不压线不压框；默认/旋转视角均可见。
- C 火柴：position (0,-7.13,boxD/2+1.8)（y-0.25、z+0.6），低角度截图与盒底间隙清晰、仍朝盒底；children 未变，checkPaperMatchClick 射线仍命中。
- D 底火：paperFlameGroup 按 fScale=1.6 复刻液化 lqFlameGroup（disc 0.34 op0.5 y-0.15；内锥 0.28×1.1 #ffcc80 op0.9 y0.25；6 外锥 0.22×0.9 #ff5722 op0.72 环0.26 y0.18 rot.x=π/10）；脉动动画不变；未动顶火/烟/泡/汽。
自查：node --check 过；HTML 三重过（DOCTYPE/尾 </html>/计数1）；grep 三渐变色与 plain:true 在位、?v=s47。
