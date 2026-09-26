/* ===== 本章小结数据（第三章 物态变化） =====
 * 结构：SUMMARIES 数组，每项含 section 字段；页面由数组渲染。
 * 块类型：lines=段落（数组，支持 <b> 加粗）、list=有序/无序列表（{ordered,items}）、
 *         table={head,rows}=表格、figure='celsius'|'curves'=程序化 SVG 小图示。
 * 第3、4、5节完成后在文件末尾【追加位】直接 push。
 * 内容依据：docs/c3s1-transcript.md（P58~P63）、docs/c3s2-transcript.md（P64~P69）。
 */
const SUMMARIES = [
  {
    section: '第1节 温度',
    chip: '教材 P58~P63',
    blocks: [
      {
        title: '温度的概念',
        lines: [
          '物理学中通常用<b>温度（temperature）</b>来表示物体的冷热程度：热的物体温度高，冷的物体温度低。',
          '把两只手分别放入热水和冷水中，过一会儿再同时放入温水中，两只手对同一杯"温水"的冷热感觉并不相同——这说明<b>仅凭感觉准确判断物体的冷热程度是不行的</b>，要准确地判断温度的高低，需要用测量温度的工具——温度计。'
        ]
      },
      {
        title: '摄氏温度',
        lines: [
          '温度计上的符号 <b>℃</b> 表示摄氏温度。摄氏温度的规定：把<b>标准大气压下冰水混合物的温度定为 0 摄氏度</b>（0℃），<b>沸水的温度定为 100 摄氏度</b>（100℃）；将 0℃ 和 100℃ 之间分成 <b>100 个等份</b>，每个等份代表 1℃。',
          '人的正常体温是 <b>37℃</b> 左右（口腔温度），读作"37摄氏度"；黑龙江漠河 2023 年 1 月的最低气温是 <b>-53℃</b>，读作"负53摄氏度"或"零下53摄氏度"。',
          '温度范围很广：氢弹爆炸中心的温度超过 <b>10<sup>7</sup>℃</b>；太阳表面的温度约为 <b>6 000℃</b>；用作深度制冷剂的液氮温度可低于 <b>-196℃</b>（不能用手直接接触液氮，必须戴专门的防冻手套）。'
        ],
        figure: 'celsius'
      },
      {
        title: '温度计',
        lines: [
          '<b>原理</b>：家庭和实验室里常用的液体温度计是根据<b>液体热胀冷缩</b>的规律制成的，里面的液体有的用酒精（乙醇），有的用煤油。',
          '<b>常见种类</b>（图3.1-3）：甲为实验室用温度计，乙为寒暑表，丙为电子数显温度表。',
          '<b>使用前要看清</b>：①<b>量程</b>——所能测量的范围，待测温度过高或过低超出量程时，要换用一支量程合适的温度计；②<b>分度值</b>——一个小格代表的值，以保证读数正确。'
        ]
      },
      {
        title: '实验室温度计的使用要点',
        list: {
          ordered: true,
          items: [
            '温度计的玻璃泡应该<b>全部浸入</b>被测的液体中，<b>不要碰到容器底或容器壁</b>。',
            '玻璃泡浸入被测液体后要<b>稍微等一会儿</b>，待温度计的<b>示数稳定后</b>再读数。',
            '读数时玻璃泡要<b>继续留在液体中</b>，视线要与温度计中<b>液面相平</b>。'
          ]
        }
      },
      {
        title: '体温计与各种各样的温度计（科学世界）',
        lines: [
          '<b>体温计的缩口</b>：玻璃泡上方有一段很细的缩口（图3.1-5）。测体温时玻璃泡内的水银受热膨胀，通过狭窄的通道上升；体温计离开人体后，水银遇冷收缩，在狭窄的通道处断开，已升上去的水银不能再回到玻璃泡里——所以体温计<b>可以离开人体读数</b>，显示的是人体的温度。要使水银下降，可以<b>把体温计甩一甩</b>；其他温度计不允许甩。',
          '根据人体温度的变化情况，新型体温计的刻度范围通常为 <b>35~42℃</b>。',
          '<b>电子体温计</b>（20世纪70年代出现）：通过液晶直接显示体温。<b>红外测温枪</b>：非接触式测温，对准被测对象即可在显示屏上直接显示温度，应用广泛（如炼铁时温度高于 1 000℃ 的场合）。<b>热电偶温度计</b>：两种不同金属做成的闭合电路中只有一个接点被加热时环路里会产生电流，据此可测量上千摄氏度甚至上万摄氏度的高温。'
        ]
      }
    ]
  },
  {
    section: '第2节 熔化和凝固',
    chip: '教材 P64~P69',
    blocks: [
      {
        title: '物态变化',
        lines: [
          '<b>固态、液态和气态</b>是物质常见的三种状态。随着温度的变化，物质会在固、液、气三种状态之间变化：冰受热变成水，水再变成看不见的水蒸气；通常呈固态的铝、铜、铁等金属在温度很高时也会变成液态、气态；通常呈气态的氧气、氮气、氢气等在温度很低时也会变成液态、固态。',
          '<b>物质各种状态间的变化叫作物态变化。</b>'
        ]
      },
      {
        title: '熔化和凝固',
        lines: [
          '物质从<b>固态变成液态</b>的过程叫作<b>熔化（melting）</b>；从<b>液态变成固态</b>的过程叫作<b>凝固（solidification）</b>。',
          '冰块在室温下熔化时，尽管冰在逐渐熔化成水，碗里的温度（冰水混合）却并不升高——熔化时温度是否变化，正是下面实验要探究的问题。'
        ]
      },
      {
        title: '演示：研究固体熔化时温度的变化规律',
        lines: [
          '装置（图3.2-2）：铁架台上固定试管，试管内装海波（硫代硫酸钠）并插入温度计，再把试管放入盛水的烧杯中，用酒精灯加热（<b>水浴法</b>）。温度计示数升至 40℃ 左右开始计时，每隔 1 min 记录一次数据；将海波换为石蜡重复实验。',
          '<b>实验结论</b>：海波熔化前温度不断升高，<b>熔化时温度保持不变</b>；石蜡在熔化过程中<b>温度不断升高</b>。用图像法处理数据（描点后用平滑曲线连接）：晶体的熔化图像有一段<b>水平平台</b>，非晶体没有平台、持续上升。'
        ],
        figure: 'curves'
      },
      {
        title: '晶体与非晶体 · 熔点和凝固点',
        lines: [
          '<b>晶体</b>：有些固体熔化时尽管被不断加热，温度却保持不变，有固定的熔化温度。<b>晶体熔化时的温度叫作熔点（melting point）</b>。',
          '<b>非晶体</b>（amorphous matter）：熔化时只要不断吸热温度就不断上升，<b>没有固定的熔化温度</b>，例如石蜡、松香、玻璃、沥青。',
          '液体凝固形成晶体时也有固定的凝固温度，这个温度叫作<b>凝固点（solidifying point）</b>。<b>同一种物质的凝固点和它的熔点相同。</b>液体凝固形成非晶体时没有固定的凝固温度。'
        ]
      },
      {
        title: '小资料：一些晶体的熔点（标准大气压，表 3.2-1）',
        table: {
          head: ['晶体', '熔点/℃', '晶体', '熔点/℃'],
          rows: [
            ['钨', '3 410', '萘', '80.5'],
            ['铁', '1 538', '固态水银', '-39'],
            ['铜', '1 083', '固态酒精', '-117'],
            ['金', '1 064', '固态氮', '-210'],
            ['铝', '660', '固态氧', '-218'],
            ['铅', '328', '固态氢', '-259'],
            ['锡', '232', '固态碘', '114']
          ]
        },
        lines: [
          '想想议议②：内蒙古东北部气温曾达 <b>-58℃</b>，低于水银的凝固点 -39℃（水银已凝固），高于酒精的凝固点 -117℃（酒精仍是液体）——这时应使用<b>酒精温度计</b>。'
        ]
      },
      {
        title: '熔化吸热 · 凝固放热 · 生活应用',
        lines: [
          '晶体熔化时虽然温度不变，但必须对它<b>继续加热</b>熔化才能完成——晶体熔化时<b>吸热</b>；液体凝固成晶体时<b>放热</b>，温度不变。非晶体在熔化或凝固过程中也吸热或放热，但温度改变。',
          '<b>生活应用</b>：①夏天在饮料中加冰块而不是直接加冷水——冰在熔化成水的过程中吸热，能使饮料温度下降得更多，且冰块本身温度更低；②北方冬天在菜窖里放几桶水——利用水凝固成冰时放出的热，使菜窖内的温度不会太低；③钢水浇铸成工件（图3.2-1）——钢水凝固放热。'
        ]
      }
    ]
  },
  // =====【追加位】第3/4/5节：完成后在上方逗号后直接新增节对象 {section:'第3节 汽化和液化', chip:'教材 P70~…', blocks:[…]}，页面自动渲染 =====
];

