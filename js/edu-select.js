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
          return '<div class="edu-opt" role="option" data-i="' + i + '"><span class="n">' + esc(it.name) + '</span></div>';
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

  return { enhance: enhance, UNIS: UNIS, CAREERS: CAREERS, searchUni: searchUni, searchCareer: searchCareer, matchUni: matchUni, matchCareer: matchCareer };
})();
