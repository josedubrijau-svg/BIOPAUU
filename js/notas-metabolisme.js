/* ============================================================================
   BioPAU — Contingut del bloc "Metabolisme"
   4 temes independents (com 4 documents propis). Cada un té la seva
   navegació, contingut i qüestionari de repàs.
   Bloc "Biomolècules" queda a part (pendent, altra sessió).
   ============================================================================ */
window.BIOPAU_NOTES = window.BIOPAU_NOTES || {};

window.BIOPAU_NOTES.metabolisme = {
  temas: [
    {
      titulo: 'Tema 1',
      subtitol: 'El control del metabolisme',
      resumen: 'Enzims, ATP, activitat enzimàtica, inhibidors i regulació.',
      navLabels: ['0. Metabolisme cel·lular', '0.1 ATP i control del metabolisme', '0.2 Activitat enzimàtica', '0.3 Centre actiu i especificitat', '0.4 Especificitat i cinètica', '0.5 Factors', '0.6 Inhibidors', '0.7 Al·lostèria i regulació', '0.8 Disposició espacial', '0.9 Coenzims', '0.10 Vitamines', '0.11 Nomenclatura'],
      html: `<section id="s1" class="note-section active-section">
      <span class="section-kicker green">INTRO — 0</span><h3>Metabolisme cel·lular</h3>
      <div class="definition"><strong>Metabolisme</strong><p>És el conjunt de reaccions químiques de l'interior de la cèl·lula que permeten produir matèria i energia per poder dur a terme les tres funcions vitals: <b>reproduir-se, nodrir-se i relacionar-se.</b></p></div>
      <div class="two-col"><div><h4>Matèria</h4><p>Necessitem matèria per créixer i per regenerar-se.</p></div><div><h4>Energia</h4><p>S'emmagatzema en els enllaços químics de molècules com l'<b>ATP</b> i l'ADP. Es transforma en energia mecànica, elèctrica o calorífica.</p></div></div>
      <div class="callout"><b>Autopoètics</b> — Les cèl·lules tenen mecanismes per produir per si mateixes els materials necessaris per al seu metabolisme. Són la unitat mínima de vida estructural i funcional.</div>
      <h4>Reaccions químiques</h4><div class="reaction">A <span>→</span> B <span>→</span> C</div><p>Hi ha enzims específics per a cada reacció.</p>
      <div class="definition"><strong>Via metabòlica</strong><p>És una seqüència de reaccions. En destaquen dos tipus:</p><div class="two-col"><div><h4>Catabolisme</h4><p>Degradació i oxidació de substàncies complexes en altres de més senzilles. <b>Desprèn energia</b>. És convergent.</p></div><div><h4>Anabolisme</h4><p>Substàncies senzilles es transformen en altres de més complexes. <b>Consumeix energia</b>. És divergent.</p></div></div></div>
    </section>
<section id="s2" class="note-section"><span class="section-kicker blue">INTRO — 0.1</span><h3>ATP i el control del metabolisme</h3>
      <div class="definition"><strong>Adenosina trifosfat (ATP)</strong><p>Nucleòtid que emmagatzema energia per a un ús immediat.</p><div class="reaction">ATP → ADP + Pᵢ + 7,3 kcal/mol</div></div>
      <div class="definition"><strong>Enzims (biocatalitzadors)</strong><p>Faciliten i permeten les reaccions del metabolisme sense consumir-se.</p></div>
      <h4>Característiques dels enzims</h4><ul class="checklist"><li>Augmenten la velocitat de reacció, no la quantitat de producte.</li><li>No es consumeixen: intervenen i queden intactes.</li><li>Actuen a temperatura ambient.</li><li>Són específics d'una reacció o grup de substrats.</li><li>Són proteïnes d'elevat pes molecular, amb excepcions.</li></ul>
      <h4>Tipus d'enzims</h4><div class="two-col"><div><b>Estrictament proteics</b><p>Formats per cadenes polipeptídiques.</p></div><div><b>Holoenzims</b><p>Part proteica (apoenzim) + cofactor (orgànic o inorgànic).</p></div></div>
    </section>
<section id="s3" class="note-section"><span class="section-kicker purple">INTRO — 0.2</span><h3>L'activitat enzimàtica</h3><p>La substància sobre la qual actua l'enzim és el <b>substrat</b>.</p><div class="steps"><div><b>01</b><span>El substrat i l'enzim s'uneixen pel centre actiu.</span></div><div><b>02</b><span>Es formen enllaços febles: complex ES.</span></div><div><b>03</b><span>Baixa l'energia d'activació i es forma el complex EP.</span></div><div><b>04</b><span>S'alliberen els productes i l'enzim queda intacte.</span></div></div><div class="formula big">S + E → ES → EP → E + P</div>
      <div class="energy-card"><h4>Energia d'activació</h4><div class="energy-visual"><div class="curve high">Sense enzim</div><div class="curve low">Amb enzim</div></div><p>L'enzim ofereix una via amb menor energia d'activació; no canvia el balanç energètic global.</p></div>
    </section>
<section id="s4" class="note-section"><span class="section-kicker pink">INTRO — 0.3</span><h3>El centre actiu i l'especificitat</h3>
      <div class="active-site"><div class="enzyme-shape"><span>Centre actiu</span></div><div><h4>Centre actiu</h4><p>Regió tridimensional, molt petita respecte al volum total de l'enzim, on s'uneix el substrat.</p></div></div>
      <div class="two-col"><div><h4>Aminoàcids de fixació</h4><p>Enllaços febles amb el substrat.</p></div><div><h4>Aminoàcids de catàlisi</h4><p>Provoquen la ruptura d'algun enllaç.</p></div></div>
      <div class="model-box"><b>Model de l'ajust induït</b><p>L'enzim canvia de forma i s'adapta al substrat.</p></div>
    </section>
<section id="s5" class="note-section"><span class="section-kicker green">INTRO — 0.4</span><h3>Especificitat i cinètica</h3>
      <div class="chips"><span>Totalment específic per un substrat</span><span>Específic per grup — ex. grup fosfat</span></div>
      <p>La velocitat de reacció és més ràpida com més enzims estan units a substrat. S'arriba a la <b>V. màxima</b> quan tots els enzims estan units a un substrat.</p>
      <div class="graph-card"><div class="fake-graph"><div class="curve-line"></div><span class="axis-x">Concentració de substrat</span><span class="axis-y">V. de reacció</span><span class="km">Km</span><span class="vmax">V. màxima</span></div><div><h4>Constant de Michaelis (Km)</h4><p>Concentració de substrat a la meitat de la velocitat màxima.</p><div class="formula">Km = [substrat] a ½ V. màxima</div></div></div>
    </section>
<section id="s6" class="note-section"><span class="section-kicker blue">INTRO — 0.5</span><h3>Factors que afecten l'activitat enzimàtica</h3><div class="factor"><b>01 — Temperatura</b><p>Més temperatura augmenta la mobilitat i la probabilitat de trobada substrat-enzim, fins que les proteïnes es desnaturalitzen. Cada enzim té una <b>T òptima</b> (aprox. 40 °C).</p></div><div class="factor"><b>02 — pH</b><p>Hi ha un rang de pH funcional i un pH òptim per a cada enzim.</p></div><div class="callout"><b>Idea clau:</b> temperatura i pH poden modificar la forma de les proteïnes i, per tant, l'activitat enzimàtica.</div></section>
<section id="s7" class="note-section"><span class="section-kicker red">INTRO — 0.6</span><h3>Inhibidors enzimàtics</h3><p>Substàncies que disminueixen o aturen l'activitat enzimàtica. Exemples: penicil·lina i AZT.</p><div class="two-col"><div class="model-box"><h4>Irreversibles</h4><p>Unió permanent; l'enzim deixa de funcionar.</p></div><div class="model-box"><h4>Reversibles</h4><p>Unió temporal; l'enzim torna a funcionar.</p></div></div><div class="two-col"><div><h4>Competitius</h4><p>S'assemblen al substrat i s'uneixen al centre actiu.</p></div><div><h4>No competitius</h4><p>No competeixen pel centre actiu; impedeixen l'entrada/sortida del substrat.</p></div></div></section>
<section id="s8" class="note-section"><span class="section-kicker purple">INTRO — 0.7</span><h3>Enzims al·lostèrics i regulació</h3><div class="definition"><strong>Enzims al·lostèrics</strong><p>Tenen forma activa i inactiva, i un centre regulador separat del centre actiu.</p></div><div class="model-box"><b>Cooperativisme</b><p>Quan un centre regulador s'activa, ho fan totes les subunitats de l'enzim.</p></div>
      <div class="two-col"><div><h4>Regulació gènica</h4><p>La cèl·lula augmenta o disminueix un enzim a partir dels gens.</p></div><div><h4>Retroinhibició (feedback)</h4><p>El producte final de la via inactiva l'enzim inicial.</p></div></div>
      <div class="pathway"><span>Substrat inicial</span><b>Enzim 1</b><span>Intermediari A</span><b>Enzim 2</b><span>Intermediari B</span><b>Enzim 3</b><span>Producte final ↺</span></div>
    </section>
<section id="s9" class="note-section"><span class="section-kicker green">INTRO — 0.8</span><h3>Disposició espacial dels enzims</h3><div class="three-cards"><div><b>Compartimentació</b><p>Separar per membranes vies que no volem relacionar (ex. àcids grassos: síntesi al citoplasma, degradació als mitocondris).</p></div><div><b>Complex multienzimàtic</b><p>Enzims successius units per ser més eficients.</p></div><div><b>Inclusió a les membranes</b><p>Enzims ordenats successivament a les membranes.</p></div></div></section>
<section id="s10" class="note-section"><span class="section-kicker pink">INTRO — 0.9</span><h3>Els coenzims</h3><p>Cofactor orgànic que s'uneix a l'apoenzim; actua com a donador o receptor de grups químics.</p><div class="two-col"><div><h4>Unió feble</h4><p>Enllaços febles, es pot separar amb facilitat.</p></div><div><h4>Grup prostètic</h4><p>Enllaços covalents i permanents.</p></div></div><div class="two-col"><div><b>Oxidació i reducció</b><p>Transporten protons i electrons. Ex.: NAD⁺, NADP⁺.</p></div><div><b>De transferència</b><p>Transporten radicals. Ex.: ATP, acetil-CoA.</p></div></div></section>
<section id="s11" class="note-section"><span class="section-kicker orange">INTRO — 0.10</span><h3>Vitamines</h3><p>Molècules orgàniques que s'han d'obtenir per la dieta.</p><div class="two-col"><div><h4>Liposolubles</h4><ul><li><b>A</b>: pell i visió.</li><li><b>D</b>: metabolisme del calci.</li><li><b>K</b>: coagulació.</li></ul></div><div><h4>Hidrosolubles</h4><ul><li><b>B</b>: formació de glòbuls vermells.</li><li><b>C</b>: col·lagen; el dèficit causa escorbut.</li></ul></div></div></section>
<section id="s12" class="note-section"><span class="section-kicker green">INTRO — 0.11</span><h3>Nomenclatura dels enzims</h3><p>Patró <b>substrat + coenzim + funció</b>, o <b>substrat + sufix</b>, o noms antics.</p><div class="final-box"><span></span><div><b>Objectiu de la introducció</b><p>Entendre com els enzims i l'ATP controlen, regulen i organitzen les reaccions metabòliques abans d'entrar al catabolisme i l'anabolisme.</p></div></div></section>`,
      quiz: [
    ['Què és el metabolisme cel·lular?', ['El conjunt de reaccions químiques de l\u2019interior de la cèl·lula', 'Només la digestió', 'Només la respiració'], 0],
    ['Quina molècula emmagatzema energia per a un ús immediat?', ['ADN', 'ATP', 'Col·lagen'], 1],
    ['Què representa la Km d\u2019un enzim?', ['La concentració de substrat a ½ de la V. màxima', 'La temperatura màxima', 'La quantitat d\u2019enzim'], 0],
    ['Un inhibidor competitiu...', ['S\u2019assembla al substrat i ocupa el centre actiu', 'Sempre és irreversible', 'Mai afecta la V. màxima'], 0],
    ['Un enzim al·lostèric té...', ['Un centre regulador separat del centre actiu', 'Només centre actiu', 'Sempre és un cofactor'], 0]
  ]
    },
    {
      titulo: 'Tema 2',
      subtitol: 'El catabolisme',
      resumen: 'Glicòlisi, cicle de Krebs, cadena respiratòria, β-oxidació i fermentacions.',
      navLabels: ['1. Biomolècules energètiques', '2. Concepte i balanç energètic', '3. La glicòlisi', '4. Cicle de Krebs', '5. Cadena transportadora d’electrons', '6. Balanç energètic total', '7. Catabolisme dels lípids', '8. Catabolisme dels àcids nucleics', '9. Catabolisme de les proteïnes', '10. Catabolisme per fermentació', '11. Respiració anaeròbica'],
      html: `<section id="s1" class="note-section active-section"><span class="section-kicker blue">1.1 — 1</span><h3>Les biomolècules energètiques</h3>
      <div class="table-like"><b>Aigua</b><span>65%</span><span>Citosol (intra/extracel·lular)</span><b>Proteïnes</b><span>18%</span><span>Múscul, tendons, ossos / energia</span><b>Lípids</b><span>12%</span><span>Teixit adipós / reserva d'energia</span><b>Sals minerals</b><span>5%</span><span>Es troben a molts llocs</span><b>Glúcids</b><span>0,3%</span><span>Energia immediata</span></div>
      <div class="callout"><b>La cèl·lula</b> degrada més fàcilment els glúcids i no produeix subproductes tòxics (a diferència de proteïnes i alguns lípids). <b>Les neurones només es nodreixen de glucosa.</b> Les biomolècules més importants com a font d'energia són <b>glúcids i lípids</b>.</div>
      <h4>Els glúcids com a font d'energia</h4><p>El més conegut és la <b>D-glucosa</b>. En medi aquós i a pH 7 pren la forma cíclica <b>α-D-glucopiranosa</b>.</p>
      <div class="two-col"><div><h4>Unió de glucoses</h4><p>Dues glucoses α formen la <b>maltosa</b> (disacàrid). Centenars de maltoses formen <b>polisacàrids</b>: amilosa i amilopectina (vegetals) o glicogen (animals, reserva de midó).</p></div><div><h4>Enllaç β</h4><p>Si l'enllaç és β, centenars formen <b>cel·lulosa</b>. Els humans no tenim enzims per degradar aquest enllaç.</p></div></div>
      <div class="chips"><span>Lípids: doble d'energia que els glúcids</span><span>Ex: olis vegetals i greixos animals</span></div>
    </section>
<section id="s2" class="note-section"><span class="section-kicker purple">1.1 — 2</span><h3>Concepte de catabolisme i balanç energètic</h3>
      <div class="definition"><strong>Catabolisme</strong><p>Fase degradant del metabolisme que obté energia. Molècules complexes → molècules senzilles → productes finals d'excreció.</p></div>
      <p>L'energia alliberada s'emmagatzema a l'ATP i s'utilitza per a funcions cel·lulars (mecàniques, sistema nerviós…) o per a l'anabolisme.</p>
      <div class="formula">A → B + C &nbsp; ΔG = G2 − G1 &nbsp; (ΔG &lt; 0: increment negatiu → s'allibera energia)</div>
      <h4>Les reaccions catabòliques són reaccions redox</h4>
      <div class="two-col"><div><b>S'oxida</b><p>Quan una molècula <b>perd</b> electrons.</p></div><div><b>Es redueix</b><p>Quan una molècula <b>guanya</b> electrons.</p></div></div>
      <div class="reaction">C₆H₁₂O₆ + 6O₂ <span>→</span> 6CO₂ + 6H₂O <i>(agent reductor: glucosa — agent oxidant: O₂)</i></div>
      <h4>Alliberació gradual d'energia</h4><ul class="checklist"><li>Es produeixen reaccions successives, cadascuna catalitzada per un enzim (no totes de cop com en una combustió).</li><li>Els electrons del carboni no passen directament a l'oxigen: passen per una cadena transportadora, baixant de nivell energètic a cada pas i sintetitzant ATP.</li></ul>
    </section>
<section id="s3" class="note-section"><span class="section-kicker pink">1.1 — 3</span><h3>La glicòlisi</h3>
      <p>Primera part del catabolisme de la glucosa: una glucosa es divideix en 2 piruvats (àcid pirúvic, CH₃-CO-COOH). Té lloc al <b>citosol</b>.</p>
      <div class="steps"><div><b>Fase consum</b><span>Es consumeixen 2 ATP</span></div><div><b>Fase producció</b><span>Es produeixen 4 ATP i 2 NADH</span></div><div><b>Balanç net</b><span>2 ATP (4−2)</span></div><div><b>Resultat</b><span>2 piruvats + 2 H₂O</span></div></div>
      <div class="formula">2NAD⁺ + 4H → 2NADH + 2H⁺</div>
      <div class="table-like"><b>Consum</b><span>2 ADP+2Pi → 2ATP</span><span>—</span><b>Producció</b><span>4ADP+4Pi → 4ATP</span><span>2NAD⁺+4H → 2NADH+2H⁺</span></div>
      <div class="callout">Glucosa → (glicòlisi, citosol) → 2 piruvats + 2 ATP net + 2 NADH</div>
    </section>
<section id="s4" class="note-section"><span class="section-kicker orange">1.1 — 4</span><h3>El cicle de Krebs</h3>
      <p>Primera etapa de la respiració dins del mitocondri. Els piruvats entren per transport actiu i es transformen en <b>Acetil-CoA</b> (reacció pont, amb descarboxilació del piruvat).</p>
      <div class="reaction">Piruvat + NAD⁺ + CoA <span>→</span> Acetil-CoA + NADH + CO₂</div>
      <p>El cicle comença amb <b>oxalacetat</b> i Acetil-CoA (que li transfereix el grup acetil per formar citrat). Després de 8 intermediaris (citrat → isocitrat → α-cetoglutarat → succinil-CoA → succinat → fumarat → malat → oxalacetat) es regenera l'oxalacetat: és un cicle.</p>
      <div class="table-like"><b>Balanç per volta</b><span>3 NADH</span><span>1 FADH₂</span><b>+</b><span>1 GTP (=1 ATP)</span><span>2 CO₂</span></div>
      <div class="callout">Com que una glucosa dóna 2 piruvats i cada un es transforma en 1 Acetil-CoA, el cicle de Krebs <b>fa 2 voltes per glucosa</b>.</div>
    </section>
<section id="s5" class="note-section"><span class="section-kicker red">1.1 — 5</span><h3>La cadena transportadora d'electrons</h3>
      <p>Segona i última etapa de la respiració: oxida tots els coenzims reduïts (NADH i FADH₂). Es dona a la <b>membrana interna del mitocondri (crestes)</b>, formada per 4 grans complexos proteics (I-IV), una petita molècula lipídica que transporta electrons de la I/II a la III, i el citocrom c que connecta la III amb la IV.</p>
      <ul class="checklist"><li>Un enzim deshidrogenant transporta electrons de la glucosa en forma d'hidrogen: NAD⁺ passa a NADH.</li><li>El NADH cedeix 2 electrons a la cadena de citocroms; en cada baixada de nivell es sintetitza ATP.</li><li>Al final de la cadena, els electrons passen a l'oxigen, que s'uneix a protons lliures i forma H₂O.</li></ul>
      <h4>Quimiosmosi i fosforilació oxidativa</h4><p>El transport d'electrons bombeja hidrogens a l'espai intermembranós. Quan la concentració és molt alta, els protons tornen a la matriu per l'<b>ATP sintasa</b>, que sintetitza ATP (4 subunitats, 3 llocs catalítics per hidrogen).</p>
      <div class="three-cards"><div><b>Cadena d'electrons</b><p>El NADH i el FADH₂ redueixen electrons que van baixant de nivell i produeixen energia.</p></div><div><b>Quimiosmosi</b><p>Amb l'energia es bombegen protons a l'espai intermembranós.</p></div><div><b>Fosforilació oxidativa</b><p>Quan la concentració de protons és alta, surten per l'ATP sintasa i es formen 3 ATP.</p></div></div>
      <h4>Tipus de metabolisme segons l'acceptor final</h4>
      <div class="table-like"><b>Respiració aeròbica</b><span>Acceptor: O₂</span><span>Cadena d'electrons: sí</span><b>Respiració anaeròbica</b><span>Acceptor: sulfat/nitrat</span><span>Cadena d'electrons: sí</span><b>Fermentació</b><span>Acceptor: compost orgànic</span><span>Cadena d'electrons: no</span></div>
    </section>
<section id="s6" class="note-section"><span class="section-kicker blue">1.1 — 6</span><h3>Balanç energètic total de la respiració</h3>
      <div class="table-like"><b>Per cada</b><span>ATP generats</span><span>—</span><b>NADH</b><span>3 ATP</span><span>—</span><b>FADH₂</b><span>2 ATP</span><span>—</span><b>GTP</b><span>1 ATP</span></div>
      <div class="callout"><b>Resum del catabolisme de la glucosa:</b> Glicòlisi (2 ATP + 2 NADH) + 2× reacció pont (2 NADH) + 2× cicle de Krebs (6 NADH + 2 FADH₂ + 2 GTP) → 10 NADH×3 + 2 FADH₂×2 + 2 GTP×1 + 2 ATP net = <b>38 ATP totals</b> per molècula de glucosa.</div>
      <p>En cèl·lules <b>procariotes</b>, la glicòlisi i el cicle de Krebs succeeixen al citosol, i la cadena transportadora a la membrana cel·lular. En <b>eucariotes</b>: glicòlisi al citosol, cicle de Krebs a la matriu mitocondrial, cadena a la cresta mitocondrial.</p>
    </section>
<section id="s7" class="note-section"><span class="section-kicker purple">1.1 — 7</span><h3>Catabolisme dels lípids: β-oxidació</h3>
      <p>Els lípids són la principal reserva energètica (el doble d'energia que glúcids i proteïnes). Via catabòlica principal: <b>oxidació dels àcids grassos</b> provinents de la hidròlisi (lipòlisi) dels triglicèrids en àcids grassos + glicerina.</p>
      <p>La β-oxidació es fa a la <b>matriu mitocondrial</b>. Com els àcids grassos no poden travessar la membrana, s'uneixen a un CoA (<b>activació de l'àcid gras</b>, cost de 2 ATP). Cadena curta: entra directament. Cadena llarga: s'uneix a la carnitina, que la transporta.</p>
      <div class="callout">En cada volta d'hèlix: es trenquen 2 carbonis, es desprèn un Acetil-CoA, i es forma un NADH i un FADH₂.</div>
      <h4>Exemple: àcid palmític (16 carbonis)</h4>
      <div class="table-like"><b>Voltes d'hèlix</b><span>7</span><span>—</span><b>Acetil-CoA formats</b><span>8</span><span>—</span></div>
      <h4>Balanç energètic total</h4>
      <div class="table-like"><b>Entrada mitocondri</b><span>−2 ATP</span><span>(activació)</span><b>8 Acetil-CoA → Krebs</b><span>1GTP+3NADH+1FADH₂ ×8 = 96 ATP</span><span>—</span><b>7 voltes β-oxidació</b><span>7NADH×3 + 7FADH₂×2 = 35 ATP</span><span>—</span><b>Total</b><span><b>129 ATP</b></span><span>—</span></div>
    </section>
<section id="s8" class="note-section"><span class="section-kicker pink">1.1 — 8</span><h3>Catabolisme dels àcids nucleics</h3>
      <p>A l'aparell digestiu, els àcids nucleics es degraden fins a nucleòtids; amb més enzims digestius se separen en <b>fosfat, pentosa i base nitrogenada</b>.</p>
      <div class="three-cards"><div><b>Fosfat</b><p>S'excreta o es reutilitza per formar ATP.</p></div><div><b>Pentosa (sucre)</b><p>Segueix la via dels glúcids.</p></div><div><b>Base nitrogenada</b><p>Es reutilitza per altres nucleòtids o s'excreta com a urea, amoníac o àcid úric.</p></div></div>
    </section>
<section id="s9" class="note-section"><span class="section-kicker green">1.1 — 9</span><h3>Catabolisme de les proteïnes</h3>
      <p>La funció de les proteïnes no és energètica, però els seus components (aminoàcids), en excés, s'utilitzen com a font d'energia. Hi ha dues fases:</p>
      <div class="two-col"><div><b>1. Transaminació</b><p>Es transfereix el grup amino de l'aminoàcid per formar àcid glutàmic.</p></div><div><b>2. Desaminació oxidativa</b><p>L'àcid glutàmic allibera el grup amino, que s'excreta com a urea, amoníac o àcid úric.</p></div></div>
    </section>
<section id="s10" class="note-section"><span class="section-kicker orange">1.1 — 10</span><h3>Catabolisme per fermentació</h3>
      <p>A diferència de la respiració, en la fermentació <b>no intervé</b> la cadena respiratòria. Característiques:</p>
      <ul class="checklist"><li>És un procés anaeròbic: no hi ha oxigen com a acceptor final.</li><li>L'acceptor final és un compost orgànic (el substrat es divideix en donador i acceptor).</li><li>Depenen del producte final: alcohòlica o làctica (i també butírica, pútrida).</li><li>Només hi ha síntesi d'ATP en la primera reacció del substrat (glicòlisi).</li></ul>
      <h4>Fermentació alcohòlica</h4><p>Glucosa → 2 piruvats → 2 acetaldehids → 2 etanol + 2 CO₂. Balanç total: <b>2 ATP</b>. La duen a terme llevats del gènere <i>Saccharomyces</i>, anaeròbics facultatius. Aplicacions: cervesa, vi, licor i pa.</p>
      <div class="formula">Glucosa + 2ADP + 2Pi → 2ATP + 2 etanol + 2CO₂</div>
      <h4>Fermentació làctica</h4><p>Es dona als músculs quan es queden sense O₂. Glucosa → 2 piruvats → 2 àcids làctics. Balanç: 2 ATP. Aplicacions: iogurts, formatge.</p>
      <h4>Altres</h4><div class="chips"><span>Butírica — restes vegetals → àcid butíric</span><span>Pútrida — restes proteiques → putrescina, cadaverina</span></div>
      <h4>Respiració vs fermentació</h4>
      <div class="table-like"><b>Necessiten oxigen?</b><span>Respiració: sí</span><span>Fermentació: no</span><b>Acceptor final e⁻/H⁺</b><span>O₂</span><span>Compost orgànic</span><b>Producte final</b><span>H₂O</span><span>Etanol, àcid làctic…</span><b>Energia per glucosa</b><span>Fins a 38 ATP</span><span>Normalment 2 ATP</span></div>
    </section>
<section id="s11" class="note-section"><span class="section-kicker blue">1.1 — 11</span><h3>Respiració anaeròbica</h3><p>Es dona quan la cadena respiratòria traspassa els electrons a una molècula inorgànica diferent de l'oxigen.</p>
      <div class="table-like"><b>Bacteris del metà</b><span>Anaeròbics estrictes</span><span>CO₂ → CH₄</span><b>Bacteris del sofre</b><span>Anaeròbics estrictes</span><span>Sulfat → sulfur d'H</span><b>Bacteris del nitrogen</b><span>Anaeròbics facultatius</span><span>Nitrat → nitrit</span></div>
    </section>`,
      quiz: [
    ['Quants ATP nets es produeixen a la glicòlisi?', ['2 ATP', '4 ATP', '38 ATP'], 0],
    ['Quantes voltes fa el cicle de Krebs per cada glucosa?', ['1 volta', '2 voltes', '4 voltes'], 1],
    ['Quin és el balanç energètic total del catabolisme d\u2019una glucosa?', ['2 ATP', '38 ATP', '129 ATP'], 1],
    ['On es fa la β-oxidació dels àcids grassos?', ['Al citosol', 'A la matriu mitocondrial', 'Al nucli'], 1],
    ['En la fermentació, quin és l\u2019acceptor final d\u2019electrons?', ['L\u2019oxigen', 'Un compost orgànic', 'El sulfat'], 1]
  ]
    },
    {
      titulo: 'Tema 3',
      subtitol: "L'anabolisme autòtrof",
      resumen: 'Fotosíntesi, fotosistemes, fase lluminosa i fosca, quimiosíntesi.',
      navLabels: ['1. Introducció a l’anabolisme', '2. Oxigènica vs anoxigènica', '3. Estructures fotosintètiques', '4. Pigments fotosintètics', '5. Els fotosistemes', '6. Fase lluminosa acíclica', '7. Fase lluminosa cíclica', '8. Fase fosca — Cicle de Calvin', '9. Compostos N i S', '10. Fotorespiració i factors', '11. La quimiosíntesi'],
      html: `<section id="s1" class="note-section active-section"><span class="section-kicker purple">1.2 — 1</span><h3>Introducció a l'anabolisme</h3>
      <div class="definition"><strong>Anabolisme</strong><p>Via metabòlica de síntesi de molècules complexes a partir de molècules simples.</p></div>
      <div class="two-col"><div><b>Anabolisme autòtrof</b><p>De molècules inorgàniques (H₂O, CO₂…) a orgàniques senzilles (glucosa, aminoàcids, glicerina…). Ho fan alguns organismes.</p></div><div><b>Anabolisme heteròtrof</b><p>De molècules orgàniques senzilles a complexes (midó, cel·lulosa…). Ho fan tots els organismes.</p></div></div>
      <div class="two-col"><div><b>Anabolisme fotosintètic</b><p>Depèn de l'energia de la llum (plantes, algues, cianobacteris).</p></div><div><b>Anabolisme quimiosintètic</b><p>Depèn de l'energia despresa en reaccions de compostos inorgànics.</p></div></div>
      <div class="callout">Cal evitar dir "autòtrof = es fabriquen el seu propi aliment"; millor dir "fabriquen la seva matèria orgànica a partir de matèria inorgànica".</div>
    </section>
<section id="s2" class="note-section"><span class="section-kicker pink">1.2 — 2</span><h3>Fotosíntesi oxigènica vs anoxigènica</h3>
      <div class="definition"><strong>Fotosíntesi</strong><p>Conversió de l'energia lluminosa en energia química, emmagatzemada en enllaços de molècules orgàniques, gràcies a pigments fotosintètics.</p></div>
      <div class="two-col"><div><b>Oxigènica</b><p>La fan plantes, algues i cianobacteris. Descompon aigua (H₂O) i allibera oxigen (O₂).</p></div><div><b>Anoxigènica</b><p>La fan alguns bacteris del sofre. Descompon àcid sulfhídric (H₂S) i forma precipitat de sofre.</p></div></div>
      <div class="formula big">6CO₂ + 12H₂O + <i>energia lluminosa</i> → C₆H₁₂O₆ + 6O₂ + 6H₂O</div>
      <div class="callout">Aquesta reacció general (fotosíntesi oxigènica d'una glucosa) <b>no es pot simplificar</b>.</div>
    </section>
<section id="s3" class="note-section"><span class="section-kicker orange">1.2 — 3</span><h3>Estructures fotosintètiques</h3>
      <p>A plantes i algues, la fotosíntesi es dona als <b>cloroplasts</b>: orgànul amb membrana externa i interna. El medi intern s'anomena <b>estroma</b> i conté sacs aplanats anomenats <b>tilacoides</b>, que s'apilen com monedes formant la <b>grana</b>. A les membranes tilacoidals hi ha els fotosistemes.</p>
      <div class="chips"><span>Cianobacteris: tilacoides al citoplasma (sense cloroplast)</span><span>Bacteris del sofre (anoxigènica): fotosíntesi als clorosomes</span></div>
    </section>
<section id="s4" class="note-section"><span class="section-kicker red">1.2 — 4</span><h3>Pigments fotosintètics</h3>
      <p>Es troben als cloroplasts i capturen l'energia de la llum. Els més coneguts: <b>clorofil·les</b> i <b>carotens</b> (també xantofil·les).</p>
      <div class="two-col"><div><h4>Clorofil·la</h4><p>2 parts: un anell porfirínic amb un àtom de magnesi al centre (part hidrofílica) i un fitol, cadena hidrocarbonada de 16 carbonis + 4 residus metil, 20 carbonis en total (part hidròfoba).</p></div><div><h4>Carotens</h4><p>Hidrocarburs amb forma C₄₀Hx, amb enllaços senzills i dobles alternats.</p></div></div>
      <div class="callout">Els enllaços senzills alternats amb dobles fan que hi hagi electrons lliures que es mouen per tot l'anell: necessiten molt poca energia (un fotó) per excitar-se i alliberen energia amb facilitat quan tornen a l'orbital inicial.</div>
    </section>
<section id="s5" class="note-section"><span class="section-kicker green">1.2 — 5</span><h3>Els fotosistemes</h3>
      <p>Es troben a les membranes dels tilacoides, formats per proteïnes transmembrana. Cada fotosistema té 2 subunitats principals:</p>
      <div class="two-col"><div><b>Complex antena</b><p>Conté pigments fotosintètics que capten l'energia lluminosa i la cedeixen al centre de reacció.</p></div><div><b>Centre de reacció</b><p>Conté una clorofil·la especial que transfereix electrons quan rep l'energia; d'aquí surt la cadena transportadora d'electrons.</p></div></div>
      <div class="table-like"><b>Fotosistema I (PSI)</b><span>Capta llum de fins a 700 nm</span><span>—</span><b>Fotosistema II (PSII)</b><span>Capta llum de fins a 680 nm</span><span>—</span></div>
    </section>
<section id="s6" class="note-section"><span class="section-kicker blue">1.2 — 6</span><h3>Fase lluminosa acíclica</h3>
      <p>Té 3 parts:</p>
      <div class="steps"><div><b>1</b><span>Fotòlisi de l'aigua</span></div><div><b>2</b><span>Fosforilació d'ADP</span></div><div><b>3</b><span>Fotoreducció del NADP⁺</span></div></div>
      <h4>1. Fotòlisi de l'aigua</h4><div class="formula">H₂O → ½O₂ + 2H⁺ + 2e⁻</div><p>Arriben fotons al fotosistema II. La clorofil·la P680 perd electrons que acaben a la plastoquinona (PQ); els electrons perduts es reposen amb la hidròlisi de l'aigua, i 2 protons s'acumulen dins del tilacoide.</p>
      <h4>2. Fosforilació d'ADP (fotofosforilació)</h4><div class="formula">ADP + Pi → ATP + H₂O</div><p>La plastoquinona transfereix electrons al complex citocrom b-f, que allibera protons dins del tilacoide. Els protons de la fotòlisi + els del citocrom creen una diferència de potencial, resolta amb l'<b>ATP sintasa</b>, que acumula ATP a l'estroma.</p>
      <h4>3. Fotoreducció del NADP⁺</h4><div class="formula">NADP⁺ + 2H⁺ + 2e⁻ → NADPH + H⁺</div><p>Amb 2 fotons al fotosistema I, la clorofil·la P700 perd 2 electrons que passen a la ferredoxina i després a la ferredoxina-NADP reductasa, que redueix NADP⁺ a NADPH. Els electrons perduts per la P700 es reposen per la plastocianina.</p>
    </section>
<section id="s7" class="note-section"><span class="section-kicker purple">1.2 — 7</span><h3>Fase lluminosa cíclica</h3>
      <p>Només hi intervé el <b>fotosistema I</b>. Només es produeix <b>ATP</b>, ni oxigen ni NADPH.</p>
      <div class="callout">L'objectiu és solucionar el dèficit d'ATP, ja que la fase fosca en requereix més quantitat que de NADPH.</div>
      <p>La clorofil·la P700 allibera 2 electrons a la ferredoxina, que passen al citocrom b-f, a la plastoquinona, un altre cop al citocrom b-f, a la plastocianina i tornen a la P700. A cada volta entren 2 protons, que generen ATP via ATP sintasa.</p>
    </section>
<section id="s8" class="note-section"><span class="section-kicker pink">1.2 — 8</span><h3>Fase fosca — Cicle de Calvin</h3>
      <p>Reaccions independents de la llum, però generalment es donen durant el dia perquè necessiten l'ATP i el NADPH de la fase lluminosa. Es dona a l'<b>estroma</b> del cloroplast.</p>
      <p>L'enzim <b>RuBisCO</b> captura CO₂ de l'atmosfera i utilitza NADPH i ATP de la fase lluminosa per sintetitzar sucres de 3 carbonis, a partir de <b>ribulosa-1,5-bifosfat</b>, que després es combinen per formar sacarosa i midó.</p>
      <div class="callout">És un <b>procés cíclic</b>. Balanç per volta: 2NADPH + 2ADP+Pi + 2ATP → glucosa/fructosa (sacarosa).</div>
    </section>
<section id="s9" class="note-section"><span class="section-kicker orange">1.2 — 9</span><h3>Fotosíntesi anoxigènica i compostos amb N i S</h3>
      <div class="definition"><strong>Fotosíntesi anoxigènica</strong><p>Es captura energia de la llum i es produeix ATP sense producció d'oxigen (2H₂O→O₂ substituït per 2H₂S→S).</p></div>
      <div class="two-col"><div><b>Compostos nitrogenats</b><p>Els ions nitrit són reduïts a nitrat per bacteris.</p></div><div><b>Compostos amb sofre</b><p>A partir del NADPH i l'ATP de la fase lluminosa, els bacteris redueixen el sulfat al sulfit.</p></div></div>
    </section>
<section id="s10" class="note-section"><span class="section-kicker green">1.2 — 10</span><h3>Fotorespiració i factors que afecten la fotosíntesi</h3>
      <div class="callout"><b>Fotorespiració:</b> quan l'ambient és càlid i sec, els estomes es tanquen; la RuBisCO actua en funció oxidasa i destrueix la ribulosa-1,5-bifosfat.</div>
      <div class="two-col"><div><b>Temperatura</b><p>Cada espècie té un interval òptim; per sobre/sota es desnaturalitzen enzims i les membranes deixen de ser fluides.</p></div><div><b>Concentració de CO₂</b><p>A més concentració, augmenta la fotosíntesi fins a un màxim (tots els enzims ocupats).</p></div></div>
      <div class="two-col"><div><b>Concentració d'oxigen</b><p>A més concentració d'O₂, menys fotosíntesi (per la fotorespiració).</p></div><div><b>Escassetat d'aigua</b><p>Es tanquen els estomes: no entra CO₂ i s'acumula O₂; disminueix per fotorespiració.</p></div></div>
      <p><b>Intensitat lluminosa:</b> depèn de la planta (ex.: molses, penombra i gramínies tropicals mai arriben al màxim).</p>
    </section>
<section id="s11" class="note-section"><span class="section-kicker blue">1.2 — 11</span><h3>La quimiosíntesi</h3><p>La fan bacteris aeròbics obligats, per sintetitzar ATP a partir de l'energia que es desprèn en reaccions d'oxidació de molècules inorgàniques.</p>
      <div class="table-like"><b>H₂S</b><span>Bacteris incolors del sofre</span><span>—</span><b>FeCO₃</b><span>Bacteris del ferro</span><span>—</span><b>NO₂ / NH₃</b><span>Bacteris del nitrogen</span><span>—</span><b>H₂</b><span>Bacteris de l'hidrogen</span><span>—</span></div>
    </section>`,
      quiz: [
    ['Quin pigment capta llum de fins a 700 nm?', ['Fotosistema I (P700)', 'Fotosistema II (P680)', 'Els carotens'], 0],
    ['Què produeix la fase lluminosa cíclica?', ['ATP i O\u2082', 'Només ATP', 'Només NADPH'], 1],
    ['On es fa el cicle de Calvin?', ['A l\u2019estroma del cloroplast', 'Al tilacoide', 'Al citosol'], 0],
    ['Quin gas allibera la fotòlisi de l\u2019aigua?', ['CO\u2082', 'O\u2082', 'N\u2082'], 1],
    ['La fotosíntesi anoxigènica...', ['No produeix oxigen', 'Sempre produeix més O\u2082', 'Només la fan les plantes'], 0]
  ]
    },
    {
      titulo: 'Tema 4',
      subtitol: "L'anabolisme heteròtrof",
      resumen: 'Gluconeogènesi, cicle de Cori, glicogènesi i síntesi de macromolècules.',
      navLabels: ['1. Introducció', '2. Localització de les vies', '3. Gluconeogènesi i cicle de Cori', '4. Glicogènesi i amilogènesi', '5. Anabolisme dels lípids', '6. Anabolisme dels aminoàcids', '7. Anabolisme dels nucleòtids', '8. Evolució dels processos metabòlics'],
      html: `<section id="s1" class="note-section active-section"><span class="section-kicker purple">1.3 — 1</span><h3>Introducció a l'anabolisme heteròtrof</h3>
      <div class="definition"><strong>Anabolisme heteròtrof</strong><p>Procés metabòlic de formació de molècules orgàniques complexes a partir d'altres més senzilles, anomenades <b>precursors</b>. El fan cèl·lules autòtrofes i heteròtrofes.</p></div>
      <div class="two-col"><div><b>1. Síntesi de monòmers a partir de precursors</b><p>Ex.: piruvat (precursor) → glucosa (monòmer).</p></div><div><b>2. Síntesi de polímers a partir de monòmers</b><p>Ex.: glucosa (monòmer) → glicogen (polímer, molt semblant al midó però amb moltes ramificacions).</p></div></div>
      <h4>Els precursors poden venir de 3 vies</h4>
      <div class="table-like"><b>Catabolisme de les reserves</b><span>Pot passar a cèl·lules autòtrofes i heteròtrofes</span><span>—</span><b>Digestió dels aliments</b><span>Només a cèl·lules heteròtrofes</span><span>—</span><b>Fotosíntesi o quimiosíntesi</b><span>Només a cèl·lules autòtrofes</span><span>—</span></div>
      <div class="callout"><b>Les vies anabòliques no són les catabòliques a la inversa:</b> cal un enzim/enzims diferents per fer el pas invers (ex.: piruvat↔glucosa usa enzims A-B-C d'anada i D-E-F de tornada, mai la mateixa via en sentit contrari).</div>
    </section>
<section id="s2" class="note-section"><span class="section-kicker pink">1.3 — 2</span><h3>Localització de les vies i tipus de molècules</h3>
      <p>L'anabolisme heteròtrof comprèn el de <b>glúcids, lípids, proteïnes i àcids nucleics</b>. Les vies estan interrelacionades: a partir de molècules d'un tipus se'n poden acabar sintetitzant d'un altre.</p>
      <div class="definition"><strong>És un procés de reducció</strong><p>Es gasta ATP: molècules orgàniques simples + ATP → molècules orgàniques complexes (més reduïdes) + ADP + Pi.</p></div>
      <div class="two-col"><div><b>En vegetals</b><p>L'energia s'utilitza sobretot per a la síntesi de glúcids (midó, cel·lulosa).</p></div><div><b>En animals</b><p>L'energia s'utilitza sobretot per a la síntesi de proteïnes (múscul, ossos).</p></div></div>
      <h4>On es donen les vies?</h4>
      <div class="table-like"><b>Majoria</b><span>Citosol</span><span>—</span><b>Àcids nucleics</b><span>Nucli, cloroplast i mitocondri</span><span>(orgànuls amb material genètic propi)</span><b>Proteïnes</b><span>Ribosomes</span><span>—</span><b>Fosfolípids i colesterol</b><span>Reticle endoplasmàtic</span><span>Glicosilació: comença al RE, acaba a l'aparell de Golgi</span></div>
    </section>
<section id="s3" class="note-section"><span class="section-kicker orange">1.3 — 3</span><h3>Gluconeogènesi i cicle de Cori</h3>
      <div class="definition"><strong>Gluconeogènesi</strong><p>Síntesi de glucosa a partir de precursors no glucídics (piruvat i altres). És un procés diferent (nou) d'obtenció de glucosa, diferent del cicle de Calvin, la digestió d'aliments o la hidròlisi de reserves.</p></div>
      <p>Les neurones i cèl·lules glials s'alimenten principalment de glucosa; com les reserves de glucogen només duren un dia, al segon dia de dejuni cal la gluconeogènesi.</p>
      <h4>Origen dels precursors</h4><ul class="checklist"><li>Desaminació d'aminoàcids: dona piruvat o oxalacetat.</li><li>Degradació d'àcids grassos: només vegetals poden transformar l'Acetil-CoA en oxalacetat.</li><li>Cicle de Cori: l'àcid làctic dels músculs és transportat pel fetge (90%) i l'escorça renal (10%).</li></ul>
      <h4>Cicle de Cori</h4><p>La glucosa nova torna a ser transportada per la sang fins als músculs. Al múscul: glucosa → glicogen/lactat (fermentació làctica, +2 ATP). Al fetge: lactat → glucosa (gluconeogènesi, −6 ATP).</p>
      <div class="callout">Balanç energètic del cicle de Cori: <b>−6 ATP + 2 ATP = −4 ATP net</b>.</div>
    </section>
<section id="s4" class="note-section"><span class="section-kicker green">1.3 — 4</span><h3>Glicogènesi i amilogènesi</h3>
      <p>La <b>glicogènesi</b> es dona especialment al fetge i als músculs. La glucosa de la sang (que prové de la digestió o de la gluconeogènesi) s'uneix per formar polisacàrids; després es tallen fragments per ramificar la cadena.</p>
      <p>Quan el nivell de glucosa en sang baixa, el glicogen hepàtic s'hidrolitza (glicogenòlisi) i allibera glucosa a la sang.</p>
      <div class="two-col"><div><b>Adrenalina i glucagó</b><p>Augmenten la sortida de glucosa a la sang.</p></div><div><b>Insulina</b><p>Augmenta l'entrada de glucosa a la cèl·lula.</p></div></div>
      <p>L'<b>amilogènesi</b> es dona als plasts dels vegetals; és un procés semblant a la glicogènesi.</p>
    </section>
<section id="s5" class="note-section"><span class="section-kicker blue">1.3 — 5</span><h3>Anabolisme heteròtrof dels lípids</h3>
      <p>Els lípids més importants amb funció de reserva són els <b>triglicèrids</b> (glicerina + àcids grassos).</p>
      <h4>Obtenció d'àcids grassos</h4><div class="two-col"><div><b>Digestió dels aliments</b><p>Es digereixen els greixos i s'acaben amb triglicèrids.</p></div><div><b>Biosíntesi</b><p>A partir d'Acetil-CoA que surt del mitocondri al citosol, s'afegeixen 2 carbonis successivament fins formar un àcid gras (generalment palmític), sempre d'un nombre parell de carbonis.</p></div></div>
      <div class="callout"><b>Important:</b> no és el procés invers de la β-oxidació; són reaccions totalment diferents.</div>
      <p>La glicerina s'obté de la hidròlisi dels greixos o per síntesi nova a partir d'un intermediari de la glicòlisi.</p>
      <h4>Formació de triglicèrids</h4><p>Pot passar a cèl·lules hepàtiques o del teixit adipós. L'àcid gras s'uneix primer a un CoA (Acil-CoA), que s'uneix un a un amb enllaç èster a la glicerina, formant un monoglicèrid, després diglicèrid i finalment triglicèrid.</p>
    </section>
<section id="s6" class="note-section"><span class="section-kicker purple">1.3 — 6</span><h3>Anabolisme heteròtrof dels aminoàcids</h3>
      <p>Cada aminoàcid té una via pròpia. Hi ha 20 aminoàcids proteics: les plantes els poden sintetitzar tots, però els humans només 10 (<b>essencials</b>: els altres 10 s'han d'ingerir).</p>
      <h4>Precursors dels aminoàcids</h4><p>A partir d'un àcid orgànic de 3 a 5 carbonis, s'afegeix un grup amino que pot venir de:</p>
      <div class="chips"><span>Transaminació — d'un altre aminoàcid</span><span>Desaminació — d'un aminoàcid lliure</span><span>Amoníac i nitrat del sòl — plantes</span><span>N₂ atmosfèric — alguns bacteris</span></div>
    </section>
<section id="s7" class="note-section"><span class="section-kicker pink">1.3 — 7</span><h3>Anabolisme heteròtrof dels nucleòtids</h3>
      <p>Els nucleòtids estan formats per una base nitrogenada (púrica o pirimidínica), una pentosa (sucre) i un àcid fosfòric. Poden venir de:</p>
      <div class="two-col"><div><b>1. Hidròlisi d'àcids nucleics</b><p>Reutilització de components ja existents.</p></div><div><b>2. Síntesi nova</b><p>A partir de precursors metabòlics.</p></div></div>
    </section>
<section id="s8" class="note-section"><span class="section-kicker orange">1.3 — 8</span><h3>Evolució dels processos metabòlics</h3>
      <div class="pathway"><span>1r antecessor comú</span><b>reaccions químiques a roques poroses</b><span>Fotosintètics anoxigènics</span><b>encara no hidrolitzaven l'aigua</b><span>Quimioautòtrofs del sofre</span><b>→</b><span>Fotosintètics oxigènics</span><b>→</b><span>Quimioheteròtrofs oxigènics</span><b>→</b><span>Eucariotes</span></div>
      <div class="final-box"><span></span><div><b>Objectiu del bloc Metabolisme</b><p>Entendre com la cèl·lula obté energia (catabolisme), com alguns organismes en fabriquen matèria orgànica des de zero (anabolisme autòtrof) i com totes les cèl·lules construeixen les seves pròpies macromolècules (anabolisme heteròtrof).</p></div></div>
    </section>`,
      quiz: [
    ['Què és la gluconeogènesi?', ['Síntesi de glucosa a partir de precursors no glucídics', 'Degradació de glucosa', 'Síntesi de glicogen'], 0],
    ['Quina hormona augmenta l\u2019entrada de glucosa a la cèl·lula?', ['Adrenalina', 'Glucagó', 'Insulina'], 2],
    ['Quants aminoàcids proteics són essencials en humans?', ['20', '10', '5'], 1],
    ['El cicle de Cori transporta...', ['Lactat del múscul cap al fetge', 'Glucosa del fetge cap al cervell únicament', 'Àcids grassos cap al múscul'], 0],
    ['Els fosfolípids i el colesterol es sintetitzen a...', ['El reticle endoplasmàtic', 'Els ribosomes', 'El nucli'], 0]
  ]
    }
  ]
};
