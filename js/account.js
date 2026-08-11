/* /cuenta.html — muestra el perfil, permite editar el username y gestionar la suscripción. */
(function () {
  var sb = window.sb, BP = window.BP;
  if (!sb || !BP) return;

  var STATUS_LABEL = {
    none: 'Sin suscripción', active: 'Activa', trialing: 'En prueba',
    past_due: 'Pago pendiente', canceled: 'Cancelada', incomplete: 'Incompleta'
  };
  var ACTIVE = ['active', 'trialing'];

  function fmtDate(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch (e) { return iso; }
  }
  function set(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

  document.addEventListener('DOMContentLoaded', async function () {
    // guard() de auth.js ya redirige si no hay sesión; aquí cargamos datos.
    var user = await BP.user();
    if (!user) return;
    var profile = await BP.profile();

    set('acc-username', (profile && profile.username) || '—');
    set('acc-email', user.email || '—');
    set('acc-created', fmtDate(profile && profile.created_at));

    var subscribed = !!(profile && ACTIVE.indexOf(profile.subscription_status) !== -1);
    var statusEl = document.getElementById('acc-status');
    if (statusEl) {
      statusEl.textContent = STATUS_LABEL[(profile && profile.subscription_status) || 'none'] || 'Desconocido';
      statusEl.className = 'badge ' + (subscribed ? 'badge--on' : 'badge--off');
    }
    set('acc-plan', profile && profile.plan ? (profile.plan === 'annual' ? 'Anual' : 'Mensual') : '—');
    set('acc-payment', profile && profile.payment_status === 'paid' ? 'Al día' : (profile && profile.payment_status === 'failed' ? 'Fallido' : '—'));

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
        if (newName.length < 3) return BP.msg(msg, 'error', 'El usuario debe tener al menos 3 caracteres.');
        if (newName === (profile && profile.username)) return BP.msg(msg, 'success', 'Ese ya es tu nombre de usuario.');
        BP.loading(btn, true, 'Guardando…');
        var avail = await sb.rpc('username_available', { name: newName });
        if (avail && avail.data === false) { BP.loading(btn, false); return BP.msg(msg, 'error', 'Ese nombre ya está cogido.'); }
        var res = await sb.from('profiles').update({ username: newName }).eq('id', user.id);
        BP.loading(btn, false);
        if (res.error) return BP.msg(msg, 'error', 'No se pudo guardar. Prueba otro nombre.');
        profile.username = newName;
        set('acc-username', newName);
        BP.msg(msg, 'success', 'Nombre de usuario actualizado.');
      });
    }

    // Portal de facturación (Stripe)
    if (manageBtn) {
      manageBtn.addEventListener('click', async function () {
        BP.loading(manageBtn, true, 'Abriendo…');
        var r = await BP.api('/api/create-portal-session', {});
        if (r.ok && r.data && r.data.url) { window.location.href = r.data.url; }
        else { BP.loading(manageBtn, false); BP.msg(msg, 'error', (r.data && r.data.error) || 'No se pudo abrir el portal.'); }
      });
    }
  });
})();
