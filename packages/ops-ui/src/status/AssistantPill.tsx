import type { MouseEventHandler } from 'react'
import { cn } from '../lib/cn'
import { ASSISTANT_PILL } from '../status'
import type { AssistantStatus } from '../types'

export interface AssistantPillProps {
  status: AssistantStatus
  /** Defaults per status; e.g. "Assistant · 2 unsure". */
  label?: string
  /** With href it renders a link, with onClick a button (the sidebar pill opens Autopilot). */
  href?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
}

/** Status kit `ks-dot`: h 28 pill, 7px dot, 12px 500, label and colours per status from ASSISTANT_PILL. */
export default function AssistantPill({
  status,
  label,
  href,
  onClick,
  className,
}: AssistantPillProps) {
  const pill = ASSISTANT_PILL[status]
  const cls = cn(
    'rounded-io-pill inline-flex h-7 flex-none items-center gap-2 px-[11px] text-[12px] font-medium whitespace-nowrap',
    pill.bg,
    pill.ink,
    className
  )
  const body = (
    <>
      <span aria-hidden="true" className={cn('rounded-io-pill size-[7px] flex-none', pill.dot)} />
      {label ?? pill.label}
    </>
  )
  if (href)
    return (
      <a
        href={href}
        data-part="assistant-pill"
        data-status={status}
        className={cn(cls, 'io-focus')}
      >
        {body}
      </a>
    )
  if (onClick)
    return (
      <button
        type="button"
        onClick={onClick}
        data-part="assistant-pill"
        data-status={status}
        className={cn(cls, 'io-focus cursor-pointer')}
      >
        {body}
      </button>
    )
  return (
    <span data-part="assistant-pill" data-status={status} className={cls}>
      {body}
    </span>
  )
}
