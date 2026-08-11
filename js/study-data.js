/* ============================================================================
   BioPAU — CATÁLOGO CENTRAL DE CONTENIDO
   ----------------------------------------------------------------------------
   Este archivo es la ÚNICA fuente de verdad del temario. El dashboard, apuntes,
   exámenes, el % de progreso y las sugerencias se generan a partir de aquí.

   👉 PARA AÑADIR CONTENIDO EN EL FUTURO: solo edita este archivo.
      - Añadir un tema  → añade un objeto a "temas" del bloque correspondiente.
      - Publicar apuntes → rellena "contenido" del tema (o "url" a su página).
      - Añadir exámenes  → añade entradas a EXAMENES.
   Los "id" NO deben cambiarse una vez publicados: se guardan en la base de datos
   para registrar el progreso de cada alumno.
   ============================================================================ */
window.BIOPAU_DATA = (function () {

  /* --- Fecha del examen de Biología de la PAU -----------------------------
     El calendario oficial de 2027 aún no está publicado por la Oficina d'Accés
     a la Universitat. Ajusta esta fecha en cuanto se publique. */
  var PAU_TARGET = '2027-06-09T09:00:00+02:00';

  /* --- Bloques del temari (PAU Biologia, Catalunya) ------------------------
     Verifica siempre contra la fuente oficial:
     https://universitats.gencat.cat/ca/pau/materies-pau/biologia/            */
  var BLOQUES = [
    {
      id: 'molecular',
      nombre: 'Biología molecular',
      desc: 'Biomoléculas y biotecnología',
      color: '#ADE80C',
      icon: 'dna',
      temas: [
        { id: 'mol-01', titulo: 'Glúcidos', resumen: 'Monosacáridos, enlace glucosídico, di- y polisacáridos.' },
        { id: 'mol-02', titulo: 'Lípidos', resumen: 'Ácidos grasos, triacilglicéridos, fosfolípidos y membranas.' },
        { id: 'mol-03', titulo: 'Proteínas', resumen: 'Aminoácidos, enlace peptídico, niveles de estructura, enzimas.' },
        { id: 'mol-04', titulo: 'Ácidos nucleicos', resumen: 'ADN y ARN: estructura, replicación, transcripción y traducción.' },
        { id: 'mol-05', titulo: 'Biotecnología', resumen: 'Enzimas de restricción, PCR, clonación y aplicaciones.' }
      ]
    },
    {
      id: 'metabolismo',
      nombre: 'Metabolismo',
      desc: 'Catabolismo y anabolismo',
      color: '#7BD3F7',
      icon: 'mito',
      temas: [
        { id: 'met-01', titulo: 'Introducción al metabolismo', resumen: 'Vías metabólicas, reacciones exergónicas y endergónicas, enzimas.' },
        { id: 'met-02', titulo: 'Catabolismo', resumen: 'Glucólisis, ciclo de Krebs, cadena respiratoria y fermentaciones.' },
        { id: 'met-03', titulo: 'Anabolismo', resumen: 'Fotosíntesis: fase luminosa y ciclo de Calvin.' },
        { id: 'met-04', titulo: 'Balance energético', resumen: 'Rendimiento en ATP y almacenes de energía metabólica.' }
      ]
    },
    {
      id: 'microbiologia',
      nombre: 'Microbiología',
      desc: 'Microorganismos y aplicaciones',
      color: '#F7C948',
      icon: 'microbe',
      temas: [
        { id: 'mic-01', titulo: 'Tipos de microorganismos', resumen: 'Bacterias, virus, hongos y protozoos.' },
        { id: 'mic-02', titulo: 'Cultivo y esterilización', resumen: 'Medios de cultivo, siembra y técnicas asépticas.' },
        { id: 'mic-03', titulo: 'Aplicaciones industriales', resumen: 'Fermentaciones, antibióticos y biorremediación.' }
      ]
    },
    {
      id: 'inmunologia',
      nombre: 'Inmunología',
      desc: 'Defensas y aplicaciones',
      color: '#FF8A8A',
      icon: 'shield',
      temas: [
        { id: 'inm-01', titulo: 'Inmunidad innata y adaptativa', resumen: 'Barreras, inflamación y respuesta específica.' },
        { id: 'inm-02', titulo: 'Antígenos y anticuerpos', resumen: 'Estructura de las inmunoglobulinas y reacción antígeno-anticuerpo.' },
        { id: 'inm-03', titulo: 'Respuesta celular y humoral', resumen: 'Linfocitos B y T, memoria inmunológica.' },
        { id: 'inm-04', titulo: 'Vacunas y trasplantes', resumen: 'Sueros, vacunas, alergias, autoinmunidad y rechazo.' }
      ]
    },
    {
      id: 'genetica',
      nombre: 'Genética mendeliana',
      desc: 'Herencia y problemas',
      color: '#C39BFF',
      icon: 'punnett',
      temas: [
        { id: 'gen-01', titulo: 'Leyes de Mendel', resumen: 'Monohíbridos, dihíbridos y cuadro de Punnett.' },
        { id: 'gen-02', titulo: 'Herencia ligada al sexo', resumen: 'Cromosomas sexuales, daltonismo y hemofilia.' },
        { id: 'gen-03', titulo: 'Genealogías (pedigríes)', resumen: 'Interpretación de árboles genealógicos.' },
        { id: 'gen-04', titulo: 'Mutaciones', resumen: 'Génicas, cromosómicas y genómicas.' }
      ]
    },
    {
      id: 'evolucion',
      nombre: 'Evolución',
      desc: 'Teorías y pruebas',
      color: '#8AC000',
      icon: 'tree',
      temas: [
        { id: 'evo-01', titulo: 'Teorías evolutivas', resumen: 'Lamarck, Darwin y neodarwinismo.' },
        { id: 'evo-02', titulo: 'Pruebas de la evolución', resumen: 'Homologías, analogías y registro fósil.' },
        { id: 'evo-03', titulo: 'Especiación', resumen: 'Aislamiento reproductivo y formación de especies.' }
      ]
    },
    {
      id: 'ecologia',
      nombre: 'Ecología',
      desc: 'Ecosistemas y relaciones',
      color: '#5FD3A6',
      icon: 'leaf',
      temas: [
        { id: 'eco-01', titulo: 'Ecosistema y factores', resumen: 'Biotopo, biocenosis, factores bióticos y abióticos.' },
        { id: 'eco-02', titulo: 'Cadenas y redes tróficas', resumen: 'Productores, consumidores, pirámides ecológicas.' },
        { id: 'eco-03', titulo: 'Ciclos biogeoquímicos', resumen: 'Carbono, nitrógeno y flujo de energía.' },
        { id: 'eco-04', titulo: 'Poblaciones y sucesiones', resumen: 'Dinámica de poblaciones e impacto humano.' }
      ]
    },
    {
      id: 'experimental',
      nombre: 'Diseño experimental',
      desc: 'El bloque que decide notas',
      color: '#FFB067',
      icon: 'flask',
      temas: [
        { id: 'exp-01', titulo: 'Variables y controles', resumen: 'Variable independiente, dependiente y grupo control.' },
        { id: 'exp-02', titulo: 'Hipótesis y conclusiones', resumen: 'Formular hipótesis y redactar conclusiones válidas.' },
        { id: 'exp-03', titulo: 'Interpretación de gráficas', resumen: 'Leer tablas y gráficos de resultados experimentales.' }
      ]
    }
  ];

  /* --- Exámenes oficiales por año -----------------------------------------
     Añade aquí cada convocatoria. "temas" enlaza con los ids de los bloques
     para poder filtrar los exámenes por tema más adelante.                  */
  var EXAMENES = [
    { id: 'pau-2025-ord', anio: 2025, convocatoria: 'Ordinaria', bloques: ['molecular', 'metabolismo', 'genetica', 'inmunologia'] },
    { id: 'pau-2024-ord', anio: 2024, convocatoria: 'Ordinaria', bloques: ['metabolismo', 'ecologia', 'genetica', 'experimental'] },
    { id: 'pau-2023-ord', anio: 2023, convocatoria: 'Ordinaria', bloques: ['molecular', 'microbiologia', 'inmunologia', 'evolucion'] },
    { id: 'pau-2022-ord', anio: 2022, convocatoria: 'Ordinaria', bloques: ['metabolismo', 'genetica', 'ecologia', 'experimental'] }
  ];

  /* --- Niveles (gamificación) ---------------------------------------------
     Se desbloquean por número de temas completados.                         */
  var NIVELES = [
    { min: 0, nombre: 'Célula Inicial' },
    { min: 2, nombre: 'Aprendiz de Membrana' },
    { min: 5, nombre: 'Ribosoma Activo' },
    { min: 8, nombre: 'Mitocondria Incansable' },
    { min: 12, nombre: 'Célula Experta' },
    { min: 16, nombre: 'Maestro del ADN' },
    { min: 21, nombre: 'Organismo Completo' },
    { min: 26, nombre: 'Leyenda de la PAU' }
  ];

  /* --- Avatares disponibles (se dibujan en SVG, sin imágenes externas) ----- */
  var AVATARES = [
    { id: 'cell', nombre: 'Célula', color: '#ADE80C' },
    { id: 'dna', nombre: 'ADN', color: '#7BD3F7' },
    { id: 'mito', nombre: 'Mitocondria', color: '#FF8A8A' },
    { id: 'leaf', nombre: 'Cloroplasto', color: '#5FD3A6' },
    { id: 'microbe', nombre: 'Microbio', color: '#F7C948' },
    { id: 'flask', nombre: 'Matraz', color: '#C39BFF' }
  ];

  /* --- Utilidades derivadas ------------------------------------------------ */
  function todosLosTemas() {
    var out = [];
    BLOQUES.forEach(function (b) {
      b.temas.forEach(function (t) {
        out.push({ id: t.id, titulo: t.titulo, resumen: t.resumen, bloqueId: b.id, bloqueNombre: b.nombre, color: b.color });
      });
    });
    return out;
  }

  function bloquePorId(id) {
    for (var i = 0; i < BLOQUES.length; i++) if (BLOQUES[i].id === id) return BLOQUES[i];
    return null;
  }

  function nivelPara(completados) {
    var idx = 0;
    for (var i = 0; i < NIVELES.length; i++) if (completados >= NIVELES[i].min) idx = i;
    var siguiente = NIVELES[idx + 1] || null;
    return {
      numero: idx + 1,
      nombre: NIVELES[idx].nombre,
      siguiente: siguiente ? siguiente.nombre : null,
      faltanParaSiguiente: siguiente ? Math.max(0, siguiente.min - completados) : 0
    };
  }

  return {
    PAU_TARGET: PAU_TARGET,
    BLOQUES: BLOQUES,
    EXAMENES: EXAMENES,
    NIVELES: NIVELES,
    AVATARES: AVATARES,
    todosLosTemas: todosLosTemas,
    bloquePorId: bloquePorId,
    nivelPara: nivelPara,
    totalTemas: todosLosTemas().length
  };
})();
