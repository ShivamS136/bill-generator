import { CalendarPlus } from 'lucide-react'
import { ColorField } from '../../components/form/ColorField'
import {
  AmountField,
  FieldGrid,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from '../../components/form/fields'
import { ImageField } from '../../components/form/ImageField'
import { wideFieldClass } from '../../components/form/styles'
import { buttonClass } from '../../components/ui'
import { cx } from '../../lib/cx'
import type { BillFormProps } from '../types'
import {
  BACKGROUND_PRESETS,
  billFileName,
  defaultDescription,
  type InternetBillData,
  nextBill,
  THEME_PRESETS,
  VALIDITY_MONTHS,
} from './data'

const options = (values: readonly string[]) => values.map((value) => ({ value, label: value }))

const SPEED_OPTIONS = options([
  '30Mbps',
  '40Mbps',
  '50Mbps',
  '100Mbps',
  '150Mbps',
  '200Mbps',
  '300Mbps',
  '500Mbps',
  '1Gbps',
])

const PACKAGE_OPTIONS = options(['Unlimited', 'Limited', 'FUP'])

const VALIDITY_OPTIONS = options(Object.keys(VALIDITY_MONTHS))

const CURRENCY_OPTIONS = [
  { value: '', label: 'None (amounts only)' },
  { value: '₹', label: 'Indian Rupee – ₹' },
  { value: '$', label: 'US Dollar – $' },
  { value: '€', label: 'Euro – €' },
  { value: '£', label: 'Pound Sterling – £' },
]

const PAYMENT_OPTIONS = options([
  'Online',
  'UPI',
  'Net Banking',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Cheque',
])

const withCurrent = (list: { value: string; label: string }[], value: string) =>
  list.some((option) => option.value === value) ? list : [...list, { value, label: value }]

export function InternetBillForm({ data, onChange }: BillFormProps<InternetBillData>) {
  return (
    <>
      <FormSection title="Internet provider">
        <FieldGrid>
          <TextField
            label="Provider name"
            required
            value={data.providerName}
            onChange={(providerName) => onChange({ providerName })}
          />
          <TextField
            label="GST number"
            placeholder="e.g. 22AAAAA0000A1Z5"
            hint="Printed with the category Telecommunication Service"
            value={data.gstNumber}
            onChange={(gstNumber) => onChange({ gstNumber: gstNumber.toUpperCase() })}
          />
          <TextAreaField
            label="Provider address"
            hint="Also printed as the registered office address"
            rows={3}
            value={data.providerAddress}
            onChange={(providerAddress) => onChange({ providerAddress })}
          />
          <TextField
            label="Description"
            wide
            placeholder={defaultDescription(data)}
            hint="Leave blank to describe the plan automatically"
            value={data.description}
            onChange={(description) => onChange({ description })}
          />
          <div className={cx(wideFieldClass, 'flex flex-wrap items-end gap-x-5 gap-y-4')}>
            <div className="min-w-40 flex-1">
              <TextField
                label="Billing date"
                type="date"
                required
                value={data.billDate}
                onChange={(billDate) => onChange({ billDate, fileName: '' })}
              />
            </div>
            <div className="min-w-40 flex-1">
              <TextField
                label="Invoice number"
                required
                value={data.invoiceNumber}
                onChange={(invoiceNumber) => onChange({ invoiceNumber })}
              />
            </div>
            <button
              type="button"
              className={cx(buttonClass('ghost'), 'h-11')}
              title={`Move the billing date on by the plan validity (${data.planValidity.toLowerCase()}) and step the invoice number`}
              onClick={() => onChange(nextBill(data))}
            >
              <CalendarPlus className="size-4" aria-hidden="true" />
              Next bill
            </button>
          </div>
        </FieldGrid>
      </FormSection>

      <FormSection title="Customer">
        <FieldGrid>
          <TextField
            label="Customer name"
            required
            value={data.customerName}
            onChange={(customerName) => onChange({ customerName })}
          />
          <TextField
            label="Bill account number"
            required
            value={data.accountNumber}
            onChange={(accountNumber) => onChange({ accountNumber })}
          />
          <TextAreaField
            label="Customer address"
            rows={3}
            value={data.customerAddress}
            onChange={(customerAddress) => onChange({ customerAddress })}
          />
        </FieldGrid>
      </FormSection>

      <FormSection title="Plan">
        <FieldGrid>
          <SelectField
            label="Plan speed"
            required
            value={data.planSpeed}
            options={withCurrent(SPEED_OPTIONS, data.planSpeed)}
            onChange={(planSpeed) => onChange({ planSpeed })}
          />
          <SelectField
            label="Plan package"
            required
            value={data.planPackage}
            options={withCurrent(PACKAGE_OPTIONS, data.planPackage)}
            onChange={(planPackage) => onChange({ planPackage })}
          />
          <SelectField
            label="Plan validity"
            required
            value={data.planValidity}
            options={withCurrent(VALIDITY_OPTIONS, data.planValidity)}
            onChange={(planValidity) => onChange({ planValidity })}
          />
        </FieldGrid>
      </FormSection>

      <FormSection title="Payment">
        <FieldGrid>
          <AmountField
            label="Total plan amount"
            required
            value={data.amount}
            onChange={(amount) => onChange({ amount })}
          />
          <AmountField
            label="Discount"
            value={data.discount}
            onChange={(discount) => onChange({ discount })}
          />
          <SelectField
            label="Payment method"
            required
            value={data.paymentMethod}
            options={withCurrent(PAYMENT_OPTIONS, data.paymentMethod)}
            onChange={(paymentMethod) => onChange({ paymentMethod })}
          />
          <SelectField
            label="Currency symbol"
            value={data.currency}
            options={CURRENCY_OPTIONS}
            onChange={(currency) => onChange({ currency })}
          />
        </FieldGrid>
      </FormSection>

      <FormSection title="Branding">
        <FieldGrid>
          <ImageField label="Logo" value={data.logo} onChange={(logo) => onChange({ logo })} />
          <ColorField
            label="Theme colour"
            value={data.themeColour}
            presets={THEME_PRESETS}
            onChange={(themeColour) => onChange({ themeColour })}
          />
          <ColorField
            label="Background colour"
            value={data.backgroundColour}
            presets={BACKGROUND_PRESETS}
            onChange={(backgroundColour) => onChange({ backgroundColour })}
          />
        </FieldGrid>
      </FormSection>

      <FormSection title="Download">
        <FieldGrid>
          <TextField
            label="Download file name"
            hint="Regenerated when the billing date changes"
            wide
            value={billFileName(data)}
            onChange={(fileName) => onChange({ fileName })}
          />
        </FieldGrid>
      </FormSection>
    </>
  )
}
