/* ============================================================================
   BioPAU — vista APUNTES (v3)
   Navegación en 3 niveles: grid de bloques → lista de temas del bloque →
   lector de un tema (secciones + quiz). Cada nivel anima su entrada y el
   botón "atrás" retrocede un solo nivel.

   PARA AÑADIR APUNTES ESCANEADOS (bloques sin contenido aún):
     En js/study-data.js, dentro del bloque, añade a "apuntes":
       { titulo: 'Els glúcids', img: '/apuntes/biomolecules/glucids.jpg' }

   PARA AÑADIR UN BLOQUE CON TEMAS (como Metabolisme):
     Crea js/notas-<bloque>.js con window.BIOPAU_NOTES.<id> = { temas: [...] }
     y cárgalo en apuntes.html. Cada tema necesita: titulo, subtitol, resumen,
     navLabels, html (secciones con id="s1".."sN") y quiz.
   ============================================================================ */
(function () {
  var D = window.BIOPAU_DATA;
  var LABEL = { pending: 'Pendiente', in_progress: 'En curso', done: 'Completado' };
  var CHIP = { pending: '', in_progress: 'chip--prog', done: 'chip--done' };
  var NEXT = { pending: 'in_progress', in_progress: 'done', done: 'pending' };

  var ICONS = {
    mito: '<path d="M4 9c0-3 3-5 8-5s8 2 8 5-3 5-8 5-8-2-8-5z" transform="rotate(20 12 12)"/><path d="M8 9c1-2 2-2 3 0s2 2 3 0 2-2 3 0" transform="rotate(20 12 12)"/>',
    dna: '<path d="M8 2c0 5 8 7 8 12s-8 7-8 12M16 2c0 5-8 7-8 12s8 7 8 12"/><path d="M9 8h6M9 12h6M9 16h6"/>',
    atom: '<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
    microbe: '<circle cx="12" cy="12" r="6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>',
    shield: '<path d="M12 2l8 3.5V11c0 5.2-3.4 8.8-8 10-4.6-1.2-8-4.8-8-10V5.5L12 2z"/>',
    flask: '<path d="M9 3v6L4 18a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3L15 9V3"/><path d="M8 3h8"/><path d="M7 16h10"/>',
    tree: '<path d="M12 22V13M12 13L7 8M12 13l5-5M12 8L9 4M12 8l3-4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>'
  };
  function bqIcon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.target) + '</svg>';
  }

  var root = document.getElementById('bloque-detalle');

  /* ---------- Utilidades de progreso (por unidad = tema o apunte) -------- */
  function unidadesDe(b) { return D.todasLasUnidades().filter(function (u) { return u.bloqueId === b.id; }); }
  function bloquePct(b) {
    var us = unidadesDe(b);
    if (!us.length) return 0;
    var done = us.filter(function (u) { return window.BPData.statusOf(u.id) === 'done'; }).length;
    return Math.round((done / us.length) * 100);
  }
  function bloqueDone(b) {
    return unidadesDe(b).filter(function (u) { return window.BPData.statusOf(u.id) === 'done'; }).length;
  }

  /* ---------- Nivel 1: grid de bloques ------------------------------------ */
  function renderGrid() {
    var box = document.getElementById('temario');
    box.innerHTML = D.BLOQUES.map(function (b, i) {
      var pct = bloquePct(b);
      var n = unidadesDe(b).length;
      var tieneNotas = window.BIOPAU_NOTES && window.BIOPAU_NOTES[b.id];
      return '<button class="bq-card" data-bloque="' + b.id + '" style="--bc:' + b.color + ';--delay:' + (i * 60) + 'ms">' +
        '<div class="bq-icon">' + bqIcon(b.icon) + '</div>' +
        '<span class="bq-name">' + b.nombre + '</span>' +
        '<span class="bq-meta">' + (tieneNotas ? bloqueDone(b) + '/' + n + ' temes' : 'Apunts pròximament') + '</span>' +
        '<div>' +
          '<div class="bq-bar"><span style="width:' + pct + '%"></span></div>' +
          '<div class="bq-foot"><span class="bq-pct">' + pct + '%</span><span class="bq-cta">Obrir →</span></div>' +
        '</div>' +
        '</button>';
    }).join('');
  }

  function abrirBloque(id) {
    var b = D.bloquePorId(id);
    if (!b) return;
    var notas = window.BIOPAU_NOTES && window.BIOPAU_NOTES[id];
    if (notas && notas.temas) renderListaTemas(b, notas);
    else renderGaleria(b);
    document.getElementById('temario').classList.add('is-hidden');
    root.classList.add('is-open');
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- Nivel 2: lista de temas de un bloque ------------------------ */
  function renderListaTemas(b, notas) {
    var cards = notas.temas.map(function (t, i) {
      var unitId = b.id + '-' + (i + 1);
      var status = window.BPData.statusOf(unitId);
      return '<button class="tema-card" data-tema="' + i + '" style="--bc:' + b.color + ';--delay:' + (i * 70) + 'ms">' +
        '<span class="tema-num">' + t.titulo + '</span>' +
        '<span class="tema-title">' + t.subtitol + '</span>' +
        '<span class="tema-resumen">' + t.resumen + '</span>' +
        '<span class="tema-foot"><span class="chip ' + CHIP[status] + '">' + LABEL[status] + '</span><span class="bq-cta">Obrir →</span></span>' +
        '</button>';
    }).join('');

    root.style.setProperty('--bc', b.color);
    root.innerHTML =
      '<button class="bq-back" data-back-grid>&larr; Tots els blocs</button>' +
      '<div class="bq-head">' +
        '<h1>' + b.nombre + '</h1><p>' + b.desc + '</p>' +
        '<div class="bq-bar bq-bar--lg"><span style="width:' + bloquePct(b) + '%"></span></div>' +
        '<span class="bq-pct-lg">' + bloquePct(b) + '% completat</span>' +
      '</div>' +
      '<div class="temas-grid">' + cards + '</div>';

    root.querySelectorAll('[data-tema]').forEach(function (card) {
      card.addEventListener('click', function () {
        card.classList.add('is-pop');
        var i = +card.getAttribute('data-tema');
        setTimeout(function () { renderTema(b, notas, i); }, 130);
      });
    });
    var backBtn = root.querySelector('[data-back-grid]');
    if (backBtn) backBtn.addEventListener('click', cerrarDetalle);
  }

  /* ---------- Nivel 3: lector de un tema (secciones + quiz) --------------- */
  function renderTema(b, notas, i) {
    var t = notas.temas[i];
    var unitId = b.id + '-' + (i + 1);
    var status = window.BPData.statusOf(unitId);
    var nav = t.navLabels.map(function (lbl, n) {
      return '<button data-target="s' + (n + 1) + '"' + (n === 0 ? ' class="active"' : '') + '>' + lbl + '</button>';
    }).join('');

    root.style.setProperty('--bc', b.color);
    root.innerHTML =
      '<button class="bq-back" data-back-temas>&larr; ' + b.nombre + '</button>' +
      '<div class="note-reader">' +
        '<div class="topic-head">' +
          '<div><span class="topic-number">' + t.titulo.toUpperCase() + '</span>' +
          '<h2>' + t.subtitol + '</h2><p>' + t.resumen + '</p></div>' +
          '<div class="topic-tools"><button id="mark-topic" class="btn chip ' + CHIP[status] + '" data-cycle="' + unitId + '">' +
          (status === 'done' ? '✓ Tema estudiat' : 'Marcar tema com a estudiat') + '</button></div>' +
        '</div>' +
        '<div class="topic-layout">' +
          '<aside class="topic-nav" id="topic-nav">' + nav + '</aside>' +
          '<article class="notes-content">' + t.html +
            '<div class="section-footer"><button id="prev-section" class="small-btn">← Anterior</button>' +
            '<button id="next-section" class="btn">Següent →</button></div>' +
          '</article>' +
        '</div>' +
      '</div>' +
      '<div class="quiz-modal" id="quiz-modal" aria-hidden="true"><div class="quiz-box">' +
        '<button class="close" id="close-quiz">×</button><div id="quiz-content"></div></div></div>';

    wireTema(t);
    var backBtn = root.querySelector('[data-back-temas]');
    if (backBtn) backBtn.addEventListener('click', function () { renderListaTemas(b, notas); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function wireTema(t) {
    var sections = [].slice.call(document.querySelectorAll('.note-section'));
    var navBtns = [].slice.call(document.querySelectorAll('#topic-nav button'));
    var index = 0;
    function show(i) {
      index = Math.max(0, Math.min(sections.length - 1, i));
      sections.forEach(function (s, n) {
        var active = (n === index);
        s.classList.toggle('active-section', active);
        s.style.display = active ? 'block' : 'none';
      });
      navBtns.forEach(function (b, n) { b.classList.toggle('active', n === index); });
      document.querySelector('.note-reader').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    show(0);
    navBtns.forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
    var prev = document.getElementById('prev-section'), next = document.getElementById('next-section');
    if (prev) prev.addEventListener('click', function () { show(index - 1); });
    if (next) next.addEventListener('click', function () { show(index + 1); });

    // Quiz de repaso
    var quiz = [], qIndex = 0, score = 0, total = 0;
    var modal = document.getElementById('quiz-modal'), content = document.getElementById('quiz-content');
    function shuffle(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }
    function renderQ() {
      var q = quiz[qIndex];
      content.innerHTML = '<h2>' + (qIndex + 1) + '/' + total + ' — ' + q[0] + '</h2>' +
        q[1].map(function (o, i) { return '<button class="quiz-option" data-answer="' + i + '">' + o + '</button>'; }).join('') +
        '<div id="quiz-feedback"></div>';
      content.querySelectorAll('.quiz-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var ok = +btn.getAttribute('data-answer') === q[2];
          if (ok) score++;
          content.querySelectorAll('.quiz-option').forEach(function (x) { x.disabled = true; });
          document.getElementById('quiz-feedback').innerHTML =
            '<div class="quiz-result"><b>' + (ok ? '✓ Correcte!' : '✗ Encara no.') + '</b> ' +
            (ok ? 'Molt bé.' : 'Revisa aquest apartat dels apunts i torna-ho a intentar.') +
            '<button class="btn quiz-next">' + (qIndex === total - 1 ? 'Veure resultat' : 'Següent pregunta →') + '</button></div>';
          document.querySelector('.quiz-next').addEventListener('click', function () {
            if (qIndex === total - 1) {
              content.innerHTML = '<h2>Repàs completat</h2><div class="quiz-result"><b>' + score + '/' + total + ' correctes</b>' +
                '<p>' + (score >= total - 1 ? 'Molt bon nivell. Continua amb exercicis PAU.' : score >= Math.ceil(total / 2) ? 'Bona base. Repassa els conceptes que han fallat.' : 'Fes una repassada del tema i torna a provar-ho.') + '</p></div>' +
                '<button class="btn" id="quiz-close-final">Tancar</button>';
              document.getElementById('quiz-close-final').addEventListener('click', closeQuiz);
            } else { qIndex++; renderQ(); }
          });
        });
      });
    }
    function openQuiz() {
      quiz = shuffle(t.quiz);
      total = quiz.length;
      qIndex = 0; score = 0;
      modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); renderQ();
    }
    function closeQuiz() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }

    var quizBtn = document.createElement('button');
    quizBtn.className = 'btn btn--ghost btn--sm';
    quizBtn.style.marginTop = '14px';
    quizBtn.textContent = 'Fer un repàs de ' + t.quiz.length + ' preguntes →';
    quizBtn.addEventListener('click', openQuiz);
    document.querySelector('.notes-content').appendChild(quizBtn);
    document.getElementById('close-quiz').addEventListener('click', closeQuiz);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeQuiz(); });
  }

  /* ---------- Bloque sin contenido todavía: galería "Pròximament" -------- */
  function renderGaleria(b) {
    var us = unidadesDe(b);
    var pct = bloquePct(b);
    var tieneApuntes = b.apuntes && b.apuntes.length > 0;

    var slots = us.map(function (u, i) {
      var status = window.BPData.statusOf(u.id);
      var imgSrc = tieneApuntes ? b.apuntes[i].img : null;
      var img = imgSrc
        ? '<img src="' + imgSrc + '" alt="Apunte: ' + u.titulo + '">'
        : '<div class="ap-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v14H4zM4 15l4-4 4 4 4-6 4 4"/><circle cx="8.5" cy="8.5" r="1.3"/></svg><span>Pròximament</span></div>';
      return '<div class="ap-slot">' +
        '<div class="ap-img">' + img + '</div>' +
        '<div class="ap-info">' +
          '<span class="ap-t">' + u.titulo + '</span>' +
          '<button class="chip ' + CHIP[status] + '" data-cycle="' + u.id + '">' + LABEL[status] + '</button>' +
        '</div></div>';
    }).join('');

    // CTA del "llibre d'apunts" (pàgina interactiva amb efecte de pàgina)
    var llibreCta = '';
    if (b.llibre) {
      var titol = b.llibreTitol || 'Llibre d\'apunts';
      llibreCta =
        '<a href="' + b.llibre + '" target="_blank" rel="noopener" ' +
        'style="display:flex;align-items:center;gap:16px;text-decoration:none;' +
        'background:linear-gradient(135deg,#12503A,#0E3A2A);border:1px solid rgba(173,232,12,.35);' +
        'border-radius:18px;padding:16px 18px;margin:8px 0 14px;box-shadow:0 10px 30px rgba(0,0,0,.25)">' +
          '<span style="flex:0 0 52px;width:52px;height:62px;border-radius:5px 9px 9px 5px;background:#FAF7EE;' +
          'display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.3)">' +
            '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0E3A2A" stroke-width="1.8" ' +
            'stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6z"/>' +
            '<path d="M9 12l2 2 4-4.5"/></svg>' +
          '</span>' +
          '<span style="flex:1;min-width:0">' +
            '<span style="display:block;font-family:\'Bricolage Grotesque\',sans-serif;font-weight:800;' +
            'font-size:1.02rem;color:#ADE80C;line-height:1.2">' + titol + '</span>' +
            '<span style="display:block;font-size:.84rem;color:#CFE0C6;margin-top:3px">Llibre interactiu amb efecte de pàgina, diagrames a color i galeria de cèl·lules.</span>' +
          '</span>' +
          '<span style="flex:0 0 auto;font-family:\'Space Mono\',monospace;font-size:.8rem;color:#0E3A2A;' +
          'background:#ADE80C;border-radius:100px;padding:.5rem .9rem;font-weight:700">Obrir &rarr;</span>' +
        '</a>';
    }
    // Si hi ha llibre i encara no hi ha apunts escanejats, no mostrem la graella "Pròximament".
    var gridHtml = (b.llibre && !tieneApuntes) ? '' : '<div class="ap-grid">' + slots + '</div>';

    root.style.setProperty('--bc', b.color);
    root.innerHTML =
      '<button class="bq-back" data-back-grid>&larr; Tots els blocs</button>' +
      '<div class="bq-head">' +
        '<h1>' + b.nombre + '</h1>' +
        '<p>' + b.desc + '</p>' +
        '<div class="bq-bar bq-bar--lg"><span style="width:' + pct + '%"></span></div>' +
        '<span class="bq-pct-lg">' + pct + '% completado</span>' +
      '</div>' +
      llibreCta +
      gridHtml;

    var backBtn = root.querySelector('[data-back-grid]');
    if (backBtn) backBtn.addEventListener('click', cerrarDetalle);
  }

  function cerrarDetalle() {
    root.classList.remove('is-open');
    document.getElementById('temario').classList.remove('is-hidden');
    renderGrid();
  }

  function actualizarProgresoVisible(unitId) {
    var u = D.todasLasUnidades().find(function (x) { return x.id === unitId; });
    if (!u) return;
    var b = D.bloquePorId(u.bloqueId);
    var pct = bloquePct(b);
    var bar = document.querySelector('.bq-bar--lg span');
    var lbl = document.querySelector('.bq-pct-lg');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = pct + '% completat';
  }

  /* ---------- Delegación de eventos global -------------------------------- */
  function wire() {
    document.addEventListener('click', async function (e) {
      var card = e.target.closest ? e.target.closest('[data-bloque]') : null;
      if (card) {
        card.classList.add('is-pop');
        setTimeout(function () { abrirBloque(card.getAttribute('data-bloque')); }, 140);
        return;
      }

      var btn = e.target.closest ? e.target.closest('[data-cycle]') : null;
      if (btn) {
        var id = btn.getAttribute('data-cycle');
        var nuevo = NEXT[window.BPData.statusOf(id)];
        btn.disabled = true;
        var ok = await window.BPData.setTopicStatus(id, nuevo);
        btn.disabled = false;
        if (ok) {
          if (btn.id === 'mark-topic') {
            btn.textContent = nuevo === 'done' ? '✓ Tema estudiat' : 'Marcar tema com a estudiat';
            btn.className = 'btn chip ' + CHIP[nuevo];
          } else {
            btn.textContent = LABEL[nuevo];
            btn.className = 'chip ' + CHIP[nuevo];
          }
          actualizarProgresoVisible(id);
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async function () {
    window.BPShell.render({ crumb: 'Apuntes' });
    await window.BPData.load();
    var st = window.BPData.state;
    if (st.needsSetup) {
      var n = document.getElementById('setup-notice');
      if (n) n.classList.add('is-on');
    }
    var perfil = await window.BP.profile();
    window.BPShell.setUser(perfil && perfil.username, st.stats.avatar_id, st.stats.streak_days);
    renderGrid();
    wire();
    // Deep-link: /app/apuntes.html#<bloque> abre ese bloque directamente
    var h = (location.hash || '').replace('#', '');
    if (h && D && D.bloquePorId && D.bloquePorId(h)) setTimeout(function () { abrirBloque(h); }, 220);
  });
})();
