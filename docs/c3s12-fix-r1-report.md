# c3s1 + c3s2 验收修复单 R1 报告

## 修复项1：空格分节写法与转录原文一致

### c3s1

- `content/physics_g8_v1_c3_s1/summary.html:61`
  - 前：`37℃ 读作"37 摄氏度"；-53℃ 读作"负 53 摄氏度"或"零下 53 摄氏度"`
  - 后：`37℃ 读作"37摄氏度"；-53℃ 读作"负53摄氏度"或"零下53摄氏度"`
- `content/physics_g8_v1_c3_s1/summary.html:62`
  - 前：`37℃ 左右`
  - 后：`37℃左右`
- `content/physics_g8_v1_c3_s1/summary.html:92`
  - 前：`<span class="v">37℃ 左右</span>`
  - 后：`<span class="v">37℃左右</span>`
- `content/physics_g8_v1_c3_s1/explain.html:83`
  - 前：`37℃ 左右（口腔温度），读作"37 摄氏度"`
  - 后：`37℃左右（口腔温度），读作"37摄氏度"`
- `content/physics_g8_v1_c3_s1/explain.html:84`
  - 前：`读作"负 53 摄氏度"或"零下 53 摄氏度"`
  - 后：`读作"负53摄氏度"或"零下53摄氏度"`

### c3s2

- `content/physics_g8_v1_c3_s2/summary.html:67`
  - 前：`40 ℃左右`
  - 后：`40℃左右`
- `content/physics_g8_v1_c3_s2/summary.html:109`
  - 前：`<span class="v">40 ℃左右</span>`
  - 后：`<span class="v">40℃左右</span>`
- `content/physics_g8_v1_c3_s2/explain.html:55`
  - 前：`温度保持在0 ℃`
  - 后：`温度保持在0℃`
- `content/physics_g8_v1_c3_s2/explain.html:63`
  - 前：`当温度计的示数升至<b>40 ℃左右</b>时`
  - 后：`当温度计的示数升至<b>40℃左右</b>时`
- `content/physics_g8_v1_c3_s2/explain.html:91`
  - 前：`内蒙古自治区东北部气温曾经达到-58 ℃`
  - 后：`内蒙古自治区东北部气温曾经达到-58℃`

## 修复项2：c3s2 Tab4「吸热与放热」想一想答案删非教材实例

- `content/physics_g8_v1_c3_s2/explain.html:99`
  - 前：`<div>熔化吸热：冰袋降温、吃雪糕解热、舞台上干冰升华吸热（补充）。凝固放热：冬天果园里喷水防冻、冬天池塘结冰保护水下生物、铸造工件时金属液凝固放热。</div>`
  - 后：保留教材实例（饮料加冰、菜窖放水）并补充机制解释，删除冰袋降温、干冰升华等非本节补充实例。

## grep 验证

```text
c3s1 positive (summary.html:61,62,92; explain.html:83,84) 命中
c3s1 negative "37℃ 左右\|37 摄氏\|负 53\|零下 53" 零命中
c3s2 positive (summary.html:67,109; explain.html:63) 命中
c3s2 negative "40 " 零命中
c3s2 千位空格 "3 410 ℃ / 1 538 " 保留正确
```

仅修改 4 个文件指定内容，未动 app.js、docs 转录/分析源文件及其他节目录。
