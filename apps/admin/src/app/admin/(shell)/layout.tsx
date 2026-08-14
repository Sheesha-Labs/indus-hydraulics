import { requireStaff } from '../../../lib/staff-session'
import AdminSidebar from '../../../components/AdminSidebar'
import AdminTopbar from '../../../components/AdminTopbar'

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        userName={session.user?.name ?? 'Admin'}
        userRole={session.user?.role ?? 'admin'}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        {children}
      </div>
    </div>
  )
}
