import type { Metadata } from 'next'
import { buildMetadata, type BuildMetadataInput } from '@indus/domain'
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

export type StorefrontMetaInput = Omit<BuildMetadataInput, 'pageUrl' | 'siteName'> & {
  /** Path-only, e.g. "/p/foo". */
  path: string
  /** Storage path to the OG image (R2 or absolute URL). */
  ogImagePath?: string | null
}

export function pageMetadata(input: StorefrontMetaInput): Metadata {
  const ogUrl = input.ogImagePath ? mediaUrl(input.ogImagePath) : null
  const md = buildMetadata({
    title: input.title,
    description: input.description,
    pageUrl: `${BASE_URL}${input.path}`,
    canonicalUrl: input.canonicalUrl,
    robots: input.robots,
    ogImageUrl: ogUrl,
    titleTemplate: input.titleTemplate,
    defaultDescription: input.defaultDescription,
    defaultOgImageUrl: input.defaultOgImageUrl,
    siteName: SITE_NAME,
  })
  return md as Metadata
}

export function urlFor(path: string): string {
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
