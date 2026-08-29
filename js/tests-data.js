/* ============================================================================
   BioPAU — BANCO DE PREGUNTAS (tests por temario)
   ----------------------------------------------------------------------------
   Estructura:
     window.BIOPAU_TESTS.byBloque[<idBloque>] = {
       mini:  { id, tipo:'mini', titulo, preguntas:[ {q, ops:[...], sol, why} ] },
       final: { id, tipo:'pau',  titulo, preguntas:[ ... ] }
     }
   · q   = enunciado         · ops = opciones (3–4)
   · sol = índice (0-based) de la opción correcta
   · why = explicación educativa (se muestra tras responder)
   Las preguntas están en catalán (como el temario y la PAU). Añadir más es
   tan simple como sumar objetos a los arrays. Tipos previstos para el futuro:
   'mini' (checkpoint), 'pau' (test final/simulacro), 'repas'.
   ============================================================================ */
window.BIOPAU_TESTS = (function () {

  var B = {};

  /* ===================== GENÈTICA ===================== */
  B.genetica = {
    mini: { id: 'genetica-mini', tipo: 'mini', titulo: 'Mini test · Genètica', preguntas: [
      { q: 'Segons la 1a llei de Mendel, en creuar dues línies pures que difereixen en un caràcter, la generació F1 és…', ops: ['uniforme i mostra el caràcter dominant', 'uniforme i mostra el caràcter recessiu', 'meitat dominant i meitat recessiva'], sol: 0, why: 'La llei de la uniformitat: tots els descendents F1 són heterozigots i mostren el fenotip dominant.' },
      { q: 'El conjunt de gens (al·lels) que té un individu s’anomena…', ops: ['fenotip', 'genotip', 'cariotip'], sol: 1, why: 'El genotip és la dotació genètica; el fenotip és com s’expressa (l’aspecte observable).' },
      { q: 'Un gen recessiu situat al cromosoma X s’expressa amb més freqüència en…', ops: ['les dones (XX)', 'els homes (XY)', 'per igual en tots dos sexes'], sol: 1, why: 'Els homes tenen un sol cromosoma X: amb un únic al·lel recessiu ja s’expressa (hemizigosi).' },
      { q: 'La meiosi produeix cèl·lules…', ops: ['diploides idèntiques a la mare', 'haploides amb variabilitat genètica', 'diploides amb el doble de DNA'], sol: 1, why: 'La meiosi redueix el nombre de cromosomes a la meitat (n) i genera variabilitat per recombinació.' },
      { q: 'Per saber el genotip d’un individu de fenotip dominant es fa un encreuament prova amb un individu…', ops: ['homozigot dominant', 'homozigot recessiu', 'heterozigot'], sol: 1, why: 'El “test cross” amb un homozigot recessiu revela si l’individu és homozigot o heterozigot segons la descendència.' }
    ]},
    final: { id: 'genetica-final', tipo: 'pau', titulo: 'Test final · Genètica (tipus PAU)', preguntas: [
      { q: 'En un encreuament dihíbrid Aa Bb × Aa Bb (gens independents), la proporció fenotípica esperada en la F2 és…', ops: ['3:1', '9:3:3:1', '1:2:1'], sol: 1, why: 'Dos caràcters independents (3a llei de Mendel) donen la proporció 9:3:3:1 a la F2.' },
      { q: 'En l’encreuament Aa × Aa, quina proporció de la descendència serà homozigota recessiva (aa)?', ops: ['25 %', '50 %', '75 %'], sol: 0, why: 'Aa × Aa → 1 AA : 2 Aa : 1 aa. L’aa és 1/4 = 25 %.' },
      { q: 'El grup sanguini AB és un exemple de…', ops: ['dominància completa', 'codominància', 'herència lligada al sexe'], sol: 1, why: 'Els al·lels IA i IB s’expressen tots dos alhora (codominància): apareixen els dos antígens.' },
      { q: 'El daltonisme i l’hemofília són caràcters…', ops: ['recessius lligats al cromosoma X', 'dominants autosòmics', 'lligats al cromosoma Y'], sol: 0, why: 'Són al·lels recessius del cromosoma X; per això afecten més als homes.' },
      { q: 'El nombre de cromosomes d’una cèl·lula somàtica humana és…', ops: ['23', '46', '92'], sol: 1, why: 'L’espècie humana té 46 cromosomes (23 parells) a les cèl·lules somàtiques; els gàmetes en tenen 23.' },
      { q: 'L’intercanvi de fragments entre cromosomes homòlegs durant la meiosi s’anomena…', ops: ['mitosi', 'entrecreuament (crossing-over)', 'translació'], sol: 1, why: 'L’entrecreuament es dona a la profase I de la meiosi i augmenta la variabilitat genètica.' },
      { q: 'Una mutació que canvia un sol nucleòtid del DNA s’anomena mutació…', ops: ['gènica o puntual', 'cromosòmica', 'genòmica'], sol: 0, why: 'Les mutacions gèniques (puntuals) afecten la seqüència de nucleòtids d’un gen.' },
      { q: 'Un home de grup sanguini O i una dona AB poden tenir fills de grup…', ops: ['A o B', 'O o AB', 'només O'], sol: 0, why: 'Pare ii (O) × mare IAIB (AB) → fills IAi (A) o IBi (B). Mai O ni AB.' }
    ]}
  };

  /* ===================== BIOMOLÈCULES ===================== */
  B.biomolecules = {
    mini: { id: 'biomolecules-mini', tipo: 'mini', titulo: 'Mini test · Biomolècules', preguntas: [
      { q: 'El monòmer (unitat) de les proteïnes és…', ops: ['el nucleòtid', 'l’aminoàcid', 'el monosacàrid'], sol: 1, why: 'Les proteïnes són polímers d’aminoàcids units per enllaços peptídics.' },
      { q: 'Quin d’aquests glúcids és un polisacàrid de reserva en vegetals?', ops: ['glucosa', 'midó (amilo)', 'cel·lulosa'], sol: 1, why: 'El midó és la reserva energètica vegetal; la cel·lulosa és estructural i el glicogen és la reserva animal.' },
      { q: 'Els lípids es caracteritzen per ser…', ops: ['solubles en aigua', 'insolubles en aigua (apolars)', 'sempre sòlids'], sol: 1, why: 'Els lípids són hidròfobs: insolubles en aigua i solubles en dissolvents orgànics.' },
      { q: 'La molècula que emmagatzema la informació genètica és…', ops: ['l’ATP', 'el DNA', 'la glucosa'], sol: 1, why: 'El DNA (àcid desoxiribonucleic) conté la informació genètica en la seqüència de nucleòtids.' },
      { q: 'L’enllaç que uneix dos aminoàcids és…', ops: ['l’enllaç peptídic', 'l’enllaç glicosídic', 'l’enllaç èster'], sol: 0, why: 'L’enllaç peptídic uneix el grup carboxil d’un aminoàcid amb el grup amino del següent.' }
    ]},
    final: { id: 'biomolecules-final', tipo: 'pau', titulo: 'Test final · Biomolècules (tipus PAU)', preguntas: [
      { q: 'En el DNA, la base nitrogenada adenina (A) s’aparella amb…', ops: ['timina (T)', 'citosina (C)', 'guanina (G)'], sol: 0, why: 'Complementarietat de bases: A-T (dos ponts d’hidrogen) i G-C (tres ponts).' },
      { q: 'Quina d’aquestes biomolècules NO és un glúcid?', ops: ['glucosa', 'fructosa', 'glicerol'], sol: 2, why: 'El glicerol és un component dels lípids (greixos), no un glúcid.' },
      { q: 'L’estructura secundària d’una proteïna en forma d’hèlix s’estabilitza per…', ops: ['enllaços peptídics nous', 'ponts d’hidrogen', 'enllaços glicosídics'], sol: 1, why: 'L’hèlix α i la làmina β s’estabilitzen per ponts d’hidrogen entre grups del esquelet peptídic.' },
      { q: 'Els fosfolípids són fonamentals perquè formen…', ops: ['la paret cel·lular vegetal', 'les membranes cel·lulars (bicapa)', 'els ribosomes'], sol: 1, why: 'Els fosfolípids són amfipàtics i formen la bicapa lipídica de les membranes.' },
      { q: 'La diferència entre ribosa i desoxiribosa és…', ops: ['un grup fosfat', 'un àtom d’oxigen', 'una base nitrogenada'], sol: 1, why: 'La desoxiribosa (DNA) té un oxigen menys al carboni 2’ que la ribosa (RNA).' },
      { q: 'Quin element químic és present en les proteïnes però NO en glúcids ni lípids simples?', ops: ['carboni', 'nitrogen', 'hidrogen'], sol: 1, why: 'El nitrogen (del grup amino) és característic dels aminoàcids i, per tant, de les proteïnes.' },
      { q: 'La desnaturalització d’una proteïna implica…', ops: ['trencar enllaços peptídics', 'perdre l’estructura tridimensional (i la funció)', 'convertir-la en glúcid'], sol: 1, why: 'La desnaturalització altera la conformació (2a, 3a, 4a) sense trencar l’enllaç peptídic, però la proteïna perd la funció.' },
      { q: 'Els enzims són, químicament, majoritàriament…', ops: ['lípids', 'proteïnes', 'àcids nucleics'], sol: 1, why: 'La majoria d’enzims són proteïnes (amb excepcions com els ribozims, que són RNA).' }
    ]}
  };

  /* ===================== METABOLISME ===================== */
  B.metabolisme = {
    mini: { id: 'metabolisme-mini', tipo: 'mini', titulo: 'Mini test · Metabolisme', preguntas: [
      { q: 'El catabolisme es caracteritza per…', ops: ['construir molècules complexes consumint energia', 'degradar molècules i alliberar energia', 'no intervenir en el metabolisme'], sol: 1, why: 'El catabolisme degrada (oxida) molècules complexes en senzilles i allibera energia (p. ex. ATP).' },
      { q: 'La molècula que emmagatzema energia per a un ús immediat és…', ops: ['el DNA', 'l’ATP', 'la cel·lulosa'], sol: 1, why: 'L’ATP allibera energia en hidrolitzar-se a ADP + Pi (≈ 7,3 kcal/mol).' },
      { q: 'Els enzims actuen…', ops: ['augmentant l’energia d’activació', 'disminuint l’energia d’activació', 'consumint-se en la reacció'], sol: 1, why: 'Els enzims baixen l’energia d’activació i no es consumeixen; acceleren la reacció.' },
      { q: 'La regió de l’enzim on s’uneix el substrat és…', ops: ['el centre actiu', 'el nucli', 'la membrana'], sol: 0, why: 'El centre actiu és una regió tridimensional específica on s’uneix el substrat.' },
      { q: 'La fotosíntesi és un exemple de…', ops: ['catabolisme', 'anabolisme autòtrof', 'anabolisme heteròtrof'], sol: 1, why: 'La fotosíntesi construeix matèria orgànica (glucosa) a partir d’inorgànica usant llum: anabolisme autòtrof.' }
    ]},
    final: { id: 'metabolisme-final', tipo: 'pau', titulo: 'Test final · Metabolisme (tipus PAU)', preguntas: [
      { q: 'La respiració cel·lular aeròbica té lloc principalment a…', ops: ['el nucli', 'els mitocondris', 'els ribosomes'], sol: 1, why: 'El cicle de Krebs i la cadena respiratòria es fan al mitocondri; per això se’l diu “central energètica”.' },
      { q: 'La glucòlisi es produeix a…', ops: ['el citoplasma (citosol)', 'el mitocondri', 'el cloroplast'], sol: 0, why: 'La glucòlisi (glucosa → 2 piruvat) té lloc al citosol i no necessita oxigen.' },
      { q: 'En absència d’oxigen, moltes cèl·lules obtenen energia mitjançant…', ops: ['la fermentació', 'el cicle de Krebs', 'la fotosíntesi'], sol: 0, why: 'La fermentació (làctica o alcohòlica) regenera NAD+ sense oxigen, amb poc rendiment d’ATP.' },
      { q: 'La fase lluminosa de la fotosíntesi té lloc a…', ops: ['l’estroma del cloroplast', 'les membranes dels tilacoides', 'el mitocondri'], sol: 1, why: 'La fase lluminosa (captació de llum, fotòlisi de l’aigua, ATP i NADPH) es fa als tilacoides.' },
      { q: 'A la fase fosca (cicle de Calvin) es fixa…', ops: ['oxigen', 'diòxid de carboni (CO₂)', 'nitrogen'], sol: 1, why: 'El cicle de Calvin, a l’estroma, fixa CO₂ per formar glúcids usant l’ATP i el NADPH de la fase lluminosa.' },
      { q: 'Un inhibidor competitiu d’un enzim…', ops: ['s’uneix al centre actiu i competeix amb el substrat', 's’uneix lluny del centre actiu sempre', 'destrueix l’enzim'], sol: 0, why: 'L’inhibidor competitiu s’assembla al substrat i bloqueja el centre actiu; es pot vèncer augmentant el substrat.' },
      { q: 'Quin gas alliberen les plantes com a subproducte de la fotosíntesi?', ops: ['diòxid de carboni', 'oxigen', 'metà'], sol: 1, why: 'L’oxigen prové de la fotòlisi de l’aigua a la fase lluminosa.' },
      { q: 'La molècula NADH/FADH₂ actua com a…', ops: ['transportador d’electrons', 'material genètic', 'enzim digestiu'], sol: 0, why: 'Són coenzims transportadors d’electrons que cedeixen a la cadena respiratòria per formar ATP.' }
    ]}
  };

  /* ===================== MICROORGANISMES ===================== */
  B.microorganismes = {
    mini: { id: 'microorganismes-mini', tipo: 'mini', titulo: 'Mini test · Microorganismes', preguntas: [
      { q: 'Els bacteris són organismes…', ops: ['eucariotes', 'procariotes', 'acel·lulars'], sol: 1, why: 'Els bacteris són procariotes: no tenen nucli ni orgànuls membranosos.' },
      { q: 'Els virus es consideren formes acel·lulars perquè…', ops: ['no tenen material genètic', 'no tenen estructura cel·lular i necessiten una cèl·lula hoste', 'són bacteris petits'], sol: 1, why: 'Els virus són càpsida + àcid nucleic; només es reprodueixen dins una cèl·lula hoste.' },
      { q: 'L’esterilització té com a objectiu…', ops: ['eliminar tots els microorganismes i espores', 'accelerar el creixement bacterià', 'donar color al medi'], sol: 0, why: 'Esterilitzar és destruir tota forma de vida microbiana, incloses les espores (p. ex. autoclau).' },
      { q: 'Un antibiòtic actua sobre…', ops: ['els virus', 'els bacteris', 'els prions'], sol: 1, why: 'Els antibiòtics ataquen estructures bacterianes; no són eficaços contra virus.' },
      { q: 'Els fongs, a diferència dels bacteris, són…', ops: ['procariotes', 'eucariotes', 'acel·lulars'], sol: 1, why: 'Els fongs (llevats, floridures) són eucariotes amb paret cel·lular de quitina.' }
    ]},
    final: { id: 'microorganismes-final', tipo: 'pau', titulo: 'Test final · Microorganismes (tipus PAU)', preguntas: [
      { q: 'El cicle víric en què el virus destrueix immediatament la cèl·lula hoste és el cicle…', ops: ['lisogènic', 'lític', 'reproductiu'], sol: 1, why: 'En el cicle lític el virus es replica i lisa (trenca) la cèl·lula; en el lisogènic s’integra al genoma sense destruir-la de seguida.' },
      { q: 'Quin d’aquests NO és un microorganisme cel·lular?', ops: ['bacteri', 'llevat', 'virus'], sol: 2, why: 'El virus és una forma acel·lular; bacteris i llevats sí que són cèl·lules.' },
      { q: 'La penicil·lina és un antibiòtic produït per…', ops: ['un fong', 'un virus', 'un protozou'], sol: 0, why: 'La penicil·lina l’obté el fong Penicillium; molts antibiòtics provenen de fongs i bacteris.' },
      { q: 'Els prions són…', ops: ['proteïnes infeccioses', 'bacteris resistents', 'virus amb DNA'], sol: 0, why: 'Els prions són proteïnes mal plegades que indueixen el mal plegament d’altres proteïnes.' },
      { q: 'El procés pel qual els bacteris intercanvien DNA a través d’un pili s’anomena…', ops: ['conjugació', 'mitosi', 'gemmació'], sol: 0, why: 'La conjugació transfereix material genètic (sovint plasmidis) d’un bacteri a un altre pel pili sexual.' },
      { q: 'La fermentació làctica per bacteris s’utilitza per fer…', ops: ['iogurt', 'pa amb llevat', 'vi'], sol: 0, why: 'Els bacteris làctics acidifiquen la llet (iogurt, formatge). El pa i el vi usen fermentació alcohòlica de llevats.' },
      { q: 'Els bacteris que viuen en absència total d’oxigen són…', ops: ['aerobis estrictes', 'anaerobis estrictes', 'fotoautòtrofs'], sol: 1, why: 'Els anaerobis estrictes moren en presència d’oxigen; obtenen energia sense O₂.' },
      { q: 'Una vacuna conté, típicament…', ops: ['antibiòtics', 'antígens (patogen atenuat o parts seves)', 'anticossos ja formats'], sol: 1, why: 'La vacuna aporta antígens perquè el sistema immunitari generi memòria; els anticossos ja formats són la immunització passiva.' }
    ]}
  };

  /* ===================== IMMUNOLOGIA ===================== */
  B.immunologia = {
    mini: { id: 'immunologia-mini', tipo: 'mini', titulo: 'Mini test · Immunologia', preguntas: [
      { q: 'Una substància estranya que desencadena una resposta immunitària s’anomena…', ops: ['anticòs', 'antigen', 'antibiòtic'], sol: 1, why: 'L’antigen és reconegut pel sistema immunitari i provoca la producció d’anticossos.' },
      { q: 'Els anticossos són molècules de tipus…', ops: ['glúcid', 'proteïna (immunoglobulina)', 'lípid'], sol: 1, why: 'Els anticossos són immunoglobulines, proteïnes produïdes pels limfòcits B.' },
      { q: 'La immunitat innata es caracteritza per ser…', ops: ['específica i amb memòria', 'inespecífica i ràpida', 'exclusiva dels humans'], sol: 1, why: 'La resposta innata és inespecífica, immediata i sense memòria (barreres, fagòcits, inflamació).' },
      { q: 'Els limfòcits responsables de produir anticossos són els…', ops: ['limfòcits B', 'limfòcits T citotòxics', 'macròfags'], sol: 0, why: 'Els limfòcits B es diferencien en cèl·lules plasmàtiques que secreten anticossos (resposta humoral).' },
      { q: 'Una vacuna genera immunitat…', ops: ['passiva i temporal', 'activa i amb memòria', 'inespecífica'], sol: 1, why: 'La vacunació estimula una resposta activa que deixa cèl·lules de memòria (immunitat duradora).' }
    ]},
    final: { id: 'immunologia-final', tipo: 'pau', titulo: 'Test final · Immunologia (tipus PAU)', preguntas: [
      { q: 'La immunitat que s’obté rebent anticossos ja formats (p. ex. de la mare) és…', ops: ['activa natural', 'passiva', 'innata'], sol: 1, why: 'La immunitat passiva aporta anticossos externs: protecció immediata però temporal, sense memòria.' },
      { q: 'Els limfòcits T citotòxics actuen…', ops: ['produint anticossos', 'destruint cèl·lules infectades', 'formant barreres físiques'], sol: 1, why: 'Els T citotòxics (CD8) reconeixen i destrueixen cèl·lules infectades o tumorals (resposta cel·lular).' },
      { q: 'Una al·lèrgia és…', ops: ['una resposta immunitària exagerada davant una substància inofensiva', 'una manca total de defenses', 'una infecció bacteriana'], sol: 0, why: 'L’al·lèrgia és una hipersensibilitat: resposta desproporcionada davant al·lèrgens habitualment innocus.' },
      { q: 'La resposta immunitària secundària (segon contacte amb el mateix antigen) és…', ops: ['més lenta i feble', 'més ràpida i intensa gràcies a la memòria', 'idèntica a la primària'], sol: 1, why: 'Les cèl·lules de memòria fan que el segon contacte generi una resposta molt més ràpida i potent.' },
      { q: 'El VIH ataca preferentment…', ops: ['els limfòcits T CD4 (col·laboradors)', 'els glòbuls vermells', 'les plaquetes'], sol: 0, why: 'El VIH infecta i destrueix els limfòcits T col·laboradors (CD4), debilitant tota la resposta immunitària.' },
      { q: 'Una malaltia autoimmune es produeix quan el sistema immunitari…', ops: ['ataca cèl·lules pròpies del cos', 'no reconeix cap antigen', 'produeix massa antibiòtics'], sol: 0, why: 'En l’autoimmunitat es perd la tolerància i el sistema ataca teixits propis (p. ex. diabetis tipus 1).' },
      { q: 'La part de l’antigen reconeguda per l’anticòs s’anomena…', ops: ['epítop (determinant antigènic)', 'paratop', 'antibiòtic'], sol: 0, why: 'L’epítop és la regió de l’antigen a la qual s’uneix específicament l’anticòs.' },
      { q: 'La fagocitosi la duen a terme principalment…', ops: ['els macròfags i neutròfils', 'els limfòcits B', 'les plaquetes'], sol: 0, why: 'Macròfags i neutròfils engoleixen i destrueixen patògens; formen part de la immunitat innata.' }
    ]}
  };

  /* ===================== BIOTECNOLOGIA ===================== */
  B.biotecnologia = {
    mini: { id: 'biotecnologia-mini', tipo: 'mini', titulo: 'Mini test · Biotecnologia', preguntas: [
      { q: 'La tècnica que permet amplificar (fer moltes còpies) d’un fragment de DNA és…', ops: ['la PCR', 'la fotosíntesi', 'la fagocitosi'], sol: 0, why: 'La PCR (reacció en cadena de la polimerasa) amplifica exponencialment un fragment de DNA in vitro.' },
      { q: 'Els enzims de restricció serveixen per…', ops: ['tallar el DNA en llocs específics', 'unir aminoàcids', 'produir energia'], sol: 0, why: 'Els enzims de restricció reconeixen seqüències concretes i tallen el DNA; són “tisores moleculars”.' },
      { q: 'Un organisme al qual s’ha introduït un gen d’una altra espècie és…', ops: ['transgènic', 'clònic', 'híbrid natural'], sol: 0, why: 'Un organisme transgènic (OMG) porta un gen forà integrat al seu genoma.' },
      { q: 'Els plasmidis, molt usats en enginyeria genètica, són…', ops: ['petites molècules de DNA circular bacterià', 'proteïnes', 'virus'], sol: 0, why: 'Els plasmidis són DNA circular extracromosòmic dels bacteris; s’usen com a vectors per transportar gens.' },
      { q: 'La insulina humana per a diabètics s’obté actualment…', ops: ['de bacteris transgènics', 'del pàncrees de porc únicament', 'per síntesi química de glúcids'], sol: 0, why: 'S’introdueix el gen de la insulina humana en bacteris, que la produeixen a gran escala.' }
    ]},
    final: { id: 'biotecnologia-final', tipo: 'pau', titulo: 'Test final · Biotecnologia (tipus PAU)', preguntas: [
      { q: 'L’eina CRISPR-Cas9 s’utilitza per…', ops: ['editar el genoma de manera dirigida', 'esterilitzar material', 'mesurar el pH'], sol: 0, why: 'CRISPR-Cas9 permet tallar i editar seqüències concretes del DNA amb gran precisió.' },
      { q: 'En clonar un gen dins d’un bacteri, el vector més habitual és…', ops: ['un plasmidi', 'un ribosoma', 'una mitocòndria'], sol: 0, why: 'El gen s’insereix en un plasmidi que el bacteri replica i expressa.' },
      { q: 'La clonació de la ovella Dolly es va fer per…', ops: ['transferència nuclear a un òvul enucleat', 'PCR', 'fermentació'], sol: 0, why: 'Dolly (1996) va néixer per transferència del nucli d’una cèl·lula somàtica a un òvul sense nucli.' },
      { q: 'L’electroforesi en gel separa fragments de DNA segons…', ops: ['la seva mida', 'el seu color', 'la seva temperatura'], sol: 0, why: 'En un camp elèctric, els fragments més petits migren més ràpid: se separen per mida.' },
      { q: 'Les cèl·lules mare embrionàries destaquen per ser…', ops: ['pluripotents (poden originar molts tipus cel·lulars)', 'incapaces de dividir-se', 'sempre canceroses'], sol: 0, why: 'Les cèl·lules mare pluripotents poden diferenciar-se en molts tipus cel·lulars diferents.' },
      { q: 'Un aliment transgènic és aquell que…', ops: ['prové d’un organisme modificat genèticament', 'no conté cap gen', 's’ha esterilitzat'], sol: 0, why: 'Els aliments transgènics deriven d’OMG amb algun gen introduït (p. ex. resistència a plagues).' },
      { q: 'La biotecnologia tradicional inclou processos com…', ops: ['la fabricació de pa, vi i formatge', 'l’edició CRISPR', 'la seqüenciació del genoma'], sol: 0, why: 'La biotecnologia tradicional usa microorganismes (fermentacions) des de fa mil·lennis.' },
      { q: 'La teràpia gènica consisteix a…', ops: ['introduir gens funcionals per tractar una malaltia', 'administrar antibiòtics', 'fer una transfusió de sang'], sol: 0, why: 'La teràpia gènica corregeix o substitueix gens defectuosos per tractar malalties d’origen genètic.' }
    ]}
  };

  /* ===================== EVOLUCIÓ ===================== */
  B.evolucio = {
    mini: { id: 'evolucio-mini', tipo: 'mini', titulo: 'Mini test · Evolució', preguntas: [
      { q: 'Segons Darwin, el mecanisme principal de l’evolució és…', ops: ['la selecció natural', 'l’herència dels caràcters adquirits', 'la generació espontània'], sol: 0, why: 'Darwin proposa la selecció natural: els individus més ben adaptats sobreviuen i es reprodueixen més.' },
      { q: 'La idea que els òrgans molt usats es desenvolupen i s’hereten era de…', ops: ['Lamarck', 'Mendel', 'Pasteur'], sol: 0, why: 'El lamarckisme defensava l’herència dels caràcters adquirits, hipòtesi avui descartada.' },
      { q: 'La variabilitat genètica d’una població prové sobretot de…', ops: ['les mutacions i la recombinació', 'la mida dels individus', 'la temperatura'], sol: 0, why: 'Mutació i recombinació sexual generen la variabilitat sobre la qual actua la selecció.' },
      { q: 'Dos òrgans amb el mateix origen embrionari però funció diferent (braç humà i ala de ratpenat) són…', ops: ['homòlegs', 'anàlegs', 'vestigials'], sol: 0, why: 'Els òrgans homòlegs comparteixen origen (evolució divergent), encara que facin funcions diferents.' },
      { q: 'La teoria sintètica (neodarwinisme) combina la selecció natural amb…', ops: ['la genètica', 'l’astronomia', 'la geologia'], sol: 0, why: 'La teoria sintètica uneix el darwinisme amb la genètica de poblacions i les mutacions.' }
    ]},
    final: { id: 'evolucio-final', tipo: 'pau', titulo: 'Test final · Evolució (tipus PAU)', preguntas: [
      { q: 'Les ales dels ocells i les ales dels insectes són òrgans…', ops: ['anàlegs (evolució convergent)', 'homòlegs', 'vestigials'], sol: 0, why: 'Tenen la mateixa funció (volar) però origen diferent: evolució convergent → òrgans anàlegs.' },
      { q: 'L’aparició d’una nova espècie a partir d’una altra s’anomena…', ops: ['especiació', 'mutació', 'mitosi'], sol: 0, why: 'L’especiació és el procés de formació de noves espècies, sovint per aïllament reproductiu.' },
      { q: 'Els fòssils són una evidència de l’evolució de tipus…', ops: ['paleontològica', 'anatòmica', 'molecular'], sol: 0, why: 'El registre fòssil (paleontologia) mostra formes intermèdies i canvis al llarg del temps.' },
      { q: 'La comparació de seqüències de DNA entre espècies és una evidència…', ops: ['molecular', 'biogeogràfica', 'embriològica'], sol: 0, why: 'Com més semblant és el DNA, més propera és la relació evolutiva: evidència molecular.' },
      { q: 'Un òrgan vestigial és aquell que…', ops: ['ha perdut la seva funció original al llarg de l’evolució', 'apareix de nou en cada generació', 'només tenen les plantes'], sol: 0, why: 'Els òrgans vestigials (p. ex. el còccix) són restes reduïdes d’estructures funcionals dels avantpassats.' },
      { q: 'En una població, si un al·lel augmenta la supervivència, amb el temps la seva freqüència tendeix a…', ops: ['augmentar', 'disminuir fins a desaparèixer', 'mantenir-se sempre igual'], sol: 0, why: 'La selecció natural afavoreix els al·lels avantatjosos, que es fan més freqüents generació rere generació.' },
      { q: 'La selecció artificial (p. ex. races de gossos o coloms) demostra que…', ops: ['la variabilitat es pot dirigir per l’home', 'les espècies no canvien', 'no hi ha herència'], sol: 0, why: 'L’home selecciona caràcters desitjats; Darwin la va usar com a analogia de la selecció natural.' },
      { q: 'Segons la teoria endosimbiòtica, els mitocondris provenen de…', ops: ['bacteris ancestrals incorporats per una cèl·lula', 'virus', 'fragments del nucli'], sol: 0, why: 'La teoria endosimbiòtica (Margulis) proposa que mitocondris i cloroplasts eren bacteris de vida lliure.' }
    ]}
  };

  /* ===================== DISSENY EXPERIMENTAL ===================== */
  B.experimental = {
    mini: { id: 'experimental-mini', tipo: 'mini', titulo: 'Mini test · Disseny experimental', preguntas: [
      { q: 'En un experiment, la variable que l’investigador modifica a propòsit és la…', ops: ['variable independent', 'variable dependent', 'variable controlada'], sol: 0, why: 'La variable independent és la causa que es manipula; la dependent és el que es mesura (l’efecte).' },
      { q: 'El grup control serveix per…', ops: ['comparar amb el grup experimental', 'accelerar l’experiment', 'eliminar la mostra'], sol: 0, why: 'El grup control no rep el tractament i permet atribuir els canvis a la variable estudiada.' },
      { q: 'Una hipòtesi ha de ser…', ops: ['comprovable (contrastable)', 'sempre certa', 'impossible de mesurar'], sol: 0, why: 'Una bona hipòtesi és una explicació provisional que es pot posar a prova experimentalment.' },
      { q: 'Per augmentar la fiabilitat d’un resultat convé…', ops: ['repetir l’experiment i tenir una mostra gran', 'fer-lo una sola vegada', 'canviar moltes variables alhora'], sol: 0, why: 'La repetició i una mostra àmplia redueixen l’atzar i augmenten la fiabilitat.' },
      { q: 'Mantenir constants totes les variables excepte la que estudiem serveix per…', ops: ['assegurar que l’efecte es deu a la variable independent', 'fer l’experiment més ràpid', 'estalviar material'], sol: 0, why: 'Controlar la resta de variables evita explicacions alternatives (variables de confusió).' }
    ]},
    final: { id: 'experimental-final', tipo: 'pau', titulo: 'Test final · Disseny experimental (tipus PAU)', preguntas: [
      { q: 'En estudiar l’efecte d’un fertilitzant sobre el creixement de plantes, la variable dependent és…', ops: ['el creixement de la planta', 'la quantitat de fertilitzant', 'el tipus de test'], sol: 0, why: 'El creixement és el que es mesura (efecte); la quantitat de fertilitzant és la variable independent.' },
      { q: 'Un “doble cec” en un assaig clínic significa que…', ops: ['ni el pacient ni l’investigador saben qui rep el tractament', 'es fa dues vegades', 's’usen dos laboratoris'], sol: 0, why: 'El doble cec evita biaixos: ni pacient ni investigador coneixen qui rep tractament o placebo.' },
      { q: 'Un placebo és…', ops: ['una substància sense efecte que serveix de comparació', 'un fàrmac molt potent', 'un tipus de bacteri'], sol: 0, why: 'El placebo controla l’efecte psicològic i permet comparar amb el tractament real.' },
      { q: 'Si en repetir un experiment s’obtenen resultats molt diferents, direm que és poc…', ops: ['fiable (reproduïble)', 'car', 'llarg'], sol: 0, why: 'La fiabilitat implica que, en repetir-lo en les mateixes condicions, s’obtenen resultats semblants.' },
      { q: 'Les dades quantitatives es representen sovint amb…', ops: ['gràfics i taules', 'dibuixos lliures', 'opinions'], sol: 0, why: 'Taules i gràfics permeten analitzar i comunicar dades numèriques de manera objectiva.' },
      { q: 'La conclusió d’un experiment ha de basar-se en…', ops: ['les dades obtingudes', 'la intuïció de l’investigador', 'la hipòtesi inicial encara que no es compleixi'], sol: 0, why: 'La conclusió es fonamenta en l’anàlisi de les dades, que poden confirmar o refutar la hipòtesi.' }
    ]}
  };

  /* Índice de bloques disponibles (mateix ordre que study-data) */
  function forBloque(id) { return B[id] || null; }
  function testById(tid) {
    for (var k in B) if (B.hasOwnProperty(k)) {
      if (B[k].mini && B[k].mini.id === tid) return B[k].mini;
      if (B[k].final && B[k].final.id === tid) return B[k].final;
    }
    return null;
  }

  return { byBloque: B, forBloque: forBloque, testById: testById };
})();
