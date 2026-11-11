'use client'

import { useEffect, useState, type ReactNode } from 'react'
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
import { ChevronRight, ExternalLink } from 'lucide-react'
import { Button, Field, Input, Select, Textarea } from '@indus/ui'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import BlogBodyEditor from '../../../../../components/admin/blog/BlogBodyEditor'
import EditorSection from '../../../../../components/admin/EditorSection'
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
  /** Reader-facing caption under the hero. */
  heroCaption: string | null
  /** Author's display name (for Article JSON-LD preview). */
  authorName: string | null
  /** Public byline FK — a BlogAuthor, editable from the Content tab. */
  blogAuthorId: string | null
  /** Technical reviewer — a staff user. Shown under the byline when set. */
  reviewedById: string | null
  /** ISO timestamp of the review sign-off. */
  reviewedAt: string | null
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

export type ReviewerCandidate = {
  id: string
  /** Public profile name when the staff user has one, otherwise their staff name. */
  name: string
  jobTitle: string | null
  /** Without a public profile the "Reviewed by" line has nothing to link to. */
  hasProfile: boolean
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
  /** Active staff who can sign an article off as its technical reviewer. */
  reviewers: ReviewerCandidate[]
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
  reviewers,
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

  const isLive = post ? displayStatus(post.status, post.isPublished) === 'published' : false

  return (
    <AdminPageShell
      title={isNew ? 'New post' : post?.title ?? 'Edit post'}
      // Where you are, above what it is — Bazar's order. The crumb is also the
      // way back to the list, which used to be a separate "← All posts" button.
      breadcrumbs={
        <span className="inline-flex min-w-0 items-center gap-1">
          <Link href="/admin/blog">Blog</Link>
          <ChevronRight size={11} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{isNew ? 'New post' : `/blog/${post?.slug ?? ''}`}</span>
        </span>
      }
      actions={
        <>
          {/* savedAt is client state, bumped by this editor's own tabs. The
              header therefore stays in the client component: moving it up to
              the server page would sever the indicator from every writer and
              it would never appear after a save. */}
          {savedAt && (
            <span role="status" className="text-[12.5px] text-ih-success-ink">
              Saved at {savedAt}
            </span>
          )}
          {isLive && post && (
            <a
              href={post.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-ih-muted transition-colors hover:bg-ih-surface-2 hover:text-ih-ink"
            >
              View on site
              <ExternalLink size={13} strokeWidth={1.8} aria-hidden="true" />
            </a>
          )}
        </>
      }
      bodyClassName="max-w-[1320px]"
    >
      {!isNew && (
        <div role="tablist" aria-label="Editor sections" className="mb-5 inline-flex rounded-md border border-ih-border bg-ih-surface p-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex h-7 items-center rounded px-3 text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft ${
                tab === t.id ? 'bg-ih-navy font-medium text-ih-bg' : 'text-ih-ink-2 hover:bg-ih-surface-2 hover:text-ih-ink'
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
          reviewers={reviewers}
          categories={categories}
          bodyMedia={bodyMedia}
          savedAt={savedAt}
          onOpenSeo={() => setTab('seo')}
        />
      )}

      {tab === 'seo' && !isNew && post && (
        <div className="max-w-[920px]">
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
        </div>
      )}
    </AdminPageShell>
  )
}

// ── Content tab ─────────────────────────────────────────────────────────────

function ContentForm({
  isNew,
  post,
  recentImages,
  authors,
  reviewers,
  categories,
  bodyMedia,
  savedAt,
  onOpenSeo,
}: {
  isNew: boolean
  post: BlogPost | null
  recentImages: RecentMedia[]
  authors: BylineCandidate[]
  reviewers: ReviewerCandidate[]
  categories: CategoryOption[]
  bodyMedia: BodyMedia[]
  savedAt: string | null
  onOpenSeo: () => void
}) {
  // Hero lives in client state because the picker is interactive; the value
  // reaches the server action through a hidden input rather than a fetch.
  const [heroId, setHeroId] = useState<string | null>(post?.heroId ?? null)
  // Echoes the slug under its field as the public path, as Bazar does.
  const [slug, setSlug] = useState(post?.slug ?? '')
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
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <EditorSection title="Post">
            <Field label={<Required>Title</Required>} htmlFor="blogpost-title">
              <Input
                id="blogpost-title"
                name="title"
                required
                defaultValue={post?.title ?? ''}
                type="text"
                placeholder="Post title"
                className="h-10 text-[15px] font-medium"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label={<Required>Slug</Required>}
                htmlFor="blogpost-slug"
                hint={<span className="break-all">/blog/{slug || 'your-slug'}</span>}
              >
                <Input
                  id="blogpost-slug"
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  type="text"
                  placeholder="url-friendly-slug"
                />
              </Field>
              <Field
                label="Category"
                htmlFor="blogpost-category"
                hint="Files the post under a topic hub at /blog/c/…, and puts its chip on the index card."
              >
                <Select id="blogpost-category" name="categoryId" defaultValue={post?.categoryId ?? ''}>
                  <option value="">Uncategorised</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.isPublished ? '' : ' (hub unpublished)'}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Excerpt" htmlFor="blogpost-excerpt" hint="One or two sentences for blog listings and social previews.">
              <Textarea
                id="blogpost-excerpt"
                name="excerpt"
                defaultValue={post?.excerpt ?? ''}
                rows={3}
                placeholder="Short summary shown in blog listings"
              />
            </Field>

            <Field label="Tags" htmlFor="blogpost-tags" hint="Comma-separated.">
              <Input
                id="blogpost-tags"
                name="tags"
                defaultValue={post ? post.tags.join(', ') : ''}
                type="text"
                placeholder="hydraulics, maintenance, pumps"
              />
            </Field>
          </EditorSection>

          <EditorSection
            title="Hero image"
            description="Shown at the top of the post and on the blog index card. Landscape, at least 1200px wide."
          >
            <OgImagePicker
              value={heroId}
              recent={heroRecent}
              uploadAction={uploadBlogPostHeroImage}
              onChange={(next) => setHeroId(next)}
              emptyLabel="No hero image"
              dialogTitle="Choose a hero image"
              hint="JPEG for photographs, under 400 KB. Alt text is set on the image in the media library."
            />
            <Field
              label="Caption"
              htmlFor="blogpost-hero-caption"
              hint="Shown under the hero. Say why the picture is here; the image alt text already says what is in it."
            >
              <Input
                id="blogpost-hero-caption"
                name="heroCaption"
                defaultValue={post?.heroCaption ?? ''}
                type="text"
                maxLength={300}
                placeholder="One sentence: what the reader should notice in the picture"
              />
            </Field>
          </EditorSection>

          <EditorSection
            title="Body"
            description="Headings become the article’s numbered sections and its table of contents. Images are picked from the media library and print with their caption."
          >
            <BlogBodyEditor
              initialBlocks={initialBlocks}
              onChange={setBlocks}
              media={bodyMedia}
              uploadAction={uploadBlogPostBodyImage}
            />
          </EditorSection>

          <EditorSection title="Byline and review" description="Who wrote it, who checked it, and the date it carries.">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Byline"
                htmlFor="blogpost-author"
                hint="Credits the engineer who wrote it and links to their profile. Without one the post falls back to the staff name."
              >
                <Select id="blogpost-author" name="blogAuthorId" defaultValue={post?.blogAuthorId ?? ''}>
                  <option value="">No public byline</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                      {a.jobTitle ? ` · ${a.jobTitle}` : ''}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Technical reviewer"
                htmlFor="blogpost-reviewer"
                hint={
                  <>
                    Shown as &ldquo;Technically reviewed by&rdquo; under the byline and named in the structured
                    data. Worth setting on anything quoting pressures, ratings or standards.
                  </>
                }
              >
                <Select id="blogpost-reviewer" name="reviewedById" defaultValue={post?.reviewedById ?? ''}>
                  <option value="">Not reviewed</option>
                  {reviewers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.jobTitle ? ` · ${r.jobTitle}` : ''}
                      {r.hasProfile ? '' : ' (no public profile)'}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Reviewed on"
                htmlFor="blogpost-reviewedAt"
                hint="Leave blank to stamp today when a reviewer is first set. Clearing the reviewer clears the date."
              >
                <Input
                  id="blogpost-reviewedAt"
                  name="reviewedAt"
                  type="date"
                  defaultValue={post?.reviewedAt ? post.reviewedAt.slice(0, 10) : ''}
                />
              </Field>

              <Field
                label="Publish date"
                htmlFor="blogpost-publishedAt"
                hint="Leave blank to stamp now on first publish. Editing a live post never moves it. A future date is only a label: publishing puts the post on the site straight away."
              >
                <Input
                  id="blogpost-publishedAt"
                  name="publishedAt"
                  type="datetime-local"
                  defaultValue={toDateTimeLocal(post?.publishedAt ?? null)}
                />
              </Field>
            </div>
          </EditorSection>

          {/* Lightweight SEO fallbacks so authors can set baseline meta without
              leaving the editor. The richer controls (canonical, robots, OG
              image, schema, sitemap) live in the SEO tab. Both write to the
              same row; whichever was saved last wins. */}
          <EditorSection
            title="SEO basics"
            description={
              isNew ? (
                'Canonical URL, social image, sitemap and structured data open in the SEO tab after the first save.'
              ) : (
                <>
                  Canonical URL, social image, sitemap and structured data are in the{' '}
                  <button type="button" onClick={onOpenSeo} className="text-ih-accent hover:text-ih-navy">
                    SEO tab
                  </button>
                  .
                </>
              )
            }
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Meta title" htmlFor="blogpost-seoTitle" hint="Optional. Falls back to the post title.">
                <Input id="blogpost-seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ''} type="text" />
              </Field>
              <Field label="Meta description" htmlFor="blogpost-seoDescription" hint="Optional. Falls back to the excerpt.">
                <Input
                  id="blogpost-seoDescription"
                  name="seoDescription"
                  defaultValue={post?.seoDescription ?? ''}
                  type="text"
                />
              </Field>
            </div>
          </EditorSection>

          {/* On the new-post path the publish card has no row to act on yet, so
              the footer keeps the two submit buttons. After the first save the
              action redirects to the edit URL, where the card takes over. */}
          {isNew && (
            <div className="flex items-center justify-end gap-2">
              <Button type="submit" name="publish" value="0" kind="outline">
                Save draft
              </Button>
              <Button type="submit" name="publish" value="1" kind="primary">
                Publish
              </Button>
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

/** A required field's label. The marker is quiet; the browser enforces it. */
function Required({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <span aria-hidden="true" className="ml-0.5 text-ih-muted">
        *
      </span>
    </>
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
