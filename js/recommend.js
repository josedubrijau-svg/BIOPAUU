/* ============================================================================
   BioPAU — Motor de recomendación de estudio.
   ----------------------------------------------------------------------------
   Equivalente a un hook useStudyRecommendations(), en vanilla.

   Entrada (implícita): el progreso real del alumno (BPData) + sus fechas
   control (BPCal) + el temario (BIOPAU_DATA).

   Salida: {
     estado: 'sin_temario'|'sin_fecha'|'completado'|'al_dia'|'ajustado'|'atrasado'|'imposible',
     objetivo: { titulo, day, diasRestantes } | null,
     pendientes: n, ritmoNecesario: temas/día, margen: días de sobra,
     titular: string, mensaje: string,
     tareas: [ { fecha, etiqueta, temas:[...] } ]   ← próximos 3 días
   }

   CASOS LÍMITE CUBIERTOS:
   - No hay ningún tema en el temario todavía  → 'sin_temario'
   - El alumno no ha puesto ninguna fecha control → usa la PAU como objetivo
     (y si tampoco hay PAU válida, devuelve 'sin_fecha' con consejo genérico)
   - Ya lo tiene todo completado → 'completado' (felicita, sugiere repaso)
   - La fecha control es hoy o ya pasó → no divide por cero, avisa
   - Van más temas de los que caben en los días restantes → 'imposible',
     y se prioriza lo más importante en vez de mentir con un ritmo irreal
   ============================================================================ */
