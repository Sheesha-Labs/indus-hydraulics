import { Trash2 } from 'lucide-react'
import { db, Prisma } from '@indus/db'
import { DataTable, EmptyState, Field, Input, NavTabs, Pagination, Panel, StatusPill, type StatusTone } from '@indus/ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import AdminPageShell from '../../../../../../components/admin/AdminPageShell'
import ActionButton from '../../../../../../components/admin/newsletter/ActionButton'
import ActionForm from '../../../../../../components/admin/newsletter/ActionForm'
import DownloadCsvButton from '../../../../../../components/admin/newsletter/DownloadCsvButton'
import ImportPanel from '../../../../../../components/admin/newsletter/ImportPanel'
import NewsletterTabs from '../../../../../../components/admin/newsletter/NewsletterTabs'
import { LIST_IMPORT_CONSENT, describeImport } from '../../../../../../lib/newsletter/admin'
import { ROLES, hasRole } from '../../../../../../lib/rbac'
import { requireStaffRole } from '../../../../../../lib/staff-session'
import {
  addContactAction,
  deleteListAction,
  exportListAction,
  importContactsAction,
  removeContactAction,
  unsubscribeContactAction,
  updateListAction,
} from '../../actions'

export const metadata: Metadata = { title: 'Newsletter list — Indus Admin' }
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}

const PAGE_SIZE = 50
const STATUSES = ['active', 'unsubscribed', 'bounced'] as const
type ContactStatus = (typeof STATUSES)[number]
const STATUS_LABEL: Record<ContactStatus, string> = { active: 'Can be mailed', unsubscribed: 'Unsubscribed', bounced: 'Bounced' }
const STATUS_TONE: Record<ContactStatus, StatusTone> = { active: 'success', unsubscribed: 'neutral', bounced: 'danger' }

