import type { ReactNode } from 'react'

interface PanelProps {
  title: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, actions, children, className }: PanelProps) {
  return (
    <section className={['panel', className].filter(Boolean).join(' ')}>
      <header className="panel__header">
        <h2 className="panel__title">{title}</h2>
        {actions && <div className="panel__actions">{actions}</div>}
      </header>
      <div className="panel__body">{children}</div>
    </section>
  )
}
