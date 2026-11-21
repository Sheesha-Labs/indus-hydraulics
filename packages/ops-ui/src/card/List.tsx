import { cn } from '../lib/cn'
import Check from '../status/Check'
import type { MarkTone } from '../types'
import CardLink, { isLinkSpec } from './CardLink'
import type { ListItem } from './types'

export interface ListProps {
  items: ListItem[]
  className?: string
}

/** What a mark means, read in place of its glyph. */
export const MARK_TEXT: Record<MarkTone, string> = {
  ok: 'Done',
  warn: 'Needs attention',
  bad: 'Problem',
  n: 'Note',
  acc: 'Next',
  run: 'In progress',
  todo: 'To do',
}

/**
 * Card kit list rows (`kr-li`): a <ul>; each row is mark 16 / text / right, gap 10, py 8, a line-2 top rule,
 * 13/1.4. The mark is the Status kit Check (glyph hidden, its meaning read as text). A right-hand LinkSpec
 * is an accent link.
 */
export default function List({ items, className }: ListProps) {
  return (
    <ul data-part="list" className={cn('m-0 flex list-none flex-col p-0', className)}>
      {items.map((item) => {
        const marked = Boolean(item.mark)
        return (
          <li
            key={item.key}
            className={cn(
              'border-io-line-2 grid items-start gap-2.5 border-t py-2 text-[13px] leading-[1.4]',
              marked ? 'grid-cols-[16px_minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]'
            )}
          >
            {item.mark ? (
              <Check mark={item.mark} label={MARK_TEXT[item.mark]} className="mt-px" />
            ) : null}
            <span className="min-w-0">
              {item.title}
              {item.sub ? (
                <small className="text-io-ink-3 mt-px block text-[12px] leading-[1.45]">
                  {item.sub}
                </small>
              ) : null}
            </span>
            <span className="text-io-ink-3 text-[12px] whitespace-nowrap">
              {isLinkSpec(item.right) ? (
                <CardLink href={item.right.href} external={item.right.external}>
                  {item.right.label}
                </CardLink>
              ) : (
                item.right
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
