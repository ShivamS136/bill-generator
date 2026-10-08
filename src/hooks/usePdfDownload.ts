import { useCallback, useRef, useState } from 'react'
import { downloadPdf } from '../lib/pdf'

export function usePdfDownload(fileName: string) {
  const pagesRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const download = useCallback(async () => {
    if (!pagesRef.current) return
    setIsExporting(true)
    try {
      await downloadPdf(pagesRef.current, fileName)
    } finally {
      setIsExporting(false)
    }
  }, [fileName])

  return { pagesRef, isExporting, download }
}
