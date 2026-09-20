# c2s3轮8 科学世界真图+箭头路径 修复报告

## 改动范围
- 仅修改：`/Users/personal/projects/keben_web/content/physics_g8_v1_c2_s3/explain.html`
- 新增图片：
  - `content/physics_g8_v1_c2_s3/assets/fig2-3-8-yuanqiu.jpg`
  - `content/physics_g8_v1_c2_s3/assets/fig2-3-10-concerthall.jpg`
- 新增报告：本文件

## 图片来源
- 图2.3-8 圜丘：教材照片 `IMG_0150.jpg` 左下区域裁剪（宽0.00-0.47、高0.63-1.00）
- 图2.3-10 国家大剧院音乐厅：教材照片 `IMG_0150.jpg` 右下区域裁剪（宽0.47-1.00、高0.63-1.00）
- 图2.3-9 示意图：参考教材 `IMG_0150.jpg` 中部右侧区域重绘 SVG，增加三段带箭头折线

## 压缩参数
- PIL `thumbnail((1200,1200), Image.LANCZOS)`
- JPEG quality=82, optimize=True
- 圜丘：1200×709，168 KB
- 音乐厅：1200×628，141 KB
- 再用 `sips -Z 1200` 二次约束

## 三重自查
- `</html>` 出现 1 次，标签配对
- 引号配对无报错
- ️ 🎻 🎺 残留 emoji 数为 0
- SVG 中 `marker-end` 数量：3

## 服务端验证
- `curl` 本地 8931 端口 `explain.html` 200 OK
- 磁盘与服务端 MD5 一致：`c2a0f413ecd70b7fba8c16617723be78`
- 两张图片 `curl` 均返回 200
- 浏览器 evaluate：两张图 `naturalWidth>0`；SVG marker≥3；console errors=0

## 截图
- 宽屏：`/Users/personal/.openclaw/workspace/media/keben_check/r8-explain-wide.png`
- 手机：`/Users/personal/.openclaw/workspace/media/keben_check/r8-explain-mobile.png`
- 截图 mtime 均晚于 explain.html mtime

## 轮8补2：精确裁图抹字 + SVG 补小人
- 圜丘图：裁剪 `(40,1960,1820,2960)`，羽化拷贝补丁抹掉页码字（源块 `S1=(130,2380,520,2470)`）和图注字（水平插值 `T2=(530,2620,815,2700)`）。
- 音乐厅图：裁剪 `(1875,1985,3680,2945)`，羽化拷贝补丁抹掉图注字 `T3=(3040,2090,3510,2160)` 和页码/章节字 `T4=(3220,2630,3600,2705)`。
- 两图均 resize 宽 1200（LANCZOS）、JPEG quality=82/optimize=True 覆盖写入 assets。
- `explain.html` SVG 段：`viewBox` 改为 `0 96 600 108`；删除原红点 `circle`；新增红色简笔小人（头/躯干/两腿，色 `#c0392b`）；`台面中心` 文字改 `x=288,y=140,text-anchor=end`；第一段声音线起点改 `306,116`；蓝色说明文字 `y=106`。
- 自检：图片目视无印刷字/黑边白边/补丁疤；SVG 验收 `marker-end=3`、`circle=1`、宽高比 `0.18 ≤ 0.35`、console errors=0；磁盘与 curl MD5 一致。
- 截图：宽屏 `/Users/personal/.openclaw/workspace/media/keben_check/r8b-wide.png`、SVG 局部 `/Users/personal/.openclaw/workspace/media/keben_check/r8b-svg.png`、手机 `/Users/personal/.openclaw/workspace/media/keben_check/r8b-mobile.png`，mtime 均新于 explain.html。

## 轮8补4：Pexels 高清真图替换
- 候选清单：
  - 圜丘：14075951（祈年殿正面）、32167910（天坛主体蓝天）、33537491（带人群）
  - 音乐厅：27926554（带管风琴舞台）、27781607（现代礼堂座椅）、37307078（悉尼歌剧院观众席）
- 选定：圜丘 `32167910`、音乐厅 `27926554`
- 来源 URL：
  - 圜丘：https://images.pexels.com/photos/32167910/pexels-photo-32167910/free-photo-of-temple-of-heaven-in-beijing-under-clear-sky.jpeg?cs=tinysrgb&dpr=1&w=1600
  - 音乐厅：https://images.pexels.com/photos/27926554/pexels-photo-27926554/free-photo-of-the-inside-of-a-large-auditorium-with-a-large-stage.jpeg?cs=tinysrgb&dpr=1&w=1600
- License：Pexels License，免费商用，无需署名；图注仍保留「图片来源：Pexels"
- 覆盖文件：`assets/fig2-3-8-yuanqiu.jpg`、`assets/fig2-3-10-concerthall.jpg`
- `explain.html`：仅在两张图注行追加 `<span style="font-size:11px;opacity:.7">图片来源：Pexels</span>`
- 验收：
  - 三重自查：`<!DOCTYPE` 1 处、`</html>` 1 处、标签闭合正常
  - 本地 `http://127.0.0.1:8931/content/physics_g8_v1_c2_s3/explain.html#t4` 200 OK
  - 浏览器 evaluate：两图 `naturalWidth=1600`，`complete=true`，console errors=0
  - 磁盘 vs curl MD5 一致（圜丘 `a2fb47344d8ff0f01167c4a204232484`，音乐厅 `168f37eadb2bc6a9262ac93ff8bafce9`）
  - 宽屏/手机截图 mtime 新于 explain.html，目视主体清晰、署名行可见

