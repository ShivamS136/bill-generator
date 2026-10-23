import '@fontsource/press-start-2p/400.css'
import { type ReactNode, useEffect, useState } from 'react'
import { cx } from '../../lib/cx'
import { EXPORT_IMAGE_ATTR } from '../../lib/export'
import { formatDate } from '../../lib/format'
import { isSafeImageSrc, toThermalInk } from '../../lib/image'
import { paperBackground } from '../../lib/paper-texture'
import { type FuelBillData, NOT_ENTERED, toMoney, volume } from './data'

export function Receipt({ data }: { data: FuelBillData }) {
  const rate = toMoney(data.rate)
  const amount = toMoney(data.amount)
  const station = [data.stationName, data.stationAddress]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className="relative w-thermal-width overflow-hidden bg-white pt-5 pr-8 pb-8 pl-4 font-receipt text-neutral-700 text-receipt text-shadow-thermal shadow-paper"
      style={paperBackground(data.paper, data.paperSeed)}
      {...{ [EXPORT_IMAGE_ATTR]: '' }}
    >
      <RollMarks text={data.rollText} serial={data.rollSerial} />
      <Logo src={data.logo} />
      <p className="text-center">WELCOME!!!</p>
      <p className="uppercase">{station}</p>

      <Lines className="mt-2">
        <Line label="Tel. No.">{data.telephone}</Line>
        <Line label="Receipt No.">{data.receiptNumber}</Line>
        <Line label="FCC ID">{data.fccId}</Line>
        <Line label="FIP No.">{data.fipNumber}</Line>
        <Line label="Nozzle No.">{data.nozzleNumber}</Line>
      </Lines>

      <Lines className="mt-4">
        <Line label="PRODUCT">{data.product}</Line>
        <Line label="RATE/LTR">{rate !== undefined && <Rupees value={rate} />}</Line>
        <Line label="AMOUNT">{amount !== undefined && <Rupees value={amount} />}</Line>
        <Line label="VOLUME(LTR.)">{volume(data) && `${volume(data)} lt`}</Line>
      </Lines>

      <Lines className="mt-9">
        <Line label="VEH TYPE">{data.vehicleType}</Line>
        <Line label="VEH NO">{data.vehicleNumber.trim() || NOT_ENTERED}</Line>
        <Line label="CUSTOMER NAME">{data.customerName.trim() || NOT_ENTERED}</Line>
        <div className="flex gap-4">
          <p className="w-3/5">Date: {formatDate(data.date)}</p>
          <p className="w-2/5">Time: {data.time}</p>
        </div>
        <Line label="MODE">{data.paymentMode}</Line>
        <Line label="LST No.">{data.lstNumber}</Line>
        <Line label="VAT No.">{data.vatNumber}</Line>
        <Line label="ATTENDENT ID">{data.attendantId}</Line>
      </Lines>

      <p className="mt-1 whitespace-pre-line text-center uppercase">{data.footer}</p>
    </div>
  )
}

function Logo({ src }: { src: string }) {
  const [ink, setInk] = useState({ src: '', url: '' })

  useEffect(() => {
    if (!isSafeImageSrc(src)) return
    let active = true
    toThermalInk(src).then((url) => active && setInk({ src, url }))
    return () => {
      active = false
    }
  }, [src])

  if (!isSafeImageSrc(src) || ink.src !== src) return null
  return (
    <img
      className="mx-auto mb-3 block max-h-20 max-w-32 object-contain"
      src={ink.url}
      alt="Logo"
      crossOrigin="anonymous"
    />
  )
}

function Lines({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('grid gap-2.5 pl-1', className)}>{children}</div>
}

function Line({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <p>
      {label}: {children}
    </p>
  )
}

function Rupees({ value }: { value: number }) {
  return (
    <>
      <span className="font-sans text-receipt-symbol">₹</span> {value.toFixed(2)}
    </>
  )
}

function RollMarks({ text, serial }: { text: string; serial: string }) {
  const bank = text.trim()
  const number = serial.trim()
  if (!bank && !number) return null
  return ['top-1/24', 'top-1/2'].map((top) => (
    <span
      key={top}
      className={cx(
        'absolute right-0 flex items-center gap-8 whitespace-nowrap font-sans text-shadow-none text-xs leading-none',
        top,
      )}
      style={{ transform: 'rotate(-90deg) translateY(-100%)', transformOrigin: 'top right' }}
    >
      {bank && (
        <span className="flex items-center gap-0">
          {/hdfc/i.test(bank) && (
            <span className="text-neutral-900/55">
              <HdfcMark />
            </span>
          )}
          <span className="bg-neutral-400/55 px-1.5 py-0.5 font-bold text-white/90 uppercase">
            {bank}
          </span>
        </span>
      )}
      {number && <span className="text-[7px] text-neutral-900/55">{number}</span>}
    </span>
  ))
}

function HdfcMark() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="#cbcbcb" aria-hidden="true">
      <path d="M0 0H11V6H6V11H0ZM13 0H24V11H18V6H13ZM24 13V24H13V18H18V13ZM0 13H6V18H11V24H0ZM9 9H15V15H9Z" />
    </svg>
  )
}
