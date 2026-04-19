# AstroCoin — Struttura del Progetto

> Ultimo aggiornamento: 19 Aprile 2026

```
AstroCoin/
├── .github/
│   └── copilot-instructions.md    → Linee guida Copilot
├── public/
│   ├── 404.html                   → Fallback GitHub Pages SPA
│   ├── mascot.svg                 → Icona mascotte
│   └── vite.svg                   → Icona Vite
├── src/
│   ├── App.tsx                    → Definizione route
│   ├── index.css                  → Variabili CSS temi + import Tailwind
│   ├── main.tsx                   → Entry point, stack Provider
│   ├── vite-env.d.ts              → Tipi ambiente Vite
│   ├── app/                       → (vuota — riservata per logica app)
│   ├── components/
│   │   ├── AddTransactionForm.tsx → Form aggiunta transazione
│   │   ├── ExpensePieChart.tsx    → Grafico a torta spese
│   │   ├── Layout.tsx             → Layout con header/navbar
│   │   ├── Mascot.tsx             → Componente mascotte interattiva
│   │   ├── PinLock.tsx            → Schermata blocco PIN
│   │   └── ThemeSwitcher.tsx      → Selettore tema
│   ├── features/                  → (vuota — riservata per feature modules)
│   ├── pages/
│   │   ├── Categories.tsx         → Gestione categorie custom
│   │   ├── Dashboard.tsx          → Pagina principale con saldo e movimenti
│   │   ├── Home.tsx               → Pagina home/benvenuto
│   │   └── NotFound.tsx           → Pagina 404
│   └── shared/
│       ├── categoryIcons.ts       → Mappa categoria → emoji
│       ├── labels.ts              → Tutte le stringhe UI (IT/EN/ES)
│       ├── storage.ts             → CRUD localStorage
│       ├── ThemeContext.tsx        → Provider e hook tema
│       └── types.ts               → Tipi e interfacce TypeScript
├── README.md                      → Documentazione progetto
├── TASKS.md                       → Lista task per Copilot
├── RULES.md                       → Regole e convenzioni progetto
├── STRUCTURE.md                   → Questo file
├── eslint.config.js               → Configurazione ESLint
├── index.html                     → HTML entry point
├── package.json                   → Dipendenze e script
├── tsconfig.json                  → Config TypeScript base
├── tsconfig.app.json              → Config TS per app
├── tsconfig.node.json             → Config TS per Node
└── vite.config.ts                 → Configurazione Vite
```

## Mappa Route

| Path | Pagina | Descrizione |
|------|--------|-------------|
| `/` | Dashboard | Saldo, movimenti, grafico |
| `/categories` | Categories | Gestione categorie custom |
| `*` | NotFound | Pagina 404 |

## Componenti Principali

| Componente | Posizione | Ruolo |
|------------|-----------|-------|
| Categories | `pages/Categories.tsx` | Gestione categorie personalizzate |
| Layout | `components/Layout.tsx` | Wrapper con header e navbar |
| AddTransactionForm | `components/AddTransactionForm.tsx` | Form per nuove transazioni |
| ExpensePieChart | `components/ExpensePieChart.tsx` | Grafico distribuzione spese |
| Mascot | `components/Mascot.tsx` | Mascotte animata con messaggi |
| PinLock | `components/PinLock.tsx` | Blocco accesso con PIN |
| ThemeSwitcher | `components/ThemeSwitcher.tsx` | Cambio tema |

## Moduli Shared

| File | Ruolo |
|------|-------|
| `categoryIcons.ts` | Mappa categoria → emoji |
| `labels.ts` | Stringhe localizzate (IT/EN/ES) |
| `storage.ts` | Persistenza localStorage |
| `ThemeContext.tsx` | Context + hook per tema |
| `types.ts` | Tipi TypeScript condivisi |
