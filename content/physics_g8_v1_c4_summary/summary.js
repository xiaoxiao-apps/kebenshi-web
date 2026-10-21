/* ===== 本章小结数据（第四章 光现象） =====
 * 结构：SUMMARIES 数组，每项含 section 字段；页面由数组渲染。
 * 块类型：lines=段落（数组，支持 <b> 加粗）、list=有序/无序列表（{ordered,items}）、table={head,rows}。
 * 第3、4节完成后在文件末尾【追加位】直接 push。
 * 内容依据：docs/c4s12-transcript.md、docs/c4s12-textbook-analysis.md（数字事实逐字对照）。
 */
const SUMMARIES = [
  {
    section: '第1节 光的直线传播',
    chip: '光源 · 小孔成像 · 光速',   // 原页码范围 P88~P92（仅入注释，P6 新规）
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
    chip: '反射定律 · 可逆性 · 镜面与漫反射',   // 原页码范围 P93~P97（仅入注释，P6 新规）
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
  ,{
    section: '第4节 光的折射',
    chip: '折射规律 · 池水变浅',   // 原页码范围 P103~P106（仅入注释，P6 新规）
    blocks: [
      {
        title: '光的折射',
        lines: [
          '光从一种介质斜射入另一种介质时，传播方向发生了偏折，这种现象叫作<b>光的折射（refraction）</b>。',
          '如图，以经过入射点 <b>O</b> 并垂直于水面的直线 <b>ON</b> 作为<b>法线</b>；入射光线与法线的夹角 <b>i</b> 叫作<b>入射角</b>，折射光线与法线的夹角 <b>r</b> 叫作<b>折射角</b>。',
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" style="width:100%;max-width:360px;display:block;margin:10px auto;background:#10131a;border-radius:8px"><defs><marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#e0342b"/></marker></defs><rect x="0" y="120" width="360" height="100" fill="#0d3b5c" opacity=".45"/><line x1="0" y1="120" x2="360" y2="120" stroke="#38bdf8" stroke-width="2"/><text x="20" y="40" fill="#5ad7ff" font-size="13" font-weight="600">空气</text><text x="20" y="170" fill="#38bdf8" font-size="13" font-weight="600">水</text><line x1="180" y1="45" x2="180" y2="195" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5,4"/><text x="192" y="52" fill="#94a3b8" font-size="12">N</text><line x1="80" y1="45" x2="180" y2="120" stroke="#e0342b" stroke-width="2.5" marker-end="url(#ar)"/><path d="M180,120 A28,28 0 0,1 168,92" fill="none" stroke="#2563eb" stroke-width="2"/><text x="155" y="88" fill="#ffd479" font-size="13" font-weight="700">i</text><line x1="180" y1="120" x2="250" y2="185" stroke="#e0342b" stroke-width="2.5" marker-end="url(#ar)"/><path d="M180,120 A30,30 0 0,0 195,150" fill="none" stroke="#0ea5e9" stroke-width="2"/><text x="200" y="158" fill="#ffd479" font-size="13" font-weight="700">r</text><circle cx="180" cy="120" r="3.5" fill="#f2f5fa"/><text x="192" y="132" fill="#f2f5fa" font-size="12">O</text></svg>'
        ]
      },
      {
        title: '折射规律速查',
        table: {
          head: ['情形', '规律'],
          rows: [
            ['光从空气斜射入水或玻璃', '折射光线向法线偏折，<b>r < i</b>'],
            ['入射角增大', '折射角也随之增大'],
            ['光从空气垂直射入水或玻璃', '传播方向不变'],
            ['让光逆着折射光方向射入', '折射光逆着原来入射光方向射出——<b>光路可逆</b>']
          ]
        }
      },
      {
        title: '硬币重现',
        lines: [
          '空碗中的硬币反射的光被碗壁挡住，眼睛就看不见它了。往碗中倒水后，硬币反射的光从水中斜射向空气时发生折射，<b>偏离法线</b>后进入眼睛。',
          '逆着折射光看去，会觉得光好像是从硬币的<b>上方</b>发出的——那就是硬币的虚像，所以硬币又“出现”了。',
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" style="width:100%;max-width:360px;display:block;margin:10px auto;background:#10131a;border-radius:8px"><defs><marker id="ar2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#e0342b"/></marker></defs><path d="M60,180 Q180,130 300,180 L300,185 L60,185 Z" fill="#1e293b" stroke="#475569" stroke-width="2"/><text x="30" y="95" fill="#5ad7ff" font-size="13" font-weight="600">空气</text><text x="30" y="165" fill="#38bdf8" font-size="13" font-weight="600">水</text><line x1="0" y1="110" x2="360" y2="110" stroke="#38bdf8" stroke-width="2"/><circle cx="170" cy="175" r="10" fill="#fbbf24"/><text x="158" y="198" fill="#94a3b8" font-size="12">硬币</text><line x1="170" y1="175" x2="230" y2="110" stroke="#e0342b" stroke-width="2.5" marker-end="url(#ar2)"/><line x1="230" y1="110" x2="285" y2="70" stroke="#e0342b" stroke-width="2.5" marker-end="url(#ar2)"/><path d="M230,110 L170,70" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5,4"/><ellipse cx="170" cy="70" rx="12" ry="8" fill="#fbbf24" opacity=".35"/><text x="152" y="62" fill="#94a3b8" font-size="12">虚像</text><text x="288" y="70" fill="#f2f5fa" font-size="13" font-weight="600">眼</text></svg>'
        ]
      },
      {
        title: '池水变浅',
        lines: [
          '池底某点反射的光从水中斜射向空气时发生偏折，逆着折射光看去，这点的位置看起来<b>升高了</b>，所以池水看起来比实际浅。',
          '竖直观察时，视深度大约是实际深度的 <b>3/4</b>（即 h′ ≈ H/1.333）。',
          '<b class="note">安全教育</b>：看起来不过齐腰深的池水，不会游泳的人千万不要贸然下去，因为它的实际深度会超过你看到的深度。',
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" style="width:100%;max-width:360px;display:block;margin:10px auto;background:#10131a;border-radius:8px"><defs><marker id="ar3" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#e0342b"/></marker></defs><rect x="40" y="110" width="280" height="110" fill="#0d3b5c" opacity=".35"/><line x1="40" y1="110" x2="320" y2="110" stroke="#38bdf8" stroke-width="2"/><text x="45" y="40" fill="#5ad7ff" font-size="13" font-weight="600">空气</text><text x="45" y="170" fill="#38bdf8" font-size="13" font-weight="600">水</text><circle cx="180" cy="185" r="6" fill="#f2f5fa"/><text x="190" y="190" fill="#f2f5fa" font-size="12">A</text><line x1="180" y1="185" x2="250" y2="110" stroke="#e0342b" stroke-width="2.5" marker-end="url(#ar3)"/><line x1="250" y1="110" x2="300" y2="70" stroke="#e0342b" stroke-width="2.5" marker-end="url(#ar3)"/><path d="M250,110 L180,60" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5,4"/><ellipse cx="180" cy="60" rx="8" ry="5" fill="#f2f5fa" opacity=".35"/><text x="190" y="58" fill="#94a3b8" font-size="12">A′</text><text x="303" y="72" fill="#f2f5fa" font-size="13" font-weight="600">眼</text></svg>'
        ]
      },
      {
        title: '叉鱼',
        lines: [
          '鱼儿在水中，它反射的光从水中斜射向空气时发生偏折后进入眼睛。我们逆着折射光看去，看到的是鱼的<b>虚像</b>，位置比真鱼偏<b>高</b>。',
          '有经验的渔民都知道，只有瞄准看到的鱼的<b>下方</b>才能叉到真鱼。',
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" style="width:100%;max-width:360px;display:block;margin:10px auto;background:#10131a;border-radius:8px"><defs><marker id="ar4" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#e0342b"/></marker></defs><rect x="40" y="100" width="280" height="120" fill="#0d3b5c" opacity=".35"/><line x1="40" y1="100" x2="320" y2="100" stroke="#38bdf8" stroke-width="2"/><text x="45" y="40" fill="#5ad7ff" font-size="13" font-weight="600">空气</text><text x="45" y="175" fill="#38bdf8" font-size="13" font-weight="600">水</text><g><ellipse cx="190" cy="165" rx="22" ry="11" fill="#fb923c"/><circle cx="205" cy="162" r="2.5" fill="#1f2937"/><path d="M168,165 L155,158 M168,165 L155,172" stroke="#fb923c" stroke-width="3" stroke-linecap="round"/></g><g opacity=".35"><ellipse cx="190" cy="115" rx="22" ry="11" fill="#fb923c"/><circle cx="205" cy="112" r="2.5" fill="#1f2937"/><path d="M168,115 L155,108 M168,115 L155,122" stroke="#fb923c" stroke-width="3" stroke-linecap="round"/></g><text x="160" y="90" fill="#94a3b8" font-size="12">虚像</text><text x="160" y="190" fill="#f2f5fa" font-size="12">真鱼</text><line x1="50" y1="50" x2="190" y2="165" stroke="#e0342b" stroke-width="2.5" stroke-dasharray="4,3" marker-end="url(#ar4)"/><text x="55" y="45" fill="#ffd479" font-size="12" font-weight="700">鱼叉</text></svg>'
        ]
      },
      {
        title: '海市蜃楼',
        lines: [
          '光在同种均匀介质中沿直线传播；如果介质<b>疏密不均</b>，光会发生折射。海市蜃楼就是由此产生的自然现象。',
          '夏天海面附近，底层空气比上层凉而<b>密</b>，上层空气比底层热而<b>疏</b>。来自地平线以下远处物体的光，在不同高度空气中逐渐弯向地面，进入观察者眼中；观察者逆着光望去，就看见了远处物体的<b>虚像</b>。',
          '我国古书《史记》《梦溪笔谈》中都有关于海市蜃楼的记载，苏轼在《登州海市》中也描述过这一奇观。',
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" style="width:100%;max-width:360px;display:block;margin:10px auto;background:#10131a;border-radius:8px"><defs><marker id="ar5" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#e0342b"/></marker></defs><path d="M0,160 Q90,150 180,155 T360,160 L360,220 L0,220 Z" fill="#0d3b5c" opacity=".45"/><path d="M0,160 Q90,150 180,155 T360,160" stroke="#38bdf8" stroke-width="2" fill="none"/><text x="20" y="60" fill="#5ad7ff" font-size="13" font-weight="600">上空（疏）</text><text x="20" y="145" fill="#38bdf8" font-size="13" font-weight="600">海面附近（密）</text><path d="M80,120 Q140,135 200,145 T320,160" fill="none" stroke="#e0342b" stroke-width="2.5" marker-end="url(#ar5)"/><path d="M320,90 Q260,95 220,105 T160,120" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5,4"/><text x="325" y="88" fill="#94a3b8" font-size="12">虚像</text><text x="55" y="118" fill="#f2f5fa" font-size="13" font-weight="600">远处物体</text><text x="320" y="178" fill="#f2f5fa" font-size="13" font-weight="600">眼</text></svg>'
        ]
      }
    ]
  }
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
