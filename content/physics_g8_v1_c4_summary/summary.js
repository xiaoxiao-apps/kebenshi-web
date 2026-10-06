/* ===== 本章小结数据（第四章 光现象） =====
 * 结构：SUMMARIES 数组，每项含 section 字段；页面由数组渲染。
 * 块类型：lines=段落（数组，支持 <b> 加粗）、list=有序/无序列表（{ordered,items}）、table={head,rows}。
 * 第3、4节完成后在文件末尾【追加位】直接 push。
 * 内容依据：docs/c4s12-transcript.md、docs/c4s12-textbook-analysis.md（数字事实逐字对照）。
 */
const SUMMARIES = [
  {
    section: '第1节 光的直线传播',
    chip: '教材 P88~P92',
    blocks: [
      {
        title: '光源',
        lines: [
          '<b>能发光的物体</b>叫作<b>光源</b>。太阳以及我们看到的绝大多数星星是恒星，宇宙中的恒星都能发光；有的动物（夏天的萤火虫，大海深处的水母、灯笼鱼、斧头鱼）也能发光。',
          '现代社会中有很多人造光源，如发光二极管（LED）灯。'
        ]
      },
      {
        title: '光的直线传播',
        lines: [
          '在有薄雾的天气，可以看到透过树丛的光束是直的；汽车前灯射出、电影放映机射向银幕的光束也是直的——这说明<b>光在空气中是沿直线传播的</b>。',
          '演示表明，光在水、玻璃中也是沿直线传播的。空气、水和玻璃等透明物质可以作为光传播的<b>介质</b>，<b>光在同种均匀介质中沿直线传播</b>。'
        ]
      },
      {
        title: '光线与激光准直',
        lines: [
          '为了表示光的传播情况，通常用一条<b>带有箭头的直线</b>表示光传播的径迹和方向，这样的直线叫作<b>光线（light ray）</b>。',
          '由于光沿直线传播，开凿隧道时工人们可以用<b>激光束引导掘进机</b>沿直线前进，保证隧道方向不出偏差。'
        ]
      },
      {
        title: '小孔成像',
        lines: [
          '在一个空罐底部中央打一个小孔，口上蒙一块半透明的塑料薄膜，将小孔对着烛焰，可在薄膜上看到烛焰的像——这是<b>小孔成像</b>。',
          '从烛焰不同位置发出的光穿过小孔后沿<b>直线</b>传播，在薄膜上成<b>倒立</b>的像；改变烛焰到小孔的距离，像的大小随之变化。'
        ]
      },
      {
        title: '光的传播速度',
        lines: [
          '打雷和闪电在远处同时同地发生，但我们总是<b>先看见闪电、后听到雷声</b>，这表明<b>光比声音传播得快</b>。',
          '与声音不同，光不仅可以在空气、水等物质中传播，而且可以在<b>真空</b>中传播。真空中的光速用字母 <b>c</b> 表示，<b>c = 299 792 458 m/s</b>。',
          '在通常情况下，真空中的光速可以近似取 <b>c = 3×10⁸ m/s = 3×10⁵ km/s</b>；光在空气中的速度非常接近 c，在水中约为 <b>3/4 c</b>，在玻璃中约为 <b>2/3 c</b>。'
        ]
      },
      {
        title: '科学世界：我们看到了古老的光',
        lines: [
          '天文学家使用一个非常大的距离单位——<b>光年</b>，它等于光在真空中传播 1 年所经过的距离。',
          '牛郎星和织女星的距离是 <b>16光年</b>；离太阳系最近的恒星——半人马座的比邻星，距我们 <b>4.2光年</b>，我们现在看到的是它 4 年前发出的光。',
          '太阳发出的光，大约要经过 <b>8 min</b> 才能到达地球。'
        ]
      }
    ]
  },  {
    section: '第2节 光的反射',
    chip: '教材 P93~P97',
    blocks: [
      {
        title: '光的反射',
        lines: [
          '光遇到桌面、水面以及其他许多物体的表面都会发生<b>反射（reflection）</b>。我们能够看见不发光的物体，就是因为物体反射的光进入了我们的眼睛。'
        ]
      },
      {
        title: '法线 · 入射角 · 反射角',
        lines: [
          '经过入射点 O 并垂直于反射面的直线 <b>ON</b> 叫作<b>法线</b>；入射光线与法线的夹角 <b>i</b> 叫作<b>入射角</b>；反射光线与法线的夹角 <b>r</b> 叫作<b>反射角</b>。'
        ]
      },
      {
        title: '光的反射定律',
        lines: [
          '在反射现象中，<b>反射光线、入射光线和法线都在同一平面内</b>；',
          '<b>反射光线、入射光线分别位于法线两侧</b>；',
          '<b>反射角等于入射角</b>——这就是光的反射定律（law of reflection）。'
        ],
        list: {
          ordered: false,
          items: [
            '实验：平面镜上竖直立一块显示光路的纸板 ENF，纸上直线 ON 垂直于镜面；将纸板 NOF 向前折或向后折，就看不到反射光——说明三线共面。'
          ]
        }
      },
      {
        title: '光路的可逆性',
        lines: [
          '如果让光逆着反射光的方向射到镜面，它被反射后就会逆着原来的入射光方向射出——在反射现象中，<b>光路可逆</b>。',
          '如果你在一块平面镜中看到一位同学的眼睛，那么这位同学也一定会通过这面镜子看到你的眼睛。'
        ]
      },
      {
        title: '镜面反射和漫反射',
        lines: [
          '镜面很平整、光滑，一束平行光照射到镜面上后会被<b>平行</b>地反射，这种反射叫作<b>镜面反射（mirror reflection）</b>，迎着反射光方向看很刺眼，其他方向看不到。',
          '凹凸不平的表面会把一束平行光向着<b>四面八方</b>反射，这种反射叫作<b>漫反射（diffuse reflection）</b>；正是由于漫反射，我们才能从不同方向看到书本等物体。',
          '城市里玻璃幕墙、磨光大理石在强光下发生镜面反射，造成炫目的<b>光污染</b>。'
        ]
      }
    ]
  }
  // =====【追加位】第3节 第4节 完成后在此追加 =====
];

/* ===== 渲染：SUMMARIES 数组 → 页面 ===== */
function renderBlock(b){
  let inner = '';
  if (b.lines && b.lines.length){
    inner += b.lines.map(l => `<p>${l}</p>`).join('');
  }
  if (b.list){
    const tag = b.list.ordered ? 'ol' : 'ul';
    inner += `<${tag}>` + b.list.items.map(it => `<li>${it}</li>`).join('') + `</${tag}>`;
  }
  if (b.table){
    inner += '<table class="tbl"><tr>' + b.table.head.map(h => `<th>${h}</th>`).join('') + '</tr>'
      + b.table.rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('')
      + '</table>';
  }
  return `<div class="kb"><h3>${b.title}</h3>${inner}</div>`;
}
function renderSummary(){
  const root = document.getElementById('summaryRoot');
  if (!root) return;
  root.innerHTML = SUMMARIES.map(sec =>
    `<section class="sec">`
    + `<div class="sec-head"><h2>${sec.section}</h2><span class="chip">${sec.chip}</span></div>`
    + sec.blocks.map(renderBlock).join('')
    + '</section>'
  ).join('');
}
document.addEventListener('DOMContentLoaded', renderSummary);
