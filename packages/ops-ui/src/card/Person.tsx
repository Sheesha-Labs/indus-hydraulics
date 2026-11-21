import { cn } from '../lib/cn'
import type { Actor, Size3 } from '../types'

export interface PersonProps {
  initials: string
  /** Shown beside the avatar (12.5/500); without it the avatar is named by `label` or the initials. */
  name?: string
  /** 11 ink-3 under the name: "Owner", "Helper · purchase@" (the kit's `role`; renamed because `role` is an ARIA attribute). */
  sub?: string
  /** Accessible name of an avatar shown without its name. */
  label?: string
  who: Actor
  /** Avatar 22 / 30 / 40. Default md. */
  size?: Size3
  className?: string
}

const WHO: Record<Actor, string> = {
  owner: 'bg-io-accent-tint text-io-accent rounded-io-pill',
  helper: 'bg-io-ok-tint text-io-ok rounded-io-pill',
  assistant: 'bg-io-navy rounded-io-7 text-white',
  ext: 'bg-io-fill text-io-ink-2 rounded-io-pill',
}
const SIZE: Record<Size3, string> = {
  sm: 'size-[22px] text-[9.5px]',
  md: 'size-[30px] text-[11px]',
  lg: 'size-10 text-[13px]',
}

/**
 * Card kit person (`kr-pp`): an initials avatar (owner accent-tint, helper ok-tint, the Assistant navy with
 * radius 7, anyone outside fill) and an optional name and role. The initials are hidden from screen
 * readers when the name is shown.
 */
export default function Person({
  initials,
  name,
  sub,
  label,
  who,
  size = 'md',
  className,
}: PersonProps) {
  return (
    <span
      data-part="person"
      data-who={who}
      className={cn('inline-flex items-center gap-2.5', className)}
    >
      <span
        {...(name ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label ?? initials })}
        className={cn('grid flex-none place-items-center font-semibold', WHO[who], SIZE[size])}
      >
        {initials}
      </span>
      {name ? (
        <span className="flex flex-col leading-[1.3]">
          <b className="text-[12.5px] font-medium">{name}</b>
          {sub ? <span className="text-io-ink-3 text-[11px]">{sub}</span> : null}
        </span>
      ) : null}
    </span>
  )
}
