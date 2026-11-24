import { NeedsRow } from '@indus/ops-ui/card'
import { ButtonLink, Choices, Segmented } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { EmptyState } from '@indus/ops-ui/states'
import { T4Review } from '@indus/ops-ui/templates'
import { FAMILY_LABEL, REVIEW_FAMILIES, type ReviewFamily } from '@indus/ops-core'
import type { Route } from 'next'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import type { ReviewCard, ReviewQueue, WaitingItem } from '../../data/review'
import { reviewQuery, type ReviewSearch } from '../../lib/review-params'
import ReceiptRow from './ReceiptRow'
import ReviewCardClient from './ReviewCardClient'
import ReviewKeys from './ReviewKeys'
import ReviewRail from './ReviewRail'
import { BatchBar, BatchCheckbox, ReviewSelectionProvider } from './ReviewSelection'

/**
 * Board 104 · Review (T4, stream variant): the header with the waiting count and the oldest card's age, the
 * family chips with counts and the record filter, the last approval's receipt, cards grouped by record (the
 * first, or ?card=, expanded; the rest compact rows), the batch bar, and the rail.
 */
const WEEKDAY = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const CONFIDENCE_WORD = (c: ReviewCard) => c.confidence?.level ?? ''

export default function ReviewScreen({
  queue,
  search,
  done,
  waiting,
  now,
}: {
  queue: ReviewQueue
  search: ReviewSearch
  done: { total: number; rows: Array<{ key: string; label: string; count: number; href: string }> }
  waiting: Array<{ title: string; items: WaitingItem[] }>
  /** The request time, from the page. */
  now: Date
}) {
  const keep = { type: search.type, record: search.record, group: search.group, sort: search.sort }
  const href = (over: Partial<ReviewSearch>) => `/review${reviewQuery(keep, over)}`
  const cards = queue.groups.flatMap((g) => g.cards)
  const meta = [queue.oldest ? `Oldest ${queue.oldest}` : null, WEEKDAY.format(now)]
    .filter(Boolean)
    .join(' · ')

  const header = (
    <PageHeader
      crumb="Workspace"
      title={`Review · ${queue.total} waiting`}
      meta={meta}
      segmented={
        <span className="flex gap-2">
          <Segmented<'record' | 'flat'>
            aria-label="Group"
            size="sm"
            value={search.group}
            options={[
              { value: 'record', label: 'By record' },
              { value: 'flat', label: 'Flat' },
            ]}
            hrefFor={(v) => href({ group: v, card: undefined })}
          />
          <Segmented<'oldest' | 'due' | 'value'>
            aria-label="Sort"
            size="sm"
            value={search.sort}
            options={[
              { value: 'oldest', label: 'Oldest first' },
              { value: 'due', label: 'Due soonest' },
              { value: 'value', label: 'Highest value' },
            ]}
            hrefFor={(v) => href({ sort: v, card: undefined })}
          />
        </span>
      }
      filters={
        <Choices<'all' | ReviewFamily>
          aria-label="Card types"
          value={search.type ?? 'all'}
          options={[
            { value: 'all', label: 'All', count: queue.counts.all },
            ...REVIEW_FAMILIES.map((f) => ({
              value: f,
              label: FAMILY_LABEL[f],
              count: queue.counts[f],
            })),
          ]}
          hrefFor={(v) => href({ type: v === 'all' ? undefined : v, card: undefined })}
        />
      }
      summary={
        queue.records.length ? (
          <nav aria-label="Records" className="flex flex-wrap gap-2 text-[12px]">
            {search.record ? (
              <Link
                href={href({ record: undefined, card: undefined }) as Route}
                className="text-io-accent hover:underline"
              >
                All records
              </Link>
            ) : (
              <span>All records</span>
            )}
          </nav>
        ) : null
      }
    />
  )

  const rows = (card: ReviewCard) => {
    const expanded = card.ref === queue.expandedRef
    if (expanded) {
      return (
        <ReviewCardClient
          key={card.id}
          card={card}
          editing={search.edit}
          editHref={href({ card: card.ref, edit: true })}
          closeEditHref={href({ card: card.ref, edit: false })}
        />
      )
    }
    return (
      <div key={card.id} className="flex items-center gap-3">
        {card.batchable ? (
          <BatchCheckbox
            item={{
              actionId: card.id,
              version: card.version,
              title: card.headline,
              family: card.family,
            }}
          />
        ) : (
          <span
            className="text-io-ink-3 grid w-4 flex-none place-items-center"
            title="Decided one at a time"
          >
            <Lock aria-label="Decided one at a time" className="size-3.5" strokeWidth={1.75} />
          </span>
        )}
        <NeedsRow
          className="flex-1"
          action={card.type}
          title={card.headline}
          sub={card.stale ? card.stale.reason : card.sub || `${card.ref} · ${card.age}`}
          actions={
            <span className="flex items-center gap-3">
              <span className="text-io-ink-3 text-[12px]">{CONFIDENCE_WORD(card)}</span>
              <ButtonLink href={href({ card: card.ref })} size="sm" variant="secondary">
                {card.stale ? 'Redraft' : card.kind === 'email' ? 'Review' : 'Decide'}
              </ButtonLink>
            </span>
          }
        />
      </div>
    )
  }

  const stream =
    queue.total === 0 ? (
      <EmptyState
        mark="RV"
        title="Nothing waits for you"
        text="The Assistant brings every proposal here: approve, edit, reject or move it to later."
        align="left"
      />
    ) : (
      <ReviewKeys
        hrefs={cards.map((c) => [c.ref, href({ card: c.ref })])}
        current={queue.expandedRef}
      >
        <div className="flex flex-col gap-4">
          {queue.groups.map((g) => (
            <section key={g.key} aria-label={g.label || 'Cards'} className="flex flex-col gap-2">
              {g.label ? (
                <header className="flex items-baseline gap-2 text-[13px]">
                  <span className="font-medium">{g.label}</span>
                  {g.sub ? <span className="text-io-ink-3 truncate">{g.sub}</span> : null}
                  <span className="text-io-ink-3">· {g.cards.length} waiting</span>
                  {g.href ? (
                    <Link
                      href={g.href as Route}
                      className="text-io-accent io-focus rounded-io-tag ml-auto whitespace-nowrap hover:underline"
                    >
                      Open record ↗
                    </Link>
                  ) : null}
                </header>
              ) : null}
              {g.cards.map(rows)}
            </section>
          ))}
        </div>
      </ReviewKeys>
    )

  return (
    <ReviewSelectionProvider>
      <T4Review
        variant="stream"
        header={header}
        detail={
          <>
            {queue.receipt ? <ReceiptRow receipt={queue.receipt} /> : null}
            {stream}
          </>
        }
        detailLabel="Proposals"
        batchBar={<BatchBar />}
        rail={<ReviewRail done={done} waiting={waiting} />}
      />
    </ReviewSelectionProvider>
  )
}
