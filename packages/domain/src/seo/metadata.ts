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
  /**
   * Set for an article. Switches `og:type` to `article` and adds its dates,
   * section and tags — LinkedIn and Slack read these for the share card.
   */
  article?: {
    publishedTime?: Date | null
    modifiedTime?: Date | null
    section?: string | null
    tags?: string[] | null
    /** Author profile URLs. */
    authors?: string[] | null
  } | null
}

/**
 * A title the caller has already templated is handed to Next as `absolute`,
 * so the storefront layout's `%s | Indus Hydraulics` is not applied on top.
 */
export type BuiltTitle = string | { absolute: string }

export type BuiltOpenGraphArticle = {
  type: 'article'
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  authors?: string[]
}

export type BuiltMetadata = {
  title: BuiltTitle
  description: string
  alternates: { canonical: string }
  robots: { index: boolean; follow: boolean }
  openGraph: {
    title: string
    description: string
    url: string
    siteName?: string
    images?: { url: string }[]
  } & ({ type: 'website' } | BuiltOpenGraphArticle)
  twitter: {
    card: 'summary_large_image'
    title: string
    description: string
    images?: string[]
  }
}

export function buildMetadata(input: BuildMetadataInput): BuiltMetadata {
  const rawTitle = stripTrailingSiteName((input.title ?? '').trim(), input.siteName)
  const titleApplied = applyTitleTemplate(rawTitle, input.titleTemplate ?? null)
  // The SEO console's default template and the storefront layout's
  // `title.template` are two templates for one job. Applying the first here
  // and letting Next apply the second rendered "Foo — Indus Hydraulics |
  // Indus Hydraulics" on every page the moment anyone filled the field in.
  // When ours applied, it is the whole title.
  const templated = titleApplied !== rawTitle && titleApplied.length > 0
  const description =
    (input.description ?? '').trim() || (input.defaultDescription ?? '').trim() || ''

  const canonical = (input.canonicalUrl?.trim() || input.pageUrl).replace(/\/$/, '') || input.pageUrl
  const ogImage = input.ogImageUrl ?? input.defaultOgImageUrl ?? undefined

  const robotsIndex = input.robots?.index ?? true
  const robotsFollow = input.robots?.follow ?? true

  const md: BuiltMetadata = {
    title: templated ? { absolute: titleApplied } : titleApplied,
    description,
    alternates: { canonical },
    robots: { index: robotsIndex, follow: robotsFollow },
    openGraph: {
      title: titleApplied,
      description,
      url: canonical,
      ...(input.article ? openGraphArticle(input.article) : { type: 'website' as const }),
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

function openGraphArticle(a: NonNullable<BuildMetadataInput['article']>): BuiltOpenGraphArticle {
  const out: BuiltOpenGraphArticle = { type: 'article' }
  if (a.publishedTime) out.publishedTime = a.publishedTime.toISOString()
  if (a.modifiedTime) out.modifiedTime = a.modifiedTime.toISOString()
  if (a.section) out.section = a.section
  const tags = (a.tags ?? []).map((t) => t.trim()).filter(Boolean)
  if (tags.length > 0) out.tags = tags
  const authors = (a.authors ?? []).filter(Boolean)
  if (authors.length > 0) out.authors = authors
  return out
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
/**
 * Drop a site-name suffix the stored title already carries.
 *
 * The storefront layout sets `template: '%s | Indus Hydraulics'`, so Next
 * appends the site name to every page title. 1,163 catalogue rows were seeded
 * with the suffix baked into `seoTitle` as well, and every one of those pages
 * rendered "… | Indus Hydraulics | Indus Hydraulics".
 *
 * The stored data is corrected separately; this keeps the rendered title right
 * even if a bad value is entered again later. Only an exact trailing match is
 * removed, and never the whole title — a page legitimately titled just
 * "Indus Hydraulics" keeps its name.
 */
export function stripTrailingSiteName(title: string, siteName?: string): string {
  if (!title || !siteName) return title
  const escaped = siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
  // A pipe, a hyphen, or an en or em dash — "Foo — Indus Hydraulics" doubled
  // up exactly like "Foo | Indus Hydraulics" did, on the hand-written titles.
  const suffix = new RegExp(`\\s*[|\\-\u2013\u2014]\\s*${escaped}\\s*$`, 'i')
  let out = title.trim()
  while (suffix.test(out)) {
    const next = out.replace(suffix, '').trim()
    if (!next) break
    out = next
  }
  return out
}

export function applyTitleTemplate(title: string, template: string | null): string {
  if (!title) return template?.replace('%s', '').trim() || ''
  if (!template || !template.includes('%s')) return title
  const applied = template.replace('%s', title)
  if (applied.length > TITLE_RANGE.max + 10) return title
  return applied
}
