/* ============================================================================
   BioPAU — BPNav · Sistema global de navegación y carga (multipágina)
   ----------------------------------------------------------------------------
   Objetivo:  click → feedback inmediato → loading → contenido
              (y si falla)  click → loading → mensaje claro → reintentar
              nunca:        click → pantalla congelada / spinner infinito

   Estados conceptuales: idle · loading · success · error
   · Barra superior indeterminada → aparece al instante en cada navegación.
   · Overlay con spinner → solo si tarda >180 ms (sin parpadeos en rápido).
   · Timeout (12 s) → panel "tardando / Reintentar / Volver".
   · Anti doble-click: mientras se navega, se ignoran clicks repetidos.
   · API para botones asíncronos:  BPNav.btn(el, true/false, texto).
   Funciona con o sin BPI18n (diccionario propio leído de localStorage).
   ============================================================================ */
window.BPNav = (function () {
  'use strict';

  var STORE = 'biopau_lang', DEF = 'es';
  var DICT = {
    loading:    { es: 'Cargando…',                                   ca: 'Carregant…' },
    slow_t:     { es: 'La conexión está tardando más de lo habitual.', ca: 'La connexió està trigant més del que és habitual.' },
    slow_s:     { es: 'Comprueba tu conexión y vuelve a intentarlo.',  ca: 'Comprova la connexió i torna-ho a provar.' },
    err_t:      { es: 'No hemos podido cargar esta página.',           ca: 'No hem pogut carregar aquesta pàgina.' },
    retry:      { es: 'Reintentar',                                    ca: 'Torna-ho a provar' },
    back:       { es: 'Volver atrás',                                  ca: 'Torna enrere' },
    saving:     { es: 'Guardando…',                                   ca: 'Desant…' },
    saved:      { es: 'Guardado ✓',                                   ca: 'Desat ✓' },
    processing: { es: 'Procesando…',                                  ca: 'Processant…' }
  };
  function lang() { try { var v = localStorage.getItem(STORE); return (v === 'ca' || v === 'es') ? v : DEF; } catch (e) { return DEF; } }
  function tt(k) { var e = DICT[k]; return e ? (e[lang()] || e.es) : k; }

  var OVERLAY_DELAY = 180;    // ms antes de mostrar el overlay (evita flash)
  var SLOW_TIMEOUT  = 12000;  // ms hasta el panel de "tardando / reintentar"

  var state = 'idle';         // idle | loading | success | error
  var navigating = false;     // guarda de navegación saliente (anti doble-click)
  var tOverlay = null, tSlow = null;
  var retryFn = null;
  var els = null;

  /* ---------- Construcción del DOM (una sola vez) ------------------------- */
  function build() {
    if (els) return els;
    if (!document.body) return null;

    var bar = document.createElement('div');
    bar.id = 'bp-bar';
    bar.setAttribute('aria-hidden', 'true');

    var ov = document.createElement('div');
    ov.id = 'bp-overlay';
    ov.setAttribute('role', 'status');
    ov.setAttribute('aria-live', 'polite');
    ov.innerHTML =
      '<div class="bp-card">' +
        '<div class="bp-loading">' +
          '<div class="bp-spin" aria-hidden="true"></div>' +
          '<div class="bp-card-txt" data-bp="loading">' + tt('loading') + '</div>' +
        '</div>' +
        '<div class="bp-err" role="alert">' +
          '<div class="bp-err-ico" aria-hidden="true">📡</div>' +
          '<div class="bp-card-txt" data-bp="slow_t">' + tt('slow_t') + '</div>' +
          '<div class="bp-card-sub" data-bp="slow_s">' + tt('slow_s') + '</div>' +
          '<div class="bp-actions">' +
            '<button type="button" class="bp-btn" id="bp-retry" data-bp="retry">' + tt('retry') + '</button>' +
            '<button type="button" class="bp-btn bp-btn--ghost" id="bp-back" data-bp="back">' + tt('back') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(bar);
    document.body.appendChild(ov);

    ov.querySelector('#bp-retry').addEventListener('click', doRetry);
    ov.querySelector('#bp-back').addEventListener('click', doBack);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state === 'error') doBack();
    });

    els = { bar: bar, ov: ov };
    return els;
  }

  /* ---------- Traducir textos del overlay (al cambiar idioma) ------------- */
  function retranslate() {
    if (!els) return;
    els.ov.querySelectorAll('[data-bp]').forEach(function (n) { n.textContent = tt(n.getAttribute('data-bp')); });
  }

  /* ---------- Mostrar / ocultar ------------------------------------------ */
  function clearTimers() {
    if (tOverlay) { clearTimeout(tOverlay); tOverlay = null; }
    if (tSlow)    { clearTimeout(tSlow);    tSlow = null; }
  }

  function start(opts) {
    opts = opts || {};
    retryFn = opts.retry || null;
    var e = build();
    if (!e) return;
    state = 'loading';
    document.body.setAttribute('aria-busy', 'true');
    e.ov.classList.remove('is-error');
    e.bar.classList.add('is-on');
    clearTimers();
    // Overlay solo si tarda (evita parpadeo en cargas rápidas)
    tOverlay = setTimeout(function () { if (state === 'loading') e.ov.classList.add('is-on'); }, OVERLAY_DELAY);
    // Timeout de seguridad: nunca un spinner infinito
    tSlow = setTimeout(showSlow, SLOW_TIMEOUT);
  }

  function stop() {
    clearTimers();
    state = 'success';
    navigating = false;
    document.body.removeAttribute('aria-busy');
    if (els) { els.bar.classList.remove('is-on'); els.ov.classList.remove('is-on', 'is-error'); }
  }

  function showSlow() {
    var e = build();
    if (!e) return;
    state = 'error';
    document.body.setAttribute('aria-busy', 'false');
    e.bar.classList.remove('is-on');
    e.ov.classList.add('is-on', 'is-error');
    var r = e.ov.querySelector('#bp-retry');
    if (r) { try { r.focus(); } catch (_) {} }
  }

  function fail(msgKey) {
    // Error explícito (p. ej. una carga de datos que ha fallado)
    var e = build();
    if (!e) return;
    if (msgKey && DICT[msgKey]) {
      var t = e.ov.querySelector('.bp-err [data-bp]');
      if (t) { t.setAttribute('data-bp', msgKey); t.textContent = tt(msgKey); }
    }
    showSlow();
  }

  function doRetry() {
    if (typeof retryFn === 'function') { start({ retry: retryFn }); retryFn(); }
    else { start({ retry: function () { location.reload(); } }); location.reload(); }
  }
  function doBack() {
    stop();
    if (history.length > 1) history.back();
  }

  /* ---------- Navegación programática ------------------------------------ */
  function go(url) {
    if (navigating) return;
    navigating = true;
    start({ retry: function () { location.href = url; } });
    location.href = url;
  }

  /* ---------- Interceptar clicks en enlaces internos --------------------- */
  function isPlainLeftClick(e) {
    return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  }
  function onClick(e) {
    if (e.defaultPrevented || !isPlainLeftClick(e)) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (a.hasAttribute('data-action')) return;               // acciones JS (menú, avatar, logout…)
    if (a.hasAttribute('download')) return;
    if (a.target && a.target !== '' && a.target !== '_self') return;  // _blank, etc.
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;             // ancla en la misma página
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin) return;              // enlace externo → lo maneja el navegador
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return; // solo hash
    if (a.getAttribute('rel') === 'external') return;

    if (navigating) { e.preventDefault(); return; }          // anti doble-click / doble navegación
    navigating = true;
    start({ retry: function () { location.href = url.href; } });
    // No hacemos preventDefault: dejamos navegar al navegador con feedback continuo.
    // Salvaguarda: si otro handler cancela la navegación (preventDefault en burbuja),
    // apagamos el loader para no dejarlo encendido sin motivo.
    setTimeout(function () { if (e.defaultPrevented) { navigating = false; stop(); } }, 0);
  }

  /* ---------- Feedback en botones asíncronos ----------------------------- */
  function btn(el, on, text) {
    if (!el) return;
    // Si existe el helper de auth, reutilízalo para no duplicar comportamiento.
    if (window.BP && typeof window.BP.loading === 'function') { window.BP.loading(el, on, text); return; }
    if (on) {
      if (el.dataset._label == null) el.dataset._label = el.textContent;
      el.disabled = true; el.classList.add('is-loading');
      if (text) el.textContent = text;
    } else {
      el.disabled = false; el.classList.remove('is-loading');
      if (el.dataset._label != null) { el.textContent = el.dataset._label; delete el.dataset._label; }
    }
  }

  /* ---------- Arranque ---------------------------------------------------- */
  var loaded = (document.readyState === 'complete');

  function initIncoming() {
    build();
    document.addEventListener('click', onClick, true);
    // Al cambiar de idioma, retraduce los textos del overlay.
    document.addEventListener('bp:langchange', retranslate);

    if (loaded) { finishIncoming(); }
    else {
      // Mientras el documento se prepara, muestra feedback (retry = recargar).
      start({ retry: function () { location.reload(); } });
      window.addEventListener('load', finishIncoming);
    }
  }
  function finishIncoming() {
    stop();
    var b = document.body;
    if (b && !b.classList.contains('bp-page-in')) {
      b.classList.add('bp-page-in');
      setTimeout(function () { b.classList.remove('bp-page-in'); }, 400);
    }
  }

  // Restaurar estado si se vuelve con el botón "atrás" (bfcache)
  window.addEventListener('pageshow', function (e) { if (e.persisted) { navigating = false; stop(); } });
  window.addEventListener('pagehide', function () { /* la página se descarga; los timers mueren solos */ });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initIncoming);
  else initIncoming();

  return {
    start: start, stop: stop, ready: stop, fail: fail, go: go, btn: btn,
    state: function () { return state; }
  };
})();
