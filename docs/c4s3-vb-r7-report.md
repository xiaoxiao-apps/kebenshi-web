# c4s3 vB 语音版修复轮 r7 报告（13 条自由解说补配音接线）

日期：2026-10-26
范围：仅数据接线。根因=13 条 free 自由解说从初版起无 audio 字段；mp3 已由主会话预生成落盘（未重新生成、未改动）。vB.js/engine.js/guide.css 本轮零改动。

## 改动清单（3 文件）
1. `content/physics_g8_v1_c4_s3/guide/script.js`
   - m1.free 4 条 / m2.free 5 条 / m3.free 4 条按序追加 `audio:'c4s3-m{n}-f{k}'`（trigger/note 一字未动）
   - audios 映射在 `'c4s3-m3-concl'` 后追加 13 行（前行补逗号、尾行无逗号），总数 37→50
2. `content/physics_g8_v1_c4_s3/exp-mirror-vB.html`：4 处 guide 引用 `?v=20261026g7` → `g8`
3. `docs/c4s3-guide-variants-design.md`：§4 末尾新增「r7 增补：自由解说配音（13 条）」小节（clip id | 文本 | 用途 三列）

未动：vB.js / engine.js / guide.css / vA.js / vC.js / vD.js / hub.html / guide/audio/ 全部文件；未 commit、未 push。

## 验收逐条证据

### 1. node --check script.js
```
$ node --check content/physics_g8_v1_c4_s3/guide/script.js && echo CHECK_OK
CHECK_OK
```

### 2. git status --short
```
 M content/physics_g8_v1_c4_s3/exp-mirror-vB.html
 M content/physics_g8_v1_c4_s3/guide/script.js
 M docs/c4s3-guide-variants-design.md
?? .DS_Store
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m1-f1.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m1-f2.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m1-f3.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m1-f4.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m2-f1.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m2-f2.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m2-f3.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m2-f4.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m2-f5.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m3-f1.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m3-f2.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m3-f3.mp3
?? content/physics_g8_v1_c4_s3/guide/audio/c4s3-m3-f4.mp3
```
M 恰 3 文件；?? 为 13 个 mp3 + 仓库原有 .DS_Store（非本轮产物）。

### 3. grep / node 对账
```
$ grep -o "audio:'c4s3-m.-f.'" script.js | wc -l        → 13   （free 字段）
$ grep -c "\-f[0-9]':'guide/audio" script.js            → 13   （audios 映射行）
$ node -e "…require script.js…"
audios total: 50
m1 free: 4 missing audio: 0 ids: c4s3-m1-f1,c4s3-m1-f2,c4s3-m1-f3,c4s3-m1-f4
m2 free: 5 missing audio: 0 ids: c4s3-m2-f1,c4s3-m2-f2,c4s3-m2-f3,c4s3-m2-f4,c4s3-m2-f5
m3 free: 4 missing audio: 0 ids: c4s3-m3-f1,c4s3-m3-f2,c4s3-m3-f3,c4s3-m3-f4
f-clips in audios: 13
```

### 4. mp3 ↔ audios 映射双向一致 + HTTP 抽查
```
$ ls guide/audio/ | grep '-f[0-9]' | sort  vs  映射键 | sort  → diff 空，MP3<->MAPPING MATCH (13/13)
$ curl -sI …/c4s3-m1-f1.mp3 | head -1 → HTTP/1.0 200 OK
$ curl -sI …/c4s3-m2-f1.mp3 | head -1 → HTTP/1.0 200 OK
$ curl -sI …/c4s3-m2-f5.mp3 | head -1 → HTTP/1.0 200 OK
$ curl -sI …/c4s3-m3-f4.mp3 | head -1 → HTTP/1.0 200 OK
```

### 5. 浏览器实测（playwright-core + 本地缓存 Chromium，--autoplay-policy=no-user-gesture-required；启动层未出现=浏览器放行）
- 5a M2：点 `#mode-m2` → `window.MRR.m2.dragS=true` → 262ms 内字幕「S 移到哪，S′ 就对称地跟到哪。」且 performance resource 含 `c4s3-m2-f1.mp3` status=200 size=23196（真实加载发声）。截图 /tmp/pwtest/m2-f1.png 见字幕条+fab 说话态（均衡器动效）。
- 🔍 探针：同页续置 `showNormal=true` → 字幕切「法线垂直镜面，反射角等于入射角。」+ `c4s3-m2-f2.mp3` 200（255ms），验证连续 free 均接线且 r5 即时打断未回归。
- 5b M3：`#mode-m3` → `MRR.m3.top.state='held'` → 字幕「镜子在你手里，卡槽还空着呢。」+ `c4s3-m3-f3.mp3` 200 size=19308（257ms）。
- 5c M1：`#mode-m1` → `MRR.objLit=true`（1.5s 使 G.everLit 置真）→ `false` → 字幕「蜡烛灭了，像也跟着消失了。」+ `c4s3-m1-f3.mp3` 200 size=19020（257ms）。
- 🔍 探针：页面内 HEAD 全部 13 条 f-mp3 → 全 200，无 404。
- 5d vB 全程 console/pageerror = 0。

### 6. 回归 vA/vC/vD
三页各加载 1.4s：console/pageerror 均 0；截图确认专属 UI 在位——vA「A·任务链」徽标+头像气泡、vC「C·分步引导」徽标+「第 1/8 步」工具栏+聚光灯挖洞+聚焦气泡、vD「D·字幕解说」徽标+底部字幕条；模式按钮与 C4S3_SCRIPT 均在。

### 7. 汇总
playwright 断言 9/9 PASS（5a/5b/5c/5d + 2 探针 + 3 回归页）。

## 结论
13 条自由解说配音全部接通：字幕与语音同源同发，三处同名对账（设计书/audios 映射/mp3 文件名）一致，vB 及 vA/vC/vD 回归无报错。未 commit、未 push。
