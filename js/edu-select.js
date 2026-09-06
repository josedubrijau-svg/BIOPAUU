/* ============================================================================
   BioPAU — Selector inteligente de UNIVERSIDAD y CARRERA (con buscador + lema)
   ----------------------------------------------------------------------------
   Convierte cualquier <input data-edu="uni"> o <input data-edu="career"> en un
   buscador con autocompletado: al escribir "UAB" reconoce la universidad, la
   selecciona y muestra su lema/descriptor. Igual con las carreras.
   Escribe el valor canónico en el input y dispara 'input' para que la lógica
   existente (onboarding / perfil) lo recoja tal cual.
   Uso: incluir este archivo y llamar a BPEdu.enhance(root) tras pintar el form
   (o se auto-engancha en DOMContentLoaded).
   ============================================================================ */
window.BPEdu = (function () {
  'use strict';

  /* Universidades de Catalunya (nombre + acrónimo + lema/descriptor + ciudad) */
  var UNIS = [
    { acr: 'UB',   name: 'Universitat de Barcelona',            tag: 'Pública — Barcelona — des de 1450',            aliases: ['ub','barcelona','universitat de barcelona'] },
    { acr: 'UAB',  name: 'Universitat Autònoma de Barcelona',   tag: 'Pública — Bellaterra (Cerdanyola del Vallès)', aliases: ['uab','autonoma','autònoma','bellaterra'] },
    { acr: 'UPC',  name: 'Universitat Politècnica de Catalunya',tag: 'BarcelonaTech — enginyeria i tecnologia',       aliases: ['upc','politecnica','politècnica','barcelonatech'] },
    { acr: 'UPF',  name: 'Universitat Pompeu Fabra',            tag: 'Pública — Barcelona',                          aliases: ['upf','pompeu','pompeu fabra'] },
    { acr: 'URV',  name: 'Universitat Rovira i Virgili',        tag: 'Pública — Tarragona i Reus',                   aliases: ['urv','rovira','rovira i virgili','tarragona','reus'] },
    { acr: 'UdG',  name: 'Universitat de Girona',               tag: 'Pública — Girona',                             aliases: ['udg','girona'] },
    { acr: 'UdL',  name: 'Universitat de Lleida',               tag: 'Pública — Lleida',                             aliases: ['udl','lleida'] },
    { acr: 'UOC',  name: 'Universitat Oberta de Catalunya',     tag: 'La universitat en línia',                      aliases: ['uoc','oberta','online','en linia','en línia'] },
    { acr: 'URL',  name: 'Universitat Ramon Llull',             tag: 'Privada — ESADE, La Salle, Blanquerna',        aliases: ['url','ramon llull','esade','la salle','blanquerna'] },
    { acr: 'UVic', name: 'Universitat de Vic - UCC',            tag: 'Vic i Manresa',                                aliases: ['uvic','vic','ucc','manresa'] },
    { acr: 'UIC',  name: 'Universitat Internacional de Catalunya', tag: 'Privada — Barcelona',                       aliases: ['uic','internacional'] }
  ];

  /* Carreras habituales de la PAU (con alias ES/CA para reconocerlas) */
  var CAREERS = [
    { name: 'Infermeria',                     aliases: ['infermeria','enfermeria','nursing'] },
    { name: 'Medicina',                       aliases: ['medicina','medicine','metge','medic'] },
    { name: 'Psicologia',                     aliases: ['psicologia','psicología','psico'] },
    { name: 'Biologia',                       aliases: ['biologia','biología','biolog'] },
    { name: 'Biotecnologia',                  aliases: ['biotecnologia','biotecnología','biotec'] },
    { name: 'Bioquímica',                     aliases: ['bioquimica','bioquímica','biochem'] },
    { name: 'Ciències Biomèdiques',           aliases: ['biomediques','biomèdiques','biomedicas','biomedicina','biomedical'] },
    { name: 'Farmàcia',                       aliases: ['farmacia','farmàcia','pharmacy'] },
    { name: 'Veterinària',                    aliases: ['veterinaria','veterinària','vet'] },
    { name: 'Fisioteràpia',                   aliases: ['fisioterapia','fisioteràpia','fisio','physio'] },
    { name: 'Odontologia',                    aliases: ['odontologia','odontología','dentista','dental'] },
    { name: 'Nutrició Humana i Dietètica',    aliases: ['nutricio','nutrició','nutricion','dietetica','dietètica','nutrition'] },
    { name: 'Química',                        aliases: ['quimica','química','chemistry'] },
    { name: 'Ciències Ambientals',            aliases: ['ambientals','ambientales','medi ambient','environment'] },
    { name: 'Ciències del Mar',               aliases: ['ciencies del mar','ciències del mar','ciencias del mar','marine'] },
    { name: 'Logopèdia',                      aliases: ['logopedia','logopèdia'] },
    { name: 'Òptica i Optometria',            aliases: ['optica','òptica','optometria','optometry'] },
    { name: 'Podologia',                      aliases: ['podologia','podología'] },
    { name: 'Educació Infantil',              aliases: ['educacio infantil','educació infantil','educacion infantil','magisteri infantil'] },
    { name: 'Educació Primària',              aliases: ['educacio primaria','educació primària','educacion primaria','magisteri'] },
    { name: 'Ciències de l’Activitat Física i l’Esport (CAFE)', aliases: ['cafe','ciencies activitat fisica','inef','esport','deporte'] }
  ];

  function norm(s) { return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  /* ---------- Símbolos originales por carrera (SVG inline, sin emojis) ------ *
   * Cada carrera detecta su icono por palabra clave. Trazo monocromo que
   * hereda currentColor, estética coherente (line-icon 24x24).               */
  var CAREER_PATHS = [
    { k:['inferm','enferm','nursing'],          d:'<path d="M12 3l6 2.5v5C18 15 15.5 18 12 19c-3.5-1-6-4-6-8.5v-5z"/><path d="M12 8.5v5M9.5 11h5"/>' }, // infermeria: escut + creu
    { k:['medicin','medic','metge','médic'],    d:'<path d="M7 3v4a4 4 0 0 0 8 0V3"/><path d="M6 3h2M14 3h2"/><path d="M11 15a4 4 0 0 0 8 0v-2"/><path d="M11 11v4"/><circle cx="19" cy="12" r="1.6"/>' }, // medicina: fonendo
    { k:['psicolog','psico'],                   d:'<path d="M15 20a5 5 0 0 0 3-9 5 5 0 0 0-9.5-2.2A4 4 0 0 0 8 16"/><path d="M12 8v9M12 11l2.2-1.6M12 14l-2.2-1.6"/>' }, // psicologia: cap+ment
    { k:['biotec'],                             d:'<path d="M9 3v5l-4 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-4-9V3"/><path d="M8.5 3h7"/><path d="M10 13c0 1.5 4 2 4 4M14 13c0 1.5-4 2-4 4"/>' }, // biotecnologia: matràs+DNA
    { k:['bioquim','bioquím'],                  d:'<path d="M8 5h8l4 7-4 7H8l-4-7z"/><circle cx="12" cy="12" r="3"/>' }, // bioquímica: anell
    { k:['biomed','biomèd','biomèdi'],          d:'<path d="M8 3c0 4 8 5 8 9s-8 5-8 9M16 3c0 4-8 5-8 9s8 5 8 9"/><path d="M9.5 7.5h5M9.5 16.5h5"/>' }, // biomèdiques: DNA
    { k:['biolog','biòleg'],                    d:'<path d="M5 20c0-8 6-13 15-13 0 8-6 13-15 13z"/><path d="M5 20c3-6 7-9 12-11"/>' }, // biologia: fulla
    { k:['farmac','farmàc','pharmacy'],         d:'<path d="M5 11h14"/><path d="M6 11v2a6 6 0 0 0 12 0v-2"/><path d="M12 11V6"/><path d="M9.5 6l5-2.5"/>' }, // farmàcia: morter
    { k:['veterin','vet'],                      d:'<circle cx="7.5" cy="9.5" r="1.6"/><circle cx="12" cy="7.5" r="1.6"/><circle cx="16.5" cy="9.5" r="1.6"/><path d="M12 11c-3 0-5 2.2-5 4.6C7 18 9 19 12 19s5-1 5-3.4C17 13.2 15 11 12 11z"/>' }, // veterinària: petjada
    { k:['fisio','physio'],                     d:'<circle cx="9" cy="5" r="1.6"/><path d="M9 8l-2 5 3 1v5"/><path d="M10 14l4-1 3 3"/><path d="M7 13l-2 3"/>' }, // fisioteràpia: cos en moviment
    { k:['odontolog','dentista','dental'],      d:'<path d="M12 3c4 0 6 2.2 6 5.5 0 3.5-1.2 10.5-3 10.5-1.2 0-1.2-4-3-4s-1.8 4-3 4c-1.8 0-3-7-3-10.5C6 5.2 8 3 12 3z"/>' }, // odontologia: dent
    { k:['nutri','dietet','dietèt'],            d:'<path d="M12 8c-1.2-2.6-4-2.6-5.2-.6-1 1.8-.4 4.4 1 6.6 1 1.6 2.4 3 4.2 3s3.2-1.4 4.2-3c1.4-2.2 2-4.8 1-6.6-1.2-2-4-2-5.2.6z"/><path d="M12 8V5a2.4 2.4 0 0 1 2.4-2.4"/>' }, // nutrició: poma
    { k:['quimic','químic','chemistry'],        d:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/>' }, // química: erlenmeyer
    { k:['ambient','environment','medi ambient'],d:'<circle cx="12" cy="12" r="9"/><path d="M12 3c-4 4-4 14 0 18M12 3c4 4 4 14 0 18M3.5 9.5h17M3.5 14.5h17"/>' }, // ambientals: globus
    { k:['mar','marine'],                       d:'<path d="M3 11c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>' }, // mar: onades
    { k:['logoped'],                            d:'<path d="M4 12a8 8 0 0 1 16 0"/><path d="M8 12a4 4 0 0 1 8 0"/><path d="M11 12a1 1 0 0 1 2 0"/><path d="M4 12v3M20 12v3"/>' }, // logopèdia: ones de veu
    { k:['optic','òptic','optometr'],           d:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>' }, // òptica: ull
    { k:['podolog'],                            d:'<path d="M9 4c-1.2 3.4-1.8 7-1 10.5A3 3 0 0 0 13.8 15c.3-2 3-2.2 3.2-4.6"/><path d="M9 4c2-.8 3.6.4 3.6 3"/>' }, // podologia: peu
    { k:['educacio infantil','educació infantil','magisteri infantil'], d:'<rect x="4" y="6" width="6" height="6" rx="1"/><rect x="14" y="6" width="6" height="6" rx="1"/><rect x="9" y="14" width="6" height="6" rx="1"/>' }, // ed. infantil: blocs
    { k:['educacio','educació','educacion','magisteri','mestr'], d:'<path d="M2 9l10-4.5L22 9l-10 4.5z"/><path d="M6 11v5c0 1.2 2.7 3 6 3s6-1.8 6-3v-5"/>' }, // educació: birret
    { k:['cafe','esport','fisica','física','deporte','activitat'], d:'<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/>' } // CAFE: peses
  ];
  var DEFAULT_PATH = '<rect x="3.5" y="8" width="17" height="11" rx="1.6"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>'; // maletí (professió genèrica)
  function careerPath(name) {
    var q = norm(name);
    for (var i = 0; i < CAREER_PATHS.length; i++)
      for (var j = 0; j < CAREER_PATHS[i].k.length; j++)
        if (q.indexOf(norm(CAREER_PATHS[i].k[j])) !== -1) return CAREER_PATHS[i].d;
    return DEFAULT_PATH;
  }
  function careerIcon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + careerPath(name) + '</svg>';
  }

  function searchUni(q) {
    q = norm(q); if (!q) return UNIS.slice(0, 6);
    var starts = [], contains = [];
    UNIS.forEach(function (u) {
      var hay = [norm(u.acr), norm(u.name)].concat(u.aliases.map(norm));
      if (hay.some(function (h) { return h.indexOf(q) === 0; })) starts.push(u);
      else if (hay.some(function (h) { return h.indexOf(q) >= 0; })) contains.push(u);
    });
    return starts.concat(contains).slice(0, 6);
  }
  function searchCareer(q) {
    q = norm(q); if (!q) return CAREERS.slice(0, 6);
    var starts = [], contains = [];
    CAREERS.forEach(function (c) {
      var hay = [norm(c.name)].concat(c.aliases.map(norm));
      if (hay.some(function (h) { return h.indexOf(q) === 0; })) starts.push(c);
      else if (hay.some(function (h) { return h.indexOf(q) >= 0; })) contains.push(c);
    });
    return starts.concat(contains).slice(0, 6);
  }
  function matchUni(val) { var r = searchUni(val); var q = norm(val); return r.filter(function (u) { return norm(u.acr) === q || norm(u.name) === q || norm(u.acr + ' — ' + u.name) === q || u.aliases.map(norm).indexOf(q) >= 0; })[0] || (r.length === 1 ? r[0] : null); }
  function matchCareer(val) { var r = searchCareer(val); var q = norm(val); return r.filter(function (c) { return norm(c.name) === q || c.aliases.map(norm).indexOf(q) >= 0; })[0] || (r.length === 1 ? r[0] : null); }

  function uniLabel(u) { return u.acr + ' — ' + u.name; }

  /* ---------- Estilos (una vez), neutros para claro/oscuro -------------- */
  function injectCSS() {
    if (document.getElementById('bp-edu-css')) return;
    var css =
      '.edu-cb{position:relative}' +
      '.edu-sug{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:40;background:var(--surface,#fff);' +
        'border:1px solid var(--line,rgba(14,58,42,.2));border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.28);overflow:hidden;display:none}' +
      '.edu-cb.is-open .edu-sug{display:block}' +
      '.edu-opt{display:flex;flex-direction:column;gap:2px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--line,rgba(14,58,42,.10))}' +
      '.edu-opt:last-child{border-bottom:0}' +
      '.edu-opt.is-active,.edu-opt:hover{background:rgba(173,232,12,.14)}' +
      '.edu-opt--career{flex-direction:row;align-items:center;gap:11px}' +
      '.edu-ic{flex:0 0 30px;width:30px;height:30px;display:grid;place-items:center;border-radius:9px;background:rgba(173,232,12,.12);border:1px solid var(--line,rgba(14,58,42,.14));color:var(--lime-d,#7CA80A)}' +
      '.edu-ic svg{width:18px;height:18px}' +
      '.edu-opt .n{font-family:var(--display,inherit);font-weight:700;font-size:.95rem;color:var(--txt,inherit)}' +
      '.edu-opt .t{font-family:var(--mono,monospace);font-size:.74rem;color:var(--txt-dim,#6b7c72)}' +
      '.edu-slogan{display:none;align-items:center;gap:8px;margin-top:8px;font-size:.86rem;color:var(--txt-soft,#3B4E44)}' +
      '.edu-slogan.is-on{display:flex}' +
      '.edu-slogan .b{font-family:var(--display,inherit);font-weight:700;color:var(--txt,inherit)}' +
      '.edu-slogan .dot{width:8px;height:8px;border-radius:50%;background:var(--lime,#ADE80C);flex:0 0 auto}';
    var st = document.createElement('style'); st.id = 'bp-edu-css'; st.textContent = css; document.head.appendChild(st);
  }

  /* ---------- Enhancer -------------------------------------------------- */
  function enhance(root) {
    injectCSS();
    (root || document).querySelectorAll('input[data-edu]').forEach(function (input) {
      if (input.dataset._edu === '1') return; input.dataset._edu = '1';
      var kind = input.getAttribute('data-edu'); // 'uni' | 'career'
      input.setAttribute('autocomplete', 'off'); input.setAttribute('role', 'combobox'); input.setAttribute('aria-expanded', 'false');
      var wrap = document.createElement('div'); wrap.className = 'edu-cb';
      input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
      var sug = document.createElement('div'); sug.className = 'edu-sug'; sug.setAttribute('role', 'listbox'); wrap.appendChild(sug);
      var slogan = document.createElement('div'); slogan.className = 'edu-slogan'; wrap.appendChild(slogan);
      var active = -1, items = [];

      function showSlogan(u) {
        if (kind === 'uni' && u) { slogan.className = 'edu-slogan is-on'; slogan.innerHTML = '<span class="dot"></span><span><span class="b">' + esc(u.acr) + '</span> — ' + esc(u.tag) + '</span>'; }
        else { slogan.className = 'edu-slogan'; slogan.innerHTML = ''; }
      }
      function render(list) {
        items = list; active = -1;
        sug.innerHTML = list.map(function (it, i) {
          if (kind === 'uni') return '<div class="edu-opt" role="option" data-i="' + i + '"><span class="n">' + esc(uniLabel(it)) + '</span><span class="t">' + esc(it.tag) + '</span></div>';
          return '<div class="edu-opt edu-opt--career" role="option" data-i="' + i + '"><span class="edu-ic">' + careerIcon(it.name) + '</span><span class="n">' + esc(it.name) + '</span></div>';
        }).join('');
        wrap.classList.toggle('is-open', list.length > 0);
        input.setAttribute('aria-expanded', list.length > 0 ? 'true' : 'false');
      }
      function pick(it) {
        var val = kind === 'uni' ? uniLabel(it) : it.name;
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        wrap.classList.remove('is-open'); input.setAttribute('aria-expanded', 'false');
        if (kind === 'uni') showSlogan(it);
      }
      function open() { render(kind === 'uni' ? searchUni(input.value) : searchCareer(input.value)); }

      input.addEventListener('input', function () {
        render(kind === 'uni' ? searchUni(input.value) : searchCareer(input.value));
        var m = kind === 'uni' ? matchUni(input.value) : matchCareer(input.value);
        if (kind === 'uni') showSlogan(m);
      });
      input.addEventListener('focus', open);
      input.addEventListener('keydown', function (e) {
        if (!wrap.classList.contains('is-open')) { if (e.key === 'ArrowDown') { open(); } return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(items.length - 1, active + 1); paint(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); paint(); }
        else if (e.key === 'Enter') { if (active >= 0 && items[active]) { e.preventDefault(); pick(items[active]); } }
        else if (e.key === 'Escape') { wrap.classList.remove('is-open'); }
      });
      function paint() { sug.querySelectorAll('.edu-opt').forEach(function (o, i) { o.classList.toggle('is-active', i === active); }); }
      sug.addEventListener('mousedown', function (e) { var o = e.target.closest('[data-i]'); if (o) { e.preventDefault(); pick(items[+o.getAttribute('data-i')]); } });
      document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) wrap.classList.remove('is-open'); });

      // Estado inicial: si ya había un valor, intenta casarlo y mostrar lema
      if (input.value) { var m0 = kind === 'uni' ? matchUni(input.value) : matchCareer(input.value); if (kind === 'uni' && m0) { input.value = uniLabel(m0); showSlogan(m0); } }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { enhance(document); });
  else enhance(document);

  return { enhance: enhance, UNIS: UNIS, CAREERS: CAREERS, searchUni: searchUni, searchCareer: searchCareer, matchUni: matchUni, matchCareer: matchCareer, careerIcon: careerIcon, careerPath: careerPath };
})();
