# c1s4 explain.html canvas var() 修复报告

## 修改内容
将 `<script>` 内 canvas 绘制代码中 9 处 fillStyle/strokeStyle 的 CSS 变量替换为实际颜色值（仅修改 `<script>`，未触碰 `<style>` 和 HTML 属性）：

| 行号 | 原值 | 新值 |
|------|------|------|
| 340 | `ctx.strokeStyle = 'var(--green)'` | `ctx.strokeStyle = '#4a8c3f'` |
| 341 | `ctx.fillStyle = 'var(--green)'` | `ctx.fillStyle = '#4a8c3f'` |
| 348 | `ctx.strokeStyle = 'var(--green)'` | `ctx.strokeStyle = '#4a8c3f'` |
| 349 | `ctx.fillStyle = 'var(--green)'` | `ctx.fillStyle = '#4a8c3f'` |
| 388 | `ctx.fillStyle = 'var(--ink2)'` | `ctx.fillStyle = '#5a5a5a'` |
| 455 | `ctx.fillStyle = 'var(--ink2)'` | `ctx.fillStyle = '#5a5a5a'` |
| 515 | `ctx.strokeStyle = 'var(--green)'` | `ctx.strokeStyle = '#4a8c3f'` |
| 516 | `ctx.fillStyle = 'var(--green)'` | `ctx.fillStyle = '#4a8c3f'` |
| 522 | `ctx.fillStyle = 'var(--ink2)'` | `ctx.fillStyle = '#5a5a5a'` |

## 验证结果

```bash
# 1. canvas 绘制代码中已无 fillStyle/strokeStyle 使用 var(--*)
grep -n "fillStyle.*var(--\|strokeStyle.*var(--" explain.html
# （无输出）

# 2. <style> 块中的 var(--green) 仍然保留
grep -c "var(--green)" explain.html
# 7

# 3. inline JS 语法检查通过
node --check <extracted_inline.js>
# rc=0

# 4. 文件完整性自查
head -3 explain.html
# <!DOCTYPE html>
# <html lang="zh-CN">
# <head>

tail -2 explain.html
# </body>
# </html>

grep -c "</html>" explain.html
# 1
```

## 结论
修复完成，`s` 标注圆圈内文字现在会以 `#4a8c3f`（绿色）正确显示，注释文字以 `#5a5a5a`（深灰）正确显示。
