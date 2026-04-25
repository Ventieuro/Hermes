# AstroCoin — Struttura del Progetto

> Ultimo aggiornamento: 25 Aprile 2026

```
AstroCoin/
├── .github/
│   └── copilot-instructions.md        → Linee guida Copilot
├── public/
│   ├── 404.html                       → Fallback GitHub Pages SPA
│   ├── mascot.svg                     → Icona mascotte
│   ├── pwa-192x192.svg                → Icona PWA 192px
│   ├── pwa-512x512.svg                → Icona PWA 512px
│   └── vite.svg                       → Icona Vite
├── src/
│   ├── App.tsx                        → Definizione route
│   ├── index.css                      → Variabili CSS temi + import Tailwind
│   ├── main.tsx                       → Entry point, stack Provider
│   ├── vite-env.d.ts                  → Tipi ambiente Vite
│   ├── app/
│   │   └── features.ts                → Feature flags globali
│   ├── components/
│   │   ├── AddTransactionForm.tsx     → Form aggiunta/modifica transazione
│   │   ├── BottomNav.tsx              → Barra di navigazione inferiore
│   │   ├── CometChart.tsx             → Grafico andamento annuale (cometa)
│   │   ├── ExpensePieChart.tsx        → Tab grafico: torta / solare / cometa
│   │   ├── InstallPrompt.tsx          → Banner installazione PWA
│   │   ├── Layout.tsx                 → Layout con header/navbar
│   │   ├── Mascot.tsx                 → Componente mascotte interattiva
│   │   ├── MiniPlanet.tsx             → Pianeta decorativo animato
│   │   ├── PinLock.tsx                → Schermata blocco PIN
│   │   ├── ReceiptScanner.tsx         → Scanner scontrino con OCR (Tesseract.js)
│   │   ├── Settings.tsx               → Pannello impostazioni (modale/pagina)
│   │   ├── SolarSystemChart.tsx       → Grafico sistema solare per categorie
│   │   ├── SpaceDonutChart.tsx        → Grafico donut spaziale
│   │   ├── ThemeSwitcher.tsx          → Selettore tema
│   │   ├── WhatsNew.tsx               → Modale "Novità" al primo avvio versione
│   │   └── ui/                        → Componenti UI primitivi
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── FAB.tsx
│   │       ├── IconButton.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── PageHeader.tsx
│   │       ├── Popup.tsx
│   │       ├── SectionHeader.tsx
│   │       └── index.ts               → Barrel export
│   ├── features/                      → (riservata per feature modules futuri)
│   ├── pages/
│   │   ├── Categories.tsx             → Gestione categorie custom
│   │   ├── Dashboard.tsx              → Pagina principale con saldo e movimenti
│   │   ├── Home.tsx                   → Pagina home/benvenuto
│   │   ├── Movimenti.tsx              → Lista movimenti con filtri e ricerca
│   │   ├── NotFound.tsx               → Pagina 404
│   │   └── SettingsPage.tsx           → Pagina impostazioni (route /impostazioni)
│   └── shared/
│       ├── autoBackup.ts              → Backup automatico su file/cartella locale
│       ├── categoryIcons.ts           → Mappa categoria → emoji
│       ├── changelog.ts               → Dati changelog per WhatsNew
│       ├── DialogContext.tsx          → Context + hook per dialog/confirm/prompt
│       ├── labels.ts                  → Tutte le stringhe UI (IT/EN/ES)
│       ├── receiptUtils.ts            → Parsing testo OCR scontrino
│       ├── storage.ts                 → CRUD IndexedDB (+ fallback localStorage)
│       ├── ThemeContext.tsx           → Context + hook per tema
│       ├── types.ts                   → Tipi e interfacce TypeScript
│       └── useNotifications.ts        → Hook scheduler notifiche push
├── CHANGELOG.md                       → Storico modifiche per sessione
├── GRAPHICS.md                        → Note grafici e visualizzazioni
├── README.md                          → Documentazione progetto
├── RULES.md                           → Regole e convenzioni progetto
├── STRUCTURE.md                       → Questo file
├── TASKS.md                           → Lista task per Copilot
├── eslint.config.js                   → Configurazione ESLint
├── index.html                         → HTML entry point
├── package.json                       → Dipendenze e script
├── tsconfig.json                      → Config TypeScript base
├── tsconfig.app.json                  → Config TS per app
├── tsconfig.node.json                 → Config TS per Node
├── vite.config.ts                     → Configurazione Vite
└── vitest.config.ts                   → Configurazione Vitest
```

## Mappa Route

| Path | Pagina | Descrizione |
|------|--------|-------------|
| `/` | Dashboard | Saldo, movimenti, grafico |
| `/movimenti` | Movimenti | Lista movimenti con filtri |
| `/categories` | Categories | Gestione categorie custom |
| `/impostazioni` | SettingsPage | Impostazioni app |
| `*` | NotFound | Pagina 404 |

## Componenti Principali

| Componente | Posizione | Ruolo |
|------------|-----------|-------|
| Dashboard | `pages/Dashboard.tsx` | Saldo, movimenti, grafici |
| Movimenti | `pages/Movimenti.tsx` | Lista movimenti filtrata |
| Categories | `pages/Categories.tsx` | Gestione categorie personalizzate |
| SettingsPage | `pages/SettingsPage.tsx` | Pagina impostazioni |
| Layout | `components/Layout.tsx` | Wrapper con header e navbar |
| AddTransactionForm | `components/AddTransactionForm.tsx` | Form per nuove/modifica transazioni |
| ExpensePieChart | `components/ExpensePieChart.tsx` | Tab grafici (torta/solare/cometa) |
| ReceiptScanner | `components/ReceiptScanner.tsx` | Scanner OCR scontrino |
| Settings | `components/Settings.tsx` | Pannello impostazioni riusabile |
| Mascot | `components/Mascot.tsx` | Mascotte animata con messaggi |
| PinLock | `components/PinLock.tsx` | Blocco accesso con PIN |
| WhatsNew | `components/WhatsNew.tsx` | Modale novità versione |
| InstallPrompt | `components/InstallPrompt.tsx` | Banner installazione PWA |

## Componenti UI Primitivi (`components/ui/`)

| Componente | Ruolo |
|------------|-------|
| `Button` | Bottone con varianti (primary/secondary/danger/ghost) |
| `Card` | Contenitore con bordo e sfondo tema |
| `FAB` | Floating Action Button |
| `IconButton` | Bottone icona piccolo |
| `Input` | Campo input con stile tema |
| `Modal` | Overlay modale (center/bottom) |
| `PageHeader` | Intestazione pagina con titolo |
| `Popup` | Popup/tooltip leggero |
| `SectionHeader` | Titolo sezione uppercase |

## Moduli Shared

| File | Ruolo |
|------|-------|
| `autoBackup.ts` | Backup automatico su file o cartella locale |
| `categoryIcons.ts` | Mappa categoria → emoji |
| `changelog.ts` | Dati per la modale "Novità" |
| `DialogContext.tsx` | Context + hook `useDialog()` per confirm/prompt |
| `labels.ts` | Stringhe localizzate (IT/EN/ES) |
| `receiptUtils.ts` | Parsing testo OCR da Tesseract.js |
| `storage.ts` | Persistenza IndexedDB con fallback localStorage |
| `ThemeContext.tsx` | Context + hook `useTheme()` |
| `types.ts` | Tipi TypeScript condivisi (`Transaction`, `AppSettings`) |
| `useNotifications.ts` | Scheduler notifiche push giornaliere |
