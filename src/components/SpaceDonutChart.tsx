import { useRef, useEffect, useCallback } from 'react'
import { DASHBOARD } from '../shared/labels'
import MiniPlanet from './MiniPlanet'

// ─── Types ───────────────────────────────────────────────
interface SliceData {
  category: string
  canonicalKey: string
  amount: number
  percent: number
  color: string
  type: 'entrata' | 'uscita'
}

interface SpaceDonutChartProps {
  slices: SliceData[]
  totalIncome: number
  totalExpenses: number
  size?: number
  onCategoryClick?: (canonicalKey: string) => void
}

// ─── Helpers ─────────────────────────────────────────────
function formatEuro(amount: number) {
  return amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

// ─── Star field ──────────────────────────────────────────
interface Star {
  x: number
  y: number
  r: number
  phase: number
  speed: number
}

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

// ─── Donut drawing ───────────────────────────────────────
function drawDonut(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  slices: SliceData[],
  time: number,
) {
  let startAngle = -Math.PI / 2 // top

  for (const slice of slices) {
    const sweep = (slice.percent / 100) * Math.PI * 2
    const endAngle = startAngle + sweep

    // Main slice
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, startAngle, endAngle)
    ctx.arc(cx, cy, innerR, endAngle, startAngle, true)
    ctx.closePath()
    ctx.fillStyle = slice.color
    ctx.fill()

    // Glowing edge
    const { r, g, b } = hexToRgb(slice.color)
    const glowAlpha = 0.4 + 0.2 * Math.sin(time * 1.5)
    ctx.strokeStyle = `rgba(${r},${g},${b},${glowAlpha})`
    ctx.lineWidth = 2
    ctx.stroke()

    // Bright inner & outer border
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, startAngle, endAngle)
    ctx.strokeStyle = `rgba(255,255,255,0.12)`
    ctx.lineWidth = 1
    ctx.stroke()

    startAngle = endAngle
  }

  // Gap lines between slices
  startAngle = -Math.PI / 2
  ctx.strokeStyle = 'rgba(8,11,24,0.9)'
  ctx.lineWidth = 2
  for (const slice of slices) {
    const sweep = (slice.percent / 100) * Math.PI * 2
    const endAngle = startAngle + sweep

    // radial line at start
    ctx.beginPath()
    ctx.moveTo(cx + innerR * Math.cos(startAngle), cy + innerR * Math.sin(startAngle))
    ctx.lineTo(cx + outerR * Math.cos(startAngle), cy + outerR * Math.sin(startAngle))
    ctx.stroke()

    startAngle = endAngle
  }
}

