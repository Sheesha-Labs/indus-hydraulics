'use client'

import { useState } from 'react'
import Link from 'next/link'
import SeoEntityDrawer, {
  type SeoDrawerEntity,
} from '../../../../../../components/admin/seo/SeoEntityDrawer'
import type { RecentMedia } from '../../../../../../components/admin/seo/OgImagePicker'
import { updateCategorySeo, uploadCategoryOgImage } from './actions'
import AdminPageShell from '../../../../../../components/admin/AdminPageShell'

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
    <AdminPageShell
      title={category.name}
      sub={<span className="font-mono">/c/{category.slug}</span>}
      actions={
        <>
        {savedAt && (
          <span className="text-[12px] text-[oklch(0.55_0.12_150)]">Saved at {savedAt}</span>
        )}
        <Link
          href="/admin/categories"
          className="h-9 px-3 grid place-items-center font-mono text-[12px] border border-ih-border hover:bg-ih-surface-2"
        >
          ← All categories
        </Link>
        </>
      }
    >

      <div className="flex border-b border-ih-border mt-6 mb-6">
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

      {tab === 'core' && (
        <div className="max-w-2xl text-[13px] text-ih-muted border border-dashed border-ih-border p-6">
          The Core editor for category metadata (name, slug, parent, default spec template,
          published flag) still lives on the <Link href="/admin/categories" className="underline">Categories list</Link>{' '}
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
    </AdminPageShell>
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
