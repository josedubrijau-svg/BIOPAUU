/* ============================================================================
   BioPAU — Capa de datos del PERFIL personal del estudiante.
   window.BPProfile: carga/guarda student_profile en Supabase (RLS) con caché
   en localStorage (respuesta instantánea + funciona offline / sin esquema).
   No rompe nada si la tabla aún no existe: marca needsSetup y usa la caché.
   ----------------------------------------------------------------------------
   Uso:
     await BPProfile.load();            // rellena BPProfile.data
     BPProfile.get('career_goal');      // lee un campo
     await BPProfile.save({ nickname:'Carla', career_goal:'Infermeria' });
     BPProfile.displayName();           // nickname || first_name || username
     BPProfile.goalState(pct);          // etapa del objetivo según progreso
   Evento: document 'bp:profilechange' al guardar.
   ============================================================================ */
window.BPProfile = (function () {
  var sb = window.sb;
  var CACHE_KEY = 'biopau_profile';

  var DEFAULTS = {
    first_name: '', last_name: '', nickname: '', photo_url: '', phone: '',
    birthdate: '', city: '', region: '', school: '', course: '', modality: '',
    language: '', timezone: '',
    career_goal: '', university_goal: '', university_2: '', city_goal: '',
    career_reason: '', career_dream: '', target_grade: null, cutoff_grade: null,
    main_motivation: '',
    assistant_tone: 'motivador', accent_color: 'lime', theme: 'dark',
    avatar_style: '', avatar_id: 'cell', personal_quote: '', motivation_text: '',
    exam_date: '', academic: {},
    onboarding_completed: false, prefs: {}
  };

  var state = { data: null, needsSetup: false, loaded: false };

  function readCache() {
    try { var v = localStorage.getItem(CACHE_KEY); return v ? JSON.parse(v) : null; }
    catch (e) { return null; }
  }
  function writeCache(d) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch (e) {}
  }
  function merge(base, over) {
    var out = {};
    for (var k in base) out[k] = base[k];
    if (over) for (var j in over) if (over[j] !== undefined && over[j] !== null) out[j] = over[j];
    return out;
  }
  function isMissingTable(err) {
    if (!err) return false;
    var m = (err.message || '') + ' ' + (err.code || '') + ' ' + (err.hint || '');
    return /does not exist|schema cache|42P01|PGRST205|PGRST202|PGRST116/i.test(m);
  }

  /* ---- Carga ------------------------------------------------------------- */
  async function load() {
    // arranca con caché para pintar ya
    state.data = merge(DEFAULTS, readCache());
    if (!sb) { state.loaded = true; return state.data; }

    try {
      var u = await window.BP.user();
      if (!u) { state.loaded = true; return state.data; }
      var r = await sb.from('student_profile').select('*').eq('user_id', u.id).single();
      if (r.error) {
        if (isMissingTable(r.error)) {
          // tabla no existe todavía, o fila aún no creada
          if (/42P01|does not exist|schema cache|PGRST205/i.test((r.error.message || '') + (r.error.code || ''))) {
            state.needsSetup = true;
          }
        }
      } else if (r.data) {
        state.data = merge(DEFAULTS, r.data);
        writeCache(state.data);
      }
    } catch (e) { /* silencioso: se queda con la caché */ }

    state.loaded = true;
    return state.data;
  }

  /* ---- Guardado ---------------------------------------------------------- */
  async function save(patch) {
    if (!state.data) state.data = merge(DEFAULTS, readCache());
    state.data = merge(state.data, patch);
    writeCache(state.data);
    document.dispatchEvent(new CustomEvent('bp:profilechange', { detail: { data: state.data } }));

    if (!sb || state.needsSetup) return { ok: false, local: true };
    try {
      var u = await window.BP.user();
      if (!u) return { ok: false };
      var row = merge(patch || {}, { user_id: u.id });
      var r = await sb.from('student_profile').upsert(row, { onConflict: 'user_id' });
      if (r.error) {
        if (isMissingTable(r.error)) state.needsSetup = true;
        return { ok: false, error: r.error };
      }
      return { ok: true };
    } catch (e) { return { ok: false, error: e }; }
  }

  /* ---- Lectura ----------------------------------------------------------- */
  function get(key) { return state.data ? state.data[key] : DEFAULTS[key]; }
  function all() { return state.data || DEFAULTS; }
  function has(key) { var v = get(key); return v !== null && v !== undefined && v !== '' ; }

  function displayName(fallback) {
    var d = state.data || {};
    return (d.nickname && d.nickname.trim()) ||
           (d.first_name && d.first_name.trim()) ||
           fallback || '';
  }

  /* Etapa del objetivo según el % de progreso global (0-100). */
  var STATES = ['empezando', 'habitos', 'progreso', 'cerca', 'preparado', 'conseguido'];
  function goalState(pct) {
    if (get('onboarding_completed') !== true && (!pct || pct === 0)) return 'empezando';
    if (pct >= 100) return 'conseguido';
    if (pct >= 85) return 'preparado';
    if (pct >= 60) return 'cerca';
    if (pct >= 25) return 'progreso';
    if (pct > 0) return 'habitos';
    return 'empezando';
  }

  return {
    data: null, // se rellena en load()
    get state() { return state; },
    load: load, save: save, get: get, all: all, has: has,
    displayName: displayName, goalState: goalState, STATES: STATES, DEFAULTS: DEFAULTS,
    needsSetup: function () { return state.needsSetup; }
  };
})();
