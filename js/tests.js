/* ============================================================================
   BioPAU — Motor de TESTS · MODO EXAMEN (maqueta)
   ----------------------------------------------------------------------------
   · Home: bloques con Mini test (checkpoint) y Test final tipo PAU (bloqueado
     hasta completar el mini). Estados: sin empezar / completado / mejorar.
   · Al pulsar un test → entra en MODO EXAMEN con transición tipo swipe:
       – una pregunta cada vez,
       – al responder, avanza (swipe) a la siguiente,
       – NO se puede volver atrás ni mirar respuestas.
   · Al acabar: resultado (%, nota estimada) y "Mejorar nota". Sin revisión.
   Persistencia: localStorage (biopau_tests). Datos: js/tests-data.js.
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
    s.attempts.push({ at: new Date().toISOString(), score: res.score, total: res.total, pct: res.pct, grade: res.grade });
    s.done = true; s.tipo = test.tipo;
    var improved = res.pct > (s.best || 0);
    if (improved) s.best = res.pct;
    all[test.id] = s; writeAll(all);
    return { improved: improved, best: s.best };
  }
  function isMiniDone(bloqueId) {
    var pack = TESTS.forBloque(bloqueId);
    if (!pack || !pack.mini) return false;
    var s = stateOf(pack.mini.id); return !!(s && s.done);
  }

  /* ---------------- Utilidades ------------------------------------------ */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function gradeFromPct(pct) { return Math.round(pct) / 10; }
  function fmtDate(iso) { try { var d = new Date(iso); return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear(); } catch (e) { return ''; } }
  var root = function () { return document.getElementById('tests-root'); };

  /* ---------------- Home ------------------------------------------------ */
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
  function renderHome() {
    var box = root(); if (!box) return;
    var cards = (D.BLOQUES || []).map(function (b) {
      var pack = TESTS.forBloque(b.id); if (!pack) return '';
      var finalLocked = !isMiniDone(b.id);
      var rows = '';
      if (pack.mini) {
        rows += '<div class="tt-row"><div class="tt-row-info">' +
          '<span class="tt-row-title">🧩 ' + T('Mini test', 'Mini test') + '</span>' +
          '<span class="tt-row-sub">' + pack.mini.preguntas.length + ' ' + T('preguntas', 'preguntes') + ' · ' + T('modo examen', 'mode examen') + '</span>' +
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
      return '<article class="tt-card" style="--bc:' + b.color + '"><div><h3>' + esc(b.nombre) + '</h3><p class="tt-desc">' + esc(b.desc || '') + '</p></div>' + rows + '</article>';
    }).join('');
    box.innerHTML = '<div class="tt-grid">' + cards + '</div>';
  }

  /* ---------------- MODO EXAMEN (swipe) --------------------------------- */
  var run = null;   // { test, i, wrong:[], locked:bool }
  function startTest(testId) {
    var test = TESTS.testById(testId);
    if (!test) return;
    run = { test: test, i: 0, wrong: [], locked: false };
    var box = root(); if (!box) return;
    box.innerHTML =
      '<div class="tt-exam tt-exam-enter">' +
        '<div class="tt-exam-bar">' +
          '<div class="tt-exam-meta"><span class="tt-exam-name">' + esc(test.titulo) + '</span>' +
            '<span class="tt-exam-mode">' + T('Modo examen', 'Mode examen') + '</span></div>' +
          '<button class="tt-exam-x" data-abort aria-label="' + T('Abandonar', 'Abandonar') + '">×</button>' +
        '</div>' +
        '<div class="tt-exam-progress"><span id="tt-exam-fill" style="width:0%"></span></div>' +
        '<div class="tt-stage" id="tt-stage"></div>' +
      '</div>';
    scrollTop();
    setTimeout(function () { renderQuestion('in'); }, 40);
  }

  function questionHTML(q, n, idx) {
    return '<div class="tt-slide" id="tt-slide">' +
      '<div class="tt-q-num">' + T('Pregunta', 'Pregunta') + ' ' + (idx + 1) + ' / ' + n + '</div>' +
      '<div class="tt-q-text">' + esc(q.q) + '</div>' +
      '<div class="tt-opts" role="group">' +
        q.ops.map(function (op, i) {
          return '<button class="tt-opt" data-opt="' + i + '"><span class="tt-key">' + String.fromCharCode(65 + i) + '</span><span>' + esc(op) + '</span></button>';
        }).join('') +
      '</div>' +
      '<div class="tt-exam-hint">' + T('Elige una respuesta para continuar. No podrás volver atrás.', 'Tria una resposta per continuar. No podràs tornar enrere.') + '</div>' +
    '</div>';
  }
  function renderQuestion(dir) {
    var stage = document.getElementById('tt-stage'); if (!stage || !run) return;
    var test = run.test, q = test.preguntas[run.i], n = test.preguntas.length;
    stage.innerHTML = questionHTML(q, n, run.i);
    var slide = document.getElementById('tt-slide');
    slide.classList.add(dir === 'in' ? 'enter-right' : 'enter-right');
    // forzar reflow y activar
    void slide.offsetWidth;
    slide.classList.add('is-active');
    run.locked = false;
    var fill = document.getElementById('tt-exam-fill');
    if (fill) fill.style.width = Math.round((run.i) / n * 100) + '%';
  }
  function answer(idx) {
    if (!run || run.locked) return;
    run.locked = true;
    var q = run.test.preguntas[run.i];
    if (idx !== q.sol) run.wrong.push(run.i);
    var opts = document.querySelectorAll('#tt-slide .tt-opt');
    opts.forEach(function (o) { o.disabled = true; });
    if (opts[idx]) opts[idx].classList.add('is-picked');
    var slide = document.getElementById('tt-slide');
    var n = run.test.preguntas.length;
    var fill = document.getElementById('tt-exam-fill');
    if (fill) fill.style.width = Math.round((run.i + 1) / n * 100) + '%';
    setTimeout(function () {
      if (slide) slide.classList.add('leave-left');
      setTimeout(function () {
        if (run.i < n - 1) { run.i++; renderQuestion('next'); }
        else finish();
      }, 260);
    }, 240);
  }

  /* ---------------- Resultado (sin revisión) ---------------------------- */
  function finish() {
    var test = run.test, n = test.preguntas.length;
    var score = n - run.wrong.length;
    var pct = Math.round(score / n * 100);
    var grade = gradeFromPct(pct);
    var rec = recordAttempt(test, { score: score, total: n, pct: pct, grade: grade });
    scrollTop();
    var box = root();
    var C = 2 * Math.PI * 80, off = C * (1 - pct / 100);
    box.innerHTML =
      '<div class="tt-result tt-exam-enter">' +
        '<h2 style="font-family:var(--display);font-weight:800;font-size:1.4rem;margin-bottom:4px">' + esc(test.titulo) + '</h2>' +
        '<div class="tt-score-ring"><svg viewBox="0 0 180 180" width="180" height="180">' +
          '<defs><linearGradient id="ttGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ADE80C"/><stop offset="100%" stop-color="#5FD3A6"/></linearGradient></defs>' +
          '<circle class="rt" cx="90" cy="90" r="80"></circle>' +
          '<circle class="rb" cx="90" cy="90" r="80" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '" id="tt-ring"></circle>' +
        '</svg><div class="tt-score-center"><span class="tt-score-pct">' + pct + '%</span><span class="tt-score-cap">' + score + ' / ' + n + '</span></div></div>' +
        '<div class="tt-grade">' + T('Nota estimada', 'Nota estimada') + ': ' + grade.toFixed(1) + ' <small>/10</small></div>' +
        (rec.improved ? '<div class="tt-badge-best">🏆 ' + T('Nueva mejor nota', 'Nova millor nota') + ': ' + gradeFromPct(rec.best).toFixed(1) + '/10</div>' : '') +
        '<div class="tt-stats">' +
          '<div class="tt-stat ok"><div class="v">' + score + '</div><div class="k">✅ ' + T('Correctas', 'Correctes') + '</div></div>' +
          '<div class="tt-stat ko"><div class="v">' + run.wrong.length + '</div><div class="k">❌ ' + T('Incorrectas', 'Incorrectes') + '</div></div>' +
        '</div>' +
        '<div class="tt-analysis"><h4>' + T('Tu rendimiento', 'El teu rendiment') + '</h4><p>' + analysis(pct) + '</p></div>' +
        '<div class="tt-result-actions">' +
          '<button class="tt-btn" data-run="' + test.id + '">' + T('Mejorar nota', 'Millorar nota') + '</button>' +
          '<button class="tt-btn tt-btn--ghost" data-home>' + T('Volver a tests', 'Tornar als tests') + '</button>' +
        '</div>' +
      '</div>';
    setTimeout(function () { var r = document.getElementById('tt-ring'); if (r) r.style.strokeDashoffset = off; }, 60);
    run = null;
  }
  function analysis(pct) {
    if (pct >= 90) return T('Excelente. Dominas este bloque. Repásalo de vez en cuando y pasa al siguiente.', 'Excel·lent. Domines aquest bloc. Repassa’l de tant en tant i passa al següent.');
    if (pct >= 70) return T('Buen nivel. Revisa los apuntes de lo que fallaste y afínalo para llegar a la excelencia.', 'Bon nivell. Revisa els apunts del que has fallat i afina-ho per arribar a l’excel·lència.');
    if (pct >= 50) return T('Vas por buen camino, pero necesitas reforzar. Vuelve a los apuntes y repite el test.', 'Vas per bon camí, però necessites reforçar. Torna als apunts i repeteix el test.');
    return T('Aún te falta base en este bloque. Repasa con calma y vuelve a intentarlo.', 'Encara et falta base en aquest bloc. Repassa amb calma i torna-ho a provar.');
  }

  /* ---------------- Historial (Mis resultados) -------------------------- */
  function renderHistory(onlyId) {
    var box = root(); if (!box) return;
    var all = readAll(), items = [];
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
        return '<tr><td>' + (i + 1) + '</td><td>' + fmtDate(a.at) + '</td><td class="grade">' + gradeFromPct(a.pct).toFixed(1) + (trophy ? ' <span class="tt-trophy">🏆</span>' : '') + '</td><td>' + a.score + '/' + a.total + '</td></tr>';
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
    view = v; run = null;
    document.querySelectorAll('.tt-tab').forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-view') === v); });
    if (v === 'home') renderHome(); else renderHistory();
  }
  function scrollTop() { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} }

  function wire() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-run],[data-hist],[data-opt],[data-abort],[data-home],[data-view]') : null;
      if (!el) return;
      if (el.hasAttribute('data-view')) { setTab(el.getAttribute('data-view')); return; }
      if (el.hasAttribute('data-run')) { e.preventDefault(); startTest(el.getAttribute('data-run')); return; }
      if (el.hasAttribute('data-hist')) { e.preventDefault(); setTab('history'); renderHistory(el.getAttribute('data-hist')); return; }
      if (el.hasAttribute('data-opt')) { answer(+el.getAttribute('data-opt')); return; }
      if (el.hasAttribute('data-abort')) { run = null; setTab('home'); return; }
      if (el.hasAttribute('data-home')) { run = null; setTab('home'); return; }
    });
    document.addEventListener('bp:langchange', function () { if (!run) { if (view === 'home') renderHome(); else renderHistory(); } });
  }

  function lastResult() {
    var all = readAll(), best = null;
    for (var id in all) if (all.hasOwnProperty(id)) {
      var s = all[id]; if (!s.attempts || !s.attempts.length) continue;
      var a = s.attempts[s.attempts.length - 1];
      if (!best || a.at > best.at) best = { at: a.at, grade: gradeFromPct(a.pct), pct: a.pct, id: id };
    }
    return best;
  }

  function init() { if (!D || !TESTS) return; wire(); setTab('home'); }

  return { init: init, isMiniDone: isMiniDone, lastResult: lastResult, stateOf: stateOf };
})();
