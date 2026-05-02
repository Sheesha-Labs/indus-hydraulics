import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import AdminTopbar from '../../../components/AdminTopbar'

export const metadata: Metadata = { title: 'CMS — Indus Admin' }

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<{ tab?: string }>
}

export default async function CmsPage({ params, searchParams }: Props) {
  await params
  const sp = await searchParams
  const tab = sp.tab ?? 'blog'

  const [posts, pages] = await Promise.all([
    db.blogPost.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { publishedAt: 'desc' },
    }),
    db.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } }),
  ])

  const TABS = [
    { key: 'blog', label: `Blog Posts (${posts.length})` },
    { key: 'pages', label: `Static Pages (${pages.length})` },
  ]

  return (
    <>
      <AdminTopbar crumbs={[{ label: 'Content' }, { label: 'Pages & Blog' }]} />

      <div className="px-8 py-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Content Management</h1>
        {tab === 'blog' && (
          <Link href={`/cms/blog/new`} className="h-9 px-4 flex items-center bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90">
            + New Post
          </Link>
        )}
        {tab === 'pages' && (
          <Link href={`/cms/pages/new`} className="h-9 px-4 flex items-center bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90">
            + New Page
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] mb-6">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/cms?tab=${t.key}`}
            className={`px-4 py-2.5 font-mono text-[12px] border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-primary)]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === 'blog' && (
        <div className="border border-[var(--color-border)]">
          {posts.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-muted)]">No blog posts yet.</div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_120px_100px_100px_80px] px-4 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
                <div>Title</div>
                <div>Author</div>
                <div className="text-center">Status</div>
                <div className="text-right">Published</div>
                <div />
              </div>
              {posts.map((post, i) => (
                <div key={post.id} className={`grid grid-cols-[1fr_120px_100px_100px_80px] px-4 py-3.5 items-center bg-[var(--color-elevated)] ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--color-primary)]">{post.title}</div>
                    <div className="font-mono text-[11px] text-[var(--color-muted)]">/blog/{post.slug}</div>
                  </div>
                  <div className="text-[12px] text-[var(--color-body)] truncate">{post.author?.name ?? '—'}</div>
                  <div className="flex justify-center">
                    <span className={`px-2 py-0.5 font-mono text-[10px] font-semibold ${post.isPublished ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]' : 'text-[var(--color-muted)] bg-[var(--color-deep)]'}`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-right font-mono text-[12px] text-[var(--color-muted)]">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/cms/blog/${post.id}`} className="font-mono text-[11px] text-[var(--color-accent)] hover:underline">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'pages' && (
        <div className="border border-[var(--color-border)]">
          {pages.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-muted)]">No pages yet.</div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_100px_100px_80px] px-4 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
                <div>Title</div>
                <div className="text-center">Status</div>
                <div className="text-right">Updated</div>
                <div />
              </div>
              {pages.map((page, i) => (
                <div key={page.id} className={`grid grid-cols-[1fr_100px_100px_80px] px-4 py-3.5 items-center bg-[var(--color-elevated)] ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--color-primary)]">{page.title}</div>
                    <div className="font-mono text-[11px] text-[var(--color-muted)]">/{page.slug}</div>
                  </div>
                  <div className="flex justify-center">
                    <span className={`px-2 py-0.5 font-mono text-[10px] font-semibold ${page.isPublished ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]' : 'text-[var(--color-muted)] bg-[var(--color-deep)]'}`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-right font-mono text-[12px] text-[var(--color-muted)]">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/cms/pages/${page.id}`} className="font-mono text-[11px] text-[var(--color-accent)] hover:underline">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
      </div>
    </>
  )
}
