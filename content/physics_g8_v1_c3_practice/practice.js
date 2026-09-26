/* ===== 本章练习题库（第三章 物态变化） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 第3、4、5节题目完成后在数组末尾【追加位】直接追加新题对象即可，页面自动渲染。
 * 依据：docs/c3s1-transcript.md（P62~63 练习与应用 4 题）、docs/c3s2-transcript.md（P68~69 练习与应用 5 题）。
 */
const QUESTIONS = [
  { id:'c3s1q1', section:'第1节 温度', no:'教材 P62 练习与应用 第1题', points:10,
    stem:'在进行实践活动展示时，两位同学都带来了自制的温度计（如图所示）。他们所用的玻璃小瓶相同，里面都装同样多的水，在小瓶口的橡皮塞中各插进一根吸管。观察这两支自制温度计的构造，你认为哪一支温度计对温度的反应更灵敏？',
    note:'图为程序化简图（对应教材图 3.1-9），原图细节以教材印刷为准。',
    fig:'twoBottles', figCap:'两支自制温度计简图（甲：吸管较粗；乙：吸管较细）',
    parts:[{ kind:'choice',
      opts:['甲（吸管较粗的）更灵敏','乙（吸管较细的）更灵敏','两支一样灵敏'], answer:1,
      analysis:'瓶相同、水量相同，温度变化相同时瓶中水的体积变化量相同；吸管越细，同样的体积变化引起的液柱高度变化越大，现象越明显，反应越灵敏。' }] },

  { id:'c3s1q2', section:'第1节 温度', no:'教材 P62 练习与应用 第2题（重绘简图）', points:10,
    stem:'图中各温度计（温度计单位都是摄氏度）的示数分别是多少？',
    note:'原题配图为教材图 3.1-10（甲实验室温度计、乙寒暑表、丙体温计）；转录未含原图具体示数，本页以程序化简图重绘供读数训练，原题实际示数以教材印刷为准。',
    fig:'thermPair1', figCap:'温度计读数简图（甲、乙分度值均为 2℃）',
    parts:[{ kind:'blank', blanks:[
      { label:'甲温度计示数', answer:['24'], unit:'℃' },
      { label:'乙温度计示数', answer:['-6'], unit:'℃' }],
      analysis:'甲：液柱面在 0℃ 上方第 12 个小格处，示数为 24℃，读作"24摄氏度"；乙：液柱面在 0℃ 下方第 3 个小格处，示数为 -6℃，读作"负6摄氏度"或"零下6摄氏度"。读数关键：先认清分度值（一个小格代表的值），再看液柱面位置，视线与液面相平。' }] },

  { id:'c3s1q3', section:'第1节 温度', no:'教材 P62 练习与应用 第3题', points:10,
    stem:'图 3.1-11 是一种电子体温计，其金属部分是探头。请参考实验室用温度计的使用要点，编写使用电子体温计的注意事项。',
    note:'题干按转录整理（转录原文"其金属部分是水银计的探头"疑有衍字），以教材印刷为准。本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 测量前看清它的量程（新型体温计刻度范围通常为 35~42℃）和显示精度，确认被测温度不超量程；<br>② 让探头与测量部位（口腔、腋下等）充分接触，测量过程中不要拿开，待示数稳定（通常有提示音）后再读数；<br>③ 读数时视线正对液晶显示屏；<br>④ 使用前后将探头擦拭清洁（消毒），轻拿轻放，避免摔碰；用毕关机妥善存放。',
      analysis:'参照实验室用温度计要点迁移：看清量程与分度值 → 玻璃泡（探头）全部浸入（充分接触）被测对象 → 待示数稳定再读数 → 规范读数。' }] },

  { id:'c3s1q4', section:'第1节 温度', no:'教材 P63 练习与应用 第4题', points:10,
    stem:'科学研究表明，无论采用什么方法降温，温度也不可能比 -273.15℃ 更低。以这个温度为零度来规定一种表示温度的方法，每一度的大小与摄氏温度相同（该方法的温度记为 T）。若摄氏温度为 t，则 T 与 t 的换算关系是：T = t + ______。',
    parts:[{ kind:'blank', blanks:[
      { label:'横线处应填', answer:['273.15'], unit:'' }],
      analysis:'-273.15℃ 对应新规定的 0 度，而每一度的大小与摄氏温度相同，即温度差 1℃ 等于新温标 1 度，所以 T = t + 273.15。例如 0℃ 对应 273.15，37℃ 对应 310.15。' }] },

  { id:'c3s2q1', section:'第2节 熔化和凝固', no:'教材 P68 练习与应用 第1题（图 3.2-8）', points:12,
    stem:'用实验探究固体熔化过程温度随时间变化的图像。图 3.2-8 是加热某种物质使其熔化的图像。根据图像的特征可以判断这种物质是不是晶体？它的熔点是多少？从开始熔化到完全熔化，大约持续了多长时间？',
    note:'下图为程序化重绘的熔化图像简图（带水平平台），对应教材图 3.2-8，原图具体数值以教材印刷为准。',
    fig:'meltCurve', figCap:'图 3.2-8 简图：加热某物质使其熔化的 T-t 图像（分度：纵轴每小格 5℃，横轴每小格 1 min）',
    parts:[
      { kind:'choice', q:'① 这种物质是晶体吗？判断依据是？',
        opts:['是晶体——熔化图像有水平平台，熔化时温度保持不变','不是晶体——熔化时温度持续上升','无法判断'], answer:0,
        analysis:'图像中有一段与时间轴平行的水平线段（平台），说明该物质熔化时尽管不断吸热，温度却保持不变，有固定的熔化温度，所以是晶体。' },
      { kind:'blank', q:'② 它的熔点是多少？', blanks:[
        { label:'熔点', answer:['80'], unit:'℃' }],
        analysis:'水平平台对应的温度就是熔点。读图：平台段纵坐标为 80℃，所以熔点为 80℃。' },
      { kind:'blank', q:'③ 从开始熔化到完全熔化，大约持续了多长时间？', blanks:[
        { label:'熔化持续时间', answer:['4'], unit:'min' }],
        analysis:'平台从第 3 min 开始、到第 7 min 结束，熔化过程持续约 7 min - 3 min = 4 min。' } ] },

  { id:'c3s2q2', section:'第2节 熔化和凝固', no:'教材 P69 练习与应用 第2题（图 3.2-9）', points:12,
    stem:'图 3.2-9 甲、乙分别是某物质的熔化和凝固图像。你能从中获得哪些信息？',
    note:'下图为程序化重绘简图（甲：熔化图像带平台；乙：凝固图像带平台，平台温度与甲相同），对应教材图 3.2-9，原图细节以教材印刷为准。本题为开放题，作答后对照参考要点自评计分。',
    fig:'meltFreeze', figCap:'图 3.2-9 简图：甲熔化图像、乙凝固图像（同一物质，平台温度均为 80℃）',
    parts:[{ kind:'open',
      ref:'参考要点（答出主要几条即可得满分）：<br>① 两图都有水平平台，说明该物质是<b>晶体</b>；<br>② 甲是熔化图像：熔化前吸热升温，达到熔点后继续吸热但温度不变（固液共存），全部熔化后温度再升高；<br>③ 乙是凝固图像：凝固前放热降温，达到凝固点后继续放热但温度不变，全部凝固后温度再降低；<br>④ 两图平台温度相同（80℃），说明<b>同一种物质的凝固点和它的熔点相同</b>；<br>⑤ 熔化过程吸热、凝固过程放热。',
      analysis:'读熔化/凝固图像三看：一看有无平台（晶体/非晶体），二看平台温度（熔点=凝固点），三看各段吸/放热与状态变化。' }] },

  { id:'c3s2q3', section:'第2节 熔化和凝固', no:'教材 P69 练习与应用 第3题（图 3.2-10）', points:10,
    stem:'图中各温度计（温度计单位都是摄氏度）的示数分别是多少？',
    note:'⚠️ 转录中本题图注（"一种电子体温计：其金属部分是水银计的探头"）与题干文字（温度计读数）可能对应有误，原题插图以教材印刷为准；本页以程序化简图（实验室温度计 + 体温计各一支）供读数训练。',
    fig:'thermPair2', figCap:'温度计读数简图（甲实验室温度计分度值 1℃；乙体温计分度值 0.1℃）',
    parts:[{ kind:'blank', blanks:[
      { label:'甲温度计示数', answer:['38'], unit:'℃' },
      { label:'乙体温计示数', answer:['36.5','36.50'], unit:'℃' }],
      analysis:'甲：分度值 1℃，液柱面在 38 处，示数 38℃；乙：体温计分度值 0.1℃，液柱面在 36℃ 后第 5 小格，示数 36.5℃。体温计有缩口，可以离开人体读数。' }] },

  { id:'c3s2q4', section:'第2节 熔化和凝固', no:'教材 P69 练习与应用 第4题', points:8,
    stem:'日常生活中有哪些利用熔化吸热、凝固放热的例子？',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（教材实例 + 生活常见例）：<br>① 夏天在饮料中加冰块降温——冰熔化吸热，使饮料温度下降得更多；<br>② 北方冬天在菜窖里放几桶水——水凝固成冰时放热，使菜窖内温度不会太低；<br>③ 发烧时额头敷冰袋（或退热贴）降温——冰熔化吸热；<br>④ 冷藏食品运输时用冰块保鲜——冰熔化吸热维持低温；<br>⑤ 钢水浇铸成工件——钢水凝固放热成形。<br>（答出任意 2~3 个合理例子即可得满分）',
      analysis:'判断标准：例子中确实存在熔化（固→液，吸热）或凝固（液→固，放热）过程，且人们利用了这一热效应。' }] },

  { id:'c3s2q5', section:'第2节 熔化和凝固', no:'教材 P69 练习与应用 第5题', points:8,
    stem:'冬天，室外已经结冰。某同学把酒精和水的混合液体放到室外（温度大约为 -5℃），经过相当长一段时间后，从室外取回混合液体时，却发现混合液体没有凝固。就这个现象你能提出什么猜想？根据这个猜想举出一个可能应用的例子。',
    note:'本题为开放题（给参考思路），作答后对照自评计分。',
    parts:[{ kind:'open',
      ref:'参考思路：<br><b>猜想</b>：酒精和水混合后，混合液的凝固点比纯水的凝固点（0℃）低——室外约 -5℃ 高于混合液的凝固点，所以相当长时间后混合液仍不凝固。（依据：表中固态酒精的熔点为 -117℃，酒精很难凝固，掺入水中拉低了整体的凝固点）<br><b>应用例子</b>：冬天在汽车发动机的冷却水箱里加酒精（或用酒精-水混合防冻液），降低冷却液的凝固点，防止低温下冷却液凝固胀坏水箱。<br>（其他合理猜想与应用，只要自洽即可得分）',
      analysis:'本题是"凝固点可变"的拓展思考：同种物质熔点/凝固点固定，但混合物不同——掺入其他物质会改变凝固点（类似冬天撒盐化雪）。' }] },
]; // 闭合 QUESTIONS 数组
// =====【追加位】第3/4/5节：完成后在数组末尾直接 QUESTIONS.push({...})=====

