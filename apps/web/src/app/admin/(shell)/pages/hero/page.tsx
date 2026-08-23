import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { db } from '@indus/db'
import HomepageHeroPanel, { type HeroSlideRow } from './HomepageHeroPanel'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Homepage carousel — Indus Admin' }

export const dynamic = 'force-dynamic'

type Props = { params: Promise<Record<string, never>> }

/**
 * The homepage hero carousel.
 *
 * Its own route rather than a tab, because it is not a page — it is the
 * imagery inside one section of one page. The Home master page's hero section
 * points at it, and this is the only place the slides are ordered.
 */
export default async function HomepageHeroPage({ params }: Props) {
  await params

  const slides = (await db.homepageHeroSlide.findMany({
    orderBy: { position: 'asc' },
    include: {
      media: {
        select: { id: true, storagePath: true, originalFilename: true, width: true, height: true },
      },
    },
  })) as HeroSlideRow[]

  return (
    <AdminPageShell
      title="Homepage carousel"
      breadcrumbs={
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1 text-ih-muted transition-colors hover:text-ih-ink"
        >
          <ChevronLeft size={12} strokeWidth={1.8} aria-hidden="true" />
          Pages &amp; Blocks
        </Link>
      }
      sub={undefined}
    >
      <p className="mb-6 max-w-[74ch] text-[13px] leading-[1.55] text-ih-muted">
        The visual on the right of the homepage hero. With no slides uploaded the hero falls back to
        the built-in placeholder, so removing the last one is safe.
      </p>
      <HomepageHeroPanel slides={slides} />
    </AdminPageShell>
  )
}
