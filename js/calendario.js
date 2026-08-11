/* ============================================================================
   BioPAU — vista CALENDARIO / TRACKER
   Rejilla mensual donde el alumno marca sus días de estudio.
   Se guarda en la tabla study_days (RLS: cada alumno solo ve los suyos).
   ============================================================================ */
(function () {
  var sb = window.sb;
  var D = window.BIOPAU_DATA;
  var cursor = new Date();          // mes que se está mostrando
  var dias = {};                    // { 'YYYY-MM-DD': true }

  var MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var DIAS = ['L','M','X','J','V','S','D'];

  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  async function cargarMes() {
    if (!sb || window.BPData.state.needsSetup) return;
    var ini = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    var fin = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    var r = await sb.from('study_days').select('day').gte('day', iso(ini)).lte('day', iso(fin));
    if (r.error) { console.warn('[calendario]', r.error.message); return; }
    dias = {};
    (r.data || []).forEach(function (row) { dias[row.day] = true; });
  }

  function render() {
    var grid = document.getElementById('cal-grid');
    var title = document.getElementById('cal-title');
    if (!grid) return;

    title.textContent = MESES[cursor.getMonth()] + ' ' + cursor.getFullYear();

    var primero = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    var offset = (primero.getDay() + 6) % 7;               // lunes primero
    var total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    var hoy = iso(new Date());
    var pau = new Date(D.PAU_TARGET);
    var pauIso = iso(pau);

    var html = DIAS.map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join('');
    for (var i = 0; i < offset; i++) html += '<div></div>';

    for (var d = 1; d <= total; d++) {
      var fecha = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      var key = iso(fecha);
      var cls = 'cal-day';
      if (dias[key]) cls += ' is-done';
      if (key === hoy) cls += ' is-today';
      if (key === pauIso) cls += ' is-pau';
      html += '<button class="' + cls + '" data-day="' + key + '">' + d +
              (key === pauIso ? '<span class="cal-tag">PAU</span>' : '') + '</button>';
    }
    grid.innerHTML = html;

    var marcados = Object.keys(dias).length;
    var res = document.getElementById('cal-resumen');
    if (res) res.textContent = marcados + (marcados === 1 ? ' día marcado este mes' : ' días marcados este mes');
  }

  async function toggleDia(key, el) {
    if (window.BPData.state.needsSetup) return;
    var u = await window.BP.user();
    if (!u) return;
    el.disabled = true;
    if (dias[key]) {
      var del = await sb.from('study_days').delete().eq('user_id', u.id).eq('day', key);
      if (!del.error) { delete dias[key]; el.classList.remove('is-done'); }
    } else {
      var ins = await sb.from('study_days').upsert({ user_id: u.id, day: key }, { onConflict: 'user_id,day' });
      if (!ins.error) { dias[key] = true; el.classList.add('is-done'); }
    }
    el.disabled = false;
    var marcados = Object.keys(dias).length;
    var res = document.getElementById('cal-resumen');
    if (res) res.textContent = marcados + (marcados === 1 ? ' día marcado este mes' : ' días marcados este mes');
  }

  document.addEventListener('DOMContentLoaded', async function () {
    window.BPShell.render({ crumb: 'Calendario' });
    await window.BPData.load();
    var st = window.BPData.state;
    if (st.needsSetup) {
      var n = document.getElementById('setup-notice');
      if (n) n.classList.add('is-on');
    }
    var perfil = await window.BP.profile();
    window.BPShell.setUser(perfil && perfil.username, st.stats.avatar_id, st.stats.streak_days);

    await cargarMes();
    render();

    document.getElementById('cal-prev').addEventListener('click', async function () {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
      await cargarMes(); render();
    });
    document.getElementById('cal-next').addEventListener('click', async function () {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      await cargarMes(); render();
    });
    document.getElementById('cal-grid').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-day]') : null;
      if (b) toggleDia(b.getAttribute('data-day'), b);
    });
  });
})();
