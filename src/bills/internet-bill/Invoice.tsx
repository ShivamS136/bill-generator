import type { CSSProperties, ReactNode } from 'react'
import { Paper } from '../../components/preview/Paper'
import { PDF_KEEP_ATTR } from '../../lib/export'
import { isSafeImageSrc } from '../../lib/image'
import {
  charges,
  defaultDescription,
  type InternetBillData,
  invoiceDate,
  themeColours,
} from './data'

const cellClass = 'border-2 border-(--theme) px-3 py-2'
const headerCellClass =
  'border-x border-y-2 border-x-white/50 border-y-(--theme) bg-(--theme) px-3 py-2 font-normal text-(--on-theme) first:border-l-(--theme) last:border-r-(--theme)'

const keep = { [PDF_KEEP_ATTR]: '' }

const GST_CATEGORY = 'TELECOMMUNICATION SERVICE'

const TAX_HEADINGS = [
  'Taxable Amount',
  'CGST Rate%',
  'CGST Amount',
  'SGST Rate%',
  'SGST Amount',
  'Payments Received',
]

// html2canvas misplaces list markers, so the numbers are written out.
const terms = (provider: string) => [
  `Cheques to be in favour of "${provider}".`,
  'In case of cheque bounce, 100/- penalty will be applicable.',
  `${provider} Shall levy late fee charge in case the bill is paid after the due date`,
  'In case of overdue, the right to deactivate your services, is reserved.',
  'This Invoice is system generated hence signature and stamp is not required',
]

export function Invoice({ data }: { data: InternetBillData }) {
  const colours = themeColours(data)
  const amounts = charges(data)
  const address = data.providerAddress.trim()
  const style = {
    '--theme': colours.theme,
    '--on-theme': colours.onTheme,
    '--title-on-theme': colours.titleOnTheme,
    backgroundColor: colours.background,
  } as CSSProperties

  return (
    <Paper flow className="flex flex-col p-5 font-paper text-base/6 text-neutral-900">
      <div className="flex flex-1 flex-col border border-neutral-800 *:shrink-0" style={style}>
        <header className="relative flex items-start font-bold" {...keep}>
          <p className="absolute top-1 right-2 font-normal">(Receipt for the Recipient)</p>
          <div className="w-47 shrink-0 rounded-br-xl bg-white pt-13 pr-1.5 pb-4 pl-6">
            {isSafeImageSrc(data.logo) && (
              <img
                className="mx-auto mb-3 block h-9 max-w-full object-contain"
                src={data.logo}
                alt="Logo"
                crossOrigin="anonymous"
              />
            )}
            <p>{data.providerName}</p>
            <p className="whitespace-pre-line">{address}</p>
          </div>
          <div className="mt-22 ml-8 w-48 shrink-0 font-normal">
            <Detail label="Name">{data.customerName}</Detail>
            <p className="whitespace-pre-line">{data.customerAddress.trim()}</p>
            <Detail label="Account Number">{data.accountNumber}</Detail>
          </div>
          <div className="mt-22 mr-7 ml-auto pl-2 text-right font-normal">
            <Detail label="Invoice No">{data.invoiceNumber}</Detail>
            <Detail label="Account No">{data.accountNumber}</Detail>
            <Detail label="Bill Date">{invoiceDate(data.billDate)}</Detail>
            {data.gstNumber.trim() && (
              <>
                <Detail label="GST No">{data.gstNumber.trim()}</Detail>
                <Detail label="GST Category">{GST_CATEGORY}</Detail>
              </>
            )}
          </div>
        </header>

        <section className="mt-20 px-7" {...keep}>
          <table className="w-full border-collapse bg-white text-center">
            <thead>
              <tr>
                {TAX_HEADINGS.map((label) => (
                  <th key={label} className={cellClass}>
                    <TwoLines text={label} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={cellClass}>{amounts.taxable}</td>
                <td className={cellClass}>{amounts.rate}</td>
                <td className={cellClass}>{amounts.gst}</td>
                <td className={cellClass}>{amounts.rate}</td>
                <td className={cellClass}>{amounts.gst}</td>
                <td className={cellClass}>{amounts.paid}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <PlanTable title="Service Plan Summary" data={data}>
          <Row
            header
            cells={['Plan Speed', 'Plan Package', 'Plan Validity', 'Discount', 'Plan Amount']}
          />
          <Row
            cells={[
              data.planSpeed,
              data.planPackage,
              data.planValidity,
              amounts.discount,
              amounts.amount,
            ]}
          />
        </PlanTable>

        <PlanTable title="Receipt Details" data={data}>
          <Row header cells={['Invoice No.', 'Internet Service Description', 'Amount Incl. Tax']} />
          <Row
            cells={[
              data.invoiceNumber,
              data.description.trim() || defaultDescription(data),
              amounts.paid,
            ]}
          />
        </PlanTable>

        {address && (
          <p className="mt-16 whitespace-pre-line px-14 text-center" {...keep}>
            Registered office address: {address.replace(/[.,]?$/, '.')}
          </p>
        )}

        <section className="mx-7 mt-16 overflow-hidden rounded-4xl bg-white" {...keep}>
          <h2 className="bg-(--theme) px-4 py-6 font-bold text-(--title-on-theme) text-2xl/8">
            Terms and Conditions
          </h2>
          <ol className="grid gap-1.5 px-5 pt-6 pb-9">
            {terms(data.providerName).map((term, index) => (
              <li key={term}>
                {index + 1}. {term}
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-7 mt-16 flex flex-1 shrink flex-col" {...keep}>
          <h2 className="bg-(--theme) py-2 text-center font-bold text-(--on-theme)">
            Acknowledgement Slip
          </h2>
          <p className="flex flex-1 flex-wrap content-start gap-x-3.5 gap-y-3.5 bg-white px-2 py-2">
            <span>AccountNo : {data.accountNumber}</span>
            <span>Subscriber Name : {data.customerName}</span>
            <span>Payment Method : {data.paymentMethod}</span>
            <span>Invoice No : {data.invoiceNumber}</span>
          </p>
        </section>
      </div>
    </Paper>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p>
      <strong>{label}:</strong> {children}
    </p>
  )
}

function TwoLines({ text }: { text: string }) {
  const [first, ...rest] = text.split(' ')
  return (
    <>
      {first}
      <br />
      {rest.join(' ')}
    </>
  )
}

interface PlanTableProps {
  title: string
  data: InternetBillData
  children: ReactNode
}

function PlanTable({ title, data, children }: PlanTableProps) {
  return (
    <section className="mt-9 px-3.5" {...keep}>
      <div className="mx-3.5 flex gap-7 whitespace-nowrap border-(--theme) border-2 border-b-0 px-4 py-1.5">
        <strong>{title}</strong>
        <span>Account No: {data.accountNumber}</span>
        <span>User Name: {data.customerName}</span>
      </div>
      <table className="w-full border-collapse text-center">
        <tbody>{children}</tbody>
      </table>
    </section>
  )
}

function Row({ cells, header }: { cells: ReactNode[]; header?: boolean }) {
  const Cell = header ? 'th' : 'td'
  return (
    <tr>
      {cells.map((cell, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: columns are fixed
        <Cell key={index} className={header ? headerCellClass : cellClass}>
          {cell}
        </Cell>
      ))}
    </tr>
  )
}
