/* /precios.html — inicia el checkout de Stripe. El plan se manda por nombre;
   el PRECIO lo decide el servidor (nunca el navegador). */
(function () {
  var sb = window.sb, BP = window.BP, cfg = window.BIOPAU_CONFIG || {};
  if (!sb || !BP) return;

  document.addEventListener('DOMContentLoaded', async function () {
    var msg = document.getElementById('pricing-msg');

    // Rellena etiquetas de precio (solo visual)
    var mLabel = document.getElementById('price-monthly-label');
    var aLabel = document.getElementById('price-annual-label');
    if (mLabel && cfg.PRICE_MONTHLY_LABEL) mLabel.textContent = cfg.PRICE_MONTHLY_LABEL;
    if (aLabel && cfg.PRICE_ANNUAL_LABEL) aLabel.textContent = cfg.PRICE_ANNUAL_LABEL;

    // Oculta el plan anual si no está configurado
    if (cfg.HAS_ANNUAL === false) {
      var annualCard = document.getElementById('plan-annual');
      if (annualCard) annualCard.style.display = 'none';
    }

    // Aviso si venimos redirigidos por intentar entrar a zona premium
    if (BP.qs('upgrade')) BP.msg(msg, 'info', 'Necesitas una suscripción activa para acceder a esa zona.');

    var subscribed = await BP.isSubscribed();
    if (subscribed) BP.msg(msg, 'success', 'Ya tienes una suscripción activa. Puedes gestionarla desde “Mi cuenta”.');

    document.querySelectorAll('[data-plan]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var plan = btn.getAttribute('data-plan');

        var s = await BP.session();
        if (!s) {
          // sin sesión → a registro y de vuelta a precios
          window.location.href = '/registro.html?next=' + encodeURIComponent('/precios.html');
          return;
        }
        if (subscribed) { BP.msg(msg, 'info', 'Ya tienes una suscripción activa.'); return; }

        BP.loading(btn, true, 'Procesando pago…');
        BP.msg(msg, '', '');
        var r = await BP.api('/api/create-checkout-session', { plan: plan });
        if (r.ok && r.data && r.data.url) {
          window.location.href = r.data.url; // → Stripe Checkout
        } else {
          BP.loading(btn, false);
          if (r.data && r.data.already) BP.msg(msg, 'info', 'Ya tienes una suscripción activa.');
          else BP.msg(msg, 'error', (r.data && r.data.error) || 'No se pudo iniciar el pago. Inténtalo de nuevo.');
        }
      });
    });
  });
})();
