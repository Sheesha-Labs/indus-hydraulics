import { Stat } from '@indus/ops-ui/card'
import { Timeline } from '@indus/ops-ui/timeline'
import type { QuestionsTab } from '../../../data/enquiry-questions'

/**
 * Board 171 · "Waiting on client" (S09-T07): how long the questions have waited, what is sourcing meanwhile, and
 * the Assistant's clock on them (sent → day-2 reminder → day-3 call → fallback → last day to send the held lines).
 */
export default function QuestionClock({ round }: { round: NonNullable<QuestionsTab['round']> }) {
  return (
    <section
      aria-labelledby="question-clock-title"
      data-part="question-clock"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-5 py-4"
    >
      <header className="flex items-baseline justify-between">
        <h2 id="question-clock-title" className="io-eyebrow m-0">
          Waiting on client
        </h2>
        <span className="text-io-ink text-[13px] font-medium tabular-nums">
          {round.waitingDays} day{round.waitingDays === 1 ? '' : 's'}
        </span>
      </header>
      <p className="text-io-ink-3 m-0 text-[12.5px]">
        Since {round.since} · today is {round.today}
      </p>
      <Stat rows={round.stats.map((s) => ({ label: s.label, value: s.value }))} />
      <h3 className="io-eyebrow m-0 mt-1">Clock · run by the Assistant</h3>
      <Timeline aria-label="The Assistant’s clock on the questions" items={round.timeline} />
    </section>
  )
}
