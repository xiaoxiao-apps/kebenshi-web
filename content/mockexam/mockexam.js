/* ===== 模拟组卷引擎 mockexam.js（P1-core，自包含，不引用 practice.js） =====
 * 分层：数据层(SAMPLE兜底+题池收集) / 抽题层(seed可复现) / 渲染层 / 判分层(norm,sameSet模式复制) / 成绩层 / 打印层
 * 题目契约见 quality-line/验收单/P1-core-组卷框架报告.md
 */
'use strict';

/* ================= 数据层 ================= */
const CH_NAMES = { 1:'机械运动', 2:'声现象', 3:'物态变化', 4:'光现象', 5:'透镜及其应用', 6:'质量与密度' };
const TYPE_NAMES = { choice:'选择题', multi:'多选题', blank:'填空题', experiment:'实验探究题', calc:'计算题' };
const SECTION_ORDER = ['choice','multi','blank','experiment','calc'];
const CN_NUM = ['一','二','三','四','五','六','七','八','九','十'];

/* qbank 数据文件应暴露的全局变量名（缺失自动跳过） */
const DATA_VARS = [
  'QBANK_C1_ORIG','QBANK_C2_ORIG','QBANK_C3A_ORIG','QBANK_C3B_ORIG',
  'QBANK_C4A_ORIG','QBANK_C4B_ORIG','QBANK_C5A_ORIG','QBANK_C5B_ORIG',
  'QBANK_C6A_ORIG','QBANK_C6B_ORIG',
  'QBANK_C1_MIG','QBANK_C2_MIG','QBANK_C3_MIG','QBANK_C4_MIG','QBANK_C5_MIG','QBANK_C6_MIG'
];

/* SAMPLE 兜底题库：数据文件全部缺失时自测用（每类型 1 题，全原创） */
const SAMPLE = [
  { id:'sample_c1_choice', ch:1, sec:3, kp:['speed-unit'], type:'choice', diff:1, freq:3, points:3,
    stem:'小杰步行的速度约为 1.2 m/s，合多少 km/h？（　　）',
    parts:[{ kind:'choice', opts:['0.33 km/h','1.2 km/h','4.32 km/h','12 km/h'], answer:2,
      analysis:'1 m/s = 3.6 km/h，故 1.2 m/s = 1.2 × 3.6 = <b>4.32 km/h</b>。' }],
    src:'original', scene:'步行速度换算' },

  { id:'sample_c2_multi', ch:2, sec:2, kp:['sound-char'], type:'multi', diff:2, freq:4, points:4,
    stem:'关于音调、响度和音色，下列说法正确的有（多选）',
    parts:[{ kind:'multi', opts:['音调由声源振动的频率决定','响度只与声源振动的频率有关','音色由发声体的材料和结构决定','振幅越大，响度越大'], answer:[0,2,3],
      analysis:'音调由<b>频率</b>决定；响度由<b>振幅</b>决定（还与距离有关），与频率无直接关系；音色由发声体<b>材料、结构</b>决定。' }],
    src:'original', scene:'声音三特性辨析' },

  { id:'sample_c3_blank', ch:3, sec:2, kp:['phase-change'], type:'blank', diff:1, freq:5, points:4,
    stem:'春天冰雪消融，这是____现象，此过程需要____热量。',
    parts:[{ kind:'blank', blanks:[
        { label:'物态变化名称', answer:['熔化','融化'], unit:'' },
        { label:'吸/放热', answer:['吸','吸收'], unit:'' }],
      analysis:'固态冰变成液态水属于<b>熔化</b>，熔化过程<b>吸热</b>。' }],
    src:'original', scene:'冰雪消融' },

  { id:'sample_c1_exp', ch:1, sec:4, kp:['avg-speed-exp'], type:'experiment', diff:2, freq:5, points:6,
    stem:'小组用斜面、小车、刻度尺和停表做"测量小车运动的平均速度"实验。',
    note:'两问均按填空判分。',
    parts:[
      { kind:'blank', q:'① 本实验的原理是：', blanks:[
        { label:'实验原理', answer:['v=s/t','v＝s/t','v = s/t','速度等于路程除以时间'], unit:'' }],
        analysis:'平均速度不能直接测量，依据 <b>v = s / t</b> 间接算出。' },
      { kind:'blank', q:'② 需要直接测量的两个物理量是：', blanks:[
        { label:'物理量一', answer:['路程','路程s','s','距离'], unit:'' },
        { label:'物理量二', answer:['时间','时间t','t'], unit:'' }],
        analysis:'用刻度尺测<b>路程 s</b>，用停表测<b>时间 t</b>，再代入 v = s/t。' }],
    src:'original', scene:'斜面测平均速度' },

  { id:'sample_c6_calc', ch:6, sec:2, kp:['density-calc'], type:'calc', diff:3, freq:5, points:6,
    stem:'一块碑石体积为 0.5 m³，从同种石材上取下的小样品质量为 27 g、体积为 10 cm³。求：（1）石材的密度；（2）整块碑石的质量。',
    note:'本题为计算题，作答后对照参考答案自评计分。',
    parts:[{ kind:'open',
      ref:'（1）ρ = m样/V样 = 27 g ÷ 10 cm³ = 2.7 g/cm³ = <b>2.7 × 10³ kg/m³</b>；（2）m = ρV = 2.7 × 10³ kg/m³ × 0.5 m³ = <b>1.35 × 10³ kg</b>（即 1.35 t）。',
      analysis:'密度是物质特性，样品与碑石同种石材密度相同；先算样品密度，再用 m = ρV 求碑石质量。' }],
    src:'original', scene:'碑石密度估算' }
];

/* 收集题池：合并所有存在的 qbank 数组 + 图函数表；全缺时用 SAMPLE */
function collectPool() {
  const pool = [], figs = {}, seen = {};
  if (typeof window !== 'undefined') {
    DATA_VARS.forEach(v => {
      const arr = window[v];
      if (Array.isArray(arr)) arr.forEach(q => {
        if (q && q.id && !seen[q.id]) { seen[q.id] = true; pool.push(q); }
      });
      const f = window[v + '_FIGS'];
      if (f && typeof f === 'object') Object.assign(figs, f);
    });
    if (window.QBANK_CN_MIG_FIGS && typeof window.QBANK_CN_MIG_FIGS === 'object')
      Object.assign(figs, window.QBANK_CN_MIG_FIGS);
  }
  if (!pool.length) {
    SAMPLE.forEach(q => pool.push(q));
    return { pool, figs, sample: true };
  }
  return { pool, figs, sample: false };
}

/* ================= 抽题层 ================= */
/* mulberry32：seed 可复现的伪随机源 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* 默认题型配比（设计书 §3）：20题=选5+多选1+填5+实验5+计算4；10题=选3+填3+实验2+计算2；其余按20题模板等比缩放，误差归到选择题 */
function defaultMix(N) {
  if (N === 10) return { choice:3, multi:0, blank:3, experiment:2, calc:2 };
  if (N === 20) return { choice:5, multi:1, blank:5, experiment:5, calc:4 };
  const base = { choice:5, multi:1, blank:5, experiment:5, calc:4 };
  const mix = { choice:0, multi:0, blank:0, experiment:0, calc:0 };
  let sum = 0;
  SECTION_ORDER.forEach(t => { mix[t] = Math.max(0, Math.round(N * base[t] / 20)); sum += mix[t]; });
  while (sum < N) { mix.choice++; sum++; }
  while (sum > N) {
    const t = mix.choice > 0 ? 'choice' : (mix.blank > 0 ? 'blank' : (mix.experiment > 0 ? 'experiment' : (mix.calc > 0 ? 'calc' : 'multi')));
    if (mix[t] <= 0) break;
    mix[t]--; sum--;
  }
  return mix;
}

