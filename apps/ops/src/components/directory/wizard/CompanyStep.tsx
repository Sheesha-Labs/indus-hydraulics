'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { saveCompanyStepAction } from '../../../app/(console)/suppliers/new/actions/onboarding'
import type { SupplierWizard } from '../../../data/supplier-wizard'
import { FIELD } from '../DirectoryEditors'

/**
 * Board 50 step "Company" (S10-T04): legal name, country, address, website, registry no., tax ID, founded, staff,
 * introduced by, quote currencies, type, and the Sales, Accounts and Quality contacts. "Save draft" keeps it as a
 * draft; "Continue to documents" saves and moves on (the draft id goes into the path).
 */
const ROLES = ['Sales', 'Accounts', 'Quality'] as const
const TYPES = [
  ['manufacturer', 'Manufacturer'],
  ['principal', 'Principal'],
  ['oem', 'OEM'],
  ['distributor', 'Distributor'],
  ['stockist', 'Stockist'],
  ['trader', 'Trader'],
  ['local_shop', 'Local shop'],
  ['marketplace', 'Marketplace'],
] as const

export default function CompanyStep({ wizard }: { wizard: SupplierWizard | null }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const f0 = wizard?.facts
  const [f, setF] = useState<Record<string, string>>({
    legalName: f0?.legalName ?? '',
    country: f0?.country ?? '',
    address: f0?.address ?? '',
    website: f0?.website ?? '',
    registryNo: f0?.registryNo ?? '',
    taxId: f0?.taxId ?? '',
    foundedYear: f0?.foundedYear ? String(f0.foundedYear) : '',
    staffCount: f0?.staffCount ? String(f0.staffCount) : '',
    introducedBy: f0?.introducedBy ?? '',
    quoteCurrencies: f0?.quoteCurrencies.join(', ') ?? '',
    type: f0?.type && f0.type !== 'unknown' ? f0.type : 'manufacturer',
  })
  const [contacts, setContacts] = useState(
    ROLES.map((role) => {
      const k = wizard?.contacts.find((c) => c.role === role)
      return { role, name: k?.name ?? '', email: k?.email ?? '', phone: k?.phone ?? '' }
    })
  )
  const set = (k: string) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: e.target.value })
  const num = (s: string | undefined) =>
    s && /^\d+$/.test(s.trim()) ? Number(s.trim()) : undefined
  const opt = (k: string) => (f[k]?.trim() ? { [k]: f[k]!.trim() } : {})

  async function save(next: boolean) {
    setBusy(true)
    try {
      const founded = num(f.foundedYear)
      const staff = num(f.staffCount)
      const r = await saveCompanyStepAction({
        ...(wizard ? { supplierId: wizard.id, expectedVersion: wizard.version } : {}),
        company: {
          legalName: f.legalName ?? '',
          country: (f.country ?? '').toUpperCase(),
          ...opt('address'),
          ...opt('website'),
          ...opt('registryNo'),
          ...opt('taxId'),
          ...opt('introducedBy'),
          ...(founded ? { foundedYear: founded } : {}),
          ...(staff !== undefined ? { staffCount: staff } : {}),
          quoteCurrencies: (f.quoteCurrencies ?? '')
            .split(/[\s,]+/)
            .map((s) => s.trim().toUpperCase())
            .filter((s) => /^[A-Z]{3}$/.test(s)),
          type: f.type as 'manufacturer',
        },
        contacts: contacts
          .filter((c) => c.name.trim() || c.email.trim())
          .map((c) => ({
            role: c.role,
            ...(c.name.trim() ? { name: c.name.trim() } : {}),
            ...(c.email.trim() ? { email: c.email.trim() } : {}),
            ...(c.phone.trim() ? { phone: c.phone.trim() } : {}),
          })),
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      toast({ kind: 'success', title: next ? 'Saved' : 'Draft saved' })
      router.push(
        (next
          ? `/suppliers/new/${r.data.id}/documents`
          : `/suppliers/new/${r.data.id}/company`) as Route
      )
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const field = (
    k: string,
    label: string,
    extra: { placeholder?: string; span?: boolean; max?: number } = {}
  ) => (
    <label className={`flex flex-col gap-1.5 ${extra.span ? 'col-span-2' : ''}`}>
      {label}
      <input
        className={FIELD}
        value={f[k] ?? ''}
        onChange={set(k)}
        placeholder={extra.placeholder}
        maxLength={extra.max}
      />
    </label>
  )

  return (
    <div className="flex flex-col gap-6" data-part="company-step">
      <section aria-label="Company" className="grid grid-cols-2 gap-3 text-[12.5px]">
        <h2 className="io-eyebrow col-span-2 m-0">Company</h2>
        {field('legalName', 'Legal name', { span: true })}
        {field('country', 'Country (two letters)', { placeholder: 'TR', max: 2 })}
        <label className="flex flex-col gap-1.5">
          Type
          <select className={FIELD} value={f.type} onChange={set('type')}>
            {TYPES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        {field('address', 'Address', { span: true })}
        {field('website', 'Website', { placeholder: 'example.com' })}
        {field('registryNo', 'Registry no.')}
        {field('taxId', 'Tax ID')}
        {field('foundedYear', 'Founded', { placeholder: '1998', max: 4 })}
        {field('staffCount', 'Staff')}
        {field('introducedBy', 'Introduced by')}
        {field('quoteCurrencies', 'Quote currencies', { placeholder: 'EUR, USD' })}
      </section>
      <section aria-label="Contacts" className="flex flex-col gap-3 text-[12.5px]">
        <h2 className="io-eyebrow m-0">Contacts</h2>
        {contacts.map((c, i) => (
          <fieldset
            key={c.role}
            className="m-0 grid grid-cols-[80px_1fr_1fr] items-end gap-2 border-0 p-0"
          >
            <legend className="sr-only">{c.role} contact</legend>
            <span className="text-io-ink-3 pb-2">{c.role}</span>
            <label className="flex flex-col gap-1">
              <span className="sr-only">{c.role} name</span>
              <input
                className={FIELD}
                aria-label={`${c.role} name`}
                placeholder="Name"
                value={c.name}
                onChange={(e) =>
                  setContacts(
                    contacts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))
                  )
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="sr-only">{c.role} email</span>
              <input
                className={FIELD}
                type="email"
                aria-label={`${c.role} email`}
                placeholder="Email"
                value={c.email}
                onChange={(e) =>
                  setContacts(
                    contacts.map((x, j) => (j === i ? { ...x, email: e.target.value } : x))
                  )
                }
              />
            </label>
          </fieldset>
        ))}
      </section>
      <p className="bg-io-fill rounded-io-card text-io-ink-2 m-0 px-4 py-3 text-[12.5px]">
        Until approval the supplier is visible to Ayush and the Assistant only and cannot be
        selected for an RFQ, research or a PO.
      </p>
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          disabled={busy || !f.legalName?.trim()}
          onClick={() => void save(false)}
        >
          Save draft
        </Button>
        <Button
          variant="primary"
          disabled={busy || !f.legalName?.trim() || !/^[A-Za-z]{2}$/.test(f.country ?? '')}
          onClick={() => void save(true)}
        >
          Continue to documents
        </Button>
      </div>
    </div>
  )
}
