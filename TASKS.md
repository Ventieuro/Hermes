# AstroCoin — Task List

<!-- 
  ISTRUZIONI:
  - Scrivi qui i task che vuoi far eseguire a Copilot.
  - Usa il formato sotto per ogni task.
  - Copilot leggerà questo file e li eseguirà in ordine.
  - Dopo aver completato un task, verrà spostato nella sezione "Completati".

  FORMATO TASK:
  - [ ] Descrizione chiara del task
        Dettagli aggiuntivi o specifiche (opzionale)

  PRIORITÀ (opzionale):
  🔴 Alta  🟡 Media  🟢 Bassa

  ⚠️ REGOLA: Dopo OGNI sotto-task completato, eseguire `npm run build`
  per verificare che il codice compili senza errori.

  ⚠️ REGOLA: OGNI richiesta dell'utente deve essere registrata come task
  in questo file PRIMA di essere eseguita, e spostata in "Completati" dopo.
-->

## Da Fare

<!-- Nessun task da fare -->

## In Corso

<!-- Nessun task in corso -->


## Completati

### ✅ TASK-014 — Solar System chart animato su canvas (19/04/2026)
- [x] Riscritto SolarSystemChart: da SVG/HTML statico a canvas con requestAnimationFrame
- [x] Sfondo cosmico (#080b18) con 80 stelle scintillanti
- [x] Sole centrale con gradiente radiale, glow pulsante e testo totale
- [x] Pianeti orbitanti: gradiente, alone di luce, ombra crescent, trail di scia
- [x] Orbite tratteggiate con opacità animata
- [x] Emoji categoria + percentuale su ogni pianeta
- [x] Legenda laterale con pallino glow, stile coerente con SpaceDonutChart
- [x] Build check passato + deployato

### ✅ TASK-013 — Donut chart spaziale animato su canvas (19/04/2026)
- [x] Componente SpaceDonutChart: canvas con requestAnimationFrame
- [x] Sfondo scuro con 80 stelle scintillanti animate
- [x] Fette donut con bordo luminoso pulsante + gap lines
- [x] Pianeti orbitanti per ogni fetta: gradiente, alone di luce, lunetta trail, velocità diverse
- [x] Anelli orbitali tratteggiati
- [x] Centro con etichette Entrate/Uscite + importi
- [x] Legenda laterale con pallino glow, nome, importo, percentuale colorata
- [x] Integrato in ExpensePieChart come vista "Torta" (sostituisce vecchio CSS donut)
- [x] Build check passato + deployato

### ✅ TASK-012 — Grafico Sistema Solare + toggle vista (19/04/2026)
- [x] Creato componente SolarSystemChart: categorie come pianeti orbitanti, sole = totale spese
- [x] Dimensione pianeta proporzionale alla percentuale, emoji + % su ogni pianeta
- [x] Orbite tratteggiate, sfondo stellato, animazione glow
- [x] Legenda laterale con icone, importi e percentuali
- [x] Toggle 🥧 Torta / 🪐 Sistema solare in ExpensePieChart
- [x] Labels i18n (vistaTorta, vistaSolare, categorieLabel)
- [x] Build check passato + deployato

### ✅ TASK-011 — Supporto installazione PWA su iOS (19/04/2026)
- [x] Rilevamento iOS (iPad/iPhone/iPod) in InstallPrompt
- [x] Banner istruzioni "tocca ⬆️ poi Aggiungi alla schermata Home" su Safari iOS
- [x] Nasconde pulsante Installa su iOS (non supportato), mostra solo istruzioni
- [x] Controllo standalone mode: banner non appare se già installata
- [x] Label i18n iosMessage (IT/EN/ES)
- [x] Build check passato + deployato

### ✅ TASK-010 — PWA con notifiche push (19/04/2026)
- [x] Installato vite-plugin-pwa + configurato manifest (nome, colori, display standalone)
- [x] Icone PWA SVG 192x192 e 512x512 con tema spaziale
- [x] Service Worker con Workbox: precache 14 risorse + runtime cache font
- [x] Notifiche via SW (showNotification) per funzionare in background
- [x] Componente InstallPrompt con banner "Installa AstroCoin"
- [x] Labels i18n per PWA (IT/EN/ES)
- [x] Changelog v1.6.0 aggiornato
- [x] Build check passato

### ✅ TASK-009 — Notifica "Novità" dopo ogni deploy (19/04/2026)
- [x] Creato `src/shared/changelog.ts` con array versioni + novità multilingua (IT/EN/ES)
- [x] Creato componente `WhatsNew.tsx`: modale con lista novità, salva versione vista in localStorage
- [x] Integrato in App.tsx: appare automaticamente dopo il PIN se la versione è nuova
- [x] Per aggiungere novità ai prossimi deploy: aggiungere entry in cima a `CHANGELOG` e aggiornare `CURRENT_VERSION`
- [x] Build check passato

### ✅ TASK-008 — Restyling colori movimenti in dark mode (19/04/2026)
- [x] Sostituite classi Tailwind hardcoded con CSS variables per card riepilogo e lista movimenti
- [x] Palette NASA-inspired: verde brillante entrate, arancione NASA uscite, viola/arancione risparmi
- [x] Colori adattivi in entrambi i temi (spazio dark + NASA light)
- [x] Build check passato

### ✅ TASK-007 — Notifiche promemoria spese giornaliere (19/04/2026)
- [x] NotificationSettings interface + loadNotificationSettings/saveNotificationSettings in storage.ts
- [x] Sezione Notifiche nel Settings: toggle on/off + preset orari (19:00, 21:30) + input custom
- [x] Hook useNotificationScheduler con check ogni 30s + Notification API browser
- [x] Labels i18n per notifiche (IT/EN/ES)
- [x] Build check passato

### ✅ TASK-006 — Menu Settings con tema e gestione categorie (19/04/2026)
- [x] Componente Settings.tsx con dropdown ⚙️ nell'header
- [x] Sezione Tema: toggle Dark (Spazio) / Light (NASA)
- [x] Tema NASA Light creato in index.css (bianco, nero, arancione NASA #FC3D21)
- [x] ThemeContext aggiornato: Theme = 'spazio' | 'nasa'
- [x] Sezione Categorie con link a /categories
- [x] Rimosso vecchio ThemeSwitcher + link categorie dall'header
- [x] Build check passato

### ✅ TASK-005 — Gestione categorie completa (19/04/2026)
- [x] Form creazione categorie nella pagina /categories (nome + tipo + emoji picker)
- [x] Emoji picker con 32 icone selezionabili
- [x] Custom icons: loadCustomIcons/saveCustomIcon/deleteCustomIcon in storage.ts
- [x] categoryIcons.ts aggiornato per supportare icone custom
- [x] Rinomina categoria custom (renameCustomCategory: aggiorna lista + icone + transazioni)
- [x] Eliminazione con conferma + pulizia icona
- [x] Labels i18n per nuove funzionalità gestione categorie
- [x] Build check passato

### ✅ TASK-004 — Categorie custom + descrizione opzionale (19/04/2026)
- [x] Descrizione "Per cosa?" resa opzionale (fallback al nome categoria)
- [x] Rimosso auto-fill descrizione
- [x] Bottone "+ Nuova categoria" nel form con opzione "Salva per il futuro"
- [x] Categorie custom salvate in localStorage (`astrocoin-custom-categories`)
- [x] Pagina `/categories` per gestire (visualizzare/eliminare) le categorie custom
- [x] Link nell'header per navigare alla gestione categorie
- [x] Build + test passati

### ✅ TASK-001 — Refactor form transazione e UX categoria (19/04/2026)
- [x] Categoria spostata sopra "Per cosa?"
- [x] Auto-fill descrizione alla selezione categoria
- [x] Descrizione liberamente editabile
- [x] Build check passato

### ✅ TASK-002 — Setup unit test e test base (19/04/2026)
- [x] Vitest + Testing Library + jsdom installati
- [x] 3 file test: storage (11), labels (14), theme (3) — 28 test totali
- [x] Script `test` e `test:watch` in package.json
- [x] Build + test passati

### ✅ TASK-003 — Icone emoji per categorie transazioni (19/04/2026)
- [x] 14 categorie uscita + 5 entrata aggiornate in labels.ts (IT/EN/ES)
- [x] `categoryIcons.ts` creato con mappa categoria → emoji
- [x] Icone visibili nel form (selettore categoria)
- [x] Icone visibili nella lista movimenti in Dashboard
- [x] Build + test passati