/* 难度配额 7:2:1 */
function diffQuota(N) {
  let easy = Math.round(N * 0.7), mid = Math.round(N * 0.2), hard = N - easy - mid;
  if (hard < 0) { mid += hard; hard = 0; }
  if (mid < 0) { easy += mid; mid = 0; }
  return { 1: easy, 2: mid, 3: hard };
}

/* 抽题引擎（设计书 §4）：
 * 桶=(题型×难度)二维格，格内按 freq 加权随机；跨章卷每章保底 ⌈N/章数⌉；
 * 同考点 kp 同卷 ≤2 题；seed 固定本卷（同 seed 同池出同卷）。
 * 返回抽中的题目数组（顺序即卷面顺序的原始序，渲染时再按题型分大题）。 */
function drawPaper(pool, opts) {
  const chapters = opts.chapters, N = opts.N, seed = opts.seed;
  const mix = opts.mix || defaultMix(N);
  const rng = mulberry32(seed);
  const chSet = {};
  chapters.forEach(c => { chSet[c] = true; });
  const avail = pool.filter(q => chSet[q.ch]);
  if (!avail.length) return [];

  /* 任务表：题型配额 × 全局难度配额(7:2:1) 贪心配对，
   * 逐题型各自四舍五入会系统性吞掉难题，必须全局配对 */
  const tasks = [];
  const remD = diffQuota(N);
  SECTION_ORDER.forEach(t => {
    const qn = mix[t] || 0;
    for (let i = 0; i < qn; i++) {
      let best = 1;
      if ((remD[2] || 0) > (remD[best] || 0)) best = 2;
      if ((remD[3] || 0) > (remD[best] || 0)) best = 3;
      if ((remD[best] || 0) <= 0) best = [1, 2, 3].find(d => (remD[d] || 0) > 0) || 1;
      remD[best]--;
      tasks.push({ type: t, diff: best });
    }
  });
  while (tasks.length > N) tasks.pop();
  while (tasks.length < N) tasks.push({ type: 'choice', diff: 1 });

  /* 章保底：每章 need=⌈N/章数⌉，超出保底的部分记入 free */
  const C = chapters.length;
  const minPer = Math.ceil(N / C);
  const need = {};
  chapters.forEach(c => { need[c] = minPer; });
  let free = Math.max(0, N - C * minPer);

  const chosen = [], chosenIds = {}, kpCount = {};
  function kpOK(q) { return (q.kp || []).every(k => (kpCount[k] || 0) < 2); }
  function take(q) {
    chosen.push(q);
    chosenIds[q.id] = true;
    (q.kp || []).forEach(k => { kpCount[k] = (kpCount[k] || 0) + 1; });
    if (need[q.ch] > 0) need[q.ch]--; else if (free > 0) free--;
  }
  function weightedPick(list) {
    let tot = 0;
    list.forEach(q => { tot += (q.freq || 3); });
    let r = rng() * tot;
    for (let i = 0; i < list.length; i++) {
      r -= (list[i].freq || 3);
      if (r <= 0) return list[i];
    }
    return list[list.length - 1];
  }
  function baseFilter(q) { return !chosenIds[q.id]; }

  tasks.forEach(task => {
    /* 分层回退：章保底优先于难度精确，其次题型，最后放宽 kp 约束 */
    const tiers = [
      () => avail.filter(q => baseFilter(q) && q.type === task.type && q.diff === task.diff && kpOK(q) && need[q.ch] > 0),
      () => avail.filter(q => baseFilter(q) && q.type === task.type && kpOK(q) && need[q.ch] > 0),
      () => avail.filter(q => baseFilter(q) && q.type === task.type && q.diff === task.diff && kpOK(q)),
      () => avail.filter(q => baseFilter(q) && q.type === task.type && kpOK(q)),
      () => avail.filter(q => baseFilter(q) && kpOK(q)),
      () => avail.filter(baseFilter)
    ];
    for (let i = 0; i < tiers.length; i++) {
      const list = tiers[i]();
      if (list.length) { take(weightedPick(list)); return; }
    }
  });

  /* 章保底后处理：当 章数×⌈N/章数⌉ > N（如全册6章20题）时保底不可能达 ⌈N/C⌉，
   * 取可行下限 floor(N/C)，从超额章换入欠额章的题目（优先同题型，保 mix 不漂） */
  const feasibleMin = Math.min(minPer, Math.floor(N / C));
  if (C > 1 && feasibleMin > 0) {
    const cnt = {};
    chosen.forEach(q => { cnt[q.ch] = (cnt[q.ch] || 0) + 1; });
    function untake(q) {
      const i = chosen.indexOf(q);
      if (i >= 0) chosen.splice(i, 1);
      delete chosenIds[q.id];
      (q.kp || []).forEach(k => { kpCount[k] = (kpCount[k] || 1) - 1; if (kpCount[k] <= 0) delete kpCount[k]; });
      cnt[q.ch]--;
    }
    chapters.forEach(c => {
      let guard = 0;
      while ((cnt[c] || 0) < feasibleMin && guard++ < 60) {
        const donors = chosen.filter(q => (cnt[q.ch] || 0) > feasibleMin);
        if (!donors.length) break;
        let cand = avail.filter(q => !chosenIds[q.id] && q.ch === c && kpOK(q));
        if (!cand.length) cand = avail.filter(q => !chosenIds[q.id] && q.ch === c);
        if (!cand.length) break;
        /* 优先换出同题型同难度的超额题（难度7:2:1不漂），其次同题型，最后任意 */
        let pair = null;
        for (let i = 0; i < cand.length && !pair; i++)
          for (let j = 0; j < donors.length; j++)
            if (donors[j].type === cand[i].type && donors[j].diff === cand[i].diff) { pair = [donors[j], cand[i]]; break; }
        if (!pair)
          for (let i = 0; i < cand.length && !pair; i++)
            for (let j = 0; j < donors.length; j++)
              if (donors[j].type === cand[i].type) { pair = [donors[j], cand[i]]; break; }
        if (!pair) pair = [donors[donors.length - 1], weightedPick(cand)];
        const donor = pair[0], add = pair[1];
        untake(donor);
        take(add);
        cnt[add.ch] = (cnt[add.ch] || 0) + 1;
        if (need[add.ch] < 0) need[add.ch] = 0;
      }
    });
  }
  return chosen;
}

