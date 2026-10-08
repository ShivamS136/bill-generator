import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { readJson, writeJson } from '../lib/storage'

export function usePersistentState<T>(
  key: string,
  initial: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const fallback = initial()
    const stored = readJson<T>(key)
    if (stored === undefined) return fallback
    if (isPlainObject(fallback) && isPlainObject(stored)) return { ...fallback, ...stored }
    return stored
  })

  useEffect(() => {
    writeJson(key, state)
  }, [key, state])

  return [state, setState]
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
