# c3s3 蒸发探究：风扇风声调柔和修复报告

## 修改内容（exp-vapor-audio.js playFanWhoosh() 内）

| 位置 | 旧值 | 新值 |
|------|------|------|
| 主增益包络峰值（0.1s） | 0.32 | 0.14 |
| 主增益包络 sustain（0.45s） | 0.18 | 0.08 |
| lowpass 频率峰值（0.25s） | 720 Hz | 500 Hz |
| lowpass 频率结束（0.8s） | 300 Hz | 260 Hz |
| bandpass 厚度层增益 | 0.5 | 0.3 |

## 缓存版本

- `exp-vapor.html`：`exp-vapor-audio.js?v=s27` → `?v=s28`

## 验证链结果

1. `node --check exp-vapor-audio.js`：通过，无输出。
2. HTML 三重自查：
   - `head -3` 含 `<!DOCTYPE html>` ✓
   - `tail -2` 含 `</html>` ✓
   - `grep -c "</html>"` = 1 ✓
3. curl  served 文件检查：
   - JS 输出含 0.14、0.08、500、260、0.3 ✓
   - JS 输出不含旧值 0.32、720 ✓
   - HTML 中 `exp-vapor-audio.js?v=s28` 出现次数 = 1 ✓
4. 浏览器验证：
   - `errors` 零条 ✓
   - `typeof playFanWhoosh === 'function'` 且调用不抛错 ✓

## 第二轮再降档

| 位置 | 旧值 | 新值 |
|------|------|------|
| 主增益包络峰值（0.1s） | 0.14 | 0.055 |
| 主增益包络 sustain（0.45s） | 0.08 | 0.03 |
| bandpass 厚度层增益 | 0.3 | 0.12 |
| HTML 缓存参数 | s28 | s29 |

验证链再次全部通过：node --check 通过、HTML 三重自查通过、curl 新值/旧值检查通过、浏览器 errors 零条且 evaluate 断言通过。

## 第三轮再降档

| 位置 | 旧值 | 新值 |
|------|------|------|
| 主增益包络峰值（0.1s） | 0.055 | 0.026 |
| 主增益包络 sustain（0.45s） | 0.03 | 0.014 |
| bandpass 厚度层增益 | 0.12 | 0.06 |
| HTML 缓存参数 | s29 | s30 |

验证链再次通过，浏览器 errors 零条、evaluate 断言/调用正常。

## 结论

风扇风声已按配方连续三档降低峰值、减薄厚度并柔和化，验证全部通过。
