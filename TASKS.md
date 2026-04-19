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

### 🔴 TASK-010 — Trasformare AstroCoin in PWA con notifiche push

**Obiettivo:** Convertire l'app in Progressive Web App per:
- Installabile su telefono (icona nella home screen)
- Funziona offline (cache delle risorse)
- Notifiche push reali anche con app/browser chiusi (promemoria spese)

**Sotto-task:**

- [ ] **1. Configurare vite-plugin-pwa** — Installare `vite-plugin-pwa` e configurare il manifest (nome, icone, colori, display standalone)
- [ ] **2. Creare icone PWA** — Generare icone 192x192 e 512x512 con tema spaziale per il manifest
- [ ] **3. Service Worker** — Configurare Workbox per cache delle risorse (precache + runtime cache)
- [ ] **4. Notifiche push con Service Worker** — Schedulare il promemoria giornaliero dal SW, così funziona anche con browser chiuso
- [ ] **5. Prompt installazione** — Mostrare un banner/pulsante "Installa AstroCoin" quando disponibile
- [ ] **6. Build check** — `npm run build` + `npm test` + test installazione su telefono

## In Corso

<!-- Nessun task in corso -->


## Completati

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

