import { type PointerEvent, useEffect, useRef, useState } from 'react'

export type Stroke = Array<{ x: number; y: number }>

const WIDTH = 600
const HEIGHT = 200
const LINE_WIDTH = 3
const EXPORT_SCALE = 2

function paint(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  color: string,
  scale = 1,
  origin = { x: 0, y: 0 },
) {
  ctx.lineWidth = LINE_WIDTH * scale
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = color
  for (const stroke of strokes) {
    ctx.beginPath()
    for (const [index, point] of stroke.entries()) {
      const x = (point.x - origin.x) * scale
      const y = (point.y - origin.y) * scale
      if (index === 0) ctx.moveTo(x, y)
      ctx.lineTo(index === 0 ? x + 0.01 : x, y)
    }
    ctx.stroke()
  }
}

export function strokesToDataUrl(strokes: Stroke[], color: string): string {
  const points = strokes.flat()
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const origin = { x: Math.min(...xs) - LINE_WIDTH, y: Math.min(...ys) - LINE_WIDTH }
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil((Math.max(...xs) + LINE_WIDTH - origin.x) * EXPORT_SCALE)
  canvas.height = Math.ceil((Math.max(...ys) + LINE_WIDTH - origin.y) * EXPORT_SCALE)
  const ctx = canvas.getContext('2d')
  if (ctx) paint(ctx, strokes, color, EXPORT_SCALE, origin)
  return canvas.toDataURL('image/png')
}

interface DrawPadProps {
  strokes: Stroke[]
  color: string
  onStrokesChange: (strokes: Stroke[]) => void
}

export function DrawPad({ strokes, color, onStrokesChange }: DrawPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const current = useRef<Stroke | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  function redraw(list: Stroke[]) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    paint(ctx, list, color)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: redraw reads the latest color
  useEffect(() => redraw(strokes), [strokes, color])

  function toPoint(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.round(((event.clientX - rect.left) / rect.width) * WIDTH),
      y: Math.round(((event.clientY - rect.top) / rect.height) * HEIGHT),
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    current.current = [toPoint(event)]
    setIsDrawing(true)
    redraw([...strokes, current.current])
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!current.current) return
    current.current.push(toPoint(event))
    redraw([...strokes, current.current])
  }

  function handlePointerUp() {
    if (!current.current) return
    const stroke = current.current
    current.current = null
    setIsDrawing(false)
    onStrokesChange([...strokes, stroke])
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        aria-label="Signature drawing pad"
        className="aspect-3/1 w-full cursor-crosshair touch-none rounded-xl border border-line border-dashed bg-surface-muted"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      {strokes.length === 0 && !isDrawing && (
        <p className="pointer-events-none absolute inset-0 grid place-items-center text-ink-muted">
          Draw your signature here
        </p>
      )}
    </div>
  )
}
