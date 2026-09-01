/**
 * Turn a pasted supplier quotation into structured offer lines.
 *
 * Supplier replies are unstructured prose in every layout imaginable, so this
 * is an LLM job. The discipline that makes it safe is not the prompt — it is
 * the gate below: every priced row must carry a `sourceQuote` that appears
 * VERBATIM in the pasted text. A hallucinated price is the expensive failure
 * here, because it reaches a customer quote before any human sees it.
 *
 * Money is deliberately NOT parsed by the model. It returns the raw string it
 * saw; the decimal convention is then voted across the whole document by
 * `parseMoneyDocument`, because "1.234,56" and "1,234.56" differ by 1000x and
 * a per-value guess gets one of them wrong.
 */

import Anthropic from '@anthropic-ai/sdk'
import { detectDecimalConvention, parseMoney, type DecimalConvention } from '@indus/domain'

const MODEL = 'claude-opus-5'
const PRICE = { input: 5.0, output: 25.0 } as const

export type RawOfferLine = {
  description: string
  kind: 'quoted' | 'alternative' | 'declined'
  /** Raw as written — "1.234,56", "AED 90.00". Parsed downstream, not here. */
  unitPriceRaw: string | null
  qtyRaw: string | null
  moqRaw: string | null
  totalRaw: string | null
  leadTimeDays: number | null
  /** Verbatim text from the reply supporting this row. Non-negotiable. */
  sourceQuote: string
}

export type ExtractedOffer = {
  supplierName: string | null
  currency: string | null
  incoterm: string | null
  validUntil: string | null
  lines: RawOfferLine[]
  decimalConvention: DecimalConvention
  /** Money values parsed under the voted convention, aligned with `lines`. */
  parsed: Array<{ unitPrice: number | null; qty: number | null; moq: number | null; total: number | null }>
  costUsdMicros: number
  droppedForNoEvidence: number
}

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['supplierName', 'currency', 'incoterm', 'validUntil', 'lines'],
  properties: {
    supplierName: { type: ['string', 'null'] },
    currency: { type: ['string', 'null'], description: 'ISO code as stated, e.g. EUR. Null if not stated.' },
    incoterm: { type: ['string', 'null'], description: 'e.g. FOB, CIF, DDP. Null if not stated.' },
    validUntil: { type: ['string', 'null'], description: 'ISO date, or null. Never infer one.' },
    lines: {
      type: 'array',
      maxItems: 60,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['description', 'kind', 'unitPriceRaw', 'qtyRaw', 'moqRaw', 'totalRaw', 'leadTimeDays', 'sourceQuote'],
        properties: {
          description: { type: 'string' },
          kind: { type: 'string', enum: ['quoted', 'alternative', 'declined'] },
          unitPriceRaw: { type: ['string', 'null'] },
          qtyRaw: { type: ['string', 'null'] },
          moqRaw: { type: ['string', 'null'] },
          totalRaw: { type: ['string', 'null'] },
          leadTimeDays: { type: ['integer', 'null'] },
          sourceQuote: { type: 'string' },
        },
      },
    },
  },
} as const

const SYSTEM = `You read supplier quotations and return their contents as structured rows.

Rules, in order of importance:
1. sourceQuote must be text copied EXACTLY from the message, character for
   character, containing the price for that row. If you cannot copy such a
   span, omit the row entirely.
2. Copy numbers as WRITTEN. Do not normalise "1.234,56" to 1234.56, do not
   strip currency symbols, do not convert. The raw string is what is wanted.
3. Never infer a value that is not stated. No price, no MOQ, no validity date,
   no Incoterm gets invented. Absent means null.
4. kind is "declined" when the supplier says they cannot supply that item, and
   "alternative" when they offer a DIFFERENT part from the one requested.
   A substitution is never "quoted".
5. One row per item the supplier addressed. Do not merge and do not invent
   rows for items they ignored.`

function costMicros(usage: { input_tokens?: number; output_tokens?: number } | undefined): number {
  if (!usage) return 0
  return Math.round(
    (((usage.input_tokens ?? 0) / 1e6) * PRICE.input + ((usage.output_tokens ?? 0) / 1e6) * PRICE.output) * 1e6,
  )
}

