/* ============================================================================
   BioPAU — BANCO DE PREGUNTAS (MAQUETA — contenido en blanco)
   ----------------------------------------------------------------------------
   Esto es SOLO la estructura. El contenido está en blanco a propósito para que
   lo rellenes tú. Cada bloque tiene un mini test y un test final.

   Para poner una pregunta real, edita el objeto:
     { q: 'Enunciado…', ops: ['Opción A','Opción B','Opción C','Opción D'], sol: 0 }
   — q   = enunciado
   — ops = opciones
   — sol = índice (0-based) de la opción correcta

   Cambia MINI_N / FINAL_N para el número de preguntas de cada tipo.
   ============================================================================ */
window.BIOPAU_TESTS = (function () {

  var MINI_N = 5;     // nº de preguntas del mini test (placeholder)
  var FINAL_N = 8;    // nº de preguntas del test final (placeholder)

  var D = window.BIOPAU_DATA;
  var BLOQUES = (D && D.BLOQUES) ? D.BLOQUES : [];

  /* Genera N preguntas-plantilla en blanco (edítalas en este archivo). */
  function blankPreguntas(n) {
    var arr = [];
    for (var i = 1; i <= n; i++) {
      arr.push({
        q: 'Pregunta ' + i + ' — (edita el enunciado en js/tests-data.js)',
        ops: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        sol: 0
      });
    }
    return arr;
  }

  var B = {};
  BLOQUES.forEach(function (b) {
    B[b.id] = {
      mini:  { id: b.id + '-mini',  tipo: 'mini', titulo: 'Mini test — ' + b.nombre,  preguntas: blankPreguntas(MINI_N) },
      final: { id: b.id + '-final', tipo: 'pau',  titulo: 'Test final — ' + b.nombre, preguntas: blankPreguntas(FINAL_N) }
    };
  });

  function forBloque(id) { return B[id] || null; }
  function testById(tid) {
    for (var k in B) if (B.hasOwnProperty(k)) {
      if (B[k].mini && B[k].mini.id === tid) return B[k].mini;
      if (B[k].final && B[k].final.id === tid) return B[k].final;
    }
    return null;
  }

  return { byBloque: B, forBloque: forBloque, testById: testById };
})();
