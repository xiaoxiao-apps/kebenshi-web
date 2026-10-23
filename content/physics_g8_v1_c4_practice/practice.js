/* ===== 本章练习题库（第四章 光现象） =====
 * 结构：QUESTIONS 数组，每题含 section 字段（按节分组渲染）与 parts 数组。
 * part.kind：choice=单选 / blank=填空 / open=开放题（参考答案+自评计分）。
 * 判分：客观题提交即时判分（全对得分）；开放题查看参考答案后自评计分。
 * 第3节、第4节题目完成后在数组末尾【追加位】直接追加新题对象即可，页面自动渲染。
 * 题目为围绕本章各节知识点编写的原创练习题；配图均为程序化简图。
 */
const QUESTIONS = [
  { id:'c4s1q1', section:'第1节 光的直线传播', no:'第1题', points:10,
    stem:'晚上家里突然停电，小林在书桌上点起一支蜡烛。他发现：立在桌上的不透明瓷杯，把它身后的一块墙面"涂"成了一片和杯子轮廓差不多的暗区。请用光沿直线传播的知识解释：墙上的这片暗区是怎样形成的？',
    note:'本题不配插图，以文字作答为主。本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 光在同种均匀介质（空气）中沿直线传播；<br>② 烛焰向四周发出的光沿直线射向墙面，不透明的瓷杯挡住了其中一部分光线；<br>③ 被杯子挡住的墙面得不到光照，形成与杯子轮廓对应的暗区，这就是我们看到的"黑影"。',
      analysis:'暗区（影）成因 = 光沿直线传播 + 不透明物体遮挡：光照不到的区域形成暗区。' }] },

  { id:'c4s1q2', section:'第1节 光的直线传播', no:'第2题', points:10,
    stem:'晴天上午的操场上，小帆站在阳光里，发现身后地面上总拖着一片影子；她走到哪儿，影子就跟到哪儿。请用光沿直线传播的知识解释：影子为什么会"紧跟"着人，它的轮廓又为什么和人身的形状大致对应？',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 阳光在同种均匀介质（空气）中沿直线传播；<br>② 人是不透明物体，挡住了射向其身后地面的部分阳光；<br>③ 被挡区域的地面得不到光照，形成与人轮廓对应的暗区——影子；<br>④ 光沿直线传播，人走到哪里，被挡住光线的区域就随之移到哪里，所以影子"紧跟"着人。',
      analysis:'影子成因：光沿直线传播 + 不透明物体遮挡出暗区；物体位置变，暗区位置随之变。' }] },

  { id:'c4s1q3', section:'第1节 光的直线传播', no:'第3题', points:10,
    stem:'班级举行"身边的光"主题分享会，三位同学各带来一个事例：①工人师傅在隧道掘进时，用一束激光为掘进机标定笔直的前进方向；②演员在幕布后操纵小人，观众从幕布前看到小人的像来回打斗；③摄影师转动调焦环，把远处的风景清晰地"收"进感光元件。这三个事例中，哪些能用"光在同种均匀介质中沿直线传播"来解释？请逐一作出判断并说明理由。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 能——激光束沿直线传播，才能给掘进机标定笔直方向（激光准直）；<br>② 能——光沿直线传播，被不透明的小人挡住后在幕布上留下与小人轮廓对应的暗区，形成"像"（影的利用）；<br>③ 不能——照相机成清晰的像靠的是光的折射（透镜对光的偏折），与直线传播无关。',
      analysis:'判断标准：该现象是否由"光沿直线传播"直接造成；折射成像类现象不属于直线传播的应用。' }] },  { id:'c4s1q4', section:'第1节 光的直线传播', no:'第4题', points:12,
    stem:'我国的"天问一号"探测器飞往火星途中，某时刻地球与火星之间的距离约为 7.8×10⁷ km。①地面控制中心以光速向探测器发送指令信号，信号大约经过多少秒才能到达探测器？②假如一艘航天器以 4 km/s 的速度匀速飞行，飞完这段距离大约需要多少天？',
    note:'本题含计算，提交后即时判分（填近似值即可）。可用数据：光速 c ≈ 3×10⁵ km/s。',
    parts:[
      { kind:'blank', q:'① 指令信号到达探测器约需多少秒？', blanks:[
        { label:'信号传播时间', answer:['260','2.6×10²','2.6e2','260s'], unit:'s' }],
        analysis:'t = s/c = 7.8×10⁷ km ÷ (3×10⁵ km/s) = 260 s（4 min 20 s）。' },
      { kind:'blank', q:'② 航天器以 4 km/s 匀速飞完这段距离约需多少天？', blanks:[
        { label:'飞行时间', answer:['226','225.7','约226天','225.7天','1.95×10⁷','1.95e7','19500000'], unit:'天' }],
        analysis:'t = s/v = 7.8×10⁷ km ÷ 4 km/s = 1.95×10⁷ s；换算：1.95×10⁷ s ÷ 86400 s/天 ≈ 225.7 天（约 226 天，合 7 个多月）。' }
    ] },

  { id:'c4s1q5', section:'第1节 光的直线传播', no:'第5题', points:10,
    stem:'物理兴趣小组从资料中查到光在几种介质中的传播速度：真空 3.0×10⁸ m/s；空气 约3.0×10⁸ m/s；冰 2.30×10⁸ m/s；水 2.25×10⁸ m/s；玻璃 2.0×10⁸ m/s。请根据这组数据完成下面两问。',
    note:'第①问为单选题；第②问为开放题，作答后对照参考要点自评计分。',
    parts:[
      { kind:'choice', q:'① 依据表中数据，下列判断正确的是：',
        opts:['光在任何介质中的传播速度都相同','光在冰中的传播速度比在玻璃中大','光在水中的传播速度比在冰中大','光在空气中的传播速度最慢'], answer:1,
        analysis:'由表：冰 2.30×10⁸ m/s ＞ 玻璃 2.0×10⁸ m/s，B 正确；光在不同介质中速度一般不同，A 错；水 2.25×10⁸ ＜ 冰 2.30×10⁸，C 错；表中最慢的是玻璃，空气与真空几乎相同、最快，D 错。' },
      { kind:'open', q:'② 小航看表后归纳说："光在固体中传播的速度一定比在液体中小。"你同意吗？请用表中两组数据说明你的理由。',
        ref:'参考思路：<br><b>不同意</b>，这个说法过于绝对。<br><b>反例</b>：表中冰是固体、水是液体，而光在冰中的速度为 2.30×10⁸ m/s，反而<b>大于</b>在水中的 2.25×10⁸ m/s，可见"固体中一定比液体中慢"并不成立。<br><b>正确认识</b>：粗略地看，光在真空（空气）中最快，在水中次之，在玻璃等介质中更慢；但具体介质要具体比较数据，不能按固、液、气一概而论。',
        analysis:'用数据检验概括性论断：冰（固）2.30×10⁸ m/s ＞ 水（液）2.25×10⁸ m/s，构成直接反例。' }
    ] },
  { id:'c4s2q1', section:'第2节 光的反射', no:'第1题', points:12,
    stem:'物理兴趣小组用激光笔和平放在桌面的平面镜做光的反射实验。第一次，光束以 55° 的入射角射到镜面上。①此时反射角是多少度？②接着他们把激光笔垫高，使光束"立"起来一些，入射角减小了 15°。此时光束与镜面成多大的角？',
    note:'配图由程序化反射简图（光线/法线/角度）呈现；作图部分供参考，本页考查反射角计算与入射角、镜面夹角的关系判断。',
    fig:'reflectionRule',
    parts:[
      { kind:'blank', q:'① 光束以 55° 的入射角射到镜面时，反射角为多少度？', blanks:[
        { label:'反射角', answer:['55'], unit:'°' }],
        analysis:'反射定律：反射角等于入射角。入射角为 55°，故反射角也是 55°。' },
      { kind:'choice', q:'② 入射角减小 15° 后，光束与镜面所成的角是多少度？',
        opts:['40°','50°','70°','75°'], answer:1,
        analysis:'新的入射角 = 55° − 15° = 40°。入射光线与镜面的夹角和入射角互余：90° − 40° = 50°，故选 B。' }
    ] },

  { id:'c4s2q2', section:'第2节 光的反射', no:'第2题', points:10,
    stem:'港口的航标浮灯要让各个方向驶来的船都能看见它。工程师把多组互相垂直的小平面镜组成的角反射器（程序化简图见下）装进灯罩：船的灯光射入角反射器，会在两块互相垂直的镜面上先后发生两次反射。两次反射后，出射光与入射光的位置关系是___；请结合这一关系说明：为什么浮灯对任何方向驶来的船都醒目可见？',
    note:'本题以文字作答（不作图），考查角反射器的反射规律；下图为两次反射的程序化简图。',
    fig:'cornerReflector',
    parts:[{ kind:'blank', blanks:[
      { label:'两次反射后，出射光与入射光___', answer:['平行反向','反向平行','原路返回','与入射方向平行且相反','平行且反向','沿与入射方向平行的反向射出'], unit:'' }],
      analysis:'角反射器由两块互相垂直的平面镜组成。光先在第一块镜面上反射（反射角=入射角），再在第二块镜面上反射（同样遵循反射定律）。可以证明：两次反射后的出射光线与入射光线<b>平行且方向相反</b>，即沿来路反向射回光源方向。因此不管船从哪个方向驶来、灯光以多大角度照上浮灯，反射光都会回到船上观察者眼中，浮灯看起来格外醒目。' }] },

  { id:'c4s2q3', section:'第2节 光的反射', no:'第3题', points:12,
    stem:'小区地下的水泵站只有一口竖直通向地面的采光井，站内终日不见阳光。某日上午，太阳光与水平地面成 50° 角斜射向井口。工人师傅想在井口斜放一块平面镜，把太阳光反射成竖直向下的光束送进井底。请计算：①反射角是多少度？②平面镜应与水平地面成多大的夹角？',
    note:'本题以文字作答（不作图），考查反射定律的应用；井口条件见下方程序化简图。',
    fig:'wellMirror',
    parts:[{ kind:'blank', blanks:[
      { label:'①反射角', answer:['70'], unit:'°' },
      { label:'②平面镜与水平面夹角', answer:['70'], unit:'°' }],
      analysis:'入射光与水平面成 50°，反射光竖直向下，入射光线与反射光线之间的夹角（含法线一侧）= 50° + 90° = 140°。法线平分该夹角，故入射角 = 反射角 = 140° ÷ 2 = 70°。法线与反射光（竖直向下）的夹角等于反射角 70°，故法线与水平面成 90° − 70° = 20°；镜面与法线垂直，所以镜面与水平面成 90° − 20° = 70° 角。' }] },

  { id:'c4s2q4', section:'第2节 光的反射', no:'第4题', points:10,
    stem:'夜里，小通骑自行车回家，一辆汽车开着大灯跟在他身后。他发现一个奇怪的现象：车灯把前方的路面照亮后，粗糙的沥青路面看起来挺亮，路中央光滑的标线涂料反而像一条条暗带。请用镜面反射和漫反射的知识解释这一现象。',
    note:'本题为开放题，作答后对照参考要点自评计分。',
    parts:[{ kind:'open',
      ref:'参考要点：<br>① 沥青路面粗糙，车灯的光照上去发生<b>漫反射</b>，反射光散向各个方向，其中一部分进入前方骑车人小通的眼睛 → 路面看起来<b>亮</b>；<br>② 标线涂料表面光滑，车灯的光照上去发生<b>镜面反射</b>，反射光集中朝前（沿汽车前进方向）射出；<br>③ 小通处在车灯前方，镜面反射的光几乎不会折返进入他的眼睛 → 标线看起来<b>暗</b>，像一条条暗带。',
      analysis:'核心：漫反射的光射向各个方向，观察者在哪都能收到一部分；镜面反射的光集中在特定方向，只有处在该方向上的观察者才觉得亮。光源在人背后时，光滑表面反而显得暗。' }] },
  { id:'c4s2q5', section:'第2节 光的反射', no:'第5题', points:12,
    stem:'为了监测一座跨江大桥有没有发生位移，工程师在南岸架设了激光测距站，对准安装在北岸桥墩上的反射器。某次测量中，测距站发出一束激光脉冲，经过 6×10⁻⁶ s（6 微秒）后接收到反射器反射回来的脉冲。这里的江面大约有多宽？',
    note:'本题含计算，提交后即时判分（填近似值即可）。可用数据：光速 c = 3×10⁸ m/s。',
    parts:[{ kind:'blank', blanks:[
      { label:'江面宽度', answer:['900','9×10²','9e2','900m','0.9km','0.9千米'], unit:'m' }],
      analysis:'激光往返共用 6×10⁻⁶ s，单程时间 t/2 = 3×10⁻⁶ s；江面宽度 s = c·(t/2) = 3×10⁸ m/s × 3×10⁻⁶ s = 900 m（合 0.9 km）。关键：计算单程距离时，往返时间必须先除以 2。' }] },

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
  // 入射光（与镜面成35°，即与水平成35°）：从左上到 O
  const ix = OX - 150 * Math.cos(35 * Math.PI / 180);
  const iy = OY - 150 * Math.sin(35 * Math.PI / 180);
  s += `<line x1="${ix}" y1="${iy}" x2="${OX}" y2="${OY}" stroke="#ff7a6e" stroke-width="2.5"/>`;
  s += `<text x="${ix - 24}" y="${iy + 18}" fill="#ff7a6e" font-size="12">入射光线</text>`;
  // 反射光（右下到右上）
  const rx = OX + 150 * Math.cos(35 * Math.PI / 180);
  const ry = OY - 150 * Math.sin(35 * Math.PI / 180);
  s += `<line x1="${OX}" y1="${OY}" x2="${rx}" y2="${ry}" stroke="#5ad7ff" stroke-width="2.5"/>`;
  s += `<text x="${rx + 4}" y="${ry + 30}" fill="#5ad7ff" font-size="12">反射光线</text>`;
  // 角度标注：入射光与镜面夹角 35°；i/r 数值不标注，由学生计算
  s += `<text x="${OX - 60}" y="${OY - 12}" fill="#9aa4b5" font-size="11">35°</text>`;
  s += `<text x="${OX}" y="${OY - 12}" fill="#d7dee9" font-size="11">O</text>`;
  return `<svg viewBox="0 0 460 300" role="img" aria-label="反射定律简图">${s}</svg>`;
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
  s += `<text x="${E.x - 40}" y="${E.y - 10}" fill="#5ad7ff" font-size="12">反射光</text>`;
  return `<svg viewBox="0 0 460 260" role="img" aria-label="角反射器两次反射简图">${s}</svg>`;
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
  // 太阳光：与水平成50°从左上射向井口
  s += `<line x1="114" y1="10" x2="181" y2="90" stroke="#ff7a6e" stroke-width="2.5"/>`;
  s += `<text x="44" y="34" fill="#ff7a6e" font-size="12">太阳光</text>`;
  s += `<text x="150" y="62" fill="#ffd479" font-size="12">50°</text>`;
  return `<svg viewBox="0 0 460 290" role="img" aria-label="井口条件简图">${s}</svg>`;
}

/* ===== 渲染引擎 ===== */
function renderFig(fig) {
  if (!fig || !FIGURES[fig]) return '';
  return `<div class="figbox">${FIGURES[fig]()}</div>`;
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
    ${renderFig(q.fig)}
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
