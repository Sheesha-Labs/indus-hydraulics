'use client'

import { useState } from 'react'
import Link from 'next/link'
import SeoEntityDrawer, {
  type SeoDrawerEntity,
} from '../../../../../../components/admin/seo/SeoEntityDrawer'
import type { RecentMedia } from '../../../../../../components/admin/seo/OgImagePicker'
import { updateIndustrySeo, uploadIndustryOgImage } from './actions'
import AdminPageShell from '../../../../../../components/admin/AdminPageShell'

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
  /** Rendered at the top of the body — the server page owns it. */
  contentEditor?: React.ReactNode
  industry: Industry
  recentImages: RecentMedia[]
}

const TABS = [
  { id: 'core', label: 'Core' },
  { id: 'seo', label: 'SEO' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function IndustryEditorClient({ contentEditor, industry, recentImages }: Props) {
  const [tab, setTab] = useState<TabId>('seo')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  return (
    <AdminPageShell
      title={industry.name}
      sub={<span className="font-mono">/industries/{industry.slug}</span>}
      actions={
        <>
        {savedAt && (
          <span className="text-[12px] text-ih-success-ink">Saved at {savedAt}</span>
        )}
        <Link
          href="/admin/industries"
          className="flex h-8 items-center rounded-lg border border-ih-border-strong px-2.5 text-[14px] font-medium text-ih-ink transition-colors hover:bg-ih-surface-2"
        >
          ← All industries
        </Link>
        </>
      }
    >

      <div className="mb-6 flex border-b border-ih-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2.5 text-[14px] font-medium ${
              tab === t.id
                ? 'border-ih-accent text-ih-ink'
                : 'border-transparent text-ih-muted hover:text-ih-ink-2'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Same fix as the brand editor: this was nested inside the topbar's
          back-link anchor. See BrandEditorClient for the full note. */}
      {tab === 'core' && contentEditor}

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
    </AdminPageShell>
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
