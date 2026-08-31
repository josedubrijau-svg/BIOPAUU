/* ============================================================================
   BioPAU — Hub de PERFIL (cuenta.html). Pestañas: Perfil — Objetivo ·
   Personalización — Cuenta. Rellena y guarda en BPProfile (autosave con toast).
   La pestaña "Cuenta" (email, plan, suscripción, usuario) la gestiona account.js.
   ============================================================================ */
(function () {
  function L() { return (window.BPI18n && window.BPI18n.get()) || 'es'; }
  function t(o) { return (o && (o[L()] != null ? o[L()] : o.es)) || ''; }
  function el(id) { return document.getElementById(id); }
  function qsa(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  var ACCENTS = [
    {id:'lime',color:'#ADE80C'},{id:'blue',color:'#38BDF8'},{id:'violet',color:'#A78BFA'},
    {id:'teal',color:'#2DD4BF'},{id:'coral',color:'#F87171'},{id:'amber',color:'#FBBF24'},{id:'green',color:'#4ADE80'}
  ];
  var TONES = [
    {id:'motivador',ico:'',name:{es:'Motivador',ca:'Motivador'}},
    {id:'exigente',ico:'',name:{es:'Exigente',ca:'Exigent'}},
    {id:'tranquilo',ico:'',name:{es:'Tranquilo',ca:'Tranquil'}},
    {id:'amigo',ico:'',name:{es:'Amigo',ca:'Amic'}},
    {id:'coach',ico:'',name:{es:'Coach',ca:'Coach'}},
    {id:'minimalista',ico:'',name:{es:'Minimalista',ca:'Minimalista'}}
  ];

  /* ---- Toast --------------------------------------------------------------*/
  var toastTimer = null;
  function toast(msg) {
    var el0 = el('bp-toast');
    if (!el0) { el0 = document.createElement('div'); el0.id = 'bp-toast'; el0.className = 'bp-toast'; document.body.appendChild(el0); }
    el0.textContent = msg; el0.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el0.classList.remove('is-on'); }, 1800);
  }

  /* ---- Guardado con rebote -----------------------------------------------*/
  var saveTimer = null, pending = {};
  function queueSave(patch) {
    for (var k in patch) pending[k] = patch[k];
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async function () {
      var p = pending; pending = {};
      if (window.BPProfile) await window.BPProfile.save(p);
      toast(t({ es: 'Guardado ✓', ca: 'Desat ✓' }));
      // refresca cabecera si cambió nombre/carrera/avatar
      paintHero();
    }, 500);
  }

  /* ---- Pestañas -----------------------------------------------------------*/
  function initTabs() {
    qsa('.pf-tab').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-tab');
        qsa('.pf-tab').forEach(function (o) { o.classList.toggle('is-active', o === b); });
        qsa('.pf-panel').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-panel') === id); });
        try { location.hash = id; } catch (e) {}
        window.scrollTo(0, 0);
      });
    });
    // abrir pestaña por hash
    var h = (location.hash || '').replace('#', '');
    if (h) { var b = document.querySelector('.pf-tab[data-tab="' + h + '"]'); if (b) b.click(); }
  }

  /* ---- Cabecera personal --------------------------------------------------*/
  function paintHero() {
    var d = window.BPProfile ? window.BPProfile.all() : {};
    var name = window.BPProfile ? window.BPProfile.displayName('') : '';
    var hn = el('pf-hero-name'); if (hn) hn.textContent = name || t({ es: 'tu espacio', ca: 'el teu espai' });
    var role = window.BPMessages ? window.BPMessages.roleLine(d) : '';
    var hr = el('pf-hero-role'); if (hr) { hr.textContent = role; hr.style.display = role ? '' : 'none'; }
    var av = el('pf-hero-avatar');
    if (av && window.BPShell) av.innerHTML = window.BPShell.avatarSVG(d.avatar_id || 'cell');
  }

  /* ---- Rellenar formularios ----------------------------------------------*/
  function fillForms() {
    var d = window.BPProfile ? window.BPProfile.all() : {};
    qsa('[data-field]').forEach(function (inp) {
      var f = inp.getAttribute('data-field'); var v = d[f];
      if (v === null || v === undefined) v = '';
      if (inp.type === 'range') { inp.value = v || inp.value; }
      else inp.value = v;
    });
    // género (chips)
    setChips('gender', (d.prefs && d.prefs.gender) || 'n');
    // tono
    setOpts('tone', d.assistant_tone || 'motivador');
    // acento
    setAccent(d.accent_color || 'lime');
    // avatar
    setAvatarSel(d.avatar_id || 'cell');
    // nota (etiqueta)
    var gv = el('pf-grade-val'); if (gv) gv.textContent = fmtGrade(parseFloat(d.target_grade) || 12);
    // futuro
    paintFuturo();
  }

  function bindFields() {
    qsa('[data-field]').forEach(function (inp) {
      var ev = (inp.tagName === 'SELECT') ? 'change' : 'input';
      inp.addEventListener(ev, function () {
        var f = inp.getAttribute('data-field');
        var val = inp.value;
        if (inp.type === 'range') { val = parseFloat(inp.value); var gv = el('pf-grade-val'); if (gv) gv.textContent = fmtGrade(val); }
        var patch = {}; patch[f] = val; queueSave(patch);
        if (f === 'career_goal' || f === 'university_goal' || f === 'target_grade') paintFuturo();
      });
    });
  }

  /* género */
  function setChips(group, sel) {
    qsa('[data-chips="' + group + '"] .pf-chip').forEach(function (b) { b.classList.toggle('is-sel', b.getAttribute('data-v') === sel); });
  }
  function bindChips() {
    qsa('[data-chips="gender"] .pf-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        setChips('gender', b.getAttribute('data-v'));
        var d = window.BPProfile.all(); var prefs = d.prefs || {}; prefs.gender = b.getAttribute('data-v');
        queueSave({ prefs: prefs }); paintHero();
      });
    });
  }
  /* tono */
  function setOpts(group, sel) { qsa('[data-opts="' + group + '"] .pf-opt').forEach(function (b) { b.classList.toggle('is-sel', b.getAttribute('data-v') === sel); }); }
  function bindTone() {
    qsa('[data-opts="tone"] .pf-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        setOpts('tone', b.getAttribute('data-v'));
        queueSave({ assistant_tone: b.getAttribute('data-v') });
        updateTonePreview(b.getAttribute('data-v'));
      });
    });
  }
  function updateTonePreview(tone) {
    var box = el('pf-tone-preview'); if (!box || !window.BPMessages) return;
    var d = window.BPProfile.all(); var pr = {}; for (var k in d) pr[k] = d[k]; pr.assistant_tone = tone;
    box.textContent = window.BPMessages.message(pr, { pct: 40, streak: 6, goalState: 'progreso' });
  }
  /* acento */
  function setAccent(sel) { qsa('.pf-accent').forEach(function (b) { b.classList.toggle('is-sel', b.getAttribute('data-acc') === sel); }); }
  function bindAccent() {
    qsa('.pf-accent').forEach(function (b) { b.addEventListener('click', function () { setAccent(b.getAttribute('data-acc')); queueSave({ accent_color: b.getAttribute('data-acc') }); }); });
  }
  /* avatar */
  function setAvatarSel(sel) { qsa('.pf-av').forEach(function (b) { b.classList.toggle('is-sel', b.getAttribute('data-av') === sel); }); }
  function bindAvatars() {
    qsa('.pf-av').forEach(function (b) {
      b.addEventListener('click', function () {
        setAvatarSel(b.getAttribute('data-av'));
        queueSave({ avatar_id: b.getAttribute('data-av') });
        // guarda también en user_stats para el shell
        if (window.BPData && window.BPData.setAvatar) window.BPData.setAvatar(b.getAttribute('data-av'));
        paintHero();
      });
    });
  }

  /* ---- "Mi futuro" (resumen visual) --------------------------------------*/
  function paintFuturo() {
    var d = window.BPProfile ? window.BPProfile.all() : {};
    set('fut-career', d.career_goal, '');
    set('fut-univ', d.university_goal, '');
    set('fut-grade', d.target_grade != null && d.target_grade !== '' ? String(d.target_grade).replace('.', ',') : '', '');
    function set(id, v, ico) { var e = el(id); if (e) e.textContent = v || '—'; }
    var box = el('pf-futuro'); if (box) box.style.opacity = d.career_goal ? '1' : '.6';
  }

  function fmtGrade(g) { return (Math.round(g * 100) / 100).toFixed(2).replace('.', ','); }

  /* ---- Render de chips/opts/acentos/avatares (los pinta el HTML por JS) ---*/
  function renderControls() {
    // acentos
    var accBox = el('pf-accents');
    if (accBox) accBox.innerHTML = ACCENTS.map(function (c) { return '<button class="pf-accent" data-acc="' + c.id + '" style="background:' + c.color + '"></button>'; }).join('');
    // tonos
    var toneBox = el('pf-tones');
    if (toneBox) toneBox.innerHTML = TONES.map(function (x) { return '<button class="pf-opt" data-v="' + x.id + '"><span class="oo-ico">' + x.ico + '</span><span class="oo-t">' + t(x.name) + '</span></button>'; }).join('');
    // avatares
    var avBox = el('pf-avatars');
    if (avBox && window.BIOPAU_DATA) avBox.innerHTML = window.BIOPAU_DATA.AVATARES.map(function (a) {
      return '<div class="pf-av" data-av="' + a.id + '"><span class="avatar avatar--pick">' + (window.BPShell ? window.BPShell.avatarSVG(a.id) : '') + '</span><span class="n">' + a.nombre + '</span></div>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', async function () {
    // auth.js (guard) ya exige sesión
    try { if (window.BPProfile) await window.BPProfile.load(); } catch (e) {}
    renderControls();
    initTabs();
    fillForms();
    bindFields(); bindChips(); bindTone(); bindAccent(); bindAvatars();
    paintHero();
    updateTonePreview((window.BPProfile.all().assistant_tone) || 'motivador');
    document.addEventListener('bp:langchange', function () { renderControls(); fillForms(); bindTone(); bindAccent(); bindAvatars(); bindChips(); paintHero(); });
  });
})();
