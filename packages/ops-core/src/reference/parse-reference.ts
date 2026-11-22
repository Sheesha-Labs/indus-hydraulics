/**
 * Reference parsing (board 208, ADR-20, architecture C6): what kind of record a typed string names, before
 * any server round-trip. Pure and synchronous, so the command bar resolves "Recognised reference" as the
 * person types. Everything is case-insensitive and whitespace-tolerant; the "/" after INDUS is optional.
 *
 * Three outcomes:
 * - `known_format`: one of Indus's own numbering formats (ENQ-, INDUS/…, IH-RFQ-, SO-, A-, TQ-, L-, CL-).
 * - `ambiguous`: a bare five-digit number. It is offered as a quotation (INDUS/Q continues Zoho's
 *   sequence) and, as an alternative, as a part number.
 * - `search`: a client PO number, a supplier quote number or a part number. Those are other people's
 *   formats, so the kind says only how to look it up (`external` or `part`); search resolves them.
 *
 * A string that starts with one of OUR prefixes but does not fit its format (ENQ-26-0001, SO-24) is a
 * near-miss and returns null: it is never passed off as someone else's reference.
 */

export type ReferenceKind =
  | 'enquiry'
  | 'quotation'
  | 'supplier_rfq'
  | 'supplier_po'
  | 'order_ack'
  | 'proforma'
  | 'tax_invoice'
  | 'credit_note'
  | 'delivery_note'
  | 'packing_list'
  | 'order'
  | 'assistant_action'
  | 'tender_query'
  | 'lead'
  | 'claim'
  /** A client PO or a supplier quote number: resolved by search, not by format. */
  | 'external'
  | 'part'

export type ReferenceMatch = 'known_format' | 'ambiguous' | 'search'

export interface ParsedReference {
  kind: ReferenceKind
  /** The one spelling records store: `INDUS/Q10001-R2`, `ENQ-2026-0001`. For parts, the compact key. */
  canonical: string
  /** Every spelling a person might type or a document might carry, canonical first, de-duplicated. */
  variants: string[]
  match: ReferenceMatch
  /** `-R2` on a quotation, order acknowledgement or proforma. */
  revision?: number
}

export interface ParsedReferenceWithAlternatives extends ParsedReference {
  /** Other readings of the same input (a bare number is also a part number). */
  alternatives: ParsedReference[]
}

/** What the command bar prints after "Recognised reference:". */
export const REFERENCE_KIND_LABEL: Readonly<Record<ReferenceKind, string>> = {
  enquiry: 'Enquiry',
  quotation: 'Quotation',
  supplier_rfq: 'Supplier RFQ',
  supplier_po: 'Supplier PO',
  order_ack: 'Order acknowledgement',
  proforma: 'Proforma invoice',
  tax_invoice: 'Tax invoice',
  credit_note: 'Credit note',
  delivery_note: 'Delivery note',
  packing_list: 'Packing list',
  order: 'Order',
  assistant_action: 'Assistant action',
  tender_query: 'Technical query',
  lead: 'Lead',
  claim: 'Claim',
  external: 'Client PO or supplier reference',
  part: 'Part number',
}

/** Upper case, trimmed, no spaces around separators, single spaces elsewhere. */
function normalise(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/\s*([/-])\s*/g, '$1')
    .replace(/\s+/g, ' ')
}

const unique = (xs: string[]) => [...new Set(xs)]
const S = '[- ]?' // an optional separator: dash or space

function ref(
  kind: ReferenceKind,
  canonical: string,
  variants: string[],
  match: ReferenceMatch = 'known_format',
  revision?: number
): ParsedReference {
  return {
    kind,
    canonical,
    variants: unique([canonical, ...variants]),
    match,
    ...(revision !== undefined ? { revision } : {}),
  }
}

/** The INDUS/<code><n> document family (C6: Round 1 continuous numbers; Round 4 dashed forms accepted). */
const INDUS_DOCS: ReadonlyArray<{ code: string; kind: ReferenceKind; suffix: RegExp }> = [
  // Longest codes first, so INV is not read as IN + V.
  { code: 'INV', kind: 'tax_invoice', suffix: /^(?:-(\d{2}))?$/ },
  { code: 'PO', kind: 'supplier_po', suffix: /^(?:-R(\d+))?$/ },
  { code: 'OA', kind: 'order_ack', suffix: /^(?:-R(\d+))?$/ },
  { code: 'PI', kind: 'proforma', suffix: /^(?:-A(\d+))?(?:-R(\d+))?$/ },
  { code: 'CN', kind: 'credit_note', suffix: /^$/ },
  { code: 'DN', kind: 'delivery_note', suffix: /^(?:-(\d{2}))?$/ },
  { code: 'PL', kind: 'packing_list', suffix: /^(?:-(\d{2}))?$/ },
]

