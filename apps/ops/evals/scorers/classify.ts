/**
 * Classify scorer (S05-T04, CLAUDE.md §13.6): accuracy on the messages the Assistant was sure or likely about,
 * and the share it left Unsure. Bars: accuracy ≥ 97 %, Unsure ≤ 8 %. An expected `unsure` case counts as right
 * when the Assistant was unsure.
 */
export interface ClassifyCase {
  id: string
  expect: string
}
export interface ClassifyPrediction {
  id: string
  /** The stored class, or null when the Assistant was unsure. */
  predicted: string | null
}
export interface ClassifyScore {
  total: number
  confident: number
  correctConfident: number
  unsure: number
  accuracy: number
  unsureRate: number
  misses: Array<{ id: string; expected: string; predicted: string | null }>
  passes: boolean
}

export const CLASSIFY_BARS = { accuracy: 0.97, unsureRate: 0.08 } as const

export function scoreClassify(
  cases: readonly ClassifyCase[],
  preds: readonly ClassifyPrediction[]
): ClassifyScore {
  const byId = new Map(preds.map((p) => [p.id, p.predicted]))
  let confident = 0
  let correct = 0
  let unsure = 0
  const misses: ClassifyScore['misses'] = []
  for (const c of cases) {
    const p = byId.get(c.id) ?? null
    if (p === null) {
      unsure += 1
      if (c.expect !== 'unsure') misses.push({ id: c.id, expected: c.expect, predicted: null })
      continue
    }
    confident += 1
    if (p === c.expect) correct += 1
    else misses.push({ id: c.id, expected: c.expect, predicted: p })
  }
  const accuracy = confident ? correct / confident : 0
  const unsureRate = cases.length ? unsure / cases.length : 0
  return {
    total: cases.length,
    confident,
    correctConfident: correct,
    unsure,
    accuracy,
    unsureRate,
    misses,
    passes: accuracy >= CLASSIFY_BARS.accuracy && unsureRate <= CLASSIFY_BARS.unsureRate,
  }
}
