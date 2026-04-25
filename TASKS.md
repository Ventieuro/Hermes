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

### ✅ TASK-049 — Fix Safari iPhone per submit vicino alla toolbar (25/04/2026)
- [x] Aumentata safe-area e padding inferiore del modale aggiunta movimento
- [x] Alzato visivamente il bottone submit dalla toolbar Safari
- [x] Verifica build ✅

### ✅ TASK-048 — Deploy aggiornamento UI form (25/04/2026)
- [x] Eseguito deploy dell'ultima versione su GitHub Pages
- [x] Verificato esito publish ✅

### ✅ TASK-047 — Restyling scelta scontrino/manuale con segmented control (25/04/2026)
- [x] Sostituiti i due pulsanti iniziali con un segmented control piu chiaro
- [x] Aggiunto un pannello contestuale per la modalita scontrino con CTA dedicata
- [x] Build check e verifica runtime dello scanner dal nuovo layout ✅

### ✅ TASK-046 — Riposiziona scelta scontrino/manuale in cima al form (25/04/2026)
- [x] Spostata la scelta "Inserisci tramite scontrino / Inserisci manualmente" in alto nella modale
- [x] Lasciata sotto l'intera sezione normale con toggle Entrata/Uscita e resto del form
- [x] Build check e verifica runtime del trigger scanner ✅

### ✅ TASK-045 — Sposta inserimento scontrino dentro Nuova uscita (25/04/2026)
- [x] Rimosso il pulsante fotocamera dall'header Movimenti in Dashboard
- [x] Aggiunta nel form "Nuova uscita" la sezione con due opzioni: "Inserisci tramite scontrino" e "Inserisci manualmente"
- [x] Collegato il pulsante scontrino all'apertura dello scanner OCR senza alterare il flusso di import
- [x] Build check ✅

### ✅ TASK-044 — OCR Scanner Scontrini (25/04/2026)
- [x] Installato `tesseract.js` (v7, lato client)
- [x] Creato `src/shared/receiptUtils.ts` con `processImage()` (canvas) e `parseReceiptText()`
- [x] Creato `src/components/ReceiptScanner.tsx` con gestione stato `useReducer`
- [x] Multi-foto: merge testo OCR di più immagini
- [x] Parsing regex scontrini italiani: articoli + TOTALE
- [x] Validazione somma articoli vs totale rilevato
- [x] Tabella risultati editabile (modifica nome/prezzo, rimuovi riga)
- [x] Selezione categoria uscita
- [x] Due modalità import: "Crea N transazioni" o "Spesa unica"
- [x] Pulsante "📷 Scontrino" in Dashboard (accanto header Movimenti)
- [x] Label i18n in `labels.ts` sezione `ocr` (IT/EN/ES)
- [x] **Enhancement**: Fotocamera live con barre guida verticali (`getUserMedia`)
- [x] **Enhancement**: Risultati parziali in tempo reale durante OCR
- [x] **Enhancement**: Barra progresso somma → totale (verde se approvato)
- [x] **Enhancement**: Pulsante "Aggiungi riga manuale" nella fase risultati
- [x] **Enhancement**: Nuovi label i18n (`guidaAllineamento`, `chiudiCamera`, `aggiungiManuale`, `approvatoScontrino`, `parzialeMentre`)
- [x] Build check ✅

### ✅ TASK-043b — Transazioni ricorrenti: cascade edit/delete + fix input (25/04/2026)
- [x] Aggiunto campo `recurringGroupId` in `Transaction` (`types.ts`)
- [x] Aggiunte funzioni `deleteTransactionsByGroupId` e `updateTransactionsByGroupId` (`storage.ts`)
- [x] Le nuove serie ricorrenti ottengono un `recurringGroupId` condiviso
- [x] Dialog "Solo questa / Tutte le collegate" su elimina (Dashboard + Movimenti)
- [x] Dialog "Solo questa / Aggiorna tutte" su modifica (AddTransactionForm)
- [x] Fix input "per quanti mesi": stato stringa + `type="text"` per eliminare zeri iniziali
- [x] Label i18n aggiornate (sezioni `form`, `dashboard`, `movimenti`)
- [x] Build check ✅

