# AstroCoin — Regole del Progetto

> Questo file viene aggiornato ad ogni cambio di regole o convenzioni.

---

## Identità Visiva

- **Tema**: Spaziale (pianeti, stelle, orbite, astronauti)
- **Mascotte**: Astronauta 🧑‍🚀 (emoji mood: 🧑‍🚀 happy, 😵‍💫 sad, 🛸 neutral, 🚀 excited)
- **Emoji consentite**: solo a tema spaziale (🚀 🪐 🌍 🛰️ 🛸 ⭐ 🌟 🌀 🌌 🧑‍🚀 🆘)
- **Tono messaggi mascotte**: metafore spaziali (missioni, orbite, atterraggi d'emergenza)

---

## Stack Tecnologico

| Tecnologia | Versione |
|------------|----------|
| React | 19 |
| TypeScript | ~5.7 (strict mode) |
| Vite | 6 |
| Tailwind CSS | 4 |
| React Router DOM | 7 |
| Persistenza | localStorage (niente backend) |

---

## Convenzioni Codice

### Componenti
- **Function component** con `export default`
- **Props** definite con `interface` nello stesso file
- **Mai stringhe hardcoded** — usare sempre `labels.ts`

### Stile
- **Tailwind** per layout, spaziatura, responsive (`sm:`, `md:`), animazioni
- **Inline `style`** per colori del tema via `var(--nome-variabile)`
- **Mobile-first**, breakpoint `sm:` e `md:`
- **Transizioni**: `transition-colors duration-300` su elementi che cambiano colore col tema
- **Commenti sezione**: `// ─── Nome Sezione ───`

### Temi (CSS Variables)
- Definiti in `src/index.css` con selettore `[data-theme="nome"]`
- Gestiti tramite `ThemeContext.tsx` e hook `useTheme()`
- Variabili: `--bg-primary`, `--bg-secondary`, `--bg-card`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border`, `--accent`, `--accent-hover`, `--accent-light`, `--nav-bg`, `--nav-text`, `--input-bg`, `--input-border`, `--fab-bg`, `--fab-text`, `--gold`, `--water`, `--tropical`, `--highlight`

### i18n (labels.ts)
- Tutte le stringhe UI in `src/shared/labels.ts`
- Lingue supportate: IT (default), EN, ES
- Helper: `t()` per testo semplice, `tf()` per funzioni parametriche, `ta()` per array
- Sezioni: `LAYOUT`, `TEMI`, `DASHBOARD`, `MASCOTTE`, `FORM`, `CATEGORIE`, `NOT_FOUND`, `HOME`

### Modello Dati
- `Transaction`: id, type (`entrata`|`uscita`), description, amount (EUR), date (ISO), recurring, recurringMonths, category
- `AppSettings`: payDay (1-28), userName

### localStorage
| Chiave | Contenuto |
|--------|-----------|
| `astrocoin-transactions` | `Transaction[]` |
| `astrocoin-settings` | `AppSettings` |
| `astrocoin-theme` | `'spazio'` |
| `astrocoin-lang` | `'it' \| 'en' \| 'es'` |

### Routing
- Layout wrapper con `<Outlet />`
- `/` → Dashboard
- `*` → NotFound

### Provider Stack (main.tsx)
```
StrictMode → BrowserRouter → ThemeProvider → App
```

---

## Comandi

```bash
npm run dev -- --host   # Dev server (SEMPRE con --host)
npm run build           # Type-check + build produzione
npm run lint            # ESLint
npm run preview         # Preview build
npm run deploy          # Build + deploy GitHub Pages
```

---

## Regole Operative per Copilot

1. **Leggere TASKS.md** prima di iniziare qualsiasi lavoro
2. **Aggiornare STRUCTURE.md** dopo ogni modifica alla struttura del progetto
3. **Aggiornare RULES.md** se cambiano convenzioni o stack
4. **Segnare i task completati** in TASKS.md spostandoli nella sezione "Completati"
5. **Non aggiungere feature non richieste** — seguire solo i task
6. **Rispettare le convenzioni** di questo file per ogni modifica al codice
