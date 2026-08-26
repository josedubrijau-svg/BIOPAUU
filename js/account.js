/* /cuenta.html — muestra el perfil, permite editar el username y gestionar la suscripción. */
(function () {
  var sb = window.sb, BP = window.BP;
  if (!sb || !BP) return;
  var t = function (k) { return window.BPI18n ? window.BPI18n.t(k) : k; };
  var lang = function () { return window.BPI18n ? window.BPI18n.get() : 'es'; };

  var ACTIVE = ['active', 'trialing'];

  function fmtDate(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString(lang() === 'ca' ? 'ca-ES' : 'es-ES', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch (e) { return iso; }
  }
  function set(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
  /* set + marca la clave i18n para que el selector de idioma lo re-traduzca */
  function setKey(id, key) { var el = document.getElementById(id); if (el) { el.setAttribute('data-i18n', key); el.textContent = t(key); } }

  document.addEventListener('DOMContentLoaded', async function () {
    // guard() de auth.js ya redirige si no hay sesión; aquí cargamos datos.
    var user = await BP.user();
    if (!user) return;
    var profile = await BP.profile();

    var uname = (profile && profile.username) || '';
    set('acc-username', uname || '—');
    set('acc-email', user.email || '—');
    set('acc-created', fmtDate(profile && profile.created_at));

    // Saludo personal
    var helloName = document.getElementById('hello-name');
    if (helloName) {
      if (uname) helloName.textContent = uname;
      else { var h = helloName.parentElement; if (h) { h.removeAttribute('id'); h.textContent = t('acc.hello'); } }
    }

    var subscribed = !!(profile && ACTIVE.indexOf(profile.subscription_status) !== -1);
    var statusEl = document.getElementById('acc-status');
    if (statusEl) {
      var stKey = 'acc.st_' + ((profile && profile.subscription_status) || 'none');
      if (!window.BPI18n || !window.BPI18n.DICT[stKey]) stKey = 'acc.st_unknown';
      statusEl.setAttribute('data-i18n', stKey);
      statusEl.textContent = t(stKey);
      statusEl.className = 'badge ' + (subscribed ? 'badge--on' : 'badge--off');
    }
    if (profile && profile.plan) setKey('acc-plan', profile.plan === 'annual' ? 'acc.plan_annual' : 'acc.plan_monthly');
    else set('acc-plan', '—');
    if (profile && profile.payment_status === 'paid') setKey('acc-payment', 'acc.pay_paid');
    else if (profile && profile.payment_status === 'failed') setKey('acc-payment', 'acc.pay_failed');
    else set('acc-payment', '—');

    // Bloque de acciones de facturación
    var manageBtn = document.getElementById('btn-portal');
    var subscribeLink = document.getElementById('btn-subscribe');
    var premiumLink = document.getElementById('btn-premium');
    if (subscribed) {
      if (subscribeLink) subscribeLink.style.display = 'none';
      if (premiumLink) premiumLink.style.display = '';
      if (manageBtn) manageBtn.style.display = '';
    } else {
      if (subscribeLink) subscribeLink.style.display = '';
      if (premiumLink) premiumLink.style.display = 'none';
      // el portal solo si ya existe cliente de Stripe
      if (manageBtn) manageBtn.style.display = (profile && profile.stripe_customer_id) ? '' : 'none';
    }

    // Editar username
    var form = document.getElementById('form-username');
    var msg = document.getElementById('acc-msg');
    if (form) {
      form.username.value = (profile && profile.username) || '';
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var btn = form.querySelector('[type="submit"]');
        var newName = form.username.value.trim();
        if (newName.length < 3) return BP.msg(msg, 'error', t('acc.msg_name_short'));
        if (newName === (profile && profile.username)) return BP.msg(msg, 'success', t('acc.msg_name_same'));
        BP.loading(btn, true, t('acc.msg_saving'));
        var avail = await sb.rpc('username_available', { name: newName });
        if (avail && avail.data === false) { BP.loading(btn, false); return BP.msg(msg, 'error', t('acc.msg_name_taken')); }
        var res = await sb.from('profiles').update({ username: newName }).eq('id', user.id);
        BP.loading(btn, false);
        if (res.error) return BP.msg(msg, 'error', t('acc.msg_name_error'));
        profile.username = newName;
        set('acc-username', newName);
        var hn = document.getElementById('hello-name'); if (hn) hn.textContent = newName;
        BP.msg(msg, 'success', t('acc.msg_name_ok'));
      });
    }

    // Portal de facturación (Stripe)
    if (manageBtn) {
      manageBtn.addEventListener('click', async function () {
        BP.loading(manageBtn, true, t('acc.msg_opening'));
        var r = await BP.api('/api/create-portal-session', {});
        if (r.ok && r.data && r.data.url) { window.location.href = r.data.url; }
        else { BP.loading(manageBtn, false); BP.msg(msg, 'error', (r.data && r.data.error) || t('acc.msg_portal_error')); }
      });
    }
  });
})();
