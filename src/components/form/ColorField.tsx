import { useId } from 'react'
import { type ColourPreset, parseHexColour } from '../../lib/colour'
import { cx } from '../../lib/cx'
import { errorHintClass, fieldClass, inputClass, labelClass } from './styles'

interface ColorFieldProps {
  label: string
  value: string
  presets: readonly ColourPreset[]
  onChange: (value: string) => void
}

export function ColorField({ label, value, presets, onChange }: ColorFieldProps) {
  const id = useId()
  const colour = parseHexColour(value)

  return (
    <div className={cx(fieldClass, 'content-start')}>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-line-strong bg-surface-muted p-1"
          value={colour ?? '#000000'}
          aria-label={`${label} picker`}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          id={id}
          className={cx(inputClass, 'font-mono uppercase')}
          spellCheck={false}
          maxLength={7}
          placeholder="#RRGGBB"
          value={value}
          aria-invalid={!colour}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line-strong bg-surface px-2.5 py-1 text-xs hover:bg-surface-muted aria-pressed:border-brand aria-pressed:bg-brand-soft"
            aria-pressed={colour === parseHexColour(preset.value)}
            onClick={() => onChange(preset.value)}
          >
            <span
              className="size-3.5 rounded-full border border-black/15"
              style={{ backgroundColor: preset.value }}
            />
            {preset.label}
          </button>
        ))}
      </div>
      {!colour && <p className={errorHintClass}>Use a hex code such as #FD940E</p>}
    </div>
  )
}
