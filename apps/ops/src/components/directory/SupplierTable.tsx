import { ButtonLink } from '@indus/ops-ui/controls'
import { EmptyState } from '@indus/ops-ui/states'
import { Chip } from '@indus/ops-ui/status'
import type { Route } from 'next'
import Link from 'next/link'
import { TIER_TONE, TIER_WORD, type SupplierList } from '../../data/suppliers'

/**
 * Board 128 · the suppliers table (S10-T03, `#s128`): Supplier (name and type tag) · Country · city · Tier ·
 * Categories · RFQs · Reply % · Median reply · Win % · Last · Currency. The name selects the row for the preview
 * (`?selected=`); "Open" goes to the profile. Flags (board 133) sit under the name.
 */
const GRID =
  'grid grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)_110px_minmax(0,1.6fr)_52px_56px_64px_52px_60px_44px] items-center gap-3'

export default function SupplierTable({
  list,
  selectedHref,
  selected,
  nextHref,
  firstHref,
  empty,
}: {
  list: SupplierList
  selectedHref: (id: string) => string
  selected: string | undefined
  nextHref: string | null
  firstHref: string | null
  empty: { title: string; text: string }
}) {
  if (!list.rows.length) return <EmptyState title={empty.title} text={empty.text} align="left" />
  return (
    <div className="flex flex-col gap-3">
      <div
        role="table"
        aria-label="Suppliers"
        className="bg-io-card border-io-line rounded-io-card overflow-hidden border"
      >
        <div
          role="row"
          className={`${GRID} border-io-line text-io-ink-3 border-b px-[18px] py-3.5 text-[10.5px] font-medium tracking-[0.1em] uppercase`}
        >
          <span role="columnheader">Supplier</span>
          <span role="columnheader">Country</span>
          <span role="columnheader">Tier</span>
          <span role="columnheader">Categories</span>
          <span role="columnheader" className="text-right">
            RFQs
          </span>
          <span role="columnheader" className="text-right">
            Reply
          </span>
          <span role="columnheader" className="text-right">
            Median
          </span>
          <span role="columnheader" className="text-right">
            Win
          </span>
          <span role="columnheader">Last</span>
          <span role="columnheader">Ccy</span>
        </div>
        {list.rows.map((r) => (
          <div
            role="row"
            key={r.id}
            data-supplier={r.id}
            aria-selected={selected === r.id}
            className={`${GRID} border-io-line hover:bg-io-row-hover relative border-b px-[18px] py-[11px] text-[12.5px] last:border-b-0 ${
              selected === r.id ? 'bg-io-accent-wash' : ''
            }`}
          >
            <span role="cell" className="flex min-w-0 flex-col gap-0.5">
              <span className="flex min-w-0 items-center gap-2">
                <Link
                  href={selectedHref(r.id) as Route}
                  scroll={false}
                  className="io-focus rounded-io-tag truncate text-[13px] font-medium after:absolute after:inset-0 after:content-['']"
                >
                  {r.name}
                </Link>
                <Chip tone="n" size="sm" label={r.type} />
              </span>
              {r.flags.length ? (
                <span className="text-io-bad truncate text-[11.5px]">{r.flags.join(' · ')}</span>
              ) : null}
            </span>
            <span role="cell" className="text-io-ink-2 truncate">
              {r.place}
            </span>
            <span role="cell">
              <Chip tone={TIER_TONE[r.tier]} label={TIER_WORD[r.tier]} />
            </span>
            <span role="cell" className="text-io-ink-2 truncate">
              {r.categories}
            </span>
            <span role="cell" className="text-right">
              {r.rfqs}
            </span>
            <span role="cell" className="text-right">
              {r.reply ?? '—'}
            </span>
            <span role="cell" className="text-right">
              {r.median ?? '—'}
            </span>
            <span role="cell" className="text-right">
              {r.win ?? '—'}
            </span>
            <span role="cell" className="text-io-ink-3">
              {r.last ?? '—'}
            </span>
            <span role="cell" className="text-io-ink-3">
              {r.ccy ?? '—'}
            </span>
          </div>
        ))}
        {list.partNote ? (
          <p
            className="text-io-ink-3 border-io-line m-0 border-t px-[18px] py-3 text-[12px]"
            data-part="part-note"
          >
            {list.partNote}
          </p>
        ) : null}
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
