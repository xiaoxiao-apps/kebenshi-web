# c3s2 Fix Round 4 报告

## 改动
1. **自定义下拉**：4 个原生 select 改为 custom-select，点击触发选项浮层，选中后同步原生 select 与 state.sample/fire/amount/timeScale。
2. **面板调整**：删除参数面板「当前模式」行；「物态」移到数据面板顶部；新增「样品名称」同步下拉切换。
3. **hover 气泡**：#tt-chart / #float-tt-chart hover tooltip 增加「物态：state.phaseName」。
4. **教材图像**：exp-melt-chart.js 用贝塞尔曲线重绘 4 幅图；晶体图改为 A/B/C/D（熔化）与 E/F/G/H（凝固）可点击圆点，点击弹出固定讲解卡；铺满弹窗、保留 switcher。
5. **3D 装置**：exp-melt-core.js 按图 3.2-2 重摆：底座右移、立杆偏左、酒精灯坛子造型、高型烧杯、试管夹高于杯口、温度计挂杆升高、相机视角拉高。

## 验证
- `node --check` 4 个 JS 全绿；HTML 结构正常；页面 errors=0。
- 自定义下拉切换后 state.sample/fire/amount/timeScale 正确联动。
- 物理回归：海波熔化 48℃ 平台 frac 0→1；冰 0℃ 后液态；石蜡加热持续升温；凝固模式 48℃ 平台 frac 1→0。
- 教材弹窗 4 幅切换正常，F 点讲解卡正确显示。

## 截图
- `docs/c3s2-r4-desktop.png`（桌面全貌）
- `docs/c3s2-r4-mobile.png`（390px）
- `docs/c3s2-r4-textbook.png`（教材弹窗）
- `docs/c3s2-r4-textbook-f.png`（F 点讲解卡）

## 补单段（r4b）

> 补单代码 12:06-12:17 落盘，本节为验收取证+重截截图。

### 验收结果

| 缺陷 | 验收方法 | 结果 |
|------|----------|------|
| d1 铺满 | evaluate 测 SVG bbox/clientRect 占比，4 幅图+拖大后重测 | ✅ 宽 91.6%≥80%、高 82.3%≥70%；拖大后 93.2%/88.0% |
| d2 手机 | resize 390×844，4 个 trigger 断言 nowrap+不裁切 | ✅ 全部 whiteSpace=nowrap, scrollWidth=clientWidth, h=30px 单行 |
| d3 几何 | 源码常量数学验证 | ✅ flame 顶 1.53 < 杯底 1.8；TUBE_X=0；MID_Y 13.6 > 杯口 12.4；温度计泡 y=1.62 在样品 [0.75,5.25] 内 |
| d4 截图 | 6 张截图 mtime 15:09-15:10 > 代码 12:17 | ✅ 全部落盘 |

### 修复清单
无残留缺陷，未做代码修改。

### 截图清单
- `docs/c3s2-r4b-desktop.png` — 桌面默认全貌
- `docs/c3s2-r4b-mobile.png` — 390px 手机
- `docs/c3s2-r4b-mobile-open.png` — 390px 下拉展开
- `docs/c3s2-r4b-textbook.png` — 弹窗桌面默认
- `docs/c3s2-r4b-textbook-large.png` — 拖大后
- `docs/c3s2-r4b-textbook-f.png` — 晶体凝固 F 点讲解卡

### 纪律自查
- ✅ 仅改 content/physics_g8_v1_c3_s2/* 范围内文件（本次未改）
- ✅ 未动 app.js / data/ / 其他 content/ / git / rm
- ✅ 未 kill 8765 服务
- ✅ 未使用 CDN / 外部音频
- ✅ browser errors=0
- ✅ 本人执行，未派子代理
