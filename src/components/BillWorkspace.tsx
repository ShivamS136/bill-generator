import { useCallback } from 'react'
import type { BillEntry, BillModule } from '../bills/types'
import { useDownload } from '../hooks/useDownload'
import { usePersistentState } from '../hooks/usePersistentState'
import type { ExportFormat } from '../lib/export'
import { Panel } from './Panel'
import { PreviewPane } from './preview/PreviewPane'
import { buttonClass, linkClass } from './ui'

export function BillWorkspace({ bill }: { bill: BillEntry }) {
  if (!bill.module) return <ComingSoon bill={bill} />
  return <ActiveBill bill={bill} module={bill.module} />
}

function ActiveBill<T>({ bill, module }: { bill: BillEntry; module: BillModule<T> }) {
  const { Form, Preview, initialData, fileName, normalize, exportFormat, previewSize } = module
  const [data, setData] = usePersistentState(`bill:${bill.id}`, initialData, normalize)
  const handleChange = useCallback(
    (patch: Partial<T>) => setData((prev) => ({ ...prev, ...patch })),
    [setData],
  )
  const format = exportFormat?.(data) ?? 'pdf'
  const { pagesRef, isExporting, download } = useDownload(fileName?.(data) ?? bill.id, format)
  const downloadButton = (
    <DownloadButton format={format} isExporting={isExporting} onClick={download} />
  )

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <Panel
        title={`${bill.emoji} ${bill.name}`}
        footer={
          <>
            <p className="mr-auto text-ink-muted text-xs">
              By downloading, you agree to the{' '}
              <a className={linkClass} href="#/terms">
                Terms of Use
              </a>
              .
            </p>
            {downloadButton}
          </>
        }
      >
        <Form data={data} onChange={handleChange} />
      </Panel>
      <div className="lg:sticky lg:top-22 lg:h-sticky-preview">
        <PreviewPane pagesRef={pagesRef} actions={downloadButton} size={previewSize}>
          <Preview data={data} onChange={handleChange} />
        </PreviewPane>
      </div>
    </div>
  )
}

interface DownloadButtonProps {
  format: ExportFormat
  isExporting: boolean
  onClick: () => void
}

function DownloadButton({ format, isExporting, onClick }: DownloadButtonProps) {
  return (
    <button
      type="button"
      className={buttonClass('primary')}
      onClick={onClick}
      disabled={isExporting}
    >
      {isExporting ? 'Preparing…' : `Download ${format.toUpperCase()}`}
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
