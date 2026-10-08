import type { BillEntry } from '../bills/types'

interface BillTypePickerProps {
  bills: BillEntry[]
  activeId: string
  onSelect: (id: string) => void
}

export function BillTypePicker({ bills, activeId, onSelect }: BillTypePickerProps) {
  return (
    <nav className="bill-picker" aria-label="Bill type">
      <div className="container">
        <ul className="bill-picker__list">
          {bills.map((bill) => {
            const isActive = bill.id === activeId
            return (
              <li key={bill.id}>
                <button
                  type="button"
                  className="pill"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onSelect(bill.id)}
                >
                  <span className="pill__emoji" aria-hidden="true">
                    {bill.emoji}
                  </span>
                  {bill.name}
                  {bill.isNew && <span className="pill__badge">New</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
