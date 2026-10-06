/* ===== 本章练习题库（第四章 光现象） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 第3节、第4节题目完成后在数组末尾【追加位】直接追加新题对象即可，页面自动渲染。
 * 依据：docs/c4s12-transcript.md（P92 练习与应用 5 题、P97 练习与应用 5 题）。
 */
const QUESTIONS = [
  { id:'c4s1q1', section:'第1节 光的直线传播', no:'教材 P92 练习与应用 第1题（图 4.1-9）', points:10,
    stem:'做一做手影游戏（图4.1-9），用光的直线传播知识解释手影是怎样形成的。',
    note:'本题配图（手影，图4.1-9）不硬画，以文字说明为主；原图细节以教材印刷为准。本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 光在同种均匀介质中沿直线传播；<br>② 灯发出的光沿直线传播，手（不透明物体）挡住了照向墙的一部分光；<br>③ 被手挡住光线的墙面区域得不到光，形成暗区，即手影。',
      analysis:'手影成因：光沿直线传播 + 不透明物体遮挡形成影子（暗区）。' }] },

  { id:'c4s1q2', section:'第1节 光的直线传播', no:'教材 P92 练习与应用 第2题', points:10,
    stem:'"立竿见影"这个成语大家都很熟悉。请根据光的直线传播知识说明为什么"立竿见影"。',
    note:'⚠️ 转录原文成语末字存疑（原文疑为"立竿见影"），本题干按成语通行写法处理。本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 太阳光（光）在同种均匀介质（空气）中沿直线传播；<br>② 竖直的竿（不透明物体）挡住了太阳照向地面的部分光；<br>③ 竿后面的地面得不到太阳光，形成与竿形状对应的暗区，即影，因此"立竿"即可"见影"。',
      analysis:'同手影逻辑：光沿直线传播，不透明竿挡住光，竿后地面成暗区（影）。' }] },

  { id:'c4s1q3', section:'第1节 光的直线传播', no:'教材 P92 练习与应用 第3题', points:10,
    stem:'举出一些例子，说明光的直线传播在生活中的应用。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（答出 2~3 个合理例子即可）：<br>① 激光准直（隧道、掘进方向标定）；<br>② 三点一线瞄准（射击、排桌椅时的目测对直）；<br>③ 影子、皮影戏、手影游戏；<br>④ 日食、月食的形成；<br>⑤ 小孔成像。',
      analysis:'判断标准：例子确实利用了"光沿直线传播"这一规律。' }] },  { id:'c4s1q4', section:'第1节 光的直线传播', no:'教材 P92 练习与应用 第4题', points:12,
    stem:'太阳发出的光，大约要经过8 min才能到达地球。请估算太阳到地球的距离。如果一辆赛车以500 km/h的速度不停地跑，它要经过多长时间才能跑完这样长的距离？',
    note:'本题含计算，提交后即时判分（近似值即可）。参考数据：光速 c ≈ 3×10⁵ km/s，8 min = 480 s。',
    parts:[
      { kind:'blank', q:'① 太阳到地球的距离约是多少千米？', blanks:[
        { label:'太阳到地球距离', answer:['1.44×10⁸','1.44e8','1.5×10⁸','1.5e8','144000000','1.44×108','1.5×108'], unit:'km' }],
        analysis:'s = c×t = 3×10⁵ km/s × (8×60 s) = 3×10⁵ × 480 = 1.44×10⁸ km ≈ 1.5×10⁸ km（约1.5亿 km）。' },
      { kind:'blank', q:'② 赛车以 500 km/h 不停跑完这段距离，约需多长时间？', blanks:[
        { label:'赛车所需时间', answer:['2.88×10⁵','2.88e5','288000','33','32.9','约33年','约33'], unit:'h（约33年）' }],
        analysis:'t = s/v = 1.44×10⁸ km ÷ 500 km/h = 2.88×10⁵ h；又 2.88×10⁵ h = 1.2×10⁴ 天 ≈ 32.9 年（约33年）。' }
    ] },

  { id:'c4s1q5', section:'第1节 光的直线传播', no:'教材 P92 练习与应用 第5题', points:10,
    stem:'请你比较光在玻璃、水、空气中传播速度的大小，并由此猜想光在固体、液体、气体中传播速度的大小关系。通过查阅资料，检验你的猜想。',
    note:'本题第一部分为客观排序题，第二部分为开放猜想题。参考：光在真空（空气）中为 c，在水中约 3/4 c，在玻璃中约 2/3 c。',
    parts:[
      { kind:'choice', q:'① 光在空气、水、玻璃中传播速度大小的正确排序是（从大到小）：',
        opts:['空气 > 水 > 玻璃','玻璃 > 水 > 空气','水 > 空气 > 玻璃','空气 > 玻璃 > 水'], answer:0,
        analysis:'真空（空气）中光速最大为 c；水中约为 3/4 c；玻璃中约为 2/3 c。因为 c > 3/4 c > 2/3 c，所以空气 > 水 > 玻璃。' },
      { kind:'open', q:'② 由此猜想光在固体、液体、气体中传播速度的大小关系，并查阅资料检验你的猜想。',
        ref:'参考思路：<br><b>猜想</b>：光在<b>气体</b>中传播速度最大，<b>液体</b>中次之，<b>固体</b>中最小（气体 > 液体 > 固体）。<br><b>检验</b>：这是由"光在空气(气体) > 水(液体) > 玻璃(固体)依次变慢"归纳出的猜想，需查阅更多物质的光速数据来检验；不同物质需具体比较，不能简单一概而论。',
        analysis:'一般规律：介质越"致密"光速越慢，真空最快；这是定性规律，需查具体数据验证。' }
    ] },
  { id:'c4s2q1', section:'第2节 光的反射', no:'教材 P97 练习与应用 第1题', points:12,
    stem:'光与镜面成30°角射在平面镜上，反射角是多少？试画出反射光线，标出入射角和反射角。如果光垂直射到平面镜上，反射光如何射出？画图表示出来。',
    note:'配图由程序化反射简图（光线/法线/角度）呈现，原图细节以教材印刷为准。作图部分供参考，本页考查反射角计算与垂直入射判断。',
    fig:'reflectionRule', figCap:'反射定律简图：入射光线与镜面成 30° 角，法线 ON 垂直镜面，入射角 i = 反射角 r = 60°',
    parts:[
      { kind:'blank', q:'① 光与镜面成 30° 角入射时，反射角是多少？', blanks:[
        { label:'反射角', answer:['60'], unit:'°' }],
        analysis:'入射角是入射光线与法线的夹角，光与镜面成 30° 角，则入射角 = 90° − 30° = 60°。由反射定律，反射角 = 入射角 = 60°。' },
      { kind:'choice', q:'② 如果光垂直射到平面镜上，反射光如何射出？',
        opts:['沿原路（垂直镜面）反射回去','向任意方向反射','不发生反射'], answer:0,
        analysis:'垂直入射时，入射光与法线重合，入射角 = 0°，反射角 = 0°，反射光也沿法线方向（垂直镜面）沿原路反射回去。' }
    ] },

  { id:'c4s2q2', section:'第2节 光的反射', no:'教材 P97 练习与应用 第2题（图 4.2-8）', points:10,
    stem:'自行车尾灯内部的角反射器由多组互相垂直的小平面镜组成。光射入角反射器经过两次反射后，沿什么方向射出？为什么夜间无论从哪个方向照射尾灯都很亮？',
    note:'原题要求在图上画出反射光线，电子版无法作图，改为文字作答，知识点相同。下图为角反射器两次反射程序化简图，原图细节以教材印刷为准。',
    fig:'cornerReflector', figCap:'角反射器简图：一束入射光经两次反射后沿与人射方向平行的反向射出',
    parts:[{ kind:'blank', blanks:[
      { label:'光射入角反射器经两次反射后，沿与入射方向___的方向射出', answer:['平行反向','反向平行','原路返回','与入射方向平行且相反','平行且反向','沿与入射方向平行的反向射出'], unit:'' }],
      analysis:'角反射器由互相垂直的两平面镜组成。光射到第一面镜上反射（反射角=入射角），再射到第二面镜上反射（同样遵从反射定律）。两次反射后，出射光线与入射光线方向<b>平行且相反</b>（即沿原路反射回光源方向），所以夜间无论从哪个方向照射尾灯，反射光都能反向射回，看起来都很亮。' }] },

  { id:'c4s2q3', section:'第2节 光的反射', no:'教材 P97 练习与应用 第3题（图 4.2-9）', points:12,
    stem:'太阳光与水平面成 30° 角射向井口。如何利用一块平面镜使太阳光竖直射入井中？请计算：①反射角是多少度？②平面镜应与水平面成多大夹角？',
    note:'原题要求通过作图标出平面镜位置与反射角，电子版无法作图，改为文字作答，知识点相同。原图 4.2-9 条件见下方简图。',
    fig:'wellMirror', figCap:'井口条件简图：太阳光与水平成 30° 斜射向竖直井口',
    parts:[{ kind:'blank', blanks:[
      { label:'①反射角', answer:['30'], unit:'°' },
      { label:'②平面镜与水平面夹角', answer:['60'], unit:'°' }],
      analysis:'入射光与水平面成 30°，反射光竖直向下。入射光线与竖直向下方向夹角为 90°−30°=60°。法线平分入射光与反射光夹角，故入射角=反射角=60°÷2=30°。镜面与法线垂直，法线与水平成 30°+30°=60°（即平分60°后法线在入射光与竖直反射光中间，与水平成60°），故镜面与竖直（法线方向）垂直而与水平面成 60° 角。' }] },

  { id:'c4s2q4', section:'第2节 光的反射', no:'教材 P97 练习与应用 第4题', points:10,
    stem:'雨后天晴的夜晚，为了不踩到地上的积水，人们根据生活经验判断：迎着月光走，地上发亮的是水；背着月光走，地上发暗的是水。请你依据所学的光的反射知识进行解释。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 月光照到水面上，水面光滑，发生<b>镜面反射</b>；照到路面上，路面粗糙，发生<b>漫反射</b>；<br>② 迎着月光走：水面的镜面反射光集中射向人眼方向、很强 → 水看起来<b>亮</b>；路面漫反射光散向各个方向、进入人眼的少 → 路面看起来<b>暗</b>，所以发亮的是水；<br>③ 背着月光走：水面镜面反射光沿规律射向远离人眼的方向，几乎不进人眼 → 水看起来<b>暗</b>；路面漫反射仍有部分光进人眼 → 相对较亮，所以发暗的是水。',
      analysis:'核心：镜面反射光方向规则（强但方向单一），漫反射各方向都有（弱但多方向）。判断人眼站在哪个方向决定了"亮还是暗"。' }] },
  { id:'c4s2q5', section:'第2节 光的反射', no:'教材 P97 练习与应用 第5题', points:12,
    stem:'激光测距技术广泛应用在人造地球卫星测控、大地测量等方面。例如，激光测距站向目标天体发射激光束，并接收反射回来的激光束，测出激光往返所用的时间，就可以算出所测天体与地球之间的距离。已知一束激光从激光测距仪发出并射向月球，大约经过2.56 s被反射回来，则地球到月球的距离大约是多少千米？',
    note:'本题含计算，提交后即时判分（近似值即可）。参考数据：光速 c = 3×10⁵ km/s，激光往返时间 2.56 s。',
    parts:[{ kind:'blank', blanks:[
      { label:'地球到月球的距离', answer:['3.84×10⁵','3.84e5','384000','38.4万','3.84×105','约38.4万'], unit:'km' }],
      analysis:'单程时间 t/2 = 2.56 s ÷ 2 = 1.28 s；距离 s = c×(t/2) = 3×10⁵ km/s × 1.28 s = 3.84×10⁵ km（约38.4万 km）。关键：往返时间要除以 2 取单程。' }] },

]; // 闭合 QUESTIONS 数组（现含第1、2节共10题）
// =====【追加位】第3节 第4节 题目完成后在此追加：数组末尾直接追加新题对象，页面自动渲染 =====

