'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Clock } from 'lucide-react'
import { dubaiNow, rotateToToday, statusFor, type HoursRow, type HoursStatus } from './hours'

/**
 * Opening hours in the contact rail, in the shape of a Google Business Profile
 * card: one summary line ("Open · Closes 6 PM") that expands into the full
 * week, today first.
 *
 * Built on <details>/<summary> so the disclosure works before hydration and
 * without JavaScript. Only the live status and the today-first ordering need a
 * clock, and the office clock is Asia/Dubai wherever the reader is — so both
 * are filled in after mount. The first paint is deliberately status-free: this
 * page is statically revalidated and CDN-cached, so anything computed on the
 * server would be stale, and computing it during render would mismatch the
 * hydrated markup.
 */
export default function OpeningHours({ rows, label }: { rows: HoursRow[]; label: string }) {
  const [now, setNow] = useState<{ day: number; minutes: number } | null>(null)

  useEffect(() => {
    const tick = () => setNow(dubaiNow())
    tick()
    // Re-check every minute so an open/close boundary doesn't need a reload.
    const timer = window.setInterval(tick, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const status: HoursStatus | null = useMemo(() => (now ? statusFor(rows, now) : null), [rows, now])
  const ordered = useMemo(() => rotateToToday(rows, now?.day ?? null), [rows, now])
  const todayIndex = now?.day ?? null

  if (rows.length === 0) return null

  return (
    <div className="flex gap-4 border-t border-ih-border py-5">
      <Clock size={19} strokeWidth={1.6} aria-hidden className="mt-0.5 shrink-0 text-ih-accent" />
      <div className="min-w-0 flex-1">
        <div className="eyebrow">{label}</div>
        <details className="group mt-1.5" data-testid="opening-hours">
          <summary className="flex cursor-pointer list-none items-center gap-3 rounded-sm text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ih-accent [&::-webkit-details-marker]:hidden">
            <span className="flex-1">
              {status ? (
                <>
                  <span className={status.open ? 'font-medium text-ih-success-ink' : 'text-ih-muted'}>
                    {status.state}
                  </span>
                  {status.detail ? <span className="text-ih-ink-2"> · {status.detail}</span> : null}
                </>
              ) : (
                <span className="text-ih-ink-2">See daily hours</span>
              )}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={1.7}
              aria-hidden
              className="shrink-0 text-ih-muted transition-transform group-open:rotate-180"
            />
          </summary>
          <ul className="mt-3 flex flex-col gap-1.5">
            {ordered.map((row) => {
              const isToday = todayIndex !== null && row.index === todayIndex
              return (
                <li
                  key={row.index}
                  className={`flex items-baseline justify-between gap-6 text-[13.5px] ${
                    isToday ? 'font-medium text-ih-ink' : 'text-ih-ink-2'
                  }`}
                >
                  <span>{row.day}</span>
                  <span className={`mono ${row.openMinutes === null ? 'text-ih-muted' : ''}`}>
                    {row.display}
                  </span>
                </li>
              )
            })}
          </ul>
        </details>
      </div>
    </div>
  )
}
