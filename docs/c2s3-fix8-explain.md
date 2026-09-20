# c2s3 修复轮8：图2.3-9 人物真实化+光线射入眼睛

## 修改文件
- `/Users/personal/projects/keben_web/content/physics_g8_v1_c2_s3/explain.html`（仅此文件）

## 修改内容
1. SVG 加 `id="fig239-r8"`；`viewBox` 从 `0 96 600 108` 上扩为 `0 50 600 160`，避免头顶裁切。
2. 替换火柴人为真实侧立人物：黑短发、粉色上衣、米色长裤、深色鞋，双臂下垂，站台面中心 x≈300，脚底贴 y161，身高约 76px（明显高过 42px 栏板）。
3. 三段反射光线：起点改从头部/嘴部（305,80）发出；经栏板反射、台面反射后，末段终点回到头部眼睛附近（304,74），均保留箭头 marker。
4. 微调「台面中心」标注与说明文字位置，避免与人物/光线重叠；保留「水平线」「栏板」及 figcap。

## 验证
- `curl -s http://127.0.0.1:8931/content/physics_g8_v1_c2_s3/explain.html | grep -c 'fig239-r8'` = 1
- 浏览器访问 `#t4` 无 errors
- 截图已保存并 mtime 晚于 explain.html：
  - `media/c2s3-fig/r8-fig239-wide.jpg`
  - `media/c2s3-fig/r8-fig239-mobile.jpg`

## 自查
- head -3：`<!DOCTYPE html>` ✅
- tail -2：`</body></html>` ✅
- `grep -c "</html>"` = 1 ✅
- 无 JS 改动，node --check 不适用。