### ✅ TASK-041 — Backup automatico alla chiusura app (24/04/2026)
- [x] Creato `src/shared/autoBackup.ts` con logica backup (download / cartella FSA)
- [x] Aggiunta sezione "Backup automatico" in `Settings.tsx`
- [x] Toggle attiva/disattiva, scelta destinazione (download o cartella locale)
- [x] Listener `visibilitychange` + `pagehide` in `Layout.tsx`
- [x] Filename con solo data (sovrascrive stesso file nello stesso giorno)
- [x] Label i18n in `labels.ts` sezione `autoBackup`
- [x] Build check ✅

### ✅ TASK-042 — Fix grafico donut: logica entrate→risparmi (24/04/2026)
- [x] Donut mostra le uscite per categoria + slice verde = risparmi
- [x] Il cerchio intero = entrate totali; le spese lo erodono
- [x] Se spese ≥ entrate, nessuna slice verde
- [x] Percentuali con 1 decimale (`toFixed(1)`)
- [x] Build check ✅

### ✅ TASK-043 — Fix parti nere nel donut chart (24/04/2026)
- [x] `ctx.stroke()` era chiamato sul path completo (archi + linee radiali)
- [x] Separato path del glow: solo arco esterno, nessuna linea laterale
- [x] Rimosso anche il sistema gap lines precedente
- [x] Build check ✅


## Completati

### ✅ TASK-040 — Filtro date Dal/Al in Movimenti (24/04/2026)
- [x] Aggiunte label `dalLabel` e `alLabel` in `labels.ts` sezione `movimenti` (IT/EN/ES)
- [x] Aggiunto blocco date picker (Dal / Al) in `Movimenti.tsx` sotto la search bar
- [x] Banner filtro semplificato: mostra solo filtro categoria (da navigazione), non le date
- [x] Pulsante ✕ inline per cancellare il range date
- [x] Il chip "Periodo corrente" compila i campi Dal/Al come shortcut
- [x] Build check passato

### ✅ TASK-039 — Header navigazione unificato (24/04/2026)
- [x] Creato componente `PageHeader` in `src/components/ui/PageHeader.tsx`
- [x] Esportato da `src/components/ui/index.ts`
- [x] `Categories.tsx`: rimosso `<Link>` testuale, sostituito con `<PageHeader>`
- [x] `Movimenti.tsx`: rimosso `<h1>` manuale, sostituito con `<PageHeader>`
- [x] `SettingsPage.tsx`: rimosso `useNavigate`, aggiunto `<PageHeader>`
- [x] `Settings.tsx`: rimosso header interno con ✕ dalla modal mode
- [x] Build check ✅

### ✅ TASK-038 — Popup custom al posto dei dialog nativi (24/04/2026)
- [x] Creato `src/shared/DialogContext.tsx` con `DialogProvider` e `useDialog` hook
- [x] `DialogProvider` aggiunto in `main.tsx` nello stack dei provider
- [x] Sostituito `window.confirm` in `Dashboard.tsx` (elimina transazione)
- [x] Sostituito `confirm` in `Categories.tsx` (elimina categoria)
- [x] Sostituiti `window.confirm` e `window.prompt` (×3) in `Settings.tsx` (importa, sync, esporta)
- [x] Build check ✅

### ✅ TASK-037 — Rimozione notch e riallineamento dock (24/04/2026)
- [x] Rimossa notch sopra il bottone `+`
- [x] Riposizionato `+` sospeso sopra la barra come versione precedente
- [x] Spostate le icone piu in basso nella dock per ridurre spazio vuoto
- [x] Build check
- [x] Deploy GitHub Pages

### ✅ TASK-036 — Fix resa visiva dock (24/04/2026)
- [x] Ridotta larghezza della barra per evitare effetto "blocco" troppo grande
- [x] Notch centrale ridimensionata e meno invasiva
- [x] Riallineate le voci della nav con spazio centrale dedicato al `+`
- [x] Tasto `+` ridimensionato e glow/pulse meno aggressivi
- [x] Build check
- [x] Deploy GitHub Pages

