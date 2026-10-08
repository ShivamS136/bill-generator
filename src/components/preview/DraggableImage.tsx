import { type KeyboardEvent, type PointerEvent, useRef, useState } from 'react'
import { cx } from '../../lib/cx'
import { PDF_PAGE_ATTR } from '../../lib/pdf'
import { PAPER_WIDTH_PX } from './Paper'

export interface Placement {
  x: number
  y: number
  rotate: number
}

export const ORIGIN: Placement = { x: 0, y: 0, rotate: 0 }

export function randomPlacement(range: Placement): Placement {
  const jitter = (max: number) => Math.round((Math.random() * 2 - 1) * max)
  return { x: jitter(range.x), y: jitter(range.y), rotate: jitter(range.rotate) }
}

interface DragSession {
  startX: number
  startY: number
  scale: number
  origin: Placement
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
  latest: Placement
}

interface DraggableImageProps {
  src: string
  alt: string
  placement: Placement
  onPlacementChange: (placement: Placement) => void
  className?: string
  imageClassName?: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function DraggableImage({
  src,
  alt,
  placement,
  onPlacementChange,
  className,
  imageClassName,
}: DraggableImageProps) {
  const session = useRef<DragSession | null>(null)
  const [draft, setDraft] = useState<Placement | null>(null)
  const { x, y, rotate } = draft ?? placement

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    const target = event.currentTarget
    const page = target.closest(`[${PDF_PAGE_ATTR}]`)
    if (!page) return
    event.preventDefault()
    target.setPointerCapture(event.pointerId)
    const pageRect = page.getBoundingClientRect()
    const rect = target.getBoundingClientRect()
    const scale = pageRect.width / PAPER_WIDTH_PX
    session.current = {
      startX: event.clientX,
      startY: event.clientY,
      scale,
      origin: placement,
      latest: placement,
      bounds: {
        minX: placement.x + (pageRect.left - rect.left) / scale,
        maxX: placement.x + (pageRect.right - rect.right) / scale,
        minY: placement.y + (pageRect.top - rect.top) / scale,
        maxY: placement.y + (pageRect.bottom - rect.bottom) / scale,
      },
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = session.current
    if (!drag) return
    const { origin, bounds, scale } = drag
    drag.latest = {
      ...origin,
      x: Math.round(
        clamp(origin.x + (event.clientX - drag.startX) / scale, bounds.minX, bounds.maxX),
      ),
      y: Math.round(
        clamp(origin.y + (event.clientY - drag.startY) / scale, bounds.minY, bounds.maxY),
      ),
    }
    setDraft(drag.latest)
  }

  function handlePointerUp() {
    const drag = session.current
    if (!drag) return
    session.current = null
    setDraft(null)
    onPlacementChange(drag.latest)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.shiftKey ? 10 : 2
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    onPlacementChange({ ...placement, x: placement.x + move[0], y: placement.y + move[1] })
  }

  return (
    <button
      type="button"
      className={cx(
        'block cursor-grab touch-none select-none rounded border-0 bg-transparent p-0 hover:outline-dashed hover:outline-1 hover:outline-brand/60 hover:outline-offset-2 active:cursor-grabbing',
        className,
      )}
      style={{ transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)` }}
      title="Drag to move (arrow keys nudge)"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      <img
        className={cx('pointer-events-none block', imageClassName)}
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        draggable={false}
      />
    </button>
  )
}
