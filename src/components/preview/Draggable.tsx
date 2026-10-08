import { RotateCw } from 'lucide-react'
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cx } from '../../lib/cx'
import { PDF_IGNORE_ATTR, PDF_PAGE_ATTR } from '../../lib/pdf'
import { PAPER_WIDTH_PX } from './Paper'

export interface Placement {
  x: number
  y: number
  rotate: number
  scale: number
}

export type Jitter = Omit<Placement, 'scale'>

export const ORIGIN: Placement = { x: 0, y: 0, rotate: 0, scale: 1 }

const MIN_SCALE = 0.4
const MAX_SCALE = 3
const ROTATE_SNAP = 15

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const toScale = (value: number) => Math.round(clamp(value, MIN_SCALE, MAX_SCALE) * 100) / 100

export function randomPlacement(range: Jitter, scale = 1): Placement {
  const jitter = (max: number) => Math.round((Math.random() * 2 - 1) * max)
  return { x: jitter(range.x), y: jitter(range.y), rotate: jitter(range.rotate), scale }
}

export function parsePlacement(value: unknown): Placement {
  const source = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  const num = (field: keyof Placement) => {
    const n = source[field]
    return typeof n === 'number' && Number.isFinite(n) ? n : ORIGIN[field]
  }
  return {
    x: num('x'),
    y: num('y'),
    rotate: num('rotate'),
    scale: toScale(num('scale')),
  }
}

type Point = { x: number; y: number }

type Gesture =
  | {
      type: 'move'
      start: Point
      pageScale: number
      bounds: { minX: number; maxX: number; minY: number; maxY: number }
    }
  | { type: 'resize'; center: Point; startDistance: number }
  | { type: 'rotate'; center: Point; startAngle: number }

interface Session {
  gesture: Gesture
  origin: Placement
  latest: Placement
}

const CORNERS = [
  { label: 'top left', className: 'top-0 left-0 cursor-nwse-resize' },
  { label: 'top right', className: 'top-0 left-full cursor-nesw-resize' },
  { label: 'bottom left', className: 'top-full left-0 cursor-nesw-resize' },
  { label: 'bottom right', className: 'top-full left-full cursor-nwse-resize' },
]