export default async function NewsletterListPage({ params, searchParams }: Props) {
  const session = await requireStaffRole(ROLES.NEWSLETTER_WRITE)
  const canSend = hasRole(session, ROLES.NEWSLETTER_SEND)
  const { id } = await params
  const sp = await searchParams

  const list = await db.newsletterList.findUnique({
    where: { id },
    select: { id: true, name: true, description: true, createdAt: true },
  })
  if (!list) notFound()

  const status = (STATUSES as readonly string[]).includes(sp.status ?? '') ? (sp.status as ContactStatus) : null
  const q = (sp.q ?? '').trim()
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const base: Prisma.NewsletterListContactWhereInput = {
    listId: id,
    ...(q ? { OR: [{ email: { contains: q.toLowerCase() } }, { name: { contains: q, mode: 'insensitive' } }] } : {}),
  }
  const where = status ? { ...base, status } : base

  const [groups, total, contacts, imports] = await Promise.all([
    db.newsletterListContact.groupBy({ by: ['status'], where: base, _count: { _all: true } }),
    db.newsletterListContact.count({ where }),
    db.newsletterListContact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, email: true, name: true, status: true, source: true, createdAt: true },
    }),
    db.newsletterListImport.findMany({
      where: { listId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        fileName: true,
        createdAt: true,
        rows: true,
        added: true,
        alreadyOnList: true,
        suppressed: true,
        invalid: true,
        duplicates: true,
        truncated: true,
        importedBy: { select: { name: true } },
      },
    }),
  ])
  const count = (s: ContactStatus) => groups.find((g) => g.status === s)?._count._all ?? 0
  const all = groups.reduce((n, g) => n + g._count._all, 0)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const path = `/admin/newsletter/lists/${id}`

  function url(overrides: Record<string, string | undefined>) {
    const merged: Record<string, string | undefined> = {
      status: status ?? undefined,
      q: q || undefined,
      page: page === 1 ? undefined : String(page),
      ...overrides,
    }
    const qs = new URLSearchParams(Object.entries(merged).filter((e): e is [string, string] => Boolean(e[1]))).toString()
    return `${path}${qs ? `?${qs}` : ''}`
  }

  return (
    <AdminPageShell
      title={list.name}
      sub={`${count('active').toLocaleString('en-US')} can be mailed · ${all.toLocaleString('en-US')} on the list`}
      actions={
        canSend ? (
          <>
            <DownloadCsvButton action={exportListAction.bind(null, id)} />
            <ActionButton
              action={deleteListAction.bind(null, id)}
              kind="danger"
              size="dense"
              icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
              confirm={`Delete “${list.name}” and all ${all.toLocaleString('en-US')} addresses on it? This cannot be undone. Anyone who unsubscribed stays suppressed.`}
            >
              Delete list
            </ActionButton>
          </>
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        <NewsletterTabs active="lists" />
        <Link href="/admin/newsletter/lists" className="text-[13px] text-ih-muted hover:text-ih-ink">
          ← All lists
        </Link>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <h2 className="mb-3 text-[15px] font-medium text-ih-ink">Details</h2>
            <ActionForm action={updateListAction.bind(null, id)} submitLabel="Save">
              <Field label="Name" className="min-w-[220px] flex-1">
                <Input name="name" required maxLength={120} defaultValue={list.name} />
              </Field>
              <Field label="Description" className="w-full">
                <Input name="description" maxLength={400} defaultValue={list.description} />
              </Field>
            </ActionForm>
          </Panel>

          <Panel>
            <h2 className="mb-3 text-[15px] font-medium text-ih-ink">Add one address</h2>
            <ActionForm action={addContactAction.bind(null, id)} submitLabel="Add" pendingLabel="Adding…" resetOnSuccess>
              <Field label="Email" className="min-w-[220px] flex-1">
                <Input name="email" type="email" required maxLength={254} autoComplete="off" />
              </Field>
              <Field label="Name (optional)" className="min-w-[180px] flex-1">
                <Input name="name" maxLength={120} autoComplete="off" />
              </Field>
            </ActionForm>
          </Panel>
        </div>

        {canSend ? (
          <Panel>
            <h2 className="mb-1 text-[15px] font-medium text-ih-ink">Upload a file</h2>
            <p className="mb-3 max-w-[70ch] text-[13.5px] text-ih-ink-2">
              Only the email and name columns leave your computer. Addresses already on this list are left as they are, so
              an upload never re-adds someone who unsubscribed.
            </p>
            <ImportPanel listId={id} action={importContactsAction} consentText={LIST_IMPORT_CONSENT} />
          </Panel>
        ) : null}

        <form method="GET" action={path} className="flex flex-wrap items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search email or name"
            aria-label="Search this list"
            className="h-9 w-64 rounded-lg border border-ih-border bg-ih-surface px-2.5 text-[14px] text-ih-ink outline-none placeholder:text-ih-muted focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft"
          />
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <button type="submit" className="h-9 rounded-lg bg-ih-navy px-4 text-[14px] font-medium text-ih-bg hover:bg-ih-ink">
            Search
          </button>
        </form>

        <NavTabs
          variant="chip"
          label="Filter by status"
          items={[
            { href: url({ status: undefined, page: undefined }), active: !status, label: 'All', count: all },
            ...STATUSES.map((s) => ({ href: url({ status: s, page: undefined }), active: status === s, label: STATUS_LABEL[s], count: count(s) })),
          ]}
        />

        <DataTable
          minWidth="lg"
          rows={contacts}
          rowKey={(c) => c.id}
          columns={[
            { key: 'email', header: 'Email', width: '35%', cell: (c) => <span className="tabular-nums text-ih-ink">{c.email}</span> },
            { key: 'name', header: 'Name', cell: (c) => <span className="text-ih-ink-2">{c.name || '—'}</span> },
            {
              key: 'status',
              header: 'Status',
              cell: (c) => <StatusPill tone={STATUS_TONE[c.status as ContactStatus]}>{STATUS_LABEL[c.status as ContactStatus]}</StatusPill>,
            },
            { key: 'source', header: 'Added', cell: (c) => <span className="tabular-nums text-ih-ink-2">{c.createdAt.toISOString().slice(0, 10)} · {c.source}</span> },
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              cell: (c) => (
                <div className="flex flex-wrap justify-end gap-1">
                  {c.status === 'active' ? (
                    <ActionButton
                      action={unsubscribeContactAction.bind(null, id, c.id)}
                      confirm={`Unsubscribe ${c.email}? They will not be mailed again from any list or the newsletter.`}
                      aria-label={`Unsubscribe ${c.email}`}
                    >
                      Unsubscribe
                    </ActionButton>
                  ) : null}
                  <ActionButton
                    action={removeContactAction.bind(null, id, c.id)}
                    confirm={`Remove ${c.email} from this list? This does not unsubscribe them.`}
                    aria-label={`Remove ${c.email} from the list`}
                    trash
                  >
                    Remove
                  </ActionButton>
                </div>
              ),
            },
          ]}
          emptyState={
            <EmptyState
              condition={q || status ? 'NO MATCHES' : 'EMPTY LIST'}
              message={q || status ? 'Nobody on this list matches.' : 'Add an address above, or upload a file.'}
            />
          }
        />

        {totalPages > 1 ? (
          <Pagination currentPage={page} totalPages={totalPages} buildUrl={(n) => url({ page: n === 1 ? undefined : String(n) })} linkComponent={Link} />
        ) : null}

        {imports.length > 0 ? (
          <section aria-labelledby="imports-heading" className="flex flex-col gap-2">
            <h2 id="imports-heading" className="text-[15px] font-medium text-ih-ink">
              Uploads
            </h2>
            <ul className="flex flex-col gap-1 text-[13.5px] text-ih-ink-2">
              {imports.map((i) => (
                <li key={i.id}>
                  <span className="tabular-nums">{i.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</span>
                  {' · '}
                  {i.fileName || 'file'} by {i.importedBy?.name ?? 'a former user'}: {describeImport(i)}.
                </li>
              ))}
            </ul>
            <p className="text-[12.5px] text-ih-muted">Each upload records who made it and the consent statement they confirmed.</p>
          </section>
        ) : null}
      </div>
    </AdminPageShell>
  )
}
