import type { Metadata } from 'next'
import { buildMetadata, type BuildMetadataInput } from '@indus/domain'
import { toCrawlableMediaUrl } from './crawlable-media'
import { mediaUrl } from './media'

/**
 * Storefront wrapper around the domain `buildMetadata` helper. Reads the
 * site origin from `NEXT_PUBLIC_BASE_URL` (matching `app/layout.tsx`),
 * resolves OG image storage paths, and casts to Next's `Metadata` type.
 */

export const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com'
).replace(/\/$/, '')

export const SITE_NAME = 'Indus Hydraulics'

/**
 * Stable @id for the Organization JSON-LD node, exported so any entity
 * (Product seller, LocalBusiness parent, Article publisher) can reference
 * the same Organization without round-tripping through layout.tsx.
 */
export const ORG_ID = `${BASE_URL}#organization`

export type StorefrontMetaInput = Omit<BuildMetadataInput, 'pageUrl' | 'siteName'> & {
  /** Path-only, e.g. "/p/foo". */
  path: string
  /** Storage path to the OG image (R2 or absolute URL). */
  ogImagePath?: string | null
}

/**
 * The URL to give a crawler for a stored image: same-origin when it lives in
 * public storage, so it is not served `x-robots-tag: none`. See
 * `lib/crawlable-media.ts`. For JSON-LD, Open Graph and the image sitemap —
 * on-page `<Image>` sources keep `mediaUrl`.
 */
export function crawlableImageUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null
  const url = mediaUrl(storagePath)
  return url ? toCrawlableMediaUrl(url, BASE_URL) : null
}

export function pageMetadata(input: StorefrontMetaInput): Metadata {
  const ogUrl = crawlableImageUrl(input.ogImagePath)
  const md = buildMetadata({
    title: input.title,
    description: input.description,
    pageUrl: `${BASE_URL}${input.path}`,
    canonicalUrl: input.canonicalUrl,
    robots: input.robots,
    ogImageUrl: ogUrl,
    ogImageAlt: input.ogImageAlt,
    titleTemplate: input.titleTemplate,
    defaultDescription: input.defaultDescription,
    defaultOgImageUrl: input.defaultOgImageUrl,
    siteName: SITE_NAME,
    article: input.article,
  })
  return md as Metadata
}

export function urlFor(path: string): string {
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
