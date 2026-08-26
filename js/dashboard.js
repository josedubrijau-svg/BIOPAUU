/* ============================================================================
   BioPAU — lógica del Dashboard VIP
   ============================================================================ */
window.BPDash = (function () {
  var D = window.BIOPAU_DATA;
  var t = function (k, v) { return window.BPI18n ? window.BPI18n.t(k, v) : k; };
  var S = {}; // estado guardado para repintar los textos dinámicos al cambiar idioma

  /* ---------- 1. Saludo dinámico según la hora ----------------------------
     Se elige una frase por franja horaria, fija durante todo el día para que
     no cambie en cada recarga (usa el día del año como semilla).            */
  var SALUDOS_ALL = {
    es: {
      madrugada: {
        titulo: ['¡Buenas noches, {n}!', '{n}, aún en pie…', 'Modo búho, {n}.'],
        sub: ['¿Un último esfuerzo de medianoche?', 'Repasa algo ligero y a dormir: el cerebro consolida durmiendo.', 'Media hora buena vale más que tres de sueño perdido.']
      },
      manana: {
        titulo: ['¡Buenos días, {n}!', '¡Arriba, {n}!', 'Buen día para biología, {n}.'],
        sub: ['¿Listo para el repaso matutino?', 'La cabeza está fresca: ataca lo más difícil ahora.', 'Empieza por un tema y el resto viene solo.']
      },
      tarde: {
        titulo: ['¡Buenas tardes, {n}!', '{n}, a por la tarde.', '¿Cómo va el día, {n}?'],
        sub: ['Buen momento para practicar ejercicios de PAU.', 'Media hora de práctica ahora vale por dos mañana.', 'Elige un bloque y clávalo.']
      },
      noche: {
        titulo: ['¡Buenas noches, {n}!', 'Última ronda, {n}.', '{n}, cierra el día fuerte.'],
        sub: ['¿Repasamos lo de hoy antes de cerrar?', 'Un repaso corto fija lo que has estudiado.', 'Marca lo que has completado y descansa.']
      }
    },
    ca: {
      madrugada: {
        titulo: ['Bona nit, {n}!', '{n}, encara despert…', 'Mode mussol, {n}.'],
        sub: ['Un últim esforç de mitjanit?', 'Repassa alguna cosa lleugera i a dormir: el cervell consolida dormint.', 'Mitja hora bona val més que tres de son perdut.']
      },
      manana: {
        titulo: ['Bon dia, {n}!', 'Amunt, {n}!', 'Bon dia per a la biologia, {n}.'],
        sub: ['A punt per al repàs del matí?', 'Tens el cap fresc: ataca el més difícil ara.', 'Comença per un tema i la resta ve sola.']
      },
      tarde: {
        titulo: ['Bona tarda, {n}!', '{n}, a per la tarda.', 'Com va el dia, {n}?'],
        sub: ['Bon moment per practicar exercicis de PAU.', 'Mitja hora de pràctica ara val per dues demà.', 'Tria un bloc i clava’l.']
      },
      noche: {
        titulo: ['Bona nit, {n}!', 'Última ronda, {n}.', '{n}, tanca el dia fort.'],
        sub: ['Repassem el d’avui abans de tancar?', 'Un repàs curt fixa el que has estudiat.', 'Marca el que has completat i descansa.']
      }
    }
  };
  function saludos() { var l = window.BPI18n ? window.BPI18n.get() : 'es'; return SALUDOS_ALL[l] || SALUDOS_ALL.es; }

  function franja(h) {
    if (h < 6) return 'madrugada';
    if (h < 13) return 'manana';
    if (h < 20) return 'tarde';
    return 'noche';
  }

  /* Función pura: dado un momento y un nombre, devuelve el saludo. */
  function construirSaludo(now, nombre) {
    var f = franja(now.getHours());
    var set = saludos()[f];
    var seed = Math.floor(now.getTime() / 86400000) + now.getHours();
    return {
      franja: f,
      titulo: set.titulo[seed % set.titulo.length].replace('{n}', nombre || 'crack'),
      sub: set.sub[seed % set.sub.length]
    };
  }

  function pintarSaludo(nombre) {
    var s = construirSaludo(new Date(), nombre);
    var h1 = document.getElementById('hello-title');
    var p = document.getElementById('hello-sub');
    if (h1) { h1.textContent = s.titulo; h1.classList.remove('sk'); }
    if (p) { p.textContent = s.sub; p.classList.remove('sk'); }
  }

  /* ---------- 2. Anillo de progreso --------------------------------------- */
  function pintarAnillo(pct) {
    var bar = document.getElementById('ring-bar');
    var lbl = document.getElementById('ring-pct');
    if (!bar) return;
    var r = bar.r.baseVal.value;
    var c = 2 * Math.PI * r;
    bar.style.strokeDasharray = c;
    bar.style.strokeDashoffset = c;
    // pequeño retraso para que se vea la animación
    setTimeout(function () { bar.style.strokeDashoffset = c * (1 - pct / 100); }, 150);
    if (lbl) {
      lbl.classList.remove('sk');
      var n = 0;
      var step = Math.max(1, Math.round(pct / 28));
      var iv = setInterval(function () {
        n += step;
        if (n >= pct) { n = pct; clearInterval(iv); }
        lbl.textContent = n + '%';
      }, 32);
    }
  }

  /* ---------- 3. Cuenta atrás para la PAU --------------------------------- */
  function iniciarCuentaAtras() {
    var target = new Date(D.PAU_TARGET).getTime();
    var els = {
      d: document.getElementById('cd-d'), h: document.getElementById('cd-h'),
      m: document.getElementById('cd-m'), s: document.getElementById('cd-s')
    };
    if (!els.d) return;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        els.d.textContent = '00'; els.h.textContent = '00';
        els.m.textContent = '00'; if (els.s) els.s.textContent = '00';
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor(diff % 86400000 / 3600000);
      var m = Math.floor(diff % 3600000 / 60000);
      var s = Math.floor(diff % 60000 / 1000);
      els.d.textContent = d;
      els.h.textContent = pad(h);
      els.m.textContent = pad(m);
      if (els.s) els.s.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 4. Barras por bloque ---------------------------------------- */
  function pintarBloques(bloques) {
    var box = document.getElementById('blocks');
    if (!box) return;
    box.innerHTML = bloques.map(function (b) {
      return '<div class="block-row">' +
        '<div class="b-head"><span class="b-name">' + b.nombre + '</span>' +
        '<span class="b-val">' + b.done + '/' + b.total + '</span></div>' +
        '<div class="bar"><span data-w="' + b.pct + '" style="background:' + b.color + '"></span></div>' +
        '</div>';
    }).join('');
    setTimeout(function () {
      box.querySelectorAll('.bar span').forEach(function (el) { el.style.width = el.dataset.w + '%'; });
    }, 200);
  }

  /* ---------- 5. Sugerencias ---------------------------------------------- */
  function pintarSugerencias(items) {
    var box = document.getElementById('suggestions');
    if (!box) return;
    if (!items.length) { box.innerHTML = '<p style="color:var(--txt-dim)">' + t('dash.sugg_empty') + '</p>'; return; }
    box.innerHTML = items.map(function (it) {
      return '<a class="sugg-item" href="/app/apuntes.html#' + it.tema.id + '">' +
        '<span class="sugg-dot" style="background:' + it.tema.color + '"></span>' +
        '<span class="sugg-txt"><span class="t">' + it.tema.titulo + '</span>' +
        '<span class="s">' + it.mensaje + '</span></span>' +
        '<span class="sugg-go">' + t('dash.sugg_go') + '</span></a>';
    }).join('');
  }

  /* ---------- 6. Modal de avatar ------------------------------------------ */
  var avatarSel = null;

  function openAvatarModal() {
    var modal = document.getElementById('avatar-modal');
    if (!modal) return;
    var actual = (window.BPData && window.BPData.state.stats && window.BPData.state.stats.avatar_id) || 'cell';
    avatarSel = actual;
    var grid = document.getElementById('avatar-grid');
    grid.innerHTML = D.AVATARES.map(function (a) {
      return '<div class="avatar-opt">' +
        '<div class="avatar avatar--pick' + (a.id === actual ? ' is-sel' : '') + '" data-avatar="' + a.id + '" role="button" tabindex="0">' +
        window.BPShell.avatarSVG(a.id) + '</div><span class="n">' + a.nombre + '</span></div>';
    }).join('');
    modal.classList.add('is-open');

    grid.querySelectorAll('[data-avatar]').forEach(function (el) {
      el.addEventListener('click', function () {
        grid.querySelectorAll('[data-avatar]').forEach(function (o) { o.classList.remove('is-sel'); });
        el.classList.add('is-sel');
        avatarSel = el.getAttribute('data-avatar');
      });
    });
  }

  function closeAvatarModal() {
    var modal = document.getElementById('avatar-modal');
    if (modal) modal.classList.remove('is-open');
  }

  function wireAvatarModal() {
    var modal = document.getElementById('avatar-modal');
    if (!modal) return;
    modal.addEventListener('click', function (e) { if (e.target === modal) closeAvatarModal(); });
    var close = document.getElementById('avatar-close');
    if (close) close.addEventListener('click', closeAvatarModal);
    var cancel = document.getElementById('avatar-cancel');
    if (cancel) cancel.addEventListener('click', closeAvatarModal);
    var save = document.getElementById('avatar-save');
    if (save) save.addEventListener('click', async function () {
      save.disabled = true; save.textContent = t('acc.msg_saving');
      var ok = await window.BPData.setAvatar(avatarSel);
      save.disabled = false; save.textContent = t('modal.save');
      if (ok) {
        var big = document.getElementById('avatar-big');
        if (big) big.innerHTML = window.BPShell.avatarSVG(avatarSel);
        window.BPShell.setUser(null, avatarSel, null);
        closeAvatarModal();
      }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAvatarModal(); });
  }

  /* ---------- Arranque ----------------------------------------------------- */
  async function init() {
    window.BPShell.render({ crumb: 'Dashboard' });
    wireAvatarModal();
    iniciarCuentaAtras();

    // El guard de auth.js ya garantiza sesión + suscripción activa
    var perfil = await window.BP.profile();
    var nombre = (perfil && perfil.username) || 'crack';
    pintarSaludo(nombre);

    await window.BPData.load();
    var st = window.BPData.state;

    if (st.needsSetup) {
      var n = document.getElementById('setup-notice');
      if (n) n.classList.add('is-on');
    }

    var gp = window.BPData.globalProgress();
    var lv = window.BPData.level();

    window.BPShell.setUser(nombre, st.stats.avatar_id, st.stats.streak_days);

    pintarAnillo(gp.pct);
    pintarBloques(window.BPData.blockProgress());

    var setTxt = function (id, txt) { var el = document.getElementById(id); if (el) { el.textContent = txt; el.classList.remove('sk'); } };
    setTxt('stat-streak', st.stats.streak_days);
    setTxt('stat-best', st.stats.longest_streak);
    setTxt('stat-topics', gp.done + '/' + gp.total);

    var big = document.getElementById('avatar-big');
    if (big) big.innerHTML = window.BPShell.avatarSVG(st.stats.avatar_id);

    // Guarda estado y pinta los textos dependientes del idioma
    S.nombre = nombre; S.lv = lv;
    repaintDynamic();

    // Al cambiar de idioma, re-pinta saludo, nivel, metas y sugerencias
    document.addEventListener('bp:langchange', repaintDynamic);
  }

  /* Repinta todos los textos compuestos en JS (no cubiertos por data-i18n) */
  function repaintDynamic() {
    var setTxt = function (id, txt) { var el = document.getElementById(id); if (el) { el.textContent = txt; el.classList.remove('sk'); } };
    if (S.nombre != null) pintarSaludo(S.nombre);
    if (S.lv) {
      setTxt('level-num', t('dash.level_prefix') + ' ' + S.lv.numero);
      setTxt('level-name', S.lv.nombre);
      setTxt('level-next', S.lv.siguiente
        ? t('dash.level_next', { n: S.lv.faltanParaSiguiente, name: S.lv.siguiente })
        : t('dash.level_max'));
    }
    var mt = document.getElementById('mod-apuntes-meta');
    if (mt) mt.textContent = t('dash.meta_temas', { t: D.totalTemas, b: D.BLOQUES.length });
    var me = document.getElementById('mod-examenes-meta');
    if (me) me.textContent = t('dash.meta_conv', { n: D.EXAMENES.length });
    pintarSugerencias(window.BPData.recommendations(3));
  }

  document.addEventListener('DOMContentLoaded', init);

  return { openAvatarModal: openAvatarModal, construirSaludo: construirSaludo };
})();
