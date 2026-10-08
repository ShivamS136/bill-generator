import { useCallback } from 'react'
import type { BillEntry, BillModule } from '../bills/types'
import { usePersistentState } from '../hooks/usePersistentState'
import { Panel } from './Panel'
import { PreviewPane } from './preview/PreviewPane'

export function BillWorkspace({ bill }: { bill: BillEntry }) {
  if (!bill.module) return <ComingSoon bill={bill} />
  return <ActiveBill bill={bill} module={bill.module} />
}

function ActiveBill<T>({ bill, module }: { bill: BillEntry; module: BillModule<T> }) {
  const { Form, Preview, initialData, fileName } = module
  const [data, setData] = usePersistentState(`bill:${bill.id}`, initialData)
  const handleChange = useCallback(
    (patch: Partial<T>) => setData((prev) => ({ ...prev, ...patch })),
    [setData],
  )

  return (
    <div className="workspace">
      <Panel title={`${bill.emoji} ${bill.name}`} className="workspace__form">
        <Form data={data} onChange={handleChange} />
      </Panel>
      <div className="workspace__preview">
        <PreviewPane fileName={fileName?.(data) ?? bill.id}>
          <Preview data={data} />
        </PreviewPane>
      </div>
    </div>
  )
}

function ComingSoon({ bill }: { bill: BillEntry }) {
  return (
    <div className="coming-soon">
      <span className="coming-soon__emoji" aria-hidden="true">
        {bill.emoji}
      </span>
      <h2>{bill.name} is coming soon</h2>
      <p>This bill type hasn't been built yet. Pick another one from the list above.</p>
    </div>
  )
}