/* ===== 状态与持久化 ===== */
const STORAGE_KEY = 'c4_practice_state_v1';
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
  return String(s == null ? '' : s).replace(/[＋]/g, '+').replace(/[－]/g, '-').replace(/[。．]/g, '').replace(/\s/g, '').trim();
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function $1(sel, el) { return (el || document).querySelector(sel); }
function $all(sel, el) { return Array.from((el || document).querySelectorAll(sel)); }

/* ===== 程序化插图 ===== */
const FIGURES = {
  reflectionRule: svgReflectionRule,
  cornerReflector: svgCornerReflector,
  wellMirror: svgWellMirror
};

function svgReflectionRule() {
  const OX = 230, OY = 250;
  // 镜面：水平线
  let s = `<line x1="30" y1="${OY}" x2="430" y2="${OY}" stroke="#9aa4b5" stroke-width="4"/>`;
  s += `<text x="440" y="${OY + 16}" fill="#6b7686" font-size="11">镜面</text>`;
  // 法线 ON：竖直虚线
  s += `<line x1="${OX}" y1="45" x2="${OX}" y2="${OY}" stroke="#ffd479" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  s += `<text x="${OX + 8}" y="60" fill="#ffd479" font-size="12">N（法线）</text>`;
  // 入射光（与镜面成30°，即与水平成30°）：从左上到 O
  const ix = OX - 150 * Math.cos(30 * Math.PI / 180);
  const iy = OY - 150 * Math.sin(30 * Math.PI / 180);
  s += `<line x1="${ix}" y1="${iy}" x2="${OX}" y2="${OY}" stroke="#ff7a6e" stroke-width="2.5"/>`;
  s += `<text x="${ix - 24}" y="${iy + 18}" fill="#ff7a6e" font-size="12">入射光线</text>`;
  // 反射光（右下到右上）
  const rx = OX + 150 * Math.cos(30 * Math.PI / 180);
  const ry = OY - 150 * Math.sin(30 * Math.PI / 180);
  s += `<line x1="${OX}" y1="${OY}" x2="${rx}" y2="${ry}" stroke="#5ad7ff" stroke-width="2.5"/>`;
  s += `<text x="${rx + 4}" y="${ry + 30}" fill="#5ad7ff" font-size="12">反射光线</text>`;
  // 角度标注：入射角 i（法线与入射光之间，60°），反射角 r
  s += `<text x="${OX - 44}" y="${OY - 54}" fill="#ffd479" font-size="13" font-weight="700">i=60°</text>`;
  s += `<text x="${OX + 16}" y="${OY - 54}" fill="#ffd479" font-size="13" font-weight="700">r=60°</text>`;
  s += `<text x="${OX - 60}" y="${OY - 12}" fill="#9aa4b5" font-size="11">30°</text>`;
  s += `<text x="${OX}" y="${OY - 12}" fill="#d7dee9" font-size="11">O</text>`;
  return `<svg viewBox="0 0 460 300" role="img" aria-label="反射定律简图：入射角=反射角=60°">${s}</svg>`;
}

function svgCornerReflector() {
  const O = { x: 300, y: 200 };
  const cosA = Math.cos(30 * Math.PI / 180), tanA = Math.tan(30 * Math.PI / 180);
  const L = 160;
  // 镜面1竖直(x=300)、镜面2水平(y=200)，交于角点 O，两镜严格垂直(90°)
  // 入射光 v=(cos30,sin30) 击中镜面1于点 P1：
  const P1 = { x: O.x, y: 140 };
  const S = { x: P1.x - L * cosA, y: P1.y - L * 0.5 }; // 入射起点(左上)
  // 镜面1反射(法线 n=(-1,0))：v1 = v - 2(v·n)n = (-cos30, sin30)，向左下
  const P2 = { x: P1.x - (O.y - P1.y) / tanA, y: O.y }; // 镜面2上的反射点
  // 镜面2反射(法线 n=(0,-1))：v2 = (-cos30, -sin30) = -v，严格反平行
  const E = { x: P2.x - L * cosA, y: P2.y - L * 0.5 }; // 出射终点(左上)
  let s = '';
  s += `<line x1="${O.x}" y1="40" x2="${O.x}" y2="${O.y}" stroke="#9aa4b5" stroke-width="4"/>`;
  s += `<line x1="130" y1="${O.y}" x2="${O.x}" y2="${O.y}" stroke="#9aa4b5" stroke-width="4"/>`;
  s += `<circle cx="${O.x}" cy="${O.y}" r="3" fill="#ffd479"/>`;
  s += `<text x="${O.x + 8}" y="105" fill="#6b7686" font-size="11">镜面1</text>`;
  s += `<text x="200" y="${O.y + 18}" fill="#6b7686" font-size="11">镜面2</text>`;
  s += `<line x1="${S.x}" y1="${S.y}" x2="${P1.x}" y2="${P1.y}" stroke="#ff7a6e" stroke-width="2.5"/>`;
  s += `<text x="${S.x - 80}" y="${S.y + 10}" fill="#ff7a6e" font-size="12">入射光</text>`;
  s += `<line x1="${P1.x}" y1="${P1.y}" x2="${P2.x}" y2="${P2.y}" stroke="#5ad7ff" stroke-width="2.5"/>`;
  s += `<text x="${P1.x - 40}" y="${P1.y + 16}" fill="#9aa4b5" font-size="11">①</text>`;
  s += `<line x1="${P2.x}" y1="${P2.y}" x2="${E.x}" y2="${E.y}" stroke="#5ad7ff" stroke-width="2.5"/>`;
  s += `<text x="${P2.x - 20}" y="${P2.y + 16}" fill="#9aa4b5" font-size="11">②</text>`;
  s += `<text x="${E.x - 40}" y="${E.y - 10}" fill="#5ad7ff" font-size="12">反射光（反向射出）</text>`;
  return `<svg viewBox="0 0 460 260" role="img" aria-label="角反射器两次反射简图：出射光与入射光反向平行">${s}</svg>`;
}

function svgWellMirror() {
  let s = '';
  // 水平面参考线（地面）：虚线
  s += `<line x1="60" y1="90" x2="400" y2="90" stroke="#6b7686" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  s += `<text x="300" y="82" fill="#9aa4b5" font-size="11">水平面</text>`;
  // 井壁：两条竖直米色线（井口朝上）
  s += `<line x1="160" y1="90" x2="160" y2="275" stroke="#cbb994" stroke-width="6"/>`;
  s += `<line x1="330" y1="90" x2="330" y2="275" stroke="#cbb994" stroke-width="6"/>`;
  s += `<text x="138" y="182" fill="#9aa4b5" font-size="11">井壁</text>`;
  // 太阳光：与水平成30°从左上射向井口
  s += `<line x1="60" y1="20" x2="181" y2="90" stroke="#ff7a6e" stroke-width="2.5"/>`;
  s += `<text x="40" y="42" fill="#ff7a6e" font-size="12">太阳光</text>`;
  s += `<text x="148" y="58" fill="#ffd479" font-size="12">30°</text>`;
  return `<svg viewBox="0 0 460 290" role="img" aria-label="井口条件简图：太阳光与水平成30°斜射向竖直井口">${s}</svg>`;
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
  const tbtn = $1('.ref-toggle', el);
  if (tbtn) tbtn.textContent = '收起参考答案';
  const key = el.dataset.key;
  if (key) STATE.open[key] = true;
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
  Object.keys(STATE.open).forEach(key => {
    if (!STATE.open[key] || STATE.done[key]) return;
    const el = $1(`.part[data-key="${key}"]`);
    if (!el) return;
    $1('.ref', el).classList.add('show');
    $1('.selfrow', el).classList.add('show');
    const tbtn = $1('.ref-toggle', el);
    if (tbtn) tbtn.textContent = '收起参考答案';
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
  const shown = $1('.ref', el).classList.toggle('show');
  $1('.selfrow', el).classList.toggle('show');
  btn.textContent = shown ? '收起参考答案' : '查看参考答案';
  STATE.open[`${qid}_${pi}`] = shown;
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
    summary.innerHTML = `<div class="stem">🎉 本章练习全部完成！</div><div class="pp">10 / 10 题已作答，当前总得分 <b style="color:#ffd479">${total} 分</b>。继续加油！</div>`;
    root.appendChild(summary);
  } else if (summary) {
    summary.querySelector('b').textContent = total + ' 分';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initState();
  renderQuiz();
});
