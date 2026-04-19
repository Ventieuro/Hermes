# 🚀 AstroCoin

App personale per la gestione delle finanze a tema spaziale, costruita con React e pensata per il mobile.

## Funzionalità

- **Dashboard** con saldo, entrate e uscite del periodo
- **Grafico a torta** per la distribuzione delle spese per categoria
- **Transazioni ricorrenti** con gestione automatica
- **Mascotte astronauta** 🧑‍🚀 che commenta il tuo stato finanziario con metafore spaziali
- **Tema spaziale** con pianeti, stelle e emoji a tema
- **Multilingua** — Italiano, English, Español
- **Blocco PIN** per proteggere l'accesso
- **Offline-first** — tutti i dati in localStorage, nessun backend

## Tech Stack

| | Tecnologia |
|---|---|
| ⚛️ | React 19 + TypeScript 5.7 |
| ⚡ | Vite 6 |
| 🎨 | Tailwind CSS 4 |
| 🧭 | React Router DOM 7 |
| 💾 | localStorage |

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
├── components/     → Componenti riusabili (Layout, Mascot, Form, Chart...)
├── pages/          → Pagine (Dashboard, Home, NotFound)
└── shared/         → Logica condivisa (labels, storage, types, theme)
```

Vedi [STRUCTURE.md](STRUCTURE.md) per la struttura completa.

## Licenza

Progetto personale — uso privato.
