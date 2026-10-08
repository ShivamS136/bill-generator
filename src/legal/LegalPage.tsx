import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { env } from '../env'
import { cx } from '../lib/cx'
import { LAST_UPDATED, type LegalDoc, legalDocs } from './documents'

export function LegalPage({ doc }: { doc: LegalDoc }) {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${doc.title} · ${env.appName}`
    return () => {
      document.title = env.appName
    }
  }, [doc])

  return (
    <div className="grid items-start gap-6 lg:grid-cols-4">
      <nav className="grid gap-1 lg:sticky lg:top-22" aria-label="Legal">
        <a
          className="mb-2 inline-flex items-center gap-1.5 font-medium text-ink-muted text-sm hover:text-ink"
          href="#/"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to generator
        </a>
        <ul className="flex flex-wrap gap-1 lg:grid">
          {legalDocs.map((item) => {
            const isActive = item.id === doc.id
            return (
              <li key={item.id}>
                <a
                  className={cx(
                    'block rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-brand-soft font-semibold text-brand'
                      : 'text-ink hover:bg-surface',
                  )}
                  href={`#/${item.id}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.title}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
      <article className="grid gap-8 rounded-xl border border-line bg-surface p-6 shadow-panel md:p-10 lg:col-span-3">
        <header className="grid gap-2">
          <h1 className="font-bold text-3xl tracking-tight">{doc.title}</h1>
          <p className="text-ink-muted text-sm">Last updated: {LAST_UPDATED}</p>
        </header>
        <p className="rounded-lg border-brand border-l-4 bg-brand-soft px-4 py-3 font-medium leading-relaxed">
          {doc.summary}
        </p>
        {doc.sections.map((section, index) => (
          <section key={section.heading} className="grid gap-3">
            <h2 className="font-semibold text-xl">
              {index + 1}. {section.heading}
            </h2>
            {section.content}
          </section>
        ))}
      </article>
    </div>
  )
}
