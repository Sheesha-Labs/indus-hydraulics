import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import { asFooterSocialPlatform, type FooterSocialPlatform } from '@indus/domain'

export type ResolvedFooterSocial = {
  id: string
  label: string
  platform: FooterSocialPlatform
  href: string
}

/**
 * The footer's social profiles, in editor order.
 *
 * Read once for two consumers that must not disagree: the pill row in
 * `SiteFooter`, and the Organization JSON-LD's `sameAs` in the storefront
 * layout. Before this existed the latter came from
 * `NEXT_PUBLIC_SOCIAL_PROFILES` and the former did not exist at all — so the
 * list a search engine used to connect this site to its LinkedIn was editable
 * only with deploy access, and nothing on the page ever corroborated it.
 *
 * Hidden rows are filtered here rather than by each caller. `isVisible` is the
 * editor's way of parking a profile that is not live yet, and a `sameAs`
 * entry pointing at an empty account is worse than no entry.
 */
const loadSocials = unstable_cache(
  async () => {
    return db.footerSocial
      .findMany({
        where: { isVisible: true },
        orderBy: { position: 'asc' },
        select: { id: true, label: true, platform: true, href: true },
      })
      .catch(() => [])
  },
  ['footer-socials'],
  { revalidate: 3600, tags: ['footer-socials'] },
)

export const getFooterSocials = cache(async (): Promise<ResolvedFooterSocial[]> => {
  const rows = await loadSocials()
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    // Resolved, not asserted: a `platform` written by hand in SQL, or left
    // behind when a platform was dropped from the list, becomes `other` and
    // still renders instead of throwing inside the footer of every page.
    platform: asFooterSocialPlatform(r.platform),
    href: r.href,
  }))
})
