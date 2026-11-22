import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import CardLink from './CardLink'

export interface ContactRow {
  label: string
  value: ReactNode
  href?: string
}

export interface ContactProps {
  eyebrow: string
  rows: ContactRow[]
  className?: string
}

/** Card kit contact card (`kr-ct`): white, line, radius 10, p 14×16; a <dl> of rows, label 70 / 1fr, 12.5. */
export default function Contact({ eyebrow, rows, className }: ContactProps) {
  return (
    <div
      data-part="contact"
      className={cn(
        'rounded-io-card border-io-line bg-io-card flex w-full min-w-0 flex-col gap-[9px] border px-4 py-3.5 text-[12.5px] leading-[1.45]',
        className
      )}
    >
      <span className="io-eyebrow">{eyebrow}</span>
      <dl className="m-0 flex flex-col gap-[9px]">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[70px_minmax(0,1fr)] gap-2">
            <dt className="text-io-ink-3">{r.label}</dt>
            <dd className="m-0 min-w-0">
              {r.href !== undefined ? <CardLink href={r.href}>{r.value}</CardLink> : r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
