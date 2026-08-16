'use client'

import { useState, useTransition } from 'react'
import { markNotificationRead, markAllRead } from '../app/(storefront)/account/notifications/actions'

interface Notification {
  id: string
  kind: string
  payload: Record<string, unknown>
  readAt: Date | null
  createdAt: Date
}

interface Props {
  unreadCount: number
  notifications: Notification[]
}

const KIND_LABELS: Record<string, string> = {
  rfq_submitted: 'RFQ Submitted',
  quote_sent: 'Quote Ready',
  order_created: 'Order Created',
  order_shipped: 'Order Shipped',
  account_updated: 'Account Updated',
}

export default function NotificationBell({ unreadCount: initialCount, notifications: initialNotifications }: Props) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialCount)
  const [, startTransition] = useTransition()

  function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
    startTransition(async () => {
      await markNotificationRead(id)
    })
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date() })))
    setUnreadCount(0)
    startTransition(async () => {
      await markAllRead()
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center h-9 w-9 border border-ih-border hover:bg-ih-surface-2 transition-colors"
        aria-label="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-ih-accent text-white font-mono text-[9px] grid place-items-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-[360px] bg-ih-surface border border-ih-border shadow-lg z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ih-border">
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="font-mono text-[11px] text-ih-accent hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-[13px] text-ih-muted">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const href = getNotificationHref(n)
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 border-b border-ih-border last:border-0 hover:bg-ih-surface-2 transition-colors ${
                        !n.readAt ? 'bg-ih-surface-2' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {!n.readAt && (
                            <span className="w-1.5 h-1.5 rounded-full bg-ih-accent shrink-0" />
                          )}
                          <span className="font-mono text-[11px] text-ih-muted">
                            {KIND_LABELS[n.kind] ?? n.kind}
                          </span>
                        </div>
                        {typeof n.payload.message === 'string' && (
                          <p className="text-[13px] text-ih-ink-2 truncate">{n.payload.message}</p>
                        )}
                        <p className="font-mono text-[10px] text-ih-muted-2 mt-0.5">
                          {new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {href && (
                          <a
                            href={href}
                            className="font-mono text-[10px] text-ih-accent hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            View →
                          </a>
                        )}
                        {!n.readAt && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="font-mono text-[10px] text-ih-muted hover:text-ih-ink-2"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function getNotificationHref(n: { kind: string; payload: Record<string, unknown> }): string | null {
  if (typeof n.payload.rfqCode === 'string') return `/quote/${n.payload.rfqCode}`
  // /account/orders fallback removed — that route does not exist yet.
  // Order-related notifications now fall through to the notifications page.
  if (typeof n.payload.orderId === 'string') return `/account/notifications`
  return null
}
