import type { CSSProperties } from 'react'
import { corsProxied } from './image'

interface Recipe {
  tint: readonly [number, number, number]
  grain: number
  blotch: number
  creases: number
  folds: number
  vignette: number
}

const RECIPES = {
  plain: undefined,
  smooth: { tint: [246, 245, 241], grain: 7, blotch: 5, creases: 0, folds: 0, vignette: 0 },
  crumpled: { tint: [243, 242, 238], grain: 8, blotch: 7, creases: 28, folds: 0, vignette: 6 },
  folded: { tint: [245, 244, 240], grain: 7, blotch: 5, creases: 4, folds: 2, vignette: 4 },
  aged: { tint: [241, 234, 214], grain: 9, blotch: 12, creases: 10, folds: 1, vignette: 22 },
} satisfies Record<string, Recipe | undefined>

const MAGNIFIC = 'https://img.magnific.com'
const ENVATO = 'https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX'
const ENVATO_QUERY =
  'w=500&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto'
const VECTEEZY = 'https://static.vecteezy.com/system/resources'

const PHOTOS = {
  'photo-crumpled-white': corsProxied(
    `${MAGNIFIC}/free-photo/white-crumpled-paper-texture-background_1373-162.jpg?w=740&q=80`,
  ),
  'photo-crumpled-cream': corsProxied(
    `${MAGNIFIC}/premium-photo/realistic-crumpled-paper-texture-background_712219-2735.jpg?w=740&q=80`,
  ),
  'photo-speckled': corsProxied(
    `${MAGNIFIC}/premium-photo/paper-texture-white-simple-minimalist-background_525160-1094.jpg?w=740&q=80`,
  ),
  'photo-handmade': `${ENVATO}/c9/11/3c/b0/94/v1_E10/E10D7SZE.jpg?${ENVATO_QUERY}&s=5b13ce0f79d6b909310c3a3ed1f6a13312c784ee42fc200e53298937f33a39a3`,
  'photo-old': corsProxied(
    `${MAGNIFIC}/premium-photo/old-paper-texture-background_118047-1383.jpg?w=740&q=80`,
  ),
  'photo-white-grain': corsProxied(
    `${MAGNIFIC}/premium-photo/white-paper-texture-background_525160-10594.jpg?w=740&q=80`,
  ),
  'photo-crumpled-grey': corsProxied(
    `${MAGNIFIC}/premium-psd/realistic-paper-stock-png-image_564384-2218.jpg?w=740&q=80`,
  ),
  'photo-folded-scan': corsProxied(
    `${MAGNIFIC}/premium-photo/realistic-paper-copy-scan-texture-photocopy-grunge-rough-black-distressed-film-noise-grain_1008660-1355.jpg?w=740&q=80`,
  ),
  'photo-crumpled-bright': `${VECTEEZY}/previews/035/220/461/non_2x/ai-generated-paper-texture-background-design-free-photo.jpg`,
  'photo-creased': `${VECTEEZY}/thumbnails/065/752/661/small/crumpled-paper-texture-background-free-photo.jpg`,
  'photo-crumpled-soft': `${ENVATO}/ea/d0/b4/57/f6/v1_E10/E102BZE2.jpg?${ENVATO_QUERY}&s=1b61dd7b723a746f33e40d885dd66ad8449623c869086193810114701c24ecef`,
}

export type PaperStyle = keyof typeof RECIPES | keyof typeof PHOTOS

export type PaperType = keyof typeof RECIPES | 'photo'

export interface Paper {
  paper: PaperStyle
  paperSeed: number
}

export const PAPER_TYPES: ReadonlyArray<{ value: PaperType; label: string }> = [
  { value: 'plain', label: 'Plain' },
  { value: 'smooth', label: 'Smooth thermal' },
  { value: 'crumpled', label: 'Crumpled' },
  { value: 'folded', label: 'Folded' },
  { value: 'aged', label: 'Aged' },
  { value: 'photo', label: 'Photo' },
]

export const PHOTO_DESIGNS: ReadonlyArray<{ value: keyof typeof PHOTOS; label: string }> = [
  { value: 'photo-crumpled-white', label: 'Crumpled white' },
  { value: 'photo-crumpled-cream', label: 'Crumpled cream' },
  { value: 'photo-crumpled-grey', label: 'Crumpled grey' },
  { value: 'photo-crumpled-bright', label: 'Crumpled bright' },
  { value: 'photo-crumpled-soft', label: 'Crumpled soft' },
  { value: 'photo-creased', label: 'Creased' },
  { value: 'photo-folded-scan', label: 'Folded scan' },
  { value: 'photo-speckled', label: 'Speckled' },
  { value: 'photo-handmade', label: 'Handmade' },
  { value: 'photo-white-grain', label: 'White grain' },
  { value: 'photo-old', label: 'Old paper' },
]

export function isPaperStyle(value: unknown): value is PaperStyle {
  return (
    typeof value === 'string' && (Object.hasOwn(RECIPES, value) || Object.hasOwn(PHOTOS, value))
  )
}

export function paperType(style: PaperStyle): PaperType {
  return style in PHOTOS ? 'photo' : (style as keyof typeof RECIPES)
}

const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]

export function paperOfType(type: PaperType): Paper {
  return {
    paper: type === 'photo' ? pick(PHOTO_DESIGNS).value : type,
    paperSeed: randomSeed(),
  }
}

// A different textured type from the current one, with a random design in it.
export function randomPaperType(current?: PaperStyle): Paper {
  const currentType = current && paperType(current)
  const types = PAPER_TYPES.filter(({ value }) => value !== 'plain' && value !== currentType)
  return paperOfType(pick(types).value)
}

