import { todayISO } from '../../lib/format'
import { isPaperStyle, randomPaperType, randomSeed } from '../../lib/paper-texture'
import { defineBill } from '../types'
import { billFileName, type FuelBillData } from './data'
import { FuelBillForm } from './Form'
import { Receipt } from './Receipt'

const env = import.meta.env

const DEFAULT_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Indian_Oil_Logo.svg/250px-Indian_Oil_Logo.svg.png'

const DEFAULT_RATE = 104.97
const RATE_SPREAD = 2

function defaultFooter(telephone: string): string {
  const call = telephone.trim()
    ? ` YOU CAN NOW CALL US ON ${telephone.trim()} (TOLL-FREE) FOR QUERIES/COMPLAINTS.`
    : ''
  return `SAVE FUEL YAANI SAVE MONEY !! THANKS FOR FUELLING WITH US.${call}`
}

function currentTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export const fuelBill = defineBill<FuelBillData>({
  initialData: () => {
    const telephone = env.VITE_FUEL_BILL_TELEPHONE ?? ''
    return {
      stationName: env.VITE_FUEL_BILL_STATION_NAME ?? '',
      stationAddress: env.VITE_FUEL_BILL_STATION_ADDRESS ?? '',
      telephone,
      fccId: env.VITE_FUEL_BILL_FCC_ID ?? '',
      fipNumber: '02',
      nozzleNumber: '01',
      logo: DEFAULT_LOGO,
      receiptNumber: 'H1688',
      product: 'Petrol',
      rate: DEFAULT_RATE.toFixed(2),
      amount: '3411.67',
      paymentMode: 'Cash',
      date: todayISO(),
      time: currentTime(),
      vehicleType: 'Petrol',
      vehicleNumber: env.VITE_FUEL_BILL_VEHICLE_NUMBER ?? '',
      customerName: env.VITE_FUEL_BILL_CUSTOMER_NAME ?? '',
      attendantId: 'Not Available',
      lstNumber: '',
      vatNumber: '',
      footer: defaultFooter(telephone),
      ...randomPaperType(),
      rollText: 'HDFC Bank',
      rollSerial: env.VITE_FUEL_BILL_ROLL_SERIAL ?? '',
      imageFormat: 'jpeg',
      minAmount: '2000',
      maxAmount: '4000',
      minRate: (DEFAULT_RATE - RATE_SPREAD).toFixed(2),
      maxRate: (DEFAULT_RATE + RATE_SPREAD).toFixed(2),
      minDays: '3',
      maxDays: '7',
      bulkStart: `${todayISO().slice(0, 8)}01`,
      bulkEnd: todayISO(),
    }
  },

  normalize: (data) => ({
    ...data,
    paper: isPaperStyle(data.paper) ? data.paper : 'smooth',
    paperSeed: Number.isInteger(data.paperSeed) ? data.paperSeed : randomSeed(),
    imageFormat: data.imageFormat === 'png' ? 'png' : 'jpeg',
  }),

  exportFormat: (data) => data.imageFormat,

  previewSize: { width: 303, height: 820 },

  fileName: billFileName,

  Form: FuelBillForm,

  Preview: Receipt,
})
