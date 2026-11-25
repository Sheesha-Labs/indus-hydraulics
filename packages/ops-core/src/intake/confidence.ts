import type { QtyProblem } from './qty'
import type { UomMethod } from './uom'

/**
 * Line confidence for extracted lines (S08-T02, 08-map-integrations §3 "Mapping lines and confidence"). Computed in
 * code from the evidence and deterministic checks; the model's own confidence is never read.
 *
 *   Sure    description, qty and uom each stand on resolved evidence, the qty parsed as a number, the unit came
 *           from the unit table, the part number is present on resolved evidence and matched exactly (catalogue,
 *           history, alias) or shaped like a part number, and the model raised no doubt
 *   Likely  evidence resolved but one soft check failed: a fuzzy part match, a unit from a column header or not
 *           stated, no part number (matched by description), an alternative make, a scanned page, or a doubt
 *           about a secondary field (spec, make, certification)
 *   Unsure  a required field without resolved evidence, no quantity, a quantity code cannot read, the printed
 *           quantity and the model's disagree, a look-alike part number, or a doubt about description, qty,
 *           unit or part number
 *
 * Unsure lines are never written into an enquiry: they become question cards.
 */
export type LineConfidence = 'sure' | 'likely' | 'unsure'

/** How a field's evidence resolved: exact/fuzzy text, a scanned page's frame, nothing, or no evidence at all. */
export type EvidenceState = 'resolved' | 'page_only' | 'unresolved' | 'missing'

export type PartMatchMethod =
  'exact' | 'alias' | 'catalogue' | 'cross_ref' | 'history' | 'pattern' | 'fuzzy' | 'none'

export interface LineConfidenceInput {
  evidence: {
    description: EvidenceState
    qty: EvidenceState
    uom: EvidenceState
    partNumber: EvidenceState
  }
  qty: { value: number | null; problem: QtyProblem | null }
  /** The model's own number disagrees with the printed quantity code read. */
  qtyConflict: boolean
  uomMethod: UomMethod
  partNumber: string | null
  partMatch: PartMatchMethod
  /** The part number has look-alike readings that match other parts (or none does, and a variant does). */
  lookalikeAmbiguous: boolean
  /** Fields the model raised a doubt about. */
  doubtFields: readonly string[]
  alternativeMake: boolean
}

export interface LineConfidenceResult {
  confidence: LineConfidence
  reasons: string[]
}

const CORE_DOUBT = new Set([
  'description',
  'qty',
  'quantity',
  'uom',
  'unit',
  'partNumber',
  'part_number',
  'part',
])

const QTY_PROBLEM: Record<QtyProblem, string> = {
  not_stated: 'Quantity not stated',
  several_numbers: 'Quantity has more than one number',
  approximate: 'Quantity is approximate',
  ambiguous_separator: 'Quantity separator is ambiguous (1.000 or 1,000)',
  not_positive: 'Quantity is not a positive number',
}

export function computeLineConfidence(i: LineConfidenceInput): LineConfidenceResult {
  const unsure: string[] = []
  const likely: string[] = []

  for (const field of ['description', 'qty'] as const) {
    const s = i.evidence[field]
    if (s === 'unresolved' || s === 'missing')
      unsure.push(
        field === 'qty'
          ? 'Quantity not found in the document'
          : 'Description not found in the document'
      )
  }
  if (i.qty.problem) unsure.push(QTY_PROBLEM[i.qty.problem])
  else if (i.qtyConflict) unsure.push('Printed quantity and the reading disagree')
  if (i.lookalikeAmbiguous) unsure.push('Part no. has look-alike readings')
  const coreDoubts = i.doubtFields.filter((f) => CORE_DOUBT.has(f))
  if (coreDoubts.length) unsure.push(`Doubt about ${[...new Set(coreDoubts)].join(', ')}`)

  if (i.uomMethod === 'header') likely.push('Unit read from the column header')
  else if (i.uomMethod === 'missing') likely.push('No unit given · EA assumed')
  else if (i.uomMethod === 'unknown') likely.push('Unit not in the unit table')
  else if (i.evidence.uom === 'unresolved' || i.evidence.uom === 'missing')
    likely.push('Unit not found in the document')

  if (!i.partNumber) likely.push('No part no. · matched by description')
  else if (i.evidence.partNumber === 'unresolved' || i.evidence.partNumber === 'missing')
    unsure.push('Part no. not found in the document')
  else if (i.partMatch === 'fuzzy') likely.push('Part no. matched loosely')
  else if (i.partMatch === 'none') likely.push('Part no. not seen before')

  if (i.alternativeMake) likely.push('Alternative make offered')
  if (Object.values(i.evidence).includes('page_only')) likely.push('Read from a scanned page')
  const softDoubts = i.doubtFields.filter((f) => !CORE_DOUBT.has(f))
  if (softDoubts.length) likely.push(`Doubt about ${[...new Set(softDoubts)].join(', ')}`)

  if (unsure.length) return { confidence: 'unsure', reasons: [...unsure, ...likely] }
  if (likely.length) return { confidence: 'likely', reasons: likely }
  return { confidence: 'sure', reasons: [] }
}

/** Board 15's legend words for code confidence. */
export const CONFIDENCE_LEGEND: Record<LineConfidence, string> = {
  sure: 'High',
  likely: 'Check',
  unsure: 'Low',
}
