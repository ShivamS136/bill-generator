import { bills, defaultBill, findBill } from './bills/registry'
import { BillTypePicker } from './components/BillTypePicker'
import { BillWorkspace } from './components/BillWorkspace'
import { Header } from './components/Header'
import { useHashRoute } from './hooks/useHashRoute'

export default function App() {
  const [route, navigate] = useHashRoute()
  const bill = findBill(route) ?? defaultBill

  return (
    <div className="app">
      <Header />
      <BillTypePicker bills={bills} activeId={bill.id} onSelect={navigate} />
      <main className="container main">
        <BillWorkspace key={bill.id} bill={bill} />
      </main>
      <footer className="footer">
        <div className="container">Everything stays in your browser. Nothing is uploaded.</div>
      </footer>
    </div>
  )
}
