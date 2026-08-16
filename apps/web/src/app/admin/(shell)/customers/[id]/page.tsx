import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db, Prisma } from '@indus/db'
import { updateAccountMeta, addActivityNote, deactivateContact, reactivateContact, approveAddress } from './actions'
import { Input, Select, Textarea } from '@indus/ui'

export const metadata: Metadata = { title: 'Customer — Indus Admin' }

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; emailsPage?: string }>
}

const EMAILS_PAGE_SIZE = 25

function parsePage(raw: string | undefined): number {
  if (!raw) return 1
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return n
}

const TIER_COLORS: Record<string, string> = {
  bronze: 'text-[oklch(0.55_0.1_55)] bg-[oklch(0.96_0.04_55)]',
  silver: 'text-[oklch(0.45_0.02_240)] bg-[oklch(0.94_0.01_240)]',
  gold: 'text-[oklch(0.55_0.13_80)] bg-[oklch(0.96_0.05_80)]',
  platinum: 'text-[oklch(0.4_0.08_220)] bg-[oklch(0.93_0.04_220)]',
}

const STATUS_COLORS: Record<string, string> = {
  prospect: 'text-[oklch(0.5_0.08_60)] bg-[oklch(0.96_0.04_60)]',
  active: 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]',
  at_risk: 'text-[oklch(0.5_0.12_25)] bg-[oklch(0.96_0.04_25)]',
  archived: 'text-ih-muted bg-ih-surface-2',
}

const RFQ_STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted', engineer_review: 'Under Review',
  engineer_questions_pending: 'Questions', quote_sent: 'Quote Sent',
  accepted: 'Accepted', declined: 'Declined', cancelled: 'Cancelled',
  order_created: 'Order Created', draft: 'Draft', expired: 'Expired',
}

