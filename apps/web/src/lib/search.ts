import { db, Prisma } from '@indus/db'
import { extractExactSkuQuery, planSearch, type SynonymGroup } from '@indus/domain'

/**
 * Storefront search engine.
 *
 * Steps:
 *   1. Load admin-managed synonyms + search redirects + active boosts.
 *   2. `planSearch` from @indus/domain decides whether to issue a redirect
 *      or build a websearch_to_tsquery expression with synonym expansion.
 *   3. Run an FTS query against `products.search_tsv` (the GENERATED
 *      tsvector column from migration 001_seo_fts.sql) joined to
 *      `search_boosts` so per-entity boosts are applied at rank time.
 *   4. If the FTS pass returns nothing, fall back to `pg_trgm` similarity
 *      across sku / mpn / title — handles typos in SKU/MPN.
 *
 * Returns ranked product IDs + per-id score. The caller is responsible
 * for fetching full product rows (with the brand/category facet filters
 * applied) and ordering them by `scoreById`.
 */

export type SearchPlan =
  | { kind: 'redirect'; targetUrl: string }
  | {
      kind: 'results'
      /** Ordered product IDs, highest-scoring first. */
      productIds: string[]
      /** Score per id. */
      scoreById: Map<string, number>
      /** True when the FTS pass found nothing and we used pg_trgm. */
      usedFallback: boolean
      /** Final tsquery expression used (for debugging). */
      tsqueryExpression: string | null
    }

// Up to ~25 pages × 24 results = 600 ranked products per FTS pass.
// MAX_PAGES in @indus/domain caps the visible pager at 25; this ceiling
// keeps the pager honest without blowing up the result-set memory.
const FTS_FETCH_LIMIT = 600

export async function runSearch(rawQuery: string): Promise<SearchPlan> {
  const trimmed = rawQuery.trim()
  if (trimmed.length < 2) {
    return {
      kind: 'results',
      productIds: [],
      scoreById: new Map(),
      usedFallback: false,
      tsqueryExpression: null,
    }
  }

  // Exact-SKU short-circuit: if the query looks like a single SKU/MPN
  // identifier (hyphenated or with digits), check the products table for
  // an exact match. A hit redirects straight to the PDP — by far the
  // most common B2B procurement workflow ("I have the part number, take
  // me to the page"). On miss, fall through to the normal pipeline.
  const skuCandidate = extractExactSkuQuery(trimmed)
  if (skuCandidate) {
    const exact = await db.product.findFirst({
      where: {
        status: 'active',
        OR: [
          { sku: { equals: skuCandidate, mode: 'insensitive' } },
          { mpn: { equals: skuCandidate, mode: 'insensitive' } },
        ],
      },
      select: { sku: true },
    })
    if (exact) {
      return { kind: 'redirect', targetUrl: `/p/${exact.sku}` }
    }

    // Same short-circuit, one step out: the identifier a procurement buyer
    // pastes is very often NOT our listing SKU. It is the size-level part
    // number under a listing, or the competitor part number the listing
    // replaces — neither of which lives on `products`. Both take you to
    // exactly one page, so both deserve the jump rather than a results list.
    //
    // Variants first: an exact hit there is our own number and unambiguous.
    // Cross-references can legitimately fan out to several products (two
    // Indus parts superseding one competitor part), so a redirect is only
    // correct when there is exactly one.
    const variantHit = await db.productVariant.findFirst({
      where: {
        partNumber: { equals: skuCandidate, mode: 'insensitive' },
        product: { status: 'active' },
      },
      select: { product: { select: { sku: true } } },
    })
    if (variantHit) {
      return { kind: 'redirect', targetUrl: `/p/${variantHit.product.sku}` }
    }

    const variantEquivalents = await db.productVariant.findMany({
      where: {
        competitorMpn: { equals: skuCandidate, mode: 'insensitive' },
        product: { status: 'active' },
      },
      select: { product: { select: { sku: true } } },
      take: 2,
    })
    const equivalentSkus = new Set(variantEquivalents.map((v) => v.product.sku))
    if (equivalentSkus.size === 1) {
      return { kind: 'redirect', targetUrl: `/p/${[...equivalentSkus][0]!}` }
    }

    if (equivalentSkus.size === 0) {
      const crossRefs = await db.productCrossReference.findMany({
        where: {
          competitorMpn: { equals: skuCandidate, mode: 'insensitive' },
          product: { status: 'active' },
        },
        select: { product: { select: { sku: true } } },
        take: 2,
      })
      const crossRefSkus = new Set(crossRefs.map((r) => r.product.sku))
      if (crossRefSkus.size === 1) {
        return { kind: 'redirect', targetUrl: `/p/${[...crossRefSkus][0]!}` }
      }
    }
  }

  const [synonymRows, redirectRows] = await Promise.all([
    db.searchSynonym.findMany({
      where: { isActive: true },
      select: { group: true, term: true },
    }),
    db.searchRedirect.findMany({
      where: { isActive: true },
      select: { query: true, targetUrl: true },
    }),
  ])

  const synonyms = groupSynonyms(synonymRows)

  const plan = planSearch({
    rawQuery: trimmed,
    synonyms,
    redirects: redirectRows.map((r) => ({ query: r.query, targetUrl: r.targetUrl })),
    boosts: [], // boost is joined in SQL below
  })

  if (plan.kind === 'redirect') {
    return { kind: 'redirect', targetUrl: plan.targetUrl }
  }

  if (!plan.tsqueryExpression) {
    return {
      kind: 'results',
      productIds: [],
      scoreById: new Map(),
      usedFallback: false,
      tsqueryExpression: null,
    }
  }

  // FTS pass.
  // Column names use Prisma's camelCase (quoted) — Prisma does not @map
  // these tables to snake_case so the underlying columns are camelCase.
  const ftsRows = await db.$queryRaw<Array<{ id: string; score: number }>>(Prisma.sql`
    SELECT p.id::text AS id,
           ts_rank_cd(p.search_tsv, websearch_to_tsquery('english', ${plan.tsqueryExpression}))
             * COALESCE(b.boost, 1.0) AS score
    FROM products p
    LEFT JOIN search_boosts b
      ON b."entityType"::text = 'product'
     AND b."entityId" = p.id
     AND (b."expiresAt" IS NULL OR b."expiresAt" > NOW())
    WHERE p.status::text = 'active'
      AND p.search_tsv @@ websearch_to_tsquery('english', ${plan.tsqueryExpression})
    ORDER BY score DESC, p.title ASC
    LIMIT ${FTS_FETCH_LIMIT}
  `)

  if (ftsRows.length > 0) {
    return {
      kind: 'results',
      productIds: ftsRows.map((r) => r.id),
      scoreById: new Map(ftsRows.map((r) => [r.id, Number(r.score)])),
      usedFallback: false,
      tsqueryExpression: plan.tsqueryExpression,
    }
  }

  // pg_trgm fallback — typo-tolerant similarity over identifying fields.
  //
  // `searchAliases` is in here for the same reason it is in `search_tsv`: the
  // identifier a buyer mistypes is as likely to be a competitor part number or
  // a size-level part number as it is to be our listing SKU. It is scored at
  // 0.9 of its raw similarity so that, on a tie, the product whose OWN sku
  // matches still outranks one that merely lists the string as an alias — the
  // alias blob is long, and long haystacks make cheap matches.
  const trgmRows = await db.$queryRaw<Array<{ id: string; score: number }>>(Prisma.sql`
    SELECT p.id::text AS id,
           GREATEST(
             similarity(p.sku, ${plan.trigramTerm}),
             similarity(COALESCE(p.mpn, ''), ${plan.trigramTerm}),
             similarity(p.title, ${plan.trigramTerm}),
             similarity(COALESCE(p."searchAliases", ''), ${plan.trigramTerm}) * 0.9
           ) AS score
    FROM products p
    WHERE p.status::text = 'active'
      AND (
        p.sku % ${plan.trigramTerm}
        OR COALESCE(p.mpn, '') % ${plan.trigramTerm}
        OR p.title % ${plan.trigramTerm}
        OR COALESCE(p."searchAliases", '') % ${plan.trigramTerm}
      )
    ORDER BY score DESC
    LIMIT ${FTS_FETCH_LIMIT}
  `)

  return {
    kind: 'results',
    productIds: trgmRows.map((r) => r.id),
    scoreById: new Map(trgmRows.map((r) => [r.id, Number(r.score)])),
    usedFallback: true,
    tsqueryExpression: plan.tsqueryExpression,
  }
}

