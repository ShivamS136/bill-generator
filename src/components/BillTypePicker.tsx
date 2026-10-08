import type { BillEntry } from '../bills/types'
import { cx } from '../lib/cx'
import { container } from './ui'

interface BillTypePickerProps {
  bills: BillEntry[]
  activeId: string
  onSelect: (id: string) => void
}

export function BillTypePicker({ bills, activeId, onSelect }: BillTypePickerProps) {
  return (
    <nav className="border-line border-b bg-surface" aria-label="Bill type">
      <div className={container}>
        <ul className="-mx-4 flex snap-x snap-proximity gap-2.5 overflow-x-auto px-4 py-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {bills.map((bill) => {
            const isActive = bill.id === activeId
            return (
              <li key={bill.id} className="flex-none snap-start">
                <button
                  type="button"
                  className={cx(
                    'inline-flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm transition-colors',
                    isActive
                      ? 'border-brand bg-brand-soft font-semibold text-brand'
                      : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-muted',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onSelect(bill.id)}
                >
                  <span className="text-lg" aria-hidden="true">
                    {bill.emoji}
                  </span>
                  {bill.name}
                  {bill.isNew && (
                    <span className="rounded-full bg-brand px-2 py-px font-bold text-white text-xs uppercase">
                      New
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
