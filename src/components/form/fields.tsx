import { type ReactNode, useId } from 'react'
import { cx } from '../../lib/cx'
import {
  fieldClass,
  hintClass,
  inputClass,
  labelClass,
  textareaClass,
  wideFieldClass,
} from './styles'

interface FieldShellProps {
  id: string
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
  wide?: boolean
}

function FieldShell({ id, label, required, hint, children, wide }: FieldShellProps) {
  return (
    <div className={cx(fieldClass, wide && wideFieldClass)}>
      <label className={labelClass} htmlFor={id}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  )
}

interface BaseFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  hint?: string
  wide?: boolean
}

interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'number' | 'date' | 'month' | 'tel' | 'email'
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email'
  min?: number | string
  step?: number | string
}

export function TextField({
  label,
  value,
  onChange,
  required,
  hint,
  wide,
  ...input
}: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} wide={wide}>
      <input
        id={id}
        className={inputClass}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        {...input}
      />
    </FieldShell>
  )
}

export function AmountField(props: Omit<TextFieldProps, 'type' | 'inputMode' | 'min' | 'step'>) {
  return (
    <TextField type="number" inputMode="decimal" min={0} step="0.01" placeholder="0" {...props} />
  )
}

interface TextAreaFieldProps extends BaseFieldProps {
  rows?: number
}

export function TextAreaField({
  label,
  value,
  onChange,
  required,
  hint,
  wide = true,
  ...textarea
}: TextAreaFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} wide={wide}>
      <textarea
        id={id}
        className={textareaClass}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        {...textarea}
      />
    </FieldShell>
  )
}

interface SelectFieldProps extends Omit<BaseFieldProps, 'placeholder'> {
  options: ReadonlyArray<{ value: string; label: string }>
}

export function SelectField({
  label,
  value,
  onChange,
  required,
  hint,
  wide,
  options,
}: SelectFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} wide={wide}>
      <select
        id={id}
        className={inputClass}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

interface RangeFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  wide?: boolean
}

export function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  wide,
}: RangeFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={`${label}: ${value}${unit}`} wide={wide}>
      <input
        id={id}
        type="range"
        className="h-11 w-full cursor-pointer accent-brand"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value}${unit}`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </FieldShell>
  )
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 mb-7 min-w-0 border-0 p-0 last:mb-0">
      <legend className="mb-4 flex items-center gap-2.5 p-0 font-semibold text-xs uppercase tracking-wider before:h-4 before:w-1 before:rounded-sm before:bg-brand before:content-['']">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}
