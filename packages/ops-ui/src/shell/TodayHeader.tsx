import { cn } from '../lib/cn'
import AssistantPill from '../status/AssistantPill'
import type { AssistantStatus } from '../types'
import NotificationBell from './NotificationBell'

export interface TodayHeaderProps {
  /** "Good morning, Owner · Thursday 14 Nov": the page's h1, Instrument Serif 32. */
  greeting: string
  assistant: AssistantStatus
  notificationCount: number
  /** Client parents only; otherwise the `ShellLiveProvider`'s `openNotifications`. */
  onOpenNotifications?: () => void
  className?: string
}

/**
 * Shell kit `TodayHeader` (05 §3.13): the serif greeting, the Assistant pill and the notifications bell.
 * Shared; the bell is its client part.
 */
export default function TodayHeader({
  greeting,
  assistant,
  notificationCount,
  onOpenNotifications,
  className,
}: TodayHeaderProps) {
  return (
    <header
      data-part="today-header"
      className={cn(
        'bg-io-card border-io-line flex w-full flex-none items-center gap-3.5 border-b px-7 pt-[22px] pb-3.5',
        className
      )}
    >
      <h1 className="io-display text-io-greeting whitespace-nowrap">{greeting}</h1>
      <AssistantPill status={assistant} />
      <NotificationBell
        count={notificationCount}
        className="ml-auto"
        {...(onOpenNotifications ? { onOpen: onOpenNotifications } : {})}
      />
    </header>
  )
}
