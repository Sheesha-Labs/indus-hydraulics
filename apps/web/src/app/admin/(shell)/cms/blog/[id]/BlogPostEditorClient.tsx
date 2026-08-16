'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SeoEntityDrawer, {
  type SeoDrawerEntity,
} from '../../../../../../components/admin/seo/SeoEntityDrawer'
import type { RecentMedia } from '../../../../../../components/admin/seo/OgImagePicker'
import { savePost, updateBlogPostSeo, uploadBlogPostOgImage } from './actions'
import { Input, Textarea } from '@indus/ui'
import AdminPageShell from '../../../../../../components/admin/AdminPageShell'

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string
  tags: string[]
  isPublished: boolean
  publishedAt: string | null
  publicUrl: string

  /** Current hero image's resolved public URL (for Article JSON-LD preview). */
  heroImageUrl: string | null
  /** Author's display name (for Article JSON-LD preview). */
  authorName: string | null

  seoTitle: string | null
  seoDescription: string | null
  canonicalUrl: string | null
  focusKeyword: string | null
  robotsIndex: boolean
  robotsFollow: boolean
  ogImageMediaId: string | null
  ogImageStoragePath: string | null
  sitemapPriority: number | null
  sitemapChangeFreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
    | null
  excludeFromSitemap: boolean
  jsonLdOverride: string | null
}

interface Props {
  /** Whether this is the "new post" path (id === 'new'). */
  isNew: boolean
  /** Post data (only for the edit path; null on new). */
  post: BlogPost | null
  recentImages: RecentMedia[]
}

const TABS = [
  { id: 'content', label: 'Content' },
  { id: 'seo', label: 'SEO' },
] as const

type TabId = (typeof TABS)[number]['id']

/**
 * Tabbed BlogPost editor. Content tab houses the existing inline form
 * (title/slug/body/excerpt/tags + a publish toggle); SEO tab mounts the
 * shared SeoEntityDrawer.
 *
 * For the "new" path the SEO tab is hidden — there's no entity row yet
 * to attach SEO overrides to. After Save, the Content action redirects
 * to the edit URL where both tabs become available.
 */
export default function BlogPostEditorClient({ isNew, post, recentImages }: Props) {
  const searchParams = useSearchParams()
  const initialTab: TabId = (() => {
    const t = searchParams?.get('tab')
    return !isNew && t === 'seo' ? 'seo' : 'content'
  })()
  const [tab, setTab] = useState<TabId>(initialTab)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    // Sync local tab state to URL ?tab= when the user navigates within the
    // editor (e.g. Inspector deep-link). The setState-in-effect rule fires
    // here but this is the standard URL-sync pattern.
    const t = searchParams?.get('tab')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isNew && t && (t === 'content' || t === 'seo') && t !== tab) setTab(t as TabId)
    // isNew + tab are intentionally excluded — the effect runs on URL
    // changes only; including tab would cause an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <AdminPageShell
      title={isNew ? 'New Blog Post' : post?.title ?? 'Edit Post'}
      actions={
        <>
          {/* savedAt is client state, bumped by this editor's own tabs. The
              header therefore stays in the client component: moving it up to
              the server page would sever the indicator from every writer and
              it would never appear after a save. */}
          {savedAt && (
            <span className="text-[12px] text-[oklch(0.55_0.12_150)]">Saved at {savedAt}</span>
          )}
          <Link
            href="/admin/cms?tab=blog"
            className="flex h-9 items-center rounded-md border border-ih-border bg-ih-surface px-4 text-[13px] font-medium transition-colors hover:border-ih-accent hover:text-ih-accent"
          >
            ← CMS
          </Link>
        </>
      }
      bodyClassName="px-[26px] py-6 pb-16 max-w-[960px]"
    >

      {!isNew && (
        <div className="flex border-b border-ih-border mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 font-mono text-[12px] border-b-2 -mb-px ${
                tab === t.id
                  ? 'border-ih-accent text-ih-ink'
                  : 'border-transparent text-ih-muted hover:text-ih-ink-2'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {(tab === 'content' || isNew) && <ContentForm isNew={isNew} post={post} />}

      {tab === 'seo' && !isNew && post && (
        <SeoEntityDrawer
          entityType="blog_post"
          entity={toSeoEntity(post)}
          extra={{
            kind: 'blog_post',
            heroImageUrl: post.heroImageUrl,
            authorName: post.authorName,
            publishedAt: post.publishedAt,
          }}
          recentImages={recentImages}
          saveAction={updateBlogPostSeo}
          uploadAction={uploadBlogPostOgImage}
          onSaved={() => setSavedAt(new Date().toLocaleTimeString())}
        />
      )}
    </AdminPageShell>
  )
}

