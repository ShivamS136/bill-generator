import { addToSerial } from '../../lib/serial'

const pad = (n: number) => String(n).padStart(2, '0')

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const toNumber = (value: string, fallback: number) => {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : fallback
}

const ordered = (a: number, b: number) => (a <= b ? [a, b] : [b, a])

const DAY_MS = 24 * 60 * 60 * 1000

export interface NextBillInput {
  receiptNumber: string
  rate: string
  date: string
  minAmount: string
  maxAmount: string
  minRate: string
  maxRate: string
  minDays: string
  maxDays: string
}

export interface BulkBillInput extends NextBillInput {
  startDate: string
  endDate: string
  limit: number
}

export interface NextBillPatch {
  receiptNumber: string
  nozzleNumber: string
  rate: string
  amount: string
  date: string
  time: string
}

export function nextBill(input: NextBillInput): NextBillPatch {
  const [minDays, maxDays] = dayRange(input)
  const days = randomInt(minDays, maxDays)
  return billAfter(input, addDays(input.date, days), randomTime(), days)
}

// The first bill falls on the start date and the last on the end date, with every gap in between
// kept within the min–max days. Receipt numbers carry on from the current bill, backwards if the
// start date is earlier.
export function bulkBills(input: BulkBillInput): NextBillPatch[] {
  const [startDate, endDate] = [input.startDate, input.endDate].sort()
  const dates = [startDate]
  for (const gap of splitDays(daysBetween(startDate, endDate), dayRange(input), input.limit - 1)) {
    dates.push(addDays(dates[dates.length - 1], gap))
  }

  const bills: NextBillPatch[] = []
  let previous: Pick<NextBillInput, 'receiptNumber' | 'rate' | 'date'> = input
  for (const date of dates) {
    const bill = billAfter(
      { ...input, ...previous },
      date,
      randomTime(),
      daysBetween(previous.date, date),
    )
    bills.push(bill)
    previous = bill
  }
  return keepTimesInOrder(bills)
}

// Random gaps that add up to `total`, each within [min, max] where the range allows it.
function splitDays(total: number, [min, max]: [number, number], maxGaps: number): number[] {
  if (total <= 0) return []
  const fewest = Math.ceil(total / Math.max(max, 1))
  const most = min > 0 ? Math.floor(total / min) : total
  const typical = Math.round(total / Math.max((min + max) / 2, 1))
  const count = Math.min(maxGaps, Math.max(1, fewest, Math.min(most, typical)))
  const gaps = Array.from({ length: count }, () => Math.min(min, Math.floor(total / count)))
  let remaining = total - gaps.reduce((sum, gap) => sum + gap, 0)
  while (remaining > 0) {
    const open = gaps.flatMap((gap, index) => (gap < max ? [index] : []))
    const index = open.length > 0 ? open[randomInt(0, open.length - 1)] : randomInt(0, count - 1)
    gaps[index]++
    remaining--
  }
  return gaps
}

function dayRange(input: Pick<NextBillInput, 'minDays' | 'maxDays'>): [number, number] {
  const [min, max] = ordered(
    Math.max(0, Math.round(toNumber(input.minDays, 1))),
    Math.max(0, Math.round(toNumber(input.maxDays, 1))),
  )
  return [min, max]
}

function keepTimesInOrder(bills: NextBillPatch[]): NextBillPatch[] {
  const times = new Map<string, string[]>()
  for (const { date, time } of bills) times.set(date, [...(times.get(date) ?? []), time])
  for (const list of times.values()) list.sort()
  return bills.map((bill) => ({ ...bill, time: times.get(bill.date)?.shift() ?? bill.time }))
}

function billAfter(input: NextBillInput, date: string, time: string, days: number): NextBillPatch {
  const rate = nextRate(toNumber(input.rate, 100), rateRange(input))
  return {
    receiptNumber: nextReceiptNumber(input.receiptNumber, days),
    nozzleNumber: pad(randomInt(1, 4)),
    rate: rate.toFixed(2),
    amount: randomAmount(toNumber(input.minAmount, 0), toNumber(input.maxAmount, 0), rate),
    date,
    time,
  }
}

function nextReceiptNumber(current: string, days: number): string {
  const span = Math.abs(days)
  const step = span > 0 ? randomInt(span * 500, span * 800) : randomInt(20, 200)
  return addToSerial(current.trim(), days < 0 ? -step : step)
}

function rateRange(input: Pick<NextBillInput, 'minRate' | 'maxRate'>): [number, number] {
  const [min, max] = ordered(
    toNumber(input.minRate, Number.NEGATIVE_INFINITY),
    toNumber(input.maxRate, Number.POSITIVE_INFINITY),
  )
  return [min, max]
}

// Drifts a little, usually upwards, and turns back instead of leaving the range.
function nextRate(rate: number, [min, max]: [number, number]): number {
  const round = (n: number) => Math.round(n * 100) / 100
  if (rate < min || rate > max) return round(min + Math.random() * (max - min))
  let next = rate + (Math.random() < 0.7 ? Math.random() * 0.6 : -Math.random() * 0.3)
  if (next > max) next = rate - Math.random() * Math.min(0.3, rate - min)
  if (next < min) next = rate + Math.random() * Math.min(0.6, max - rate)
  return round(next)
}

function randomAmount(min: number, max: number, rate: number): string {
  const [low, high] = ordered(min, max)
  const hundreds = Math.floor(high / 100) - Math.ceil(low / 100)
  if (hundreds >= 0 && Math.random() < 0.3) {
    return (randomInt(Math.ceil(low / 100), Math.floor(high / 100)) * 100).toFixed(2)
  }
  const target = low + Math.random() * (high - low)
  if (rate <= 0) return target.toFixed(2)
  const amount = Math.round((target / rate) * 100) * (rate / 100)
  return (amount >= low && amount <= high ? amount : target).toFixed(2)
}

function randomTime(): string {
  return `${pad(randomInt(7, 22))}:${pad(randomInt(0, 59))}`
}

function parseDate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date()
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function addDays(iso: string, days: number): string {
  const date = parseDate(iso)
  date.setDate(date.getDate() + days)
  return toISO(date)
}

function daysBetween(from: string, to: string): number {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / DAY_MS)
}
