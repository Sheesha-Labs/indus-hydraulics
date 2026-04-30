'use client'

import { useState, useTransition } from 'react'
import { addAddress, setDefaultAddress, deleteAddress } from '../app/[locale]/account/addresses/actions'

type Address = {
  id: string
  label: string
  kind: string
  attention?: string
  lines: string[]
  city: string
  region?: string
  postalCode?: string
  countryCode: string
  phone?: string
  isDefaultShip: boolean
  isDefaultBill: boolean
  approvedAt?: Date
}

type Props = {
  locale: string
  addresses: Address[]
  requiresApproval: boolean
}

const COUNTRIES = [
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AU', name: 'Australia' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'CA', name: 'Canada' },
  { code: 'EG', name: 'Egypt' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IN', name: 'India' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'OM', name: 'Oman' },
  { code: 'QA', name: 'Qatar' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'US', name: 'United States' },
]

export default function AddressBook({ locale, addresses, requiresApproval }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('locale', locale)
    startTransition(async () => {
      await addAddress(fd)
      setShowForm(false)
    })
  }

  return (
    <div>
      {/* Address cards */}
      <div className="space-y-3 mb-6">
        {addresses.length === 0 && !showForm && (
          <div className="py-12 border border-dashed border-[var(--color-border)] text-center">
            <p className="text-[var(--color-muted)] text-[13px]">No addresses saved yet.</p>
          </div>
        )}

        {addresses.map((addr) => (
          <div key={addr.id} className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[14px] font-semibold">{addr.label}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[var(--color-surface)] text-[var(--color-muted)] capitalize border border-[var(--color-border)]">
                    {addr.kind.replace('_', '-')}
                  </span>
                  {addr.isDefaultShip && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[oklch(0.94_0.06_145)] text-[oklch(0.4_0.14_145)]">
                      Default Ship
                    </span>
                  )}
                  {addr.isDefaultBill && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[oklch(0.94_0.06_145)] text-[oklch(0.4_0.14_145)]">
                      Default Bill
                    </span>
                  )}
                  {requiresApproval && !addr.approvedAt && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[oklch(0.96_0.04_60)] text-[oklch(0.5_0.08_60)]">
                      Pending Approval
                    </span>
                  )}
                </div>
                {addr.attention && (
                  <div className="text-[12px] text-[var(--color-muted)] mb-0.5">Attn: {addr.attention}</div>
                )}
                {addr.lines.map((l, i) => <div key={i} className="text-[13px]">{l}</div>)}
                <div className="text-[13px]">{addr.city}{addr.region ? `, ${addr.region}` : ''}{addr.postalCode ? ` ${addr.postalCode}` : ''}</div>
                <div className="text-[13px]">{addr.countryCode}</div>
                {addr.phone && <div className="font-mono text-[11px] text-[var(--color-muted)] mt-1">{addr.phone}</div>}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {!addr.isDefaultShip && (addr.kind === 'ship_to' || addr.kind === 'both') && (
                  <button
                    onClick={() => startTransition(() => setDefaultAddress(addr.id, 'ship', locale))}
                    disabled={isPending}
                    className="font-mono text-[11px] text-[var(--color-accent)] hover:underline disabled:opacity-50"
                  >
                    Set default ship
                  </button>
                )}
                {!addr.isDefaultBill && (addr.kind === 'bill_to' || addr.kind === 'both') && (
                  <button
                    onClick={() => startTransition(() => setDefaultAddress(addr.id, 'bill', locale))}
                    disabled={isPending}
                    className="font-mono text-[11px] text-[var(--color-accent)] hover:underline disabled:opacity-50"
                  >
                    Set default bill
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Delete this address?')) {
                      startTransition(() => deleteAddress(addr.id, locale))
                    }
                  }}
                  disabled={isPending}
                  className="font-mono text-[11px] text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add address form */}
      {showForm ? (
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-5">
          <h3 className="text-[14px] font-semibold mb-4">New Address</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1">Label *</label>
                <input name="label" required type="text" placeholder="e.g. HQ Warehouse, Site A" className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1">Type</label>
                <select name="kind" className="w-full h-9 px-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none">
                  <option value="ship_to">Ship-to</option>
                  <option value="bill_to">Bill-to</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1">Attention</label>
                <input name="attention" type="text" placeholder="Contact name" className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div className="col-span-2">
                <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1">Address Line 1 *</label>
                <input name="line1" required type="text" placeholder="Street address, P.O. Box" className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div className="col-span-2">
                <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1">Address Line 2</label>
                <input name="line2" type="text" placeholder="Suite, Building, Floor" className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1">City *</label>
                <input name="city" required type="text" className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1">State / Region</label>
                <input name="region" type="text" className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1">Postal Code</label>
                <input name="postalCode" type="text" className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1">Country *</label>
                <select name="countryCode" required className="w-full h-9 px-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none">
                  <option value="">— Select —</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1">Phone</label>
                <input name="phone" type="tel" className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={isPending} className="h-9 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50">
                {isPending ? 'Saving…' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-muted)] hover:bg-[var(--color-deep)]">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 h-10 px-5 border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:border-[var(--color-body)] transition-colors"
        >
          + Add Address
        </button>
      )}
    </div>
  )
}
