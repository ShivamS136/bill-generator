import { X } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef } from 'react'

interface DialogProps {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Dialog({ title, onClose, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-11/12 max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface p-0 text-ink shadow-xl backdrop:bg-neutral-900/50 open:flex"
    >
      <header className="flex items-center justify-between gap-4 border-line border-b px-5 py-4 md:px-6">
        <h2 id={titleId} className="font-bold text-xl">
          {title}
        </h2>
        <button
          type="button"
          className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink"
          aria-label="Close"
          onClick={() => ref.current?.close()}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">{children}</div>
      {footer && (
        <footer className="flex items-center justify-end gap-3 border-line border-t px-5 py-4 md:px-6">
          {footer}
        </footer>
      )}
    </dialog>
  )
}
