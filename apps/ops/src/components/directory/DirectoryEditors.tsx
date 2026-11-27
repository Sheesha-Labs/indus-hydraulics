'use client'

import { Button, Toggle } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import {
  archiveContactAction,
  setPreferredContactAction,
  upsertContactAction,
} from '../../actions/directory'
import {
  createClientAction,
  updateClientProfileAction,
} from '../../app/(console)/clients/actions/clients'

/**
 * Board 11/12 interactive parts (S10-T02): "New client" (the page's one primary on board 11), the contacts list
 * with add / preferred / remove, and the client profile sections (Commercial, Follow-up, Acknowledgement, Credit).
 * Each section saves on its own; the server checks the version and the Owner-only credit section.
 */
export const FIELD =
  'rounded-io-ctl border-io-stroke bg-io-card io-focus-field h-io-field w-full border px-2.5 text-[13px]'

type Result = { success: true } | { success: false; error: string }

function useRun() {
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  async function run(fn: () => Promise<Result>, ok: string) {
    setBusy(true)
    try {
      const r = await fn()
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return false
      }
      toast({ kind: 'success', title: ok })
      router.refresh()
      return true
    } finally {
      setBusy(false)
    }
  }
  return { busy, run, router }
}

export function NewClientButton() {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState<Record<string, string>>({})
  const { busy, run, router } = useRun()
  const set = (k: string) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: e.target.value })
  const opt = (k: string) => (f[k]?.trim() ? { [k]: f[k]!.trim() } : {})
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="New client"
      width={560}
      trigger={<Button variant="primary">New client</Button>}
      actions={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={busy || !f.name?.trim()}
            onClick={() =>
              void (async () => {
                const r = await createClientAction({
                  name: f.name ?? '',
                  ...opt('country'),
                  ...opt('city'),
                  ...opt('industry'),
                  ...opt('website'),
                })
                if (r.success) {
                  setOpen(false)
                  router.push(`/clients/${r.data.id}` as Route)
                }
                await run(async () => r, 'Client added')
              })()
            }
          >
            Add client
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 text-[12.5px]">
        <label className="col-span-2 flex flex-col gap-1.5">
          Company name
          <input className={FIELD} value={f.name ?? ''} onChange={set('name')} />
        </label>
        <label className="flex flex-col gap-1.5">
          Country (two letters)
          <input
            className={FIELD}
            maxLength={2}
            value={f.country ?? ''}
            onChange={set('country')}
            placeholder="AE"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          City
          <input className={FIELD} value={f.city ?? ''} onChange={set('city')} />
        </label>
        <label className="flex flex-col gap-1.5">
          Industry
          <input
            className={FIELD}
            value={f.industry ?? ''}
            onChange={set('industry')}
            placeholder="e.g. Oil and gas"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          Website
          <input
            className={FIELD}
            value={f.website ?? ''}
            onChange={set('website')}
            placeholder="example.com"
          />
        </label>
      </div>
    </Modal>
  )
}

export interface ContactItem {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  initials: string
  preferred: boolean
  sendable: boolean
  sourceKind: string
}

const SOURCE_WORD: Record<string, string> = {
  directory_only: 'Directory listing · not used for mail',
  verified_on_page: 'Verified on their site',
  email_header: 'From their email',
  email_signature: 'From an email signature',
  history_import: 'From history',
  website_form: 'From the website',
  manual: 'Added by hand',
}

