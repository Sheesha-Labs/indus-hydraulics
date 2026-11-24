import { ButtonLink } from '@indus/ops-ui/controls'
import { Chip, Tag } from '@indus/ops-ui/status'
import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { HistoryKindFilter, HistoryPage, HistoryRow } from '../../data/history'
import DocumentVersionsSlot from './DocumentVersionsSlot'
import HistoryFilters from './HistoryFilters'

/**
 * Board 113 · Record history (T2 tab body): When · Who · Field · Before → after (with the note) · Kind ·
 * Why?, newest first, 50 a page; the Assistant strip ("made 31 of the 47 changes"), the filter chips, the
 * count with Export for the Owner, and the document versions slot. The same component serves an enquiry, a
 * supplier and a client.
 */
const KIND: Record<HistoryRow['kind'], { label: string; tone: 'warn' | 'acc' | 'n' }> = {
  money: { label: 'Money', tone: 'warn' },
  decision: { label: 'Decision', tone: 'acc' },
  supplier: { label: 'Supplier', tone: 'n' },
  quantity: { label: 'Quantity', tone: 'n' },
  terms: { label: 'Terms', tone: 'n' },
  documents: { label: 'Documents', tone: 'n' },
  status: { label: 'Status', tone: 'n' },
  link: { label: 'Link', tone: 'n' },
  contact: { label: 'Contact', tone: 'n' },
  settings: { label: 'Settings', tone: 'n' },
  other: { label: 'Other', tone: 'n' },
}

const GRID =
  'grid grid-cols-[88px_112px_minmax(0,1fr)_minmax(0,1.5fr)_96px_52px] items-start gap-x-4'

function Row({ r, action }: { r: HistoryRow; action?: (r: HistoryRow) => ReactNode }) {
  const k = KIND[r.kind]
  return (
    <li className={`${GRID} border-io-line-2 border-t px-4 py-3 text-[13px] leading-[1.45]`}>
      <span className="text-io-ink-2 tabular-nums">
        {r.day}
        <br />
        {r.time}
      </span>
      <span>
        {r.who.assistant ? (
          <Tag kind="assistant">Assistant</Tag>
        ) : (
          <Tag kind="count">{r.who.initials}</Tag>
        )}
      </span>
      <span className="text-io-ink font-medium">{r.field}</span>
      <span className="flex flex-col gap-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <del className="bg-io-bad-tint text-io-banner-bad-ink rounded-io-tag px-1">
            {r.before}
          </del>
          <span aria-hidden="true">→</span>
          <span className="sr-only">to</span>
          <ins className="bg-io-ok-tint text-io-banner-ok-ink rounded-io-tag px-1 no-underline">
            {r.after}
          </ins>
        </span>
        {r.note ? <span className="text-io-ink-3 text-[12.5px]">{r.note}</span> : null}
        {action ? action(r) : null}
      </span>
      <span>
        <Chip tone={k.tone} label={k.label} size="sm" />
      </span>
      <Link
        href={`/why/${encodeURIComponent(r.evidenceId)}` as Route}
        className="text-io-accent io-focus rounded-io-tag text-[12.5px] underline underline-offset-2"
      >
        Why?
      </Link>
    </li>
  )
}

export default function RecordHistory({
  page,
  noun,
  kind,
  hrefFor,
  olderHref,
  view,
  exportHref,
  versions,
  rowAction,
}: {
  page: HistoryPage
  /** "enquiry", "supplier", "client". */
  noun: string
  kind: HistoryKindFilter
  hrefFor: (k: HistoryKindFilter) => string
  /** The next page's URL, when there is one. */
  olderHref: string | null
  /** The enquiry's Timeline | History toggle. */
  view?: { hrefFor: (v: 'timeline' | 'history') => string }
  /** Owner only. */
  exportHref: string | null
  versions?: ReactNode
  /** "Revert to before Assistant change" (S06-T07). */
  rowAction?: (r: HistoryRow) => ReactNode
}) {
  const { total, assistant } = page.counts
  return (
    <div className="flex flex-col gap-4" data-built="history">
      {total > 0 ? (
        <p className="flex items-center gap-2 text-[13px]" data-part="history-strip">
          <Tag kind="assistant">Assistant</Tag>
          made {assistant} of the {total} {total === 1 ? 'change' : 'changes'} on this {noun}; each
          has a Why?
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <HistoryFilters kind={kind} hrefFor={hrefFor} {...(view ? { view } : {})} />
        <span className="text-io-ink-3 ml-auto flex items-center gap-2 text-[12.5px]">
          <span className="tabular-nums">
            {total} {total === 1 ? 'change' : 'changes'}
          </span>{' '}
          · append-only
          {exportHref ? (
            <ButtonLink href={exportHref} size="sm" variant="secondary" prefetch={false}>
              Export history
            </ButtonLink>
          ) : null}
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-4">
        <section
          aria-label="History of changes"
          className="bg-io-card border-io-line rounded-io-card overflow-hidden border"
        >
          <div
            role="presentation"
            className={`${GRID} io-eyebrow border-io-line border-b px-4 py-2.5`}
          >
            <span>When</span>
            <span>Who</span>
            <span>Field</span>
            <span>Before → after</span>
            <span>Kind</span>
            <span className="sr-only">Why?</span>
          </div>
          {page.rows.length === 0 ? (
            <p className="text-io-ink-3 m-0 px-4 py-6 text-[13px]">
              Nothing has changed on this {noun} yet.
            </p>
          ) : (
            <ol className="m-0 list-none p-0">
              {page.rows.map((r) => (
                <Row key={r.id} r={r} {...(rowAction ? { action: rowAction } : {})} />
              ))}
            </ol>
          )}
          {olderHref ? (
            <div className="border-io-line border-t px-4 py-2.5 text-[12.5px]">
              <Link
                href={olderHref as Route}
                className="text-io-accent io-focus rounded-io-tag hover:underline"
              >
                Older changes →
              </Link>
            </div>
          ) : null}
        </section>
        <DocumentVersionsSlot>{versions}</DocumentVersionsSlot>
      </div>
      <p className="text-io-ink-3 m-0 text-[12px]">
        A Helper sees this view with margins, costs and sell prices hidden.
      </p>
    </div>
  )
}
