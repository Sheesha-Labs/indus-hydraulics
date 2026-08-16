import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import { ROLES } from '../../../../lib/rbac'
import { requireStaffRole } from '../../../../lib/staff-session'
import InviteStaffPanel, { type PendingInvite } from './InviteStaffPanel'
import AdminPageShell from '../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Staff Users — Indus Admin' }

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  sales_rep: 'Sales Rep',
  engineer: 'Engineer',
  warehouse: 'Warehouse',
  finance: 'Finance',
  cms_editor: 'CMS Editor',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-[var(--color-ih-danger)] text-white',
  manager: 'bg-ih-accent text-white',
  sales_rep: 'bg-ih-steel text-white',
  engineer: 'bg-[var(--color-ih-warning)] text-ih-ink',
  warehouse: 'bg-ih-surface-2 text-ih-ink-2',
  finance: 'bg-ih-surface-2 text-ih-ink-2',
  cms_editor: 'bg-ih-surface-2 text-ih-ink-2',
}

export default async function UsersPage() {
  // Lists every staff member's name, email and role — USERS_WRITE, not merely signed-in.
  await requireStaffRole(ROLES.USERS_WRITE)

  // Outstanding invitations: not yet used, not yet expired. Expired rows are
  // left in place rather than swept — they are the record that an invite was
  // sent and never taken up.
  const pendingRows = await db.staffInvitation.findMany({
    where: { purpose: 'invite', activatedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, role: true, expiresAt: true,
      invitedBy: { select: { name: true } },
    },
  })
  const pending: PendingInvite[] = pendingRows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    expiresAt: r.expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    invitedByName: r.invitedBy?.name ?? null,
  }))

  const users = await db.staffUser.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { assignedRfqs: true, assignedAccounts: true } },
    },
  })

  return (
    <AdminPageShell
      title={'Staff Users'}
      sub={<>{users.length} staff member{users.length !== 1 ? 's' : ''}</>}
      actions={
        <Link
        href="/admin/users/new"
        className="h-9 px-4 bg-ih-accent text-white font-mono text-[12px] flex items-center hover:opacity-90"
        >
        + Add Staff
        </Link>
      }
    >
      <InviteStaffPanel pending={pending} />

      <div className="border border-ih-border overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ih-border bg-ih-surface-2">
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">Name</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">Email</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">Role</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">RFQs</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">Accounts</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={`border-b border-ih-border last:border-0 hover:bg-ih-surface-2 transition-colors ${
                  !user.isActive ? 'opacity-50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-ih-surface-2 border border-ih-border grid place-items-center font-mono text-[11px] text-ih-muted shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-ih-ink">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ih-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`font-mono text-[10px] px-2 py-0.5 ${ROLE_COLORS[user.role] ?? 'bg-ih-surface-2'}`}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-ih-muted">
                  {user._count.assignedRfqs}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-ih-muted">
                  {user._count.assignedAccounts}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-mono text-[10px] px-2 py-0.5 ${
                    user.isActive
                      ? 'bg-[var(--color-ih-success-soft)] text-ih-success'
                      : 'bg-ih-surface-2 text-ih-muted'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="font-mono text-[11px] text-ih-accent hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
    </AdminPageShell>
  )
}
