import { PageHeader } from '@indus/ops-ui/shell'
import { EmptyState } from '@indus/ops-ui/states'
import type { UnsureCardView } from '../../data/mail'
import UnsureCard from './UnsureCard'

/**
 * Board 94 · Mail / Unsure: every email the Assistant could not classify or link with confidence, each with
 * its best guess and the alternatives. Nothing is filed until a person chooses.
 */
export default function UnsurePile({ items, today }: { items: UnsureCardView[]; today: number }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-io-line bg-io-card border-b px-6 py-3">
        <PageHeader
          crumb="Mail"
          title={`Unsure · ${items.length}`}
          meta="Emails the Assistant could not classify or link with confidence"
        />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,744px)_minmax(0,380px)] gap-6 overflow-y-auto px-6 py-5">
        <section aria-label="Unsure emails" className="flex flex-col gap-3">
          {items.length === 0 ? (
            <EmptyState
              mark="✓"
              title="Nothing unsure"
              text={`Every email today was classified and linked. ${today} read, 0 guesses.`}
            />
          ) : (
            items.map((i) => <UnsureCard key={i.actionId} item={i} />)
          )}
        </section>
        <aside aria-label="After you choose" className="flex flex-col gap-3">
          <p className="io-eyebrow">After you choose</p>
          <p className="text-io-ink-2 text-[12.5px] leading-[1.5]">
            Your choice files the email and is recorded as yours. When it names a company, the
            Assistant learns the sender’s domain for next time. You can undo for five minutes.
          </p>
          <p className="text-io-ink-3 text-[12px] leading-[1.5]">
            An unsure email is never filed into a record by guessing. It waits here until you
            choose.
          </p>
        </aside>
      </div>
    </div>
  )
}
