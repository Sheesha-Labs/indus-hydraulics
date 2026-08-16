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
    <div className="max-w-[960px]">
      <div className="mb-6">
        <Link
          href="/admin/cms?tab=pages"
          className="font-mono text-[12px] text-ih-muted hover:text-ih-ink mb-2 inline-block"
        >
          ← CMS
        </Link>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-[24px] font-semibold tracking-tight">
            {isNew ? 'New Page' : page?.title ?? 'Edit Page'}
          </h1>
          {savedAt && (
            <span className="text-[12px] text-[oklch(0.55_0.12_150)]">Saved at {savedAt}</span>
          )}
        </div>
      </div>

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
    </div>
  )
}

function ContentForm({ isNew, page }: { isNew: boolean; page: CmsPage | null }) {
  return (
    <form action={savePage} className="space-y-5">
      <input type="hidden" name="id" value={isNew ? 'new' : page?.id ?? ''} />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label htmlFor="cmspage-title" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            Title *
          </label>
          <Input
            id="cmspage-title"
            name="title"
            required
            defaultValue={page?.title ?? ''}
            type="text" className="text-[15px] font-semibold" />
        </div>
        <div>
          <label htmlFor="cmspage-slug" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            Slug *
          </label>
          <Input
            id="cmspage-slug"
            name="slug"
            required
            defaultValue={page?.slug ?? ''}
            type="text"
            placeholder="about, contact, terms" className="font-mono" />
        </div>
      </div>

      <div>
        <label htmlFor="cmspage-body" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          Body *
        </label>
        <Textarea
          id="cmspage-body"
          name="body"
          required
          defaultValue={page?.body ?? ''}
          rows={20}
          placeholder="Page content (HTML)" className="font-mono resize-none" />
      </div>

      <div className="border-t border-ih-border pt-4">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-3">
          SEO basics
        </p>
        <p className="text-[12px] text-ih-muted-2 mb-3">
          For canonical URLs, OG images, sitemap controls, and robots overrides, switch to the
          SEO tab.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cmspage-seoTitle" className="block font-mono text-[11px] text-ih-muted mb-1">Meta Title</label>
            <Input
              id="cmspage-seoTitle"
              name="seoTitle"
              defaultValue={page?.seoTitle ?? ''}
              type="text" />
          </div>
          <div>
            <label htmlFor="cmspage-seoDescription" className="block font-mono text-[11px] text-ih-muted mb-1">Meta Description</label>
            <Input
              id="cmspage-seoDescription"
              name="seoDescription"
              defaultValue={page?.seoDescription ?? ''}
              type="text" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          name="publish"
          value="0"
          className="h-10 px-6 border border-ih-border text-[13px] font-medium hover:bg-ih-surface-2"
        >
          Save Draft
        </button>
        <button
          type="submit"
          name="publish"
          value="1"
          className="h-10 px-6 bg-ih-accent text-white text-[13px] font-medium hover:opacity-90"
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
