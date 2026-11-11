import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { db } from '@indus/db'
import { ClipboardPaste, Globe, Phone, Plus, Search } from 'lucide-react'
import { Button, Input, KpiTile, Panel, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@indus/ui'

import AdminPageShell from '../../../../components/admin/AdminPageShell'
import {
  INBOX_SOURCES,
  INBOX_VIEWS,
  SOURCE_LABEL,
  STAGE_LABEL,
  STATUS_LABEL,
  VIEW_LABEL,
  dueLabel,
  inView,
  matchesQuery,
  sortInbox,
  stageOf,
  type InboxRow,
  type InboxSource,
  type InboxStage,
  type InboxView,
} from '../../../../lib/enquiry-inbox'
import { ROLES } from '../../../../lib/rbac'
import { requireStaffRole } from '../../../../lib/staff-session'

export const metadata: Metadata = { title: 'Enquiries — Indus Admin' }
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ source?: string; view?: string; q?: string }> }

const SOURCE_ICON: Record<InboxSource, typeof Globe> = { website: Globe, tender: ClipboardPaste, callback: Phone }

const STAGE_STYLE: Record<InboxStage, string> = {
  new: 'bg-ih-accent-soft text-ih-accent',
  working: 'bg-ih-warning-soft text-ih-warning-ink',
  quoted: 'bg-ih-steel-soft text-ih-info-ink',
  won: 'bg-ih-success-soft text-ih-success-ink',
  closed: 'bg-ih-surface-2 text-ih-muted',
}

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' })

/** Request time, read once per render of this dynamic page. */
function nowMs(): number {
  return Date.now()
}

