/* Q-D0 根壳应用：学科大卡 → 卡片流+筛选 → 覆盖页 → 全视口实验壳 */
(function () {
  'use strict';

  // 学科元信息（描述中性化，无教材字样）
  var SUBJECTS = [
    { key: 'physics', name: '物理', icon: '⚡', desc: '八年级物理互动实验' },
    { key: 'math', name: '数学', icon: '📐', desc: '趣味数学探究' },
    { key: 'chemistry', name: '化学', icon: '🧪', desc: '化学互动实验' }
  ];
  var TYPE_EMOJI = { '实验': '🧪', '讲解': '📖', '小结': '📋', '练习': '✏️', '趣味': '🎲' };
  var FILTER_GROUPS = [
    { key: 'grade', label: '年级', param: 'g', field: 'grade' },
    { key: 'volume', label: '册', param: 'v', field: 'volume' },
    { key: 'chapter', label: '章', param: 'c', field: 'chapter' },
    { key: 'type', label: '类型', param: 't', field: 'type' }
  ];
  // 注入内容页时隐藏其内部返回按钮，防止双层导航
  var HIDE_BACK_CSS = '.back-btn,[data-back],a.back,button.back,#back-to-index{display:none!important}';

  var catalog = null; // {physics:[],math:[],chemistry:[]}
  var state = {
    subject: null,
    filters: { grade: [], volume: [], chapter: [], type: [] }, // 组内多选=OR，全空=不过滤
    cardId: null,
    play: false
  };
  var savedScrollY = 0;      // 打开覆盖页前的滚动位置
  var drawerOpen = false;    // 窄屏筛选抽屉
  var applyingHash = false;  // 防 hashchange 回环

  var $app = document.getElementById('app');
  var $overlay = document.getElementById('overlay');

  /* ---------- hash 编解码 ---------- */
  function stateToHash() {
    if (!state.subject) return '#/';
    var qs = [];
    FILTER_GROUPS.forEach(function (g) {
      if (state.filters[g.key].length) {
        qs.push(g.param + '=' + encodeURIComponent(state.filters[g.key].join(',')));
      }
    });
    if (state.cardId) qs.push('card=' + encodeURIComponent(state.cardId));
    if (state.play) qs.push('play=1');
    return '#/' + state.subject + (qs.length ? '?' + qs.join('&') : '');
  }
  function hashToState(h) {
    var m = (h || '').replace(/^#\/?/, '').split('?');
    var subject = m[0] || null;
    var st = {
      subject: SUBJECTS.some(function (s) { return s.key === subject; }) ? subject : null,
      filters: { grade: [], volume: [], chapter: [], type: [] },
      cardId: null, play: false
    };
    if (!st.subject) return st;
    var params = new URLSearchParams(m[1] || '');
    FILTER_GROUPS.forEach(function (g) {
      var v = params.get(g.param);
      if (v) st.filters[g.key] = v.split(',').filter(Boolean);
    });
    st.cardId = params.get('card');
    st.play = params.get('play') === '1';
    return st;
  }
  // push=true 记入历史（覆盖页/壳开合），否则仅替换（筛选变更）
  function syncHash(push) {
    var h = stateToHash();
    if (location.hash === h) return;
    applyingHash = true;
    if (push) history.pushState(null, '', h);
    else history.replaceState(null, '', h);
    setTimeout(function () { applyingHash = false; }, 0);
  }

  /* ---------- 数据 ---------- */
  function cardsOf(subject) { return (catalog && catalog[subject]) || []; }
  function findCard(id) {
    var list = cardsOf(state.subject);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function chapterShort(c) { return c ? String(c).replace(/^第\d+章\s*/, '') : ''; }
  function filteredCards() {
    return cardsOf(state.subject).filter(function (card) {
      return FILTER_GROUPS.every(function (g) {
        var sel = state.filters[g.key];
        return !sel.length || sel.indexOf(card[g.field]) !== -1; // 组内 OR，组间 AND
      });
    });
  }

  /* ---------- 视图渲染 ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function esc(s) { return String(s == null ? '' : s); }

  function thumbNode(card, big) {
    if (card.thumb) {
      var img = el('img', big ? '' : 'qd-thumb');
      img.loading = 'lazy';
      img.alt = card.title;
      img.src = card.thumb;
      img.onerror = function () { // 图挂了退回 emoji 兜底
        var fb = fallbackNode(card);
        img.replaceWith(fb);
      };
      return img;
    }
    return fallbackNode(card);
  }
  function fallbackNode(card) {
    var fb = el('div', 'qd-thumb-fallback', TYPE_EMOJI[card.type] || '📄');
    fb.setAttribute('data-t', card.type);
    return fb;
  }

  function renderHome() {
    $app.innerHTML = '';
    var hero = el('div', 'qd-hero');
    hero.appendChild(el('div', 'qd-logo', '📚'));
    hero.appendChild(el('h1', null, '可交互教材'));
    hero.appendChild(el('p', 'qd-sub', '知识变动画，动手学科学'));
    $app.appendChild(hero);

    var grid = el('div', 'qd-subjects');
    SUBJECTS.forEach(function (s) {
      var count = cardsOf(s.key).length;
      var btn = el('button', 'qd-subject' + (count ? '' : ' qd-empty'));
      btn.setAttribute('data-k', s.key);
      btn.appendChild(el('span', 'qd-s-icon', s.icon));
      btn.appendChild(el('span', 'qd-s-name', s.name));
      btn.appendChild(el('span', 'qd-s-desc', count ? s.desc + ' · ' + count + ' 个互动内容' : s.desc));
      if (!count) {
        btn.appendChild(el('span', 'qd-soon', '建设中'));
        btn.disabled = true;
      } else {
        btn.onclick = function () {
          state.subject = s.key;
          state.filters = { grade: [], volume: [], chapter: [], type: [] };
          state.cardId = null; state.play = false;
          syncHash(true); render();
          window.scrollTo(0, 0);
        };
      }
      grid.appendChild(btn);
    });
    $app.appendChild(grid);
  }

  function renderSubject() {
    $app.innerHTML = '';
    var cards = cardsOf(state.subject);
    var meta = SUBJECTS.filter(function (s) { return s.key === state.subject; })[0];

    var bar = el('div', 'qd-topbar');
    var home = el('button', 'qd-home-link', '‹ 全部学科');
    home.onclick = function () {
      state.subject = null; state.cardId = null; state.play = false;
      syncHash(true); render();
    };
    bar.appendChild(home);
    bar.appendChild(el('h1', null, meta.icon + ' ' + meta.name));
    $app.appendChild(bar);

    var main = el('div', 'qd-main');

    // 窄屏抽屉开关
    var toggle = el('button', 'qd-ftoggle', (drawerOpen ? '收起筛选 ▲' : '筛选 ▼'));
    toggle.onclick = function () {
      drawerOpen = !drawerOpen;
      toggle.textContent = drawerOpen ? '收起筛选 ▲' : '筛选 ▼';
      aside.classList.toggle('qd-open', drawerOpen);
    };
    main.appendChild(toggle);

    // 筛选栏：选项从当前学科卡片动态提取
    var aside = el('aside', 'qd-filters' + (drawerOpen ? ' qd-open' : ''));
    aside.appendChild(el('h2', null, '筛选'));
    FILTER_GROUPS.forEach(function (g) {
      var vals = [];
      cards.forEach(function (c) {
        var v = c[g.field];
        if (v && vals.indexOf(v) === -1) vals.push(v);
      });
      if (!vals.length) return;
      var fs = document.createElement('fieldset');
      fs.className = 'qd-fgroup';
      fs.appendChild(el('legend', null, g.label));
      vals.forEach(function (v) {
        var lab = el('label');
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = state.filters[g.key].indexOf(v) !== -1;
        cb.onchange = function () {
          var arr = state.filters[g.key];
          var i = arr.indexOf(v);
          if (cb.checked && i === -1) arr.push(v);
          if (!cb.checked && i !== -1) arr.splice(i, 1);
          syncHash(false); // 筛选变化只替换 hash，不堆历史
          renderGrid();
        };
        lab.appendChild(cb);
        lab.appendChild(el('span', null, v));
        fs.appendChild(lab);
      });
      aside.appendChild(fs);
    });
    var reset = el('button', 'qd-freset', '清空筛选');
    reset.onclick = function () {
      state.filters = { grade: [], volume: [], chapter: [], type: [] };
      syncHash(false); render();
    };
    aside.appendChild(reset);
    main.appendChild(aside);

    var gridWrap = el('div');
    var countLine = el('p', 'qd-count');
    gridWrap.appendChild(countLine);
    var grid = el('div', 'qd-grid');
    gridWrap.appendChild(grid);
    main.appendChild(gridWrap);
    $app.appendChild(main);

    function renderGrid() {
      var list = filteredCards();
      grid.innerHTML = '';
      countLine.textContent = '共 ' + list.length + ' 个内容';
      if (!list.length) {
        grid.appendChild(el('div', 'qd-empty-tip', '没有符合筛选条件的内容'));
        return;
      }
      list.forEach(function (card) {
        var btn = el('button', 'qd-card');
        btn.appendChild(thumbNode(card, false));
        var body = el('div', 'qd-card-body');
        body.appendChild(el('h3', 'qd-card-title', card.title));
        var badges = el('div', 'qd-badges');
        badges.appendChild(el('span', 'qd-badge', chapterShort(card.chapter) || card.chapter));
        badges.appendChild(el('span', 'qd-badge qd-type', card.type));
        body.appendChild(badges);
        btn.appendChild(body);
        btn.onclick = function () { openOverlay(card.id); };
        grid.appendChild(btn);
      });
    }
    renderGrid();
  }

  function render() {
    destroyShell();
    $overlay.hidden = true;
    document.body.classList.remove('qd-in-shell');
    if (!state.subject) renderHome();
    else renderSubject();
    if (state.cardId) {
      var card = findCard(state.cardId);
      if (card) {
        showOverlay(card);
        if (state.play) revealShell(); // 直达链接 play=1：立即揭开（无手势，不进全屏）
      } else {
        state.cardId = null; state.play = false;
      }
    }
  }

  /* ---------- 覆盖页（卡片详情） ---------- */
  function introOf(card) {
    var ch = chapterShort(card.chapter);
    switch (card.type) {
      case '实验': return '「' + (card.section || ch) + '」互动实验 · ' + ch + ' · 动手操作，观察现象背后的规律';
      case '讲解': return '「' + (card.section || ch) + '」知识讲解 · ' + ch + ' · 动画演示，一步步建立概念';
      case '小结': return ch + '知识梳理 · 把整章内容串成一张网';
      case '练习': return ch + '闯关练习 · 即时判分，边练边巩固';
      case '趣味': return '趣味探究 · 在动手尝试中发现数学规律';
      default: return card.chapter || '';
    }
  }
  function showOverlay(card) {
    var media = document.getElementById('overlay-media');
    media.innerHTML = '';
    if (card.thumb) {
      var img = el('img');
      img.src = card.thumb; img.alt = card.title;
      img.onerror = function () { media.replaceChild(fallbackNode(card), img); };
      media.appendChild(img);
    } else {
      media.appendChild(fallbackNode(card));
    }
    document.getElementById('overlay-title').textContent = card.title;
    document.getElementById('overlay-intro').textContent = introOf(card);
    document.getElementById('overlay-play').onclick = function () {
      enterFullscreen(); // 必须在用户手势的同步调用栈内
      if (!shell) prepareShell(card);
      revealShell();
    };
    $overlay.hidden = false;
    prepareShell(card); // modal 出现即后台预加载内容
  }
  function openOverlay(id) {
    savedScrollY = window.scrollY;
    state.cardId = id; state.play = false;
    var card = findCard(id);
    showOverlay(card);
    syncHash(true);
  }
  function closeOverlay() {
    $overlay.hidden = true;
    state.cardId = null; state.play = false;
    destroyShell(); // 移除整个壳覆盖层，中止预加载
    syncHash(true);
    requestAnimationFrame(function () { window.scrollTo(0, savedScrollY); }); // 恢复滚动位置
  }
  document.getElementById('overlay-close').onclick = closeOverlay;
  $overlay.addEventListener('click', function (e) { if (e.target === $overlay) closeOverlay(); });

  /* ---------- 全视口实验壳（modal 出现即预加载，点▶揭开） ---------- */
  var shell = null; // 每个 modal 一个壳覆盖层；关 modal 即销毁中止预加载

  function injectHideBack(doc) {
    // 同源注入 CSS 隐藏内部返回按钮；失败静默
    try {
      if (!doc || doc.getElementById('qd-hide-back')) return;
      var st = doc.createElement('style');
      st.id = 'qd-hide-back';
      st.textContent = HIDE_BACK_CSS;
      (doc.head || doc.documentElement).appendChild(st);
    } catch (e) { /* 跨域或时机未到，静默 */ }
  }
  function injectAll(doc) {
    if (!doc) return;
    injectHideBack(doc);
    var frames = doc.getElementsByTagName('iframe');
    for (var i = 0; i < frames.length; i++) {
      try { injectAll(frames[i].contentDocument); } catch (e) { /* 跨域静默 */ }
    }
  }
  // 就绪判定：document 完成 + 全部 img.complete + 已赋 src 的嵌套 iframe 递归同规则
  function docAllReady(doc) {
    if (!doc || doc.readyState !== 'complete') return false;
    var i;
    var imgs = doc.getElementsByTagName('img');
    for (i = 0; i < imgs.length; i++) if (!imgs[i].complete) return false;
    var frames = doc.getElementsByTagName('iframe');
    for (i = 0; i < frames.length; i++) {
      var s = frames[i].getAttribute('src');
      if (!s || s === 'about:blank') continue;
      try { if (!docAllReady(frames[i].contentDocument)) return false; }
      catch (e) { /* 跨域无法探测，视为就绪 */ }
    }
    return true;
  }

  function prepareShell(card) {
    destroyShell();
    var s = { timers: [], pollTimer: null, toTimer: null, readySince: 0, done: false, card: card };

    var root = el('div', 'qd-shell qd-pre');
    var bar = el('div', 'qd-shell-bar');
    var back = el('button', 'qd-shell-back', '‹ 返回');
    back.onclick = closeShellByBack;
    bar.appendChild(back);
    bar.appendChild(el('span', 'qd-shell-title', card.title));
    root.appendChild(bar);

    var frame = document.createElement('iframe');
    frame.className = 'qd-shell-frame';
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('allow', 'autoplay; fullscreen; gyroscope; accelerometer');
    root.appendChild(frame);
    s.frame = frame;

    var curtain = el('div', 'qd-curtain');
    var prog = el('div', 'qd-prog');
    var track = el('div', 'qd-prog-track');
    var fill = el('div', 'qd-prog-fill');
    track.appendChild(fill);
    prog.appendChild(track);
    var num = el('div', 'qd-prog-num', '0%');
    prog.appendChild(num);
    curtain.appendChild(prog);
    var toBox = el('div', 'qd-curtain-timeout');
    toBox.hidden = true;
    toBox.appendChild(el('p', null, '网络不佳，内容仍在加载'));
    var btns = el('div', 'qd-curtain-btns');
    var bReload = el('button', null, '重新加载');
    var bSkip = el('button', null, '不等待，直接查看');
    btns.appendChild(bReload);
    btns.appendChild(bSkip);
    toBox.appendChild(btns);
    curtain.appendChild(toBox);
    root.appendChild(curtain);
    s.curtain = curtain; s.prog = prog; s.toBox = toBox;

    document.body.appendChild(root);
    s.el = root;
    shell = s;

    function setProgress(p) {
      fill.style.width = p + '%';
      num.textContent = Math.floor(p) + '%';
    }
    function fadeCurtain() {
      curtain.classList.add('qd-fade');
      s.timers.push(setTimeout(function () {
        if (curtain.parentNode) curtain.parentNode.removeChild(curtain);
      }, 350));
    }
    function markReady() {
      if (s.done) return;
      s.done = true;
      setProgress(100);
      s.timers.push(setTimeout(fadeCurtain, 150)); // 让 100% 停留一瞬再淡出
    }
    // 伪进度：前8秒缓动爬至90%，之后减速徘徊
    s.t0 = Date.now();
    s.timers.push(setInterval(function () {
      if (s.done) return;
      var t = (Date.now() - s.t0) / 1000;
      var p;
      if (t < 8) { var k = 1 - t / 8; p = 90 * (1 - k * k * k); }
      else p = 90 + 7 * (1 - Math.exp(-(t - 8) / 8));
      setProgress(p);
    }, 100));
    // 超时兜底：15秒未就绪
    function armTimeout() {
      clearTimeout(s.toTimer);
      s.toTimer = setTimeout(function () {
        if (s.done) return;
        prog.hidden = true;
        toBox.hidden = false;
      }, 15000);
      s.timers.push(s.toTimer);
    }
    armTimeout();
    bReload.onclick = function () {
      s.done = false; s.readySince = 0; s.t0 = Date.now();
      toBox.hidden = true; prog.hidden = false;
      if (s.pollTimer) { clearInterval(s.pollTimer); s.pollTimer = null; }
      armTimeout();
      frame.src = card.path; // 重设 src 触发重载
    };
    bSkip.onclick = function () {
      if (s.pollTimer) { clearInterval(s.pollTimer); s.pollTimer = null; }
      clearTimeout(s.toTimer);
      s.done = true;
      fadeCurtain();
    };
    frame.addEventListener('load', function () {
      injectAll(frame.contentDocument);
      if (s.pollTimer) clearInterval(s.pollTimer);
      s.pollTimer = setInterval(function () { // 就绪轮询 200ms
        var ok = false;
        try { ok = docAllReady(frame.contentDocument); } catch (e) { ok = false; }
        if (ok) {
          injectAll(frame.contentDocument);
          if (!s.readySince) s.readySince = Date.now();
          else if (Date.now() - s.readySince >= 300) { // 连续300ms无新增未就绪项
            clearInterval(s.pollTimer);
            s.pollTimer = null;
            clearTimeout(s.toTimer);
            markReady();
          }
        } else s.readySince = 0;
      }, 200);
    });
    frame.src = card.path; // 后台开始加载（壳处于 visibility:hidden 仍可加载）
  }

  function revealShell() {
    if (!shell) return;
    shell.el.classList.remove('qd-pre'); // 提到最上层并可见；iframe 节点不动，复用预加载
    document.body.classList.add('qd-in-shell');
    $overlay.hidden = true;
    state.play = true;
    syncHash(true);
  }

  function destroyShell() {
    if (!shell) return;
    shell.timers.forEach(function (t) { clearInterval(t); clearTimeout(t); });
    if (shell.pollTimer) clearInterval(shell.pollTimer);
    clearTimeout(shell.toTimer);
    if (shell.el.parentNode) shell.el.parentNode.removeChild(shell.el); // 移除即中止加载
    shell = null;
  }

  function closeShellByBack() {
    exitFullscreen();
    destroyShell();
    $overlay.hidden = true;
    document.body.classList.remove('qd-in-shell');
    state.play = false; state.cardId = null;
    syncHash(true);
    requestAnimationFrame(function () { window.scrollTo(0, savedScrollY); });
  }

  /* ---------- 原生全屏（点▶手势同步栈内调用；不支持则静默） ---------- */
  function enterFullscreen() {
    var de = document.documentElement;
    if (de && de.requestFullscreen) {
      try {
        var p = de.requestFullscreen();
        if (p && p.catch) p.catch(function () {});
      } catch (e) { /* 静默 */ }
    }
  }
  function exitFullscreen() {
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        var p = document.exitFullscreen();
        if (p && p.catch) p.catch(function () {});
      } catch (e) { /* 静默 */ }
    }
  }

  /* ---------- 路由 ---------- */
  window.addEventListener('popstate', onHash);
  window.addEventListener('hashchange', onHash);
  function onHash() {
    if (applyingHash) return;
    var st = hashToState(location.hash);
    var subjectChanged = st.subject !== state.subject;
    state = st;
    if (subjectChanged) savedScrollY = 0;
    render();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (shell && !shell.el.classList.contains('qd-pre')) closeShellByBack();
    else if (!$overlay.hidden) closeOverlay();
  });

  /* ---------- 启动 ---------- */
  fetch('data/catalog.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      catalog = data.subjects || {};
      state = hashToState(location.hash);
      render();
    })
    .catch(function () {
      $app.innerHTML = '<div class="qd-loading">目录加载失败，请刷新重试</div>';
    });
})();
