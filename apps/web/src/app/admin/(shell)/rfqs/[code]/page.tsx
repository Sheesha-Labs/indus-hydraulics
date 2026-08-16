import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import { getValidTransitions } from '@indus/domain'
import { updateRfqStatus, saveLineReview } from './actions'
import SendQuoteComposer from '../../../../../components/admin/SendQuoteComposer'
import { formatAed, formatDayMonthYear } from '../../../../../lib/format'
import { signedUrlFor } from '../../../../../lib/supabase'
import { Input, Select, Textarea } from '@indus/ui'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import { ADMIN_PREFIX } from '../../../../../lib/admin-paths'

export const metadata: Metadata = { title: 'RFQ Detail — Indus Admin' }

type Props = {
  params: Promise<{ code: string }>
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  engineer_review: 'Under Review',
  engineer_questions_pending: 'Questions Pending',
  quote_sent: 'Quote Sent',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
  cancelled: 'Cancelled',
  order_created: 'Order Created',
}

const TRANSITION_LABELS: Record<string, string> = {
  engineer_review: 'Move to Review',
  engineer_questions_pending: 'Mark Questions Pending',
  quote_sent: 'Mark Quote Sent',
  accepted: 'Mark Accepted',
  declined: 'Decline',
  cancelled: 'Cancel',
  order_created: 'Mark Order Placed',
  shipped: 'Mark Shipped',
  delivered: 'Mark Delivered',
}

const TRANSITION_STYLES: Record<string, string> = {
  engineer_review: 'bg-[oklch(0.4_0.12_220)] text-white hover:bg-[oklch(0.35_0.12_220)]',
  engineer_questions_pending: 'bg-[oklch(0.5_0.12_60)] text-white hover:opacity-90',
  quote_sent: 'bg-[oklch(0.4_0.14_160)] text-white hover:opacity-90',
  accepted: 'bg-[oklch(0.4_0.14_145)] text-white hover:opacity-90',
  declined: 'border border-[oklch(0.75_0.1_25)] text-[oklch(0.5_0.1_25)] hover:bg-[oklch(0.97_0.02_25)]',
  cancelled: 'border border-ih-border text-ih-muted hover:bg-ih-surface-2',
  order_created: 'bg-[oklch(0.45_0.13_260)] text-white hover:opacity-90',
  shipped: 'bg-[oklch(0.45_0.13_220)] text-white hover:opacity-90',
  delivered: 'bg-[oklch(0.4_0.14_145)] text-white hover:opacity-90',
}

const URGENCY_LABEL: Record<string, string> = {
  routine: 'Routine',
  priority: '🟡 Priority',
  plant_down: '🔴 Plant Down',
}

