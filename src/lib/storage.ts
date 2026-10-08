export const STORAGE_PREFIX = 'bill-generator:v1:'

export function readJson<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    return raw === null ? undefined : (JSON.parse(raw) as T)
  } catch {
    return undefined
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {}
}
