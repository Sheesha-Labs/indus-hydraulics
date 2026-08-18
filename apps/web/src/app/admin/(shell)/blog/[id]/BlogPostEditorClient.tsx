'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SeoEntityDrawer, {
  type SeoDrawerEntity,
} from '../../../../../components/admin/seo/SeoEntityDrawer'
import OgImagePicker, {
  type RecentMedia,
} from '../../../../../components/admin/seo/OgImagePicker'
import {
  savePost,
  setBlogPostArchivedFromEditor,
  setBlogPostPublished,
  updateBlogPostSeo,
  uploadBlogPostBodyImage,
  uploadBlogPostHeroImage,
  uploadBlogPostOgImage,
} from './actions'
import { Input, Textarea } from '@indus/ui'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import BlogBodyEditor from '../../../../../components/admin/blog/BlogBodyEditor'
import BlogPublishCard from '../../../../../components/admin/blog/BlogPublishCard'
import { displayStatus } from '../../../../../lib/blog-status'
import type { BodyMedia } from '../../../../../components/admin/blog/ImageInsertDialog'
import type { BlogBlockInput, BlogBlocks } from '@indus/domain'

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string
  tags: string[]
  isPublished: boolean
  status: string
  publishedAt: string | null
  updatedAt: string
  readingMinutes: number | null
  publicUrl: string
  /** Validated body blocks — what the editor actually edits. */
  bodyBlocks: BlogBlocks
  /** Sanitised legacy `body` HTML, when the post has no blocks yet. */
  legacyProseHtml: string | null

  /** Current hero image's resolved public URL (for Article JSON-LD preview). */
  heroImageUrl: string | null
  /** Hero Media id — editable from the Content tab. */
  heroId: string | null
  /** Hero Media storage path, so the picker can render a thumbnail. */
  heroStoragePath: string | null
  /** Author's display name (for Article JSON-LD preview). */
  authorName: string | null
  /** Public byline FK — a BlogAuthor, editable from the Content tab. */
  blogAuthorId: string | null
  /** Topic hub FK — a BlogCategory, editable from the Content tab. */
  categoryId: string | null
  /** Current hub's name, for the publish card. */
  categoryName: string | null

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

export type BylineCandidate = {
  id: string
  name: string
  jobTitle: string | null
}

export type CategoryOption = {
  id: string
  name: string
  /** Unpublished hubs still hold posts, so they stay selectable — flagged. */
  isPublished: boolean
}

interface Props {
  /** Whether this is the "new post" path (id === 'new'). */
  isNew: boolean
  /** Post data (only for the edit path; null on new). */
  post: BlogPost | null
  recentImages: RecentMedia[]
  /** Published author profiles that can hold a byline. */
  authors: BylineCandidate[]
  /** Topic hubs the post can be filed under. */
  categories: CategoryOption[]
  /** Library images offered by the body editor's insert dialog. */
  bodyMedia: BodyMedia[]
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
export default function BlogPostEditorClient({
  isNew,
  post,
  recentImages,
  authors,
  categories,
  bodyMedia,
}: Props) {
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
            <span className="text-[12px] text-ih-success-ink">Saved at {savedAt}</span>
          )}
          <Link
            href="/admin/blog"
            className="flex h-9 items-center rounded-md border border-ih-border bg-ih-surface px-4 text-[13px] font-medium transition-colors hover:border-ih-accent hover:text-ih-accent"
          >
            ← All posts
          </Link>
        </>
      }
      bodyClassName="max-w-[860px]"
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

      {(tab === 'content' || isNew) && (
        <ContentForm
          isNew={isNew}
          post={post}
          recentImages={recentImages}
          authors={authors}
          categories={categories}
          bodyMedia={bodyMedia}
          savedAt={savedAt}
        />
      )}

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