function ago(d: Date, now: number): string {
  const mins = Math.floor((now - d.getTime()) / 60_000)
  if (mins < 60) return `${Math.max(mins, 1)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days < 30 ? `${days}d ago` : DATE.format(d)
}

/** Every inbound request — website RFQs, pasted tenders, call-backs — as one list. */
async function loadInbox(): Promise<InboxRow[]> {
  const [rfqs, enquiries, callbacks] = await Promise.all([
    db.rfq.findMany({
      where: { status: { not: 'draft' } },
      orderBy: { submittedAt: 'desc' },
      take: 300,
      select: {
        code: true,
        subject: true,
        status: true,
        urgency: true,
        submittedAt: true,
        createdAt: true,
        account: { select: { displayName: true, legalName: true } },
        submittedBy: { select: { firstName: true, lastName: true } },
        assignedEngineer: { select: { name: true } },
        assignedRep: { select: { name: true } },
        _count: { select: { lines: true } },
      },
    }),
    db.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: {
        code: true,
        title: true,
        status: true,
        buyerName: true,
        closingAt: true,
        createdAt: true,
        account: { select: { displayName: true } },
        assignedTo: { select: { name: true } },
        _count: { select: { lines: true } },
      },
    }),
    db.callbackLead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: { id: true, name: true, category: true, description: true, status: true, createdAt: true, deskOpen: true, assignedTo: { select: { name: true } } },
    }),
  ])

  return [
    ...rfqs.map(
      (r): InboxRow => ({
        key: `rfq:${r.code}`,
        source: 'website',
        ref: r.code,
        href: `/admin/rfqs/${r.code}`,
        subject: r.subject?.trim() || 'Quote request',
        customer:
          r.account.displayName ||
          r.account.legalName ||
          [r.submittedBy?.firstName, r.submittedBy?.lastName].filter(Boolean).join(' ') ||
          null,
        status: r.status,
        stage: stageOf('website', r.status),
        urgency: r.urgency,
        dueAt: null,
        lines: r._count.lines,
        receivedAt: r.submittedAt ?? r.createdAt,
        assignee: r.assignedEngineer?.name ?? r.assignedRep?.name ?? null,
      }),
    ),
    ...enquiries.map(
      (e): InboxRow => ({
        key: `enq:${e.code}`,
        source: 'tender',
        ref: e.code,
        href: `/admin/enquiries/${e.code}`,
        subject: e.title,
        customer: e.buyerName ?? e.account?.displayName ?? null,
        status: e.status,
        stage: stageOf('tender', e.status),
        urgency: null,
        dueAt: e.closingAt,
        lines: e._count.lines,
        receivedAt: e.createdAt,
        assignee: e.assignedTo?.name ?? null,
      }),
    ),
    ...callbacks.map(
      (c): InboxRow => ({
        key: `cb:${c.id}`,
        source: 'callback',
        ref: `CB-${c.id.slice(0, 6).toUpperCase()}`,
        href: `/admin/enquiries/callbacks/${c.id}`,
        subject: c.description?.trim() ? c.description.trim().slice(0, 120) : c.category ? `Call back about ${c.category.replace(/_/g, ' ')}` : 'Call me back',
        customer: c.name,
        status: c.status,
        stage: stageOf('callback', c.status),
        urgency: null,
        dueAt: null,
        lines: null,
        receivedAt: c.createdAt,
        assignee: c.assignedTo?.name ?? null,
      }),
    ),
  ]
}

export default async function EnquiriesPage({ searchParams }: Props) {
  await requireStaffRole(ROLES.ANY_STAFF)
  const sp = await searchParams
  const source = INBOX_SOURCES.find((s) => s === sp.source)
  const view: InboxView = INBOX_VIEWS.find((v) => v === sp.view) ?? 'open'
  const query = (sp.q ?? '').trim()
  const now = nowMs()

  const all = await loadInbox()
  const bySource = source ? all.filter((r) => r.source === source) : all
  const rows = sortInbox(
    bySource.filter((r) => inView(r.stage, view) && matchesQuery(r, query)),
    now,
  )

  const openOf = (list: InboxRow[]) => list.filter((r) => inView(r.stage, 'open')).length
  const counts = {
    new: all.filter((r) => r.stage === 'new').length,
    urgent: all.filter((r) => inView(r.stage, 'open') && (r.urgency === 'plant_down' || r.urgency === 'priority')).length,
    closing: all.filter((r) => inView(r.stage, 'open') && r.dueAt && r.dueAt.getTime() - now <= 7 * 86_400_000 && r.dueAt.getTime() >= now).length,
    quoted: all.filter((r) => r.stage === 'quoted').length,
  }

  function href(next: { source?: string; view?: string; q?: string }) {
    const p = new URLSearchParams()
    const s = 'source' in next ? next.source : source
    const v = 'view' in next ? next.view : view
    const q = 'q' in next ? next.q : query
    if (s) p.set('source', s)
    if (v && v !== 'open') p.set('view', v)
    if (q) p.set('q', q)
    const qs = p.toString()
    return qs ? `/admin/enquiries?${qs}` : '/admin/enquiries'
  }

  return (
    <AdminPageShell
      title="Enquiries"
      breadcrumbs="Operations · Enquiries"
      actions={
        <Button asChild kind="primary" size="dense">
          <Link href="/admin/enquiries/new">
            <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
            Paste an enquiry
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Link href={href({ source: undefined, view: 'open', q: undefined })} className="block rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label="New" value={String(counts.new)} hint="not picked up yet" />
          </Link>
          <KpiTile label="Urgent" value={String(counts.urgent)} hint="priority or plant down" />
          <KpiTile label="Tenders closing" value={String(counts.closing)} hint="within 7 days" />
          <Link href={href({ view: 'quoted' })} className="block rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft">
            <KpiTile label="Quoted" value={String(counts.quoted)} hint="waiting on the customer" />
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Segmented label="Source">
            <SegmentLink href={href({ source: undefined })} active={!source} count={openOf(all)}>
              All
            </SegmentLink>
            {INBOX_SOURCES.map((s) => {
              const Icon = SOURCE_ICON[s]
              return (
                <SegmentLink key={s} href={href({ source: s })} active={source === s} count={openOf(all.filter((r) => r.source === s))}>
                  <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
                  {SOURCE_LABEL[s]}
                </SegmentLink>
              )
            })}
          </Segmented>

          <Segmented label="Stage">
            {INBOX_VIEWS.map((v) => (
              <SegmentLink key={v} href={href({ view: v })} active={view === v}>
                {VIEW_LABEL[v]}
              </SegmentLink>
            ))}
          </Segmented>

          <form action="/admin/enquiries" role="search" className="ml-auto flex items-center gap-2">
            {source && <input type="hidden" name="source" value={source} />}
            {view !== 'open' && <input type="hidden" name="view" value={view} />}
            <label htmlFor="enq-q" className="sr-only">
              Search by reference, subject or customer
            </label>
            <span className="relative">
              <Search size={14} strokeWidth={1.8} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ih-muted" />
              <Input id="enq-q" name="q" type="search" defaultValue={query} placeholder="Reference, subject or customer" className="w-[280px] pl-9" />
            </span>
            {query ? (
              <Link href={href({ q: undefined })} className="text-[12.5px] text-ih-muted hover:text-ih-ink">
                Clear
              </Link>
            ) : null}
          </form>
        </div>

        {rows.length === 0 ? (
          <Panel padding="empty">
            <p className="text-ih-muted">
              {query ? 'Nothing matches that search.' : view === 'open' ? 'Nothing waiting. Every enquiry has been picked up.' : 'No enquiries here.'}
            </p>
          </Panel>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44%] text-ih-ink">Enquiry</TableHead>
                <TableHead className="text-ih-ink">Stage</TableHead>
                <TableHead className="text-ih-ink">Urgency</TableHead>
                <TableHead numeric className="text-ih-ink">
                  Lines
                </TableHead>
                <TableHead className="text-ih-ink">Received</TableHead>
                <TableHead className="text-ih-ink">With</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const Icon = SOURCE_ICON[r.source]
                const due = dueLabel(r.dueAt, now)
                return (
                  <TableRow key={r.key}>
                    <TableCell className="max-w-0 py-3">
                      <Link href={r.href} className="group flex min-w-0 items-start gap-3">
                        <span
                          className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-ih-border bg-ih-surface-2 text-ih-ink-2"
                          title={SOURCE_LABEL[r.source]}
                        >
                          <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-medium text-ih-ink transition-colors group-hover:text-ih-accent">{r.subject}</span>
                          <span className="mt-0.5 block truncate text-[12px] text-ih-muted">
                            <span className="tabular-nums">{r.ref}</span>
                            {r.customer ? ` · ${r.customer}` : ''} · {SOURCE_LABEL[r.source]}
                          </span>
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex h-[22px] items-center rounded-full px-2 text-[11.5px] font-medium ${STAGE_STYLE[r.stage]}`}>{STAGE_LABEL[r.stage]}</span>
                      {(STATUS_LABEL[r.status] ?? r.status) !== STAGE_LABEL[r.stage] ? (
                        <span className="mt-1 block text-[11.5px] text-ih-muted">{STATUS_LABEL[r.status] ?? r.status}</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[12.5px]">
                      {r.urgency === 'plant_down' ? (
                        <span className="font-medium text-ih-danger-ink">Plant down</span>
                      ) : r.urgency === 'priority' ? (
                        <span className="font-medium text-ih-warning-ink">Priority</span>
                      ) : due ? (
                        <span className={due === 'Closed' ? 'text-ih-muted' : 'font-medium text-ih-warning-ink'}>{due}</span>
                      ) : (
                        <span className="text-ih-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell numeric className="text-[13px] text-ih-ink-2">
                      {r.lines ?? '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[12.5px] text-ih-muted" title={DATE.format(r.receivedAt)}>
                      {ago(r.receivedAt, now)}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-[13px] text-ih-ink-2">{r.assignee ?? <span className="text-ih-muted">Unassigned</span>}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminPageShell>
  )
}

function Segmented({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav aria-label={label} className="inline-flex flex-wrap rounded-md border border-ih-border bg-ih-surface p-0.5">
      {children}
    </nav>
  )
}

function SegmentLink({ href, active, count, children }: { href: string; active: boolean; count?: number; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft ${
        active ? 'bg-ih-navy font-medium text-ih-bg' : 'text-ih-ink-2 hover:bg-ih-surface-2 hover:text-ih-ink'
      }`}
    >
      {children}
      {count !== undefined ? <span className={`tabular-nums text-[11.5px] ${active ? 'text-ih-bg/75' : 'text-ih-muted'}`}>{count}</span> : null}
    </Link>
  )
}
