/* ============================================================================
   BioPAU — SHELL del área privada (sidebar + topbar + iconos + avatares)
   ----------------------------------------------------------------------------
   Cualquier página nueva del área privada solo tiene que:
     1. incluir <div class="layout"><aside id="sidebar"></aside>
                  <div class="main"><header id="topbar"></header>
                    <div class="content protected"> …tu contenido… </div>
                  </div></div>
     2. poner en <body> data-requires-plan y data-page="ID_DE_LA_SECCION"
     3. cargar este archivo. El shell se dibuja solo.
   ============================================================================ */
window.BPShell = (function () {

  /* ---------- Iconos SVG (trazo, heredan color) --------------------------- */
  var ICONS = {
    dashboard: '<path d="M3 3h7v8H3zM14 3h7v5h-7zM14 11h7v10h-7zM3 14h7v7H3z"/>',
    book:      '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5zM4 17.5h16"/>',
    exam:      '<path d="M8 2h8l4 4v16H4V2zM14 2v5h5M8 12h8M8 16h5"/>',
    calendar:  '<path d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4"/>',
    sparkle:   '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    user:      '<path d="M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>',
    settings:  '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    logout:    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    menu:      '<path d="M3 6h18M3 12h18M3 18h18"/>',
    clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    target:    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    quiz:      '<path d="M9 11l2 2 4-4"/><rect x="3" y="4" width="18" height="16" rx="2"/>',
    daily:     '<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>'
  };

  function icon(name, cls) {
    var d = ICONS[name] || '';
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  /* ---------- Avatares (SVG con motivos de biología, sin imágenes) -------- */
  var AVATAR_SVG = {
    cell: function (c) {
      return '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="' + c + '" opacity=".22"/>' +
        '<circle cx="24" cy="24" r="18" stroke="' + c + '" stroke-width="2.5"/>' +
        '<circle cx="24" cy="23" r="6.5" fill="' + c + '"/><circle cx="15" cy="31" r="2.4" fill="' + c + '" opacity=".8"/>' +
        '<circle cx="33" cy="16" r="2" fill="' + c + '" opacity=".8"/></svg>';
    },
    dna: function (c) {
      return '<svg viewBox="0 0 48 48" fill="none" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round">' +
        '<path d="M17 6c0 9 14 12 14 21S17 42 17 42"/><path d="M31 6c0 9-14 12-14 21s14 12 14 15"/>' +
        '<path d="M19 14h10M19 24h10M19 34h10" stroke-width="2"/></svg>';
    },
    mito: function (c) {
      return '<svg viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="24" rx="18" ry="11" fill="' + c + '" opacity=".2"/>' +
        '<ellipse cx="24" cy="24" rx="18" ry="11" stroke="' + c + '" stroke-width="2.5"/>' +
        '<path d="M12 24c3-5 5 5 8 0s5 5 8 0 5 5 8 0" stroke="' + c + '" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
    },
    leaf: function (c) {
      return '<svg viewBox="0 0 48 48" fill="none"><path d="M38 10C22 10 12 18 12 30c0 4 2 8 2 8s16 2 22-10c3-6 2-18 2-18z" fill="' + c + '" opacity=".22" stroke="' + c + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M14 38C20 28 28 20 36 14" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round"/></svg>';
    },
    microbe: function (c) {
      return '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="13" fill="' + c + '" opacity=".22" stroke="' + c + '" stroke-width="2.5"/>' +
        '<path d="M24 11V5M24 43v-6M11 24H5M43 24h-6M15 15l-4-4M33 33l4 4M33 15l4-4M15 33l-4 4" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round"/>' +
        '<circle cx="21" cy="22" r="2" fill="' + c + '"/><circle cx="28" cy="27" r="2.4" fill="' + c + '"/></svg>';
    },
    flask: function (c) {
      return '<svg viewBox="0 0 48 48" fill="none"><path d="M19 6v13L9 36a4 4 0 0 0 3.5 6h23A4 4 0 0 0 39 36L29 19V6" stroke="' + c + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M16 6h16" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<path d="M13 30h22l4 6a4 4 0 0 1-3.5 6h-23A4 4 0 0 1 9 36z" fill="' + c + '" opacity=".3"/></svg>';
    }
  };

  function avatarSVG(id) {
    var data = window.BIOPAU_DATA;
    var def = null;
    if (data) {
      for (var i = 0; i < data.AVATARES.length; i++) if (data.AVATARES[i].id === id) def = data.AVATARES[i];
    }
    if (!def) def = { id: 'cell', color: '#ADE80C' };
    var fn = AVATAR_SVG[def.id] || AVATAR_SVG.cell;
    return fn(def.color);
  }

  /* ---------- Definición del menú lateral --------------------------------- */
  var NAV = [
    { id: 'dashboard', i18n: 'nav.dashboard',  icon: 'dashboard', href: '/app/' },
    { id: 'daily',     i18n: 'nav.daily',      icon: 'daily',     href: '/app/daily.html' },
    { id: 'apuntes',   i18n: 'nav.apuntes',    icon: 'book',      href: '/app/apuntes.html' },
    { id: 'examenes',  i18n: 'nav.examenes',   icon: 'exam',      href: '/app/examenes.html' },
    { id: 'tests',     i18n: 'nav.tests',      icon: 'quiz',      href: '/app/tests.html' },
    { id: 'calendario',i18n: 'nav.calendario', icon: 'calendar',  href: '/app/calendario.html' },
    { id: 'novedades', i18n: 'nav.novedades',  icon: 'sparkle',   href: '/app/novedades.html' }
  ];
  var NAV_FOOT = [
    { id: 'avatar',  i18n: 'nav.avatar',   icon: 'user',     action: 'avatar' },
    { id: 'ajustes', i18n: 'nav.settings', icon: 'settings', href: '/cuenta.html' },
    { id: 'salir',   i18n: 'nav.logout',   icon: 'logout',   action: 'logout', danger: true }
  ];

  function T(key) { return window.BPI18n ? window.BPI18n.t(key) : key; }

  function navItem(it, activeId) {
    var cls = 'sb-item' + (it.id === activeId ? ' is-active' : '') + (it.danger ? ' sb-item--danger' : '');
    var attrs = it.action ? ' href="#" data-action="' + it.action + '"' : ' href="' + it.href + '"';
    return '<a class="' + cls + '"' + attrs + '>' + icon(it.icon) + '<span data-i18n="' + it.i18n + '">' + T(it.i18n) + '</span></a>';
  }

  /* mapa id-de-página → clave i18n para el breadcrumb */
  function pageKey(page) {
    for (var i = 0; i < NAV.length; i++) if (NAV[i].id === page) return NAV[i].i18n;
    return 'nav.dashboard';
  }

  /* ---------- Render ------------------------------------------------------ */
  function render(opts) {
    opts = opts || {};
    var page = document.body.getAttribute('data-page') || 'dashboard';
    var pk = pageKey(page);

    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.className = 'sidebar';
      sidebar.innerHTML =
        '<a href="/index.html" class="sb-logo"><span class="cell"></span>Bio<b>PAU</b></a>' +
        '<nav class="sb-nav"><div class="sb-title" data-i18n="sb.study">Estudio</div>' +
          NAV.map(function (i) { return navItem(i, page); }).join('') +
        '</nav>' +
        '<div class="sb-foot"><div class="sb-title" data-i18n="sb.account">Cuenta</div>' +
          NAV_FOOT.map(function (i) { return navItem(i, page); }).join('') +
        '</div>';
    }

    var topbar = document.getElementById('topbar');
    if (topbar) {
      topbar.className = 'topbar';
      var crumbs =
        (page !== 'dashboard'
          ? '<a href="/app/" class="tb-crumb-link" data-i18n="nav.dashboard">' + T('nav.dashboard') + '</a><span class="tb-sep">/</span>'
          : '') +
        '<span class="tb-crumb" data-i18n="' + pk + '">' + T(pk) + '</span>';
      topbar.innerHTML =
        '<div class="tb-left">' +
          '<button class="burger" data-action="menu" aria-label="Menú">' + icon('menu') + '</button>' +
          '<nav class="tb-crumbs" aria-label="breadcrumb">' + crumbs + '</nav>' +
        '</div>' +
        '<div class="tb-right">' +
          '<div data-lang-switch></div>' +
          '<div class="tb-pill" id="tb-streak" data-i18n-attr="title:tb.streak_title">' +
            '<span class="fire">🔥</span><span id="tb-streak-n">—</span>' +
          '</div>' +
          '<button class="tb-user" data-action="avatar" data-i18n-attr="title:tb.change_avatar">' +
            '<span class="avatar" id="tb-avatar">' + avatarSVG('cell') + '</span>' +
            '<span class="name" id="tb-name">…</span>' +
          '</button>' +
        '</div>';
    }

    // Fondo para el menú móvil
    if (!document.querySelector('.sb-backdrop')) {
      var bd = document.createElement('div');
      bd.className = 'sb-backdrop';
      document.body.appendChild(bd);
    }
    wireActions();

    // Traducir e insertar el selector de idioma en la topbar
    if (window.BPI18n) { window.BPI18n.mount(); window.BPI18n.apply(document); }
  }

  function toggleMenu(open) {
    var sb = document.getElementById('sidebar');
    var bd = document.querySelector('.sb-backdrop');
    if (!sb) return;
    var willOpen = (typeof open === 'boolean') ? open : !sb.classList.contains('is-open');
    sb.classList.toggle('is-open', willOpen);
    if (bd) bd.classList.toggle('is-on', willOpen);
  }

  function wireActions() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-action]') : null;
      if (!el) {
        if (e.target.classList && e.target.classList.contains('sb-backdrop')) toggleMenu(false);
        return;
      }
      var action = el.getAttribute('data-action');
      if (action === 'menu') { e.preventDefault(); toggleMenu(); }
      if (action === 'logout') { e.preventDefault(); if (window.BP) window.BP.signOut(); }
      if (action === 'avatar') {
        e.preventDefault();
        toggleMenu(false);
        if (window.BPDash && window.BPDash.openAvatarModal) window.BPDash.openAvatarModal();
        else window.location.href = '/app/#avatar';
      }
    });
  }

  /* Rellena nombre y avatar de la topbar (cachea para re-pintar al cambiar idioma) */
  var _last = { name: null, avatarId: null, streak: null };
  function setUser(name, avatarId, streak) {
    if (name != null) _last.name = name;
    if (avatarId != null) _last.avatarId = avatarId;
    if (typeof streak === 'number') _last.streak = streak;

    var n = document.getElementById('tb-name');
    var a = document.getElementById('tb-avatar');
    var s = document.getElementById('tb-streak-n');
    if (n && _last.name) n.textContent = _last.name;
    if (a && _last.avatarId) a.innerHTML = avatarSVG(_last.avatarId);
    if (s && typeof _last.streak === 'number') {
      s.textContent = _last.streak + ' ' + (_last.streak === 1 ? T('tb.day') : T('tb.days'));
    }
  }

  // Al cambiar el idioma, refresca el sufijo de la racha (los textos con data-i18n
  // los repinta BPI18n solo; esto arregla el "X días" que se compone en JS).
  document.addEventListener('bp:langchange', function () { setUser(); });

  return { render: render, icon: icon, avatarSVG: avatarSVG, setUser: setUser, toggleMenu: toggleMenu, NAV: NAV };
})();
