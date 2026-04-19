import { useRef, useEffect, useCallback, useMemo } from 'react'
import type { Transaction } from '../shared/types'
import { DASHBOARD } from '../shared/labels'
import { getCategoryIcon } from '../shared/categoryIcons'

// ─── Colori pianeti ──────────────────────────────────────
const PLANET_COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#22c55e', // green
  '#ef4444', // red
  '#f97316', // orange
]

interface PlanetData {
  category: string
  icon: string
  amount: number
  percent: number
  color: string
}

interface SolarSystemChartProps {
  transactions: Transaction[]
}

function formatEuro(amount: number) {
  return amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function buildPlanets(transactions: Transaction[]): { planets: PlanetData[]; total: number } {
  const expenses = transactions.filter((t) => t.type === 'uscita')
  if (expenses.length === 0) return { planets: [], total: 0 }

  const total = expenses.reduce((s, t) => s + t.amount, 0)

  const byCategory = new Map<string, number>()
  for (const tx of expenses) {
    byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + tx.amount)
  }

  const planets: PlanetData[] = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount], i) => ({
      category,
      icon: getCategoryIcon(category),
      amount,
      percent: Math.round((amount / total) * 100),
      color: PLANET_COLORS[i % PLANET_COLORS.length],
    }))

  return { planets, total }
}

// ─── Star field ──────────────────────────────────────────
interface Star { x: number; y: number; r: number; phase: number; speed: number }

