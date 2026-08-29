/* ============================================================================
   BioPAU — Motor de idiomas (Català / Castellà)
   ----------------------------------------------------------------------------
   • Fuente única de traducciones (window.BPI18n.DICT).
   • Persistencia de la preferencia en localStorage ("biopau_lang").
   • apply(root): traduce cualquier subárbol del DOM.
       - [data-i18n="clave"]            → textContent
       - [data-i18n-html="clave"]       → innerHTML (para textos con <b>, <br>…)
       - [data-i18n-attr="attr:clave"]  → atributo (placeholder, aria-label, title…)
                                          admite varios: "placeholder:x;aria-label:y"
   • t(clave, vars): devuelve la cadena traducida (con {vars} opcionales).
   • Selector de idioma: se dibuja solo en cada [data-lang-switch].
   ----------------------------------------------------------------------------
   Uso mínimo en una página nueva:
     1) <script src="/js/i18n.js"></script>  (antes del resto de tu JS)
     2) pon data-i18n / data-i18n-html / data-i18n-attr en el HTML
     3) coloca <div data-lang-switch></div> donde quieras el selector
   Para contenido generado por JS: usa BPI18n.t('clave') y, tras insertarlo,
   BPI18n.apply(contenedor).
   ============================================================================ */
window.BPI18n = (function () {
  'use strict';

  var STORE_KEY = 'biopau_lang';
  var DEFAULT = 'es';
  var LANGS = ['ca', 'es'];

  /* ---------- Diccionario ---------------------------------------------------
     Clave → { ca: '…', es: '…' }. Las traducciones al catalán están escritas
     de forma natural (no automática), con el registro cercano de la marca.   */
  var DICT = {
    /* ---- Comunes / navegación / botones ---- */
    'nav.enter':            { ca: 'Entra',            es: 'Entrar' },
    'nav.login':            { ca: 'Inicia sessió',    es: 'Iniciar sesión' },
    'nav.register':         { ca: "Registra't",       es: 'Registrarse' },
    'nav.register_free':    { ca: "Registra't gratis", es: 'Regístrate gratis' },

    /* ---- Fase A · Footer legal / páginas legales / ayuda / consentimiento ---- */
    'foot.privacy':         { ca: 'Privacitat',            es: 'Privacidad' },
    'foot.terms':           { ca: "Condicions d'ús",       es: 'Condiciones de uso' },
    'foot.cookies':         { ca: 'Cookies',               es: 'Cookies' },
    'foot.legal_notice':    { ca: 'Avís legal',            es: 'Aviso legal' },
    'foot.help':            { ca: 'Ajuda',                 es: 'Ayuda' },
    'foot.contact':         { ca: 'Contacte',              es: 'Contacto' },
    'foot.legal_rights':    { ca: 'Tots els drets reservats.', es: 'Todos los derechos reservados.' },

    'legal.eyebrow':        { ca: 'Legal',                 es: 'Legal' },
    'legal.updated':        { ca: 'Última actualització:', es: 'Última actualización:' },
    'legal.back_home':      { ca: 'Torna a l’inici',       es: 'Volver al inicio' },
    'legal.note_owner':     { ca: 'Dades del responsable (a completar):', es: 'Datos del responsable (a completar):' },
    'legal.note_owner_txt': { ca: ' titular <b>[nom o raó social]</b>, NIF/CIF <b>[·]</b>, domicili <b>[·]</b>. Substitueix aquests camps per les dades reals del responsable abans de publicar.', es: ' titular <b>[nombre o razón social]</b>, NIF/CIF <b>[·]</b>, domicilio <b>[·]</b>. Sustituye estos campos por los datos reales del responsable del tratamiento antes de publicar.' },
    'legal.note_generic':   { ca: 'Aquest document és una plantilla professional de partida. Abans de publicar-lo, revisa i completa les dades del responsable i adapta’l al teu cas; no constitueix assessorament jurídic.', es: 'Este documento es una plantilla profesional de partida. Antes de publicarlo, revisa y completa los datos del responsable y adáptalo a tu caso concreto; no constituye asesoramiento jurídico.' },
    'legal.privacy_title':  { ca: 'Política de Privacitat — BioPAU', es: 'Política de Privacidad — BioPAU' },
    'legal.privacy_h1':     { ca: 'Política de Privacitat', es: 'Política de Privacidad' },
    'legal.terms_title':    { ca: "Condicions d'Ús — BioPAU", es: 'Condiciones de Uso — BioPAU' },
    'legal.terms_h1':       { ca: "Condicions d'Ús",       es: 'Condiciones de Uso' },
    'legal.cookies_title':  { ca: 'Política de Cookies — BioPAU', es: 'Política de Cookies — BioPAU' },
    'legal.cookies_h1':     { ca: 'Política de Cookies',    es: 'Política de Cookies' },
    'legal.notice_title':   { ca: 'Avís Legal — BioPAU',   es: 'Aviso Legal — BioPAU' },
    'legal.notice_h1':      { ca: 'Avís Legal',            es: 'Aviso Legal' },

    'help.title':           { ca: 'Ajuda i suport — BioPAU', es: 'Ayuda y soporte — BioPAU' },
    'help.eyebrow':         { ca: 'Suport',                es: 'Soporte' },
    'help.h1':              { ca: 'Ajuda i suport',        es: 'Ayuda y soporte' },
    'help.lead':            { ca: 'Tens un dubte o un problema? Som aquí per ajudar-te.', es: '¿Tienes una duda o un problema? Estamos para ayudarte.' },
    'help.contact_t':       { ca: 'Contacte',              es: 'Contacto' },
    'help.contact_p':       { ca: 'Escriu-nos i et respondrem al més aviat possible.', es: 'Escríbenos y te responderemos lo antes posible.' },
    'help.contact_btn':     { ca: 'Escriure un correu',    es: 'Escribir un correo' },
    'help.report_t':        { ca: 'Reportar un problema',  es: 'Reportar un problema' },
    'help.report_p':        { ca: 'Alguna cosa no funciona o has vist un error en un contingut? Explica’ns-ho amb detall.', es: '¿Algo no funciona o has visto un error en un contenido? Cuéntanoslo con el máximo detalle.' },
    'help.report_btn':      { ca: 'Reportar',              es: 'Reportar' },
    'help.faq_t':           { ca: 'Preguntes freqüents',   es: 'Preguntas frecuentes' },
    'help.faq1_q':          { ca: 'Com canvio la contrasenya?', es: '¿Cómo cambio mi contraseña?' },
    'help.faq1_a':          { ca: 'Entra al teu compte, ves a la pestanya «Compte» i fes servir la secció «Canviar contrasenya».', es: 'Entra en tu cuenta, ve a la pestaña «Cuenta» y usa la sección «Cambiar contraseña».' },
    'help.faq2_q':          { ca: 'Com canvio l’idioma?',  es: '¿Cómo cambio el idioma?' },
    'help.faq2_a':          { ca: 'Fes servir el selector d’idioma (castellà / català) de la part superior. La teva preferència es desa automàticament.', es: 'Usa el selector de idioma (castellano / català) que aparece en la parte superior. Tu preferencia se guarda automáticamente.' },
    'help.faq3_q':          { ca: 'Puc cancel·lar la subscripció?', es: '¿Puedo cancelar la suscripción?' },
    'help.faq3_a':          { ca: 'Sí. Des del teu compte pots gestionar o cancel·lar la subscripció quan vulguis; la cancel·lació atura les renovacions futures.', es: 'Sí. Desde tu cuenta puedes gestionar o cancelar la suscripción cuando quieras; la cancelación detiene las renovaciones futuras.' },
    'help.faq4_q':          { ca: 'On veig les condicions i la privacitat?', es: '¿Dónde veo las condiciones y la privacidad?' },
    'help.faq4_a':          { ca: 'Al peu de pàgina tens accés a la Política de Privacitat, les Condicions d’Ús, la Política de Cookies i l’Avís Legal.', es: 'En el pie de página tienes acceso a la Política de Privacidad, las Condiciones de Uso, la Política de Cookies y el Aviso Legal.' },

    'consent.reg_privacy':  { ca: 'He llegit i accepto la', es: 'He leído y acepto la' },
    'consent.reg_privacy_l':{ ca: 'Política de Privacitat', es: 'Política de Privacidad' },
    'consent.reg_terms':    { ca: 'Accepto les',           es: 'Acepto las' },
    'consent.reg_terms_l':  { ca: "Condicions d'Ús",       es: 'Condiciones de Uso' },
    'consent.required':     { ca: 'Per continuar has d’acceptar la privacitat i les condicions.', es: 'Para continuar debes aceptar la privacidad y las condiciones.' },

    'acc.security_title':   { ca: 'Canviar contrasenya',   es: 'Cambiar contraseña' },
    'acc.pw_current':       { ca: 'Contrasenya actual',    es: 'Contraseña actual' },
    'acc.pw_new':           { ca: 'Nova contrasenya',      es: 'Nueva contraseña' },
    'acc.pw_confirm':       { ca: 'Confirma la nova contrasenya', es: 'Confirmar nueva contraseña' },
    'acc.pw_save':          { ca: 'Actualitzar contrasenya', es: 'Actualizar contraseña' },
    'acc.pw_rule':          { ca: 'Mínim 8 caràcters, amb una lletra i un número.', es: 'Mínimo 8 caracteres, con una letra y un número.' },
    'acc.help_title':       { ca: 'Ajuda i suport',        es: 'Ayuda y soporte' },
    'acc.help_text':        { ca: 'Necessites ajuda? Escriu-nos o consulta les preguntes freqüents.', es: '¿Necesitas ayuda? Escríbenos o consulta las preguntas frecuentes.' },
    'acc.help_center':      { ca: 'Centre d’ajuda',        es: 'Centro de ayuda' },
    'acc.help_contact':     { ca: 'Contactar amb suport',  es: 'Contactar con soporte' },
    'acc.legal_title':      { ca: 'Legal',                 es: 'Legal' },
    'nav.start_free':       { ca: 'Comença gratis',   es: 'Empieza gratis' },
    'nav.start_free_full':  { ca: 'Comença&nbsp;',    es: 'Empieza&nbsp;' },
    'nav.free_word':        { ca: 'gratis',           es: 'gratis' },
    'nav.prices':           { ca: 'Preus',            es: 'Precios' },
    'nav.account':          { ca: 'El meu compte',    es: 'Mi cuenta' },
    'nav.account_full':     { ca: 'El meu&nbsp;',     es: 'Mi&nbsp;' },
    'nav.account_short':    { ca: 'compte',           es: 'cuenta' },

    'lang.aria':            { ca: 'Canvia d’idioma', es: 'Cambiar de idioma' },
    'lang.ca':              { ca: 'CAT',              es: 'CAT' },
    'lang.es':              { ca: 'ESP',              es: 'ESP' },

    /* ---- Footer (común) ---- */
    'foot.problem':         { ca: 'El problema',      es: 'El problema' },
    'foot.solution':        { ca: 'La solució',       es: 'La solución' },
    'foot.prices':          { ca: 'Preus',            es: 'Precios' },
    'foot.faq':             { ca: 'Preguntes',        es: 'Preguntas' },
    'foot.official':        { ca: 'Continguts oficials', es: 'Contenidos oficiales' },
    'foot.home':            { ca: 'Inici',            es: 'Inicio' },
    'foot.create':          { ca: 'Crear compte',     es: 'Crear cuenta' },
    'foot.enter':           { ca: 'Entra',            es: 'Entrar' },
    'foot.account':         { ca: 'El meu compte',    es: 'Mi cuenta' },
    'foot.legal':           { ca: '© 2026 BioPAU · Fet per algú que es va presentar a la Selectivitat 4 vegades perquè tu no hagis de fer-ho.',
                              es: '© 2026 BioPAU · Hecho por alguien que se presentó a la Selectivitat 4 veces para que tú no tengas que hacerlo.' },
    'foot.independent':     { ca: 'Recurs d’estudi independent. No està afiliat a la Generalitat de Catalunya.',
                              es: 'Recurso de estudio independiente. No afiliado a la Generalitat de Catalunya.' },

    /* ======================= LANDING ======================= */
    'meta.title':           { ca: 'BioPAU — La biologia que de veritat cau a la Selectivitat',
                              es: 'BioPAU — La biología que de verdad cae en la Selectivitat' },
    'meta.desc':            { ca: 'Temari, exercicis i pla per dies muntats sobre els continguts oficials de Biologia de la PAU de Catalunya.',
                              es: 'Temario, ejercicios y plan por días montados sobre los contenidos oficiales de Biología de la PAU de Catalunya.' },

    /* Countdown */
    'cd.label':             { ca: 'PAU de Biologia · juny 2027', es: 'PAU de Biología · junio 2027' },
    'cd.days':              { ca: 'dies',   es: 'días' },
    'cd.hours':             { ca: 'hores',  es: 'horas' },
    'cd.min':               { ca: 'min',    es: 'min' },
    'cd.sec':               { ca: 'seg',    es: 'seg' },
    'cd.cry':               { ca: 'El temps corre. Comença a entrenar!', es: 'El tiempo corre. ¡Comienza a entrenar!' },

    /* Hero (troceado para no recrear el SVG animado del subrayado) */
    'hero.h1a':             { ca: 'Ja te la saps, la biologia.', es: 'Te sabes la biología.' },
    'hero.h1b':             { ca: 'El que et falta és',          es: 'Lo que te falta es' },
    'hero.word':            { ca: 'clavar',                      es: 'clavar' },
    'hero.h1c':             { ca: 'la PAU.',                es: 'la PAU.' },
    'hero.sub':             { ca: 'Prou d’estudiar mil apunts que ni toquen el que demana la Generalitat. Aquí tens el temari, els exercicis i el pla, muntats sobre els continguts oficials del <b>teu</b> examen de biologia.',
                              es: 'Se acabó estudiar mil apuntes que ni tocan lo que pide la Generalitat. Aquí tienes el temario, los ejercicios y el plan, montados sobre los contenidos oficiales de <b>tu</b> examen de biología.' },
    'hero.cta1':            { ca: 'Comença avui',     es: 'Empieza hoy' },
    'hero.cta2':            { ca: 'Mira com funciona', es: 'Ver cómo funciona' },
    'hero.note':            { ca: 'L’esforç d’avui serà la teva tranquil·litat demà. Comença gratis, sense targeta.',
                              es: 'El esfuerzo de hoy será tu tranquilidad mañana. Empieza gratis, sin tarjeta.' },
    'hero.explore':         { ca: 'Gira-la · toca per explorar', es: 'Gírala · toca para explorar' },

    /* Problem */
    'prob.h2':              { ca: 'El pitjor no és que sigui difícil. És <em>no saber si vas pel bon camí.</em>',
                              es: 'Lo peor no es que sea difícil. Es <em>no saber si vas por buen camino.</em>' },
    'prob.lead':            { ca: 'Estudies hores, però per dins hi ha una veueta: «això entra? ho estic fent bé? em deixo alguna cosa?». Aquest soroll cansa més que la mateixa biologia. I ve d’estudiar sense un mapa que sigui just el del teu examen.',
                              es: 'Estudias horas, pero por dentro hay una vocecita: «¿esto entra? ¿lo estoy haciendo bien? ¿me estoy dejando algo?». Ese ruido cansa más que la propia biología. Y viene de estudiar sin un mapa que sea justo el de tu examen.' },
    'prob.p1':              { ca: 'Busques «biologia selectivitat» i et surten <b>mil coses</b>… i cap és exactament la de Catalunya.',
                              es: 'Buscas «biología selectividad» y te salen <b>mil cosas</b>… y ninguna es exactamente la de Catalunya.' },
    'prob.p2':              { ca: 'T’empolles temes que <b>no cauen</b> i passes de llarg pels que valen punts de veritat.',
                              es: 'Te empollas temas que <b>no caen</b> y pasas de largo por los que valen puntos de verdad.' },
    'prob.p3':              { ca: 'Tens exàmens d’anys solts, <b>sense solucions</b> i sense saber com es corregeix cada pregunta.',
                              es: 'Tienes exámenes de años sueltos, <b>sin soluciones</b> y sin saber cómo se corrige cada pregunta.' },
    'prob.p4':              { ca: 'I de fons, la por que no dius en veu alta: <b>«i si no arribo a la nota de la meva carrera?»</b>',
                              es: 'Y de fondo, el miedo que no dices en voz alta: <b>«¿y si no llego a la nota de mi carrera?»</b>' },

    /* Solution / benefits (troceado por el subrayado animado) */
    'sol.h2a':              { ca: 'Deixa d’estudiar a cegues. Estudia per aprovar', es: 'Deja de estudiar a ciegas. Estudia para aprobar' },
    'sol.word':             { ca: 'això',       es: 'esto' },
    'sol.h2b':              { ca: 'en concret.', es: 'en concreto.' },
    'sol.lead':             { ca: 'Res de saviesa genèrica. Cada peça hi és per una raó: acostar-te a la nota que necessites a la biologia de la Selectivitat catalana.',
                              es: 'Nada de sabiduría genérica. Cada pieza existe por una razón: acercarte a la nota que necesitas en la biología de la Selectivitat catalana.' },
    'ben1.h3':              { ca: 'Arribes a l’examen sense ensurts', es: 'Llegas al examen sin sustos' },
    'ben1.p':               { ca: 'Practiques amb exercicis <b>calcats</b> als que et posaran, corregits amb el criteri real de la PAU. El dia de l’examen ja ho has vist tot abans.',
                              es: 'Practicas con ejercicios <b>calcados</b> a los que te van a poner, corregidos con el criterio real de la PAU. El día del examen ya lo has visto todo antes.' },
    'ben2.h3':              { ca: 'Saps exactament què estudiar', es: 'Sabes exactamente qué estudiar' },
    'ben2.p':               { ca: 'Només els continguts que marca la <b>Generalitat</b>, explicats per entendre’ls de veritat, amb la profunditat justa que et demanaran. Ni una hora perduda en el que no entra.',
                              es: 'Solo los contenidos que marca la <b>Generalitat</b>, explicados para entenderlos de verdad, con la profundidad justa que te van a pedir. Ni una hora perdida en lo que no entra.' },
    'ben3.h3':              { ca: 'Cada dia saps què toca', es: 'Cada día sabes qué toca' },
    'ben3.p':               { ca: 'Tracker de dies i planificació fins a la data de l’examen. Obres, veus <b>la teva tasca d’avui</b> i t’hi poses. Sense dispersar-te, sense decidir cada matí per on començar.',
                              es: 'Tracker de días y planificación hasta la fecha del examen. Abres, ves <b>tu tarea de hoy</b> y te pones. Sin dispersarte, sin decidir cada mañana por dónde empezar.' },
    'ben4.h3':              { ca: 'La tranquil·litat de saber que és el que entra', es: 'La tranquilidad de que es lo que entra' },
    'ben4.p':               { ca: 'Tot està muntat sobre els <b>continguts oficials de la Generalitat</b>. No cal que t’ho creguis: toca l’escut i comprova-ho tu mateix al web oficial de la PAU.',
                              es: 'Todo está montado sobre los <b>contenidos oficiales de la Generalitat</b>. No te lo tienes que creer: toca el escudo y compruébalo tú mismo en la web oficial de la PAU.' },
    'ben4.verify':          { ca: 'Comprova-ho a gencat.cat', es: 'Verificar en gencat.cat' },

    /* Testimonial */
    'testi.chip':           { ca: 'Per què existeix BioPAU?', es: '¿Por qué existe BioPAU?' },
    'testi.quote':          { ca: 'Em vaig presentar a la Selectivitat <b>quatre vegades</b>. I no era per gandul: estudiava moltíssim… però estudiava <span class="u">malament</span>. El que no tocava, amb apunts que no anaven, sense saber què em demanarien de veritat. A la quarta vaig pescar el truc: no es tracta de saber més biologia, es tracta d’estudiar <span class="u">exactament el que entra</span> i practicar-ho com si fos el dia de l’examen. Vaig entrar a la carrera que volia. Vaig muntar BioPAU perquè tu no perdis quatre convocatòries a adonar-te’n.',
                              es: 'Me presenté a la Selectivitat <b>cuatro veces</b>. Y no era por vago: estudiaba muchísimo… pero estudiaba <span class="u">mal</span>. Lo que no tocaba, con apuntes que no iban, sin saber qué me iban a pedir de verdad. A la cuarta pillé el truco: no se trata de saber más biología, se trata de estudiar <span class="u">exactamente lo que entra</span> y practicarlo como si fuera el día del examen. Entré en la carrera que quería. Monté BioPAU para que tú no pierdas cuatro convocatorias en darte cuenta.' },
    'testi.who':            { ca: '<b>Jose Briceño — fundador de BioPAU</b>4 convocatòries · 1 plaça a Medicina',
                              es: '<b>Jose Briceño — fundador de BioPAU</b>4 convocatorias · 1 plaza en Medicina' },

    /* Final CTA */
    'final.h2':             { ca: 'L’esforç d’avui és la teva <em>tranquil·litat demà.</em>', es: 'El esfuerzo de hoy es tu <em>tranquilidad mañana.</em>' },
    'final.p':              { ca: 'L’examen té data. La teva plaça també. Posa’t amb la biologia que de veritat cau, segueix el pla i arriba tranquil el dia que importa.',
                              es: 'El examen tiene fecha. Tu plaza también. Ponte con la biología que de verdad cae, sigue el plan y llega tranquilo el día que importa.' },
    'final.cta':            { ca: 'Comença avui, gratis', es: 'Empieza hoy, gratis' },
    'final.tiny':           { ca: 'Sense targeta · Accés al temari i als primers exercicis · Cancel·la quan vulguis',
                              es: 'Sin tarjeta · Acceso al temario y a los primeros ejercicios · Cancela cuando quieras' },

    /* FAQ */
    'faq.h2':               { ca: 'El que t’estàs preguntant ara mateix.', es: 'Lo que te estás preguntando ahora mismo.' },
    'faq.q1':               { ca: 'Això és per a la Selectivitat de Catalunya en concret?', es: '¿Esto es para la Selectivitat de Catalunya en concreto?' },
    'faq.a1':               { ca: 'Sí, és l’únic que fa. Tot està muntat sobre els <b>continguts oficials de la Generalitat</b> per a la Biologia de la PAU, amb el format i el criteri de correcció catalans. Res de temari genèric d’altres comunitats que després no et serveix.',
                              es: 'Sí, es lo único que hace. Todo está montado sobre los <b>contenidos oficiales de la Generalitat</b> para la Biología de la PAU, con el formato y el criterio de corrección catalanes. Nada de temario genérico de otras comunidades que luego no te sirve.' },
    'faq.q2':               { ca: 'Vaig fatal de temps. Serveix igual?', es: 'Voy fatal de tiempo. ¿Sirve igual?' },
    'faq.a2':               { ca: 'Per això hi ha el pla per dies. Li dius quan és el teu examen i et diu <b>què fer avui</b>, encara que comencis tard. En comptes d’angoixar-te amb tot alhora, aprofites cada dia que et queda.',
                              es: 'Para eso está el plan por días. Le dices cuándo es tu examen y te dice <b>qué hacer hoy</b>, aunque empieces tarde. En vez de agobiarte con todo a la vez, aprovechas cada día que te queda.' },
    'faq.q3':               { ca: 'He de saber ja de biologia per començar?', es: '¿Tengo que saber ya de biología para empezar?' },
    'faq.a3':               { ca: 'No. El temari està explicat <b>des de zero</b> per entendre’l, i els exercicis van de menys a més. Comencis on comencis, et porta de la mà fins al nivell de l’examen.',
                              es: 'No. El temario está explicado <b>desde cero</b> para entenderlo, y los ejercicios van de menos a más. Empieces donde empieces, te lleva de la mano hasta el nivel del examen.' },
    'faq.q4':               { ca: 'Els exercicis s’assemblen de veritat a l’examen?', es: '¿Los ejercicios se parecen de verdad al examen?' },
    'faq.a4':               { ca: 'Estan fets calcant el <b>format i el criteri de correcció de la PAU</b>. Practiques just el tipus de pregunta que et posaran, i veus com es puntua cada part. Zero sorpreses el dia D.',
                              es: 'Están hechos calcando el <b>formato y el criterio de corrección de la PAU</b>. Practicas justo el tipo de pregunta que te van a poner, y ves cómo se puntúa cada parte. Cero sorpresas el día D.' },
    'faq.q5':               { ca: 'Puc provar abans de pagar?', es: '¿Puedo probar antes de pagar?' },
    'faq.a5':               { ca: 'Sí. Comences <b>gratis i sense targeta</b>, entres al temari i als primers exercicis, i decideixes tu si és el teu. Sense compromís i sense lletra petita.',
                              es: 'Sí. Empiezas <b>gratis y sin tarjeta</b>, entras al temario y a los primeros ejercicios, y decides tú si es lo tuyo. Sin compromiso y sin letra pequeña.' },

    /* ======================= AUTH / COMUNES DE FORMULARIO ======================= */
    'field.email':          { ca: 'Correu',            es: 'Email' },
    'field.email_ph':       { ca: 'el.teu@correu.com', es: 'tu@email.com' },
    'field.password':       { ca: 'Contrasenya',       es: 'Contraseña' },
    'field.password_ph':    { ca: 'La teva contrasenya', es: 'Tu contraseña' },
    'field.pw_rule':        { ca: 'Mínim 8 caràcters, amb una lletra i un número.', es: 'Al menos 8 caracteres, con una letra y un número.' },
    'field.pw_min_ph':      { ca: 'Mínim 8 caràcters', es: 'Mínimo 8 caracteres' },
    'field.pw_again':       { ca: 'Repeteix la contrasenya', es: 'Repite la contraseña' },
    'field.pw_again_ph':    { ca: 'Un altre cop',      es: 'Otra vez' },

    /* Login */
    'login.title':          { ca: 'Inicia sessió — BioPAU', es: 'Iniciar sesión — BioPAU' },
    'login.eyebrow':        { ca: 'Que bo tornar-te a veure', es: 'Bienvenido de nuevo' },
    'login.h1':             { ca: 'Inicia sessió.',     es: 'Inicia sesión.' },
    'login.sub':            { ca: 'Continua on ho vas deixar amb la biologia de la PAU.', es: 'Sigue donde lo dejaste con la biología de la PAU.' },
    'login.forgot':         { ca: 'Has oblidat la contrasenya?', es: '¿Has olvidado tu contraseña?' },
    'login.submit':         { ca: 'Inicia sessió',      es: 'Iniciar sesión' },
    'login.no_account':     { ca: 'Encara no tens compte?', es: '¿Aún no tienes cuenta?' },
    'login.create_free':    { ca: 'Crea’l gratis',      es: 'Créala gratis' },

    /* Registro */
    'reg.title':            { ca: 'Crea el compte — BioPAU', es: 'Crear cuenta — BioPAU' },
    'reg.eyebrow':          { ca: 'Crea el teu compte',  es: 'Crea tu cuenta' },
    'reg.h1':               { ca: 'Comença avui, gratis.', es: 'Empieza hoy, gratis.' },
    'reg.sub':              { ca: 'Sense targeta. Entra al temari i als primers exercicis i decideix tu.', es: 'Sin tarjeta. Accede al temario y a los primeros ejercicios y decide tú.' },
    'reg.username':         { ca: 'Nom d’usuari',       es: 'Nombre de usuario' },
    'reg.username_ph':      { ca: 'p. ex. laia_bio',    es: 'p. ej. laia_bio' },
    'reg.submit':           { ca: 'Crea el compte',     es: 'Crear cuenta' },
    'reg.have_account':     { ca: 'Ja tens compte?',    es: '¿Ya tienes cuenta?' },
    'reg.login_link':       { ca: 'Inicia sessió',      es: 'Inicia sesión' },

    /* Recuperar */
    'rec.title':            { ca: 'Recupera la contrasenya — BioPAU', es: 'Recuperar contraseña — BioPAU' },
    'rec.eyebrow':          { ca: 'Recupera l’accés',   es: 'Recuperar acceso' },
    'rec.h1':               { ca: 'Has oblidat la contrasenya?', es: '¿Olvidaste la contraseña?' },
    'rec.sub':              { ca: 'Escriu el teu correu i t’enviarem un enllaç per crear-ne una de nova.', es: 'Escribe tu email y te enviaremos un enlace para crear una nueva.' },
    'rec.submit':           { ca: 'Envia l’enllaç',     es: 'Enviar enlace' },
    'rec.back_login':       { ca: 'Torna a iniciar sessió', es: 'Volver a iniciar sesión' },

    /* Actualizar */
    'upd.title':            { ca: 'Nova contrasenya — BioPAU', es: 'Nueva contraseña — BioPAU' },
    'upd.eyebrow':          { ca: 'Nova contrasenya',   es: 'Nueva contraseña' },
    'upd.h1':               { ca: 'Tria una contrasenya nova.', es: 'Elige una contraseña nueva.' },
    'upd.sub':              { ca: 'Escriu-la dues vegades i desa-la.', es: 'Escríbela dos veces y guárdala.' },
    'upd.new_pw':           { ca: 'Contrasenya nova',   es: 'Nueva contraseña' },
    'upd.submit':           { ca: 'Desa la contrasenya', es: 'Guardar contraseña' },

    /* Precios */
    'prices.title':         { ca: 'Preus — BioPAU',     es: 'Precios — BioPAU' },
    'prices.h1':            { ca: 'Un pla. Tota la biologia que cau.', es: 'Un plan. Toda la biología que cae.' },
    'prices.sub':           { ca: 'Temari oficial, exercicis calcats a la PAU i el teu pla per dies. Cancel·la quan vulguis.', es: 'Temario oficial, ejercicios calcados a la PAU y tu plan por días. Cancela cuando quieras.' },
    'prices.m_tag':         { ca: 'Mensual',            es: 'Mensual' },
    'prices.m_name':        { ca: 'BioPAU Mensual',     es: 'BioPAU Mensual' },
    'prices.m_f1':          { ca: 'Temari complet i oficial', es: 'Temario completo y oficial' },
    'prices.m_f2':          { ca: 'Exercicis amb el criteri real de la PAU', es: 'Ejercicios con criterio real de la PAU' },
    'prices.m_f3':          { ca: 'Tracker de dies i planificació', es: 'Tracker de días y planificación' },
    'prices.m_f4':          { ca: 'Cancel·la quan vulguis', es: 'Cancela cuando quieras' },
    'prices.a_tag':         { ca: 'Anual · estalvia',   es: 'Anual · ahorra' },
    'prices.a_name':        { ca: 'BioPAU Anual',       es: 'BioPAU Anual' },
    'prices.a_f1':          { ca: 'Tot el del pla mensual', es: 'Todo lo del plan mensual' },
    'prices.a_f2':          { ca: 'Dos mesos gratis respecte al mensual', es: 'Dos meses gratis respecto al mensual' },
    'prices.a_f3':          { ca: 'Ideal per a tot el curs fins a la PAU', es: 'Ideal para todo el curso hasta la PAU' },
    'prices.a_f4':          { ca: 'Cancel·la quan vulguis', es: 'Cancela cuando quieras' },
    'prices.subscribe':     { ca: 'Subscriu-me',        es: 'Suscribirme' },
    'prices.subscribe_year':{ ca: 'Subscriu-me un any', es: 'Suscribirme un año' },
    'prices.note':          { ca: 'Pagament segur amb Stripe · No desem les dades de la teva targeta', es: 'Pago seguro con Stripe · No guardamos datos de tu tarjeta' },

    /* Checkout */
    'cs.title':             { ca: 'Pagament completat — BioPAU', es: 'Pago completado — BioPAU' },
    'cs.eyebrow':           { ca: 'Subscripció',        es: 'Suscripción' },
    'cs.h1':                { ca: 'Gràcies! 🎉',         es: '¡Gracias! 🎉' },
    'cs.checking':          { ca: 'Confirmant el pagament…', es: 'Confirmando tu pago…' },
    'cs.go_study':          { ca: 'Ves a l’àrea d’estudi', es: 'Ir al área de estudio' },
    'cs.see_account':       { ca: 'Veure el meu compte', es: 'Ver mi cuenta' },
    'cc.title':             { ca: 'Pagament cancel·lat — BioPAU', es: 'Pago cancelado — BioPAU' },
    'cc.h1':                { ca: 'El pagament s’ha cancel·lat.', es: 'El pago ha sido cancelado.' },
    'cc.sub':               { ca: 'No t’hem cobrat res. Quan vulguis, pots reprendre-ho.', es: 'No te hemos cobrado nada. Cuando quieras, puedes retomarlo.' },
    'cc.back_prices':       { ca: 'Torna als preus',    es: 'Volver a precios' },
    'cc.go_home':           { ca: 'Ves a l’inici',      es: 'Ir al inicio' },

    /* Mensajes dinámicos (checkout / precios) */
    'cs.msg_done':          { ca: 'Pagament completat correctament! Ja tens accés.', es: '¡Pago completado correctamente! Ya tienes acceso.' },
    'cs.msg_pending':       { ca: 'El teu pagament s’està confirmant. Pot trigar un moment; actualitza aquesta pàgina d’aquí a uns segons o revisa «El meu compte».', es: 'Tu pago se está confirmando. Puede tardar un momento; actualiza esta página en unos segundos o revisa «Mi cuenta».' },
    'cs.msg_login':         { ca: 'Inicia sessió per veure l’estat de la teva subscripció.', es: 'Inicia sesión para ver el estado de tu suscripción.' },
    'prices.msg_upgrade':   { ca: 'Necessites una subscripció activa per accedir a aquesta zona.', es: 'Necesitas una suscripción activa para acceder a esa zona.' },
    'prices.msg_active':    { ca: 'Ja tens una subscripció activa. Pots gestionar-la des de «El meu compte».', es: 'Ya tienes una suscripción activa. Puedes gestionarla desde «Mi cuenta».' },
    'prices.msg_already':   { ca: 'Ja tens una subscripció activa.', es: 'Ya tienes una suscripción activa.' },
    'prices.msg_processing':{ ca: 'Processant el pagament…', es: 'Procesando pago…' },
    'prices.msg_error':     { ca: 'No s’ha pogut iniciar el pagament. Torna-ho a provar.', es: 'No se pudo iniciar el pago. Inténtalo de nuevo.' },

    /* ======================= MI CUENTA ======================= */
    'acc.title':            { ca: 'El meu compte — BioPAU', es: 'Mi cuenta — BioPAU' },
    'acc.back':             { ca: 'Inici',                  es: 'Inicio' },
    'acc.eyebrow':          { ca: 'El meu compte',          es: 'Mi cuenta' },
    'acc.hello':            { ca: 'Hola de nou.',           es: 'Hola de nuevo.' },
    'acc.hello_sub':        { ca: 'Aquest és el teu espai a BioPAU.', es: 'Este es tu espacio en BioPAU.' },
    'acc.info_title':       { ca: 'Les teves dades',        es: 'Tus datos' },
    'acc.actions_title':    { ca: 'El teu compte',          es: 'Tu cuenta' },
    'acc.username':         { ca: 'Usuari',                 es: 'Usuario' },
    'acc.email':            { ca: 'Correu',                 es: 'Email' },
    'acc.member_since':     { ca: 'Membre des de',          es: 'Miembro desde' },
    'acc.status':           { ca: 'Estat del compte',       es: 'Estado de la cuenta' },
    'acc.plan':             { ca: 'Pla',                    es: 'Plan' },
    'acc.payment':          { ca: 'Pagament',               es: 'Pago' },
    'acc.go_study':         { ca: 'Ves a l’àrea d’estudi',  es: 'Ir al área de estudio' },
    'acc.subscribe':        { ca: 'Subscriu-me',            es: 'Suscribirme' },
    'acc.manage':           { ca: 'Gestiona la subscripció', es: 'Gestionar suscripción' },
    'acc.logout':           { ca: 'Tanca la sessió',        es: 'Cerrar sesión' },
    'acc.edit_title':       { ca: 'Edita les teves dades',  es: 'Editar datos' },
    'acc.username_label':   { ca: 'Nom d’usuari',           es: 'Nombre de usuario' },
    'acc.save':             { ca: 'Desa els canvis',        es: 'Guardar cambios' },
    /* estados / valores dinámicos */
    'acc.st_none':          { ca: 'Sense subscripció',      es: 'Sin suscripción' },
    'acc.st_active':        { ca: 'Activa',                 es: 'Activa' },
    'acc.st_trialing':      { ca: 'En prova',               es: 'En prueba' },
    'acc.st_past_due':      { ca: 'Pagament pendent',       es: 'Pago pendiente' },
    'acc.st_canceled':      { ca: 'Cancel·lada',            es: 'Cancelada' },
    'acc.st_incomplete':    { ca: 'Incompleta',             es: 'Incompleta' },
    'acc.st_unknown':       { ca: 'Desconegut',             es: 'Desconocido' },
    'acc.plan_annual':      { ca: 'Anual',                  es: 'Anual' },
    'acc.plan_monthly':     { ca: 'Mensual',                es: 'Mensual' },
    'acc.pay_paid':         { ca: 'Al dia',                 es: 'Al día' },
    'acc.pay_failed':       { ca: 'Fallit',                 es: 'Fallido' },
    /* mensajes account.js */
    'acc.msg_name_short':   { ca: 'L’usuari ha de tenir com a mínim 3 caràcters.', es: 'El usuario debe tener al menos 3 caracteres.' },
    'acc.msg_name_same':    { ca: 'Aquest ja és el teu nom d’usuari.', es: 'Ese ya es tu nombre de usuario.' },
    'acc.msg_name_taken':   { ca: 'Aquest nom ja està agafat.', es: 'Ese nombre ya está cogido.' },
    'acc.msg_name_error':   { ca: 'No s’ha pogut desar. Prova un altre nom.', es: 'No se pudo guardar. Prueba otro nombre.' },
    'acc.msg_name_ok':      { ca: 'Nom d’usuari actualitzat.', es: 'Nombre de usuario actualizado.' },
    'acc.msg_saving':       { ca: 'Desant…',                es: 'Guardando…' },
    'acc.msg_opening':      { ca: 'Obrint…',                es: 'Abriendo…' },
    'acc.msg_portal_error': { ca: 'No s’ha pogut obrir el portal.', es: 'No se pudo abrir el portal.' },

    /* ======================= ÁREA DE ESTUDIO (SHELL) ======================= */
    'sb.study':             { ca: 'Estudi',             es: 'Estudio' },
    'sb.account':           { ca: 'Compte',             es: 'Cuenta' },
    'nav.dashboard':        { ca: 'Tauler',             es: 'Panel' },
    'nav.apuntes':          { ca: 'Apunts',             es: 'Apuntes' },
    'nav.examenes':         { ca: 'Exàmens',            es: 'Exámenes' },
    'nav.calendario':       { ca: 'Calendari',          es: 'Calendario' },
    'nav.novedades':        { ca: 'Novetats',           es: 'Novedades' },
    'nav.avatar':           { ca: 'Avatar',             es: 'Avatar' },
    'nav.settings':         { ca: 'El meu compte',      es: 'Mi cuenta' },
    'nav.logout':           { ca: 'Surt',               es: 'Salir' },
    'tb.streak_title':      { ca: 'Dies seguits estudiant', es: 'Días seguidos estudiando' },
    'tb.change_avatar':     { ca: 'Canvia l’avatar',    es: 'Cambiar avatar' },
    'tb.day':               { ca: 'dia',                es: 'día' },
    'tb.days':              { ca: 'dies',               es: 'días' },
    'tb.home':              { ca: 'Web pública',        es: 'Web pública' },

    /* ---- Dashboard ---- */
    'dash.setup':           { ca: '<b>Falta un pas:</b> executa <code>supabase/dashboard-schema.sql</code> a l’SQL Editor de Supabase per desar el progrés, la ratxa i l’avatar. Mentrestant veuràs els comptadors a zero.',
                              es: '<b>Falta un paso:</b> ejecuta <code>supabase/dashboard-schema.sql</code> en el SQL Editor de Supabase para guardar el progreso, la racha y el avatar. Mientras tanto verás los contadores a cero.' },
    'dash.progress':        { ca: 'El teu progrés',     es: 'Tu progreso' },
    'dash.of_course':       { ca: 'del curs',           es: 'del curso' },
    'dash.stat_streak':     { ca: '🔥 Ratxa',           es: '🔥 Racha' },
    'dash.stat_best':       { ca: 'Millor ratxa',       es: 'Mejor racha' },
    'dash.stat_topics':     { ca: 'Temes',              es: 'Temas' },
    'dash.sel_bio':         { ca: 'Selectivitat · Biologia', es: 'Selectividad · Biología' },
    'dash.cd_running':      { ca: 'El compte enrere ja corre', es: 'La cuenta atrás ya corre' },
    'dash.cd_days':         { ca: 'Dies',               es: 'Días' },
    'dash.cd_hours':        { ca: 'Hores',              es: 'Horas' },
    'dash.cd_min':          { ca: 'Min',                es: 'Min' },
    'dash.cd_sec':          { ca: 'Seg',                es: 'Seg' },
    'dash.cd_note':         { ca: 'Data orientativa · s’ajustarà al calendari oficial', es: 'Fecha orientativa · se ajustará al calendario oficial' },
    'dash.study_area':      { ca: 'La teva àrea d’estudi', es: 'Tu área de estudio' },
    'dash.study_area_sub':  { ca: 'Tot el que necessites per preparar la PAU, en un sol lloc.', es: 'Todo lo que necesitas para preparar la PAU, en un solo sitio.' },

    'mod.apuntes_t':        { ca: 'Apunts',             es: 'Apuntes' },
    'mod.apuntes_p':        { ca: 'Tot el temari oficial, ordenat per blocs i llest per repassar.', es: 'Todo el temario oficial, ordenado por bloques y listo para repasar.' },
    'mod.apuntes_go':       { ca: 'Obre',               es: 'Abrir' },
    'mod.examenes_t':       { ca: 'Exàmens i exercicis', es: 'Exámenes y ejercicios' },
    'mod.examenes_p':       { ca: 'Exàmens de PAU per anys i exercicis classificats per tema.', es: 'Exámenes de PAU por años y ejercicios clasificados por tema.' },
    'mod.examenes_go':      { ca: 'Practica',           es: 'Practicar' },
    'mod.calendario_t':     { ca: 'Tracker / Calendari', es: 'Tracker / Calendario' },
    'mod.calendario_p':     { ca: 'Organitza els teus dies d’estudi i no perdis la ratxa.', es: 'Organiza tus días de estudio y no pierdas la racha.' },
    'mod.calendario_meta':  { ca: 'Planifica al teu ritme', es: 'Planifica a tu ritmo' },
    'mod.calendario_go':    { ca: 'Organitza',          es: 'Organizar' },

    'dash.sugg_sub':        { ca: 'Suggeriments per a tu', es: 'Sugerencias para ti' },
    'dash.sugg_h':          { ca: 'I ara què estudio?',  es: '¿Y ahora qué estudio?' },
    'dash.sugg_loading':    { ca: 'Analitzant el teu progrés…', es: 'Analizando tu progreso…' },
    'dash.sugg_empty':      { ca: 'Res pendent ara mateix. Bona feina!', es: 'Nada pendiente ahora mismo. ¡Buen trabajo!' },
    'dash.sugg_go':         { ca: 'Ves-hi →',           es: 'Ir →' },
    'dash.blocks_sub':      { ca: 'Per blocs',          es: 'Por bloques' },
    'dash.blocks_h':        { ca: 'Com portes el temari', es: 'Cómo llevas el temario' },
    'dash.loading':         { ca: 'Carregant…',         es: 'Cargando…' },
    'dash.preparing':       { ca: 'Preparant el teu panell', es: 'Preparando tu panel' },

    'modal.avatar_h':       { ca: 'Tria el teu avatar', es: 'Elige tu avatar' },
    'modal.avatar_p':       { ca: 'T’acompanyarà per tota la teva àrea d’estudi.', es: 'Te acompañará por toda tu área de estudio.' },
    'modal.cancel':         { ca: 'Cancel·la',          es: 'Cancelar' },
    'modal.save':           { ca: 'Desa',               es: 'Guardar' },

    /* Saludos dinámicos (nivel) */
    'dash.level_next':      { ca: 'Et falten {n} temes per a «{name}»', es: 'Te faltan {n} temas para «{name}»' },
    'dash.level_max':       { ca: 'Has arribat al nivell màxim! 🎉', es: '¡Has alcanzado el nivel máximo! 🎉' },
    'dash.level_prefix':    { ca: 'Nivell',             es: 'Nivel' },
    'dash.meta_temas':      { ca: '{t} temes · {b} blocs', es: '{t} temas · {b} bloques' },
    'dash.meta_conv':       { ca: '{n} convocatòries',  es: '{n} convocatorias' },

    /* Sugerencias (mensajes) */
    'sugg.inprogress':      { ca: 'El vas deixar a mitges. El remates avui?', es: 'Lo dejaste a medias. ¿Lo rematas hoy?' },
    'sugg.pending':         { ca: 'Encara no l’has tocat. Bon moment per començar.', es: 'Aún no lo has tocado. Buen momento para empezar.' },
    'sugg.review':          { ca: 'Fa {n} dies que no repasses això. Fes-hi un cop d’ull.', es: 'Hace {n} días que no repasas esto. Dale un vistazo.' },

    /* ---- Apuntes ---- */
    'ap.title':             { ca: 'Apunts — BioPAU', es: 'Apuntes — BioPAU' },
    'ap.h1':                { ca: 'Apunts',             es: 'Apuntes' },
    'ap.intro':             { ca: 'Tot el temari oficial, per blocs.', es: 'Todo el temario oficial, por bloques.' },
    'ap.hint':              { ca: 'Toca l’etiqueta d’estat de cada tema per marcar-lo com a <b>en curs</b> o <b>completat</b>. El teu progrés actualitza el nivell i els suggeriments del tauler.',
                              es: 'Toca la etiqueta de estado de cada tema para marcarlo como <b>en curso</b> o <b>completado</b>. Tu progreso actualiza el nivel y las sugerencias del panel.' },
    'ap.st_pending':        { ca: 'Pendent',            es: 'Pendiente' },
    'ap.st_inprogress':     { ca: 'En curs',            es: 'En curso' },
    'ap.st_done':           { ca: 'Completat',          es: 'Completado' },
    'ap.summary':           { ca: '{done} de {total} temes completats ({pct}%)', es: '{done} de {total} temas completados ({pct}%)' },

    /* ---- Exámenes ---- */
    'ex.title':             { ca: 'Exàmens — BioPAU',   es: 'Exámenes — BioPAU' },
    'ex.h1':                { ca: 'Exàmens i exercicis', es: 'Exámenes y ejercicios' },
    'ex.intro':             { ca: 'Convocatòries de la PAU ordenades per any. Filtra per bloc per practicar el que necessitis.', es: 'Convocatorias de la PAU ordenadas por año. Filtra por bloque para practicar lo que necesitas.' },
    'ex.all':               { ca: 'Tots',               es: 'Todos' },
    'ex.soon':              { ca: 'Pròximament',         es: 'Próximamente' },
    'ex.empty':             { ca: 'Encara no hi ha exàmens d’aquest bloc.', es: 'No hay exámenes de ese bloque todavía.' },
    'ex.foot':              { ca: 'Els enunciats i les pautes de correcció es publicaran aquí. Font oficial: ', es: 'Los enunciados y las pautas de corrección se irán publicando aquí. Fuente oficial: ' },
    'ex.conv_ord':          { ca: 'Ordinària',          es: 'Ordinaria' },
    'ex.conv_ext':          { ca: 'Extraordinària',     es: 'Extraordinaria' },
    'ex.view':              { ca: 'Veure',              es: 'Ver' },
    'ex.download':          { ca: 'Descarregar',        es: 'Descargar' },
    'ex.pregunta':          { ca: 'Pregunta',           es: 'Pregunta' },
    'ex.count_1':           { ca: '{n} convocatòria',   es: '{n} convocatoria' },
    'ex.count_n':           { ca: '{n} convocatòries',  es: '{n} convocatorias' },

    /* ---- Calendario ---- */
    'cal.title':            { ca: 'Calendari — BioPAU',  es: 'Calendario — BioPAU' },
    'cal.h1':               { ca: 'El teu calendari d’estudi', es: 'Tu calendario de estudio' },
    'cal.intro':            { ca: 'Marca els dies que estudies. Mantenir la ratxa és el que marca la diferència.', es: 'Marca los días que estudias. Mantener la racha es lo que marca la diferencia.' },
    'cal.setup':            { ca: '<b>Falta un pas:</b> executa <code>supabase/dashboard-schema.sql</code> a Supabase per desar els teus dies d’estudi.', es: '<b>Falta un paso:</b> ejecuta <code>supabase/dashboard-schema.sql</code> en Supabase para guardar tus días de estudio.' },
    'cal.leg_studied':      { ca: 'Dia estudiat',        es: 'Día estudiado' },
    'cal.leg_today':        { ca: 'Avui',                es: 'Hoy' },
    'cal.leg_pau':          { ca: 'Examen PAU',          es: 'Examen PAU' },
    'cal.marked_1':         { ca: '{n} dia marcat aquest mes', es: '{n} día marcado este mes' },
    'cal.marked_n':         { ca: '{n} dies marcats aquest mes', es: '{n} días marcados este mes' },
    /* Calendario v2 (vistas mes/semana) */
    'cal.setup2':           { ca: '<b>Falta un pas:</b> executa <code>supabase/calendar-schema.sql</code> a Supabase per desar anotacions, tasques i dates control.', es: '<b>Falta un paso:</b> ejecuta <code>supabase/calendar-schema.sql</code> en Supabase para guardar anotaciones, tareas y fechas de control.' },
    'cal.intro2':           { ca: 'Registra què estudies cada dia, marca les teves dates control i deixa que el sistema et digui què toca.', es: 'Registra qué estudias cada día, marca tus fechas de control y deja que el sistema te diga qué toca.' },
    'cal.view_month':       { ca: 'Mes',                 es: 'Mes' },
    'cal.view_week':        { ca: 'Setmana',             es: 'Semana' },
    'cal.today':            { ca: 'Avui',                es: 'Hoy' },
    'cal.leg_activity':     { ca: 'Dia amb activitat',   es: 'Día con actividad' },
    'cal.leg_control':      { ca: 'Data control',        es: 'Fecha de control' },
    'ap.blocks_intro':      { ca: 'Els 7 blocs oficials de la PAU de Biologia. Toca’n un per veure el detall.', es: 'Los 7 bloques oficiales de la PAU de Biología. Toca uno para ver el detalle.' },

    /* ---- Onboarding ---- */
    'ob.title':             { ca: 'Benvingut a bioPau',  es: 'Bienvenido a bioPau' },
    'ob.skip':              { ca: 'Ho faig després',     es: 'Saltar por ahora' },
    'ob.back':              { ca: 'Enrere',              es: 'Atrás' },
    'ob.next':              { ca: 'Continuar',           es: 'Continuar' },

    /* ---- Objetivo (dashboard) ---- */
    'obj.eyebrow':          { ca: 'El teu objectiu',     es: 'Tu objetivo' },
    'obj.enter':            { ca: 'Entrar a',            es: 'Entrar en' },
    'obj.univ':             { ca: 'Universitat objectiu', es: 'Universidad objetivo' },
    'obj.grade':            { ca: 'Nota objectiu',       es: 'Nota objetivo' },
    'obj.state':            { ca: 'Estat',               es: 'Estado' },
    'obj.state_empezando':  { ca: 'Començant',           es: 'Empezando' },
    'obj.state_habitos':    { ca: 'Construint hàbits',   es: 'Construyendo hábitos' },
    'obj.state_progreso':   { ca: 'En progrés',          es: 'En progreso' },
    'obj.state_cerca':      { ca: 'A prop de l’objectiu', es: 'Cerca del objetivo' },
    'obj.state_preparado':  { ca: 'Preparat',            es: 'Preparado' },
    'obj.state_conseguido': { ca: 'Objectiu aconseguit', es: 'Objetivo conseguido' },
    'obj.empty_t':          { ca: 'Encara no tens un objectiu', es: 'Aún no tienes un objetivo' },
    'obj.empty_s':          { ca: 'Digues-nos què vols estudiar i bioPau s’adaptarà a tu.', es: 'Cuéntanos qué quieres estudiar y bioPau se adaptará a ti.' },
    'obj.empty_cta':        { ca: 'Defineix el meu objectiu', es: 'Definir mi objetivo' },

    /* ---- Hub de perfil ---- */
    'pf.back_app':          { ca: 'Àrea d’estudi',       es: 'Área de estudio' },
    'pf.hi':                { ca: 'Hola,',               es: 'Hola,' },
    'pf.tab_profile':       { ca: 'Perfil',              es: 'Perfil' },
    'pf.tab_goal':          { ca: 'El meu objectiu',     es: 'Mi objetivo' },
    'pf.tab_custom':        { ca: 'Personalització',     es: 'Personalización' },
    'pf.tab_account':       { ca: 'Compte',              es: 'Cuenta' },
    'pf.personal':          { ca: 'Informació personal', es: 'Información personal' },
    'pf.nickname':          { ca: 'Com et diem',         es: 'Cómo te llamamos' },
    'pf.name':              { ca: 'Nom',                 es: 'Nombre' },
    'pf.surname':           { ca: 'Cognoms',             es: 'Apellidos' },
    'pf.phone':             { ca: 'Telèfon',             es: 'Teléfono' },
    'pf.birth':             { ca: 'Data de naixement',   es: 'Fecha de nacimiento' },
    'pf.city':              { ca: 'Ciutat',              es: 'Ciudad' },
    'pf.region':            { ca: 'Comunitat autònoma',  es: 'Comunidad autónoma' },
    'pf.school':            { ca: 'Institut / centre',   es: 'Instituto / centro' },
    'pf.course':            { ca: 'Curs',                es: 'Curso' },
    'pf.modality':          { ca: 'Modalitat',           es: 'Modalidad' },
    'pf.gender':            { ca: 'Com prefereixes que et tractem?', es: '¿Cómo prefieres que te tratemos?' },
    'pf.g_f':               { ca: 'Femení',              es: 'Femenino' },
    'pf.g_m':               { ca: 'Masculí',             es: 'Masculino' },
    'pf.g_n':               { ca: 'Neutre',              es: 'Neutro' },
    'pf.myfuture':          { ca: 'El meu futur',        es: 'Mi futuro' },
    'pf.goal_edit':         { ca: 'El teu objectiu',     es: 'Tu objetivo' },
    'pf.career':            { ca: 'Què vols estudiar?',  es: '¿Qué quieres estudiar?' },
    'pf.univ1':             { ca: 'Universitat objectiu', es: 'Universidad objetivo' },
    'pf.univ2':             { ca: 'Segona opció',        es: 'Segunda opción' },
    'pf.citygoal':          { ca: 'Ciutat on vols estudiar', es: 'Ciudad donde quieres estudiar' },
    'pf.grade':             { ca: 'Nota objectiu',       es: 'Nota objetivo' },
    'pf.reason':            { ca: 'Per què aquesta carrera?', es: '¿Por qué esa carrera?' },
    'pf.motivation':        { ca: 'La meva motivació',   es: 'Mi motivación' },
    'pf.tone_q':            { ca: 'Com vols que bioPau t’acompanyi?', es: '¿Cómo quieres que bioPau te acompañe?' },
    'pf.tone_prev':         { ca: 'Així et parlarà',     es: 'Así te hablará' },
    'pf.accent':            { ca: 'Color d’accent',      es: 'Color de acento' },
    'pf.avatar':            { ca: 'El teu avatar',       es: 'Tu avatar' },

    /* ---- Novedades ---- */
    'nv.title':             { ca: 'Novetats — BioPAU',   es: 'Novedades — BioPAU' },
    'nv.h1':                { ca: 'Novetats',            es: 'Novedades' },
    'nv.intro':             { ca: 'Tot el que anem afegint a BioPAU.', es: 'Todo lo que vamos añadiendo a BioPAU.' },
    'nv.active':            { ca: 'Actiu',               es: 'Activo' },
    'nv.inprogress':        { ca: 'En curs',             es: 'En curso' },
    'nv.planned':           { ca: 'Planificat',          es: 'Planificado' },
    'nv.1_t':               { ca: 'Àrea VIP amb progrés, ratxa i nivells', es: 'Área VIP con progreso, racha y niveles' },
    'nv.1_s':               { ca: 'Ja pots marcar temes completats, mantenir la ratxa i pujar de nivell.', es: 'Ya puedes marcar temas completados, mantener tu racha y subir de nivel.' },
    'nv.2_t':               { ca: 'Calendari d’estudi',  es: 'Calendario de estudio' },
    'nv.2_s':               { ca: 'Marca els teus dies d’estudi i visualitza quant falta per a la PAU.', es: 'Marca tus días de estudio y visualiza cuánto falta para la PAU.' },
    'nv.3_t':               { ca: 'Contingut dels apunts', es: 'Contenido de los apuntes' },
    'nv.3_s':               { ca: 'Cada tema tindrà el seu desenvolupament complet amb esquemes.', es: 'Cada tema tendrá su desarrollo completo con esquemas.' },
    'nv.4_t':               { ca: 'Preguntes aleatòries de repàs', es: 'Preguntas aleatorias de repaso' },
    'nv.4_s':               { ca: 'Pràctica ràpida basada en els temes que més et convé repassar.', es: 'Práctica rápida basada en los temas que más te conviene repasar.' },

    /* ======================= MENSAJES DE AUTENTICACIÓN ======================= */
    'auth.ld_register':     { ca: 'Creant el compte…',  es: 'Creando cuenta…' },
    'auth.ld_login':        { ca: 'Iniciant la sessió…', es: 'Iniciando sesión…' },
    'auth.ld_sending':      { ca: 'Enviant…',            es: 'Enviando…' },
    'auth.ld_saving':       { ca: 'Desant…',             es: 'Guardando…' },
    'auth.m_pick_user':     { ca: 'Tria un nom d’usuari.', es: 'Elige un nombre de usuario.' },
    'auth.m_user_short':    { ca: 'L’usuari ha de tenir com a mínim 3 caràcters.', es: 'El usuario debe tener al menos 3 caracteres.' },
    'auth.m_email':         { ca: 'Introdueix un correu vàlid.', es: 'Introduce un email válido.' },
    'auth.m_pw_len':        { ca: 'La contrasenya ha de tenir com a mínim 8 caràcters.', es: 'La contraseña debe tener al menos 8 caracteres.' },
    'auth.m_pw_mix':        { ca: 'Fes servir com a mínim una lletra i un número.', es: 'Usa al menos una letra y un número.' },
    'auth.m_pw_match':      { ca: 'Les contrasenyes no coincideixen.', es: 'Las contraseñas no coinciden.' },
    'auth.m_user_taken':    { ca: 'Aquest nom d’usuari ja està agafat.', es: 'Ese nombre de usuario ya está cogido.' },
    'auth.m_email_exists':  { ca: 'Aquest correu ja té compte. Inicia la sessió.', es: 'Ese email ya tiene cuenta. Inicia sesión.' },
    'auth.m_created_in':    { ca: 'Compte creat! Entrant…', es: '¡Cuenta creada! Entrando…' },
    'auth.m_created_confirm': { ca: 'Compte creat. T’hem enviat un correu per confirmar la teva adreça. Obre’l i després inicia la sessió.', es: 'Cuenta creada. Te hemos enviado un email para confirmar tu dirección. Ábrelo y luego inicia sesión.' },
    'auth.m_create_fail':   { ca: 'No s’ha pogut crear el compte. Torna-ho a provar.', es: 'No se pudo crear la cuenta. Inténtalo de nuevo.' },
    'auth.m_pw_write':      { ca: 'Escriu la teva contrasenya.', es: 'Escribe tu contraseña.' },
    'auth.m_confirm_email': { ca: 'Confirma el teu correu abans d’entrar (revisa la safata).', es: 'Confirma tu email antes de entrar (revisa tu bandeja).' },
    'auth.m_bad_login':     { ca: 'El correu o la contrasenya no són correctes.', es: 'El email o la contraseña no son correctos.' },
    'auth.m_logged_in':     { ca: 'Sessió iniciada. Redirigint…', es: 'Sesión iniciada. Redirigiendo…' },
    'auth.m_recover_sent':  { ca: 'Si aquest correu té compte, t’hem enviat un enllaç per restablir la contrasenya. Revisa la safata (i el correu brossa).', es: 'Si ese email tiene cuenta, te hemos enviado un enlace para restablecer la contraseña. Revisa tu bandeja (y spam).' },
    'auth.m_link_ok':       { ca: 'Enllaç vàlid. Escriu la nova contrasenya.', es: 'Enlace válido. Escribe tu nueva contraseña.' },
    'auth.m_link_bad':      { ca: 'L’enllaç no és vàlid o ha caducat. Demana’n un de nou.', es: 'El enlace no es válido o ha caducado. Solicita uno nuevo.' },
    'auth.m_pw_updated':    { ca: 'Contrasenya actualitzada. Redirigint al teu compte…', es: 'Contraseña actualizada. Redirigiendo a tu cuenta…' }
  };

  /* ---------- Estado -------------------------------------------------------- */
  function read() {
    try { var v = localStorage.getItem(STORE_KEY); if (v && LANGS.indexOf(v) !== -1) return v; }
    catch (e) {}
    return DEFAULT;
  }
  var current = read();

  function get() { return current; }

  function t(key, vars) {
    var entry = DICT[key];
    var s = entry ? (entry[current] != null ? entry[current] : entry[DEFAULT]) : key;
    if (vars) { for (var k in vars) if (vars.hasOwnProperty(k)) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]); }
    return s;
  }

  /* ---------- Aplicar traducciones a un subárbol ---------------------------- */
  function apply(root) {
    root = root || document;

    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v != null) el.textContent = v;
    });
    root.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-html'));
      if (v != null) el.innerHTML = v;
    });
    root.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var bits = pair.split(':');
        if (bits.length === 2) {
          var attr = bits[0].trim(), key = bits[1].trim();
          var v = t(key);
          if (v != null) el.setAttribute(attr, v);
        }
      });
    });

    // <title> y <html lang> a nivel documento
    if (root === document) {
      document.documentElement.setAttribute('lang', current);
      var titleEl = document.querySelector('title[data-i18n]');
      if (titleEl) titleEl.textContent = t(titleEl.getAttribute('data-i18n'));
    }
    syncSwitchers();
  }

  /* ---------- Cambiar de idioma -------------------------------------------- */
  function set(lang) {
    if (LANGS.indexOf(lang) === -1 || lang === current) return;
    current = lang;
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
    apply(document);
    // Aviso para que módulos con contenido dinámico (dashboard, shell…) repinten
    document.dispatchEvent(new CustomEvent('bp:langchange', { detail: { lang: lang } }));
  }

  /* ---------- Banderas (SVG en línea, sin imágenes externas) ---------------- */
  var FLAG = {
    // Senyera: fons groc amb 4 barres vermelles (9 franges).
    ca: '<svg viewBox="0 0 30 20" class="flag" aria-hidden="true">' +
          '<rect width="30" height="20" rx="2.5" fill="#FCDD09"/>' +
          '<g fill="#DA121A"><rect y="2.22" width="30" height="2.22"/><rect y="6.67" width="30" height="2.22"/>' +
          '<rect y="11.11" width="30" height="2.22"/><rect y="15.56" width="30" height="2.22"/></g></svg>',
    // Bandera d’Espanya: vermell – groc (doble) – vermell.
    es: '<svg viewBox="0 0 30 20" class="flag" aria-hidden="true">' +
          '<rect width="30" height="20" rx="2.5" fill="#AA151B"/>' +
          '<rect y="5" width="30" height="10" fill="#F1BF00"/></svg>'
  };

  function switcherHTML() {
    return '<div class="lang-switch" role="group" aria-label="' + t('lang.aria') + '">' +
      LANGS.map(function (l) {
        return '<button type="button" class="lang-opt" data-lang="' + l + '" aria-pressed="false">' +
          FLAG[l] + '<span>' + t('lang.' + l) + '</span></button>';
      }).join('') +
    '</div>';
  }

  function mount() {
    document.querySelectorAll('[data-lang-switch]').forEach(function (host) {
      if (host.getAttribute('data-lang-ready')) return;
      host.innerHTML = switcherHTML();
      host.setAttribute('data-lang-ready', '1');
      host.querySelectorAll('.lang-opt').forEach(function (btn) {
        btn.addEventListener('click', function () { set(btn.getAttribute('data-lang')); });
      });
    });
    syncSwitchers();
  }

  function syncSwitchers() {
    document.querySelectorAll('.lang-switch').forEach(function (sw) {
      sw.querySelectorAll('.lang-opt').forEach(function (btn) {
        var on = btn.getAttribute('data-lang') === current;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
  }

  /* ---------- Arranque ------------------------------------------------------ */
  function boot() { mount(); apply(document); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return { t: t, get: get, set: set, apply: apply, mount: mount, DICT: DICT, LANGS: LANGS };
})();
