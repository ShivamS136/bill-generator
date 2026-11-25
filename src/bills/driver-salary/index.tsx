import '@fontsource/montserrat/700.css'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/700.css'
import {
  AmountField,
  FieldGrid,
  FormSection,
  SelectField,
  TextField,
} from '../../components/form/fields'
import { SignatureInput } from '../../components/form/SignatureInput'
import { actionsClass, hintClass, wideFieldClass } from '../../components/form/styles'
import {
  Draggable,
  type Jitter,
  ORIGIN,
  type Placement,
  parsePlacement,
  randomPlacement,
} from '../../components/preview/Draggable'
import { Paper } from '../../components/preview/Paper'
import { SignatureMark } from '../../components/signature/SignatureMark'
import { buttonClass } from '../../components/ui'
import { cx } from '../../lib/cx'
import { formatDate, formatINR } from '../../lib/format'
import {
  formatMonth,
  lastDayOfMonth,
  MONTH_OPTIONS,
  monthKey,
  recentYears,
  shiftMonth,
} from '../../lib/month'
import {
  initials,
  isSignatureEmpty,
  parseSignature,
  type Signature,
  textSignature,
} from '../../lib/signature'
import { defineBill } from '../types'
import revenueStamp from './revenue-stamp.jpg'

interface DriverSalaryData {
  driverName: string
  employeeName: string
  licenceNumber: string
  vehicleNumber: string
  salaryMonth: string
  receiptDate: string
  amount: string
  fileName: string
  userSignature: Signature
  driverSignature: Signature
  userSignaturePlacement: Placement
  driverSignaturePlacement: Placement
  // On the revenue stamp, or anywhere in the free space beside it down to the bottom margin.
  driverSignatureOnStamp: boolean
  // Where the driver signature sits in that free space, as 0–1 fractions of the room left over.
  driverSignatureSpot: Spot
}

interface Spot {
  x: number
  y: number
}

const env = import.meta.env

const defaultUserSignature = (employeeName: string) => textSignature(employeeName)
const defaultDriverSignature = (driverName: string) => textSignature(initials(driverName))

const titleClass = 'mb-4 text-center font-bold font-montserrat text-2xl leading-snug'
const rowsClass = 'grid gap-2'

const USER_SIGNATURE_JITTER: Jitter = { x: 40, y: 12, rotate: 5 }
const DRIVER_SIGNATURE_JITTER: Jitter = { x: 20, y: 20, rotate: 10 }
// Off the stamp the spot does the positioning, so the placement only adds a tilt.
const FREE_DRIVER_SIGNATURE_JITTER: Jitter = { x: 0, y: 0, rotate: 10 }
const CENTRE_SPOT: Spot = { x: 0.5, y: 0.5 }

const unit = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback

function parseSpot(value: unknown): Spot {
  const source = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  return { x: unit(source.x, CENTRE_SPOT.x), y: unit(source.y, CENTRE_SPOT.y) }
}

// Randomised spots stay clear of the free space's edges and corners, except on the left, where
// the area already starts a gap away from the stamp, so a signature may sit close beside it.
const SPOT_MARGIN = 0.2
const STAMP_SIDE_MARGIN = 0.05

const randomBetween = (min: number, max: number) =>
  Math.round((min + Math.random() * (max - min)) * 100) / 100

const randomSpot = (): Spot => ({
  x: randomBetween(STAMP_SIDE_MARGIN, 1 - SPOT_MARGIN),
  y: randomBetween(SPOT_MARGIN, 1 - SPOT_MARGIN),
})

function randomDriverSignature(
  onStamp: boolean,
  scale: number,
): Pick<DriverSalaryData, 'driverSignaturePlacement' | 'driverSignatureSpot'> {
  return onStamp
    ? {
        driverSignaturePlacement: randomPlacement(DRIVER_SIGNATURE_JITTER, scale),
        driverSignatureSpot: CENTRE_SPOT,
      }
    : {
        driverSignaturePlacement: randomPlacement(FREE_DRIVER_SIGNATURE_JITTER, scale),
        driverSignatureSpot: randomSpot(),
      }
}

const GENERATED_FILE_NAME = /^driver-salary-[a-z]+-\d{2}\.pdf$/i

function defaultFileName(month: string): string {
  const year = month.slice(2, 4)
  return `driver-salary-${formatMonth(month, 'short').toLowerCase()}-${year}.pdf`
}

function resolveFileName({ fileName, salaryMonth }: DriverSalaryData): string {
  const custom = fileName.trim()
  return custom && !GENERATED_FILE_NAME.test(custom) ? custom : defaultFileName(salaryMonth)
}

function salaryMonthPatch(salaryMonth: string): Partial<DriverSalaryData> {
  return { salaryMonth, receiptDate: lastDayOfMonth(salaryMonth), fileName: '' }
}

