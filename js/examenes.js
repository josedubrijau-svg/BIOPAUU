/* ============================================================================
   BioPAU — vista EXÁMENES Y EJERCICIOS
   Lista las convocatorias desde js/study-data.js y permite filtrar por bloque.

   👉 CUANDO SUBAS LOS EXÁMENES: añade a cada entrada de EXAMENES un campo
      "url" (PDF o página propia) y cámbialo en el botón "Abrir" de renderFila.
   ============================================================================ */
(function () {
  var D = window.BIOPAU_DATA;
  var filtro = 'todos';

  function renderFiltros() {
    var box = document.getElementById('filtros');
    if (!box) return;
    var chips = [{ id: 'todos', nombre: 'Todos', color: '#ADE80C' }].concat(D.BLOQUES);
    box.innerHTML = chips.map(function (b) {
      var on = (b.id === filtro);
      return '<button class="chip' + (on ? ' chip--done' : '') + '" data-filtro="' + b.id + '">' + b.nombre + '</button>';
    }).join('');
  }

  function renderFila(ex) {
    var bloques = ex.bloques.map(function (id) {
      var b = D.bloquePorId(id);
      return b ? '<span class="chip" style="border-color:' + b.color + '55;color:' + b.color + '">' + b.nombre + '</span>' : '';
    }).join(' ');
    return '<div class="list-item">' +
      '<span class="idx">' + ex.anio + '</span>' +
      '<span class="ti"><span class="t">PAU ' + ex.anio + ' · ' + ex.convocatoria + '</span>' +
      '<span class="s" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">' + bloques + '</span></span>' +
      '<span class="chip">Próximamente</span>' +
      '</div>';
  }

  function render() {
    var box = document.getElementById('examenes');
    if (!box) return;
    var lista = D.EXAMENES.filter(function (ex) {
      return filtro === 'todos' || ex.bloques.indexOf(filtro) !== -1;
    });
    box.innerHTML = lista.length
      ? '<div class="list">' + lista.map(renderFila).join('') + '</div>'
      : '<p style="color:var(--txt-dim);margin-top:18px">No hay exámenes de ese bloque todavía.</p>';
  }

  document.addEventListener('DOMContentLoaded', async function () {
    window.BPShell.render({ crumb: 'Exámenes' });
    await window.BPData.load();
    var st = window.BPData.state;
    var perfil = await window.BP.profile();
    window.BPShell.setUser(perfil && perfil.username, st.stats.avatar_id, st.stats.streak_days);

    renderFiltros();
    render();

    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-filtro]') : null;
      if (!b) return;
      filtro = b.getAttribute('data-filtro');
      renderFiltros();
      render();
    });
  });
})();
