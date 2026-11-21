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
  manager: 'bg-ih-accent text-ih-accent-fg',
  sales_rep: 'bg-ih-steel text-ih-bg',
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
    // eslint-disable-next-line react/purity -- Server Component: reading the clock at render is intended here.
    where: { purpose: 'invite', activatedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      expiresAt: true,
      invitedBy: { select: { name: true } },
    },
  })
  const pending: PendingInvite[] = pendingRows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    expiresAt: r.expiresAt.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
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
      sub={
        <>
          {users.length} staff member{users.length !== 1 ? 's' : ''}
        </>
      }
      actions={
        <Link
          href="/admin/users/new"
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover flex h-9 items-center px-4 text-[12px] tabular-nums"
        >
          + Add Staff
        </Link>
      }
    >
      <InviteStaffPanel pending={pending} />

      <div className="border-ih-border overflow-hidden rounded-lg border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-ih-border bg-ih-surface-2 border-b">
              <th className="text-ih-muted px-4 py-3 text-left text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
                Name
              </th>
              <th className="text-ih-muted px-4 py-3 text-left text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
                Email
              </th>
              <th className="text-ih-muted px-4 py-3 text-left text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
                Role
              </th>
              <th className="text-ih-muted px-4 py-3 text-left text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
                RFQs
              </th>
              <th className="text-ih-muted px-4 py-3 text-left text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
                Accounts
              </th>
              <th className="text-ih-muted px-4 py-3 text-left text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={`border-ih-border hover:bg-ih-surface-2 border-b transition-colors last:border-0 ${
                  !user.isActive ? 'opacity-50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-ih-surface-2 border-ih-border text-ih-muted grid h-7 w-7 shrink-0 place-items-center rounded-md border text-[11px] tabular-nums">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-ih-ink font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="text-ih-muted px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 text-[11px] tabular-nums ${ROLE_COLORS[user.role] ?? 'bg-ih-surface-2'}`}
                  >
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </td>
                <td className="text-ih-muted px-4 py-3 text-[12px] tabular-nums">
                  {user._count.assignedRfqs}
                </td>
                <td className="text-ih-muted px-4 py-3 text-[12px] tabular-nums">
                  {user._count.assignedAccounts}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 text-[11px] tabular-nums ${
                      user.isActive
                        ? 'text-ih-success bg-[var(--color-ih-success-soft)]'
                        : 'bg-ih-surface-2 text-ih-muted'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-ih-accent text-[11px] tabular-nums hover:underline"
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
