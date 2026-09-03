'use client'

import { useActionState, useState, useTransition } from 'react'
import { controlClassName, controlHeightClassName } from '@indus/ui'
import {
  inviteStaffUser,
  resendStaffInvite,
  revokeStaffInvite,
  type InviteState,
} from './invite-actions'

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales_rep', label: 'Sales Rep' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'cms_editor', label: 'CMS Editor' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'finance', label: 'Finance' },
]

const inputCls = `${controlClassName} ${controlHeightClassName}`

export type PendingInvite = {
  id: string
  email: string
  name: string
  role: string
  expiresAt: string
  invitedByName: string | null
}

export default function InviteStaffPanel({ pending }: { pending: PendingInvite[] }) {
  const [state, formAction, submitting] = useActionState<InviteState, FormData>(
    inviteStaffUser,
    null,
  )
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-medium">Invite a colleague</h2>
          <p className="mt-0.5 text-[12px] text-ih-muted">
            They&apos;ll get an email link to set their own password. Any email address works.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-9 bg-ih-accent px-4 text-[13px] font-medium text-ih-accent-fg transition-opacity hover:bg-ih-accent-hover"
        >
          {open ? 'Close' : 'Invite staff'}
        </button>
      </div>

      {open && (
        <form
          action={formAction}
          className="mt-4 grid grid-cols-1 gap-3 border border-ih-border bg-ih-surface p-4 sm:grid-cols-[1.4fr_1fr_1fr_auto]"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-ih-muted" htmlFor="inv-email">
              Email
            </label>
            <input id="inv-email" name="email" type="email" required className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-ih-muted" htmlFor="inv-name">
              Full name
            </label>
            <input id="inv-name" name="name" type="text" required minLength={2} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-ih-muted" htmlFor="inv-role">
              Role
            </label>
            <select id="inv-role" name="role" defaultValue="sales_rep" className={inputCls}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="h-9 w-full bg-ih-accent px-4 text-[13px] font-medium text-ih-accent-fg transition-opacity hover:bg-ih-accent-hover disabled:opacity-50 sm:w-auto"
            >
              {submitting ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        </form>
      )}

      {state?.error && <Notice tone="danger">{state.error}</Notice>}
      {/* A created-but-undelivered invite is a warning, never a success. */}
      {state?.warning && <Notice tone="warning">{state.warning}</Notice>}
      {state?.ok && <Notice tone="success">{state.ok}</Notice>}

      {pending.length > 0 && <PendingTable rows={pending} />}
    </div>
  )
}

function Notice({ tone, children }: { tone: 'danger' | 'warning' | 'success'; children: React.ReactNode }) {
  const cls = {
    danger: 'border-ih-danger text-ih-danger',
    warning: 'border-[var(--color-ih-warning)] text-ih-ink',
    success: 'border-[var(--color-ih-success)] text-ih-success',
  }[tone]
  return (
    <div role="status" className={`mt-3 border px-3 py-2 text-[12px] ${cls}`}>
      {children}
    </div>
  )
}

function PendingTable({ rows }: { rows: PendingInvite[] }) {
  const [busy, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <div className="mt-6">
      <h3 className="mb-2 text-[13px] font-medium">
        Pending invitations <span className="text-ih-muted">({rows.length})</span>
      </h3>
      {msg && <Notice tone="success">{msg}</Notice>}
      <table className="w-full border border-ih-border text-[13px]">
        <thead className="bg-ih-surface-2 text-[11px] uppercase tracking-wide text-ih-muted">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Email</th>
            <th className="px-3 py-2 text-left font-medium">Name</th>
            <th className="px-3 py-2 text-left font-medium">Role</th>
            <th className="px-3 py-2 text-left font-medium">Expires</th>
            <th className="px-3 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-ih-border">
              <td className="px-3 py-2 font-mono text-[12px]">{r.email}</td>
              <td className="px-3 py-2">{r.name}</td>
              <td className="px-3 py-2">{r.role.replace(/_/g, ' ')}</td>
              <td className="px-3 py-2 text-ih-muted">{r.expiresAt}</td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    start(async () => {
                      const res = await resendStaffInvite(r.id)
                      setMsg(res?.ok ?? res?.error ?? null)
                    })
                  }
                  className="mr-3 text-[12px] text-ih-accent hover:underline disabled:opacity-50"
                >
                  Resend
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    start(async () => {
                      const res = await revokeStaffInvite(r.id)
                      setMsg(res?.ok ?? res?.error ?? null)
                    })
                  }
                  className="text-[12px] text-ih-danger hover:underline disabled:opacity-50"
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