/* ================= 判分层（模式复制自 practice.js，独立实现） ================= */
/* 字符串归一化：全角正负号→半角、去句点、去空格 */
function norm(s) {
  return String(s == null ? '' : s).replace(/[＋]/g, '+').replace(/[－]/g, '-').replace(/[。．]/g, '').replace(/\s/g, '').trim();
}
/* 多选集合比对：排序后逐项相等 */
function sameSet(a, b) {
  const x = (a || []).slice().sort(), y = (b || []).slice().sort();
  return x.length === y.length && x.every((v, i) => v === y[i]);
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function partPoints(q, pi) {
  const n = q.parts && q.parts.length ? q.parts.length : 1;
  return Math.round(q.points / n);
}
/* 判一个小问：ans 为作答（choice=索引 / multi=索引数组 / blank=字符串数组 / open=作答文本，分数在 EX.open）
 * 返回 {ok, score, full}；open 题 ok=null（自评制）；blank 带 keyPoints 时按要点比例给部分分（ok: 满分true/部分分null/0分false） */
function gradePart(q, pi, ans) {
  const p = q.parts[pi];
  const full = partPoints(q, pi);
  let ok = false;
  if (p.kind === 'choice') {
    ok = ans === p.answer;
  } else if (p.kind === 'multi') {
    ok = sameSet(ans, p.answer);
  } else if (p.kind === 'blank') {
    if (Array.isArray(p.keyPoints) && p.keyPoints.length) {
      const raw = (Array.isArray(ans) ? ans : [ans]).map(v => String(v == null ? '' : v)).join(' ');
      let hit = 0;
      p.keyPoints.forEach(kp => {
        let matched = false;
        if (kp.re) {
          try { matched = new RegExp(kp.re).test(raw); } catch (e) { matched = raw.includes(String(kp.re)); }
        } else if (kp.text) {
          matched = raw.includes(String(kp.text));
        }
        if (matched) hit++;
      });
      const score = Math.round(full * hit / p.keyPoints.length);
      return { ok: score >= full ? true : (score > 0 ? null : false), score, full };
    }
    ok = (p.blanks || []).every((b, bi) =>
      (b.answer || []).map(norm).includes(norm((ans && ans[bi]) || '')));
  } else if (p.kind === 'open') {
    const key = q.id + '_' + pi;
    const sv = (typeof EX !== 'undefined' && EX && EX.open && EX.open[key] !== undefined) ? EX.open[key] : ans;
    const score = Math.min(full, Math.max(0, +sv || 0));
    return { ok: null, score, full };
  }
  return { ok, score: ok ? full : 0, full };
}
/* 整题判分：所有小问得分之和；okAll=客观小问全对（open 不计入对错统计） */
function gradeQuestion(q, answers) {
  let score = 0, full = 0, wrongPart = false, hasObjective = false;
  (q.parts || []).forEach((p, pi) => {
    const g = gradePart(q, pi, answers ? answers[pi] : undefined);
    score += g.score; full += g.full;
    if (g.ok !== null) { hasObjective = true; if (!g.ok) wrongPart = true; }
  });
  return { score, full, ok: hasObjective ? !wrongPart : (score >= full) };
}

/* ================= 状态 ================= */
const STORAGE_KEY = 'mockexam_state_v1';
let POOL = [], FIGMAP = {}, IS_SAMPLE = true;
let EX = null; /* {chapters,N,mix,mode,seed,paper:[q..],answers:{key:ans},open:{key:score},cpSel:{key:[ci..]},done:{key:true},submitted:bool} */
let MULTI_SEL = {};

function saveEX() {
  if (!EX) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      chapters: EX.chapters, N: EX.N, mix: EX.mix, mode: EX.mode, seed: EX.seed,
      paperIds: EX.paper.map(q => q.id), answers: EX.answers, open: EX.open,
      cpSel: EX.cpSel, done: EX.done, submitted: EX.submitted
    }));
  } catch (e) {}
}
function loadEX() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!s || !Array.isArray(s.paperIds)) return null;
    const byId = {};
    POOL.forEach(q => { byId[q.id] = q; });
    const paper = s.paperIds.map(id => byId[id]).filter(Boolean);
    if (paper.length !== s.paperIds.length) return null; /* 题池已变，弃用旧卷 */
    return { chapters: s.chapters, N: s.N, mix: s.mix, mode: s.mode, seed: s.seed,
      paper, answers: s.answers || {}, open: s.open || {}, cpSel: s.cpSel || {}, done: s.done || {}, submitted: !!s.submitted };
  } catch (e) { return null; }
}
function findQ(qid) { return EX.paper.find(q => q.id === qid); }
function $1(sel, el) { return (el || document).querySelector(sel); }
function $all(sel, el) { return Array.from((el || document).querySelectorAll(sel)); }

/* ================= 渲染层（作答页，自包含，参照 practice.js renderPart 模式） ================= */
function renderFig(fig) {
  if (!fig || !FIGMAP[fig]) return '';
  try { return '<div class="figbox">' + FIGMAP[fig]() + '</div>'; } catch (e) { return ''; }
}
function letterOf(i) { return ['A','B','C','D','E','F'][i] || String(i + 1); }

