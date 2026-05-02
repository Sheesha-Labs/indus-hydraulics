/**
 * Pure SEO health scorer. Deterministic, Prisma-free.
 *
 * Used in three places:
 *   1. Admin inspector grid — colour the health badge.
 *   2. Server actions that mutate SEO fields — recompute and persist score.
 *   3. Inngest nightly fan-out — recompute everything.
 *
 * Each check returns `{pass, weight, message}`. Score = round(100 * Σweighted_pass / Σweighted).
 * Higher weight = bigger lever. Adjust weights here, NOT at call sites, so the
 * meaning of a score stays consistent across the OS.
 */

import { TITLE_RANGE, DESCRIPTION_RANGE } from './types'

export type SeoHealthCheck = {
  id: string
  pass: boolean
  weight: number
  message: string
}

export type SeoHealthScore = {
  score: number // 0..100
  breakdown: SeoHealthCheck[]
}

export type ScoreInput = {
  title: string | null
  description: string | null
  focusKeyword: string | null
  /** Slug or full URL — only used for keyword-in-URL check. */
  url: string | null
  /** First non-heading paragraph of the rendered page, lower-cased. */
  firstParagraph?: string | null
  /** % of images that have non-empty alt text (0..1). */
  altCoverage?: number
  /** Count of internal incoming links (rough: from SeoAuditLog/CrawlEdge). */
  internalIncoming?: number
  /** Count of internal outgoing links to other indexable pages. */
  internalOutgoing?: number
  /** Whether a JSON-LD entity for the page will be emitted. */
  hasStructuredData: boolean
  /** Robots.meta indexable + canonical correctness. */
  isIndexable: boolean
  canonicalCorrect: boolean
  /** OG image present (per-entity override or global default). */
  ogComplete: boolean
  /** Flesch reading ease estimate. Optional; omit and the check is skipped. */
  readabilityFlesch?: number
}

const WEIGHTS = {
  titleLength: 10,
  descriptionLength: 10,
  keywordInTitle: 8,
  keywordInUrl: 5,
  keywordInFirstParagraph: 4,
  altCoverage: 10,
  internalIncoming: 8,
  internalOutgoing: 5,
  hasStructuredData: 10,
  indexableAndCanonical: 15,
  ogComplete: 5,
  readability: 5,
} as const

function inRange(value: number, min: number, max: number) {
  return value >= min && value <= max
}

