import { ImageUp, Link, PenLine, Type, Upload } from 'lucide-react'
import { type DragEvent, useId, useState } from 'react'
import { cx } from '../../lib/cx'
import { isSafeImageSrc, readFileAsDataUrl } from '../../lib/image'
import {
  type ImageSource,
  SIGNATURE_COLORS,
  SIGNATURE_FONTS,
  type Signature,
  type TextSignature,
  textSignature,
} from '../../lib/signature'
import { Dialog } from '../Dialog'
import { errorHintClass, hintClass, inputClass, labelClass, textareaClass } from '../form/styles'
import { buttonClass } from '../ui'
import { DrawPad, type Stroke, strokesToDataUrl } from './DrawPad'
import { signatureFontStyle } from './SignatureMark'

type Mode = 'text' | ImageSource

const MODES = [
  { id: 'text', label: 'Type', icon: Type },
  { id: 'draw', label: 'Draw', icon: PenLine },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'url', label: 'URL', icon: Link },
] as const

const UPLOAD_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']

interface SignatureDialogProps {
  title: string
  value: Signature
  defaultText: string
  onApply: (value: Signature) => void
  onClose: () => void
}

export function SignatureDialog({
  title,
  value,
  defaultText,
  onApply,
  onClose,
}: SignatureDialogProps) {
  const imageFrom = (source: ImageSource) =>
    value.kind === 'image' && value.source === source ? value.src : ''

  const [mode, setMode] = useState<Mode>(value.kind === 'text' ? 'text' : value.source)
  const [text, setText] = useState<TextSignature>(
    value.kind === 'text' ? value : textSignature(defaultText),
  )
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [drawColor, setDrawColor] = useState<string>(SIGNATURE_COLORS[0].value)
  const [drawn, setDrawn] = useState(imageFrom('draw'))
  const [upload, setUpload] = useState(imageFrom('upload'))
  const [url, setUrl] = useState(imageFrom('url'))

  function result(): Signature | null {
    if (mode === 'text') return text.text.trim() ? text : null
    if (mode === 'draw') {
      if (strokes.length)
        return { kind: 'image', source: 'draw', src: strokesToDataUrl(strokes, drawColor) }
      return drawn ? { kind: 'image', source: 'draw', src: drawn } : null
    }
    const src = (mode === 'upload' ? upload : url).trim()
    return isSafeImageSrc(src) ? { kind: 'image', source: mode, src } : null
  }

  const canApply = mode === 'draw' ? strokes.length > 0 || !!drawn : result() !== null

  return (
    <Dialog
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={buttonClass('ghost')} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={buttonClass('primary')}
            disabled={!canApply}
            onClick={() => {
              const next = result()
              if (next) onApply(next)
            }}
          >
            Apply
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5 sm:flex-row">
        <fieldset className="m-0 flex min-w-0 gap-1 rounded-xl border-0 bg-surface-muted p-1 sm:flex-col sm:self-start">
          <legend className="sr-only">Signature type</legend>
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
              className={cx(
                'flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg px-3 py-2 font-medium text-xs transition-colors',
                mode === id
                  ? 'bg-surface text-brand shadow-panel'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </fieldset>

        <div className="min-w-0 flex-1">
          {mode === 'text' && <TextPanel value={text} onChange={setText} />}
          {mode === 'draw' && (
            <DrawPanel
              strokes={strokes}
              color={drawColor}
              drawn={drawn}
              onStrokesChange={setStrokes}
              onColorChange={setDrawColor}
              onClear={() => {
                setStrokes([])
                setDrawn('')
              }}
            />
          )}
          {mode === 'upload' && <UploadPanel value={upload} onChange={setUpload} />}
          {mode === 'url' && <UrlPanel value={url} onChange={setUrl} />}
        </div>
      </div>
    </Dialog>
  )
}

function TextPanel({
  value,
  onChange,
}: {
  value: TextSignature
  onChange: (value: TextSignature) => void
}) {
  const id = useId()
  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <label className={labelClass} htmlFor={id}>
          Name
        </label>
        <input
          id={id}
          className={inputClass}
          value={value.text}
          placeholder="Type your name"
          onChange={(event) => onChange({ ...value, text: event.target.value })}
        />
      </div>
      <fieldset className="m-0 grid min-w-0 gap-1.5 border-0 p-0">
        <legend className={cx(labelClass, 'mb-1.5 p-0')}>Style</legend>
        <div className="max-h-64 divide-y divide-line overflow-y-auto rounded-xl border border-line">
          {SIGNATURE_FONTS.map((font) => (
            <label
              key={font}
              className="flex cursor-pointer items-center gap-4 px-4 py-2 hover:bg-surface-muted has-checked:bg-brand-soft"
            >
              <input
                type="radio"
                name={`${id}-font`}
                className="size-4 shrink-0 accent-brand"
                checked={value.font === font}
                onChange={() => onChange({ ...value, font })}
              />
              <span
                className="truncate text-3xl leading-normal"
                style={signatureFontStyle(font, value.color)}
              >
                {value.text || 'Your name'}
              </span>
              <span className="sr-only">{font}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <ColorPicker value={value.color} onChange={(color) => onChange({ ...value, color })} />
    </div>
  )
}

function DrawPanel({
  strokes,
  color,
  drawn,
  onStrokesChange,
  onColorChange,
  onClear,
}: {
  strokes: Stroke[]
  color: string
  drawn: string
  onStrokesChange: (strokes: Stroke[]) => void
  onColorChange: (color: string) => void
  onClear: () => void
}) {
  const hasInk = strokes.length > 0 || !!drawn
  return (
    <div className="grid gap-4">
      {drawn && strokes.length === 0 ? (
        <div className="grid aspect-3/1 place-items-center rounded-xl border border-line border-dashed bg-surface-muted p-4">
          <img className="max-h-full max-w-full object-contain" src={drawn} alt="Current drawing" />
        </div>
      ) : (
        <DrawPad strokes={strokes} color={color} onStrokesChange={onStrokesChange} />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ColorPicker value={color} onChange={onColorChange} />
        <button type="button" className={buttonClass('ghost')} onClick={onClear} disabled={!hasInk}>
          Clear
        </button>
      </div>
      {drawn && strokes.length === 0 && <p className={hintClass}>Clear to draw a new signature.</p>}
    </div>
  )
}

function UploadPanel({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!UPLOAD_TYPES.includes(file.type)) {
      setError('Use a PNG, JPG or SVG image.')
      return
    }
    setError('')
    onChange(await readFileAsDataUrl(file))
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  return (
    <div className="grid gap-2">
      <section
        aria-label="Upload signature"
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cx(
          'grid min-h-56 place-items-center content-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
          isDragging ? 'border-brand bg-brand-soft' : 'border-line bg-surface-muted',
        )}
      >
        {value ? (
          <img
            className="max-h-24 max-w-full object-contain"
            src={value}
            alt="Uploaded signature"
          />
        ) : (
          <ImageUp className="size-10 text-ink-muted" aria-hidden="true" />
        )}
        <label className={buttonClass('outline')}>
          {value ? 'Replace signature' : 'Upload signature'}
          <input
            type="file"
            accept={UPLOAD_TYPES.join(',')}
            hidden
            onChange={(event) => {
              handleFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
        <p className="text-ink-muted">or drop file here</p>
        <p className={hintClass}>Accepted formats: PNG, JPG and SVG</p>
      </section>
      {error && <p className={errorHintClass}>{error}</p>}
    </div>
  )
}

function UrlPanel({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId()
  const [failedSrc, setFailedSrc] = useState('')
  const src = value.trim()
  const isValid = isSafeImageSrc(src)
  const error =
    src && !isValid ? 'Not a valid image URL' : src === failedSrc ? "Couldn't load this image" : ''

  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <label className={labelClass} htmlFor={id}>
          Image URL or data URL
        </label>
        <textarea
          id={id}
          className={cx(textareaClass, 'break-all font-mono text-xs')}
          rows={4}
          spellCheck={false}
          placeholder="https://… or data:image/png;base64,…"
          value={value}
          aria-invalid={!!error}
          onChange={(event) => onChange(event.target.value)}
        />
        <p className={error ? errorHintClass : hintClass}>
          {error || 'Images from other sites must allow cross-origin loading to appear in the PDF.'}
        </p>
      </div>
      {isValid && src !== failedSrc && (
        <div className="grid min-h-24 place-items-center rounded-xl border border-line border-dashed bg-surface-muted p-4">
          <img
            className="max-h-24 max-w-full object-contain"
            src={src}
            alt="Signature preview"
            crossOrigin="anonymous"
            onError={() => setFailedSrc(src)}
          />
        </div>
      )}
    </div>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const name = useId()
  return (
    <fieldset className="m-0 flex items-center gap-3 border-0 p-0">
      <legend className={cx(labelClass, 'float-left mr-1 p-0')}>Color</legend>
      {SIGNATURE_COLORS.map((color) => (
        <label key={color.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            className="peer sr-only"
            checked={value === color.value}
            onChange={() => onChange(color.value)}
          />
          <span
            className="block size-6 rounded-full ring-2 ring-transparent ring-offset-2 peer-checked:ring-ink-muted peer-focus-visible:outline-2 peer-focus-visible:outline-brand peer-focus-visible:outline-offset-4"
            style={{ backgroundColor: color.value }}
          />
          <span className="sr-only">{color.name}</span>
        </label>
      ))}
    </fieldset>
  )
}
