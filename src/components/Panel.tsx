import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

interface PanelProps {
  title: ReactNode
  actions?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function Panel({ title, actions, footer, children, className, bodyClassName }: PanelProps) {
  return (
    <section
      className={cx(
        'flex flex-col rounded-xl border border-line bg-surface shadow-panel',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-line border-b px-5 py-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        {actions && <div>{actions}</div>}
      </header>
      <div className={cx('min-h-0 flex-1 rounded-b-xl p-5 md:p-6', bodyClassName)}>{children}</div>
      {footer && (
        <footer className="flex flex-wrap items-center justify-end gap-2 border-line border-t px-5 py-4 md:px-6">
          {footer}
        </footer>
      )}
    </section>
  )
}
