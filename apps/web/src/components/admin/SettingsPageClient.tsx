'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import type { StoreSettings, EmailTemplate } from '@indus/db'
import { saveStoreSettings, saveEmailTemplate } from '../../app/admin/(shell)/settings/actions'
import BrandIdentityForm, {
  type BrandIdentityInitial,
} from '../../app/admin/(shell)/settings/BrandIdentityForm'
import type { BrandImageOption } from '../../app/admin/(shell)/settings/BrandImageFields'
import { Input, Select, Textarea } from '@indus/ui'

interface Props {
  activeTab: string
  storeSettings: StoreSettings | null
  emailTemplates: EmailTemplate[]
  /**
   * Brand image ids, split out of `storeSettings` so the Brand tab has a
   * stable shape to hydrate from. Null only when the settings row does not
   * exist yet, in which case the tab renders nothing rather than a form whose
   * save would create a half-populated row.
   */
  brandIdentity: BrandIdentityInitial | null
  /** Media library rows the brand pickers can choose from, URLs resolved. */
  mediaOptions: BrandImageOption[]
}

const TABS = [
  { id: 'store', label: 'Store' },
  { id: 'brand', label: 'Brand & Identity' },
  { id: 'emails', label: 'Email Templates' },
]

const INCOTERMS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FOB', 'CFR', 'CIF']

const EMAIL_KINDS = [
  { kind: 'rfq_ack', label: 'RFQ Acknowledgement', description: 'Sent to customer when RFQ is submitted' },
  { kind: 'quote_sent', label: 'Quote Ready', description: 'Sent to customer when quote is issued' },
  { kind: 'password_reset', label: 'Password Reset', description: 'Sent when customer requests a password reset' },
  { kind: 'order_shipped', label: 'Order Shipped', description: 'Sent to customer when order is shipped' },
]