export default async function AdminCustomerDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const tab = sp.tab ?? 'overview'
  const emailsPage = parsePage(sp.emailsPage)

  const account = await db.account.findUnique({
    where: { id },
    include: {
      industry: true,
      assignedRep: { select: { id: true, name: true } },
      contacts: { orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }] },
      addresses: {
        include: { approvedBy: { select: { firstName: true, lastName: true } } },
        orderBy: [{ isDefaultShip: 'desc' }, { createdAt: 'asc' }],
      },
      rfqs: {
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { lines: { select: { id: true } } },
      },
      activity: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  })

  if (!account) notFound()

  const emailsWhere: Prisma.SentEmailWhereInput = {
    OR: [
      { rfq: { accountId: id } },
      { quote: { rfq: { accountId: id } } },
    ],
  }
  const [reps, sentEmails, sentEmailsTotal] = await Promise.all([
    db.staffUser.findMany({
      where: { isActive: true, role: { in: ['sales_rep', 'manager', 'super_admin'] } },
      select: { id: true, name: true },
    }),
    // Page through transactional emails sent on behalf of this account,
    // joining through whichever side (rfq vs quote) the email was attached
    // to. Page size + offset come from the URL so the page is shareable.
    db.sentEmail.findMany({
      where: emailsWhere,
      orderBy: { attemptedAt: 'desc' },
      skip: (emailsPage - 1) * EMAILS_PAGE_SIZE,
      take: EMAILS_PAGE_SIZE,
      select: {
        id: true,
        kind: true,
        toEmails: true,
        subject: true,
        status: true,
        error: true,
        attemptedAt: true,
        sentAt: true,
        rfq: { select: { code: true } },
        quote: { select: { code: true, rfq: { select: { code: true } } } },
      },
    }),
    db.sentEmail.count({ where: emailsWhere }),
  ])

  const totalEmailPages = Math.max(1, Math.ceil(sentEmailsTotal / EMAILS_PAGE_SIZE))
  const safeEmailsPage = Math.min(emailsPage, totalEmailPages)

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'rfqs', label: `RFQs (${account.rfqs.length})` },
    { key: 'contacts', label: `Contacts (${account.contacts.length})` },
    { key: 'addresses', label: `Addresses (${account.addresses.length})` },
    { key: 'emails', label: `Emails (${sentEmailsTotal})` },
    { key: 'notes', label: 'Notes' },
  ]

  function tabUrl(t: string) {
    return `/customers/${id}?tab=${t}`
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <Link href={`/admin/customers`} className="font-mono text-[12px] text-ih-muted hover:text-ih-ink mb-2 inline-block">
            ← Customers
          </Link>
          <h1 className="text-[24px] font-semibold tracking-tight">{account.legalName}</h1>
          <div className="font-mono text-[12px] text-ih-muted mt-0.5">{account.code}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 font-mono text-[11px] font-semibold capitalize ${TIER_COLORS[account.tier] ?? ''}`}>
            {account.tier}
          </span>
          <span className={`px-2.5 py-1 font-mono text-[11px] font-semibold capitalize ${STATUS_COLORS[account.status] ?? ''}`}>
            {account.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ih-border mb-6">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={tabUrl(t.key)}
            className={`px-4 py-2.5 font-mono text-[12px] border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-ih-accent text-ih-accent'
                : 'border-transparent text-ih-muted hover:text-ih-ink'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
          <form
            action={async (fd: FormData) => {
              'use server'
              const r = await updateAccountMeta(fd)
              if (!r.success) throw new Error(r.message)
            }}
          >
            <input type="hidden" name="id" value={account.id} />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="customer-tier" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Tier</label>
                <Select
                  id="customer-tier" name="tier" defaultValue={account.tier}>
                  {['bronze', 'silver', 'gold', 'platinum'].map((t) => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label htmlFor="customer-status" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Status</label>
                <Select
                  id="customer-status" name="status" defaultValue={account.status}>
                  {['prospect', 'active', 'at_risk', 'archived'].map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label htmlFor="customer-assignedRepId" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Assigned Rep</label>
                <Select
                  id="customer-assignedRepId" name="assignedRepId" defaultValue={account.assignedRepId ?? ''}>
                  <option value="">— Unassigned —</option>
                  {reps.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label htmlFor="customer-paymentTermsDays" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Payment Terms (days)</label>
                <Input
                  id="customer-paymentTermsDays" type="number" name="paymentTermsDays" defaultValue={account.paymentTermsDays} min={0} className="font-mono" />
              </div>
              <div>
                <label htmlFor="customer-creditLimit" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">Credit Limit (USD)</label>
                <Input
                  id="customer-creditLimit" type="number" name="creditLimit" defaultValue={Number(account.creditLimit)} min={0} step={1000} className="font-mono" />
              </div>
            </div>
            <button type="submit" className="h-10 px-6 bg-ih-navy text-white font-mono text-[12px] hover:bg-[var(--color-ih-ink-2)] transition-colors">
              Save Changes
            </button>
          </form>

          {/* Stats sidebar */}
          <div className="space-y-4">
            <div className="border border-ih-border bg-ih-surface p-4">
              <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted mb-3">Account Stats</h3>
              <dl className="space-y-2 text-[13px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Industry</dt>
                  <dd className="font-mono text-ih-ink">{account.industry?.name ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Region</dt>
                  <dd className="font-mono text-ih-ink">{account.region ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Currency</dt>
                  <dd className="font-mono text-ih-ink">{account.preferredCurrency}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Credit outstanding</dt>
                  <dd className="font-mono text-ih-ink">USD {Number(account.creditOutstanding).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Avg DSO</dt>
                  <dd className="font-mono text-ih-ink">{account.avgDsoDays} days</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Member since</dt>
                  <dd className="font-mono text-ih-ink">{new Date(account.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* ── RFQs tab ── */}
      {tab === 'rfqs' && (
        <div>
          {account.rfqs.length === 0 ? (
            <div className="py-12 border border-dashed border-ih-border text-center">
              <p className="text-ih-muted">No RFQs yet.</p>
            </div>
          ) : (
            <div className="border border-ih-border">
              <div className="grid grid-cols-[1fr_80px_130px_100px] px-4 py-2.5 bg-ih-bg border-b border-ih-border font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted">
                <div>Reference</div>
                <div className="text-center">Lines</div>
                <div className="text-center">Status</div>
                <div className="text-right">Date</div>
              </div>
              {account.rfqs.map((rfq, i) => (
                <Link
                  key={rfq.id}
                  href={`/admin/rfqs/${rfq.code}`}
                  className={`grid grid-cols-[1fr_80px_130px_100px] px-4 py-3 items-center bg-ih-surface hover:bg-ih-surface-2 transition-colors ${i > 0 ? 'border-t border-ih-border' : ''}`}
                >
                  <div>
                    <div className="font-mono text-[13px] font-semibold">{rfq.code}</div>
                    {rfq.subject && <div className="text-[12px] text-ih-muted truncate max-w-[280px]">{rfq.subject}</div>}
                  </div>
                  <div className="text-center font-mono text-[13px]">{rfq.lines.length}</div>
                  <div className="flex justify-center">
                    <span className="px-2 py-0.5 font-mono text-[10px] bg-ih-bg text-ih-muted">
                      {RFQ_STATUS_LABELS[rfq.status] ?? rfq.status}
                    </span>
                  </div>
                  <div className="text-right font-mono text-[12px] text-ih-muted">
                    {new Date(rfq.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Contacts tab ── */}
      {tab === 'contacts' && (
        <div>
          <div className="border border-ih-border mb-4">
            <div className="grid grid-cols-[1fr_100px_100px_80px_80px] px-4 py-2.5 bg-ih-bg border-b border-ih-border font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted">
              <div>Contact</div>
              <div>Role</div>
              <div>Last Sign-in</div>
              <div className="text-center">Status</div>
              <div />
            </div>
            {account.contacts.map((c, i) => (
              <div key={c.id} className={`grid grid-cols-[1fr_100px_100px_80px_80px] px-4 py-3 items-center bg-ih-surface ${i > 0 ? 'border-t border-ih-border' : ''}`}>
                <div>
                  <div className="text-[13px] font-medium">{c.firstName} {c.lastName}</div>
                  <div className="font-mono text-[11px] text-ih-muted">{c.email}</div>
                </div>
                <div className="font-mono text-[11px] text-ih-muted capitalize">{c.role}</div>
                <div className="font-mono text-[11px] text-ih-muted">
                  {c.lastSignInAt ? new Date(c.lastSignInAt).toLocaleDateString() : 'Never'}
                </div>
                <div className="flex justify-center">
                  <span className={`px-2 py-0.5 font-mono text-[10px] ${c.isActive ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]' : 'text-ih-muted bg-ih-surface-2'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-end">
                  {c.isActive ? (
                    <form action={async () => {
                      'use server'
                      await deactivateContact(c.id, account.id)
                    }}>
                      <button type="submit" className="font-mono text-[11px] text-ih-muted hover:text-ih-danger transition-colors">
                        Deactivate
                      </button>
                    </form>
                  ) : (
                    <form action={async () => {
                      'use server'
                      await reactivateContact(c.id, account.id)
                    }}>
                      <button type="submit" className="font-mono text-[11px] text-ih-accent hover:underline">
                        Reactivate
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Addresses tab ── */}
      {tab === 'addresses' && (
        <div className="space-y-3">
          {account.addresses.length === 0 ? (
            <div className="py-12 border border-dashed border-ih-border text-center">
              <p className="text-ih-muted">No addresses on file.</p>
            </div>
          ) : (
            account.addresses.map((addr) => (
              <div key={addr.id} className="border border-ih-border bg-ih-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold">{addr.label}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-ih-bg text-ih-muted capitalize">
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
                    </div>
                    {addr.attention && <div className="text-[12px] text-ih-muted mb-0.5">Attn: {addr.attention}</div>}
                    {(addr.lines as string[]).map((l, i) => <div key={i} className="text-[13px]">{l}</div>)}
                    <div className="text-[13px]">{addr.city}{addr.region ? `, ${addr.region}` : ''} {addr.postalCode}</div>
                    <div className="text-[13px]">{addr.countryCode}</div>
                    {addr.phone && <div className="font-mono text-[11px] text-ih-muted mt-1">{addr.phone}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    {account.requiresAddressApproval && !addr.approvedAt ? (
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-mono text-[11px] px-2 py-0.5 bg-[oklch(0.96_0.04_60)] text-[oklch(0.5_0.08_60)]">
                          Pending Approval
                        </span>
                        <form action={async () => {
                          'use server'
                          await approveAddress(addr.id, account.id)
                        }}>
                          <button type="submit" className="font-mono text-[11px] text-ih-accent hover:underline">
                            Approve →
                          </button>
                        </form>
                      </div>
                    ) : addr.approvedAt ? (
                      <div className="font-mono text-[11px] text-ih-muted">
                        Approved {new Date(addr.approvedAt).toLocaleDateString()}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Emails tab ── */}
      {tab === 'emails' && (
        <div>
          {sentEmails.length === 0 ? (
            <p className="text-ih-muted text-[13px]">
              No emails sent for this account yet.
            </p>
          ) : (
            <div className="border border-ih-border bg-ih-surface">
              <div className="grid grid-cols-[140px_140px_1fr_120px_100px] gap-3 px-4 py-2.5 border-b border-ih-border font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted">
                <span>Sent</span>
                <span>Kind</span>
                <span>Subject &amp; recipient</span>
                <span>Linked</span>
                <span>Status</span>
              </div>
              {sentEmails.map((e) => {
                const recipients = Array.isArray(e.toEmails)
                  ? (e.toEmails as unknown[]).filter((v): v is string => typeof v === 'string')
                  : []
                const linkedRfqCode = e.rfq?.code ?? e.quote?.rfq?.code ?? null
                const statusColor =
                  e.status === 'sent'
                    ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]'
                    : e.status === 'sandboxed'
                      ? 'text-[oklch(0.5_0.08_240)] bg-[oklch(0.94_0.04_240)]'
                      : e.status === 'failed'
                        ? 'text-[oklch(0.5_0.18_25)] bg-[oklch(0.96_0.04_25)]'
                        : 'text-ih-muted bg-ih-surface-2'
                return (
                  <div
                    key={e.id}
                    className="grid grid-cols-[140px_140px_1fr_120px_100px] gap-3 px-4 py-3 border-b border-ih-border last:border-0 items-start text-[12px]"
                  >
                    <span className="font-mono text-ih-muted">
                      {new Date(e.attemptedAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="font-mono text-[11px] text-ih-ink-2">
                      {e.kind.replace(/_/g, ' ')}
                    </span>
                    <div>
                      <div className="text-ih-ink truncate" title={e.subject}>
                        {e.subject}
                      </div>
                      {recipients.length > 0 && (
                        <div className="font-mono text-[11px] text-ih-muted truncate">
                          {recipients.join(', ')}
                        </div>
                      )}
                      {e.status === 'failed' && e.error && (
                        <div className="font-mono text-[11px] text-[oklch(0.5_0.18_25)] mt-0.5 truncate" title={e.error}>
                          {e.error}
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[11px]">
                      {linkedRfqCode ? (
                        <Link
                          href={`/admin/rfqs/${linkedRfqCode}`}
                          className="text-ih-accent hover:underline"
                        >
                          {linkedRfqCode}
                        </Link>
                      ) : (
                        <span className="text-ih-muted-2">—</span>
                      )}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 font-mono text-[10px] font-semibold capitalize w-fit ${statusColor}`}
                    >
                      {e.status}
                    </span>
                  </div>
                )
              })}
              {totalEmailPages > 1 && (
                <div className="px-4 py-2.5 border-t border-ih-border flex items-center justify-between gap-3 text-[11px] font-mono text-ih-muted">
                  <span>
                    Showing {(safeEmailsPage - 1) * EMAILS_PAGE_SIZE + 1}–
                    {Math.min(safeEmailsPage * EMAILS_PAGE_SIZE, sentEmailsTotal)} of {sentEmailsTotal}
                  </span>
                  <div className="flex items-center gap-2">
                    {safeEmailsPage > 1 ? (
                      <Link
                        href={`/admin/customers/${id}?tab=emails&emailsPage=${safeEmailsPage - 1}`}
                        className="px-2 py-1 border border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 transition-colors"
                      >
                        ← Prev
                      </Link>
                    ) : (
                      <span className="px-2 py-1 border border-ih-border text-ih-muted-2">
                        ← Prev
                      </span>
                    )}
                    <span>
                      page {safeEmailsPage} / {totalEmailPages}
                    </span>
                    {safeEmailsPage < totalEmailPages ? (
                      <Link
                        href={`/admin/customers/${id}?tab=emails&emailsPage=${safeEmailsPage + 1}`}
                        className="px-2 py-1 border border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 transition-colors"
                      >
                        Next →
                      </Link>
                    ) : (
                      <span className="px-2 py-1 border border-ih-border text-ih-muted-2">
                        Next →
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Notes tab ── */}
      {tab === 'notes' && (
        <div>
          {/* Add note form */}
          <form
            action={async (fd: FormData) => {
              'use server'
              const r = await addActivityNote(fd)
              if (!r.success) throw new Error(r.message)
            }}
            className="mb-6"
          >
            <input type="hidden" name="accountId" value={account.id} />
            <Textarea
              id="customer-body"
              name="body"
              rows={3}
              placeholder="Add a note visible to all staff…" className="resize-none mb-2" />
            <button type="submit" className="h-9 px-5 bg-ih-navy text-white font-mono text-[12px] hover:bg-[var(--color-ih-ink-2)] transition-colors">
              Add Note
            </button>
          </form>

          {/* Activity feed */}
          <div className="space-y-3">
            {account.activity.map((entry) => {
              const payload = entry.payload as Record<string, unknown>
              return (
                <div key={entry.id} className="flex gap-3">
                  <div className="w-8 h-8 border border-ih-border bg-ih-bg grid place-items-center font-mono text-[10px] text-ih-muted shrink-0 mt-0.5">
                    {entry.actorType === 'staff' ? 'ST' : 'CT'}
                  </div>
                  <div className="flex-1 pb-3 border-b border-ih-border">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[11px] font-semibold text-ih-ink capitalize">
                        {entry.verb.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-[10px] text-ih-muted">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {typeof payload.body === 'string' && (
                      <p className="text-[13px] text-ih-ink-2 leading-[1.5]">{payload.body}</p>
                    )}
                    {typeof payload.rfqId === 'string' && typeof payload.code === 'string' && (
                      <p className="font-mono text-[12px] text-ih-muted">
                        RFQ: <Link href={`/admin/rfqs/${payload.code}`} className="text-ih-accent hover:underline">{payload.code}</Link>
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
            {account.activity.length === 0 && (
              <p className="text-ih-muted text-[13px]">No activity yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
