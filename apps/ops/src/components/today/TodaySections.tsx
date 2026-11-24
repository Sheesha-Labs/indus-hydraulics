import { Card, List } from '@indus/ops-ui/card'
import type { TodayModel } from '../../data/today'
import type { TodayRow } from '../../server/today/providers'

function items(rows: TodayRow[]) {
  return rows.map((r) => ({
    key: r.key,
    mark: r.mark ?? null,
    title: r.title,
    ...(r.sub ? { sub: r.sub } : {}),
    ...(r.href ? { right: { label: r.hrefLabel ?? 'Open', href: r.href } } : {}),
  }))
}

/** Board 178 "Came in since yesterday": the providers' rows (client mail now; enquiries, quotes, POs later). */
export function CameIn({ rows }: { rows: TodayRow[] }) {
  return (
    <Card eyebrow="Came in since yesterday">
      {rows.length ? (
        <List items={items(rows)} />
      ) : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">Nothing new since yesterday evening.</p>
      )}
    </Card>
  )
}

/** Board 178 "Done for you": today's finished actions by kind; every one is in the Assistant log. */
export function DoneForYou({ rows, total }: { rows: TodayRow[]; total: number }) {
  return (
    <Card eyebrow={total ? `Done for you · ${total}` : 'Done for you'}>
      {rows.length ? (
        <List items={items(rows)} />
      ) : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">Nothing yet today.</p>
      )}
      <p className="text-io-ink-3 m-0 text-[12px]">
        Every action is in the Assistant log with the diff.
      </p>
    </Card>
  )
}

/** Board 178 "Late or at risk": Review waiting, Later due, sends held or unknown, tasks overdue, mailbox behind. */
export function LateOrAtRisk({ rows }: { rows: TodayRow[] }) {
  return (
    <Card eyebrow="Late or at risk">
      {rows.length ? (
        <List items={items(rows)} />
      ) : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">Nothing late.</p>
      )}
    </Card>
  )
}

/** The rail: this month (KPIs that arrive with later sprints show "—") and this week's dated work. */
export function TodayRail({ model }: { model: TodayModel }) {
  return (
    <>
      <Card eyebrow="This month">
        <dl
          data-part="kpi-strip"
          className="rounded-io-card border-io-line m-0 flex flex-col gap-2 border px-3 py-2.5 text-[12.5px]"
        >
          <div className="flex justify-between gap-3">
            <dt>Awaiting your decision now</dt>
            <dd className="m-0 tabular-nums">{model.kpi.awaiting}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Quotations sent · win rate</dt>
            <dd className="text-io-ink-3 m-0">— · arrives with quotations</dd>
          </div>
          {model.kpi.showMoney ? (
            <div className="flex justify-between gap-3">
              <dt>Cash in next 7 days</dt>
              <dd className="text-io-ink-3 m-0">— · arrives with Money</dd>
            </div>
          ) : null}
        </dl>
      </Card>
      <Card eyebrow="This week">
        {model.thisWeek.length ? (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[12.5px]">
            {model.thisWeek.map((r) => (
              <li key={r.key} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3">
                <span className="text-io-ink-3 tabular-nums">{r.day}</span>
                <span className="truncate">{r.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-io-ink-3 m-0 text-[12.5px]">Nothing dated this week.</p>
        )}
      </Card>
    </>
  )
}

/** Board 182 "Nothing needs you": the overnight summary and the next deadline. */
export function CalmState({ model }: { model: TodayModel }) {
  return (
    <section
      data-part="today-calm"
      aria-labelledby="calm-title"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-2 border px-[18px] py-5"
    >
      <h2 id="calm-title" className="io-display m-0 text-[30px] leading-[1.15] font-normal">
        Nothing needs you right now.
      </h2>
      <p className="m-0 text-[13px] leading-[1.5]">
        {model.doneTotal
          ? `The Assistant finished ${model.doneTotal} ${model.doneTotal === 1 ? 'action' : 'actions'} today.`
          : 'The Assistant has nothing waiting for you.'}
        {model.nextDeadline ? ` Next deadline: ${model.nextDeadline}.` : ''}
      </p>
    </section>
  )
}
