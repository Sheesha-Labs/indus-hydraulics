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
        <>
          {/*
            form="new-staff-form" is what keeps this working from the bar —
            a submit button outside its <form> is inert, with no compile error,
            no lint failure and no runtime error; the click just does nothing.
            form-attribute-association.test.ts pins the pairing.
          */}
          <Link
            href="/admin/users"
            className="border-ih-border bg-ih-surface hover:border-ih-accent hover:text-ih-accent flex h-9 items-center rounded-md border px-4 text-[13px] font-medium transition-colors"
          >
            ← All staff
          </Link>
          <button
            type="submit"
            form="new-staff-form"
            className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover flex h-9 items-center rounded-md px-4 text-[13px] font-medium transition-opacity"
          >
            Create Staff Member
          </button>
        </>
      }
    >
      <div className="max-w-[560px]">
        <form id="new-staff-form" action={createUser} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="newuser-name"
              className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
            >
              Full Name
            </label>
            <Input id="newuser-name" name="name" type="text" required />
          </div>

          <div>
            <label
              htmlFor="newuser-email"
              className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
            >
              Email Address
            </label>
            <Input id="newuser-email" name="email" type="email" required />
          </div>

          <div>
            <label
              htmlFor="newuser-password"
              className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
            >
              Password
            </label>
            <Input
              id="newuser-password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <label
              htmlFor="newuser-role"
              className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
            >
              Role
            </label>
            <Select id="newuser-role" name="role" defaultValue="sales_rep">
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
        </form>
      </div>
    </AdminPageShell>
  )
}
