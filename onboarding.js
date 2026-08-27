/* ============================================================================
   BioPAU — Onboarding (wizard). Guía al estudiante paso a paso para crear su
   espacio personal. Guarda en BPProfile (Supabase + caché) y redirige a /app/.
   Bilingüe (usa BPI18n.get()). Autónomo: no depende del diccionario global.
   ============================================================================ */
(function () {
  function L() { return (window.BPI18n && window.BPI18n.get()) || 'es'; }
  function t(o) { return (o && (o[L()] != null ? o[L()] : o.es)) || ''; }
  function el(id) { return document.getElementById(id); }

  // Respuestas acumuladas
  var a = {
    nickname:'', first_name:'', last_name:'', course:'', school:'',
    career_goal:'', university_goal:'', target_grade:12,
    main_motivation:'', assistant_tone:'motivador',
    accent_color:'lime', avatar_id:'cell', prefs:{ gender:'n' }
  };

  var ACCENTS = [
    {id:'lime',color:'#ADE80C'},{id:'blue',color:'#38BDF8'},{id:'violet',color:'#A78BFA'},
    {id:'teal',color:'#2DD4BF'},{id:'coral',color:'#F87171'},{id:'amber',color:'#FBBF24'},{id:'green',color:'#4ADE80'}
  ];
  var CAREERS = ['Infermeria','Medicina','Psicologia','Biologia','Biotecnologia','Farmàcia','Veterinària','Fisioteràpia','Odontologia','Nutrició'];
  var UNIS = ['UB','UAB','UPF','UPC','URV','UdG','UdL','URL','UOC','UVic'];
  var COURSES = { es:['1º Bachillerato','2º Bachillerato','Repitiendo','Otro'], ca:['1r Batxillerat','2n Batxillerat','Repetint','Altres'] };

  var TONES = [
    {id:'motivador', ico:'🔥', name:{es:'Motivador',es_:'',ca:'Motivador'}, desc:{es:'Mucho refuerzo positivo.',ca:'Molt reforç positiu.'}},
    {id:'exigente',  ico:'🎯', name:{es:'Exigente',ca:'Exigent'}, desc:{es:'Directo y sin excusas.',ca:'Directe i sense excuses.'}},
    {id:'tranquilo', ico:'🌿', name:{es:'Tranquilo',ca:'Tranquil'}, desc:{es:'Sin prisa, paso a paso.',ca:'Sense pressa, pas a pas.'}},
    {id:'amigo',     ico:'😊', name:{es:'Amigo',ca:'Amic'}, desc:{es:'Cercano y natural.',ca:'Proper i natural.'}},
    {id:'coach',     ico:'📈', name:{es:'Coach',ca:'Coach'}, desc:{es:'Orientado a rendimiento.',ca:'Orientat al rendiment.'}},
    {id:'minimalista',ico:'▪️',name:{es:'Minimalista',ca:'Minimalista'}, desc:{es:'Mensajes muy breves.',ca:'Missatges molt breus.'}}
  ];

  function tempProfile() {
    return { nickname:a.nickname, first_name:a.first_name, career_goal:a.career_goal,
             university_goal:a.university_goal, target_grade:a.target_grade,
             assistant_tone:a.assistant_tone, prefs:a.prefs, _username:a.nickname };
  }

  /* ---- Definición de pasos ---------------------------------------------- */
  var steps = [
    // 1 · Nombre + trato
    { render:function(){
        return head({es:'Empecemos por ti',ca:'Comencem per tu'},
                    {es:'¿Cómo quieres que te llamemos?',ca:'Com vols que et diguem?'},
                    {es:'Usaremos este nombre para hablarte por toda la plataforma.',ca:'Farem servir aquest nom per parlar-te per tota la plataforma.'}) +
          '<div class="ob-field"><input class="ob-input" id="f-nick" maxlength="24" placeholder="'+t({es:'p. ej. Carla',ca:'p. ex. Carla'})+'" value="'+esc(a.nickname)+'"></div>'+
          '<div class="ob-label">'+t({es:'¿Cómo prefieres que te tratemos?',ca:'Com prefereixes que et tractem?'})+'</div>'+
          chips('gender', [
            {v:'f',label:{es:'Femenino',ca:'Femení'}},{v:'m',label:{es:'Masculino',ca:'Masculí'}},{v:'n',label:{es:'Neutro',ca:'Neutre'}}
          ], a.prefs.gender);
      },
      wire:function(){
        el('f-nick').addEventListener('input',function(){a.nickname=this.value.trim();});
        wireChips('gender',function(v){a.prefs.gender=v;});
      }
    },
    // 2 · Qué estudias
    { render:function(){
        return head({es:'Tu momento',ca:'El teu moment'},
                    {es:'¿Qué estás estudiando ahora?',ca:'Què estàs estudiant ara?'},null)+
          chips('course', COURSES[L()].map(function(c){return {v:c,label:{es:c,ca:c}};}), a.course)+
          '<div class="ob-label">'+t({es:'Instituto / centro (opcional)',ca:'Institut / centre (opcional)'})+'</div>'+
          '<input class="ob-input" id="f-school" placeholder="'+t({es:'Nombre de tu centro',ca:'Nom del teu centre'})+'" value="'+esc(a.school)+'">';
      },
      wire:function(){
        wireChips('course',function(v){a.course=v;});
        el('f-school').addEventListener('input',function(){a.school=this.value.trim();});
      }
    },
    // 3 · Carrera
    { render:function(){
        return head({es:'Tu meta',ca:'La teva meta'},
                    {es:'¿A qué quieres llegar?',ca:'A què vols arribar?'},
                    {es:'La carrera que sueñas. A partir de aquí, bioPau se adapta a ella.',ca:'La carrera que somies. A partir d’aquí, bioPau s’hi adapta.'})+
          '<div class="ob-field"><input class="ob-input" id="f-career" placeholder="'+t({es:'Escríbela o elige abajo',ca:'Escriu-la o tria a sota'})+'" value="'+esc(a.career_goal)+'"></div>'+
          chipsFree('career', CAREERS, a.career_goal);
      },
      wire:function(){
        el('f-career').addEventListener('input',function(){a.career_goal=this.value.trim(); syncFreeChips('career',a.career_goal);});
        wireFreeChips('career',function(v){a.career_goal=v; el('f-career').value=v;});
      }
    },
    // 4 · Universidad
    { render:function(){
        return head({es:'Tu destino',ca:'La teva destinació'},
                    {es:'¿En qué universidad te gustaría entrar?',ca:'A quina universitat t’agradaria entrar?'},null)+
          '<div class="ob-field"><input class="ob-input" id="f-uni" placeholder="'+t({es:'Escríbela o elige abajo',ca:'Escriu-la o tria a sota'})+'" value="'+esc(a.university_goal)+'"></div>'+
          chipsFree('uni', UNIS, a.university_goal);
      },
      wire:function(){
        el('f-uni').addEventListener('input',function(){a.university_goal=this.value.trim(); syncFreeChips('uni',a.university_goal);});
        wireFreeChips('uni',function(v){a.university_goal=v; el('f-uni').value=v;});
      }
    },
    // 5 · Nota objetivo
    { render:function(){
        return head({es:'Tu número',ca:'El teu número'},
                    {es:'¿Qué nota quieres conseguir?',ca:'Quina nota vols aconseguir?'},
                    {es:'Tu nota de acceso objetivo. Podrás cambiarla cuando quieras.',ca:'La teva nota d’accés objectiu. La podràs canviar quan vulguis.'})+
          '<div class="ob-grade"><div class="gv" id="f-gradeval">'+fmtGrade(a.target_grade)+'</div>'+
          '<input type="range" id="f-grade" min="5" max="14" step="0.05" value="'+a.target_grade+'"></div>';
      },
      wire:function(){
        var r=el('f-grade'),v=el('f-gradeval');
        r.addEventListener('input',function(){a.target_grade=parseFloat(this.value); v.textContent=fmtGrade(a.target_grade);});
      }
    },
    // 6 · Motivación
    { render:function(){
        return head({es:'Tu porqué',ca:'El teu perquè'},
                    {es:'¿Qué te motiva?',ca:'Què et motiva?'},
                    {es:'En una frase. bioPau lo usará para recordártelo cuando lo necesites.',ca:'En una frase. bioPau ho farà servir per recordar-t’ho quan calgui.'})+
          '<div class="ob-field"><textarea class="ob-input" id="f-mot" maxlength="240" placeholder="'+t({es:'p. ej. Quiero ayudar a los demás como hizo mi madre.',ca:'p. ex. Vull ajudar els altres com va fer la meva mare.'})+'">'+esc(a.main_motivation)+'</textarea></div>';
      },
      wire:function(){ el('f-mot').addEventListener('input',function(){a.main_motivation=this.value.trim();}); }
    },
    // 7 · Tono del asistente (con vista previa)
    { render:function(){
        return head({es:'Tu compañía',ca:'La teva companyia'},
                    {es:'¿Cómo quieres que bioPau te acompañe?',ca:'Com vols que bioPau t’acompanyi?'},null)+
          '<div class="ob-opts" id="ob-tones">'+TONES.map(function(x){
            return '<button class="ob-opt'+(a.assistant_tone===x.id?' is-sel':'')+'" data-tone="'+x.id+'">'+
              '<span class="oo-ico">'+x.ico+'</span><div class="oo-t">'+t(x.name)+'</div><div class="oo-s">'+t(x.desc)+'</div></button>';
          }).join('')+'</div>'+
          '<div class="ob-preview" id="ob-preview"><span class="pv-ico">💬</span><div><span class="pv-t">'+t({es:'Así te hablará',ca:'Així et parlarà'})+'</span><span id="ob-preview-txt"></span></div></div>';
      },
      wire:function(){
        document.querySelectorAll('#ob-tones .ob-opt').forEach(function(b){
          b.addEventListener('click',function(){
            a.assistant_tone=b.getAttribute('data-tone');
            document.querySelectorAll('#ob-tones .ob-opt').forEach(function(o){o.classList.remove('is-sel');});
            b.classList.add('is-sel'); updatePreview();
          });
        });
        updatePreview();
      }
    },
    // 8 · Personaliza (acento + avatar)
    { render:function(){
        var avs=(window.BIOPAU_DATA?window.BIOPAU_DATA.AVATARES:[]).map(function(av){
          var svg=window.BPShell?window.BPShell.avatarSVG(av.id):'';
          return '<div class="ob-av'+(a.avatar_id===av.id?' is-sel':'')+'" data-av="'+av.id+'"><span class="avatar avatar--pick">'+svg+'</span><span class="n">'+av.nombre+'</span></div>';
        }).join('');
        return head({es:'Tu estilo',ca:'El teu estil'},
                    {es:'Personaliza tu perfil',ca:'Personalitza el teu perfil'},null)+
          '<div class="ob-label">'+t({es:'Color de acento',ca:'Color d’accent'})+'</div>'+
          '<div class="ob-accents" id="ob-accents">'+ACCENTS.map(function(c){
            return '<button class="ob-accent'+(a.accent_color===c.id?' is-sel':'')+'" data-acc="'+c.id+'" style="background:'+c.color+'"></button>';
          }).join('')+'</div>'+
          '<div class="ob-label">'+t({es:'Elige tu avatar',ca:'Tria el teu avatar'})+'</div>'+
          '<div class="ob-avatars">'+avs+'</div>';
      },
      wire:function(){
        document.querySelectorAll('#ob-accents .ob-accent').forEach(function(b){
          b.addEventListener('click',function(){a.accent_color=b.getAttribute('data-acc');
            document.querySelectorAll('#ob-accents .ob-accent').forEach(function(o){o.classList.remove('is-sel');}); b.classList.add('is-sel');});
        });
        document.querySelectorAll('.ob-av').forEach(function(b){
          b.addEventListener('click',function(){a.avatar_id=b.getAttribute('data-av');
            document.querySelectorAll('.ob-av').forEach(function(o){o.classList.remove('is-sel');}); b.classList.add('is-sel');});
        });
      }
    },
    // 9 · Resumen
    { render:function(){
        function row(k,v){ return v?('<div class="ob-sum-row"><span class="k">'+k+'</span><span class="v">'+esc(v)+'</span></div>'):''; }
        var toneName=(TONES.filter(function(x){return x.id===a.assistant_tone;})[0]||{}).name;
        return head({es:'Casi listo',ca:'Gairebé llest'},
                    {es:'Revisa tu espacio',ca:'Revisa el teu espai'},
                    {es:'Podrás editar todo esto en tu perfil cuando quieras.',ca:'Podràs editar tot això al teu perfil quan vulguis.'})+
          '<div class="ob-summary">'+
            row(t({es:'Nombre',ca:'Nom'}), a.nickname)+
            row(t({es:'Carrera',ca:'Carrera'}), a.career_goal)+
            row(t({es:'Universidad',ca:'Universitat'}), a.university_goal)+
            row(t({es:'Nota objetivo',ca:'Nota objectiu'}), fmtGrade(a.target_grade))+
            row(t({es:'Acompañamiento',ca:'Acompanyament'}), toneName?t(toneName):'')+
          '</div>';
      },
      wire:function(){}
    },
    // 10 · Listo
    { render:function(){
        var g=window.BPMessages?window.BPMessages.greeting(tempProfile(),new Date()):'';
        var role=window.BPMessages?window.BPMessages.roleLine(tempProfile()):'';
        return '<div class="ob-done">'+
          '<div class="big">🎉</div>'+
          '<h2>'+t({es:'¡Tu espacio está listo!',ca:'El teu espai està llest!'})+'</h2>'+
          '<p>'+t({es:'Hemos preparado bioPau para ti.',ca:'Hem preparat bioPau per a tu.'})+'</p>'+
          (g?'<div class="ob-preview" style="justify-content:center;margin-top:22px;text-align:left;max-width:420px;margin-left:auto;margin-right:auto"><span class="pv-ico">👋</span><div><b>'+esc(g)+'</b>'+(role?'<div style="color:var(--lime);font-weight:700;margin-top:2px">'+esc(role)+'</div>':'')+'</div></div>':'')+
          '<div class="ob-mini">'+t({es:'Puedes cambiar todo esto en tu perfil.',ca:'Pots canviar tot això al teu perfil.'})+'</div>'+
        '</div>';
      },
      wire:function(){},
      finalStep:true
    }
  ];

  /* ---- Helpers de render ------------------------------------------------- */
  function head(eyebrow,q,help){
    return '<div class="ob-step-head"><div class="ob-eyebrow">'+t(eyebrow)+'</div>'+
      '<h1 class="ob-q">'+t(q)+'</h1>'+(help?'<p class="ob-help">'+t(help)+'</p>':'')+'</div>';
  }
  function chips(group, opts, sel){
    return '<div class="ob-chips" data-chips="'+group+'">'+opts.map(function(o){
      return '<button class="ob-chip'+(sel===o.v?' is-sel':'')+'" data-v="'+esc(o.v)+'">'+t(o.label)+'</button>';
    }).join('')+'</div>';
  }
  function wireChips(group, cb){
    document.querySelectorAll('[data-chips="'+group+'"] .ob-chip').forEach(function(b){
      b.addEventListener('click',function(){
        document.querySelectorAll('[data-chips="'+group+'"] .ob-chip').forEach(function(o){o.classList.remove('is-sel');});
        b.classList.add('is-sel'); cb(b.getAttribute('data-v'));
      });
    });
  }
  // chips que rellenan un input libre (carrera, uni)
  function chipsFree(group, arr, sel){
    return '<div class="ob-chips" data-free="'+group+'">'+arr.map(function(v){
      return '<button class="ob-chip'+(sel===v?' is-sel':'')+'" data-v="'+esc(v)+'">'+esc(v)+'</button>';
    }).join('')+'</div>';
  }
  function wireFreeChips(group, cb){
    document.querySelectorAll('[data-free="'+group+'"] .ob-chip').forEach(function(b){
      b.addEventListener('click',function(){ cb(b.getAttribute('data-v')); syncFreeChips(group,b.getAttribute('data-v')); });
    });
  }
  function syncFreeChips(group, val){
    document.querySelectorAll('[data-free="'+group+'"] .ob-chip').forEach(function(o){
      o.classList.toggle('is-sel', o.getAttribute('data-v')===val);
    });
  }
  function updatePreview(){
    var box=el('ob-preview-txt'); if(!box||!window.BPMessages) return;
    box.textContent = window.BPMessages.message(tempProfile(), { pct:10, streak:0, goalState:'habitos' });
  }
  function fmtGrade(g){ return (Math.round(g*100)/100).toFixed(2).replace('.',','); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* ---- Motor del wizard -------------------------------------------------- */
  var i = 0;
  function draw(){
    var s=steps[i];
    el('ob-steps').innerHTML='<div class="ob-step is-active">'+s.render()+'</div>';
    s.wire();
    // progreso
    el('ob-bar').style.width = Math.round(((i+ (s.finalStep?1:0)) / (steps.length-1)) * 100) + '%';
    el('ob-back').hidden = (i===0);
    var next=el('ob-next');
    next.querySelector('[data-i18n]').textContent = s.finalStep
      ? t({es:'Entrar en bioPau',ca:'Entrar a bioPau'})
      : (i===steps.length-2 ? t({es:'Terminar',ca:'Acabar'}) : t({es:'Continuar',ca:'Continuar'}));
    el('ob-skip').style.display = s.finalStep ? 'none' : '';
    window.scrollTo(0,0);
  }
  function valid(){
    if(i===0 && !a.nickname){ el('f-nick') && el('f-nick').focus(); shake(el('f-nick')); return false; }
    return true;
  }
  function shake(node){ if(!node) return; node.style.borderColor='#FF8A8A'; setTimeout(function(){node.style.borderColor='';},900); }

  async function next(){
    var s=steps[i];
    if(!valid()) return;
    if(s.finalStep){ await finish(); return; }
    if(i<steps.length-1){ i++; draw(); }
  }
  function back(){ if(i>0){ i--; draw(); } }

  async function finish(){
    var btn=el('ob-next'); btn.disabled=true;
    var patch={
      nickname:a.nickname, first_name:a.first_name||a.nickname, course:a.course, school:a.school,
      career_goal:a.career_goal, university_goal:a.university_goal, target_grade:a.target_grade,
      main_motivation:a.main_motivation, assistant_tone:a.assistant_tone,
      accent_color:a.accent_color, avatar_id:a.avatar_id, prefs:a.prefs,
      language:L(), onboarding_completed:true
    };
    try { if(window.BPProfile) await window.BPProfile.save(patch); } catch(e){}
    // también guarda el avatar en user_stats si existe la función
    window.location.href='/app/';
  }

  async function skip(){
    try { if(window.BPProfile) await window.BPProfile.save({ onboarding_completed:true }); } catch(e){}
    window.location.href='/app/';
  }

  document.addEventListener('DOMContentLoaded', async function(){
    // guard() de auth.js ya exige sesión; cargamos el perfil por si retoma
    try { if(window.BPProfile){ await window.BPProfile.load(); var d=window.BPProfile.all();
      a.nickname=d.nickname||''; a.career_goal=d.career_goal||''; a.university_goal=d.university_goal||'';
      if(d.target_grade) a.target_grade=d.target_grade; a.assistant_tone=d.assistant_tone||'motivador';
      a.accent_color=d.accent_color||'lime'; a.avatar_id=d.avatar_id||'cell';
      if(d.prefs&&d.prefs.gender) a.prefs.gender=d.prefs.gender;
    }} catch(e){}
    el('ob-next').addEventListener('click', next);
    el('ob-back').addEventListener('click', back);
    el('ob-skip').addEventListener('click', skip);
    document.addEventListener('bp:langchange', draw);
    draw();
  });
})();
