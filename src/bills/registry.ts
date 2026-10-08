import { sampleBill } from './_sample'
import { driverSalaryBill } from './driver-salary'
import type { BillEntry } from './types'

const catalog: BillEntry[] = [
  { id: 'fuel-bill', name: 'Fuel Bill', emoji: '⛽' },
  { id: 'driver-salary', name: 'Driver Salary', emoji: '🚗', module: driverSalaryBill },
  { id: 'rent-receipt', name: 'Rent Receipt', emoji: '🏠' },
  { id: 'internet-bill', name: 'Internet Bill', emoji: '🌐' },
  { id: 'daily-helper', name: 'Daily Helper', emoji: '🧹' },
  { id: 'restaurant-bill', name: 'Restaurant Bill', emoji: '🍽️' },
  { id: 'medical-bill', name: 'Medical Bill', emoji: '🏥' },
  { id: 'cab-bill', name: 'Cab Bill', emoji: '🚕' },
  { id: 'grocery-bill', name: 'Grocery Bill', emoji: '🛒' },
  { id: 'book-receipt', name: 'Book Receipt', emoji: '📚' },
  { id: 'recharge-bill', name: 'Recharge Bill', emoji: '📱' },
  { id: 'lta-bill', name: 'LTA Bill', emoji: '✈️' },
  { id: 'gym-bill', name: 'Gym Bill', emoji: '💪' },
  { id: 'hotel-bill', name: 'Hotel Bill', emoji: '🏨' },
  { id: 'newspaper-bill', name: 'Newspaper Bill', emoji: '📰' },
  { id: 'general-bill', name: 'General Bill', emoji: '📄' },
]

// Inlined (not via env.ts) so the sample is tree-shaken out of production builds.
const devOnly: BillEntry[] =
  import.meta.env.VITE_ENABLE_SAMPLE_BILL === 'true'
    ? [{ id: 'sample', name: 'Sample (dev)', emoji: '🧪', module: sampleBill }]
    : []

export const bills: BillEntry[] = [...devOnly, ...catalog]

export const defaultBill: BillEntry = bills.find((bill) => bill.module) ?? bills[0]

export function findBill(id: string): BillEntry | undefined {
  return bills.find((bill) => bill.id === id)
}
