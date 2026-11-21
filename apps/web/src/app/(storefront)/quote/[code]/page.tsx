import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import { mediaUrl } from '../../../../lib/media'
import { verifyQuoteAccessToken } from '@indus/domain'
import AnalyticsEvent from '../../../../components/AnalyticsEvent'

export const metadata: Metadata = { title: 'RFQ Status' }

type Props = {
  params: Promise<{ code: string }>
  searchParams: Promise<{ confirmed?: string; token?: string }>
}

const URGENCY_LABELS: Record<string, string> = {
  routine: 'Routine',
  priority: 'Priority',
  plant_down: 'Plant Down',
}

const URGENCY_COLORS: Record<string, string> = {
  routine: 'text-ih-muted bg-ih-surface',
  priority: 'text-[oklch(0.5_0.14_60)] bg-[oklch(0.97_0.04_60)]',
  plant_down: 'text-[oklch(0.5_0.18_25)] bg-[oklch(0.97_0.04_25)]',
}

// Each timeline step is associated with the AccountActivity verb that
// records when it was reached. The page reads the most recent matching
// activity row and surfaces the timestamp next to the label.
const TIMELINE_STEPS = [
  {
    key: 'submitted',
    label: 'Received',
    desc: 'auto-acknowledged · confirmation email sent',
    verb: 'submitted_rfq',
  },
  {
    key: 'engineer_review',
    label: 'Engineer reviewing',
    desc: 'checking stock · preparing quote',
    verb: 'review_started',
  },
  {
    key: 'quote_sent',
    label: 'Quote PDF prepared',
    desc: 'sent for your approval',
    verb: 'quote_sent',
  },
  { key: 'accepted', label: 'Approved', desc: 'order being placed', verb: 'quote_accepted' },
  {
    key: 'order_created',
    label: 'Order placed',
    desc: 'allocated · being prepared for dispatch',
    verb: 'order_placed',
  },
  { key: 'shipped', label: 'Shipped', desc: 'in transit', verb: 'order_shipped' },
  {
    key: 'delivered',
    label: 'Delivered',
    desc: 'received at destination',
    verb: 'order_delivered',
  },
] as const

const STATUS_ORDER = [
  'submitted',
  'engineer_review',
  'engineer_questions_pending',
  'quote_sent',
  'accepted',
  'order_created',
  'shipped',
  'delivered',
]

function getStepReached(status: string): number {
  if (status === 'draft') return -1
  const idx = STATUS_ORDER.indexOf(status)
  if (idx === -1) return -1
  // Map status to timeline-step index. engineer_questions_pending collapses
  // back into the engineer_review step (same dot, same active state).
  if (idx === 0) return 0 // submitted
  if (idx === 1 || idx === 2) return 1 // engineer_review / questions
  if (idx === 3) return 2 // quote_sent
  if (idx === 4) return 3 // accepted
  if (idx === 5) return 4 // order_created
  if (idx === 6) return 5 // shipped
  return 6 // delivered
}

