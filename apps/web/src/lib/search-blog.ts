import { db, Prisma } from '@indus/db'

/**
 * Storefront blog search.
 *
 * Mirrors the product FTS path but against `blog_posts.search_tsv` (the
 * STORED generated tsvector from migration 005_blog_fts.sql). No synonym
 * expansion or boost system here — the blog is small enough that the
 * weighted A→B→C tsquery rank is the right primitive. If the blog grows
 * past a few hundred posts this can pick up the same `expandSynonyms` /
 * `SearchBoost` plumbing the product path uses.
 *
 * Returns ordered post IDs + a per-id score map. The caller fetches the
 * full posts with whatever includes it needs.
 */

export type BlogSearchResult = {
  postIds: string[]
  scoreById: Map<string, number>
}

const BLOG_FETCH_LIMIT = 60

export async function runBlogSearch(rawQuery: string): Promise<BlogSearchResult> {
  const trimmed = rawQuery.trim()
  if (trimmed.length < 2) {
    return { postIds: [], scoreById: new Map() }
  }

  // Use websearch_to_tsquery so the same operator semantics ("foo bar"
  // → AND, "foo OR bar" → OR, etc.) the customer learned from the
  // product search apply here. It's also the most forgiving on raw
  // user input — falls back to plain word-AND on garbage.
  const rows = await db.$queryRaw<Array<{ id: string; score: number }>>(Prisma.sql`
    SELECT bp.id::text AS id,
           ts_rank_cd(bp.search_tsv, websearch_to_tsquery('english', ${trimmed})) AS score
    FROM blog_posts bp
    WHERE bp."isPublished" = TRUE
      AND bp.search_tsv @@ websearch_to_tsquery('english', ${trimmed})
    ORDER BY score DESC, bp."publishedAt" DESC NULLS LAST
    LIMIT ${BLOG_FETCH_LIMIT}
  `)

  return {
    postIds: rows.map((r) => r.id),
    scoreById: new Map(rows.map((r) => [r.id, Number(r.score)])),
  }
}
