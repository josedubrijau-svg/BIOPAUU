/* Crea el cliente de Supabase (usa la librería cargada por CDN como window.supabase). */
(function () {
  if (!window.supabase || !window.supabase.createClient) {
    console.error('BioPAU: la librería de Supabase no se cargó. Revisa la etiqueta <script> del CDN.');
    return;
  }
  var cfg = window.BIOPAU_CONFIG || {};
  window.sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,        // guarda la sesión (JWT real y firmado) entre recargas
      autoRefreshToken: true,      // renueva el token automáticamente
      detectSessionInUrl: true     // necesario para el enlace de recuperación de contraseña
    }
  });
})();
