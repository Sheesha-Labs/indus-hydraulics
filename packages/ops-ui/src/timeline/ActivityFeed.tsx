import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export type ActivityMark = 'assistant' | 'person' | 'warn' | 'open' | 'neutral'

export interface ActivityItem {
  key: string
  /** Display time, e.g. "09:12". */
  time: string
  /** Machine-readable value for <time dateTime> when `time` alone is not one. */
  dateTime?: string
  mark: ActivityMark
  text: ReactNode
}

export interface ActivityProps {
  items: readonly ActivityItem[]
  'aria-label'?: string
  className?: string
}

/** Kit `kl-ac i`: 8px dot. */
const DOT: Record<ActivityMark, string> = {
  assistant: 'bg-io-accent',
  person: 'bg-io-navy',
  warn: 'bg-io-activity-warn',
  open: 'border-io-activity-open bg-io-card border',
  neutral: 'bg-io-stroke',
}

export const ACTIVITY_MARK_TEXT: Record<ActivityMark, string> = {
  assistant: 'Assistant',
  person: 'Person',
  warn: 'Needs attention',
  open: 'Open',
  neutral: '',
}

/** Today's activity (kit K-08 Activity): time, dot, one line. */
export default function ActivityFeed({ items, className, ...rest }: ActivityProps) {
  return (
    <ol
      {...(rest['aria-label'] ? { 'aria-label': rest['aria-label'] } : {})}
      className={cn('flex w-full flex-col', className)}
    >
      {items.map((it) => (
        <li
          key={it.key}
          data-mark={it.mark}
          className="grid grid-cols-[52px_10px_minmax(0,1fr)] gap-2.5 py-[5px] text-[12.5px]"
        >
          <time {...(it.dateTime ? { dateTime: it.dateTime } : {})} className="text-io-ink-3">
            {it.time}
          </time>
          <span
            aria-hidden="true"
            className={cn('rounded-io-pill mt-[5px] size-2', DOT[it.mark])}
          />
          <span>
            {ACTIVITY_MARK_TEXT[it.mark] ? (
              <span className="sr-only">{ACTIVITY_MARK_TEXT[it.mark]}: </span>
            ) : null}
            {it.text}
          </span>
        </li>
      ))}
    </ol>
  )
}
