import { type ReactNode, useId } from 'react'

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
    <div className={wide ? 'field field--wide' : 'field'}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="field__required"> *</span>}
      </label>
      {children}
      {hint && <p className="field__hint">{hint}</p>}
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
        className="input"
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
        className="input input--textarea"
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
        className="input input--select"
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

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="field-grid">{children}</div>
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="form-section">
      <legend className="form-section__title">{title}</legend>
      {children}
    </fieldset>
  )
}
