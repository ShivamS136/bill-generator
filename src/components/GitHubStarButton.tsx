import { render } from 'github-buttons'
import { useEffect, useRef } from 'react'

export function GitHubStarButton({ repo }: { repo: string }) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let active = true
    render(
      {
        href: `https://github.com/${repo}`,
        'data-icon': 'octicon-star',
        'data-size': 'large',
        'data-show-count': true,
        'data-text': repo,
        'aria-label': `Star ${repo} on GitHub`,
      },
      (button) => {
        if (active) container.replaceChildren(button)
      },
    )
    return () => {
      active = false
      container.replaceChildren()
    }
  }, [repo])

  return <span ref={containerRef} className="inline-flex h-7 items-center" />
}
