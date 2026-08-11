/* /checkout-success.html — tras volver de Stripe.
   El acceso NO se concede aquí: lo concede el webhook en el servidor.
   Esta página solo espera a que el estado se refleje y lo confirma. */
(function () {
  var sb = window.sb, BP = window.BP;
  if (!sb || !BP) return;

  document.addEventListener('DOMContentLoaded', async function () {
    var statusEl = document.getElementById('cs-status');
    var actionsEl = document.getElementById('cs-actions');
    var spinner = document.getElementById('cs-spinner');

    var s = await BP.session();
    if (!s) { if (statusEl) statusEl.textContent = 'Inicia sesión para ver el estado de tu suscripción.'; return; }

    // Reintentar unos segundos: el webhook puede tardar un par de segundos
    var tries = 0, max = 8;
    async function check() {
      tries++;
      var ok = await BP.isSubscribed();
      if (ok) {
        if (spinner) spinner.style.display = 'none';
        if (statusEl) statusEl.textContent = '¡Pago completado correctamente! Ya tienes acceso.';
        if (actionsEl) actionsEl.style.display = '';
        return;
      }
      if (tries >= max) {
        if (spinner) spinner.style.display = 'none';
        if (statusEl) statusEl.textContent = 'Tu pago se está confirmando. Puede tardar un momento; actualiza esta página en unos segundos o revisa “Mi cuenta”.';
        if (actionsEl) actionsEl.style.display = '';
        return;
      }
      setTimeout(check, 1500);
    }
    check();
  });
})();
