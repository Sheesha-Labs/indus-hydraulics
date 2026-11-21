import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db, Prisma } from '@indus/db'
import {
  updateAccountMeta,
  addActivityNote,
  deactivateContact,
  reactivateContact,
  approveAddress,
} from './actions'
import { Input, Select, Textarea } from '@indus/ui'
import { ADMIN_PREFIX } from '../../../../../lib/admin-paths'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'

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
  prospect: 'text-[oklch(0.5_0.08_60)] bg-ih-warning-soft',
  active: 'text-ih-success-ink bg-ih-success-soft',
  at_risk: 'text-ih-danger-ink bg-ih-danger-soft',
  archived: 'text-ih-muted bg-ih-surface-2',
}

const RFQ_STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  engineer_review: 'Under Review',
  engineer_questions_pending: 'Questions',
  quote_sent: 'Quote Sent',
  accepted: 'Accepted',
  declined: 'Declined',
  cancelled: 'Cancelled',
  order_created: 'Order Created',
  draft: 'Draft',
  expired: 'Expired',
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
    OR: [{ rfq: { accountId: id } }, { quote: { rfq: { accountId: id } } }],
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
    return `${ADMIN_PREFIX}/customers/${id}?tab=${t}`
  }

  return (
    // The wrapper was a bare <div> with NO padding class, so this page sat
    // flush against the sidebar. The shell's body supplies the gutter every
    // other admin page has.
    <AdminPageShell
      title={account.legalName}
      sub={<span className="tabular-nums">{account.code}</span>}
      actions={
        <>
          {/* Tier and status qualify the account; they are not buttons, but
              dropping them would remove the at-a-glance state this page
              exists to show. */}
          <span
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize tabular-nums ${TIER_COLORS[account.tier] ?? ''}`}
          >
            {account.tier}
          </span>
          <span
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize tabular-nums ${STATUS_COLORS[account.status] ?? ''}`}
          >
            {account.status.replace('_', ' ')}
          </span>
          <Link
            href={`${ADMIN_PREFIX}/customers`}
            className="border-ih-border bg-ih-surface hover:border-ih-accent hover:text-ih-accent flex h-9 items-center rounded-md border px-4 text-[13px] font-medium transition-colors"
          >
            ← Customers
          </Link>
        </>
      }
    >
      {/* Tabs */}
      <div className="border-ih-border mb-6 flex border-b">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={tabUrl(t.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[12px] tabular-nums transition-colors ${
              tab === t.key
                ? 'border-ih-accent text-ih-accent'
                : 'text-ih-muted hover:text-ih-ink border-transparent'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_320px]">
          <form
            action={async (fd: FormData) => {
              'use server'
              const r = await updateAccountMeta(fd)
              if (!r.success) throw new Error(r.message)
            }}
          >
            <input type="hidden" name="id" value={account.id} />
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="customer-tier"
                  className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
                >
                  Tier
                </label>
                <Select id="customer-tier" name="tier" defaultValue={account.tier}>
                  {['bronze', 'silver', 'gold', 'platinum'].map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label
                  htmlFor="customer-status"
                  className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
                >
                  Status
                </label>
                <Select id="customer-status" name="status" defaultValue={account.status}>
                  {['prospect', 'active', 'at_risk', 'archived'].map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label
                  htmlFor="customer-assignedRepId"
                  className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
                >
                  Assigned Rep
                </label>
                <Select
                  id="customer-assignedRepId"
                  name="assignedRepId"
                  defaultValue={account.assignedRepId ?? ''}
                >
                  <option value="">— Unassigned —</option>
                  {reps.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label
                  htmlFor="customer-paymentTermsDays"
                  className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
                >
                  Payment Terms (days)
                </label>
                <Input
                  id="customer-paymentTermsDays"
                  type="number"
                  name="paymentTermsDays"
                  defaultValue={account.paymentTermsDays}
                  min={0}
                  className="tabular-nums"
                />
              </div>
              <div>
                <label
                  htmlFor="customer-creditLimit"
                  className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
                >
                  Credit Limit (USD)
                </label>
                <Input
                  id="customer-creditLimit"
                  type="number"
                  name="creditLimit"
                  defaultValue={Number(account.creditLimit)}
                  min={0}
                  step={1000}
                  className="tabular-nums"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-ih-navy text-ih-bg h-10 px-6 text-[12px] tabular-nums transition-colors hover:bg-[var(--color-ih-ink-2)]"
            >
              Save Changes
            </button>
          </form>

          {/* Stats sidebar */}
          <div className="flex flex-col gap-4">
            <div className="border-ih-border bg-ih-surface rounded-lg border p-4">
              <h3 className="text-ih-muted mb-3 text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
                Account Stats
              </h3>
              <dl className="flex flex-col gap-2 text-[13px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Industry</dt>
                  <dd className="text-ih-ink tabular-nums">{account.industry?.name ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Region</dt>
                  <dd className="text-ih-ink tabular-nums">{account.region ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Currency</dt>
                  <dd className="text-ih-ink tabular-nums">{account.preferredCurrency}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Credit outstanding</dt>
                  <dd className="text-ih-ink tabular-nums">
                    USD {Number(account.creditOutstanding).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Avg DSO</dt>
                  <dd className="text-ih-ink tabular-nums">{account.avgDsoDays} days</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ih-muted">Member since</dt>
                  <dd className="text-ih-ink tabular-nums">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </dd>
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
            <div className="border-ih-border rounded-lg border py-12 text-center">
              <p className="text-ih-muted">No RFQs yet.</p>
            </div>
          ) : (
            <div className="border-ih-border overflow-hidden rounded-lg border">
              <div className="bg-ih-bg border-ih-border text-ih-muted grid grid-cols-[1fr_80px_130px_100px] border-b px-4 py-2.5 text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
                <div>Reference</div>
                <div className="text-center">Lines</div>
                <div className="text-center">Status</div>
                <div className="text-right">Date</div>
              </div>
              {account.rfqs.map((rfq, i) => (
                <Link
                  key={rfq.id}
                  href={`/admin/rfqs/${rfq.code}`}
                  className={`bg-ih-surface hover:bg-ih-surface-2 grid grid-cols-[1fr_80px_130px_100px] items-center px-4 py-3 transition-colors ${i > 0 ? 'border-ih-border border-t' : ''}`}
                >
                  <div>
                    <div className="text-[13px] font-medium tabular-nums">{rfq.code}</div>
                    {rfq.subject && (
                      <div className="text-ih-muted max-w-[280px] truncate text-[12px]">
                        {rfq.subject}
                      </div>
                    )}
                  </div>
                  <div className="text-center text-[13px] tabular-nums">{rfq.lines.length}</div>
                  <div className="flex justify-center">
                    <span className="bg-ih-bg text-ih-muted px-2 py-0.5 text-[11px] tabular-nums">
                      {RFQ_STATUS_LABELS[rfq.status] ?? rfq.status}
                    </span>
                  </div>
                  <div className="text-ih-muted text-right text-[12px] tabular-nums">
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
          <div className="border-ih-border mb-4 overflow-hidden rounded-lg border">
            <div className="bg-ih-bg border-ih-border text-ih-muted grid grid-cols-[1fr_100px_100px_80px_80px] border-b px-4 py-2.5 text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
              <div>Contact</div>
              <div>Role</div>
              <div>Last Sign-in</div>
              <div className="text-center">Status</div>
              <div />
            </div>
            {account.contacts.map((c, i) => (
              <div
                key={c.id}
                className={`bg-ih-surface grid grid-cols-[1fr_100px_100px_80px_80px] items-center px-4 py-3 ${i > 0 ? 'border-ih-border border-t' : ''}`}
              >
                <div>
                  <div className="text-[13px] font-medium">
                    {c.firstName} {c.lastName}
                  </div>
                  <div className="text-ih-muted text-[11px] tabular-nums">{c.email}</div>
                </div>
                <div className="text-ih-muted text-[11px] capitalize tabular-nums">{c.role}</div>
                <div className="text-ih-muted text-[11px] tabular-nums">
                  {c.lastSignInAt ? new Date(c.lastSignInAt).toLocaleDateString() : 'Never'}
                </div>
                <div className="flex justify-center">
                  <span
                    className={`px-2 py-0.5 text-[11px] tabular-nums ${c.isActive ? 'text-ih-success-ink bg-ih-success-soft' : 'text-ih-muted bg-ih-surface-2'}`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-end">
                  {c.isActive ? (
                    <form
                      action={async () => {
                        'use server'
                        await deactivateContact(c.id, account.id)
                      }}
                    >
                      <button
                        type="submit"
                        className="text-ih-muted hover:text-ih-danger text-[11px] tabular-nums transition-colors"
                      >
                        Deactivate
                      </button>
                    </form>
                  ) : (
                    <form
                      action={async () => {
                        'use server'
                        await reactivateContact(c.id, account.id)
                      }}
                    >
                      <button
                        type="submit"
                        className="text-ih-accent text-[11px] tabular-nums hover:underline"
                      >
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
        <div className="flex flex-col gap-3">
          {account.addresses.length === 0 ? (
            <div className="border-ih-border rounded-lg border py-12 text-center">
              <p className="text-ih-muted">No addresses on file.</p>
            </div>
          ) : (
            account.addresses.map((addr) => (
              <div key={addr.id} className="border-ih-border bg-ih-surface rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[13px] font-medium">{addr.label}</span>
                      <span className="bg-ih-bg text-ih-muted px-1.5 py-0.5 text-[11px] capitalize tabular-nums">
                        {addr.kind.replace('_', '-')}
                      </span>
                      {addr.isDefaultShip && (
                        <span className="bg-ih-success-soft text-ih-success-ink px-1.5 py-0.5 text-[11px] tabular-nums">
                          Default Ship
                        </span>
                      )}
                      {addr.isDefaultBill && (
                        <span className="bg-ih-success-soft text-ih-success-ink px-1.5 py-0.5 text-[11px] tabular-nums">
                          Default Bill
                        </span>
                      )}
                    </div>
                    {addr.attention && (
                      <div className="text-ih-muted mb-0.5 text-[12px]">Attn: {addr.attention}</div>
                    )}
                    {(addr.lines as string[]).map((l, i) => (
                      <div key={i} className="text-[13px]">
                        {l}
                      </div>
                    ))}
                    <div className="text-[13px]">
                      {addr.city}
                      {addr.region ? `, ${addr.region}` : ''} {addr.postalCode}
                    </div>
                    <div className="text-[13px]">{addr.countryCode}</div>
                    {addr.phone && (
                      <div className="text-ih-muted mt-1 text-[11px] tabular-nums">
                        {addr.phone}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {account.requiresAddressApproval && !addr.approvedAt ? (
                      <div className="flex flex-col items-end gap-2">
                        <span className="bg-ih-warning-soft px-2 py-0.5 text-[11px] text-[oklch(0.5_0.08_60)] tabular-nums">
                          Pending Approval
                        </span>
                        <form
                          action={async () => {
                            'use server'
                            await approveAddress(addr.id, account.id)
                          }}
                        >
                          <button
                            type="submit"
                            className="text-ih-accent text-[11px] tabular-nums hover:underline"
                          >
                            Approve →
                          </button>
                        </form>
                      </div>
                    ) : addr.approvedAt ? (
                      <div className="text-ih-muted text-[11px] tabular-nums">
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
            <p className="text-ih-muted text-[13px]">No emails sent for this account yet.</p>
          ) : (
            <div className="border-ih-border bg-ih-surface rounded-lg border">
              <div className="border-ih-border text-ih-muted grid grid-cols-[140px_140px_1fr_120px_100px] gap-3 border-b px-4 py-2.5 text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
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
                    ? 'text-ih-success-ink bg-ih-success-soft'
                    : e.status === 'sandboxed'
                      ? 'text-[oklch(0.5_0.08_240)] bg-[oklch(0.94_0.04_240)]'
                      : e.status === 'failed'
                        ? 'text-ih-danger-ink bg-ih-danger-soft'
                        : 'text-ih-muted bg-ih-surface-2'
                return (
                  <div
                    key={e.id}
                    className="border-ih-border grid grid-cols-[140px_140px_1fr_120px_100px] items-start gap-3 border-b px-4 py-3 text-[12px] last:border-0"
                  >
                    <span className="text-ih-muted tabular-nums">
                      {new Date(e.attemptedAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-ih-ink-2 text-[11px] tabular-nums">
                      {e.kind.replace(/_/g, ' ')}
                    </span>
                    <div>
                      <div className="text-ih-ink truncate" title={e.subject}>
                        {e.subject}
                      </div>
                      {recipients.length > 0 && (
                        <div className="text-ih-muted truncate text-[11px] tabular-nums">
                          {recipients.join(', ')}
                        </div>
                      )}
                      {e.status === 'failed' && e.error && (
                        <div
                          className="text-ih-danger-ink mt-0.5 truncate text-[11px] tabular-nums"
                          title={e.error}
                        >
                          {e.error}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] tabular-nums">
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
                      className={`inline-block w-fit px-2 py-0.5 text-[11px] font-medium capitalize tabular-nums ${statusColor}`}
                    >
                      {e.status}
                    </span>
                  </div>
                )
              })}
              {totalEmailPages > 1 && (
                <div className="border-ih-border text-ih-muted flex items-center justify-between gap-3 border-t px-4 py-2.5 text-[11px] tabular-nums">
                  <span>
                    Showing {(safeEmailsPage - 1) * EMAILS_PAGE_SIZE + 1}–
                    {Math.min(safeEmailsPage * EMAILS_PAGE_SIZE, sentEmailsTotal)} of{' '}
                    {sentEmailsTotal}
                  </span>
                  <div className="flex items-center gap-2">
                    {safeEmailsPage > 1 ? (
                      <Link
                        href={`/admin/customers/${id}?tab=emails&emailsPage=${safeEmailsPage - 1}`}
                        className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 rounded-lg border px-2 py-1 transition-colors"
                      >
                        ← Prev
                      </Link>
                    ) : (
                      <span className="border-ih-border text-ih-muted-2 rounded-lg border px-2 py-1">
                        ← Prev
                      </span>
                    )}
                    <span>
                      page {safeEmailsPage} / {totalEmailPages}
                    </span>
                    {safeEmailsPage < totalEmailPages ? (
                      <Link
                        href={`/admin/customers/${id}?tab=emails&emailsPage=${safeEmailsPage + 1}`}
                        className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 rounded-lg border px-2 py-1 transition-colors"
                      >
                        Next →
                      </Link>
                    ) : (
                      <span className="border-ih-border text-ih-muted-2 rounded-lg border px-2 py-1">
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
              placeholder="Add a note visible to all staff…"
              className="mb-2 resize-none"
            />
            <button
              type="submit"
              className="bg-ih-navy text-ih-bg h-9 px-5 text-[12px] tabular-nums transition-colors hover:bg-[var(--color-ih-ink-2)]"
            >
              Add Note
            </button>
          </form>

          {/* Activity feed */}
          <div className="flex flex-col gap-3">
            {account.activity.map((entry) => {
              const payload = entry.payload as Record<string, unknown>
              return (
                <div key={entry.id} className="flex gap-3">
                  <div className="border-ih-border bg-ih-bg text-ih-muted mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border text-[11px] tabular-nums">
                    {entry.actorType === 'staff' ? 'ST' : 'CT'}
                  </div>
                  <div className="border-ih-border flex-1 border-b pb-3">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-ih-ink text-[11px] font-medium capitalize tabular-nums">
                        {entry.verb.replace(/_/g, ' ')}
                      </span>
                      <span className="text-ih-muted text-[11px] tabular-nums">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {typeof payload.body === 'string' && (
                      <p className="text-ih-ink-2 text-[13px] leading-[1.5]">{payload.body}</p>
                    )}
                    {typeof payload.rfqId === 'string' && typeof payload.code === 'string' && (
                      <p className="text-ih-muted text-[12px] tabular-nums">
                        RFQ:{' '}
                        <Link
                          href={`/admin/rfqs/${payload.code}`}
                          className="text-ih-accent hover:underline"
                        >
                          {payload.code}
                        </Link>
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
    </AdminPageShell>
  )
}
