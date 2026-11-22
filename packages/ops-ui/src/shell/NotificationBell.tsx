'use client'

import { Bell } from 'lucide-react'
import { cn } from '../lib/cn'
import { useShellLive } from './live'

export interface NotificationBellProps {
  count: number
  /** Opens the notifications panel; otherwise the `ShellLiveProvider`'s `openNotifications`. */
  onOpen?: () => void
  className?: string
}

/**
 * TodayHeader's bell: a 32 button, radius 6, ink-2 line icon (not an emoji), and a red count of 16 at its
 * top-right when anything is unread. The count is in the accessible name.
 */
export default function NotificationBell({ count, onOpen, className }: NotificationBellProps) {
  const live = useShellLive()
  const open = onOpen ?? live.openNotifications
  const label = count > 0 ? `Notifications, ${count} unread` : 'Notifications'
  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="dialog"
      {...(open ? { onClick: open } : {})}
      data-part="notification-bell"
      className={cn(
        'rounded-io-ctl text-io-ink-2 hover:bg-io-fill io-focus relative grid size-8 flex-none cursor-pointer place-items-center',
        className
      )}
    >
      <Bell aria-hidden="true" strokeWidth={1.75} className="size-[18px]" />
      {count > 0 ? (
        <b
          aria-hidden="true"
          className="rounded-io-pill bg-io-bad-solid absolute top-0.5 right-0 grid h-4 min-w-4 place-items-center px-1 text-[10px] leading-none font-medium text-white"
        >
          {count > 99 ? '99+' : count}
        </b>
      ) : null}
    </button>
  )
}
