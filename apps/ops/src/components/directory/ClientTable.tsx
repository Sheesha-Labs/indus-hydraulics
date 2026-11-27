import { ButtonLink } from '@indus/ops-ui/controls'
import { EmptyState } from '@indus/ops-ui/states'
import { Chip } from '@indus/ops-ui/status'
import type { Route } from 'next'
import Link from 'next/link'
import type { ClientList } from '../../data/clients'

/**
 * Board 11 · the clients table (S10-T02, `#s11`), ranked by enquiry flow: Client (initials, name, place) ·
 * Industry · Enquiries · Leads · RFQs · Quoted · Won · Win · Last RFQ. Values are AED year to date. The row's name
 * links to the profile; paging is a link (URL state).
 */
const GRID =
  'grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_80px_70px_70px_100px_100px_70px_80px] items-center gap-3'

export default function ClientTable({
  list,
  nextHref,
  firstHref,
}: {
  list: ClientList
  nextHref: string | null
  firstHref: string | null
}) {
  if (!list.rows.length)
    return (
      <EmptyState
        title="No clients yet"
        text="Clients appear as enquiries come in or after the history import."
        align="left"
      />
    )
  return (
    <div className="flex flex-col gap-3">
      <div
        role="table"
        aria-label="Clients"
        className="bg-io-card border-io-line rounded-io-card overflow-hidden border"
      >
        <div
          role="row"
          className={`${GRID} border-io-line text-io-ink-3 border-b px-[18px] py-3.5 text-[10.5px] font-medium tracking-[0.1em] uppercase`}
        >
          <span role="columnheader">Client</span>
          <span role="columnheader">Industry</span>
          <span role="columnheader" className="text-right">
            Enquiries
          </span>
          <span role="columnheader" className="text-right">
            Leads
          </span>
          <span role="columnheader" className="text-right">
            RFQs
          </span>
          <span role="columnheader" className="text-right">
            Quoted
          </span>
          <span role="columnheader" className="text-right">
            Won
          </span>
          <span role="columnheader" className="text-right">
            Win
          </span>
          <span role="columnheader" className="text-right">
            Last RFQ
          </span>
        </div>
        {list.rows.map((r) => (
          <div
            role="row"
            key={r.id}
            data-client={r.id}
            className={`${GRID} border-io-line hover:bg-io-row-hover relative border-b px-[18px] py-[15px] text-[12.5px] last:border-b-0`}
          >
            <span role="cell" className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="bg-io-accent-tint text-io-accent rounded-io-ctl flex size-8 flex-none items-center justify-center text-[11px] font-semibold"
              >
                {r.initials}
              </span>
              <span className="flex min-w-0 flex-col">
                <Link
                  href={`/clients/${r.id}` as Route}
                  className="io-focus rounded-io-tag truncate text-[13px] font-medium after:absolute after:inset-0 after:content-['']"
                >
                  {r.name}
                </Link>
                <span className="text-io-ink-3 truncate text-[12px]">
                  {r.place ?? '—'}
                  {r.creditHold ? ' · ' : ''}
                </span>
              </span>
              {r.creditHold ? <Chip tone="warn" label="Credit hold" size="sm" /> : null}
            </span>
            <span role="cell" className="truncate">
              {r.industry ?? '—'}
            </span>
            <span role="cell" className="text-right">
              {r.enquiries}
            </span>
            <span role="cell" className="text-right">
              {r.leads}
            </span>
            <span role="cell" className="text-right">
              {r.rfqs}
            </span>
            <span role="cell" className="text-right">
              {r.quoted}
            </span>
            <span role="cell" className="text-right">
              {r.won}
            </span>
            <span role="cell" className="text-right font-medium">
              {r.win ?? '—'}
            </span>
            <span role="cell" className="text-io-ink-3 text-right">
              {r.lastRfq ?? '—'}
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
