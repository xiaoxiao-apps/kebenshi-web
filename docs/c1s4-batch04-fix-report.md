# c1s4 batch04 修复报告

## 修复内容

- `quiz.html`：补全 DOCTYPE/head/返回导航/Tab 导航、练习 1/2/3 作答区；保留练习 4/5 及全部 JS。练习 2 采用复核值 A=100 cm、B=75 cm、C=0 cm；时刻 00:00.00 / 00:01.00 / 00:02.00；答案 v_AB=25、v_BC=75、v_AC=50 cm/s。
- `exp-sensor.html`：补全 DOCTYPE/head/返回导航/标题/声明、传感器动画区与控件；保留原有算距离/连续测速卡片及全部 JS。

## 校验结果

### quiz.html

```
$ head -3 quiz.html
<!DOCTYPE html>
<html lang="zh-CN">
<head>

$ tail -2 quiz.html
</body>
</html>

$ grep -c "</html>" quiz.html
1
```

- `node --check` 提取的 inline JS：通过。
- 最终行数：`355`。

### exp-sensor.html

```
$ head -3 exp-sensor.html
<!DOCTYPE html>
<html lang="zh-CN">
<head>

$ tail -2 exp-sensor.html
</body>
</html>

$ grep -c "</html>" exp-sensor.html
1
```

- `node --check` 提取的 inline JS：通过。
- 最终行数：`308`。

## 工程纪律

- 分段追加写入（shell `cat >>`），每段后均用 `wc -l` 确认行数在增长。
- 未覆盖已有练习 4/5 及 JS；所有新增 HTML id 与现有 JS 引用一一对应。
- 未进行任何 git 操作；除两个目标文件外，仅新建本报告。