function quotation(digits: string, rev: string | undefined, match: ReferenceMatch) {
  const r = rev ? `-R${Number(rev)}` : ''
  const canonical = `INDUS/Q${digits}${r}`
  return ref(
    'quotation',
    canonical,
    [`INDUS Q${digits}${r}`, `INDUS-Q${digits}${r}`, `Q${digits}${r}`, `${digits}${r}`],
    match,
    rev ? Number(rev) : undefined
  )
}

/** INDUS/… (quotation or a document). Null when it starts with INDUS but fits nothing. */
function parseIndus(s: string): ParsedReference | null {
  const body = s.replace(/^INDUS[/ -]?/, '')
  const q = new RegExp(`^Q${S}(\\d{3,7})(?:${S}R(\\d{1,2}))?$`).exec(body)
  if (q) return quotation(q[1]!, q[2], 'known_format')
  for (const doc of INDUS_DOCS) {
    const m = new RegExp(`^${doc.code}${S}(\\d{3,7})(.*)$`).exec(body)
    if (!m) continue
    const tail = m[2]!.replace(/ /g, '-')
    const sx = doc.suffix.exec(tail)
    if (!sx) return null
    const n = m[1]!
    const canonical = `INDUS/${doc.code}${n}${tail}`
    // -R<n> is the revision group: the second on a proforma (after -A<n>), the first on a PO or an OA.
    const revision =
      doc.kind === 'proforma'
        ? sx[2]
        : doc.kind === 'supplier_po' || doc.kind === 'order_ack'
          ? sx[1]
          : undefined
    const rev = revision !== undefined ? Number(revision) : undefined
    return ref(
      doc.kind,
      canonical,
      [`INDUS/${doc.code}-${n}${tail}`, `INDUS ${doc.code}${n}${tail}`, `${doc.code}${n}${tail}`],
      'known_format',
      rev
    )
  }
  return null
}

const validDate = (mm: number, dd: number) => mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31

/** Our own formats other than INDUS/…, each with its reserved prefix. */
const OWN: ReadonlyArray<{ prefix: RegExp; parse: (s: string) => ParsedReference | null }> = [
  {
    prefix: /^ENQ(?=[- \d]|$)/,
    parse: (s) => {
      const m = new RegExp(`^ENQ${S}(\\d{4})${S}(\\d{4})$`).exec(s)
      if (!m) return null
      const [, y, n] = m
      return ref('enquiry', `ENQ-${y}-${n}`, [`ENQ${y}${n}`, `ENQ ${y} ${n}`, `ENQ-${y}${n}`])
    },
  },
  {
    prefix: /^IH[- ]?RFQ(?=[- \d]|$)/,
    parse: (s) => {
      const m = new RegExp(`^IH${S}RFQ${S}(\\d{4})${S}P${S}(\\d{2,3})$`).exec(s)
      if (!m) return null
      const [, yymm, p] = m
      return ref('supplier_rfq', `IH-RFQ-${yymm}-P${p}`, [
        `IHRFQ${yymm}P${p}`,
        `IH RFQ ${yymm} P${p}`,
        `RFQ-${yymm}-P${p}`,
      ])
    },
  },
  {
    prefix: /^SO(?=[- \d]|$)/,
    parse: (s) => {
      const m = new RegExp(`^SO${S}(\\d{4})(?:${S}([A-Z]))?$`).exec(s)
      if (!m) return null
      const [, n, part] = m
      const p = part ? `-${part}` : ''
      return ref('order', `SO-${n}${p}`, [
        `SO${n}${part ?? ''}`,
        `SO ${n}${part ? ` ${part}` : ''}`,
      ])
    },
  },
  {
    prefix: /^TQ(?=[- \d]|$)/,
    parse: (s) => {
      const m = new RegExp(`^TQ${S}(\\d{2,3})$`).exec(s)
      return m ? ref('tender_query', `TQ-${m[1]}`, [`TQ${m[1]}`, `TQ ${m[1]}`]) : null
    },
  },
  {
    prefix: /^CL(?=[- \d]|$)/,
    parse: (s) => {
      const m = new RegExp(`^CL${S}(\\d{4})${S}(\\d{2})$`).exec(s)
      if (!m) return null
      const [, n, k] = m
      return ref('claim', `CL-${n}-${k}`, [`CL${n}${k}`, `CL ${n} ${k}`])
    },
  },
  {
    // Single-letter prefixes are reserved only when a separator follows (L123 may be a part number).
    prefix: /^L[- ]/,
    parse: (s) => {
      const m = new RegExp(`^L${S}(\\d{4})$`).exec(s)
      return m ? ref('lead', `L-${m[1]}`, [`L${m[1]}`, `L ${m[1]}`]) : null
    },
  },
  {
    prefix: /^A[- ]\d/,
    parse: (s) => {
      const m = new RegExp(`^A${S}(\\d{2})${S}(\\d{2})${S}(\\d{2})${S}(\\d{4})$`).exec(s)
      if (!m) return null
      const [, yy, mm, dd, n] = m
      if (!validDate(Number(mm), Number(dd))) return null
      return ref('assistant_action', `A-${yy}-${mm}-${dd}-${n}`, [`A${yy}${mm}${dd}${n}`])
    },
  },
  {
    // Q10001 and Q10001-R2 without INDUS.
    prefix: /^Q(?=[- ]?\d)/,
    parse: (s) => {
      const m = new RegExp(`^Q${S}(\\d{3,7})(?:${S}R(\\d{1,2}))?$`).exec(s)
      return m ? quotation(m[1]!, m[2], 'known_format') : null
    },
  },
]

