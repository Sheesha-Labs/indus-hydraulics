import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { db } from '@indus/db'
import { auth } from '../../../../lib/auth'
import { ROLES as PERMS, requireRole } from '../../../../lib/rbac'
import { requireStaffRole } from '../../../../lib/staff-session'

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

    redirect(`/users/${created.id}`)
  }

  return (
    <div className="p-8">
      <nav className="flex items-center gap-2 font-mono text-[12px] text-[var(--color-muted)] mb-6">
        <Link href="/users" className="hover:text-[var(--color-primary)]">Staff Users</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-primary)]">New Staff Member</span>
      </nav>

      <div className="max-w-[560px]">
        <h1 className="text-[24px] font-semibold tracking-tight mb-6">Add Staff Member</h1>

        <form action={createUser} className="space-y-5">
          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Role
            </label>
            <select
              name="role"
              defaultValue="sales_rep"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-border)]">
            <button
              type="submit"
              className="h-9 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90"
            >
              Create Staff Member
            </button>
            <Link
              href="/users"
              className="h-9 px-4 flex items-center border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
