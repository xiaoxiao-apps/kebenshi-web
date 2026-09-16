# c1s4 1.4 讲解区修复第1批报告

## 修改文件
- content/physics_g8_v1_c1_s4/explain.html
- content/physics_g8_v1_c1_s4/exp-slope.html

## 完成项
1. explain.html 只保留 2 个主 Tab：平均速度 / 常用测速工具。
2. 常用测速工具内设 3 个二级项：超声波测距 / 区间测速 / 传感器测速。
3. explain.html 已删除“实验5步”“想想议议”主 Tab 及其内容。
4. exp-slope.html 已并入 5 步要点与想想议议完整内容（含方案 A/B 对比+解析）。
5. exp-slope.html 支持 `?from=explain`，返回按钮显示“‹ 返回知识讲解”并指向 explain.html。
6. explain.html 指向 exp-slope.html / exp-sensor.html 的链接均带 `?from=explain`。

## 三重自查
```
explain.html head -3:
<!DOCTYPE html>
<html lang="zh-CN">
<head>

explain.html tail -2:
</body>
</html>

exp-slope.html head -3:
<!DOCTYPE html>
<html lang="zh-CN">
<head>

exp-slope.html tail -2:
</body>
</html>

grep -c "</html>":
explain.html:1
exp-slope.html:1
```

## JS 语法检查
- explain.html 内联 JS：`node --check` 通过。
- exp-slope.html 内联 JS：`node --check` 通过。
- 未修改 exp-common.js、exp-slope.js。