function renderPart(q, pi) {
  const p = q.parts[pi];
  const key = q.id + '_' + pi;
  const head = p.q ? '<div class="pp"><b>' + esc(p.q) + '</b></div>' : '';
  const instant = EX.mode === 'instant';
  if (p.kind === 'choice') {
    const opts = p.opts.map((opt, idx) =>
      '<button class="opt" data-qid="' + q.id + '" data-pi="' + pi + '" data-idx="' + idx + '">' + letterOf(idx) + '. ' + esc(opt) + '</button>').join('');
    return '<div class="part" data-key="' + key + '">' + head + '<div class="opts">' + opts + '</div><div class="fb" data-role="fb"></div></div>';
  }
  if (p.kind === 'multi') {
    const opts = p.opts.map((opt, idx) =>
      '<button class="opt mopt" data-qid="' + q.id + '" data-pi="' + pi + '" data-idx="' + idx + '">' + letterOf(idx) + '. ' + esc(opt) + '</button>').join('');
    const subBtn = instant ? '<button class="btn multi-submit" data-qid="' + q.id + '" data-pi="' + pi + '">提交</button>' : '';
    return '<div class="part" data-key="' + key + '">' + head + '<div class="multi-hint">多选题' + (instant ? ' · 选择完毕后点提交判分' : ' · 可选多项，交卷后统一判分') + '</div><div class="opts">' + opts + '</div>' + subBtn + '<div class="fb" data-role="fb"></div></div>';
  }
  if (p.kind === 'blank') {
    const rows = (p.blanks || []).map((b, bi) =>
      '<div class="blankrow"><span>' + esc(b.label || ('第' + (bi + 1) + '空')) + '：</span><input type="text" class="blank-inp" data-bi="' + bi + '" data-qid="' + q.id + '" data-pi="' + pi + '" placeholder="作答"' + (b.unit ? ' aria-label="' + esc(b.label || '') + '"' : '') + '><span>' + esc(b.unit || '') + '</span></div>').join('');
    const chk = instant ? '<button class="btn blank-check" data-qid="' + q.id + '" data-pi="' + pi + '">提交答案</button>' : '';
    return '<div class="part" data-key="' + key + '">' + head + rows + chk + '<div class="fb" data-role="fb"></div></div>';
  }
  if (p.kind === 'open') {
    const cps = (Array.isArray(p.checkpoints) && p.checkpoints.length) ? p.checkpoints : null;
    const selfUI = cps
      ? '<div class="selfrow cprow">' + cps.map((c, ci) =>
          '<label class="cp-chk"><input type="checkbox" class="cp-box" data-qid="' + q.id + '" data-pi="' + pi + '" data-ci="' + ci + '"> ' + esc(c) + '</label>').join('') + '</div>'
      : '<div class="selfrow"><button class="btn gold self-score" data-qid="' + q.id + '" data-pi="' + pi + '" data-ratio="1">满分</button>' +
        '<button class="btn self-score" data-qid="' + q.id + '" data-pi="' + pi + '" data-ratio="0.5">半分</button>' +
        '<button class="btn ghost self-score" data-qid="' + q.id + '" data-pi="' + pi + '" data-ratio="0">0分</button></div>';
    return '<div class="part" data-key="' + key + '">' + head +
      '<textarea class="open-input" rows="4" placeholder="在此作答（交卷后对照参考答案自评）" data-qid="' + q.id + '" data-pi="' + pi + '"></textarea>' +
      '<button class="btn ghost ref-toggle" data-qid="' + q.id + '" data-pi="' + pi + '">查看参考答案</button>' +
      '<div class="ref">' + (p.ref || '') + '</div>' +
      selfUI +
      '<div class="fb" data-role="fb"></div></div>';
  }
  return '';
}
function renderQuestion(q, no) {
  return '<div class="qcard" id="q_' + q.id + '">' +
    '<div class="qno"><b>' + esc(no) + '</b><span>(' + q.points + '分)</span></div>' +
    '<div class="stem">' + esc(q.stem) + '</div>' +
    renderFig(q.fig) +
    (q.parts || []).map((_, pi) => renderPart(q, pi)).join('') +
    '</div>';
}
function sectionsOf(paper) {
  const secs = [];
  SECTION_ORDER.forEach(t => {
    const qs = paper.filter(q => q.type === t);
    qs.sort((a, b) => ((a.diff || 0) - (b.diff || 0)) || ((b.freq || 0) - (a.freq || 0)));
    if (qs.length) secs.push({ type: t, qs });
  });
  /* 未知题型兜底并入最后一区 */
  const known = {};
  secs.forEach(s => s.qs.forEach(q => { known[q.id] = true; }));
  const rest = paper.filter(q => !known[q.id]);
  if (rest.length) {
    if (secs.length) secs[secs.length - 1].qs = secs[secs.length - 1].qs.concat(rest);
    else secs.push({ type: 'choice', qs: rest });
  }
  return secs;
}
function paperSections() { return sectionsOf(EX.paper); }
function renderExam() {
  const root = document.getElementById('examRoot');
  let html = '', n = 0;
  paperSections().forEach((s, si) => {
    const sum = s.qs.reduce((a, q) => a + (q.points || 0), 0);
    html += '<section class="sec"><div class="sec-head"><h2>' + CN_NUM[si] + '、' + TYPE_NAMES[s.type] + '</h2><span class="chip">' + s.qs.length + ' 题 · ' + sum + ' 分</span></div>';
    s.qs.forEach(q => { n++; html += renderQuestion(q, '第' + n + '题'); });
    html += '</section>';
  });
  root.innerHTML = html;
  const meta = document.getElementById('examMeta');
  const scope = EX.chapters.length === 6 ? '全册' : EX.chapters.map(c => '第' + c + '章').join('+');
  meta.innerHTML = '范围 <b>' + esc(scope) + '</b> ｜ 题量 <b>' + EX.N + '</b> ｜ 模式 <b>' + (EX.mode === 'instant' ? '即时判分' : '交卷判分') + '</b>' + (IS_SAMPLE ? ' ｜ <b>⚠ SAMPLE 兜底题库（qbank 数据未载入）</b>' : '');
  document.getElementById('submitExamBtn').style.display = EX.mode === 'instant' ? 'none' : '';
  bindExamEvents();
  restoreExamUI();
  renderExamFoot();
}

/* ===== 交互与判分流程 ===== */
function showFb(el, ok, html) {
  const fb = $1('[data-role="fb"]', el);
  if (!fb) return;
  fb.className = 'fb ' + (ok ? 'ok' : 'err');
  fb.innerHTML = (ok ? '✅ 回答正确' : '❌ 回答错误') + '<div class="an"><b>解析：</b>' + html + '</div>';
}
function ansOf(key) { return EX.answers[key]; }
function setAns(key, val, markDone) {
  EX.answers[key] = val;
  if (markDone) EX.done[key] = true;
  saveEX();
}

function bindExamEvents() {
  $all('#examRoot .opt').forEach(btn => btn.addEventListener('click', btn.classList.contains('mopt') ? onMultiClick : onChoiceClick));
  $all('#examRoot .blank-check').forEach(btn => btn.addEventListener('click', onBlankCheck));
  $all('#examRoot .multi-submit').forEach(btn => btn.addEventListener('click', onMultiSubmit));
  $all('#examRoot .ref-toggle').forEach(btn => btn.addEventListener('click', onRefToggle));
  $all('#examRoot .self-score').forEach(btn => btn.addEventListener('click', onSelfScore));
  $all('#examRoot .blank-inp').forEach(inp => inp.addEventListener('input', onBlankInput));
  $all('#examRoot .open-input').forEach(ta => ta.addEventListener('input', onOpenInput));
  $all('#examRoot .cp-box').forEach(cb => cb.addEventListener('change', onCpToggle));
}

