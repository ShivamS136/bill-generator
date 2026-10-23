import { Dices, Files, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import {
  AccordionSection,
  AmountField,
  FieldGrid,
  FormSection,
  RadioField,
  SelectField,
  TextAreaField,
  TextField,
} from '../../components/form/fields'
import { ImageField } from '../../components/form/ImageField'
import { actionsClass, hintClass, wideFieldClass } from '../../components/form/styles'
import { buttonClass } from '../../components/ui'
import { cx } from '../../lib/cx'
import { downloadImageZip, type ZipImage } from '../../lib/export'
import { isSafeImageSrc, toThermalInk } from '../../lib/image'
import {
  PAPER_TYPES,
  type PaperStyle,
  type PaperType,
  PHOTO_DESIGNS,
  paperOfType,
  paperType,
  randomPaperDesign,
  randomPaperType,
  randomSeed,
} from '../../lib/paper-texture'
import type { BillFormProps } from '../types'
import { billFileName, type FuelBillData, type ImageFormat, NOT_ENTERED, volume } from './data'
import { bulkBills, nextBill } from './next-bill'
import { Receipt } from './Receipt'

type AutoMode = 'single' | 'bulk'

const AUTO_MODE_OPTIONS = [
  { value: 'single', label: 'Single bill' },
  { value: 'bulk', label: 'Bulk bills' },
]

const IMAGE_FORMAT_OPTIONS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
]

const FUEL_OPTIONS = ['Petrol', 'Diesel', 'Premium Petrol', 'Premium Diesel'].map((value) => ({
  value,
  label: value,
}))

const VEHICLE_TYPE_OPTIONS = ['Petrol', 'Diesel'].map((value) => ({ value, label: value }))

const PAYMENT_OPTIONS = ['Cash', 'Card', 'UPI', 'Wallet', 'Fleet Card'].map((value) => ({
  value,
  label: value,
}))

