import type { ReactNode } from 'react'
import ButtonLink from '../controls/ButtonLink'
import { cn } from '../lib/cn'

export type HeadingLevel = 2 | 3 | 4

export interface StateBoxProps {
  tone: 'empty' | 'error' | 'offline'
  mark: string
  title: string
  text?: ReactNode
  actions?: ReactNode
  foot?: ReactNode
  align?: 'left' | 'center'
  /** No card: no border, no ground (inside another card). */
  bare?: boolean
  /** The title's heading level, default 2 (a state usually replaces a page's or a card's body). */
  headingLevel?: HeadingLevel
  className?: string
}

const MARK = {
  empty: 'bg-io-navy text-white',
  error: 'bg-io-bad-tint text-io-bad',
  offline: 'bg-io-fill text-io-ink-2',
} as const

/** The kit's 32px boxed link button (`ke-b g`): accent text, transparent border, 12px padding. */
export const STATE_LINK = 'h-io-btn-sm border px-3'
/** The kit's 32px primary (`ke-b p`), 12px padding. */
export const STATE_PRIMARY = 'px-3'

/**
 * The States kit box (`ke-es`) shared by EmptyState, ErrorState and OfflineState: a white card r 10,
 * 22 × 20 (centre 40 × 28), a 38px mark r 9 with a short code, a 15/500 title, 12.5/1.55 text up to 420
 * wide, a row of 32px buttons and an 11.5 foot. Shared.
 */
export default function StateBox({
  tone,
  mark,
  title,
  text,
  actions,
  foot,
  align = 'left',
  bare = false,
  headingLevel = 2,
  className,
}: StateBoxProps) {
  const Heading = `h${headingLevel}` as const
  return (
    <div
      data-part="state"
      data-tone={tone}
      className={cn(
        'rounded-io-card border-io-line bg-io-card flex w-full min-w-0 flex-col items-start gap-2.5 border px-5 py-[22px]',
        align === 'center' && 'items-center px-7 py-10 text-center',
        bare && 'border-transparent bg-transparent',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'rounded-io-9 grid size-[38px] place-items-center text-[13px] font-semibold',
          MARK[tone]
        )}
      >
        {mark}
      </span>
      <Heading className="text-[15px] leading-[1.45] font-medium">{title}</Heading>
      {text ? (
        <p className="text-io-ink-2 max-w-[420px] text-[12.5px] leading-[1.55] text-pretty">
          {text}
        </p>
      ) : null}
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      {foot ? <small className="text-io-ink-3 text-[11.5px] leading-[1.45]">{foot}</small> : null}
    </div>
  )
}

/** A preset action as the kit draws it: the primary button, or a boxed link-style button. */
export function StateActionLink({
  label,
  href,
  primary = false,
}: {
  label: string
  href: string
  primary?: boolean | undefined
}) {
  return (
    <ButtonLink
      href={href}
      size="sm"
      variant={primary ? 'primary' : 'link'}
      className={primary ? STATE_PRIMARY : STATE_LINK}
    >
      {label}
    </ButtonLink>
  )
}
