export const fieldClass = 'grid min-w-0 gap-1.5'
export const wideFieldClass = 'col-span-full'
export const labelClass = 'text-sm font-medium'
export const hintClass = 'text-xs text-ink-muted'
export const errorHintClass = 'text-xs text-danger'
export const actionsClass = 'flex flex-wrap items-center gap-2'

const inputBase =
  'w-full rounded-lg border border-line-strong bg-surface-muted px-3 transition-colors placeholder:text-placeholder hover:border-ink-muted focus:border-brand focus:bg-surface focus:ring-3 focus:ring-brand-soft focus:outline-none aria-invalid:border-danger'

export const inputClass = `${inputBase} h-11`
export const textareaClass = `${inputBase} min-h-18 resize-y py-2.5`