/* ===== 程序化小图示（无判分，纯示意；细节以教材印刷为准） ===== */
function svgCelsius(){
  let ticks = '';
  for (let i = 0; i <= 10; i++){
    const x = 50 + i * 34;
    ticks += `<line x1="${x}" y1="52" x2="${x}" y2="${i % 5 === 0 ? 68 : 62}" stroke="#5ad7ff" stroke-width="${i % 5 === 0 ? 2 : 1}" opacity="${i % 5 === 0 ? 1 : .55}"/>`;
  }
  return `<svg viewBox="0 0 440 128" role="img" aria-label="摄氏温度规定示意图">
    <line x1="50" y1="60" x2="390" y2="60" stroke="#5ad7ff" stroke-width="2"/>
    ${ticks}
    <text x="50" y="88" fill="#ffd479" font-size="13" text-anchor="middle" font-weight="700">0℃</text>
    <text x="390" y="88" fill="#ffd479" font-size="13" text-anchor="middle" font-weight="700">100℃</text>
    <text x="50" y="108" fill="#9aa4b5" font-size="11" text-anchor="middle">冰水混合物</text>
    <text x="390" y="108" fill="#9aa4b5" font-size="11" text-anchor="middle">沸水</text>
    <text x="220" y="108" fill="#9aa4b5" font-size="11" text-anchor="middle">（标准大气压）</text>
    <text x="220" y="40" fill="#d7dee9" font-size="12" text-anchor="middle">0℃~100℃ 分成 100 个等份 · 每份代表 1℃</text>
    <line x1="50" y1="24" x2="390" y2="24" stroke="rgba(255,255,255,.25)" stroke-width="1" stroke-dasharray="4 3"/>
    <line x1="50" y1="19" x2="50" y2="29" stroke="rgba(255,255,255,.25)"/>
    <line x1="390" y1="19" x2="390" y2="29" stroke="rgba(255,255,255,.25)"/>
  </svg>`;
}
function svgCurves(){
  const axis = `<line x1="30" y1="10" x2="30" y2="118" stroke="#6b7686" stroke-width="1.5"/>
    <line x1="30" y1="118" x2="196" y2="118" stroke="#6b7686" stroke-width="1.5"/>
    <text x="14" y="18" fill="#9aa4b5" font-size="10">温度/℃</text>
    <text x="198" y="132" fill="#9aa4b5" font-size="10" text-anchor="end">时间/min</text>`;
  return `<svg viewBox="0 0 460 160" role="img" aria-label="晶体与非晶体熔化图像">
    <g transform="translate(10,8)">
      ${axis}
      <path d="M 34,110 L 70,74 L 130,74 L 186,30" fill="none" stroke="#ffd479" stroke-width="2.5"/>
      <line x1="70" y1="74" x2="130" y2="74" stroke="#5ad7ff" stroke-width="1" stroke-dasharray="3 3"/>
      <line x1="30" y1="74" x2="70" y2="74" stroke="#5ad7ff" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="44" y="70" fill="#5ad7ff" font-size="10">熔点</text>
      <text x="100" y="66" fill="#5ad7ff" font-size="10" text-anchor="middle">平台（固液共存）</text>
      <text x="112" y="150" fill="#d7dee9" font-size="11" text-anchor="middle" font-weight="700">甲 晶体（如海波）：熔化时温度不变</text>
    </g>
    <g transform="translate(240,8)">
      ${axis}
      <path d="M 34,110 C 80,102 130,72 186,30" fill="none" stroke="#ffd479" stroke-width="2.5"/>
      <text x="112" y="150" fill="#d7dee9" font-size="11" text-anchor="middle" font-weight="700">乙 非晶体（如石蜡）：温度持续上升</text>
    </g>
  </svg>`;
}
const FIGURES = { celsius: svgCelsius, curves: svgCurves };

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
  if (b.figure && FIGURES[b.figure]){
    const cap = b.figure === 'celsius'
      ? '摄氏温度的规定（依据教材 P59，示意图）'
      : '晶体（甲）与非晶体（乙）的熔化图像（依据教材图 3.2-5，示意图）';
    inner += `<div class="fig"><div class="figbox">${FIGURES[b.figure]()}`
      + `<div class="figcap">${cap}</div></div></div>`;
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
