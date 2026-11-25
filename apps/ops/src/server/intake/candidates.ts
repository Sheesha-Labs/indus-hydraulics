import {
  isResolved,
  resolveInRow,
  resolveSpan,
  type Evidence,
  type SourceSpanDraft,
  type SpanSource,
} from '@indus/ops-ai'
import {
  computeLineConfidence,
  detectDecimalConvention,
  looksLikePartNumber,
  normaliseUom,
  parseQuantity,
  partNoNorm,
  sameQty,
  type EvidenceState,
  type LineConfidence,
  type PartMatchMethod,
  type UomMethod,
  type UomTable,
} from '@indus/ops-core'
import type { ExtractedLine } from '../assistant/prompts/extract-lines.v1'
import type { PartMatch } from '../parts/match'

/**
 * Extracted lines → staged candidates (S08-T02 verify, 08 §3). Pure: code reads the quantity from the printed
 * string (the document's decimal convention voted across every quantity), normalises the unit, finds every quote
 * again, applies the part match and computes confidence. Unsure lines carry the question and up to two options plus
 * "Type it"; they are staged, never written into an enquiry.
 */
export interface CandidateOption {
  value: string
  label: string
  sub?: string
}

export interface CandidateUnsure {
  field: string
  question: string
  options: CandidateOption[]
}

export interface CandidateDraft {
  ord: number
  description: string
  /** Decimal string, 4 places at most; null when code could not read one. */
  qty: string | null
  qtyPrinted: string | null
  uom: string | null
  uomRaw: string | null
  uomMethod: UomMethod
  partNo: string | null
  partNoNorm: string | null
  make: string | null
  spec: string | null
  certification: string | null
  clientRef: string | null
  notes: string | null
  confidence: LineConfidence
  reasons: string[]
  unsure: CandidateUnsure | null
  partId: string | null
  partMatch: PartMatchMethod
  catalogueProductId: string | null
  /** One span per evidence entry; `field` says which value it backs. */
  spans: SourceSpanDraft[]
  sourcePage: number | null
  sourceKind: SourceSpanDraft['sourceKind']
  sourceDetail: string | null
  /** The model's doubts, kept for board 17 (handwriting) and the reviewer's notes. */
  doubts: Array<{ field: string; question: string }>
  alternativeMake: boolean
}

const EVIDENCE_FIELDS = ['description', 'qty', 'uom', 'partNumber'] as const
const SEPARATOR_DOUBT = /decimal|separator|thousand|comma|point|\d[.,]\d{3}\b/i

function stateOf(
  spans: readonly SourceSpanDraft[],
  field: string,
  hasValue: boolean
): EvidenceState {
  if (!hasValue) return 'resolved'
  const mine = spans.filter((s) => s.field === field)
  if (!mine.length) return 'missing'
  if (mine.some((s) => s.resolved === 'exact' || s.resolved === 'fuzzy')) return 'resolved'
  if (mine.some((s) => s.resolved === 'page_only')) return 'page_only'
  return 'unresolved'
}

function qtyString(n: number | null): string | null {
  if (n === null) return null
  return Number(n.toFixed(4)).toString()
}

function sourceDetailOf(src: SpanSource, spans: readonly SourceSpanDraft[]): string | null {
  const d = spans.find((s) => s.field === 'description' && isResolved(s))
  if (!d) return null
  if (src.kind === 'sheet') return d.cellRef ? `R${d.cellRef.replace(/^[A-Z]+/, '')}` : null
  if (src.kind === 'email' && d.charStart !== null) {
    const lineStart = src.text.lastIndexOf('\n', d.charStart - 1) + 1
    const lineEnd = src.text.indexOf('\n', d.charStart)
    const line = src.text.slice(lineStart, lineEnd < 0 ? undefined : lineEnd)
    return /\t|\|/.test(line) ? 'table' : 'text'
  }
  if (src.kind === 'docx') return d.cellRef ? 'table' : 'text'
  return null
}

export interface BuildContext {
  source: SpanSource
  units: UomTable
  /** Part matches by normalised part number; absent in propose (no database), present in verify. */
  matches?: ReadonlyMap<string, PartMatch>
  /** For an unmatched part number: look-alike readings that DO match, best first. */
  lookalikes?: ReadonlyMap<string, PartMatch[]>
}

