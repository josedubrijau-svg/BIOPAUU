/* ============================================================================
   BioPAU — Fase A · Legal + Cuenta  (lógica compartida)
   ----------------------------------------------------------------------------
   Se auto-activa según lo que exista en cada página. Sin dependencias duras:
   funciona con o sin BPI18n / window.sb.
     1) Email de soporte (una sola fuente → [data-support-email] / -mailto).
     2) Mostrar / ocultar contraseña en todo input[type=password].
     3) Consentimiento legal: registro (checkboxes) + gate de primer acceso,
        persistente (localStorage + metadatos del usuario) y versionado.
     4) Cambiar contraseña desde la cuenta (reautentica y valida).
   ============================================================================ */
(function () {
  'use strict';

  /* ⚠️ PLACEHOLDER — cámbialo por tu correo de soporte real (un único sitio).
     Si prefieres, puedes usar tu email actual. No es una dirección válida aún. */
  var SUPPORT_EMAIL = (window.BIOPAU_CONFIG && window.BIOPAU_CONFIG.SUPPORT_EMAIL) || 'soporte@biopau.app';
  window.BP_SUPPORT = { email: SUPPORT_EMAIL };

  var STORE = 'biopau_lang', DEF = 'es';
  function lang() { try { var v = localStorage.getItem(STORE); return (v === 'ca' || v === 'es') ? v : DEF; } catch (e) { return DEF; } }
  function T(es, ca) { return lang() === 'ca' ? ca : es; }
  var sb = window.sb || null;

  /* ------------------------------------------------------------------ *
   * 1) EMAIL DE SOPORTE
   * ------------------------------------------------------------------ */
  function fillSupport() {
    var e = window.BP_SUPPORT.email;
    document.querySelectorAll('[data-support-email]').forEach(function (a) {
      if (a.tagName === 'A') { a.href = 'mailto:' + e; if (!a.textContent.trim()) a.textContent = e; }
      else a.textContent = e;
    });
    document.querySelectorAll('[data-support-mailto]').forEach(function (a) {
      var subj = a.getAttribute('data-subject');
      a.href = 'mailto:' + e + (subj ? ('?subject=' + encodeURIComponent(subj)) : '');
    });
  }

  /* ------------------------------------------------------------------ *
   * 2) MOSTRAR / OCULTAR CONTRASEÑA
   * ------------------------------------------------------------------ */
  var EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-6.5 0-10-7-10-7a18.6 18.6 0 0 1 5.1-5.9M9.9 4.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a18.7 18.7 0 0 1-2.2 3.2M1 1l22 22M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

  function enhancePassword(inp) {
    if (!inp || inp.dataset._pw === '1') return;
    inp.dataset._pw = '1';
    var wrap = document.createElement('div');
    wrap.className = 'pw-wrap';
    inp.parentNode.insertBefore(wrap, inp);
    wrap.appendChild(inp);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'pw-toggle';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', T('Mostrar contraseña', 'Mostra la contrasenya'));
    b.setAttribute('title', T('Mostrar contraseña', 'Mostra la contrasenya'));
    b.innerHTML = EYE;
    wrap.appendChild(b);
    b.addEventListener('click', function () {
      var show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      b.setAttribute('aria-pressed', show ? 'true' : 'false');
      var lbl = show ? T('Ocultar contraseña', 'Amaga la contrasenya') : T('Mostrar contraseña', 'Mostra la contrasenya');
      b.setAttribute('aria-label', lbl); b.setAttribute('title', lbl);
      b.innerHTML = show ? EYE_OFF : EYE;
      try { inp.focus(); } catch (e) {}
    });
  }
  function enhanceAllPasswords(root) {
    (root || document).querySelectorAll('input[type=password]').forEach(enhancePassword);
  }

  /* ------------------------------------------------------------------ *
   * 3) CONSENTIMIENTO LEGAL  (window.BPConsent)
   * ------------------------------------------------------------------ */
  var CKEY = 'biopau_consent';
  var CONSENT_VERSION = '2026-08';   // súbelo si cambian sustancialmente las condiciones

  function readConsent() {
    try { return JSON.parse(localStorage.getItem(CKEY) || 'null'); } catch (e) { return null; }
  }
  function hasConsent() {
    var c = readConsent();
    return !!(c && c.privacyAccepted && c.termsAccepted && c.version === CONSENT_VERSION);
  }
  function recordConsent() {
    var c = { privacyAccepted: true, termsAccepted: true, acceptedAt: new Date().toISOString(), version: CONSENT_VERSION };
    try { localStorage.setItem(CKEY, JSON.stringify(c)); } catch (e) {}
    // Persistencia best-effort en los metadatos del usuario (sin migraciones de BD)
    try { if (sb && sb.auth && sb.auth.updateUser) sb.auth.updateUser({ data: { consent: c } }); } catch (e) {}
    return c;
  }
  window.BPConsent = { has: hasConsent, record: recordConsent, read: readConsent, VERSION: CONSENT_VERSION };

  // 3a) Checkboxes del formulario de registro
  function wireRegisterConsent() {
    var form = document.getElementById('form-registro');
    if (!form) return;
    var cp = document.getElementById('accept-privacy');
    var ct = document.getElementById('accept-terms');
    if (!cp || !ct) return;
    var btn = form.querySelector('[type="submit"]');
    function refresh() { if (btn) btn.disabled = !(cp.checked && ct.checked); }
    cp.addEventListener('change', refresh);
    ct.addEventListener('change', refresh);
    refresh();
    // Registrar el consentimiento en cuanto se envía con ambas marcadas (captura,
    // antes de que auth.js procese el alta). Si el alta falla, no hay perjuicio.
    form.addEventListener('submit', function () { if (cp.checked && ct.checked) recordConsent(); }, true);
  }

  // 3b) Gate de primer acceso en páginas protegidas
  function buildGate() {
    var ov = document.createElement('div');
    ov.id = 'bp-consent';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-labelledby', 'bp-consent-h');
    ov.innerHTML =
      '<div class="fa-consent-card">' +
        '<h2 id="bp-consent-h">' + T('Antes de continuar', 'Abans de continuar') + '</h2>' +
        '<p class="fa-consent-lead">' + T(
          'Para usar bioPau necesitamos que aceptes nuestras condiciones de uso y política de privacidad.',
          'Per fer servir bioPau necessitem que acceptis les condicions d’ús i la política de privacitat.') + '</p>' +
        '<div class="fa-doclinks">' +
          '<a class="fa-doclink" href="/privacidad.html" target="_blank" rel="noopener">📄 ' + T('Política de privacidad', 'Política de privacitat') + '</a>' +
          '<a class="fa-doclink" href="/condiciones.html" target="_blank" rel="noopener">📄 ' + T('Condiciones de uso', 'Condicions d’ús') + '</a>' +
        '</div>' +
        '<label class="fa-check"><input type="checkbox" id="gate-privacy"><span>' +
          T('He leído y acepto la ', 'He llegit i accepto la ') +
          '<a href="/privacidad.html" target="_blank" rel="noopener">' + T('Política de Privacidad', 'Política de Privacitat') + '</a>.</span></label>' +
        '<label class="fa-check"><input type="checkbox" id="gate-terms"><span>' +
          T('Acepto las ', 'Accepto les ') +
          '<a href="/condiciones.html" target="_blank" rel="noopener">' + T('Condiciones de Uso', 'Condicions d’Ús') + '</a> ' +
          T('de bioPau.', 'de bioPau.') + '</span></label>' +
        '<div class="fa-consent-actions">' +
          '<button type="button" class="fa-btn" id="gate-continue" disabled>' + T('Continuar', 'Continuar') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    var cp = ov.querySelector('#gate-privacy'), ct = ov.querySelector('#gate-terms'), go = ov.querySelector('#gate-continue');
    function refresh() { go.disabled = !(cp.checked && ct.checked); }
    cp.addEventListener('change', refresh);
    ct.addEventListener('change', refresh);
    go.addEventListener('click', function () {
      recordConsent();
      ov.parentNode && ov.parentNode.removeChild(ov);
      document.documentElement.style.overflow = '';
    });
    // Bloquea el scroll de fondo mientras el gate está activo
    document.documentElement.style.overflow = 'hidden';
    try { cp.focus(); } catch (e) {}
    return ov;
  }

  function maybeGate() {
    var b = document.body;
    if (!(b.hasAttribute('data-requires-plan') || b.hasAttribute('data-requires-auth'))) return;
    if (hasConsent()) return;
    if (document.getElementById('bp-consent')) return;
    // Solo si hay sesión (usuario autenticado). Si no, auth.js ya redirige al login.
    if (sb && sb.auth && sb.auth.getSession) {
      sb.auth.getSession().then(function (r) {
        if (r && r.data && r.data.session && !hasConsent() && !document.getElementById('bp-consent')) buildGate();
      }).catch(function () {});
    }
  }

  /* ------------------------------------------------------------------ *
   * 4) CAMBIAR CONTRASEÑA  (#form-change-password en la cuenta)
   * ------------------------------------------------------------------ */
  function msg(el, type, text) {
    if (!el) return;
    el.textContent = text || '';
    el.className = 'msg' + (type ? ' msg--' + type : '');
    el.style.display = text ? 'block' : 'none';
  }
  function wireChangePassword() {
    var form = document.getElementById('form-change-password');
    if (!form || !sb) return;
    var box = document.getElementById('cpw-msg');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var cur = form.current.value, nw = form.newpw.value, cf = form.confirm.value;
      var btn = form.querySelector('[type="submit"]');
      if (nw.length < 8 || !/[a-z]/i.test(nw) || !/[0-9]/.test(nw))
        return msg(box, 'error', T('La nueva contraseña necesita al menos 8 caracteres, con una letra y un número.', 'La nova contrasenya necessita almenys 8 caràcters, amb una lletra i un número.'));
      if (nw !== cf)
        return msg(box, 'error', T('Las contraseñas nuevas no coinciden.', 'Les contrasenyes noves no coincideixen.'));
      if (nw === cur)
        return msg(box, 'error', T('La nueva contraseña debe ser distinta de la actual.', 'La nova contrasenya ha de ser diferent de l’actual.'));

      var setL = (window.BP && window.BP.loading) ? window.BP.loading : function () {};
      setL(btn, true, T('Guardando…', 'Desant…'));
      msg(box, '', '');
      try {
        var ur = await sb.auth.getUser();
        var email = ur && ur.data && ur.data.user && ur.data.user.email;
        if (!email) { setL(btn, false); return msg(box, 'error', T('Tu sesión ha caducado. Vuelve a iniciar sesión.', 'La teva sessió ha caducat. Torna a iniciar sessió.')); }
        // Reautenticar con la contraseña actual (verifica que es correcta)
        var re = await sb.auth.signInWithPassword({ email: email, password: cur });
        if (re.error) { setL(btn, false); return msg(box, 'error', T('La contraseña actual no es correcta.', 'La contrasenya actual no és correcta.')); }
        var up = await sb.auth.updateUser({ password: nw });
        setL(btn, false);
        if (up.error) return msg(box, 'error', T('No hemos podido actualizar la contraseña. Inténtalo de nuevo.', 'No hem pogut actualitzar la contrasenya. Torna-ho a provar.'));
        form.reset();
        msg(box, 'success', T('Contraseña actualizada ✓', 'Contrasenya actualitzada ✓'));
      } catch (err) {
        setL(btn, false);
        msg(box, 'error', T('Algo ha ido mal. Comprueba tu conexión e inténtalo de nuevo.', 'Alguna cosa ha anat malament. Comprova la connexió i torna-ho a provar.'));
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Arranque
   * ------------------------------------------------------------------ */
  function init() {
    fillSupport();
    enhanceAllPasswords();
    wireRegisterConsent();
    wireChangePassword();
    // El gate espera un poco a que auth.js resuelva la sesión.
    setTimeout(maybeGate, 350);
    document.addEventListener('bp:langchange', fillSupport);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
