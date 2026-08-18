/* ============================================================================
   BioPAU — vista APUNTES (v2)
   Grid de los 7 bloques oficiales de la PAU. Cada tarjeta: nombre grande,
   color propio y barra de progreso. Al hacer clic se abre el detalle con
   huecos para tus apuntes escaneados.

   PARA SUBIR UN APUNTE ESCANEADO MÁS ADELANTE:
     En js/study-data.js, dentro del bloque, añade a "apuntes":
       { titulo: 'Els glúcids', img: '/apuntes/biomolecules/glucids.jpg' }
     (sube la imagen al repo, p. ej. en una carpeta /apuntes/biomolecules/).
     Mientras "apuntes" esté vacío, se muestra un hueco "Pròximament".
   ============================================================================ */
(function () {
  var D = window.BIOPAU_DATA;
  var LABEL = { pending: 'Pendiente', in_progress: 'En curso', done: 'Completado' };
  var CHIP = { pending: '', in_progress: 'chip--prog', done: 'chip--done' };
  var NEXT = { pending: 'in_progress', in_progress: 'done', done: 'pending' };

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

  function renderGrid() {
    var box = document.getElementById('temario');
    box.innerHTML = D.BLOQUES.map(function (b, i) {
      var pct = bloquePct(b);
      var n = unidadesDe(b).length;
      return '<button class="bq-card" data-bloque="' + b.id + '" style="--bc:' + b.color + ';--delay:' + (i * 40) + 'ms">' +
        '<span class="bq-name">' + b.nombre + '</span>' +
        '<span class="bq-meta">' + bloqueDone(b) + '/' + n + ' ' + (n === 1 ? 'bloque' : 'apuntes') + '</span>' +
        '<span class="bq-bar"><span style="width:' + pct + '%"></span></span>' +
        '<span class="bq-pct">' + pct + '%</span>' +
        '</button>';
    }).join('');
  }

  function renderDetalle(id) {
    var b = D.bloquePorId(id);
    if (!b) return;
    var notas = window.BIOPAU_NOTES && window.BIOPAU_NOTES[id];
    if (notas) renderNoteReader(b, notas);
    else renderGaleria(b);
  }

  /* --- Bloque con contenido real: lector de apuntes con secciones -------- */
  function renderNoteReader(b, notas) {
    var status = window.BPData.statusOf(b.id);
    var nav = notas.navLabels.map(function (lbl, i) {
      return '<button data-target="s' + (i + 1) + '"' + (i === 0 ? ' class="active"' : '') + '>' + lbl + '</button>';
    }).join('');

    var box = document.getElementById('bloque-detalle');
    box.style.setProperty('--bc', b.color);
    box.innerHTML =
      '<button class="bq-back" data-back>&larr; Todos los bloques</button>' +
      '<div class="note-reader">' +
        '<div class="topic-head">' +
          '<div><span class="topic-number">' + b.nombre.toUpperCase() + '</span>' +
          '<h2>' + b.nombre + '</h2><p>' + notas.subtitulo + '</p></div>' +
          '<div class="topic-tools"><button id="mark-topic" class="btn chip ' + CHIP[status] + '" data-cycle="' + b.id + '">' +
          (status === 'done' ? '✓ Tema estudiat' : 'Marcar tema com a estudiat') + '</button></div>' +
        '</div>' +
        '<div class="topic-layout">' +
          '<aside class="topic-nav" id="topic-nav">' + nav + '</aside>' +
          '<article class="notes-content">' + notas.html +
            '<div class="section-footer"><button id="prev-section" class="small-btn">← Anterior</button>' +
            '<button id="next-section" class="btn">Següent →</button></div>' +
          '</article>' +
        '</div>' +
      '</div>' +
      '<div class="quiz-modal" id="quiz-modal" aria-hidden="true"><div class="quiz-box">' +
        '<button class="close" id="close-quiz">×</button><div id="quiz-content"></div></div></div>';

    wireNoteReader(notas);
    document.getElementById('temario').classList.add('is-hidden');
    box.classList.add('is-open');
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function wireNoteReader(notas) {
    var sections = [].slice.call(document.querySelectorAll('.note-section'));
    var navBtns = [].slice.call(document.querySelectorAll('#topic-nav button'));
    var index = 0;
    function show(i) {
      index = Math.max(0, Math.min(sections.length - 1, i));
      sections.forEach(function (s, n) { s.classList.toggle('active-section', n === index); });
      navBtns.forEach(function (b, n) { b.classList.toggle('active', n === index); });
      document.querySelector('.note-reader').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    navBtns.forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
    var prev = document.getElementById('prev-section'), next = document.getElementById('next-section');
    if (prev) prev.addEventListener('click', function () { show(index - 1); });
    if (next) next.addEventListener('click', function () { show(index + 1); });

    // Quiz de repaso
    var quiz = [], qIndex = 0, score = 0;
    var modal = document.getElementById('quiz-modal'), content = document.getElementById('quiz-content');
    function shuffle(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }
    function renderQ() {
      var q = quiz[qIndex];
      content.innerHTML = '<h2>' + (qIndex + 1) + '/5 · ' + q[0] + '</h2>' +
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
            '<button class="btn quiz-next">' + (qIndex === 4 ? 'Veure resultat' : 'Següent pregunta →') + '</button></div>';
          document.querySelector('.quiz-next').addEventListener('click', function () {
            if (qIndex === 4) {
              content.innerHTML = '<h2>Repàs completat 🎉</h2><div class="quiz-result"><b>' + score + '/5 correctes</b>' +
                '<p>' + (score >= 4 ? 'Molt bon nivell. Continua amb exercicis PAU.' : score >= 3 ? 'Bona base. Repassa els conceptes que han fallat.' : 'Fes una repassada del tema i torna a provar-ho.') + '</p></div>' +
                '<button class="btn" id="quiz-close-final">Tancar</button>';
              document.getElementById('quiz-close-final').addEventListener('click', closeQuiz);
            } else { qIndex++; renderQ(); }
          });
        });
      });
    }
    function openQuiz() { quiz = shuffle(notas.quiz).slice(0, 5); qIndex = 0; score = 0; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); renderQ(); }
    function closeQuiz() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }

    var quizBtn = document.createElement('button');
    quizBtn.className = 'btn btn--ghost btn--sm';
    quizBtn.style.marginTop = '14px';
    quizBtn.textContent = 'Fer un repàs de 5 preguntes →';
    quizBtn.addEventListener('click', openQuiz);
    document.querySelector('.notes-content').appendChild(quizBtn.cloneNode(true));
    document.querySelectorAll('.notes-content > button.btn--ghost').forEach(function (b) { b.addEventListener('click', openQuiz); });
    document.getElementById('close-quiz').addEventListener('click', closeQuiz);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeQuiz(); });
  }

  /* --- Bloque sin contenido todavía: galería con huecos "Pròximament" ---- */
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

    var box = document.getElementById('bloque-detalle');
    box.style.setProperty('--bc', b.color);
    box.innerHTML =
      '<button class="bq-back" data-back>&larr; Todos los bloques</button>' +
      '<div class="bq-head">' +
        '<h1>' + b.nombre + '</h1>' +
        '<p>' + b.desc + '</p>' +
        '<div class="bq-bar bq-bar--lg"><span style="width:' + pct + '%"></span></div>' +
        '<span class="bq-pct-lg">' + pct + '% completado</span>' +
      '</div>' +
      '<div class="ap-grid">' + slots + '</div>';

    document.getElementById('temario').classList.add('is-hidden');
    box.classList.add('is-open');
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cerrarDetalle() {
    document.getElementById('bloque-detalle').classList.remove('is-open');
    document.getElementById('temario').classList.remove('is-hidden');
    renderGrid();
  }

  function actualizarBarraDetalle(unitId) {
    var u = D.todasLasUnidades().find(function (x) { return x.id === unitId; });
    if (!u) return;
    var b = D.bloquePorId(u.bloqueId);
    var pct = bloquePct(b);
    var bar = document.querySelector('.bq-bar--lg span');
    var lbl = document.querySelector('.bq-pct-lg');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = pct + '% completado';
  }

  function wire() {
    document.addEventListener('click', async function (e) {
      var card = e.target.closest ? e.target.closest('[data-bloque]') : null;
      if (card) {
        card.classList.add('is-pop');
        setTimeout(function () { renderDetalle(card.getAttribute('data-bloque')); }, 140);
        return;
      }
      if (e.target.closest && e.target.closest('[data-back]')) { cerrarDetalle(); return; }

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
          actualizarBarraDetalle(id);
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
  });
})();