export function buildCandidates(
  lines: readonly ExtractedLine[],
  ctx: BuildContext
): CandidateDraft[] {
  const convention = detectDecimalConvention(
    lines.flatMap((l) => (l.qtyPrinted ? [l.qtyPrinted] : []))
  )
  return lines.map((l, i) => {
    const evs = l.evidence.map(
      (e) =>
        ({
          field: e.field,
          quote: e.quote,
          page: e.page,
          sheet: e.sheet,
          cellRef: e.cellRef,
        }) satisfies Evidence
    )
    const direct = evs.map((e) => resolveSpan(ctx.source, e))
    const anchor = direct.find((s) => s.field === 'description' && isResolved(s))
    // A short quantity or unit ("4", "EA") counts only where it sits on the line's own row.
    const spans = direct.map((s, k) => {
      const e = evs[k]!
      if (e.field !== 'qty' && e.field !== 'uom') return s
      const short = e.quote.trim().length <= 3
      if (!short && s.resolved !== 'unresolved') return s
      if (anchor) {
        const row = resolveInRow(ctx.source, e, anchor)
        if (row.resolved !== 'unresolved') return row
      }
      return short && s.resolved !== 'page_only' ? { ...s, resolved: 'unresolved' as const } : s
    })
    const printed = l.qtyPrinted ?? (l.qty !== null ? String(l.qty) : null)
    const q = parseQuantity(printed, convention)
    const qtyConflict = q.value !== null && l.qty !== null && !sameQty(q.value, l.qty)
    const uomRaw = l.uom ?? q.unitText ?? null
    const u = normaliseUom(uomRaw, ctx.units, { fromHeader: l.uomFromHeader && !!l.uom })
    const norm = partNoNorm(l.partNumber) || null
    const match = norm ? ctx.matches?.get(norm) : undefined
    const partMatch: PartMatchMethod = match
      ? match.method === 'none' && looksLikePartNumber(l.partNumber)
        ? 'pattern'
        : match.method
      : norm && looksLikePartNumber(l.partNumber)
        ? 'pattern'
        : 'none'
    const looks = norm ? (ctx.lookalikes?.get(norm) ?? []) : []
    const lookalikeAmbiguous =
      looks.length > 0 && (!match || match.method === 'none' || match.method === 'fuzzy')
    // A doubt about the decimal separator that the document's own vote has settled is not a doubt any more.
    const settled = convention !== 'ambiguous' && q.value !== null
    const doubts = l.doubts.filter(
      (d) => !(settled && /^(qty|quantity)$/.test(d.field) && SEPARATOR_DOUBT.test(d.question))
    )
    const separatorNote =
      doubts.length < l.doubts.length
        ? `Decimal ${convention === 'comma' ? 'comma' : 'point'} used in this document`
        : null
    const doubtFields = doubts.map((d) => d.field)
    const evidence = Object.fromEntries(
      EVIDENCE_FIELDS.map((f) => [
        f,
        stateOf(
          spans,
          f,
          f === 'description'
            ? true
            : f === 'qty'
              ? printed !== null
              : f === 'uom'
                ? !!l.uom
                : !!l.partNumber
        ),
      ])
    ) as Record<(typeof EVIDENCE_FIELDS)[number], EvidenceState>
    const raw = computeLineConfidence({
      evidence,
      qty: { value: q.value, problem: q.problem },
      qtyConflict,
      uomMethod: u.method,
      partNumber: l.partNumber,
      partMatch,
      lookalikeAmbiguous,
      doubtFields,
      alternativeMake: l.alternativeMake,
    })
    const conf = !separatorNote
      ? raw
      : raw.confidence === 'sure'
        ? { confidence: 'likely' as const, reasons: [separatorNote] }
        : { ...raw, reasons: [...raw.reasons, separatorNote] }
    let unsure: CandidateUnsure | null = null
    if (conf.confidence === 'unsure') {
      if (lookalikeAmbiguous && l.partNumber) {
        unsure = {
          field: 'partNumber',
          question: `Line ${i + 1} · which part number is right?`,
          options: [
            ...looks.slice(0, 1).map((m) => ({
              value: m.norm,
              label: m.norm,
              sub: `seen on ${m.seenOnRfqs} past RFQ${m.seenOnRfqs === 1 ? '' : 's'}`,
            })),
            { value: l.partNumber, label: l.partNumber, sub: 'as read' },
          ],
        }
      } else if (qtyConflict && q.value !== null && l.qty !== null) {
        unsure = {
          field: 'qty',
          question: `Line ${i + 1} · which quantity is right?`,
          options: [
            { value: qtyString(q.value)!, label: qtyString(q.value)!, sub: 'as printed' },
            { value: qtyString(l.qty)!, label: qtyString(l.qty)!, sub: 'as read' },
          ],
        }
      } else {
        const d =
          l.doubts.find((x) =>
            ['qty', 'quantity', 'partNumber', 'description', 'uom'].includes(x.field)
          ) ?? l.doubts[0]
        const field = d?.field ?? (q.value === null ? 'qty' : 'description')
        unsure = {
          field,
          question: d?.question ?? `Line ${i + 1} · ${conf.reasons[0] ?? 'please check this line'}`,
          options: numbersIn(d?.question ?? '')
            .slice(0, 2)
            .map((n, k) => ({
              value: n,
              label: n,
              sub: k === 0 ? 'first reading' : 'second reading',
            })),
        }
      }
    }
    return {
      ord: i + 1,
      description: l.description.trim(),
      qty: q.problem ? null : qtyString(q.value),
      qtyPrinted: l.qtyPrinted,
      uom: u.code ?? (u.method === 'missing' ? 'EA' : null),
      uomRaw,
      uomMethod: u.method,
      partNo: l.partNumber,
      partNoNorm: norm,
      make: l.make,
      spec: l.spec,
      certification: l.certification,
      clientRef: l.clientRef,
      notes: l.notes,
      confidence: conf.confidence,
      reasons: conf.reasons,
      unsure,
      partId: match?.partId ?? null,
      partMatch,
      catalogueProductId: match?.catalogueProductId ?? null,
      spans,
      sourcePage: spans.find((s) => s.page !== null)?.page ?? null,
      sourceKind: ctx.source.kind,
      sourceDetail: sourceDetailOf(ctx.source, spans),
      doubts,
      alternativeMake: l.alternativeMake,
    }
  })
}

/** "Quantity is handwritten: 8 or 10?" → ["8", "10"]. */
export function numbersIn(s: string): string[] {
  return [...s.matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => m[0])
}

export function unsureShare(c: readonly CandidateDraft[]): number {
  return c.length ? c.filter((x) => x.confidence === 'unsure').length / c.length : 0
}
