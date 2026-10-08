import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { PDF_PAGE_ATTR } from '../../lib/pdf'

export const PAPER_WIDTH_PX = 794
export const PAPER_HEIGHT_PX = 1123

interface PaperProps {
  children: ReactNode
  className?: string
}

export function Paper({ children, className }: PaperProps) {
  return (
    <article
      className={cx(
        'relative h-a4-height w-a4-width shrink-0 overflow-hidden bg-white text-neutral-900 shadow-paper',
        className,
      )}
      {...{ [PDF_PAGE_ATTR]: '' }}
    >
      {children}
    </article>
  )
}
