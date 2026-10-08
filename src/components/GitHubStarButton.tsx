import { useEffect, useState } from 'react'

const CACHE_KEY = 'bill-generator:github-stars'

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  )
}

function readCachedStars(): number | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw === null ? null : Number(raw)
  } catch {
    return null
  }
}

function useStarCount(repo: string) {
  const [stars, setStars] = useState<number | null>(readCachedStars)

  useEffect(() => {
    if (stars !== null) return
    const controller = new AbortController()
    fetch(`https://api.github.com/repos/${repo}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { stargazers_count?: number } | null) => {
        if (typeof data?.stargazers_count !== 'number') return
        setStars(data.stargazers_count)
        try {
          sessionStorage.setItem(CACHE_KEY, String(data.stargazers_count))
        } catch {}
      })
      .catch(() => {})
    return () => controller.abort()
  }, [repo, stars])

  return stars
}

const compact = new Intl.NumberFormat('en', { notation: 'compact' })

export function GitHubStarButton({ repo }: { repo: string }) {
  const stars = useStarCount(repo)

  return (
    <a
      className="star-button"
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noreferrer"
      aria-label={stars === null ? 'Star on GitHub' : `Star on GitHub, ${stars} stars`}
    >
      <span className="star-button__label">
        <GitHubIcon />
        <span>Star</span>
      </span>
      {stars !== null && (
        <span className="star-button__count">
          <StarIcon />
          {compact.format(stars)}
        </span>
      )}
    </a>
  )
}
