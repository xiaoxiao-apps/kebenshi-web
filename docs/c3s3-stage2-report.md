# c3s3 阶段二验收报告

## 改动文件清单

| 文件 | 说明 | 行数 |
|---|---|---|
| `content/physics_g8_v1_c3_s3/exp-vapor.html` | 增加模式 tab、模式② 三子场景控件与数据面板 | 126 |
| `content/physics_g8_v1_c3_s3/exp-vapor.css` | 模式 tab、子 tab、蒸发备注样式 | 84 |
| `content/physics_g8_v1_c3_s3/exp-vapor.js` | 模式切换、蒸发子场景 UI 绑定、风扇/纸锅按钮 | 266 |
| `content/physics_g8_v1_c3_s3/exp-vapor-core.js` | 沸腾场景分组、蒸发 3D 三子场景、可见性/相机切换 | 502 |
| `content/physics_g8_v1_c3_s3/exp-vapor-physics.js` | 蒸发三因素、酒精蒸发吸热、纸锅烧水物理 | 157 |
| `content/physics_g8_v1_c3_s3/exp-vapor-audio.js` | 增加风扇呼呼音效 | 74 |

版本参数：`?v=s1` 已全部替换为 `?v=s2`。

## 物理冒烟数据（node -e require）

- 蒸发速率单调性：`T↑/A↑/wind↑` 时 rate 均增大，通过。
- 三因素对比台：高温(55℃)+大表面积(2)+大风速(5) 的实验组液滴体积 < 基准液滴，通过。
- 蒸发吸热对比：涂酒精+扇风温度计最低降至约 19℃，不涂酒精温度计保持 25℃，停扇后回升至室温，通过。
- 纸锅烧水：点燃后水温升至 100℃ 平台，纸锅温度约 135℃，始终 < 183℃，通过。

## 浏览器自查（http.server 8765）

- Console errors = 0（favicon/thumb 404 除外）。
- 模式①回归：点燃酒精灯后约 5s 内水温升至 100℃ 并保持沸腾，数据表/曲线正常。
- 模式②三子场景：三因素液滴可交互、蒸发吸热双温度计差值正确、纸锅烧水水沸纸不燃。
- 模式切换往返：①↔② 切换守恒，UI 与 3D 场景同步。

## 教材文案核对

- 蒸发定义/三因素结论、吸热结论、183 ℃ 着火点标注均按 `docs/c3s3-transcript.md` 原句落盘。

## 状态

验收通过，磁盘落盘完成。
