import type { Metadata } from 'next'
import { db } from '@indus/db'
import { notFound } from 'next/navigation'
import PolicyPage from '../../../components/PolicyPage'
import { getMasterPageContent } from '../../../lib/page-content'

export const metadata: Metadata = { title: 'Privacy Policy' }

// Legal page rarely changes; cache for 1 hour.
export const revalidate = 3600

type Props = { params: Promise<Record<string, never>> }

/**
 * The privacy policy.
 *
 * TWO CONTENT SOURCES, in this order:
 *
 *  1. A published `cms_pages` row with slug `privacy` replaces the WHOLE body
 *     with its own rich text. That is the escape hatch for a lawyer-supplied
 *     document that does not fit the clause structure, and it predates the
 *     section editor.
 *  2. Otherwise the clauses come from Pages & Blocks · Privacy policy, where
 *     each is a section that can be re-worded, hidden or reordered.
 *
 * An UNPUBLISHED row still 404s the page, which is the pre-existing "the
 * policy is being rewritten, do not serve the old one" behaviour.
 */
export default async function PrivacyPage({ params }: Props) {
  await params

  const [cms, content] = await Promise.all([
    db.cmsPage.findUnique({ where: { slug: 'privacy' } }),
    getMasterPageContent('privacy'),
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

  return <PolicyPage slug="privacy" content={content} />
}
