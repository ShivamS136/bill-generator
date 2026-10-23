import { useCallback, useRef, useState } from 'react'
import { downloadImage, downloadPdf, type ExportFormat } from '../lib/export'

export function useDownload(fileName: string, format: ExportFormat) {
  const pagesRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const download = useCallback(async () => {
    if (!pagesRef.current) return
    setIsExporting(true)
    try {
      if (format === 'pdf') await downloadPdf(pagesRef.current, fileName)
      else await downloadImage(pagesRef.current, fileName, format)
    } finally {
      setIsExporting(false)
    }
  }, [fileName, format])

  return { pagesRef, isExporting, download }
}