/* 单选：即时模式=点击判分锁定；交卷模式=点击改选不判分 */
function onChoiceClick(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi, idx = +btn.dataset.idx;
  const key = qid + '_' + pi;
  if (EX.done[key]) return;
  const q = findQ(qid), part = q.parts[pi];
  const el = btn.closest('.part');
  if (EX.mode === 'instant' || EX.submitted) {
    setAns(key, idx, true);
    setChoiceUI(el, part, idx);
    renderExamFoot();
  } else {
    setAns(key, idx, false);
    $all('.opt', el).forEach(b => b.classList.toggle('sel', +b.dataset.idx === idx));
  }
}
/* 多选：即时模式=点选/取消+提交钮判分；交卷模式=点选/取消，交卷后判 */
function onMultiClick(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi, idx = +btn.dataset.idx;
  const key = qid + '_' + pi;
  if (EX.done[key]) return;
  const sel = (EX.answers[key] || []).slice();
  const pos = sel.indexOf(idx);
  if (pos >= 0) { sel.splice(pos, 1); btn.classList.remove('sel'); }
  else { sel.push(idx); btn.classList.add('sel'); }
  setAns(key, sel, false);
}
function onMultiSubmit(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi;
  const key = qid + '_' + pi;
  if (EX.done[key]) return;
  const q = findQ(qid), part = q.parts[pi];
  const sel = (EX.answers[key] || []).slice();
  setAns(key, sel, true);
  setMultiUI(btn.closest('.part'), part, sel);
  renderExamFoot();
}
/* 填空：即时模式=提交钮判分；交卷模式=随输入记录 */
function onBlankInput(e) {
  if (EX.mode === 'instant') return;
  const inp = e.currentTarget;
  if (inp.readOnly) return;
  const key = inp.dataset.qid + '_' + inp.dataset.pi;
  const el = inp.closest('.part');
  const vals = $all('.blank-inp', el).map(i => i.value);
  setAns(key, vals, false);
}
function onBlankCheck(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi;
  const key = qid + '_' + pi;
  if (EX.done[key]) return;
  const q = findQ(qid), part = q.parts[pi];
  const el = btn.closest('.part');
  const vals = $all('.blank-inp', el).map(i => i.value);
  setAns(key, vals, true);
  setBlankUI(el, part, vals);
  renderExamFoot();
}
/* open（实验/计算题常见）：作答文本实时持久化 + 查看参考 + 自评计分 */
function onOpenInput(e) {
  const ta = e.currentTarget;
  if (ta.readOnly) return;
  const key = ta.dataset.qid + '_' + ta.dataset.pi;
  setAns(key, ta.value, false);
}
function onRefToggle(e) {
  const btn = e.currentTarget;
  const el = btn.closest('.part');
  if (btn.dataset.shown === '1') {
    $1('.ref', el).classList.remove('show');
    $1('.selfrow', el).classList.remove('show');
    btn.textContent = '查看参考答案'; btn.dataset.shown = '0';
  } else {
    $1('.ref', el).classList.add('show');
    $1('.selfrow', el).classList.add('show');
    btn.textContent = '收起参考答案'; btn.dataset.shown = '1';
  }
}
function onSelfScore(e) {
  const btn = e.currentTarget;
  const qid = btn.dataset.qid, pi = +btn.dataset.pi, ratio = +btn.dataset.ratio;
  const q = findQ(qid), part = q.parts[pi];
  const key = qid + '_' + pi;
  const full = partPoints(q, pi);
  const score = Math.round(full * ratio);
  EX.open[key] = score;
  EX.done[key] = true;
  saveEX();
  const el = btn.closest('.part');
  $1('.ref', el).classList.add('show');
  $1('.selfrow', el).classList.add('show');
  const tb = $1('.ref-toggle', el); if (tb) { tb.textContent = '收起参考答案'; tb.dataset.shown = '1'; }
  $all('.self-score', el).forEach(b => { b.disabled = true; b.classList.remove('done'); });
  btn.classList.add('done');
  $all('.self-score', el).forEach(b => { b.disabled = false; }); /* 交卷前允许改自评 */
  if (EX.submitted || EX.mode === 'instant') $all('.self-score', el).forEach(b => { b.disabled = true; });
  const label = ratio === 1 ? '满分' : (ratio === 0.5 ? '半分' : '0分');
  showFb(el, ratio > 0, '自评得分：' + label + '。' + (part.analysis || ''));
  renderExamFoot();
}
/* 分步采分点自评：勾「我做对的点」，得分 = round(points × 勾选数 / 总数) */
function onCpToggle(e) {
  const box = e.currentTarget;
  const qid = box.dataset.qid, pi = +box.dataset.pi;
  const key = qid + '_' + pi;
  const q = findQ(qid), part = q.parts[pi];
  const full = partPoints(q, pi);
  const el = box.closest('.part');
  const boxes = $all('.cp-box', el);
  const picked = boxes.filter(b => b.checked).map(b => +b.dataset.ci);
  const score = Math.round(full * picked.length / boxes.length);
  EX.cpSel[key] = picked;
  EX.open[key] = score;
  EX.done[key] = true;
  saveEX();
  if (EX.submitted || EX.mode === 'instant') boxes.forEach(b => { b.disabled = true; });
  $1('.ref', el).classList.add('show');
  const tb = $1('.ref-toggle', el); if (tb) { tb.textContent = '收起参考答案'; tb.dataset.shown = '1'; }
  showFb(el, score > 0, '自评得分：' + score + ' / ' + full + ' 分（勾选 ' + picked.length + '/' + boxes.length + ' 个采分点）。' + (part.analysis || ''));
  renderExamFoot();
}

/* ===== 判分后 UI 锁定（模式复制 practice.js setChoiceUI/setMultiUI/setBlankUI） ===== */
function setChoiceUI(el, part, chosenIdx) {
  $all('.opt', el).forEach(btn => {
    const idx = +btn.dataset.idx;
    btn.disabled = true;
    btn.classList.remove('ok', 'err', 'dim', 'sel');
    if (idx === part.answer) btn.classList.add('ok');
    else if (idx === chosenIdx) btn.classList.add('err');
    else btn.classList.add('dim');
  });
  showFb(el, chosenIdx === part.answer, part.analysis || '');
}
function setMultiUI(el, part, chosen) {
  $all('.opt', el).forEach(btn => {
    const idx = +btn.dataset.idx;
    btn.disabled = true;
    btn.classList.remove('ok', 'err', 'dim', 'sel');
    if ((part.answer || []).includes(idx)) btn.classList.add('ok');
    else if ((chosen || []).includes(idx)) btn.classList.add('err');
    else btn.classList.add('dim');
  });
  const sbtn = $1('.multi-submit', el);
  if (sbtn) sbtn.disabled = true;
  showFb(el, sameSet(chosen, part.answer), part.analysis || '');
}
function setBlankUI(el, part, vals, q, pi) {
  const inputs = $all('.blank-inp', el);
  const useKp = Array.isArray(part.keyPoints) && part.keyPoints.length;
  let allOk = true;
  inputs.forEach((inp, bi) => {
    inp.value = (vals && vals[bi]) || '';
    if (!useKp) {
      const accepted = ((part.blanks || [])[bi] || { answer: [] }).answer.map(norm);
      const ok = accepted.includes(norm(inp.value));
      inp.classList.toggle('ok', ok);
      inp.classList.toggle('err', !ok);
      if (!ok) allOk = false;
    }
    inp.readOnly = true;
  });
  const btn = $1('.blank-check', el);
  if (btn) btn.disabled = true;
  if (useKp && q) {
    const g = gradePart(q, pi, vals || []);
    const fb = $1('[data-role="fb"]', el);
    if (fb) {
      fb.className = 'fb ' + (g.score >= g.full ? 'ok' : 'err');
      fb.innerHTML = (g.score >= g.full ? '✅ 回答正确' : '🟡 要点得分 ' + g.score + ' / ' + g.full + ' 分') +
        '<div class="an"><b>解析：</b>' + (part.analysis || '') + '</div>';
    }
    return;
  }
  showFb(el, allOk, part.analysis || '');
}
function setOpenUI(el, score, full, q, pi) {
  $1('.ref', el).classList.add('show');
  $1('.selfrow', el).classList.add('show');
  const tb = $1('.ref-toggle', el); if (tb) { tb.textContent = '收起参考答案'; tb.dataset.shown = '1'; }
  const ta = $1('.open-input', el); if (ta && EX.submitted) ta.readOnly = true;
  const boxes = $all('.cp-box', el);
  if (boxes.length) {
    const picked = (EX.cpSel && EX.cpSel[q.id + '_' + pi]) || [];
    boxes.forEach(b => { b.checked = picked.includes(+b.dataset.ci); b.disabled = true; });
    showFb(el, score > 0, '自评得分：' + score + ' / ' + full + ' 分。');
    return;
  }
  const ratio = full ? score / full : 0;
  $all('.self-score', el).forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('done');
    if (Math.abs(+btn.dataset.ratio - ratio) < 1e-6) btn.classList.add('done');
  });
  const label = ratio >= 1 ? '满分' : (ratio > 0 ? '半分' : '0分');
  showFb(el, score > 0, '自评得分：' + label + '。');
}