function ContentForm({
  isNew,
  post,
  recentImages,
  authors,
  categories,
  bodyMedia,
  savedAt,
}: {
  isNew: boolean
  post: BlogPost | null
  recentImages: RecentMedia[]
  authors: BylineCandidate[]
  categories: CategoryOption[]
  bodyMedia: BodyMedia[]
  savedAt: string | null
}) {
  // Hero lives in client state because the picker is interactive; the value
  // reaches the server action through a hidden input rather than a fetch.
  const [heroId, setHeroId] = useState<string | null>(post?.heroId ?? null)
  // The body editor is uncontrolled; it pushes its serialised blocks up here
  // and they ride to the server in a hidden input, the same way the hero does.
  // A legacy post opens as one prose block holding its old HTML, so the
  // article is visible and editable and the first save migrates it to blocks.
  const initialBlocks: BlogBlocks =
    post?.bodyBlocks.length
      ? post.bodyBlocks
      : post?.legacyProseHtml
        ? [{ type: 'prose', html: post.legacyProseHtml }]
        : []
  const [blocks, setBlocks] = useState<BlogBlockInput[]>(initialBlocks)

  const heroRecent: RecentMedia[] =
    post?.heroId && post.heroStoragePath && !recentImages.some((m) => m.id === post.heroId)
      ? // The current hero can be older than the 50 most-recent uploads. Without
        // this it would vanish from the list and silently clear itself on save.
        [
          {
            id: post.heroId,
            storagePath: post.heroStoragePath,
            alt: null,
            originalFilename: 'Current hero image',
          },
          ...recentImages,
        ]
      : recentImages

  return (
    <form action={savePost}>
      <input type="hidden" name="id" value={isNew ? 'new' : post?.id ?? ''} />
      <input type="hidden" name="heroId" value={heroId ?? ''} />
      <input type="hidden" name="bodyBlocks" value={JSON.stringify(blocks)} />

      {/* grid-cols-1 explicitly: a bare `grid` makes one implicit max-content
          column, which a wide block card then widens past the viewport. */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 flex flex-col gap-5">

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
            placeholder="Post title" className="text-[15px] font-medium" />
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="blogpost-category"
            className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5"
          >
            Category
          </label>
          <select
            id="blogpost-category"
            name="categoryId"
            defaultValue={post?.categoryId ?? ''}
            className="h-10 w-full rounded-md border border-ih-border bg-ih-surface px-2 text-[13px]"
          >
            <option value="">— Uncategorised —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.isPublished ? '' : ' (hub unpublished)'}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-ih-muted-2">
            Files the post under a topic hub at /blog/c/…, and puts its chip on the index card.
          </p>
        </div>

        <div>
          <label
            htmlFor="blogpost-author"
            className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5"
          >
            Byline
          </label>
          <select
            id="blogpost-author"
            name="blogAuthorId"
            defaultValue={post?.blogAuthorId ?? ''}
            className="h-10 w-full rounded-md border border-ih-border bg-ih-surface px-2 text-[13px]"
          >
            <option value="">— No public byline —</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
                {a.jobTitle ? ` · ${a.jobTitle}` : ''}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-ih-muted-2">
            Credits the engineer who wrote it, and links to their profile. Without one the post
            falls back to the staff name.
          </p>
        </div>

        <div>
          <label
            htmlFor="blogpost-publishedAt"
            className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5"
          >
            Publish date
          </label>
          <Input
            id="blogpost-publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={toDateTimeLocal(post?.publishedAt ?? null)}
          />
          <p className="mt-1 text-[11px] text-ih-muted-2">
            Leave blank to stamp now on first publish. Editing a live post never moves it. A
            future date is only a label — publishing puts the post on the site straight away.
          </p>
        </div>
      </div>

      <div>
        <span className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          Hero image
        </span>
        <OgImagePicker
          value={heroId}
          recent={heroRecent}
          uploadAction={uploadBlogPostHeroImage}
          onChange={(next) => setHeroId(next)}
          emptyLabel="— No hero image —"
          hint="Shown at the top of the post and on the blog index card. Landscape, at least 1200px wide."
        />
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
        <span className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          Body *
        </span>
        <BlogBodyEditor
          initialBlocks={initialBlocks}
          onChange={setBlocks}
          media={bodyMedia}
          uploadAction={uploadBlogPostBodyImage}
        />
        <p className="mt-1.5 text-[11px] text-ih-muted-2">
          Headings become the article&apos;s numbered sections and its table of contents. Images
          are picked from the media library and print with their caption.
        </p>
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

      {/* On the new-post path the publish card has no row to act on yet, so
          the footer keeps the two submit buttons. After the first save the
          action redirects to the edit URL, where the card takes over. */}
      {isNew && (
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            name="publish"
            value="0"
            className="h-10 rounded-md border border-ih-border px-6 text-[13px] font-medium text-ih-ink-2 transition-colors hover:bg-ih-surface-2"
          >
            Save draft
          </button>
          <button
            type="submit"
            name="publish"
            value="1"
            className="h-10 rounded-md bg-ih-accent px-6 text-[13px] font-medium text-ih-accent-fg transition-opacity hover:bg-ih-accent-hover"
          >
            Publish
          </button>
        </div>
      )}
        </div>

        {!isNew && post && (
          <aside className="min-w-0 lg:sticky lg:top-6">
            <BlogPublishCard
              postId={post.id}
              status={displayStatus(post.status, post.isPublished)}
              updatedAt={post.updatedAt}
              publishedAt={post.publishedAt}
              authorName={post.authorName}
              categoryName={post.categoryName}
              readingMinutes={post.readingMinutes}
              publicUrl={post.publicUrl}
              savedAt={savedAt}
              setPublished={setBlogPostPublished}
              setArchived={setBlogPostArchivedFromEditor}
            />
          </aside>
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

/**
 * `datetime-local` will not accept an ISO string with a timezone or seconds —
 * it silently renders an empty field, which reads as "no publish date" and
 * would clear the date on the next save. Trim to `YYYY-MM-DDTHH:mm` in local
 * time so what the editor sees is what is stored.
 */
function toDateTimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
