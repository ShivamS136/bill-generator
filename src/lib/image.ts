const IMAGE_DATA_URL = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[a-z0-9+/]+=*$/i

export function isSafeImageSrc(value: unknown): value is string {
  if (typeof value !== 'string' || !value) return false
  if (IMAGE_DATA_URL.test(value)) return true
  try {
    const { protocol } = new URL(value, window.location.href)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      typeof reader.result === 'string' ? resolve(reader.result) : reject(reader.error)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