function createStars(w: number, h: number, count: number): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.8 + 0.3,
    })
  }
  return stars
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], time: number) {
  for (const s of stars) {
    const alpha = 0.3 + 0.5 * Math.sin(time * s.speed + s.phase)
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${alpha})`
    ctx.fill()
  }
}

// ─── Orbit rings ─────────────────────────────────────────
function drawOrbits(ctx: CanvasRenderingContext2D, cx: number, cy: number, radii: number[], time: number) {
  ctx.setLineDash([4, 6])
  ctx.lineWidth = 0.7
  for (const r of radii) {
    const alpha = 0.08 + 0.04 * Math.sin(time * 0.5 + r * 0.02)
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.setLineDash([])
}

// ─── Sun (center) ────────────────────────────────────────
function drawSun(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, total: number, time: number) {
  // Sun glow
  const glowR = radius + 12 + 4 * Math.sin(time * 1.2)
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, glowR)
  glow.addColorStop(0, 'rgba(245,158,11,0.5)')
  glow.addColorStop(0.6, 'rgba(234,88,12,0.15)')
  glow.addColorStop(1, 'rgba(234,88,12,0)')
  ctx.beginPath()
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2)
  ctx.fillStyle = glow
  ctx.fill()

  // Sun body
  const bodyGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, 0, cx, cy, radius)
  bodyGrad.addColorStop(0, '#fbbf24')
  bodyGrad.addColorStop(0.7, '#f59e0b')
  bodyGrad.addColorStop(1, '#ea580c')
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = bodyGrad
  ctx.fill()

  // Sun border
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Text
  ctx.textAlign = 'center'
  ctx.font = 'bold 9px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(120,53,15,0.8)'
  ctx.fillText('totale', cx, cy - 6)
  ctx.font = 'bold 12px system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(formatEuro(total), cx, cy + 9)
}

// ─── Planet ──────────────────────────────────────────────
function drawPlanet(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  orbitR: number, angle: number,
  planetR: number, color: string,
  icon: string, percent: number,
  time: number,
) {
  const px = cx + orbitR * Math.cos(angle)
  const py = cy + orbitR * Math.sin(angle)
  const { r, g, b } = hexToRgb(color)

  // Trail
  const trailLen = 12
  for (let t = 1; t <= trailLen; t++) {
    const ta = angle - t * 0.035
    const tx = cx + orbitR * Math.cos(ta)
    const ty = cy + orbitR * Math.sin(ta)
    const alpha = 0.18 * (1 - t / trailLen)
    const size = planetR * (1 - t / trailLen * 0.6)
    ctx.beginPath()
    ctx.arc(tx, ty, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
    ctx.fill()
  }

  // Glow halo
  const glowSize = planetR * 3 + Math.sin(time * 2) * 2
  const grad = ctx.createRadialGradient(px, py, 0, px, py, glowSize)
  grad.addColorStop(0, `rgba(${r},${g},${b},0.4)`)
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.beginPath()
  ctx.arc(px, py, glowSize, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  // Planet body
  const bodyGrad = ctx.createRadialGradient(
    px - planetR * 0.3, py - planetR * 0.3, 0,
    px, py, planetR,
  )
  bodyGrad.addColorStop(0, `rgba(${Math.min(r + 70, 255)},${Math.min(g + 70, 255)},${Math.min(b + 70, 255)},1)`)
  bodyGrad.addColorStop(1, color)
  ctx.beginPath()
  ctx.arc(px, py, planetR, 0, Math.PI * 2)
  ctx.fillStyle = bodyGrad
  ctx.fill()

  // Crescent shadow
  ctx.save()
  ctx.beginPath()
  ctx.arc(px, py, planetR, 0, Math.PI * 2)
  ctx.clip()
  ctx.beginPath()
  ctx.arc(px + planetR * 0.35, py + planetR * 0.2, planetR * 0.9, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fill()
  ctx.restore()

  // Planet border
  ctx.beginPath()
  ctx.arc(px, py, planetR, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(255,255,255,0.15)`
  ctx.lineWidth = 0.8
  ctx.stroke()

  // Icon (emoji)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${Math.max(10, planetR * 0.9)}px system-ui, sans-serif`
  ctx.fillText(icon, px, py - (planetR >= 14 ? 3 : 0))

  // Percent label
  if (planetR >= 14) {
    ctx.font = `bold ${Math.max(7, planetR * 0.4)}px system-ui, sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`${percent}%`, px, py + planetR * 0.45)
  }
  ctx.textBaseline = 'alphabetic'
}

// ─── Component ───────────────────────────────────────────
function SolarSystemChart({ transactions }: SolarSystemChartProps) {
  const { planets, total } = useMemo(() => buildPlanets(transactions), [transactions])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animRef = useRef<number>(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || planets.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = 320
    const H = 320
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    if (starsRef.current.length === 0) {
      starsRef.current = createStars(W, H, 80)
    }

    const cx = W / 2
    const cy = H / 2
    const sunR = 32

    // Orbits: from 60px to 140px
    const minOrbit = 60
    const maxOrbit = 140
    const orbitStep = planets.length > 1 ? (maxOrbit - minOrbit) / (planets.length - 1) : 0
    const orbitRadii = planets.map((_, i) => minOrbit + i * orbitStep)

    // Planet sizes: 10–22 proportional to percent
    const maxPct = Math.max(...planets.map((p) => p.percent))
    const minPct = Math.min(...planets.map((p) => p.percent))
    const planetRadius = (pct: number) => {
      if (maxPct === minPct) return 16
      return 10 + ((pct - minPct) / (maxPct - minPct)) * 12
    }

    // Speeds: alternate directions, varied speeds
    const speeds = planets.map((_, i) => (i % 2 === 0 ? 1 : -1) * (0.25 + i * 0.12))

    // Golden angle base offsets
    const goldenAngle = 137.508

    const c = ctx
    let startTime: number | null = null

    function frame(timestamp: number) {
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000

      c.clearRect(0, 0, W, H)

      // Background
      c.fillStyle = '#080b18'
      c.fillRect(0, 0, W, H)

      // Stars
      drawStars(c, starsRef.current, elapsed)

      // Orbits
      drawOrbits(c, cx, cy, orbitRadii, elapsed)

      // Sun
      drawSun(c, cx, cy, sunR, total, elapsed)

      // Planets
      planets.forEach((planet, i) => {
        const baseAngle = (i * goldenAngle * Math.PI) / 180
        const angle = baseAngle + elapsed * speeds[i]
        drawPlanet(c, cx, cy, orbitRadii[i], angle, planetRadius(planet.percent), planet.color, planet.icon, planet.percent, elapsed)
      })

      animRef.current = requestAnimationFrame(frame)
    }

    animRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(animRef.current)
  }, [planets, total])

  useEffect(() => {
    const cleanup = draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      cleanup?.()
    }
  }, [draw])

  if (planets.length === 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <canvas
        ref={canvasRef}
        className="flex-shrink-0 rounded-xl"
        style={{ width: 320, height: 320 }}
      />

      {/* Legend */}
      <div className="flex-1 space-y-2.5 w-full">
        <h3
          className="text-xs font-semibold uppercase tracking-wide mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          {DASHBOARD.categorieLabel}
        </h3>
        {planets.map((p) => (
          <div
            key={p.category}
            className="flex items-center gap-3 py-1.5"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}60` }}
            />
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {p.icon} {p.category}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatEuro(p.amount)}
              </span>
            </div>
            <span className="text-sm font-bold tabular-nums" style={{ color: p.color }}>
              {p.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SolarSystemChart