### ✅ TASK-035 — Rifiniture dock: pulse, notch, icone vector (24/04/2026)
- [x] Animazione pulse morbida del tasto `+`
- [x] Notch centrale resa piu marcata e coerente con tema Hermes
- [x] Sostituite emoji con icone vettoriali per Home, Categorie, Impostazioni
- [x] Build check
- [x] Deploy GitHub Pages

### ✅ TASK-034 — Bottom dock stile Satispay adattata Hermes (24/04/2026)
- [x] Restyling BottomNav con design dock floating (glass + glow)
- [x] Inserito tasto `+` centrale orbit-style integrato nella barra
- [x] Collegato il `+` all'apertura del form in Dashboard via evento globale
- [x] Rimosso FAB duplicato dalla Dashboard
- [x] Aggiunte label i18n per voci barra (`layout.nav*`)
- [x] Build check
- [x] Deploy GitHub Pages

### ✅ TASK-033 — Ripristino tasto + sopra barra bassa (23/04/2026)
- [x] Corretto posizionamento FAB nella Dashboard (`bottom-24`)
- [x] Aumentato z-index FAB (`z-50`) per evitare overlay della bottom bar
- [x] Build check
- [x] Deploy GitHub Pages

### ✅ TASK-032 — Barra in basso visibile anche su desktop (23/04/2026)
- [x] Rimossa regola responsive che nascondeva la BottomNav (`md:hidden`)
- [x] Aggiunto `z-40` alla barra per visibilità stabile
- [x] Aumentato padding bottom del contenuto anche su desktop (`md:pb-24`)
- [x] Build check

### ✅ TASK-031 — Deploy su GitHub Pages (23/04/2026)
- [x] Eseguito deploy con script `npm run deploy`
- [x] Build produzione completata durante il deploy
- [x] Pubblicazione completata (`gh-pages`)

### ✅ TASK-030 — Bottom Navigation (menu in basso) (23/04/2026)
- [x] Creato componente BottomNav con Home, Categorie, Impostazioni
- [x] Riposizionato Settings come modal dal BottomNav
- [x] Modificato Layout per integrare il BottomNav
- [x] Aggiunto padding al main content per evitare sovrapposizioni
- [x] Aggiunta label `impostazioni` in labels.ts
- [x] Build check

### ✅ TASK-029 — Modalita 100% manuale (Drive predisposto) (23/04/2026)
- [x] `features.ts` — disattivata sezione Locale/Drive in UI (`codeTransfer: false`)
- [x] Conservata integrazione Drive nel codice per riattivazione futura
- [x] Build check

### ✅ TASK-028 — Modalità Locale/Drive (sostituisce transfer code) (23/04/2026)
- [x] Strategia dati: locale di default, Drive opzionale
- [x] Integrazione Google Drive file cifrato (no DB)
- [x] Rimossa UI transfer code dalla sezione Sync
- [x] Aggiunta UI "Connetti Drive", "Sync ora", "Disconnetti"
- [x] Conservato merge automatico con i dati locali
- [x] Aggiornati `TASKS.md`, `CHANGELOG.md` e build check

### ✅ TASK-027 — Trasferimento con codice (Applica/Ricevi) (23/04/2026)
- [x] `storage.ts` — generazione codice cifrato e import da codice
- [x] `Settings.tsx` — UI "Genera codice", "Ricevi" e "Applica"
- [x] `features.ts` — QR disattivato di default, code-transfer attivo
- [x] `labels.ts` — label dedicate al flusso codice
- [x] Build check

### ✅ TASK-026 — Fix QR scan 404 + URL parser robusto (23/04/2026)
- [x] `storage.ts` — generazione link QR con `?xfer=` (non hash)
- [x] `storage.ts` — parser token compatibile con formato vecchio e nuovo
- [x] `App.tsx` — ingest da hash/query/path + pulizia URL post-scan
- [x] Build check

