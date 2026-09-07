# 可交互教材网页端框架 — 部署报告

## 1. 项目信息

- **本地目录**：`~/projects/keben_web`
- **GitHub 仓库**：`xiaoxiao-apps/kebenshi-web`
- **部署 URL**：https://xiaoxiao-apps.github.io/kebenshi-web/
- **构建方式**：纯静态（HTML / CSS / 原生 JS），无构建工具、无后端

## 2. 文件结构

```
~/projects/keben_web
├── index.html                         # 首页（学科选择）
├── styles.css                         # 全局样式（移动端优先响应式）
├── app.js                             # 路由/渲染逻辑（纯 JS）
├── data
│   ├── physics_renjiao.json           # 物理课程目录
│   ├── math_renjiao.json              # 数学课程目录
│   └── chemistry_renjiao.json         # 化学课程目录
├── content
│   ├── physics_g8_v1_c4_s2            # 光的反射
│   │   ├── index.html
│   │   └── app.js
│   ├── physics_g8_v1_c1_s1            # 长度和时间的测量
│   │   ├── index.html
│   │   └── app.js
│   └── math_fun_chicken_rabbit          # 鸡兔同笼
│       └── index.html
└── preview                             # 自测截图
    ├── 01-home.png
    ├── 02-physics-grades.png
    ├── 03-physics-toc.png
    ├── 04-light-reflection.png
    ├── 05-light-reflection-interact.png
    ├── 06-light-reflection-lab.png
    ├── 07-length-time.png
    ├── 08-chicken-rabbit.png
    ├── 09-math-toc.png
    ├── 10-math-fun-challenge.png
    └── 11-deployed-home.png
```

## 3. 三个内容页挂载映射

| 原 Demo 目录 | 挂载节 ID | 课程位置 | 说明 |
|---|---|---|---|
| `interactive_textbook_demo/light-reflection/` | `physics_g8_v1_c4_s2` | 物理·八年级上册·第四章 光现象·第2节 光的反射 | 完全匹配 curriculum 数据 |
| `interactive_textbook_demo/length-and-time/` | `physics_g8_v1_c1_s1` | 物理·八年级上册·第一章 机械运动·第1节 长度和时间的测量 | 完全匹配 curriculum 数据 |
| `interactive_textbook_demo/chicken-rabbit/index.html` | `math_fun_chicken_rabbit` | 数学·趣味挑战·鸡兔同笼 | 在 `math_renjiao.json` 中未搜索到“鸡兔”，故新增“趣味挑战”章节挂载 |

## 4. 已实现功能

- ✅ 学科卡片首页（物理 / 数学 / 化学）
- ✅ 年级 + 册次选择
- ✅ 章节树目录渲染
- ✅ 已上线节可点击；未上线节显示“即将上线”并置灰不可点
- ✅ 内容页通过 iframe 嵌入，底部固定导航条：上一节 / 返回目录 / 下一节（首节/末节自动置灰）
- ✅ 无会员墙 / 无付费锁，页脚标注“全部内容免费开放”
- ✅ 无境外 CDN 依赖，字体使用系统字体栈
- ✅ GitHub Pages 部署成功

## 5. 部署 URL

**https://xiaoxiao-apps.github.io/kebenshi-web/**

已验证：首页可正常访问，学科/年级/目录/内容页流程正常。

## 6. 遇到的问题清单

| 问题 | 处理方式 |
|---|---|
| GitHub Pages 首次启用后访问 404 | Pages 构建需要等待（约 1~2 分钟），通过 `https://api.github.com/repos/.../pages/builds` 查询构建状态为 `built` 后再次访问，200 OK |
| 数学目录中无“鸡兔同笼”匹配项 | 在 `math_renjiao.json` 末尾新增“趣味挑战”章节，将鸡兔同笼作为该章节唯一一节挂载 |
| iframe 内交互需要跨文档访问 | 通过 `iframe.contentWindow.document` 定位内部元素并触发事件完成自测 |
| 趣味挑战目录页显示 `undefined` | 已修复 `renderVolume` 中 `volume.volume` 未定义时的显示问题 |

## 7. 本地自测命令

```bash
cd ~/projects/keben_web && python3 -m http.server 8770
```

已在 `http://localhost:8770` 逐项验证：首页 → 各学科 → 年级/册次 → 目录 → 三个内容页渲染与交互 → 上一节/下一节跳转。截图已保存至 `~/projects/keben_web/preview/`。
