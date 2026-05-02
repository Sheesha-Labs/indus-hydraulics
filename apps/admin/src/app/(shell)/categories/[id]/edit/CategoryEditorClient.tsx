'use client'

import { useState } from 'react'
import Link from 'next/link'
import SeoEntityDrawer, {
  type SeoDrawerEntity,
} from '../../../../../components/seo/SeoEntityDrawer'
import type { RecentMedia } from '../../../../../components/seo/OgImagePicker'
import { updateCategorySeo, uploadCategoryOgImage } from './actions'

type Category = {
  id: string
  slug: string
  name: string
  shortDescription: string | null
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
  category: Category
  recentImages: RecentMedia[]
}

const TABS = [
  { id: 'core', label: 'Core' },
  { id: 'seo', label: 'SEO' },
] as const

type TabId = (typeof TABS)[number]['id']

/**
 * Dedicated category edit screen. Today it focuses on the SEO drawer +
 * a stub Core tab — the bulk of category editing still happens in the
 * inline modal on the Categories list page (see CategoriesClient.tsx).
 *
 * Once the modal flow is migrated here, this component grows a Core tab
 * that mirrors the existing modal fields (name, slug, parentId, …).
 */
export default function CategoryEditorClient({ category, recentImages }: Props) {
  const [tab, setTab] = useState<TabId>('seo')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  return (
    <div className="px-8 py-6 pb-16">
      <div className="flex items-end justify-between mb-1 gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">{category.name}</h1>
          <p className="font-mono text-[12px] text-[var(--color-muted)] mt-1">/c/{category.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-[12px] text-[oklch(0.55_0.12_150)]">Saved at {savedAt}</span>
          )}
          <Link
            href="/categories"
            className="h-9 px-3 grid place-items-center font-mono text-[12px] border border-[var(--color-border)] hover:bg-[var(--color-deep)]"
          >
            ← All categories
          </Link>
        </div>
      </div>

      <div className="flex border-b border-[var(--color-border)] mt-6 mb-6">
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

      {tab === 'core' && (
        <div className="max-w-2xl text-[13px] text-[var(--color-muted)] border border-dashed border-[var(--color-border)] p-6">
          The Core editor for category metadata (name, slug, parent, default spec template,
          published flag) still lives on the <Link href="/categories" className="underline">Categories list</Link>{' '}
          modal. Migration of those fields into this dedicated page is a follow-up.
        </div>
      )}

      {tab === 'seo' && (
        <SeoEntityDrawer
          entityType="category"
          entity={toSeoEntity(category)}
          extra={{ kind: 'category', shortDescription: category.shortDescription }}
          recentImages={recentImages}
          saveAction={updateCategorySeo}
          uploadAction={uploadCategoryOgImage}
          onSaved={() => setSavedAt(new Date().toLocaleTimeString())}
        />
      )}
    </div>
  )
}

function toSeoEntity(c: Category): SeoDrawerEntity {
  return {
    id: c.id,
    displayName: c.name,
    slug: c.slug,
    publicUrl: c.publicUrl,
    parentBreadcrumb: null,
    seoTitle: c.seoTitle,
    seoDescription: c.seoDescription,
    canonicalUrl: c.canonicalUrl,
    focusKeyword: c.focusKeyword,
    robotsIndex: c.robotsIndex,
    robotsFollow: c.robotsFollow,
    ogImageMediaId: c.ogImageMediaId,
    ogImageStoragePath: c.ogImageStoragePath,
    sitemapPriority: c.sitemapPriority,
    sitemapChangeFreq: c.sitemapChangeFreq,
    excludeFromSitemap: c.excludeFromSitemap,
    jsonLdOverride: c.jsonLdOverride,
  }
}