### ✅ TASK-025 — Import PC → telefono via QR con merge dati (22/04/2026)
- [x] Strategia sync transazioni con metadati (`syncId`, `createdAt`, `updatedAt`)
- [x] Merge sicuro su import (`mode: 'merge'`) senza sostituzione completa
- [x] Flusso QR chunked (`#xfer=...`) per superare il limite di payload del singolo QR
- [x] UI Settings: generazione QR, navigazione chunk, import merge lato telefono
- [x] Cifratura mantenuta (AES-GCM + password) anche nel trasferimento QR
- [x] Aggiornati `TASKS.md`, `CHANGELOG.md` e build check

### ✅ TASK-024 — Cambio lingua nei Settings (22/04/2026)
- [x] `labels.ts` — label `lingua` nella sezione settings (IT/EN/ES)
- [x] `Settings.tsx` — sezione lingua con 3 bottoni (🇮🇹 🇬🇧 🇪🇸), reload su cambio
- [x] Build check


## Completati

### ✅ TASK-023 — Regola aggiornamento CHANGELOG (22/04/2026)
- [x] `copilot-instructions.md` — sezione "Regole Obbligatorie a Fine Task"
- [x] `CHANGELOG.md` — voci TASK-020 e TASK-021 aggiunte
- [x] `CHANGELOG.md` — voce TASK-022 e TASK-023 aggiunte

### ✅ TASK-022 — Cifratura AES-GCM backup export/import (22/04/2026)
- [x] `storage.ts` — `exportAllData(password)` async con AES-GCM + PBKDF2
- [x] `storage.ts` — `importAllData(json, password?)` async, gestisce formato cifrato e plain
- [x] `labels.ts` — label password prompt (IT/EN/ES)
- [x] `Settings.tsx` — handler async, prompt password, nuovo stato `wrong-password`
- [x] Build check


## Completati

### ✅ TASK-021 — Nuova icona app (moneta + orbita) (22/04/2026)
- [x] `public/pwa-192x192.svg` — icona 192×192 con moneta dorata + orbita
- [x] `public/pwa-512x512.svg` — icona 512×512 scalata
- [x] `index.html` — favicon aggiornato
- [x] Build check


## Completati

### ✅ TASK-020 — Export/Import JSON + feature flag (22/04/2026)
- [x] `src/app/features.ts` — configurazione globale feature flags
- [x] `storage.ts` — `exportAllData()` e `importAllData()` 
- [x] `labels.ts` — label sezione sincronizzazione (IT/EN/ES)
- [x] `Settings.tsx` — sezione Export/Import JSON gated da `FEATURES.exportImportJson`
- [x] Build check


## Completati

### ✅ TASK-019 — Componenti UI riusabili + regola check (19/04/2026)
- [x] Creata cartella `src/components/ui/` con barrel export
- [x] Card: contenitore con bordo/sfondo tema (padding sm/md/lg)
- [x] Button: 4 varianti (primary/secondary/danger/ghost), selected, disabled, fullWidth
- [x] Input: campo con stile tema (size sm/md/lg, type text/number/date/password/time)
- [x] IconButton: bottone icona (size sm/md/lg, shape circle/square)
- [x] SectionHeader: titolo sezione uppercase muted
- [x] Modal: overlay modale con click-outside-to-close (position center/bottom)
- [x] FAB: floating action button con stile tema
- [x] Regola aggiunta a copilot-instructions.md: "controllare ui/ prima di creare elementi"
- [x] 31 test passati + build check OK

### ✅ TASK-000 — Creazione progetto (19/04/2026)
- [x] Scaffolding React 19 + TypeScript 5.7 + Vite 6
- [x] Tailwind CSS 4, React Router DOM 7
- [x] Struttura cartelle: components/, pages/, shared/
- [x] Layout base, Dashboard, Home, NotFound
- [x] Sistema i18n (labels.ts) con IT/EN/ES
- [x] ThemeContext + tema spazio (dark)
- [x] localStorage per persistenza dati (storage.ts)
- [x] Modello Transaction + AppSettings
- [x] Form AddTransactionForm + lista movimenti
- [x] Componente Mascot con messaggi dinamici
- [x] Deploy su GitHub Pages

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

