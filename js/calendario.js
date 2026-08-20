/* ============================================================================
   BioPAU — Calendario/Tracker interactivo (estilo Notion)
   ----------------------------------------------------------------------------
   Tres "componentes" independientes, cada uno con su render y su estado:
     · StudyCalendar        → rejilla mensual/semanal interactiva
     · DayDetailModal       → panel lateral (side peek) al clicar un día
     · RecommendationWidget → tarjeta de "què estudiar avui"
   ============================================================================ */
(function () {
  var MESES = ['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octubre','Novembre','Desembre'];
  var DOW = ['Dl','Dt','Dc','Dj','Dv','Ds','Dg'];
  var ESTADOS = { en_progreso: 'En progrés', repasando: 'Repassant', completado: 'Completat' };
  var ESTADO_NEXT = { en_progreso: 'repasando', repasando: 'completado', completado: 'en_progreso' };

  var cursor = new Date();      // mes visible
  var vista = 'mes';            // 'mes' | 'semana'
  var diaAbierto = null;

  /* =========================================================================
     COMPONENTE 1 · StudyCalendar
     ========================================================================= */
  var StudyCalendar = {
    async refrescar() {
      var rango = this.rangoVisible();
      await window.BPCal.loadRange(rango.desde, rango.hasta);
      await window.BPCal.loadControls();
      this.render();
    },

    rangoVisible() {
      if (vista === 'semana') {
        var base = new Date(cursor);
        var offset = (base.getDay() + 6) % 7;           // lunes = 0
        var lunes = new Date(base); lunes.setDate(base.getDate() - offset);
        var domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
        return { desde: window.BPCal.iso(lunes), hasta: window.BPCal.iso(domingo), inicio: lunes, total: 7 };
      }
      var primero = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      var ultimo = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      return { desde: window.BPCal.iso(primero), hasta: window.BPCal.iso(ultimo), inicio: primero, total: ultimo.getDate() };
    },

    render() {
      var titulo = document.getElementById('cal-title');
      var grid = document.getElementById('cal-grid');
      if (!grid) return;

      var hoy = window.BPCal.hoyISO();
      var html = DOW.map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join('');

      var celdas = [];
      if (vista === 'semana') {
        var r = this.rangoVisible();
        titulo.textContent = 'Setmana del ' + r.inicio.getDate() + ' de ' + MESES[r.inicio.getMonth()].toLowerCase();
        for (var i = 0; i < 7; i++) {
          var f = new Date(r.inicio); f.setDate(r.inicio.getDate() + i);
          celdas.push(f);
        }
      } else {
        titulo.textContent = MESES[cursor.getMonth()] + ' ' + cursor.getFullYear();
        var primero = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        var offset = (primero.getDay() + 6) % 7;
        for (var k = 0; k < offset; k++) celdas.push(null);
        var total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
        for (var d = 1; d <= total; d++) celdas.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
      }

      html += celdas.map(function (fecha) {
        if (!fecha) return '<div class="cal-empty"></div>';
        var key = window.BPCal.iso(fecha);
        var day = window.BPCal.getDay(key);
        var temas = window.BPCal.getTopics(key);
        var controls = window.BPCal.getControls(key);
        var estudiado = day.minutes > 0 || day.note || (day.tasks && day.tasks.length) || temas.length;

        var cls = 'cal-day';
        if (estudiado) cls += ' is-done';
        if (key === hoy) cls += ' is-today';
        if (controls.length) cls += ' is-control';

        var puntos = temas.slice(0, 4).map(function (t) {
          var u = window.BIOPAU_DATA.todasLasUnidades().find(function (x) { return x.id === t.topic_id; });
          return '<i style="background:' + (u ? u.color : '#ADE80C') + '"></i>';
        }).join('');

        var tareasPend = (day.tasks || []).filter(function (t) { return !t.done; }).length;

        return '<button class="' + cls + '" data-day="' + key + '">' +
          '<span class="cal-num">' + fecha.getDate() + '</span>' +
          (controls.length ? '<span class="cal-control" title="' + controls[0].titulo.replace(/"/g,'') + '">' + controls[0].titulo + '</span>' : '') +
          (puntos ? '<span class="cal-dots">' + puntos + '</span>' : '') +
          (tareasPend ? '<span class="cal-tasks">' + tareasPend + ' tasques</span>' : '') +
          '</button>';
      }).join('');

      grid.className = 'cal-grid' + (vista === 'semana' ? ' cal-grid--week' : '');
      grid.innerHTML = html;
    }
  };

  /* =========================================================================
     COMPONENTE 2 · DayDetailModal (side peek)
     ========================================================================= */
  var DayDetailModal = {
    abrir(dayISO) {
      diaAbierto = dayISO;
      this.render();
      var panel = document.getElementById('day-panel');
      panel.classList.add('is-open');
      document.getElementById('panel-backdrop').classList.add('is-on');
    },

    cerrar() {
      document.getElementById('day-panel').classList.remove('is-open');
      document.getElementById('panel-backdrop').classList.remove('is-on');
      diaAbierto = null;
      StudyCalendar.render();
      RecommendationWidget.render();
    },

    render() {
      var key = diaAbierto;
      if (!key) return;
      var fecha = window.BPCal.parseISO(key);
      var day = window.BPCal.getDay(key);
      var temas = window.BPCal.getTopics(key);
      var controls = window.BPCal.getControls(key);

      var tasksHTML = (day.tasks || []).map(function (t, i) {
        return '<li class="task' + (t.done ? ' is-done' : '') + '">' +
          '<button class="task-check" data-task="' + i + '">' + (t.done ? '✓' : '') + '</button>' +
          '<span class="task-text" contenteditable="true" data-task-text="' + i + '">' + escapeHTML(t.text) + '</span>' +
          '<button class="task-del" data-task-del="' + i + '">×</button></li>';
      }).join('');

      var temasHTML = temas.length ? temas.map(function (t) {
        var u = window.BIOPAU_DATA.todasLasUnidades().find(function (x) { return x.id === t.topic_id; });
        var nombre = u ? u.titulo : t.topic_id;
        var color = u ? u.color : '#ADE80C';
        return '<div class="dp-topic" style="--tc:' + color + '">' +
          '<span class="dp-topic-name">' + nombre + '</span>' +
          '<button class="dp-topic-state" data-topic-state="' + t.id + '">' + ESTADOS[t.estado] + '</button>' +
          '<button class="dp-topic-del" data-topic-del="' + t.id + '">×</button></div>';
      }).join('') : '<p class="dp-empty">Encara no has registrat cap tema aquest dia.</p>';

      var opciones = window.BIOPAU_DATA.todasLasUnidades().map(function (u) {
        return '<option value="' + u.id + '">' + u.bloqueNombre + ' · ' + u.titulo + '</option>';
      }).join('');

      var controlsHTML = controls.map(function (c) {
        return '<div class="dp-control"><span>📌 ' + escapeHTML(c.titulo) + '</span>' +
          '<button data-control-del="' + c.id + '">×</button></div>';
      }).join('');

      document.getElementById('day-panel').innerHTML =
        '<div class="dp-head">' +
          '<div><span class="dp-date">' + fecha.getDate() + ' de ' + MESES[fecha.getMonth()].toLowerCase() + '</span>' +
          '<h2>' + capitalizar(diaSemana(fecha)) + '</h2></div>' +
          '<button class="dp-close" id="dp-close">×</button>' +
        '</div>' +

        '<div class="dp-body">' +
          '<section class="dp-section"><h3>Temes estudiats</h3>' + temasHTML +
            '<div class="dp-add-row"><select id="dp-topic-select"><option value="">Afegir un tema…</option>' + opciones + '</select>' +
            '<button class="btn btn--sm" id="dp-topic-add">Afegir</button></div>' +
          '</section>' +

          '<section class="dp-section"><h3>Tasques</h3>' +
            '<ul class="task-list">' + tasksHTML + '</ul>' +
            '<div class="dp-add-row"><input type="text" id="dp-task-input" placeholder="Nova tasca…">' +
            '<button class="btn btn--sm" id="dp-task-add">Afegir</button></div>' +
          '</section>' +

          '<section class="dp-section"><h3>Anotacions</h3>' +
            '<div class="dp-note" id="dp-note" contenteditable="true" data-placeholder="Escriu aquí les teves notes del dia…">' + escapeHTML(day.note || '') + '</div>' +
          '</section>' +

          '<section class="dp-section"><h3>Temps estudiat</h3>' +
            '<div class="dp-minutes"><input type="number" id="dp-minutes" min="0" step="15" value="' + (day.minutes || 0) + '"><span>minuts</span></div>' +
          '</section>' +

          '<section class="dp-section"><h3>Data control</h3>' + controlsHTML +
            '<div class="dp-add-row"><input type="text" id="dp-control-input" placeholder="Ex: Examen de metabolisme">' +
            '<button class="btn btn--sm" id="dp-control-add">Marcar</button></div>' +
          '</section>' +
        '</div>' +
        '<div class="dp-foot"><span class="dp-save-state" id="dp-save-state"></span></div>';

      this.wire();
    },

    wire() {
      var self = this;
      var key = diaAbierto;
      document.getElementById('dp-close').addEventListener('click', function () { self.cerrar(); });

      // --- Tareas ---------------------------------------------------------
      var addTask = async function () {
        var input = document.getElementById('dp-task-input');
        var txt = input.value.trim();
        if (!txt) return;
        var day = window.BPCal.getDay(key);
        var tasks = (day.tasks || []).concat([{ id: 't' + Date.now(), text: txt, done: false }]);
        await guardar({ tasks: tasks });
        input.value = '';
        self.render();
      };
      document.getElementById('dp-task-add').addEventListener('click', addTask);
      document.getElementById('dp-task-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') addTask(); });

      document.querySelectorAll('[data-task]').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var i = +btn.getAttribute('data-task');
          var tasks = window.BPCal.getDay(key).tasks.slice();
          tasks[i].done = !tasks[i].done;
          await guardar({ tasks: tasks });
          self.render();
        });
      });
      document.querySelectorAll('[data-task-del]').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var i = +btn.getAttribute('data-task-del');
          var tasks = window.BPCal.getDay(key).tasks.slice();
          tasks.splice(i, 1);
          await guardar({ tasks: tasks });
          self.render();
        });
      });
      document.querySelectorAll('[data-task-text]').forEach(function (el) {
        el.addEventListener('blur', async function () {
          var i = +el.getAttribute('data-task-text');
          var tasks = window.BPCal.getDay(key).tasks.slice();
          tasks[i].text = el.textContent.trim();
          await guardar({ tasks: tasks });
        });
      });

      // --- Anotaciones y minutos (guardado con retraso) --------------------
      var note = document.getElementById('dp-note');
      var noteTimer = null;
      note.addEventListener('input', function () {
        clearTimeout(noteTimer);
        setSave('Guardant…');
        noteTimer = setTimeout(function () { guardar({ note: note.textContent }); }, 800);
      });
      document.getElementById('dp-minutes').addEventListener('change', function (e) {
        guardar({ minutes: parseInt(e.target.value, 10) || 0 });
      });

      // --- Temas del día ---------------------------------------------------
      document.getElementById('dp-topic-add').addEventListener('click', async function () {
        var sel = document.getElementById('dp-topic-select');
        if (!sel.value) return;
        setSave('Guardant…');
        await window.BPCal.addTopic(key, sel.value, 'en_progreso');
        setSave('Guardat ✓');
        self.render();
      });
      document.querySelectorAll('[data-topic-state]').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var id = +btn.getAttribute('data-topic-state');
          var fila = window.BPCal.getTopics(key).find(function (x) { return x.id === id; });
          if (!fila) return;
          var nuevo = ESTADO_NEXT[fila.estado];
          await window.BPCal.setTopicEstado(id, key, nuevo);
          // Sincroniza con el progreso global del temario
          if (window.BPData.setTopicStatus) {
            var map = { en_progreso: 'in_progress', repasando: 'in_progress', completado: 'done' };
            await window.BPData.setTopicStatus(fila.topic_id, map[nuevo]);
          }
          self.render();
        });
      });
      document.querySelectorAll('[data-topic-del]').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          await window.BPCal.removeTopic(+btn.getAttribute('data-topic-del'), key);
          self.render();
        });
      });

      // --- Fechas control ---------------------------------------------------
      var addControl = async function () {
        var input = document.getElementById('dp-control-input');
        var txt = input.value.trim();
        if (!txt) return;
        setSave('Guardant…');
        await window.BPCal.addControl(key, txt, 'examen', []);
        setSave('Guardat ✓');
        input.value = '';
        self.render();
      };
      document.getElementById('dp-control-add').addEventListener('click', addControl);
      document.getElementById('dp-control-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') addControl(); });
      document.querySelectorAll('[data-control-del]').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          await window.BPCal.removeControl(+btn.getAttribute('data-control-del'));
          self.render();
        });
      });

      async function guardar(patch) {
        setSave('Guardant…');
        var ok = await window.BPCal.saveDay(key, patch);
        setSave(ok ? 'Guardat ✓' : 'No s\'ha pogut guardar');
      }
      function setSave(txt) {
        var el = document.getElementById('dp-save-state');
        if (el) el.textContent = txt;
      }
    }
  };

  /* =========================================================================
     COMPONENTE 3 · RecommendationWidget
     ========================================================================= */
  var RecommendationWidget = {
    render() {
      var box = document.getElementById('reco-widget');
      if (!box) return;
      var r = window.BPRecommend.calcular();

      var tono = { al_dia: 'ok', ajustado: 'warn', atrasado: 'alert', imposible: 'alert',
                   completado: 'ok', sin_fecha: 'info', sin_temario: 'info' }[r.estado] || 'info';

      var objetivoHTML = r.objetivo
        ? '<span class="reco-target">🎯 ' + escapeHTML(r.objetivo.titulo) + ' · en ' + r.objetivo.diasRestantes + ' dies</span>'
        : '';

      var tareasHTML = r.tareas.map(function (t) {
        var temas = t.temas.map(function (u) {
          return '<li style="--tc:' + u.color + '"><b>' + u.bloqueNombre + '</b> · ' + u.titulo + '</li>';
        }).join('');
        return '<div class="reco-day"><span class="reco-day-label">' + t.etiqueta + '</span><ul>' + temas + '</ul></div>';
      }).join('');

      box.className = 'reco reco--' + tono;
      box.innerHTML =
        '<div class="reco-head"><span class="reco-kicker">Suggeriments per a tu</span>' + objetivoHTML + '</div>' +
        '<h2>' + r.titular + '</h2>' +
        '<p class="reco-msg">' + r.mensaje + '</p>' +
        (r.pendientes ? '<div class="reco-stats">' +
          '<span><b>' + r.pendientes + '</b> temes pendents</span>' +
        (r.ritmoNecesario >= 1 ? '<span><b>' + r.ritmoNecesario + '</b> temes/dia necessaris</span>' : '') +
          (r.margen > 0 ? '<span><b>' + r.margen + '</b> dies de marge</span>' : '') +
        '</div>' : '') +
        (tareasHTML ? '<div class="reco-plan">' + tareasHTML + '</div>' : '');
    }
  };

  /* ---------- Utilidades ---------------------------------------------------- */
  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function diaSemana(d) {
    return ['diumenge','dilluns','dimarts','dimecres','dijous','divendres','dissabte'][d.getDay()];
  }
  function capitalizar(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- Arranque ------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', async function () {
    window.BPShell.render({ crumb: 'Calendari' });

    await window.BPData.load();
    var st = window.BPData.state;
    var perfil = await window.BP.profile();
    window.BPShell.setUser(perfil && perfil.username, st.stats.avatar_id, st.stats.streak_days);

    await StudyCalendar.refrescar();
    if (window.BPCal.needsSetup()) {
      var n = document.getElementById('setup-notice');
      if (n) n.classList.add('is-on');
    }
    RecommendationWidget.render();

    // Navegación de mes/semana
    document.getElementById('cal-prev').addEventListener('click', async function () {
      if (vista === 'semana') cursor.setDate(cursor.getDate() - 7);
      else cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
      await StudyCalendar.refrescar();
    });
    document.getElementById('cal-next').addEventListener('click', async function () {
      if (vista === 'semana') cursor.setDate(cursor.getDate() + 7);
      else cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      await StudyCalendar.refrescar();
    });
    document.getElementById('cal-today').addEventListener('click', async function () {
      cursor = new Date();
      await StudyCalendar.refrescar();
    });
    document.querySelectorAll('[data-vista]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        document.querySelectorAll('[data-vista]').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        vista = btn.getAttribute('data-vista');
        await StudyCalendar.refrescar();
      });
    });

    // Abrir el panel al clicar un día
    document.getElementById('cal-grid').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-day]') : null;
      if (b) DayDetailModal.abrir(b.getAttribute('data-day'));
    });
    document.getElementById('panel-backdrop').addEventListener('click', function () { DayDetailModal.cerrar(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && diaAbierto) DayDetailModal.cerrar(); });
  });
})();
