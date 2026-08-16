'use client'

import { useState } from 'react'
import Link from 'next/link'
import SeoEntityDrawer, {
  type SeoDrawerEntity,
} from '../../../../../../components/admin/seo/SeoEntityDrawer'
import type { RecentMedia } from '../../../../../../components/admin/seo/OgImagePicker'
import { updateIndustrySeo, uploadIndustryOgImage } from './actions'

type Industry = {
  id: string
  slug: string
  name: string
  description: string | null
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
  industry: Industry
  recentImages: RecentMedia[]
}

const TABS = [
  { id: 'core', label: 'Core' },
  { id: 'seo', label: 'SEO' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function IndustryEditorClient({ industry, recentImages }: Props) {
  const [tab, setTab] = useState<TabId>('seo')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  return (
    <div className="px-8 py-6 pb-16">
      <div className="flex items-end justify-between mb-1 gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">{industry.name}</h1>
          <p className="font-mono text-[12px] text-ih-muted mt-1">
            /industries/{industry.slug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-[12px] text-[oklch(0.55_0.12_150)]">Saved at {savedAt}</span>
          )}
          <Link
            href="/admin/industries"
            className="h-9 px-3 grid place-items-center font-mono text-[12px] border border-ih-border hover:bg-ih-surface-2"
          >
            ← All industries
          </Link>
        </div>
      </div>

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
          The Core editor for industry metadata (name, slug, description, hero, published)
          still lives on the{' '}
          <Link href="/admin/industries" className="underline">
            Industries list
          </Link>{' '}
          modal. Migrating those fields to this dedicated page is a follow-up.
        </div>
      )}

      {tab === 'seo' && (
        <SeoEntityDrawer
          entityType="industry"
          entity={toSeoEntity(industry)}
          extra={{ kind: 'industry', description: industry.description }}
          recentImages={recentImages}
          saveAction={updateIndustrySeo}
          uploadAction={uploadIndustryOgImage}
          onSaved={() => setSavedAt(new Date().toLocaleTimeString())}
        />
      )}
    </div>
  )
}

function toSeoEntity(i: Industry): SeoDrawerEntity {
  return {
    id: i.id,
    displayName: i.name,
    slug: i.slug,
    publicUrl: i.publicUrl,
    parentBreadcrumb: null,
    seoTitle: i.seoTitle,
    seoDescription: i.seoDescription,
    canonicalUrl: i.canonicalUrl,
    focusKeyword: i.focusKeyword,
    robotsIndex: i.robotsIndex,
    robotsFollow: i.robotsFollow,
    ogImageMediaId: i.ogImageMediaId,
    ogImageStoragePath: i.ogImageStoragePath,
    sitemapPriority: i.sitemapPriority,
    sitemapChangeFreq: i.sitemapChangeFreq,
    excludeFromSitemap: i.excludeFromSitemap,
    jsonLdOverride: i.jsonLdOverride,
  }
}
