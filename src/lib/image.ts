const IMAGE_DATA_URL = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[a-z0-9+/]+=*$/i

export function isImageDataUrl(value: unknown): value is string {
  return typeof value === 'string' && IMAGE_DATA_URL.test(value)
}

export function isSafeImageSrc(value: unknown): value is string {
  if (isImageDataUrl(value)) return true
  if (typeof value !== 'string' || !value) return false
  try {
    const { protocol } = new URL(value, window.location.href)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

export function publicAssetUrl(path: string): string {
  if (!path || /^([a-z][a-z\d+.-]*:|\/)/i.test(path)) return path
  return `${import.meta.env.BASE_URL}${path}`
}
