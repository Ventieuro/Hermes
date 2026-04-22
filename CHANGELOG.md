# AstroCoin — Changelog

> Report delle modifiche al progetto, aggiornato automaticamente.

---

## [22/04/2026] — Sessione 3

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
