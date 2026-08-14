'use client'

import { useState } from 'react'
import Link from 'next/link'
import SeoEntityDrawer, {
  type SeoDrawerEntity,
} from '../../../../../../components/admin/seo/SeoEntityDrawer'
import type { RecentMedia } from '../../../../../../components/admin/seo/OgImagePicker'
import { updateBrandSeo, uploadBrandOgImage } from './actions'

type Brand = {
  id: string
  slug: string
  name: string
  isPublished: boolean
  publicUrl: string
  /** Public URL of the brand logo image, used in Organization JSON-LD. */
  logoUrl: string | null

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
  brand: Brand
  recentImages: RecentMedia[]
}

const TABS = [
  { id: 'core', label: 'Core' },
  { id: 'seo', label: 'SEO' },
] as const

type TabId = (typeof TABS)[number]['id']

/**
 * Dedicated brand edit screen. Today only the SEO drawer is wired —
 * the inline modal on the Brands list page still owns Core fields
 * (name, slug, country, description, distributor flag, published).
 * Migrating those to a tabbed Core tab here is a follow-up.
 */
export default function BrandEditorClient({ brand, recentImages }: Props) {
  const [tab, setTab] = useState<TabId>('seo')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  return (
    <div className="px-8 py-6 pb-16">
      <div className="flex items-end justify-between mb-1 gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">{brand.name}</h1>
          <p className="font-mono text-[12px] text-[var(--color-muted)] mt-1">
            /brands/{brand.slug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-[12px] text-[oklch(0.55_0.12_150)]">Saved at {savedAt}</span>
          )}
          <Link
            href="/admin/brands"
            className="h-9 px-3 grid place-items-center font-mono text-[12px] border border-[var(--color-border)] hover:bg-[var(--color-deep)]"
          >
            ← All brands
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
          The Core editor for brand metadata (name, slug, country, description, distributor
          status, logo, hero) still lives on the{' '}
          <Link href="/admin/brands" className="underline">
            Brands list
          </Link>{' '}
          modal. Migration of those fields into this dedicated page is a follow-up.
        </div>
      )}

      {tab === 'seo' && (
        <SeoEntityDrawer
          entityType="brand"
          entity={toSeoEntity(brand)}
          extra={{ kind: 'brand', logoUrl: brand.logoUrl }}
          recentImages={recentImages}
          saveAction={updateBrandSeo}
          uploadAction={uploadBrandOgImage}
          onSaved={() => setSavedAt(new Date().toLocaleTimeString())}
        />
      )}
    </div>
  )
}

function toSeoEntity(b: Brand): SeoDrawerEntity {
  return {
    id: b.id,
    displayName: b.name,
    slug: b.slug,
    publicUrl: b.publicUrl,
    parentBreadcrumb: null,
    seoTitle: b.seoTitle,
    seoDescription: b.seoDescription,
    canonicalUrl: b.canonicalUrl,
    focusKeyword: b.focusKeyword,
    robotsIndex: b.robotsIndex,
    robotsFollow: b.robotsFollow,
    ogImageMediaId: b.ogImageMediaId,
    ogImageStoragePath: b.ogImageStoragePath,
    sitemapPriority: b.sitemapPriority,
    sitemapChangeFreq: b.sitemapChangeFreq,
    excludeFromSitemap: b.excludeFromSitemap,
    jsonLdOverride: b.jsonLdOverride,
  }
}
