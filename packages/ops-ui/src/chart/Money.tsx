import { mul, parseDecimal, round, toDecimalString, type DecimalString } from '@indus/ops-core'
import { formatMoney } from '../format'
import { cn } from '../lib/cn'
import type { Ccy } from '../types'

/**
 * Amount sizes are a closed set of classes (no inline style). 20 is in the set because the L1 sheet
 * shows a 20px negative amount; the plan listed 13/15/18/24.
 */
export type MoneySize = 13 | 15 | 18 | 20 | 24

export interface MoneyProps {
  ccy: Ccy
  /** Decimal string from the database; "" or null-ish renders "—". */
  amount: DecimalString
  /** Show "≈ AED x at <ccy> 1 = <rate>" (ignored when ccy is AED). `label` replaces the "at …" text. */
  aed?: { rate: DecimalString; label?: string }
  /** Default 15. */
  size?: MoneySize
  /** doc: always 2 dp. list: no decimals when the value is whole. Default doc. */
  decimals?: 'doc' | 'list'
  className?: string
}

const SIZE: Record<MoneySize, string> = {
  13: 'text-[13px]',
  15: 'text-[15px]',
  18: 'text-[18px]',
  20: 'text-[20px]',
  24: 'text-[24px]',
}

/** Money with its currency code first (kit K-12 Money); negatives in brackets and bad. */
export default function Money({
  ccy,
  amount,
  aed,
  size = 15,
  decimals = 'doc',
  className,
}: MoneyProps) {
  const shown = formatMoney(ccy, amount, { decimals })
  const rate = aed && ccy !== 'AED' && !shown.empty ? aed.rate : undefined
  const equivalent =
    rate === undefined ? null : formatMoney('AED', toDecimalString(round(mul(amount, rate), 2), 2))
  return (
    <span className={cn('inline-flex flex-col gap-0.5', className)}>
      <span className="flex items-baseline gap-1.5">
        <span className="text-io-ink-3 text-[11.5px] font-medium tracking-[.02em]">{ccy}</span>
        {shown.empty ? (
          <span className={cn('text-io-ink-4', SIZE[size])}>{shown.amount}</span>
        ) : (
          <span
            className={cn(
              'font-medium tracking-[-.01em]',
              SIZE[size],
              shown.negative && 'text-io-bad'
            )}
          >
            {shown.amount}
          </span>
        )}
      </span>
      {rate !== undefined && equivalent !== null ? (
        <span className="text-io-ink-3 text-[11.5px]">
          ≈ <b className="text-io-ink-2 font-medium">{equivalent.text}</b>{' '}
          {aed?.label ?? `at ${ccy} 1 = ${toDecimalString(parseDecimal(rate))}`}
        </span>
      ) : null}
    </span>
  )
}
