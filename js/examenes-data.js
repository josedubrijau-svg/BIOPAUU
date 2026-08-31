/* ============================================================================
   BioPAU — CATÁLOGO DE EXÁMENES (PAU Biologia, Catalunya)
   ----------------------------------------------------------------------------
   Cada examen = una convocatoria (un PDF completo con el enunciado).
   El alumno filtra por BLOQUE temático y ve/descarga el PDF entero. Dentro de
   cada examen se listan sus ejercicios con el/los bloque(s) que toca cada uno.

   CÓMO AÑADIR UN EXAMEN NUEVO:
      1. Sube su PDF a la carpeta  /examenes/  (nómbralo p. ej. pau-2021-ordinaria.pdf).
      2. Añade aquí un objeto con id, anio, convocatoria, serie, pdf y preguntas.
      Ids de bloque (de js/study-data.js):
        biomolecules — metabolisme — genetica — microorganismes ·
        immunologia — biotecnologia — evolucio — experimental
   ============================================================================ */
window.BIOPAU_EXAMENES = (function () {

  var EXAMENES = [
    {
      id: 'pau-2025-ord', anio: 2025, convocatoria: 'Ordinària', serie: 'Sèrie 1',
      pdf: '/examenes/pau-2025-ordinaria.pdf', solucion: '',
      preguntas: [
        { n: 1, titulo: 'Herència lligada al sexe — raquitisme HLX', bloques: ['genetica', 'biomolecules', 'experimental'] },
        { n: 2, titulo: 'Metabolisme, lactosa i selecció natural', bloques: ['metabolisme', 'microorganismes', 'evolucio', 'biotecnologia'] },
        { n: 3, titulo: 'Cianobacteris i vies metabòliques — espirulina', bloques: ['microorganismes', 'metabolisme', 'biomolecules'] },
        { n: 4, titulo: 'Àcids nucleics, proteïnes i immunitat — pop', bloques: ['biomolecules', 'genetica', 'immunologia'] }
      ]
    },
    {
      id: 'pau-2024-ord', anio: 2024, convocatoria: 'Ordinària', serie: '',
      pdf: '/examenes/pau-2024-ordinaria.pdf', solucion: '',
      preguntas: [
        { n: 1, titulo: 'Àcids nucleics i expressió gènica — tigre de Tasmània', bloques: ['biomolecules', 'genetica', 'experimental'] },
        { n: 2, titulo: 'Virus, PCR i immunitat — dengue', bloques: ['microorganismes', 'immunologia', 'biotecnologia'] },
        { n: 3, titulo: 'Herència i teràpia gènica — malaltia de Stargardt', bloques: ['genetica', 'immunologia', 'biotecnologia'] },
        { n: 4, titulo: 'Bacteris i gens de resistència', bloques: ['microorganismes', 'biotecnologia'] },
        { n: 5, titulo: 'Metabolisme vegetal i enzims — herbicides', bloques: ['metabolisme', 'biomolecules'] },
        { n: 6, titulo: 'Infeccions fúngiques i tractament', bloques: ['microorganismes', 'immunologia'] }
      ]
    },
    {
      id: 'pau-2023-ord', anio: 2023, convocatoria: 'Ordinària', serie: 'Sèries 1 i 4',
      pdf: '/examenes/pau-2023-ordinaria.pdf', solucion: '',
      preguntas: [
        { n: 1, titulo: 'Evolució i poblacions — llops', bloques: ['evolucio', 'experimental'] },
        { n: 2, titulo: 'Relacions interespecífiques — tortugues carei', bloques: ['evolucio', 'experimental'] },
        { n: 3, titulo: 'Malaltia hereditària i metabolisme — galactosèmia', bloques: ['genetica', 'metabolisme'] },
        { n: 4, titulo: 'Soques bacterianes i cultiu', bloques: ['microorganismes'] },
        { n: 5, titulo: 'Probiòtics — diarrea del viatger', bloques: ['microorganismes', 'immunologia'] },
        { n: 6, titulo: 'Verí i proteïnes — peix globus (Sèrie 4)', bloques: ['biomolecules', 'evolucio'] },
        { n: 7, titulo: 'Immunodeficiència — nen bombolla (Sèrie 4)', bloques: ['immunologia', 'genetica'] }
      ]
    },
    {
      id: 'pau-2022-ord', anio: 2022, convocatoria: 'Ordinària', serie: 'Sèries 1 i 4',
      pdf: '/examenes/pau-2022-ordinaria.pdf', solucion: '',
      preguntas: [
        { n: 1, titulo: 'Selecció artificial i herència — coloms', bloques: ['genetica', 'evolucio'] },
        { n: 2, titulo: 'Pesta bubònica i microorganismes', bloques: ['microorganismes', 'immunologia'] },
        { n: 3, titulo: 'Fotosíntesi i sucre — canya de sucre', bloques: ['metabolisme'] },
        { n: 4, titulo: 'Disseny experimental — sequera 2019', bloques: ['experimental'] },
        { n: 5, titulo: 'Comunicació i comportament — dofins', bloques: ['evolucio', 'experimental'] },
        { n: 6, titulo: 'Càncer i material genètic', bloques: ['genetica', 'biotecnologia'] },
        { n: 7, titulo: 'Biomolècules i verins — aranya (Sèrie 4)', bloques: ['biomolecules'] }
      ]
    }
  ];

  /* Bloques presentes en un examen (derivados de sus preguntas). */
  function bloquesDe(ex) {
    var set = {};
    (ex.preguntas || []).forEach(function (p) { (p.bloques || []).forEach(function (b) { set[b] = true; }); });
    (ex.bloques || []).forEach(function (b) { set[b] = true; });
    return Object.keys(set);
  }

  return { EXAMENES: EXAMENES, bloquesDe: bloquesDe };
})();
