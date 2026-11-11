import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { db, type Prisma } from '@indus/db'
import AdminPageShell from '../../../../components/admin/AdminPageShell'
import { auth } from '../../../../lib/admin-auth'
import { hasRole, ROLES } from '../../../../lib/rbac'
import {
  STATUS_LABEL,
  STATUS_STYLE,
  displayStatus,
  type PublishStatus,
} from '../../../../lib/blog-status'
import BlogRowActions from './BlogRowActions'
import { ExternalLink, Plus, Search, Trash2 } from 'lucide-react'
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

export const metadata: Metadata = { title: 'Blog Editor — Indus Admin' }

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<{ status?: string; view?: string; q?: string }>
}

/**
 * Status is stored twice on `blog_posts` — the `status` enum and the older
 * `isPublished` boolean, kept in sync while every read site migrates across.
 * The list trusts the enum for the label but shows "Draft" for anything that
 * claims to be published while the boolean says otherwise, so a row can never
 * show a green pill for a post the site is not serving.
 */
function relative(date: Date | null): string {
  if (!date) return '—'
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (days < 1) return 'today'
  if (days < 2) return 'yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default async function AdminBlogListPage({ params, searchParams }: Props) {
  await params
  const sp = await searchParams
  const trashed = sp.view === 'trash'
  const statusFilter = (['draft', 'published', 'archived'] as const).find((s) => s === sp.status)
  const query = (sp.q ?? '').trim()

  const where: Prisma.BlogPostWhereInput = {
    deletedAt: trashed ? { not: null } : null,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { slug: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [posts, trashCount, statusCounts, session] = await Promise.all([
    db.blogPost.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 200,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        isPublished: true,
        updatedAt: true,
        publishedAt: true,
        category: { select: { name: true } },
        blogAuthor: { select: { name: true } },
        author: { select: { name: true } },
      },
    }),
    db.blogPost.count({ where: { deletedAt: { not: null } } }),
    db.blogPost.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    auth(),
  ])

  const countFor = (s: PublishStatus) =>
    statusCounts.find((c) => c.status === s)?._count._all ?? 0
  const liveTotal = statusCounts.reduce((n, c) => n + c._count._all, 0)
  const canDestroy = hasRole(session, ROLES.CATALOGUE_DELETE)
  // A search narrows the list past what the status counts know about, so the
  // count then reports the rows actually found.
  const shownTotal = query
    ? posts.length
    : trashed
      ? trashCount
      : statusFilter
        ? countFor(statusFilter)
        : liveTotal

  function href(next: { status?: string; view?: string; q?: string }) {
    const p = new URLSearchParams()
    const status = 'status' in next ? next.status : statusFilter
    const view = 'view' in next ? next.view : trashed ? 'trash' : undefined
    const q = 'q' in next ? next.q : query
    if (status) p.set('status', status)
    if (view) p.set('view', view)
    if (q) p.set('q', q)
    const qs = p.toString()
    return qs ? `/admin/blog?${qs}` : '/admin/blog'
  }

  return (
    <AdminPageShell
      title="Blog"
      breadcrumbs="Content · Blog editor"
      actions={
        <Button asChild kind="primary" size="dense">
          <Link href="/admin/blog/new">
            <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
            New post
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {/*
          One toolbar row, Bazar's order: the view switch (Articles / Trash),
          then the status filter as a second segmented control, the count as
          plain text, and search pushed to the right. The status chips used to
          be a separate row of bordered boxes that read as buttons of equal
          weight to the view switch.
        */}
        <div className="flex flex-wrap items-center gap-3">
          <Segmented label="View">
            <SegmentLink href={href({ view: undefined, status: undefined })} active={!trashed}>
              Articles
            </SegmentLink>
            <SegmentLink href={href({ view: 'trash', status: undefined })} active={trashed} count={trashCount}>
              <Trash2 size={12} strokeWidth={1.8} aria-hidden="true" />
              Trash
            </SegmentLink>
          </Segmented>

          {!trashed && (
            <Segmented label="Filter by status">
              <SegmentLink href={href({ status: undefined })} active={!statusFilter} count={liveTotal}>
                All
              </SegmentLink>
              {(['published', 'draft', 'archived'] as const).map((s) => (
                <SegmentLink key={s} href={href({ status: s })} active={statusFilter === s} count={countFor(s)}>
                  {STATUS_LABEL[s]}
                </SegmentLink>
              ))}
            </Segmented>
          )}

          <p className="text-[13px] text-ih-muted">
            {shownTotal} {shownTotal === 1 ? 'post' : 'posts'}
            {trashed ? ' in trash' : query ? ' found' : ''}
            {shownTotal > posts.length ? ` · showing the latest ${posts.length}` : ''}
          </p>

          <form action="/admin/blog" role="search" className="ml-auto flex items-center gap-2">
            {trashed && <input type="hidden" name="view" value="trash" />}
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            <label htmlFor="blog-q" className="sr-only">
              Search posts by title or slug
            </label>
            <span className="relative">
              <Search
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ih-muted"
              />
              <Input
                id="blog-q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search title or slug"
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

        {posts.length === 0 ? (
          <Panel padding="empty">
            <p className="text-ih-muted">
              {trashed
                ? 'Trash is empty. Posts you delete land here first.'
                : query || statusFilter
                  ? 'No posts match these filters.'
                  : 'No blog posts yet.'}
            </p>
            {!trashed && !query && !statusFilter && (
              <Button asChild kind="primary" size="dense" className="mt-4">
                <Link href="/admin/blog/new">
                  <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
                  Write the first post
                </Link>
              </Button>
            )}
          </Panel>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[46%] text-ih-ink">Title</TableHead>
                <TableHead className="text-ih-ink">Status</TableHead>
                <TableHead className="text-ih-ink">Category</TableHead>
                <TableHead className="text-ih-ink">Author</TableHead>
                <TableHead className="text-ih-ink">Updated</TableHead>
                <TableHead className="text-right text-ih-ink">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => {
                const status: PublishStatus = displayStatus(post.status, post.isPublished)
                return (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-0 py-3.5">
                      <Link href={`/admin/blog/${post.id}`} className="group block min-w-0">
                        <span className="block truncate text-[14px] font-medium text-ih-ink transition-colors group-hover:text-ih-accent">
                          {post.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-ih-muted">/blog/{post.slug}</span>
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
                      {post.category?.name ?? '—'}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-[13px] text-ih-ink-2">
                      {post.blogAuthor?.name ?? post.author?.name ?? '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[12.5px] text-ih-muted">
                      {relative(post.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-end gap-1">
                        {status === 'published' && !trashed && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`View “${post.title}” on the site`}
                            title="View on the site"
                            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12.5px] text-ih-muted transition-colors hover:bg-ih-surface-2 hover:text-ih-ink"
                          >
                            View
                            <ExternalLink size={12} strokeWidth={1.8} aria-hidden="true" />
                          </Link>
                        )}
                        <BlogRowActions
                          id={post.id}
                          title={post.title}
                          archived={post.status === 'archived'}
                          trashed={trashed}
                          canDestroy={canDestroy}
                        />
                      </span>
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

/** A rounded segmented control: Bazar's Articles / Trash switch. */
function Segmented({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav aria-label={label} className="inline-flex rounded-md border border-ih-border bg-ih-surface p-0.5">
      {children}
    </nav>
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
  count?: number
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
      {count !== undefined ? (
        <span className={`tabular-nums text-[11.5px] ${active ? 'text-ih-bg/75' : 'text-ih-muted'}`}>{count}</span>
      ) : null}
    </Link>
  )
}
