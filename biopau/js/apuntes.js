/* ============================================================================
   BioPAU — vista APUNTES
   Genera el temario a partir de js/study-data.js y permite marcar el estado de
   cada tema (pendiente → en progreso → completado), que alimenta el dashboard.

   👉 CUANDO TENGAS EL CONTENIDO: da a cada tema una página propia
      (p. ej. /app/temas/gen-01.html) o un campo "contenido" en study-data.js,
      y sustituye el enlace "Abrir" de renderTema por esa ruta.
   ============================================================================ */
(function () {
  var D = window.BIOPAU_DATA;
  var tr = function (k, v) { return window.BPI18n ? window.BPI18n.t(k, v) : k; };
  function LABEL(status) { return tr(status === 'in_progress' ? 'ap.st_inprogress' : status === 'done' ? 'ap.st_done' : 'ap.st_pending'); }

  var CHIP = { pending: '', in_progress: 'chip--prog', done: 'chip--done' };
  var NEXT = { pending: 'in_progress', in_progress: 'done', done: 'pending' };

  function renderTema(t, i, status) {
    return '<div class="list-item" data-topic="' + t.id + '">' +
      '<span class="idx">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="ti"><span class="t">' + t.titulo + '</span>' +
      '<span class="s">' + t.resumen + '</span></span>' +
      '<button class="chip ' + CHIP[status] + '" data-cycle="' + t.id + '">' + LABEL(status) + '</button>' +
      '</div>';
  }

  function render() {
    var box = document.getElementById('temario');
    if (!box) return;
    box.innerHTML = D.BLOQUES.map(function (b) {
      var temas = b.temas.map(function (t, i) {
        return renderTema(t, i, window.BPData.statusOf(t.id));
      }).join('');
      var done = b.temas.filter(function (t) { return window.BPData.statusOf(t.id) === 'done'; }).length;
      return '<div class="block-head" id="' + b.id + '">' +
        '<span class="dot" style="background:' + b.color + '"></span>' +
        '<h2>' + b.nombre + '</h2>' +
        '<span class="chip">' + done + '/' + b.temas.length + '</span></div>' +
        '<p style="color:var(--txt-dim);font-size:.9rem;margin-top:2px">' + b.desc + '</p>' +
        '<div class="list">' + temas + '</div>';
    }).join('');

    // Si venimos de una sugerencia (#gen-01), llevamos el foco a ese tema
    if (location.hash) {
      var el = document.querySelector('[data-topic="' + location.hash.slice(1) + '"]');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.borderColor = 'var(--lime)';
      }
    }
  }

  function wire() {
    document.addEventListener('click', async function (e) {
      var btn = e.target.closest ? e.target.closest('[data-cycle]') : null;
      if (!btn) return;
      var id = btn.getAttribute('data-cycle');
      var actual = window.BPData.statusOf(id);
      var nuevo = NEXT[actual];
      btn.disabled = true;
      var ok = await window.BPData.setTopicStatus(id, nuevo);
      btn.disabled = false;
      if (ok) {
        btn.textContent = LABEL(nuevo);
        btn.className = 'chip ' + CHIP[nuevo];
        pintarResumen();
      }
    });
  }

  function pintarResumen() {
    var gp = window.BPData.globalProgress();
    var el = document.getElementById('temario-resumen');
    if (el) el.textContent = tr('ap.summary', { done: gp.done, total: gp.total, pct: gp.pct });
    // refrescar contadores por bloque
    D.BLOQUES.forEach(function (b) {
      var head = document.getElementById(b.id);
      if (!head) return;
      var chip = head.querySelector('.chip');
      var done = b.temas.filter(function (t) { return window.BPData.statusOf(t.id) === 'done'; }).length;
      if (chip) chip.textContent = done + '/' + b.temas.length;
    });
  }

  document.addEventListener('DOMContentLoaded', async function () {
    window.BPShell.render({ crumb: 'Apuntes' });
    await window.BPData.load();
    var st = window.BPData.state;
    if (st.needsSetup) {
      var n = document.getElementById('setup-notice');
      if (n) n.classList.add('is-on');
    }
    var perfil = await window.BP.profile();
    window.BPShell.setUser(perfil && perfil.username, st.stats.avatar_id, st.stats.streak_days);
    render();
    pintarResumen();
    wire();
    document.addEventListener('bp:langchange', function () { render(); pintarResumen(); });
  });
})();
