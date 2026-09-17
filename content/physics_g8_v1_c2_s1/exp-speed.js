/** exp-speed.js — G6 声速排序游戏：表2.1-1 十二格乱序→按声速升序点选 */
(function () {
  'use strict';

  // ===== 数据：表2.1-1 十二格（数值逐字锁定，禁止改动） =====
  var ITEMS = [
    { nm: '空气(0℃)', full: '空气（0 ℃）', v: 331 },
    { nm: '空气(15℃)', full: '空气（15 ℃）', v: 340 },
    { nm: '空气(25℃)', full: '空气（25 ℃）', v: 346 },
    { nm: '软木', full: '软木', v: 500 },
    { nm: '煤油(25℃)', full: '煤油（25 ℃）', v: 1324 },
    { nm: '水(常温)', full: '水（常温）', v: 1500 },
    { nm: '海水(25℃)', full: '海水（25 ℃）', v: 1531 },
    { nm: '冰', full: '冰', v: 3230 },
    { nm: '铜(棒)', full: '铜（棒）', v: 3750 },
    { nm: '大理石', full: '大理石', v: 3810 },
    { nm: '铝(棒)', full: '铝（棒）', v: 5000 },
    { nm: '铁(棒)', full: '铁（棒）', v: 5200 }
  ];

  // ===== DOM =====
  var slotsEl = document.getElementById('slots');
  var poolEl = document.getElementById('pool');
  var sortFb = document.getElementById('sortFb');
  var ruleReveal = document.getElementById('ruleReveal');
  var sortProgress = document.getElementById('sortProgress');

  // ===== 状态 =====
  var placed = [];       // 已排入的 item（升序）
  var poolCards = [];    // {el, item, picked}

  function fmtV(v) { return v >= 1000 ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(v); }

  // ===== 初始化槽位与卡片池（乱序：洗牌） =====
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildSlots() {
    slotsEl.innerHTML = '';
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('div');
      s.className = 'slot';
      s.dataset.idx = i;
      s.innerHTML = '<span class="rank">#' + (i + 1) + '</span><span>' + (i === 0 ? '最小' : (i === 11 ? '最大' : '…')) + '</span>';
      slotsEl.appendChild(s);
    }
  }

  function buildPool() {
    poolEl.innerHTML = '';
    poolCards = [];
    shuffle(ITEMS).forEach(function (item) {
      var el = document.createElement('div');
      el.className = 'pcard';
      el.innerHTML = '<div class="nm">' + item.nm + '</div><div class="vv">' + fmtV(item.v) + '</div>';
      var rec = { el: el, item: item, picked: false };
      el.addEventListener('click', function () { onPick(rec); });
      poolEl.appendChild(el);
      poolCards.push(rec);
    });
  }

  // ===== 点选判序 =====
  function onPick(rec) {
    if (rec.picked) return;
    var expect = placed.length;                       // 下一个槽位序号
    var expectItem = sortedRef[expect];               // 正确答案
    if (rec.item.v === expectItem.v) {
      rec.picked = true;
      rec.el.classList.add('picked');
      placed.push(rec.item);
      var slot = slotsEl.children[expect];
      slot.classList.add('filled');
      slot.innerHTML = '<span class="rank">#' + (expect + 1) + '</span><span class="nm">' + rec.item.nm + '</span><span class="vv" style="font-size:13px;font-weight:800;color:var(--brown)">' + fmtV(rec.item.v) + '</span>';
      sortProgress.textContent = '已排 ' + placed.length + '/12';
      if (placed.length === 12) finish();
    } else {
      rec.el.classList.remove('shake');
      void rec.el.offsetWidth;
      rec.el.classList.add('shake');
      var hintTxt;
      if (rec.item.v > expectItem.v) hintTxt = '这张比第 ' + (expect + 1) + ' 名大，再找找更小的。';
      else hintTxt = '这张比第 ' + (expect + 1) + ' 名还小？不对——它应该更早被排进去（检查前面是否漏排）。';
      sortFb.className = 'feedback show err';
      sortFb.textContent = '❌ ' + hintTxt + '（目标：从小到大）';
    }
  }

  function finish() {
    sortFb.className = 'feedback show ok';
    sortFb.textContent = '🎉 全部排对！从最小 331 到最大 5 200 m/s，规律就在下面 ↓';
    ruleReveal.classList.add('show');
    ruleReveal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  var sortedRef = ITEMS.slice().sort(function (a, b) { return a.v - b.v; });

  // ===== 重置 =====
  document.getElementById('resetSort').addEventListener('click', function () {
    placed = [];
    sortFb.className = 'feedback';
    sortFb.textContent = '';
    ruleReveal.classList.remove('show');
    sortProgress.textContent = '已排 0/12';
    buildSlots();
    buildPool();
  });

  // ===== Tab 切换（排序挑战 / 原表核对） =====
  var tabs = document.querySelectorAll('.mode-tab');
  var panels = document.querySelectorAll('.panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('on'); });
      panels.forEach(function (p) { p.classList.remove('on'); });
      tab.classList.add('on');
      var target = document.querySelector('.panel[data-p="' + tab.dataset.p + '"]');
      if (target) target.classList.add('on');
    });
  });

  // ===== 原表行高亮 =====
  var tblInfo = document.getElementById('tblInfo');
  var rowNotes = [
    '空气两档对照：0 ℃→331、25 ℃→346，海水 25 ℃→1 531。温度升高声速变大。',
    '15 ℃ 空气 340 是必背数值；冰（固体）3 230，远超空气。',
    '空气 25 ℃ 346；铜棒 3 750——金属棒传声很快。',
    '软木只有 500，比水还慢——固体里的“差生”，说明“一般”不等于“一定”。',
    '煤油 1 324 略慢于水 1 500；铝棒 5 000 进入“高速区”。',
    '水（常温）1 500；铁棒 5 200 是全表冠军——所以练习④先听到铁管传来的敲击声。'
  ];
  document.querySelectorAll('tr.hintrow').forEach(function (tr) {
    tr.addEventListener('click', function () {
      document.querySelectorAll('tr.hintrow').forEach(function (r) { r.classList.remove('on'); });
      tr.classList.add('on');
      tblInfo.textContent = '📍 ' + rowNotes[+tr.dataset.i];
    });
  });

  // ===== 启动 =====
  buildSlots();
  buildPool();
})();
