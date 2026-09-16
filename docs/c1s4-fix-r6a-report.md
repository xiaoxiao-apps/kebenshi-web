# c1s4 explain.html 三轮验收修复报告（r6a）

日期：2026-09-16 · 文件：content/physics_g8_v1_c1_s4/explain.html（仅动此一文件）

## 1 · 超声波 Tab s₁/s₂
- drawSLabel 增加 sub 参数：'s' bold 16px + 下标 11px 右下偏移两次 fillText
- 去程路径标 s₁、回程路径标 s₂（labels 播完后出现）
- canvas 下方 t→s 计算行后新增 `<div class="s-eq" id="s1eq2">s₁ = s₂</div>`，绿色，opacity .8s transition 淡入；重播时移除 .show

## 2 · 测速仪卡片详解
- 「应用：测速仪测运动物体速度」扩写为完整流程：①发射脉冲 ②反射记 t₁ 得 s₁=v声·t₁/2 ③间隔 Δt 发第二脉冲得 s₂ ④Δs=|s₂−s₁| ⑤v=Δs/Δt
- 附通俗解释（两次测距求速度）+ 生活例子（交警测速、倒车雷达报警）+ 教材图 1.4-3/1.4-4 关联

## 3 · 分数写法
- 新增 .frac/.num/.den CSS（inline-block、1.5px currentColor 横线、居中）
- 公式区 `v̄ = s/t` 与 E1 计算器标签（→ 平均速度 v̄ = s/t =）均改为横杠分数结构
- v̄ 保留原 overline span；区间测速「判断原理」段同步用 frac

## 4 · 区间测速 Tab 大改造
- a) canvas 顶部居中新画限速 100 标识：白底圆 + 红圆环(#c0392b, lineWidth 7) + 黑色 bold "100"，直径约 44px
- b) 删除底部「区间长度 s = … 限速 … km/h」fillText（grep 计 0）
- c) 控制区：输入框「区间长度 s（km）」默认 8 +「经过时间 t（min）」默认 5 +「🚗 开始出发」按钮（原重新演示改文案，点击小车左→右）
- d) 输入框旁 .verdict 超速提醒：v = s/(t/60)；≤100 绿色「✓ 正常，未超速（v=xx km/h）」，>100 红色「⚠ 您已超速（v=xx km/h）」；input 事件实时刷新
- e) loop() 闪光/路径记录/裸 s 标注触发条件原样保留（carFront 到达 camX/camBX 逻辑未动）
- f) 动画 DURATION=4500ms 仅示意，计算以输入值为准
- 附带：drawWhenVisible 改为可见即画静态场景（不再自动播放），与「开始出发」手动语义一致；删除旧「最少通过时间」计算行（被新输入控制区取代）

## 自查记录
- head -3 = `<!DOCTYPE html>`；tail -2 = `</body></html>`；grep -c "</html>" = 1
- inline JS 提取 → node --check 通过
- ctx.* 赋值含 var(-- 违规数 = 0（canvas 全 hex）
- IntersectionObserver 可见即画逻辑保留（drawWhenVisible）
- curl http://localhost:8642/content/physics_g8_v1_c1_s4/explain.html → HTTP 200，含新元素 id
- 未用 git / rm
