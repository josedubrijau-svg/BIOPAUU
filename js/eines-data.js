/* ============================================================================
   BioPAU — EINES (Laboratori bioPau)
   Capa de dades i configuració. Tot el que és "contingut" viu aquí perquè la
   secció sigui fàcilment ampliable: afegir una eina és afegir una entrada.
   ----------------------------------------------------------------------------
   IMPORTANT sobre les NOTES DE TALL: el dataset d'aquest fitxer és de
   DEMOSTRACIÓ. No són dades oficials. L'arquitectura desa font/any/actualització
   perquè es puguin substituir per dades reals sense tocar la interfície.
   ============================================================================ */
window.BPEines = (function () {

  /* ---------- Categories ------------------------------------------------- */
  var CATS = [
    { id: 'estudi',      title: 'Estudi',      sub: 'Concentra\'t i entrena el ritme.' },
    { id: 'objectius',   title: 'Objectius',   sub: 'Calcula la teva nota i la distància fins on vols arribar.' },
    { id: 'universitat', title: 'Universitat', sub: 'Explora notes de tall i tendències.' },
    { id: 'rendiment',   title: 'Rendiment',   sub: 'Entén el teu progrés amb dades.' },
    { id: 'aprenentatge',title: 'Aprenentatge',sub: 'Repassa i memoritza millor.' }
  ];

  /* ---------- Registre d'eines (mòduls) ---------------------------------- */
  /* estat: 'live' (funciona) | 'soon' (en desenvolupament)                  */
  var TOOLS = [
    { id:'timer',     cat:'estudi',      icon:'timer',   name:'Temporitzador d\'estudi', desc:'Pomodoro, 52/17, Deep Work i mode immersiu amb ambient científic.', estat:'live', featured:true, tags:['pomodoro','concentracio','deep work','estudiar','temps','52','90'] },
    { id:'recomana',  cat:'estudi',      icon:'spark',   name:'Sessió recomanada',      desc:'Digues quant temps tens i et proposo un pla d\'estudi.', estat:'live', tags:['recomanacio','pla','minuts','temps'] },
    { id:'flash',     cat:'aprenentatge',icon:'cards',   name:'Flashcards',             desc:'Crea targetes de repàs i estudia-les amb repetició.', estat:'live', tags:['flashcards','targetes','repas','memoria'] },
    { id:'metodes',   cat:'aprenentatge',icon:'book',    name:'Mètodes d\'estudi',      desc:'Tècniques provades: quan i com fer servir cadascuna.', estat:'live', tags:['metodes','tecniques','pomodoro','feynman'] },

    { id:'calc',      cat:'objectius',   icon:'calc',    name:'Calculadora de nota d\'accés', desc:'Batxillerat/PAU i CFGS, amb desglossament i ponderacions.', estat:'live', featured:true, tags:['nota','acces','pau','ponderacio','calcul','admissio'] },
    { id:'objectiu',  cat:'objectius',   icon:'target',  name:'Nota objectiu',          desc:'Quant et falta per a la teva plaça i què pots millorar.', estat:'live', tags:['objectiu','distancia','meta','nota'] },
    { id:'countdown', cat:'objectius',   icon:'hourglass',name:'Compte enrere PAU',     desc:'Els dies que et queden fins a l\'examen, sempre a la vista.', estat:'live', tags:['compte enrere','dies','pau','examen','countdown'] },

    { id:'tall',      cat:'universitat', icon:'chart',   name:'Explorador de notes de tall', desc:'Evolució històrica, tendència i comparador de carreres.', estat:'live', featured:true, tags:['notes de tall','corte','universitat','carrera','grafic','tendencia'] },
    { id:'simulador', cat:'universitat', icon:'compass', name:'Simulador de possibilitats', desc:'Amb la teva nota, quines carreres tens a l\'abast (orientatiu).', estat:'live', tags:['simulador','possibilitats','opcions','carreres'] },

    { id:'mitjana',   cat:'rendiment',   icon:'sigma',   name:'Calculadora de mitjana', desc:'Mitjana ponderada per crèdits i què et falta per pujar-la.', estat:'live', tags:['mitjana','media','notes','ponderada'] },
    { id:'sessions',  cat:'rendiment',   icon:'pulse',   name:'Les meves sessions',     desc:'Hores d\'estudi, ratxa i evolució de les teves sessions.', estat:'live', tags:['sessions','hores','ratxa','rendiment','estadistiques'] }
  ];

  function toolById(id){ for(var i=0;i<TOOLS.length;i++) if(TOOLS[i].id===id) return TOOLS[i]; return null; }
  function toolsByCat(c){ return TOOLS.filter(function(t){return t.cat===c;}); }

  /* ---------- Mètodes i presets del temporitzador ----------------------- */
  /* temps en minuts. cicles: nº de blocs abans del descans llarg           */
  var METHODS = [
    { id:'pomodoro', name:'Pomodoro', focus:25, brk:5, long:15, cycles:4, desc:'25 min d\'estudi + 5 de descans. Cada 4 blocs, descans llarg.' },
    { id:'m5217',    name:'52 / 17',  focus:52, brk:17, long:17, cycles:1, desc:'52 min de concentració i 17 de descans real.' },
    { id:'m9020',    name:'90 / 20',  focus:90, brk:20, long:20, cycles:1, desc:'Blocs llargs alineats amb els cicles d\'atenció.' },
    { id:'deep',     name:'Deep Work',focus:50, brk:10, long:10, cycles:1, desc:'Concentració profunda sostinguda, poques interrupcions.' },
    { id:'custom',   name:'Personalitzat', focus:30, brk:5, long:20, cycles:4, desc:'Defineix el teu ritme: estudi, descansos i cicles.' }
  ];
  var PRESETS = [
    { id:'rapida', name:'Sessió ràpida', focus:15, brk:3, long:5, cycles:1, hue:'#7CE0A3' },
    { id:'pomo',   name:'Pomodoro',      focus:25, brk:5, long:15, cycles:4, hue:'#ADE80C' },
    { id:'conc',   name:'Concentració',  focus:50, brk:10, long:15, cycles:1, hue:'#7C5CD6' },
    { id:'deep',   name:'Deep Work',     focus:90, brk:20, long:20, cycles:1, hue:'#2F86C9' }
  ];

  /* ---------- Ambients visuals ------------------------------------------ */
  var AMBIENTS = [
    { id:'cell',    name:'La cèl·lula',    hint:'Una cèl·lula surant amb els seus orgànuls.' },
    { id:'blood',   name:'Flux sanguini',  hint:'Glòbuls recorrent un capil·lar.' },
    { id:'neuron',  name:'Neurona',        hint:'Un impuls viatjant per les dendrites.' },
    { id:'dna',     name:'ADN',            hint:'La doble hèlix girant lentament.' },
    { id:'micro',   name:'Micromón',       hint:'Un ecosistema microscòpic.' },
    { id:'mol',     name:'Molècules',      hint:'Estructures orbitant en calma.' },
    { id:'abstract',name:'Mode abstracte', hint:'Partícules i línies netes.' }
  ];

  /* ---------- Ambient sonor (WebAudio, sense fitxers) -------------------- */
  var SOUNDS = [
    { id:'off',   name:'Silenci' },
    { id:'white', name:'Soroll blanc' },
    { id:'brown', name:'Soroll marró' },
    { id:'rain',  name:'Pluja' },
    { id:'lib',   name:'Biblioteca' }
  ];

  /* ---------- Frases motivadores per to i fase -------------------------- */
  /* {career} se substitueix per la carrera objectiu si n'hi ha.           */
  var PHRASES = {
    motivador: {
      focus: ['Un bloc més, un pas més cap a la teva plaça.','La constància pesa més que la perfecció.','Avui també compta. Segueix.','El teu jo del futur t\'ho agrairà.','Estàs construint el teu futur, ara mateix.'],
      career:['La teva plaça a {career} es construeix sessió a sessió.','Cada bloc t\'apropa a {career}.'],
      brk:  ['Descansa de veritat: també forma part.','Respira. Torna amb més força.'],
      done: ['Sessió completada. Orgull.','Ho has fet. Un dia més de constància.']
    },
    exigente: {
      focus: ['Sense excuses. Concentra\'t.','El resultat és la suma de sessions com aquesta.','Ni una distracció més. Endavant.','Vols la plaça? Es guanya aquí.'],
      career:['{career} no s\'aconsegueix sol. Treballa-hi ara.','Qui vol {career} no mira el mòbil ara.'],
      brk:  ['Descans breu. Torna al 100%.','Recupera i continua.'],
      done: ['Fet. Demà, un altre.','Compleix. Això és el que compta.']
    },
    tranquilo: {
      focus: ['Pas a pas, sense pressa.','Només aquest bloc. Res més.','Concentra\'t en el que tens al davant.','Tot arriba amb constància tranquil·la.'],
      career:['{career} és un camí llarg; avança amb calma.','A poc a poc, cap a {career}.'],
      brk:  ['Para, respira, mira lluny.','Un descans conscient.'],
      done: ['Feina feta, en calma.','Bon ritme. Descansa.']
    },
    amigo: {
      focus: ['Va, que tu pots amb això.','Un bloquet i ho tens.','Estem en això junts. Endavant.','Tranqui, sessió a sessió.'],
      career:['Anem a per {career}, company/a.','{career} t\'espera. Un bloc més!'],
      brk:  ['Estirament ràpid i tornem.','Cinc minuts per a tu.'],
      done: ['Genial! Sessió feta.','Molt bé, de debò.']
    },
    coach: {
      focus: ['Enfoca l\'objectiu del bloc.','Repeteix: sessions bones fan resultats bons.','Marca el ritme. Tu tens el control.','Petits marges, gran diferència.'],
      career:['Objectiu {career}: executa aquest bloc.','Prepara\'t per a {career}. Ara toca focus.'],
      brk:  ['Recuperació activa: aigua i moviment.','Reset de 5 minuts.'],
      done: ['Bloc registrat. Progrés real.','Sessió tancada. Suma i segueix.']
    },
    minimalista: {
      focus: ['Focus.','Un bloc.','Segueix.','Ara.'],
      career:['Cap a {career}.','{career}. Focus.'],
      brk:  ['Descansa.','Respira.'],
      done: ['Fet.','Complet.']
    }
  };

  /* ---------- Fórmules d'accés (editables/ampliables) -------------------- */
  /* Barem orientatiu de referència (Catalunya). El sistema pot canviar cada
     any i segons universitat/CCAA: es marca sempre com a orientatiu.        */
  var FORMULES = {
    comunitats: [ { id:'cat', name:'Catalunya', actiu:true }, { id:'altres', name:'Altres comunitats', actiu:false } ],
    coefs: [0, 0.1, 0.2],           // ponderacions possibles per matèria de fase específica
    maxAdmissio: 14,
    // Nota d'accés (Batx/PAU) = 60% mitjana batxillerat + 40% fase general
    accessBatx: function (mitjanaBatx, faseGeneral) { return 0.6 * mitjanaBatx + 0.4 * faseGeneral; },
    // CFGS: nota d'accés = mitjana del cicle
    accessCfgs: function (mitjanaCicle) { return mitjanaCicle; },
    // Admissió = accés + suma de les 2 millors (nota_examen * coef), amb nota_examen >= 5
    admissio: function (access, ponder) {
      var vals = (ponder || []).filter(function (p) { return p.nota >= 5 && p.coef > 0; })
                               .map(function (p) { return p.nota * p.coef; })
                               .sort(function (a, b) { return b - a; });
      var extra = (vals[0] || 0) + (vals[1] || 0);
      return Math.min(14, access + extra);
    }
  };

  /* ---------- Dataset DEMO de notes de tall ----------------------------- */
  /* NO són dades oficials. Estructura preparada per a dades reals.          */
  function serie(carrera, uni, base, step, jitter) {
    var anys = [2019,2020,2021,2022,2023,2024], punts = [], n = base;
    for (var i=0;i<anys.length;i++){
      n = n + step + ((i*37%5)-2) * (jitter||0.02);
      punts.push({ any: anys[i], nota: Math.round(Math.min(14, Math.max(5, n))*1000)/1000 });
    }
    return { carrera:carrera, uni:uni, punts:punts };
  }
  var NOTES_TALL = {
    meta: { demo:true, font:'Dataset de demostració — NO són dades oficials', actualitzat:'mostra 2019–2024',
            aviso:'Les notes de tall són orientatives, canvien cada any i depenen de la convocatòria, la universitat i la comunitat. Substitueix aquest dataset per la font oficial quan la tinguis.' },
    ambit: {
      'Ciències de la Salut': ['Medicina','Infermeria','Farmàcia','Fisioteràpia','Odontologia','Veterinària','Ciències Biomèdiques','Nutrició Humana i Dietètica','Òptica i Optometria','Logopèdia','Podologia'],
      'Ciències': ['Biologia','Biotecnologia','Bioquímica','Química','Ciències Ambientals','Ciències del Mar'],
      'Altres': ['Psicologia','CAFE']
    },
    series: [
      serie('Medicina','UB',12.5,0.06), serie('Medicina','UAB',12.6,0.05), serie('Medicina','UPF',12.7,0.05), serie('Medicina','URV',12.3,0.06), serie('Medicina','UdG',12.2,0.07), serie('Medicina','UdL',12.1,0.06),
      serie('Infermeria','UB',10.6,0.09), serie('Infermeria','UAB',10.2,0.08), serie('Infermeria','URV',9.4,0.10), serie('Infermeria','UdG',9.8,0.09), serie('Infermeria','UdL',9.1,0.08),
      serie('Farmàcia','UB',10.9,0.07), serie('Farmàcia','URV',9.2,0.09),
      serie('Fisioteràpia','UAB',11.3,0.06), serie('Fisioteràpia','URL',10.1,0.05), serie('Fisioteràpia','UdL',10.4,0.07),
      serie('Odontologia','UB',11.8,0.05), serie('Odontologia','UIC',8.0,0.06),
      serie('Veterinària','UAB',11.6,0.05),
      serie('Ciències Biomèdiques','UB',11.9,0.06), serie('Ciències Biomèdiques','UPF',12.1,0.05), serie('Ciències Biomèdiques','UdG',11.0,0.07),
      serie('Nutrició Humana i Dietètica','UB',9.0,0.10),
      serie('Biologia','UB',8.8,0.10), serie('Biologia','UAB',8.6,0.09), serie('Biologia','UdG',7.9,0.10),
      serie('Biotecnologia','UAB',11.4,0.06), serie('Biotecnologia','URV',10.6,0.07), serie('Biotecnologia','UdG',10.2,0.08),
      serie('Bioquímica','UB',11.2,0.06), serie('Bioquímica','UAB',11.0,0.06),
      serie('Química','UB',8.2,0.10), serie('Química','URV',6.9,0.11),
      serie('Ciències Ambientals','UAB',7.6,0.10), serie('Ciències del Mar','UB',9.3,0.09),
      serie('Psicologia','UB',10.7,0.08), serie('Psicologia','UAB',10.3,0.08), serie('Psicologia','URV',8.9,0.09),
      serie('CAFE','UB',10.4,0.07)
    ],
    carreres: function(){ var s={}; this.series.forEach(function(x){s[x.carrera]=1;}); return Object.keys(s); },
    unisDe: function(carrera){ return this.series.filter(function(x){return x.carrera===carrera;}).map(function(x){return x.uni;}); },
    get: function(carrera, uni){ for(var i=0;i<this.series.length;i++){ var x=this.series[i]; if(x.carrera===carrera && x.uni===uni) return x; } return null; },
    ultima: function(carrera, uni){ var s=this.get(carrera,uni); if(!s) return null; return s.punts[s.punts.length-1].nota; }
  };

  /* ---------- Mètodes d'estudi (contingut de la guia) ------------------- */
  var GUIA_METODES = [
    { name:'Pomodoro', when:'Quan et costa arrencar o et distreus sovint.', how:'Blocs curts (25\') amb descansos. Baixa la barrera per començar.' },
    { name:'52/17', when:'Quan ja tens hàbit i vols blocs més productius.', how:'52\' de feina profunda i 17\' de descans real (lluny de la pantalla).' },
    { name:'Deep Work', when:'Temes difícils que demanen concentració sostinguda.', how:'Sessions llargues sense interrupcions; mòbil fora de vista.' },
    { name:'Repetició espaiada', when:'Per memoritzar a llarg termini.', how:'Repassa amb intervals creixents (1 dia, 3 dies, 1 setmana…). Fes servir Flashcards.' },
    { name:'Recall actiu', when:'Per fixar de veritat, no només rellegir.', how:'Tanca els apunts i intenta explicar-ho o respondre preguntes de memòria.' },
    { name:'Feynman', when:'Quan creus que ho saps però no n\'estàs segur/a.', how:'Explica-ho amb paraules senzilles, com si l\'ensenyessis. On et travis, repassa.' }
  ];

  return {
    CATS:CATS, TOOLS:TOOLS, METHODS:METHODS, PRESETS:PRESETS, AMBIENTS:AMBIENTS, SOUNDS:SOUNDS,
    PHRASES:PHRASES, FORMULES:FORMULES, NOTES_TALL:NOTES_TALL, GUIA_METODES:GUIA_METODES,
    toolById:toolById, toolsByCat:toolsByCat
  };
})();
