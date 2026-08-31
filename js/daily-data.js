/* ============================================================================
   BioPAU — bioPau Daily — BANCO DE PREGUNTAS (maqueta con generador real)
   ----------------------------------------------------------------------------
   Estructura pensada para escalar a varias asignaturas y tipos de pregunta.
   Cada pregunta tiene un ID ÚNICO (clave para no repetir nunca):

     { id, subject, topic, subtopic, difficulty, type, text, options, sol,
       explanation, tags }

   Ahora mismo el CONTENIDO está en blanco (placeholders editables). El sistema
   —generación diaria determinista, no repetir, diversidad, dificultad,
   estadísticas— ya es real y funciona con estos placeholders. Para poner
   preguntas de verdad, edita los objetos (o añade más) en este archivo.

   Asignaturas: por ahora Biología (la de bioPau), con sus 8 bloques como
   "temas". La arquitectura admite añadir más asignaturas/temas sin tocar el
   motor: solo añade entradas a SUBJECTS y preguntas al BANK.
   ============================================================================ */
window.BIOPAU_DAILY = (function () {

  var D = window.BIOPAU_DATA;
  var BLOQUES = (D && D.BLOQUES) ? D.BLOQUES : [];

  /* ---- Asignaturas y temas (Biología = bloques de bioPau) --------------- */
  var SUBJECTS = [{
    id: 'bio', name: 'Biología', name_ca: 'Biologia', color: '#ADE80C',
    topics: BLOQUES.map(function (b) { return { id: b.id, name: b.nombre, color: b.color }; })
  }];
  // (Futuro) más asignaturas: { id:'quim', name:'Química', topics:[...] }, etc.

  var DIFFS = ['facil', 'medio', 'dificil'];

  /* ---- Generador de banco (placeholders con IDs únicos) ----------------- */
  var PER_TOPIC = 15;   // preguntas por tema (sube este número al añadir contenido)

  function pad(n) { return ('000' + n).slice(-3); }
  var BANK = [];
  SUBJECTS.forEach(function (s) {
    s.topics.forEach(function (tp) {
      for (var i = 1; i <= PER_TOPIC; i++) {
        var diff = DIFFS[i % 3];
        BANK.push({
          id: s.id + '-' + tp.id + '-' + pad(i),
          subject: s.id, subjectName: s.name, topic: tp.id, topicName: tp.name,
          subtopic: '', difficulty: diff, type: 'mcq',
          text: '[' + s.name + ' — ' + tp.name + ' — ' + diff + '] Pregunta ' + i + ' — edita el enunciado en js/daily-data.js',
          options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
          sol: 0,
          explanation: 'Explicación de ejemplo — edítala en js/daily-data.js para enseñar por qué la respuesta es correcta.',
          tags: [tp.id, diff]
        });
      }
    });
  });

  var BY_ID = {};
  BANK.forEach(function (q) { BY_ID[q.id] = q; });

  function all() { return BANK; }
  function byId(id) { return BY_ID[id] || null; }
  function subjects() { return SUBJECTS; }
  function topicToBlock(topicId) { return topicId; } // en Biología, tema == id de bloque

  return { all: all, byId: byId, subjects: subjects, DIFFS: DIFFS, topicToBlock: topicToBlock };
})();