const angleOf = (center: Point, point: Point) =>
  (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI

const normalizeAngle = (angle: number) => ((((angle + 180) % 360) + 360) % 360) - 180

interface DraggableProps {
  placement: Placement
  onPlacementChange: (placement: Placement) => void
  className?: string
  children: ReactNode
}

export function Draggable({ placement, onPlacementChange, className, children }: DraggableProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const session = useRef<Session | null>(null)
  const [draft, setDraft] = useState<Placement | null>(null)
  const [isActive, setIsActive] = useState(false)
  const { x, y, rotate, scale } = draft ?? placement

  useEffect(() => {
    if (!isActive) return
    const deactivate = (event: globalThis.PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsActive(false)
    }
    document.addEventListener('pointerdown', deactivate)
    return () => document.removeEventListener('pointerdown', deactivate)
  }, [isActive])

  function center(): Point {
    const rect = wrapperRef.current?.getBoundingClientRect()
    return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 }
  }

  function begin(event: PointerEvent<HTMLElement>, gesture: Gesture) {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsActive(true)
    session.current = { gesture, origin: placement, latest: placement }
  }

  function startMove(event: PointerEvent<HTMLElement>) {
    const wrapper = wrapperRef.current
    const page = wrapper?.closest(`[${PDF_PAGE_ATTR}]`)
    if (!wrapper || !page) return
    const pageRect = page.getBoundingClientRect()
    const rect = wrapper.getBoundingClientRect()
    const pageScale = pageRect.width / PAPER_WIDTH_PX
    begin(event, {
      type: 'move',
      start: { x: event.clientX, y: event.clientY },
      pageScale,
      bounds: {
        minX: placement.x + (pageRect.left - rect.left) / pageScale,
        maxX: placement.x + (pageRect.right - rect.right) / pageScale,
        minY: placement.y + (pageRect.top - rect.top) / pageScale,
        maxY: placement.y + (pageRect.bottom - rect.bottom) / pageScale,
      },
    })
  }

  function startResize(event: PointerEvent<HTMLElement>) {
    const c = center()
    const startDistance = Math.hypot(event.clientX - c.x, event.clientY - c.y)
    if (startDistance > 0) begin(event, { type: 'resize', center: c, startDistance })
  }

  function startRotate(event: PointerEvent<HTMLElement>) {
    const c = center()
    begin(event, {
      type: 'rotate',
      center: c,
      startAngle: angleOf(c, { x: event.clientX, y: event.clientY }),
    })
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const current = session.current
    if (!current) return
    const { gesture, origin } = current
    const pointer = { x: event.clientX, y: event.clientY }

    if (gesture.type === 'move') {
      const { start, pageScale, bounds } = gesture
      current.latest = {
        ...origin,
        x: Math.round(
          clamp(origin.x + (pointer.x - start.x) / pageScale, bounds.minX, bounds.maxX),
        ),
        y: Math.round(
          clamp(origin.y + (pointer.y - start.y) / pageScale, bounds.minY, bounds.maxY),
        ),
      }
    } else if (gesture.type === 'resize') {
      const distance = Math.hypot(pointer.x - gesture.center.x, pointer.y - gesture.center.y)
      current.latest = {
        ...origin,
        scale: toScale((origin.scale * distance) / gesture.startDistance),
      }
    } else {
      const delta = angleOf(gesture.center, pointer) - gesture.startAngle
      const raw = normalizeAngle(origin.rotate + delta)
      const snapped = event.shiftKey ? Math.round(raw / ROTATE_SNAP) * ROTATE_SNAP : raw
      current.latest = { ...origin, rotate: Math.round(snapped) }
    }
    setDraft(current.latest)
  }

  function handlePointerUp() {
    const current = session.current
    if (!current) return
    session.current = null
    setDraft(null)
    onPlacementChange(current.latest)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.shiftKey ? 10 : 2
    const actions: Record<string, () => Placement> = {
      ArrowLeft: () => ({ ...placement, x: placement.x - step }),
      ArrowRight: () => ({ ...placement, x: placement.x + step }),
      ArrowUp: () => ({ ...placement, y: placement.y - step }),
      ArrowDown: () => ({ ...placement, y: placement.y + step }),
      '+': () => ({ ...placement, scale: toScale(placement.scale + 0.05) }),
      '=': () => ({ ...placement, scale: toScale(placement.scale + 0.05) }),
      '-': () => ({ ...placement, scale: toScale(placement.scale - 0.05) }),
      '[': () => ({ ...placement, rotate: normalizeAngle(placement.rotate - step) }),
      ']': () => ({ ...placement, rotate: normalizeAngle(placement.rotate + step) }),
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    onPlacementChange(action())
  }

  const gestureHandlers = {
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
  }
  const counterScale = 1 / scale

  return (
    <div
      ref={wrapperRef}
      className={cx('group w-fit touch-none select-none', className)}
      style={{ transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})` }}
    >
      <div className="relative">
        <button
          type="button"
          className="block cursor-grab rounded border-0 bg-transparent p-0 *:pointer-events-none active:cursor-grabbing"
          title="Drag to move, drag corners to resize, top handle to rotate. Keys: arrows, + / −, [ / ]"
          onPointerDown={startMove}
          onKeyDown={handleKeyDown}
          {...gestureHandlers}
        >
          {children}
        </button>
        <div
          {...{ [PDF_IGNORE_ATTR]: '' }}
          className={cx(
            'pointer-events-none absolute inset-0 transition-opacity',
            isActive
              ? 'opacity-100'
              : 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100',
          )}
        >
          <span
            className="absolute inset-0 rounded-sm border-brand border-dashed"
            style={{ borderWidth: counterScale * 1.5 }}
          />
          {CORNERS.map((corner) => (
            <button
              key={corner.label}
              type="button"
              tabIndex={-1}
              aria-label={`Resize from ${corner.label}`}
              className={cx(
                'pointer-events-auto absolute grid size-8 place-items-center border-0 bg-transparent p-0',
                corner.className,
              )}
              style={{ transform: `translate(-50%, -50%) scale(${counterScale})` }}
              onPointerDown={startResize}
              {...gestureHandlers}
            >
              <span className="size-4 rounded-full border-2 border-brand bg-white shadow-panel" />
            </button>
          ))}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Rotate"
            className="pointer-events-auto absolute bottom-full left-1/2 grid size-8 origin-bottom cursor-grab place-items-center rounded-full border-2 border-brand bg-white p-0 text-brand shadow-panel active:cursor-grabbing"
            style={{ transform: `translateX(-50%) scale(${counterScale}) translateY(-6px)` }}
            onPointerDown={startRotate}
            {...gestureHandlers}
          >
            <RotateCw className="pointer-events-none size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