// Keeps the type: another photo for photos, a new variation for generated paper.
export function randomPaperDesign(current: PaperStyle): Paper {
  if (paperType(current) !== 'photo') return { paper: current, paperSeed: randomSeed() }
  const others = PHOTO_DESIGNS.filter(({ value }) => value !== current)
  return { paper: pick(others).value, paperSeed: randomSeed() }
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

export function paperBackground(style: PaperStyle, seed: number): CSSProperties {
  if (style in PHOTOS) {
    return {
      backgroundImage: `url(${PHOTOS[style as keyof typeof PHOTOS]})`,
      backgroundSize: 'cover',
      backgroundPosition: `${seed % 101}% 50%`,
    }
  }
  const recipe = RECIPES[style as keyof typeof RECIPES]
  if (!recipe) return {}
  return { backgroundImage: `url(${texture(recipe, style, seed)})`, backgroundSize: '100% 100%' }
}

const WIDTH = 480
const HEIGHT = 1200
const cache = new Map<string, string>()

function texture(recipe: Recipe, style: string, seed: number): string {
  const key = `${style}:${seed}`
  let url = cache.get(key)
  if (url === undefined) {
    url = render(recipe, seed)
    cache.set(key, url)
  }
  return url
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function valueNoise(random: () => number, cell: number): Float32Array {
  const cols = Math.ceil(WIDTH / cell) + 2
  const rows = Math.ceil(HEIGHT / cell) + 2
  const grid = Float32Array.from({ length: cols * rows }, () => random() * 2 - 1)
  const out = new Float32Array(WIDTH * HEIGHT)
  const smooth = (t: number) => t * t * (3 - 2 * t)
  for (let y = 0; y < HEIGHT; y++) {
    const gy = y / cell
    const y0 = Math.floor(gy)
    const ty = smooth(gy - y0)
    for (let x = 0; x < WIDTH; x++) {
      const gx = x / cell
      const x0 = Math.floor(gx)
      const tx = smooth(gx - x0)
      const i = y0 * cols + x0
      const top = grid[i] + (grid[i + 1] - grid[i]) * tx
      const bottom = grid[i + cols] + (grid[i + cols + 1] - grid[i + cols]) * tx
      out[y * WIDTH + x] = top + (bottom - top) * ty
    }
  }
  return out
}

interface Crease {
  px: number
  py: number
  ux: number
  uy: number
  length: number
  fade: number
  width: number
  strength: number
}

function makeCreases(random: () => number, recipe: Recipe): Crease[] {
  const creases: Crease[] = []
  for (let i = 0; i < recipe.creases; i++) {
    const angle = random() * Math.PI
    creases.push({
      px: random() * WIDTH,
      py: random() * HEIGHT,
      ux: Math.cos(angle),
      uy: Math.sin(angle),
      length: 60 + random() * 260,
      fade: 40 + random() * 80,
      width: 2 + random() * 6,
      strength: (4 + random() * 7) * (random() < 0.5 ? -1 : 1),
    })
  }
  for (let i = 0; i < recipe.folds; i++) {
    const angle = (random() - 0.5) * 0.06
    creases.push({
      px: WIDTH / 2,
      py: HEIGHT * (0.25 + random() * 0.5),
      ux: Math.cos(angle),
      uy: Math.sin(angle),
      length: WIDTH,
      fade: 1,
      width: 5 + random() * 5,
      strength: (9 + random() * 6) * (random() < 0.5 ? -1 : 1),
    })
  }
  return creases
}

function creaseShade(creases: Crease[], x: number, y: number): number {
  let shade = 0
  for (const c of creases) {
    const dx = x - c.px
    const dy = y - c.py
    const along = Math.abs(dx * c.ux + dy * c.uy)
    if (along > c.length + c.fade) continue
    const across = dx * -c.uy + dy * c.ux
    const distance = Math.abs(across)
    if (distance > c.width * 8) continue
    const reach = along < c.length ? 1 : 1 - (along - c.length) / c.fade
    const ridge = Math.sign(across) * Math.exp(-distance / c.width)
    const line = Math.exp(-distance / (c.width * 0.2))
    shade += reach * c.strength * (ridge - 0.5 * Math.abs(line))
  }
  return shade
}

function render(recipe: Recipe, seed: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  if (!context) return ''

  const random = mulberry32(seed)
  const coarse = valueNoise(random, 260)
  const medium = valueNoise(random, 90)
  const fine = valueNoise(random, 18)
  const creases = makeCreases(random, recipe)
  const image = context.createImageData(WIDTH, HEIGHT)
  const [r, g, b] = recipe.tint

  for (let y = 0; y < HEIGHT; y++) {
    const ny = (y / HEIGHT) * 2 - 1
    for (let x = 0; x < WIDTH; x++) {
      const i = y * WIDTH + x
      const nx = (x / WIDTH) * 2 - 1
      const blotch = coarse[i] + 0.5 * medium[i] + 0.25 * fine[i]
      const edge = Math.max(nx * nx, ny * ny) ** 3
      const light =
        (random() - 0.5) * recipe.grain +
        blotch * recipe.blotch +
        creaseShade(creases, x, y) -
        edge * recipe.vignette
      const o = i * 4
      image.data[o] = r + light
      image.data[o + 1] = g + light
      image.data[o + 2] = b + light * 1.1
      image.data[o + 3] = 255
    }
  }

  context.putImageData(image, 0, 0)
  return canvas.toDataURL('image/jpeg', 0.85)
}
