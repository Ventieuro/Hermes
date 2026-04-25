# AstroCoin — Regole del Progetto

> Questo file viene aggiornato ad ogni cambio di regole o convenzioni.
> Ultimo aggiornamento: 25 Aprile 2026

---

## Identità Visiva

- **Nome app**: Hermes
- **Tema**: Spaziale (pianeti, stelle, orbite, astronauti)
- **Mascotte**: Astronauta 🧑‍🚀 (emoji mood: 🧑‍🚀 happy, 😵‍💫 sad, 🛸 neutral, 🚀 excited)
- **Emoji consentite**: solo a tema spaziale (🚀 🪐 🌍 🛰️ 🛸 ⭐ 🌟 🌀 🌌 🧑‍🚀 🆘 ☄️ 🔭)
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
| Persistenza | IndexedDB (+ fallback localStorage, niente backend) |
| OCR | Tesseract.js v7 |
| PWA | Workbox (vite-plugin-pwa) |

---

## Convenzioni Codice

### Componenti
- **Function component** con `export default`
- **Props** definite con `interface` nello stesso file
- **Mai stringhe hardcoded** — usare sempre `labels.ts`
- **Context + hook nello stesso file** è consentito (pattern React standard)

### Stile
- **Tailwind** per layout, spaziatura, responsive (`sm:`, `md:`), animazioni
- **Inline `style`** per colori del tema via `var(--nome-variabile)`
- **Mobile-first**, breakpoint `sm:` e `md:`
- **Transizioni**: `transition-colors duration-300` su elementi che cambiano colore col tema
- **Commenti sezione**: `// ─── Nome Sezione ───`

### Componenti UI Primitivi
Prima di creare un elemento UI, verificare in `src/components/ui/`:
`Button`, `Card`, `FAB`, `IconButton`, `Input`, `Modal`, `PageHeader`, `Popup`, `SectionHeader`

Import da barrel: `import { Card, Button } from '../components/ui'`

### Temi (CSS Variables)
- Definiti in `src/index.css` con selettore `[data-theme="nome"]`
- Gestiti tramite `ThemeContext.tsx` e hook `useTheme()`
- Temi disponibili: `spazio` (dark), `nasa` (light), `mission`
- Variabili: `--bg-primary`, `--bg-secondary`, `--bg-card`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border`, `--accent`, `--accent-hover`, `--accent-light`, `--nav-bg`, `--nav-text`, `--input-bg`, `--input-border`, `--fab-bg`, `--fab-text`, `--gold`, `--water`, `--tropical`, `--highlight`

### i18n (labels.ts)
- Tutte le stringhe UI in `src/shared/labels.ts`
- Lingue supportate: IT (default), EN, ES
- Helper: `t()` per testo semplice, `tf()` per funzioni parametriche, `ta()` per array
- Sezioni export: `LAYOUT`, `TEMI`, `DASHBOARD`, `MASCOTTE`, `FORM`, `CATEGORIE`, `NOT_FOUND`, `HOME`, `PIN`, `GESTIONE_CATEGORIE`, `MOVIMENTI`, `SETTINGS`, `NOTIFICHE`, `PWA`, `AUTO_BACKUP`, `OCR`

### Modello Dati
- `Transaction`: id, syncId?, createdAt?, updatedAt?, type (`entrata`|`uscita`), description, amount (EUR), date (ISO yyyy-mm-dd), recurring, recurringMonths, recurringGroupId?, category
- `AppSettings`: payDay (1-28), userName

### Storage Keys (IndexedDB / localStorage)
| Chiave | Contenuto |
|--------|-----------|
| `hermes-transactions` | `Transaction[]` |
| `hermes-settings` | `AppSettings` |
| `hermes-custom-categories` | `CustomCategories` |
| `hermes-custom-icons` | `Record<string, string>` |
| `hermes-notifications` | `NotificationSettings` |
| `hermes-theme` | `'spazio' \| 'nasa' \| 'mission'` |
| `hermes-lang` | `'it' \| 'en' \| 'es'` |
| `hermes-pin` | SHA-256 hash del PIN |

### Routing
| Path | Pagina |
|------|--------|
| `/` | Dashboard |
| `/movimenti` | Movimenti |
| `/categories` | Categories |
| `/impostazioni` | SettingsPage |
| `*` | NotFound |

### Provider Stack (main.tsx)
```
StrictMode → BrowserRouter → ThemeProvider → DialogProvider → App
```

---

## Comandi

```bash
npm run dev -- --host   # Dev server (SEMPRE con --host per accesso da telefono)
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
7. **Aggiornare CHANGELOG.md** dopo ogni task completato
8. **Eseguire `npm run build`** a fine task per verificare assenza errori