export default function SettingsPageClient({
  activeTab,
  storeSettings,
  emailTemplates,
  brandIdentity,
  mediaOptions,
}: Props) {
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
      <div className="flex border-b border-ih-border mb-6">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`?tab=${tab.id}`}
            className={`px-4 py-2.5 font-mono text-[12px] border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-ih-accent text-ih-ink'
                : 'border-transparent text-ih-muted hover:text-ih-ink-2'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Store Settings */}
      {activeTab === 'store' && (
        <form action={handleStoreSettings} className="max-w-[560px] flex flex-col gap-5">
          <div>
            <label htmlFor="settings-name" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Store Name
            </label>
            <Input
              id="settings-name"
              name="name"
              type="text"
              required
              defaultValue={storeSettings?.name ?? 'Indus Hydraulics'} />
          </div>

          <div>
            <label htmlFor="settings-supportEmail" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Support Email
            </label>
            <Input
              id="settings-supportEmail"
              name="supportEmail"
              type="email"
              defaultValue={storeSettings?.supportEmail ?? ''}
              placeholder="support@indushydraulics.me" />
          </div>

          <div>
            <label htmlFor="settings-defaultIncoterm" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Default Incoterm
            </label>
            <Select
              id="settings-defaultIncoterm"
              name="defaultIncoterm"
              defaultValue={storeSettings?.defaultIncoterm ?? ''}>
              <option value="">— None —</option>
              {INCOTERMS.map((term) => (
                <option key={term} value={term}>{term}</option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="settings-defaultPaymentTerms" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Default Payment Terms (days)
            </label>
            <Select
              id="settings-defaultPaymentTerms"
              name="defaultPaymentTerms"
              defaultValue={storeSettings?.defaultPaymentTerms ?? 30}>
              {[0, 7, 14, 30, 45, 60, 90].map((days) => (
                <option key={days} value={days}>
                  {days === 0 ? 'Prepayment' : `Net ${days}`}
                </option>
              ))}
            </Select>
          </div>

          <div className="pt-4 mt-4 border-t border-ih-border">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-muted mb-3">
              Brand identity
            </h3>
            <p className="text-[12px] text-ih-muted mb-4">
              Rendered in the storefront footer brand block. The store name above is reused as the brand name.
            </p>
          </div>

          <div>
            <label htmlFor="settings-tagline" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Tagline
            </label>
            <Textarea
              id="settings-tagline"
              name="tagline"
              rows={2}
              maxLength={280}
              defaultValue={storeSettings?.tagline ?? ''}
              placeholder="UAE's trusted distributor of industrial hydraulic components since 2003." className="resize-none" />
          </div>

          <div>
            <label htmlFor="settings-certificationLine" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Certification line
            </label>
            <Input
              id="settings-certificationLine"
              name="certificationLine"
              type="text"
              maxLength={120}
              defaultValue={storeSettings?.certificationLine ?? ''}
              placeholder="ISO 9001:2015 Certified" />
          </div>

          <div className="pt-4 mt-4 border-t border-ih-border">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-muted mb-3">
              Public contact info
            </h3>
            <p className="text-[12px] text-ih-muted mb-4">
              Rendered in the storefront header topbar (phone + hours) and footer contact block.
            </p>
          </div>

          <div>
            <label htmlFor="settings-contactLocationLabel" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Location label
            </label>
            <Input
              id="settings-contactLocationLabel"
              name="contactLocationLabel"
              type="text"
              maxLength={80}
              defaultValue={storeSettings?.contactLocationLabel ?? ''}
              placeholder="Dubai HQ" />
          </div>

          <div>
            <label htmlFor="settings-contactPhone" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Phone
            </label>
            <Input
              id="settings-contactPhone"
              name="contactPhone"
              type="text"
              maxLength={40}
              defaultValue={storeSettings?.contactPhone ?? ''}
              placeholder="+971 4 XXX XXXX" />
          </div>

          <div>
            <label htmlFor="settings-contactEmail" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Public email
            </label>
            <Input
              id="settings-contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={storeSettings?.contactEmail ?? ''}
              placeholder="sales@indushydraulics.me" />
          </div>

          <div>
            <label htmlFor="settings-contactHours" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Hours
            </label>
            <Input
              id="settings-contactHours"
              name="contactHours"
              type="text"
              maxLength={120}
              defaultValue={storeSettings?.contactHours ?? ''}
              placeholder="Mon–Sat 09:00–18:00 GST" />
          </div>

          <div className="pt-4 mt-4 border-t border-ih-border">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-muted mb-3">
              Legal entity
            </h3>
            <p className="text-[12px] text-ih-muted mb-4">
              Rendered on every quote PDF and transactional email footer. UAE ship-tos auto-apply 5% VAT; non-UAE ship-tos are zero-rated as exports (TRN still shown).
            </p>
          </div>

          <div>
            <label htmlFor="settings-legalName" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Legal name
            </label>
            <Input
              id="settings-legalName"
              name="legalName"
              type="text"
              maxLength={160}
              defaultValue={storeSettings?.legalName ?? ''}
              placeholder="Indus Hydraulic Power Trading LLC" />
          </div>

          <div>
            <label htmlFor="settings-vatTrn" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              VAT / TRN number
            </label>
            <Input
              id="settings-vatTrn"
              name="vatTrn"
              type="text"
              maxLength={40}
              defaultValue={storeSettings?.vatTrn ?? ''}
              placeholder="100548997400003" />
          </div>

          <div>
            <label htmlFor="settings-registeredAddressLines" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Registered address (one line per line)
            </label>
            <Textarea
              id="settings-registeredAddressLines"
              name="registeredAddressLines"
              rows={4}
              defaultValue={((storeSettings?.registeredAddressLines as string[] | null) ?? []).join('\n')}
              placeholder={'Office No 310 Al Hilal Bank Building, Al Nahda Street\nAl Quasis-2, Dubai\nDubai 87556\nUnited Arab Emirates'} className="resize-none font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="settings-registeredCountryCode" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Country (ISO-2)
              </label>
              <Input
                id="settings-registeredCountryCode"
                name="registeredCountryCode"
                type="text"
                maxLength={2}
                defaultValue={storeSettings?.registeredCountryCode ?? 'AE'}
                placeholder="AE" className="uppercase" />
            </div>
            <div>
              <label htmlFor="settings-defaultVatRatePct" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Default VAT rate (%)
              </label>
              <Input
                id="settings-defaultVatRatePct"
                name="defaultVatRatePct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue={storeSettings?.defaultVatRatePct?.toString() ?? '5.00'} />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-ih-border">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-muted mb-3">
              Quote signature block
            </h3>
            <p className="text-[12px] text-ih-muted mb-4">
              Appears at the bottom of every outgoing quote PDF and email.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="settings-signatureName" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Name
              </label>
              <Input
                id="settings-signatureName"
                name="signatureName"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.signatureName ?? ''}
                placeholder="Krishan Bhatia" />
            </div>
            <div>
              <label htmlFor="settings-signatureTitle" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Title
              </label>
              <Input
                id="settings-signatureTitle"
                name="signatureTitle"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.signatureTitle ?? ''}
                placeholder="Managing Director" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="settings-signaturePhone" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Phone
              </label>
              <Input
                id="settings-signaturePhone"
                name="signaturePhone"
                type="text"
                maxLength={40}
                defaultValue={storeSettings?.signaturePhone ?? ''}
                placeholder="+971 52 2477942" />
            </div>
            <div>
              <label htmlFor="settings-signatureEmail" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Email
              </label>
              <Input
                id="settings-signatureEmail"
                name="signatureEmail"
                type="email"
                defaultValue={storeSettings?.signatureEmail ?? ''}
                placeholder="sales@indushydraulics.me" />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-ih-border">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-muted mb-3">
              Outbound email
            </h3>
            <p className="text-[12px] text-ih-muted mb-4">
              All transactional email is sent from one shared address. Replies route here too. New-RFQ alerts fan out to the internal recipient list.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="settings-quoteFromEmail" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                From / Reply-To address
              </label>
              <Input
                id="settings-quoteFromEmail"
                name="quoteFromEmail"
                type="email"
                defaultValue={storeSettings?.quoteFromEmail ?? ''}
                placeholder="sales@indushydraulics.me" />
            </div>
            <div>
              <label htmlFor="settings-quoteFromName" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Sender display name
              </label>
              <Input
                id="settings-quoteFromName"
                name="quoteFromName"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.quoteFromName ?? ''}
                placeholder="Indus Hydraulics Sales" />
            </div>
          </div>

          <div>
            <label htmlFor="settings-internalAlertEmails" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Internal new-RFQ alert recipients (one email per line)
            </label>
            <Textarea
              id="settings-internalAlertEmails"
              name="internalAlertEmails"
              rows={3}
              defaultValue={((storeSettings?.internalAlertEmails as string[] | null) ?? []).join('\n')}
              placeholder={'sales@indushydraulics.me\nayushkbhatia@gmail.com'} className="resize-none font-mono" />
          </div>

          <div className="pt-4 mt-4 border-t border-ih-border">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-muted mb-3">
              Quote defaults
            </h3>
            <p className="text-[12px] text-ih-muted mb-4">
              Defaults pre-filled on every new quote. Engineers can override per quote.
            </p>
          </div>

          <div>
            <label htmlFor="settings-defaultQuoteValidityDays" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Validity (days)
            </label>
            <Input
              id="settings-defaultQuoteValidityDays"
              name="defaultQuoteValidityDays"
              type="number"
              min="1"
              max="365"
              defaultValue={storeSettings?.defaultQuoteValidityDays ?? 30} className="w-32" />
          </div>

          <div>
            <label htmlFor="settings-defaultQuoteNotes" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Default Notes (optional)
            </label>
            <Textarea
              id="settings-defaultQuoteNotes"
              name="defaultQuoteNotes"
              rows={3}
              defaultValue={storeSettings?.defaultQuoteNotes ?? ''}
              placeholder="Any standing notes that should appear on every quote." className="resize-none" />
          </div>

          <div>
            <label htmlFor="settings-defaultQuoteTerms" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Default Terms &amp; Conditions
            </label>
            <Textarea
              id="settings-defaultQuoteTerms"
              name="defaultQuoteTerms"
              rows={4}
              defaultValue={storeSettings?.defaultQuoteTerms ?? ''}
              placeholder={'DELIVERY: DDP destination\nPAYMENT: Advance with order\nPRICE VALID FOR FULL 30 DAYS ONLY.'} className="resize-none font-mono" />
          </div>

          <div>
            <label htmlFor="settings-defaultQuoteDisclaimer" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
              Default Disclaimer
            </label>
            <Textarea
              id="settings-defaultQuoteDisclaimer"
              name="defaultQuoteDisclaimer"
              rows={3}
              defaultValue={storeSettings?.defaultQuoteDisclaimer ?? ''}
              placeholder="Once the order is confirmed and processed, the same cannot be changed or cancelled. Material will be supplied as per the offer quoted." className="resize-none" />
          </div>

          <div className="pt-4 mt-4 border-t border-ih-border">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-ih-muted mb-3">
              Bank details (PDF footer)
            </h3>
            <p className="text-[12px] text-ih-muted mb-4">
              Rendered on page 2 of every quote PDF below the signature block. All fields optional — leave blank to hide the bank-details section entirely.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="settings-bankAccountName" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Account name
              </label>
              <Input
                id="settings-bankAccountName"
                name="bankAccountName"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.bankAccountName ?? ''}
                placeholder="Indus Hydraulic Power Trading LLC" />
            </div>
            <div>
              <label htmlFor="settings-bankName" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Bank name
              </label>
              <Input
                id="settings-bankName"
                name="bankName"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.bankName ?? ''}
                placeholder="Mashreq Bank" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="settings-bankBranch" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Branch
              </label>
              <Input
                id="settings-bankBranch"
                name="bankBranch"
                type="text"
                maxLength={120}
                defaultValue={storeSettings?.bankBranch ?? ''}
                placeholder="Al Quasis Branch, Dubai" />
            </div>
            <div>
              <label htmlFor="settings-bankAccountNo" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Account number
              </label>
              <Input
                id="settings-bankAccountNo"
                name="bankAccountNo"
                type="text"
                maxLength={40}
                defaultValue={storeSettings?.bankAccountNo ?? ''}
                placeholder="012345678901" className="font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="settings-bankIban" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                IBAN
              </label>
              <Input
                id="settings-bankIban"
                name="bankIban"
                type="text"
                maxLength={40}
                defaultValue={storeSettings?.bankIban ?? ''}
                placeholder="AE07 0331 2345 6789 0123 456" className="font-mono" />
            </div>
            <div>
              <label htmlFor="settings-bankSwift" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                SWIFT / BIC
              </label>
              <Input
                id="settings-bankSwift"
                name="bankSwift"
                type="text"
                maxLength={20}
                defaultValue={storeSettings?.bankSwift ?? ''}
                placeholder="BOMLAEAD" className="font-mono" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-5 bg-ih-accent text-ih-accent-fg font-mono text-[12px] hover:bg-ih-accent-hover disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save Settings'}
            </button>
            {saved === 'store' && (
              <span className="font-mono text-[11px] text-ih-success">Saved ✓</span>
            )}
            {error && activeTab === 'store' && (
              <span className="font-mono text-[11px] text-ih-danger-ink" role="alert">{error}</span>
            )}
          </div>
        </form>
      )}

      {/* Brand & Identity — the four brand images. Its own form and its own
          save action: the Store tab above is ~30 inputs across store, legal,
          quote and bank concerns, so posting all of them to change a logo
          would let an unrelated validation error there block a logo change. */}
      {activeTab === 'brand' && brandIdentity && (
        <BrandIdentityForm
          initial={brandIdentity}
          brandName={storeSettings?.name ?? 'Indus Hydraulics'}
          tagline={storeSettings?.tagline ?? null}
          options={mediaOptions}
        />
      )}

      {/* Email Templates */}
      {activeTab === 'emails' && (
        <div className="grid grid-cols-[240px_1fr] gap-6">
          {/* Template list */}
          <div className="border border-ih-border overflow-hidden h-fit">
            {EMAIL_KINDS.map((ek) => (
              <button
                key={ek.kind}
                onClick={() => setSelectedEmail(ek.kind)}
                className={`w-full text-left px-4 py-3 border-b border-ih-border last:border-0 transition-colors ${
                  selectedEmail === ek.kind
                    ? 'bg-ih-surface-2 border-l-2 border-l-ih-accent'
                    : 'hover:bg-ih-surface-2'
                }`}
              >
                <div className="text-[13px] font-medium text-ih-ink mb-0.5">{ek.label}</div>
                <div className="font-mono text-[11px] text-ih-muted">{ek.description}</div>
                {templateMap[ek.kind] && (
                  <div className="mt-1 font-mono text-[10.5px] px-1.5 py-0.5 bg-ih-success-soft text-ih-success inline-block">
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
                <form action={handleEmailTemplate} key={selectedEmail} className="flex flex-col gap-4">
                  <input type="hidden" name="kind" value={selectedEmail} />

                  <div>
                    <div className="mb-3">
                      <h2 className="text-[15px] font-medium">{meta.label}</h2>
                      <p className="text-[12px] text-ih-muted">{meta.description}</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="settings-subject" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                      Subject Line
                    </label>
                    <Input
                      id="settings-subject"
                      name="subject"
                      type="text"
                      required
                      defaultValue={currentTemplate?.subject ?? ''}
                      placeholder={`Email subject for ${meta.label}`} />
                  </div>

                  <div>
                    <label htmlFor="settings-bodyHtml" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                      Body HTML
                    </label>
                    <div className="border border-ih-border bg-ih-surface p-3 mb-1.5">
                      <p className="font-mono text-[11px] text-ih-muted">
                        Available variables:{' '}
                        <code className="bg-ih-surface-2 px-1">{'{{name}}'}</code>{' '}
                        <code className="bg-ih-surface-2 px-1">{'{{rfqCode}}'}</code>{' '}
                        <code className="bg-ih-surface-2 px-1">{'{{link}}'}</code>
                      </p>
                    </div>
                    <Textarea
                      id="settings-bodyHtml"
                      name="bodyHtml"
                      rows={16}
                      required
                      defaultValue={currentTemplate?.bodyHtml ?? ''} className="font-mono text-[12px] resize-none" />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="h-9 px-5 bg-ih-accent text-ih-accent-fg font-mono text-[12px] hover:bg-ih-accent-hover disabled:opacity-50"
                    >
                      {isPending ? 'Saving…' : 'Save Template'}
                    </button>
                    {saved === selectedEmail && (
                      <span className="font-mono text-[11px] text-ih-success">Saved ✓</span>
                    )}
                    {error && activeTab === 'emails' && (
                      <span className="font-mono text-[11px] text-ih-danger-ink" role="alert">{error}</span>
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
