import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db, nextAccountCode } from '@indus/db'
import { auth } from '../../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { Input, Select } from '@indus/ui'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'

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

  redirect(`/admin/customers/${account.id}`)
}

export default async function NewCustomerPage({ params }: Props) {
  await params

  const reps = await db.staffUser.findMany({
    where: { isActive: true, role: { in: ['sales_rep', 'manager', 'super_admin'] } },
    select: { id: true, name: true },
  })

  const industries = await db.industry.findMany({ orderBy: { name: 'asc' } })

  return (
    <AdminPageShell
      title={'New Account'}
      actions={
        <>
          {/*
            form="new-account-form" is what keeps this working from the bar —
            a submit button outside its <form> is inert, with no compile error,
            no lint failure and no runtime error; the click just does nothing.
            form-attribute-association.test.ts pins the pairing.
          */}
          <Link
            href="/admin/customers"
            className="flex h-9 items-center rounded-md border border-ih-border bg-ih-surface px-4 text-[13px] font-medium transition-colors hover:border-ih-accent hover:text-ih-accent"
          >
            ← Customers
          </Link>
          <button
            type="submit"
            form="new-account-form"
            className="flex h-9 items-center rounded-md bg-ih-accent px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Create Account
          </button>
        </>
      }
    >
      <form id="new-account-form" action={createAccount} className="space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="newcustomer-legalName" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Legal Name <span className="text-ih-accent">*</span>
            </label>
            <Input
              id="newcustomer-legalName"
              name="legalName"
              required
              type="text"
              placeholder="e.g. PT Maju Bersama Tbk" />
          </div>

          <div className="col-span-2">
            <label htmlFor="newcustomer-displayName" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Display Name
            </label>
            <Input
              id="newcustomer-displayName"
              name="displayName"
              type="text"
              placeholder="Short name shown in UI (defaults to legal name)" />
          </div>

          <div>
            <label htmlFor="newcustomer-region" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Region</label>
            <Input
              id="newcustomer-region"
              name="region"
              type="text"
              placeholder="e.g. South East Asia" />
          </div>

          <div>
            <label htmlFor="newcustomer-industryId" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Industry</label>
            <Select
              id="newcustomer-industryId" name="industryId">
              <option value="">— Select —</option>
              {industries.map((ind) => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="newcustomer-tier" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Tier</label>
            <Select
              id="newcustomer-tier" name="tier" defaultValue="bronze">
              {['bronze', 'silver', 'gold', 'platinum'].map((t) => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="newcustomer-status" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Status</label>
            <Select
              id="newcustomer-status" name="status" defaultValue="prospect">
              {['prospect', 'active', 'at_risk', 'archived'].map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="newcustomer-assignedRepId" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Assigned Rep</label>
            <Select
              id="newcustomer-assignedRepId" name="assignedRepId">
              <option value="">— Unassigned —</option>
              {reps.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="newcustomer-paymentTermsDays" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Payment Terms (days)</label>
            <Input
              id="newcustomer-paymentTermsDays" name="paymentTermsDays" type="number" defaultValue={30} min={0} className="font-mono" />
          </div>

          <div>
            <label htmlFor="newcustomer-creditLimit" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Credit Limit (USD)</label>
            <Input
              id="newcustomer-creditLimit" name="creditLimit" type="number" defaultValue={0} min={0} step={1000} className="font-mono" />
          </div>
        </div>

      </form>
    
    </AdminPageShell>
  )
}
