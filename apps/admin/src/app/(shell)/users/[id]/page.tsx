import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import { auth } from '../../../../lib/auth'
import { ROLES as PERMS, requireRole } from '../../../../lib/rbac'

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
  const session = await auth()
  if (!session) redirect('/sign-in')

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
    redirect(`/users/${id}`)
  }

  async function deactivateUser() {
    'use server'
    requireRole(await auth(), PERMS.USERS_WRITE)
    await db.staffUser.update({ where: { id }, data: { isActive: false } })
    redirect(`/users/${id}`)
  }

  async function activateUser() {
    'use server'
    requireRole(await auth(), PERMS.USERS_WRITE)
    await db.staffUser.update({ where: { id }, data: { isActive: true } })
    redirect(`/users/${id}`)
  }

  return (
    <div className="p-8">
      <nav className="flex items-center gap-2 font-mono text-[12px] text-[var(--color-muted)] mb-6">
        <Link href="/users" className="hover:text-[var(--color-primary)]">Staff Users</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-primary)]">{user.name}</span>
      </nav>

      <div className="max-w-[560px]">
        <h1 className="text-[24px] font-semibold tracking-tight mb-6">Edit Staff Member</h1>

        <form action={saveUser} className="space-y-5">
          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={user.name}
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
              defaultValue={user.email}
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              New Password <span className="normal-case text-[var(--color-caption)]">(leave blank to keep current)</span>
            </label>
            <input
              name="password"
              type="password"
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
              defaultValue={user.role}
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              value="1"
              defaultChecked={user.isActive}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-[13px] text-[var(--color-body)]">
              Active account
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-border)]">
            <button
              type="submit"
              className="h-9 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90"
            >
              Save Changes
            </button>
            <Link
              href="/users"
              className="h-9 px-4 flex items-center border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)]"
            >
              Cancel
            </Link>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">
            Danger Zone
          </p>
          {user.isActive ? (
            <form action={deactivateUser}>
              <button
                type="submit"
                className="h-9 px-4 border border-[var(--color-danger)] font-mono text-[12px] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-colors"
              >
                Deactivate Account
              </button>
            </form>
          ) : (
            <form action={activateUser}>
              <button
                type="submit"
                className="h-9 px-4 border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)]"
              >
                Reactivate Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
