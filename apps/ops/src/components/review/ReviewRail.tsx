import type { Route } from 'next'
import Link from 'next/link'
import type { WaitingItem } from '../../data/review'

/** Board 104's right rail: "Done for you today" by kind, and "Waiting on others" (providers from S12). */
export default function ReviewRail({
  done,
  waiting,
}: {
  done: { total: number; rows: Array<{ key: string; label: string; count: number; href: string }> }
  waiting: Array<{ title: string; items: WaitingItem[] }>
}) {
  return (
    <>
      <section aria-labelledby="rail-done" className="flex flex-col">
        <h2 id="rail-done" className="io-eyebrow mb-2">
          Done for you today · {done.total}
        </h2>
        {done.rows.length === 0 ? (
          <p className="text-io-ink-3 text-[12.5px]">Nothing yet today.</p>
        ) : (
          <ul className="flex flex-col">
            {done.rows.map((r) => (
              <li
                key={r.key}
                className="border-io-line flex items-center gap-3 border-b py-2.5 text-[13px]"
              >
                <span className="min-w-0 flex-1">{r.label}</span>
                <Link
                  href={r.href as Route}
                  className="text-io-accent io-focus rounded-io-tag tabular-nums underline-offset-2 hover:underline"
                >
                  {r.count} →
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="text-io-ink-3 mt-2 text-[12px]">
          Every action is in the Assistant log with the diff.
        </p>
      </section>
      <section aria-labelledby="rail-waiting" className="flex flex-col">
        <h2 id="rail-waiting" className="io-eyebrow mb-2">
          Waiting on others
        </h2>
        {waiting.length === 0 ? (
          <p className="text-io-ink-3 text-[12.5px]">
            Nothing is waiting on suppliers or clients. Late suppliers and silent clients show here
            once RFQs and quotations go out.
          </p>
        ) : (
          waiting.map((s) => (
            <div key={s.title} className="mb-3">
              <p className="text-io-ink-3 mb-1 text-[12px]">{s.title}</p>
              <ul>
                {s.items.map((it) => (
                  <li
                    key={it.key}
                    className="border-io-line flex items-start gap-3 border-b py-2.5 text-[13px]"
                  >
                    <Link
                      href={it.href as Route}
                      className="io-focus rounded-io-tag min-w-0 flex-1 hover:underline"
                    >
                      {it.label}
                    </Link>
                    <span
                      className={
                        it.tone === 'bad'
                          ? 'text-io-bad'
                          : it.tone === 'warn'
                            ? 'text-io-warn'
                            : 'text-io-ink-3'
                      }
                    >
                      {it.due}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </>
  )
}
