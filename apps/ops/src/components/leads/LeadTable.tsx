import { ButtonLink } from '@indus/ops-ui/controls'
import { EmptyState } from '@indus/ops-ui/states'
import { Chip } from '@indus/ops-ui/status'
import type { Tone } from '@indus/ops-ui/types'
import type { Route } from 'next'
import Link from 'next/link'
import type { LeadList } from '../../data/leads'

/**
 * Board 03 · the leads table (S09-T05, `#s03`): Lead (title over the company) · Contact · Source · Interest ·
 * Est. value · Stage · Next action · owner. The row's title links to the lead; paging is a link (URL state).
 */
const TONE: Record<string, Tone> = {
  new: 'n',
  contacted: 'acc',
  qualified: 'acc',
  converted: 'ok',
  dropped: 'n',
}

const GRID =
  'grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_80px_100px_minmax(0,1fr)_40px] items-center gap-3'

export default function LeadTable({
  list,
  nextHref,
  firstHref,
}: {
  list: LeadList
  nextHref: string | null
  firstHref: string | null
}) {
  if (!list.rows.length)
    return (
      <EmptyState
        title="No leads here"
        text="Leads come from call-backs, the website, email intakes you place as a lead, and CSV imports."
        align="left"
      />
    )
  return (
    <div className="flex flex-col gap-3">
      <div
        role="table"
        aria-label="Leads"
        className="bg-io-card border-io-line rounded-io-card overflow-hidden border"
      >
        <div
          role="row"
          className={`${GRID} border-io-line text-io-ink-3 border-b px-[18px] py-3.5 text-[10.5px] font-medium tracking-[0.1em] uppercase`}
        >
          <span role="columnheader">Lead</span>
          <span role="columnheader">Contact</span>
          <span role="columnheader">Source</span>
          <span role="columnheader">Interest</span>
          <span role="columnheader" className="text-right">
            Est. value
          </span>
          <span role="columnheader">Stage</span>
          <span role="columnheader">Next action</span>
          <span role="columnheader" className="sr-only">
            Owner
          </span>
        </div>
        {list.rows.map((r) => (
          <div
            role="row"
            key={r.id}
            data-lead={r.ref}
            className={`${GRID} border-io-line hover:bg-io-row-hover relative border-b px-[18px] py-[15px] text-[12.5px] last:border-b-0`}
          >
            <span role="cell" className="flex min-w-0 flex-col">
              <Link
                href={`/enquiries/leads/${r.ref}` as Route}
                className="io-focus rounded-io-tag truncate text-[13px] font-medium after:absolute after:inset-0 after:content-['']"
              >
                {r.title}
              </Link>
              <span className="text-io-ink-3 truncate text-[12px]">{r.company ?? r.ref}</span>
            </span>
            <span role="cell" className="truncate">
              {r.contact ?? '—'}
            </span>
            <span role="cell" className="text-io-ink-3 truncate">
              {r.source}
            </span>
            <span role="cell" className="truncate">
              {r.interest ?? '—'}
            </span>
            <span role="cell" className="text-right font-medium">
              {r.value ?? '—'}
            </span>
            <span role="cell">
              <Chip tone={TONE[r.stage] ?? 'n'} label={r.stageWord} />
            </span>
            <span role="cell" className="truncate">
              {r.nextAction ?? '—'}
            </span>
            <span role="cell" className="justify-self-end">
              {r.owner ? (
                <span
                  aria-label={`Owner ${r.owner}`}
                  className="bg-io-fill text-io-ink-2 rounded-io-pill flex h-7 w-7 items-center justify-center text-[10.5px] font-semibold"
                >
                  {r.owner}
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>
      {nextHref || firstHref ? (
        <div className="flex gap-2">
          {firstHref ? (
            <ButtonLink href={firstHref} size="sm">
              First page
            </ButtonLink>
          ) : null}
          {nextHref ? (
            <ButtonLink href={nextHref} size="sm">
              Next 50
            </ButtonLink>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
