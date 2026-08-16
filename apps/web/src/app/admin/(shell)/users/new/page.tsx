import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { db } from '@indus/db'
import { auth } from '../../../../../lib/admin-auth'
import { ROLES as PERMS, requireRole } from '../../../../../lib/rbac'
import { requireStaffRole } from '../../../../../lib/staff-session'
import { Input, Select } from '@indus/ui'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Add Staff — Indus Admin' }

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales_rep', label: 'Sales Rep' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'finance', label: 'Finance' },
  { value: 'cms_editor', label: 'CMS Editor' },
]

export default async function NewUserPage() {
  await requireStaffRole(PERMS.USERS_WRITE)

  async function createUser(formData: FormData) {
    'use server'
    requireRole(await auth(), PERMS.USERS_WRITE)

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    const password = formData.get('password') as string

    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(password, 12)

    const created = await db.staffUser.create({
      data: { name, email, role: role as never, isActive: true, passwordHash },
    })

    redirect(`/admin/users/${created.id}`)
  }

  return (
    <AdminPageShell
      title="Add Staff Member"
      actions={
        <Link
          href="/admin/users"
          className="flex h-9 items-center rounded-md border border-ih-border bg-ih-surface px-4 text-[13px] font-medium transition-colors hover:border-ih-accent hover:text-ih-accent"
        >
          ← All staff
        </Link>
      }
    >
      <div className="max-w-[560px]">

        <form action={createUser} className="space-y-5">
          <div>
            <label htmlFor="newuser-name" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Full Name
            </label>
            <Input
              id="newuser-name"
              name="name"
              type="text"
              required />
          </div>

          <div>
            <label htmlFor="newuser-email" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Email Address
            </label>
            <Input
              id="newuser-email"
              name="email"
              type="email"
              required />
          </div>

          <div>
            <label htmlFor="newuser-password" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Password
            </label>
            <Input
              id="newuser-password"
              name="password"
              type="password"
              required
              autoComplete="new-password" />
          </div>

          <div>
            <label htmlFor="newuser-role" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Role
            </label>
            <Select
              id="newuser-role"
              name="role"
              defaultValue="sales_rep">
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-ih-border">
            <button
              type="submit"
              className="h-9 px-5 bg-ih-accent text-white font-mono text-[12px] hover:opacity-90"
            >
              Create Staff Member
            </button>
            <Link
              href="/admin/users"
              className="h-9 px-4 flex items-center border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AdminPageShell>
  )
}
