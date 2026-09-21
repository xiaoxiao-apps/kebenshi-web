# c2s4「噪声的危害和控制」Batch2 开发报告

## 交付内容
- `experiment.html`（48 行）：3 张 nav-card，back-btn 带 data-back；从 explain 带 `from/tab` 进入时，exp-back.js 会把参数透传给卡片。
- `exp-wave.html/js`（68+104 行）：2D 示波器，音叉=规则正弦、噪声=白噪声杂乱波形；播放/停止控制，WebAudio oscillator/buffer 合成，无外部音频。
- `exp-decibel.html/js`（70+40 行）：分贝刻度条、可拖场景、三个“不能超过”上限按钮；数字和单位与教材逐字一致。
- `exp-control.html/js`（68+48 行）：拖拽分类到“防止噪声产生/阻断噪声传播/防止噪声进入耳朵”三栏；放错即时反馈并归位，全对后讲解。
- `explain.html`（267 行）：3 个 Tab 的“想一想”卡片各加一条直跳实验区链接，保留 details 答案。

## 自查结果
- `node --check` 通过 exp-wave.js / exp-decibel.js / exp-control.js。
- explain.html 直跳链接：`exp-wave.html?from=explain&tab=t1`、`exp-decibel.html?from=explain&tab=t2`、`exp-control.html?from=explain&tab=t3`。
- 未调用任何图像生成 API；实验页使用 SVG/emoji，无新增 sprite 素材。
- 单次文件均 ≤150 行。

## 注意事项
- exp-wave.html 引用了 `fullscreen.js` / `exp-common.js` / `exp-back.js`，确保这些文件在同级目录存在。
- 未做浏览器 live 验证，磁盘自查通过；效果待蔡总验收。
