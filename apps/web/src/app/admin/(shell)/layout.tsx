import { requireStaff } from '../../../lib/staff-session'
import AdminSidebar from '../../../components/admin/AdminSidebar'

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff()

  return (
    /*
      A two-column grid, not a flex row.

      `md:overflow-hidden` on the content column, against the grid's
      `md:min-h-screen`, pins that column to the viewport — which is what makes
      AdminPageShell's own `<main class="overflow-auto">` the desktop scroller
      and keeps the sidebar and the 60px bar in view WITHOUT either of them
      being sticky or fixed. The sidebar used to carry `sticky top-0 h-screen`
      to achieve the same thing; with this height chain that is redundant, and
      a sticky bar additionally creates a stacking context that any later
      overlay has to fight.
    */
    <div className="md:grid md:min-h-screen md:grid-cols-[240px_1fr]">
      <AdminSidebar
        userName={session.user?.name ?? 'Admin'}
        userRole={session.user?.role ?? 'admin'}
      />
      {/*
        No topbar here. Each page renders AdminPageShell as its root, which
        owns both the 60px bar and the scrolling <main> beneath it —
        admin-page-shell.test.ts asserts every page does so. That is what
        replaces the old "the layout renders it, nobody can forget it".
      */}
      <div className="flex min-w-0 flex-col md:overflow-hidden">{children}</div>
    </div>
  )
}
