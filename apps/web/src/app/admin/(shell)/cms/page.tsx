import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import HomepageHeroPanel, { type HeroSlideRow } from './HomepageHeroPanel'
import AdminPageShell from '../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'CMS — Indus Admin' }

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<{ tab?: string }>
}

export default async function CmsPage({ params, searchParams }: Props) {
  await params
  const sp = await searchParams
  const tab = sp.tab ?? 'blog'

  const [posts, pages, heroSlides] = await Promise.all([
    db.blogPost.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { publishedAt: 'desc' },
    }),
    db.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } }),
    db.homepageHeroSlide.findMany({
      orderBy: { position: 'asc' },
      include: {
        media: {
          select: { id: true, storagePath: true, originalFilename: true, width: true, height: true },
        },
      },
    }) as Promise<HeroSlideRow[]>,
  ])

  const TABS = [
    { key: 'blog', label: `Blog Posts (${posts.length})` },
    { key: 'pages', label: `Static Pages (${pages.length})` },
    { key: 'hero', label: `Homepage Hero (${heroSlides.length})` },
  ]

  return (
    <AdminPageShell
      title="Content Management"
      actions={
        <>
          {tab === 'blog' && (
            <Link href={`/admin/cms/blog/new`} className="flex h-9 items-center rounded-md bg-ih-accent px-4 font-mono text-[12px] text-white transition-opacity hover:opacity-90">
              + New Post
            </Link>
          )}
          {tab === 'pages' && (
            <Link href={`/admin/cms/pages/new`} className="flex h-9 items-center rounded-md bg-ih-accent px-4 font-mono text-[12px] text-white transition-opacity hover:opacity-90">
              + New Page
            </Link>
          )}
        </>
      }
    >

      {/* Tabs */}
      <div className="flex border-b border-ih-border mb-6">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/cms?tab=${t.key}`}
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

      {tab === 'blog' && (
        <div className="border border-ih-border">
          {posts.length === 0 ? (
            <div className="py-12 text-center text-ih-muted">No blog posts yet.</div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_120px_100px_100px_80px] px-4 py-2.5 bg-ih-bg border-b border-ih-border font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted">
                <div>Title</div>
                <div>Author</div>
                <div className="text-center">Status</div>
                <div className="text-right">Published</div>
                <div />
              </div>
              {posts.map((post, i) => (
                <div key={post.id} className={`grid grid-cols-[1fr_120px_100px_100px_80px] px-4 py-3.5 items-center bg-ih-surface ${i > 0 ? 'border-t border-ih-border' : ''}`}>
                  <div>
                    <div className="text-[13px] font-medium text-ih-ink">{post.title}</div>
                    <div className="font-mono text-[11px] text-ih-muted">/blog/{post.slug}</div>
                  </div>
                  <div className="text-[12px] text-ih-ink-2 truncate">{post.author?.name ?? '—'}</div>
                  <div className="flex justify-center">
                    <span className={`px-2 py-0.5 font-mono text-[10px] font-semibold ${post.isPublished ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]' : 'text-ih-muted bg-ih-surface-2'}`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-right font-mono text-[12px] text-ih-muted">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/admin/cms/blog/${post.id}`} className="font-mono text-[11px] text-ih-accent hover:underline">
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
        <div className="border border-ih-border">
          {pages.length === 0 ? (
            <div className="py-12 text-center text-ih-muted">No pages yet.</div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_100px_100px_80px] px-4 py-2.5 bg-ih-bg border-b border-ih-border font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted">
                <div>Title</div>
                <div className="text-center">Status</div>
                <div className="text-right">Updated</div>
                <div />
              </div>
              {pages.map((page, i) => (
                <div key={page.id} className={`grid grid-cols-[1fr_100px_100px_80px] px-4 py-3.5 items-center bg-ih-surface ${i > 0 ? 'border-t border-ih-border' : ''}`}>
                  <div>
                    <div className="text-[13px] font-medium text-ih-ink">{page.title}</div>
                    <div className="font-mono text-[11px] text-ih-muted">/{page.slug}</div>
                  </div>
                  <div className="flex justify-center">
                    <span className={`px-2 py-0.5 font-mono text-[10px] font-semibold ${page.isPublished ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]' : 'text-ih-muted bg-ih-surface-2'}`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-right font-mono text-[12px] text-ih-muted">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/admin/cms/pages/${page.id}`} className="font-mono text-[11px] text-ih-accent hover:underline">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'hero' && <HomepageHeroPanel slides={heroSlides} />}
    </AdminPageShell>
  )
}
