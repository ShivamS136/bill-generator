import { isSafeImageSrc } from './image'

export const SIGNATURE_FONTS = [
  'Reenie Beanie',
  'Caveat',
  'Homemade Apple',
  'Dancing Script',
  'Great Vibes',
  'Sacramento',
  'Cedarville Cursive',
  'Alex Brush',
  'Allura',
  'Handlee',
  'Kristi',
  'La Belle Aurore',
  'Marck Script',
  'Satisfy',
  'Zeyada',
  'Shadows Into Light',
] as const

export type SignatureFont = (typeof SIGNATURE_FONTS)[number]

export const DEFAULT_SIGNATURE_FONT: SignatureFont = 'Reenie Beanie'

export const SIGNATURE_COLORS = [
  { name: 'Black', value: '#1f2937' },
  { name: 'Blue', value: '#1d4ed8' },
  { name: 'Red', value: '#b91c1c' },
  { name: 'Green', value: '#15803d' },
] as const

const IMAGE_SOURCES = ['draw', 'upload', 'url'] as const

export type ImageSource = (typeof IMAGE_SOURCES)[number]

export interface TextSignature {
  kind: 'text'
  text: string
  font: SignatureFont
  color: string
}

export interface ImageSignature {
  kind: 'image'
  src: string
  source: ImageSource
}

export type Signature = TextSignature | ImageSignature

export function textSignature(
  text: string,
  font: SignatureFont = DEFAULT_SIGNATURE_FONT,
  color: string = SIGNATURE_COLORS[0].value,
): TextSignature {
  return { kind: 'text', text, font, color }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}.`)
    .join('')
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i

export function parseSignature(value: unknown, fallback: Signature): Signature {
  if (!value || typeof value !== 'object') return fallback
  const candidate = value as Record<string, unknown>
  if (
    candidate.kind === 'text' &&
    typeof candidate.text === 'string' &&
    SIGNATURE_FONTS.includes(candidate.font as SignatureFont) &&
    typeof candidate.color === 'string' &&
    HEX_COLOR.test(candidate.color)
  ) {
    return textSignature(candidate.text, candidate.font as SignatureFont, candidate.color)
  }
  if (
    candidate.kind === 'image' &&
    isSafeImageSrc(candidate.src) &&
    IMAGE_SOURCES.includes(candidate.source as ImageSource)
  ) {
    return { kind: 'image', src: candidate.src, source: candidate.source as ImageSource }
  }
  return fallback
}

export function isSignatureEmpty(signature: Signature): boolean {
  return signature.kind === 'text' ? !signature.text.trim() : !isSafeImageSrc(signature.src)
}
