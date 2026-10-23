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

// Hosts without CORS headers go through images.weserv.nl so the export can read the pixels.
export const corsProxied = (url: string) =>
  `https://images.weserv.nl/?url=${encodeURIComponent(url)}`

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      typeof reader.result === 'string' ? resolve(reader.result) : reject(reader.error)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const inkCache = new Map<string, Promise<string>>()

// Redraws an image as black ink whose opacity follows its darkness, so it takes on the paper colour.
export function toThermalInk(src: string): Promise<string> {
  let result = inkCache.get(src)
  if (!result) {
    result = new Promise((resolve) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) return resolve(src)
        context.drawImage(image, 0, 0)
        try {
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
          const { data } = pixels
          for (let i = 0; i < data.length; i += 4) {
            const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
            data[i + 3] = ((255 - luminance) * data[i + 3]) / 255
            data[i] = data[i + 1] = data[i + 2] = 20
          }
          context.putImageData(pixels, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        } catch {
          resolve(src)
        }
      }
      image.onerror = () => resolve(src)
      image.src = src
    })
    inkCache.set(src, result)
  }
  return result
}
