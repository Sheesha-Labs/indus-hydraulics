import { NextResponse } from 'next/server'
import { db } from '@indus/db'
import { customerSessionOrNull } from '../../../lib/customer-session'

/**
 * The signed-in half of the site header, as data.
 *
 * The header used to read the session during the server render. Because it is
 * mounted in the storefront layout, that single `await auth()` made EVERY page
 * under (storefront) dynamic — a cookie read anywhere in the tree opts the
 * whole route out of static generation. Verified by building with the call
 * stubbed out: /contact, /privacy and /terms flip from `ƒ` to `○` immediately.
 *
 * So the header renders signed-out and static, and the account area asks this
 * route who the visitor is after hydration. Anonymous visitors — every crawler
 * and the overwhelming majority of real traffic on a catalogue site — get a
 * fully cacheable page. Signed-in visitors get one small request.
 *
 * Deliberately no-store: the payload is per-visitor, and a shared cache in
 * front of it would hand one customer another's name and notifications.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await customerSessionOrNull()

  if (!session) {
    return NextResponse.json(
      { signedIn: false as const, name: null, unreadCount: 0, notifications: [] },
      { headers: { 'cache-control': 'no-store' } },
    )
  }

  const notifications = await db.notification.findMany({
    where: { contactId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, kind: true, payload: true, readAt: true, createdAt: true },
  })

  return NextResponse.json(
    {
      signedIn: true as const,
      name: session.user.name ?? null,
      unreadCount: notifications.filter((n) => !n.readAt).length,
      notifications,
    },
    { headers: { 'cache-control': 'no-store' } },
  )
}
