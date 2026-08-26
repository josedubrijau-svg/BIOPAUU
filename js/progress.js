/* ============================================================================
   BioPAU — capa de datos del área privada.
   Lee y escribe el progreso REAL del alumno en Supabase (con RLS).
   Si las tablas todavía no existen, no rompe nada: devuelve valores vacíos y
   marca `needsSetup` para que la interfaz avise de que falta ejecutar el SQL.
   ============================================================================ */
window.BPData = (function () {
  var sb = window.sb;
  var D = window.BIOPAU_DATA;

  var state = {
    stats: null,          // { avatar_id, streak_days, longest_streak, last_study_date }
    progress: {},         // { topic_id: { status, last_reviewed_at, times_reviewed } }
    needsSetup: false
  };

  function isMissingTable(err) {
    if (!err) return false;
    var m = (err.message || '') + ' ' + (err.code || '') + ' ' + (err.hint || '');
    return /does not exist|relation .* does not exist|schema cache|42P01|PGRST205|PGRST202/i.test(m);
  }

  /* --- Carga inicial: racha (servidor) + progreso por tema ---------------- */
  async function load() {
    if (!sb) return state;

    // touch_streak() calcula la racha EN EL SERVIDOR y crea la fila si no existe
    var r = await sb.rpc('touch_streak');
    if (r.error) {
      if (isMissingTable(r.error)) state.needsSetup = true;
      else console.warn('[BPData] touch_streak:', r.error.message);
    } else {
      state.stats = Array.isArray(r.data) ? r.data[0] : r.data;
    }

    if (!state.needsSetup) {
      var p = await sb.from('topic_progress').select('topic_id,status,last_reviewed_at,times_reviewed');
      if (p.error) {
        if (isMissingTable(p.error)) state.needsSetup = true;
      } else {
        (p.data || []).forEach(function (row) { state.progress[row.topic_id] = row; });
      }
    }

    if (!state.stats) {
      state.stats = { avatar_id: 'cell', streak_days: 0, longest_streak: 0, last_study_date: null };
    }
    return state;
  }

  /* --- Cálculos derivados del catálogo + progreso ------------------------- */
  function statusOf(topicId) {
    var row = state.progress[topicId];
    return row ? row.status : 'pending';
  }

  function globalProgress() {
    var temas = D.todosLosTemas();
    if (!temas.length) return { pct: 0, done: 0, total: 0, inProgress: 0 };
    var done = 0, prog = 0;
    temas.forEach(function (t) {
      var s = statusOf(t.id);
      if (s === 'done') done++;
      else if (s === 'in_progress') prog++;
    });
    // los temas "en progreso" cuentan la mitad para que la barra se mueva antes
    var pct = Math.round(((done + prog * 0.5) / temas.length) * 100);
    return { pct: pct, done: done, total: temas.length, inProgress: prog };
  }

  function blockProgress() {
    return D.BLOQUES.map(function (b) {
      // Unidades del bloque = sus apuntes; si no tiene, el propio bloque cuenta como 1
      var unidades = (b.apuntes && b.apuntes.length)
        ? b.apuntes.map(function (a, i) { return b.id + '-' + (i + 1); })
        : [b.id];
      var done = unidades.filter(function (id) { return statusOf(id) === 'done'; }).length;
      return {
        id: b.id, nombre: b.nombre, color: b.color,
        done: done, total: unidades.length,
        pct: unidades.length ? Math.round((done / unidades.length) * 100) : 0
      };
    });
  }

  function level() {
    return D.nivelPara(globalProgress().done);
  }

  /* --- Sugerencias inteligentes -------------------------------------------
     Prioriza: (1) temas empezados y no acabados, (2) temas nunca tocados,
     (3) temas hechos hace más tiempo (repaso espaciado).                     */
  function recommendations(limit) {
    limit = limit || 3;
    var temas = D.todosLosTemas();
    var now = Date.now();

    var enCurso = [], pendientes = [], repasos = [];
    temas.forEach(function (t) {
      var row = state.progress[t.id];
      var s = row ? row.status : 'pending';
      var last = row && row.last_reviewed_at ? new Date(row.last_reviewed_at).getTime() : null;
      var dias = last ? Math.floor((now - last) / 86400000) : null;
      var item = { tema: t, status: s, dias: dias };
      if (s === 'in_progress') enCurso.push(item);
      else if (s === 'pending') pendientes.push(item);
      else if (dias !== null && dias >= 7) repasos.push(item);   // repaso espaciado
    });

    // el repaso más olvidado primero
    repasos.sort(function (a, b) { return b.dias - a.dias; });

    /* Mezcla equilibrada: primero lo empezado a medias, después reservamos un
       hueco para un repaso "frío" (aunque queden temas nuevos) y el resto se
       rellena con temas sin empezar. Así el alumno nunca deja atrás lo antiguo. */
    var out = [];
    function push(arr, n) {
      for (var i = 0; i < arr.length && n > 0 && out.length < limit; i++, n--) out.push(arr[i]);
    }
    push(enCurso, limit);                 // lo inacabado manda
    push(repasos, out.length < limit ? 1 : 0);
    push(pendientes, limit - out.length);
    push(repasos, limit - out.length);    // si aún sobra sitio, más repasos

    var t = function (k, v) { return window.BPI18n ? window.BPI18n.t(k, v) : k; };
    return out.slice(0, limit).map(function (x) {
      var msg;
      if (x.status === 'in_progress') msg = t('sugg.inprogress');
      else if (x.status === 'pending') msg = t('sugg.pending');
      else msg = t('sugg.review', { n: x.dias });
      return { tema: x.tema, status: x.status, mensaje: msg };
    });
  }

  /* --- Escrituras ---------------------------------------------------------- */
  async function setTopicStatus(topicId, status) {
    if (!sb || state.needsSetup) return false;
    var r = await sb.rpc('set_topic_status', { p_topic_id: topicId, p_status: status });
    if (r.error) { console.warn('[BPData] set_topic_status:', r.error.message); return false; }
    var row = Array.isArray(r.data) ? r.data[0] : r.data;
    if (row) state.progress[topicId] = row;
    return true;
  }

  async function setAvatar(avatarId) {
    if (!sb || state.needsSetup) return false;
    var u = await window.BP.user();
    if (!u) return false;
    var r = await sb.from('user_stats')
      .upsert({ user_id: u.id, avatar_id: avatarId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (r.error) { console.warn('[BPData] setAvatar:', r.error.message); return false; }
    state.stats.avatar_id = avatarId;
    return true;
  }

  return {
    state: state,
    load: load,
    statusOf: statusOf,
    globalProgress: globalProgress,
    blockProgress: blockProgress,
    level: level,
    recommendations: recommendations,
    setTopicStatus: setTopicStatus,
    setAvatar: setAvatar
  };
})();
