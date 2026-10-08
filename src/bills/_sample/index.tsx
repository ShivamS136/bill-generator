import {
  AmountField,
  FieldGrid,
  FormSection,
  TextAreaField,
  TextField,
} from '../../components/form/fields'
import { SignatureField } from '../../components/form/SignatureField'
import { Paper } from '../../components/preview/Paper'
import { amountInWords, formatDate, formatINR, todayISO } from '../../lib/format'
import { isImageDataUrl } from '../../lib/image'
import { defineBill } from '../types'

interface SampleData {
  receiptNo: string
  date: string
  payer: string
  payee: string
  amount: string
  purpose: string
  signature: string
}

export const sampleBill = defineBill<SampleData>({
  initialData: () => ({
    receiptNo: '001',
    date: todayISO(),
    payer: '',
    payee: '',
    amount: '',
    purpose: '',
    signature: '',
  }),

  fileName: (data) => `sample-receipt-${data.receiptNo || 'draft'}`,

  Form: ({ data, onChange }) => (
    <>
      <FormSection title="Receipt details">
        <FieldGrid>
          <TextField
            label="Receipt No."
            value={data.receiptNo}
            onChange={(receiptNo) => onChange({ receiptNo })}
          />
          <TextField
            label="Date"
            type="date"
            value={data.date}
            onChange={(date) => onChange({ date })}
          />
          <TextField
            label="Received from"
            required
            placeholder="Payer name"
            value={data.payer}
            onChange={(payer) => onChange({ payer })}
          />
          <TextField
            label="Received by"
            required
            placeholder="Payee name"
            value={data.payee}
            onChange={(payee) => onChange({ payee })}
          />
          <AmountField
            label="Amount (₹)"
            required
            value={data.amount}
            onChange={(amount) => onChange({ amount })}
          />
          <TextAreaField
            label="Purpose"
            rows={2}
            placeholder="What was this payment for?"
            value={data.purpose}
            onChange={(purpose) => onChange({ purpose })}
          />
        </FieldGrid>
      </FormSection>
      <FormSection title="Signature">
        <SignatureField
          label="Payee signature"
          value={data.signature}
          onChange={(signature) => onChange({ signature })}
        />
      </FormSection>
    </>
  ),

  Preview: ({ data }) => (
    <Paper className="px-18 py-16 font-paper text-base leading-relaxed">
      <h1 className="mb-6 text-center font-bold text-2xl">Payment Receipt</h1>
      <div className="mb-6 flex justify-between">
        <span>
          <strong>Receipt No:</strong> {data.receiptNo}
        </span>
        <span>
          <strong>Date:</strong> {formatDate(data.date)}
        </span>
      </div>
      <p className="text-justify">
        Received a sum of <strong>{formatINR(data.amount)}</strong> (
        {amountInWords(data.amount || 0)}) from <strong>{data.payer || 'Payer Name'}</strong>
        {data.purpose ? ` towards ${data.purpose}` : ''}.
      </p>
      <div className="mt-16 ml-auto grid w-56 justify-items-center">
        {isImageDataUrl(data.signature) ? (
          <img className="h-16 w-48 object-contain" src={data.signature} alt="" />
        ) : (
          <div className="h-16 w-48" />
        )}
        <span className="w-full border-neutral-900 border-t pt-1.5 text-center">
          {data.payee || 'Payee Name'}
        </span>
      </div>
    </Paper>
  ),
})
