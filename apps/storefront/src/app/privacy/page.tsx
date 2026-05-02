import type { Metadata } from 'next'
import { db } from '@indus/db'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Privacy Policy' }

type Props = { params: Promise<Record<string, never>> }

export default async function PrivacyPage({ params }: Props) {
  await params

  // Prefer admin-managed CmsPage if marketing has published one.
  const cms = await db.cmsPage.findUnique({
    where: { slug: 'privacy' },
  })

  if (cms?.isPublished) {
    return (
      <article className="max-w-[820px] mx-auto px-8 py-16 pb-24 prose prose-sm">
        <h1 className="text-[36px] font-semibold tracking-tight mb-2">{cms.title}</h1>
        <div
          className="text-[15px] leading-[1.7] text-[var(--color-body)]"
          dangerouslySetInnerHTML={{ __html: cms.body }}
        />
      </article>
    )
  }

  if (cms) {
    // Exists but not published — treat as 404 to the public.
    notFound()
  }

  // Fallback: a clear placeholder so the link from the footer doesn't break.
  return (
    <div className="max-w-[820px] mx-auto px-8 py-16 pb-24">
      <h1 className="text-[36px] font-semibold tracking-tight mb-3">Privacy Policy</h1>
      <p className="text-[15px] text-[var(--color-muted)] leading-[1.7] mb-3">
        The privacy policy for Indus Hydraulics is currently being prepared.
      </p>
      <p className="text-[14px] text-[var(--color-muted)] leading-[1.7]">
        For privacy-related enquiries, please contact{' '}
        <a className="text-[var(--color-accent)] hover:underline" href="mailto:privacy@indushydraulics.com">
          privacy@indushydraulics.com
        </a>
        .
      </p>
    </div>
  )
}
