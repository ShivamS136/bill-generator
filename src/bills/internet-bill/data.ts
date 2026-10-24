import { type ColourPreset, luminance, parseHexColour } from '../../lib/colour'
import { formatDate } from '../../lib/format'
import { addMonths } from '../../lib/month'
import { addToSerial } from '../../lib/serial'

export interface InternetBillData {
  providerName: string
  providerAddress: string
  gstNumber: string
  description: string
  accountNumber: string
  billDate: string
  customerName: string
  customerAddress: string
  planSpeed: string
  planPackage: string
  planValidity: string
  logo: string
  themeColour: string
  backgroundColour: string
  currency: string
  paymentMethod: string
  amount: string
  discount: string
  fileName: string
  invoiceNumber: string
}

export const THEME_PRESETS: readonly ColourPreset[] = [
  { label: 'Default', value: '#FD940E' },
  { label: 'Airtel', value: '#ED1C24' },
  { label: 'Jio', value: '#0A2885' },
  { label: 'Vi', value: '#FFD100' },
]

export const BACKGROUND_PRESETS: readonly ColourPreset[] = [
  { label: 'Grey', value: '#F4F2F3' },
  { label: 'White', value: '#FFFFFF' },
]

export const VALIDITY_MONTHS: Record<string, number> = {
  Monthly: 1,
  Quarterly: 3,
  'Half-yearly': 6,
  Yearly: 12,
}

const GST_RATE = 9

export function themeColours(data: Pick<InternetBillData, 'themeColour' | 'backgroundColour'>) {
  const theme = parseHexColour(data.themeColour) ?? THEME_PRESETS[0].value
  const light = luminance(theme)
  return {
    theme,
    background: parseHexColour(data.backgroundColour) ?? BACKGROUND_PRESETS[0].value,
    onTheme: light > 0.6 ? '#1a1a1a' : '#ffffff',
    titleOnTheme: light > 0.3 ? '#1a1a1a' : '#ffffff',
  }
}

const toNumber = (value: string) => {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

const money = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2))

export function charges(data: Pick<InternetBillData, 'amount' | 'discount' | 'currency'>) {
  const amount = toNumber(data.amount)
  const discount = toNumber(data.discount)
  const paid = Math.max(0, amount - discount)
  const taxable = paid / (1 + (2 * GST_RATE) / 100)
  const gst = (taxable * GST_RATE) / 100
  const withSymbol = (value: string) => (data.currency ? `${data.currency} ${value}` : value)
  return {
    rate: String(GST_RATE),
    taxable: withSymbol(taxable.toFixed(2)),
    gst: withSymbol(gst.toFixed(2)),
    amount: withSymbol(money(amount)),
    discount: withSymbol(money(discount)),
    paid: withSymbol(money(paid)),
  }
}

export function defaultDescription(
  data: Pick<InternetBillData, 'planPackage' | 'planSpeed' | 'planValidity'>,
): string {
  const months = VALIDITY_MONTHS[data.planValidity] ?? 1
  const period = months === 1 ? '1 month' : `${months} months`
  return `${data.planPackage} ${data.planSpeed.toLowerCase()} internet for ${period}`
}

export function invoiceDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return match ? `${match[3]}-${match[2]}-${match[1]}` : iso
}

export function defaultFileName(billDate: string): string {
  const [day, month, year] = formatDate(billDate).toLowerCase().split(' ')
  return year ? `internet-bill-${year}-${month}-${day}` : 'internet-bill'
}

export function billFileName(data: Pick<InternetBillData, 'fileName' | 'billDate'>): string {
  return data.fileName.trim().replace(/\.pdf$/i, '') || defaultFileName(data.billDate)
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// Moves the bill on by one plan period. The invoice number steps by a random amount sized to its
// trailing digits: 1 for INV-001, up to 10 for INV-0999, 1–10 lakh for HF2704I001560734.
export function nextBill(
  data: Pick<InternetBillData, 'billDate' | 'invoiceNumber' | 'planValidity'>,
): Partial<InternetBillData> {
  const months = VALIDITY_MONTHS[data.planValidity] ?? 1
  const digits = /\d*$/.exec(data.invoiceNumber.trim())?.[0].length ?? 0
  const step = randomInt(10 ** Math.max(0, digits - 4), 10 ** Math.max(0, digits - 3))
  return {
    billDate: addMonths(data.billDate, months),
    invoiceNumber: addToSerial(data.invoiceNumber.trim(), step * months),
    fileName: '',
  }
}