window.BPRecommend = (function () {
  var MAX_TEMAS_DIA = 3;   // tope realista por día, para no sugerir barbaridades

  function nombreDia(d) {
    return ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'][d.getDay()];
  }

  function etiquetaRelativa(offset, fecha) {
    if (offset === 0) return 'Avui';
    if (offset === 1) return 'Demà';
    return nombreDia(fecha).charAt(0).toUpperCase() + nombreDia(fecha).slice(1);
  }

  /* Temas aún no completados, en orden del temario, priorizando lo empezado */
  function temasPendientes() {
    var D = window.BIOPAU_DATA;
    if (!D || !D.todasLasUnidades) return [];
    var todas = D.todasLasUnidades();
    var enCurso = [], sinEmpezar = [];
    todas.forEach(function (u) {
      var s = window.BPData.statusOf(u.id);
      if (s === 'done') return;
      if (s === 'in_progress') enCurso.push(u); else sinEmpezar.push(u);
    });
    return enCurso.concat(sinEmpezar);   // primero rematar lo empezado
  }

  /* Si la fecha control especifica bloques, solo cuentan esos temas */
  function filtrarPorBloques(temas, bloques) {
    if (!bloques || !bloques.length) return temas;
    return temas.filter(function (t) { return bloques.indexOf(t.bloqueId) !== -1; });
  }

  function calcular() {
    var hoy = window.BPCal.hoyISO();
    var pendientesTodos = temasPendientes();

    // --- Caso: no hay temario cargado --------------------------------------
    if (!pendientesTodos.length && (!window.BIOPAU_DATA || !window.BIOPAU_DATA.todasLasUnidades().length)) {
      return {
        estado: 'sin_temario', objetivo: null, pendientes: 0, ritmoNecesario: 0, margen: 0,
        titular: 'Encara no hi ha temari carregat',
        mensaje: 'Quan hi hagi apunts publicats, aquí veuràs què et toca estudiar cada dia.',
        tareas: []
      };
    }

    // --- Caso: ya está todo completado -------------------------------------
    if (!pendientesTodos.length) {
      return {
        estado: 'completado', objetivo: null, pendientes: 0, ritmoNecesario: 0, margen: 0,
        titular: 'Ho tens tot completat!',
        mensaje: 'Ara toca consolidar: fes exàmens de PAU i repassa els temes més antics.',
        tareas: []
      };
    }

    // --- Elegir objetivo: fecha control más próxima, o la PAU --------------
    var control = window.BPCal.proximaControl(hoy);
    var objetivo = null;
    if (control) {
      objetivo = { titulo: control.titulo, day: control.day, bloques: control.bloques || [] };
    } else if (window.BIOPAU_DATA && window.BIOPAU_DATA.PAU_TARGET) {
      var pau = new Date(window.BIOPAU_DATA.PAU_TARGET);
      if (!isNaN(pau.getTime())) {
        var pauISO = window.BPCal.iso(pau);
        if (pauISO > hoy) objetivo = { titulo: 'Examen de la PAU', day: pauISO, bloques: [] };
      }
    }

    var pendientes = filtrarPorBloques(pendientesTodos, objetivo && objetivo.bloques);
    if (!pendientes.length) pendientes = pendientesTodos;   // por si el filtro deja 0

    // --- Caso: sin ninguna fecha objetivo ----------------------------------
    if (!objetivo) {
      return {
        estado: 'sin_fecha', objetivo: null, pendientes: pendientes.length,
        ritmoNecesario: 0, margen: 0,
        titular: 'Encara no tens cap data control',
        mensaje: 'Afegeix la data del teu proper examen al calendari i et diré exactament quin ritme necessites. Mentrestant, et queden ' + pendientes.length + ' temes.',
        tareas: repartir(pendientes, 1)
      };
    }

    var diasRestantes = window.BPCal.diasEntre(hoy, objetivo.day);
    objetivo.diasRestantes = diasRestantes;

    // --- Caso: la fecha es hoy o ya pasó (evita dividir por cero) ----------
    if (diasRestantes <= 0) {
      return {
        estado: diasRestantes === 0 ? 'ajustado' : 'atrasado',
        objetivo: objetivo, pendientes: pendientes.length, ritmoNecesario: pendientes.length, margen: 0,
        titular: diasRestantes === 0 ? 'És avui: ' + objetivo.titulo : objetivo.titulo + ' ja ha passat',
        mensaje: diasRestantes === 0
          ? 'Avui no toca matèria nova: repassa el que ja tens i descansa abans de la prova.'
          : 'Actualitza les teves dates control al calendari per recalcular el ritme.',
        tareas: []
      };
    }

    var ritmo = pendientes.length / diasRestantes;
    var capacidad = diasRestantes * MAX_TEMAS_DIA;
    var margen = diasRestantes - pendientes.length;

    var estado, titular, mensaje;
    var temasPorDia = Math.max(1, Math.ceil(ritmo));

    if (pendientes.length > capacidad) {
      // --- Caso: no da tiempo ni al máximo ritmo razonable ----------------
      estado = 'imposible';
      titular = 'Queda molt temari per a tan pocs dies';
      mensaje = 'Et queden ' + pendientes.length + ' temes i només ' + diasRestantes + ' dies. Prioritza els blocs que més cauen a la PAU i céntrat a entendre\'ls bé, més que a veure-ho tot.';
      temasPorDia = MAX_TEMAS_DIA;
    } else if (ritmo <= 0.5) {
      estado = 'al_dia';
      titular = 'Vas molt bé de temps';
      mensaje = 'Amb ' + pendientes.length + ' temes en ' + diasRestantes + ' dies, en tens de sobra. Aprofita per repassar i fer exercicis de PAU.';
    } else if (ritmo <= 1) {
      estado = 'al_dia';
      titular = 'Un tema al dia i arribes';
      mensaje = 'Et queden ' + pendientes.length + ' temes per a "' + objetivo.titulo + '" (' + diasRestantes + ' dies). Un tema al dia i ho tens.';
    } else if (ritmo <= 2) {
      estado = 'ajustado';
      titular = 'Vas just, però arribes';
      mensaje = 'Necessites uns ' + temasPorDia + ' temes al dia per arribar a "' + objetivo.titulo + '". No deixis passar dies en blanc.';
    } else {
      estado = 'atrasado';
      titular = 'Cal accelerar el ritme';
      mensaje = 'Per arribar a "' + objetivo.titulo + '" hauries de fer uns ' + temasPorDia + ' temes al dia. Comença avui mateix pel més important.';
    }

    return {
      estado: estado, objetivo: objetivo, pendientes: pendientes.length,
      ritmoNecesario: Math.round(ritmo * 10) / 10, margen: margen,
      titular: titular, mensaje: mensaje,
      tareas: repartir(pendientes, temasPorDia)
    };
  }

  /* Reparte los primeros temas pendientes entre los próximos 3 días */
  function repartir(pendientes, porDia) {
    var out = [];
    var idx = 0;
    for (var offset = 0; offset < 3; offset++) {
      var fecha = new Date();
      fecha.setDate(fecha.getDate() + offset);
      var lote = pendientes.slice(idx, idx + porDia);
      idx += porDia;
      if (!lote.length) break;
      out.push({
        fecha: window.BPCal.iso(fecha),
        etiqueta: etiquetaRelativa(offset, fecha),
        temas: lote
      });
    }
    return out;
  }

  return { calcular: calcular };
})();