/** Whitespace-insensitive containment — mail clients re-wrap lines. */
function appearsVerbatim(quote: string, haystack: string): boolean {
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
  const q = norm(quote)
  return q.length >= 3 && norm(haystack).includes(q)
}

/**
 * The gate. Drops any row whose sourceQuote is not actually in the reply.
 *
 * Mandatory and non-bypassable: the schema can require a string but cannot
 * require a TRUE one, and this is the only check that distinguishes a quoted
 * price from an invented one.
 */
export function keepOnlyEvidencedLines(
  lines: unknown,
  rawText: string,
): { kept: RawOfferLine[]; dropped: number } {
  if (!Array.isArray(lines)) return { kept: [], dropped: 0 }

  const kept: RawOfferLine[] = []
  let dropped = 0

  for (const item of lines) {
    if (typeof item !== 'object' || item === null) { dropped += 1; continue }
    const l = item as Partial<RawOfferLine>

    if (typeof l.description !== 'string' || !l.description.trim()) { dropped += 1; continue }
    if (typeof l.sourceQuote !== 'string' || !appearsVerbatim(l.sourceQuote, rawText)) {
      dropped += 1
      continue
    }

    kept.push({
      description: l.description.trim(),
      kind: l.kind === 'alternative' || l.kind === 'declined' ? l.kind : 'quoted',
      unitPriceRaw: typeof l.unitPriceRaw === 'string' ? l.unitPriceRaw : null,
      qtyRaw: typeof l.qtyRaw === 'string' ? l.qtyRaw : null,
      moqRaw: typeof l.moqRaw === 'string' ? l.moqRaw : null,
      totalRaw: typeof l.totalRaw === 'string' ? l.totalRaw : null,
      leadTimeDays: typeof l.leadTimeDays === 'number' && Number.isFinite(l.leadTimeDays) ? l.leadTimeDays : null,
      sourceQuote: l.sourceQuote,
    })
  }

  return { kept, dropped }
}

export async function extractOffer(input: { rawText: string }): Promise<ExtractedOffer> {
  const client = new Anthropic()

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: `SUPPLIER REPLY:\n\n${input.rawText}` }],
  })

  const cost = costMicros(response.usage)
  const block = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')

  const empty: ExtractedOffer = {
    supplierName: null, currency: null, incoterm: null, validUntil: null,
    lines: [], decimalConvention: 'ambiguous', parsed: [], costUsdMicros: cost, droppedForNoEvidence: 0,
  }
  if (!block) return empty

  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(block.text) as Record<string, unknown>
  } catch {
    return empty
  }

  const { kept, dropped } = keepOnlyEvidencedLines(raw.lines, input.rawText)

  // Vote the decimal convention across EVERY money string in the document at
  // once — that is the whole defence against a 1000x misread.
  const moneyStrings = kept.flatMap((l) =>
    [l.unitPriceRaw, l.totalRaw, l.qtyRaw, l.moqRaw].filter((s): s is string => !!s),
  )
  const convention = detectDecimalConvention(moneyStrings)

  // Each value is then parsed under the DOCUMENT's convention, never its own —
  // a lone "1.234" is unreadable in isolation and unambiguous in context.
  const parsed = kept.map((l) => ({
    unitPrice: l.unitPriceRaw ? parseMoney(l.unitPriceRaw, convention) : null,
    qty: l.qtyRaw ? parseMoney(l.qtyRaw, convention) : null,
    moq: l.moqRaw ? parseMoney(l.moqRaw, convention) : null,
    total: l.totalRaw ? parseMoney(l.totalRaw, convention) : null,
  }))

  return {
    supplierName: typeof raw.supplierName === 'string' ? raw.supplierName : null,
    currency: typeof raw.currency === 'string' ? raw.currency.toUpperCase() : null,
    incoterm: typeof raw.incoterm === 'string' ? raw.incoterm.toUpperCase() : null,
    validUntil: typeof raw.validUntil === 'string' ? raw.validUntil : null,
    lines: kept,
    decimalConvention: convention,
    parsed,
    costUsdMicros: cost,
    droppedForNoEvidence: dropped,
  }
}
