/* ============================================================================
   BioPAU — CATÁLOGO CENTRAL DE CONTENIDO
   ----------------------------------------------------------------------------
   Fuente oficial de la Generalitat (universitats.gencat.cat/ca/pau/materies-pau/biologia):
   7 bloques del temario de Biología de la PAU (Catalunya).

   👉 PARA AÑADIR TUS APUNTES ESCANEADOS MÁS ADELANTE:
      dentro de cada bloque, en "apuntes", añade objetos así:
        { titulo: 'Els glúcids', img: '/apuntes/biomolecules/glucids.jpg' }
      (sube la imagen a la carpeta /apuntes/... del repo y pon aquí su ruta).
      Mientras "apuntes" esté vacío, se mostrará un hueco "Pròximament".

   👉 Los "id" NO deben cambiarse una vez publicados (se guardan en la BD).
   ============================================================================ */
window.BIOPAU_DATA = (function () {

  var PAU_TARGET = '2027-06-09T09:00:00+02:00';

  /* Los 7 bloques oficiales, en el orden y nombre de la Generalitat. */
  var BLOQUES = [
    {
      id: 'biomolecules',
      nombre: 'Les biomolècules i el metabolisme',
      desc: 'Glúcids, lípids, proteïnes i àcids nucleics, i com la cèl·lula obté i fa servir l\'energia: catabolisme, anabolisme, respiració i fotosíntesi.',
      color: '#38BDF8',
      icon: 'mito',
      apuntes: []
    },
    {
      id: 'genetica',
      nombre: 'Genètica i cicle cel·lular',
      desc: 'Cicle cel·lular, mitosi i meiosi, lleis de Mendel, herència lligada al sexe, pedigrís i mutacions.',
      color: '#A78BFA',
      icon: 'dna',
      apuntes: []
    },
    {
      id: 'microorganismes',
      nombre: 'Els microorganismes i les formes acel·lulars',
      desc: 'Bacteris, fongs i protozous, i les formes acel·lulars (virus, viroides i prions). Cultiu, esterilització i aplicacions.',
      color: '#34D399',
      icon: 'microbe',
      apuntes: []
    },
    {
      id: 'immunologia',
      nombre: 'Immunologia',
      desc: 'Immunitat innata i adaptativa, antígens i anticossos, resposta cel·lular i humoral, vacunes, al·lèrgies i autoimmunitat.',
      color: '#F87171',
      icon: 'shield',
      apuntes: []
    },
    {
      id: 'biotecnologia',
      nombre: 'Biotecnologia',
      desc: 'Manipulació dels éssers vius o els seus components: enzims de restricció, PCR, clonació i aplicacions en medicina, agricultura i indústria.',
      color: '#FBBF24',
      icon: 'flask',
      apuntes: []
    },
    {
      id: 'evolucio',
      nombre: 'Evolució',
      desc: 'Lamarckisme i darwinisme, evidències de l\'evolució, teoria sintètica, variabilitat, freqüències gèniques i especiació.',
      color: '#4ADE80',
      icon: 'tree',
      apuntes: []
    },
    {
      id: 'experimental',
      nombre: 'Disseny experimental',
      desc: 'Mètode científic, hipòtesis, variables, controls i rèpliques, i interpretació de gràfics i resultats. El bloc transversal de la PAU.',
      color: '#FB923C',
      icon: 'target',
      apuntes: []
    }
  ];

  var EXAMENES = [
    { id: 'pau-2025-ord', anio: 2025, convocatoria: 'Ordinària', bloques: ['biomolecules', 'genetica', 'immunologia'] },
    { id: 'pau-2024-ord', anio: 2024, convocatoria: 'Ordinària', bloques: ['biomolecules', 'genetica', 'evolucio', 'experimental'] },
    { id: 'pau-2023-ord', anio: 2023, convocatoria: 'Ordinària', bloques: ['microorganismes', 'immunologia', 'biotecnologia'] },
    { id: 'pau-2022-ord', anio: 2022, convocatoria: 'Ordinària', bloques: ['biomolecules', 'genetica', 'evolucio'] }
  ];

  var NIVELES = [
    { min: 0, nombre: 'Cèl·lula Inicial' },
    { min: 1, nombre: 'Aprenent de Membrana' },
    { min: 2, nombre: 'Ribosoma Actiu' },
    { min: 3, nombre: 'Mitocondri Incansable' },
    { min: 4, nombre: 'Cèl·lula Experta' },
    { min: 5, nombre: 'Mestre del DNA' },
    { min: 6, nombre: 'Organisme Complet' },
    { min: 7, nombre: 'Llegenda de la PAU' }
  ];

  var AVATARES = [
    { id: 'cell', nombre: 'Cèl·lula', color: '#ADE80C' },
    { id: 'dna', nombre: 'DNA', color: '#A78BFA' },
    { id: 'mito', nombre: 'Mitocondri', color: '#38BDF8' },
    { id: 'leaf', nombre: 'Cloroplast', color: '#34D399' },
    { id: 'microbe', nombre: 'Microbi', color: '#FBBF24' },
    { id: 'flask', nombre: 'Matràs', color: '#F87171' }
  ];

  function unidadesDeBloque(b) {
    return (b.apuntes && b.apuntes.length) ? b.apuntes.length : 1;
  }

  function todasLasUnidades() {
    var out = [];
    BLOQUES.forEach(function (b) {
      if (b.apuntes && b.apuntes.length) {
        b.apuntes.forEach(function (a, i) {
          out.push({ id: b.id + '-' + (i + 1), titulo: a.titulo, bloqueId: b.id, bloqueNombre: b.nombre, color: b.color });
        });
      } else {
        out.push({ id: b.id, titulo: b.nombre, bloqueId: b.id, bloqueNombre: b.nombre, color: b.color });
      }
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
    unidadesDeBloque: unidadesDeBloque,
    todasLasUnidades: todasLasUnidades,
    todosLosTemas: todasLasUnidades,
    bloquePorId: bloquePorId,
    nivelPara: nivelPara,
    totalTemas: todasLasUnidades().length
  };
})();
