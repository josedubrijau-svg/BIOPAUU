/* ============================================================================
   BioPAU — bioPau Daily — MOTOR (v2: sin emojis, iconos SVG propios,
   modo concentración bloqueado y estilo inmersivo)
   ----------------------------------------------------------------------------
   Reglas de oro: 1) nunca repetir preguntas respondidas — 2) variedad de temas
   3) respetar preferencias — 4) dificultad adecuada — 5) rápido — 6) enseñar.
   Determinista por fecha. No bloqueante para ENTRAR (opcional); pero una vez
   EMPEZADO el reto, no se puede salir hasta terminarlo (modo concentración).
   Persistencia: localStorage. API: BPDaily.initPage() — BPDaily.renderDashCard(id)
   ============================================================================ */
window.BPDaily = (function () {
  'use strict';

  var langOf = function () { try { var v = localStorage.getItem('biopau_lang'); return v === 'ca' ? 'ca' : 'es'; } catch (e) { return 'es'; } };
  var T = function (es, ca) { return langOf() === 'ca' ? ca : es; };
  var DATA = window.BIOPAU_DAILY;
  var D = window.BIOPAU_DATA;
  var LAUNCH = '2026-08-01';
  var DIST = { refuerzo: 0.40, variado: 0.40, antiguo: 0.20 };

  /* ---------------- Iconos SVG propios (estilo bioPau, sin emojis) ------ */
  var IC = {
    flame: '<path d="M12 3c.2 3-2.4 4.2-2.4 7.2A2.4 2.4 0 0 0 12 12.6a2.4 2.4 0 0 0 2.4-2.4c0-.9-.4-1.5-.9-2.1"/><path d="M12 21a6 6 0 0 0 6-6c0-4.2-3.2-6-4.2-9C13 9 10.5 9.6 9 11.4A6 6 0 0 0 12 21z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    stack: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    trophy: '<path d="M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 19h6M12 13v6"/>',
    share: '<circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8 11l8-4M8 13l8 4"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  function svg(n, cls) { return '<span class="dl-ic' + (cls ? ' ' + cls : '') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (IC[n] || '') + '</svg></span>'; }

  /* Iconos de bloque (los MISMOS del temario, js/apuntes.js) por tema */
  var BLKIC = {
    mito: '<path d="M4 9c0-3 3-5 8-5s8 2 8 5-3 5-8 5-8-2-8-5z" transform="rotate(20 12 12)"/><path d="M8 9c1-2 2-2 3 0s2 2 3 0 2-2 3 0" transform="rotate(20 12 12)"/>',
    dna: '<path d="M8 2c0 5 8 7 8 12s-8 7-8 12M16 2c0 5-8 7-8 12s8 7 8 12"/><path d="M9 8h6M9 12h6M9 16h6"/>',
    atom: '<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
    microbe: '<circle cx="12" cy="12" r="6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>',
    shield: '<path d="M12 2l8 3.5V11c0 5.2-3.4 8.8-8 10-4.6-1.2-8-4.8-8-10V5.5L12 2z"/>',
    flask: '<path d="M9 3v6L4 18a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3L15 9V3"/><path d="M8 3h8"/><path d="M7 16h10"/>',
    tree: '<path d="M12 22V13M12 13L7 8M12 13l5-5M12 8L9 4M12 8l3-4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>'
  };
  function blockOf(topicId) { return (D && D.BLOQUES ? D.BLOQUES : []).filter(function (b) { return b.id === topicId; })[0] || null; }
  function topicIcon(topicId) {
    var b = blockOf(topicId), name = b ? b.icon : 'target', col = b ? b.color : '#ADE80C';
    return '<span class="dl-tic" style="color:' + col + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (BLKIC[name] || BLKIC.target) + '</svg></span>';
  }
  /* Ilustración de marca (pulso biológico), reemplaza al emoji de cerebro */
  function heroArt(cls) {
    return '<svg class="dl-hero-art' + (cls ? ' ' + cls : '') + '" viewBox="0 0 72 72" fill="none" aria-hidden="true">' +
      '<rect x="5" y="5" width="62" height="62" rx="18" fill="rgba(173,232,12,.10)" stroke="#ADE80C" stroke-width="2"/>' +
      '<path d="M14 40h9l4-15 7 26 4-14h20" stroke="#ADE80C" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="52" cy="22" r="3.4" fill="#ADE80C"/><circle cx="20" cy="52" r="2.4" fill="#5FD3A6"/></svg>';
  }

  /* ---------------- Fechas --------------------------------------------- */
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parse(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function todayISO() { return iso(new Date()); }
  function daysBetween(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
  function dailyNumber(dISO) { return daysBetween(LAUNCH, dISO) + 1; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  var ML = { es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'], ca: ['gener','febrer','març','abril','maig','juny','juliol','agost','setembre','octubre','novembre','desembre'] };
  function longDate(dISO) { var d = parse(dISO); return d.getDate() + ' ' + ML[langOf()][d.getMonth()]; }

  /* ---------------- PRNG determinista --------------------------------- */
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffleSeeded(arr, rnd) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------------- Store ---------------------------------------------- */
  var PK = 'biopau_daily_prefs', SK = 'biopau_daily';
  var DEF_PREFS = { subjects: null, topics: null, difficulty: 'mixto', mode: 'personalizado', count: 5, priority: 'equilibrado' };
  function readPrefs() { try { return Object.assign({}, DEF_PREFS, JSON.parse(localStorage.getItem(PK) || '{}')); } catch (e) { return Object.assign({}, DEF_PREFS); } }
  function writePrefs(p) { try { localStorage.setItem(PK, JSON.stringify(p)); } catch (e) {} }
  function readState() { try { return JSON.parse(localStorage.getItem(SK) || 'null') || {}; } catch (e) { return {}; } }
  function writeState(s) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch (e) {} }
  function ensureState() {
    var s = readState();
    s.answeredIds = s.answeredIds || []; s.byDate = s.byDate || {};
    s.streak = s.streak || { current: 0, best: 0, last: '' }; s.xp = s.xp || 0;
    s.stats = s.stats || { answered: 0, correct: 0, byTopic: {} };
    return s;
  }
  function enabledTopics(prefs) {
    var subs = DATA.subjects(), on = {};
    subs.forEach(function (s) {
      var subOn = !prefs.subjects || prefs.subjects[s.id] !== false;
      s.topics.forEach(function (tp) { var tOn = !prefs.topics || prefs.topics[s.id + ':' + tp.id] !== false; if (subOn && tOn) on[tp.id] = true; });
    });
    return on;
  }

  /* ---------------- Generación determinista --------------------------- */
  function weakTopics(state) {
    var bt = state.stats.byTopic || {}, arr = [];
    for (var t in bt) if (bt.hasOwnProperty(t) && bt[t].total >= 1) arr.push({ t: t, pct: bt[t].correct / bt[t].total });
    arr.sort(function (a, b) { return a.pct - b.pct; });
    return arr.filter(function (x) { return x.pct < 0.7; }).map(function (x) { return x.t; });
  }
  function eligiblePool(prefs, state) {
    var on = enabledTopics(prefs), answered = {}; state.answeredIds.forEach(function (id) { answered[id] = 1; });
    return DATA.all().filter(function (q) {
      if (answered[q.id]) return false;
      if (!on[q.topic]) return false;
      if (prefs.difficulty !== 'mixto' && q.difficulty !== prefs.difficulty) return false;
      if (prefs.mode === 'repaso') { var w = weakTopics(state); if (w.length && w.indexOf(q.topic) === -1) return false; }
      return true;
    });
  }
  function buildDaily(dISO) {
    var prefs = readPrefs(), state = ensureState();
    var stored = state.byDate[dISO];
    if (stored && stored.questionIds) return { ids: stored.questionIds, n: stored.n, stored: stored };
    var pool = eligiblePool(prefs, state), count = prefs.count || 5;
    if (pool.length < count) return { insufficient: true, available: pool.length, n: dailyNumber(dISO) };
    var rnd = mulberry32(hashStr(dISO + '|' + count + '|' + prefs.mode));
    var groups = {}; pool.forEach(function (q) { (groups[q.topic] = groups[q.topic] || []).push(q); });
    var topics = Object.keys(groups);
    if (prefs.mode === 'inteligente') { var weak = weakTopics(state); topics.sort(function (a, b) { return (weak.indexOf(b) !== -1) - (weak.indexOf(a) !== -1); }); }
    else topics = shuffleSeeded(topics, rnd);
    topics.forEach(function (t) { groups[t] = shuffleSeeded(groups[t], rnd); });
    var picked = [], ti = 0, guard = 0;
    while (picked.length < count && guard < 1000) {
      var t = topics[ti % topics.length];
      if (groups[t] && groups[t].length) picked.push(groups[t].shift());
      ti++; guard++;
      if (ti % topics.length === 0 && topics.every(function (x) { return !groups[x].length; })) break;
    }
    var ids = picked.slice(0, count).map(function (q) { return q.id; });
    state.byDate[dISO] = { n: dailyNumber(dISO), questionIds: ids, done: false };
    writeState(state);
    return { ids: ids, n: dailyNumber(dISO), stored: state.byDate[dISO] };
  }

  function completeDaily(dISO, per) {
    var state = ensureState(), entry = state.byDate[dISO]; if (!entry) return;
    var correct = per.filter(function (x) { return x.correct; }).length, total = per.length, pct = Math.round(correct / total * 100);
    entry.done = true; entry.completedAt = new Date().toISOString();
    entry.result = { score: correct, total: total, pct: pct }; entry.per = per;
    per.forEach(function (x) { if (state.answeredIds.indexOf(x.id) === -1) state.answeredIds.push(x.id); });
    state.stats.answered += total; state.stats.correct += correct;
    per.forEach(function (x) { var b = state.stats.byTopic[x.topic] = state.stats.byTopic[x.topic] || { correct: 0, total: 0 }; b.total++; if (x.correct) b.correct++; });
    var last = state.streak.last;
    if (last !== dISO) { if (last && daysBetween(last, dISO) === 1) state.streak.current += 1; else state.streak.current = 1; state.streak.last = dISO; if (state.streak.current > state.streak.best) state.streak.best = state.streak.current; }
    entry.streakDay = state.streak.current;
    var xpGain = 20 + correct * 20; state.xp += xpGain; entry.xp = xpGain;
    writeState(state);
    return { correct: correct, total: total, pct: pct, xp: xpGain, streak: state.streak.current, best: state.streak.best };
  }
  function isDoneToday() { var s = ensureState(); var e = s.byDate[todayISO()]; return !!(e && e.done); }
  function todayEntry() { return ensureState().byDate[todayISO()] || null; }

  function greeting() {
    var prof = window.BPProfile ? window.BPProfile.all() : null;
    var role = (prof && window.BPMessages && window.BPMessages.roleFor) ? window.BPMessages.roleFor(prof) : null;
    if (role && role.word) return T('Tu reto de hoy, ', 'El teu repte d’avui, ') + role.word; // sin emoji
    return T('Tu reto de hoy', 'El teu repte d’avui');
  }

  function startCountdown(el) {
    if (!el) return;
    function tick() {
      var now = new Date(), midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      var s = Math.max(0, Math.floor((midnight - now) / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
      el.textContent = ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + ':' + ('0' + ss).slice(-2);
    }
    tick(); return setInterval(tick, 1000);
  }

  /* ==================================================================== *
   *  DASHBOARD CARD (display a la izquierda, no bloqueante)
   * ==================================================================== */
  function renderDashCard(elId) {
    var box = document.getElementById(elId || 'daily-dash'); if (!box) return;
    var s = ensureState(), doneToday = isDoneToday(), e = todayEntry(), n = dailyNumber(todayISO()), prefs = readPrefs();
    var streak = s.streak.current || 0;
    var right;
    if (doneToday && e && e.result) {
      right = '<div class="dd-state"><span class="dd-done">' + svg('check') + ' ' + T('Reto completado', 'Repte completat') + '</span>' +
        '<div class="dd-score">' + e.result.score + '/' + e.result.total + ' — ' + e.result.pct + '%</div>' +
        '<a class="dd-btn dd-btn--ghost" href="/app/daily.html">' + T('Ver resultado', 'Veure resultat') + '</a></div>';
    } else {
      right = '<div class="dd-state"><span class="dd-ready">' + T('Tu reto de hoy está listo', 'El teu repte d’avui és a punt') + '</span>' +
        '<div class="dd-meta">' + (prefs.count || 5) + ' ' + T('preguntas', 'preguntes') + ' — ~' + Math.max(3, Math.round((prefs.count || 5) * 0.8)) + ' min</div>' +
        '<a class="dd-btn" href="/app/daily.html">' + T('Empezar reto', 'Començar repte') + ' ' + svg('arrow') + '</a></div>';
    }
    box.innerHTML =
      '<section class="daily-card">' +
        '<div class="dd-display">' + heroArt() +
          '<div class="dd-badge">bioPau Daily — #' + n + '</div>' +
          '<div class="dd-streak">' + svg('flame') + ' <b>' + streak + '</b> ' + (streak === 1 ? T('día', 'dia') : T('días', 'dies')) + '</div>' +
        '</div>' +
        '<div class="dd-body"><h3>' + T('Reto del día', 'Repte del dia') + '</h3>' +
          '<p class="dd-sub">' + T('¿Cuánto sabes hoy? Un desafío breve para no perder el ritmo.', 'Quant en saps avui? Un repte breu per no perdre el ritme.') + '</p>' +
          right + '</div>' +
      '</section>';
  }

  /* ==================================================================== *
   *  PÁGINA DAILY
   * ==================================================================== */
  var view = 'reto', run = null, cdTimer = null, running = false, beforeGuard = null;
  function root() { return document.getElementById('daily-root'); }
  function tabsEl() { return document.querySelector('.dl-tabs'); }
  function setTab(v) {
    if (running) return;                          // bloqueado durante el reto
    view = v; if (cdTimer) { clearInterval(cdTimer); cdTimer = null; }
    document.querySelectorAll('.dl-tab').forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-dview') === v); });
    if (v === 'reto') renderReto(); else if (v === 'stats') renderStats(); else renderConfig();
  }

  /* ---- Bloqueo (modo concentración) ---- */
  function lockUI(on) {
    running = on;
    document.body.classList.toggle('dl-locked', on);
    var tb = tabsEl(); if (tb) tb.classList.toggle('is-locked', on);
    if (on && !beforeGuard) { beforeGuard = function (e) { e.preventDefault(); e.returnValue = ''; return ''; }; window.addEventListener('beforeunload', beforeGuard); }
    if (!on && beforeGuard) { window.removeEventListener('beforeunload', beforeGuard); beforeGuard = null; }
  }

  /* ---- Vista RETO ---- */
  function renderReto() {
    var box = root(); if (!box) return;
    var dISO = todayISO(), n = dailyNumber(dISO), s = ensureState();
    var built = buildDaily(dISO), side = sideHTML(dISO, n, s);
    if (built.insufficient) {
      box.innerHTML = layout('<div class="dl-empty">' + svg('trophy', 'big') +
        '<h2>' + T('Has completado todo el contenido disponible', 'Has completat tot el contingut disponible') + '</h2>' +
        '<p>' + T('No quedan preguntas nuevas para tus temas seleccionados. Amplía tus temas o materias para seguir con retos nuevos.', 'No queden preguntes noves per als teus temes. Amplia temes o matèries per seguir amb reptes nous.') + '</p>' +
        '<button class="dl-btn" data-dview="config">' + T('Ampliar temas', 'Ampliar temes') + '</button></div>', side);
      cdTimer = startCountdown(document.getElementById('dl-cd')); return;
    }
    var e = s.byDate[dISO];
    if (e && e.done && e.result) { box.innerHTML = layout(resultHTML(e, true), side); cdTimer = startCountdown(document.getElementById('dl-cd')); return; }
    box.innerHTML = layout(
      '<div class="dl-intro">' + heroArt('lg') +
        '<div class="dl-daynum">bioPau Daily — #' + n + ' — ' + longDate(dISO) + '</div>' +
        '<h1 class="dl-greet">' + esc(greeting()) + '</h1>' +
        '<p class="dl-lead">' + built.ids.length + ' ' + T('preguntas de temas variados. Una oportunidad al día.', 'preguntes de temes variats. Una oportunitat al dia.') + '</p>' +
        '<div class="dl-locknote">' + svg('lock') + ' ' + T('Al empezar entrarás en modo concentración: no podrás salir hasta terminar.', 'En començar entraràs en mode concentració: no podràs sortir fins a acabar.') + '</div>' +
        '<button class="dl-btn dl-btn--big" data-start>' + T('Empezar reto', 'Començar repte') + ' ' + svg('arrow') + '</button>' +
      '</div>', side);
    cdTimer = startCountdown(document.getElementById('dl-cd'));
  }
  function sideHTML(dISO, n, s) {
    var streak = s.streak.current || 0, best = s.streak.best || 0;
    return '<aside class="dl-side">' +
      '<div class="dl-side-card"><div class="dl-side-k">' + svg('flame') + ' ' + T('Racha', 'Ratxa') + '</div><div class="dl-side-v">' + streak + ' <small>' + (streak === 1 ? T('día', 'dia') : T('días', 'dies')) + '</small></div><div class="dl-side-s">' + T('Mejor', 'Millor') + ': ' + best + '</div></div>' +
      '<div class="dl-side-card"><div class="dl-side-k">' + svg('clock') + ' ' + T('Nuevo reto en', 'Nou repte en') + '</div><div class="dl-side-v dl-cd" id="dl-cd">--:--:--</div></div>' +
      '<div class="dl-side-card"><div class="dl-side-k">' + svg('cal') + ' ' + T('Últimos 7 días', 'Últims 7 dies') + '</div>' + last7HTML(s) + '</div>' +
      '<div class="dl-side-card"><div class="dl-side-k">' + svg('spark') + ' XP</div><div class="dl-side-v">' + (s.xp || 0) + '</div></div>' +
    '</aside>';
  }
  function last7HTML(s) {
    var cells = '';
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i); var di = iso(d), e = s.byDate[di], cls = 'dl-d';
      if (e && e.done) cls += (e.result && e.result.pct >= 60) ? ' ok' : ' mid';
      cells += '<span class="' + cls + '" title="' + di + '">' + (e && e.done ? '' : '') + '</span>';
    }
    return '<div class="dl-week">' + cells + '</div>';
  }
  function layout(main, side) { return '<div class="dl-layout"><div class="dl-main">' + main + '</div>' + side + '</div>'; }

  /* ---- Runner inmersivo (bloqueado) ---- */
  function startRun() {
    var dISO = todayISO(), built = buildDaily(dISO);
    run = { ids: built.ids, i: 0, per: [], locked: false, dISO: dISO, n: built.n };
    lockUI(true);
    renderQuestion();
  }
  function renderQuestion() {
    var box = root(); if (!box || !run) return;
    run.locked = false;
    var q = DATA.byId(run.ids[run.i]), n = run.ids.length;
    var segs = '';
    for (var k = 0; k < n; k++) segs += '<span class="dl-seg2' + (k < run.i ? ' done' : k === run.i ? ' now' : '') + '"></span>';
    box.innerHTML =
      '<div class="dl-exam">' +
        '<div class="dl-exam-top">' +
          '<div class="dl-exam-id">bioPau Daily — #' + run.n + '</div>' +
          '<div class="dl-conc">' + svg('lock') + ' ' + T('Modo concentración', 'Mode concentració') + '</div>' +
        '</div>' +
        '<div class="dl-segbar">' + segs + '</div>' +
        '<div class="dl-exam-count">' + T('Pregunta', 'Pregunta') + ' ' + (run.i + 1) + ' ' + T('de', 'de') + ' ' + n + '</div>' +
        '<div class="dl-qcard" id="dl-qcard">' +
          '<div class="dl-qtags"><span class="dl-qtag">' + topicIcon(q.topic) + ' ' + esc(q.topicName || '') + '</span>' +
            '<span class="dl-qdiff dl-' + q.difficulty + '">' + diffLabel(q.difficulty) + '</span></div>' +
          '<div class="dl-qtext">' + esc(q.text) + '</div>' +
          '<div class="dl-opts" role="group">' +
            q.options.map(function (op, idx) { return '<button class="dl-opt" data-opt="' + idx + '"><span class="dl-key">' + String.fromCharCode(65 + idx) + '</span><span class="dl-optxt">' + esc(op) + '</span><span class="dl-mark"></span></button>'; }).join('') +
          '</div>' +
          '<div class="dl-fb" id="dl-fb" aria-live="polite"></div>' +
          '<div class="dl-run-actions" id="dl-next"></div>' +
        '</div>' +
      '</div>';
  }
  function diffLabel(d) { return d === 'facil' ? T('Fácil', 'Fàcil') : d === 'dificil' ? T('Difícil', 'Difícil') : T('Medio', 'Mitjà'); }
  function answer(idx) {
    if (!run || run.locked) return; run.locked = true;
    var q = DATA.byId(run.ids[run.i]), ok = (idx === q.sol);
    run.per.push({ id: q.id, topic: q.topic, topicName: q.topicName, subject: q.subject, correct: ok });
    var opts = document.querySelectorAll('#daily-root .dl-opt');
    opts.forEach(function (o) { o.disabled = true; });
    opts[q.sol].classList.add('is-correct'); opts[q.sol].querySelector('.dl-mark').innerHTML = svg('check');
    if (!ok && opts[idx]) { opts[idx].classList.add('is-wrong'); opts[idx].querySelector('.dl-mark').innerHTML = svg('cross'); }
    var fb = document.getElementById('dl-fb');
    fb.className = 'dl-fb is-on ' + (ok ? 'ok' : 'ko');
    fb.innerHTML = '<div class="dl-verdict">' + (ok ? svg('check') + ' ' + T('Correcto', 'Correcte') : svg('cross') + ' ' + T('No exactamente', 'No exactament')) + '</div>' +
      (ok ? '' : '<div class="dl-ca">' + T('Respuesta correcta:', 'Resposta correcta:') + ' <b>' + esc(q.options[q.sol]) + '</b></div>') +
      '<div class="dl-why"><b>' + T('Por qué', 'Per què') + ':</b> ' + esc(q.explanation) + '</div>';
    var nx = document.getElementById('dl-next'), last = (run.i === run.ids.length - 1);
    nx.innerHTML = '<button class="dl-btn" data-next>' + (last ? T('Ver resultado', 'Veure resultat') : T('Siguiente', 'Següent')) + ' ' + svg('arrow') + '</button>';
  }
  function next() {
    if (run.i < run.ids.length - 1) { run.i++; renderQuestion(); }
    else { completeDaily(run.dISO, run.per); lockUI(false); showResult(); }
  }

  /* ---- Resultado ---- */
  function showResult() { var e = todayEntry(); root().innerHTML = layout(resultHTML(e, false), sideHTML(todayISO(), e.n, ensureState())); cdTimer = startCountdown(document.getElementById('dl-cd')); }
  function resultHTML(e, revisit) {
    var r = e.result, s = ensureState(), perByTopic = {};
    (e.per || []).forEach(function (x) { var b = perByTopic[x.topic] = perByTopic[x.topic] || { name: x.topicName, ok: 0, total: 0 }; b.total++; if (x.correct) b.ok++; });
    var subjects = Object.keys(perByTopic).map(function (t) { var b = perByTopic[t]; var st = b.ok === b.total ? 'ok' : b.ok === 0 ? 'ko' : 'mid'; return '<div class="dl-mrow"><span class="dl-mtopic">' + topicIcon(t) + ' ' + esc(b.name) + '</span><span class="dl-mnum ' + st + '">' + b.ok + '/' + b.total + '</span></div>'; }).join('');
    var worst = null; Object.keys(perByTopic).forEach(function (t) { var b = perByTopic[t]; var p = b.ok / b.total; if (b.ok < b.total && (!worst || p < worst.p)) worst = { t: t, name: b.name, p: p }; });
    var mejora = worst ? '<div class="dl-improve"><div class="dl-improve-k">' + svg('target') + ' ' + T('Para mejorar', 'Per millorar') + '</div>' +
      '<div class="dl-improve-t">' + esc(worst.name) + '</div><p>' + T('Te recomendamos repasar este tema antes de tu próximo reto.', 'Et recomanem repassar aquest tema abans del pròxim repte.') + '</p>' +
      '<a class="dl-btn dl-btn--ghost" href="/app/apuntes.html#' + esc(DATA.topicToBlock(worst.t)) + '">' + T('Repasar tema', 'Repassar tema') + ' ' + svg('arrow') + '</a></div>' : '';
    var perf = r.pct >= 80 ? T('Muy bien', 'Molt bé') : r.pct >= 60 ? T('Bien', 'Bé') : r.pct >= 40 ? T('Puedes mejorar', 'Pots millorar') : T('A repasar', 'A repassar');
    var badges = revisit ? '' : '<div class="dl-badges"><span class="dl-badge">' + svg('flame') + ' ' + (s.streak.current || 0) + ' ' + T('días', 'dies') + '</span>' +
      '<span class="dl-badge">' + svg('spark') + ' +' + (e.xp || 0) + ' XP</span>' + (r.pct === 100 ? '<span class="dl-badge">' + svg('trophy') + ' ' + T('Pleno', 'Ple') + '</span>' : '') + '</div>';
    return '<div class="dl-result">' +
      '<div class="dl-daynum">bioPau Daily — #' + e.n + '</div>' +
      '<h1 class="dl-res-title">' + (revisit ? T('Reto completado', 'Repte completat') : T('¡Reto completado!', 'Repte completat!')) + '</h1>' +
      '<div class="dl-res-score"><span class="dl-res-big">' + r.score + '/' + r.total + '</span><span class="dl-res-pct">' + r.pct + '%</span></div>' + badges +
      '<div class="dl-res-grid">' +
        '<div class="dl-res-block"><h4>' + T('Tu resultado', 'El teu resultat') + '</h4>' +
          '<div class="dl-mrow"><span>' + svg('check', 'ok') + ' ' + T('Correctas', 'Correctes') + '</span><span>' + r.score + '</span></div>' +
          '<div class="dl-mrow"><span>' + svg('cross', 'ko') + ' ' + T('Incorrectas', 'Incorrectes') + '</span><span>' + (r.total - r.score) + '</span></div>' +
          '<div class="dl-mrow"><span>' + T('Rendimiento', 'Rendiment') + '</span><span>' + perf + '</span></div></div>' +
        '<div class="dl-res-block"><h4>' + T('Por materias', 'Per matèries') + '</h4>' + subjects + '</div>' +
      '</div>' + mejora +
      '<div class="dl-res-actions">' +
        '<button class="dl-btn dl-btn--ghost" data-share>' + svg('share') + ' ' + T('Compartir', 'Compartir') + '</button>' +
        '<button class="dl-btn dl-btn--ghost" data-dview="stats">' + T('Ver estadísticas', 'Veure estadístiques') + '</button>' +
      '</div>' +
      '<p class="dl-comeback">' + T('Vuelve mañana para tu próximo reto.', 'Torna demà per al teu pròxim repte.') + '</p></div>';
  }

  function shareResult() {
    var e = todayEntry(); if (!e || !e.result) return;
    var txt = 'bioPau Daily #' + e.n + '\n' + e.result.score + '/' + e.result.total + ' — ' + e.result.pct + '%';
    if (navigator.share) navigator.share({ title: 'bioPau Daily', text: txt }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast(T('Resultado copiado', 'Resultat copiat')); }, function () {});
    else toast(txt);
  }
  function toast(msg) {
    var el = document.getElementById('dl-toast');
    if (!el) { el = document.createElement('div'); el.id = 'dl-toast'; el.className = 'dl-toast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('is-on'); setTimeout(function () { el.classList.remove('is-on'); }, 1800);
  }

  /* ---- Vista ESTADÍSTICAS ---- */
  function topicName(t) { var b = (D && D.BLOQUES ? D.BLOQUES : []).filter(function (x) { return x.id === t; })[0]; return b ? b.nombre : t; }
  function renderStats() {
    var box = root(); if (!box) return; var s = ensureState(), bt = s.stats.byTopic || {};
    var rows = Object.keys(bt).map(function (t) { var b = bt[t]; return { t: t, name: topicName(t), pct: Math.round(b.correct / b.total * 100), total: b.total }; }).sort(function (a, b) { return a.pct - b.pct; });
    var mean = s.stats.answered ? Math.round(s.stats.correct / s.stats.answered * 100) : 0;
    var completed = Object.keys(s.byDate).filter(function (d) { return s.byDate[d].done; }).length;
    var weak = rows.filter(function (r) { return r.pct < 70; }), strong = rows.filter(function (r) { return r.pct >= 70; });
    var fails = [];
    Object.keys(s.byDate).sort().reverse().forEach(function (d) { var e = s.byDate[d]; if (!e.done || !e.per) return; e.per.forEach(function (x) { if (!x.correct) { var q = DATA.byId(x.id); if (q) fails.push({ q: q }); } }); });
    fails = fails.slice(0, 8);
    if (!rows.length) { box.innerHTML = '<div class="dl-empty">' + svg('chart', 'big') + '<h2>' + T('Aún no hay estadísticas', 'Encara no hi ha estadístiques') + '</h2><p>' + T('Completa tu primer reto para empezar a ver tu progreso.', 'Completa el teu primer repte per començar a veure el teu progrés.') + '</p><button class="dl-btn" data-dview="reto">' + T('Ir al reto', 'Anar al repte') + '</button></div>'; return; }
    var tiles = '<div class="dl-stat-tiles">' + tile('chart', mean + '%', T('Media de aciertos', 'Mitjana d’encerts')) + tile('stack', completed, T('Retos completados', 'Reptes completats')) + tile('flame', (s.streak.current || 0) + '/' + (s.streak.best || 0), T('Racha / mejor', 'Ratxa / millor')) + tile('spark', s.stats.answered || 0, T('Preguntas', 'Preguntes')) + '</div>';
    var reviewB = weak.length ? '<div class="dl-stat-card"><h3>' + T('Temas a repasar más', 'Temes a repassar més') + '</h3>' + weak.map(function (r) { return topicBar(r, '#F87171'); }).join('') + '</div>' : '';
    var goodB = strong.length ? '<div class="dl-stat-card"><h3>' + T('Lo que llevas mejor', 'El que portes millor') + '</h3>' + strong.map(function (r) { return topicBar(r, '#ADE80C'); }).join('') + '</div>' : '';
    var failsB = fails.length ? '<div class="dl-stat-card"><h3>' + T('Tus errores — cómo hacerlas bien', 'Els teus errors — com fer-les bé') + '</h3>' + fails.map(function (f) {
      return '<div class="dl-fail"><div class="dl-fail-topic">' + topicIcon(f.q.topic) + ' ' + esc(f.q.topicName) + '</div><div class="dl-fail-q">' + esc(f.q.text) + '</div><div class="dl-fail-a">' + svg('check', 'ok') + ' ' + esc(f.q.options[f.q.sol]) + '</div><div class="dl-fail-w">' + esc(f.q.explanation) + '</div><a class="dl-mini" href="/app/apuntes.html#' + esc(DATA.topicToBlock(f.q.topic)) + '">' + T('Repasar', 'Repassar') + ' ' + esc(f.q.topicName) + ' ' + svg('arrow') + '</a></div>';
    }).join('') + '</div>' : '';
    box.innerHTML = '<div class="dl-stats">' + tiles + '<div class="dl-stat-grid">' + reviewB + goodB + '</div>' + failsB + '</div>';
  }
  function tile(ic, v, k) { return '<div class="dl-tile"><span class="dl-tile-ico">' + svg(ic) + '</span><span class="dl-tile-v">' + v + '</span><span class="dl-tile-k">' + k + '</span></div>'; }
  function topicBar(r, col) { return '<a class="dl-tbar" href="/app/apuntes.html#' + esc(DATA.topicToBlock(r.t)) + '"><div class="dl-tbar-head"><span class="dl-mtopic">' + topicIcon(r.t) + ' ' + esc(r.name) + '</span><span>' + r.pct + '%</span></div><div class="dl-tbar-track"><span style="width:' + r.pct + '%;background:' + col + '"></span></div><span class="dl-tbar-go">' + T('Repasar temario', 'Repassar temari') + ' ' + svg('arrow') + '</span></a>'; }

  /* ---- Vista CONFIGURA ---- */
  var PRESETS = { todo: { es: 'Todo mi temario', ca: 'Tot el meu temari' }, debiles: { es: 'Mis temas débiles', ca: 'Els meus temes febles' }, objetivo: { es: 'Mi objetivo PAU', ca: 'El meu objectiu PAU' }, custom: { es: 'Personalizado', ca: 'Personalitzat' } };
  function renderConfig() {
    var box = root(); if (!box) return; var prefs = readPrefs(), subs = DATA.subjects();
    var topicsHTML = subs.map(function (s) {
      var chips = s.topics.map(function (tp) { var key = s.id + ':' + tp.id, on = !prefs.topics || prefs.topics[key] !== false; return '<label class="dl-chk"><input type="checkbox" data-topic="' + key + '"' + (on ? ' checked' : '') + '><span style="--tc:' + tp.color + '">' + esc(tp.name) + '</span></label>'; }).join('');
      return '<div class="dl-cfg-sub"><div class="dl-cfg-subhead">' + esc(s.name) + '</div><div class="dl-chks">' + chips + '</div></div>';
    }).join('');
    function seg(name, val, opts) { return '<div class="dl-seg" data-seg="' + name + '">' + opts.map(function (o) { return '<button class="dl-seg-b' + (val === o.v ? ' is-on' : '') + '" data-val="' + o.v + '">' + o.l + '</button>'; }).join('') + '</div>'; }
    box.innerHTML = '<div class="dl-config">' +
      '<div class="dl-cfg-card"><h3>' + T('Ajustes rápidos', 'Ajustos ràpids') + '</h3><div class="dl-presets">' + Object.keys(PRESETS).map(function (k) { return '<button class="dl-preset" data-preset="' + k + '">' + PRESETS[k][langOf()] + '</button>'; }).join('') + '</div></div>' +
      '<div class="dl-cfg-card"><h3>' + T('Materias y temas', 'Matèries i temes') + '</h3>' + topicsHTML + '</div>' +
      '<div class="dl-cfg-card"><h3>' + T('Dificultad', 'Dificultat') + '</h3>' + seg('difficulty', prefs.difficulty, [{ v: 'facil', l: T('Fácil', 'Fàcil') }, { v: 'medio', l: T('Medio', 'Mitjà') }, { v: 'dificil', l: T('Difícil', 'Difícil') }, { v: 'mixto', l: T('Mixto', 'Mixt') }]) + '</div>' +
      '<div class="dl-cfg-card"><h3>' + T('Modo', 'Mode') + '</h3>' + seg('mode', prefs.mode, [{ v: 'personalizado', l: T('Personalizado', 'Personalitzat') }, { v: 'inteligente', l: T('Inteligente', 'Intel·ligent') }, { v: 'repaso', l: T('Repaso', 'Repàs') }]) +
        '<p class="dl-cfg-hint">' + T('Inteligente prioriza (en parte) tus temas flojos manteniendo variedad. Repaso usa preguntas nuevas de tus temas fallados.', 'Intel·ligent prioritza (en part) els temes fluixos mantenint varietat. Repàs fa servir preguntes noves dels temes fallats.') + '</p></div>' +
      '<div class="dl-cfg-card"><h3>' + T('Número de preguntas', 'Nombre de preguntes') + '</h3>' + seg('count', String(prefs.count), [{ v: '3', l: '3' }, { v: '5', l: '5' }, { v: '10', l: '10' }]) + '</div>' +
      '<div class="dl-cfg-note">' + T('Los cambios se guardan solos y se aplican a tu próximo reto.', 'Els canvis es desen sols i s’apliquen al pròxim repte.') + '</div></div>';
  }
  function applyPreset(k) {
    var prefs = readPrefs();
    if (k === 'todo') { prefs.topics = null; prefs.mode = 'personalizado'; }
    else if (k === 'debiles') { prefs.mode = 'inteligente'; prefs.topics = null; }
    else if (k === 'objetivo') { prefs.mode = 'personalizado'; prefs.topics = null; }
    writePrefs(prefs); renderConfig(); toast(T('Preferencias guardadas', 'Preferències desades'));
  }

  /* ---------------- Eventos -------------------------------------------- */
  function wire() {
    document.addEventListener('click', function (ev) {
      var el = ev.target.closest ? ev.target.closest('[data-start],[data-opt],[data-next],[data-dview],[data-share],[data-preset]') : null;
      if (!el) return;
      if (el.hasAttribute('data-dview')) { if (running) return; setTab(el.getAttribute('data-dview')); return; }
      if (el.hasAttribute('data-start')) { startRun(); return; }
      if (el.hasAttribute('data-opt')) { answer(+el.getAttribute('data-opt')); return; }
      if (el.hasAttribute('data-next')) { next(); return; }
      if (el.hasAttribute('data-share')) { shareResult(); return; }
      if (el.hasAttribute('data-preset')) { applyPreset(el.getAttribute('data-preset')); return; }
    });
    document.addEventListener('change', function (ev) { var c = ev.target.closest ? ev.target.closest('[data-topic]') : null; if (c) { var prefs = readPrefs(); prefs.topics = prefs.topics || {}; prefs.topics[c.getAttribute('data-topic')] = c.checked; writePrefs(prefs); } });
    document.addEventListener('click', function (ev) { var b = ev.target.closest ? ev.target.closest('.dl-seg-b') : null; if (!b) return; var seg = b.parentNode.getAttribute('data-seg'), val = b.getAttribute('data-val'); var prefs = readPrefs(); prefs[seg] = (seg === 'count') ? parseInt(val, 10) : val; writePrefs(prefs); b.parentNode.querySelectorAll('.dl-seg-b').forEach(function (x) { x.classList.remove('is-on'); }); b.classList.add('is-on'); toast(T('Guardado', 'Desat')); });
    document.addEventListener('bp:langchange', function () { if (running) return; if (view === 'reto' && !run) renderReto(); else if (view === 'stats') renderStats(); else if (view === 'config') renderConfig(); });
  }
  function initPage() { if (!root() || !DATA || !D) return; wire(); setTab('reto'); }

  return { initPage: initPage, renderDashCard: renderDashCard, isDoneToday: isDoneToday };
})();
