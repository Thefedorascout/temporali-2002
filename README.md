# TEMPORALI — Estate 2002 (Demo 0.4.0)

## Struttura del progetto

- `index.html`: markup e ordine di caricamento.
- `css/game.css`: stili dell'interfaccia.
- `js/config.js`: versione e impostazioni iniziali.
- `js/core/utils.js`: utility condivise.
- `js/data/towns.js`: comuni e ancoraggi altimetrici indicativi.
- `js/systems/world.js`: scena 3D, terreno, rilievi, strade, centri abitati, edifici, alberi e casa iniziale.
- `js/systems/vehicle.js`: modello procedurale della Fiat Multipla.
- `js/systems/storms.js`: geometria visiva delle nubi.
- `js/systems/weather.js`: condizioni locali, movimento delle celle, pioggia, fulmini e report.
- `js/systems/player.js`: camminata, guida, collisioni e prompt di interazione.
- `js/systems/camera.js`: videocamera MiniDV, pulizia lente, fuoco, registrazione e punteggio dei filmati.
- `js/ui/laptop.js`: portatile, radar, segnalazioni, MeteoTube, negozio e mappa.
- `js/controls/input.js`: tastiera, mouse, pointer lock e comandi di gioco.
- `js/main.js`: inizializzazione e ciclo di rendering.

Gli script usano namespace classici `window.Temporali...` invece di import ES modules per mantenere la compatibilità con l'avvio tramite doppio clic su `index.html` (`file://`), senza server locale. I sistemi ricevono le dipendenze attraverso un oggetto di contesto.

## Avvio

1. Scarica il repository (Code → Download ZIP) ed estrai tutto mantenendo le cartelle.
2. Apri `index.html` con Chrome, Edge o Firefox aggiornato.
3. È necessaria Internet per scaricare Three.js dal CDN.
4. Premi “Entra nell'estate 2002”.

## Comandi

| Tasto | Azione |
|---|---|
| WASD | Camminare / guidare |
| Mouse | Guardarsi intorno |
| E | Interagire con portatile, auto o uscire dall'auto |
| M | Aprire / chiudere la carta |
| L | Usare il portatile nelle zone Wi-Fi pubbliche |
| V | Impugnare / riporre la videocamera MiniDV |
| R | Avviare / terminare un filmato |
| Rotella mouse | Regolare il fuoco |
| F | Regolare il fuoco a piccoli passi |
| C | Pulire la lente |
| Shift | Correre |
| Ctrl | Camminare lentamente |
| Spazio | Freno breve durante la guida |
| Esc | Pausa / liberare il mouse |

## Dove modificare

Per terreno e città usa `js/systems/world.js`; per l'auto `vehicle.js`; per la dinamica meteo `weather.js`; per la videocamera `camera.js`; per i report e il portatile `js/ui/laptop.js`; per i comandi `js/controls/input.js`; per coordinate e quote `js/data/towns.js`.

## Controlli automatici

GitHub Actions verifica la sintassi di ogni file JavaScript, i percorsi degli script e il loro ordine di caricamento. Non sostituisce un test grafico in un browser WebGL.

## Limiti noti

La mappa non è una ricostruzione 1:1: strade, terreno ed edifici sono procedurali, le quote dei centri abitati sono indicative e non è integrato un modello digitale del terreno. La Multipla è geometria procedurale, non un asset CAD; il meteo è una simulazione ludica e i progressi non persistono dopo il refresh. Il portatile simula servizi fittizi del 2002 e non apre siti web reali.
