import { requireStaff } from '../../../lib/staff-session'
import AdminSidebar from '../../../components/admin/AdminSidebar'

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        userName={session.user?.name ?? 'Admin'}
        userRole={session.user?.role ?? 'admin'}
      />
      {/*
        No topbar here. v2 fills the 60px bar with the page's own title,
        subtitle and actions, so each page renders AdminPageShell as its root
        and the bar lands in exactly this position — a direct child of this
        column, so `sticky top-0` behaves as it did before.

        admin-page-shell.test.ts asserts every page does so; that is what
        replaces the old "the layout renders it, nobody can forget it".
      */}
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  )
}
