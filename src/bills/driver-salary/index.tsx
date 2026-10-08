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
  vehicleNumber: string
  salaryMonth: string
  receiptDate: string
  amount: string
  fileName: string
  userSignature: Signature
  driverSignature: Signature
  userSignaturePlacement: Placement
  driverSignaturePlacement: Placement
}

const env = import.meta.env

const defaultUserSignature = (employeeName: string) => textSignature(employeeName)
const defaultDriverSignature = (driverName: string) => textSignature(initials(driverName))

const titleClass = 'mb-4 text-center font-bold font-montserrat text-2xl leading-snug'
const rowsClass = 'grid gap-2'

const USER_SIGNATURE_JITTER: Jitter = { x: 40, y: 12, rotate: 5 }
const DRIVER_SIGNATURE_JITTER: Jitter = { x: 20, y: 20, rotate: 10 }

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
      vehicleNumber: env.VITE_DRIVER_SALARY_VEHICLE_NUMBER ?? '',
      salaryMonth,
      receiptDate: lastDayOfMonth(salaryMonth),
      amount: env.VITE_DRIVER_SALARY_AMOUNT ?? '',
      fileName: '',
      userSignature: defaultUserSignature(employeeName),
      driverSignature: defaultDriverSignature(driverName),
      userSignaturePlacement: ORIGIN,
      driverSignaturePlacement: ORIGIN,
    }
  },

  normalize: (data) => ({
    ...data,
    userSignature: parseSignature(data.userSignature, defaultUserSignature(data.employeeName)),
    driverSignature: parseSignature(data.driverSignature, defaultDriverSignature(data.driverName)),
    userSignaturePlacement: parsePlacement(data.userSignaturePlacement),
    driverSignaturePlacement: parsePlacement(data.driverSignaturePlacement),
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
                <button
                  type="button"
                  className={buttonClass('ghost')}
                  onClick={() =>
                    onChange({
                      userSignaturePlacement: randomPlacement(
                        USER_SIGNATURE_JITTER,
                        data.userSignaturePlacement.scale,
                      ),
                      driverSignaturePlacement: randomPlacement(
                        DRIVER_SIGNATURE_JITTER,
                        data.driverSignaturePlacement.scale,
                      ),
                    })
                  }
                >
                  Randomize
                </button>
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

    return (
      <Paper className="px-20 py-20 font-nunito text-neutral-900 text-xl leading-relaxed before:pointer-events-none before:absolute before:inset-4 before:border-3 before:border-neutral-900 before:content-['']">
        <h1 className={titleClass}>Driver Salary Receipt</h1>
        <p className="text-justify">
          This is to certify that I have paid <strong>{amount}</strong> to driver, Mr.{' '}
          <strong>{data.driverName}</strong> for the month of <strong>{month}</strong> (Acknowledged
          receipt enclosed). I also declare that the driver is exclusively utilized for official
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
          <p>
            <strong>Vehicle No:</strong> {data.vehicleNumber}
          </p>
          <p>
            Received a sum of <strong>{amount}</strong> only for the <strong>{month}</strong> month
            from Mr / Mrs <strong>{data.employeeName}</strong>.
          </p>
        </div>

        <h3 className="mt-6 mb-2 font-bold font-montserrat text-xl leading-snug">Revenue Stamp</h3>
        <div className="relative w-28">
          <img className="block w-28" src={revenueStamp} alt="Revenue stamp" />
          {!isSignatureEmpty(data.driverSignature) && (
            <Draggable
              className="absolute top-12 left-12"
              placement={data.driverSignaturePlacement}
              onPlacementChange={(driverSignaturePlacement) =>
                onChange({ driverSignaturePlacement })
              }
            >
              <SignatureMark
                value={data.driverSignature}
                alt="Driver signature"
                textClassName="text-3xl"
                imageClassName="max-h-16 max-w-40"
              />
            </Draggable>
          )}
        </div>
      </Paper>
    )
  },
})
