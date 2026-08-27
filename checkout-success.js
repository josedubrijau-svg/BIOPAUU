/* /checkout-success.html — tras volver de Stripe.
   El acceso NO se concede aquí: lo concede el webhook en el servidor.
   Esta página solo espera a que el estado se refleje y lo confirma. */
(function () {
  var sb = window.sb, BP = window.BP;
  if (!sb || !BP) return;
  var t = function (k) { return window.BPI18n ? window.BPI18n.t(k) : k; };

  document.addEventListener('DOMContentLoaded', async function () {
    var statusEl = document.getElementById('cs-status');
    var actionsEl = document.getElementById('cs-actions');
    var spinner = document.getElementById('cs-spinner');

    var s = await BP.session();
    if (!s) { if (statusEl) { statusEl.setAttribute('data-i18n', 'cs.msg_login'); statusEl.textContent = t('cs.msg_login'); } return; }

    // Reintentar unos segundos: el webhook puede tardar un par de segundos
    var tries = 0, max = 8;
    async function check() {
      tries++;
      var ok = await BP.isSubscribed();
      if (ok) {
        if (spinner) spinner.style.display = 'none';
        if (statusEl) { statusEl.setAttribute('data-i18n', 'cs.msg_done'); statusEl.textContent = t('cs.msg_done'); }
        if (actionsEl) actionsEl.style.display = '';
        return;
      }
      if (tries >= max) {
        if (spinner) spinner.style.display = 'none';
        if (statusEl) { statusEl.setAttribute('data-i18n', 'cs.msg_pending'); statusEl.textContent = t('cs.msg_pending'); }
        if (actionsEl) actionsEl.style.display = '';
        return;
      }
      setTimeout(check, 1500);
    }
    check();
  });
})();