export function scoreEntity(input: ScoreInput): SeoHealthScore {
  const checks: SeoHealthCheck[] = []
  const title = (input.title ?? '').trim()
  const description = (input.description ?? '').trim()
  const keyword = (input.focusKeyword ?? '').trim().toLowerCase()
  const titleLower = title.toLowerCase()
  const url = (input.url ?? '').toLowerCase()
  const firstPara = (input.firstParagraph ?? '').toLowerCase()

  checks.push({
    id: 'titleLength',
    pass: inRange(title.length, TITLE_RANGE.min, TITLE_RANGE.max),
    weight: WEIGHTS.titleLength,
    message:
      title.length === 0
        ? 'Title is missing'
        : title.length < TITLE_RANGE.min
          ? `Title is short (${title.length} chars; aim for ${TITLE_RANGE.min}–${TITLE_RANGE.max})`
          : title.length > TITLE_RANGE.max
            ? `Title is long (${title.length} chars; aim for ${TITLE_RANGE.min}–${TITLE_RANGE.max})`
            : 'Title length is in the optimal range',
  })

  checks.push({
    id: 'descriptionLength',
    pass: inRange(description.length, DESCRIPTION_RANGE.min, DESCRIPTION_RANGE.max),
    weight: WEIGHTS.descriptionLength,
    message:
      description.length === 0
        ? 'Description is missing'
        : description.length < DESCRIPTION_RANGE.min
          ? `Description is short (${description.length} chars; aim for ${DESCRIPTION_RANGE.min}–${DESCRIPTION_RANGE.max})`
          : description.length > DESCRIPTION_RANGE.max
            ? `Description is long (${description.length} chars; aim for ${DESCRIPTION_RANGE.min}–${DESCRIPTION_RANGE.max})`
            : 'Description length is in the optimal range',
  })

  if (keyword) {
    checks.push({
      id: 'keywordInTitle',
      pass: titleLower.includes(keyword),
      weight: WEIGHTS.keywordInTitle,
      message: titleLower.includes(keyword)
        ? 'Focus keyword appears in title'
        : 'Focus keyword is missing from the title',
    })
    checks.push({
      id: 'keywordInUrl',
      pass: url.includes(keyword.replace(/\s+/g, '-')) || url.includes(keyword),
      weight: WEIGHTS.keywordInUrl,
      message: 'Focus keyword should appear in the URL slug',
    })
    if (firstPara) {
      checks.push({
        id: 'keywordInFirstParagraph',
        pass: firstPara.includes(keyword),
        weight: WEIGHTS.keywordInFirstParagraph,
        message: 'Focus keyword should appear in the first paragraph',
      })
    }
  }

  if (typeof input.altCoverage === 'number') {
    const pct = Math.max(0, Math.min(1, input.altCoverage))
    checks.push({
      id: 'altCoverage',
      pass: pct >= 0.9,
      weight: WEIGHTS.altCoverage,
      message:
        pct >= 0.9
          ? `Image alt coverage ${(pct * 100).toFixed(0)}%`
          : `Only ${(pct * 100).toFixed(0)}% of images have alt text`,
    })
  }

  if (typeof input.internalIncoming === 'number') {
    checks.push({
      id: 'internalIncoming',
      pass: input.internalIncoming >= 1,
      weight: WEIGHTS.internalIncoming,
      message:
        input.internalIncoming >= 1
          ? `Linked from ${input.internalIncoming} other page(s)`
          : 'No internal pages link to this URL — risk of orphan',
    })
  }

  if (typeof input.internalOutgoing === 'number') {
    checks.push({
      id: 'internalOutgoing',
      pass: input.internalOutgoing >= 3,
      weight: WEIGHTS.internalOutgoing,
      message:
        input.internalOutgoing >= 3
          ? `Has ${input.internalOutgoing} outgoing internal link(s)`
          : 'Add more internal links to related pages',
    })
  }

  checks.push({
    id: 'hasStructuredData',
    pass: input.hasStructuredData,
    weight: WEIGHTS.hasStructuredData,
    message: input.hasStructuredData
      ? 'JSON-LD structured data is present'
      : 'No JSON-LD will be emitted for this page',
  })

  checks.push({
    id: 'indexableAndCanonical',
    pass: input.isIndexable && input.canonicalCorrect,
    weight: WEIGHTS.indexableAndCanonical,
    message:
      !input.isIndexable
        ? 'Page is not indexable (robots noindex)'
        : !input.canonicalCorrect
          ? 'Canonical URL looks incorrect'
          : 'Page is indexable with a correct canonical',
  })

  checks.push({
    id: 'ogComplete',
    pass: input.ogComplete,
    weight: WEIGHTS.ogComplete,
    message: input.ogComplete
      ? 'Open Graph image is configured'
      : 'No OG image — social shares will look empty',
  })

  if (typeof input.readabilityFlesch === 'number') {
    checks.push({
      id: 'readability',
      pass: input.readabilityFlesch >= 50,
      weight: WEIGHTS.readability,
      message:
        input.readabilityFlesch >= 50
          ? `Readability score ${input.readabilityFlesch.toFixed(0)}`
          : 'Description reads as too dense; simplify language',
    })
  }

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0)
  const weightedPass = checks
    .filter((c) => c.pass)
    .reduce((sum, c) => sum + c.weight, 0)
  const score = totalWeight === 0 ? 0 : Math.round((100 * weightedPass) / totalWeight)

  return { score, breakdown: checks }
}

export function bandForScore(score: number): 'good' | 'warn' | 'danger' {
  if (score >= 80) return 'good'
  if (score >= 50) return 'warn'
  return 'danger'
}
