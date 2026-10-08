import { useId } from 'react'
import { cx } from '../../lib/cx'
import { isSafeImageSrc } from '../../lib/image'
import { buttonClass } from '../ui'
import {
  actionsClass,
  errorHintClass,
  fieldClass,
  hintClass,
  labelClass,
  textareaClass,
  wideFieldClass,
} from './styles'

interface ImageSourceFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  defaultValue?: string
}

export function ImageSourceField({ label, value, onChange, defaultValue }: ImageSourceFieldProps) {
  const id = useId()
  const isInvalid = value.trim() !== '' && !isSafeImageSrc(value.trim())

  function handleUpload(file: File | undefined) {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={cx(fieldClass, wideFieldClass)}>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className={cx(textareaClass, 'break-all font-mono text-xs')}
        rows={2}
        spellCheck={false}
        placeholder="https://… or data:image/png;base64,…"
        value={value}
        aria-invalid={isInvalid}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className={actionsClass}>
        <span className={cx(isInvalid ? errorHintClass : hintClass, 'mr-auto')}>
          {isInvalid ? 'Not a valid image URL' : 'Image URL, data URL or upload'}
        </span>
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
        {defaultValue !== undefined && (
          <button
            type="button"
            className={buttonClass('ghost')}
            onClick={() => onChange(defaultValue)}
            disabled={value === defaultValue}
          >
            Default
          </button>
        )}
        <button
          type="button"
          className={buttonClass('ghost')}
          onClick={() => onChange('')}
          disabled={!value}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
