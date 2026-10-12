import { Eye, EyeOff, Pencil, Signature as SignatureIcon } from 'lucide-react'
import { useState } from 'react'
import { cx } from '../../lib/cx'
import { hasSignatureContent, type Signature } from '../../lib/signature'
import { SignatureDialog } from '../signature/SignatureDialog'
import { SignatureMark } from '../signature/SignatureMark'
import { fieldClass, hintClass, wideFieldClass } from './styles'

interface SignatureInputProps {
  label: string
  value: Signature
  defaultText: string
  onChange: (value: Signature) => void
}

export function SignatureInput({ label, value, defaultText, onChange }: SignatureInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const open = () => setIsEditing(true)
  const hasContent = hasSignatureContent(value)
  const isHidden = !!value.hidden
  const VisibilityIcon = isHidden ? Eye : EyeOff
  const visibilityLabel = isHidden ? 'Show on receipt' : 'Hide from receipt'

  return (
    <div className={cx(fieldClass, wideFieldClass)}>
      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-line-strong bg-surface-muted p-2.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand text-white">
          <SignatureIcon className="size-6" aria-hidden="true" />
        </span>
        <button
          type="button"
          onClick={open}
          aria-label={`Edit ${label.toLowerCase()}`}
          className="flex min-h-20 min-w-0 flex-1 cursor-pointer flex-col rounded-lg border border-line-strong border-dashed bg-surface px-3 py-2 text-left transition-colors hover:border-brand"
        >
          <span className="font-semibold text-brand text-xs">{label}</span>
          <span className="flex min-h-12 flex-1 items-center justify-center overflow-hidden">
            {hasContent ? (
              <SignatureMark
                value={value}
                alt={label}
                textClassName="text-3xl"
                imageClassName="max-h-12 max-w-full"
              />
            ) : (
              <span className={hintClass}>Not set</span>
            )}
          </span>
        </button>
        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            onClick={open}
            aria-label={`Change ${label.toLowerCase()}`}
            title="Edit signature"
            className="grid size-9 cursor-pointer place-items-center rounded-lg text-brand transition-colors hover:bg-brand-soft"
          >
            <Pencil className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, hidden: !isHidden })}
            disabled={!hasContent}
            aria-label={`${visibilityLabel}: ${label.toLowerCase()}`}
            title={visibilityLabel}
            className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-muted transition-colors hover:not-disabled:bg-brand-soft hover:not-disabled:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <VisibilityIcon className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      {isEditing && (
        <SignatureDialog
          title={label}
          value={value}
          defaultText={defaultText}
          onClose={() => setIsEditing(false)}
          onApply={(next) => {
            onChange(isHidden ? { ...next, hidden: true } : next)
            setIsEditing(false)
          }}
        />
      )}
    </div>
  )
}