/* 刷新后恢复已判分/已作答的 UI（作答内容不丢） */
function restoreExamUI() {
  EX.paper.forEach(q => {
    (q.parts || []).forEach((part, pi) => {
      const key = q.id + '_' + pi;
      const el = $1('#examRoot .part[data-key="' + key + '"]');
      if (!el) return;
      const ans = EX.answers[key];
      if (EX.done[key]) {
        if (part.kind === 'choice') setChoiceUI(el, part, ans);
        else if (part.kind === 'multi') setMultiUI(el, part, ans || []);
        else if (part.kind === 'blank') setBlankUI(el, part, ans || [], q, pi);
        else if (part.kind === 'open') {
          const ta = $1('.open-input', el); if (ta && typeof ans === 'string') ta.value = ans;
          setOpenUI(el, EX.open[key] || 0, partPoints(q, pi), q, pi);
        }
        return;
      }
      if (part.kind === 'open') {
        const ta = $1('.open-input', el); if (ta && typeof ans === 'string') ta.value = ans;
      } else if (ans !== undefined && EX.mode !== 'instant') {
        if (part.kind === 'choice') $all('.opt', el).forEach(b => b.classList.toggle('sel', +b.dataset.idx === ans));
        else if (part.kind === 'multi') $all('.opt', el).forEach(b => b.classList.toggle('sel', (ans || []).includes(+b.dataset.idx)));
        else if (part.kind === 'blank') $all('.blank-inp', el).forEach((inp, bi) => { inp.value = (ans && ans[bi]) || ''; });
      }
      if (part.kind === 'open' && EX.open[key] !== undefined && !EX.submitted) {
        /* 交卷前自评可改：恢复显示但不锁定 */
        const ratio = partPoints(q, pi) ? EX.open[key] / partPoints(q, pi) : 0;
        $all('.self-score', el).forEach(b => b.classList.toggle('done', Math.abs(+b.dataset.ratio - ratio) < 1e-6));
      }
    });
  });
}