export default async function AdminRfqDetailPage({ params }: Props) {
  const { code } = await params

  const rfq = await db.rfq.findUnique({
    where: { code },
    include: {
      account: { select: { legalName: true, code: true, id: true } },
      submittedBy: { select: { firstName: true, lastName: true, email: true } },
      assignedEngineer: { select: { id: true, name: true } },
      assignedRep: { select: { id: true, name: true } },
      shipToAddress: true,
      lines: {
        include: {
          product: {
            select: { sku: true, title: true, images: { take: 1, orderBy: { position: 'asc' }, include: { media: true } } },
          },
        },
        orderBy: { position: 'asc' },
      },
      attachments: { include: { media: true } },
      quotes: { orderBy: { revision: 'desc' }, include: { pdfMedia: true } },
    },
  })

  if (!rfq) notFound()

  // Attachments live in a PRIVATE bucket, so the stored path is not a URL.
  // Mint a short-lived signed URL per attachment at render time.
  const attachmentLinks = await Promise.all(
    rfq.attachments.map(async (att) => ({
      id: att.id,
      filename: att.media.originalFilename,
      href: await signedUrlFor(att.media.storagePath),
    })),
  )

  const [engineers, settings] = await Promise.all([
    db.staffUser.findMany({
      where: { isActive: true, role: { in: ['engineer', 'super_admin', 'manager'] } },
      select: { id: true, name: true },
    }),
    db.storeSettings.findFirst(),
  ])

  const validTransitions = getValidTransitions(rfq.status)

  // Compose preview-of-totals values for the SendQuoteComposer
  const currentSubtotal = rfq.lines.reduce(
    (sum, l) => sum + l.requestedQty * Number(l.engineerUnitPrice ?? 0),
    0,
  )
  const isUaeShipTo = rfq.shipToAddress?.countryCode?.toUpperCase() === 'AE'
  const defaultVatRatePct = isUaeShipTo ? Number(settings?.defaultVatRatePct ?? 5) : 0
  const canCompose = ['engineer_review', 'engineer_questions_pending', 'quote_sent'].includes(rfq.status)

  return (
    <AdminPageShell
      // RFQ code — machine-readable, so mono per §2.6.
      title={<span className="font-mono">{rfq.code}</span>}
      sub={rfq.subject || undefined}
      actions={
        <>
          {/*
            Status and urgency, not buttons — but this is the RFQ workflow's
            primary screen and they are the two facts that decide what an
            engineer does next.

            The status TRANSITION buttons stay in the body. Each is a
            <button type="submit"> inside its own <form action={serverAction}>,
            and moving one out of its form breaks it with no compile error, no
            lint failure and no runtime error — the click would just stop
            advancing the RFQ.
          */}
          <StatusBadge status={rfq.status} />
          <span className="font-mono text-[11px] text-ih-muted">
            {URGENCY_LABEL[rfq.urgency] ?? rfq.urgency}
          </span>
          <Link
            href={`${ADMIN_PREFIX}/rfqs`}
            className="flex h-9 items-center rounded-md border border-ih-border bg-ih-surface px-4 text-[13px] font-medium transition-colors hover:border-ih-accent hover:text-ih-accent"
          >
            ← RFQ Queue
          </Link>
        </>
      }
    >

      {/* Status action buttons + quote preview link */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-ih-border">
        {validTransitions.map((transition) => (
          <form
            key={transition}
            action={async () => {
              'use server'
              await updateRfqStatus(rfq.id, transition)
            }}
          >
            <button
              type="submit"
              className={`h-9 px-4 font-mono text-[12px] transition-colors ${TRANSITION_STYLES[transition] ?? 'border border-ih-border text-ih-ink-2 hover:bg-ih-surface-2'}`}
            >
              {TRANSITION_LABELS[transition] ?? transition}
            </button>
          </form>
        ))}
        <a
          href={`/api/rfqs/${rfq.code}/preview-pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 px-4 ml-auto inline-flex items-center gap-1.5 border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors"
          title="Open the quote PDF preview in a new tab. Uses current line prices and store defaults."
        >
          Preview Quote PDF →
        </a>
      </div>

      {/* Issued quotes (revisions history) — show only after the first send */}
      {rfq.quotes.length > 0 ? (
        <div className="border border-ih-border mb-6">
          <div className="px-4 py-2 bg-ih-surface-2 border-b border-ih-border font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted">
            Issued quotes
          </div>
          {rfq.quotes.map((q) => (
            <div
              key={q.id}
              className="grid grid-cols-[1fr_140px_120px_140px_auto] gap-3 items-center px-4 py-3 border-b border-ih-border last:border-0 text-[13px]"
            >
              <div>
                <div className="font-mono text-[13px] text-ih-ink">
                  {q.code}
                  {q.revision > 1 ? <span className="text-ih-muted ml-2">R{q.revision}</span> : null}
                </div>
                <div className="font-mono text-[10px] text-ih-muted-2 mt-0.5">
                  Sent {q.sentAt ? formatDayMonthYear(q.sentAt) : '—'}
                </div>
              </div>
              <div className="text-right text-ih-ink-2 font-mono text-[12px]">
                {formatAed(Number(q.total))}
              </div>
              <div className="text-right text-ih-muted font-mono text-[11px]">
                Net {q.termsValidityDays}d
              </div>
              <div className="text-right text-ih-muted font-mono text-[11px]">
                {q.expiresAt ? `exp ${formatDayMonthYear(q.expiresAt)}` : '—'}
              </div>
              <div className="text-right">
                {q.pdfMedia ? (
                  <a
                    href={`/api/quotes/${q.code}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-ih-accent hover:underline"
                  >
                    Download PDF →
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-ih-muted">no PDF</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Send-Quote composer (only when state allows) */}
      {canCompose ? (
        <SendQuoteComposer
          rfqId={rfq.id}
          rfqCode={rfq.code}
          defaultValidityDays={settings?.defaultQuoteValidityDays ?? 30}
          defaultPaymentTerms={'Advance with order'}
          defaultNotes={settings?.defaultQuoteNotes ?? ''}
          defaultVatRatePct={defaultVatRatePct}
          currentSubtotal={currentSubtotal}
          rfqSubject={rfq.subject ?? null}
          hasExistingQuote={rfq.quotes.length > 0}
        />
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        {/* Main: engineer review form */}
        <div>
          <form
            action={async (fd: FormData) => {
              'use server'
              const r = await saveLineReview(fd)
              if (!r.success) throw new Error(r.message)
            }}
          >
            <input type="hidden" name="rfqId" value={rfq.id} />

            <h2 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-3">
              Line Items ({rfq.lines.length})
            </h2>

            <div className="border border-ih-border mb-4">
              {/* Header */}
              <div className="grid grid-cols-[1fr_120px_120px] px-4 py-2 bg-ih-bg border-b border-ih-border font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted">
                <div>Product</div>
                <div className="text-right">Unit Price (AED)</div>
                <div className="text-right">Lead Time (days)</div>
              </div>

              {rfq.lines.map((line, i) => (
                <div key={line.id} className={`border-b border-ih-border last:border-0 ${i % 2 === 0 ? 'bg-ih-surface' : 'bg-ih-bg'}`}>
                  <div className="grid grid-cols-[1fr_120px_120px] px-4 py-3 items-center">
                    <div>
                      <div className="text-[13px] font-medium">{line.product.title}</div>
                      <div className="font-mono text-[11px] text-ih-muted">{line.product.sku}</div>
                      <div className="font-mono text-[11px] text-ih-muted-2 mt-0.5">
                        Qty requested: {line.requestedQty}
                        {line.customerTargetPrice && ` · Target: AED ${Number(line.customerTargetPrice).toFixed(2)}`}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <input
                        type="number"
                        name={`unitPrice_${line.id}`}
                        defaultValue={line.engineerUnitPrice ? Number(line.engineerUnitPrice).toString() : ''}
                        step="0.01"
                        min="0"
                        placeholder="—"
                        className="w-24 h-8 px-2 border border-ih-border bg-ih-surface font-mono text-[13px] text-ih-ink text-right focus:outline-none focus:border-ih-accent placeholder:text-ih-muted-2"
                      />
                    </div>
                    <div className="flex justify-end">
                      <input
                        type="number"
                        name={`leadTime_${line.id}`}
                        defaultValue={line.engineerLeadTimeDays ?? ''}
                        min="0"
                        placeholder="—"
                        className="w-24 h-8 px-2 border border-ih-border bg-ih-surface font-mono text-[13px] text-ih-ink text-right focus:outline-none focus:border-ih-accent placeholder:text-ih-muted-2"
                      />
                    </div>
                  </div>
                  {/* Line note */}
                  <div className="px-4 pb-3">
                    <input
                      type="text"
                      name={`lineNote_${line.id}`}
                      defaultValue={line.engineerNotes ?? ''}
                      placeholder="Engineer note for this line (optional)"
                      className="w-full h-7 px-2 border border-ih-border bg-transparent font-mono text-[11px] text-ih-ink-2 placeholder:text-ih-muted-2 focus:outline-none focus:border-ih-accent"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Internal notes */}
            <div className="mb-4">
              <label htmlFor="rfqdetail-internalNotes" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
                Internal Notes
              </label>
              <Textarea
                id="rfqdetail-internalNotes"
                name="internalNotes"
                defaultValue={rfq.internalNotes ?? ''}
                rows={4}
                placeholder="Notes visible to staff only — not shown to customer" className="font-mono resize-none" />
            </div>

            <button
              type="submit"
              className="h-10 px-6 bg-ih-navy text-white font-mono text-[12px] hover:bg-[var(--color-ih-ink-2)] transition-colors"
            >
              Save Review
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Account */}
          <div className="border border-ih-border bg-ih-surface p-4">
            <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted mb-3">Account</h3>
            <Link href={`/admin/customers/${rfq.account.id}`} className="text-[13px] font-semibold text-ih-accent hover:underline">
              {rfq.account.legalName}
            </Link>
            <div className="font-mono text-[11px] text-ih-muted mt-0.5">{rfq.account.code}</div>
            {rfq.submittedBy && (
              <div className="mt-2 text-[12px] text-ih-ink-2">
                <span className="text-ih-muted">Submitted by: </span>
                {rfq.submittedBy.firstName} {rfq.submittedBy.lastName}
                <div className="font-mono text-[11px] text-ih-muted">{rfq.submittedBy.email}</div>
              </div>
            )}
          </div>

          {/* Assignment */}
          <div className="border border-ih-border bg-ih-surface p-4">
            <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted mb-3">Assignment</h3>
            <form action={async (fd: FormData) => {
              'use server'
              const { assignEngineer } = await import('./actions')
              const eId = fd.get('engineerId') as string
              if (eId) await assignEngineer(rfq.id, eId)
            }}>
              <label htmlFor="rfqdetail-engineerId" className="block font-mono text-[11px] text-ih-muted mb-1">Engineer</label>
              <div className="flex gap-2">
                <Select
                  id="rfqdetail-engineerId"
                  name="engineerId"
                  defaultValue={rfq.assignedEngineerId ?? ''} className="flex-1 h-8">
                  <option value="">— Unassigned —</option>
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name}
                    </option>
                  ))}
                </Select>
                <button type="submit" className="h-8 px-3 border border-ih-border font-mono text-[11px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors">
                  Save
                </button>
              </div>
            </form>
          </div>

          {/* Dates */}
          <div className="border border-ih-border bg-ih-surface p-4">
            <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted mb-3">Timeline</h3>
            <dl className="space-y-2 text-[13px]">
              {rfq.submittedAt && (
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Submitted</dt>
                  <dd className="font-mono text-ih-ink">{new Date(rfq.submittedAt).toLocaleDateString()}</dd>
                </div>
              )}
              {rfq.requestedDeliveryDate && (
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Req. delivery</dt>
                  <dd className="font-mono text-ih-ink">{new Date(rfq.requestedDeliveryDate).toLocaleDateString()}</dd>
                </div>
              )}
              {rfq.quoteSentAt && (
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Quote sent</dt>
                  <dd className="font-mono text-ih-ink">{new Date(rfq.quoteSentAt).toLocaleDateString()}</dd>
                </div>
              )}
              {rfq.acceptedAt && (
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Accepted</dt>
                  <dd className="font-mono text-ih-ink">{new Date(rfq.acceptedAt).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Ship-to */}
          {rfq.shipToAddress && (
            <div className="border border-ih-border bg-ih-surface p-4">
              <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted mb-2">Ship-to</h3>
              <div className="text-[12px] text-ih-ink-2">
                <div className="font-medium">{rfq.shipToAddress.label}</div>
                {(rfq.shipToAddress.lines as string[]).map((l, i) => <div key={i}>{l}</div>)}
                <div>{rfq.shipToAddress.city}, {rfq.shipToAddress.countryCode}</div>
              </div>
            </div>
          )}

          {/* Tracking */}
          <div className="border border-ih-border bg-ih-surface p-4">
            <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted mb-2">Tracking</h3>
            <p className="text-[11px] text-ih-muted mb-3 leading-[1.5]">
              Free-text. Surfaces under the Shipped step on the customer&apos;s
              /quote/[code] timeline.
            </p>
            <form action={async (fd: FormData) => {
              'use server'
              const { updateTracking } = await import('./actions')
              const r = await updateTracking(fd)
              if (!r.success) throw new Error(r.message)
            }}>
              <input type="hidden" name="rfqId" value={rfq.id} />
              <label htmlFor="rfqdetail-trackingCarrier" className="block font-mono text-[11px] text-ih-muted mb-1">Carrier</label>
              <Input
                id="rfqdetail-trackingCarrier"
                type="text"
                name="trackingCarrier"
                defaultValue={rfq.trackingCarrier ?? ''}
                placeholder="e.g. Aramex, DHL"
                maxLength={120} className="h-8 mb-2" />
              <label htmlFor="rfqdetail-trackingNumber" className="block font-mono text-[11px] text-ih-muted mb-1">Tracking number</label>
              <Input
                id="rfqdetail-trackingNumber"
                type="text"
                name="trackingNumber"
                defaultValue={rfq.trackingNumber ?? ''}
                placeholder="AWB / consignment #"
                maxLength={120} className="h-8 mb-2 font-mono" />
              <button type="submit" className="h-8 px-3 border border-ih-border font-mono text-[11px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors">
                Save
              </button>
            </form>
          </div>

          {/* Application context */}
          {rfq.applicationContext && (
            <div className="border border-ih-border bg-ih-surface p-4">
              <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted mb-2">Application Context</h3>
              <p className="text-[12px] text-ih-ink-2 leading-[1.5]">{rfq.applicationContext}</p>
            </div>
          )}

          {/* Customer message */}
          {rfq.customerMessage && (
            <div className="border border-ih-border bg-ih-surface p-4">
              <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted mb-2">Customer Message</h3>
              <p className="text-[12px] text-ih-ink-2 leading-[1.5]">{rfq.customerMessage}</p>
            </div>
          )}

          {/* Attachments */}
          {rfq.attachments.length > 0 && (
            <div className="border border-ih-border bg-ih-surface p-4">
              <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted mb-3">Attachments</h3>
              <div className="flex flex-col gap-2">
                {attachmentLinks.map((att) => (
                  <a
                    key={att.id}
                    href={att.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-[12px] text-ih-accent hover:underline"
                  >
                    ↓ {att.filename}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    submitted: 'text-[oklch(0.4_0.12_220)] bg-[oklch(0.95_0.05_220)]',
    engineer_review: 'text-[oklch(0.4_0.12_220)] bg-[oklch(0.95_0.05_220)]',
    engineer_questions_pending: 'text-[oklch(0.5_0.12_60)] bg-[oklch(0.95_0.08_60)]',
    quote_sent: 'text-[oklch(0.4_0.14_160)] bg-[oklch(0.95_0.06_160)]',
    accepted: 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.93_0.08_145)]',
    declined: 'text-[oklch(0.5_0.1_25)] bg-[oklch(0.95_0.04_25)]',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.06em] ${colorMap[status] ?? 'text-ih-muted bg-ih-surface-2'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
