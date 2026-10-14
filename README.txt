TEMPORALI — ESTATE 2002 (Demo 0.3.1)
================================

COME AVVIARE
1. Estrai lo ZIP in una cartella.
2. Apri index.html con Chrome, Edge o Firefox aggiornato.
3. Serve una connessione Internet per caricare Three.js dal CDN; il gioco non invia dati a un server.
4. Premi “Entra nell'estate 2002”. Per il controllo migliore usa mouse e tastiera.

COSA CAMBIA NELLA DEMO 0.3.1
- Rifatta la morfologia: pianura padana più bassa, rilievi sintetici di Franciacorta, Maddalena, Val Trompia, Val Camonica, Maniva e montagne del Garda, con ancoraggi altimetrici approssimativi nei centri abitati.
- Aumentata la risoluzione della mesh del terreno e aggiunte variazioni altimetriche più morbide.
- Corretto il movimento in prima persona: W avanti, S indietro, A/D laterali rispetto alla visuale.
- Sistemata la facciata della casa iniziale: pareti complete e porta socchiusa.
- Rifatti i tetti delle abitazioni generate con falde invece di tetti a punta.
- Aggiunta una texture procedurale leggera al terreno.
- Rifatti gli alberi con chiome più tonde e composte da più masse di foglie; tronco e chiome oscillano in base al vento vicino al giocatore.
- Ogni centro abitato ha una rete locale di strade collegate a una maglia residenziale, non più solo case casuali sparse.
- Aggiunte piazze, fontane, illuminazione stradale, chiese con campanile, municipi con orologio, scuole con cortile, mercati con bancarelle e parchi nei centri più grandi.
- Le dimensioni e la densità dei quartieri cambiano in base alla popolazione: i paesi restano compatti, le città ricevono più isolati e palazzi.
- Aggiunti cartelli dei comuni in stile italiano e più dettagli alla strada locale.
- Ottimizzate le strade locali: i tratti vengono uniti in un’unica mesh regionale per ridurre drasticamente i draw call mantenendo altimetria e segnaletica.
- Corretta la scala verticale della Fiat Multipla e abbassato il punto di vista alla guida; le ruote mantengono una sezione circolare invece di essere schiacciate.
- Aggiunte scuole e mercati extra nei centri maggiori, e la casa iniziale ora tende a comparire in un quartiere residenziale anziché sopra la piazza centrale.
- Ricostruita da zero la Fiat Multipla prima serie: silhouette alta, cofano corto, parabrezza grande e inclinato, finestrini alti, specchietti sporgenti, archi ruota, cerchi in lega, doppio livello di luci, fendinebbia, griglia bassa, paraurti grigi e targa in stile europeo.

COMANDI
W A S D        Camminare / guidare
Mouse          Guardarsi intorno
E              Interagire (portatile / Fiat Multipla / scendere)
M              Aprire o chiudere la carta
L              Usare il portatile nelle zone Wi-Fi pubbliche
V              Impugnare / riporre videocamera MiniDV
R              Avviare / terminare un filmato
Rotella mouse  Regolare il fuoco della videocamera
F              Aggiustare il fuoco a piccoli passi
C              Pulire la lente
Shift          Correre
Ctrl           Camminare lentamente (più stabile)
Spazio         Freno breve quando si guida
Esc            Pausa / libera il mouse

CICLO DI GIOCO
- Parti nella casa casuale di un comune bresciano, con una Fiat Multipla e una videocamera MiniDV.
- Usa il portatile sulla scrivania (E) per il radar semplificato e le segnalazioni dei cittadini.
- I nuovi report sono pubblicati dopo 5 minuti simulati (il tempo nel prototipo scorre 12 volte più veloce di quello reale).
- Impugna la videocamera (V), cerca il temporale, regola il fuoco con la rotella, registra con R e termina con R.
- Per pulire la lente usa C. Vento forte e movimento riducono la stabilità.
- Torna a casa o raggiungi un internet point contrassegnato vicino a una città; premi L e apri MeteoTube per pubblicare i filmati.
- I pagamenti dipendono da qualità, durata e intensità dell'evento. Il mercato vende piccoli upgrade e nuove cassette.

COSA È / NON È QUESTA DEMO
Questa è una vertical slice tecnica: movimento in prima persona, guida arcade, casa, modello procedurale più dettagliato della Fiat Multipla prima serie, maglie stradali e centri abitati con edifici civici generati, celle temporalesche in movimento, pioggia, vento, fulmini/tuoni, segnalazioni con ritardo, videocamera e pubblicazione dei filmati.
Non è una ricostruzione fedele 1:1 delle due province: strade, terreni e fabbricati sono procedurali; le quote dei centri abitati sono riferimenti approssimativi, e le montagne sono rilievi sintetici ispirati alla geografia regionale, non un DEM reale. Il modello della Multipla è costruito con geometrie procedurali, non è un modello scansionato né un asset CAD ufficiale. La fisica e il meteo sono una simulazione ludica, non un modello meteorologico scientifico. I progressi si perdono ricaricando la pagina. Il portatile simula servizi fittizi del 2002 e non apre siti web reali.

AVVIO / RISOLUZIONE PROBLEMI
1. Estrai tutto lo ZIP in una cartella normale.
2. Apri temporali_2002/index.html con Google Chrome o Microsoft Edge (non nell’anteprima di ChatGPT o di Google Drive).
3. Lascia che il pulsante termini “PREPARAZIONE AMBIENTE 3D…” e poi cliccalo.
4. È necessaria Internet per scaricare Three.js. Se l’avvio fallisce, la pagina mostra il messaggio d'errore preciso. Se il problema è WebGL, attiva l’accelerazione grafica hardware nelle impostazioni del browser e riavvialo.
