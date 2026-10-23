const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

export interface ColourPreset {
  label: string
  value: string
}

export function parseHexColour(value: unknown): string | undefined {
  const match = typeof value === 'string' ? HEX.exec(value.trim()) : null
  if (!match) return undefined
  const digits = match[1].length === 3 ? [...match[1]].map((c) => c + c).join('') : match[1]
  return `#${digits.toLowerCase()}`
}

// WCAG relative luminance: 0 for black, 1 for white.
export function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
