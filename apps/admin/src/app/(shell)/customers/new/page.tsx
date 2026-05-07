import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db, nextAccountCode } from '@indus/db'
import { auth } from '../../../../lib/auth'
import { ROLES, requireRole } from '../../../../lib/rbac'

export const metadata: Metadata = { title: 'New Customer — Indus Admin' }

type Props = {
  params: Promise<Record<string, never>>
}

async function createAccount(formData: FormData) {
  'use server'

  requireRole(await auth(), ROLES.ACCOUNT_WRITE)

  const legalName = formData.get('legalName') as string
  const displayName = formData.get('displayName') as string
  const region = (formData.get('region') as string | null) || undefined
  const tier = (formData.get('tier') as string) ?? 'bronze'
  const status = (formData.get('status') as string) ?? 'prospect'
  const paymentTermsDays = parseInt((formData.get('paymentTermsDays') as string) ?? '30')
  const creditLimit = parseFloat((formData.get('creditLimit') as string) ?? '0')
  const assignedRepId = (formData.get('assignedRepId') as string | null) || undefined

  if (!legalName.trim()) return

  const account = await db.$transaction(async (tx) => {
    const code = await nextAccountCode(tx)
    return tx.account.create({
      data: {
        code,
        legalName: legalName.trim(),
        displayName: displayName.trim() || legalName.trim(),
        region: region || undefined,
        tier: tier as never,
        status: status as never,
        paymentTermsDays,
        creditLimit,
        assignedRepId: assignedRepId ?? undefined,
      },
    })
  })

  redirect(`/customers/${account.id}`)
}

export default async function NewCustomerPage({ params }: Props) {
  await params

  const reps = await db.staffUser.findMany({
    where: { isActive: true, role: { in: ['sales_rep', 'manager', 'super_admin'] } },
    select: { id: true, name: true },
  })

  const industries = await db.industry.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="max-w-[720px]">
      <div className="mb-6">
        <Link href={`/customers`} className="font-mono text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)] mb-2 inline-block">
          ← Customers
        </Link>
        <h1 className="text-[24px] font-semibold tracking-tight">New Account</h1>
      </div>

      <form action={createAccount} className="space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Legal Name <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              name="legalName"
              required
              type="text"
              placeholder="e.g. PT Maju Bersama Tbk"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="col-span-2">
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Display Name
            </label>
            <input
              name="displayName"
              type="text"
              placeholder="Short name shown in UI (defaults to legal name)"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Region</label>
            <input
              name="region"
              type="text"
              placeholder="e.g. South East Asia"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Industry</label>
            <select name="industryId" className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]">
              <option value="">— Select —</option>
              {industries.map((ind) => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Tier</label>
            <select name="tier" defaultValue="bronze" className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]">
              {['bronze', 'silver', 'gold', 'platinum'].map((t) => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Status</label>
            <select name="status" defaultValue="prospect" className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]">
              {['prospect', 'active', 'at_risk', 'archived'].map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Assigned Rep</label>
            <select name="assignedRepId" className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]">
              <option value="">— Unassigned —</option>
              {reps.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Payment Terms (days)</label>
            <input name="paymentTermsDays" type="number" defaultValue={30} min={0} className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] font-mono focus:outline-none focus:border-[var(--color-accent)]" />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Credit Limit (USD)</label>
            <input name="creditLimit" type="number" defaultValue={0} min={0} step={1000} className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] font-mono focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button type="submit" className="h-10 px-6 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity">
            Create Account
          </button>
          <Link href={`/customers`} className="h-10 px-4 flex items-center border border-[var(--color-border)] text-[13px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
