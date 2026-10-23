import { type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../../lib/cx'
import { PDF_IGNORE_ATTR, PDF_PAGE_ATTR, pageBreaks } from '../../lib/export'

export const PAPER_WIDTH_PX = 794
export const PAPER_HEIGHT_PX = 1123

interface PaperProps {
  children: ReactNode
  className?: string
  // Grows past one page; the PDF export splits it into A4 pages.
  flow?: boolean
}

export function Paper({ children, className, flow }: PaperProps) {
  const ref = useRef<HTMLElement>(null)
  const breaks = usePageBreaks(ref, flow)

  return (
    <article
      ref={ref}
      className={cx(
        'relative w-a4-width shrink-0 bg-white text-neutral-900 shadow-paper',
        flow ? 'min-h-a4-height' : 'h-a4-height overflow-hidden',
        className,
      )}
      {...{ [PDF_PAGE_ATTR]: '' }}
    >
      {children}
      {breaks.map((top) => (
        <div
          key={top}
          className="pointer-events-none absolute inset-x-0 border-sky-500/70 border-t border-dashed"
          style={{ top }}
          {...{ [PDF_IGNORE_ATTR]: '' }}
        />
      ))}
    </article>
  )
}

function usePageBreaks(ref: RefObject<HTMLElement | null>, enabled = false): number[] {
  const [breaks, setBreaks] = useState<number[]>([])

  useLayoutEffect(() => {
    const sheet = ref.current
    const update = () => {
      const next = sheet && enabled ? pageBreaks(sheet).slice(1) : []
      setBreaks((current) => (current.join() === next.join() ? current : next))
    }
    if (!sheet || !enabled) return update()
    update()
    const observer = new ResizeObserver(update)
    for (const child of sheet.children) observer.observe(child)
    observer.observe(sheet)
    return () => observer.disconnect()
  })

  return breaks
}
