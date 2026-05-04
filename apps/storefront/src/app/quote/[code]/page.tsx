import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '../../../lib/auth'
import { db } from '@indus/db'
import { mediaUrl } from '../../../lib/media'
import { verifyQuoteAccessToken } from '@indus/domain'

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
  routine: 'text-[var(--color-muted)] bg-[var(--color-surface)]',
  priority: 'text-[oklch(0.5_0.14_60)] bg-[oklch(0.97_0.04_60)]',
  plant_down: 'text-[oklch(0.5_0.18_25)] bg-[oklch(0.97_0.04_25)]',
}

// Each timeline step is associated with the AccountActivity verb that
// records when it was reached. The page reads the most recent matching
// activity row and surfaces the timestamp next to the label.
const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Received', desc: 'auto-acknowledged · confirmation email sent', verb: 'submitted_rfq' },
  { key: 'engineer_review', label: 'Engineer reviewing', desc: 'checking stock · preparing quote', verb: 'review_started' },
  { key: 'quote_sent', label: 'Quote PDF prepared', desc: 'sent for your approval', verb: 'quote_sent' },
  { key: 'accepted', label: 'Approved', desc: 'order being placed', verb: 'quote_accepted' },
  { key: 'order_created', label: 'Order placed', desc: 'allocated · being prepared for dispatch', verb: 'order_placed' },
  { key: 'shipped', label: 'Shipped', desc: 'in transit', verb: 'order_shipped' },
  { key: 'delivered', label: 'Delivered', desc: 'received at destination', verb: 'order_delivered' },
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
  const session = await auth()

  // Two valid paths to view this RFQ:
  //  1. Logged-in account contact whose accountId matches.
  //  2. Holder of a signed access token (from the quote_sent email link),
  //     so a forwarded recipient can view + download the PDF without an account.
  const tokenCheck = sp.token ? verifyQuoteAccessToken(sp.token, code) : null
  const hasValidToken = tokenCheck?.valid === true

  if (!session?.user?.accountId && !hasValidToken) {
    redirect(`/sign-in?next=/quote/${code}`)
  }

  const rfq = await db.rfq.findUnique({
    where: { code },
    include: {
      lines: {
        include: {
          product: {
            select: {
              sku: true,
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
  // Logged-in users must own the account; signed-link viewers bypass this.
  if (!hasValidToken && rfq.accountId !== session?.user?.accountId) notFound()

  const isTerminal = ['declined', 'expired', 'cancelled'].includes(rfq.status)
  const stepReached = getStepReached(rfq.status)
  const urgencyLabel = URGENCY_LABELS[rfq.urgency] ?? rfq.urgency
  const urgencyColor = URGENCY_COLORS[rfq.urgency] ?? URGENCY_COLORS.routine!

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10 pb-20">

      {/* ── Confirmation header ─────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-[oklch(0.95_0.1_150)] text-[oklch(0.4_0.15_150)] grid place-items-center mx-auto mb-5 text-[28px]">
          ✓
        </div>
        <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase mb-1">
          RFQ received · {rfq.submittedAt
            ? new Date(rfq.submittedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · ' +
              new Date(rfq.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
            : 'In progress'}
        </div>
        <h1 className="text-[40px] font-semibold tracking-[-0.02em] mb-2">Got it. We&apos;re on it.</h1>
        <p className="text-[var(--color-muted)] text-[16px] max-w-[560px] mx-auto leading-[1.6]">
          Your request is in front of our applications team.
          {rfq.urgency === 'plant_down' && (
            <> Because you marked this <b className="text-[oklch(0.5_0.18_25)]">plant down</b>, expect a reply within <b className="text-[var(--color-primary)]">30 minutes</b> — including evenings and weekends.</>
          )}
          {rfq.urgency === 'priority' && (
            <> We&apos;ll have a response for you within <b className="text-[var(--color-primary)]">4 hours</b>.</>
          )}
          {rfq.urgency === 'routine' && (
            <> We&apos;ll have a response for you within <b className="text-[var(--color-primary)]">1 business day</b>.</>
          )}
        </p>
      </div>

      {/* ── Reference + Assigned ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-5">
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)]">RFQ Reference</div>
          <div className="font-mono text-[24px] font-semibold mt-1.5">{rfq.code}</div>
          <div className="text-[12px] text-[var(--color-muted)] mt-1.5">Quote any details with this number · saved to your account</div>
        </div>
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-5">
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-2">Urgency</div>
          <span className={`inline-flex items-center gap-2 font-mono text-[11px] px-2.5 py-1 font-medium ${urgencyColor}`}>
            ● {urgencyLabel.toUpperCase()}
            {rfq.urgency === 'plant_down' && ' · 30 min SLA'}
          </span>
          {rfq.requestedDeliveryDate && (
            <div className="mt-3 text-[13px] text-[var(--color-muted)]">
              Delivery requested: <b className="text-[var(--color-primary)]">{new Date(rfq.requestedDeliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</b>
            </div>
          )}
        </div>
      </div>

      {/* ── Status timeline ───────────────────────────────────── */}
      {!isTerminal && (
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] mb-8 overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--color-border)]">
            <h3 className="font-semibold text-[16px]">Status</h3>
            <span className={`font-mono text-[11px] px-2.5 py-0.5 ${urgencyColor}`}>
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
                        className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 ${
                          done ? 'bg-[oklch(0.5_0.13_150)]' :
                          active ? 'bg-[var(--color-accent)]' :
                          'bg-[var(--color-deep)] border border-[var(--color-border)]'
                        }`}
                      />
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-[32px] ${done ? 'bg-[oklch(0.5_0.13_150)]' : 'bg-[var(--color-border)]'}`} />
                      )}
                    </div>
                    {/* Label */}
                    <div className={`pb-6 ${pending ? 'text-[var(--color-muted)]' : ''}`}>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <b className={pending ? 'text-[var(--color-body)]' : ''}>{step.label}</b>
                        {(done || active) && stepTimestamps.get(step.verb) && (
                          <span className="font-mono text-[11px] text-[var(--color-muted)]">
                            {new Date(stepTimestamps.get(step.verb)!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--color-muted)] mt-0.5">{active ? 'In progress · ' : ''}{step.desc}</div>
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
        <div className={`p-4 mb-8 border font-medium ${rfq.status === 'cancelled' || rfq.status === 'declined' ? 'border-[oklch(0.75_0.1_25)] bg-[oklch(0.97_0.02_25)] text-[oklch(0.5_0.12_25)]' : 'border-[var(--color-border)] bg-[var(--color-elevated)] text-[var(--color-body)]'}`}>
          {rfq.status === 'declined' ? 'Quote declined.' : rfq.status === 'expired' ? 'Quote expired.' : 'RFQ cancelled.'}
        </div>
      )}

      {/* ── Line items ───────────────────────────────────────── */}
      <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] mb-8 overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-semibold text-[16px]">Lines on this RFQ</h3>
        </div>
        {rfq.lines.map((line) => (
          <div key={line.id} className="grid grid-cols-[60px_1fr_auto] gap-4 px-5 py-4 border-b border-[var(--color-border-2)] last:border-0 items-center">
            <div className="aspect-square bg-[var(--color-deep)] border border-[var(--color-border)] relative overflow-hidden">
              {line.product.images[0] ? (
                <Image
                  src={mediaUrl(line.product.images[0]!.media.storagePath)}
                  alt={line.product.title}
                  fill
                  className="object-contain p-1"
                  sizes="60px"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center font-mono text-[9px] text-[var(--color-muted)]">IMG</div>
              )}
            </div>
            <div>
              <Link href={`/p/${line.product.sku}`} className="font-medium text-[14px] hover:text-[var(--color-accent)] transition-colors">
                {line.product.title}
              </Link>
              <div className="font-mono text-[11px] text-[var(--color-muted)] mt-0.5">{line.product.sku}</div>
              {line.engineerNotes && (
                <div className="text-[12px] text-[var(--color-muted)] mt-1 italic">{line.engineerNotes}</div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-[13px]">qty <b className="text-[var(--color-primary)]">{line.requestedQty}</b></div>
              {line.engineerUnitPrice && (
                <div className="font-mono text-[11px] text-[var(--color-accent)] mt-0.5">
                  ${Number(line.engineerUnitPrice).toFixed(2)} / unit
                </div>
              )}
              {line.engineerLeadTimeDays && (
                <div className="font-mono text-[11px] text-[var(--color-muted)]">
                  Lead: {line.engineerLeadTimeDays}d
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quote PDF (latest + previous revisions) ─────────────── */}
      {rfq.quotes.length > 0 && (
        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-5 mb-8">
          <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1">
            Quotation {rfq.quotes.length > 1 ? '(revisions)' : 'ready'}
          </h3>
          <p className="text-[12px] text-[var(--color-muted)] mb-4">
            To accept, please reply to the email we sent you confirming the order. The PDF below is identical to the attachment.
          </p>
          <div className="space-y-2">
            {rfq.quotes.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-4 py-2 border-b border-[var(--color-border)] last:border-0">
                <div>
                  <div className="font-mono text-[13px] text-[var(--color-primary)]">
                    {q.code}
                    {q.revision > 1 ? <span className="text-[var(--color-muted)] ml-2">R{q.revision}</span> : null}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--color-muted)] mt-0.5">
                    Sent {q.sentAt ? new Date(q.sentAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    {q.expiresAt ? ` · valid until ${new Date(q.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                  </div>
                </div>
                {q.pdfMedia ? (
                  <a
                    href={`/api/quotes/${encodeURIComponent(q.code)}/pdf${hasValidToken && sp.token ? `?token=${encodeURIComponent(sp.token)}` : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-9 px-4 border border-[var(--color-accent)] text-[var(--color-accent)] font-mono text-[12px] hover:bg-[var(--color-accent)] hover:text-white transition-colors whitespace-nowrap"
                  >
                    Download PDF ↓
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-[var(--color-muted)]">no PDF</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CTAs ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <Link
          href={`/account/quotes`}
          className="h-12 flex items-center justify-center bg-[var(--color-primary)] text-[var(--color-elevated)] font-medium text-[14px] hover:opacity-90 transition-opacity"
        >
          Track in your account →
        </Link>
        <Link
          href={`/`}
          className="h-12 flex items-center justify-center border border-[var(--color-border)] text-[var(--color-body)] font-medium text-[14px] hover:bg-[var(--color-deep)] transition-colors"
        >
          Back to home
        </Link>
      </div>

      {/* ── Add to RFQ tip ──────────────────────────────────────── */}
      <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] flex gap-4 items-start text-[13px] text-[var(--color-muted)] leading-[1.6]">
        <span className="font-mono text-[14px] text-[var(--color-muted)] shrink-0">ⓘ</span>
        <div>
          <b className="text-[var(--color-primary)]">Need to add to this RFQ?</b>{' '}
          Reply to the confirmation email or reach out directly — quoting{' '}
          <b className="font-mono">{rfq.code}</b>. We&apos;ll merge it into a single quote so you don&apos;t get fragmented pricing.
        </div>
      </div>
    </div>
  )
}