export default async function RfqStatusPage({ params, searchParams }: Props) {
  const { code } = await params
  const sp = await searchParams

  // The only way to view an RFQ is a signed access token for this code — the
  // link in the confirmation and quote_sent emails, or the redirect straight
  // after submitting. There are no customer accounts to fall back on. A
  // missing or bad token is a 404, not a 403, so RFQ codes cannot be probed.
  const tokenCheck = sp.token ? verifyQuoteAccessToken(sp.token, code) : null
  if (tokenCheck?.valid !== true || !sp.token) notFound()
  const token = sp.token

  const rfq = await db.rfq.findUnique({
    where: { code },
    include: {
      lines: {
        include: {
          product: {
            select: {
              sku: true,
              slug: true,
              title: true,
              images: { take: 1, orderBy: { position: 'asc' }, include: { media: true } },
            },
          },
        },
        orderBy: { position: 'asc' },
      },
      shipToAddress: true,
      quotes: { orderBy: { revision: 'desc' }, include: { pdfMedia: true } },
    },
  })

  if (!rfq) notFound()

  // Pull recent activity rows so we can show timestamps under each completed
  // timeline step (e.g. "Shipped · 12 May 2026"). We filter to the verbs
  // recorded by admin's updateRfqStatus action.
  const stepVerbs = TIMELINE_STEPS.map((s) => s.verb)
  const stepActivity = await db.accountActivity.findMany({
    where: {
      accountId: rfq.accountId,
      verb: { in: stepVerbs as unknown as string[] },
      payload: { path: ['rfqId'], equals: rfq.id },
    },
    orderBy: { createdAt: 'desc' },
    select: { verb: true, createdAt: true },
  })
  // First-seen wins (we ordered desc and overwrite, so the *earliest* date
  // for each verb survives — i.e. when the step was first reached).
  const stepTimestamps = new Map<string, Date>()
  for (const row of stepActivity) {
    stepTimestamps.set(row.verb, row.createdAt)
  }

  const isTerminal = ['declined', 'expired', 'cancelled'].includes(rfq.status)
  const stepReached = getStepReached(rfq.status)
  const urgencyLabel = URGENCY_LABELS[rfq.urgency] ?? rfq.urgency
  const urgencyColor = URGENCY_COLORS[rfq.urgency] ?? URGENCY_COLORS.routine!

  // Fire `rfq_submitted` only on a first landing flagged by the link (the retired /quote/submit set it)
  // (server action appends `?confirmed=1`). Subsequent visits to the
  // same RFQ status page don't emit a duplicate submission event.
  const isFreshSubmission = sp.confirmed === '1'

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10 pb-20">
      {isFreshSubmission && (
        <AnalyticsEvent
          name="rfq_submitted"
          props={{
            rfqCode: rfq.code,
            urgency: rfq.urgency,
            lineCount: rfq.lines.length,
            anonymous: true,
          }}
        />
      )}

      {/* ── Confirmation header ─────────────────────────────────── */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[oklch(0.95_0.1_150)] text-[28px] text-[oklch(0.4_0.15_150)]">
          ✓
        </div>
        <div className="text-ih-muted mb-1 font-mono text-[11px] tracking-[0.16em] uppercase">
          RFQ received ·{' '}
          {rfq.submittedAt
            ? new Date(rfq.submittedAt).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              }) +
              ' · ' +
              new Date(rfq.submittedAt)
                .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                .toUpperCase()
            : 'In progress'}
        </div>
        <h1 className="mb-2 font-serif text-[clamp(28px,4vw,36px)] font-normal tracking-[-0.01em]">
          Got it. We&apos;re on it.
        </h1>
        <p className="text-ih-muted mx-auto max-w-[560px] text-[16px] leading-[1.6]">
          Your request is in front of our applications team.
          {rfq.urgency === 'plant_down' && (
            <>
              {' '}
              Because you marked this <b className="text-[oklch(0.5_0.18_25)]">plant down</b>,
              expect a reply within <b className="text-ih-ink">30 minutes</b> — including evenings
              and weekends.
            </>
          )}
          {rfq.urgency === 'priority' && (
            <>
              {' '}
              We&apos;ll have a response for you within <b className="text-ih-ink">4 hours</b>.
            </>
          )}
          {rfq.urgency === 'routine' && (
            <>
              {' '}
              We&apos;ll have a response for you within{' '}
              <b className="text-ih-ink">1 business day</b>.
            </>
          )}
        </p>
      </div>

      {/* ── Reference + Assigned ──────────────────────────────── */}
      <div className="mb-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="border-ih-border bg-ih-surface border p-5">
          <div className="text-ih-muted font-mono text-[10px] tracking-[0.12em] uppercase">
            RFQ Reference
          </div>
          <div className="mt-1.5 font-mono text-[24px] font-semibold">{rfq.code}</div>
          <div className="text-ih-muted mt-1.5 text-[12px]">
            Quote any details with this number · saved to your account
          </div>
        </div>
        <div className="border-ih-border bg-ih-surface border p-5">
          <div className="text-ih-muted mb-2 font-mono text-[10px] tracking-[0.12em] uppercase">
            Urgency
          </div>
          <span
            className={`inline-flex items-center gap-2 px-2.5 py-1 font-mono text-[11px] font-medium ${urgencyColor}`}
          >
            ● {urgencyLabel.toUpperCase()}
            {rfq.urgency === 'plant_down' && ' · 30 min SLA'}
          </span>
          {rfq.requestedDeliveryDate && (
            <div className="text-ih-muted mt-3 text-[13px]">
              Delivery requested:{' '}
              <b className="text-ih-ink">
                {new Date(rfq.requestedDeliveryDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </b>
            </div>
          )}
        </div>
      </div>

      {/* ── Status timeline ───────────────────────────────────── */}
      {!isTerminal && (
        <div className="border-ih-border bg-ih-surface mb-8 overflow-hidden border">
          <div className="border-ih-border flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-[16px] font-semibold">Status</h3>
            <span className={`px-2.5 py-0.5 font-mono text-[11px] ${urgencyColor}`}>
              ● {rfq.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <div className="p-5 pb-2">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0">
              {TIMELINE_STEPS.map((step, idx) => {
                const done = idx < stepReached
                const active = idx === stepReached
                const pending = idx > stepReached
                return (
                  <div key={step.key} className="contents">
                    {/* Dot + connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full ${
                          done
                            ? 'bg-[oklch(0.5_0.13_150)]'
                            : active
                              ? 'bg-ih-accent'
                              : 'bg-ih-surface-2 border-ih-border border'
                        }`}
                      />
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div
                          className={`min-h-[32px] w-0.5 flex-1 ${done ? 'bg-[oklch(0.5_0.13_150)]' : 'bg-ih-border'}`}
                        />
                      )}
                    </div>
                    {/* Label */}
                    <div className={`pb-6 ${pending ? 'text-ih-muted' : ''}`}>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <b className={pending ? 'text-ih-ink-2' : ''}>{step.label}</b>
                        {(done || active) && stepTimestamps.get(step.verb) && (
                          <span className="text-ih-muted font-mono text-[11px]">
                            {new Date(stepTimestamps.get(step.verb)!).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      <div className="text-ih-muted mt-0.5 font-mono text-[11px]">
                        {active ? 'In progress · ' : ''}
                        {step.desc}
                      </div>
                      {step.key === 'shipped' && (done || active) && rfq.trackingCarrier && (
                        <div className="text-ih-ink-2 mt-1 font-mono text-[11px]">
                          {rfq.trackingCarrier}
                          {rfq.trackingNumber ? ` · ${rfq.trackingNumber}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Terminal state */}
      {isTerminal && (
        <div
          className={`mb-8 border p-4 font-medium ${rfq.status === 'cancelled' || rfq.status === 'declined' ? 'border-[oklch(0.75_0.1_25)] bg-[oklch(0.97_0.02_25)] text-[oklch(0.5_0.12_25)]' : 'border-ih-border bg-ih-surface text-ih-ink-2'}`}
        >
          {rfq.status === 'declined'
            ? 'Quote declined.'
            : rfq.status === 'expired'
              ? 'Quote expired.'
              : 'RFQ cancelled.'}
        </div>
      )}

      {/* ── Line items ───────────────────────────────────────── */}
      <div className="border-ih-border bg-ih-surface mb-8 overflow-hidden border">
        <div className="border-ih-border border-b px-5 py-4">
          <h3 className="text-[16px] font-semibold">Lines on this RFQ</h3>
        </div>
        {rfq.lines.map((line) => (
          <div
            key={line.id}
            className="border-ih-border grid grid-cols-[60px_1fr_auto] items-center gap-4 border-b px-5 py-4 last:border-0"
          >
            <div className="bg-ih-surface-2 border-ih-border relative aspect-square overflow-hidden border">
              {line.product.images[0] ? (
                <Image
                  src={mediaUrl(line.product.images[0]!.media.storagePath)}
                  alt={
                    line.product.images[0]!.alt ??
                    line.product.images[0]!.media.alt ??
                    line.product.title
                  }
                  fill
                  className="object-contain p-1"
                  sizes="60px"
                />
              ) : (
                <div className="text-ih-muted absolute inset-0 grid place-items-center font-mono text-[9px]">
                  IMG
                </div>
              )}
            </div>
            <div>
              <Link
                href={`/p/${line.product.slug}`}
                className="hover:text-ih-accent text-[14px] font-medium transition-colors"
              >
                {line.product.title}
              </Link>
              <div className="text-ih-muted mt-0.5 font-mono text-[11px]">{line.product.sku}</div>
              {line.engineerNotes && (
                <div className="text-ih-muted mt-1 text-[12px] italic">{line.engineerNotes}</div>
              )}
            </div>
            <div className="shrink-0 text-right">
              <div className="font-mono text-[13px]">
                qty <b className="text-ih-ink">{line.requestedQty}</b>
              </div>
              {line.engineerUnitPrice && (
                <div className="text-ih-accent mt-0.5 font-mono text-[11px]">
                  ${Number(line.engineerUnitPrice).toFixed(2)} / unit
                </div>
              )}
              {line.engineerLeadTimeDays && (
                <div className="text-ih-muted font-mono text-[11px]">
                  Lead: {line.engineerLeadTimeDays}d
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quote PDF (latest + previous revisions) ─────────────── */}
      {rfq.quotes.length > 0 && (
        <div className="border-ih-border bg-ih-surface mb-8 border p-5">
          <h3 className="text-ih-muted mb-1 font-mono text-[10px] tracking-[0.1em] uppercase">
            Quotation {rfq.quotes.length > 1 ? '(revisions)' : 'ready'}
          </h3>
          <p className="text-ih-muted mb-4 text-[12px]">
            To accept, please reply to the email we sent you confirming the order. The PDF below is
            identical to the attachment.
          </p>
          <div className="space-y-2">
            {rfq.quotes.map((q) => (
              <div
                key={q.id}
                className="border-ih-border flex items-center justify-between gap-4 border-b py-2 last:border-0"
              >
                <div>
                  <div className="text-ih-ink font-mono text-[13px]">
                    {q.code}
                    {q.revision > 1 ? (
                      <span className="text-ih-muted ml-2">R{q.revision}</span>
                    ) : null}
                  </div>
                  <div className="text-ih-muted mt-0.5 font-mono text-[10px]">
                    Sent{' '}
                    {q.sentAt
                      ? new Date(q.sentAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                    {q.expiresAt
                      ? ` · valid until ${new Date(q.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                      : ''}
                  </div>
                </div>
                {q.pdfMedia ? (
                  <a
                    href={`/api/quotes/${encodeURIComponent(q.code)}/pdf?token=${encodeURIComponent(token)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-ih-accent text-ih-accent hover:bg-ih-accent inline-flex h-9 items-center gap-2 border px-4 font-mono text-[12px] whitespace-nowrap transition-colors hover:text-white"
                  >
                    Download PDF ↓
                  </a>
                ) : (
                  <span className="text-ih-muted font-mono text-[11px]">no PDF</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CTAs ────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={`/c`}
          className="bg-ih-navy flex h-12 items-center justify-center text-[14px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Continue browsing →
        </Link>
        <Link
          href={`/`}
          className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 flex h-12 items-center justify-center border text-[14px] font-medium transition-colors"
        >
          Back to home
        </Link>
      </div>

      {/* ── Add to RFQ tip ──────────────────────────────────────── */}
      <div className="bg-ih-surface border-ih-border text-ih-muted flex items-start gap-4 border p-5 text-[13px] leading-[1.6]">
        <span className="text-ih-muted shrink-0 font-mono text-[14px]">ⓘ</span>
        <div>
          <b className="text-ih-ink">Need to add to this RFQ?</b> Reply to the confirmation email or
          reach out directly — quoting <b className="font-mono">{rfq.code}</b>. We&apos;ll merge it
          into a single quote so you don&apos;t get fragmented pricing.
        </div>
      </div>
    </div>
  )
}
