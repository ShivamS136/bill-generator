import '@fontsource/montserrat/700.css'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/700.css'
import {
  AmountField,
  FieldGrid,
  FormSection,
  RangeField,
  SelectField,
  TextField,
} from '../../components/form/fields'
import { ImageSourceField } from '../../components/form/ImageSourceField'
import { actionsClass, hintClass, wideFieldClass } from '../../components/form/styles'
import {
  DraggableImage,
  ORIGIN,
  type Placement,
  randomPlacement,
} from '../../components/preview/DraggableImage'
import { Paper } from '../../components/preview/Paper'
import { buttonClass } from '../../components/ui'
import { cx } from '../../lib/cx'
import { formatDate, formatINR } from '../../lib/format'
import { isSafeImageSrc, publicAssetUrl } from '../../lib/image'
import {
  formatMonth,
  lastDayOfMonth,
  MONTH_OPTIONS,
  monthKey,
  recentYears,
  shiftMonth,
} from '../../lib/month'
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
  userSignature: string
  driverSignature: string
  userSignaturePlacement: Placement
  driverSignaturePlacement: Placement
}

const env = import.meta.env

const defaultUserSignature = publicAssetUrl(env.VITE_DRIVER_SALARY_USER_SIGNATURE ?? '')
const defaultDriverSignature = publicAssetUrl(env.VITE_DRIVER_SALARY_DRIVER_SIGNATURE ?? '')

const titleClass = 'mb-4 text-center font-bold font-montserrat text-2xl leading-snug'
const rowsClass = 'grid gap-2'

const MAX_ROTATION = 20

const USER_SIGNATURE_JITTER: Placement = { x: 40, y: 12, rotate: 5 }
const DRIVER_SIGNATURE_JITTER: Placement = { x: 20, y: 20, rotate: 10 }

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

function signatureSrc(value: string): string | undefined {
  const src = value.trim()
  return isSafeImageSrc(src) ? src : undefined
}

export const driverSalaryBill = defineBill<DriverSalaryData>({
  initialData: () => {
    const salaryMonth = shiftMonth(monthKey(new Date()), -1)
    return {
      driverName: env.VITE_DRIVER_SALARY_DRIVER_NAME ?? '',
      employeeName: env.VITE_DRIVER_SALARY_EMPLOYEE_NAME ?? '',
      vehicleNumber: env.VITE_DRIVER_SALARY_VEHICLE_NUMBER ?? '',
      salaryMonth,
      receiptDate: lastDayOfMonth(salaryMonth),
      amount: env.VITE_DRIVER_SALARY_AMOUNT ?? '',
      fileName: '',
      userSignature: defaultUserSignature,
      driverSignature: defaultDriverSignature,
      userSignaturePlacement: ORIGIN,
      driverSignaturePlacement: ORIGIN,
    }
  },

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
            <ImageSourceField
              label="Your signature"
              value={data.userSignature}
              defaultValue={defaultUserSignature}
              onChange={(userSignature) => onChange({ userSignature })}
            />
            <ImageSourceField
              label="Driver signature"
              value={data.driverSignature}
              defaultValue={defaultDriverSignature}
              onChange={(driverSignature) => onChange({ driverSignature })}
            />
            <RangeField
              label="Your signature rotation"
              unit="°"
              min={-MAX_ROTATION}
              max={MAX_ROTATION}
              value={data.userSignaturePlacement.rotate}
              onChange={(rotate) =>
                onChange({ userSignaturePlacement: { ...data.userSignaturePlacement, rotate } })
              }
            />
            <RangeField
              label="Driver signature rotation"
              unit="°"
              min={-MAX_ROTATION}
              max={MAX_ROTATION}
              value={data.driverSignaturePlacement.rotate}
              onChange={(rotate) =>
                onChange({ driverSignaturePlacement: { ...data.driverSignaturePlacement, rotate } })
              }
            />
            <div className={wideFieldClass}>
              <div className={actionsClass}>
                <span className={cx(hintClass, 'mr-auto')}>
                  Drag the signatures on the preview to move them
                </span>
                <button
                  type="button"
                  className={buttonClass('ghost')}
                  onClick={() =>
                    onChange({
                      userSignaturePlacement: randomPlacement(USER_SIGNATURE_JITTER),
                      driverSignaturePlacement: randomPlacement(DRIVER_SIGNATURE_JITTER),
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
    const userSignature = signatureSrc(data.userSignature)
    const driverSignature = signatureSrc(data.driverSignature)

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
          {userSignature && (
            <DraggableImage
              imageClassName="max-h-16 max-w-52"
              src={userSignature}
              alt="Employee signature"
              placement={data.userSignaturePlacement}
              onPlacementChange={(userSignaturePlacement) => onChange({ userSignaturePlacement })}
            />
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
          {driverSignature && (
            <DraggableImage
              className="absolute top-12 left-12"
              imageClassName="max-h-14 max-w-24"
              src={driverSignature}
              alt="Driver signature"
              placement={data.driverSignaturePlacement}
              onPlacementChange={(driverSignaturePlacement) =>
                onChange({ driverSignaturePlacement })
              }
            />
          )}
        </div>
      </Paper>
    )
  },
})
