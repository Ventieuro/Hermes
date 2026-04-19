# AstroCoin — Changelog

> Report delle modifiche al progetto, aggiornato automaticamente.

---

## [19/04/2026] — Sessione 2

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
