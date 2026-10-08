import { useCallback } from 'react'
import type { BillEntry, BillModule } from '../bills/types'
import { usePdfDownload } from '../hooks/usePdfDownload'
import { usePersistentState } from '../hooks/usePersistentState'
import { Panel } from './Panel'
import { PreviewPane } from './preview/PreviewPane'
import { buttonClass } from './ui'

export function BillWorkspace({ bill }: { bill: BillEntry }) {
  if (!bill.module) return <ComingSoon bill={bill} />
  return <ActiveBill bill={bill} module={bill.module} />
}

function ActiveBill<T>({ bill, module }: { bill: BillEntry; module: BillModule<T> }) {
  const { Form, Preview, initialData, fileName, normalize } = module
  const [data, setData] = usePersistentState(`bill:${bill.id}`, initialData, normalize)
  const handleChange = useCallback(
    (patch: Partial<T>) => setData((prev) => ({ ...prev, ...patch })),
    [setData],
  )
  const { pagesRef, isExporting, download } = usePdfDownload(fileName?.(data) ?? bill.id)
  const downloadButton = <DownloadButton isExporting={isExporting} onClick={download} />

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <Panel title={`${bill.emoji} ${bill.name}`} footer={downloadButton}>
        <Form data={data} onChange={handleChange} />
      </Panel>
      <div className="lg:sticky lg:top-22 lg:h-sticky-preview">
        <PreviewPane pagesRef={pagesRef} actions={downloadButton}>
          <Preview data={data} onChange={handleChange} />
        </PreviewPane>
      </div>
    </div>
  )
}

function DownloadButton({ isExporting, onClick }: { isExporting: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={buttonClass('primary')}
      onClick={onClick}
      disabled={isExporting}
    >
      {isExporting ? 'Preparing…' : 'Download PDF'}
    </button>
  )
}

function ComingSoon({ bill }: { bill: BillEntry }) {
  return (
    <div className="grid justify-items-center gap-2 rounded-xl border border-line-strong border-dashed bg-surface px-6 py-16 text-center text-ink-muted">
      <span className="text-4xl" aria-hidden="true">
        {bill.emoji}
      </span>
      <h2 className="font-bold text-ink text-xl">{bill.name} is coming soon</h2>
      <p>This bill type hasn't been built yet. Pick another one from the list above.</p>
    </div>
  )
}
