import type { Metadata } from 'next'
import { db } from '@indus/db'
import { auth } from '../../../../lib/auth'
import { redirect } from 'next/navigation'
import SeoPageClient from '../../../../components/SeoPageClient'

export const metadata: Metadata = { title: 'SEO — Indus Admin' }

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ tab?: string }> }

export default async function SeoPage({ params, searchParams }: Props) {
  const session = await auth()
  if (!session) redirect('/sign-in')

  const { tab = 'settings' } = await searchParams

  const [seoSetting, redirects] = await Promise.all([
    db.seoSetting.findFirst(),
    db.redirect.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">SEO</h1>
        <p className="text-[13px] text-[var(--color-muted)] mt-1">
          Meta templates, redirects, robots.txt, and sitemap settings.
        </p>
      </div>

      <SeoPageClient
        activeTab={tab}
        seoSetting={seoSetting}
        redirects={redirects}
      />
    </div>
  )
}
