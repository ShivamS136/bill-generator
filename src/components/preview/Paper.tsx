import type { ReactNode } from 'react'
import { PDF_PAGE_ATTR } from '../../lib/pdf'

export const PAPER_WIDTH_PX = 794

interface PaperProps {
  children: ReactNode
  className?: string
}

export function Paper({ children, className }: PaperProps) {
  return (
    <article
      className={['paper', className].filter(Boolean).join(' ')}
      {...{ [PDF_PAGE_ATTR]: '' }}
    >
      {children}
    </article>
  )
}
