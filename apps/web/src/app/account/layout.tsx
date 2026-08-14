import { requireCustomer } from '../../lib/customer-session'
import { db } from '@indus/db'
import AccountSidebar from './AccountSidebar'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomer()

  const accountId = session.user.accountId
  const contactId = session.user.id

  // Single round-trip for all sidebar badge counts. Quotes/lists are scoped
  // to the account; notifications to the individual contact.
  const [quotesCount, listsCount, unreadNotifs] = await Promise.all([
    db.rfq.count({ where: { accountId } }),
    db.savedList.count({ where: { accountId } }),
    db.notification.count({ where: { contactId, readAt: null } }),
  ])

  return (
    <div className="max-w-[1360px] mx-auto px-8 py-8 grid grid-cols-[240px_1fr] gap-8 items-start">
      <AccountSidebar
        userName={session.user.name ?? ''}
        userEmail={session.user.email ?? ''}
        counts={{
          quotes: quotesCount,
          lists: listsCount,
          notifications: unreadNotifs,
        }}
      />
      <main>{children}</main>
    </div>
  )
}
