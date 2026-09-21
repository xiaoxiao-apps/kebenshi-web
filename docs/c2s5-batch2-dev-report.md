# c2s5 Batch2 补单收尾报告

日期：2026-09-20

## 已补齐项

1. **experiment.html 参数透传**
   - 位置：`</body>` 前，在 `exp-back.js` 引用之后
   - 新增内联脚本约 15 行（文件总计 51 行）
   - 功能：解析 URL 的 `from`/`tab`；无参数时 back-btn 指向 `explain.html#t3`，有参数时追加 `?from=...&tab=...#t3`；页面内 nav-card 链接保留参数。

2. **explain.html Tab③「项目实施」直跳按钮**
   - 位置：`id="t3"` 内最后一个 `.think` 的 `</details>` 之后、`</div>` 之前
   - 行号：169
   - 内容：`<a class="btn btn-secondary" href="exp-room.html?from=explain&tab=t3">🔬 去互动探索区试试</a>`

3. **exp-room.js**
   - 子代理报告：114 行
   - 磁盘实测：81 行
   - `node --check`：通过

## 验证命令

```bash
cd content/physics_g8_v1_c2_s5
wc -l experiment.html explain.html exp-room.js
node --check exp-room.js
grep -n "backBtn" experiment.html
grep -n "去互动探索区试试" explain.html
```

## 遗留问题

- exp-room.js 行数子代理报告（114）与磁盘实测（81）不一致，建议蔡总确认落盘版本是否完整。
- 本次未做浏览器渲染验证。
