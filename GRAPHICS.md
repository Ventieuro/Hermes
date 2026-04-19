# Hermes — Linee Guida Grafiche

Questo documento definisce le convenzioni visive dell'app per mantenere coerenza tra tutti i componenti animati.

---

## Palette Colori

### Canvas / Sfondo Spaziale
| Colore | Hex | Uso |
|--------|-----|-----|
| Buio cosmico | `#080b18` | Sfondo canvas |
| Stelle | `rgba(255,255,255, 0.3–0.8)` | Stelle scintillanti |

### Pianeti (ciclica, 8 colori)
| # | Colore | Hex |
|---|--------|-----|
| 1 | Amber | `#f59e0b` |
| 2 | Blue | `#3b82f6` |
| 3 | Violet | `#8b5cf6` |
| 4 | Cyan | `#06b6d4` |
| 5 | Pink | `#ec4899` |
| 6 | Green | `#22c55e` |
| 7 | Red | `#ef4444` |
| 8 | Orange | `#f97316` |

### Sole (centro)
- Gradiente: `#fbbf24` → `#f59e0b` → `#ea580c`
- Glow: `rgba(245,158,11,0.5)` → `rgba(234,88,12,0)`

---

## Pattern Canvas Riutilizzabili

### 1. Setup HiDPI
Ogni canvas deve supportare display retina:
```ts
const dpr = window.devicePixelRatio || 1
canvas.width = W * dpr
canvas.height = H * dpr
canvas.style.width = `${W}px`
canvas.style.height = `${H}px`
ctx.scale(dpr, dpr)
```

### 2. Loop Animazione
Pattern standard con `requestAnimationFrame`:
```ts
const c = ctx // narrowed non-null
let startTime: number | null = null

function frame(timestamp: number) {
  if (!startTime) startTime = timestamp
  const elapsed = (timestamp - startTime) / 1000
  c.clearRect(0, 0, W, H)
  // ... draw ...
  animRef.current = requestAnimationFrame(frame)
}
animRef.current = requestAnimationFrame(frame)
return () => cancelAnimationFrame(animRef.current)
```

### 3. Stelle Scintillanti
80 stelle con posizione, raggio, fase e velocità random:
```ts
alpha = 0.3 + 0.5 * Math.sin(time * speed + phase)
```
- Raggio: `0.3–1.5px`
- Velocità: `0.3–1.1`

### 4. Pianeta 3D
Ogni pianeta ha 4 layer sovrapposti:

1. **Trail (scia)**: 8–12 cerchi sfumati dietro al pianeta
   ```ts
   alpha = 0.15 * (1 - t / trailLen)
   size = planetR * (1 - t / trailLen * 0.5)
   ```

2. **Glow (alone)**: Gradiente radiale trasparente
   ```ts
   glowSize = planetR * 3 + Math.sin(elapsed * 1.8) * 1.5
   // Stop: rgba(r,g,b,0.4) → rgba(r,g,b,0)
   ```

3. **Body (corpo)**: Gradiente radiale con highlight top-left
   ```ts
   // Sorgente luce: offset -0.3 * R su X e Y
   // Highlight: rgb + 70 al centro
   // Base color al bordo
   ```

4. **Crescent shadow**: Cerchio nero traslato, clippato al pianeta
   ```ts
   // Offset: +0.35 * R su X, +0.2 * R su Y
   // Raggio: 0.85 * R
   // Fill: rgba(0,0,0,0.3)
   ```

### 5. Orbite Tratteggiate
```ts
ctx.setLineDash([4, 6])
ctx.lineWidth = 0.7
alpha = 0.08 + 0.04 * Math.sin(time * 0.5 + r * 0.02)
```

### 6. Bordo Luminoso (Donut)
```ts
glowAlpha = 0.4 + 0.2 * Math.sin(time * 1.5)
ctx.strokeStyle = `rgba(r,g,b,${glowAlpha})`
ctx.lineWidth = 2
```

### 7. MiniPlanet (Legenda)
Canvas 20×20px con lo stesso stile pianeta 3D (glow + body + crescent), usato nelle legende al posto dei pallini HTML.

---

## Dimensioni Standard

| Elemento | Dimensione |
|----------|-----------|
| Canvas grafici | 320 × 320 px |
| MiniPlanet legenda | 20 × 20 px |
| Donut outer radius | 130 px |
| Donut inner radius | 75 px |
| Sole radius | 32 px |
| Orbite min/max | 60–140 px |
| Pianeta min/max | 5–22 px (proporzionale a %) |

## Velocità e Timing

| Animazione | Formula |
|-----------|---------|
| Stelle scintillanti | `sin(t * [0.3–1.1] + phase)` |
| Glow pulsante | `sin(t * 1.5)` o `sin(t * 1.8)` |
| Orbite breathing | `sin(t * 0.5 + r * 0.02)` |
| Rotazione pianeti | `(±1) * (0.25 + i * 0.12)` rad/s |
| Golden angle offset | `137.508°` tra pianeti |

## Font Canvas

```ts
ctx.font = 'bold 9px system-ui, sans-serif'   // Label piccole
ctx.font = 'bold 12px system-ui, sans-serif'   // Valori
ctx.font = 'bold 14px system-ui, sans-serif'   // Importi grandi
```

## Layout Legenda

- Contenitore: `flex flex-col sm:flex-row items-center gap-4`
- Voci: `flex items-center gap-3 py-1.5` + `borderBottom: 1px solid var(--border)`
- Icona: `MiniPlanet` 20px
- Nome: `text-sm font-medium`, colore `var(--text-primary)`
- Importo: `text-xs`, colore `var(--text-muted)`
- Percentuale: `text-sm font-bold tabular-nums`, colore = colore pianeta

---

## Hex → RGB

Helper condiviso per convertire colori hex in componenti per `rgba()`:
```ts
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}
```

---

## Checklist Nuovo Componente Animato

1. [ ] Usare canvas con setup HiDPI
2. [ ] Sfondo `#080b18` + stelle scintillanti (80)
3. [ ] Loop con `requestAnimationFrame` + cleanup
4. [ ] Pianeti con 4 layer: trail → glow → body → crescent
5. [ ] Orbite tratteggiate `[4, 6]` con alpha animata
6. [ ] Legenda con `MiniPlanet` 20px
7. [ ] Colori dalla palette pianeti (ciclica)
8. [ ] Font: `system-ui, sans-serif`
9. [ ] Dimensione canvas: 320×320
10. [ ] Nessuna libreria esterna
