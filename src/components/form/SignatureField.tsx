import { type PointerEvent, useEffect, useId, useRef } from 'react'
import { cx } from '../../lib/cx'
import { isImageDataUrl } from '../../lib/image'
import { buttonClass } from '../ui'
import { actionsClass, fieldClass, hintClass, labelClass, wideFieldClass } from './styles'

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 200

interface SignatureFieldProps {
  label: string
  value: string
  onChange: (dataUrl: string) => void
}

export function SignatureField({ label, value, onChange }: SignatureFieldProps) {
  const id = useId()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only
  useEffect(() => {
    if (value) drawImage(value)
  }, [])

  function getContext() {
    return canvasRef.current?.getContext('2d') ?? null
  }

  function toCanvasPoint(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const ctx = getContext()
    if (!ctx) return
    event.currentTarget.setPointerCapture(event.pointerId)
    isDrawing.current = true
    const { x, y } = toCanvasPoint(event)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1a1a2e'
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return
    const ctx = getContext()
    if (!ctx) return
    const { x, y } = toCanvasPoint(event)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function handlePointerUp() {
    if (!isDrawing.current) return
    isDrawing.current = false
    const canvas = canvasRef.current
    if (canvas) onChange(canvas.toDataURL('image/png'))
  }

  function clearCanvas() {
    getContext()?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }

  function drawImage(src: string) {
    if (!isImageDataUrl(src)) return
    const image = new Image()
    image.onload = () => {
      const ctx = getContext()
      if (!ctx) return
      clearCanvas()
      const scale = Math.min(CANVAS_WIDTH / image.width, CANVAS_HEIGHT / image.height)
      const width = image.width * scale
      const height = image.height * scale
      ctx.drawImage(image, (CANVAS_WIDTH - width) / 2, (CANVAS_HEIGHT - height) / 2, width, height)
      const canvas = canvasRef.current
      if (canvas) onChange(canvas.toDataURL('image/png'))
    }
    image.src = src
  }

  function handleUpload(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') drawImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function handleClear() {
    clearCanvas()
    onChange('')
  }

  return (
    <div className={cx(fieldClass, wideFieldClass)}>
      <span className={labelClass} id={`${id}-label`}>
        {label}
      </span>
      <canvas
        ref={canvasRef}
        className="aspect-3/1 w-full cursor-crosshair touch-none rounded-lg border border-line-strong border-dashed bg-surface"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        aria-labelledby={`${id}-label`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <div className={actionsClass}>
        <span className={cx(hintClass, 'mr-auto')}>Draw above or upload an image</span>
        <label className={buttonClass('ghost')}>
          Upload
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              handleUpload(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
        <button
          type="button"
          className={buttonClass('ghost')}
          onClick={handleClear}
          disabled={!value}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