export const driverSalaryBill = defineBill<DriverSalaryData>({
  initialData: () => {
    const salaryMonth = shiftMonth(monthKey(new Date()), -1)
    const driverName = env.VITE_DRIVER_SALARY_DRIVER_NAME ?? ''
    const employeeName = env.VITE_DRIVER_SALARY_EMPLOYEE_NAME ?? ''
    return {
      driverName,
      employeeName,
      licenceNumber: env.VITE_DRIVER_SALARY_LICENCE_NUMBER ?? '',
      vehicleNumber: env.VITE_DRIVER_SALARY_VEHICLE_NUMBER ?? '',
      salaryMonth,
      receiptDate: lastDayOfMonth(salaryMonth),
      amount: env.VITE_DRIVER_SALARY_AMOUNT ?? '',
      fileName: '',
      userSignature: defaultUserSignature(employeeName),
      driverSignature: defaultDriverSignature(driverName),
      userSignaturePlacement: ORIGIN,
      driverSignaturePlacement: ORIGIN,
      driverSignatureOnStamp: true,
      driverSignatureSpot: CENTRE_SPOT,
    }
  },

  normalize: (data) => ({
    ...data,
    userSignature: parseSignature(data.userSignature, defaultUserSignature(data.employeeName)),
    driverSignature: parseSignature(data.driverSignature, defaultDriverSignature(data.driverName)),
    userSignaturePlacement: parsePlacement(data.userSignaturePlacement),
    driverSignaturePlacement: parsePlacement(data.driverSignaturePlacement),
    driverSignatureOnStamp:
      typeof data.driverSignatureOnStamp === 'boolean' ? data.driverSignatureOnStamp : true,
    driverSignatureSpot: parseSpot(data.driverSignatureSpot),
  }),

  fileName: (data) => resolveFileName(data).replace(/\.pdf$/i, ''),

  Form: ({ data, onChange }) => {
    const [year, month] = data.salaryMonth.split('-')
    return (
      <>
        <FormSection title="Salary details">
          <FieldGrid>
            <SelectField
              label="Salary month"
              required
              value={month}
              options={MONTH_OPTIONS}
              onChange={(value) => onChange(salaryMonthPatch(`${year}-${value}`))}
            />
            <SelectField
              label="Salary year"
              required
              value={year}
              options={recentYears(6, year).map((value) => ({ value, label: value }))}
              onChange={(value) => onChange(salaryMonthPatch(`${value}-${month}`))}
            />
            <TextField
              label="Receipt date"
              type="date"
              required
              value={data.receiptDate}
              onChange={(receiptDate) => onChange({ receiptDate })}
            />
            <AmountField
              label="Salary amount (₹)"
              required
              value={data.amount}
              onChange={(amount) => onChange({ amount })}
            />
          </FieldGrid>
        </FormSection>
        <FormSection title="Driver & employee">
          <FieldGrid>
            <TextField
              label="Driver name"
              required
              value={data.driverName}
              onChange={(driverName) => onChange({ driverName })}
            />
            <TextField
              label="Driver's licence number"
              placeholder="Optional"
              value={data.licenceNumber}
              onChange={(licenceNumber) => onChange({ licenceNumber })}
            />
            <TextField
              label="Vehicle number"
              required
              value={data.vehicleNumber}
              onChange={(vehicleNumber) => onChange({ vehicleNumber })}
            />
            <TextField
              label="Employee name"
              required
              value={data.employeeName}
              onChange={(employeeName) => onChange({ employeeName })}
            />
          </FieldGrid>
        </FormSection>
        <FormSection title="Signatures">
          <FieldGrid>
            <SignatureInput
              label="Your signature"
              value={data.userSignature}
              defaultText={data.employeeName}
              onChange={(userSignature) => onChange({ userSignature })}
            />
            <SignatureInput
              label="Driver signature"
              value={data.driverSignature}
              defaultText={initials(data.driverName)}
              onChange={(driverSignature) => onChange({ driverSignature })}
            />
            <div className={wideFieldClass}>
              <div className={actionsClass}>
                <span className={cx(hintClass, 'mr-auto')}>
                  Select a signature on the preview to move, resize or rotate it
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-brand"
                      checked={data.driverSignatureOnStamp}
                      onChange={(event) =>
                        onChange({
                          driverSignatureOnStamp: event.target.checked,
                          ...randomDriverSignature(
                            event.target.checked,
                            data.driverSignaturePlacement.scale,
                          ),
                        })
                      }
                    />
                    Driver signature on stamp
                  </label>
                  <button
                    type="button"
                    className={buttonClass('ghost')}
                    onClick={() =>
                      onChange({
                        userSignaturePlacement: randomPlacement(
                          USER_SIGNATURE_JITTER,
                          data.userSignaturePlacement.scale,
                        ),
                        ...randomDriverSignature(
                          data.driverSignatureOnStamp,
                          data.driverSignaturePlacement.scale,
                        ),
                      })
                    }
                  >
                    Randomise
                  </button>
                </div>
              </div>
            </div>
          </FieldGrid>
        </FormSection>
        <FormSection title="Download">
          <FieldGrid>
            <TextField
              label="Download file name"
              hint="Regenerated when the salary month or year changes"
              wide
              value={resolveFileName(data)}
              onChange={(fileName) => onChange({ fileName })}
            />
          </FieldGrid>
        </FormSection>
      </>
    )
  },

  Preview: ({ data, onChange }) => {
    const amount = formatINR(data.amount)
    const month = formatMonth(data.salaryMonth, 'long')
    const receiptDate = formatDate(data.receiptDate)
    const { x: spotX, y: spotY } = data.driverSignatureSpot
    const driverSignature = !isSignatureEmpty(data.driverSignature) && (
      <Draggable
        className={data.driverSignatureOnStamp ? 'absolute top-9 left-8' : undefined}
        placement={data.driverSignaturePlacement}
        onPlacementChange={(driverSignaturePlacement) => onChange({ driverSignaturePlacement })}
      >
        <SignatureMark
          value={data.driverSignature}
          alt="Driver signature"
          textClassName="text-3xl"
          imageClassName="max-h-16 max-w-40"
        />
      </Draggable>
    )

    return (
      <Paper className="flex flex-col px-20 py-20 font-nunito text-neutral-900 text-xl leading-relaxed before:pointer-events-none before:absolute before:inset-4 before:border-3 before:border-neutral-900 before:content-['']">
        <h1 className={titleClass}>Driver Salary Receipt</h1>
        <p className="text-justify">
          This is to certify that I have paid <strong>{amount}</strong> to driver, Mr.{' '}
          <strong>{data.driverName}</strong> for the month of <strong>{month}</strong> (Acknowledged
          receipt enclosed). I also declare that the driver is exclusively utilised for official
          purpose only. Please reimburse the above amount. I further declare that what is stated
          above is correct and true.
        </p>
        <div className="mt-6 flex items-end justify-between gap-6">
          <div className={rowsClass}>
            <p>
              <strong>Employee Name:</strong> {data.employeeName}
            </p>
            <p>
              <strong>Date:</strong> {receiptDate}
            </p>
          </div>
          {!isSignatureEmpty(data.userSignature) && (
            <Draggable
              placement={data.userSignaturePlacement}
              onPlacementChange={(userSignaturePlacement) => onChange({ userSignaturePlacement })}
            >
              <SignatureMark
                value={data.userSignature}
                alt="Employee signature"
                textClassName="text-4xl"
                imageClassName="max-h-16 max-w-52"
              />
            </Draggable>
          )}
        </div>

        <hr className="my-10 border-0 border-neutral-900 border-t-3" />

        <h2 className={titleClass}>Receipt Acknowledgement</h2>
        <div className={rowsClass}>
          <p>
            <strong>Date of Receipt:</strong> {receiptDate}
          </p>
          <p>
            <strong>For the Month of:</strong> {month}
          </p>
          <p>
            <strong>Name of Driver:</strong> {data.driverName}
          </p>
          {data.licenceNumber.trim() && (
            <p>
              <strong>Driver's Licence No:</strong> {data.licenceNumber}
            </p>
          )}
          <p>
            <strong>Vehicle No:</strong> {data.vehicleNumber}
          </p>
          <p>
            Received a sum of <strong>{amount}</strong> only for the <strong>{month}</strong> month
            from Mr / Mrs <strong>{data.employeeName}</strong>.
          </p>
        </div>

        <h3 className="mt-6 mb-2 font-bold font-montserrat text-xl leading-snug">Revenue Stamp</h3>
        <div className="flex flex-1 gap-4">
          <div className="relative w-revenue-stamp-width self-start">
            <img
              className="block h-auto w-revenue-stamp-width"
              src={revenueStamp}
              alt="Revenue stamp"
            />
            {data.driverSignatureOnStamp && driverSignature}
          </div>
          {/* The free space beside the stamp, down to the bottom margin. Shifting by the spot's
              share of both the area and the signature keeps any size of signature inside it. */}
          <div className="relative flex-1">
            {!data.driverSignatureOnStamp && (
              <div
                className="absolute"
                style={{
                  left: `${spotX * 100}%`,
                  top: `${spotY * 100}%`,
                  transform: `translate(${-spotX * 100}%, ${-spotY * 100}%)`,
                }}
              >
                {driverSignature}
              </div>
            )}
          </div>
        </div>
      </Paper>
    )
  },
})
