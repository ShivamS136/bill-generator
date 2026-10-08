import { useCallback, useSyncExternalStore } from 'react'

// Hash routing keeps deep links working on GitHub Pages without a 404 fallback.
function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function getRoute() {
  return window.location.hash.replace(/^#\/?/, '')
}

export function useHashRoute() {
  const route = useSyncExternalStore(subscribe, getRoute)
  const navigate = useCallback((path: string) => {
    window.location.hash = `/${path}`
  }, [])
  return [route, navigate] as const
}
