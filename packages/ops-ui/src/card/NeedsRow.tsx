import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import CardLink from './CardLink'

export interface NeedsRowProps {
  /** The action tag: "Send quotation", "Bank change". */
  action?: string
  title: ReactNode
  /** One line of context, 12 ink-3. */
  sub?: ReactNode
  /** The row's buttons (Controls Button or ButtonLink, size sm: 32). */
  actions: ReactNode
  /** Makes the title a link to the record. */
  href?: string
  className?: string
}

/**
 * Card kit needs-you row (`kr-nr`) for Today and Review: grid 1fr / auto, p 12×16, line, radius 10, 13px;
 * an accent-tint action tag (22), the record, one line of context, the buttons.
 */
export default function NeedsRow({ action, title, sub, actions, href, className }: NeedsRowProps) {
  return (
    <div
      data-part="needs-row"
      className={cn(
        'rounded-io-card border-io-line bg-io-card grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border px-4 py-3 text-[13px] leading-[1.45]',
        className
      )}
    >
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-2">
          {action ? (
            <span className="h-io-tag-action rounded-io-tag bg-io-accent-tint text-io-accent inline-flex flex-none items-center px-2 text-[11.5px] font-medium whitespace-nowrap">
              {action}
            </span>
          ) : null}
          {href ? (
            <CardLink href={href} className="text-io-ink">
              {title}
            </CardLink>
          ) : (
            title
          )}
        </span>
        {sub ? <small className="text-io-ink-3 mt-0.5 block text-[12px]">{sub}</small> : null}
      </span>
      <span className="flex gap-1.5">{actions}</span>
    </div>
  )
}
