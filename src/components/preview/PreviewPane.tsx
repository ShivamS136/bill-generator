import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react'
import { Panel } from '../Panel'
import { PAPER_HEIGHT_PX, PAPER_WIDTH_PX } from './Paper'

const FIT_HEIGHT_QUERY = '(min-width: 1024px)'

interface PreviewPaneProps {
  pagesRef: RefObject<HTMLDivElement | null>
  actions?: ReactNode
  children: ReactNode
}

export function PreviewPane({ pagesRef, actions, children }: PreviewPaneProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const fitHeight = window.matchMedia(FIT_HEIGHT_QUERY)
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const byWidth = width / PAPER_WIDTH_PX
      setZoom(
        Math.min(1, fitHeight.matches ? Math.min(byWidth, height / PAPER_HEIGHT_PX) : byWidth),
      )
    })
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  return (
    <Panel
      title="Live Preview"
      className="h-full"
      bodyClassName="relative bg-surface-muted"
      actions={actions}
    >
      <div className="lg:absolute lg:inset-0 lg:overflow-y-auto lg:p-2" ref={viewportRef}>
        <div className="mx-auto flex w-fit flex-col gap-6" ref={pagesRef} style={{ zoom }}>
          {children}
        </div>
      </div>
    </Panel>
  )
}
