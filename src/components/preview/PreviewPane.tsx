import { type ReactNode, useEffect, useRef, useState } from 'react'
import { downloadPdf } from '../../lib/pdf'
import { Panel } from '../Panel'
import { PAPER_WIDTH_PX } from './Paper'

interface PreviewPaneProps {
  fileName: string
  children: ReactNode
}

export function PreviewPane({ fileName, children }: PreviewPaneProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const observer = new ResizeObserver(([entry]) => {
      setZoom(Math.min(1, entry.contentRect.width / PAPER_WIDTH_PX))
    })
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  async function handleDownload() {
    if (!pagesRef.current) return
    setIsExporting(true)
    try {
      await downloadPdf(pagesRef.current, fileName)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Panel
      title="Live Preview"
      className="preview-pane"
      actions={
        <button
          type="button"
          className="button button--primary"
          onClick={handleDownload}
          disabled={isExporting}
        >
          {isExporting ? 'Preparing…' : 'Download PDF'}
        </button>
      }
    >
      <div className="preview-pane__viewport" ref={viewportRef}>
        <div className="preview-pane__pages" ref={pagesRef} style={{ zoom }}>
          {children}
        </div>
      </div>
    </Panel>
  )
}
