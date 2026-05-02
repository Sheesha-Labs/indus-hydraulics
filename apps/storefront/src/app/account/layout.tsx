import { auth } from '../../lib/auth'
import { redirect } from 'next/navigation'
import AccountSidebar from './AccountSidebar'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect(`/sign-in`)
  }

  return (
    <div className="max-w-[1360px] mx-auto px-8 py-8 grid grid-cols-[240px_1fr] gap-8 items-start">
      <AccountSidebar
        userName={session.user?.name ?? ''}
        userEmail={session.user?.email ?? ''}
      />
      <main>{children}</main>
    </div>
  )
}
