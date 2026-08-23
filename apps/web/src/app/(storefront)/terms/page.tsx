import type { Metadata } from 'next'
import { db } from '@indus/db'
import { notFound } from 'next/navigation'
import PolicyPage from '../../../components/PolicyPage'
import { getMasterPageContent } from '../../../lib/page-content'

export const metadata: Metadata = { title: 'Terms & Conditions' }

// Legal page rarely changes; cache for 1 hour.
export const revalidate = 3600

type Props = { params: Promise<Record<string, never>> }

/** Same two-source contract as /privacy — see the docblock there. */
export default async function TermsPage({ params }: Props) {
  await params

  const [cms, content] = await Promise.all([
    db.cmsPage.findUnique({ where: { slug: 'terms' } }),
    getMasterPageContent('terms'),
  ])

  if (cms?.isPublished) {
    return (
      <article className="max-w-[820px] mx-auto px-8 py-16 pb-24">
        <h1 className="text-[36px] font-semibold tracking-tight mb-2">{cms.title}</h1>
        <div
          className="ih-rich-text text-[15px] leading-[1.7]"
          dangerouslySetInnerHTML={{ __html: cms.body }}
        />
      </article>
    )
  }

  if (cms) notFound()

  return <PolicyPage slug="terms" content={content} />
}
