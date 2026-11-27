/**
 * Line cards (S10-T06, board 52; 06-map-schema §8.4): what a supplier is used for. Pure. A line card covers a trade
 * (and optionally a brand); its status says whether it may be chosen (active, trial) or not (proposed, suspended,
 * not carried). A line card whose covering documents have all expired is suspended; a valid replacement reinstates it.
 */
export type LineCardStatus = 'proposed' | 'trial' | 'active' | 'suspended' | 'not_carried'

export interface LineCardRow {
  id: string
  tradeId: string | null
  brand: string | null
  status: string
  coveredByDocumentIds: readonly string[]
}

export interface CoveringDocument {
  id: string
  expiresAt: Date | null
  archivedAt?: Date | null
}

const USABLE: ReadonlySet<string> = new Set(['active', 'trial'])

/** Does the supplier carry this trade (and brand, when asked)? */
export function lineCardCovers(
  cards: readonly LineCardRow[],
  q: { tradeId: string; brand?: string | null }
): { covers: boolean; status: string | null; trial: boolean } {
  const brand = q.brand?.trim().toLowerCase() || null
  const match = cards.filter(
    (c) => c.tradeId === q.tradeId && (!brand || !c.brand || c.brand.toLowerCase() === brand)
  )
  const best =
    match.find((c) => c.status === 'active') ?? match.find((c) => c.status === 'trial') ?? match[0]
  if (!best) return { covers: false, status: null, trial: false }
  return { covers: USABLE.has(best.status), status: best.status, trial: best.status === 'trial' }
}

const live = (d: CoveringDocument, today: Date) =>
  !d.archivedAt && (d.expiresAt === null || d.expiresAt.getTime() >= today.getTime())

/** Usable line cards whose covering documents are all expired (to suspend). */
export function lapsedCategories(
  cards: readonly LineCardRow[],
  documents: readonly CoveringDocument[],
  today: Date
): LineCardRow[] {
  const byId = new Map(documents.map((d) => [d.id, d]))
  return cards.filter((c) => {
    if (!USABLE.has(c.status) || !c.coveredByDocumentIds.length) return false
    const docs = c.coveredByDocumentIds
      .map((id) => byId.get(id))
      .filter((d): d is CoveringDocument => !!d)
    return docs.length > 0 && docs.every((d) => !live(d, today))
  })
}

/** Suspended line cards that a valid covering document now reinstates. */
export function reinstatedCategories(
  cards: readonly LineCardRow[],
  documents: readonly CoveringDocument[],
  today: Date
): LineCardRow[] {
  const byId = new Map(documents.map((d) => [d.id, d]))
  return cards.filter(
    (c) =>
      c.status === 'suspended' &&
      c.coveredByDocumentIds.some((id) => {
        const d = byId.get(id)
        return !!d && live(d, today)
      })
  )
}

/** The status a reinstated card returns to: trial while the supplier is on trial, else active. */
export function reinstateTo(tier: string): LineCardStatus {
  return tier === 'trial' ? 'trial' : 'active'
}
