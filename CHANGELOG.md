# AstroCoin — Changelog

> Report delle modifiche al progetto, aggiornato automaticamente.

---

## [25/04/2026] — Sessione 6

### TASK-055: Migrazione storage a IndexedDB con preservazione dati
**File modificati:** `src/shared/storage.ts`, `src/main.tsx`, `TASKS.md`, `CHANGELOG.md`

- Introdotto nuovo layer storage gestito con cache in memoria e backend IndexedDB (`hermes-db`, store `kv`)
- Aggiunta funzione di bootstrap `initPersistentStorage()` con migrazione one-shot: se i dati esistono in localStorage vengono copiati in IndexedDB e poi rimossi da localStorage
- Mantenuto fallback automatico a localStorage in caso di browser senza IndexedDB o errori di apertura DB
- Aggiornato `main.tsx` per attendere l'inizializzazione/migrazione prima del rendering dell'app, evitando perdita dati durante il passaggio
- **Build check:** ✅ Passato

### TASK-053: Indicatore uso localStorage nei Settings
**File modificati:** `src/components/Settings.tsx`, `src/shared/labels.ts`, `TASKS.md`, `CHANGELOG.md`

- Aggiunta nuova sezione `Spazio locale` nei Settings con barra progresso utilizzo localStorage
- Mostrati dettaglio `usato / limite stimato` in MB e percentuale corrente
- Aggiunto warning visivo sopra soglia alta (>= 70%)
- Inserite nuove label i18n (IT/EN/ES) per titolo, dettaglio, warning e nota
- **Build check:** ✅ Passato

### TASK-052: Riordino TASKS per ordine cronologico decrescente
**File modificati:** `TASKS.md`, `CHANGELOG.md`

- Unificate in una sola le sezioni duplicate `Completati` presenti nel file task
- Riordinati i blocchi task dal piu recente al piu vecchio (TASK-052 → TASK-000)
- Verificata la struttura finale con una sola intestazione `## Completati`
- **Build check:** ✅ Passato

### TASK-051: Deploy novita correnti
**File modificati:** `TASKS.md`, `CHANGELOG.md`

- Eseguito deploy finale della versione corrente con script di progetto
- Build di produzione completata correttamente durante la pipeline di deploy
- Pubblicazione GitHub Pages completata con output `Published`
- **Deploy check:** ✅ Passato

### TASK-050: Deploy fix Safari e aggiornamenti form
**File modificati:** `TASKS.md`, `CHANGELOG.md`

- Eseguito `npm run deploy` dopo gli ultimi aggiornamenti al form e al fix Safari iPhone
- Build di produzione completata correttamente durante il deploy
- Pubblicazione GitHub Pages completata con output `Published`
- **Deploy check:** ✅ Passato

### TASK-049: Fix Safari iPhone per submit troppo vicino alla toolbar
**File modificati:** `src/components/AddTransactionForm.tsx`, `TASKS.md`, `CHANGELOG.md`

- Aggiunto padding inferiore con `env(safe-area-inset-bottom)` al contenitore e al form della modale di aggiunta movimento
- Il bottone submit e stato leggermente rialzato con margine verticale extra per allontanarlo dalla toolbar bassa di Safari
- Nessuna modifica alla logica di salvataggio: fix limitato al layout touch-safe del modale
- **Build check:** ✅ Passato

### TASK-048: Deploy aggiornamento UI form
**File modificati:** `TASKS.md`, `CHANGELOG.md`

- Eseguito `npm run deploy` dopo gli ultimi aggiustamenti UI del form di inserimento
- La build di produzione e terminata correttamente durante il deploy
- Pubblicazione GitHub Pages completata con output `Published`
- **Deploy check:** ✅ Passato

### TASK-047: Restyling selezione manuale/scontrino con segmented control
**File modificati:** `src/components/AddTransactionForm.tsx`, `src/shared/labels.ts`, `TASKS.md`, `CHANGELOG.md`

