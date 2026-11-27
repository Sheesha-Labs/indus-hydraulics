import { formatDecimal } from '@indus/ops-core'
import { Chip } from '@indus/ops-ui/status'
import type { Tone } from '@indus/ops-ui/types'
import type { Route } from 'next'
import Link from 'next/link'
import type {
  EnquiryOverview,
  LineChip,
  OverviewActivity,
  OverviewLine,
} from '../../data/enquiry-overview'

/**
 * Board 05 · Overview parts (S09-T03, `#s05`): the line table (the spine), Coverage, the dark Estimate snapshot,
 * Supplier RFQs and the activity rail. Server components; the filter chips are links (URL state).
 */

const CHIP_TONE: Record<LineChip, Tone> = {
  Unallocated: 'n',
  Awaiting: 'warn',
  Quoted: 'ok',
  'On hold': 'warn',
  'No source': 'bad',
  'To follow': 'warn',
  'Not quoted': 'n',
  Regretted: 'n',
  Cancelled: 'n',
}

export type LineFilter = 'all' | 'awaiting' | 'multi'

function pill(on: boolean) {
  return on
    ? 'bg-io-navy text-io-paper border-io-navy'
    : 'border-io-line text-io-ink hover:border-io-stroke-hover'
}

export function LineTable({
  o,
  filter,
  hrefFor,
}: {
  o: EnquiryOverview
  filter: LineFilter
  hrefFor: (f: LineFilter) => string
}) {
  const rows = o.lines.filter((l) =>
    filter === 'awaiting' ? l.chip === 'Awaiting' : filter === 'multi' ? l.quotedBy > 1 : true
  )
  const chips: Array<[LineFilter, string]> = [
    ['all', 'All'],
    ['awaiting', `Awaiting ${o.counts.awaiting}`],
    ['multi', `Multi-source ${o.counts.multi}`],
  ]
  const grid = 'grid grid-cols-[28px_150px_minmax(0,1fr)_44px_92px_100px_96px] gap-3'
  return (
    <section
      aria-labelledby="line-items"
      data-part="line-table"
      className="bg-io-card border-io-line rounded-io-card overflow-hidden border"
    >
      <div className="border-io-line flex items-center justify-between border-b px-[18px] py-3.5">
        <h2 id="line-items" className="io-eyebrow m-0 text-[10.5px] tracking-[0.13em]">
          Line items · {o.lines.length}
        </h2>
        <nav aria-label="Line filter" className="flex gap-1.5 text-[12px]">
          {chips.map(([k, label]) => (
            <Link
              key={k}
              href={hrefFor(k) as Route}
              aria-current={filter === k ? 'page' : undefined}
              className={`io-focus rounded-io-pill border px-2.5 py-1 ${pill(filter === k)}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div role="table" aria-labelledby="line-items">
        <div
          role="row"
          className={`${grid} border-io-line text-io-ink-3 border-b px-[18px] py-2.5 text-[10.5px] font-medium tracking-[0.08em] uppercase`}
        >
          <span role="columnheader">#</span>
          <span role="columnheader">Client PN</span>
          <span role="columnheader">Description</span>
          <span role="columnheader" className="text-right">
            Qty
          </span>
          <span role="columnheader">Sent to</span>
          <span role="columnheader">Best cost</span>
          <span role="columnheader">Status</span>
        </div>
        {rows.length === 0 ? (
          <p className="text-io-ink-3 m-0 px-[18px] py-4 text-[12.5px]">
            {o.lines.length === 0 ? 'Lines are being read.' : 'No line matches this filter.'}
          </p>
        ) : (
          rows.map((l) => <LineRow key={l.id} l={l} grid={grid} masked={o.masked} />)
        )}
      </div>
    </section>
  )
}

function LineRow({ l, grid, masked }: { l: OverviewLine; grid: string; masked: boolean }) {
  return (
    <div
      role="row"
      data-line={l.no}
      className={`${grid} border-io-line hover:bg-io-row-hover items-center border-b px-[18px] py-[11px] text-[12.5px] last:border-b-0`}
    >
      <span role="cell" className="text-io-ink-3">
        {l.no}
      </span>
      <span role="cell" className="truncate text-[11px]">
        {l.clientPartNo ?? '—'}
      </span>
      <span role="cell" className="truncate" title={l.description}>
        {l.description}
      </span>
      <span role="cell" className="text-right">
        {l.qty}
      </span>
      <span role="cell" className="text-io-ink-2 truncate text-[11px]">
        {l.sentTo.length ? l.sentTo.join(' · ') : '—'}
      </span>
      <span role="cell" className="truncate text-[11.5px]">
        {masked ? <span className="text-io-ink-3">Hidden</span> : (l.bestCost ?? '—')}
      </span>
      <span role="cell" className="justify-self-start">
        <Chip
          tone={CHIP_TONE[l.chip]}
          label={l.chip === 'Quoted' ? `Quoted · ${l.quotedBy}` : l.chip}
        />
      </span>
    </div>
  )
}

const EYEBROW = 'io-eyebrow m-0 text-[10.5px] tracking-[0.13em]'

export function CoverageCard({ o }: { o: EnquiryOverview }) {
  const { quoted, total, segments, note } = o.coverage
  return (
    <section
      aria-labelledby="coverage"
      className="bg-io-card border-io-line rounded-io-card flex flex-col gap-2.5 border p-5"
    >
      <h2 id="coverage" className={EYEBROW}>
        Coverage
      </h2>
      <div className="flex items-baseline gap-2">
        <span className="io-display text-[44px] leading-none">
          {quoted} / {total}
        </span>
        <span className="text-io-ink-3 text-[12.5px]">lines quoted</span>
      </div>
      {total > 0 ? (
        <svg
          role="img"
          aria-label={`${quoted} of ${total} lines quoted`}
          className="block h-2 w-full"
          viewBox={`0 0 ${total * 10} 8`}
          preserveAspectRatio="none"
        >
          {segments.map((s, i) => (
            <rect
              key={`seg-${String(i)}`}
              x={i * 10 + (i ? 0.15 : 0)}
              width={10 - (i ? 0.3 : 0.15)}
              height="8"
              rx="0.4"
              className={
                s === 'quoted'
                  ? 'fill-io-accent'
                  : s === 'awaiting'
                    ? 'fill-io-warn-solid'
                    : 'fill-io-fill'
              }
            />
          ))}
        </svg>
      ) : null}
      {note ? <p className="text-io-ink-2 m-0 text-[12px]">{note}</p> : null}
    </section>
  )
}

function aed(v: string): string {
  const f = formatDecimal(v, 0)
  return `${f.negative ? '−' : ''}AED ${f.digits}`
}

export function EstimateCard({ o }: { o: EnquiryOverview }) {
  if (o.masked || !o.estimate)
    return (
      <section
        aria-labelledby="estimate"
        data-part="estimate"
        className="bg-io-navy text-io-paper rounded-io-card flex flex-col gap-2 p-5"
      >
        <h2
          id="estimate"
          className="m-0 text-[10.5px] font-medium tracking-[0.13em] uppercase opacity-60"
        >
          Estimate snapshot
        </h2>
        <p className="m-0 text-[13px]">Margins hidden for your role.</p>
      </section>
    )
  const e = o.estimate
  return (
    <section
      aria-labelledby="estimate"
      data-part="estimate"
      className="bg-io-navy text-io-paper rounded-io-card flex flex-col gap-3 p-5"
    >
      <h2
        id="estimate"
        className="m-0 text-[10.5px] font-medium tracking-[0.13em] uppercase opacity-60"
      >
        Estimate snapshot
      </h2>
      <div className="flex flex-col">
        <span className="io-display text-[36px] leading-none">{aed(e.sellAed)}</span>
        <span className="text-[12px] opacity-65">
          Sell value, {e.pricedLines} priced line{e.pricedLines === 1 ? '' : 's'}, ex VAT
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 border-t border-white/15 pt-3">
        <div className="flex flex-col">
          <span className="text-[11.5px] opacity-60">Gross profit</span>
          <span className="text-[16px] font-medium">{aed(e.gpAed)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11.5px] opacity-60">Margin</span>
          <span className="text-[16px] font-medium">
            {e.marginPct === null ? '—' : `${e.marginPct}%`}
          </span>
        </div>
      </div>
      {e.pricedLines > 0 && e.fallbackUsed.length ? (
        <p className="m-0 truncate text-[11.5px] opacity-65" title={e.fallbackUsed.join(' · ')}>
          <span aria-hidden="true">
            Default rates: {e.fallbackUsed.map((f) => f.split(' at ')[0]!.toLowerCase()).join(', ')}
          </span>
          <span className="sr-only">{e.fallbackUsed.join('. ')}.</span>
        </p>
      ) : null}
    </section>
  )
}

const RFQ_TONE: Record<string, Tone> = {
  Quoted: 'ok',
  Partial: 'warn',
  Sent: 'acc',
  Drafted: 'n',
  Closed: 'n',
  Withdrawn: 'n',
}

export function RfqCard({ o }: { o: EnquiryOverview }) {
  return (
    <section
      aria-labelledby="supplier-rfqs"
      className="bg-io-card border-io-line rounded-io-card border px-5 pt-5 pb-2"
    >
      <h2 id="supplier-rfqs" className={EYEBROW}>
        Supplier RFQs
      </h2>
      {o.rfqs.length === 0 ? (
        <p className="text-io-ink-3 m-0 py-3 text-[12.5px]">No supplier RFQs yet.</p>
      ) : (
        <ul className="m-0 mt-2.5 flex list-none flex-col p-0">
          {o.rfqs.map((r) => (
            <li
              key={r.ref}
              className="border-io-line flex items-center justify-between border-t py-2.5 text-[12.5px]"
            >
              <span className="text-[11.5px]">{r.ref}</span>
              <span className="text-io-ink-3">{r.lines} lines</span>
              <Chip tone={RFQ_TONE[r.status] ?? 'n'} label={r.status} size="sm" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const DOT: Record<OverviewActivity['actor'], string> = {
  assistant: 'bg-io-accent',
  person: 'bg-io-navy',
  system: 'bg-io-stroke',
}

export function ActivityRail({ items }: { items: OverviewActivity[] }) {
  return (
    <section
      aria-labelledby="activity"
      className="bg-io-card border-io-line rounded-io-card flex flex-col gap-3 border p-5"
    >
      <h2 id="activity" className={EYEBROW}>
        Activity
      </h2>
      {items.length === 0 ? (
        <p className="text-io-ink-3 m-0 text-[12.5px]">Nothing recorded yet.</p>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {items.map((a) => (
            <li key={a.id} className="grid grid-cols-[10px_minmax(0,1fr)] gap-2 text-[12px]">
              <span
                aria-hidden="true"
                className={`rounded-io-pill mt-1.5 h-2 w-2 ${DOT[a.actor]}`}
              />
              <span>
                <span className="text-io-ink-3">
                  <time dateTime={a.at.toISOString()}>
                    {TIME.format(a.at).replace('Sept', 'Sep')}
                  </time>
                  {' · '}
                  {a.actor === 'assistant'
                    ? 'Assistant'
                    : a.actor === 'person'
                      ? (a.initials ?? 'Person')
                      : 'System'}
                </span>
                <br />
                {a.text}
                {a.actionId ? (
                  <>
                    {' '}
                    <Link
                      href={`/why/ae_${a.id}` as Route}
                      className="text-io-accent io-focus rounded-io-tag underline underline-offset-2"
                    >
                      Why?
                    </Link>
                  </>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
