import { cn } from '../lib/cn'
import Check from '../status/Check'
import type { CheckItem } from './types'

export interface CheckListProps {
  items: CheckItem[]
  /**
   * checks (`ka-ck`): grid 16/1fr/auto gap 8, 12.5/1.4, right 12 ink-3.
   * signals (`ka-sg`): the P15 qualification rows, 13/1.4, a line-2 rule above each, right 12 accent.
   */
  variant?: 'checks' | 'signals'
  /** Names the list for assistive tech ("Checks", "Signals"). */
  label?: string
  className?: string
}

/** Read in place of the glyph, so a flag never rests on colour alone. */
export const CHECK_MARK_LABEL: Record<CheckItem['mark'], string> = {
  ok: 'Passed',
  warn: 'Flagged',
  bad: 'Failed',
  n: 'Not checked',
}

/** Assistant kit `Checks`: the passed and flagged checks of a proposal, each with a Status kit Check. Shared. */
export default function CheckList({ items, variant = 'checks', label, className }: CheckListProps) {
  const signals = variant === 'signals'
  return (
    <ul
      data-part={signals ? 'signals' : 'checks'}
      {...(label ? { 'aria-label': label } : {})}
      className={cn('m-0 flex list-none flex-col p-0', !signals && 'gap-1.5', className)}
    >
      {items.map((c) => (
        <li
          key={c.key}
          data-mark={c.mark}
          className={cn(
            'grid grid-cols-[16px_minmax(0,1fr)_auto] items-start',
            // Size and leading in one class: tailwind-merge drops a leading- that precedes a text size.
            signals
              ? 'border-io-line-2 gap-2.5 border-t py-2 text-[13px]/[1.4]'
              : 'gap-2 text-[12.5px]/[1.4]'
          )}
        >
          <Check mark={c.mark} label={CHECK_MARK_LABEL[c.mark]} className="mt-px" />
          <span>{c.text}</span>
          {c.right == null ? (
            <span />
          ) : (
            <span
              className={cn(
                'text-[12px] whitespace-nowrap',
                signals ? 'text-io-accent' : 'text-io-ink-3'
              )}
            >
              {c.right}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