export function ContactsEditor({
  companyId,
  contacts,
  eyebrow = 'Contacts',
  roles = ['Procurement', 'Engineering', 'Accounts'],
}: {
  companyId: string
  contacts: readonly ContactItem[]
  eyebrow?: string
  roles?: readonly string[]
}) {
  const [adding, setAdding] = useState(false)
  const [f, setF] = useState<Record<string, string>>({})
  const { busy, run } = useRun()
  const set = (k: string) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: e.target.value })
  return (
    <section
      aria-label={eyebrow}
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="io-eyebrow m-0">{eyebrow}</h2>
        <Button
          size="sm"
          variant="link"
          onClick={() => setAdding((v) => !v)}
          aria-expanded={adding}
        >
          {adding ? 'Done' : 'Edit'}
        </Button>
      </div>
      {contacts.length ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {contacts.map((c) => (
            <li key={c.id} className="flex items-start gap-3" data-contact={c.id}>
              <span
                aria-hidden="true"
                className="bg-io-fill text-io-ink-2 rounded-io-pill flex size-8 flex-none items-center justify-center text-[10.5px] font-semibold"
              >
                {c.initials}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[13px] font-medium">
                  {c.name}
                  {c.preferred ? (
                    <span className="text-io-ok" aria-label="preferred">
                      {' '}
                      ✓
                    </span>
                  ) : null}
                </span>
                <span className="text-io-ink-3 truncate text-[12px]" title={c.email ?? undefined}>
                  {[c.role, adding ? c.email : null].filter(Boolean).join(' · ') || c.email || '—'}
                </span>
                {!c.sendable || adding ? (
                  <span className={`text-[11.5px] ${c.sendable ? 'text-io-ink-3' : 'text-io-bad'}`}>
                    {c.sendable
                      ? (SOURCE_WORD[c.sourceKind] ?? '')
                      : `× ${SOURCE_WORD[c.sourceKind] ?? 'Not used for mail'}`}
                  </span>
                ) : null}
              </span>
              <span className={adding ? 'flex flex-none flex-col items-end gap-1' : 'hidden'}>
                {!c.preferred ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    aria-label={`Make ${c.name} preferred`}
                    onClick={() =>
                      void run(
                        () => setPreferredContactAction({ contactId: c.id, companyId }),
                        'Preferred contact set'
                      )
                    }
                  >
                    Prefer
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  aria-label={`Remove ${c.name}`}
                  onClick={() =>
                    void run(
                      () => archiveContactAction({ contactId: c.id, companyId }),
                      'Contact removed'
                    )
                  }
                >
                  Remove
                </Button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">No contacts yet.</p>
      )}
      {adding ? (
        <div className="border-io-line mt-4 grid grid-cols-2 gap-2.5 border-t pt-4 text-[12.5px]">
          <label className="flex flex-col gap-1">
            Name
            <input className={FIELD} value={f.name ?? ''} onChange={set('name')} />
          </label>
          <label className="flex flex-col gap-1">
            Role
            <select className={FIELD} value={f.role ?? ''} onChange={set('role')}>
              <option value="">—</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Email
            <input className={FIELD} type="email" value={f.email ?? ''} onChange={set('email')} />
          </label>
          <label className="flex flex-col gap-1">
            Phone
            <input className={FIELD} value={f.phone ?? ''} onChange={set('phone')} />
          </label>
          <div className="col-span-2 flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              disabled={busy || !(f.name?.trim() || f.email?.trim())}
              onClick={() =>
                void (async () => {
                  const ok = await run(
                    () =>
                      upsertContactAction({
                        companyId,
                        ...(f.name?.trim() ? { name: f.name.trim() } : {}),
                        ...(f.email?.trim() ? { email: f.email.trim() } : {}),
                        ...(f.phone?.trim() ? { phone: f.phone.trim() } : {}),
                        ...(f.role ? { role: f.role } : {}),
                        sourceKind: 'manual',
                      }),
                    'Contact saved'
                  )
                  if (ok) {
                    setF({})
                    setAdding(false)
                  }
                })()
              }
            >
              Save contact
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function Section({
  title,
  children,
  foot,
}: {
  title: string
  children: ReactNode
  foot: ReactNode
}) {
  return (
    <section
      aria-label={title}
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
    >
      <h2 className="io-eyebrow m-0 mb-3">{title}</h2>
      <div className="grid grid-cols-2 gap-3 text-[12.5px]">{children}</div>
      <div className="mt-3 flex items-center justify-end gap-3">{foot}</div>
    </section>
  )
}

export interface ClientProfileValues {
  vendorCode: string | null
  quotingCurrency: string
  paymentTermsText: string | null
  vatTreatmentDefault: string | null
  termsPresetId: string | null
  followUpCadenceId: string | null
  partialFollowUp: string
  acknowledgeEnquiries: boolean
  creditHold: boolean
  creditHoldReason: string | null
  creditHoldSince: string | null
  updatedAt: string
}

export function ClientProfileForm({
  companyId,
  profile,
  options,
  isOwner,
}: {
  companyId: string
  profile: ClientProfileValues
  options: {
    termsPresets: Array<{ value: string; label: string }>
    cadences: Array<{ value: string; label: string }>
  }
  isOwner: boolean
}) {
  const { busy, run } = useRun()
  const [v, setV] = useState({
    vendorCode: profile.vendorCode ?? '',
    quotingCurrency: profile.quotingCurrency,
    paymentTermsText: profile.paymentTermsText ?? '',
    vatTreatmentDefault: profile.vatTreatmentDefault ?? '',
    termsPresetId: profile.termsPresetId ?? '',
    followUpCadenceId: profile.followUpCadenceId ?? '',
    partialFollowUp: profile.partialFollowUp,
    acknowledgeEnquiries: profile.acknowledgeEnquiries,
    creditHold: profile.creditHold,
    creditHoldReason: profile.creditHoldReason ?? '',
  })
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) =>
    setV({ ...v, [k]: e.target.value })
  const save = (
    group: 'commercial' | 'followUp' | 'acknowledgement' | 'credit',
    values: Record<string, unknown>
  ) =>
    run(
      () =>
        updateClientProfileAction({
          companyId,
          group,
          values,
          expectedUpdatedAt: profile.updatedAt,
        }),
      'Saved'
    )
  const nul = (s: string) => (s.trim() ? s.trim() : null)

  return (
    <div className="flex flex-col gap-4" data-part="client-profile-form">
      <Section
        title="Commercial"
        foot={
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() =>
              void save('commercial', {
                vendorCode: nul(v.vendorCode),
                quotingCurrency: v.quotingCurrency,
                paymentTermsText: nul(v.paymentTermsText),
                vatTreatmentDefault: v.vatTreatmentDefault || null,
                termsPresetId: v.termsPresetId || null,
              })
            }
          >
            Save commercial
          </Button>
        }
      >
        <label className="flex flex-col gap-1">
          Vendor code (theirs for us)
          <input className={FIELD} value={v.vendorCode} onChange={set('vendorCode')} />
        </label>
        <label className="flex flex-col gap-1">
          Quoting currency
          <select className={FIELD} value={v.quotingCurrency} onChange={set('quotingCurrency')}>
            {['USD', 'AED', 'EUR', 'SAR', 'QAR', 'OMR', 'KWD', 'BHD', 'GBP'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Payment terms
          <input
            className={FIELD}
            value={v.paymentTermsText}
            onChange={set('paymentTermsText')}
            placeholder="e.g. 30 days"
          />
        </label>
        <label className="flex flex-col gap-1">
          VAT default
          <select
            className={FIELD}
            value={v.vatTreatmentDefault}
            onChange={set('vatTreatmentDefault')}
          >
            <option value="">Decide per quotation</option>
            <option value="export_zero_rated">Export, zero-rated</option>
            <option value="local_standard">Local, standard rate</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          Terms preset
          <select className={FIELD} value={v.termsPresetId} onChange={set('termsPresetId')}>
            <option value="">The default preset</option>
            {options.termsPresets.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </Section>

      <Section
        title="Follow-up"
        foot={
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() =>
              void save('followUp', {
                followUpCadenceId: v.followUpCadenceId || null,
                partialFollowUp: v.partialFollowUp,
              })
            }
          >
            Save follow-up
          </Button>
        }
      >
        <label className="flex flex-col gap-1">
          Follow-up cadence
          <select className={FIELD} value={v.followUpCadenceId} onChange={set('followUpCadenceId')}>
            <option value="">The default cadence</option>
            {options.cadences.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          When only part is quoted
          <select className={FIELD} value={v.partialFollowUp} onChange={set('partialFollowUp')}>
            <option value="supplementary">Send a supplementary quotation</option>
            <option value="revision">Send a revision</option>
            <option value="ask_each_time">Ask each time</option>
          </select>
        </label>
      </Section>

      <Section title="Acknowledgement" foot={null}>
        <div className="col-span-2">
          <Toggle
            label="Acknowledge new enquiries"
            checked={v.acknowledgeEnquiries}
            disabled={busy}
            onCheckedChange={(on) => {
              setV({ ...v, acknowledgeEnquiries: on })
              void save('acknowledgement', { acknowledgeEnquiries: on })
            }}
          />
        </div>
      </Section>

      <Section
        title="Credit"
        foot={
          isOwner ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() =>
                void save('credit', {
                  creditHold: v.creditHold,
                  creditHoldReason: nul(v.creditHoldReason),
                })
              }
            >
              Save credit
            </Button>
          ) : (
            <span className="text-io-ink-3 text-[12px]">Only Krishan changes a credit hold.</span>
          )
        }
      >
        <div className="col-span-2">
          <Toggle
            label={
              profile.creditHold && profile.creditHoldSince
                ? `Credit hold since ${profile.creditHoldSince}`
                : 'Credit hold'
            }
            checked={v.creditHold}
            disabled={!isOwner || busy}
            onCheckedChange={(on) => setV({ ...v, creditHold: on })}
          />
        </div>
        <label className="col-span-2 flex flex-col gap-1">
          Reason
          <input
            className={FIELD}
            value={v.creditHoldReason}
            onChange={set('creditHoldReason')}
            disabled={!isOwner || !v.creditHold}
          />
        </label>
      </Section>
    </div>
  )
}
