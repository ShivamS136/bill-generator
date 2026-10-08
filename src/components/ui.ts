import { cx } from '../lib/cx'

export const container = 'mx-auto w-full max-w-7xl px-4 md:px-6'

const buttonVariants = {
  primary:
    'h-9 border-transparent bg-brand px-4 text-sm font-semibold text-white hover:not-disabled:bg-brand-hover',
  dark: 'h-9 border-transparent bg-neutral-900 px-3 text-sm font-semibold text-white hover:bg-neutral-700',
  ghost:
    'h-8 border-line-strong bg-surface px-3 text-sm font-medium text-ink hover:not-disabled:bg-surface-muted',
}

export function buttonClass(variant: keyof typeof buttonVariants): string {
  return cx(
    'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-55',
    buttonVariants[variant],
  )
}