## 轮8补5：横版裁切 + 圜丘主体纠正
- 问题：补4替换的两图为竖版（1600×2000+/1600×2400+），页面全宽显示成巨大竖块，版面塌陷；且圜丘图误选祈年殿主体（32167910 为三重檐圆殿），与教材图2.3-8 事实错配。
- 候选：
  - 圜丘：Pexels `35562610`（Circular Mound Altar 台面+栏板，主体正确）、`38315008`/`39517214` 等祈年殿外观（弃）。
  - 音乐厅：保留 `27926554`，横版裁切 1600×900。
- 选定 URL：
  - 圜丘：https://images.pexels.com/photos/35562610/pexels-photo-35562610/free-photo-of-temple-of-heaven-s-circular-mound-altar-in-beijing.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop
  - 音乐厅：https://images.pexels.com/photos/27926554/pexels-photo-27926554.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop
- 修改：用上述横版裁切 URL 覆盖 `assets/fig2-3-8-yuanqiu.jpg` 与 `assets/fig2-3-10-concerthall.jpg`；`explain.html` 两图注署名行更新为「图片来源：Pexels · Temple of Heaven's Circular Mound Altar」与「图片来源：Pexels · Concert Hall Interior」。
- 验收：
  - 三重自查：`<!DOCTYPE` 1 处、`</html>` 1 处、标签闭合正常。
  - 浏览器 evaluate 两张图 `naturalWidth=1600`、`naturalHeight=900`、`complete=true`、`errors=0`。
  - 磁盘 vs curl MD5 一致（圜丘 `ebc5df33173c3c7018012c1c9305615f`，音乐厅 `d493aa919a8618aefc8272cb2a37bfe1`）。
  - 截图 `/Users/personal/.openclaw/workspace/media/keben_check/r8e-wide.png` 与 `r8e-mobile.png` mtime 新于 explain.html，目视两图横版、圜丘主体为白色圆形石台面+栏板、署名行可见。

## 轮8补6：圜丘左右拼图 + 音乐厅换图

- 圜丘图改为左右拼接：
  - 左图 URL：https://n.sinaimg.cn/sinacn05/310/w720h390/20181201/0c1f-hpinrya9257190.jpg（720×390）
  - 右图：当前 assets/fig2-3-8-yuanqiu.jpg（Pexels 35562610，1600×900）
  - 拼接参数：统一高度 H=552；左宽=round(552×720/390)=1019，右宽=round(552×1600/900)=981；画布 2000×552，左贴左、右贴右，无间隙/无文字/无描边；JPEG quality=88
  - 最终尺寸：2000×552，自然宽度 2000
- 音乐厅图替换：
  - URL：https://ts1.tc.mm.bing.net/th/id/OIP-C.JoWNbQQdx0oEnbgrnD4sMwHaFw?r=0&rs=1&pid=ImgDetMain&o=7&rm=3&w=1600&h=1200（追加 &w=1600&h=1200 取得高清）
  - 最终分辨率：1600×1200
- `explain.html` 图注来源措辞：
  - 圜丘：「图片来源：网络公开资料（左）· Pexels（右）」
  - 音乐厅：「图片来源：网络公开资料」
- 验收：三重自查通过；浏览器 evaluate 两张图 `complete=true`，`naturalWidth=2000/1600`，`errors=0`；磁盘与 curl MD5 一致；宽屏/手机截图 mtime 新于 explain.html，目视拼图左=圜丘台面栏板照、右=Pexels 圜丘照，接缝齐平无变形，音乐厅主体为音乐厅内景、清晰无水印大字。

## 结论
验收全部通过。

## 轮8补7：拼图去重 + 反射线回眼 + 真人小人

- 拼图去重：PIL 重拼 assets/fig2-3-8-yuanqiu.jpg=左航拍1幅(720×390→1019×552, /tmp/yq-left.jpg)+右地面照(裁自旧图右981px)，2000×552、quality=88 覆盖。数值核验旧图接缝唯一在 x=1018（列差120 vs 次高12.9）、左半与 yq-left MAD=3.44，确认旧图本无重复航拍；新图浏览器 naturalWidth=2000、目视恰两幅、左航拍右地面无变形。
- 反射回眼：exp-huanqiu.js 新增 eyeY()=personY()-14*scale；反射弧方向角、g.dist、中心汇合脉冲全部改汇聚 (personX(), eyeY())；喊话波源改嘴高 mouthY()=personY()-11.5*scale。
- 真人小人：重写 drawPerson 为教科书插画风站姿（圆头+发盖鬓角、肤色脸+眼点+微笑、红衣# c0392b 肩宽腰窄躯干、深蓝长裤双腿+鞋、衣袖+肤色前臂微张下垂、颈肩腰比例），签名 drawPerson(x,y,color) 与 personX/personY 不变。
- 缓存戳：exp-huanqiu.html 仅 exp-huanqiu.js?v=20260920r7→r8。
- 验收：node --check=NODE_OK；三重自查 DOCTYPE/</html>=1/脚本引用齐；磁盘 md5(js 4c4c45b4…、jpg 9f33212f…)=curl 8931 同值；浏览器喊话后 __hqWaves hitLeft/hitRight/refl/arrived 全 true、errors=0；页内定时抓帧+download 落 r8g-wave.png 目视反射弧收到头/眼高、小人真人插画风；r8g-wide/r8g-mobile（explain#t4 宽屏+iPhone12 视口）目视拼图恰两幅；三截图 mtime 均新于 js/html/jpg。