export function FuelBillForm({ data, onChange }: BillFormProps<FuelBillData>) {
  return (
    <>
      <FormSection title="Fuel station">
        <FieldGrid>
          <TextField
            label="Station name"
            required
            value={data.stationName}
            onChange={(stationName) => onChange({ stationName })}
          />
          <TextField
            label="Telephone"
            type="tel"
            inputMode="tel"
            value={data.telephone}
            onChange={(telephone) => onChange({ telephone })}
          />
          <TextAreaField
            label="Station address"
            rows={2}
            value={data.stationAddress}
            onChange={(stationAddress) => onChange({ stationAddress })}
          />
          <TextField label="FCC ID" value={data.fccId} onChange={(fccId) => onChange({ fccId })} />
          <TextField
            label="FIP number"
            value={data.fipNumber}
            onChange={(fipNumber) => onChange({ fipNumber })}
          />
          <ImageField label="Logo" value={data.logo} onChange={(logo) => onChange({ logo })} />
        </FieldGrid>
      </FormSection>

      <FormSection title="Sale">
        <FieldGrid>
          <TextField
            label="Receipt number"
            required
            value={data.receiptNumber}
            onChange={(receiptNumber) => onChange({ receiptNumber })}
          />
          <TextField
            label="Nozzle number"
            value={data.nozzleNumber}
            onChange={(nozzleNumber) => onChange({ nozzleNumber })}
          />
          <SelectField
            label="Product"
            required
            value={data.product}
            options={FUEL_OPTIONS}
            onChange={(product) => onChange({ product })}
          />
          <AmountField
            label="Rate per litre (₹)"
            required
            value={data.rate}
            onChange={(rate) => onChange({ rate })}
          />
          <AmountField
            label="Amount (₹)"
            required
            value={data.amount}
            onChange={(amount) => onChange({ amount })}
          />
          <TextField
            label="Volume in litres (auto)"
            readOnly
            value={volume(data)}
            onChange={() => {}}
          />
          <TextField
            label="Date"
            type="date"
            required
            value={data.date}
            onChange={(date) => onChange({ date })}
          />
          <TextField
            label="Time"
            type="time"
            required
            value={data.time}
            onChange={(time) => onChange({ time })}
          />
          <SelectField
            label="Payment mode"
            required
            value={data.paymentMode}
            options={PAYMENT_OPTIONS}
            onChange={(paymentMode) => onChange({ paymentMode })}
          />
        </FieldGrid>
      </FormSection>

      <FormSection title="Vehicle & customer">
        <FieldGrid>
          <SelectField
            label="Vehicle type"
            value={data.vehicleType}
            options={VEHICLE_TYPE_OPTIONS}
            onChange={(vehicleType) => onChange({ vehicleType })}
          />
          <TextField
            label="Vehicle number"
            placeholder={NOT_ENTERED}
            value={data.vehicleNumber}
            onChange={(vehicleNumber) => onChange({ vehicleNumber })}
          />
          <TextField
            label="Customer name"
            placeholder={NOT_ENTERED}
            value={data.customerName}
            onChange={(customerName) => onChange({ customerName })}
          />
          <TextField
            label="Attendant ID"
            value={data.attendantId}
            onChange={(attendantId) => onChange({ attendantId })}
          />
        </FieldGrid>
      </FormSection>

      <FormSection title="Tax & footer">
        <FieldGrid>
          <TextField
            label="LST number"
            value={data.lstNumber}
            onChange={(lstNumber) => onChange({ lstNumber })}
          />
          <TextField
            label="VAT number"
            value={data.vatNumber}
            onChange={(vatNumber) => onChange({ vatNumber })}
          />
          <TextAreaField
            label="Footer message"
            rows={3}
            value={data.footer}
            onChange={(footer) => onChange({ footer })}
          />
        </FieldGrid>
      </FormSection>

      <FormSection title="Paper & download">
        <FieldGrid>
          <div className="col-span-full flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <SelectField
                label="Background type"
                value={paperType(data.paper)}
                options={PAPER_TYPES}
                onChange={(type) => onChange(paperOfType(type as PaperType))}
              />
            </div>
            {paperType(data.paper) === 'photo' && (
              <div className="min-w-0 flex-1">
                <SelectField
                  label="Photo"
                  value={data.paper}
                  options={PHOTO_DESIGNS}
                  onChange={(paper) =>
                    onChange({ paper: paper as PaperStyle, paperSeed: randomSeed() })
                  }
                />
              </div>
            )}
            <RandomiseButton
              tag="Type"
              label="Randomise background type"
              onClick={() => onChange(randomPaperType(data.paper))}
            />
            <RandomiseButton
              tag="Design"
              label="Randomise background design"
              onClick={() => onChange(randomPaperDesign(data.paper))}
            />
          </div>
          <TextField
            label="Roll side print"
            placeholder="e.g. bank name"
            value={data.rollText}
            onChange={(rollText) => onChange({ rollText })}
          />
          <TextField
            label="Roll serial"
            placeholder="e.g. A123456"
            value={data.rollSerial}
            onChange={(rollSerial) => onChange({ rollSerial })}
          />
          <SelectField
            label="Download as"
            value={data.imageFormat}
            options={IMAGE_FORMAT_OPTIONS}
            onChange={(imageFormat) => onChange({ imageFormat: imageFormat as ImageFormat })}
          />
        </FieldGrid>
      </FormSection>

      <AutoBillSection data={data} onChange={onChange} />
    </>
  )
}

const MAX_BULK = 100

