import { ImageIcon, Upload, X } from 'lucide-react'
import { useId, useState } from 'react'
import { cx } from '../../lib/cx'
import { isSafeImageSrc, readFileAsDataUrl } from '../../lib/image'
import { buttonClass } from '../ui'
import {
  errorHintClass,
  fieldClass,
  hintClass,
  inputClass,
  labelClass,
  wideFieldClass,
} from './styles'

const UPLOAD_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
const MAX_UPLOAD_BYTES = 1024 * 1024

interface ImageFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ImageField({ label, value, onChange }: ImageFieldProps) {
  const id = useId()
  const [uploadError, setUploadError] = useState('')
  const [failedSrc, setFailedSrc] = useState('')
  const src = value.trim()
  const isUpload = src.startsWith('data:')
  const isValid = isSafeImageSrc(src)
  const error =
    uploadError ||
    (src && !isValid
      ? 'Not a valid image URL'
      : src === failedSrc
        ? "Couldn't load this image"
        : '')

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!UPLOAD_TYPES.includes(file.type))
      return setUploadError('Use a PNG, JPG, WebP or SVG image.')
    if (file.size > MAX_UPLOAD_BYTES) return setUploadError('Use an image under 1 MB.')
    setUploadError('')
    onChange(await readFileAsDataUrl(file))
  }

  return (
    <div className={cx(fieldClass, wideFieldClass)}>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-line-strong bg-surface-muted">
          {isValid && src !== failedSrc ? (
            <img
              className="max-h-full max-w-full object-contain"
              src={src}
              alt=""
              crossOrigin="anonymous"
              onError={() => setFailedSrc(src)}
            />
          ) : (
            <ImageIcon className="size-5 text-ink-muted" aria-hidden="true" />
          )}
        </span>
        <input
          id={id}
          className={inputClass}
          spellCheck={false}
          placeholder={isUpload ? 'Uploaded image' : 'https://…'}
          value={isUpload ? '' : value}
          aria-invalid={!!error}
          onChange={(event) => {
            setUploadError('')
            onChange(event.target.value)
          }}
        />
        <label className={cx(buttonClass('ghost'), 'h-11')} title="Upload image">
          <Upload className="size-4" aria-hidden="true" />
          Upload
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
        <button
          type="button"
          className={cx(buttonClass('ghost'), 'h-11')}
          onClick={() => {
            setUploadError('')
            onChange('')
          }}
          disabled={!src}
          aria-label={`Remove ${label.toLowerCase()}`}
          title="Remove"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p className={error ? errorHintClass : hintClass}>
        {error || 'Images from other sites must allow cross-origin loading to appear in the PDF.'}
      </p>
    </div>
  )
}
