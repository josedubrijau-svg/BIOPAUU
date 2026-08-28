/* ============================================================================
   BioPAU — CATÁLOGO DE EXÁMENES (PAU Biologia, Catalunya)
   ----------------------------------------------------------------------------
   Cada examen = una convocatoria (un PDF completo con el enunciado).
   El alumno puede filtrar por BLOQUE temático y ver/descargar el PDF entero.

   👉 CÓMO AÑADIR UN EXAMEN NUEVO:
      1. Sube su PDF a la carpeta  /examenes/  del repositorio
         (nómbralo claro, p. ej.  pau-2024-ordinaria.pdf ).
      2. Añade aquí un objeto al array EXAMENES con:
         - id            identificador único (no lo cambies una vez publicado)
         - anio          año de la convocatoria
         - convocatoria  'Ordinària' | 'Extraordinària' | 'Incidències'
         - serie         (opcional) 'Sèrie 1', 'Sèrie 3'…
         - pdf           ruta al PDF del enunciado  '/examenes/pau-2024-ordinaria.pdf'
                         (déjalo en '' mientras no lo hayas subido → saldrá "Pròximament")
         - solucion      (opcional, para más adelante) ruta al PDF de criterios
         - preguntas     lista de preguntas del examen, cada una con los BLOQUES
                         que toca. Los ids de bloque son los de js/study-data.js:
                         biomolecules · metabolisme · genetica · microorganismes ·
                         immunologia · biotecnologia · evolucio · experimental
   ============================================================================ */
window.BIOPAU_EXAMENES = (function () {

  var EXAMENES = [
    {
      id: 'pau-2025-ord', anio: 2025, convocatoria: 'Ordinària', serie: '', pdf: '', solucion: '',
      preguntas: [
        { n: 1, titulo: '', bloques: ['biomolecules'] },
        { n: 2, titulo: '', bloques: ['genetica'] },
        { n: 3, titulo: '', bloques: ['immunologia'] },
        { n: 4, titulo: '', bloques: ['experimental'] }
      ]
    },
    {
      id: 'pau-2024-ord', anio: 2024, convocatoria: 'Ordinària', serie: '', pdf: '', solucion: '',
      preguntas: [
        { n: 1, titulo: '', bloques: ['biomolecules'] },
        { n: 2, titulo: '', bloques: ['genetica'] },
        { n: 3, titulo: '', bloques: ['evolucio'] },
        { n: 4, titulo: '', bloques: ['experimental'] }
      ]
    },
    {
      id: 'pau-2023-ord', anio: 2023, convocatoria: 'Ordinària', serie: '', pdf: '', solucion: '',
      preguntas: [
        { n: 1, titulo: '', bloques: ['microorganismes'] },
        { n: 2, titulo: '', bloques: ['immunologia'] },
        { n: 3, titulo: '', bloques: ['biotecnologia'] },
        { n: 4, titulo: '', bloques: ['experimental'] }
      ]
    },
    {
      id: 'pau-2022-ord', anio: 2022, convocatoria: 'Ordinària', serie: '', pdf: '', solucion: '',
      preguntas: [
        { n: 1, titulo: '', bloques: ['biomolecules'] },
        { n: 2, titulo: '', bloques: ['genetica'] },
        { n: 3, titulo: '', bloques: ['evolucio'] },
        { n: 4, titulo: '', bloques: ['metabolisme'] }
      ]
    }
  ];

  /* Bloques presentes en un examen (derivados de sus preguntas). */
  function bloquesDe(ex) {
    var set = {};
    (ex.preguntas || []).forEach(function (p) { (p.bloques || []).forEach(function (b) { set[b] = true; }); });
    // compatibilidad: si trae ex.bloques directo, se respeta
    (ex.bloques || []).forEach(function (b) { set[b] = true; });
    return Object.keys(set);
  }

  return { EXAMENES: EXAMENES, bloquesDe: bloquesDe };
})();