function AutoBillSection({
  data,
  onChange,
}: {
  data: FuelBillData
  onChange: (patch: Partial<FuelBillData>) => void
}) {
  const [progress, setProgress] = useState<{ done: number; total: number }>()
  const [mode, setMode] = useState<AutoMode>('single')
  const isBulk = mode === 'bulk'
  const canGenerate = !progress && (!isBulk || (!!data.bulkStart && !!data.bulkEnd))

  async function generateBulk() {
    const bills = bulkBills({
      ...data,
      startDate: data.bulkStart,
      endDate: data.bulkEnd,
      limit: MAX_BULK,
    }).map((patch) => ({ ...data, ...patch, ...randomPaperDesign(data.paper) }))
    setProgress({ done: 0, total: bills.length })
    try {
      await downloadImageZip(
        renderReceipts(bills, (done) => setProgress({ done, total: bills.length })),
        `fuel-bills-${data.bulkStart}-to-${data.bulkEnd}`,
        data.imageFormat,
      )
      onChange(bills[bills.length - 1])
    } finally {
      setProgress(undefined)
    }
  }

  function generate() {
    if (isBulk) generateBulk()
    else onChange({ ...nextBill(data), ...randomPaperDesign(data.paper) })
  }

  const Icon = isBulk ? Files : Dices
  const buttonLabel = progress
    ? `Generating ${progress.done}/${progress.total}…`
    : isBulk
      ? 'Generate bulk bills'
      : 'Generate next bill'

  return (
    <AccordionSection title="Auto bill generation">
      <FieldGrid>
        <RadioField
          label="Generate"
          value={mode}
          options={AUTO_MODE_OPTIONS}
          onChange={(value) => setMode(value as AutoMode)}
        />
        <AmountField
          label="Minimum amount (₹)"
          value={data.minAmount}
          onChange={(minAmount) => onChange({ minAmount })}
        />
        <AmountField
          label="Maximum amount (₹)"
          value={data.maxAmount}
          onChange={(maxAmount) => onChange({ maxAmount })}
        />
        <AmountField
          label="Minimum rate per litre (₹)"
          value={data.minRate}
          onChange={(minRate) => onChange({ minRate })}
        />
        <AmountField
          label="Maximum rate per litre (₹)"
          value={data.maxRate}
          onChange={(maxRate) => onChange({ maxRate })}
        />
        <TextField
          label="Minimum days between bills"
          type="number"
          inputMode="numeric"
          min={0}
          value={data.minDays}
          onChange={(minDays) => onChange({ minDays })}
        />
        <TextField
          label="Maximum days between bills"
          type="number"
          inputMode="numeric"
          min={0}
          value={data.maxDays}
          onChange={(maxDays) => onChange({ maxDays })}
        />
        {isBulk && (
          <>
            <TextField
              label="Start date"
              type="date"
              value={data.bulkStart}
              onChange={(bulkStart) => onChange({ bulkStart })}
            />
            <TextField
              label="End date"
              type="date"
              value={data.bulkEnd}
              onChange={(bulkEnd) => onChange({ bulkEnd })}
            />
          </>
        )}
        <div className={wideFieldClass}>
          <div className={actionsClass}>
            <span className={cx(hintClass, 'mr-auto')}>
              {isBulk
                ? `Bills from the start to the end date, min–max days apart (up to ${MAX_BULK}). Each moves the receipt number forward and picks a new nozzle, rate, amount, time and paper design. Downloads a ZIP of images.`
                : 'Moves the receipt number, date and time forward and picks a new nozzle, rate, amount and paper design'}
            </span>
            <button
              type="button"
              className={buttonClass('outline')}
              disabled={!canGenerate}
              onClick={generate}
            >
              <Icon className="size-4" aria-hidden="true" />
              {buttonLabel}
            </button>
          </div>
        </div>
      </FieldGrid>
    </AccordionSection>
  )
}

async function* renderReceipts(
  bills: FuelBillData[],
  onProgress: (done: number) => void,
): AsyncGenerator<ZipImage> {
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-100000px;top:0;pointer-events:none;'
  document.body.appendChild(host)
  const root = createRoot(host)
  try {
    for (const [index, bill] of bills.entries()) {
      flushSync(() => root.render(<Receipt data={bill} />))
      if (isSafeImageSrc(bill.logo)) await toThermalInk(bill.logo)
      await nextFrame()
      await Promise.all(
        Array.from(host.querySelectorAll('img'), (img) => img.decode().catch(() => {})),
      )
      const element = host.firstElementChild
      if (element instanceof HTMLElement) yield { fileName: billFileName(bill), element }
      onProgress(index + 1)
    }
  } finally {
    root.unmount()
    host.remove()
  }
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)))

function RandomiseButton({
  tag,
  label,
  onClick,
}: {
  tag: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={cx(buttonClass('ghost'), 'relative h-11 w-11 shrink-0')}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Shuffle className="size-4" aria-hidden="true" />
      <span className="absolute -top-2 -right-2 rounded-full bg-brand px-1.5 py-0.5 font-semibold text-tag text-white">
        {tag}
      </span>
    </button>
  )
}
