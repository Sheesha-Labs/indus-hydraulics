'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SeoEntityDrawer, {
  type SeoDrawerEntity,
} from '../../../../../../components/admin/seo/SeoEntityDrawer'
import type { RecentMedia } from '../../../../../../components/admin/seo/OgImagePicker'
import { savePage, updateCmsPageSeo, uploadCmsPageOgImage } from './actions'
import { Input, Textarea } from '@indus/ui'
import AdminPageShell from '../../../../../../components/admin/AdminPageShell'

type CmsPage = {
  id: string
  slug: string
  title: string
  body: string
  isPublished: boolean
  publicUrl: string

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
    'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' | null
  excludeFromSitemap: boolean
  jsonLdOverride: string | null
}

interface Props {
  isNew: boolean
  page: CmsPage | null
  recentImages: RecentMedia[]
}

const TABS = [
  { id: 'content', label: 'Content' },
  { id: 'seo', label: 'SEO' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function CmsPageEditorClient({ isNew, page, recentImages }: Props) {
  const searchParams = useSearchParams()
  const initialTab: TabId = (() => {
    const t = searchParams?.get('tab')
    return !isNew && t === 'seo' ? 'seo' : 'content'
  })()
  const [tab, setTab] = useState<TabId>(initialTab)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    // Sync local tab state to URL ?tab= when the user navigates within the
    // editor. The setState-in-effect rule fires here but this is the
    // standard URL-sync pattern.
    const t = searchParams?.get('tab')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isNew && t && (t === 'content' || t === 'seo') && t !== tab) setTab(t as TabId)
    // isNew + tab are intentionally excluded — the effect runs on URL
    // changes only; including tab would cause an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <AdminPageShell
      title={isNew ? 'New Page' : (page?.title ?? 'Edit Page')}
      actions={
        <>
          {/* savedAt is client state, bumped by this editor's own tabs. The
              header therefore stays in the client component: moving it up to
              the server page would sever the indicator from every writer and
              it would never appear after a save. */}
          {savedAt && <span className="text-ih-success-ink text-[12px]">Saved at {savedAt}</span>}
          <Link
            href="/admin/pages"
            className="border-ih-border bg-ih-surface hover:border-ih-accent hover:text-ih-accent flex h-9 items-center rounded-md border px-4 text-[13px] font-medium transition-colors"
          >
            ← CMS
          </Link>
        </>
      }
      bodyClassName="max-w-[860px]"
    >
      {!isNew && (
        <div className="border-ih-border mb-6 flex border-b">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-[12px] tabular-nums ${
                tab === t.id
                  ? 'border-ih-accent text-ih-ink'
                  : 'text-ih-muted hover:text-ih-ink-2 border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {(tab === 'content' || isNew) && <ContentForm isNew={isNew} page={page} />}

      {tab === 'seo' && !isNew && page && (
        <SeoEntityDrawer
          entityType="cms_page"
          entity={toSeoEntity(page)}
          extra={{ kind: 'cms_page' }}
          recentImages={recentImages}
          saveAction={updateCmsPageSeo}
          uploadAction={uploadCmsPageOgImage}
          onSaved={() => setSavedAt(new Date().toLocaleTimeString())}
        />
      )}
    </AdminPageShell>
  )
}

function ContentForm({ isNew, page }: { isNew: boolean; page: CmsPage | null }) {
  return (
    <form action={savePage} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={isNew ? 'new' : (page?.id ?? '')} />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label
            htmlFor="cmspage-title"
            className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
          >
            Title *
          </label>
          <Input
            id="cmspage-title"
            name="title"
            required
            defaultValue={page?.title ?? ''}
            type="text"
            className="text-[15px] font-medium"
          />
        </div>
        <div>
          <label
            htmlFor="cmspage-slug"
            className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
          >
            Slug *
          </label>
          <Input
            id="cmspage-slug"
            name="slug"
            required
            defaultValue={page?.slug ?? ''}
            type="text"
            placeholder="about, contact, terms"
            className="tabular-nums"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="cmspage-body"
          className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
        >
          Body *
        </label>
        <Textarea
          id="cmspage-body"
          name="body"
          required
          defaultValue={page?.body ?? ''}
          rows={20}
          placeholder="Page content (HTML)"
          className="resize-none tabular-nums"
        />
      </div>

      <div className="border-ih-border border-t pt-4">
        <p className="text-ih-muted mb-3 text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums">
          SEO basics
        </p>
        <p className="text-ih-muted-2 mb-3 text-[12px]">
          For canonical URLs, OG images, sitemap controls, and robots overrides, switch to the SEO
          tab.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="cmspage-seoTitle"
              className="text-ih-muted mb-1 block text-[11px] tabular-nums"
            >
              Meta Title
            </label>
            <Input
              id="cmspage-seoTitle"
              name="seoTitle"
              defaultValue={page?.seoTitle ?? ''}
              type="text"
            />
          </div>
          <div>
            <label
              htmlFor="cmspage-seoDescription"
              className="text-ih-muted mb-1 block text-[11px] tabular-nums"
            >
              Meta Description
            </label>
            <Input
              id="cmspage-seoDescription"
              name="seoDescription"
              defaultValue={page?.seoDescription ?? ''}
              type="text"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          name="publish"
          value="0"
          className="border-ih-border hover:bg-ih-surface-2 h-10 rounded-md border px-6 text-[13px] font-medium"
        >
          Save Draft
        </button>
        <button
          type="submit"
          name="publish"
          value="1"
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-10 px-6 text-[13px] font-medium"
        >
          {page?.isPublished ? 'Update' : 'Publish'}
        </button>
      </div>
    </form>
  )
}

function toSeoEntity(p: CmsPage): SeoDrawerEntity {
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
