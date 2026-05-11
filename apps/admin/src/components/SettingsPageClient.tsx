'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import type { StoreSettings, EmailTemplate } from '@indus/db'
import { saveStoreSettings, saveEmailTemplate } from '../app/(shell)/settings/actions'

interface Props {
  activeTab: string
  storeSettings: StoreSettings | null
  emailTemplates: EmailTemplate[]
}

const TABS = [
  { id: 'store', label: 'Store' },
  { id: 'emails', label: 'Email Templates' },
]

const INCOTERMS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FOB', 'CFR', 'CIF']

const EMAIL_KINDS = [
  { kind: 'rfq_ack', label: 'RFQ Acknowledgement', description: 'Sent to customer when RFQ is submitted' },
  { kind: 'quote_sent', label: 'Quote Ready', description: 'Sent to customer when quote is issued' },
  { kind: 'password_reset', label: 'Password Reset', description: 'Sent when customer requests a password reset' },
  { kind: 'order_shipped', label: 'Order Shipped', description: 'Sent to customer when order is shipped' },
]

export default function SettingsPageClient({ activeTab, storeSettings, emailTemplates }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<string>(EMAIL_KINDS[0]!.kind)

  const templateMap = Object.fromEntries(emailTemplates.map((t) => [t.kind, t]))
  const currentTemplate = templateMap[selectedEmail]

  function handleStoreSettings(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await saveStoreSettings(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setSaved('store')
      setTimeout(() => setSaved(null), 3000)
    })
  }

  function handleEmailTemplate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await saveEmailTemplate(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setSaved(selectedEmail)
      setTimeout(() => setSaved(null), 3000)
    })
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] mb-6">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`?tab=${tab.id}`}
            className={`px-4 py-2.5 font-mono text-[12px] border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-body)]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Store Settings */}
      {activeTab === 'store' && (
        <form action={handleStoreSettings} className="max-w-[560px] space-y-5">
          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Store Name
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={storeSettings?.name ?? 'Indus Hydraulics'}
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Support Email
            </label>
            <input
              name="supportEmail"
              type="email"
              defaultValue={storeSettings?.supportEmail ?? ''}
              placeholder="support@indushydraulics.com"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Default Incoterm
            </label>
            <select
              name="defaultIncoterm"
              defaultValue={storeSettings?.defaultIncoterm ?? ''}
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none"
            >
              <option value="">— None —</option>
              {INCOTERMS.map((term) => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Default Payment Terms (days)
            </label>
            <select
              name="defaultPaymentTerms"
              defaultValue={storeSettings?.defaultPaymentTerms ?? 30}
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none"
            >
              {[0, 7, 14, 30, 45, 60, 90].map((days) => (
                <option key={days} value={days}>
                  {days === 0 ? 'Prepayment' : `Net ${days}`}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-3">
              Brand identity
            </h3>
            <p className="text-[12px] text-[var(--color-muted)] mb-4">
              Rendered in the storefront footer brand block. The store name above is reused as the brand name.
            </p>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Tagline
            </label>
            <textarea
              name="tagline"
              rows={2}
              maxLength={280}
              defaultValue={storeSettings?.tagline ?? ''}
              placeholder="UAE's trusted distributor of industrial hydraulic components since 2003."
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] resize-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Certification line
            </label>
            <input
              name="certificationLine"
              type="text"
              maxLength={120}
              defaultValue={storeSettings?.certificationLine ?? ''}
              placeholder="ISO 9001:2015 Certified"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-3">
              Public contact info
            </h3>
            <p className="text-[12px] text-[var(--color-muted)] mb-4">
              Rendered in the storefront header topbar (phone + hours) and footer contact block.
            </p>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Location label
            </label>
            <input
              name="contactLocationLabel"
              type="text"
              maxLength={80}
              defaultValue={storeSettings?.contactLocationLabel ?? ''}
              placeholder="Dubai HQ"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Phone
            </label>
            <input
              name="contactPhone"
              type="text"
              maxLength={40}
              defaultValue={storeSettings?.contactPhone ?? ''}
              placeholder="+971 4 XXX XXXX"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Public email
            </label>
            <input
              name="contactEmail"
              type="email"
              defaultValue={storeSettings?.contactEmail ?? ''}
              placeholder="sales@indushydraulics.com"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Hours
            </label>
            <input
              name="contactHours"
              type="text"
              maxLength={120}
              defaultValue={storeSettings?.contactHours ?? ''}
              placeholder="Mon–Sat 09:00–18:00 GST"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-3">
              Legal entity
            </h3>
            <p className="text-[12px] text-[var(--color-muted)] mb-4">
              Rendered on every quote PDF and transactional email footer. UAE ship-tos auto-apply 5% VAT; non-UAE ship-tos are zero-rated as exports (TRN still shown).
            </p>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Legal name
            </label>
            <input
              name="legalName"
              type="text"
              maxLength={160}
              defaultValue={storeSettings?.legalName ?? ''}
              placeholder="Indus Hydraulic Power Trading LLC"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              VAT / TRN number
            </label>
            <input
              name="vatTrn"
              type="text"
              maxLength={40}
              defaultValue={storeSettings?.vatTrn ?? ''}
              placeholder="100548997400003"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Registered address (one line per line)
            </label>
            <textarea
              name="registeredAddressLines"
              rows={4}
              defaultValue={((storeSettings?.registeredAddressLines as string[] | null) ?? []).join('\n')}
              placeholder={'Office No 310 Al Hilal Bank Building, Al Nahda Street\nAl Quasis-2, Dubai\nDubai 87556\nUnited Arab Emirates'}
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] resize-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Country (ISO-2)
              </label>
              <input
                name="registeredCountryCode"
                type="text"
                maxLength={2}
                defaultValue={storeSettings?.registeredCountryCode ?? 'AE'}
                placeholder="AE"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] uppercase"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Default VAT rate (%)
              </label>
              <input
                name="defaultVatRatePct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue={storeSettings?.defaultVatRatePct?.toString() ?? '5.00'}
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-3">
              Quote signature block
            </h3>
            <p className="text-[12px] text-[var(--color-muted)] mb-4">
              Appears at the bottom of every outgoing quote PDF and email.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Name
              </label>
              <input
                name="signatureName"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.signatureName ?? ''}
                placeholder="Krishan Bhatia"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Title
              </label>
              <input
                name="signatureTitle"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.signatureTitle ?? ''}
                placeholder="Managing Director"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Phone
              </label>
              <input
                name="signaturePhone"
                type="text"
                maxLength={40}
                defaultValue={storeSettings?.signaturePhone ?? ''}
                placeholder="+971 52 2477942"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Email
              </label>
              <input
                name="signatureEmail"
                type="email"
                defaultValue={storeSettings?.signatureEmail ?? ''}
                placeholder="sales@indushydraulics.me"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-3">
              Outbound email
            </h3>
            <p className="text-[12px] text-[var(--color-muted)] mb-4">
              All transactional email is sent from one shared address. Replies route here too. New-RFQ alerts fan out to the internal recipient list.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                From / Reply-To address
              </label>
              <input
                name="quoteFromEmail"
                type="email"
                defaultValue={storeSettings?.quoteFromEmail ?? ''}
                placeholder="sales@indushydraulics.me"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Sender display name
              </label>
              <input
                name="quoteFromName"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.quoteFromName ?? ''}
                placeholder="Indus Hydraulics Sales"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Internal new-RFQ alert recipients (one email per line)
            </label>
            <textarea
              name="internalAlertEmails"
              rows={3}
              defaultValue={((storeSettings?.internalAlertEmails as string[] | null) ?? []).join('\n')}
              placeholder={'sales@indushydraulics.me\nayushkbhatia@gmail.com'}
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] resize-none font-mono"
            />
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-3">
              Quote defaults
            </h3>
            <p className="text-[12px] text-[var(--color-muted)] mb-4">
              Defaults pre-filled on every new quote. Engineers can override per quote.
            </p>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Validity (days)
            </label>
            <input
              name="defaultQuoteValidityDays"
              type="number"
              min="1"
              max="365"
              defaultValue={storeSettings?.defaultQuoteValidityDays ?? 30}
              className="w-32 h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Default Notes (optional)
            </label>
            <textarea
              name="defaultQuoteNotes"
              rows={3}
              defaultValue={storeSettings?.defaultQuoteNotes ?? ''}
              placeholder="Any standing notes that should appear on every quote."
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] resize-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Default Terms &amp; Conditions
            </label>
            <textarea
              name="defaultQuoteTerms"
              rows={4}
              defaultValue={storeSettings?.defaultQuoteTerms ?? ''}
              placeholder={'DELIVERY: DDP destination\nPAYMENT: Advance with order\nPRICE VALID FOR FULL 30 DAYS ONLY.'}
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] resize-none font-mono"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Default Disclaimer
            </label>
            <textarea
              name="defaultQuoteDisclaimer"
              rows={3}
              defaultValue={storeSettings?.defaultQuoteDisclaimer ?? ''}
              placeholder="Once the order is confirmed and processed, the same cannot be changed or cancelled. Material will be supplied as per the offer quoted."
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] resize-none"
            />
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-3">
              Bank details (PDF footer)
            </h3>
            <p className="text-[12px] text-[var(--color-muted)] mb-4">
              Rendered on page 2 of every quote PDF below the signature block. All fields optional — leave blank to hide the bank-details section entirely.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Account name
              </label>
              <input
                name="bankAccountName"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.bankAccountName ?? ''}
                placeholder="Indus Hydraulic Power Trading LLC"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Bank name
              </label>
              <input
                name="bankName"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.bankName ?? ''}
                placeholder="Mashreq Bank"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Branch
              </label>
              <input
                name="bankBranch"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.bankBranch ?? ''}
                placeholder="Al Quasis Branch, Dubai"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Account number
              </label>
              <input
                name="bankAccountNo"
                type="text"
                maxLength={40}
                defaultValue={storeSettings?.bankAccountNo ?? ''}
                placeholder="012345678901"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                IBAN
              </label>
              <input
                name="bankIban"
                type="text"
                maxLength={40}
                defaultValue={storeSettings?.bankIban ?? ''}
                placeholder="AE07 0331 2345 6789 0123 456"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                SWIFT / BIC
              </label>
              <input
                name="bankSwift"
                type="text"
                maxLength={20}
                defaultValue={storeSettings?.bankSwift ?? ''}
                placeholder="BOMLAEAD"
                className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save Settings'}
            </button>
            {saved === 'store' && (
              <span className="font-mono text-[11px] text-[var(--color-good)]">Saved ✓</span>
            )}
            {error && activeTab === 'store' && (
              <span className="font-mono text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">{error}</span>
            )}
          </div>
        </form>
      )}

      {/* Email Templates */}
      {activeTab === 'emails' && (
        <div className="grid grid-cols-[240px_1fr] gap-6">
          {/* Template list */}
          <div className="border border-[var(--color-border)] overflow-hidden h-fit">
            {EMAIL_KINDS.map((ek) => (
              <button
                key={ek.kind}
                onClick={() => setSelectedEmail(ek.kind)}
                className={`w-full text-left px-4 py-3 border-b border-[var(--color-border)] last:border-0 transition-colors ${
                  selectedEmail === ek.kind
                    ? 'bg-[var(--color-deep)] border-l-2 border-l-[var(--color-accent)]'
                    : 'hover:bg-[var(--color-deep)]'
                }`}
              >
                <div className="text-[13px] font-medium text-[var(--color-primary)] mb-0.5">{ek.label}</div>
                <div className="font-mono text-[10px] text-[var(--color-muted)]">{ek.description}</div>
                {templateMap[ek.kind] && (
                  <div className="mt-1 font-mono text-[9px] px-1.5 py-0.5 bg-[var(--color-good-soft)] text-[var(--color-good)] inline-block">
                    configured
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Template editor */}
          <div>
            {(() => {
              const meta = EMAIL_KINDS.find((e) => e.kind === selectedEmail)!
              return (
                <form action={handleEmailTemplate} key={selectedEmail} className="space-y-4">
                  <input type="hidden" name="kind" value={selectedEmail} />

                  <div>
                    <div className="mb-3">
                      <h2 className="text-[16px] font-semibold">{meta.label}</h2>
                      <p className="text-[12px] text-[var(--color-muted)]">{meta.description}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                      Subject Line
                    </label>
                    <input
                      name="subject"
                      type="text"
                      required
                      defaultValue={currentTemplate?.subject ?? ''}
                      placeholder={`Email subject for ${meta.label}`}
                      className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                      Body HTML
                    </label>
                    <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 mb-1.5">
                      <p className="font-mono text-[10px] text-[var(--color-muted)]">
                        Available variables:{' '}
                        <code className="bg-[var(--color-deep)] px-1">{'{{name}}'}</code>{' '}
                        <code className="bg-[var(--color-deep)] px-1">{'{{rfqCode}}'}</code>{' '}
                        <code className="bg-[var(--color-deep)] px-1">{'{{link}}'}</code>
                      </p>
                    </div>
                    <textarea
                      name="bodyHtml"
                      rows={16}
                      required
                      defaultValue={currentTemplate?.bodyHtml ?? ''}
                      className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-elevated)] font-mono text-[12px] focus:outline-none focus:border-[var(--color-accent)] resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="h-9 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50"
                    >
                      {isPending ? 'Saving…' : 'Save Template'}
                    </button>
                    {saved === selectedEmail && (
                      <span className="font-mono text-[11px] text-[var(--color-good)]">Saved ✓</span>
                    )}
                    {error && activeTab === 'emails' && (
                      <span className="font-mono text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">{error}</span>
                    )}
                  </div>
                </form>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}
