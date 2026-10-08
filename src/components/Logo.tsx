export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M7 3h18a2 2 0 0 1 2 2v24l-3.33-2-3.34 2L17 27l-3.33 2-3.34-2L7 29l-2-1.2V5a2 2 0 0 1 2-2Z"
        fill="var(--color-brand)"
      />
      <path d="M10 9h12M10 13.5h12M10 18h7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="21.5" cy="20.5" r="3.5" fill="var(--color-accent)" />
    </svg>
  )
}

export function Logo({ name }: { name: string }) {
  return (
    <a className="logo" href="#/" aria-label={`${name} home`}>
      <LogoMark />
      <span className="logo__text">{name}</span>
    </a>
  )
}
