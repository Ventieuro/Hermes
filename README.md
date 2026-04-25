# 🚀 Hermes

App personale per la gestione delle finanze a tema spaziale, costruita con React e pensata per il mobile.

## Funzionalità

- **Dashboard** con saldo, entrate e uscite del periodo
- **Grafici** — torta categorie, sistema solare, andamento annuale
- **Transazioni ricorrenti** con gestione automatica per serie
- **Mascotte astronauta** 🧑‍🚀 con messaggi a metafore spaziali
- **Scanner scontrino** 📷 con OCR (Tesseract.js) per importare spese da foto
- **Gestione categorie** personalizzate con icone
- **Backup/Restore** — export/import JSON cifrato AES-256
- **Trasferimento QR** — da PC a telefono senza cloud
- **Blocco PIN** con hashing SHA-256
- **Multilingua** — Italiano, English, Español
- **PWA offline-first** — tutti i dati in IndexedDB, nessun backend
- **Temi** — Spazio (dark), NASA (light), Mission

## Tech Stack

| | Tecnologia |
|---|---|
| ⚛️ | React 19 + TypeScript 5.7 (strict) |
| ⚡ | Vite 6 |
| 🎨 | Tailwind CSS 4 |
| 🧭 | React Router DOM 7 |
| 💾 | IndexedDB (+ fallback localStorage) |
| 🔍 | Tesseract.js v7 (OCR) |
| 📦 | Workbox PWA |

## Quick Start

```bash
# Installazione dipendenze
npm install

# Dev server (accessibile in rete locale)
npm run dev -- --host

# Build di produzione
npm run build

# Deploy su GitHub Pages
npm run deploy
```

## Struttura Progetto

```
src/
├── app/            → Feature flags
├── components/     → Componenti riusabili
│   └── ui/         → Componenti UI primitivi (Button, Card, Modal…)
├── pages/          → Pagine (Dashboard, Movimenti, Categories, Settings…)
└── shared/         → Logica condivisa (labels, storage, types, theme…)
```

Vedi [STRUCTURE.md](STRUCTURE.md) per la struttura completa.

## Licenza

Progetto personale — uso privato.
