'use client'

import { useState, useTransition } from 'react'
import { addAddress, setDefaultAddress, deleteAddress } from '../app/(storefront)/account/addresses/actions'
import { Input, Select } from '@indus/ui'

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
  addresses: Address[]
  requiresApproval: boolean
}

const COUNTRIES = [
  // GCC first — primary service region
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'OM', name: 'Oman' },
  { code: 'QA', name: 'Qatar' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'KW', name: 'Kuwait' },
  // Wider MENA
  { code: 'EG', name: 'Egypt' },
  // International
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'US', name: 'United States' },
]

export default function AddressBook({ addresses, requiresApproval }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
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
          <div className="py-12 border border-dashed border-ih-border text-center">
            <p className="text-ih-muted text-[13px]">No addresses saved yet.</p>
          </div>
        )}

        {addresses.map((addr) => (
          <div key={addr.id} className="border border-ih-border bg-ih-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[14px] font-semibold">{addr.label}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-ih-bg text-ih-muted capitalize border border-ih-border">
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
                  <div className="text-[12px] text-ih-muted mb-0.5">Attn: {addr.attention}</div>
                )}
                {addr.lines.map((l, i) => <div key={i} className="text-[13px]">{l}</div>)}
                <div className="text-[13px]">{addr.city}{addr.region ? `, ${addr.region}` : ''}{addr.postalCode ? ` ${addr.postalCode}` : ''}</div>
                <div className="text-[13px]">{addr.countryCode}</div>
                {addr.phone && <div className="font-mono text-[11px] text-ih-muted mt-1">{addr.phone}</div>}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {!addr.isDefaultShip && (addr.kind === 'ship_to' || addr.kind === 'both') && (
                  <button
                    onClick={() => startTransition(() => setDefaultAddress(addr.id, 'ship'))}
                    disabled={isPending}
                    className="font-mono text-[11px] text-ih-accent hover:underline disabled:opacity-50"
                  >
                    Set default ship
                  </button>
                )}
                {!addr.isDefaultBill && (addr.kind === 'bill_to' || addr.kind === 'both') && (
                  <button
                    onClick={() => startTransition(() => setDefaultAddress(addr.id, 'bill'))}
                    disabled={isPending}
                    className="font-mono text-[11px] text-ih-accent hover:underline disabled:opacity-50"
                  >
                    Set default bill
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Delete this address?')) {
                      startTransition(() => deleteAddress(addr.id))
                    }
                  }}
                  disabled={isPending}
                  className="font-mono text-[11px] text-ih-muted hover:text-ih-danger transition-colors disabled:opacity-50"
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
        <div className="border border-ih-border bg-ih-surface p-5">
          <h3 className="text-[14px] font-semibold mb-4">New Address</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label htmlFor="addr-label" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">Label *</label>
                <Input
                  id="addr-label" name="label" required type="text" placeholder="e.g. HQ Warehouse, Site A" />
              </div>
              <div>
                <label htmlFor="addr-kind" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">Type</label>
                <Select
                  id="addr-kind" name="kind">
                  <option value="ship_to">Ship-to</option>
                  <option value="bill_to">Bill-to</option>
                  <option value="both">Both</option>
                </Select>
              </div>
              <div>
                <label htmlFor="addr-attention" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">Attention</label>
                <Input
                  id="addr-attention" name="attention" type="text" placeholder="Contact name" />
              </div>
              <div className="col-span-2">
                <label htmlFor="addr-line1" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">Address Line 1 *</label>
                <Input
                  id="addr-line1" name="line1" required type="text" placeholder="Street address, P.O. Box" />
              </div>
              <div className="col-span-2">
                <label htmlFor="addr-line2" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">Address Line 2</label>
                <Input
                  id="addr-line2" name="line2" type="text" placeholder="Suite, Building, Floor" />
              </div>
              <div>
                <label htmlFor="addr-city" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">City *</label>
                <Input
                  id="addr-city" name="city" required type="text" />
              </div>
              <div>
                <label htmlFor="addr-region" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">State / Region</label>
                <Input
                  id="addr-region" name="region" type="text" />
              </div>
              <div>
                <label htmlFor="addr-postalCode" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">Postal Code</label>
                <Input
                  id="addr-postalCode" name="postalCode" type="text" />
              </div>
              <div>
                <label htmlFor="addr-countryCode" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">Country *</label>
                <Select
                  id="addr-countryCode" name="countryCode" required>
                  <option value="">— Select —</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label htmlFor="addr-phone" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">Phone</label>
                <Input
                  id="addr-phone" name="phone" type="tel" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={isPending} className="h-9 px-5 bg-ih-accent text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50">
                {isPending ? 'Saving…' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 border border-ih-border font-mono text-[12px] text-ih-muted hover:bg-ih-surface-2">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 h-10 px-5 border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:border-ih-accent transition-colors"
        >
          + Add Address
        </button>
      )}
    </div>
  )
}
