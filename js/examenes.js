/* ============================================================================
   BioPAU — vista EXÁMENES Y EJERCICIOS
   Convocatorias (PDF completo) organizadas por año y filtrables por bloque.
   Cada examen muestra sus preguntas etiquetadas por bloque, y se puede
   VER o DESCARGAR el enunciado en PDF. Los datos: js/examenes-data.js.
   ============================================================================ */
(function () {
  var D = window.BIOPAU_DATA;
  var tr = function (k, v) { return window.BPI18n ? window.BPI18n.t(k, v) : k; };
  var filtro = 'todos';

  function data() {
    if (window.BIOPAU_EXAMENES && window.BIOPAU_EXAMENES.EXAMENES) return window.BIOPAU_EXAMENES;
    // compatibilidad con el formato antiguo (study-data)
    return {
      EXAMENES: (D.EXAMENES || []).map(function (e) { return { id: e.id, anio: e.anio, convocatoria: e.convocatoria, pdf: '', preguntas: (e.bloques || []).map(function (b, i) { return { n: i + 1, bloques: [b] }; }) }; }),
      bloquesDe: function (ex) { var s = {}; (ex.preguntas || []).forEach(function (p) { (p.bloques || []).forEach(function (b) { s[b] = 1; }); }); return Object.keys(s); }
    };
  }

  function convLabel(c) {
    if (c === 'Ordinaria' || c === 'Ordinària') return tr('ex.conv_ord');
    if (c === 'Extraordinaria' || c === 'Extraordinària') return tr('ex.conv_ext');
    return c || '';
  }
  function chipBloque(id, dim) {
    var b = D.bloquePorId(id); if (!b) return '';
    return '<span class="ex-tag' + (dim ? ' is-dim' : '') + '" style="border-color:' + b.color + '55;color:' + b.color + '">' + b.nombre + '</span>';
  }

  function renderFiltros() {
    var box = document.getElementById('filtros');
    if (!box) return;
    var chips = [{ id: 'todos', nombre: tr('ex.all'), color: '#ADE80C' }].concat(D.BLOQUES);
    box.innerHTML = chips.map(function (b) {
      var on = (b.id === filtro);
      return '<button class="chip' + (on ? ' chip--done' : '') + '" data-filtro="' + b.id + '">' + b.nombre + '</button>';
    }).join('');
  }

  function tienePdf(ex) { return ex.pdf && ex.pdf.trim(); }

  function renderExam(ex, DATA) {
    var titulo = 'PAU ' + ex.anio;
    var sub = convLabel(ex.convocatoria) + (ex.serie ? ' — ' + ex.serie : '');

    // Acciones
    var acciones;
    if (tienePdf(ex)) {
      acciones =
        '<a class="btn btn--sm" href="' + ex.pdf + '" target="_blank" rel="noopener noreferrer">' + tr('ex.view') + ' <span class="arw">↗</span></a>' +
        '<a class="btn btn--ghost btn--sm" href="' + ex.pdf + '" download>' + tr('ex.download') + '</a>';
    } else {
      acciones = '<span class="chip">' + tr('ex.soon') + '</span>';
    }

    // Preguntas
    var preguntas = (ex.preguntas || []).map(function (p) {
      var match = (filtro === 'todos') || (p.bloques || []).indexOf(filtro) !== -1;
      var tags = (p.bloques || []).map(function (b) { return chipBloque(b, filtro !== 'todos' && !match); }).join('');
      var tit = p.titulo || (tr('ex.pregunta') + ' ' + p.n);
      return '<div class="ex-q' + (filtro !== 'todos' && !match ? ' is-dim' : (filtro !== 'todos' && match ? ' is-hit' : '')) + '">' +
        '<span class="ex-qn">P' + p.n + '</span>' +
        '<span class="ex-qt">' + tit + '</span>' +
        '<span class="ex-qtags">' + tags + '</span></div>';
    }).join('');

    return '<article class="ex-card">' +
      '<div class="ex-head">' +
        '<div class="ex-id"><div class="ex-year">' + titulo + '</div><div class="ex-conv">' + sub + '</div></div>' +
        '<div class="ex-actions">' + acciones + '</div>' +
      '</div>' +
      '<div class="ex-qs">' + preguntas + '</div>' +
      '</article>';
  }

  function render() {
    var box = document.getElementById('examenes');
    if (!box) return;
    var DATA = data();
    var lista = DATA.EXAMENES.filter(function (ex) {
      if (filtro === 'todos') return true;
      return DATA.bloquesDe(ex).indexOf(filtro) !== -1;
    }).sort(function (a, b) { return b.anio - a.anio; });

    if (!lista.length) { box.innerHTML = '<p style="color:var(--txt-dim);margin-top:18px">' + tr('ex.empty') + '</p>'; return; }

    var count = lista.length;
    var resumen = '<p class="ex-count">' + tr(count === 1 ? 'ex.count_1' : 'ex.count_n', { n: count }) + '</p>';
    box.innerHTML = resumen + '<div class="ex-list">' + lista.map(function (ex) { return renderExam(ex, DATA); }).join('') + '</div>';
  }

  document.addEventListener('DOMContentLoaded', async function () {
    window.BPShell.render({ crumb: 'Exámenes' });
    await window.BPData.load();
    var st = window.BPData.state;
    var perfil = await window.BP.profile();
    window.BPShell.setUser(perfil && perfil.username, st.stats.avatar_id, st.stats.streak_days);

    renderFiltros();
    render();
    document.addEventListener('bp:langchange', function () { renderFiltros(); render(); });

    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-filtro]') : null;
      if (!b) return;
      filtro = b.getAttribute('data-filtro');
      renderFiltros();
      render();
    });
  });
})();
