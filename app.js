const SUBJECT_FILES = {
  '物理': 'data/physics_renjiao.json',
  '数学': 'data/math_renjiao.json',
  '化学': 'data/chemistry_renjiao.json'
};

const VOLUME_COVERS = {
  'physics_g8_v1': 'assets/covers/physics_g8_v1.jpg',
  'physics_g8_v2': 'assets/covers/physics_g8_v2.jpg',
  'physics_g9_v1': 'assets/covers/physics_g9_v1.jpg',
  'math_g1_v1': 'assets/covers/math_g1_v1.jpg',
  'math_g1_v2': 'assets/covers/math_g1_v2.jpg',
  'math_g2_v1': 'assets/covers/math_g2_v1.jpg',
  'math_g2_v2': 'assets/covers/math_g2_v2.jpg',
  'math_g3_v1': 'assets/covers/math_g3_v1.jpg',
  'math_g3_v2': 'assets/covers/math_g3_v2.jpg',
  'math_g4_v1': 'assets/covers/math_g4_v1.jpg',
  'math_g5_v1': 'assets/covers/math_g5_v1.jpg',
  'math_g6_v1': 'assets/covers/math_g6_v1.jpg',
  'math_g7_v1': 'assets/covers/math_g7_v1.jpg',
  'math_g7_v2': 'assets/covers/math_g7_v2.jpg',
  'math_g8_v1': 'assets/covers/math_g8_v1.jpg',
  'math_g8_v2': 'assets/covers/math_g8_v2.jpg',
  'math_g9_v1': 'assets/covers/math_g9_v1.jpg',
  'chemistry_g9_v1': 'assets/covers/chem_g9_v1.jpg',
  'chemistry_g9_v2': 'assets/covers/chem_g9_v2.jpg'
};

const SUBJECT_ICONS = {'物理': '🔬', '数学': '📐', '化学': '🧪'};
const SUBJECT_DESC = {'物理': '八至九年级人教版物理互动实验', '数学': '一至九年级人教版数学互动探索', '化学': '九年级人教版化学互动实验'};

const AVAILABLE = {
  'physics_g8_v1_c4_s2': { title: '光的反射', file: 'content/physics_g8_v1_c4_s2/index.html' },
  'physics_g8_v1_c1_s1': { title: '长度和时间的测量', file: 'content/physics_g8_v1_c1_s1/index.html' },
  'physics_g8_v1_c1_s2': { title: '运动的描述', file: 'content/physics_g8_v1_c1_s2/index.html' },
  'physics_g8_v1_c1_s3': { title: '运动的快慢', file: 'content/physics_g8_v1_c1_s3/index.html' },
  'math_fun_chicken_rabbit': { title: '鸡兔同笼', file: 'content/math_fun_chicken_rabbit/index.html' }
};

let state = {
  subjects: [],
  current: null,
  data: null,
  path: []
};

function $(sel){ return document.getElementById('app') || document.querySelector(sel); }

async function loadSubjects(){
  state.subjects = Object.keys(SUBJECT_FILES).map(name => ({name, icon: SUBJECT_ICONS[name], desc: SUBJECT_DESC[name]}));
  renderSubjects();
}

function renderSubjects(){
  const app = $('#app');
  app.innerHTML = '<div class="section-title">选择学科</div>' +
    '<div class="cards">' +
    state.subjects.map(s => `
      <div class="card subject-${s.name}" data-subject="${s.name}">
        <div class="card-row">
          <div class="card-icon">${s.icon}</div>
          <div class="card-body">
            <div class="card-title">${s.name}</div>
            <div class="card-desc">${s.desc}</div>
          </div>
          <div class="card-arrow">›</div>
        </div>
      </div>
    `).join('') +
    '</div>';
  app.querySelectorAll('.card').forEach(c => {
    c.addEventListener('click', () => selectSubject(c.dataset.subject));
  });
}

async function selectSubject(name){
  const app = $('#app');
  app.innerHTML = '<div class="loading">加载目录中…</div>';
  try {
    const resp = await fetch(SUBJECT_FILES[name]);
    const data = await resp.json();
    state.data = data;
    state.current = name;
    state.path = [];
    renderGrades(data);
  } catch (e) {
    app.innerHTML = '<div class="empty">加载失败，请刷新重试</div>';
  }
}