/* ===== 状态与持久化 ===== */
const STORAGE_KEY = 'c3_practice_state_v1';
let STATE = { scores: {}, done: {}, choice: {}, blank: {}, open: {} };

function initState() {
  const defaults = { scores: {}, done: {}, choice: {}, blank: {}, open: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    STATE = Object.assign({}, defaults, saved);
  } catch (e) { STATE = defaults; }
  ['scores', 'done', 'choice', 'blank', 'open'].forEach(k => { if (!STATE[k]) STATE[k] = {}; });
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); } catch (e) {}
}
function findQ(qid) { return QUESTIONS.find(q => q.id === qid); }
function partPoints(q, pi) {
  const n = q.parts && q.parts.length ? q.parts.length : 1;
  return Math.round(q.points / n);
}
function norm(s) {
  return String(s == null ? '' : s).replace(/[＋]/g, '+').replace(/[－]/g, '-').replace(/[。．]/g, '').trim();
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function $1(sel, el) { return (el || document).querySelector(sel); }
function $all(sel, el) { return Array.from((el || document).querySelectorAll(sel)); }

/* ===== 程序化插图 ===== */
const FIGURES = {
  twoBottles: svgTwoBottles,
  thermPair1: svgThermPair1,
  thermPair2: svgThermPair2,
  meltCurve: svgMeltCurve,
  meltFreeze: svgMeltFreeze
};

function svgTwoBottles() {
  const bottle = (cx, label, strokeW) => {
    const bodyW = 60, bodyH = 90, neckW = 16, neckH = 28;
    const left = cx - bodyW / 2, top = 55;
    const path = `M ${left},${top} L ${left},${top + bodyH - bodyW / 2} A ${bodyW / 2},${bodyW / 2} 0 0 0 ${left + bodyW},${top + bodyH - bodyW / 2} L ${left + bodyW},${top} L ${cx + neckW / 2},${top} L ${cx + neckW / 2},${top - neckH} L ${cx - neckW / 2},${top - neckH} L ${cx - neckW / 2},${top} Z`;
    const liqH = 45, liqTop = top + bodyH - liqH - 6;
    const liquid = `M ${left + 4},${liqTop + liqH} L ${left + 4},${liqTop} L ${left + bodyW - 4},${liqTop} L ${left + bodyW - 4},${liqTop + liqH} A ${bodyW / 2 - 4},${bodyW / 2 - 4} 0 0 1 ${left + 4},${liqTop + liqH} Z`;
    return `<g>
      <path d="${path}" fill="none" stroke="#9aa4b5" stroke-width="2"/>
      <path d="${liquid}" fill="rgba(90,215,255,.25)" stroke="#5ad7ff" stroke-width="1.5"/>
      <line x1="${cx}" y1="${top - neckH}" x2="${cx}" y2="12" stroke="#ffd479" stroke-width="${strokeW}" stroke-linecap="round"/>
      <text x="${cx}" y="165" fill="#d7dee9" font-size="13" text-anchor="middle" font-weight="700">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 420 180" role="img" aria-label="两支自制温度计简图">
    ${bottle(110, '甲（吸管较粗）', 5)}
    ${bottle(310, '乙（吸管较细）', 2.5)}
    <text x="210" y="24" fill="#9aa4b5" font-size="12" text-anchor="middle">玻璃小瓶相同、水量相同</text>
  </svg>`;
}

function svgThermometer(cx, label, value, step, min, max, opts) {
  opts = opts || {};
  const topY = 22, bottomY = 150, bulbR = 10;
  const pxPerDeg = (bottomY - topY - bulbR) / (max - min);
  const yFor = v => bottomY - (v - min) * pxPerDeg;
  const zeroY = yFor(0);
  const labelStep = step < 1 ? 1 : (step === 1 ? 5 : 10);
  let ticks = '', labels = '';
  for (let v = min; v <= max + 1e-9; v += step) {
    const y = yFor(v);
    const major = Math.abs(v % labelStep) < step / 2;
    const x2 = cx + (major ? 18 : 11);
    ticks += `<line x1="${cx + 6}" y1="${y}" x2="${x2}" y2="${y}" stroke="#6b7686" stroke-width="${major ? 1.5 : 1}" opacity="${major ? 1 : .6}"/>`;
    if (major) {
      labels += `<text x="${cx + 24}" y="${y + 4}" fill="#9aa4b5" font-size="10">${Math.round(v * 10) / 10}</text>`;
    }
  }
  const valY = yFor(value);
  const fillY = Math.min(zeroY, valY), fillH = Math.abs(valY - zeroY);
  const liquid = value >= 0
    ? `<rect x="${cx - 3}" y="${fillY}" width="6" height="${fillH}" fill="#ff7a6e" opacity=".9"/>`
    : `<rect x="${cx - 3}" y="${zeroY}" width="6" height="${fillH}" fill="#5ad7ff" opacity=".9"/>`;
  const tip = `<text x="${cx}" y="${valY - 8}" fill="#ffd479" font-size="11" text-anchor="middle" font-weight="700">${value}℃</text>`;
  return `<g>
    <line x1="${cx}" y1="${topY}" x2="${cx}" y2="${bottomY}" stroke="#9aa4b5" stroke-width="3" stroke-linecap="round"/>
    <line x1="${cx}" y1="${topY}" x2="${cx}" y2="${bottomY}" stroke="#0b0e13" stroke-width="1"/>
    <circle cx="${cx}" cy="${bottomY + bulbR - 2}" r="${bulbR}" fill="#ff7a6e" opacity=".9"/>
    ${ticks}${labels}${liquid}${tip}
    <text x="${cx}" y="${bottomY + 34}" fill="#d7dee9" font-size="12" text-anchor="middle" font-weight="700">${label}</text>
  </g>`;
}

function svgThermPair1() {
  return `<svg viewBox="0 0 520 240" role="img" aria-label="温度计读数简图：甲24℃，乙-6℃，分度值2℃">
    ${svgThermometer(120, '甲', 24, 2, -10, 40)}
    ${svgThermometer(380, '乙', -6, 2, -10, 40)}
  </svg>`;
}

function svgThermPair2() {
  return `<svg viewBox="0 0 520 240" role="img" aria-label="温度计读数简图：甲38℃，乙36.5℃">
    ${svgThermometer(120, '甲 实验室温度计', 38, 1, 35, 42)}
    ${svgThermometer(380, '乙 体温计', 36.5, 0.1, 35, 42)}
  </svg>`;
}

function svgMeltCurve() {
  const padL = 44, padR = 20, padT = 24, padB = 44;
  const W = 360, H = 220;
  const x0 = padL, x1 = W - padR, y0 = H - padB, y1 = padT;
  const tMax = 10, TMin = 0, TMax = 100;
  const xFor = t => x0 + (t / tMax) * (x1 - x0);
  const yFor = T => y0 - (T / (TMax - TMin)) * (y0 - y1);
  let s = `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="#6b7686" stroke-width="1.5"/>`;
  s += `<line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y0}" stroke="#6b7686" stroke-width="1.5"/>`;
  s += `<text x="${x1}" y="${y0 + 18}" fill="#9aa4b5" font-size="11" text-anchor="end">时间/min</text>`;
  s += `<text x="14" y="${y1 + 8}" fill="#9aa4b5" font-size="11">温度/℃</text>`;
  for (let t = 0; t <= 10; t++) {
    const x = xFor(t);
    s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + 5}" stroke="#6b7686" opacity=".8"/>`;
    if (t % 5 === 0) s += `<text x="${x}" y="${y0 + 18}" fill="#9aa4b5" font-size="10" text-anchor="middle">${t}</text>`;
  }
  for (let T = 0; T <= 100; T += 5) {
    const y = yFor(T);
    s += `<line x1="${x0}" y1="${y}" x2="${x0 - (T % 10 === 0 ? 6 : 3)}" y2="${y}" stroke="#6b7686" opacity="${T % 10 === 0 ? 1 : .5}"/>`;
    if (T % 10 === 0) s += `<text x="${x0 - 10}" y="${y + 4}" fill="#9aa4b5" font-size="10" text-anchor="end">${T}</text>`;
  }
  const p0 = [xFor(0), yFor(30)], p1 = [xFor(3), yFor(80)], p2 = [xFor(7), yFor(80)], p3 = [xFor(10), yFor(95)];
  s += `<polyline points="${p0.join(',')} ${p1.join(',')} ${p2.join(',')} ${p3.join(',')}" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  s += `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="#5ad7ff" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += `<text x="${xFor(5)}" y="${yFor(80) - 10}" fill="#5ad7ff" font-size="11" text-anchor="middle">熔点 80℃（3~7 min）</text>`;
  s += `<circle cx="${p1[0]}" cy="${p1[1]}" r="3" fill="#ffd479"/><circle cx="${p2[0]}" cy="${p2[1]}" r="3" fill="#ffd479"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="熔化曲线简图：80℃水平平台">${s}</svg>`;
}

function svgMeltFreeze() {
  const axis = (x0, y0, x1, y1) => `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="#6b7686" stroke-width="1.5"/><line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y0}" stroke="#6b7686" stroke-width="1.5"/><text x="${x1}" y="${y0 + 16}" fill="#9aa4b5" font-size="10" text-anchor="end">时间/min</text><text x="${x0 - 6}" y="${y1}" fill="#9aa4b5" font-size="10">温度/℃</text>`;
  const tMax = 10, TMax = 100;
  const W = 460, H = 220;
  const padL = 40, padB = 40, top = 24, right = 210;
  const xFor = (t, off) => off + (t / tMax) * (right - padL);
  const yFor = T => H - padB - (T / TMax) * (H - padB - top);
  let s = '';
  const off1 = 10;
  s += axis(off1 + padL, yFor(0), off1 + right, top);
  for (let t = 0; t <= 10; t++) {
    const x = xFor(t, off1 + padL);
    s += `<line x1="${x}" y1="${yFor(0)}" x2="${x}" y2="${yFor(0) + 4}" stroke="#6b7686" opacity=".7"/>`;
    if (t % 5 === 0) s += `<text x="${x}" y="${yFor(0) + 16}" fill="#9aa4b5" font-size="9" text-anchor="middle">${t}</text>`;
  }
  for (let T = 0; T <= 100; T += 10) {
    const y = yFor(T);
    s += `<line x1="${off1 + padL}" y1="${y}" x2="${off1 + padL - 5}" y2="${y}" stroke="#6b7686" opacity=".7"/>`;
    s += `<text x="${off1 + padL - 8}" y="${y + 3}" fill="#9aa4b5" font-size="9" text-anchor="end">${T}</text>`;
  }
  const ptsA = [[0, 30], [3, 80], [7, 80], [10, 95]].map(([t, T]) => `${xFor(t, off1 + padL)},${yFor(T)}`).join(' ');
  s += `<polyline points="${ptsA}" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linejoin="round"/>`;
  s += `<line x1="${xFor(3, off1 + padL)}" y1="${yFor(80)}" x2="${xFor(7, off1 + padL)}" y2="${yFor(80)}" stroke="#5ad7ff" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += `<text x="${xFor(5, off1 + padL)}" y="${yFor(80) - 8}" fill="#5ad7ff" font-size="10" text-anchor="middle">80℃</text>`;
  s += `<text x="${xFor(5, off1 + padL)}" y="${yFor(0) + 30}" fill="#d7dee9" font-size="12" text-anchor="middle" font-weight="700">甲 熔化图像</text>`;
  const off2 = 240;
  s += axis(off2 + padL, yFor(0), off2 + right, top);
  for (let t = 0; t <= 10; t++) {
    const x = xFor(t, off2 + padL);
    s += `<line x1="${x}" y1="${yFor(0)}" x2="${x}" y2="${yFor(0) + 4}" stroke="#6b7686" opacity=".7"/>`;
    if (t % 5 === 0) s += `<text x="${x}" y="${yFor(0) + 16}" fill="#9aa4b5" font-size="9" text-anchor="middle">${t}</text>`;
  }
  for (let T = 0; T <= 100; T += 10) {
    const y = yFor(T);
    s += `<line x1="${off2 + padL}" y1="${y}" x2="${off2 + padL - 5}" y2="${y}" stroke="#6b7686" opacity=".7"/>`;
    s += `<text x="${off2 + padL - 8}" y="${y + 3}" fill="#9aa4b5" font-size="9" text-anchor="end">${T}</text>`;
  }
  const ptsB = [[0, 95], [3, 80], [7, 80], [10, 30]].map(([t, T]) => `${xFor(t, off2 + padL)},${yFor(T)}`).join(' ');
  s += `<polyline points="${ptsB}" fill="none" stroke="#5ad7ff" stroke-width="2.5" stroke-linejoin="round"/>`;
  s += `<line x1="${xFor(3, off2 + padL)}" y1="${yFor(80)}" x2="${xFor(7, off2 + padL)}" y2="${yFor(80)}" stroke="#ffd479" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += `<text x="${xFor(5, off2 + padL)}" y="${yFor(80) - 8}" fill="#ffd479" font-size="10" text-anchor="middle">80℃</text>`;
  s += `<text x="${xFor(5, off2 + padL)}" y="${yFor(0) + 30}" fill="#d7dee9" font-size="12" text-anchor="middle" font-weight="700">乙 凝固图像</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="熔化与凝固双图">${s}</svg>`;
}

/* ===== 渲染引擎 ===== */
function renderFig(fig, figCap) {
  if (!fig || !FIGURES[fig]) return '';
  return `<div class="figbox">${FIGURES[fig]()}<div class="figcap">${esc(figCap || '')}</div></div>`;
}
function renderPart(q, pi) {
  const p = q.parts[pi];
  const key = `${q.id}_${pi}`;
  const head = p.q ? `<div class="pp"><b>${esc(p.q)}</b></div>` : '';
  if (p.kind === 'choice') {
    const opts = p.opts.map((opt, idx) =>
      `<button class="opt" data-qid="${q.id}" data-pi="${pi}" data-idx="${idx}">${['A','B','C','D'][idx]}. ${esc(opt)}</button>`
    ).join('');
    return `<div class="part" data-key="${key}">${head}<div class="opts">${opts}</div><div class="fb" data-role="fb"></div></div>`;
  }
  if (p.kind === 'blank') {
    const rows = p.blanks.map((b, bi) =>
      `<div class="blankrow"><span>${esc(b.label)}：</span><input type="text" class="blank-inp" data-bi="${bi}" data-qid="${q.id}" data-pi="${pi}" placeholder="数值"${b.unit ? ` aria-label="${esc(b.label)}"` : ''}><span>${esc(b.unit || '')}</span></div>`
    ).join('');
    return `<div class="part" data-key="${key}">${head}${rows}<button class="btn blank-check" data-qid="${q.id}" data-pi="${pi}">提交答案</button><div class="fb" data-role="fb"></div></div>`;
  }
  if (p.kind === 'open') {
    return `<div class="part" data-key="${key}">${head}
      <button class="btn ghost ref-toggle" data-qid="${q.id}" data-pi="${pi}">查看参考答案</button>
      <div class="ref">${p.ref}</div>
      <div class="selfrow">
        <button class="btn gold self-score" data-qid="${q.id}" data-pi="${pi}" data-ratio="1">满分</button>
        <button class="btn self-score" data-qid="${q.id}" data-pi="${pi}" data-ratio="0.5">半分</button>
        <button class="btn ghost self-score" data-qid="${q.id}" data-pi="${pi}" data-ratio="0">0分</button>
      </div>
      <div class="fb" data-role="fb"></div>
    </div>`;
  }
  return '';
}
function renderQuestion(q) {
  return `<div class="qcard" id="${q.id}">
    <div class="qno"><b>${esc(q.no)}</b><span>(${q.points}分)</span></div>
    <div class="stem">${esc(q.stem)}</div>
    ${q.note ? `<div class="qnote">${esc(q.note)}</div>` : ''}
    ${renderFig(q.fig, q.figCap)}
    ${q.parts.map((_, pi) => renderPart(q, pi)).join('')}
  </div>`;
}
function renderQuiz() {
  const root = document.getElementById('quizRoot');
  if (!root) return;
  const order = [];
  const groups = {};
  QUESTIONS.forEach(q => {
    if (!groups[q.section]) { groups[q.section] = []; order.push(q.section); }
    groups[q.section].push(q);
  });
  root.innerHTML = order.map(sec =>
    `<section class="sec">`
    + `<div class="sec-head"><h2>${esc(sec)}</h2><span class="chip">${groups[sec].length} 题</span></div>`
    + groups[sec].map(renderQuestion).join('')
    + `</section>`
  ).join('');
  bindEvents();
  restoreUI();
  updateProgress();
}

/* ===== 判分与交互 ===== */
function showFb(el, ok, html) {
  const fb = $1('[data-role="fb"]', el);
  if (!fb) return;
  fb.className = 'fb ' + (ok ? 'ok' : 'err');
  fb.innerHTML = (ok ? '✅ 回答正确' : '❌ 回答错误') + '<div class="an"><b>解析：</b>' + html + '</div>';
}
function setChoiceUI(el, part, chosenIdx) {
  const correctIdx = part.answer;
  $all('.opt', el).forEach(btn => {
    const idx = +btn.dataset.idx;
    btn.disabled = true;
    btn.classList.remove('ok', 'err', 'dim');
    if (idx === correctIdx) btn.classList.add('ok');
    else if (idx === chosenIdx) btn.classList.add('err');
    else btn.classList.add('dim');
  });
  showFb(el, chosenIdx === correctIdx, part.analysis);
}
function setBlankUI(el, part, vals) {
  const inputs = $all('.blank-inp', el);
  let allOk = true;
  inputs.forEach((inp, bi) => {
    inp.value = (vals && vals[bi]) || '';
    const accepted = part.blanks[bi].answer.map(norm);
    const ok = accepted.includes(norm(inp.value));
    inp.classList.toggle('ok', ok);
    inp.classList.toggle('err', !ok);
    inp.readOnly = true;
    if (!ok) allOk = false;
  });
  const btn = $1('.blank-check', el);
  if (btn) btn.disabled = true;
  showFb(el, allOk, part.analysis);
}
function setOpenUI(el, score, full) {
  $1('.ref', el).classList.add('show');
  $1('.selfrow', el).classList.add('show');
  $1('.ref-toggle', el).disabled = true;
  const ratio = full ? score / full : 0;
  $all('.self-score', el).forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('done');
    if (Math.abs(+btn.dataset.ratio - ratio) < 1e-6) btn.classList.add('done');
  });
  const label = score === full ? '满分' : (score === Math.round(full / 2) ? '半分' : '0分');
  showFb(el, score > 0, '已自评：' + label + '。');
}
function restoreUI() {
  Object.keys(STATE.done).forEach(key => {
    if (!STATE.done[key]) return;
    const sep = key.lastIndexOf('_');
    const qid = key.slice(0, sep), pi = +key.slice(sep + 1);
    const q = findQ(qid);
    if (!q) return;
    const part = q.parts[pi];
    const el = $1(`.part[data-key="${key}"]`);
    if (!el) return;
    if (part.kind === 'choice') setChoiceUI(el, part, STATE.choice[key]);
    else if (part.kind === 'blank') setBlankUI(el, part, STATE.blank[key]);
    else if (part.kind === 'open') setOpenUI(el, (STATE.scores[qid] || {})[pi] || 0, partPoints(q, pi));
  });
}

