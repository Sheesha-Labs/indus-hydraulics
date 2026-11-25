import type { TriggerItem } from '../../data/guardrails'

function when(iso: string, now: Date): string {
  const d = new Date(iso)
  const day = (x: Date) => x.toLocaleDateString('en-CA', { timeZone: 'Asia/Dubai' })
  const time = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dubai',
  })
  if (day(d) === day(now)) return `Today ${time}`
  if (day(d) === day(new Date(now.getTime() - 86_400_000))) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Dubai' })
}

/**
 * Board 100's right pane (S07-T03): how guardrails work, then the last ten triggers from guardrail_trigger
 * with what they stopped ("Outside working hours · <chaser> queued for 08:30 · Today 07:12").
 */
export default function LastTriggered({ items, now }: { items: TriggerItem[]; now: Date }) {
  return (
    <>
      <section aria-labelledby="how-title" className="flex flex-col gap-2.5">
        <h2 id="how-title" className="io-eyebrow m-0 font-normal">
          How guardrails work
        </h2>
        <p className="m-0 text-[12.5px] leading-[1.55]">
          A guardrail overrides any action level. If “Chase suppliers” is on Do and tell but the
          supplier is new, that chaser asks you.
        </p>
        <p className="m-0 text-[12.5px] leading-[1.55]">
          When one triggers, the card in Review says which guardrail sent it there.
        </p>
      </section>
      <section aria-labelledby="last-title" className="flex flex-col">
        <h2 id="last-title" className="io-eyebrow m-0 mb-1.5 font-normal">
          Last triggered
        </h2>
        {items.length === 0 ? (
          <p className="text-io-ink-3 m-0 text-[12.5px]">Nothing has triggered yet.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {items.map((t) => (
              <li
                key={t.id}
                className="border-io-line flex flex-col gap-1 border-b py-3 text-[12.5px]"
              >
                <span className="text-io-ink font-medium">{t.title}</span>
                <span className="text-io-ink-3">
                  {t.detail} · {when(t.at, now)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