function renderGrades(data){
  const app = $('#app');
  const rows = data.grades.map((g, gi) => {
    const volumes = g.volumes.map((v, vi) => {
      const cover = VOLUME_COVERS[v.id];
      if (cover) {
        return `<div class="volume-card" data-gi="${gi}" data-vi="${vi}">
          <img src="${cover}" alt="${v.volume}" loading="lazy" decoding="async">
          <div class="vc-title">${v.volume}</div>
        </div>`;
      }
      return `<span class="volume-pill" data-gi="${gi}" data-vi="${vi}">${v.volume}</span>`;
    }).join('');
    return `<div class="grade-item" data-gi="${gi}">
      <div class="name">${g.grade}</div>
      <div class="volumes">${volumes}</div>
    </div>`;
  }).join('');
  app.innerHTML = `<button class="back" onclick="loadSubjects()">‹ 返回学科</button>
    <div class="hero" style="padding:8px 0 16px;text-align:left">
      <h1 style="font-size:22px">${data.subject}</h1>
      <p class="sub">${data.publisher || ''} ${data.edition || ''}</p>
    </div>
    <div class="grade-list">${rows}</div>`;

  app.querySelectorAll('.volume-pill, .volume-card').forEach(p => {
    p.addEventListener('click', (e) => {
      e.stopPropagation();
      const gi = parseInt(p.dataset.gi);
      const vi = parseInt(p.dataset.vi);
      state.path = [gi, vi];
      renderVolume(data.grades[gi].volumes[vi], data.grades[gi].grade);
    });
  });
  app.querySelectorAll('.grade-item').forEach(item => {
    item.addEventListener('click', () => {
      const gi = parseInt(item.dataset.gi);
      const vi = 0;
      state.path = [gi, vi];
      renderVolume(data.grades[gi].volumes[vi], data.grades[gi].grade);
    });
  });
}

function renderVolume(volume, gradeName){
  const app = $('#app');
  const subject = state.data.subject;
  const rows = volume.chapters.map(ch => {
    const sections = ch.sections.map(s => {
      const isAvail = !!AVAILABLE[s.id];
      return `<div class="section ${isAvail ? '' : 'offline'}" data-id="${s.id}">
        <span>${s.title}</span>
        ${isAvail ? '' : '<span class="soon">即将上线</span>'}
      </div>`;
    }).join('');
    return `<div class="chapter">
      <div class="chapter-name">${ch.chapter}</div>
      <div class="sections">${sections}</div>
    </div>`;
  }).join('');

  const volumeLabel = volume && volume.volume ? volume.volume : '';
  app.innerHTML = `<button class="back" onclick="renderGrades(state.data)">‹ 返回${gradeName || '年级'}</button>
    <div class="section-title">${subject} · ${gradeName} · ${volumeLabel}</div>
    <div class="chapter-tree">${rows}</div>`;

  app.querySelectorAll('.section:not(.offline)').forEach(sec => {
    sec.addEventListener('click', () => {
      const id = sec.dataset.id;
      openContent(id);
    });
  });
}

function buildFlatList(){
  const list = [];
  const data = state.data;
  data.grades.forEach((g, gi) => {
    g.volumes.forEach((v, vi) => {
      v.chapters.forEach(ch => {
        ch.sections.forEach(s => {
          list.push({
            id: s.id,
            title: s.title,
            grade: g.grade,
            volume: v.volume,
            chapter: ch.chapter,
            available: !!AVAILABLE[s.id]
          });
        });
      });
    });
  });
  return list;
}

function openContent(id){
  const meta = AVAILABLE[id];
  if (!meta) return;
  const flat = buildFlatList();
  const idx = flat.findIndex(x => x.id === id);
  const prev = flat.slice(0, idx).reverse().find(x => x.available);
  const next = flat.slice(idx + 1).find(x => x.available);

  const shell = document.createElement('div');
  shell.className = 'content-shell';
  shell.id = 'contentShell';
  shell.innerHTML = `
    <iframe class="content-frame" src="${meta.file}" allowfullscreen></iframe>
    <div class="content-nav">
      <button class="ghost" id="prevBtn" ${prev ? '' : 'disabled'}>上一节</button>
      <button class="ghost" id="tocBtn">返回目录</button>
      <button class="primary" id="nextBtn" ${next ? '' : 'disabled'}>下一节</button>
    </div>
  `;
  document.body.appendChild(shell);
  // 锁住外层页面滚动，避免外层+iframe 出现双滚动条
  document.documentElement.style.overflow = 'hidden';

  const closeShell = () => {
    document.documentElement.style.overflow = '';
    shell.remove();
  };
  shell.querySelector('#tocBtn').addEventListener('click', closeShell);
  shell.querySelector('#prevBtn').addEventListener('click', () => {
    if (prev) { closeShell(); openContent(prev.id); }
  });
  shell.querySelector('#nextBtn').addEventListener('click', () => {
    if (next) { closeShell(); openContent(next.id); }
  });
}

function init(){ loadSubjects(); }
init();
