import { useRef, useEffect, useState } from 'react'

// ─── Dati di esempio ─────────────────────────────────────
const MONTHS = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']
const SPESE = [320, 180, 410, 290, 520, 380, 210, 460, 340, 490, 610, 550]

// ─── Stelle fisse generate una sola volta ────────────────
const STARS = Array.from({ length: 70 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: Math.random() * 1.2 + 0.3,
  offset: Math.random() * Math.PI * 2,
}))

const PADDING = { top: 52, right: 24, bottom: 36, left: 56 }
const ANIM_DURATION = 3000 // ms
const BG = '#080b18'

function CometChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const animStartRef = useRef<number | null>(null)
  const animDoneRef = useRef(false)
  const rafRef = useRef(0)

  // ─── Coordinate helpers ────────────────────────────────
  function getMetrics(w: number, h: number) {
    const minV = Math.min(...SPESE)
    const maxV = Math.max(...SPESE)
    const range = maxV - minV || 1
    const plotW = w - PADDING.left - PADDING.right
    const plotH = h - PADDING.top - PADDING.bottom

    const points = SPESE.map((v, i) => ({
      x: PADDING.left + (i / (SPESE.length - 1)) * plotW,
      y: PADDING.top + plotH - ((v - minV) / range) * plotH,
      value: v,
      month: MONTHS[i],
    }))

    const minIdx = SPESE.indexOf(minV)
    const maxIdx = SPESE.indexOf(maxV)

    // Grid lines (4-5 nice values)
    const step = Math.ceil(range / 4 / 50) * 50
    const gridStart = Math.floor(minV / step) * step
    const gridLines: number[] = []
    for (let v = gridStart; v <= maxV + step; v += step) gridLines.push(v)

    return { points, minIdx, maxIdx, plotW, plotH, minV, maxV, range, gridLines, step }
  }

  // ─── Disegno ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    let w = 0, h = 0

    function resize() {
      if (!canvas || !container) return
      const rect = container.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }

    resize()

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function draw(time: number) {
      if (!ctx) return
      ctx.save()
      ctx.scale(dpr, dpr)

      // Progress dell'animazione
      if (animStartRef.current === null) animStartRef.current = time
      const elapsed = time - animStartRef.current!
      const progress = Math.min(elapsed / ANIM_DURATION, 1)
      if (progress >= 1) animDoneRef.current = true

      const m = getMetrics(w, h)

      // ── Sfondo ──
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, w, h)

      // ── Stelle ──
      for (const s of STARS) {
        const alpha = 0.4 + 0.6 * ((Math.sin(time * 0.001 + s.offset) + 1) / 2)
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,220,255,${alpha})`
        ctx.fill()
      }

      // ── Titolo ──
      ctx.font = '11px sans-serif'
      ctx.fillStyle = '#5a6a8a'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('SPESE ANNUALI — TRAIETTORIA DELLA COMETA', PADDING.left, 14)

      // ── Griglia orizzontale ──
      ctx.setLineDash([3, 5])
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(60,90,160,0.18)'
      ctx.font = '10px sans-serif'
      ctx.fillStyle = '#5a7aaa'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      const plotH = h - PADDING.top - PADDING.bottom
      for (const gv of m.gridLines) {
        const gy = PADDING.top + plotH - ((gv - m.minV) / m.range) * plotH
        if (gy < PADDING.top - 5 || gy > h - PADDING.bottom + 5) continue
        ctx.beginPath()
        ctx.moveTo(PADDING.left, gy)
        ctx.lineTo(w - PADDING.right, gy)
        ctx.stroke()
        ctx.fillText(`€${gv}`, PADDING.left - 6, gy)
      }
      ctx.setLineDash([])

      // ── Etichette mesi ──
      ctx.font = '10px sans-serif'
      ctx.fillStyle = '#5a7aaa'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      for (const p of m.points) {
        ctx.fillText(p.month, p.x, h - PADDING.bottom + 8)
      }

      // ── Calcolo punti visibili in base al progress ──
      const totalLen = calcTotalLength(m.points)
      const drawLen = totalLen * progress

      // ── Scia glow ──
      drawPartialLine(ctx, m.points, drawLen, totalLen, 'rgba(100,180,255,0.08)', 14)

      // ── Linea principale ──
      drawPartialLine(ctx, m.points, drawLen, totalLen, '#60a0ff', 2)

      // ── Cometa animata (solo durante animazione) ──
      if (!animDoneRef.current) {
        const cometPos = getPositionAtLength(m.points, drawLen, totalLen)
        if (cometPos) {
          // Alone
          ctx.beginPath()
          ctx.arc(cometPos.x, cometPos.y, 12, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(160,210,255,0.3)'
          ctx.fill()
          // Nucleo
          ctx.beginPath()
          ctx.arc(cometPos.x, cometPos.y, 5, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
        }
      }

      // ── Punti dati (solo quelli già "disegnati") ──
      const visibleCount = getVisibleCount(m.points, drawLen, totalLen)
      for (let i = 0; i < visibleCount; i++) {
        const p = m.points[i]
        const isHovered = hover === i && animDoneRef.current

        // Min / Max labels sempre visibili
        if (i === m.minIdx || i === m.maxIdx) {
          const color = i === m.minIdx ? '#44cc88' : '#ffaa44'
          ctx.beginPath()
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
          ctx.font = 'bold 10px sans-serif'
          ctx.fillStyle = color
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(`${p.month}: €${p.value}`, p.x, p.y - 10)
        } else if (isHovered) {
          // Hover
          ctx.beginPath()
          ctx.arc(p.x, p.y, 7, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          ctx.font = 'bold 11px sans-serif'
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(`${p.month}: €${p.value}`, p.x, p.y - 12)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
          ctx.fillStyle = '#4080cc'
          ctx.fill()
        }
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => {
      resize()
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover])

  // ─── Hover handler ─────────────────────────────────────
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!animDoneRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const m = getMetrics(rect.width, rect.height)

    let closest: number | null = null
    let minDist = 20
    for (let i = 0; i < m.points.length; i++) {
      const dx = m.points[i].x - mx
      const dy = m.points[i].y - my
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < minDist) {
        minDist = d
        closest = i
      }
    }
    setHover(closest)
  }

  function handleMouseLeave() {
    setHover(null)
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: 320, borderRadius: 12, overflow: 'hidden', background: BG }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block', cursor: animDoneRef.current ? 'crosshair' : 'default' }}
      />
    </div>
  )
}

// ─── Utilità per disegno parziale della linea ────────────

function calcTotalLength(points: { x: number; y: number }[]) {
  let len = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    len += Math.sqrt(dx * dx + dy * dy)
  }
  return len
}

function drawPartialLine(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  drawLen: number,
  _totalLen: number,
  color: string,
  lineWidth: number,
) {
  if (points.length < 2 || drawLen <= 0) return
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  let accumulated = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    const segLen = Math.sqrt(dx * dx + dy * dy)

    if (accumulated + segLen <= drawLen) {
      ctx.lineTo(points[i].x, points[i].y)
      accumulated += segLen
    } else {
      const remain = drawLen - accumulated
      const t = remain / segLen
      ctx.lineTo(points[i - 1].x + dx * t, points[i - 1].y + dy * t)
      break
    }
  }

  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.stroke()
}

function getPositionAtLength(
  points: { x: number; y: number }[],
  drawLen: number,
  _totalLen: number,
): { x: number; y: number } | null {
  if (points.length < 2 || drawLen <= 0) return null
  let accumulated = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    const segLen = Math.sqrt(dx * dx + dy * dy)
    if (accumulated + segLen >= drawLen) {
      const t = (drawLen - accumulated) / segLen
      return { x: points[i - 1].x + dx * t, y: points[i - 1].y + dy * t }
    }
    accumulated += segLen
  }
  return points[points.length - 1]
}

function getVisibleCount(
  points: { x: number; y: number }[],
  drawLen: number,
  _totalLen: number,
): number {
  if (points.length < 2) return points.length
  let accumulated = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    accumulated += Math.sqrt(dx * dx + dy * dy)
    if (accumulated > drawLen) return i
  }
  return points.length
}

export default CometChart
