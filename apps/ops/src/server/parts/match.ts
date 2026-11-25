import 'server-only'
import { partNoNorm, type PartMatchMethod } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'

/**
 * Part matching for extracted lines (S08-T02, 06-map-schema §7.2). In order, stopping at the first hit for each
 * part number: our own parts (exact normal form) → their aliases → the website catalogue (variant part number,
 * product MPN, competitor cross-reference) → trigram similarity over our parts (> 0.6, top 5). Every step is ONE
 * query for all lines at once, never one per line.
 */
export interface PartMatch {
  norm: string
  method: PartMatchMethod
  partId: string | null
  catalogueProductId: string | null
  /** 0–1: 1 for an exact hit, the trigram similarity for a fuzzy one. */
  score: number
  /** How many past enquiry lines asked for this part ("seen on 3 past RFQs"). */
  seenOnRfqs: number
  /** For fuzzy: the other close parts. */
  alternatives: Array<{ partId: string; partNo: string; score: number }>
}

type Db = Pick<typeof opsDb, 'part' | 'partAlias' | 'enquiryLine' | '$queryRaw'>

const FUZZY_MIN = 0.6

export async function matchParts(
  rawPartNos: ReadonlyArray<string | null | undefined>,
  db: Db = opsDb
): Promise<Map<string, PartMatch>> {
  const out = new Map<string, PartMatch>()
  const norms = [...new Set(rawPartNos.map(partNoNorm).filter((n) => n.length >= 2))]
  if (!norms.length) return out
  const hit = (
    norm: string,
    m: Omit<PartMatch, 'norm' | 'seenOnRfqs' | 'alternatives'> & {
      alternatives?: PartMatch['alternatives']
    }
  ) => out.set(norm, { norm, seenOnRfqs: 0, alternatives: [], ...m })
  const left = () => norms.filter((n) => !out.has(n))

  // 1 · our parts, exact normal form
  const parts = await db.part.findMany({
    where: { partNoNorm: { in: norms }, archivedAt: null },
    select: { id: true, partNoNorm: true, catalogueProductId: true },
    orderBy: { timesAsked12m: 'desc' },
  })
  for (const p of parts)
    if (!out.has(p.partNoNorm))
      hit(p.partNoNorm, {
        method: 'exact',
        partId: p.id,
        catalogueProductId: p.catalogueProductId,
        score: 1,
      })

  // 2 · their aliases
  if (left().length) {
    const aliases = await db.partAlias.findMany({
      where: { norm: { in: left() } },
      select: { norm: true, partId: true, part: { select: { catalogueProductId: true } } },
    })
    for (const a of aliases)
      if (!out.has(a.norm))
        hit(a.norm, {
          method: 'alias',
          partId: a.partId,
          catalogueProductId: a.part.catalogueProductId,
          score: 1,
        })
  }

  // 3 · the website catalogue (owner-rights views over public; read only)
  if (left().length) {
    const rows = await db.$queryRaw<
      Array<{ norm: string; productId: string; how: 'catalogue' | 'cross_ref' }>
    >`
      SELECT v."partNumberNorm" AS norm, v."productId"::text AS "productId", 'catalogue' AS how
        FROM ops.catalogue_variant_v v WHERE v."partNumberNorm" = ANY(${left()}::text[])
      UNION ALL
      SELECT p."mpnNorm", p."id"::text, 'catalogue' FROM ops.catalogue_product_v p
       WHERE p."mpnNorm" <> '' AND p."mpnNorm" = ANY(${left()}::text[])
      UNION ALL
      SELECT x."competitorMpnNorm", x."productId"::text, 'cross_ref' FROM ops.catalogue_cross_ref_v x
       WHERE x."competitorMpnNorm" = ANY(${left()}::text[])`
    for (const r of rows)
      if (!out.has(r.norm))
        hit(r.norm, { method: r.how, partId: null, catalogueProductId: r.productId, score: 1 })
  }

  // 4 · trigram over our parts. documented raw query: pg_trgm similarity (CLAUDE.md §5.3), through the
  // ops.trgm_similarity wrapper because pg_trgm sits in a schema ops_app may not read.
  if (left().length) {
    const rows = await db.$queryRaw<
      Array<{ norm: string; id: string; partNo: string; score: number }>
    >`
      SELECT q.norm, c.id::text AS id, c."partNo" AS "partNo", c.score
        FROM unnest(${left()}::text[]) AS q(norm)
        CROSS JOIN LATERAL (
          SELECT p.id, p."partNo", ops.trgm_similarity(p."partNoNorm", q.norm) AS score
            FROM ops.part p
           WHERE p."archivedAt" IS NULL AND ops.trgm_similarity(p."partNoNorm", q.norm) > ${FUZZY_MIN}
           ORDER BY score DESC
           LIMIT 5
        ) c`
    const byNorm = new Map<string, typeof rows>()
    for (const r of rows) byNorm.set(r.norm, [...(byNorm.get(r.norm) ?? []), r])
    for (const [norm, list] of byNorm) {
      const [best, ...rest] = list
      if (!best) continue
      hit(norm, {
        method: 'fuzzy',
        partId: best.id,
        catalogueProductId: null,
        score: Number(best.score),
        alternatives: rest.map((r) => ({ partId: r.id, partNo: r.partNo, score: Number(r.score) })),
      })
    }
  }

  // History: how often each matched part was asked for before (one grouped read).
  const partIds = [...new Set([...out.values()].flatMap((m) => (m.partId ? [m.partId] : [])))]
  if (partIds.length) {
    const seen = await db.enquiryLine.groupBy({
      by: ['partId'],
      where: { partId: { in: partIds } },
      _count: { _all: true },
    })
    const n = new Map(seen.map((s) => [s.partId, s._count._all]))
    for (const m of out.values()) if (m.partId) m.seenOnRfqs = n.get(m.partId) ?? 0
  }
  for (const norm of left())
    out.set(norm, {
      norm,
      method: 'none',
      partId: null,
      catalogueProductId: null,
      score: 0,
      seenOnRfqs: 0,
      alternatives: [],
    })
  return out
}
