import { bills, defaultBill, findBill } from './bills/registry'
import { BillTypePicker } from './components/BillTypePicker'
import { BillWorkspace } from './components/BillWorkspace'
import { GitHubStarButton } from './components/GitHubStarButton'
import { Header } from './components/Header'
import { container } from './components/ui'
import { env } from './env'
import { useHashRoute } from './hooks/useHashRoute'
import { cx } from './lib/cx'

export default function App() {
  const [route, navigate] = useHashRoute()
  const bill = findBill(route) ?? defaultBill

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <BillTypePicker bills={bills} activeId={bill.id} onSelect={navigate} />
      <main className={cx(container, 'flex-1 pt-6 pb-10')}>
        <BillWorkspace key={bill.id} bill={bill} />
      </main>
      <footer className="border-line border-t bg-surface py-5 text-ink-muted text-sm">
        <div
          className={cx(
            container,
            'flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left',
          )}
        >
          <p>Everything stays in your browser. Nothing is uploaded.</p>
          <GitHubStarButton repo={env.githubRepo} />
        </div>
      </footer>
    </div>
  )
}
