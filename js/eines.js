/* ============================================================================
   BioPAU — EINES — "Laboratori bioPau"  (app / SPA)
   Router per hash, home editorial personalitzada i totes les eines reals.
   Depèn de: BPEines (dades), BPShell, BPProfile, BPEdu (opcional). Degrada bé
   sense Supabase (usa la caché local del perfil i localStorage).
   ============================================================================ */
(function () {
  'use strict';
  var D = window.BPEines;
  if (!D) return;

  /* ---------- utils ------------------------------------------------------ */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var root;
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];}); }
  function lsGet(k, def){ try{ var v=localStorage.getItem(k); return v==null?def:JSON.parse(v);}catch(e){return def;} }
  function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
  function fmtNum(n, d){ if(n==null||isNaN(n)) return '—'; return Number(n).toLocaleString('ca-ES',{minimumFractionDigits:d||0,maximumFractionDigits:d||0}); }
  function prof(k){ try{ return window.BPProfile ? window.BPProfile.get(k) : null; }catch(e){ return null; } }
  function tone(){ var t=prof('assistant_tone'); return (D.PHRASES[t]?t:'motivador'); }
  function reduceMotion(){ try{ return window.matchMedia('(prefers-reduced-motion:reduce)').matches; }catch(e){ return false; } }
  function lightMode(){ return lsGet('biopau_eines_light', reduceMotion()); }

  /* ---------- icones (SVG propi, traç coherent) ------------------------- */
  var IC = {
    timer:'<circle cx="12" cy="13" r="8"/><path d="M12 13V9M9 2h6M18 6l1.5-1.5"/>',
    spark:'<path d="M12 3l1.6 4.8L18 9l-4.4 1.2L12 15l-1.6-4.8L6 9l4.4-1.2z"/><path d="M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    cards:'<rect x="3" y="7" width="13" height="14" rx="2"/><path d="M7 4h11a2 2 0 0 1 2 2v11"/>',
    book:'<path d="M4 5A2 2 0 0 1 6 3h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    calc:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    hourglass:'<path d="M6 3h12M6 21h12M7 3c0 5 10 6 10 9s-10 4-10 9M17 3c0 5-10 6-10 9s10 4 10 9"/>',
    chart:'<path d="M4 4v16h16"/><path d="M7 15l4-5 3 3 5-7"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    sigma:'<path d="M18 5H7l6 7-6 7h11"/>',
    pulse:'<path d="M3 12h4l2-6 4 12 2-6h6"/>',
    star:'<path d="M12 3.5l2.5 5.3 5.7.7-4.2 3.9 1.1 5.6L12 16.9 6.9 19l1.1-5.6L3.8 9.5l5.7-.7z"/>',
    play:'<path d="M8 5v14l11-7z"/>',
    pause:'<path d="M8 5v14M16 5v14"/>',
    reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    skip:'<path d="M5 5v14l9-7z"/><path d="M19 5v14"/>',
    stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
    expand:'<path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    back:'<path d="M15 6l-6 6 6 6"/>',
    arrow:'<path d="M9 6l6 6-6 6"/>',
    up:'<path d="M5 15l7-7 7 7"/>',
    down:'<path d="M5 9l7 7 7-7"/>',
    flat:'<path d="M4 12h16"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    check:'<path d="M5 12l4 4 10-10"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.6" r="1" fill="currentColor" stroke="none"/>',
    x:'<path d="M6 6l12 12M18 6L6 18"/>',
    vol:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
    edit:'<path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M13 5l4 4"/>',
    trash:'<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>'
  };
  function svg(name, cls){ return '<svg class="'+(cls||'e-ico')+'" viewBox="0 0 24 24" aria-hidden="true">'+(IC[name]||'')+'</svg>'; }

  /* ---------- favorits / recents ---------------------------------------- */
  function favs(){ return lsGet('biopau_eines_fav', []); }
  function toggleFav(id){ var f=favs(); var i=f.indexOf(id); if(i<0) f.unshift(id); else f.splice(i,1); lsSet('biopau_eines_fav', f); }
  function isFav(id){ return favs().indexOf(id)>=0; }
  function recents(){ return lsGet('biopau_eines_recent', []); }
  function pushRecent(id){ var r=recents().filter(function(x){return x!==id;}); r.unshift(id); lsSet('biopau_eines_recent', r.slice(0,6)); }

  /* ---------- sessions (estudi) ----------------------------------------- */
  function sessions(){ return lsGet('biopau_eines_sessions', []); }
  function logSession(mins, subject, method){
    var s=sessions(); s.push({ ts:Date.now(), mins:Math.round(mins), subject:subject||'', method:method||'' }); lsSet('biopau_eines_sessions', s);
  }
  function dayKey(ts){ var d=new Date(ts); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function sessionStats(){
    var s=sessions(), now=new Date(), today=dayKey(now.getTime());
    var minsToday=0, minsWeek=0, blocks=s.length, total=0;
    var weekAgo=now.getTime()-7*864e5;
    var days={};
    s.forEach(function(x){ total+=x.mins; if(dayKey(x.ts)===today) minsToday+=x.mins; if(x.ts>=weekAgo) minsWeek+=x.mins; days[dayKey(x.ts)]=(days[dayKey(x.ts)]||0)+x.mins; });
    // ratxa de dies consecutius amb sessió
    var streak=0; for(var i=0;i<400;i++){ var d=new Date(now.getTime()-i*864e5); if(days[dayKey(d.getTime())]) streak++; else if(i>0) break; else {} if(i===0 && !days[dayKey(d.getTime())]){} }
    // recompute streak correctly (stop at first gap after today/yesterday)
    streak=0; var cont=true; for(var j=0;j<400 && cont;j++){ var dd=new Date(now.getTime()-j*864e5); if(days[dayKey(dd.getTime())]) streak++; else { if(j===0) continue; cont=false; } }
    return { minsToday:minsToday, minsWeek:minsWeek, blocks:blocks, total:total, streak:streak, days:days };
  }

  /* ---------- salutació personalitzada ---------------------------------- */
  function greeting(){
    var h=new Date().getHours();
    return h<6?'Bona matinada':h<13?'Bon dia':h<20?'Bona tarda':'Bona nit';
  }
  function displayName(){ try{ return (window.BPProfile && window.BPProfile.displayName && window.BPProfile.displayName()) || ''; }catch(e){ return ''; } }
  function career(){ var c=prof('career_goal'); return c&&(''+c).trim()?(''+c).trim():''; }

  /* ---------- personalized phrase --------------------------------------- */
  function phrase(phase){
    var t=tone(), set=D.PHRASES[t]||D.PHRASES.motivador;
    var pool=(set[phase]||set.focus).slice();
    var c=career();
    if(c && set.career && Math.random()<0.4){ pool=set.career.map(function(p){return p.replace('{career}',c);}); }
    return pool[Math.floor(Math.random()*pool.length)];
  }

  /* ============================ ROUTER ================================== */
  function route(){ var hsh=(location.hash||'').replace(/^#\/?/,''); return hsh || 'home'; }
  function go(hash){ location.hash = hash; }
  function render(){
    stopTimerLoop(); stopAudio(); stopAmbients(); // netegem qualsevol loop actiu en canviar de vista
    document.body.classList.remove('e-immersive');
    var r=route();
    if(r==='home'){ renderHome(); return; }
    if(r.indexOf('t/')===0){ var id=r.slice(2); pushRecent(id); renderTool(id); return; }
    renderHome();
  }

  /* ============================ HOME =================================== */
  function toolCardHTML(t, feat){
    var soon = t.estat!=='live';
    var col = t.color||'#ADE80C';
    return '<button class="e-tool'+(feat?' e-tool--feat':'')+(soon?' soon':'')+' e-rise" style="--tc:'+col+'" data-open="'+t.id+'">' +
      '<span class="e-fav'+(isFav(t.id)?' on':'')+'" data-fav="'+t.id+'" role="button" aria-label="Preferida">'+svg('star','')+'</span>'+
      '<span class="e-tico">'+svg(t.icon,'')+'</span>'+
      '<span><span class="tt">'+esc(t.name)+(soon?' <span class="e-badge e-badge--soon">Aviat</span>':'')+'</span>'+
      '<span class="td">'+esc(t.desc)+'</span>'+
      (soon?'':'<span class="go">Obrir '+svg('arrow','e-ico e-ico--sm')+'</span>')+'</span>'+
    '</button>';
  }

  function recommended(){
    // recomanacions segons perfil: si té carrera de salut/ciència → tall + calc; sempre timer.
    var ids=['timer'];
    if(career()) { ids.push('calc'); ids.push('tall'); ids.push('objectiu'); }
    else { ids.push('calc'); ids.push('tall'); ids.push('countdown'); }
    // afegeix preferides al davant
    favs().forEach(function(f){ if(ids.indexOf(f)<0) ids.unshift(f); });
    var seen={}, out=[];
    ids.forEach(function(id){ if(!seen[id]){ seen[id]=1; var t=D.toolById(id); if(t) out.push(t); } });
    return out.slice(0,4);
  }

  function renderHome(){
    var name=displayName(), c=career();
    var sub = c ? ('Cap a la teva plaça de <b style="color:var(--lime)">'+esc(c)+'</b>. Calcula, planifica, estudia i entén les teves possibilitats.')
                : 'Calcula, planifica, estudia i entén les teves possibilitats.';
    var st=sessionStats();
    var featured=D.toolById('timer');

    var html='<div class="e-wrap">';
    // HERO
    html+='<section class="e-hero">'+
      '<div class="e-hero-l">'+
        '<span class="e-eyebrow"><b>Laboratori</b> — bioPau</span>'+
        '<h1 class="e-hello">'+esc(greeting())+(name?', <span class="u">'+esc(name)+'</span>':'')+'</h1>'+
        '<p class="e-hero-sub">'+sub+'</p>'+
        '<div class="e-hero-meta">'+
          '<span class="e-chip">'+svg('pulse','')+ st.streak+' '+(st.streak===1?'dia':'dies')+' de ratxa</span>'+
          '<span class="e-chip">'+svg('timer','')+ fmtNum(Math.round(st.minsWeek/60*10)/10,1)+' h aquesta setmana</span>'+
          (prof('exam_date')?'<span class="e-chip">'+svg('hourglass','')+ daysTo(prof('exam_date'))+' dies fins la PAU</span>':'')+
        '</div>'+
      '</div>'+
      '<button class="e-specimen e-rise" data-open="timer" aria-label="Obrir el temporitzador">'+
        '<canvas id="hero-cv"></canvas>'+
        '<div class="in"><span class="idx">EINA 01 — ESTUDI</span>'+
        '<h3>Temporitzador</h3><p>Concentra\'t amb un ambient científic i registra la sessió.</p></div>'+
        '<div class="in"><span class="e-btn e-btn--sm">'+svg('play','')+'Començar a estudiar</span></div>'+
      '</button>'+
    '</section>';

    // TOOLBAR (cercador)
    html+='<div class="e-toolbar">'+
      '<label class="e-search">'+svg('search','')+'<input id="e-q" type="search" placeholder="Cerca una eina (nota, temporitzador, notes de tall…)" aria-label="Cercar eina"></label>'+
    '</div>';

    html+='<div id="e-results"></div>';

    // Accés ràpid (compacte): preferides + recents fusionades i sense repetir
    var quick=[]; var seenQ={};
    favs().concat(recents()).forEach(function(id){ if(!seenQ[id]){ seenQ[id]=1; var t=D.toolById(id); if(t) quick.push(t); } });
    quick=quick.slice(0,6);
    if(quick.length){
      html+='<div class="e-quick">'+quick.map(function(t){ return '<button class="e-qchip" style="--tc:'+(t.color||'#ADE80C')+'" data-open="'+t.id+'"><span class="qd">'+svg(t.icon,'')+'</span>'+esc(t.name)+'</button>'; }).join('')+'</div>';
    }

    // Recomanades (destacades, amb color propi)
    html+='<section class="e-sec" id="sec-reco"><div class="e-sec-h"><span class="n">✦</span><h2>Recomanades per a tu</h2><span class="s">Segons el teu perfil'+(c?' i el teu objectiu de '+esc(c):'')+'.</span></div>'+
      '<div class="e-grid">'+recommended().map(function(t){return toolCardHTML(t,true);}).join('')+'</div></section>';

    // Categories (biblioteca organitzada) — número de secció amb color propi
    var catCol=['#ADE80C','#FBBF24','#22D3EE','#2DD4BF','#A78BFA'];
    D.CATS.forEach(function(cat, i){
      var tools=D.toolsByCat(cat.id); if(!tools.length) return;
      html+='<section class="e-sec"><div class="e-sec-h"><span class="n" style="color:'+catCol[i%catCol.length]+'">'+('0'+(i+1)).slice(-2)+'</span><h2>'+esc(cat.title)+'</h2><span class="s">'+esc(cat.sub)+'</span></div>'+
        '<div class="e-grid">'+tools.map(function(t){return toolCardHTML(t);}).join('')+'</div></section>';
    });

    html+='</div>';
    root.innerHTML=html;

    // hero canvas ambient
    var amb=lsGet('biopau_eines_timer',{}).ambient||'cell';
    var hero=new Ambient($('#hero-cv'), amb, 0.7); hero.start(); heroAmbient=hero;

    // wiring
    $('#e-q').addEventListener('input', onSearch);
    root.addEventListener('click', homeClicks);
  }
  var heroAmbient=null;

  function homeClicks(e){
    var fav=e.target.closest && e.target.closest('[data-fav]');
    if(fav){ e.stopPropagation(); e.preventDefault(); var id=fav.getAttribute('data-fav'); toggleFav(id); fav.classList.toggle('on', isFav(id)); return; }
    var open=e.target.closest && e.target.closest('[data-open]');
    if(open){ var t=D.toolById(open.getAttribute('data-open')); if(t && t.estat!=='live'){ toast('Aquesta eina està en desenvolupament.'); return; } go('/t/'+open.getAttribute('data-open')); }
  }
  function onSearch(e){
    var q=(e.target.value||'').toLowerCase().trim();
    var box=$('#e-results'); var secReco=$('#sec-reco');
    if(!q){ box.innerHTML=''; toggleSections(true); return; }
    toggleSections(false);
    var res=D.TOOLS.filter(function(t){ var hay=(t.name+' '+t.desc+' '+(t.tags||[]).join(' ')).toLowerCase(); return hay.indexOf(q)>=0; });
    box.innerHTML='<section class="e-sec"><div class="e-sec-h"><span class="n">'+svg('search','e-ico e-ico--sm')+'</span><h2>Resultats ('+res.length+')</h2></div>'+
      (res.length?'<div class="e-grid">'+res.map(toolCardHTML).join('')+'</div>':'<div class="e-empty">'+svg('search','')+'<div class="t">Cap eina trobada</div><div>Prova amb un altre terme.</div></div>')+'</section>';
  }
  function toggleSections(show){ root.querySelectorAll('.e-sec').forEach(function(s){ if(s.parentNode && s.parentNode.id==='e-results') return; s.style.display = show?'':'none'; }); }

  /* ============================ TOOL SHELL ============================= */
  function viewHeader(t, extra){
    return '<div class="e-view-h"><a class="e-back" href="#/home">'+svg('back','e-ico e-ico--sm')+'Eines</a>'+
      '<span class="e-tico">'+svg(t.icon,'')+'</span><h1>'+esc(t.name)+'</h1>'+(extra||'')+'</div>';
  }
  function renderTool(id){
    var t=D.toolById(id);
    if(!t){ go('/home'); return; }
    if(t.estat!=='live'){ root.innerHTML='<div class="e-wrap">'+viewHeader(t)+'<div class="e-panel e-empty">'+svg('info','')+'<div class="t">En desenvolupament</div><div>Aquesta eina arribarà aviat.</div></div></div>'; return; }
    var fn=VIEWS[id]; if(fn) fn(t); else go('/home');
  }

  /* ============================ TEMPORITZADOR ========================== */
  var Tstate=null, tTick=null, tPhraseTimer=null, ambient=null;
  function timerCfg(){ return lsGet('biopau_eines_timer', { method:'pomodoro', ambient:'cell', sound:'off', vol:0.4, subject:'' }); }
  function saveTimerCfg(p){ var c=timerCfg(); for(var k in p) c[k]=p[k]; lsSet('biopau_eines_timer', c); return c; }
  function methodById(id){ for(var i=0;i<D.METHODS.length;i++) if(D.METHODS[i].id===id) return D.METHODS[i]; return D.METHODS[0]; }

  function VIEW_timer(t){
    var cfg=timerCfg();
    var subjects=['Biologia','Química','Física','Matemàtiques','Català','Castellà','Anglès','Història','Filosofia','Altres'];
    var html='<div class="e-wrap">'+viewHeader(t,
      '<button class="e-btn e-btn--ghost e-btn--sm" id="imm" style="margin-left:auto">'+svg('expand','')+'Mode immersiu</button>');

    // presets ràpids
    html+='<div class="e-eyebrow" style="margin-bottom:8px">Comença ràpid</div><div class="e-presets" id="presets">'+
      D.PRESETS.map(function(p){ return '<button class="e-preset" data-preset="'+p.id+'"><span class="dot" style="background:'+p.hue+'"></span><span><span class="pn">'+esc(p.name)+'</span><br><span class="pm">'+p.focus+' / '+p.brk+' min</span></span></button>'; }).join('')+
      '</div>';

    // temporitzador principal
    html+='<div class="e-timer" id="timer" style="margin-top:18px">'+
      '<canvas id="t-cv"></canvas>'+
      '<button class="gran" id="t-gran" title="Ampliar (mode immersiu)" aria-label="Ampliar">'+svg('expand','')+'</button>'+
      '<div class="ring">'+
        '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="rgba(173,232,12,.12)" stroke-width="5"/>'+
        '<circle id="t-ring" cx="60" cy="60" r="54" fill="none" stroke="var(--lime)" stroke-width="5" stroke-linecap="round" stroke-dasharray="339.29" stroke-dashoffset="0"/></svg>'+
        '<div class="rt"><div class="phase" id="t-phase">Preparat</div><div class="time" id="t-time">25:00</div><div class="subj" id="t-subj"></div></div>'+
      '</div>'+
      '<div class="phrase" id="t-phrase">Tria un mètode i comença.</div>'+
      '<div class="ctrls">'+
        '<button class="e-cbtn" id="t-reset" title="Reiniciar">'+svg('reset','')+'</button>'+
        '<button class="e-cbtn e-cbtn--primary" id="t-play" title="Iniciar / pausar">'+svg('play','')+'</button>'+
        '<button class="e-cbtn" id="t-skip" title="Saltar fase">'+svg('skip','')+'</button>'+
        '<button class="e-cbtn" id="t-stop" title="Acabar sessió">'+svg('stop','')+'</button>'+
      '</div>'+
    '</div>';

    // config
    html+='<div class="e-panel" style="margin-top:16px"><div class="e-row2">'+
      '<div><div class="e-field"><label>Mètode</label><div class="e-seg" id="m-seg">'+
        D.METHODS.map(function(m){ return '<button data-m="'+m.id+'"'+(m.id===cfg.method?' class="on"':'')+'>'+esc(m.name)+'</button>'; }).join('')+'</div>'+
        '<div class="e-hint" id="m-desc"></div></div>'+
        '<div id="custom-wrap"></div>'+
      '</div>'+
      '<div><div class="e-field"><label>Matèria</label><select class="e-select" id="t-subject"><option value="">Sense especificar</option>'+
        subjects.map(function(s){ return '<option'+(s===cfg.subject?' selected':'')+'>'+esc(s)+'</option>'; }).join('')+'</select></div>'+
        '<div class="e-field"><label>So ambient</label><div style="display:flex;gap:10px;align-items:center">'+
          '<select class="e-select" id="t-sound">'+D.SOUNDS.map(function(s){return '<option value="'+s.id+'"'+(s.id===cfg.sound?' selected':'')+'>'+esc(s.name)+'</option>';}).join('')+'</select>'+
          '<input type="range" id="t-vol" min="0" max="1" step="0.05" value="'+cfg.vol+'" style="width:110px" aria-label="Volum">'+
        '</div></div>'+
      '</div>'+
    '</div></div>';

    // ambients
    html+='<div class="e-panel" style="margin-top:16px"><div class="e-field"><label>Ambient visual</label></div>'+
      '<div class="e-minis" id="ambs">'+D.AMBIENTS.map(function(a){ return '<button class="e-mini'+(a.id===cfg.ambient?' on':'')+'" data-amb="'+a.id+'" title="'+esc(a.hint)+'">'+ambThumb(a.id)+'<div class="mn">'+esc(a.name)+'</div></button>'; }).join('')+'</div>'+
      '<label style="display:inline-flex;gap:8px;align-items:center;margin-top:12px;color:var(--txt-soft);font-size:.85rem"><input type="checkbox" id="t-light"'+(lightMode()?' checked':'')+'> Mode visual lleuger (menys animació)</label>'+
    '</div>';

    html+='</div>';
    root.innerHTML=html;
    initTimer();
  }

  function ambThumb(id){
    // miniatura estàtica (SVG barat) per al selector
    var s='<svg class="ph" viewBox="0 0 100 58" preserveAspectRatio="none" style="height:58px">';
    var L='#ADE80C', T='#1BA98C';
    if(id==='cell') s+='<circle cx="50" cy="29" r="16" fill="none" stroke="'+L+'" stroke-width="1.5" opacity=".7"/><circle cx="50" cy="29" r="5" fill="'+L+'" opacity=".5"/><circle cx="38" cy="20" r="2" fill="'+T+'"/><circle cx="62" cy="38" r="2" fill="'+T+'"/>';
    else if(id==='blood') s+='<path d="M0 30q25-12 50 0t50 0" stroke="'+T+'" stroke-width="1" fill="none" opacity=".5"/><ellipse cx="30" cy="27" rx="6" ry="4" fill="#D6564B" opacity=".6"/><ellipse cx="60" cy="33" rx="6" ry="4" fill="#D6564B" opacity=".6"/>';
    else if(id==='neuron') s+='<path d="M10 40l20-12 25 6 30-18" stroke="'+L+'" stroke-width="1.2" fill="none" opacity=".5"/><circle cx="55" cy="34" r="3" fill="'+L+'"/>';
    else if(id==='dna') s+='<path d="M35 4q20 12 0 25t0 25M65 4q-20 12 0 25t0 25" stroke="'+L+'" stroke-width="1.2" fill="none" opacity=".6"/><path d="M38 14h24M38 29h24M38 44h24" stroke="'+T+'" stroke-width="1" opacity=".5"/>';
    else if(id==='micro') s+='<g fill="none" stroke="'+T+'" stroke-width="1.2" opacity=".6"><ellipse cx="30" cy="25" rx="8" ry="5"/><circle cx="62" cy="34" r="6"/><ellipse cx="48" cy="14" rx="5" ry="3"/></g>';
    else if(id==='mol') s+='<g stroke="'+L+'" stroke-width="1" opacity=".6"><circle cx="50" cy="29" r="4" fill="'+L+'"/><circle cx="30" cy="18" r="3" fill="none"/><circle cx="72" cy="36" r="3" fill="none"/><path d="M50 29L30 18M50 29l22 7"/></g>';
    else s+='<g fill="'+L+'" opacity=".5"><circle cx="24" cy="20" r="2"/><circle cx="54" cy="34" r="2"/><circle cx="74" cy="18" r="2"/></g><path d="M24 20l30 14 20-16" stroke="'+L+'" stroke-width=".8" fill="none" opacity=".3"/>';
    return s+'</svg>';
  }

  function initTimer(){
    var cfg=timerCfg();
    var m=methodById(cfg.method);
    Tstate={ method:m, phase:'idle', remaining:m.focus*60, totalPhase:m.focus*60, cycle:1, running:false, subject:cfg.subject, sessionFocusMins:0 };
    if(cfg.method==='custom'){ applyCustom(readCustom()); }
    // ambient
    ambient=new Ambient($('#t-cv'), cfg.ambient, 1.0); ambient.start();
    // sound
    setSound(cfg.sound, cfg.vol);
    // custom fields
    renderCustomFields();
    updateMethodDesc();
    paintTimer(); updatePhrase('focus');

    // wiring
    $('#t-play').onclick=togglePlay;
    $('#t-reset').onclick=function(){ resetTimer(); };
    $('#t-skip').onclick=function(){ nextPhase(true); };
    $('#t-stop').onclick=function(){ endSession(); };
    $('#imm').onclick=toggleImmersive;
    var gran=$('#t-gran'); if(gran) gran.onclick=toggleImmersive;
    $('#m-seg').addEventListener('click', function(e){ var b=e.target.closest('[data-m]'); if(!b) return; setMethod(b.getAttribute('data-m')); });
    $('#t-subject').onchange=function(){ Tstate.subject=this.value; saveTimerCfg({subject:this.value}); $('#t-subj').textContent=this.value||''; };
    $('#t-subj').textContent=cfg.subject||'';
    $('#t-sound').onchange=function(){ saveTimerCfg({sound:this.value}); setSound(this.value, +$('#t-vol').value); };
    $('#t-vol').oninput=function(){ saveTimerCfg({vol:+this.value}); setVol(+this.value); };
    $('#ambs').addEventListener('click', function(e){ var b=e.target.closest('[data-amb]'); if(!b) return; var id=b.getAttribute('data-amb'); saveTimerCfg({ambient:id}); root.querySelectorAll('#ambs .e-mini').forEach(function(x){x.classList.remove('on');}); b.classList.add('on'); ambient.setId(id); });
    $('#t-light').onchange=function(){ lsSet('biopau_eines_light', this.checked); if(ambient) ambient.setLight(this.checked); };
    // presets
    $('#presets').addEventListener('click', function(e){ var b=e.target.closest('[data-preset]'); if(!b) return; applyPreset(b.getAttribute('data-preset')); });
    // teclat: espai = play/pause
    tKey=function(e){ if(e.code==='Space' && route().indexOf('t/timer')===0){ if(document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return; e.preventDefault(); togglePlay(); } };
    document.addEventListener('keydown', tKey);
  }
  var tKey=null;

  function readCustom(){ return lsGet('biopau_eines_custom', { focus:30, brk:5, long:20, cycles:4 }); }
  function applyCustom(c){ var m=methodById('custom'); m.focus=+c.focus||30; m.brk=+c.brk||5; m.long=+c.long||20; m.cycles=+c.cycles||4; Tstate.method=m; if(Tstate.phase==='idle'){ Tstate.remaining=m.focus*60; Tstate.totalPhase=m.focus*60; } }
  function renderCustomFields(){
    var w=$('#custom-wrap'); if(!w) return;
    if(Tstate.method.id!=='custom'){ w.innerHTML=''; return; }
    var c=readCustom();
    w.innerHTML='<div class="e-row2" style="margin-top:6px">'+
      field('focus','Estudi (min)',c.focus)+field('brk','Descans curt (min)',c.brk)+
      field('long','Descans llarg (min)',c.long)+field('cycles','Cicles',c.cycles)+'</div>';
    w.querySelectorAll('input').forEach(function(inp){ inp.oninput=function(){ var cc=readCustom(); cc[this.getAttribute('data-c')]=clamp(+this.value||1,1,240); lsSet('biopau_eines_custom',cc); applyCustom(cc); if(!Tstate.running && Tstate.phase==='idle'){ paintTimer(); } }; });
    function field(k,l,v){ return '<div class="e-field"><label>'+l+'</label><input class="e-input" type="number" min="1" max="240" data-c="'+k+'" value="'+v+'"></div>'; }
  }
  function updateMethodDesc(){ var d=$('#m-desc'); if(d) d.textContent=Tstate.method.desc; }

  function setMethod(id){
    if(Tstate.running && !confirm('Canviar de mètode reiniciarà la sessió actual. Continuar?')) return;
    saveTimerCfg({method:id});
    root.querySelectorAll('#m-seg [data-m]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-m')===id); });
    Tstate.method=methodById(id); if(id==='custom') applyCustom(readCustom());
    resetTimer(); renderCustomFields(); updateMethodDesc();
  }
  function applyPreset(id){
    var p=null; for(var i=0;i<D.PRESETS.length;i++) if(D.PRESETS[i].id===id) p=D.PRESETS[i];
    if(!p) return;
    // desa com a custom i activa custom
    lsSet('biopau_eines_custom',{focus:p.focus,brk:p.brk,long:p.long,cycles:p.cycles});
    setMethod('custom');
    startPhase('focus'); if(!Tstate.running) togglePlay();
  }

  function startPhase(kind){
    Tstate.phase=kind;
    var m=Tstate.method;
    Tstate.totalPhase=(kind==='focus'?m.focus:kind==='long'?m.long:m.brk)*60;
    Tstate.remaining=Tstate.totalPhase;
    paintTimer(); updatePhrase(kind);
    if(ambient) ambient.setSpeed(kind==='focus'?1.0:1.5);
  }
  function setRunningUI(){ var box=$('#timer'); if(box) box.classList.toggle('is-running', !!Tstate.running); }
  function togglePlay(){
    if(Tstate.phase==='idle') startPhase('focus');
    Tstate.running=!Tstate.running;
    $('#t-play').innerHTML=svg(Tstate.running?'pause':'play','');
    setRunningUI();
    if(Tstate.running){ startTimerLoop(); if(currentSound && currentSound!=='off') ensureAudio(); }
    else stopTimerLoop();
  }
  function resetTimer(){
    stopTimerLoop(); Tstate.running=false; Tstate.cycle=1; Tstate.sessionFocusMins=0;
    Tstate.phase='idle'; Tstate.remaining=Tstate.method.focus*60; Tstate.totalPhase=Tstate.remaining;
    var pl=$('#t-play'); if(pl) pl.innerHTML=svg('play','');
    setRunningUI();
    paintTimer(); updatePhrase('focus');
  }
  function nextPhase(manual){
    if(Tstate.phase==='focus'){
      Tstate.sessionFocusMins += Tstate.method.focus;
      logSession(Tstate.method.focus, Tstate.subject, Tstate.method.id);
      // descans llarg cada N cicles
      if(Tstate.method.cycles>1 && Tstate.cycle % Tstate.method.cycles===0) startPhase('long');
      else startPhase('brk');
      Tstate.cycle++;
      if(!manual) chime();
    } else {
      startPhase('focus');
      if(!manual) chime();
    }
  }
  function tickSecond(){
    if(!Tstate.running) return;
    Tstate.remaining--;
    if(Tstate.remaining<=0){
      if(Tstate.phase==='focus'){ // sessió de focus acabada → resum si és el final d'un cicle llarg? mostrem petit resum sempre
        nextPhase(false);
      } else nextPhase(false);
    }
    paintTimer();
  }
  function paintTimer(){
    var mm=Math.floor(Tstate.remaining/60), ss=Tstate.remaining%60;
    var tEl=$('#t-time'); if(tEl) tEl.textContent=(mm<10?'0':'')+mm+':'+(ss<10?'0':'')+ss;
    var ph=$('#t-phase'); if(ph) ph.textContent = Tstate.phase==='idle'?'Preparat':Tstate.phase==='focus'?'Concentració':Tstate.phase==='long'?'Descans llarg':'Descans';
    var ring=$('#t-ring'); if(ring){ var C=2*Math.PI*54; var frac=Tstate.totalPhase?1-(Tstate.remaining/Tstate.totalPhase):0; ring.style.strokeDashoffset=(C*frac).toFixed(1); ring.setAttribute('stroke', Tstate.phase==='focus'?'var(--lime)':'#7CE0A3'); }
    // titol de pestanya
    if(Tstate.running) document.title=(mm<10?'0':'')+mm+':'+(ss<10?'0':'')+ss+' — Eines — bioPau';
  }
  function updatePhrase(kind){
    var el=$('#t-phrase'); if(!el) return;
    el.style.opacity=0;
    setTimeout(function(){ el.textContent=phrase(kind==='focus'?'focus':(kind==='brk'||kind==='long')?'brk':'focus'); el.style.opacity=1; }, 260);
  }
  function startTimerLoop(){
    stopTimerLoop();
    tTick=setInterval(tickSecond,1000);
    tPhraseTimer=setInterval(function(){ if(Tstate.running) updatePhrase(Tstate.phase); }, 14000);
  }
  function stopTimerLoop(){ if(tTick){ clearInterval(tTick); tTick=null; } if(tPhraseTimer){ clearInterval(tPhraseTimer); tPhraseTimer=null; } document.title='Eines — bioPau'; if(tKey){ document.removeEventListener('keydown',tKey); tKey=null; } }
  // El cicle del canvas viu independent del temporitzador: només es para en canviar de vista.
  function stopAmbients(){ if(ambient){ ambient.stop(); ambient=null; } if(heroAmbient){ heroAmbient.stop(); heroAmbient=null; } }

  function endSession(){
    if(Tstate.running || Tstate.sessionFocusMins>0 || Tstate.phase!=='idle'){
      if(Tstate.running && !confirm('Acabar la sessió actual?')) return;
    }
    stopTimerLoop(); stopAudio();
    var mins=Tstate.sessionFocusMins + (Tstate.phase==='focus'? Math.round((Tstate.totalPhase-Tstate.remaining)/60):0);
    if(mins<1){ resetTimer(); return; }
    var st=sessionStats();
    document.body.classList.remove('e-immersive');
    // overlay de resum
    var ov=document.createElement('div');
    ov.className='e-immersive-stage'; ov.style.display='flex'; ov.style.alignItems='center'; ov.style.justifyContent='center'; ov.style.padding='24px';
    ov.innerHTML='<div class="e-panel e-rise" style="max-width:440px;width:100%;text-align:center">'+
      '<div class="e-eyebrow" style="justify-content:center;display:flex">Sessió completada</div>'+
      '<div class="e-result" style="margin-top:10px"><div class="big">'+mins+"'</div><div class=\"lab\">minuts d'estudi</div></div>"+
      '<div class="e-stats" style="margin-top:16px"><div class="e-stat"><div class="k">Blocs</div><div class="v">'+Math.max(1,Math.round(mins/(Tstate.method.focus||25)))+'</div></div>'+
        '<div class="e-stat"><div class="k">Ratxa</div><div class="v lime">'+st.streak+' '+(st.streak===1?'dia':'dies')+'</div></div>'+
        '<div class="e-stat"><div class="k">XP</div><div class="v">+'+mins+'</div></div></div>'+
      (Tstate.subject?'<p style="color:var(--txt-soft);margin-top:12px">Matèria: <b>'+esc(Tstate.subject)+'</b></p>':'')+
      '<div class="e-field" style="margin-top:14px;text-align:left"><label>Què has estudiat? (opcional)</label><input class="e-input" id="s-note" placeholder="Ex: Genètica — problemes"></div>'+
      '<div style="display:flex;gap:10px;justify-content:center;margin-top:6px"><button class="e-btn" id="s-cont">'+svg('play','')+'Seguir estudiant</button><a class="e-btn e-btn--ghost" href="/app/">Tornar al panell</a></div>'+
    '</div>';
    document.body.appendChild(ov);
    ov.querySelector('#s-cont').onclick=function(){ var note=ov.querySelector('#s-note').value; if(note){ var s=sessions(); if(s.length){ s[s.length-1].note=note; lsSet('biopau_eines_sessions',s); } } document.body.removeChild(ov); resetTimer(); if(!ambient){ ambient=new Ambient($('#t-cv'), timerCfg().ambient,1.0); ambient.start(); } };
    chime(true);
  }

  function toggleImmersive(){
    var on=!document.body.classList.contains('e-immersive');
    document.body.classList.toggle('e-immersive', on);
    var b=$('#imm'); if(b) b.innerHTML=on?svg('x','')+'Sortir':svg('expand','')+'Mode immersiu';
    var timer=$('#timer');
    if(on){
      var stage=document.createElement('div'); stage.className='e-immersive-stage'; stage.id='imm-stage';
      var exit=document.createElement('button'); exit.className='e-btn e-btn--ghost e-exit-imm'; exit.innerHTML=svg('x','')+'Sortir'; exit.onclick=toggleImmersive;
      timer.style.minHeight='100vh'; timer.style.borderRadius='0'; timer.style.border='0';
      document.body.appendChild(stage); stage.appendChild(timer); stage.appendChild(exit);
    } else {
      var stage2=$('#imm-stage');
      if(stage2){ var tmr=$('#timer'); tmr.style.minHeight=''; tmr.style.borderRadius=''; tmr.style.border=''; // torna al seu lloc
        var anchor=$('#presets'); if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(tmr, anchor.nextSibling); document.body.removeChild(stage2); }
    }
    if(ambient) ambient.resize();
  }

  /* ------- so ambient (WebAudio, sense fitxers) ------------------------- */
  var actx=null, noiseNode=null, gainNode=null, filterNode=null, currentSound='off', currentVol=0.4, rainTimer=null;
  function ensureAudio(){
    if(actx) return;
    try{ actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
    var buf=actx.createBuffer(1, actx.sampleRate*2, actx.sampleRate);
    var data=buf.getChannelData(0);
    if(currentSound==='brown'){ var last=0; for(var i=0;i<data.length;i++){ var w=Math.random()*2-1; last=(last+0.02*w)/1.02; data[i]=last*3.2; } }
    else { for(var j=0;j<data.length;j++) data[j]=Math.random()*2-1; }
    noiseNode=actx.createBufferSource(); noiseNode.buffer=buf; noiseNode.loop=true;
    filterNode=actx.createBiquadFilter();
    if(currentSound==='rain'){ filterNode.type='bandpass'; filterNode.frequency.value=1200; filterNode.Q.value=0.5; }
    else if(currentSound==='lib'){ filterNode.type='lowpass'; filterNode.frequency.value=500; }
    else { filterNode.type='lowpass'; filterNode.frequency.value=8000; }
    gainNode=actx.createGain(); gainNode.gain.value=currentVol* (currentSound==='off'?0:0.5);
    noiseNode.connect(filterNode); filterNode.connect(gainNode); gainNode.connect(actx.destination);
    noiseNode.start(0);
  }
  function setSound(id, vol){ currentSound=id; currentVol=(vol==null?currentVol:vol); stopAudio(); if(id!=='off'){ ensureAudio(); } }
  function setVol(v){ currentVol=v; if(gainNode) gainNode.gain.value=v*(currentSound==='off'?0:0.5); }
  function stopAudio(){ try{ if(noiseNode){ noiseNode.stop(); noiseNode.disconnect(); } }catch(e){} noiseNode=null; if(actx){ try{ actx.close(); }catch(e){} actx=null; } gainNode=null; filterNode=null; if(rainTimer){ clearInterval(rainTimer); rainTimer=null; } }
  function chime(big){
    try{ var c=new (window.AudioContext||window.webkitAudioContext)(); var o=c.createOscillator(), g=c.createGain();
      o.type='sine'; o.frequency.value=big?523:392; g.gain.value=0.0001; o.connect(g); g.connect(c.destination); o.start();
      g.gain.exponentialRampToValueAtTime(0.12, c.currentTime+0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime+ (big?1.0:0.5));
      if(big){ setTimeout(function(){ o.frequency.value=659; },160); }
      o.stop(c.currentTime+(big?1.1:0.6)); setTimeout(function(){ try{c.close();}catch(e){} }, 1400);
    }catch(e){}
  }

  /* ============================ AMBIENT (canvas) ======================= */
  function Ambient(canvas, id, speed){
    this.cv=canvas; this.id=id; this.speed=speed||1; this.raf=null; this.t=0; this.parts=[]; this.light=lightMode();
    this.ctx=canvas?canvas.getContext('2d'):null; this.dpr=Math.min(window.devicePixelRatio||1,2);
  }
  Ambient.prototype.resize=function(){ if(!this.cv) return; var r=this.cv.getBoundingClientRect(); this.w=Math.max(1,r.width); this.h=Math.max(1,r.height); this.cv.width=this.w*this.dpr; this.cv.height=this.h*this.dpr; if(this.ctx){ this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);} this.init(); };
  Ambient.prototype.setId=function(id){ this.id=id; this.init(); };
  Ambient.prototype.setSpeed=function(s){ this.speed=s; };
  Ambient.prototype.setLight=function(l){ this.light=l; this.init(); };
  Ambient.prototype.init=function(){
    this.parts=[]; if(!this.w) return;
    var n = this.light?6:18, i;
    if(this.id==='blood'){ n=this.light?4:9; for(i=0;i<n;i++) this.parts.push({x:Math.random()*this.w, off:(Math.random()-0.5)*this.h*0.3, r:5+Math.random()*4, s:0.3+Math.random()*0.5}); }
    else if(this.id==='micro'){ n=this.light?7:16; for(i=0;i<n;i++) this.parts.push({x:Math.random()*this.w,y:Math.random()*this.h,a:Math.random()*6.28,r:5+Math.random()*7,s:0.2+Math.random()*0.4}); }
    else if(this.id==='mol'){ n=this.light?4:7; for(i=0;i<n;i++) this.parts.push({a:Math.random()*6.28,rad:20+Math.random()*(Math.min(this.w,this.h)/2-30),sp:(0.2+Math.random()*0.5)*(Math.random()<0.5?1:-1)}); }
    else if(this.id==='abstract'){ n=this.light?9:22; for(i=0;i<n;i++) this.parts.push({x:Math.random()*this.w,y:Math.random()*this.h,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3}); }
    else if(this.id==='cell'){ for(i=0;i<(this.light?4:7);i++) this.parts.push({a:Math.random()*6.28,rad:14+Math.random()*40,sp:(0.15+Math.random()*0.3)*(Math.random()<0.5?1:-1),r:2+Math.random()*3}); }
  };
  Ambient.prototype.start=function(){ if(!this.ctx) return; this.resize(); var self=this;
    this._rs=function(){ self.resize(); }; window.addEventListener('resize', this._rs);
    if(reduceMotion() && this.light){ this.frame(true); return; } // estàtic
    var loop=function(){ if(document.hidden){ self.raf=requestAnimationFrame(loop); return; } self.t+=0.016*self.speed; self.frame(); self.raf=requestAnimationFrame(loop); };
    this.raf=requestAnimationFrame(loop);
  };
  Ambient.prototype.stop=function(){ if(this.raf){ cancelAnimationFrame(this.raf); this.raf=null; } if(this._rs){ window.removeEventListener('resize', this._rs); this._rs=null; } };
  Ambient.prototype.frame=function(){
    var c=this.ctx,w=this.w,h=this.h,t=this.t; if(!c) return; c.clearRect(0,0,w,h);
    var L='rgba(173,232,12,', T='rgba(27,169,140,';
    var cx=w/2, cy=h/2, self=this;
    if(this.id==='dna'){
      c.lineWidth=2; var A=Math.min(30,h*0.14), midY=cy;
      for(var x=0;x<w;x+=6){ var p=x*0.03+t*0.8; var y1=midY+Math.sin(p)*A, y2=midY+Math.sin(p+Math.PI)*A;
        if(x%18===0){ c.strokeStyle=T+'0.28)'; c.beginPath(); c.moveTo(x,y1); c.lineTo(x,y2); c.stroke(); }
        c.fillStyle=L+'0.5)'; c.beginPath(); c.arc(x,y1,1.6,0,6.28); c.fill(); c.fillStyle=T+'0.45)'; c.beginPath(); c.arc(x,y2,1.6,0,6.28); c.fill(); }
      return;
    }
    if(this.id==='neuron'){
      var segs=[[0.08,0.8,0.35,0.5],[0.35,0.5,0.6,0.62],[0.6,0.62,0.82,0.28],[0.35,0.5,0.5,0.2],[0.6,0.62,0.7,0.85]];
      c.strokeStyle=L+'0.24)'; c.lineWidth=1.6;
      segs.forEach(function(s){ c.beginPath(); c.moveTo(s[0]*w,s[1]*h); c.lineTo(s[2]*w,s[3]*h); c.stroke(); });
      var prog=(t*0.12)%1, main=[[0.08,0.8],[0.35,0.5],[0.6,0.62],[0.82,0.28]];
      var seg=Math.floor(prog*(main.length-1)), f=(prog*(main.length-1))-seg; var a=main[seg],b=main[seg+1]||main[seg];
      var px=(a[0]+(b[0]-a[0])*f)*w, py=(a[1]+(b[1]-a[1])*f)*h;
      var g=c.createRadialGradient(px,py,0,px,py,16); g.addColorStop(0,L+'0.9)'); g.addColorStop(1,L+'0)'); c.fillStyle=g; c.beginPath(); c.arc(px,py,16,0,6.28); c.fill();
      return;
    }
    if(this.id==='blood'){
      c.strokeStyle=T+'0.20)'; c.lineWidth=Math.min(h*0.5,90); c.lineCap='round'; c.beginPath(); c.moveTo(-20,cy); c.bezierCurveTo(w*0.3,cy-h*0.12,w*0.7,cy+h*0.12,w+20,cy); c.stroke();
      this.parts.forEach(function(p){ p.x+=p.s*self.speed*1.4; if(p.x>w+20) p.x=-20; var yy=cy+Math.sin(p.x*0.008)* (h*0.1) + p.off;
        c.fillStyle='rgba(214,86,75,0.5)'; c.beginPath(); c.ellipse(p.x,yy,p.r,p.r*0.7,0,0,6.28); c.fill(); c.fillStyle='rgba(120,20,20,0.25)'; c.beginPath(); c.ellipse(p.x,yy,p.r*0.5,p.r*0.35,0,0,6.28); c.fill(); });
      return;
    }
    if(this.id==='micro'){
      this.parts.forEach(function(p){ p.a+=0.01; p.x+=Math.cos(p.a)*p.s*self.speed; p.y+=Math.sin(p.a*1.3)*p.s*self.speed;
        if(p.x<0)p.x=w; if(p.x>w)p.x=0; if(p.y<0)p.y=h; if(p.y>h)p.y=0;
        c.strokeStyle=T+'0.4)'; c.lineWidth=1.4; c.beginPath(); c.ellipse(p.x,p.y,p.r,p.r*0.65,p.a,0,6.28); c.stroke();
        c.fillStyle=L+'0.3)'; c.beginPath(); c.arc(p.x,p.y,1.6,0,6.28); c.fill(); });
      return;
    }
    if(this.id==='mol'){
      c.save(); c.translate(cx,cy);
      c.fillStyle=L+'0.6)'; c.beginPath(); c.arc(0,0,5,0,6.28); c.fill();
      this.parts.forEach(function(p){ p.a+=0.006*p.sp*self.speed*6; var x=Math.cos(p.a)*p.rad, y=Math.sin(p.a)*p.rad*0.7;
        c.strokeStyle=L+'0.20)'; c.lineWidth=1; c.beginPath(); c.moveTo(0,0); c.lineTo(x,y); c.stroke();
        c.fillStyle=T+'0.6)'; c.beginPath(); c.arc(x,y,3.2,0,6.28); c.fill(); });
      c.restore(); return;
    }
    if(this.id==='abstract'){
      var ps=this.parts;
      ps.forEach(function(p){ p.x+=p.vx*self.speed; p.y+=p.vy*self.speed; if(p.x<0||p.x>w)p.vx*=-1; if(p.y<0||p.y>h)p.vy*=-1; });
      for(var i=0;i<ps.length;i++){ for(var j=i+1;j<ps.length;j++){ var dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.sqrt(dx*dx+dy*dy); if(d<120){ c.strokeStyle=L+(0.12*(1-d/120)).toFixed(3)+')'; c.lineWidth=1; c.beginPath(); c.moveTo(ps[i].x,ps[i].y); c.lineTo(ps[j].x,ps[j].y); c.stroke(); } } }
      ps.forEach(function(p){ c.fillStyle=L+'0.5)'; c.beginPath(); c.arc(p.x,p.y,2,0,6.28); c.fill(); });
      return;
    }
    // 'cell' (default)
    var breathe=1+Math.sin(t*0.6)*0.02, R=Math.min(w,h)*0.32*breathe;
    c.strokeStyle=L+'0.5)'; c.lineWidth=2.2; c.beginPath(); c.arc(cx+Math.sin(t*0.3)*8, cy+Math.cos(t*0.25)*6, R,0,6.28); c.stroke();
    c.fillStyle=L+'0.10)'; c.beginPath(); c.arc(cx,cy,R,0,6.28); c.fill();
    c.fillStyle=T+'0.5)'; c.beginPath(); c.arc(cx,cy,R*0.28,0,6.28); c.fill();
    this.parts.forEach(function(p){ p.a+=0.004*p.sp*self.speed*6; var x=cx+Math.cos(p.a)*p.rad, y=cy+Math.sin(p.a)*p.rad; c.fillStyle=T+'0.5)'; c.beginPath(); c.arc(x,y,p.r,0,6.28); c.fill(); });
  };

  /* ============================ CALCULADORA ACCÉS ====================== */
  function VIEW_calc(t){
    var via=lsGet('biopau_eines_calc_via','batx');
    var html='<div class="e-wrap">'+viewHeader(t)+
      '<div class="e-panel"><div class="e-field"><label>Via d\'accés</label><div class="e-seg" id="via">'+
        '<button data-v="batx"'+(via==='batx'?' class="on"':'')+'>Batxillerat / PAU</button>'+
        '<button data-v="cfgs"'+(via==='cfgs'?' class="on"':'')+'>CFGS (Grau Superior)</button></div></div>'+
        '<div class="e-field"><label>Comunitat</label><select class="e-select" id="cca">'+D.FORMULES.comunitats.map(function(x){return '<option value="'+x.id+'"'+(x.actiu?'':' disabled')+'>'+esc(x.name)+(x.actiu?'':' (aviat)')+'</option>';}).join('')+'</select><div class="e-hint">Barem orientatiu de Catalunya. Els criteris poden variar segons l\'any i la universitat.</div></div>'+
        '<div id="calc-body"></div>'+
      '</div>'+
      '<div class="e-panel" id="calc-out" style="display:none"></div>'+
      '<p class="e-note">Càlcul <b>orientatiu</b>. La nota d\'accés és 60% de la mitjana + 40% de la fase general; l\'admissió suma les 2 millors matèries ponderades (nota ≥ 5 × coeficient 0,1 o 0,2), amb un màxim de 14. Comprova sempre els coeficients oficials de la teva universitat.</p>'+
    '</div>';
    root.innerHTML=html;
    $('#via').addEventListener('click', function(e){ var b=e.target.closest('[data-v]'); if(!b) return; via=b.getAttribute('data-v'); lsSet('biopau_eines_calc_via',via); root.querySelectorAll('#via [data-v]').forEach(function(x){x.classList.toggle('on',x.getAttribute('data-v')===via);}); calcBody(via); });
    calcBody(via);

    function calcBody(v){
      var body=$('#calc-body');
      var pond=lsGet('biopau_eines_pond', [{m:'Biologia',nota:'',coef:0.2},{m:'Química',nota:'',coef:0.2},{m:'',nota:'',coef:0.1}]);
      pond=pond.slice(0,3); while(pond.length<3) pond.push({m:'',nota:'',coef:0});
      var first = v==='batx'
        ? '<div class="e-row2"><div class="e-field"><label>Mitjana de Batxillerat (0–10)</label><input class="e-input" id="mb" type="number" step="0.001" min="0" max="10" placeholder="Ex: 8,70"></div>'+
          '<div class="e-field"><label>Nota fase general PAU (0–10)</label><input class="e-input" id="fg" type="number" step="0.001" min="0" max="10" placeholder="Ex: 8,95"></div></div>'
        : '<div class="e-field"><label>Nota mitjana del cicle (CFGS) (0–10)</label><input class="e-input" id="mb" type="number" step="0.001" min="0" max="10" placeholder="Ex: 8,40"></div>';
      var rows=pond.map(function(p,i){ return '<div class="e-row3" style="margin-bottom:8px"><div class="e-field" style="margin:0"><label>Matèria ponderable '+(i+1)+'</label><input class="e-input pm-m" data-i="'+i+'" value="'+esc(p.m)+'" placeholder="Ex: Biologia"></div>'+
        '<div class="e-field" style="margin:0"><label>Nota examen (0–10)</label><input class="e-input pm-n" type="number" step="0.001" min="0" max="10" data-i="'+i+'" value="'+esc(p.nota)+'"></div>'+
        '<div class="e-field" style="margin:0"><label>Coeficient</label><select class="e-select pm-c" data-i="'+i+'">'+D.FORMULES.coefs.map(function(cf){return '<option value="'+cf+'"'+(cf===p.coef?' selected':'')+'>'+ (cf===0?'—':('0,'+String(cf).split('.')[1])) +'</option>';}).join('')+'</select></div></div>'; }).join('');
      body.innerHTML=first+'<div class="e-eyebrow" style="margin:16px 0 8px">Fase específica (ponderacions) — fins a 2 conten</div>'+rows+
        '<div style="display:flex;gap:10px;margin-top:12px"><button class="e-btn" id="calc-go">'+svg('calc','')+'Calcular la meva nota</button></div>';
      $('#calc-go').onclick=function(){ doCalc(v); };
      body.addEventListener('input', function(){ // persist ponder
        var arr=[]; root.querySelectorAll('.pm-m').forEach(function(m,i){ arr.push({ m:m.value, nota:root.querySelectorAll('.pm-n')[i].value, coef:+root.querySelectorAll('.pm-c')[i].value }); }); lsSet('biopau_eines_pond',arr);
      });
    }
    function doCalc(v){
      var mb=parseFloat(($('#mb').value||'').replace(',','.'));
      var fg = v==='batx' ? parseFloat(($('#fg').value||'').replace(',','.')) : mb;
      if(isNaN(mb) || (v==='batx' && isNaN(fg))){ toast('Introdueix les notes que falten.'); return; }
      var access = v==='batx' ? D.FORMULES.accessBatx(mb,fg) : D.FORMULES.accessCfgs(mb);
      var pond=[]; root.querySelectorAll('.pm-n').forEach(function(n,i){ var nota=parseFloat((n.value||'').replace(',','.')); var coef=+root.querySelectorAll('.pm-c')[i].value; if(!isNaN(nota)&&coef>0) pond.push({nota:nota,coef:coef}); });
      var admissio=D.FORMULES.admissio(access, pond);
      var extra=admissio-access;
      var out=$('#calc-out'); out.style.display='';
      var target=prof('target_grade');
      out.innerHTML='<div class="e-result"><div class="big">'+fmtNum(admissio,3)+'</div><div class="lab">Nota d\'admissió (orientativa)</div></div>'+
        '<div class="e-break">'+
          '<div class="li"><span>Nota d\'accés '+(v==='batx'?'(60% mitjana + 40% PAU)':'(mitjana del cicle)')+'</span><span class="val">'+fmtNum(access,3)+'</span></div>'+
          '<div class="li"><span>Ponderacions (2 millors)</span><span class="val">+'+fmtNum(extra,3)+'</span></div>'+
          '<div class="li total"><span>Nota d\'admissió</span><span class="val">'+fmtNum(admissio,3)+' / 14</span></div>'+
        '</div>'+
        '<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><button class="e-btn e-btn--ghost e-btn--sm" id="save-nota">'+svg('check','')+'Desar com la meva nota</button>'+
          '<a class="e-btn e-btn--ghost e-btn--sm" href="#/t/tall">'+svg('chart','')+'Veure notes de tall</a>'+
          '<a class="e-btn e-btn--ghost e-btn--sm" href="#/t/objectiu">'+svg('target','')+'Nota objectiu</a></div>'+
        (target?gapBlock(admissio, target,'la teva nota objectiu'):'<div class="e-note" style="margin-top:14px">Encara no tens una nota objectiu. Ves a <b>Nota objectiu</b> per fixar-la i veure quant et falta.</div>');
      out.scrollIntoView({behavior:'smooth',block:'nearest'});
      $('#save-nota').onclick=function(){ if(window.BPProfile){ window.BPProfile.save({ cutoff_grade:null }); window.BPProfile.save({ target_grade: prof('target_grade')||null }); }
        lsSet('biopau_eines_mynota', Math.round(admissio*1000)/1000); if(window.BPProfile) window.BPProfile.save({ prefs: Object.assign({}, prof('prefs')||{}, { nota_estimada: Math.round(admissio*1000)/1000 }) }); toast('Nota desada al teu perfil.'); };
    }
  }
  function myNota(){ var n=lsGet('biopau_eines_mynota',null); if(n!=null) return n; var p=prof('prefs')||{}; return p.nota_estimada!=null?p.nota_estimada:null; }

  function gapBlock(mine, ref, refLabel){
    var diff=Math.round((ref-mine)*1000)/1000;
    var pct=clamp((mine/ (ref||14))*100, 4, 100);
    var up=diff<=0;
    return '<div class="e-gap"><div class="lab"><span>La teva nota: <b>'+fmtNum(mine,3)+'</b></span><span>'+esc(refLabel)+': <b>'+fmtNum(ref,3)+'</b></span></div>'+
      '<div class="track"><div class="fill" style="width:'+pct.toFixed(0)+'%"></div></div>'+
      '<div class="msg '+(up?'up':'down')+'">'+(up?('Estàs '+fmtNum(Math.abs(diff),3)+' punts per sobre'):('Et falten '+fmtNum(diff,3)+' punts'))+'</div></div>';
  }

  /* ============================ OBJECTIU =============================== */
  function VIEW_objectiu(t){
    var c=career(), uni=prof('university_goal'), target=prof('target_grade'), mine=myNota();
    var ref = (c&&uni)? D.NOTES_TALL.ultima(c,uni) : null;
    var html='<div class="e-wrap">'+viewHeader(t);
    html+='<div class="e-panel"><div class="e-eyebrow">El meu objectiu</div>';
    if(c||uni){ html+='<div class="e-row3" style="margin-top:10px">'+
      '<div class="e-stat"><div class="k">Carrera</div><div class="v" style="font-size:1.1rem">'+esc(c||'—')+'</div></div>'+
      '<div class="e-stat"><div class="k">Universitat</div><div class="v" style="font-size:1.1rem">'+esc(uni||'—')+'</div></div>'+
      '<div class="e-stat"><div class="k">Nota de referència (demo)</div><div class="v lime">'+(ref!=null?fmtNum(ref,3):'—')+'</div></div>'+
      '</div>'; }
    else html+='<p style="color:var(--txt-soft);margin-top:8px">Configura la teva carrera i universitat al teu <a style="color:var(--lime)" href="/cuenta.html">perfil</a> per veure aquí la teva referència.</p>';

    // fixar objectiu
    html+='<div class="e-row2" style="margin-top:16px">'+
      '<div class="e-field"><label>La meva nota (estimada)</label><input class="e-input" id="o-mine" type="number" step="0.001" min="0" max="14" value="'+(mine!=null?mine:'')+'" placeholder="Calcula-la a la Calculadora"></div>'+
      '<div class="e-field"><label>Nota objectiu</label><input class="e-input" id="o-target" type="number" step="0.001" min="0" max="14" value="'+(target!=null?target:(ref!=null?ref:''))+'" placeholder="Ex: 12,740"></div>'+
    '</div><button class="e-btn" id="o-go">'+svg('target','')+'Actualitzar</button>';
    html+='<div id="o-gap" style="margin-top:8px"></div>';
    html+='<div id="o-tips"></div>';
    html+='</div></div>';
    root.innerHTML=html;
    function refresh(){
      var m=parseFloat(($('#o-mine').value||'').replace(',','.')), tg=parseFloat(($('#o-target').value||'').replace(',','.'));
      if(!isNaN(m)) lsSet('biopau_eines_mynota',Math.round(m*1000)/1000);
      if(!isNaN(tg) && window.BPProfile) window.BPProfile.save({ target_grade: Math.round(tg*1000)/1000 });
      var gap=$('#o-gap'), tips=$('#o-tips');
      if(!isNaN(m)&&!isNaN(tg)){ gap.innerHTML=gapBlock(m,tg,'nota objectiu');
        var diff=tg-m;
        if(diff>0){ tips.innerHTML='<div class="e-eyebrow" style="margin:16px 0 8px">Què pots millorar</div><div class="e-grid">'+
          tipCard('Puja la mitjana','Cada dècima de la mitjana de batxillerat suma 0,06 a la nota d\'accés.')+
          tipCard('Millora una ponderable','Una matèria amb coef. 0,2 pot sumar fins a 2 punts a l\'admissió.')+
          tipCard('Prepara la fase específica','Tria les matèries que ponderen més per a la teva carrera.')+'</div>'; }
        else tips.innerHTML='<div class="e-note" style="margin-top:14px">Estàs per sobre de la teva nota objectiu. Mantén el ritme fins la PAU.</div>';
      } else { gap.innerHTML=''; tips.innerHTML=''; }
    }
    $('#o-go').onclick=refresh; refresh();
    function tipCard(t,d){ return '<div class="e-tool" style="cursor:default"><span class="e-tico">'+svg('spark','')+'</span><span><span class="tt">'+esc(t)+'</span><span class="td">'+esc(d)+'</span></span></div>'; }
  }

  /* ============================ NOTES DE TALL ========================= */
  var COLORS=['#ADE80C','#2F86C9','#7C5CD6','#D79A16','#1BA98C','#D6564B','#7CE0A3'];
  function VIEW_tall(t){
    var ambits=Object.keys(D.NOTES_TALL.ambit);
    var carreres=D.NOTES_TALL.carreres().sort();
    var sel=lsGet('biopau_eines_tall',{carrera:(career()||'Medicina'), off:[]});
    if(carreres.indexOf(sel.carrera)<0) sel.carrera=carreres[0];
    var html='<div class="e-wrap">'+viewHeader(t,'<span class="e-demo-badge" style="margin-left:auto">'+svg('info','e-ico e-ico--sm')+'Dades de demostració</span>')+
      '<div class="e-panel"><div class="e-row2">'+
        '<div class="e-field"><label>Àmbit</label><select class="e-select" id="ta-ambit"><option value="">Tots</option>'+ambits.map(function(a){return '<option>'+esc(a)+'</option>';}).join('')+'</select></div>'+
        '<div class="e-field"><label>Carrera</label><select class="e-select" id="ta-carrera"></select></div>'+
      '</div>'+
      '<div id="ta-chart"></div>'+
      '</div>'+
      '<div class="e-panel" id="ta-analysis" style="margin-top:16px"></div>'+
      '<p class="e-note" id="ta-src"></p>'+
    '</div>';
    root.innerHTML=html;
    fillCarreres('');
    $('#ta-ambit').onchange=function(){ fillCarreres(this.value); draw(); };
    $('#ta-carrera').onchange=function(){ sel.carrera=this.value; sel.off=[]; lsSet('biopau_eines_tall',sel); draw(); };
    draw();

    function fillCarreres(ambit){
      var list= ambit? (D.NOTES_TALL.ambit[ambit]||[]).filter(function(c){return carreres.indexOf(c)>=0;}) : carreres;
      if(list.indexOf(sel.carrera)<0 && list.length) sel.carrera=list[0];
      $('#ta-carrera').innerHTML=list.map(function(c){return '<option'+(c===sel.carrera?' selected':'')+'>'+esc(c)+'</option>';}).join('');
    }
    function draw(){
      var carrera=$('#ta-carrera').value||sel.carrera; sel.carrera=carrera; lsSet('biopau_eines_tall',sel);
      var unis=D.NOTES_TALL.unisDe(carrera);
      var series=unis.map(function(u,i){ return { name:carrera+' — '+u, uni:u, color:COLORS[i%COLORS.length], punts:D.NOTES_TALL.get(carrera,u).punts, off:sel.off.indexOf(u)>=0 }; });
      $('#ta-chart').innerHTML=chartHTML(series,'ta');
      wireChart('ta', series);
      // llegenda toggle universitats
      var leg=series.map(function(s){ return '<button class="e-leg'+(s.off?' off':'')+'" data-uni="'+esc(s.uni)+'"><span class="sw" style="background:'+s.color+'"></span>'+esc(s.uni)+'</button>'; }).join('');
      $('#ta-chart').insertAdjacentHTML('beforeend','<div class="e-legend">'+leg+'</div>');
      $('#ta-chart').querySelectorAll('[data-uni]').forEach(function(b){ b.onclick=function(){ var u=b.getAttribute('data-uni'); var i=sel.off.indexOf(u); if(i<0) sel.off.push(u); else sel.off.splice(i,1); lsSet('biopau_eines_tall',sel); draw(); }; });
      // anàlisi de la sèrie principal (primera visible)
      var vis=series.filter(function(s){return !s.off;});
      var main=vis[0]||series[0];
      $('#ta-analysis').innerHTML=analysisHTML(carrera, main);
      $('#ta-src').innerHTML='<b>Font:</b> '+esc(D.NOTES_TALL.meta.font)+' — <b>Actualització:</b> '+esc(D.NOTES_TALL.meta.actualitzat)+'. '+esc(D.NOTES_TALL.meta.aviso);
    }
  }
  function analysisHTML(carrera, s){
    if(!s) return '';
    var pts=s.punts, first=pts[0].nota, last=pts[pts.length-1].nota;
    var vals=pts.map(function(p){return p.nota;});
    var mean=vals.reduce(function(a,b){return a+b;},0)/vals.length;
    var max=Math.max.apply(null,vals), min=Math.min.apply(null,vals);
    var diff=Math.round((last-first)*1000)/1000;
    var trend = diff>0.15?'up':diff<-0.15?'down':'flat';
    var tLabel= trend==='up'?'Ascendent':trend==='down'?'Descendent':'Estable';
    var mine=myNota(), dist='';
    if(mine!=null){ dist='<div style="margin-top:14px">'+gapBlock(mine,last,'última nota de tall ('+esc(s.uni)+')')+'</div>'; }
    return '<div class="e-eyebrow">Anàlisi — '+esc(carrera)+' — '+esc(s.uni)+'</div>'+
      '<div style="display:flex;align-items:center;gap:14px;margin:10px 0"><span class="e-trend '+trend+'">'+svg(trend==='up'?'up':trend==='down'?'down':'flat','')+tLabel+'</span>'+
        '<span style="color:var(--txt-soft)">Variació '+pts[0].any+'→'+pts[pts.length-1].any+': <b style="color:var(--txt)">'+(diff>0?'+':'')+fmtNum(diff,3)+'</b></span></div>'+
      '<div class="e-stats"><div class="e-stat"><div class="k">Última</div><div class="v lime">'+fmtNum(last,3)+'</div></div>'+
        '<div class="e-stat"><div class="k">Mitjana</div><div class="v">'+fmtNum(mean,3)+'</div></div>'+
        '<div class="e-stat"><div class="k">Màxim</div><div class="v">'+fmtNum(max,3)+'</div></div>'+
        '<div class="e-stat"><div class="k">Mínim</div><div class="v">'+fmtNum(min,3)+'</div></div></div>'+ dist;
  }

  /* --- gràfic SVG propi + tooltip -------------------------------------- */
  function chartHTML(series, ns){
    var W=680,H=300,pad={l:44,r:16,t:18,b:34};
    var anys=series[0].punts.map(function(p){return p.any;});
    var all=[]; series.forEach(function(s){ if(!s.off) s.punts.forEach(function(p){all.push(p.nota);}); });
    if(!all.length){ series.forEach(function(s){ s.punts.forEach(function(p){all.push(p.nota);}); }); }
    var lo=Math.floor(Math.min.apply(null,all)-0.4), hi=Math.ceil(Math.max.apply(null,all)+0.4); if(hi-lo<2){hi=lo+2;}
    var x=function(i){ return pad.l + i*( (W-pad.l-pad.r)/(anys.length-1) ); };
    var y=function(v){ return pad.t + (1-(v-lo)/(hi-lo))*(H-pad.t-pad.b); };
    var g='<svg class="e-chart" viewBox="0 0 '+W+' '+H+'" id="'+ns+'-svg" role="img" aria-label="Evolució de notes de tall">';
    // grid + eix Y
    for(var v=lo; v<=hi; v++){ g+='<line class="grid" x1="'+pad.l+'" y1="'+y(v)+'" x2="'+(W-pad.r)+'" y2="'+y(v)+'"/><text class="lbl" x="'+(pad.l-8)+'" y="'+(y(v)+3)+'" text-anchor="end">'+v+'</text>'; }
    // eix X
    anys.forEach(function(a,i){ g+='<text class="lbl" x="'+x(i)+'" y="'+(H-12)+'" text-anchor="middle">'+a+'</text>'; });
    g+='<line class="axis" x1="'+pad.l+'" y1="'+(H-pad.b)+'" x2="'+(W-pad.r)+'" y2="'+(H-pad.b)+'"/>';
    // línies
    series.forEach(function(s){ if(s.off) return; var d=s.punts.map(function(p,i){ return (i?'L':'M')+x(i)+' '+y(p.nota); }).join(' ');
      g+='<path class="ln" d="'+d+'" stroke="'+s.color+'"/>';
      s.punts.forEach(function(p,i){ g+='<circle class="pt" cx="'+x(i)+'" cy="'+y(p.nota)+'" r="3.5" fill="'+s.color+'"/>'; }); });
    g+='<line class="cursor" id="'+ns+'-cur" x1="0" y1="'+pad.t+'" x2="0" y2="'+(H-pad.b)+'" style="opacity:0"/>';
    g+='</svg><div class="e-tip" id="'+ns+'-tip"></div>';
    return '<div class="e-chart-wrap" style="margin-top:14px">'+g+'</div>';
  }
  function wireChart(ns, series){
    var svgEl=$('#'+ns+'-svg'), tip=$('#'+ns+'-tip'), cur=$('#'+ns+'-cur'); if(!svgEl) return;
    var anys=series[0].punts.map(function(p){return p.any;});
    var W=680,pad={l:44,r:16};
    function xOf(i){ return pad.l + i*((W-pad.l-pad.r)/(anys.length-1)); }
    function handle(evt){
      var rect=svgEl.getBoundingClientRect(); var clientX=(evt.touches?evt.touches[0].clientX:evt.clientX);
      var rel=(clientX-rect.left)/rect.width*W;
      var i=Math.round((rel-pad.l)/((W-pad.l-pad.r)/(anys.length-1))); i=clamp(i,0,anys.length-1);
      cur.setAttribute('x1',xOf(i)); cur.setAttribute('x2',xOf(i)); cur.style.opacity=1;
      var vis=series.filter(function(s){return !s.off;});
      var rows=vis.map(function(s){ var p=s.punts[i]; var prev=s.punts[i-1]; var dv=prev?Math.round((p.nota-prev.nota)*1000)/1000:null;
        return '<div class="td" style="color:'+s.color+'">'+esc(s.uni)+': <b style="color:var(--txt)">'+fmtNum(p.nota,3)+'</b>'+(dv!=null?' <span style="color:var(--txt-dim)">('+(dv>0?'+':'')+fmtNum(dv,3)+')</span>':'')+'</div>'; }).join('');
      tip.innerHTML='<div class="ty">'+anys[i]+'</div>'+rows; tip.style.opacity=1;
      var px=(xOf(i)/W)*rect.width; tip.style.left=px+'px'; tip.style.top=(rect.height*0.12)+'px';
    }
    svgEl.addEventListener('mousemove',handle); svgEl.addEventListener('touchmove',function(e){handle(e);e.preventDefault();},{passive:false});
    svgEl.addEventListener('mouseleave',function(){ tip.style.opacity=0; cur.style.opacity=0; });
  }

  /* ============================ SIMULADOR ============================= */
  function VIEW_simulador(t){
    var mine=myNota();
    var html='<div class="e-wrap">'+viewHeader(t,'<span class="e-demo-badge" style="margin-left:auto">'+svg('info','e-ico e-ico--sm')+'Dades de demostració</span>')+
      '<div class="e-panel"><div class="e-field"><label>La teva nota d\'admissió</label><input class="e-input" id="sim-n" type="number" step="0.001" min="0" max="14" value="'+(mine!=null?mine:'')+'" placeholder="Ex: 12,140"></div>'+
      '<button class="e-btn" id="sim-go">'+svg('compass','')+'Veure les meves opcions</button></div>'+
      '<div id="sim-out"></div>'+
      '<p class="e-note">Orientatiu. Comparem amb l\'<b>última nota de tall (demo)</b> de cada carrera i universitat. Les notes de tall canvien cada any: «per sobre» no garanteix plaça.</p>'+
    '</div>';
    root.innerHTML=html;
    $('#sim-go').onclick=run; if(mine!=null) run();
    function run(){
      var n=parseFloat(($('#sim-n').value||'').replace(',','.')); if(isNaN(n)){ toast('Introdueix la teva nota.'); return; }
      lsSet('biopau_eines_mynota',Math.round(n*1000)/1000);
      var over=[], near=[], under=[];
      D.NOTES_TALL.series.forEach(function(s){ var last=s.punts[s.punts.length-1].nota; var d=Math.round((last-n)*1000)/1000; var item={carrera:s.carrera,uni:s.uni,last:last,d:d};
        if(n>=last) over.push(item); else if(last-n<=0.5) near.push(item); else under.push(item); });
      over.sort(function(a,b){return a.d-b.d;}); near.sort(function(a,b){return a.d-b.d;}); under.sort(function(a,b){return a.d-b.d;});
      function group(title,arr,cls,msg){ if(!arr.length) return ''; return '<section class="e-sec"><div class="e-sec-h"><span class="n">'+arr.length+'</span><h2>'+title+'</h2></div>'+
        '<div class="e-grid">'+arr.slice(0,40).map(function(x){ return '<div class="e-tool" style="cursor:default"><span class="e-tico">'+svg('chart','')+'</span><span><span class="tt">'+esc(x.carrera)+'</span><span class="td">'+esc(x.uni)+' — última (demo): <b>'+fmtNum(x.last,3)+'</b></span><span class="go '+cls+'" style="color:'+(cls==='up'?'#7CE0A3':cls==='down'?'#F0A0A0':'var(--txt-dim)')+'">'+msg.replace('{d}',fmtNum(Math.abs(x.d),3))+'</span></span></div>'; }).join('')+'</div></section>'; }
      $('#sim-out').innerHTML=
        group('La teva nota està per sobre',over,'up','+{d} sobre l\'última')+
        group('A prop del rang històric',near,'flat','a {d} de l\'última')+
        group('Per sobre de la teva nota',under,'down','et falten {d}');
    }
  }

  /* ============================ COMPTE ENRERE ========================= */
  function daysTo(dstr){ if(!dstr) return '—'; var d=new Date(dstr); if(isNaN(d)) return '—'; var ms=d.setHours(9,0,0,0)-Date.now(); return Math.max(0,Math.ceil(ms/864e5)); }
  function VIEW_countdown(t){
    var date=prof('exam_date')||lsGet('biopau_eines_exam','');
    var html='<div class="e-wrap">'+viewHeader(t)+
      '<div class="e-panel" style="text-align:center"><div class="ring" style="width:min(300px,72vw);height:min(300px,72vw);margin:0 auto;position:relative;display:flex;align-items:center;justify-content:center">'+
        '<svg viewBox="0 0 120 120" style="position:absolute;inset:0;transform:rotate(-90deg)"><circle cx="60" cy="60" r="54" fill="none" stroke="rgba(173,232,12,.12)" stroke-width="5"/><circle id="cd-ring" cx="60" cy="60" r="54" fill="none" stroke="var(--lime)" stroke-width="5" stroke-linecap="round" stroke-dasharray="339.29" stroke-dashoffset="339.29"/></svg>'+
        '<div style="position:relative"><div class="time" id="cd-n" style="font-family:var(--display);font-weight:800;font-size:3.2rem">—</div><div class="lab" style="font-family:var(--mono);color:var(--txt-dim);letter-spacing:.14em;text-transform:uppercase;font-size:.7rem">dies fins la PAU</div></div>'+
      '</div>'+
      '<div class="e-field" style="max-width:320px;margin:22px auto 0"><label>Data de l\'examen</label><input class="e-input" id="cd-date" type="date" value="'+esc(date?String(date).slice(0,10):'')+'"></div>'+
      '<button class="e-btn" id="cd-save" style="margin-top:6px">'+svg('check','')+'Desar data</button>'+
      '<div id="cd-msg" style="margin-top:14px;color:var(--txt-soft)"></div>'+
      '</div></div>';
    root.innerHTML=html;
    function paint(){ var dv=$('#cd-date').value; if(!dv){ $('#cd-n').textContent='—'; $('#cd-msg').textContent='Fixa la data del teu examen per veure el compte enrere.'; return; }
      var days=daysTo(dv); $('#cd-n').textContent=days;
      var start=lsGet('biopau_eines_examstart',null); var total = start? Math.max(1,Math.ceil((new Date(dv)-new Date(start))/864e5)) : Math.max(days,1);
      var frac=clamp(1-days/total,0,1); var C=2*Math.PI*54; $('#cd-ring').style.strokeDashoffset=(C*(1-frac)).toFixed(1);
      $('#cd-msg').innerHTML= days===0?'És avui. Molta sort.':'Queden <b style="color:var(--lime)">'+days+'</b> dies. '+(days<30?'Recta final: prioritza repàs i tests.':days<90?'Bon moment per consolidar temari i fer tests.':'Temps de sobra si mantens la constància.');
    }
    $('#cd-date').oninput=paint;
    $('#cd-save').onclick=function(){ var dv=$('#cd-date').value; if(!dv) return; lsSet('biopau_eines_exam',dv); if(!lsGet('biopau_eines_examstart',null)) lsSet('biopau_eines_examstart', new Date().toISOString().slice(0,10)); if(window.BPProfile) window.BPProfile.save({ exam_date:dv }); toast('Data desada.'); paint(); };
    paint();
  }

  /* ============================ MITJANA =============================== */
  function VIEW_mitjana(t){
    var rows=lsGet('biopau_eines_mitjana',[{m:'',n:'',c:''},{m:'',n:'',c:''},{m:'',n:'',c:''}]);
    var html='<div class="e-wrap">'+viewHeader(t)+
      '<div class="e-panel"><div id="mj-rows"></div><button class="e-btn e-btn--ghost e-btn--sm" id="mj-add">'+svg('plus','')+'Afegir assignatura</button>'+
      '<div class="e-row2" style="margin-top:18px"><div class="e-stat"><div class="k">Mitjana simple</div><div class="v" id="mj-s">—</div></div><div class="e-stat"><div class="k">Mitjana ponderada (crèdits)</div><div class="v lime" id="mj-w">—</div></div></div>'+
      '</div>'+
      '<div class="e-panel" style="margin-top:16px"><div class="e-eyebrow">Nota objectiu</div><p style="color:var(--txt-soft);margin:8px 0">Quina nota necessites en la resta d\'assignatures per assolir una mitjana concreta?</p>'+
        '<div class="e-row3"><div class="e-field"><label>Assignatures fetes</label><input class="e-input" id="ob-done" type="number" min="0" placeholder="Ex: 4"></div>'+
        '<div class="e-field"><label>Mitjana actual</label><input class="e-input" id="ob-avg" type="number" step="0.01" min="0" max="10" placeholder="Ex: 7,5"></div>'+
        '<div class="e-field"><label>Mitjana objectiu</label><input class="e-input" id="ob-tg" type="number" step="0.01" min="0" max="10" placeholder="Ex: 8"></div></div>'+
        '<div class="e-field"><label>Assignatures que queden</label><input class="e-input" id="ob-left" type="number" min="1" placeholder="Ex: 2"></div>'+
        '<button class="e-btn" id="ob-go">'+svg('target','')+'Calcular</button><div id="ob-out" style="margin-top:12px"></div></div>'+
    '</div>';
    root.innerHTML=html; renderRows();
    function renderRows(){ var w=$('#mj-rows'); w.innerHTML=rows.map(function(r,i){ return '<div class="e-row3" style="margin-bottom:8px"><div class="e-field" style="margin:0"><label>Assignatura</label><input class="e-input r-m" data-i="'+i+'" value="'+esc(r.m)+'"></div><div class="e-field" style="margin:0"><label>Nota (0–10)</label><input class="e-input r-n" type="number" step="0.01" min="0" max="10" data-i="'+i+'" value="'+esc(r.n)+'"></div><div class="e-field" style="margin:0"><label>Crèdits/pes</label><input class="e-input r-c" type="number" step="0.5" min="0" data-i="'+i+'" value="'+esc(r.c)+'"></div></div>'; }).join('');
      w.addEventListener('input', calc); calc(); }
    $('#mj-add').onclick=function(){ rows.push({m:'',n:'',c:''}); lsSet('biopau_eines_mitjana',rows); renderRows(); };
    function calc(){ var ns=[],ws=[],cs=[]; root.querySelectorAll('.r-n').forEach(function(n,i){ var nota=parseFloat((n.value||'').replace(',','.')); var cr=parseFloat((root.querySelectorAll('.r-c')[i].value||'').replace(',','.')); rows[i]={m:root.querySelectorAll('.r-m')[i].value,n:n.value,c:root.querySelectorAll('.r-c')[i].value}; if(!isNaN(nota)){ ns.push(nota); if(!isNaN(cr)&&cr>0){ ws.push(nota*cr); cs.push(cr);} } });
      lsSet('biopau_eines_mitjana',rows);
      $('#mj-s').textContent= ns.length? fmtNum(ns.reduce(function(a,b){return a+b;},0)/ns.length,2):'—';
      $('#mj-w').textContent= cs.length? fmtNum(ws.reduce(function(a,b){return a+b;},0)/cs.reduce(function(a,b){return a+b;},0),2):'—'; }
    $('#ob-go').onclick=function(){ var done=+$('#ob-done').value, avg=parseFloat(($('#ob-avg').value||'').replace(',','.')), tg=parseFloat(($('#ob-tg').value||'').replace(',','.')), left=+$('#ob-left').value;
      if(!done||isNaN(avg)||isNaN(tg)||!left){ toast('Omple tots els camps.'); return; }
      var need=((tg*(done+left))-(avg*done))/left; var out=$('#ob-out');
      if(need>10) out.innerHTML='<div class="e-note" style="border-color:rgba(240,160,160,.4)">Necessitaries un <b>'+fmtNum(need,2)+'</b> de mitjana en les que queden: no és assolible (>10). Replanteja l\'objectiu.</div>';
      else if(need<0) out.innerHTML='<div class="e-note">Ja tens l\'objectiu assolit sigui quina sigui la resta de notes.</div>';
      else out.innerHTML='<div class="e-result" style="padding:6px 0"><div class="big" style="font-size:2.4rem">'+fmtNum(need,2)+'</div><div class="lab">mitjana necessària en les '+left+' que queden</div></div>'; };
  }

  /* ============================ SESSIONS ============================== */
  function VIEW_sessions(t){
    var st=sessionStats();
    var days=[]; for(var i=6;i>=0;i--){ var d=new Date(Date.now()-i*864e5); days.push({ lab:['dg','dl','dt','dc','dj','dv','ds'][d.getDay()], mins:st.days[dayKey(d.getTime())]||0 }); }
    var max=Math.max(60, Math.max.apply(null,days.map(function(d){return d.mins;})));
    var html='<div class="e-wrap">'+viewHeader(t)+
      '<div class="e-panel"><div class="e-stats"><div class="e-stat"><div class="k">Avui</div><div class="v lime">'+st.minsToday+"'</div></div>"+
        '<div class="e-stat"><div class="k">Aquesta setmana</div><div class="v">'+fmtNum(Math.round(st.minsWeek/60*10)/10,1)+' h</div></div>'+
        '<div class="e-stat"><div class="k">Ratxa</div><div class="v">'+st.streak+' '+(st.streak===1?'dia':'dies')+'</div></div>'+
        '<div class="e-stat"><div class="k">Total blocs</div><div class="v">'+st.blocks+'</div></div></div>'+
      '<div class="e-eyebrow" style="margin:22px 0 10px">Últims 7 dies</div>'+
      '<div style="display:flex;align-items:flex-end;gap:10px;height:140px">'+days.map(function(d){ var hgt=Math.round(d.mins/max*120); return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;justify-content:flex-end"><div style="width:100%;max-width:34px;height:'+Math.max(3,hgt)+'px;background:linear-gradient(180deg,var(--lime),var(--lime-deep));border-radius:6px 6px 0 0" title="'+d.mins+' min"></div><span style="font-family:var(--mono);font-size:.66rem;color:var(--txt-dim)">'+d.lab+'</span></div>'; }).join('')+'</div>'+
      (st.blocks===0?'<div class="e-empty" style="margin-top:10px">'+svg('pulse','')+'<div class="t">Encara no has registrat sessions</div><div>Fes servir el <a style="color:var(--lime)" href="#/t/timer">temporitzador</a> i aquí veuràs la teva evolució.</div></div>':'')+
      '</div>'+
      '<p class="e-note">Les sessions es desen al teu dispositiu. Pròximament es podran sincronitzar amb el panell.</p>'+
    '</div>';
    root.innerHTML=html;
  }

  /* ============================ RECOMANA (sessió ideal) =============== */
  function VIEW_recomana(t){
    var chips=[25,45,60,90,120];
    var html='<div class="e-wrap">'+viewHeader(t)+
      '<div class="e-panel"><div class="e-field"><label>Quant temps tens?</label><div class="e-seg" id="rc-seg">'+chips.map(function(m,i){return '<button data-m="'+m+'"'+(i===1?' class="on"':'')+'>'+m+' min</button>';}).join('')+'</div></div>'+
      '<div id="rc-out"></div></div></div>';
    root.innerHTML=html;
    $('#rc-seg').addEventListener('click',function(e){ var b=e.target.closest('[data-m]'); if(!b) return; root.querySelectorAll('#rc-seg [data-m]').forEach(function(x){x.classList.toggle('on',x===b);}); plan(+b.getAttribute('data-m')); });
    plan(45);
    function plan(mins){
      var c=career(), exam=prof('exam_date'), dleft=exam?daysTo(exam):null;
      var blocks=[];
      if(mins<=25){ blocks=[['Estudi enfocat',mins]]; }
      else if(mins<=50){ blocks=[['Estudi',25],['Descans',5],['Mini-repàs',mins-30]]; }
      else if(mins<=70){ blocks=[['Estudi',25],['Descans',5],['Estudi',25],['Descans',5],['Repàs',mins-60]]; }
      else { var deep=Math.min(52,mins-30); blocks=[['Concentració',deep],['Descans',17],['Repàs actiu',mins-deep-17]]; }
      var intens = dleft!=null && dleft<14 ? 'Recta final: prioritza <b>tests i repàs actiu</b> sobre teoria nova.' : dleft!=null && dleft<45 ? 'Combina teoria i <b>tests</b> per fixar.' : 'Bon moment per <b>consolidar temari</b>.';
      var subj = c ? ('Enfoca-ho cap a matèries clau per a <b>'+esc(c)+'</b>.') : '';
      $('#rc-out').innerHTML='<div class="e-eyebrow" style="margin:16px 0 8px">La teva sessió ideal</div>'+
        '<div class="e-break">'+blocks.map(function(b){ return '<div class="li"><span>'+esc(b[0])+'</span><span class="val">'+b[1]+" min</span></div>"; }).join('')+'</div>'+
        '<p style="color:var(--txt-soft);margin-top:12px">'+intens+' '+subj+'</p>'+
        '<div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap"><a class="e-btn" href="#/t/timer">'+svg('play','')+'Començar al temporitzador</a>'+(dleft!=null?'<a class="e-btn e-btn--ghost" href="#/t/countdown">'+svg('hourglass','')+dleft+' dies fins la PAU</a>':'')+'</div>';
    }
  }

  /* ============================ MÈTODES =============================== */
  function VIEW_metodes(t){
    var html='<div class="e-wrap">'+viewHeader(t)+'<div class="e-grid">'+
      D.GUIA_METODES.map(function(m){ return '<div class="e-tool e-rise" style="--tc:'+(m.color||'#ADE80C')+';cursor:default;flex-direction:column;align-items:stretch"><div style="display:flex;gap:12px;align-items:center;position:relative;z-index:2"><span class="e-tico">'+svg(m.ico||'book','')+'</span><span class="tt">'+esc(m.name)+'</span></div>'+
        '<div style="position:relative;z-index:2"><div class="td" style="margin-top:10px"><b style="color:var(--txt)">Quan:</b> '+esc(m.when)+'</div><div class="td" style="margin-top:6px"><b style="color:var(--txt)">Com:</b> '+esc(m.how)+'</div></div></div>'; }).join('')+
      '</div><div style="margin-top:16px"><a class="e-btn" href="#/t/timer">'+svg('timer','')+'Aplicar-ho al temporitzador</a></div></div>';
    root.innerHTML=html;
  }

  /* ============================ FLASHCARDS ============================ */
  function decks(){ return lsGet('biopau_eines_decks', []); }
  function saveDecks(d){ lsSet('biopau_eines_decks', d); }
  function VIEW_flash(t){
    var ds=decks(), sel=lsGet('biopau_eines_deck_sel',null);
    var html='<div class="e-wrap">'+viewHeader(t);
    html+='<div class="e-panel"><div class="e-eyebrow">Els meus mazos</div><div class="e-grid" id="fc-decks" style="margin-top:10px"></div>'+
      '<div class="e-row2" style="margin-top:16px"><div class="e-field" style="margin:0"><label>Nou mazo</label><input class="e-input" id="fc-newname" placeholder="Ex: Immunologia — conceptes"></div><div style="display:flex;align-items:flex-end"><button class="e-btn" id="fc-new">'+svg('plus','')+'Crear mazo</button></div></div>'+
    '</div><div id="fc-body"></div></div>';
    root.innerHTML=html; renderDecks();
    $('#fc-new').onclick=function(){ var n=$('#fc-newname').value.trim(); if(!n) return; var d=decks(); d.push({id:'d'+Date.now(),name:n,cards:[]}); saveDecks(d); $('#fc-newname').value=''; renderDecks(); };
    function renderDecks(){ var d=decks(); var w=$('#fc-decks');
      w.innerHTML = d.length? d.map(function(k){ return '<button class="e-tool" data-deck="'+k.id+'"><span class="e-tico">'+svg('cards','')+'</span><span><span class="tt">'+esc(k.name)+'</span><span class="td">'+k.cards.length+' targetes</span><span class="go">Obrir '+svg('arrow','e-ico e-ico--sm')+'</span></span><span class="e-fav" data-del="'+k.id+'">'+svg('trash','')+'</span></button>'; }).join('') : '<div class="e-empty" style="grid-column:1/-1">'+svg('cards','')+'<div class="t">Encara no tens mazos</div><div>Crea el primer per començar a repassar.</div></div>';
      w.querySelectorAll('[data-deck]').forEach(function(b){ b.onclick=function(e){ if(e.target.closest('[data-del]')) return; openDeck(b.getAttribute('data-deck')); }; });
      w.querySelectorAll('[data-del]').forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); if(!confirm('Esborrar el mazo?')) return; saveDecks(decks().filter(function(x){return x.id!==b.getAttribute('data-del');})); renderDecks(); $('#fc-body').innerHTML=''; }; });
    }
    function openDeck(id){ var d=decks().filter(function(x){return x.id===id;})[0]; if(!d) return; lsSet('biopau_eines_deck_sel',id);
      var b=$('#fc-body');
      b.innerHTML='<div class="e-panel" style="margin-top:16px"><div class="e-view-h" style="margin:0 0 14px"><h1 style="font-size:1.2rem">'+esc(d.name)+'</h1><button class="e-btn e-btn--sm" id="fc-study" style="margin-left:auto"'+(d.cards.length?'':' disabled')+'>'+svg('play','')+'Estudiar ('+d.cards.length+')</button></div>'+
        '<div class="e-row2"><div class="e-field" style="margin:0"><label>Anvers (pregunta)</label><input class="e-input" id="fc-front"></div><div class="e-field" style="margin:0"><label>Revers (resposta)</label><input class="e-input" id="fc-back"></div></div>'+
        '<button class="e-btn e-btn--ghost e-btn--sm" id="fc-add" style="margin-top:10px">'+svg('plus','')+'Afegir targeta</button>'+
        '<div id="fc-list" style="margin-top:14px"></div></div>';
      renderCards();
      $('#fc-add').onclick=function(){ var f=$('#fc-front').value.trim(), bk=$('#fc-back').value.trim(); if(!f||!bk) return; var all=decks(); all.forEach(function(x){ if(x.id===id) x.cards.push({f:f,b:bk}); }); saveDecks(all); $('#fc-front').value='';$('#fc-back').value=''; d=decks().filter(function(x){return x.id===id;})[0]; renderCards(); renderDecks(); $('#fc-study').disabled=false; $('#fc-study').innerHTML=svg('play','')+'Estudiar ('+d.cards.length+')'; };
      $('#fc-study').onclick=function(){ if(d.cards.length) study(d); };
      function renderCards(){ var l=$('#fc-list'); l.innerHTML=d.cards.map(function(c,i){ return '<div class="li" style="display:flex;justify-content:space-between;gap:10px;border-bottom:1px dashed var(--line);padding:8px 0"><span><b>'+esc(c.f)+'</b> — <span style="color:var(--txt-soft)">'+esc(c.b)+'</span></span><button class="e-fav" data-ci="'+i+'">'+svg('trash','')+'</button></div>'; }).join('');
        l.querySelectorAll('[data-ci]').forEach(function(bt){ bt.onclick=function(){ var all=decks(); all.forEach(function(x){ if(x.id===id) x.cards.splice(+bt.getAttribute('data-ci'),1); }); saveDecks(all); d=decks().filter(function(x){return x.id===id;})[0]; renderCards(); renderDecks(); }; }); }
    }
    function study(d){
      var order=d.cards.map(function(_,i){return i;}); var again=[]; var idx=0; var flipped=false;
      var ov=document.createElement('div'); ov.className='e-immersive-stage'; ov.style.display='flex'; ov.style.flexDirection='column'; ov.style.alignItems='center'; ov.style.justifyContent='center'; ov.style.padding='24px';
      document.body.appendChild(ov); paint();
      function paint(){ if(idx>=order.length){ if(again.length){ order=again.slice(); again=[]; idx=0; } else { ov.innerHTML='<div class="e-panel e-rise" style="text-align:center;max-width:420px"><div class="e-result"><div class="big">'+svg('check','e-ico e-ico--lg')+'</div><div class="lab">Repàs complet</div></div><p style="color:var(--txt-soft);margin:10px 0">Has repassat totes les targetes de «'+esc(d.name)+'».</p><button class="e-btn" id="fc-close">Tancar</button></div>'; ov.querySelector('#fc-close').onclick=function(){document.body.removeChild(ov);}; return; } }
        var c=d.cards[order[idx]]; flipped=false;
        ov.innerHTML='<div style="width:100%;max-width:560px"><div class="e-eyebrow" style="text-align:center;margin-bottom:12px">'+(idx+1)+' / '+order.length+' — '+esc(d.name)+'</div>'+
          '<div class="e-fc"><div class="e-fc-card" id="fc-card"><div class="e-fc-face"><span class="tag">Pregunta</span>'+esc(c.f)+'</div><div class="e-fc-face back"><span class="tag">Resposta</span>'+esc(c.b)+'</div></div></div>'+
          '<div style="display:flex;gap:10px;justify-content:center;margin-top:18px"><button class="e-btn e-btn--ghost" id="fc-again">Repassar</button><button class="e-btn" id="fc-known">Ho sabia</button></div>'+
          '<div style="text-align:center;margin-top:12px"><button class="e-back" id="fc-x">'+svg('x','e-ico e-ico--sm')+'Sortir</button></div></div>';
        var card=ov.querySelector('#fc-card'); card.onclick=function(){ flipped=!flipped; card.classList.toggle('flip',flipped); };
        ov.querySelector('#fc-again').onclick=function(){ again.push(order[idx]); idx++; paint(); };
        ov.querySelector('#fc-known').onclick=function(){ idx++; paint(); };
        ov.querySelector('#fc-x').onclick=function(){ document.body.removeChild(ov); };
      }
    }
  }

  /* ---------- registre de vistes --------------------------------------- */
  var VIEWS={ timer:VIEW_timer, calc:VIEW_calc, objectiu:VIEW_objectiu, tall:VIEW_tall, simulador:VIEW_simulador,
    countdown:VIEW_countdown, mitjana:VIEW_mitjana, sessions:VIEW_sessions, recomana:VIEW_recomana, metodes:VIEW_metodes, flash:VIEW_flash };

  /* ---------- toast ----------------------------------------------------- */
  var toastEl=null, toastT=null;
  function toast(msg){ if(!toastEl){ toastEl=document.createElement('div'); toastEl.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2000;background:var(--surface-2);border:1px solid var(--line);color:var(--txt);padding:.7rem 1.1rem;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.4);font-size:.9rem;opacity:0;transition:opacity .2s'; document.body.appendChild(toastEl); }
    toastEl.textContent=msg; toastEl.style.opacity=1; clearTimeout(toastT); toastT=setTimeout(function(){ toastEl.style.opacity=0; },2200); }

  /* ---------- boot ------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    if (window.BPShell) window.BPShell.render({ crumb: 'Eines' });
    root = document.getElementById('eines-root');
    if (!root) return;
    var boot = function () {
      // topbar user
      try {
        if (window.BPData && window.BPData.load) {
          window.BPData.load().then(function(st){ if(window.BPShell) window.BPShell.setUser((prof('first_name')||displayName()||''), (st&&st.stats&&st.stats.avatar_id)||'cell', (st&&st.stats&&st.stats.streak_days)||sessionStats().streak); });
        }
      } catch(e){}
      render();
    };
    if (window.BPProfile && window.BPProfile.load) { window.BPProfile.load().then(boot, boot); }
    else boot();
    window.addEventListener('hashchange', render);
    document.addEventListener('visibilitychange', function(){ /* els loops ja comproven document.hidden */ });
  });

})();
