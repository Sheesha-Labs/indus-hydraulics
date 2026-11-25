import type { Route } from 'next'
import Link from 'next/link'
import type { AutopilotPageData } from '../../data/autopilot'

/**
 * Board 98 "This week" (S07-T02): Monday to today in Dubai, from two grouped counts (data/autopilot.ts). Time
 * saved is an estimate and says so: each action done or drafted × the minutes the Owner logged for the task.
 */
export default function WeekStats({ week }: { week: AutopilotPageData['week'] }) {
  const stats = [
    { value: week.emailsRead, label: 'emails read' },
    { value: week.actionsDone, label: 'actions done' },
    { value: week.approved, label: 'approved by you' },
    { value: week.rejected, label: 'rejected' },
    { value: week.undone, label: 'undone' },
    { value: week.saved, label: 'time saved' },
  ]
  return (
    <section
      data-part="week-stats"
      aria-labelledby="week-stats-title"
      className="rounded-io-card border-io-line bg-io-card flex min-w-0 flex-1 flex-col gap-3 border px-[18px] py-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="week-stats-title" className="io-eyebrow m-0 font-normal">
          This week · {week.label}
        </h2>
        <Link
          href={'/assistant/log' as Route}
          className="io-focus rounded-io-tag text-io-accent text-[12.5px] hover:underline"
        >
          Assistant log <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <dl className="m-0 grid grid-cols-6 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse gap-0.5">
            <dt className="text-io-ink-3 text-[12px]">{s.label}</dt>
            <dd className="text-io-kpi m-0 font-medium tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-io-ink-3 m-0 text-[11.5px] leading-[1.5]">
        Time saved: each action done or drafted × the minutes Krishan logged for the same task in a
        sample week (classify 0.5, extract 6, RFQ 12, chaser 3, capture 8). An estimate, not a
        measurement.
      </p>
    </section>
  )
}

const LEGEND = [
  { level: 'Off', text: 'nothing' },
  { level: 'Suggest', text: 'shows a hint in the record' },
  { level: 'Draft and ask', tag: 'Asks you', text: 'waits in Review' },
  {
    level: 'Do and tell',
    tag: 'Does it, tells you',
    text: 'Today + evening summary, undo where possible',
  },
  { level: 'Do quietly', tag: 'Does it quietly', text: 'Assistant log only' },
] as const

/** Board 98's level legend: what each level means, with the tag the Review card carries. */
export function LevelLegend() {
  return (
    <ul
      data-part="level-legend"
      className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-2.5 p-0 text-[12.5px]"
    >
      {LEGEND.map((l) => (
        <li key={l.level} className="flex items-center gap-1.5">
          <span className="text-io-ink">{l.level}</span>
          {'tag' in l ? (
            <span className="rounded-io-tag border-io-line text-io-ink-2 border px-1.5 py-0.5 text-[11px]">
              {l.tag}
            </span>
          ) : null}
          <span className="text-io-ink-2">{l.text}</span>
        </li>
      ))}
    </ul>
  )
}
