import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export type TimelineMark = 'done' | 'warn' | 'bad' | 'assistant' | 'current' | 'todo'

export interface TimelineItem {
  key: string
  mark: TimelineMark
  /** Display date, e.g. "14 Sep". */
  date: string
  /** Machine-readable date for <time dateTime>, e.g. "2026-09-14". */
  dateTime: string
  title: ReactNode
  sub?: ReactNode
  /** "Assistant" or a person's name. */
  by?: string
}

export interface TimelineProps {
  items: readonly TimelineItem[]
  'aria-label': string
  className?: string
}

/** Kit `kl-tl .i > i`: 13px node, 1.5px ring; the Assistant's node is a navy square. */
const NODE: Record<TimelineMark, string> = {
  done: 'border-io-accent bg-io-accent',
  warn: 'border-io-warn-solid bg-io-warn-tint',
  bad: 'border-io-bad-solid bg-io-bad-tint',
  assistant: 'rounded-io-3 border-io-navy bg-io-navy',
  current: 'border-io-accent shadow-[0_0_0_3px_var(--io-accent-tint)]',
  todo: '',
}

/** Read before the date, so colour is never the only signal. */
export const TIMELINE_MARK_TEXT: Record<TimelineMark, string> = {
  done: 'Done',
  warn: 'Waiting',
  bad: 'Blocked',
  assistant: 'Done by the Assistant',
  current: 'Current',
  todo: 'Upcoming',
}

/** Record history (kit K-08 Timeline): an ordered list, oldest first, with a rail between nodes. */
export default function Timeline({ items, className, ...rest }: TimelineProps) {
  return (
    <ol aria-label={rest['aria-label']} className={cn('flex w-full flex-col', className)}>
      {items.map((it) => (
        <li
          key={it.key}
          data-mark={it.mark}
          className="before:bg-io-line relative grid grid-cols-[14px_62px_minmax(0,1fr)] gap-2.5 pb-3.5 text-[12.5px] before:absolute before:top-3.5 before:bottom-0 before:left-1.5 before:w-px last:before:hidden"
        >
          <span
            aria-hidden="true"
            className={cn(
              'border-io-stroke bg-io-card rounded-io-pill relative mt-0.5 size-[13px] border-[1.5px]',
              NODE[it.mark]
            )}
          />
          <time dateTime={it.dateTime} className="text-io-ink-3 pt-px text-[11px]">
            <span className="sr-only">{TIMELINE_MARK_TEXT[it.mark]} · </span>
            {it.date}
          </time>
          <span>
            <b className="font-medium">{it.title}</b>
            {it.by ? <span className="text-io-ink-3 ml-1.5 text-[11px]">{it.by}</span> : null}
            {it.sub ? (
              <small className="text-io-ink-3 mt-px block text-[11.5px]">{it.sub}</small>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  )
}
