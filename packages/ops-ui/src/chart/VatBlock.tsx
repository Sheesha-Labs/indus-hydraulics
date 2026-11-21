import { formatDecimal, type VatRow } from '@indus/ops-core'
import { cn } from '../lib/cn'

export interface VatBlockRow {
  key: string
  label: string
  /** Already formatted, e.g. "10,938.00". */
  value: string
  kind?: 'total' | 'muted'
}

export interface VatBlockProps {
  rows: readonly VatBlockRow[]
  className?: string
}

/** vatRows() output → display rows: grouped digits, negatives in brackets. Formatting only. */
export function vatBlockRows(rows: readonly VatRow[]): VatBlockRow[] {
  return rows.map((r) => {
    const { negative, digits } = formatDecimal(r.value, 2)
    return {
      key: r.key,
      label: r.label,
      value: negative ? `(${digits})` : digits,
      ...(r.kind ? { kind: r.kind } : {}),
    }
  })
}

/**
 * The VAT summary card (kit K-12 VAT). It renders rows only: the arithmetic is vatRows() in
 * @indus/ops-core, shared with the PDF.
 */
export default function VatBlock({ rows, className }: VatBlockProps) {
  return (
    <dl
      className={cn(
        'rounded-io-card border-io-line bg-io-card flex w-full flex-col overflow-hidden border text-[12.5px]',
        className
      )}
    >
      {rows.map((r) => (
        <div
          key={r.key}
          data-kind={r.kind ?? 'row'}
          className={cn(
            'border-io-line-2 flex justify-between gap-3 border-b px-3.5 py-2 last:border-b-0',
            r.kind === 'total' && 'bg-io-paper font-medium',
            r.kind === 'muted' && 'text-io-ink-3'
          )}
        >
          <dt>{r.label}</dt>
          <dd className={cn(r.kind === 'total' && 'text-[14px]')}>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}
