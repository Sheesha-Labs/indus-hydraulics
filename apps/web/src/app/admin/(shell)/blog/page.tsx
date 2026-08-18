import type { Metadata } from 'next'
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

const COLUMNS = 'grid grid-cols-[minmax(0,1fr)_110px_150px_130px_90px_80px] gap-3'

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
      title="Blog Editor"
      sub={
        trashed
          ? `${trashCount} post${trashCount === 1 ? '' : 's'} in the trash`
          : `${liveTotal} post${liveTotal === 1 ? '' : 's'}`
      }
      actions={
        <Link
          href="/admin/blog/new"
          className="flex h-9 items-center rounded-md bg-ih-accent px-4 font-mono text-[12px] text-ih-accent-fg transition-opacity hover:bg-ih-accent-hover"
        >
          + New Post
        </Link>
      }
    >
      {/* Articles / Trash — a view switch, not a filter, so it sits apart from
          the status chips below it. */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-ih-border bg-ih-bg p-0.5">
          <Link
            href={href({ view: undefined, status: undefined })}
            aria-current={trashed ? undefined : 'page'}
            className={`flex h-7 items-center rounded px-3 font-mono text-[11.5px] transition-colors ${
              trashed ? 'text-ih-muted hover:text-ih-ink' : 'bg-ih-navy font-medium text-ih-bg'
            }`}
          >
            Articles
          </Link>
          <Link
            href={href({ view: 'trash', status: undefined })}
            aria-current={trashed ? 'page' : undefined}
            className={`flex h-7 items-center gap-1.5 rounded px-3 font-mono text-[11.5px] transition-colors ${
              trashed ? 'bg-ih-navy font-medium text-ih-bg' : 'text-ih-muted hover:text-ih-ink'
            }`}
          >
            Trash
            <span className={trashed ? 'text-ih-bg/70' : 'text-ih-muted-2'}>{trashCount}</span>
          </Link>
        </div>

        <form action="/admin/blog" className="flex items-center gap-2">
          {trashed && <input type="hidden" name="view" value="trash" />}
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <label htmlFor="blog-q" className="sr-only">
            Search posts
          </label>
          <input
            id="blog-q"
            name="q"
            defaultValue={query}
            placeholder="Search title or slug…"
            className="h-8 w-[240px] rounded-md border border-ih-border bg-ih-surface px-2.5 text-[12.5px] outline-none focus:border-ih-accent"
          />
          <button
            type="submit"
            className="h-8 rounded-md bg-ih-navy px-3 text-[12px] font-medium text-ih-bg hover:bg-ih-ink"
          >
            Search
          </button>
          {query && (
            <Link
              href={href({ q: undefined })}
              className="font-mono text-[11px] text-ih-muted underline underline-offset-2 hover:text-ih-ink"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {!trashed && (
        <div className="mb-5 flex flex-wrap items-center gap-1.5">
          <StatusChip href={href({ status: undefined })} active={!statusFilter} label="All" count={liveTotal} />
          {(['published', 'draft', 'archived'] as const).map((s) => (
            <StatusChip
              key={s}
              href={href({ status: s })}
              active={statusFilter === s}
              label={STATUS_LABEL[s]}
              count={countFor(s)}
            />
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-lg border border-ih-border py-16 text-center">
          <p className="mb-3 text-ih-muted">
            {trashed
              ? 'Trash is empty. Posts you delete land here first.'
              : query || statusFilter
                ? 'No posts match these filters.'
                : 'No blog posts yet.'}
          </p>
          {!trashed && (
            <Link
              href="/admin/blog/new"
              className="inline-flex h-9 items-center rounded-md bg-ih-accent px-4 text-[13px] font-medium text-ih-accent-fg hover:bg-ih-accent-hover"
            >
              + Write your first post
            </Link>
          )}
        </div>
      ) : (
        <div className="border border-ih-border bg-ih-surface">
          <div
            className={`${COLUMNS} border-b border-ih-border bg-ih-bg px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted`}
          >
            <div>Title</div>
            <div className="text-center">Status</div>
            <div>Category</div>
            <div>Author</div>
            <div className="text-right">Updated</div>
            <div className="text-right">Actions</div>
          </div>
          {posts.map((post, i) => {
            const status: PublishStatus = displayStatus(post.status, post.isPublished)
            return (
              <div
                key={post.id}
                className={`${COLUMNS} items-center px-4 py-3.5 ${
                  i > 0 ? 'border-t border-ih-border' : ''
                }`}
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="block truncate text-[13px] font-medium text-ih-ink hover:text-ih-accent"
                  >
                    {post.title}
                  </Link>
                  <div className="truncate font-mono text-[11px] text-ih-muted">/blog/{post.slug}</div>
                </div>
                <div className="flex justify-center">
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-medium ${STATUS_STYLE[status]}`}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <div className="truncate text-[12.5px] text-ih-ink-2">
                  {post.category?.name ?? '—'}
                </div>
                <div className="truncate text-[12.5px] text-ih-ink-2">
                  {post.blogAuthor?.name ?? post.author?.name ?? '—'}
                </div>
                <div className="text-right font-mono text-[11.5px] text-ih-muted">
                  {relative(post.updatedAt)}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {status === 'published' && !trashed && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-ih-accent hover:underline"
                    >
                      View ↗
                    </Link>
                  )}
                  <BlogRowActions
                    id={post.id}
                    title={post.title}
                    archived={post.status === 'archived'}
                    trashed={trashed}
                    canDestroy={canDestroy}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminPageShell>
  )
}

function StatusChip({
  href,
  active,
  label,
  count,
}: {
  href: string
  active: boolean
  label: string
  count: number
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 font-mono text-[11px] transition-colors ${
        active
          ? 'border-ih-accent bg-ih-accent-soft text-ih-accent'
          : 'border-ih-border text-ih-muted hover:border-ih-border-strong hover:text-ih-ink'
      }`}
    >
      {label}
      <span className={active ? 'text-ih-accent' : 'text-ih-muted-2'}>{count}</span>
    </Link>
  )
}
