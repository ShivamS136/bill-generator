import '@fontsource/alex-brush/400.css'
import '@fontsource/allura/400.css'
import '@fontsource/caveat/400.css'
import '@fontsource/cedarville-cursive/400.css'
import '@fontsource/dancing-script/400.css'
import '@fontsource/great-vibes/400.css'
import '@fontsource/handlee/400.css'
import '@fontsource/homemade-apple/400.css'
import '@fontsource/kristi/400.css'
import '@fontsource/la-belle-aurore/400.css'
import '@fontsource/marck-script/400.css'
import '@fontsource/reenie-beanie/400.css'
import '@fontsource/sacramento/400.css'
import '@fontsource/satisfy/400.css'
import '@fontsource/shadows-into-light/400.css'
import '@fontsource/zeyada/400.css'
import { cx } from '../../lib/cx'
import { isSafeImageSrc } from '../../lib/image'
import type { Signature, SignatureFont } from '../../lib/signature'

export function signatureFontStyle(font: SignatureFont, color: string) {
  return { fontFamily: `'${font}', cursive`, color }
}

interface SignatureMarkProps {
  value: Signature
  alt: string
  textClassName?: string
  imageClassName?: string
}

export function SignatureMark({ value, alt, textClassName, imageClassName }: SignatureMarkProps) {
  if (value.kind === 'text') {
    return (
      <span
        className={cx('block whitespace-nowrap px-1 leading-snug', textClassName)}
        style={signatureFontStyle(value.font, value.color)}
        role="img"
        aria-label={alt}
      >
        {value.text}
      </span>
    )
  }
  if (!isSafeImageSrc(value.src)) return null
  return (
    <img
      className={cx('block object-contain', imageClassName)}
      src={value.src}
      alt={alt}
      crossOrigin="anonymous"
      draggable={false}
    />
  )
}