/** The compact key a part number is matched on: letters and digits only. */
export function partKey(input: string): string {
  return normalise(input).replace(/[^A-Z0-9]/g, '')
}

/** 6316-C3, 6316C3 and 6316 C3 all read as one part: segment the compact key where a digit meets a letter. */
function part(s: string): ParsedReference | null {
  const key = partKey(s)
  if (key.length < 3 || !/\d/.test(key)) return null
  const segments = key.split(/(?<=\d)(?=[A-Z])/)
  return ref('part', key, [segments.join('-'), key, segments.join(' '), s], 'search')
}

/**
 * Looks like one token of someone else's numbering (a client PO, a supplier quote number, a part number)
 * rather than words: every space-separated chunk carries a digit or is at most two letters long.
 */
function tokenLike(s: string): boolean {
  if (s.length > 40 || !/\d/.test(s)) return false
  const chunks = s.split(' ')
  if (chunks.length > 4) return false
  return chunks.every((c) => /^[A-Z0-9][A-Z0-9/.-]*$/.test(c) && (/\d/.test(c) || c.length <= 2))
}

/**
 * Every reading of `input`, most likely first. Empty when it is not a reference (words, a near-miss of one of
 * our formats, too short).
 */
export function parseReferences(input: string): ParsedReference[] {
  const s = normalise(input)
  if (!s) return []

  if (/^INDUS(?=[/ -]|[A-Z]{1,3}\d)/.test(s)) {
    const r = parseIndus(s)
    return r ? [r] : []
  }
  for (const own of OWN) {
    if (!own.prefix.test(s)) continue
    const r = own.parse(s)
    return r ? [r] : []
  }

  // A bare five-digit number: a quotation (INDUS/Q continues Zoho) or a part number.
  const bare = /^(\d{5})(?:-R(\d{1,2}))?$/.exec(s)
  if (bare) {
    const q = quotation(bare[1]!, bare[2], 'ambiguous')
    const p = bare[2] ? null : part(s)
    return p ? [q, p] : [q]
  }

  if (!tokenLike(s)) return []
  const p = part(s)
  // Letter-led with a separator and a run of 3+ digits reads first as someone's document number
  // (PO-SCL-10001, EXV-10001); a part reading is kept as the alternative.
  if (/^[A-Z]{2,}[-/]/.test(s) && /\d{3,}/.test(s) && !s.includes(' ')) {
    const external = ref('external', s, [s.replace(/[-/]/g, ''), s.replace(/[-/]/g, ' ')], 'search')
    return p ? [external, p] : [external]
  }
  return p ? [p] : []
}

/** The most likely reading of `input` with the others as `alternatives`, or null when it is not a reference. */
export function parseReference(input: string): ParsedReferenceWithAlternatives | null {
  const [first, ...rest] = parseReferences(input)
  return first ? { ...first, alternatives: rest } : null
}
