/* ============================================================================
   BioPAU — Dashboard "Centro de control" (Fase D)
   ----------------------------------------------------------------------------
   Reúne en un vistazo lo que está repartido por la app:
     · Próximo evento del calendario (y días restantes)
     · Próximo punto de control (mini test sin completar)
     · Última nota y mejor nota (tests)
     · Progreso del temario
   Lee de: window.BPCalEvents, window.BPTests, window.BIOPAU_TESTS,
   window.BIOPAU_DATA y window.BPData. Todo tolerante a que algo falte.
   Se pinta en #control-hub.
   ============================================================================ */
window.BPHub = (function () {
  'use strict';
  var lang = function () { try { var v = localStorage.getItem('biopau_lang'); return v === 'ca' ? 'ca' : 'es'; } catch (e) { return 'es'; } };
  var T = function (es, ca) { return lang() === 'ca' ? ca : es; };
  var D = window.BIOPAU_DATA;

  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parse(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function daysTo(iso) { return Math.round((parse(iso) - parse(todayISO())) / 86400000); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  var ML = { es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'], ca: ['gener','febrer','març','abril','maig','juny','juliol','agost','setembre','octubre','novembre','desembre'] };
  var DL = { es: ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'], ca: ['diumenge','dilluns','dimarts','dimecres','dijous','divendres','dissabte'] };
  function todayLabel() { var d = new Date(); return DL[lang()][d.getDay()] + ', ' + d.getDate() + ' ' + ML[lang()][d.getMonth()]; }

  /* --- Próximo evento del calendario --- */
  function nextEvent() {
    if (!window.BPCalEvents || !window.BPCalEvents.allEvents) return null;
    var t = todayISO();
    var fut = window.BPCalEvents.allEvents().filter(function (e) { return e.date >= t; })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    return fut[0] || null;
  }

  /* --- Próximo checkpoint (primer mini test sin completar) --- */
  function nextCheckpoint() {
    if (!window.BPTests || !D) return null;
    var bl = D.BLOQUES || [];
    for (var i = 0; i < bl.length; i++) {
      if (window.BIOPAU_TESTS && window.BIOPAU_TESTS.forBloque(bl[i].id) && !window.BPTests.isMiniDone(bl[i].id)) return bl[i];
    }
    return null; // todos hechos
  }

  /* --- Notas de tests --- */
  function grades() {
    var last = (window.BPTests && window.BPTests.lastResult) ? window.BPTests.lastResult() : null;
    var best = 0, any = false;
    try {
      var all = JSON.parse(localStorage.getItem('biopau_tests') || '{}');
      for (var id in all) if (all.hasOwnProperty(id) && all[id].attempts && all[id].attempts.length) { any = true; if ((all[id].best || 0) > best) best = all[id].best; }
    } catch (e) {}
    return { last: last, best: Math.round(best) / 10, any: any };
  }

  function progressPct() {
    try { var gp = window.BPData ? window.BPData.globalProgress() : null; return gp ? (gp.pct || 0) : 0; } catch (e) { return 0; }
  }

  function tile(cls, tc, k, v, s, go, href) {
    return '<a class="hub-tile" style="--tc:' + tc + '" href="' + href + '">' +
      '<span class="k">' + k + '</span>' +
      '<span class="v">' + v + '</span>' +
      (s ? '<span class="s">' + s + '</span>' : '') +
      (go ? '<span class="go">' + go + ' →</span>' : '') +
    '</a>';
  }

  function render() {
    var box = document.getElementById('control-hub');
    if (!box) return;
    // Próximo evento
    var ev = nextEvent(), evTile;
    if (ev) {
      var dd = daysTo(ev.date);
      var when = dd === 0 ? T('hoy', 'avui') : dd === 1 ? T('mañana', 'demà') : T('en ' + dd + ' días', 'd’aquí ' + dd + ' dies');
      evTile = tile('', '#38BDF8', '📅 ' + T('Próximo', 'Pròxim'), esc(ev.title), when, T('Ver calendario', 'Veure calendari'), '/app/calendario.html');
    } else {
      evTile = tile('', '#38BDF8', '📅 ' + T('Próximo', 'Pròxim'), T('Sin eventos', 'Sense esdeveniments'), T('Planifica tu semana', 'Planifica la setmana'), T('Añadir', 'Afegir'), '/app/calendario.html');
    }
    // Checkpoint
    var cp = nextCheckpoint(), cpTile;
    if (cp) cpTile = tile('', '#FB923C', '🎯 ' + T('Próximo control', 'Pròxim control'), T('Mini test', 'Mini test'), esc(cp.nombre), T('Empezar', 'Començar'), '/app/tests.html');
    else cpTile = tile('', '#FB923C', '🎯 ' + T('Puntos de control', 'Punts de control'), '✓ ' + T('Al día', 'Al dia'), T('Todos completados', 'Tots completats'), T('Ver tests', 'Veure tests'), '/app/tests.html');
    // Notas
    var g = grades(), gTile;
    if (g.any && g.last) gTile = tile('', '#ADE80C', '📈 ' + T('Última nota', 'Última nota'), g.last.grade.toFixed(1) + ' <small>/10</small>', '🏆 ' + T('Mejor', 'Millor') + ': ' + g.best.toFixed(1) + '/10', T('Ver tests', 'Veure tests'), '/app/tests.html');
    else gTile = tile('', '#ADE80C', '📈 ' + T('Última nota', 'Última nota'), '—', T('Aún sin tests', 'Encara sense tests'), T('Hacer un test', 'Fer un test'), '/app/tests.html');
    // Progreso
    var pct = progressPct();
    var pTile = '<a class="hub-tile" style="--tc:#5FD3A6" href="/app/apuntes.html">' +
      '<span class="k">✅ ' + T('Progreso', 'Progrés') + '</span>' +
      '<span class="v">' + pct + '%</span>' +
      '<span class="hub-mini-bar"><span style="width:0%" data-w="' + pct + '"></span></span>' +
      '<span class="go">' + T('Ir al temario', 'Anar al temari') + ' →</span></a>';

    box.innerHTML =
      '<section class="hub">' +
        '<div class="hub-head"><h2>' + T('Hoy', 'Avui') + '</h2><span class="hub-today">' + todayLabel() + '</span></div>' +
        '<div class="hub-grid">' + evTile + cpTile + gTile + pTile + '</div>' +
      '</section>';
    setTimeout(function () { var b = box.querySelector('.hub-mini-bar > span'); if (b) b.style.width = (b.getAttribute('data-w') || 0) + '%'; }, 200);
  }

  function init() {
    render();
    document.addEventListener('bp:langchange', render);
  }
  return { init: init, render: render };
})();
