export const PDF_PAGE_ATTR = 'data-pdf-page'

const A4_MM = { width: 210, height: 297 }

export async function downloadPdf(root: HTMLElement, fileName: string) {
  const pages = Array.from(root.querySelectorAll<HTMLElement>(`[${PDF_PAGE_ATTR}]`))
  if (pages.length === 0) return

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ])

  // Render unzoomed clones so the preview's on-screen zoom never affects the output.
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-100000px;top:0;pointer-events:none;'
  document.body.appendChild(host)

  try {
    await document.fonts.ready
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })

    for (const [index, page] of pages.entries()) {
      const clone = page.cloneNode(true) as HTMLElement
      host.replaceChildren(clone)
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })
      if (index > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, A4_MM.width, A4_MM.height)
    }

    pdf.save(`${fileName}.pdf`)
  } finally {
    host.remove()
  }
}
