import { parseHexColour } from '../../lib/colour'
import { todayISO } from '../../lib/format'
import { corsProxied } from '../../lib/image'
import { defineBill } from '../types'
import { BACKGROUND_PRESETS, billFileName, type InternetBillData, THEME_PRESETS } from './data'
import { InternetBillForm } from './Form'
import { Invoice } from './Invoice'

const env = import.meta.env

const DEFAULT_LOGO = corsProxied(
  'https://wp.logos-download.com/wp-content/uploads/2016/07/Airtel_logo.png?dl',
)

const DEFAULT_ADDRESS = 'Plot No 41 & 42,\nIndustrial Park,\nSector 2, Saha Distt. Ambala, Haryana'

const randomDigits = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')

export const internetBill = defineBill<InternetBillData>({
  initialData: () => ({
    providerName: 'Airtel',
    providerAddress: DEFAULT_ADDRESS,
    gstNumber: env.VITE_INTERNET_BILL_GST_NUMBER ?? '',
    description: '',
    accountNumber: env.VITE_INTERNET_BILL_ACCOUNT_NUMBER ?? '',
    billDate: todayISO(),
    customerName: env.VITE_INTERNET_BILL_CUSTOMER_NAME ?? '',
    customerAddress: env.VITE_INTERNET_BILL_CUSTOMER_ADDRESS ?? '',
    planSpeed: '500Mbps',
    planPackage: 'Unlimited',
    planValidity: 'Monthly',
    logo: DEFAULT_LOGO,
    themeColour: THEME_PRESETS[0].value,
    backgroundColour: BACKGROUND_PRESETS[0].value,
    currency: '',
    paymentMethod: 'Online',
    amount: env.VITE_INTERNET_BILL_AMOUNT || '1599',
    discount: '0',
    fileName: '',
    invoiceNumber: `HF${randomDigits(4)}I00${randomDigits(7)}`,
  }),

  normalize: (data) => ({
    ...data,
    themeColour: parseHexColour(data.themeColour) ? data.themeColour : THEME_PRESETS[0].value,
    backgroundColour: parseHexColour(data.backgroundColour)
      ? data.backgroundColour
      : BACKGROUND_PRESETS[0].value,
  }),

  fileName: billFileName,

  Form: InternetBillForm,

  Preview: Invoice,
})
