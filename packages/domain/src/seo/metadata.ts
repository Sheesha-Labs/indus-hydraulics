/**
 * Pure helper that maps SEO OS entity overrides to a Next 15 `Metadata` object.
 *
 * Every storefront `generateMetadata()` should funnel through this so that
 * canonical, robots, OG, and title-template behaviour is consistent across
 * Product / Category / Brand / Industry / Blog / CMS pages.
 *
 * Returns a plain object — keep this file Next-version-agnostic by NOT
 * importing the Next type here. The caller can `as const` it or assign to
 * `Metadata` at the call site.
 */

import { TITLE_RANGE } from './types'

export type RobotsDirective = {
  index: boolean
  follow: boolean
}

export type BuildMetadataInput = {
  /** Entity-specific or fallback title (without template applied). */
  title: string | null | undefined
  /** Entity-specific or fallback description. */
  description: string | null | undefined
  /** The actual page URL. Used for canonical fallback if no override. */
  pageUrl: string
  /** Optional explicit canonical override from the entity. */
  canonicalUrl?: string | null
  /** Per-entity robots meta. */
  robots?: RobotsDirective
  /** OG image URL (already public — typically a Supabase Storage public URL). */
  ogImageUrl?: string | null
  /** Default title template, e.g. "%s — Indus Hydraulics". Falls back to plain title. */
  titleTemplate?: string | null
  /** Default description used when entity has none. */
  defaultDescription?: string | null
  /** Default OG image used when entity has none. */
  defaultOgImageUrl?: string | null
  /** Site name for og:site_name. */
  siteName?: string
}

export type BuiltMetadata = {
  title: string
  description: string
  alternates: { canonical: string }
  robots: { index: boolean; follow: boolean }
  openGraph: {
    title: string
    description: string
    url: string
    siteName?: string
    type: 'website'
    images?: { url: string }[]
  }
  twitter: {
    card: 'summary_large_image'
    title: string
    description: string
    images?: string[]
  }
}

export function buildMetadata(input: BuildMetadataInput): BuiltMetadata {
  const rawTitle = (input.title ?? '').trim()
  const titleApplied = applyTitleTemplate(rawTitle, input.titleTemplate ?? null)
  const description =
    (input.description ?? '').trim() || (input.defaultDescription ?? '').trim() || ''

  const canonical = (input.canonicalUrl?.trim() || input.pageUrl).replace(/\/$/, '') || input.pageUrl
  const ogImage = input.ogImageUrl ?? input.defaultOgImageUrl ?? undefined

  const robotsIndex = input.robots?.index ?? true
  const robotsFollow = input.robots?.follow ?? true

  const md: BuiltMetadata = {
    title: titleApplied,
    description,
    alternates: { canonical },
    robots: { index: robotsIndex, follow: robotsFollow },
    openGraph: {
      title: titleApplied,
      description,
      url: canonical,
      type: 'website',
      ...(input.siteName ? { siteName: input.siteName } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: titleApplied,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
  return md
}

/**
 * Apply the SeoSetting.defaultMetaTitleTemplate. The template uses `%s` as the
 * placeholder, mirroring Next's own templating convention. Empty template or
 * missing %s returns the title unchanged.
 *
 * If applying the template would push us past the SERP-friendly title length,
 * we fall back to the plain title. This stops "%s — Indus Hydraulics" from
 * inflating already-long titles past 60 chars.
 */
export function applyTitleTemplate(title: string, template: string | null): string {
  if (!title) return template?.replace('%s', '').trim() || ''
  if (!template || !template.includes('%s')) return title
  const applied = template.replace('%s', title)
  if (applied.length > TITLE_RANGE.max + 10) return title
  return applied
}
