/**
 * Link scorer (S05-T04): precision of the links made (bar ≥ 99.5 %: a wrong link is the costly error) and
 * coverage (links made where one was expected).
 */
export interface LinkCase {
  id: string
  /** The candidate key expected, or null when the right answer is no link (Unsure or none). */
  expect: string | null
}
export interface LinkPrediction {
  id: string
  predicted: string | null
}
export interface LinkScore {
  total: number
  linked: number
  correctLinks: number
  expectedLinks: number
  precision: number
  coverage: number
  wrong: Array<{ id: string; expected: string | null; predicted: string }>
  passes: boolean
}

export const LINK_BARS = { precision: 0.995 } as const

export function scoreLink(cases: readonly LinkCase[], preds: readonly LinkPrediction[]): LinkScore {
  const byId = new Map(preds.map((p) => [p.id, p.predicted]))
  let linked = 0
  let correct = 0
  let covered = 0
  const wrong: LinkScore['wrong'] = []
  const expectedLinks = cases.filter((c) => c.expect !== null).length
  for (const c of cases) {
    const p = byId.get(c.id) ?? null
    if (p === null) continue
    linked += 1
    if (p === c.expect) {
      correct += 1
      covered += 1
    } else wrong.push({ id: c.id, expected: c.expect, predicted: p })
  }
  const precision = linked ? correct / linked : 1
  return {
    total: cases.length,
    linked,
    correctLinks: correct,
    expectedLinks,
    precision,
    coverage: expectedLinks ? covered / expectedLinks : 1,
    wrong,
    passes: precision >= LINK_BARS.precision,
  }
}
