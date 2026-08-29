/* ============================================================================
   BioPAU — Calendari útil (Fase C) · motor d'esdeveniments
   ----------------------------------------------------------------------------
   Esdeveniments tipats guardats al navegador (localStorage biopau_events).
   Tipus: estudio · examen · simulacro · control · importante · objetivo.
   Vistes: Mes (graella clicable) i Cronograma (Gantt educatiu).
   Tot funcional: afegir/editar/esborrar, detall amb "Veure temari", botó Avui,
   "Anar a temari", llegenda que filtra, i estats buits amb acció.
   No necessita cap configuració de servidor.
   ============================================================================ */
window.BPCalEvents = (function () {
  'use strict';

  var langOf = function () { try { var v = localStorage.getItem('biopau_lang'); return v === 'ca' ? 'ca' : 'es'; } catch (e) { return 'es'; } };
  var T = function (es, ca) { return langOf() === 'ca' ? ca : es; };
  var D = window.BIOPAU_DATA;

  var TYPES = {
    estudio:    { es: 'Estudio',            ca: 'Estudi',            dot: '🟢', color: '#ADE80C' },
    examen:     { es: 'Examen',             ca: 'Examen',            dot: '🔵', color: '#38BDF8' },
    simulacro:  { es: 'Simulacro',          ca: 'Simulacre',         dot: '🟣', color: '#A78BFA' },
    control:    { es: 'Punto de control',   ca: 'Punt de control',   dot: '🟠', color: '#FB923C' },
    importante: { es: 'Fecha importante',   ca: 'Data important',    dot: '🔴', color: '#F87171' },
    objetivo:   { es: 'Objetivo',           ca: 'Objectiu',          dot: '🟡', color: '#FBBF24' }
  };
  function typeLabel(t) { var d = TYPES[t]; return d ? T(d.es, d.ca) : t; }

  /* Data orientativa de la PAU (ajustable). L'usuari pot afegir la seva. */
  var PAU_DATE = '2027-06-08';

  /* ---------------- Store ---------------------------------------------- */
  var KEY = 'biopau_events';
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function write(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function seeded() {
    return [{ id: 'seed-pau', date: PAU_DATE, type: 'importante', title: T('PAU · Biología (orientativa)', 'PAU · Biologia (orientativa)'), time: '', bloque: '', note: T('Fecha orientativa del examen. Ajústala cuando salga el calendario oficial.', 'Data orientativa de l’examen. Ajusta-la quan surti el calendari oficial.'), seed: true }];
  }
  function allEvents() { return seeded().concat(read()); }
  function eventsOn(dateISO) { return allEvents().filter(function (e) { return e.date === dateISO; }); }
  function addEvent(ev) { var a = read(); ev.id = 'e' + Date.now() + Math.floor(Math.random() * 999); a.push(ev); write(a); return ev; }
  function updateEvent(id, patch) { var a = read(); for (var i = 0; i < a.length; i++) if (a[i].id === id) { for (var k in patch) a[i][k] = patch[k]; } write(a); }
  function removeEvent(id) { write(read().filter(function (e) { return e.id !== id; })); }

  /* ---------------- Utilidades de fecha -------------------------------- */
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parse(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() { return new Date(); }
  function todayISO() { return iso(today()); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function startOfWeekMon(d) { var x = new Date(d); var w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); x.setHours(0, 0, 0, 0); return x; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  var MONTHS = { es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'], ca: ['gener','febrer','març','abril','maig','juny','juliol','agost','setembre','octubre','novembre','desembre'] };
  var DOW = { es: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], ca: ['Dl','Dt','Dc','Dj','Dv','Ds','Dg'] };
  function monthName(y, m) { return MONTHS[langOf()][m] + ' ' + y; }
  function fmtLong(dISO) { var d = parse(dISO); return DOW[langOf()][(d.getDay() + 6) % 7] + ' ' + d.getDate() + ' ' + MONTHS[langOf()][d.getMonth()]; }

  /* ---------------- Estado --------------------------------------------- */
  var cursor = new Date(); cursor.setDate(1);
  var view = 'mes';
  var selected = todayISO();
  var filterOff = {}; // tipos desactivados en la leyenda

  function root() { return document.getElementById('cal-root'); }
  function bloqueName(id) { if (!id || !D) return ''; var b = (D.BLOQUES || []).filter(function (x) { return x.id === id; })[0]; return b ? b.nombre : ''; }

  /* ---------------- Barra + leyenda ------------------------------------ */
  function toolbarHTML() {
    var opts = (D && D.BLOQUES ? D.BLOQUES : []).map(function (b) { return '<option value="' + b.id + '">' + esc(b.nombre) + '</option>'; }).join('');
    return '<div class="ce-tabs">' +
        '<button class="ce-tab' + (view === 'mes' ? ' is-active' : '') + '" data-view="mes">' + T('Mes', 'Mes') + '</button>' +
        '<button class="ce-tab' + (view === 'crono' ? ' is-active' : '') + '" data-view="crono">' + T('Cronograma', 'Cronograma') + '</button>' +
      '</div>' +
      '<div class="ce-toolbar">' +
        (view === 'mes' ?
          '<div class="ce-nav"><button data-cal="prev" aria-label="Anterior">‹</button><button data-cal="next" aria-label="Siguiente">›</button></div>' +
          '<span class="ce-month-title">' + monthName(cursor.getFullYear(), cursor.getMonth()) + '</span>' +
          '<button class="ce-btn ce-btn--ghost" data-cal="today">' + T('Hoy', 'Avui') + '</button>'
          : '<span class="ce-month-title">' + T('Plan de estudio', 'Pla d’estudi') + '</span>') +
        '<span class="ce-spacer"></span>' +
        '<select class="ce-select" data-goto-temari><option value="">' + T('Ir a temario…', 'Anar a temari…') + '</option>' + opts + '</select>' +
        '<button class="ce-btn" data-cal="add">+ ' + T('Añadir evento', 'Afegir esdeveniment') + '</button>' +
      '</div>';
  }
  function legendHTML() {
    return '<div class="ce-legend">' + Object.keys(TYPES).map(function (k) {
      var d = TYPES[k];
      return '<button class="ce-leg' + (filterOff[k] ? ' is-off' : '') + '" data-leg="' + k + '"><span class="dot" style="background:' + d.color + '"></span>' + typeLabel(k) + '</button>';
    }).join('') + '</div>';
  }

  /* ---------------- Vista Mes ------------------------------------------ */
  function renderMonth() {
    var y = cursor.getFullYear(), m = cursor.getMonth();
    var first = new Date(y, m, 1);
    var start = startOfWeekMon(first);
    var cells = '';
    var dows = DOW[langOf()].map(function (d) { return '<div class="ce-dow">' + d + '</div>'; }).join('');
    for (var i = 0; i < 42; i++) {
      var d = addDays(start, i), di = iso(d), out = (d.getMonth() !== m);
      var evs = eventsOn(di).filter(function (e) { return !filterOff[e.type]; });
      var chips = evs.slice(0, 3).map(function (e) {
        return '<div class="ce-ev" style="--ec:' + (TYPES[e.type] ? TYPES[e.type].color : '#ADE80C') + '">' + esc(e.title) + '</div>';
      }).join('');
      var more = evs.length > 3 ? '<div class="ce-more">+' + (evs.length - 3) + '</div>' : '';
      cells += '<div class="ce-day' + (out ? ' is-out' : '') + (di === todayISO() ? ' is-today' : '') + (di === selected ? ' is-selected' : '') + '" data-day="' + di + '">' +
        '<div class="ce-daynum">' + d.getDate() + '</div>' +
        '<div class="ce-evs">' + chips + more + '</div></div>';
    }
    return legendHTML() + '<div class="ce-grid">' + dows + cells + '</div>';
  }

  /* ---------------- Panel del día -------------------------------------- */
  function openDay(dISO) {
    selected = dISO;
    var bd = document.getElementById('ce-backdrop'), pn = document.getElementById('ce-panel');
    var evs = eventsOn(dISO);
    var body;
    if (!evs.length) {
      body = '<div class="ce-empty">' + T('Todavía no tienes nada planificado para este día.', 'Encara no tens res planificat per a aquest dia.') +
        '<div style="margin-top:14px"><button class="ce-btn" data-cal="add" data-day="' + dISO + '">+ ' + T('Añadir evento', 'Afegir esdeveniment') + '</button></div></div>';
    } else {
      body = evs.map(function (e) { return eventCard(e); }).join('') +
        '<button class="ce-btn ce-btn--ghost" data-cal="add" data-day="' + dISO + '" style="align-self:flex-start">+ ' + T('Añadir evento', 'Afegir esdeveniment') + '</button>';
    }
    pn.innerHTML =
      '<div class="ce-panel-head"><span class="ce-panel-title">' + fmtLong(dISO) + '</span><button class="ce-x" data-cal="close">×</button></div>' +
      '<div class="ce-panel-body">' + body + '</div>';
    bd.classList.add('is-on'); pn.classList.add('is-on');
    if (view === 'mes') renderInto(); // refresca selección
  }
  function eventCard(e) {
    var col = TYPES[e.type] ? TYPES[e.type].color : '#ADE80C';
    var bn = bloqueName(e.bloque);
    return '<div class="ce-card" style="--ec:' + col + '">' +
      '<div class="ce-card-top"><span class="ce-chip">' + typeLabel(e.type) + '</span></div>' +
      '<h4>' + esc(e.title) + '</h4>' +
      '<div class="ce-meta">' + (e.time ? '<span>🕒 ' + esc(e.time) + '</span>' : '') + (bn ? '<span>📚 ' + esc(bn) + '</span>' : '') + '</div>' +
      (e.note ? '<div class="ce-note">' + esc(e.note) + '</div>' : '') +
      '<div class="ce-card-actions">' +
        (e.bloque ? '<a class="ce-mini" href="/app/apuntes.html#' + esc(e.bloque) + '">' + T('Ver temario', 'Veure temari') + ' →</a>' : '') +
        (e.type === 'control' || e.type === 'simulacro' ? '<a class="ce-mini" href="/app/tests.html">' + T('Ir a tests', 'Anar a tests') + ' →</a>' : '') +
        (e.seed ? '' :
          '<button class="ce-mini" data-edit="' + e.id + '">' + T('Editar', 'Editar') + '</button>' +
          '<button class="ce-mini ce-mini--danger" data-del="' + e.id + '">' + T('Eliminar', 'Eliminar') + '</button>') +
      '</div></div>';
  }
  function closePanel() {
    document.getElementById('ce-backdrop').classList.remove('is-on');
    document.getElementById('ce-panel').classList.remove('is-on');
  }

  /* ---------------- Formulario alta/edición ---------------------------- */
  function openForm(dISO, editId) {
    var ev = editId ? read().filter(function (x) { return x.id === editId; })[0] : null;
    var date = ev ? ev.date : (dISO || selected || todayISO());
    var type = ev ? ev.type : 'estudio';
    var opts = (D && D.BLOQUES ? D.BLOQUES : []).map(function (b) { return '<option value="' + b.id + '"' + (ev && ev.bloque === b.id ? ' selected' : '') + '>' + esc(b.nombre) + '</option>'; }).join('');
    var typeBtns = Object.keys(TYPES).map(function (k) {
      var d = TYPES[k];
      return '<button type="button" class="ce-type' + (k === type ? ' is-on' : '') + '" data-type="' + k + '" style="--ec:' + d.color + '"><span class="dot" style="width:10px;height:10px;border-radius:50%;background:' + d.color + '"></span>' + typeLabel(k) + '</button>';
    }).join('');
    var pn = document.getElementById('ce-panel'), bd = document.getElementById('ce-backdrop');
    pn.innerHTML =
      '<div class="ce-panel-head"><span class="ce-panel-title">' + (ev ? T('Editar evento', 'Editar esdeveniment') : T('Nuevo evento', 'Nou esdeveniment')) + '</span><button class="ce-x" data-cal="close">×</button></div>' +
      '<div class="ce-panel-body"><form class="ce-form" id="ce-form">' +
        '<input type="hidden" name="type" value="' + type + '">' +
        '<div class="ce-f"><label>' + T('Tipo', 'Tipus') + '</label><div class="ce-types">' + typeBtns + '</div></div>' +
        '<div class="ce-f"><label>' + T('Título', 'Títol') + '</label><input class="ce-in" name="title" required value="' + (ev ? esc(ev.title) : '') + '" placeholder="' + T('p. ej. Repasar Genética', 'p. ex. Repassar Genètica') + '"></div>' +
        '<div class="ce-row2"><div class="ce-f"><label>' + T('Fecha', 'Data') + '</label><input class="ce-in" type="date" name="date" required value="' + date + '"></div>' +
          '<div class="ce-f"><label>' + T('Hora (opcional)', 'Hora (opcional)') + '</label><input class="ce-in" type="time" name="time" value="' + (ev ? esc(ev.time || '') : '') + '"></div></div>' +
        '<div class="ce-f"><label>' + T('Temario (opcional)', 'Temari (opcional)') + '</label><select class="ce-in" name="bloque"><option value="">—</option>' + opts + '</select></div>' +
        '<div class="ce-f"><label>' + T('Nota (opcional)', 'Nota (opcional)') + '</label><textarea class="ce-in" name="note" rows="2">' + (ev ? esc(ev.note || '') : '') + '</textarea></div>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end">' +
          '<button type="button" class="ce-btn ce-btn--ghost" data-cal="close">' + T('Cancelar', 'Cancel·la') + '</button>' +
          '<button type="submit" class="ce-btn">' + (ev ? T('Guardar', 'Desa') : T('Añadir', 'Afegeix')) + '</button>' +
        '</div>' +
      '</form></div>';
    bd.classList.add('is-on'); pn.classList.add('is-on');
    var form = document.getElementById('ce-form');
    form.querySelectorAll('[data-type]').forEach(function (b) {
      b.addEventListener('click', function () {
        form.querySelectorAll('.ce-type').forEach(function (x) { x.classList.remove('is-on'); });
        b.classList.add('is-on'); form.type.value = b.getAttribute('data-type');
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = { type: form.type.value, title: form.title.value.trim(), date: form.date.value, time: form.time.value, bloque: form.bloque.value, note: form.note.value.trim() };
      if (!data.title || !data.date) return;
      if (editId) updateEvent(editId, data); else addEvent(data);
      selected = data.date;
      // si el nuevo evento cae en otro mes, salta a ese mes
      var dd = parse(data.date); cursor = new Date(dd.getFullYear(), dd.getMonth(), 1);
      renderInto(); openDay(data.date);
    });
  }

  /* ---------------- Vista Cronograma / Gantt --------------------------- */
  function renderCrono() {
    var blocks = (D && D.BLOQUES ? D.BLOQUES : []);
    var N = 10; // setmanes
    var start = startOfWeekMon(today());
    var weeks = [];
    for (var i = 0; i < N; i++) weeks.push(addDays(start, i * 7));
    var evs = allEvents();
    // finestra d'estudi suggerida: repartir els blocs al llarg de les setmanes
    var per = Math.max(1, Math.floor(N / Math.max(1, blocks.length)));
    var head = '<th style="text-align:left;padding-left:12px">' + T('Temario', 'Temari') + '</th>' +
      weeks.map(function (w) { return '<th>' + w.getDate() + '/' + (w.getMonth() + 1) + '</th>'; }).join('');
    var nowWeek = 0;
    var rows = blocks.map(function (b, bi) {
      var winStart = Math.min(N - 1, bi * per), winEnd = Math.min(N - 1, winStart + per - 1);
      var cells = weeks.map(function (w, wi) {
        var wIso0 = iso(w), wIso1 = iso(addDays(w, 6));
        var inWin = (wi >= winStart && wi <= winEnd);
        var isNow = (todayISO() >= wIso0 && todayISO() <= wIso1);
        if (isNow) nowWeek = wi;
        // marca si hi ha esdeveniment d'aquest bloc en aquesta setmana
        var mark = '';
        evs.forEach(function (e) {
          if (e.bloque === b.id && e.date >= wIso0 && e.date <= wIso1) {
            mark = e.type === 'examen' ? '🔵' : e.type === 'simulacro' ? '🟣' : e.type === 'control' ? '🟠' : e.type === 'objetivo' ? '🟡' : '🟢';
          }
        });
        return '<td class="ce-g-cell' + (isNow ? ' is-now' : '') + '">' +
          (inWin ? '<span class="ce-g-bar' + (wi === winStart ? ' is-strong' : '') + '" style="--bc:' + b.color + '"></span>' : '') +
          (mark ? '<span class="ce-g-mark">' + mark + '</span>' : '') + '</td>';
      }).join('');
      return '<tr><td class="ce-g-block" style="--bc:' + b.color + '">' + esc(b.nombre) + '</td>' + cells + '</tr>';
    }).join('');
    return '<div class="ce-gantt-wrap"><table class="ce-gantt"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="ce-crono-legend">' +
        '<span>' + T('Barra = ventana sugerida de estudio del bloque', 'Barra = finestra suggerida d’estudi del bloc') + '</span>' +
        '<span>🔵 ' + T('examen', 'examen') + ' · 🟣 ' + T('simulacro', 'simulacre') + ' · 🟠 ' + T('control', 'control') + ' · 🟡 ' + T('objetivo', 'objectiu') + '</span>' +
      '</div>' +
      '<p style="color:var(--txt-dim);font-size:.85rem;margin-top:10px">' + T('Consejo: añade eventos con un temario asignado y aparecerán aquí como marcadores.', 'Consell: afegeix esdeveniments amb un temari assignat i apareixeran aquí com a marcadors.') + '</p>';
  }

  /* ---------------- Render principal ----------------------------------- */
  function renderInto() {
    var box = root(); if (!box) return;
    box.innerHTML = toolbarHTML() + (view === 'mes' ? renderMonth() : renderCrono());
  }

  /* ---------------- Eventos -------------------------------------------- */
  function wire() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-view],[data-cal],[data-day],[data-leg],[data-edit],[data-del]') : null;
      if (!el) return;
      if (el.hasAttribute('data-view')) { view = el.getAttribute('data-view'); closePanel(); renderInto(); return; }
      if (el.hasAttribute('data-leg')) { var k = el.getAttribute('data-leg'); filterOff[k] = !filterOff[k]; renderInto(); return; }
      if (el.hasAttribute('data-edit')) { openForm(null, el.getAttribute('data-edit')); return; }
      if (el.hasAttribute('data-del')) { removeEvent(el.getAttribute('data-del')); renderInto(); openDay(selected); return; }
      if (el.hasAttribute('data-cal')) {
        var a = el.getAttribute('data-cal');
        if (a === 'prev') { cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1); renderInto(); }
        else if (a === 'next') { cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1); renderInto(); }
        else if (a === 'today') { var n = today(); cursor = new Date(n.getFullYear(), n.getMonth(), 1); selected = todayISO(); renderInto(); openDay(selected); }
        else if (a === 'add') { openForm(el.getAttribute('data-day') || selected); }
        else if (a === 'close') { closePanel(); }
        return;
      }
      if (el.hasAttribute('data-day')) { openDay(el.getAttribute('data-day')); return; }
    });
    document.addEventListener('change', function (e) {
      var s = e.target.closest ? e.target.closest('[data-goto-temari]') : null;
      if (s && s.value) { window.location.href = '/app/apuntes.html#' + s.value; }
    });
    document.addEventListener('bp:langchange', function () { renderInto(); });
    // backdrop cierra
    document.addEventListener('click', function (e) { if (e.target && e.target.id === 'ce-backdrop') closePanel(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
  }

  function init() {
    if (!root()) return;
    // asegura panel + backdrop
    if (!document.getElementById('ce-backdrop')) {
      var bd = document.createElement('div'); bd.id = 'ce-backdrop'; bd.className = 'ce-backdrop'; document.body.appendChild(bd);
      var pn = document.createElement('aside'); pn.id = 'ce-panel'; pn.className = 'ce-panel'; pn.setAttribute('role', 'dialog'); pn.setAttribute('aria-modal', 'true'); document.body.appendChild(pn);
    }
    wire();
    renderInto();
  }

  return { init: init, addEvent: addEvent, allEvents: allEvents };
})();
