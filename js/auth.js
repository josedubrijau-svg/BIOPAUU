/* ============================================================================
   BioPAU — núcleo de autenticación (frontend).
   - Helpers compartidos en window.BP
   - Navegación consciente de sesión (#nav-auth)
   - Protección de páginas (data-requires-auth / data-requires-plan)
   - Formularios: registro, login, recuperar y actualizar contraseña
   Usa el cliente global window.sb (Supabase). No usa localStorage como "auth":
   la sesión es un JWT real firmado por Supabase y verificado en el servidor.
   ============================================================================ */
(function () {
  var sb = window.sb;
  if (!sb) { console.error('BioPAU: cliente Supabase no disponible'); return; }

  var ACTIVE = ['active', 'trialing'];

  var BP = window.BP = {
    async session() { var r = await sb.auth.getSession(); return r.data.session; },
    async user() { var r = await sb.auth.getUser(); return r.data.user; },
    async token() { var s = await this.session(); return s ? s.access_token : null; },

    // fetch autenticado a nuestras funciones /api
    async api(path, body) {
      var t = await this.token();
      var res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (t || '') },
        body: JSON.stringify(body || {})
      });
      var data = null;
      try { data = await res.json(); } catch (e) {}
      return { ok: res.ok, status: res.status, data: data };
    },

    async profile() {
      var u = await this.user();
      if (!u) return null;
      var r = await sb.from('profiles').select('*').eq('id', u.id).single();
      return r.data || null;
    },

    async isSubscribed() {
      var p = await this.profile();
      return !!(p && ACTIVE.indexOf(p.subscription_status) !== -1);
    },

    msg: function (el, type, text) {
      if (!el) return;
      el.textContent = text || '';
      el.className = 'msg' + (type ? ' msg--' + type : '');
      el.style.display = text ? 'block' : 'none';
    },

    loading: function (btn, on, text) {
      if (!btn) return;
      if (on) {
        btn.dataset._label = btn.dataset._label || btn.textContent;
        btn.disabled = true;
        btn.classList.add('is-loading');
        if (text) btn.textContent = text;
      } else {
        btn.disabled = false;
        btn.classList.remove('is-loading');
        if (btn.dataset._label) btn.textContent = btn.dataset._label;
      }
    },

    qs: function (name) {
      return new URLSearchParams(window.location.search).get(name);
    },

    async signOut() {
      await sb.auth.signOut();
      window.location.href = '/index.html';
    }
  };

  // ---- Navegación consciente de sesión ------------------------------------
  async function paintNav() {
    var box = document.getElementById('nav-auth');
    if (!box) return;
    var s = await BP.session();
    if (s) {
      box.innerHTML =
        '<a href="/precios.html" class="nav-link">Precios</a>' +
        '<a href="/cuenta.html" class="btn"><span class="full">Mi&nbsp;</span>cuenta <span class="arw">→</span></a>';
    } else {
      box.innerHTML =
        '<a href="/login.html" class="nav-link">Entrar</a>' +
        '<a href="/registro.html" class="btn"><span class="full">Empieza&nbsp;</span>gratis <span class="arw">→</span></a>';
    }
  }

  // ---- Protección de páginas ----------------------------------------------
  async function guard() {
    var body = document.body;
    var needsAuth = body.hasAttribute('data-requires-auth');
    var needsPlan = body.hasAttribute('data-requires-plan');
    if (!needsAuth && !needsPlan) return;

    var s = await BP.session();
    if (!s) {
      var next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace('/login.html?next=' + next);
      return;
    }
    if (needsPlan) {
      var ok = await BP.isSubscribed();
      if (!ok) {
        window.location.replace('/precios.html?upgrade=1');
        return;
      }
    }
    // señal para mostrar contenido que estaba oculto hasta validar
    body.classList.add('is-authed');
  }

  // ---- Formularios --------------------------------------------------------
  function passwordProblem(pw) {
    if (pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[a-z]/i.test(pw) || !/[0-9]/.test(pw)) return 'Usa al menos una letra y un número.';
    return null;
  }

  function wireRegister() {
    var form = document.getElementById('form-registro');
    if (!form) return;
    var msg = document.getElementById('form-msg');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var username = form.username.value.trim();
      var email = form.email.value.trim();
      var pw = form.password.value;
      var pw2 = form.password2.value;

      if (!username) return BP.msg(msg, 'error', 'Elige un nombre de usuario.');
      if (username.length < 3) return BP.msg(msg, 'error', 'El usuario debe tener al menos 3 caracteres.');
      if (!/^\S+@\S+\.\S+$/.test(email)) return BP.msg(msg, 'error', 'Introduce un email válido.');
      var pwErr = passwordProblem(pw);
      if (pwErr) return BP.msg(msg, 'error', pwErr);
      if (pw !== pw2) return BP.msg(msg, 'error', 'Las contraseñas no coinciden.');

      BP.loading(btn, true, 'Creando cuenta…');
      BP.msg(msg, '', '');
      try {
        // ¿username libre? (comprobación amable; la BD lo garantiza igualmente)
        var avail = await sb.rpc('username_available', { name: username });
        if (avail && avail.data === false) {
          BP.loading(btn, false);
          return BP.msg(msg, 'error', 'Ese nombre de usuario ya está cogido.');
        }

        var res = await sb.auth.signUp({
          email: email,
          password: pw,
          options: { data: { username: username }, emailRedirectTo: window.location.origin + '/login.html' }
        });

        if (res.error) {
          BP.loading(btn, false);
          var m = /already registered|exists/i.test(res.error.message) ? 'Ese email ya tiene cuenta. Inicia sesión.' : res.error.message;
          return BP.msg(msg, 'error', m);
        }
        // Email ya en uso (Supabase devuelve identities vacío para no filtrar)
        if (res.data && res.data.user && res.data.user.identities && res.data.user.identities.length === 0) {
          BP.loading(btn, false);
          return BP.msg(msg, 'error', 'Ese email ya tiene cuenta. Inicia sesión.');
        }

        if (res.data && res.data.session) {
          // Confirmación de email desactivada → sesión creada, entramos
          BP.msg(msg, 'success', '¡Cuenta creada! Entrando…');
          var next = BP.qs('next') || '/precios.html';
          setTimeout(function () { window.location.href = next; }, 700);
        } else {
          // Confirmación activada → avisar
          BP.loading(btn, false);
          BP.msg(msg, 'success', 'Cuenta creada. Te hemos enviado un email para confirmar tu dirección. Ábrelo y luego inicia sesión.');
          form.reset();
        }
      } catch (err) {
        BP.loading(btn, false);
        BP.msg(msg, 'error', 'No se pudo crear la cuenta. Inténtalo de nuevo.');
      }
    });
  }

  function wireLogin() {
    var form = document.getElementById('form-login');
    if (!form) return;
    var msg = document.getElementById('form-msg');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var email = form.email.value.trim();
      var pw = form.password.value;
      if (!/^\S+@\S+\.\S+$/.test(email)) return BP.msg(msg, 'error', 'Introduce un email válido.');
      if (!pw) return BP.msg(msg, 'error', 'Escribe tu contraseña.');

      BP.loading(btn, true, 'Iniciando sesión…');
      BP.msg(msg, '', '');
      var res = await sb.auth.signInWithPassword({ email: email, password: pw });
      if (res.error) {
        BP.loading(btn, false);
        var m = /Email not confirmed/i.test(res.error.message)
          ? 'Confirma tu email antes de entrar (revisa tu bandeja).'
          : 'El email o la contraseña no son correctos.';
        return BP.msg(msg, 'error', m);
      }
      BP.msg(msg, 'success', 'Sesión iniciada. Redirigiendo…');
      var next = BP.qs('next') || '/cuenta.html';
      setTimeout(function () { window.location.href = next; }, 500);
    });
  }

  function wireRecover() {
    var form = document.getElementById('form-recuperar');
    if (!form) return;
    var msg = document.getElementById('form-msg');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var email = form.email.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) return BP.msg(msg, 'error', 'Introduce un email válido.');
      BP.loading(btn, true, 'Enviando…');
      var res = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/actualizar-password.html'
      });
      BP.loading(btn, false);
      // Respondemos siempre igual para no revelar si el email existe
      BP.msg(msg, 'success', 'Si ese email tiene cuenta, te hemos enviado un enlace para restablecer la contraseña. Revisa tu bandeja (y spam).');
      if (!res.error) form.reset();
    });
  }

  function wireUpdatePassword() {
    var form = document.getElementById('form-actualizar');
    if (!form) return;
    var msg = document.getElementById('form-msg');

    // En esta página, Supabase crea una sesión de recuperación desde el enlace del email.
    sb.auth.onAuthStateChange(function (event) {
      if (event === 'PASSWORD_RECOVERY') {
        BP.msg(msg, 'success', 'Enlace válido. Escribe tu nueva contraseña.');
      }
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var pw = form.password.value;
      var pw2 = form.password2.value;
      var pwErr = passwordProblem(pw);
      if (pwErr) return BP.msg(msg, 'error', pwErr);
      if (pw !== pw2) return BP.msg(msg, 'error', 'Las contraseñas no coinciden.');

      var s = await BP.session();
      if (!s) return BP.msg(msg, 'error', 'El enlace no es válido o ha caducado. Solicita uno nuevo.');

      BP.loading(btn, true, 'Guardando…');
      var res = await sb.auth.updateUser({ password: pw });
      BP.loading(btn, false);
      if (res.error) return BP.msg(msg, 'error', res.error.message);
      BP.msg(msg, 'success', 'Contraseña actualizada. Redirigiendo a tu cuenta…');
      setTimeout(function () { window.location.href = '/cuenta.html'; }, 900);
    });
  }

  // Cualquier elemento [data-logout] cierra sesión
  function wireLogout() {
    document.querySelectorAll('[data-logout]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); BP.signOut(); });
    });
  }

  // Redirige a la cuenta si ya hay sesión y estamos en login/registro
  async function redirectIfLogged() {
    if (!document.body.hasAttribute('data-guest-only')) return;
    var s = await BP.session();
    if (s) window.location.replace(BP.qs('next') || '/cuenta.html');
  }

  document.addEventListener('DOMContentLoaded', function () {
    paintNav();
    guard();
    redirectIfLogged();
    wireRegister();
    wireLogin();
    wireRecover();
    wireUpdatePassword();
    wireLogout();
    sb.auth.onAuthStateChange(function () { paintNav(); });
  });
})();
