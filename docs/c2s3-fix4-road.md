# c2s3 修复轮4·单3/3：音乐公路交互删除并入练习5

- 删除 `experiment.html` 音乐公路 nav-card，其余 3 个实验卡片保留；本地 `common.css`、`exp-back.js` 引用加 `?v=20260920r4`。
- `exp-road.html`、`exp-road.js` 归档到 `_archived/`，未用 rm；全目录 grep 除归档区外无 `exp-road` 引用。
- `quiz.html` q5 答案扩写：发声原理、频率公式 f=v/λ、音调控制、本题计算 15/392≈0.038 m≈3.8 cm、本质为“音符序列→凹槽间距序列”，汽车即播放器。
- 验证：`curl` experiment 无 exp-road 卡片，quiz md5 服务端/磁盘一致；q5 答案含“3.8”和“播放器”；浏览器新标签页打开 errors=0。