/* 交卷：所有客观小问统一判分锁定；open 小问展开参考+自评 */
function submitExam() {
  EX.submitted = true;
  EX.paper.forEach(q => {
    (q.parts || []).forEach((part, pi) => {
      const key = q.id + '_' + pi;
      const el = $1('#examRoot .part[data-key="' + key + '"]');
      if (EX.done[key] || !el) return;
      const ans = EX.answers[key];
      EX.done[key] = true;
      if (part.kind === 'choice') setChoiceUI(el, part, ans === undefined ? -1 : ans);
      else if (part.kind === 'multi') setMultiUI(el, part, ans || []);
      else if (part.kind === 'blank') setBlankUI(el, part, ans || [], q, pi);
      else if (part.kind === 'open') {
        const ta = $1('.open-input', el); if (ta) ta.readOnly = true;
        const tb = $1('.ref-toggle', el);
        if (tb && tb.dataset.shown !== '1') tb.click();
      }
    });
  });
  saveEX();
  document.getElementById('submitExamBtn').style.display = 'none';
  renderExamFoot();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* 页脚状态条：进度 / 交卷钮 / 查看成绩钮 */
function renderExamFoot() {
  const foot = document.getElementById('examFoot');
  if (!foot) return;
  let doneCount = 0, total = 0;
  EX.paper.forEach(q => {
    const allDone = (q.parts || []).every((_, pi) => EX.done[q.id + '_' + pi]);
    if (allDone) doneCount++;
    (q.parts || []).forEach((_, pi) => {
      const g = gradePart(q, pi, EX.answers[q.id + '_' + pi]);
      if (EX.done[q.id + '_' + pi]) total += g.score;
    });
  });
  const canResult = EX.submitted || EX.mode === 'instant';
  foot.innerHTML = '<span class="tip">已判 ' + doneCount + ' / ' + EX.paper.length + ' 题' + (canResult ? '，当前得分 <b style="color:var(--gold)">' + total + '</b> 分' : '') + '</span>' +
    (!canResult ? '' : '<button type="button" class="btn big gold" id="toResultBtn">查看成绩</button>');
  const tb = document.getElementById('toResultBtn');
  if (tb) tb.addEventListener('click', showResult);
}

/* ================= 成绩层 ================= */
function showResult() {
  let total = 0, full = 0, okN = 0, errN = 0;
  const kpWrong = {};
  EX.paper.forEach(q => {
    (q.parts || []).forEach((part, pi) => {
      const key = q.id + '_' + pi;
      const g = gradePart(q, pi, EX.answers[key]);
      total += EX.done[key] ? g.score : 0;
      full += g.full;
    });
    const ans = {};
    (q.parts || []).forEach((_, pi) => { ans[pi] = EX.answers[q.id + '_' + pi]; });
    const gq = gradeQuestion(q, ans);
    if (gq.ok) okN++;
    else {
      errN++;
      (q.kp || []).forEach(k => { kpWrong[k] = (kpWrong[k] || 0) + 1; });
    }
  });
  const rate = full ? Math.round(total / full * 100) : 0;
  const weak = Object.keys(kpWrong).sort((a, b) => kpWrong[b] - kpWrong[a]).slice(0, 5);
  const root = document.getElementById('resultRoot');
  root.innerHTML =
    '<div class="res-hero"><div class="score">' + total + ' / ' + full + '</div>' +
    '<div class="rate">得分率 ' + rate + '% ｜ ' + (EX.mode === 'instant' ? '即时判分' : '交卷判分') + '</div>' +
    '<div class="resgrid"><span class="pill">答对 <b>' + okN + '</b> 题</span><span class="pill">答错 <b>' + errN + '</b> 题</span></div></div>' +
    (weak.length ? '<div class="weak"><h3>知识点薄弱提示（答错最多的考点在前）</h3><ol>' +
      weak.map(k => '<li>' + esc(k) + ' —— 错 ' + kpWrong[k] + ' 题</li>').join('') + '</ol></div>' : '') +
    '<div class="card"><div class="segrow"><b>逐题判定</b></div>' +
    EX.paper.map((q, i) => {
      const ans = {};
      (q.parts || []).forEach((_, pi) => { ans[pi] = EX.answers[q.id + '_' + pi]; });
      const gq = gradeQuestion(q, ans);
      return '<div class="tip">第' + (i + 1) + '题 [' + esc(q.id) + '] ' + (gq.ok ? '✅' : '❌') + ' ' + gq.score + '/' + gq.full + ' 分</div>';
    }).join('') + '</div>';
  switchScreen('screenResult');
}

/* ================= 打印层（设计书 §6：纯 CSS + window.print()） ================= */
/* 打印图像修正（X1/A2）：qbank fig 返回的 SVG 仅有 viewBox 无固有宽高，
 * 打印 compact 档 float 盒 shrink-to-fit 塌缩为 0 宽 → 图全消失；
 * 且 figs 配色按深色底设计，白纸不可见。仅 buildPrint 的 p-fig 分支调用，屏上 renderFig 不动。
 * ①由 viewBox 注入 width/height；②<text> 的 fill 十六进制色→#000；
 * ③非 text 元素 fill/stroke 十六进制色按亮度 L=0.299r+0.587g+0.114b：
 *   L>200→#333；150<L≤200→各通道×0.6 取整钳[0,255]；L≤150 保留；opacity/rgba/none 不动。 */
function _printHex(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return hex;
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const L = 0.299 * r + 0.587 * g + 0.114 * b;
  if (L > 200) return '#333';
  if (L > 150) {
    const dim = c => Math.max(0, Math.min(255, Math.round(c * 0.6)));
    const to2 = v => ('0' + v.toString(16)).slice(-2);
    return '#' + to2(dim(r)) + to2(dim(g)) + to2(dim(b));
  }
  return hex;
}
function printifySvg(svgStr) {
  if (typeof svgStr !== 'string') return svgStr;
  const root = svgStr.match(/<svg\b[^>]*>/);
  if (!root) return svgStr;
  const vb = root[0].match(/viewBox\s*=\s*"\s*(-?[\d.]+)[\s,]+(-?[\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
  if (!vb) return svgStr;
  let s = svgStr;
  if (!/\bwidth\s*=/.test(root[0])) {
    s = s.replace(root[0], root[0].replace(/^<svg/, '<svg width="' + vb[3] + '" height="' + vb[4] + '"'));
  }
  s = s.replace(/<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (tag, name, attrs) => {
    if (name === 'text') {
      attrs = attrs.replace(/fill\s*=\s*"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})"/g, 'fill="#000"');
    } else {
      attrs = attrs.replace(/(fill|stroke)\s*=\s*"(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))"/g,
        (m, attr, hex) => attr + '="' + _printHex(hex) + '"');
    }
    return '<' + name + attrs + '>';
  });
  return s;
}
function printDensity() {
  if (typeof document === 'undefined') return 'compact';
  const r = $1('input[name="printDensity"]:checked');
  return r ? r.value : 'compact';
}
/* 选项排版：全部≤14字→4列一行；≤28字→2列；更长→每行1项（列宽由 CSS 按 cols 类控制） */
function printChoiceOpts(p) {
  const opts = p.opts || [];
  let maxLen = 0;
  opts.forEach(o => { maxLen = Math.max(maxLen, String(o).length); });
  const per = opts.length >= 4 && maxLen <= 14 ? 4 : (opts.length >= 2 && maxLen <= 28 ? 2 : 1);
  return '<div class="p-opts cols' + per + '">' + opts.map((o, i) => '<span>' + letterOf(i) + '. ' + esc(o) + '</span>').join('') + '</div>';
}
function buildPrint(includeAnswers) {
  const density = printDensity();
  let html = '<div class="p-paper ' + density + '">';
  const scope = EX.chapters.length === 6 ? '全册' : EX.chapters.map(c => '第' + c + '章 ' + CH_NAMES[c]).join('、');
  html += '<div class="p-head"><h1>八年级物理（上册）模拟试卷</h1>' +
    '<div class="p-sub">范围：' + esc(scope) + ' ｜ 共 ' + EX.paper.length + ' 题</div></div>';
  html += '<div class="p-seal">✂ - - - - - - - - - - - - - - - - - - - - 密 封 线 - - - - - - - - - - - - - - - - - - - - ✂</div>';
  html += '<div class="p-idrow"><span>学校：____________</span><span>班级：____________</span><span>考号：____________</span><span>得分：____________</span></div>';
  html += '<div class="p-notice">注意事项：作答前请将密封线内信息填写完整；选择题用 2B 铅笔填涂，其余题目用黑色签字笔作答。</div>';
  let n = 0;
  const secs = paperSections();

  secs.forEach((s, si) => {
    const sum = s.qs.reduce((a, q) => a + (q.points || 0), 0);
    html += '<div class="p-sec-title">' + CN_NUM[si] + '、' + TYPE_NAMES[s.type] + '<span class="p-sec-sum">（共 ' + s.qs.length + ' 题，' + sum + ' 分）</span></div>';
    s.qs.forEach(q => {
      n++;
      const isShort = (q.parts || []).length <= 2 && q.type !== 'experiment' && q.type !== 'calc';
      let figHtml = '';
      if (q.fig && FIGMAP[q.fig]) { try { figHtml = '<div class="p-fig">' + printifySvg(FIGMAP[q.fig]()) + '</div>'; } catch (e) {} }
      html += '<div class="pq' + (isShort ? ' pq-short' : '') + '">' + figHtml + '<div class="p-stem">' + n + '. ' + esc(q.stem) + '（' + q.points + '分）</div>';
      (q.parts || []).forEach(p => {
        if (p.q) html += '<div>' + esc(p.q) + '</div>';
        if (p.kind === 'choice' || p.kind === 'multi') {
          html += printChoiceOpts(p) + '<div>答：（　　）</div>';
        } else if (p.kind === 'blank') {
          html += '<div>' + (p.blanks || []).map(b => esc(b.label || '空') + '：<span class="p-blankline"></span>' + (b.unit ? esc(b.unit) : '')).join('　') + '</div>';
        } else if (p.kind === 'open') {
          html += '<div class="p-writearea"></div>';
        }
      });
      html += '</div>';
    });
  });

  if (includeAnswers) {
    let m = 0;
    html += '<div class="p-anspage"><h2>参考答案</h2>';
    secs.forEach(s => s.qs.forEach(q => {
      m++;
      (q.parts || []).forEach((p, pi) => {
        let a = '';
        if (p.kind === 'choice') a = letterOf(p.answer);
        else if (p.kind === 'multi') a = (p.answer || []).map(letterOf).join('');
        else if (p.kind === 'blank') a = (p.blanks || []).map(b => (b.answer || [])[0] + (b.unit ? ' ' + b.unit : '')).join('；');
        else if (p.kind === 'open') a = '见解析（开放/计算题）';
        html += '<div class="p-ans-item">' + m + (q.parts.length > 1 ? '(' + (pi + 1) + ')' : '') + '. ' + esc(a) +
          (p.analysis ? '<div class="p-analysis">【解析】' + p.analysis + '</div>' : '') + '</div>';
      });
    }));
    html += '</div>';
  }
  html += '</div>';
  return html;
}
function doPrint(includeAnswers) {
  const area = document.getElementById('printArea');
  area.innerHTML = buildPrint(includeAnswers);
  window.print();
}

/* ================= 组卷配置屏逻辑 ================= */
function getChapters() {
  return $all('.chbox').filter(b => b.checked).map(b => +b.value);
}
function syncScopeUI() {
  const cs = getChapters();
  document.getElementById('startBtn').disabled = !cs.length;
  document.getElementById('scopeHint').textContent = cs.length ? '' : '请至少勾选一个章节';
}
function getN() { return +document.getElementById('nSlider').value; }
function getMixUI() {
  return {
    choice: +document.getElementById('mixChoice').value || 0,
    multi: +document.getElementById('mixMulti').value || 0,
    blank: +document.getElementById('mixBlank').value || 0,
    experiment: +document.getElementById('mixExp').value || 0,
    calc: +document.getElementById('mixCalc').value || 0
  };
}
function syncMixUI(N) {
  const m = defaultMix(N);
  document.getElementById('mixChoice').value = m.choice;
  document.getElementById('mixMulti').value = m.multi;
  document.getElementById('mixBlank').value = m.blank;
  document.getElementById('mixExp').value = m.experiment;
  document.getElementById('mixCalc').value = m.calc;
  updateMixHint(N);
}
function updateMixHint(N) {
  const m = getMixUI();
  const sum = m.choice + m.multi + m.blank + m.experiment + m.calc;
  document.getElementById('mixHint').textContent = '配比合计 ' + sum + ' 题' + (sum === N ? '' : '（≠题量 ' + N + '，将自动补齐/裁剪）');
}
function switchScreen(id) {
  ['screenSetup', 'screenExam', 'screenResult'].forEach(s => {
    document.getElementById(s).hidden = (s !== id);
  });
}
function startExam(seed) {
  const chapters = getChapters();
  if (!chapters.length) { alert('请至少勾选一个章节'); return; }
  const N = getN();
  const mix = getMixUI();
  const mode = ($1('input[name="gradeMode"]:checked') || {}).value || 'submit';
  const paper = drawPaper(POOL, { chapters, N, seed, mix });
  if (!paper.length) { alert('当前范围题池为空，无法组卷'); return; }
  EX = { chapters, N: paper.length, mix, mode, seed, paper, answers: {}, open: {}, cpSel: {}, done: {}, submitted: false };
  MULTI_SEL = {};
  saveEX();
  switchScreen('screenExam');
  renderExam();
  window.scrollTo(0, 0);
}
function newSeed() {
  if (!EX) return;
  startExam(EX.seed + 1);
}

/* 蔡总反馈15：初始恒进「选择范围」勾选屏——旧卷只作控件预填，恢复作答须用户显式点「继续上次组卷」 */
let RESUME_EX = null;
function restoreSetupFrom(saved) {
  if (!saved) return;
  if (Array.isArray(saved.chapters) && saved.chapters.length) {
    $all('.chbox').forEach(b => { b.checked = saved.chapters.includes(+b.value); });
  }
  if (saved.N) {
    document.getElementById('nSlider').value = saved.N;
    document.getElementById('nLabel').textContent = saved.N;
    $all('.preset').forEach(b => b.classList.toggle('on', +b.dataset.n === +saved.N));
  }
  const MIX_IDS = { choice:'mixChoice', multi:'mixMulti', blank:'mixBlank', experiment:'mixExp', calc:'mixCalc' };
  if (saved.mix) Object.keys(MIX_IDS).forEach(t => {
    const inp = document.getElementById(MIX_IDS[t]);
    if (inp && saved.mix[t] != null) inp.value = saved.mix[t];
  });
  if (saved.mode) $all('input[name="gradeMode"]').forEach(r => { r.checked = (r.value === saved.mode); });
}
function resumeSaved() {
  if (!RESUME_EX) return;
  EX = RESUME_EX;
  switchScreen('screenExam');
  renderExam();
  window.scrollTo(0, 0);
}
/* 回到设置屏时同步「继续上次组卷」指向当前卷，避免恢复出更早一份而丢掉刚做的 */
function syncResumeBtn() {
  const btn = document.getElementById('resumeBtn');
  if (!btn) return;
  if (EX) RESUME_EX = EX;
  btn.hidden = !RESUME_EX;
  if (RESUME_EX) {
    btn.textContent = '继续上次组卷（' + RESUME_EX.N + ' 题' + (RESUME_EX.submitted ? '，已交卷' : '') + '）';
  }
}

function initSetup() {
  const r = collectPool();
  POOL = r.pool; FIGMAP = r.figs; IS_SAMPLE = r.sample;
  document.getElementById('poolInfo').textContent = r.sample
    ? '⚠ qbank 数据文件尚未载入，当前使用 SAMPLE 兜底题库（' + POOL.length + ' 题，仅第1~6章样例）自测。'
    : '';
  syncMixUI(getN());

  $all('.chbox').forEach(b => b.addEventListener('change', syncScopeUI));
  document.getElementById('selAllBtn').addEventListener('click', () => {
    $all('.chbox').forEach(b => { b.checked = true; });
    syncScopeUI();
  });
  document.getElementById('selNoneBtn').addEventListener('click', () => {
    $all('.chbox').forEach(b => { b.checked = false; });
    syncScopeUI();
  });
  syncScopeUI();
  document.getElementById('nSlider').addEventListener('input', e => {
    document.getElementById('nLabel').textContent = e.target.value;
    $all('.preset').forEach(b => b.classList.toggle('on', +b.dataset.n === +e.target.value));
    syncMixUI(+e.target.value);
  });
  $all('.preset').forEach(b => b.addEventListener('click', () => {
    document.getElementById('nSlider').value = b.dataset.n;
    document.getElementById('nLabel').textContent = b.dataset.n;
    $all('.preset').forEach(x => x.classList.toggle('on', x === b));
    syncMixUI(+b.dataset.n);
  }));
  ['mixChoice','mixMulti','mixBlank','mixExp','mixCalc'].forEach(id =>
    document.getElementById(id).addEventListener('input', () => updateMixHint(getN())));
  document.getElementById('mixReset').addEventListener('click', () => syncMixUI(getN()));
  document.getElementById('startBtn').addEventListener('click', () => startExam(Math.floor(Math.random() * 100000)));
  document.getElementById('resumeBtn').addEventListener('click', resumeSaved);

  document.getElementById('newSeedBtn').addEventListener('click', newSeed);
  document.getElementById('backSetupBtn').addEventListener('click', () => { switchScreen('screenSetup'); syncResumeBtn(); });
  document.getElementById('submitExamBtn').addEventListener('click', () => {
    if (confirm('确认交卷？未作答的客观题将按 0 分判。')) submitExam();
  });
  document.getElementById('printBtn').addEventListener('click', () => doPrint(document.getElementById('printAnsChk').checked));
  document.getElementById('resultNewBtn').addEventListener('click', newSeed);
  document.getElementById('resultBackBtn').addEventListener('click', () => { switchScreen('screenSetup'); syncResumeBtn(); });
  document.getElementById('resultPrintBtn').addEventListener('click', () => doPrint(document.getElementById('resultPrintAnsChk').checked));

  /* 蔡总反馈15：不再自动切到作答屏；旧卷（seed 固定，刷新不跳题）改为预填 + 显式「继续上次组卷」 */
  RESUME_EX = loadEX();
  restoreSetupFrom(RESUME_EX);
  syncScopeUI();
  updateMixHint(getN());
  syncResumeBtn();
  switchScreen('screenSetup');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initSetup);
}

/* Node 自测出口（/tmp/p1_drawtest.js 用） */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLE, collectPool, mulberry32, defaultMix, diffQuota, drawPaper, norm, sameSet, gradePart, gradeQuestion, sectionsOf, printifySvg };
}
