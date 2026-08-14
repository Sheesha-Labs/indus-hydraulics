'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SeoEntityDrawer, {
  type SeoDrawerEntity,
} from '../../../../../../components/admin/seo/SeoEntityDrawer'
import type { RecentMedia } from '../../../../../../components/admin/seo/OgImagePicker'
import { savePost, updateBlogPostSeo, uploadBlogPostOgImage } from './actions'

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
    <div className="max-w-[960px]">
      <div className="mb-6">
        <Link
          href="/admin/cms?tab=blog"
          className="font-mono text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)] mb-2 inline-block"
        >
          ← CMS
        </Link>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-[24px] font-semibold tracking-tight">
            {isNew ? 'New Blog Post' : post?.title ?? 'Edit Post'}
          </h1>
          {savedAt && (
            <span className="text-[12px] text-[oklch(0.55_0.12_150)]">Saved at {savedAt}</span>
          )}
        </div>
      </div>

      {!isNew && (
        <div className="flex border-b border-[var(--color-border)] mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 font-mono text-[12px] border-b-2 -mb-px ${
                tab === t.id
                  ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-body)]'
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
    </div>
  )
}

// ── Content tab — preserves the original inline form layout. ────────────────

function ContentForm({ isNew, post }: { isNew: boolean; post: BlogPost | null }) {
  return (
    <form action={savePost} className="space-y-5">
      <input type="hidden" name="id" value={isNew ? 'new' : post?.id ?? ''} />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
            Title *
          </label>
          <input
            name="title"
            required
            defaultValue={post?.title ?? ''}
            type="text"
            placeholder="Post title"
            className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[15px] font-semibold text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
            Slug *
          </label>
          <input
            name="slug"
            required
            defaultValue={post?.slug ?? ''}
            type="text"
            placeholder="url-friendly-slug"
            className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] font-mono text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
            Tags (comma-separated)
          </label>
          <input
            name="tags"
            defaultValue={post ? post.tags.join(', ') : ''}
            type="text"
            placeholder="hydraulics, maintenance, pumps"
            className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
          Excerpt
        </label>
        <textarea
          name="excerpt"
          defaultValue={post?.excerpt ?? ''}
          rows={2}
          placeholder="Short summary shown in blog listings"
          className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
        />
      </div>

      <div>
        <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
          Body *
        </label>
        <textarea
          name="body"
          required
          defaultValue={post?.body ?? ''}
          rows={18}
          placeholder="Post content (HTML or Markdown)"
          className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] font-mono text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
        />
      </div>

      {/* Lightweight SEO fallbacks shown only in the Content tab so authors can
          set baseline meta without leaving the editor. The richer SEO drawer
          (canonical, robots, OG image, schema, sitemap, …) lives in the SEO
          tab. Both write to the same row; whichever was saved last wins. */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">
          SEO basics
        </p>
        <p className="text-[12px] text-[var(--color-caption)] mb-3">
          For canonical URLs, OG images, sitemap controls, and JSON-LD overrides, switch to the
          SEO tab.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[11px] text-[var(--color-muted)] mb-1">Meta Title</label>
            <input
              name="seoTitle"
              defaultValue={post?.seoTitle ?? ''}
              type="text"
              className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] text-[var(--color-muted)] mb-1">Meta Description</label>
            <input
              name="seoDescription"
              defaultValue={post?.seoDescription ?? ''}
              type="text"
              className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          name="publish"
          value="0"
          className="h-10 px-6 border border-[var(--color-border)] text-[13px] font-medium text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
        >
          Save Draft
        </button>
        <button
          type="submit"
          name="publish"
          value="1"
          className="h-10 px-6 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          {post?.isPublished ? 'Update & Publish' : 'Publish'}
        </button>
        {post?.isPublished && (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="font-mono text-[12px] text-[var(--color-accent)] hover:underline ml-2"
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
