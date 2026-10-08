import { bills, defaultBill, findBill } from './bills/registry'
import { BillTypePicker } from './components/BillTypePicker'
import { BillWorkspace } from './components/BillWorkspace'
import { GitHubStarButton } from './components/GitHubStarButton'
import { Header } from './components/Header'
import { container } from './components/ui'
import { env } from './env'
import { useHashRoute } from './hooks/useHashRoute'
import { findLegalDoc, legalDocs } from './legal/documents'
import { LegalPage } from './legal/LegalPage'
import { cx } from './lib/cx'

export default function App() {
  const [route, navigate] = useHashRoute()
  const legalDoc = findLegalDoc(route)
  const bill = findBill(route) ?? defaultBill

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      {legalDoc ? (
        <main className={cx(container, 'flex-1 pt-8 pb-12')}>
          <LegalPage doc={legalDoc} />
        </main>
      ) : (
        <>
          <BillTypePicker bills={bills} activeId={bill.id} onSelect={navigate} />
          <main className={cx(container, 'flex-1 pt-6 pb-10')}>
            <BillWorkspace key={bill.id} bill={bill} />
          </main>
        </>
      )}
      <footer className="border-line border-t bg-surface py-5 text-ink-muted text-sm">
        <div
          className={cx(
            container,
            'flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left',
          )}
        >
          <div className="grid gap-2">
            <p>
              Everything stays in your browser. Nothing is uploaded. For genuine records and mock
              use only — you are responsible for how you use it.
            </p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 sm:justify-start">
                {legalDocs.map((doc) => (
                  <li key={doc.id}>
                    <a className="font-medium text-ink hover:text-brand" href={`#/${doc.id}`}>
                      {doc.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <GitHubStarButton repo={env.githubRepo} />
        </div>
      </footer>
    </div>
  )
}
