import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { db, type Prisma } from '@indus/db'
import { SERVICE_CASE_CATEGORY_LABELS } from '@indus/domain'
import { ExternalLink, ImageIcon, Search, Star } from 'lucide-react'
import {
  Button,
  Input,
  Panel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@indus/ui'
import AdminPageShell from '../../../../components/admin/AdminPageShell'
import { STATUS_LABEL, STATUS_STYLE } from '../../../../lib/blog-status'
import { mediaUrl } from '../../../../lib/media'

export const metadata: Metadata = { title: 'Service cases — Indus Admin' }

/**
 * Every case, whatever its status — the point of the screen is to reach the
 * ones that are not live, so filtering to published by default would defeat it.
 */
export const dynamic = 'force-dynamic'

const STATUSES = ['published', 'draft', 'archived'] as const
type Status = (typeof STATUSES)[number]

type Props = { searchParams: Promise<{ status?: string; q?: string }> }

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function ServiceCasesPage({ searchParams }: Props) {
  const sp = await searchParams
  const statusFilter = STATUSES.find((s) => s === sp.status)
  const query = (sp.q ?? '').trim()

  const where: Prisma.ServiceCaseWhereInput = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { slug: { contains: query, mode: 'insensitive' as const } },
            { caseNumber: { contains: query } },
          ],
        }
      : {}),
  }

  const [cases, counts] = await Promise.all([
    db.serviceCase.findMany({
      where,
      orderBy: [{ publishedAt: { sort: 'desc', nulls: 'first' } }, { caseNumber: 'desc' }],
      select: {
        id: true,
        slug: true,
        caseNumber: true,
        title: true,
        status: true,
        category: true,
        isFeatured: true,
        publishedAt: true,
        cardTagLabel: true,
        heroImage: { select: { storagePath: true } },
      },
    }),
    db.serviceCase.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  const countFor = (s: Status) => counts.find((c) => c.status === s)?._count._all ?? 0
  const total = counts.reduce((n, c) => n + c._count._all, 0)
  const shown = query ? cases.length : statusFilter ? countFor(statusFilter) : total

  function href(next: { status?: string; q?: string }) {
    const p = new URLSearchParams()
    const status = 'status' in next ? next.status : statusFilter
    const q = 'q' in next ? next.q : query
    if (status) p.set('status', status)
    if (q) p.set('q', q)
    const qs = p.toString()
    return qs ? `/admin/services?${qs}` : '/admin/services'
  }

  return (
    <AdminPageShell
      title="Service cases"
      breadcrumbs="Content · Service cases"
      actions={
        <Button asChild kind="outline" size="dense">
          <a href="/services" target="_blank" rel="noreferrer">
            View on site
            <ExternalLink size={13} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Filter by status" className="inline-flex rounded-md border border-ih-border bg-ih-surface p-0.5">
            <SegmentLink href={href({ status: undefined })} active={!statusFilter} count={total}>
              All
            </SegmentLink>
            {STATUSES.map((s) => (
              <SegmentLink key={s} href={href({ status: s })} active={statusFilter === s} count={countFor(s)}>
                {STATUS_LABEL[s]}
              </SegmentLink>
            ))}
          </nav>

          <p className="text-[13px] text-ih-muted">
            {shown} {shown === 1 ? 'case' : 'cases'}
            {query ? ' found' : ''}
          </p>

          <form action="/admin/services" role="search" className="ml-auto flex items-center gap-2">
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            <label htmlFor="services-q" className="sr-only">
              Search cases by title, slug or case number
            </label>
            <span className="relative">
              <Search
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ih-muted"
              />
              <Input
                id="services-q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search title or case no."
                className="w-[260px] pl-9"
              />
            </span>
            {query && (
              <Link href={href({ q: undefined })} className="text-[12.5px] text-ih-muted hover:text-ih-ink">
                Clear
              </Link>
            )}
          </form>
        </div>

        {cases.length === 0 ? (
          <Panel padding="empty">
            <p className="text-ih-muted">
              {query || statusFilter ? 'No cases match these filters.' : 'No service cases yet.'}
            </p>
          </Panel>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[52%] text-ih-ink">Case</TableHead>
                <TableHead className="text-ih-ink">Status</TableHead>
                <TableHead className="text-ih-ink">Category</TableHead>
                <TableHead className="text-ih-ink">Published</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => {
                const status = c.status as Status
                const thumb = c.heroImage?.storagePath ? mediaUrl(c.heroImage.storagePath) : null
                return (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-0 py-3">
                      <Link href={`/admin/services/${c.id}`} className="group flex min-w-0 items-center gap-3">
                        {/* Service cases are photo-led on the site; the thumb
                            is how you recognise one at a glance. */}
                        <span className="grid h-10 w-14 shrink-0 place-items-center overflow-hidden rounded-md border border-ih-border bg-ih-surface-2">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <ImageIcon size={15} strokeWidth={1.5} aria-hidden="true" className="text-ih-muted" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-[14px] font-medium text-ih-ink transition-colors group-hover:text-ih-accent">
                              {c.title}
                            </span>
                            {c.isFeatured ? (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ih-warning-soft px-2 py-0.5 text-[11px] font-medium text-ih-warning-ink">
                                <Star size={11} strokeWidth={2} aria-hidden="true" />
                                Case of the week
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block truncate text-[12px] text-ih-muted">
                            <span className="tabular-nums">Case {c.caseNumber}</span> · /services/{c.slug}
                          </span>
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex h-[22px] items-center rounded-full px-2 text-[11.5px] font-medium ${STATUS_STYLE[status]}`}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-[13px] text-ih-ink-2">
                      {SERVICE_CASE_CATEGORY_LABELS[c.category] ?? c.category}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[12.5px] tabular-nums text-ih-muted">
                      {c.publishedAt ? DATE.format(c.publishedAt) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {status === 'published' ? (
                        <a
                          href={`/services/${c.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View “${c.title}” on the site`}
                          title="View on the site"
                          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12.5px] text-ih-muted transition-colors hover:bg-ih-surface-2 hover:text-ih-ink"
                        >
                          View
                          <ExternalLink size={12} strokeWidth={1.8} aria-hidden="true" />
                        </a>
                      ) : null}
                    </TableCell>
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

function SegmentLink({
  href,
  active,
  count,
  children,
}: {
  href: string
  active: boolean
  count: number
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft ${
        active ? 'bg-ih-navy font-medium text-ih-bg' : 'text-ih-ink-2 hover:bg-ih-surface-2 hover:text-ih-ink'
      }`}
    >
      {children}
      <span className={`tabular-nums text-[11.5px] ${active ? 'text-ih-bg/75' : 'text-ih-muted'}`}>{count}</span>
    </Link>
  )
}
