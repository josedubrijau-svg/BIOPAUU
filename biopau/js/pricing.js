/* /precios.html — inicia el checkout de Stripe. El plan se manda por nombre;
   el PRECIO lo decide el servidor (nunca el navegador). */
(function () {
  var sb = window.sb, BP = window.BP, cfg = window.BIOPAU_CONFIG || {};
  if (!sb || !BP) return;
  var t = function (k) { return window.BPI18n ? window.BPI18n.t(k) : k; };
  var lang = function () { return window.BPI18n ? window.BPI18n.get() : 'es'; };
  /* localiza el sufijo del precio (/año → /any) sin tocar la cifra */
  function locPrice(s) { return (s && lang() === 'ca') ? s.replace('/año', '/any') : s; }

  document.addEventListener('DOMContentLoaded', async function () {
    var msg = document.getElementById('pricing-msg');

    // Rellena etiquetas de precio (solo visual)
    var mLabel = document.getElementById('price-monthly-label');
    var aLabel = document.getElementById('price-annual-label');
    function paintPrices() {
      if (mLabel && cfg.PRICE_MONTHLY_LABEL) mLabel.textContent = locPrice(cfg.PRICE_MONTHLY_LABEL);
      if (aLabel && cfg.PRICE_ANNUAL_LABEL) aLabel.textContent = locPrice(cfg.PRICE_ANNUAL_LABEL);
    }
    paintPrices();
    document.addEventListener('bp:langchange', paintPrices);

    // Oculta el plan anual si no está configurado
    if (cfg.HAS_ANNUAL === false) {
      var annualCard = document.getElementById('plan-annual');
      if (annualCard) annualCard.style.display = 'none';
    }

    // Aviso si venimos redirigidos por intentar entrar a zona premium
    if (BP.qs('upgrade')) BP.msg(msg, 'info', t('prices.msg_upgrade'));

    var subscribed = await BP.isSubscribed();
    if (subscribed) BP.msg(msg, 'success', t('prices.msg_active'));

    document.querySelectorAll('[data-plan]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var plan = btn.getAttribute('data-plan');

        var s = await BP.session();
        if (!s) {
          // sin sesión → a registro y de vuelta a precios
          window.location.href = '/registro.html?next=' + encodeURIComponent('/precios.html');
          return;
        }
        if (subscribed) { BP.msg(msg, 'info', t('prices.msg_already')); return; }

        BP.loading(btn, true, t('prices.msg_processing'));
        BP.msg(msg, '', '');
        var r = await BP.api('/api/create-checkout-session', { plan: plan });
        if (r.ok && r.data && r.data.url) {
          window.location.href = r.data.url; // → Stripe Checkout
        } else {
          BP.loading(btn, false);
          if (r.data && r.data.already) BP.msg(msg, 'info', t('prices.msg_already'));
          else BP.msg(msg, 'error', (r.data && r.data.error) || t('prices.msg_error'));
        }
      });
    });
  });
})();
