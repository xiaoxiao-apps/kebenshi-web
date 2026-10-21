/* ===== 本章练习题库（第四章 光现象） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 第3节、第4节题目完成后在数组末尾【追加位】直接追加新题对象即可，页面自动渲染。
 * 题目为围绕本章各节知识点编写的原创练习题；配图均为程序化简图。
 */
const QUESTIONS = [
  { id:'c4s1q1', section:'第1节 光的直线传播', no:'第1题', points:10,
    stem:'周末的社区活动室里，小雨把一盏台灯对着白墙摆放，再用双手在灯前比出一只"小兔"，墙上立刻出现了兔形的黑影。请用光沿直线传播的知识解释：墙上的手影是怎样形成的？',
    note:'本题不配插图，以文字作答为主。本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 光在同种均匀介质中沿直线传播；<br>② 台灯发出的光沿直线射向墙面，不透明的双手挡住了其中一部分光线；<br>③ 被手挡住的墙面区域得不到光照，形成与手形轮廓对应的暗区，这就是手影。',
      analysis:'影子成因 = 光沿直线传播 + 不透明物体遮挡：光照不到的区域形成暗区（影）。' }] },

  { id:'c4s1q2', section:'第1节 光的直线传播', no:'第2题', points:10,
    stem:'成语"立竿见影"的意思是：把竿子竖立起来，马上就能看到它的影子。请依据光沿直线传播的知识，说明为什么"立竿"就能"见影"。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 太阳光在同种均匀介质（空气）中沿直线传播；<br>② 竖直立起的竿是不透明物体，挡住了射向其身后地面的部分阳光；<br>③ 竿后方的地面得不到光照，形成与竿的形状对应的暗区——影子，所以竿子一立起来，影子马上就出现。',
      analysis:'与手影同理：光沿直线传播，不透明的竿挡住光线，竿后地面出现暗区（影）。' }] },

  { id:'c4s1q3', section:'第1节 光的直线传播', no:'第3题', points:10,
    stem:'请举出两三个实例，说明光沿直线传播这一规律在生产生活中有哪些应用。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点（写出 2~3 个合理实例即可）：<br>① 激光准直：隧道掘进、管线铺设时用激光束标定方向；<br>② "三点一线"瞄准：射击瞄准、排队看齐；<br>③ 影子的利用与成因：皮影戏、手影表演、日晷；<br>④ 日食与月食的形成；<br>⑤ 小孔成像。',
      analysis:'判断依据：实例是否真正利用了"光在同种均匀介质中沿直线传播"的规律。' }] },  { id:'c4s1q4', section:'第1节 光的直线传播', no:'第4题', points:12,
    stem:'小明查阅天文资料得知：太阳发出的光大约要经过 8 min 才能到达地球。请据此估算太阳到地球的距离。若一辆赛车以 500 km/h 的速度昼夜不停地行驶，跑完这样长的距离大约需要多长时间？',
    note:'本题含计算，提交后即时判分（填近似值即可）。可用数据：光速 c ≈ 3×10⁵ km/s，8 min = 480 s。',
    parts:[
      { kind:'blank', q:'① 太阳与地球之间的距离约为多少千米？', blanks:[
        { label:'太阳到地球距离', answer:['1.44×10⁸','1.44e8','1.5×10⁸','1.5e8','144000000','1.44×108','1.5×108'], unit:'km' }],
        analysis:'s = c·t = 3×10⁵ km/s × 480 s = 1.44×10⁸ km ≈ 1.5×10⁸ km（约 1.5 亿千米）。' },
      { kind:'blank', q:'② 赛车以 500 km/h 昼夜不停地行驶，跑完这段距离约需多长时间？', blanks:[
        { label:'赛车所需时间', answer:['2.88×10⁵','2.88e5','288000','33','32.9','约33年','约33'], unit:'h（约33年）' }],
        analysis:'t = s/v = 1.44×10⁸ km ÷ 500 km/h = 2.88×10⁵ h；再换算：2.88×10⁵ h = 1.2×10⁴ 天 ≈ 32.9 年（约 33 年）。' }
    ] },

  { id:'c4s1q5', section:'第1节 光的直线传播', no:'第5题', points:10,
    stem:'光在玻璃、水、空气中的传播速度哪个大、哪个小？请先作出比较，再由此猜想光在固体、液体、气体中传播速度的大小关系，最后通过查阅资料检验你的猜想。',
    note:'本题第一部分为客观排序题，第二部分为开放猜想题。可用数据：光在真空（空气）中约为 c，在水中约为 3/4 c，在玻璃中约为 2/3 c。',
    parts:[
      { kind:'choice', q:'① 把光在空气、水、玻璃中的传播速度按从大到小排序，正确的是：',
        opts:['空气 > 水 > 玻璃','玻璃 > 水 > 空气','水 > 空气 > 玻璃','空气 > 玻璃 > 水'], answer:0,
        analysis:'光在真空（空气）中传播最快，约为 c；在水中约为 3/4 c；在玻璃中约为 2/3 c。由 c > 3/4 c > 2/3 c 可知：空气 > 水 > 玻璃。' },
      { kind:'open', q:'② 根据①的比较结果，猜想光在固体、液体、气体中传播速度的大小关系，并说明怎样用资料检验。',
        ref:'参考思路：<br><b>猜想</b>：光在<b>气体</b>中传播最快，<b>液体</b>中次之，<b>固体</b>中最慢（气体 > 液体 > 固体）。<br><b>检验</b>：该猜想由"空气(气体) > 水(液体) > 玻璃(固体)依次变慢"归纳而来，应再查阅更多物质的光速数据加以验证；具体物质要具体比较，不能一概而论。',
        analysis:'定性规律：介质越"致密"，光速越慢，真空中最快；这是猜想性结论，需用具体数据检验。' }
    ] },
  { id:'c4s2q1', section:'第2节 光的反射', no:'第1题', points:12,
    stem:'一束光射向平面镜，与镜面成 30° 角。它的反射角是多少度？请画出反射光线，并标出入射角与反射角。再想一想：当这束光垂直射向镜面时，反射光会沿什么方向射出？画图说明。',
    note:'配图由程序化反射简图（光线/法线/角度）呈现；作图部分供参考，本页考查反射角计算与垂直入射判断。',
    fig:'reflectionRule', figCap:'反射简图：入射光线与镜面成 30° 角，法线 ON 垂直于镜面，入射角 i = 反射角 r = 60°',
    parts:[
      { kind:'blank', q:'① 光与镜面成 30° 角入射时，反射角为多少度？', blanks:[
        { label:'反射角', answer:['60'], unit:'°' }],
        analysis:'入射角指入射光线与法线的夹角。光与镜面成 30° 角，故入射角 = 90° − 30° = 60°；由反射定律，反射角 = 入射角 = 60°。' },
      { kind:'choice', q:'② 光垂直射向平面镜时，反射光沿什么方向射出？',
        opts:['沿原路返回（垂直镜面射出）','朝各个方向散开反射','不会有反射光'], answer:0,
        analysis:'垂直入射时，入射光线与法线重合，入射角 = 0°，反射角也等于 0°，反射光沿法线方向（垂直镜面）按原路返回。' }
    ] },

  { id:'c4s2q2', section:'第2节 光的反射', no:'第2题', points:10,
    stem:'夜间行车时，汽车前灯的光照到公路旁的反光标志牌上，标志牌会显得格外明亮。这类反光装置的核心部件是角反射器——由多组互相垂直的小平面镜组成。光射入角反射器，经过两次反射后沿什么方向射出？为什么无论灯光从哪个方向照射，反光装置都很亮？',
    note:'本题以文字作答（不作图），考查角反射器的反射规律；下图为两次反射的程序化简图。',
    fig:'cornerReflector', figCap:'角反射器简图：一束入射光经两次反射后，沿与入射方向平行且相反的方向射出',
    parts:[{ kind:'blank', blanks:[
      { label:'光进入角反射器经两次反射后，沿与入射方向___的方向射出', answer:['平行反向','反向平行','原路返回','与入射方向平行且相反','平行且反向','沿与入射方向平行的反向射出'], unit:'' }],
      analysis:'角反射器由两块互相垂直的平面镜组成。光先在第一块镜面上反射（反射角=入射角），再在第二块镜面上反射（同样遵循反射定律）。可以证明：两次反射后的出射光线与入射光线<b>平行且方向相反</b>，即沿来路反向射回光源方向。因此夜间无论灯光从哪个方向照来，反射光都能返回观察者眼中，反光装置看起来都很亮。' }] },

  { id:'c4s2q3', section:'第2节 光的反射', no:'第3题', points:12,
    stem:'一口竖直的枯井照不进阳光。某日上午，太阳光与水平地面成 30° 角斜射向井口。怎样才能只用一块平面镜，把太阳光反射成竖直向下的光束照进井里？请计算：①反射角是多少度？②平面镜应与水平地面成多大的夹角？',
    note:'本题以文字作答（不作图），考查反射定律的应用；井口条件见下方程序化简图。',
    fig:'wellMirror', figCap:'条件简图：太阳光与水平面成 30° 角，斜射向竖直的井口',
    parts:[{ kind:'blank', blanks:[
      { label:'①反射角', answer:['30'], unit:'°' },
      { label:'②平面镜与水平面夹角', answer:['60'], unit:'°' }],
      analysis:'入射光与水平面成 30°，反射光竖直向下。入射光线与竖直向下方向夹角为 90°−30°=60°。法线平分入射光与反射光夹角，故入射角=反射角=60°÷2=30°。镜面与法线垂直，法线与水平成 30°+30°=60°（即平分60°后法线在入射光与竖直反射光中间，与水平成60°），故镜面与竖直（法线方向）垂直而与水平面成 60° 角。' }] },

  { id:'c4s2q4', section:'第2节 光的反射', no:'第4题', points:10,
    stem:'晚自习结束后，小宇走在雨后放晴的路上，月光洒满路面，低洼处积了不少水。妈妈提醒他："迎着月光走，地上发亮的地方是水；背着月光走，地上发暗的地方才是水。"请运用光的反射知识，解释妈妈这两句话。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 积水的水面平滑，月光照上去发生<b>镜面反射</b>；路面粗糙，月光照上去发生<b>漫反射</b>；<br>② 迎着月光走：水面的镜面反射光集中射向人眼方向、光很强 → 水面显得<b>亮</b>；路面的漫反射光散向四面八方、进入人眼的较少 → 路面显得<b>暗</b>，故发亮处是水；<br>③ 背着月光走：水面的镜面反射光沿特定方向射向人眼身后，几乎没有光进入人眼 → 水面显得<b>暗</b>；路面漫反射仍有部分光进入人眼、相对较亮，故发暗处是水。',
      analysis:'核心：镜面反射的光方向集中（强而单一），漫反射的光射向各个方向（弱而分散）。人眼所处方向决定了看到的水面和路面谁"亮"谁"暗"。' }] },
  { id:'c4s2q5', section:'第2节 光的反射', no:'第5题', points:12,
    stem:'激光测距在人造卫星测控、大地测量中应用广泛：测距站向目标天体发射激光束，再接收反射回来的激光，测出激光往返所用的时间，就能算出该天体与地球之间的距离。某次测量中，一束激光射向月球，约经过 2.56 s 被反射回来。地球到月球的距离大约是多少千米？',
    note:'本题含计算，提交后即时判分（填近似值即可）。可用数据：光速 c = 3×10⁵ km/s，激光往返时间 2.56 s。',
    parts:[{ kind:'blank', blanks:[
      { label:'地球到月球的距离', answer:['3.84×10⁵','3.84e5','384000','38.4万','3.84×105','约38.4万'], unit:'km' }],
      analysis:'激光往返共用 2.56 s，单程时间 t/2 = 2.56 s ÷ 2 = 1.28 s；距离 s = c·(t/2) = 3×10⁵ km/s × 1.28 s = 3.84×10⁵ km（约 38.4 万千米）。关键：计算单程距离时，往返时间必须先除以 2。' }] },

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