### ✅ TASK-004 — Categorie custom + descrizione opzionale (19/04/2026)
- [x] Descrizione "Per cosa?" resa opzionale (fallback al nome categoria)
- [x] Rimosso auto-fill descrizione
- [x] Bottone "+ Nuova categoria" nel form con opzione "Salva per il futuro"
- [x] Categorie custom salvate in localStorage (`astrocoin-custom-categories`)
- [x] Pagina `/categories` per gestire (visualizzare/eliminare) le categorie custom
- [x] Link nell'header per navigare alla gestione categorie
- [x] Build + test passati

### ✅ TASK-005 — Gestione categorie completa (19/04/2026)
- [x] Form creazione categorie nella pagina /categories (nome + tipo + emoji picker)
- [x] Emoji picker con 32 icone selezionabili
- [x] Custom icons: loadCustomIcons/saveCustomIcon/deleteCustomIcon in storage.ts
- [x] categoryIcons.ts aggiornato per supportare icone custom
- [x] Rinomina categoria custom (renameCustomCategory: aggiorna lista + icone + transazioni)
- [x] Eliminazione con conferma + pulizia icona
- [x] Labels i18n per nuove funzionalità gestione categorie
- [x] Build check passato

### ✅ TASK-006 — Menu Settings con tema e gestione categorie (19/04/2026)
- [x] Componente Settings.tsx con dropdown ⚙️ nell'header
- [x] Sezione Tema: toggle Dark (Spazio) / Light (NASA)
- [x] Tema NASA Light creato in index.css (bianco, nero, arancione NASA #FC3D21)
- [x] ThemeContext aggiornato: Theme = 'spazio' | 'nasa'
- [x] Sezione Categorie con link a /categories
- [x] Rimosso vecchio ThemeSwitcher + link categorie dall'header
- [x] Build check passato

### ✅ TASK-007 — Notifiche promemoria spese giornaliere (19/04/2026)
- [x] NotificationSettings interface + loadNotificationSettings/saveNotificationSettings in storage.ts
- [x] Sezione Notifiche nel Settings: toggle on/off + preset orari (19:00, 21:30) + input custom
- [x] Hook useNotificationScheduler con check ogni 30s + Notification API browser
- [x] Labels i18n per notifiche (IT/EN/ES)
- [x] Build check passato

### ✅ TASK-008 — Restyling colori movimenti in dark mode (19/04/2026)
- [x] Sostituite classi Tailwind hardcoded con CSS variables per card riepilogo e lista movimenti
- [x] Palette NASA-inspired: verde brillante entrate, arancione NASA uscite, viola/arancione risparmi
- [x] Colori adattivi in entrambi i temi (spazio dark + NASA light)
- [x] Build check passato

### ✅ TASK-009 — Notifica "Novità" dopo ogni deploy (19/04/2026)
- [x] Creato `src/shared/changelog.ts` con array versioni + novità multilingua (IT/EN/ES)
- [x] Creato componente `WhatsNew.tsx`: modale con lista novità, salva versione vista in localStorage
- [x] Integrato in App.tsx: appare automaticamente dopo il PIN se la versione è nuova
- [x] Per aggiungere novità ai prossimi deploy: aggiungere entry in cima a `CHANGELOG` e aggiornare `CURRENT_VERSION`
- [x] Build check passato

### ✅ TASK-010 — PWA con notifiche push (19/04/2026)
- [x] Installato vite-plugin-pwa + configurato manifest (nome, colori, display standalone)
- [x] Icone PWA SVG 192x192 e 512x512 con tema spaziale
- [x] Service Worker con Workbox: precache 14 risorse + runtime cache font
- [x] Notifiche via SW (showNotification) per funzionare in background
- [x] Componente InstallPrompt con banner "Installa AstroCoin"
- [x] Labels i18n per PWA (IT/EN/ES)
- [x] Changelog v1.6.0 aggiornato
- [x] Build check passato

### ✅ TASK-011 — Supporto installazione PWA su iOS (19/04/2026)
- [x] Rilevamento iOS (iPad/iPhone/iPod) in InstallPrompt
- [x] Banner istruzioni "tocca ⬆️ poi Aggiungi alla schermata Home" su Safari iOS
- [x] Nasconde pulsante Installa su iOS (non supportato), mostra solo istruzioni
- [x] Controllo standalone mode: banner non appare se già installata
- [x] Label i18n iosMessage (IT/EN/ES)
- [x] Build check passato + deployato

### ✅ TASK-012 — Grafico Sistema Solare + toggle vista (19/04/2026)
- [x] Creato componente SolarSystemChart: categorie come pianeti orbitanti, sole = totale spese
- [x] Dimensione pianeta proporzionale alla percentuale, emoji + % su ogni pianeta
- [x] Orbite tratteggiate, sfondo stellato, animazione glow
- [x] Legenda laterale con icone, importi e percentuali
- [x] Toggle 🥧 Torta / 🪐 Sistema solare in ExpensePieChart
- [x] Labels i18n (vistaTorta, vistaSolare, categorieLabel)
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

### ✅ TASK-014 — Solar System chart animato su canvas (19/04/2026)
- [x] Riscritto SolarSystemChart: da SVG/HTML statico a canvas con requestAnimationFrame
- [x] Sfondo cosmico (#080b18) con 80 stelle scintillanti
- [x] Sole centrale con gradiente radiale, glow pulsante e testo totale
- [x] Pianeti orbitanti: gradiente, alone di luce, ombra crescent, trail di scia
- [x] Orbite tratteggiate con opacità animata
- [x] Emoji categoria + percentuale su ogni pianeta
- [x] Legenda laterale con pallino glow, stile coerente con SpaceDonutChart
- [x] Build check passato + deployato

### ✅ TASK-015 — Rinomina app da AstroCoin a Hermes (19/04/2026)
- [x] Rinominati tutti i riferimenti in src/ (labels, storage keys, changelog, notifications, PWA)
- [x] Aggiornati vite.config.ts (base, manifest, scope, start_url → /Hermes/)
- [x] Aggiornati index.html, package.json
- [x] Aggiornati test (labels, storage, theme)
- [x] 28 test passati + build check OK
- [x] Nota: serve rinominare repo GitHub da AstroCoin a Hermes

### ✅ TASK-016 — Legenda grafici con pianeti animati su canvas (19/04/2026)
- [x] Creato componente MiniPlanet: mini canvas animato con glow pulsante, gradiente, crescent shadow
- [x] Integrato in SpaceDonutChart e SolarSystemChart (sostituisce pallino HTML)
- [x] Changelog v1.7.0 aggiornato con rename + grafici + iOS
- [x] Build check passato

### ✅ TASK-017 — Fix grafiche donut + sistema solare (19/04/2026)
- [x] Donut snellito (outerR 130→100, innerR 75→58) per evitare overflow pianeti
- [x] Orbite calcolate dinamicamente con cap al bordo canvas
- [x] Ombra crescent e scia corrette per pianeti in senso antiorario (param direction)
- [x] Sistema solare: stesse fix ombra/scia + maggiore distanza sole-pianeti
- [x] Build check passato + deployato

### ✅ TASK-018 — Transazioni modificabili + audit sicurezza (19/04/2026)
- [x] `updateTransaction()` in storage.ts
- [x] AddTransactionForm accetta `editTransaction` prop per pre-popolare i campi
- [x] Bottone ✏️ su ogni movimento in Dashboard
- [x] Labels modifica (IT/EN/ES)
- [x] PIN hashato con SHA-256 + confronto constant-time
- [x] `generateId()` con `crypto.getRandomValues()` (CSPRNG)
- [x] Validazione schema su `loadTransactions()` (filtra dati corrotti)
- [x] Sessione PIN con timeout 30 minuti
- [x] 31 test passati (3 nuovi: updateTransaction + validazione)

