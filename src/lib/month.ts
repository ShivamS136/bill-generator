const pad = (n: number) => String(n).padStart(2, '0')

function parseMonth(key: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})$/.exec(key)
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, 1) : undefined
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function shiftMonth(key: string, delta: number): string {
  const date = parseMonth(key) ?? new Date()
  return monthKey(new Date(date.getFullYear(), date.getMonth() + delta, 1))
}

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: pad(index + 1),
  label: new Date(2000, index, 1).toLocaleDateString('en-US', { month: 'long' }),
}))

export function recentYears(count: number, include?: string): string[] {
  const current = new Date().getFullYear()
  const years = Array.from({ length: count }, (_, index) => String(current - index))
  if (include && !years.includes(include)) years.push(include)
  return years
}

export function lastDayOfMonth(key: string): string {
  const date = parseMonth(key)
  if (!date) return ''
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return `${key}-${pad(last.getDate())}`
}

export function formatMonth(
  key: string,
  style: 'short' | 'long' | 'long-year' = 'long-year',
): string {
  const date = parseMonth(key)
  if (!date) return key
  return date.toLocaleDateString('en-US', {
    month: style === 'short' ? 'short' : 'long',
    year: style === 'long-year' ? 'numeric' : undefined,
  })
}
