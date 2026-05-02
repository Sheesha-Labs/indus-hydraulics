/**
 * Shared SEO OS types. Prisma-free so the storefront and admin can both use
 * them and so the domain layer stays unit-testable.
 *
 * Keep these in lock-step with `packages/db/prisma/schema.prisma` enums.
 */

export type SeoEntityType =
  | 'product'
  | 'category'
  | 'brand'
  | 'industry'
  | 'cms_page'
  | 'blog_post'

export type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

export type AiPromptKind =
  | 'meta_title'
  | 'meta_description'
  | 'schema_description'
  | 'alt_text'
  | 'faq'
  | 'long_description'
  | 'focus_keywords'

export type AiSuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'superseded'

/**
 * Path segment used by each entity type. The storefront URL is
 * `${origin}/${URL_SEGMENTS[entityType]}/${slug}`.
 */
export const URL_SEGMENTS: Record<SeoEntityType, string> = {
  product: 'p',
  category: 'c',
  brand: 'brands',
  industry: 'industries',
  cms_page: '',
  blog_post: 'blog',
}

/** Default sitemap priority + changefreq when an entity has no override. */
export const SITEMAP_DEFAULTS: Record<
  SeoEntityType,
  { priority: number; changeFrequency: ChangeFreq }
> = {
  product: { priority: 0.8, changeFrequency: 'weekly' },
  category: { priority: 0.7, changeFrequency: 'weekly' },
  brand: { priority: 0.6, changeFrequency: 'monthly' },
  industry: { priority: 0.6, changeFrequency: 'monthly' },
  cms_page: { priority: 0.5, changeFrequency: 'monthly' },
  blog_post: { priority: 0.5, changeFrequency: 'monthly' },
}

/** Optimal length ranges for SEO copy. Centralised so admin + scoring agree. */
export const TITLE_RANGE = { min: 30, max: 60 } as const
export const DESCRIPTION_RANGE = { min: 120, max: 160 } as const
