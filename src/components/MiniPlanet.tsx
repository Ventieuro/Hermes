import { useRef, useEffect } from 'react'

interface MiniPlanetProps {
  color: string
  size?: number
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function MiniPlanet({ color, size = 20 }: MiniPlanetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const planetR = size / 2 - 2
    const { r, g, b } = hexToRgb(color)
    const c = ctx

    let startTime: number | null = null

    function frame(timestamp: number) {
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000

      c.clearRect(0, 0, size, size)

      // Glow
      const glowSize = planetR + 3 + Math.sin(elapsed * 1.8) * 1.5
      const grad = c.createRadialGradient(cx, cy, 0, cx, cy, glowSize)
      grad.addColorStop(0, `rgba(${r},${g},${b},0.4)`)
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
      c.beginPath()
      c.arc(cx, cy, glowSize, 0, Math.PI * 2)
      c.fillStyle = grad
      c.fill()

      // Body gradient
      const bodyGrad = c.createRadialGradient(
        cx - planetR * 0.3, cy - planetR * 0.3, 0,
        cx, cy, planetR,
      )
      bodyGrad.addColorStop(0, `rgba(${Math.min(r + 70, 255)},${Math.min(g + 70, 255)},${Math.min(b + 70, 255)},1)`)
      bodyGrad.addColorStop(1, color)
      c.beginPath()
      c.arc(cx, cy, planetR, 0, Math.PI * 2)
      c.fillStyle = bodyGrad
      c.fill()

      // Crescent shadow
      c.save()
      c.beginPath()
      c.arc(cx, cy, planetR, 0, Math.PI * 2)
      c.clip()
      c.beginPath()
      c.arc(cx + planetR * 0.35, cy + planetR * 0.2, planetR * 0.85, 0, Math.PI * 2)
      c.fillStyle = 'rgba(0,0,0,0.3)'
      c.fill()
      c.restore()

      // Border
      c.beginPath()
      c.arc(cx, cy, planetR, 0, Math.PI * 2)
      c.strokeStyle = 'rgba(255,255,255,0.15)'
      c.lineWidth = 0.5
      c.stroke()

      animRef.current = requestAnimationFrame(frame)
    }

    animRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(animRef.current)
  }, [color, size])

  return (
    <canvas
      ref={canvasRef}
      className="flex-shrink-0"
      style={{ width: size, height: size }}
    />
  )
}

export default MiniPlanet