- La sezione iniziale del form e stata convertita in un segmented control con stato attivo tra `Inserisci tramite scontrino` e `Inserisci manualmente`
- Quando e selezionata la modalita scontrino compare un pannello contestuale con descrizione breve e CTA `Apri scanner scontrino`
- Il resto del form rimane invariato e il flusso OCR si apre correttamente dal nuovo pannello
- Aggiunte 3 nuove label i18n nella sezione `form`
- **Build check:** ✅ Passato

### TASK-046: Riposizionamento scelta scontrino/manuale in cima al form
**File modificati:** `src/components/AddTransactionForm.tsx`, `TASKS.md`, `CHANGELOG.md`

- La sezione `Inserisci tramite scontrino / Inserisci manualmente` e stata spostata sopra al toggle `Entrata / Uscita`
- Il resto del form rimane interamente sotto, senza cambiare il comportamento della feature
- Verifica eseguita sia con `npm run build` sia aprendo lo scanner dalla nuova posizione in UI
- **Build check:** ✅ Passato

### TASK-045: Spostamento accesso scontrino in Nuova uscita
**File modificati:** `src/components/AddTransactionForm.tsx`, `src/pages/Dashboard.tsx`, `src/shared/labels.ts`, `TASKS.md`, `CHANGELOG.md`

- Rimosso il pulsante `📷 Scontrino` dall'header della sezione Movimenti in Dashboard
- Aggiunta in `Nuova uscita` una nuova sezione iniziale con due CTA: `Inserisci tramite scontrino` e `Inserisci manualmente`
- Il flusso OCR resta invariato ma ora si apre direttamente dalla modale del form; al salvataggio via scontrino viene chiuso anche il form sottostante e aggiornata la dashboard
- Aggiunte 3 nuove label i18n nella sezione `form` per la scelta del metodo di inserimento
- **Build check:** ✅ Passato

### TASK-044b: Enhancement OCR Scanner — Fotocamera live + risultati in tempo reale
**File modificati:** `src/components/ReceiptScanner.tsx`, `src/shared/labels.ts`

