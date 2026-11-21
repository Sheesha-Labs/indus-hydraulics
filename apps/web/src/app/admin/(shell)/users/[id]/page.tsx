import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import { auth } from '../../../../../lib/admin-auth'
import { ROLES as PERMS, requireRole } from '../../../../../lib/rbac'
import { requireStaffRole } from '../../../../../lib/staff-session'
import { Input, Select } from '@indus/ui'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Edit Staff — Indus Admin' }

type Props = { params: Promise<{ id: string }> }

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales_rep', label: 'Sales Rep' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'finance', label: 'Finance' },
  { value: 'cms_editor', label: 'CMS Editor' },
]

export default async function EditUserPage({ params }: Props) {
  await requireStaffRole(PERMS.USERS_WRITE)

  const { id } = await params

  const user = await db.staffUser.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })

  if (!user) notFound()

  async function saveUser(formData: FormData) {
    'use server'
    requireRole(await auth(), PERMS.USERS_WRITE)

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    const isActive = formData.get('isActive') === '1'
    const password = formData.get('password') as string | null

    const data: Record<string, unknown> = { name, email, role, isActive }
    if (password) {
      const bcrypt = await import('bcryptjs')
      data.passwordHash = await bcrypt.hash(password, 12)
    }
    await db.staffUser.update({ where: { id }, data })
    redirect(`/admin/users/${id}`)
  }

  async function deactivateUser() {
    'use server'
    requireRole(await auth(), PERMS.USERS_WRITE)
    await db.staffUser.update({ where: { id }, data: { isActive: false } })
    redirect(`/admin/users/${id}`)
  }

  async function activateUser() {
    'use server'
    requireRole(await auth(), PERMS.USERS_WRITE)
    await db.staffUser.update({ where: { id }, data: { isActive: true } })
    redirect(`/admin/users/${id}`)
  }

  return (
    <AdminPageShell
      title="Edit Staff Member"
      sub={user.name}
      actions={
        <Link
          href="/admin/users"
          className="border-ih-border bg-ih-surface hover:border-ih-accent hover:text-ih-accent flex h-9 items-center rounded-md border px-4 text-[13px] font-medium transition-colors"
        >
          ← All staff
        </Link>
      }
    >
      <div className="max-w-[560px]">
        <form action={saveUser} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="user-name"
              className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
            >
              Full Name
            </label>
            <Input id="user-name" name="name" type="text" required defaultValue={user.name} />
          </div>

          <div>
            <label
              htmlFor="user-email"
              className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
            >
              Email Address
            </label>
            <Input id="user-email" name="email" type="email" required defaultValue={user.email} />
          </div>

          <div>
            <label
              htmlFor="user-password"
              className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
            >
              New Password{' '}
              <span className="text-ih-muted-2 normal-case">(leave blank to keep current)</span>
            </label>
            <Input id="user-password" name="password" type="password" autoComplete="new-password" />
          </div>

          <div>
            <label
              htmlFor="user-role"
              className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
            >
              Role
            </label>
            <Select id="user-role" name="role" defaultValue={user.role}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              value="1"
              defaultChecked={user.isActive}
              className="h-4 w-4"
            />
            <label htmlFor="isActive" className="text-ih-ink-2 text-[13px]">
              Active account
            </label>
          </div>

          <div className="border-ih-border flex items-center gap-3 border-t pt-2">
            <button
              type="submit"
              className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-9 px-5 text-[12px] tabular-nums"
            >
              Save Changes
            </button>
            <Link
              href="/admin/users"
              className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 flex h-9 items-center rounded-md border px-4 text-[12px] tabular-nums"
            >
              Cancel
            </Link>
          </div>
        </form>

        <div className="border-ih-border mt-8 border-t pt-6">
          <p className="text-ih-muted mb-3 text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums">
            Danger Zone
          </p>
          {user.isActive ? (
            <form action={deactivateUser}>
              <button
                type="submit"
                className="border-ih-danger text-ih-danger h-9 rounded-md border px-4 text-[12px] tabular-nums transition-colors hover:bg-[var(--color-ih-danger)] hover:text-white"
              >
                Deactivate Account
              </button>
            </form>
          ) : (
            <form action={activateUser}>
              <button
                type="submit"
                className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 h-9 rounded-md border px-4 text-[12px] tabular-nums"
              >
                Reactivate Account
              </button>
            </form>
          )}
        </div>
      </div>
    </AdminPageShell>
  )
}