// ── Content tab — preserves the original inline form layout. ────────────────

function ContentForm({ isNew, post }: { isNew: boolean; post: BlogPost | null }) {
  return (
    <form action={savePost} className="space-y-5">
      <input type="hidden" name="id" value={isNew ? 'new' : post?.id ?? ''} />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label htmlFor="blogpost-title" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            Title *
          </label>
          <Input
            id="blogpost-title"
            name="title"
            required
            defaultValue={post?.title ?? ''}
            type="text"
            placeholder="Post title" className="text-[15px] font-semibold" />
        </div>

        <div>
          <label htmlFor="blogpost-slug" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            Slug *
          </label>
          <Input
            id="blogpost-slug"
            name="slug"
            required
            defaultValue={post?.slug ?? ''}
            type="text"
            placeholder="url-friendly-slug" className="font-mono" />
        </div>

        <div>
          <label htmlFor="blogpost-tags" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            Tags (comma-separated)
          </label>
          <Input
            id="blogpost-tags"
            name="tags"
            defaultValue={post ? post.tags.join(', ') : ''}
            type="text"
            placeholder="hydraulics, maintenance, pumps" />
        </div>
      </div>

      <div>
        <label htmlFor="blogpost-excerpt" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          Excerpt
        </label>
        <Textarea
          id="blogpost-excerpt"
          name="excerpt"
          defaultValue={post?.excerpt ?? ''}
          rows={2}
          placeholder="Short summary shown in blog listings" className="resize-none" />
      </div>

      <div>
        <label htmlFor="blogpost-body" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          Body *
        </label>
        <Textarea
          id="blogpost-body"
          name="body"
          required
          defaultValue={post?.body ?? ''}
          rows={18}
          placeholder="Post content (HTML or Markdown)" className="font-mono resize-none" />
      </div>

      {/* Lightweight SEO fallbacks shown only in the Content tab so authors can
          set baseline meta without leaving the editor. The richer SEO drawer
          (canonical, robots, OG image, schema, sitemap, …) lives in the SEO
          tab. Both write to the same row; whichever was saved last wins. */}
      <div className="border-t border-ih-border pt-4">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-3">
          SEO basics
        </p>
        <p className="text-[12px] text-ih-muted-2 mb-3">
          For canonical URLs, OG images, sitemap controls, and JSON-LD overrides, switch to the
          SEO tab.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="blogpost-seoTitle" className="block font-mono text-[11px] text-ih-muted mb-1">Meta Title</label>
            <Input
              id="blogpost-seoTitle"
              name="seoTitle"
              defaultValue={post?.seoTitle ?? ''}
              type="text" />
          </div>
          <div>
            <label htmlFor="blogpost-seoDescription" className="block font-mono text-[11px] text-ih-muted mb-1">Meta Description</label>
            <Input
              id="blogpost-seoDescription"
              name="seoDescription"
              defaultValue={post?.seoDescription ?? ''}
              type="text" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          name="publish"
          value="0"
          className="h-10 px-6 border border-ih-border text-[13px] font-medium text-ih-ink-2 hover:bg-ih-surface-2 transition-colors"
        >
          Save Draft
        </button>
        <button
          type="submit"
          name="publish"
          value="1"
          className="h-10 px-6 bg-ih-accent text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          {post?.isPublished ? 'Update & Publish' : 'Publish'}
        </button>
        {post?.isPublished && (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="font-mono text-[12px] text-ih-accent hover:underline ml-2"
          >
            View post ↗
          </Link>
        )}
      </div>
    </form>
  )
}

function toSeoEntity(p: BlogPost): SeoDrawerEntity {
  return {
    id: p.id,
    displayName: p.title,
    slug: p.slug,
    publicUrl: p.publicUrl,
    parentBreadcrumb: null,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    canonicalUrl: p.canonicalUrl,
    focusKeyword: p.focusKeyword,
    robotsIndex: p.robotsIndex,
    robotsFollow: p.robotsFollow,
    ogImageMediaId: p.ogImageMediaId,
    ogImageStoragePath: p.ogImageStoragePath,
    sitemapPriority: p.sitemapPriority,
    sitemapChangeFreq: p.sitemapChangeFreq,
    excludeFromSitemap: p.excludeFromSitemap,
    jsonLdOverride: p.jsonLdOverride,
  }
}
