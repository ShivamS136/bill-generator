import { formatDate } from '../../lib/format'
import type { PaperStyle } from '../../lib/paper-texture'

export interface FuelBillData {
  stationName: string
  stationAddress: string
  telephone: string
  fccId: string
  fipNumber: string
  nozzleNumber: string
  logo: string
  receiptNumber: string
  product: string
  rate: string
  amount: string
  paymentMode: string
  date: string
  time: string
  vehicleType: string
  vehicleNumber: string
  customerName: string
  attendantId: string
  lstNumber: string
  vatNumber: string
  footer: string
  paper: PaperStyle
  paperSeed: number
  rollText: string
  rollSerial: string
  imageFormat: ImageFormat
  minAmount: string
  maxAmount: string
  minRate: string
  maxRate: string
  minDays: string
  maxDays: string
  bulkStart: string
  bulkEnd: string
}

export type ImageFormat = 'jpeg' | 'png'

export const NOT_ENTERED = 'Not Entrd'

export function billFileName(data: Pick<FuelBillData, 'date' | 'receiptNumber'>): string {
  const [day, month, year] = formatDate(data.date).toLowerCase().split(' ')
  const date = year ? `${year}-${month}-${day}` : data.date
  return `fuel-bill-${date}-${data.receiptNumber}`
}

export const toMoney = (value: string) => {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : undefined
}

export function volume(data: Pick<FuelBillData, 'rate' | 'amount'>): string {
  const rate = toMoney(data.rate)
  const amount = toMoney(data.amount)
  return rate && amount !== undefined ? (amount / rate).toFixed(2) : ''
}