// ─── Planet drawing ──────────────────────────────────────
function drawPlanet(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  orbitR: number,
  angle: number,
  planetR: number,
  color: string,
  direction: number,
) {
  const px = cx + orbitR * Math.cos(angle)
  const py = cy + orbitR * Math.sin(angle)

  // Glow
  const { r, g, b } = hexToRgb(color)
  const grad = ctx.createRadialGradient(px, py, 0, px, py, planetR * 3)
  grad.addColorStop(0, `rgba(${r},${g},${b},0.35)`)
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.beginPath()
  ctx.arc(px, py, planetR * 3, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  // Planet body gradient
  const bodyGrad = ctx.createRadialGradient(
    px - planetR * 0.3,
    py - planetR * 0.3,
    0,
    px,
    py,
    planetR,
  )
  bodyGrad.addColorStop(0, `rgba(${Math.min(r + 60, 255)},${Math.min(g + 60, 255)},${Math.min(b + 60, 255)},1)`)
  bodyGrad.addColorStop(1, color)
  ctx.beginPath()
  ctx.arc(px, py, planetR, 0, Math.PI * 2)
  ctx.fillStyle = bodyGrad
  ctx.fill()

  // Crescent shadow — flip X offset based on direction
  ctx.beginPath()
  ctx.arc(px + planetR * 0.25 * direction, py + planetR * 0.15, planetR * 0.85, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.globalCompositeOperation = 'source-atop'
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  // Trail — always behind the planet
  const trailLen = 8
  for (let t = 1; t <= trailLen; t++) {
    const ta = angle - t * 0.04 * direction
    const tx = cx + orbitR * Math.cos(ta)
    const ty = cy + orbitR * Math.sin(ta)
    const alpha = 0.15 * (1 - t / trailLen)
    ctx.beginPath()
    ctx.arc(tx, ty, planetR * (1 - t / trailLen * 0.5), 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
    ctx.fill()
  }
}

// ─── Orbit rings ─────────────────────────────────────────
function drawOrbits(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radii: number[],
) {
  ctx.setLineDash([4, 6])
  ctx.lineWidth = 0.7
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  for (const r of radii) {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.setLineDash([])
}

// ─── Center text ─────────────────────────────────────────
function drawCenter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  innerR: number,
  totalIncome: number,
  totalExpenses: number,
) {
  // Dark bg circle
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR)
  grad.addColorStop(0, '#0f1225')
  grad.addColorStop(1, '#080b18')
  ctx.beginPath()
  ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  // Subtle border
  ctx.beginPath()
  ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Labels
  ctx.textAlign = 'center'

  ctx.font = 'bold 9px system-ui, sans-serif'
  ctx.fillStyle = '#22c55e'
  ctx.fillText(DASHBOARD.entrate.toUpperCase(), cx, cy - 22)

  ctx.font = 'bold 14px system-ui, sans-serif'
  ctx.fillStyle = '#e8eaf6'
  ctx.fillText(formatEuro(totalIncome), cx, cy - 8)

  ctx.font = 'bold 9px system-ui, sans-serif'
  ctx.fillStyle = '#ef4444'
  ctx.fillText(DASHBOARD.uscite.toUpperCase(), cx, cy + 8)

  ctx.font = 'bold 14px system-ui, sans-serif'
  ctx.fillStyle = '#e8eaf6'
  ctx.fillText(formatEuro(totalExpenses), cx, cy + 23)
}

// ─── Component ───────────────────────────────────────────
function SpaceDonutChart({ slices, totalIncome, totalExpenses, size = 320, onCategoryClick }: SpaceDonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animRef = useRef<number>(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = size
    const H = size
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
    const scale = W / 320
    const outerR = 100 * scale
    const innerR = 58 * scale

    // Planet orbit config — keep planets inside canvas
    const maxPlanetR = 10
    const orbitBase = outerR + 16
    const maxOrbitR = W / 2 - maxPlanetR - 6
    const orbitRange = maxOrbitR - orbitBase
    const orbitStep = slices.length > 1 ? orbitRange / (slices.length - 1) : 0
    const orbitRadii = slices.map((_, i) => orbitBase + i * orbitStep)
    const planetSpeeds = slices.map((_, i) => (i % 2 === 0 ? 1 : -1) * (0.3 + i * 0.15))
    const maxPercent = Math.max(...slices.map((s) => s.percent))
    const minPercent = Math.min(...slices.map((s) => s.percent))
    const planetRadius = (pct: number) => {
      if (maxPercent === minPercent) return 7
      return 4 + ((pct - minPercent) / (maxPercent - minPercent)) * 6
    }

    const c = ctx // narrowed non-null reference
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

      // Orbit rings
      drawOrbits(c, cx, cy, orbitRadii)

      // Donut
      drawDonut(c, cx, cy, outerR, innerR, slices, elapsed)

      // Planets
      slices.forEach((slice, i) => {
        const baseAngle = -Math.PI / 2 + (i * Math.PI * 2) / slices.length
        const angle = baseAngle + elapsed * planetSpeeds[i]
        const dir = planetSpeeds[i] >= 0 ? 1 : -1
        drawPlanet(c, cx, cy, orbitRadii[i], angle, planetRadius(slice.percent), slice.color, dir)
      })

      // Center text
      drawCenter(c, cx, cy, innerR, totalIncome, totalExpenses)

      animRef.current = requestAnimationFrame(frame)
    }

    animRef.current = requestAnimationFrame(frame)

    return () => cancelAnimationFrame(animRef.current)
  }, [slices, totalIncome, totalExpenses, size])

  useEffect(() => {
    const cleanup = draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      cleanup?.()
    }
  }, [draw])

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <canvas
        ref={canvasRef}
        className="flex-shrink-0 rounded-xl"
        style={{ width: size, height: size }}
      />

      {/* Legenda */}
      <div className="flex-1 space-y-1 w-full">
        {(['entrata', 'uscita'] as const).map((group) => {
          const groupSlices = slices.filter((s) => s.type === group)
          if (groupSlices.length === 0) return null
          return (
            <div key={group}>
              <h3
                className="text-xs font-semibold uppercase tracking-wide mb-1 mt-2"
                style={{ color: group === 'entrata' ? '#22c55e' : '#ef4444' }}
              >
                {group === 'entrata' ? DASHBOARD.entrate : DASHBOARD.uscite}
              </h3>
              {groupSlices.map((s) => (
                <div
                  key={s.canonicalKey || s.category}
                  className="flex items-center gap-3 py-1"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <MiniPlanet color={s.color} size={18} />
                  <div className="flex-1 min-w-0">
                    {onCategoryClick && s.canonicalKey ? (
                      <button
                        className="block text-sm font-medium truncate text-left w-full"
                        style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onClick={() => onCategoryClick(s.canonicalKey)}
                      >
                        {s.category} ›
                      </button>
                    ) : (
                      <span className="block text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {s.category}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatEuro(s.amount)}
                    </span>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={{ color: s.color }}>
                    {s.percent}%
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SpaceDonutChart
