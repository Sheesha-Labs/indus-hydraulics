import { NeedsRow } from '@indus/ops-ui/card'
import { ButtonLink, Choices, Segmented } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { T4Review } from '@indus/ops-ui/templates'
import { FAMILY_LABEL, REVIEW_FAMILIES, type ReviewFamily } from '@indus/ops-core'
import type { Route } from 'next'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import type { ReviewCard, ReviewQueue, WaitingItem } from '../../data/review'
import { reviewQuery, type ReviewSearch } from '../../lib/review-params'
import { AssistantPill, Banner } from '@indus/ops-ui/status'
import ResumeBannerAction from '../shell/ResumeBannerAction'
import AttentionRow from './AttentionRow'
import ReceiptRow from './ReceiptRow'
import ReviewCardClient from './ReviewCardClient'
import ReviewKeys from './ReviewKeys'
import ReviewRail from './ReviewRail'
import ConflictPanel from './ConflictPanel'
import RecordFilterMenu from './RecordFilterMenu'
import { ReviewEmpty, ReviewSummary, SupersededRow } from './ReviewStates'
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
  isOwner,
  paused,
}: {
  queue: ReviewQueue
  search: ReviewSearch
  done: { total: number; rows: Array<{ key: string; label: string; count: number; href: string }> }
  waiting: Array<{ title: string; items: WaitingItem[] }>
  /** The request time, from the page. */
  now: Date
  isOwner: boolean
  /** Board 110: the Assistant is paused (cards can still be approved; sends queue). */
  paused: { at: string; byYou: boolean } | null
}) {
  const keep = { type: search.type, record: search.record, group: search.group, sort: search.sort }
  const href = (over: Partial<ReviewSearch>) => `/review${reviewQuery(keep, over)}`
  const cards = queue.groups.flatMap((g) => g.cards)
  const meta = [queue.oldest ? `Oldest ${queue.oldest}` : null, WEEKDAY.format(now)]
    .filter(Boolean)
    .join(' · ')

  // Board 104: a quiet top bar (crumb, page name, the Assistant's state), then the count as the page's serif
  // title with its order controls, and the family chips with the record menu.
  const header = (
    <PageHeader
      crumb="Workspace"
      title="Review"
      actions={
        <AssistantPill
          status={paused ? 'paused' : 'running'}
          label={paused ? 'Assistant · paused' : 'Assistant · running'}
        />
      }
    />
  )
  const recordLabel = search.record
    ? (queue.records.find((r) => r.value === search.record)?.label.split(' · ')[0] ?? 'One record')
    : 'All records'
  const head = (
    <div data-part="review-head" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="io-display text-io-greeting m-0">Review · {queue.total} waiting</h2>
        <span className="text-io-ink-3 text-[12.5px]">{meta}</span>
        <span className="ml-auto flex gap-2">
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
      </div>
      <div className="flex items-start gap-3">
        <Choices<'all' | ReviewFamily>
          aria-label="Card types"
          value={search.type ?? 'all'}
          options={[
            { value: 'all', label: 'All', count: queue.counts.all },
            ...REVIEW_FAMILIES.filter((f) => queue.counts[f] > 0 || search.type === f).map((f) => ({
              value: f,
              label: FAMILY_LABEL[f],
              count: queue.counts[f],
            })),
          ]}
          hrefFor={(v) => href({ type: v === 'all' ? undefined : v, card: undefined })}
        />
        {queue.records.length ? (
          <span className="ml-auto flex-none">
            <RecordFilterMenu
              label={recordLabel}
              options={[
                { label: 'All records', href: href({ record: undefined, card: undefined }) },
                ...queue.records.map((r) => ({
                  label: r.label,
                  href: href({ record: r.value, card: undefined }),
                })),
              ]}
            />
          </span>
        ) : null}
      </div>
    </div>
  )

  const rows = (card: ReviewCard) => {
    const expanded = card.ref === queue.expandedRef
    if (expanded) {
      const conflict = queue.conflict?.ref === card.ref ? queue.conflict : null
      return (
        <div key={card.id} className="flex flex-col gap-2">
          {card.supersedes ? (
            <SupersededRow supersedes={card.supersedes} headline={card.headline} />
          ) : null}
          {card.backFromLater ? (
            <p className="text-io-ink-3 text-[12.5px]" data-part="back-from-later">
              Back from Later ({card.backFromLater})
            </p>
          ) : null}
          {conflict ? (
            <ConflictPanel conflict={conflict} reviewHref={href({ card: card.ref })} />
          ) : null}
          <ReviewCardClient
            card={card}
            editing={search.edit && !conflict}
            editHref={href({ card: card.ref, edit: true })}
            closeEditHref={href({ card: card.ref, edit: false })}
            conflictHref={href({ card: card.ref, seen: card.version })}
            locked={!!conflict}
          />
        </div>
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

  // Board 110: all clear, or "40+ waiting" summary first, else the cards by record.
  const stream =
    queue.total === 0 ? (
      <ReviewEmpty done={done.total} next={queue.nextExpected} />
    ) : queue.summary ? (
      <ReviewSummary
        total={queue.total}
        summary={queue.summary}
        openHref={(f) => href({ type: f, card: undefined })}
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
            {head}
            {paused ? (
              <Banner
                tone="warn"
                icon="warn"
                title={`Paused by ${paused.byYou ? 'you' : 'the Owner'} at ${paused.at}.`}
                {...(isOwner ? { actions: <ResumeBannerAction /> } : {})}
              >
                Cards can still be approved; sends queue until{' '}
                {isOwner ? 'you resume' : 'it resumes'}.
              </Banner>
            ) : null}
            {queue.attention.map((a) => (
              <AttentionRow key={a.actionId} item={a} isOwner={isOwner} />
            ))}
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
