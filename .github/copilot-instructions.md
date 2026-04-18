# Gestione Soldi — Linee Guida Progetto

## Stack Tecnologico

- **React 19** + **TypeScript 5.7** (strict mode)
- **Vite 6** con plugin: `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-plugin-qrcode`
- **Tailwind CSS 4** per classi utility
- **React Router DOM 7** per routing client-side
- **localStorage** per persistenza dati (niente backend)

## Struttura Cartelle

```
src/
├── components/       → Componenti riusabili (Layout, Mascot, ThemeSwitcher, AddTransactionForm)
├── pages/            → Pagine collegate alle route (Dashboard, Home, NotFound)
├── shared/           → Logica condivisa
│   ├── labels.ts     → TUTTE le stringhe dell'app (i18n)
│   ├── types.ts      → Tipi e interfacce TypeScript
│   ├── storage.ts    → CRUD localStorage
│   └── ThemeContext.tsx → Provider e hook per il tema
├── index.css         → Variabili CSS dei temi + import Tailwind
├── main.tsx          → Entry point, stack dei Provider
└── App.tsx           → Definizione route
```

## Come Scrivere un Componente

1. **Function component** con `export default`:
   ```tsx
   function NomeComponente() { ... }
   export default NomeComponente
   ```
2. **Props** con `interface` nello stesso file:
   ```tsx
   interface NomeProps {
     titolo: string
     onAction: () => void
   }
   ```
3. **Mai stringhe hardcoded** — importare da `labels.ts`:
   ```tsx
   import { DASHBOARD } from '../shared/labels'
   // poi usare: {DASHBOARD.entrate}
   ```

## Sistema di Temi (CSS Variables)

I temi sono definiti in `src/index.css` con selettore `[data-theme="nome"]`.
Il tema attivo si gestisce con `ThemeContext.tsx` (`useTheme()` hook).

**Come applicare i colori nei componenti:**
```tsx
// Tailwind per layout + inline style per colori del tema
<div
  className="rounded-xl p-4 transition-colors duration-300"
  style={{
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  }}
>
```

**Variabili disponibili:**
| Variabile | Uso |
|-----------|-----|
| `--bg-primary`, `--bg-secondary`, `--bg-card` | Sfondi |
| `--text-primary`, `--text-secondary`, `--text-muted` | Testi |
| `--border` | Bordi |
| `--accent`, `--accent-hover`, `--accent-light` | Elementi interattivi |
| `--nav-bg`, `--nav-text` | Header/navbar |
| `--input-bg`, `--input-border` | Campi form |
| `--fab-bg`, `--fab-text` | Bottone floating (FAB) |
| `--gold`, `--water`, `--tropical`, `--highlight` | Accenti semantici |

**Per aggiungere un nuovo tema:**
1. Aggiungere blocco `[data-theme="nome"]` in `index.css` con tutte le variabili
2. Aggiungere il valore al tipo `Theme` in `ThemeContext.tsx`
3. Aggiungere bottone in `ThemeSwitcher.tsx`
4. Aggiungere label in `labels.ts` sezione `temi`

## Sistema i18n (labels.ts)

Tutte le stringhe visibili all'utente stanno in `src/shared/labels.ts`.
Le lingue supportate sono IT (default) e EN.

**Per aggiungere una nuova label:**
```ts
// Testo semplice → una riga
nomeLabel: t('Testo italiano', 'English text'),

// Funzione con parametri
saluto: tf(
  (nome: string) => `Ciao ${nome}!`,
  (nome: string) => `Hello ${nome}!`,
),

// Array di stringhe
opzioni: ta(['Uno', 'Due'], ['One', 'Two']),
```

**Come usare le label nei componenti:**
```tsx
import { DASHBOARD, FORM, MASCOTTE } from '../shared/labels'

// Stringhe semplici
<h2>{DASHBOARD.movimenti}</h2>

// Funzioni parametriche
<p>{MASCOTTE.messaggi.bene(formatEuro(saldo))}</p>

// Array
{CATEGORIE.entrata.map((cat) => <span>{cat}</span>)}
```

**Le sezioni disponibili sono:**
`LAYOUT`, `TEMI`, `DASHBOARD`, `MASCOTTE`, `FORM`, `CATEGORIE`, `NOT_FOUND`, `HOME`

**Per aggiungere una nuova sezione:**
1. Aggiungere l'oggetto dentro `STRINGS` in `labels.ts`
2. Aggiungere l'export proxy in fondo al file: `export const NUOVA = localize(STRINGS.nuova)`

## Modello Dati

```ts
interface Transaction {
  id: string              // generateId() da storage.ts
  type: 'entrata' | 'uscita'
  description: string
  amount: number          // in EUR
  date: string            // formato ISO yyyy-mm-dd
  recurring: boolean
  recurringMonths: number // 0 = non ricorrente
  category: string        // valore da CATEGORIE
}

interface AppSettings {
  payDay: number          // giorno del mese (1-28)
  userName: string
}
```

## localStorage

Tutte le funzioni sono in `src/shared/storage.ts`.

| Chiave | Contenuto |
|--------|-----------|
| `gestione-soldi-transactions` | `Transaction[]` |
| `gestione-soldi-settings` | `AppSettings` |
| `gestione-soldi-theme` | `'giungla' \| 'spazio'` |
| `gestione-soldi-lang` | `'it' \| 'en'` |

API: `loadTransactions()`, `addTransaction()`, `deleteTransaction()`, `getTransactionsInPeriod()`, `loadSettings()`, `saveSettings()`, `generateId()`

## Routing

```tsx
<Routes>
  <Route element={<Layout />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

Per aggiungere una pagina: creare file in `pages/`, aggiungere `<Route>` in `App.tsx`.

## Stack Provider (main.tsx)

```
StrictMode → BrowserRouter → ThemeProvider → App
```

## Stile e Convenzioni

- **Tailwind** per layout, spaziatura, responsive (`md:`, `sm:`), animazioni (`transition`, `active:scale-95`)
- **Inline `style`** per colori del tema via `var(--nome)`
- **Responsive**: mobile-first, breakpoint `sm:` e `md:`
- **Transizioni**: `transition-colors duration-300` su elementi che cambiano colore col tema
- **Commenti**: sezioni con `// ─── Nome Sezione ───`

## Comandi

```bash
npm run dev       # Server di sviluppo (porta 5173+, accessibile in rete)
npm run build     # Type-check + build produzione
npm run lint      # ESLint
npm run preview   # Preview build produzione
```
