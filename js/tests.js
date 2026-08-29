/* ============================================================================
   BioPAU — Motor de TESTS (área privada)
   ----------------------------------------------------------------------------
   · Mini-test (checkpoint) por bloque → desbloquea el Test final tipus PAU.
   · Feedback inmediato con explicación (correcto / incorrecto + por qué).
   · Resultado con % y nota estimada /10, análisis y revisión de errores.
   · Historial de intentos, mejor nota y "Mejorar nota" (repetir).
   Persistencia: localStorage (biopau_tests) + Supabase best-effort (needsSetup).
   Datos: js/tests-data.js (window.BIOPAU_TESTS) · bloques: window.BIOPAU_DATA.
   ============================================================================ */
window.BPTests = (function () {
  'use strict';

  var STORE = 'biopau_tests';
  var lang = function () { try { var v = localStorage.getItem('biopau_lang'); return v === 'ca' ? 'ca' : 'es'; } catch (e) { return 'es'; } };
  var T = function (es, ca) { return lang() === 'ca' ? ca : es; };
  var D = window.BIOPAU_DATA;
  var TESTS = window.BIOPAU_TESTS;

  /* ---------------- Persistencia ---------------------------------------- */
  function readAll() { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) { return {}; } }
  function writeAll(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {} }
  function stateOf(id) { var a = readAll(); return a[id] || null; }

  function recordAttempt(test, res) {
    var all = readAll();
    var s = all[test.id] || { attempts: [], best: 0, done: false, tipo: test.tipo };
    var attempt = { at: new Date().toISOString(), score: res.score, total: res.total, pct: res.pct, grade: res.grade };
    s.attempts.push(attempt);
    s.done = true;
    s.tipo = test.tipo;
    s.wrongLast = res.wrong;         // índices fallados en el último intento
    var improved = res.pct > (s.best || 0);
    if (improved) s.best = res.pct;
    all[test.id] = s;
    writeAll(all);
    // Supabase best-effort (no rompe si no existe la tabla)
    try {
      if (window.sb && window.BP && window.BP.user) {
        window.BP.user().then(function (u) {
          if (!u) return;
          window.sb.from('test_results').insert({
            user_id: u.id, test_id: test.id, tipo: test.tipo,
            score: res.score, total: res.total, pct: res.pct, grade: res.grade
          }).then(function () {}, function () {});
        });
      }
    } catch (e) {}
    return { improved: improved, best: s.best };
  }

  function isMiniDone(bloqueId) {
    var pack = TESTS.forBloque(bloqueId);
    if (!pack || !pack.mini) return false;
    var s = stateOf(pack.mini.id);
    return !!(s && s.done);
  }

  /* ---------------- Utilidades ------------------------------------------ */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function gradeFromPct(pct) { return Math.round(pct) / 10; }            // 0..10 con 1 decimal
  function fmtDate(iso) { try { var d = new Date(iso); return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear(); } catch (e) { return ''; } }
  var root = function () { return document.getElementById('tests-root'); };

  /* ---------------- Estado del test para la home ------------------------ */
  function stateBadge(id, locked) {
    if (locked) return '<span class="tt-badge tt-badge--lock">🔒</span>';
    var s = stateOf(id);
    if (s && s.done) return '<span class="tt-badge tt-badge--done">' + T('Completado', 'Completat') + '</span>';
    return '<span class="tt-badge">' + T('Sin empezar', 'Sense començar') + '</span>';
  }
  function actionFor(test, locked) {
    if (locked) return '<button class="tt-btn tt-btn--ghost" disabled>' + T('Bloqueado', 'Bloquejat') + '</button>';
    var s = stateOf(test.id);
    if (s && s.done) {
      return '<button class="tt-btn" data-run="' + test.id + '">' + T('Mejorar nota', 'Millorar nota') + '</button>' +
             '<button class="tt-btn tt-btn--ghost" data-hist="' + test.id + '">' + T('Ver resultado', 'Veure resultat') + '</button>';
    }
    return '<button class="tt-btn" data-run="' + test.id + '">' + T('Empezar test', 'Començar test') + '</button>';
  }
  function bestLine(id) {
    var s = stateOf(id);
    if (!s || !s.attempts || !s.attempts.length) return '';
    return '<span class="tt-mini-pill">🏆 ' + T('Mejor', 'Millor') + ': ' + gradeFromPct(s.best).toFixed(1) + '/10 · ' +
           s.attempts.length + ' ' + (s.attempts.length === 1 ? T('intento', 'intent') : T('intentos', 'intents')) + '</span>';
  }

  /* ---------------- Vista: Home (grid de bloques) ----------------------- */
  function renderHome() {
    var box = root(); if (!box) return;
    var cards = (D.BLOQUES || []).map(function (b) {
      var pack = TESTS.forBloque(b.id);
      if (!pack) return '';
      var miniDone = isMiniDone(b.id);
      var finalLocked = !miniDone;
      var rows = '';
      if (pack.mini) {
        rows += '<div class="tt-row"><div class="tt-row-info">' +
          '<span class="tt-row-title">🧩 ' + T('Mini test', 'Mini test') + '</span>' +
          '<span class="tt-row-sub">' + pack.mini.preguntas.length + ' ' + T('preguntas', 'preguntes') + ' · ' + T('punto de control', 'punt de control') + '</span>' +
          bestLine(pack.mini.id) + '</div>' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' + stateBadge(pack.mini.id, false) + actionFor(pack.mini, false) + '</div></div>';
      }
      if (pack.final) {
        rows += '<div class="tt-row' + (finalLocked ? ' is-locked' : '') + '"><div class="tt-row-info">' +
          '<span class="tt-row-title">🎯 ' + T('Test final tipo PAU', 'Test final tipus PAU') + '</span>' +
          '<span class="tt-row-sub">' + (finalLocked ? T('Completa el mini test para desbloquear', 'Completa el mini test per desbloquejar') : (pack.final.preguntas.length + ' ' + T('preguntas', 'preguntes') + ' · ' + T('simulacro', 'simulacre'))) + '</span>' +
          (finalLocked ? '' : bestLine(pack.final.id)) + '</div>' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' + stateBadge(pack.final.id, finalLocked) + actionFor(pack.final, finalLocked) + '</div></div>';
      }
      return '<article class="tt-card" style="--bc:' + b.color + '">' +
        '<div><h3>' + esc(b.nombre) + '</h3><p class="tt-desc">' + esc(b.desc || '') + '</p></div>' + rows + '</article>';
    }).join('');
    box.innerHTML = '<div class="tt-grid">' + cards + '</div>';
  }

  /* ---------------- Vista: Runner --------------------------------------- */
  var run = null; // { test, i, answers:[], wrong:[] }
  function startTest(testId) {
    var test = TESTS.testById(testId);
    if (!test) return;
    run = { test: test, i: 0, answers: [], wrong: [] };
    scrollTop();
    renderQuestion();
  }
  function renderQuestion() {
    var box = root(); if (!box || !run) return;
    var test = run.test, q = test.preguntas[run.i], n = test.preguntas.length;
    var pct = Math.round((run.i) / n * 100);
    box.innerHTML =
      '<div class="tt-runner">' +
        '<div class="tt-run-top"><span class="tt-run-name">' + esc(test.titulo) + '</span>' +
          '<button class="tt-btn tt-btn--ghost" data-abort>' + T('Salir', 'Sortir') + '</button></div>' +
        '<div class="tt-progress"><span style="width:' + pct + '%"></span></div>' +
        '<div class="tt-count">' + T('Pregunta', 'Pregunta') + ' ' + (run.i + 1) + ' / ' + n + '</div>' +
        '<div class="tt-q"><div class="tt-q-text">' + esc(q.q) + '</div>' +
          '<div class="tt-opts" role="group">' +
            q.ops.map(function (op, idx) {
              return '<button class="tt-opt" data-opt="' + idx + '"><span class="tt-key">' + String.fromCharCode(65 + idx) + '</span><span>' + esc(op) + '</span><span class="tt-mark"></span></button>';
            }).join('') +
          '</div>' +
          '<div class="tt-feedback" id="tt-fb" aria-live="polite"></div>' +
          '<div class="tt-run-actions" id="tt-next" style="display:none"></div>' +
        '</div>' +
      '</div>';
  }
  function answer(idx) {
    var q = run.test.preguntas[run.i];
    var opts = root().querySelectorAll('.tt-opt');
    opts.forEach(function (o) { o.disabled = true; });
    var correct = q.sol, ok = (idx === correct);
    run.answers[run.i] = idx;
    if (!ok) run.wrong.push(run.i);
    opts[correct].classList.add('is-correct');
    opts[correct].querySelector('.tt-mark').textContent = '✓';
    if (!ok) { opts[idx].classList.add('is-wrong'); opts[idx].querySelector('.tt-mark').textContent = '✗'; }
    var fb = document.getElementById('tt-fb');
    fb.className = 'tt-feedback is-on ' + (ok ? 'ok' : 'ko');
    fb.innerHTML =
      '<div class="tt-verdict">' + (ok ? '✅ ' + T('Correcto', 'Correcte') : '❌ ' + T('Incorrecto', 'Incorrecte')) + '</div>' +
      (ok ? '' : '<div class="tt-correct-answer">' + T('Respuesta correcta:', 'Resposta correcta:') + ' <b>' + esc(q.ops[correct]) + '</b></div>') +
      '<div class="tt-why"><b>' + T('Por qué:', 'Per què:') + '</b> ' + esc(q.why) + '</div>';
    var nx = document.getElementById('tt-next');
    var last = (run.i === run.test.preguntas.length - 1);
    nx.style.display = 'flex';
    nx.innerHTML = '<button class="tt-btn" data-next>' + (last ? T('Ver resultado', 'Veure resultat') + ' →' : T('Siguiente', 'Següent') + ' →') + '</button>';
  }
  function next() {
    if (run.i < run.test.preguntas.length - 1) { run.i++; scrollTop(); renderQuestion(); }
    else finish();
  }

  /* ---------------- Vista: Resultado ------------------------------------ */
  function finish() {
    var test = run.test, n = test.preguntas.length;
    var score = n - run.wrong.length;
    var pct = Math.round(score / n * 100);
    var grade = gradeFromPct(pct);
    var res = { score: score, total: n, pct: pct, grade: grade, wrong: run.wrong.slice() };
    var rec = recordAttempt(test, res);
    scrollTop();
    var box = root();
    var C = 2 * Math.PI * 80, off = C * (1 - pct / 100);
    var an = analysis(pct);
    box.innerHTML =
      '<div class="tt-result">' +
        '<h2 style="font-family:var(--display);font-weight:800;font-size:1.4rem;margin-bottom:4px">' + esc(test.titulo) + '</h2>' +
        '<div class="tt-score-ring"><svg viewBox="0 0 180 180" width="180" height="180">' +
          '<defs><linearGradient id="ttGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ADE80C"/><stop offset="100%" stop-color="#5FD3A6"/></linearGradient></defs>' +
          '<circle class="rt" cx="90" cy="90" r="80"></circle>' +
          '<circle class="rb" cx="90" cy="90" r="80" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '" id="tt-ring"></circle>' +
        '</svg><div class="tt-score-center"><span class="tt-score-pct">' + pct + '%</span><span class="tt-score-cap">' + score + ' / ' + n + '</span></div></div>' +
        '<div class="tt-grade">' + T('Nota estimada', 'Nota estimada') + ': ' + grade.toFixed(1) + ' <small>/10</small></div>' +
        (rec.improved && run.test.tipo ? '<div class="tt-badge-best">🏆 ' + T('Nueva mejor nota', 'Nova millor nota') + ': ' + gradeFromPct(rec.best).toFixed(1) + '/10</div>' : '') +
        '<div class="tt-stats">' +
          '<div class="tt-stat ok"><div class="v">' + score + '</div><div class="k">✅ ' + T('Correctas', 'Correctes') + '</div></div>' +
          '<div class="tt-stat ko"><div class="v">' + run.wrong.length + '</div><div class="k">❌ ' + T('Incorrectas', 'Incorrectes') + '</div></div>' +
        '</div>' +
        '<div class="tt-analysis"><h4>' + T('Tu rendimiento', 'El teu rendiment') + '</h4><p>' + an + '</p></div>' +
        '<div class="tt-result-actions">' +
          (run.wrong.length ? '<button class="tt-btn tt-btn--ghost" data-review>' + T('Ver errores', 'Veure errors') + '</button>' : '') +
          '<button class="tt-btn" data-run="' + test.id + '">' + T('Mejorar nota', 'Millorar nota') + '</button>' +
          '<button class="tt-btn tt-btn--ghost" data-home>' + T('Volver a tests', 'Tornar als tests') + '</button>' +
        '</div>' +
        '<div id="tt-review-box"></div>' +
      '</div>';
    setTimeout(function () { var r = document.getElementById('tt-ring'); if (r) r.style.strokeDashoffset = off; }, 60);
  }
  function analysis(pct) {
    if (pct >= 90) return T('¡Excelente! Dominas este bloque. Repásalo de vez en cuando para no perder el nivel y pasa al siguiente.', 'Excel·lent! Domines aquest bloc. Repassa’l de tant en tant i passa al següent.');
    if (pct >= 70) return T('Buen nivel. Lo haces bien en la mayoría de conceptos; revisa los fallos y afínalos para llegar a la excelencia.', 'Bon nivell. Ho fas bé en la majoria de conceptes; revisa els errors i afina’ls per arribar a l’excel·lència.');
    if (pct >= 50) return T('Vas por buen camino, pero necesitas reforzar. Vuelve a los apuntes de los conceptos fallados y repite el test.', 'Vas per bon camí, però necessites reforçar. Torna als apunts dels conceptes fallats i repeteix el test.');
    return T('Aún te falta base en este bloque. Repasa los apuntes con calma y vuelve a intentarlo: mejorarás rápido.', 'Encara et falta base en aquest bloc. Repassa els apunts amb calma i torna-ho a provar: milloraràs de pressa.');
  }
  function renderReview(intoResult) {
    var test = run.test;
    var html = '<div class="tt-review">' + test.preguntas.map(function (q, i) {
      var wrong = run.wrong.indexOf(i) !== -1;
      var given = run.answers[i];
      return '<div class="tt-review-q' + (wrong ? '' : ' ok') + '">' +
        '<div class="rq">' + (wrong ? '❌ ' : '✅ ') + esc(q.q) + '</div>' +
        (wrong && given != null ? '<div class="ra bad">' + T('Tu respuesta:', 'La teva resposta:') + ' ' + esc(q.ops[given]) + '</div>' : '') +
        '<div class="ra good">' + T('Correcta:', 'Correcta:') + ' ' + esc(q.ops[q.sol]) + '</div>' +
        '<div class="rw">' + esc(q.why) + '</div></div>';
    }).join('') + '</div>';
    var target = intoResult ? document.getElementById('tt-review-box') : root();
    if (target) { target.innerHTML = html; if (intoResult) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }

  /* ---------------- Vista: Historial (Mis resultados) ------------------- */
  function renderHistory(onlyId) {
    var box = root(); if (!box) return;
    var all = readAll();
    var items = [];
    (D.BLOQUES || []).forEach(function (b) {
      var pack = TESTS.forBloque(b.id); if (!pack) return;
      ['mini', 'final'].forEach(function (k) {
        var test = pack[k]; if (!test) return;
        var s = all[test.id];
        if (s && s.attempts && s.attempts.length && (!onlyId || onlyId === test.id)) items.push({ b: b, test: test, s: s });
      });
    });
    if (!items.length) { box.innerHTML = '<div class="tt-empty">' + T('Todavía no has hecho ningún test. ¡Empieza por un mini test!', 'Encara no has fet cap test. Comença per un mini test!') + '</div>'; return; }
    box.innerHTML = items.map(function (it) {
      var s = it.s, best = gradeFromPct(s.best), last = s.attempts[s.attempts.length - 1];
      var rows = s.attempts.map(function (a, i) {
        var trophy = (Math.round(a.pct) === Math.round(s.best));
        return '<tr><td>' + (i + 1) + '</td><td>' + fmtDate(a.at) + '</td><td class="grade">' + gradeFromPct(a.pct).toFixed(1) +
          (trophy ? ' <span class="tt-trophy">🏆</span>' : '') + '</td><td>' + a.score + '/' + a.total + '</td></tr>';
      }).join('');
      return '<div class="tt-hist-card"><div class="tt-hist-head"><div>' +
          '<div class="tt-hist-title">' + esc(it.b.nombre) + ' — ' + esc(it.test.titulo) + '</div>' +
          '<div class="tt-hist-meta"><span class="m">' + T('Mejor', 'Millor') + ': <b>' + best.toFixed(1) + '/10</b></span>' +
            '<span class="m">' + T('Último', 'Últim') + ': <b>' + gradeFromPct(last.pct).toFixed(1) + '</b></span>' +
            '<span class="m">' + T('Intentos', 'Intents') + ': <b>' + s.attempts.length + '</b></span>' +
            '<span class="m">' + T('Fecha', 'Data') + ': <b>' + fmtDate(last.at) + '</b></span></div></div>' +
          '<button class="tt-btn" data-run="' + it.test.id + '">' + T('Mejorar nota', 'Millorar nota') + '</button></div>' +
        '<table class="tt-table"><thead><tr><th>' + T('Intento', 'Intent') + '</th><th>' + T('Fecha', 'Data') + '</th><th>' + T('Nota', 'Nota') + '</th><th>' + T('Aciertos', 'Encerts') + '</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '</div>';
    }).join('');
  }

  /* ---------------- Router / tabs --------------------------------------- */
  var view = 'home';
  function setTab(v) {
    view = v;
    document.querySelectorAll('.tt-tab').forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-view') === v); });
    if (v === 'home') renderHome();
    else renderHistory();
  }
  function scrollTop() { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} }

  /* ---------------- Eventos --------------------------------------------- */
  function wire() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-run],[data-hist],[data-next],[data-opt],[data-abort],[data-home],[data-review],[data-view]') : null;
      if (!el) return;
      if (el.hasAttribute('data-view')) { setTab(el.getAttribute('data-view')); return; }
      if (el.hasAttribute('data-run')) { e.preventDefault(); startTest(el.getAttribute('data-run')); return; }
      if (el.hasAttribute('data-hist')) { e.preventDefault(); setTab('history'); renderHistory(el.getAttribute('data-hist')); return; }
      if (el.hasAttribute('data-opt')) { if (run && run.answers[run.i] == null) answer(+el.getAttribute('data-opt')); return; }
      if (el.hasAttribute('data-next')) { next(); return; }
      if (el.hasAttribute('data-abort')) { run = null; setTab('home'); return; }
      if (el.hasAttribute('data-home')) { run = null; setTab('home'); return; }
      if (el.hasAttribute('data-review')) { renderReview(true); return; }
    });
    document.addEventListener('bp:langchange', function () { if (view === 'home' && !run) renderHome(); else if (view === 'history' && !run) renderHistory(); });
  }

  /* ---------------- API pública (para el dashboard) --------------------- */
  function lastResult() {
    var all = readAll(), best = null;
    for (var id in all) if (all.hasOwnProperty(id)) {
      var s = all[id]; if (!s.attempts || !s.attempts.length) continue;
      var a = s.attempts[s.attempts.length - 1];
      if (!best || a.at > best.at) best = { at: a.at, grade: gradeFromPct(a.pct), pct: a.pct, id: id };
    }
    return best;
  }

  function init() {
    if (!D || !TESTS) return;
    wire();
    setTab('home');
  }

  return { init: init, isMiniDone: isMiniDone, lastResult: lastResult, stateOf: stateOf };
})();
