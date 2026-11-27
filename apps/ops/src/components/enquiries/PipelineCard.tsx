import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { PipelineCardData } from '../../data/enquiries'

/**
 * Board 04 card (`#s04`): ref and due date, title, client, the coverage bar (SVG: the fill is a presentation
 * attribute, never a style) with its label, and the value. The title link is stretched over the card; the
 * "Move to…" control (`menu`) sits above it in the stacking order.
 */
export default function PipelineCard({ card, menu }: { card: PipelineCardData; menu?: ReactNode }) {
  return (
    <div className="relative flex flex-col gap-2">
      <div className="text-io-ink-3 flex justify-between text-[11px]">
        <span>{card.ref}</span>
        <span>{card.due ?? 'No deadline'}</span>
      </div>
      <Link
        href={`/enquiries/${card.ref}` as Route}
        className="io-focus rounded-io-tag text-[13px] leading-[1.3] font-medium after:absolute after:inset-0 after:content-['']"
      >
        {card.title}
      </Link>
      <span className="text-io-ink-3 text-[12px]">{card.clientName ?? 'Client not set'}</span>
      <svg aria-hidden="true" className="block h-1 w-full">
        <rect width="100%" height="4" rx="2" className="fill-io-fill" />
        <rect width={`${card.cov}%`} height="4" rx="2" className="fill-io-accent" />
      </svg>
      <div className="flex items-center justify-between gap-2">
        <span className="text-io-ink-3 text-[11px]">{card.covLabel}</span>
        <span className="text-[12px] font-medium whitespace-nowrap">{card.value ?? ''}</span>
      </div>
      {menu ? <div className="absolute -top-1 right-5 z-10">{menu}</div> : null}
    </div>
  )
}
