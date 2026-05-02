import { safeAuth } from '../lib/auth'
import { db } from '@indus/db'
import { getNavMenu } from '../lib/navigation'
import { getStoreSettings } from '../lib/store-settings'
import SiteHeaderClient from './SiteHeaderClient'
import NotificationBell from './NotificationBell'

export default async function SiteHeader() {
  const session = await safeAuth()

  const [headerMenu, megamenu, settings, notifications, activeSkuCount] = await Promise.all([
    getNavMenu('primary_header'),
    getNavMenu('primary_megamenu'),
    getStoreSettings(),
    session?.user?.id
      ? db.notification.findMany({
          where: { contactId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, kind: true, payload: true, readAt: true, createdAt: true },
        })
      : Promise.resolve([]),
    db.product.count({ where: { status: 'active' } }),
  ])

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <SiteHeaderClient
      headerItems={headerMenu?.items ?? []}
      megamenuItems={megamenu?.items ?? []}
      contactPhone={settings.contactPhone}
      contactHours={settings.contactHours}
      isSignedIn={!!session}
      userName={session?.user?.name ?? null}
      activeSkuCount={activeSkuCount}
      notificationBell={
        session ? (
          <NotificationBell
            unreadCount={unreadCount}
            notifications={notifications.map((n) => ({
              ...n,
              payload: n.payload as Record<string, unknown>,
            }))}
          />
        ) : null
      }
    />
  )
}
