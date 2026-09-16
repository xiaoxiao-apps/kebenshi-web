(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var inS = $('inS'), inT = $('inT'), inV = $('inV');
  var unitS = $('unitS'), unitT = $('unitT'), unitV = $('unitV');
  var box = $('formulaBox');
  var rows = { s: $('rowS'), t: $('rowT'), v: $('rowV') };

  function fmt(x) {
    if (!isFinite(x)) return '—';
    if (x === 0) return '0';
    var a = Math.abs(x);
    return String(a >= 0.01 ? Math.round(x * 100) / 100 : parseFloat(x.toPrecision(2)));
  }
  // 统一换算到 SI：s→m，t→s，v→m/s
  function sSI() { var v = parseFloat(inS.value); return unitS.value === 'km' ? v * 1000 : v; }
  function tSI() { var v = parseFloat(inT.value); return unitT.value === 'min' ? v * 60 : unitT.value === 'h' ? v * 3600 : v; }
  function vSI() { var v = parseFloat(inV.value); return unitV.value === 'kmh' ? v / 3.6 : v; }
  function sTxt() { return fmt(parseFloat(inS.value)) + ' ' + unitS.value; }
  function tTxt() { return fmt(parseFloat(inT.value)) + ' ' + unitT.value; }
  function vTxt() { return fmt(parseFloat(inV.value)) + ' ' + (unitV.value === 'kmh' ? 'km/h' : 'm/s'); }

  function has(el) { return el.value !== '' && isFinite(parseFloat(el.value)); }
  var auto = { s: false, t: false, v: false }; // 自动回填标记：不算用户输入，用户手改即清除
  var elOf = { s: inS, t: inT, v: inV };
  function hasKey(k) { return has(elOf[k]) && !auto[k]; }
  function setActive(key) {
    Object.keys(rows).forEach(function (k) { rows[k].classList.toggle('active', k === key); });
  }
  function showEmpty() {
    box.innerHTML = '<div class="line empty">在上方输入任意两个量，这里会显示带单位的代入过程。</div>';
    Object.keys(auto).forEach(function (k) { if (auto[k]) { elOf[k].value = ''; auto[k] = false; } });
    setActive(null);
  }

  function solve() {
    var keys = ['s', 't', 'v'].filter(hasKey);
    var n = keys.length;
    if (n < 2) { showEmpty(); return; }
    if (n === 3) { // 三量都是手填：校验一致性，按 s,t 算 v 展示
      var v0 = sSI() / tSI();
      box.innerHTML =
        '<div class="line">校验：v = s ÷ t = ' + sTxt() + ' ÷ ' + tTxt() + ' ≈ ' + fmt(v0) + ' m/s</div>' +
        '<div class="line">（≈ ' + fmt(v0 * 3.6) + ' km/h；你填的 v = ' + vTxt() + '）</div>';
      setActive(null);
      return;
    }
    if (keys.indexOf('v') < 0) {
      if (tSI() === 0) { showEmpty(); return; }
      var v = sSI() / tSI();
      inV.value = fmt(unitV.value === 'kmh' ? v * 3.6 : v);
      auto.v = true; auto.s = false; auto.t = false;
      box.innerHTML =
        '<div class="line">v = s ÷ t</div>' +
        '<div class="line">= ' + sTxt() + ' ÷ ' + tTxt() + '</div>' +
        '<div class="line">≈ ' + fmt(v) + ' m/s（≈ ' + fmt(v * 3.6) + ' km/h）</div>';
      setActive('v');
      return;
    }
    if (keys.indexOf('s') < 0) {
      var s = vSI() * tSI();
      inS.value = fmt(unitS.value === 'km' ? s / 1000 : s);
      auto.s = true; auto.t = false; auto.v = false;
      box.innerHTML =
        '<div class="line">s = v × t</div>' +
        '<div class="line">= ' + vTxt() + ' × ' + tTxt() + '</div>' +
        '<div class="line">≈ ' + fmt(s) + ' m（≈ ' + fmt(s / 1000) + ' km）</div>';
      setActive('s');
      return;
    }
    if (vSI() === 0) { showEmpty(); return; }
    var t = sSI() / vSI();
    inT.value = fmt(unitT.value === 'min' ? t / 60 : unitT.value === 'h' ? t / 3600 : t);
    auto.t = true; auto.s = false; auto.v = false;
    box.innerHTML =
      '<div class="line">t = s ÷ v</div>' +
      '<div class="line">= ' + sTxt() + ' ÷ ' + vTxt() + '</div>' +
      '<div class="line">≈ ' + fmt(t) + ' s（≈ ' + fmt(t / 60) + ' min ≈ ' + fmt(t / 3600) + ' h）</div>';
    setActive('t');
  }

  ['s', 't', 'v'].forEach(function (k) {
    elOf[k].addEventListener('input', function () { auto[k] = false; solve(); });
  });
  [unitS, unitT, unitV].forEach(function (el) { el.addEventListener('change', solve); });
  showEmpty();
})();
