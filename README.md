# TEMPORALI — Estate 2002 (Demo 0.4.0)

## Struttura del progetto

- `index.html`: markup dell'interfaccia e ordine di caricamento dei sistemi.
- `css/game.css`: stili dell'interfaccia.
- `js/config.js`: configurazione condivisa (versione, ritmo temporale, cassa e batteria iniziali).
- `js/core/utils.js`: funzioni comuni per numeri, distanze, casualità e accesso agli elementi dell'interfaccia.
- `js/data/towns.js`: registro dei comuni e ancoraggi altimetrici indicativi.
- `js/systems/world.js`: terreno, quote, strade, insediamenti, edifici civici, alberi e collocazione della casa iniziale.
- `js/systems/vehicle.js`: geometria procedurale della Fiat Multipla prima serie.
- `js/systems/storms.js`: generazione visiva delle nubi temporalesche.
- `js/main.js`: orchestrazione della partita, simulazione meteorologica, movimento, videocamera, portatile, MeteoTube, input, audio e rendering.

I file condividono namespace classici (`window.Temporali...`) anziché usare import ES modules. È una scelta deliberata per mantenere l'avvio con doppio clic su `index.html` (`file://`), senza un server locale.

## Avvio

1. Scarica il repository (Code → Download ZIP) oppure fai il clone.
2. Estrai l'intero contenuto mantenendo le cartelle.
3. Apri `index.html` con Chrome, Edge o Firefox aggiornato.
4. È richiesta una connessione Internet per scaricare Three.js dal CDN.
5. Premi “Entra nell'estate 2002”.

## Comandi

| Tasto | Azione |
|---|---|
| WASD | Camminare / guidare |
| Mouse | Guardarsi intorno |
| E | Interagire con portatile, auto o uscire dall'auto |
| M | Aprire / chiudere la carta |
| L | Usare il portatile in una zona Wi-Fi pubblica |
| V | Impugnare / riporre la videocamera MiniDV |
| R | Avviare / terminare un filmato |
| Rotella mouse | Regolare il fuoco |
| F | Regolare il fuoco a piccoli passi |
| C | Pulire la lente |
| Shift | Correre |
| Ctrl | Camminare lentamente |
| Spazio | Freno breve durante la guida |
| Esc | Pausa / liberare il mouse |

## Dove lavorare

- **Terreno, strade, paesi e alberi:** `js/systems/world.js`
- **Modello della Fiat Multipla:** `js/systems/vehicle.js`
- **Forma delle nubi temporalesche:** `js/systems/storms.js`
- **Comuni e quote indicative:** `js/data/towns.js`
- **Configurazione e utility condivise:** `js/config.js`, `js/core/utils.js`
- **Loop, interfaccia e logica di partita:** `js/main.js`
- **Stili:** `css/game.css`

## Controlli automatici

Il workflow GitHub Actions controlla la sintassi JavaScript di ogni file e che i percorsi referenziati da `index.html` esistano. Questi controlli non sostituiscono una prova grafica in un browser reale.

## Limiti noti della demo

La mappa non è una ricostruzione 1:1: strade, terreno e fabbricati sono ancora procedurali, le quote dei centri abitati sono indicative e non è integrato un modello digitale del terreno. La Multipla è geometria procedurale, non un asset CAD; il meteo è una simulazione ludica e i progressi non persistono dopo il refresh. Il portatile usa servizi fittizi del 2002 e non naviga su siti reali.
