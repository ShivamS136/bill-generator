export const PDF_PAGE_ATTR = 'data-pdf-page'
export const PDF_IGNORE_ATTR = 'data-pdf-ignore'
export const EXPORT_IMAGE_ATTR = 'data-export-image'
export const PDF_KEEP_ATTR = 'data-pdf-keep'

export type ExportFormat = 'pdf' | 'png' | 'jpeg'

const A4_MM = { width: 210, height: 297 }
const PAGE_MARGIN_PX = 20

// Where a sheet taller than A4 is cut into pages, in CSS px from its top. Each cut moves up to the
// top of any [data-pdf-keep] block it would split, and later pages leave room for a top margin.
export function pageBreaks(sheet: HTMLElement): number[] {
  const rect = sheet.getBoundingClientRect()
  if (!rect.height) return [0]
  const toCss = sheet.offsetHeight / rect.height
  const blocks = Array.from(sheet.querySelectorAll(`[${PDF_KEEP_ATTR}]`), (block) => {
    const { top, bottom } = block.getBoundingClientRect()
    return { top: (top - rect.top) * toCss, bottom: (bottom - rect.top) * toCss }
  })
  const pageHeight = (sheet.offsetWidth * A4_MM.height) / A4_MM.width
  const breaks = [0]
  let start = 0
  while (sheet.offsetHeight - start > pageHeight - (start ? PAGE_MARGIN_PX : 0)) {
    let end = start + pageHeight - PAGE_MARGIN_PX * (start ? 2 : 1)
    for (const block of blocks) {
      if (block.top > start && block.top < end && block.bottom > end) end = block.top
    }
    breaks.push(end)
    start = end
  }
  return breaks
}

function sliceIntoPages(sheet: HTMLElement, canvas: HTMLCanvasElement): HTMLCanvasElement[] {
  const scale = canvas.width / sheet.offsetWidth
  const breaks = pageBreaks(sheet)
  if (breaks.length === 1) return [canvas]
  const pageHeight = Math.round((canvas.width * A4_MM.height) / A4_MM.width)
  return breaks.map((from, index) => {
    const to = breaks[index + 1] ?? sheet.offsetHeight
    const page = document.createElement('canvas')
    page.width = canvas.width
    page.height = pageHeight
    const context = page.getContext('2d')
    if (!context) return page
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, page.width, page.height)
    const height = (to - from) * scale
    const y = index ? PAGE_MARGIN_PX * scale : 0
    context.drawImage(canvas, 0, from * scale, canvas.width, height, 0, y, canvas.width, height)
    return page
  })
}

// Renders unzoomed clones so the preview's on-screen zoom never affects the output.
async function withRenderer<R>(
  render: (draw: (element: HTMLElement, scale: number) => Promise<HTMLCanvasElement>) => Promise<R>,
): Promise<R> {
  const { default: html2canvas } = await import('html2canvas-pro')
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-100000px;top:0;pointer-events:none;'
  document.body.appendChild(host)
  try {
    await document.fonts.ready
    return await render((element, scale) => {
      const clone = element.cloneNode(true) as HTMLElement
      for (const ignored of clone.querySelectorAll(`[${PDF_IGNORE_ATTR}]`)) ignored.remove()
      host.replaceChildren(clone)
      return html2canvas(clone, { scale, backgroundColor: '#ffffff', useCORS: true })
    })
  } finally {
    host.remove()
  }
}

export async function downloadPdf(root: HTMLElement, fileName: string) {
  const sheets = Array.from(root.querySelectorAll<HTMLElement>(`[${PDF_PAGE_ATTR}]`))
  if (sheets.length === 0) return
  const { jsPDF } = await import('jspdf')

  await withRenderer(async (draw) => {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
    let first = true
    for (const sheet of sheets) {
      for (const canvas of sliceIntoPages(sheet, await draw(sheet, 2))) {
        if (!first) pdf.addPage()
        first = false
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, A4_MM.width, A4_MM.height)
      }
    }
    pdf.save(`${fileName}.pdf`)
  })
}

export type ImageFormat = Exclude<ExportFormat, 'pdf'>

const IMAGE_SCALE = 3

export const imageExtension = (format: ImageFormat) => (format === 'jpeg' ? 'jpg' : 'png')

function canvasToBlob(canvas: HTMLCanvasElement, format: ImageFormat): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode image'))),
      `image/${format}`,
      0.92,
    ),
  )
}

export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function downloadImage(root: HTMLElement, fileName: string, format: ImageFormat) {
  const target = root.querySelector<HTMLElement>(`[${EXPORT_IMAGE_ATTR}]`)
  if (!target) return
  const canvas = await withRenderer((draw) => draw(target, IMAGE_SCALE))
  saveBlob(await canvasToBlob(canvas, format), `${fileName}.${imageExtension(format)}`)
}

export interface ZipImage {
  fileName: string
  element: HTMLElement
}

// Captures each element as it is produced, so only one needs to be mounted at a time.
export async function downloadImageZip(
  images: AsyncIterable<ZipImage>,
  zipName: string,
  format: ImageFormat,
) {
  const { zipSync } = await import('fflate')
  const files: Record<string, Uint8Array> = {}
  await withRenderer(async (draw) => {
    for await (const { fileName, element } of images) {
      const blob = await canvasToBlob(await draw(element, IMAGE_SCALE), format)
      files[`${fileName}.${imageExtension(format)}`] = new Uint8Array(await blob.arrayBuffer())
    }
  })
  const zip = zipSync(files, { level: 0 })
  saveBlob(new Blob([zip], { type: 'application/zip' }), `${zipName}.zip`)
}
