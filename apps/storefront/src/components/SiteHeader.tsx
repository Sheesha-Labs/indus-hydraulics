import { getTranslations } from 'next-intl/server'
import { safeAuth } from '../lib/auth'
import { db } from '@indus/db'
import SiteHeaderClient from './SiteHeaderClient'
import NotificationBell from './NotificationBell'

export type CategoryNav = { id: string; name: string; slug: string; productCount: number }

export default async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'nav' })
  const session = await safeAuth()

  const [categories, notifications, activeSkuCount] = await Promise.all([
    db.category.findMany({
      where: { isPublished: true },
      orderBy: { position: 'asc' },
      include: { _count: { select: { products: true } } },
    }),
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

  const navCategories: CategoryNav[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
  }))

  const navItems = [
    { label: t('products'), href: `/${locale}/c`, hasMegamenu: true },
    { label: t('brands'), href: `/${locale}/brands`, hasMegamenu: false },
    { label: t('industries'), href: `/${locale}/industries`, hasMegamenu: false },
    { label: t('about'), href: `/${locale}/about`, hasMegamenu: false },
    { label: t('contact'), href: `/${locale}/contact`, hasMegamenu: false },
  ]

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <SiteHeaderClient
      locale={locale}
      navItems={navItems}
      navCategories={navCategories}
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
            locale={locale}
          />
        ) : null
      }
    />
  )
}
