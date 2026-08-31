/* ============================================================================
   BioPAU — Motor de MENSAJES PERSONALIZADOS (bilingüe CAT/ESP).
   window.BPMessages: genera saludo + mensaje contextual a partir del perfil
   (carrera, nombre, tono) y del estado (racha, inactividad, progreso, hora).
   - Tono: motivador | exigente | tranquilo | amigo | coach | minimalista
   - Rota las variantes para no repetir el último mensaje mostrado.
   - Si no hay carrera/nombre, degrada con elegancia (nada genérico y vacío).
   ============================================================================ */
window.BPMessages = (function () {
  'use strict';

  function lang() { return (window.BPI18n && window.BPI18n.get()) || 'es'; }

  /* ---- Carrera → "rol" con género y emoji -------------------------------- */
  /* Cada entrada: claves a detectar + {f,m,n} en es y ca + emoji.            */
  var ROLES = [
    { k:['enferm','inferm'], emoji:'', es:{f:'enfermera',m:'enfermero',n:'futur@ enfermer@'}, ca:{f:'infermera',m:'infermer',n:'futur@ inferm@'} },
    { k:['medicin','medic','metge','médic'], emoji:'👩‍', es:{f:'médica',m:'médico',n:'futur@ metge/essa'}, ca:{f:'metgessa',m:'metge',n:'futur@ metge/essa'} },
    { k:['psicolog','psicòleg','psicolog'], emoji:'', es:{f:'psicóloga',m:'psicólogo',n:'futur@ psicòleg/a'}, ca:{f:'psicòloga',m:'psicòleg',n:'futur@ psicòleg/a'} },
    { k:['derecho','dret','abogad','advoc'], emoji:'', es:{f:'abogada',m:'abogado',n:'futur@ advocat/da'}, ca:{f:'advocada',m:'advocat',n:'futur@ advocat/da'} },
    { k:['veterin'], emoji:'', es:{f:'veterinaria',m:'veterinario',n:'futur@ veterinari@'}, ca:{f:'veterinària',m:'veterinari',n:'futur@ veterinari@'} },
    { k:['maestr','magisteri','mestr','educacio','educació','educacion'], emoji:'', es:{f:'maestra',m:'maestro',n:'futur@ mestre/a'}, ca:{f:'mestra',m:'mestre',n:'futur@ mestre/a'} },
    { k:['biolog','biòleg','biolog'], emoji:'', es:{f:'bióloga',m:'biólogo',n:'futur@ biòleg/a'}, ca:{f:'biòloga',m:'biòleg',n:'futur@ biòleg/a'} },
    { k:['farmac','farmàc'], emoji:'', es:{f:'farmacéutica',m:'farmacéutico',n:'futur@ farmacèutic@'}, ca:{f:'farmacèutica',m:'farmacèutic',n:'futur@ farmacèutic@'} },
    { k:['fisio'], emoji:'', es:{f:'fisioterapeuta',m:'fisioterapeuta',n:'futur@ fisioterapeuta'}, ca:{f:'fisioterapeuta',m:'fisioterapeuta',n:'futur@ fisioterapeuta'} },
    { k:['odontolog','dentista'], emoji:'', es:{f:'dentista',m:'dentista',n:'futur@ dentista'}, ca:{f:'dentista',m:'dentista',n:'futur@ dentista'} },
    { k:['veterinaria'], emoji:'', es:{f:'veterinaria',m:'veterinario',n:'veterinari@'}, ca:{f:'veterinària',m:'veterinari',n:'veterinari@'} },
    { k:['enginy','ingenier','ingeni'], emoji:'', es:{f:'ingeniera',m:'ingeniero',n:'futur@ enginyer@'}, ca:{f:'enginyera',m:'enginyer',n:'futur@ enginyer@'} },
    { k:['arquitect'], emoji:'', es:{f:'arquitecta',m:'arquitecto',n:'futur@ arquitect@'}, ca:{f:'arquitecta',m:'arquitecte',n:'futur@ arquitect@'} },
    { k:['informat','informàt','program'], emoji:'', es:{f:'programadora',m:'programador',n:'futur@ programador@'}, ca:{f:'programadora',m:'programador',n:'futur@ programador@'} },
    { k:['economi','ade','empres'], emoji:'', es:{f:'economista',m:'economista',n:'futur@ economista'}, ca:{f:'economista',m:'economista',n:'futur@ economista'} },
    { k:['periodis'], emoji:'', es:{f:'periodista',m:'periodista',n:'futur@ periodista'}, ca:{f:'periodista',m:'periodista',n:'futur@ periodista'} },
    { k:['traduc'], emoji:'', es:{f:'traductora',m:'traductor',n:'futur@ traductor@'}, ca:{f:'traductora',m:'traductor',n:'futur@ traductor@'} },
    { k:['nutri'], emoji:'', es:{f:'nutricionista',m:'nutricionista',n:'futur@ nutricionista'}, ca:{f:'nutricionista',m:'nutricionista',n:'futur@ nutricionista'} },
    { k:['quimic','químic'], emoji:'', es:{f:'química',m:'químico',n:'futur@ químic@'}, ca:{f:'química',m:'químic',n:'futur@ químic@'} }
  ];

  /* Devuelve {word, emoji} o null a partir de la carrera objetivo. */
  function roleFor(profile) {
    var career = (profile.career_goal || '').toLowerCase().trim();
    if (!career) return null;
    var g = (profile.prefs && profile.prefs.gender) || 'n'; // f | m | n
    var L = lang();
    for (var i = 0; i < ROLES.length; i++) {
      for (var j = 0; j < ROLES[i].k.length; j++) {
        if (career.indexOf(ROLES[i].k[j]) !== -1) {
          var set = ROLES[i][L] || ROLES[i].es;
          return { word: set[g] || set.n, emoji: ROLES[i].emoji };
        }
      }
    }
    // carrera desconocida: rol genérico pero personal
    var genericES = { f: 'futura profesional', m: 'futuro profesional', n: 'futur@ profesional' };
    var genericCA = { f: 'futura professional', m: 'futur professional', n: 'futur@ professional' };
    var gen = (L === 'ca' ? genericCA : genericES);
    return { word: gen[g] || gen.n, emoji: '' };
  }

  /* ---- Saludo por franja horaria ----------------------------------------- */
  function franja(h) { return h < 6 ? 'madrugada' : h < 13 ? 'manana' : h < 20 ? 'tarde' : 'noche'; }
  var HELLO = {
    es: { madrugada:'Buenas noches', manana:'Buenos días', tarde:'Buenas tardes', noche:'Buenas noches' },
    ca: { madrugada:'Bona nit',      manana:'Bon dia',     tarde:'Bona tarda',    noche:'Bona nit' }
  };

  /* Nombre a usar: primero el del perfil recibido (onboarding en curso), luego el guardado */
  function nameOf(profile) {
    if (profile && (profile.nickname || profile.first_name)) return (profile.nickname || profile.first_name).trim();
    if (window.BPProfile) return BPProfile.displayName(profile && profile._username || '');
    return '';
  }

  /* Línea de saludo: "Buenos días, Carla" */
  function greeting(profile, now) {
    var L = lang();
    var name = nameOf(profile);
    var f = franja((now || nowSafe()).getHours());
    var base = HELLO[L][f] || HELLO.es[f];
    return name ? (base + ', ' + name + '') : (base + '');
  }

  /* Línea de rol: "Futura enfermera" (o '') */
  function roleLine(profile) {
    var r = roleFor(profile);
    if (!r) return '';
    // Capitaliza la primera letra
    var w = r.word.charAt(0).toUpperCase() + r.word.slice(1);
    return w + ' ' + r.emoji;
  }

  /* ---- Mensaje contextual ------------------------------------------------- */
  /* ctx = { pct, streak, daysInactive, hoursWeek, nextExam, goalState } */
  function message(profile, ctx) {
    ctx = ctx || {};
    var L = lang();
    var name = nameOf(profile);
    var r = roleFor(profile);
    var role = r ? r.word : null;
    var career = profile.career_goal || '';
    var univ = profile.university_goal || '';
    var grade = profile.target_grade;
    var tone = profile.assistant_tone || 'motivador';

    // Elegir "situación" por prioridad
    var sit;
    if (ctx.daysInactive >= 3) sit = 'inactivo';
    else if (ctx.goalState === 'conseguido') sit = 'conseguido';
    else if (ctx.goalState === 'preparado' || ctx.goalState === 'cerca') sit = 'cerca';
    else if (ctx.streak >= 5) sit = 'racha';
    else if (ctx.hoursWeek >= 8) sit = 'esfuerzo';
    else sit = 'normal';

    var vars = {
      name: name || (L === 'ca' ? 'crack' : 'crack'),
      role: role || (L === 'ca' ? 'el teu objectiu' : 'tu objetivo'),
      career: career, univ: univ, grade: grade != null ? String(grade).replace('.', ',') : '',
      streak: ctx.streak || 0, days: ctx.daysInactive || 0, hours: ctx.hoursWeek || 0
    };

    var pool = (POOLS[sit] && POOLS[sit][tone]) || (POOLS[sit] && POOLS[sit].motivador) || POOLS.normal.motivador;
    var arr = pool[L] || pool.es;
    var text = rotate('msg_' + sit + '_' + tone, arr);
    return fill(text, vars);
  }

  function fill(t, v) {
    return t.replace(/\{(\w+)\}/g, function (_, k) { return v[k] != null ? v[k] : ''; });
  }

  /* Rotación: no repetir la última variante mostrada para esa clave. */
  function rotate(key, arr) {
    if (!arr || !arr.length) return '';
    if (arr.length === 1) return arr[0];
    var last = -1;
    try { var v = parseInt(localStorage.getItem('bpmsg_' + key), 10); if (!isNaN(v)) last = v; } catch (e) {}
    // avanza saltando el último mostrado
    var idx = (last + 1) % arr.length;
    if (isNaN(idx) || idx < 0) idx = 0;
    try { localStorage.setItem('bpmsg_' + key, String(idx)); } catch (e) {}
    return arr[idx];
  }

  function nowSafe() { try { return new Date(); } catch (e) { return { getHours: function () { return 9; } }; } }

  /* ---- Bancos de mensajes por situación y tono --------------------------- */
  /* {name} {role} {career} {univ} {grade} {streak} {days} {hours}           */
  var POOLS = {
    normal: {
      motivador: {
        es:['Hoy tienes una misión: seguir acercándote a {role}. ¡Vamos!','Cada hora de hoy te acerca a tu plaza. Tú puedes.','{name}, tu objetivo no espera. Da un paso más hoy.','Un paso más hacia {career}. Empieza por lo de hoy.'],
        ca:['Avui tens una missió: seguir acostant-te a {role}. Som-hi!','Cada hora d’avui t’acosta a la teva plaça. Tu pots.','{name}, el teu objectiu no espera. Fes un pas més avui.','Un pas més cap a {career}. Comença pel d’avui.']
      },
      exigente: {
        es:['Tu objetivo no se consigue solo. Hoy toca estudiar.','{career} no se regala. Ponte ya.','Sin excusas: hoy, tu tarea. Mañana, más cerca.'],
        ca:['El teu objectiu no s’aconsegueix sol. Avui toca estudiar.','{career} no es regala. Posa-t’hi ja.','Sense excuses: avui, la teva tasca. Demà, més a prop.']
      },
      tranquilo: {
        es:['Sin prisa. Vamos paso a paso hacia {career}.','Un poco cada día basta. Hoy, tu ritmo.','Respira y ponte con lo de hoy. Vas bien.'],
        ca:['Sense pressa. Anem pas a pas cap a {career}.','Una mica cada dia n’hi ha prou. Avui, el teu ritme.','Respira i posa’t amb el d’avui. Vas bé.']
      },
      amigo: {
        es:['Ey {name}, ¿le damos un poco hoy? Tu plaza te espera.','¿Qué tal? Un ratito de estudio y seguimos sumando.','Venga, que lo de {career} lo tienes. Hoy un poco más.'],
        ca:['Ei {name}, li fem una estona avui? La teva plaça t’espera.','Què tal? Una estoneta d’estudi i seguim sumant.','Va, que això de {career} ho tens. Avui una mica més.']
      },
      coach: {
        es:['Objetivo: {career}. Siguiente paso: hoy.','Mantén el rumbo. Constancia > intensidad.','Define hoy y ejecútalo. El resto viene solo.'],
        ca:['Objectiu: {career}. Següent pas: avui.','Mantén el rumb. Constància > intensitat.','Defineix l’avui i executa’l. La resta ve sola.']
      },
      minimalista: {
        es:['Hoy: un paso hacia {career}.','Tu turno.','A por lo de hoy.'],
        ca:['Avui: un pas cap a {career}.','El teu torn.','A pel d’avui.']
      }
    },
    racha: {
      motivador:{ es:['{streak} días seguidos. Estás construyendo el futuro que quieres.','¡Racha de {streak} días! Así se llega a {career}.'], ca:['{streak} dies seguits. Estàs construint el futur que vols.','Ratxa de {streak} dies! Així s’arriba a {career}.'] },
      exigente:{ es:['{streak} días. No la rompas ahora.','Llevas {streak} días. Demuéstrate que puedes seguir.'], ca:['{streak} dies. No la trenquis ara.','Portes {streak} dies. Demostra’t que pots seguir.'] },
      tranquilo:{ es:['{streak} días seguidos, sin agobios. Bonito ritmo.','Llevas {streak} días. Disfruta el proceso.'], ca:['{streak} dies seguits, sense angoixes. Bon ritme.','Portes {streak} dies. Gaudeix el procés.'] },
      amigo:{ es:['¡{streak} días ya! Qué máquina, {name}.','Racha de {streak}. Vamos a por otro, ¿no?'], ca:['{streak} dies ja! Quina màquina, {name}.','Ratxa de {streak}. Anem a per un altre, oi?'] },
      coach:{ es:['Racha {streak} días. Tendencia positiva, mantenla.','{streak} días de constancia. Ese es el patrón ganador.'], ca:['Ratxa {streak} dies. Tendència positiva, mantén-la.','{streak} dies de constància. Aquest és el patró guanyador.'] },
      minimalista:{ es:['{streak} días.','Racha: {streak}.'], ca:['{streak} dies.','Ratxa: {streak}.'] }
    },
    esfuerzo: {
      motivador:{ es:['Llevas {hours}h esta semana. Estás construyendo el futuro que quieres.','{hours}h de estudio. Tu plaza en {career} lo nota.'], ca:['Portes {hours}h aquesta setmana. Estàs construint el futur que vols.','{hours}h d’estudi. La teva plaça a {career} ho nota.'] },
      exigente:{ es:['{hours}h esta semana. Bien, pero no te relajes.','{hours}h. Ese es el nivel. Repítelo.'], ca:['{hours}h aquesta setmana. Bé, però no et relaxis.','{hours}h. Aquest és el nivell. Repeteix-lo.'] },
      tranquilo:{ es:['{hours}h esta semana. Buen trabajo, sin quemarte.','{hours}h. Vas sobrado/a, sigue a tu ritmo.'], ca:['{hours}h aquesta setmana. Bona feina, sense cremar-te.','{hours}h. Vas de sobres, segueix al teu ritme.'] },
      amigo:{ es:['¡{hours}h esta semana! Te lo estás currando, {name}.','{hours}h ya. Orgullo total.'], ca:['{hours}h aquesta setmana! T’ho estàs currant, {name}.','{hours}h ja. Orgull total.'] },
      coach:{ es:['{hours}h/semana. Buen volumen. Ahora, calidad.','{hours}h registradas. Rendimiento en alza.'], ca:['{hours}h/setmana. Bon volum. Ara, qualitat.','{hours}h registrades. Rendiment a l’alça.'] },
      minimalista:{ es:['{hours}h esta semana.','{hours}h. Sigue.'], ca:['{hours}h aquesta setmana.','{hours}h. Segueix.'] }
    },
    cerca: {
      motivador:{ es:['Estás más cerca que nunca de {career}. No aflojes ahora.','Ya casi. {univ} está a la vuelta. ¡A por todas!'], ca:['Estàs més a prop que mai de {career}. No afluixis ara.','Ja gairebé. {univ} és a tocar. A per totes!'] },
      exigente:{ es:['Estás cerca. Justo ahora es cuando NO se afloja.','A un paso de {career}. Remátalo.'], ca:['Estàs a prop. Just ara és quan NO s’afluixa.','A un pas de {career}. Remata-ho.'] },
      tranquilo:{ es:['Ya estás cerca de {career}. Mantén la calma y sigue.','Casi lo tienes. Paso a paso hasta el final.'], ca:['Ja estàs a prop de {career}. Mantén la calma i segueix.','Gairebé ho tens. Pas a pas fins al final.'] },
      amigo:{ es:['¡{name}, lo tienes ahí! {career} cada vez más cerca.','Uf, qué cerca. Un último empujón, ¿vale?'], ca:['{name}, ho tens aquí! {career} cada cop més a prop.','Uf, que a prop. Una última empenta, va?'] },
      coach:{ es:['Fase final. Consolida y no cambies lo que funciona.','Cerca del objetivo. Ajusta detalles, mantén la base.'], ca:['Fase final. Consolida i no canviïs el que funciona.','A prop de l’objectiu. Ajusta detalls, mantén la base.'] },
      minimalista:{ es:['Casi. No aflojes.','{career} a un paso.'], ca:['Gairebé. No afluixis.','{career} a un pas.'] }
    },
    conseguido: {
      motivador:{ es:['¡Objetivo conseguido! Un paso menos hasta tu plaza.','Lo has clavado. {career}, aquí vas.'], ca:['Objectiu aconseguit! Un pas menys fins a la teva plaça.','Ho has clavat. {career}, aquí véns.'] },
      exigente:{ es:['Conseguido. Ahora el siguiente. Nunca te conformes.','Objetivo cumplido. Sube el listón.'], ca:['Aconseguit. Ara el següent. No et conformis mai.','Objectiu complert. Puja el llistó.'] },
      tranquilo:{ es:['Objetivo conseguido. Disfrútalo, te lo has ganado.','Lo lograste. Respira y celébralo.'], ca:['Objectiu aconseguit. Gaudeix-ho, t’ho has guanyat.','Ho vas aconseguir. Respira i celebra-ho.'] },
      amigo:{ es:['¡BRUTAL, {name}! Objetivo conseguido','Lo hiciste. Estoy orgulloso de ti.'], ca:['BRUTAL, {name}! Objectiu aconseguit','Ho vas fer. Estic orgullós de tu.'] },
      coach:{ es:['Meta alcanzada. Registremos el aprendizaje y a por la siguiente.','Objetivo cumplido. Nuevo reto en 3, 2, 1.'], ca:['Meta assolida. Registrem l’aprenentatge i a per la següent.','Objectiu complert. Nou repte en 3, 2, 1.'] },
      minimalista:{ es:['Conseguido.','Hecho. Siguiente.'], ca:['Aconseguit.','Fet. Següent.'] }
    },
    inactivo: {
      motivador:{ es:['Hace {days} días que no te vemos. Tu objetivo sigue esperándote. ¿Volvemos?','{name}, {career} sigue ahí. Retomamos hoy con algo pequeño.'], ca:['Fa {days} dies que no et veiem. El teu objectiu segueix esperant-te. Tornem?','{name}, {career} segueix aquí. Reprenem avui amb alguna cosa petita.'] },
      exigente:{ es:['{days} días fuera. El objetivo no se cumple solo. Vuelve.','Llevas {days} días parado/a. Hoy se retoma.'], ca:['{days} dies fora. L’objectiu no es compleix sol. Torna.','Portes {days} dies parat/da. Avui es reprèn.'] },
      tranquilo:{ es:['Volviste. Sin culpa por los {days} días. Empezamos suave.','Tranqui, retomamos poco a poco. {career} sigue ahí.'], ca:['Has tornat. Sense culpa pels {days} dies. Comencem suau.','Tranquil, reprenem a poc a poc. {career} segueix aquí.'] },
      amigo:{ es:['¡Cuánto tiempo, {name}! Te echábamos de menos. ¿Un ratito hoy?','Ey, {days} días sin verte. Volvemos con calma, ¿sí?'], ca:['Quant de temps, {name}! Et trobàvem a faltar. Una estoneta avui?','Ei, {days} dies sense veure’t. Tornem amb calma, sí?'] },
      coach:{ es:['Pausa de {days} días detectada. Reengancha con una sesión corta.','Retomar es lo importante. Empieza con 20 minutos hoy.'], ca:['Pausa de {days} dies detectada. Reenganxa amb una sessió curta.','Reprendre és el que importa. Comença amb 20 minuts avui.'] },
      minimalista:{ es:['{days} días fuera. Volvemos hoy.','Retomamos. 20 min.'], ca:['{days} dies fora. Tornem avui.','Reprenem. 20 min.'] }
    }
  };

  return { greeting: greeting, roleLine: roleLine, roleFor: roleFor, message: message };
})();