- **Fotocamera live con barre guida**: nuova fase `camera` che usa `getUserMedia` con overlay CSS (barre verticali bianche al 14%/86%, zone laterali scurite al 52%, angolini d'inquadratura). Scatto con canvas → `File`, poi torna alla fase `input`. Fallback automatico al file picker se `getUserMedia` non disponibile.
- **Risultati parziali in tempo reale**: durante la fase `elaborazione`, dopo ogni immagine OCR viene eseguito `parseReceiptText()` e la tabella si aggiorna dal vivo con gli articoli rilevati finora.
- **Barra progresso verso totale**: nella fase `risultati`, barra da 0% al 100% che diventa verde quando `somma ≈ totale`; badge "✅ Scontrino approvato!" al raggiungimento.
- **Aggiungi riga manuale**: pulsante tratteggiato sotto la tabella che aggiunge una riga vuota editabile (azione `AGGIUNGI_ARTICOLO_MANUALE`).
- **Due pulsanti camera/upload**: nella fase `input`, layout a griglia con pulsante fotocamera (accent) e pulsante carica file (secondary).
- 5 nuovi label i18n: `guidaAllineamento`, `chiudiCamera`, `aggiungiManuale`, `approvatoScontrino`, `parzialeMentre`
- **Build check:** ✅ Passato — **Deploy:** ✅ Pubblicato

### TASK-044: OCR Scanner Scontrini
**File creati:** `src/shared/receiptUtils.ts`, `src/components/ReceiptScanner.tsx`
**File modificati:** `src/shared/labels.ts`, `src/pages/Dashboard.tsx`

- Installato `tesseract.js` v7 per OCR lato client (nessuna API esterna)
- `receiptUtils.ts`: `processImage()` — pre-processing canvas (scala di grigi + contrasto ×1.6, resize max 2400px); `parseReceiptText()` — parsing regex scontrini italiani (prezzi con virgola, riga TOTALE, filtro righe irrilevanti)
- `ReceiptScanner.tsx`: modale completo con `useReducer`, supporto multi-foto con merge OCR, barra di progresso, tabella risultati editabile (modifica nome/prezzo, elimina righe), validazione somma vs totale, selettore categoria, due pulsanti: "Crea N transazioni" e "Importa come spesa unica"
- Accesso tramite pulsante "📷 Scontrino" nell'header della sezione Movimenti in Dashboard
- Sezione `ocr` aggiunta a `labels.ts` con 18 label (IT/EN/ES)
- **Build check:** ✅ Passato

### TASK-043b: Cascade edit/delete transazioni ricorrenti + fix input mesi
**File modificati:** `src/shared/types.ts`, `src/shared/storage.ts`, `src/shared/labels.ts`, `src/components/AddTransactionForm.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Movimenti.tsx`

- `types.ts`: aggiunto campo opzionale `recurringGroupId` a `Transaction`
- `storage.ts`: aggiunte `deleteTransactionsByGroupId()` e `updateTransactionsByGroupId()`
- Le nuove serie ricorrenti ricevono un `recurringGroupId` condiviso (stesso ID per tutte le copie)
- Elimina ricorrente: dialog "Solo questa / Tutte le collegate" in Dashboard e Movimenti
- Modifica ricorrente: dialog "No, solo questa / Sì, aggiorna tutte" in AddTransactionForm
- Fix leading-zero bug: campo "per quanti mesi" cambiato da `type="number"` a `type="text" inputMode="numeric"` con stato stringa
- **Build check:** ✅ Passato

---

## [24/04/2026] — Sessione 5

### TASK-040: Filtro date Dal/Al in Movimenti
**File modificati:** `src/shared/labels.ts`, `src/pages/Movimenti.tsx`

- Aggiunte label `dalLabel` / `alLabel` nella sezione `movimenti` di `labels.ts` (IT/EN/ES)
- Aggiunto blocco visuale Dal/Al con `input[type="date"]` sotto la search bar in `Movimenti.tsx`
- I campi si evidenziano con bordo `--accent` quando hanno un valore; pulsante ✕ inline per reset
- Il chip "📅 Periodo corrente" rimane come shortcut per compilare entrambi i campi in un tap
- Banner semplificato: appare solo per filtro categoria (navigazione da Dashboard), non per date
- **Build check:** ✅ Passato

---

### TASK-039: Header navigazione unificato
**File creati:** `src/components/ui/PageHeader.tsx`  
**File modificati:** `src/components/ui/index.ts`, `src/pages/Categories.tsx`, `src/pages/Movimenti.tsx`, `src/pages/SettingsPage.tsx`, `src/components/Settings.tsx`

- Creato `PageHeader` con tasto `‹ Indietro` (accent color), titolo centrato e slot destro opzionale
- Usa `navigate(-1)` con fallback su path configurabile (default `/`)
- `Categories.tsx`: rimosso `<Link to="/">` testuale, ora usa `<PageHeader>`
- `Movimenti.tsx`: rimosso blocco `<div>` + `<h1>` manuale, ora usa `<PageHeader>`
- `SettingsPage.tsx`: aggiunto `<PageHeader>`, rimosso `useNavigate` dal wrapper
- `Settings.tsx`: rimosso l'header interno con ✕ dalla modal mode (gestito da `PageHeader`)
- **Build check:** ✅ Passato

---

### TASK-038: Popup custom al posto dei dialog nativi
**File creati:** `src/shared/DialogContext.tsx`  
**File modificati:** `src/main.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Categories.tsx`, `src/components/Settings.tsx`

- Creato `DialogContext.tsx` con `DialogProvider` e hook `useDialog()` che espone `showConfirm`, `showPrompt`, `showInfo`
- I dialog sono Promise-based (drop-in per `confirm()`/`prompt()` async)
- UI: overlay blur + card con bordi arrotondati usando CSS variables del tema attivo
- Input password con `autoFocus` e support `Enter`/`Escape` keyboard
- Aggiunto `<DialogProvider>` nello stack provider in `main.tsx`
- Eliminati tutti i `window.confirm` / `window.prompt` nativi (6 occorrenze)
- **Build check:** ✅ Passato

---

### TASK-037: Rimozione notch e riallineamento dock
**File modificati:** `src/components/BottomNav.tsx`, `TASKS.md`, `CHANGELOG.md`

- Rimossa la notch sopra il tasto `+` su richiesta UX
- Ripristinato il `+` in posizione sospesa sopra la barra
- Spostate le icone della dock più in basso (`translate-y-1` + padding top barra) per ridurre lo spazio vuoto percepito
- Eseguiti build e deploy su GitHub Pages
- **Build check:** ✅ Passato

---

### TASK-036: Fix resa visiva dock
**File modificati:** `src/components/BottomNav.tsx`, `src/index.css`, `TASKS.md`, `CHANGELOG.md`

- Corretta la proporzione generale della dock: larghezza ridotta e layout più compatto
- Notch centrale ridimensionata per evitare effetto troppo "pesante" sul contenuto
- Migliorato l'allineamento delle voci nav con colonna centrale riservata al bottone `+`
- Rifinito il bottone `+`: dimensioni ridotte, glow e pulse più morbidi
- Eseguiti build e deploy su GitHub Pages
- **Build check:** ✅ Passato

---

### TASK-035: Rifiniture dock (pulse + notch + icone vector)
**File modificati:** `src/components/BottomNav.tsx`, `src/index.css`, `TASKS.md`, `CHANGELOG.md`

- Aggiunta animazione pulse del tasto `+` con ring esterno (piu elegante e leggibile)
- Notch centrale resa piu pronunciata con cutout dedicato sopra la barra
- Sostituite le emoji della navigazione con icone SVG outline coerenti con lo stile app
- Mantenuto il comportamento del `+` (apertura form aggiunta movimento)
- Eseguiti build e deploy su GitHub Pages
- **Build check:** ✅ Passato

---

### TASK-034: Bottom dock stile Satispay adattata Hermes
**File modificati:** `src/components/BottomNav.tsx`, `src/pages/Dashboard.tsx`, `src/shared/labels.ts`, `TASKS.md`, `CHANGELOG.md`

- Ridisegnata la barra bassa in stile dock floating (glassmorphism + glow in palette Hermes)
- Aggiunto tasto centrale `+` con look orbitale e feedback attivo
- Il click sul `+` apre il form movimento in Dashboard (anche se cliccato da altre pagine)
- Rimosso il vecchio FAB fisso dalla Dashboard per evitare doppio CTA
- Estese le label i18n sezione `layout` per le voci della bottom bar
- Eseguiti build e deploy su GitHub Pages
- **Build check:** ✅ Passato

---

## [23/04/2026] — Sessione 4

### TASK-033: Ripristino tasto + sopra barra bassa
**File modificati:** `src/pages/Dashboard.tsx`, `TASKS.md`, `CHANGELOG.md`

- Corretto il FAB `+` in Dashboard spostandolo sopra la bottom bar (`bottom-24`)
- Aumentato z-index del FAB a `z-50` per evitare che venga coperto dalla barra (`z-40`)
- Eseguiti build e deploy su GitHub Pages
- **Build check:** ✅ Passato

---

### TASK-032: Barra in basso visibile anche su desktop
**File modificati:** `src/components/BottomNav.tsx`, `src/components/Layout.tsx`, `TASKS.md`, `CHANGELOG.md`

- Rimossa la classe `md:hidden` da BottomNav per mostrare la barra anche su sito desktop
- Aggiunto `z-40` alla barra fissa per evitare layer nascosti
- Aggiornato il layout con `md:pb-24` per evitare sovrapposizione contenuti
- **Build check:** ✅ Passato

---

### TASK-031: Deploy su GitHub Pages
**File modificati:** `TASKS.md`, `CHANGELOG.md`

- Eseguito `npm run deploy` (build + publish con `gh-pages`)
- Build Vite completata senza errori
- Pubblicazione completata con output `Published`
- **Deploy check:** ✅ Passato

---

### TASK-030: Bottom Navigation (menu in basso)
**File creati:** `src/components/BottomNav.tsx`
**File modificati:** `src/components/Layout.tsx`, `src/components/Settings.tsx`, `src/shared/labels.ts`

- Creato componente **BottomNav** con tre voci: Home (🏠), Categorie (📁), Impostazioni (⚙️)
- Riposizionato menu in basso per mobile (`md:hidden`), stile bottom-bar moderno tipo Satispay
- Modificato Settings per supportare due modalità:
  - **Popover**: dall'header come prima (non visibile su mobile)
  - **Modal**: aperto dal BottomNav con overlay e bottone di chiusura
- Aggiunto `pb-24 md:pb-6` al main content di Layout per evitare sovrapposizioni
- Aggiunta label `impostazioni` al SETTINGS in `labels.ts`
- **Build check:** ✅ Passato

---

## [22/04/2026] — Sessione 3

### TASK-029: Modalita 100% manuale (Drive predisposto)
**File modificati:** `src/app/features.ts`, `TASKS.md`

- Per ora forzata UX manuale: disattivata la sezione Locale/Drive nei Settings (`codeTransfer: false`)
- Mantenuto tutto il codice Drive sync pronto per futura riattivazione senza refactor
- Flusso attivo corrente: export/import file cifrato con merge
- **Build check:** ✅ Passato

---

### TASK-028: Modalità Locale/Drive (sostituisce transfer code)
**File creati:** `src/shared/driveSync.ts`
**File modificati:** `src/components/Settings.tsx`, `src/shared/labels.ts`, `src/app/features.ts`, `src/App.tsx`, `src/vite-env.d.ts`, `TASKS.md`

- Sostituito il metodo vecchio (transfer code) con scelta esplicita della strategia dati
- Modalità `Solo locale` (default) per utenti che non vogliono cloud/database
- Modalità `Sync Drive` opzionale: connessione a Google Drive e sync del file cifrato (merge + upload)
- Nuove azioni in Settings: "Connetti Google Drive", "Sync ora", "Disconnetti Drive"
- Rimosso il flow di ingest QR da `App.tsx` per allineare il nuovo metodo
- Nessun DB richiesto: persistenza remota su file Drive in `appDataFolder`
- Richiesta configurazione `VITE_GOOGLE_CLIENT_ID` lato ambiente
- **Build check:** ✅ Passato

---

### TASK-027: Trasferimento con codice (Applica/Ricevi)
**File modificati:** `src/shared/storage.ts`, `src/components/Settings.tsx`, `src/shared/labels.ts`, `src/app/features.ts`, `package.json`, `TASKS.md`

- Aggiunto flusso alternativo al multi-QR: codice cifrato copia/incolla tra dispositivi
- Nuove API in storage: `buildTransferCode(password)` e `importTransferCode(code, password, { mode: 'merge' })`
- In Settings: sezione "Genera codice trasferimento", pulsante copia e pannello "Ricevi codice" con azione "Applica codice"
- `qrTransfer` disattivato di default e nuovo flag `codeTransfer` attivo
- Merge mantenuto in import, con richiesta password e gestione esiti (`ok`, `invalid`, `wrong-password`)
- Cleanup dipendenze: rimossi `qrcode` e `@types/qrcode` non più usati dalla UI
- **Build check:** ✅ Passato

---

### TASK-026: Fix QR scan 404 + parser URL robusto
**File modificati:** `src/shared/storage.ts`, `src/App.tsx`

- I link QR ora usano query string (`?xfer=...`) invece di hash per maggiore compatibilità con scanner mobili
- Parsing QR reso robusto: supporta token in hash, query e pathname (`/xfer/...`) 
- Mantiene retrocompatibilità con i QR della versione precedente
- Pulizia URL dopo ingest per evitare path non validi e ridurre il rischio di pagina 404

---

### TASK-025: Import PC -> telefono via QR con merge
**File modificati:** `src/shared/types.ts`, `src/shared/storage.ts`, `src/shared/labels.ts`, `src/components/Settings.tsx`, `src/App.tsx`, `src/app/features.ts`, `package.json`

- Aggiunti metadati di sync alle transazioni (`syncId`, `createdAt`, `updatedAt`) con normalizzazione automatica in storage
- `importAllData()` ora supporta modalità `merge`: unisce movimenti senza sostituire tutto, risolve conflitti su `updatedAt`
- Merge esteso a categorie custom e icone custom; impostazioni dispositivo restano locali in modalità merge
- Nuovo flusso QR PC -> telefono: payload cifrato AES-GCM spezzato in chunk multipli (`#xfer=...`) per evitare QR troppo grandi
- Nuova UI in Settings per generare QR chunked e navigarli (precedente/successivo)
- In `App.tsx` ingestione hash QR, ricostruzione payload, prompt password e import merge automatico
- Dipendenze aggiunte: `qrcode` + `@types/qrcode`
- **Build check:** ✅ Passato

---

### TASK-024: Cambio lingua nei Settings
**File modificati:** `src/shared/labels.ts`, `src/components/Settings.tsx`

- Aggiunta sezione "Lingua" nel pannello Settings con 3 bottoni: 🇮🇹 Italiano, 🇬🇧 English, 🇪🇸 Español
- Bottone lingua attiva evidenziato con `accent` + `ring-2`
- Al cambio lingua: `setLocale()` salva in localStorage e `window.location.reload()` ricarica l'app
- **Build check:** ✅ Passato

---
### TASK-023: Regola aggiornamento CHANGELOG
**File modificati:** `.github/copilot-instructions.md`, `CHANGELOG.md`

- Aggiunta sezione "Regole Obbligatorie a Fine Task" in `copilot-instructions.md` con obbligo esplicito di aggiornare `CHANGELOG.md` dopo ogni task

---

### TASK-022: Cifratura AES-GCM backup export/import
**File modificati:** `src/shared/storage.ts`, `src/shared/labels.ts`, `src/components/Settings.tsx`

- Export e import backup ora **cifrati con AES-256-GCM + PBKDF2** (100.000 iterazioni, SHA-256)
- `exportAllData(password)` diventa async: chiede password, cifra il JSON, scarica il file
- `importAllData(json, password?)` diventa async: rileva il formato (cifrato vs plain), decifra con la password fornita
- Nuovi status di import: `'wrong-password'` in aggiunta a `'ok'` e `'invalid'`
- Label aggiunte: `passwordEsporta`, `passwordImporta`, `passwordErrata` (IT/EN/ES)
- **Build check:** ✅ Passato

---

### TASK-021: Nuova icona app (moneta + orbita)
**File modificati:** `public/pwa-192x192.svg`, `public/pwa-512x512.svg`, `index.html`

- Ridisegnata l'icona PWA con moneta dorata (gradiente radiale 3D con highlight), orbita ellittica tratteggiata inclinata, due pianetini (blu + arancione) posizionati sull'orbita
- Sfondo spazio nero profondo con stelle sparse
- Favicon in `index.html` aggiornato a `pwa-192x192.svg`
- **Build check:** ✅ Passato

---

### TASK-020: Export/Import JSON + feature flags
**File creati:** `src/app/features.ts`
**File modificati:** `src/shared/storage.ts`, `src/shared/labels.ts`, `src/components/Settings.tsx`

- Creato `src/app/features.ts` con `FEATURES` object per abilitare/disabilitare sezioni senza toccare codice applicativo
- `exportAllData()` e `importAllData()` aggiunti a `storage.ts` con tipo `AppBackup` (version 1)
- Sezione "Sincronizzazione" nei Settings gated da `FEATURES.exportImportJson`
- Label `sincronizzazione`, `esportaDati`, `importaDati`, `importaConferma`, `importaOk`, `importaErrore` (IT/EN/ES)
- **Build check:** ✅ Passato

---



### TASK-004: Categorie custom + descrizione opzionale
**File creati:** `src/pages/Categories.tsx`
**File modificati:** `src/shared/storage.ts`, `src/shared/labels.ts`, `src/components/AddTransactionForm.tsx`, `src/components/Layout.tsx`, `src/App.tsx`

- **Descrizione opzionale**: il campo "Per cosa?" non è più obbligatorio. Se vuoto, la transazione usa il nome della categoria come descrizione
- **Rimosso auto-fill**: la descrizione non si compila più automaticamente alla selezione della categoria
- **Categoria custom**: bottone "+ Nuova categoria" nel form con input di testo
- **Salva per il futuro**: checkbox per salvare la categoria custom in localStorage per riutilizzarla
- **Storage**: `loadCustomCategories()`, `addCustomCategory()`, `deleteCustomCategory()` in `storage.ts`
- **Pagina gestione categorie** (`/categories`): visualizza categorie predefinite e custom, permette di eliminare quelle custom
- **Navigazione**: link "🏷️ Gestione Categorie" nell'header, route `/categories` in `App.tsx`
- **Labels**: 12 nuove stringhe per form e pagina categorie (IT/EN/ES)
- **Build + Test:** ✅ 28/28 passati

---

## [19/04/2026] — Sessione 1

### TASK-001: Refactor form transazione e UX categoria
**File modificati:** `src/components/AddTransactionForm.tsx`

- Spostato il selettore **Categoria** sopra il campo **"Per cosa?"** nel form
- Aggiunto **auto-fill descrizione**: quando si seleziona una categoria e il campo descrizione è vuoto, viene popolato automaticamente col nome della categoria
- La descrizione resta **liberamente editabile** dall'utente
- **Build check:** ✅ Passato

---

### TASK-002: Setup unit test e test base
**File creati:** `vitest.config.ts`, `src/__tests__/setup.ts`, `src/__tests__/storage.test.ts`, `src/__tests__/labels.test.ts`, `src/__tests__/theme.test.ts`
**File modificati:** `package.json`

- Installati: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- Creato `vitest.config.ts` con environment `jsdom`
- **28 test** in 3 file:
  - `storage.test.ts` (11 test) — generateId, CRUD transazioni, filtro per periodo, gestione dati corrotti
  - `labels.test.ts` (14 test) — cambio lingua, label per sezione (LAYOUT, DASHBOARD, MASCOTTE, FORM, CATEGORIE, NOT_FOUND)
  - `theme.test.ts` (3 test) — localStorage tema, attributo data-theme
- Aggiunti script `"test"` e `"test:watch"` in package.json
- **Build + Test:** ✅ 28/28 passati

---

### TASK-003: Icone emoji per categorie transazioni
**File creati:** `src/shared/categoryIcons.ts`
**File modificati:** `src/shared/labels.ts`, `src/components/AddTransactionForm.tsx`, `src/pages/Dashboard.tsx`

- **14 categorie uscita** rinnovate: Cibo 🍕, Quotidiano 🛒, Trasporti 🚀, Sociale 🪐, Residenza 🏠, Regalo 🎁, Comunicazioni 📡, Abbigliamento 👕, Svago 🎮, Bellezza ✨, Medico 🩺, Hobby 🎨, Bollette ⚡, Altro 🌌
- **5 categorie entrata**: Stipendio 💰, Freelance 💻, Regalo 🎁, Rimborso 🔄, Altro 🌌
- Tutte tradotte in IT/EN/ES in `labels.ts`
- Creato `categoryIcons.ts` con funzione `getCategoryIcon(category)` per tutte le lingue
- Icone visibili nel **selettore categoria** del form
- Icone visibili nella **lista movimenti** in Dashboard
- **Build + Test:** ✅ 28/28 passati

---

### Documenti aggiornati
- `TASKS.md` — Task spostati in "Completati"
- `STRUCTURE.md` — Aggiunto `categoryIcons.ts` e cartella `__tests__/`
- `RULES.md` — Già aggiornato in sessione precedente
