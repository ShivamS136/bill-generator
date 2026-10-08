export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path
        className="fill-brand"
        d="M7 3h18a2 2 0 0 1 2 2v24l-3.33-2-3.34 2L17 27l-3.33 2-3.34-2L7 29l-2-1.2V5a2 2 0 0 1 2-2Z"
      />
      <path d="M10 9h12M10 13.5h12M10 18h7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle className="fill-accent" cx="21.5" cy="20.5" r="3.5" />
    </svg>
  )
}

export function Logo({ name }: { name: string }) {
  return (
    <a
      className="inline-flex items-center gap-2.5 text-ink no-underline"
      href="#/"
      aria-label={`${name} home`}
    >
      <LogoMark />
      <span className="whitespace-nowrap font-bold text-lg tracking-tight">{name}</span>
    </a>
  )
}