function bindEvents() {
  $all('.opt').forEach(btn => btn.addEventListener('click', onChoiceClick));
  $all('.blank-check').forEach(btn => btn.addEventListener('click', onBlankCheck));
  $all('.ref-toggle').forEach(btn => btn.addEventListener('click', onRefToggle));
  $all('.self-score').forEach(btn => btn.addEventListener('click', onSelfScore));
}
function onChoiceClick(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi, idx = +btn.dataset.idx;
  const q = findQ(qid), part = q.parts[pi];
  const key = `${qid}_${pi}`;
  STATE.choice[key] = idx;
  STATE.done[key] = true;
  STATE.scores[qid] = STATE.scores[qid] || {};
  STATE.scores[qid][pi] = (idx === part.answer) ? partPoints(q, pi) : 0;
  saveState();
  setChoiceUI(btn.closest('.part'), part, idx);
  updateProgress();
}
function onBlankCheck(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi;
  const q = findQ(qid), part = q.parts[pi];
  const el = btn.closest('.part');
  const inputs = $all('.blank-inp', el);
  const vals = [];
  let allOk = true;
  inputs.forEach((inp, bi) => {
    vals[bi] = inp.value;
    const accepted = part.blanks[bi].answer.map(norm);
    const ok = accepted.includes(norm(inp.value));
    inp.classList.toggle('ok', ok);
    inp.classList.toggle('err', !ok);
    inp.readOnly = true;
    if (!ok) allOk = false;
  });
  const key = `${qid}_${pi}`;
  STATE.blank[key] = vals;
  STATE.done[key] = true;
  STATE.scores[qid] = STATE.scores[qid] || {};
  STATE.scores[qid][pi] = allOk ? partPoints(q, pi) : 0;
  saveState();
  btn.disabled = true;
  setBlankUI(el, part, vals);
  updateProgress();
}
function onRefToggle(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi;
  const el = btn.closest('.part');
  $1('.ref', el).classList.add('show');
  $1('.selfrow', el).classList.add('show');
  btn.disabled = true;
  STATE.open[`${qid}_${pi}`] = true;
  saveState();
}
function onSelfScore(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi, ratio = +btn.dataset.ratio;
  const q = findQ(qid), part = q.parts[pi];
  const key = `${qid}_${pi}`;
  const full = partPoints(q, pi);
  STATE.done[key] = true;
  STATE.open[key] = true;
  STATE.scores[qid] = STATE.scores[qid] || {};
  STATE.scores[qid][pi] = Math.round(full * ratio);
  saveState();
  const el = btn.closest('.part');
  $all('.self-score', el).forEach(b => { b.disabled = true; b.classList.remove('done'); });
  btn.classList.add('done');
  const label = ratio === 1 ? '满分' : (ratio === 0.5 ? '半分' : '0分');
  showFb(el, ratio > 0, '自评得分：' + label + '。' + part.analysis);
  updateProgress();
}
function updateProgress() {
  let doneCount = 0, total = 0;
  QUESTIONS.forEach(q => {
    const allDone = q.parts.every((_, pi) => STATE.done[`${q.id}_${pi}`]);
    if (allDone) doneCount++;
    q.parts.forEach((_, pi) => {
      total += ((STATE.scores[q.id] || {})[pi] || 0);
    });
  });
  const progBar = document.getElementById('progBar');
  const progTxt = document.getElementById('progTxt');
  const totalScore = document.getElementById('totalScore');
  if (progBar) progBar.style.width = (doneCount / QUESTIONS.length * 100) + '%';
  if (progTxt) progTxt.textContent = `已完成 ${doneCount} / ${QUESTIONS.length} 题`;
  if (totalScore) {
    totalScore.style.display = 'inline';
    totalScore.textContent = `总分 ${total} 分`;
  }
  const root = document.getElementById('quizRoot');
  let summary = document.getElementById('allDoneSummary');
  if (doneCount === QUESTIONS.length && root && !summary) {
    summary = document.createElement('div');
    summary.id = 'allDoneSummary';
    summary.className = 'qcard';
    summary.innerHTML = `<div class="stem">🎉 本章练习全部完成！</div><div class="pp">9 / 9 题已作答，当前总得分 <b style="color:#ffd479">${total} 分</b>。继续加油！</div>`;
    root.appendChild(summary);
  } else if (summary) {
    summary.querySelector('b').textContent = total + ' 分';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initState();
  renderQuiz();
});
