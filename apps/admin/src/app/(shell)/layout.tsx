import { auth } from '../../lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '../../components/AdminSidebar'

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect(`/sign-in`)
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        userName={session.user?.name ?? 'Admin'}
        userRole={session.user?.role ?? 'admin'}
      />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  )
}
