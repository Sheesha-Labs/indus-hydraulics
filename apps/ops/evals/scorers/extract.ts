/**
 * Extraction scorer (S08-T02, 08 §2.11, CLAUDE.md §13.6). Bars: line F1 ≥ 0.95 and quantity exact on 100 % of
 * the lines that would be written. A predicted line matches an expected one when their descriptions are at least
 * 0.8 alike (token Dice) — then it is a true positive when the quantity is right, or when the expected line must
 * be Unsure and the prediction is Unsure. Unsure predictions are never written, so they count as emitted only
 * where the case expects Unsure.
 */
export interface ExpectedLine {
  description: string
  qty: number | null
  partNo: string | null
  unsure?: boolean
}
export interface PredictedLine {
  description: string
  qty: number | null
  partNo: string | null
  confidence: 'sure' | 'likely' | 'unsure'
}
export interface ExtractCaseResult {
  id: string
  expect: ExpectedLine[]
  predicted: PredictedLine[]
}
export interface ExtractScore {
  cases: number
  expected: number
  emitted: number
  truePositives: number
  precision: number
  recall: number
  f1: number
  /** Of the written (Sure/Likely) lines matched to an expected line, how many have exactly its quantity. */
  qtyExactRate: number
  partExactRate: number
  unsureRate: number
  misses: Array<{
    id: string
    kind: 'missed' | 'extra' | 'qty' | 'should_be_unsure'
    detail: string
  }>
  passes: boolean
}

export const EXTRACT_BARS = { f1: 0.95, qtyExact: 1 } as const

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9/".#-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
}

/** Dice coefficient over word tokens. */
export function similarity(a: string, b: string): number {
  const ta = tokens(a)
  const tb = tokens(b)
  if (!ta.length || !tb.length) return 0
  const pool = [...tb]
  let shared = 0
  for (const t of ta) {
    const i = pool.indexOf(t)
    if (i >= 0) {
      shared += 1
      pool.splice(i, 1)
    }
  }
  return (2 * shared) / (ta.length + tb.length)
}

const norm = (s: string | null) => (s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
const SIM = 0.8

export function scoreExtract(results: readonly ExtractCaseResult[]): ExtractScore {
  let expected = 0
  let emitted = 0
  let tp = 0
  let qtyMatched = 0
  let qtyExact = 0
  let partMatched = 0
  let partExact = 0
  let unsure = 0
  let predictedTotal = 0
  const misses: ExtractScore['misses'] = []
  for (const r of results) {
    expected += r.expect.length
    predictedTotal += r.predicted.length
    unsure += r.predicted.filter((p) => p.confidence === 'unsure').length
    const used = new Set<number>()
    for (const e of r.expect) {
      let best = -1
      let bestSim = 0
      r.predicted.forEach((p, i) => {
        if (used.has(i)) return
        const s = Math.max(
          similarity(e.description, p.description),
          e.partNo && norm(e.partNo) === norm(p.partNo) ? 0.9 : 0
        )
        if (s > bestSim) {
          bestSim = s
          best = i
        }
      })
      if (best < 0 || bestSim < SIM) {
        misses.push({ id: r.id, kind: 'missed', detail: e.description })
        continue
      }
      used.add(best)
      const p = r.predicted[best]!
      if (e.unsure) {
        if (p.confidence === 'unsure') {
          tp += 1
          emitted += 1
        } else {
          emitted += 1
          misses.push({
            id: r.id,
            kind: 'should_be_unsure',
            detail: `${e.description}: came back ${p.confidence} with qty ${p.qty}`,
          })
        }
        continue
      }
      if (p.confidence === 'unsure') {
        misses.push({ id: r.id, kind: 'missed', detail: `${e.description}: came back Unsure` })
        continue
      }
      emitted += 1
      qtyMatched += 1
      if (p.qty !== null && e.qty !== null && Math.abs(p.qty - e.qty) < 1e-9) {
        qtyExact += 1
        tp += 1
      } else
        misses.push({ id: r.id, kind: 'qty', detail: `${e.description}: ${p.qty} for ${e.qty}` })
      if (e.partNo) {
        partMatched += 1
        if (norm(e.partNo) === norm(p.partNo)) partExact += 1
      }
    }
    r.predicted.forEach((p, i) => {
      if (used.has(i) || p.confidence === 'unsure') return
      emitted += 1
      misses.push({ id: r.id, kind: 'extra', detail: p.description })
    })
  }
  const precision = emitted ? tp / emitted : 0
  const recall = expected ? tp / expected : 0
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0
  const qtyExactRate = qtyMatched ? qtyExact / qtyMatched : 1
  return {
    cases: results.length,
    expected,
    emitted,
    truePositives: tp,
    precision,
    recall,
    f1,
    qtyExactRate,
    partExactRate: partMatched ? partExact / partMatched : 1,
    unsureRate: predictedTotal ? unsure / predictedTotal : 0,
    misses,
    passes: f1 >= EXTRACT_BARS.f1 && qtyExactRate >= EXTRACT_BARS.qtyExact,
  }
}
