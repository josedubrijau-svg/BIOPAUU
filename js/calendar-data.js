/* ============================================================================
   BioPAU — capa de datos del Calendario/Tracker.
   ----------------------------------------------------------------------------
   FORMA DE LOS DATOS (el equivalente a los "tipos"):

   StudyDay      { day:'2026-08-18', minutes:int, note:string, tasks:Task[] }
   Task          { id:string, text:string, done:boolean }
   DayTopic      { id:int, day:'YYYY-MM-DD', topic_id:string,
                   estado:'en_progreso'|'repasando'|'completado', minutos:int }
   ControlDate   { id:int, day:'YYYY-MM-DD', titulo:string,
                   tipo:'examen'|'entrega'|'hito', color:string, bloques:string[] }

   Todas las funciones devuelven datos ya normalizados y nunca lanzan:
   si las tablas no existen todavía, marcan needsSetup y devuelven vacío.
   ============================================================================ */
window.BPCal = (function () {
  var sb = window.sb;
  var needsSetup = false;

  var cache = { days: {}, topics: {}, controls: [] };   // days/topics indexados por fecha

  function isMissingTable(err) {
    if (!err) return false;
    var m = (err.message || '') + ' ' + (err.code || '');
    return /does not exist|schema cache|42P01|PGRST205|PGRST204|PGRST202/i.test(m);
  }

  /* ---------- Utilidades de fecha (siempre en horario local) -------------- */
  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function parseISO(s) {
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function hoyISO() { return iso(new Date()); }
  function diasEntre(isoA, isoB) {
    return Math.round((parseISO(isoB) - parseISO(isoA)) / 86400000);
  }

  /* ---------- Carga de un rango (mes visible) ----------------------------- */
  async function loadRange(desdeISO, hastaISO) {
    if (!sb) return cache;

    var d = await sb.from('study_days').select('day,minutes,note,tasks')
      .gte('day', desdeISO).lte('day', hastaISO);
    if (d.error) { if (isMissingTable(d.error)) needsSetup = true; }
    else {
      cache.days = {};
      (d.data || []).forEach(function (r) {
        cache.days[r.day] = { day: r.day, minutes: r.minutes || 0, note: r.note || '', tasks: r.tasks || [] };
      });
    }

    if (!needsSetup) {
      var t = await sb.from('day_topics').select('id,day,topic_id,estado,minutos')
        .gte('day', desdeISO).lte('day', hastaISO);
      if (t.error) { if (isMissingTable(t.error)) needsSetup = true; }
      else {
        cache.topics = {};
        (t.data || []).forEach(function (r) {
          (cache.topics[r.day] = cache.topics[r.day] || []).push(r);
        });
      }
    }
    return cache;
  }

  /* Fechas control: se cargan TODAS (son pocas y el motor necesita las futuras) */
  async function loadControls() {
    if (!sb || needsSetup) return [];
    var r = await sb.from('control_dates').select('id,day,titulo,tipo,color,bloques').order('day');
    if (r.error) { if (isMissingTable(r.error)) needsSetup = true; return []; }
    cache.controls = r.data || [];
    return cache.controls;
  }

  /* ---------- Lecturas sincrónicas sobre la caché -------------------------- */
  function getDay(dayISO) {
    return cache.days[dayISO] || { day: dayISO, minutes: 0, note: '', tasks: [] };
  }
  function getTopics(dayISO) { return cache.topics[dayISO] || []; }
  function getControls(dayISO) {
    return cache.controls.filter(function (c) { return c.day === dayISO; });
  }
  function allControls() { return cache.controls.slice(); }

  /* Próxima fecha control a partir de hoy (o null si no hay ninguna) */
  function proximaControl(desde) {
    var ref = desde || hoyISO();
    var futuras = cache.controls.filter(function (c) { return c.day >= ref; });
    futuras.sort(function (a, b) { return a.day < b.day ? -1 : 1; });
    return futuras[0] || null;
  }

  /* ---------- Escrituras --------------------------------------------------- */
  async function saveDay(dayISO, patch) {
    if (!sb || needsSetup) return false;
    var u = await window.BP.user();
    if (!u) return false;
    var actual = getDay(dayISO);
    var fila = {
      user_id: u.id, day: dayISO,
      minutes: patch.minutes !== undefined ? patch.minutes : actual.minutes,
      note: patch.note !== undefined ? patch.note : actual.note,
      tasks: patch.tasks !== undefined ? patch.tasks : actual.tasks
    };
    var r = await sb.from('study_days').upsert(fila, { onConflict: 'user_id,day' });
    if (r.error) { console.warn('[BPCal] saveDay:', r.error.message); return false; }
    cache.days[dayISO] = { day: dayISO, minutes: fila.minutes, note: fila.note, tasks: fila.tasks };
    return true;
  }

  async function deleteDay(dayISO) {
    if (!sb || needsSetup) return false;
    var u = await window.BP.user();
    if (!u) return false;
    var r = await sb.from('study_days').delete().eq('user_id', u.id).eq('day', dayISO);
    if (r.error) return false;
    delete cache.days[dayISO];
    return true;
  }

  async function addTopic(dayISO, topicId, estado) {
    if (!sb || needsSetup) return null;
    var u = await window.BP.user();
    if (!u) return null;
    var r = await sb.from('day_topics')
      .upsert({ user_id: u.id, day: dayISO, topic_id: topicId, estado: estado || 'en_progreso' },
              { onConflict: 'user_id,day,topic_id' })
      .select().single();
    if (r.error) { console.warn('[BPCal] addTopic:', r.error.message); return null; }
    var lista = cache.topics[dayISO] = cache.topics[dayISO] || [];
    var i = lista.findIndex(function (x) { return x.topic_id === topicId; });
    if (i >= 0) lista[i] = r.data; else lista.push(r.data);
    return r.data;
  }

  async function setTopicEstado(rowId, dayISO, estado) {
    if (!sb || needsSetup) return false;
    var r = await sb.from('day_topics').update({ estado: estado }).eq('id', rowId);
    if (r.error) return false;
    (cache.topics[dayISO] || []).forEach(function (x) { if (x.id === rowId) x.estado = estado; });
    return true;
  }

  async function removeTopic(rowId, dayISO) {
    if (!sb || needsSetup) return false;
    var r = await sb.from('day_topics').delete().eq('id', rowId);
    if (r.error) return false;
    cache.topics[dayISO] = (cache.topics[dayISO] || []).filter(function (x) { return x.id !== rowId; });
    return true;
  }

  async function addControl(dayISO, titulo, tipo, bloques) {
    if (!sb || needsSetup) return null;
    var u = await window.BP.user();
    if (!u) return null;
    var r = await sb.from('control_dates')
      .insert({ user_id: u.id, day: dayISO, titulo: titulo, tipo: tipo || 'examen', bloques: bloques || [] })
      .select().single();
    if (r.error) { console.warn('[BPCal] addControl:', r.error.message); return null; }
    cache.controls.push(r.data);
    return r.data;
  }

  async function removeControl(id) {
    if (!sb || needsSetup) return false;
    var r = await sb.from('control_dates').delete().eq('id', id);
    if (r.error) return false;
    cache.controls = cache.controls.filter(function (c) { return c.id !== id; });
    return true;
  }

  return {
    needsSetup: function () { return needsSetup; },
    iso: iso, parseISO: parseISO, hoyISO: hoyISO, diasEntre: diasEntre,
    loadRange: loadRange, loadControls: loadControls,
    getDay: getDay, getTopics: getTopics, getControls: getControls,
    allControls: allControls, proximaControl: proximaControl,
    saveDay: saveDay, deleteDay: deleteDay,
    addTopic: addTopic, setTopicEstado: setTopicEstado, removeTopic: removeTopic,
    addControl: addControl, removeControl: removeControl
  };
})();