function groupSynonyms(rows: { group: string; term: string }[]): SynonymGroup[] {
  const map = new Map<string, string[]>()
  for (const r of rows) {
    const list = map.get(r.group)
    if (list) list.push(r.term)
    else map.set(r.group, [r.term])
  }
  return Array.from(map.entries()).map(([group, terms]) => ({ group, terms }))
}

/**
 * Lightweight prefix-search for autocomplete. Returns up to `limit` rows
 * by ts_rank against a prefix tsquery (`term:*`). Pure SQL because we
 * want it fast and we don't need synonym expansion at this granularity.
 */
export async function runAutocomplete(
  rawQuery: string,
  limit = 8,
): Promise<Array<{ id: string; sku: string; title: string; brandName: string | null; categorySlug: string | null }>> {
  const trimmed = rawQuery.trim()
  if (trimmed.length < 1) return []
  const prefix = trimmed.replace(/[^a-z0-9\s\-]/gi, ' ').split(/\s+/).filter(Boolean).join(' & ')
  if (!prefix) return []
  const tsQuery = `${prefix}:*`

  return db.$queryRaw<
    Array<{ id: string; sku: string; title: string; brandName: string | null; categorySlug: string | null }>
  >(Prisma.sql`
    SELECT p.id::text AS id,
           p.sku,
           p.title,
           br.name AS "brandName",
           c.slug AS "categorySlug"
    FROM products p
    LEFT JOIN brands br ON p."brandId" = br.id
    LEFT JOIN categories c ON p."categoryId" = c.id
    WHERE p.status::text = 'active'
      AND p.search_tsv @@ to_tsquery('english', ${tsQuery})
    ORDER BY ts_rank_cd(p.search_tsv, to_tsquery('english', ${tsQuery})) DESC
    LIMIT ${limit}
  `)
}
