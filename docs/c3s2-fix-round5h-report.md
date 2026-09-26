# c3s2 修复轮 R5h 报告

- 改动：exp-melt-core.js `IRON_X -14 → -5.5`；HTML 4 处 `?v=r5g → ?v=r5h`。
- 底座中心 x=0，器材（x=0）在底座正中；三杆长度 7.0 / 6.5 / 6.0。
- 立杆 x=-5.5，铁圈内缘 x=-3.7，杆-环连接通过；立杆与铁圈外缘间隙≈9.2 ≥ 1.0。
- 酒精灯底部 y=-6.2，底座顶面 y=-6.0，嵌入 0.2 ∈ [0.05,0.35]。
- 下杆末端 x=1.5 穿铁圈；中/上杆末端分别盖住 clampMid/clampTop。
- 自查：node --check 通过；HTML r5h=4、r5g=0；served core.js 命中 r5h；errors=0。
- 物理回归：海波熔 48℃ 平台 frac→1；预熔+freeze 48℃ 平台 frac→0。
- 截图：docs/c3s2-r5h-wide.png、docs/c3s2-r5h-front.png（目视器材居中、三杆缩短、无悬空穿模）。
