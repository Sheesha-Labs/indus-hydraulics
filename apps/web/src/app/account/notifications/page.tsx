import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '../../../lib/auth'
import { db } from '@indus/db'
import NotificationActions from './NotificationActions'

export const metadata: Metadata = { title: 'Notifications' }

const KIND_LABELS: Record<string, string> = {
  rfq_status_change: 'Quote update',
  quote_sent: 'Quote ready',
  order_shipped: 'Order shipped',
  mention: 'Mention',
  password_reset: 'Password reset',
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

type NotificationPayload = {
  rfqCode?: string
  quoteCode?: string
  outcome?: string
  rfqId?: string
}

function describe(kind: string, payload: NotificationPayload): { title: string; href: string | null } {
  if (kind === 'rfq_status_change') {
    const outcome = payload.outcome
    const rfqCode = payload.rfqCode
    const quoteCode = payload.quoteCode
    if (outcome === 'accepted') {
      return {
        title: `Order acknowledged${quoteCode ? ` — quotation ${quoteCode}` : ''}`,
        href: rfqCode ? `/quote/${rfqCode}` : null,
      }
    }
    if (outcome === 'declined') {
      return {
        title: `Quotation closed${quoteCode ? ` (${quoteCode})` : ''}`,
        href: rfqCode ? `/quote/${rfqCode}` : null,
      }
    }
    return {
      title: rfqCode ? `Status update on ${rfqCode}` : 'Status update',
      href: rfqCode ? `/quote/${rfqCode}` : null,
    }
  }
  if (kind === 'quote_sent') {
    return {
      title: payload.quoteCode ? `Quotation ${payload.quoteCode} ready` : 'Quotation ready',
      href: payload.rfqCode ? `/quote/${payload.rfqCode}` : null,
    }
  }
  return { title: KIND_LABELS[kind] ?? kind, href: null }
}

export default async function NotificationsPage() {
  const session = await auth()
  const contactId = session?.user?.id
  if (!contactId) {
    return null // middleware should have redirected; render nothing if it didn't
  }

  const notifications = await db.notification.findMany({
    where: { contactId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase">
            <Link href={`/account`} className="hover:text-[var(--color-primary)]">
              Account
            </Link>
            {' / '}Notifications
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight mt-1.5">Notifications</h1>
          <p className="text-[13px] text-[var(--color-muted)] mt-1">
            {unreadCount === 0 ? 'You’re all caught up.' : `${unreadCount} unread`}
          </p>
        </div>
        {unreadCount > 0 ? <NotificationActions hasUnread={unreadCount > 0} /> : null}
      </div>

      {notifications.length === 0 ? (
        <div className="py-16 border border-dashed border-[var(--color-border)] text-center">
          <p className="text-[var(--color-muted)] text-sm">No notifications yet.</p>
          <p className="text-[12px] text-[var(--color-caption)] mt-2">
            We’ll let you know when there’s an update on one of your quotes.
          </p>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] divide-y divide-[var(--color-border-2)]">
          {notifications.map((n) => {
            const payload = (n.payload as NotificationPayload) ?? {}
            const { title, href } = describe(n.kind, payload)
            const unread = !n.readAt
            const inner = (
              <div className="flex items-start gap-3 px-4 py-3.5">
                <div
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    unread ? 'bg-[var(--color-accent)]' : 'bg-transparent'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className={`text-[13px] ${unread ? 'font-semibold text-[var(--color-primary)]' : 'text-[var(--color-body)]'}`}>
                      {title}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-muted)] flex-shrink-0">
                      {timeAgo(new Date(n.createdAt))}
                    </div>
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.06em] uppercase text-[var(--color-caption)] mt-0.5">
                    {KIND_LABELS[n.kind] ?? n.kind}
                  </div>
                </div>
              </div>
            )
            return href ? (
              <Link key={n.id} href={href} className="block hover:bg-[var(--color-deep)] transition-colors">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
