/**
 * Turn a pasted procurement enquiry into draft line items.
 *
 * Pure. No I/O. Composes the parsing primitives in this folder and returns rows
 * that a human confirms before anything is sent to a supplier.
 *
 * Every returned row carries the verbatim `sourceText` it came from. That is
 * enforced by a database CHECK as well, because a wrong quantity flows into a
 * supplier RFQ and then a customer quote before anyone looks at it.
 */

import { stripBidTokens } from './bid-tokens'
import { splitNumberedItems } from './item-markers'
import { normaliseForParsing } from './normalise'
import { splitTitleItems } from './title-items'

export const PASTE_EXTRACTOR_VERSION = 'paste/v1'

/**
 * Quantity units only. Dimension units (INCH, MM, LB, BAR, PSI) are deliberately
 * absent: marine and hydraulic specs are dense with them, and treating "6 INCH"
 * or "300LB" as a quantity is the same class of bug that once classified a
 * pressure rating of "24 BAR" as bar stock.
 */
const QTY_UNIT =
  /(\d+(?:[.,]\d+)?)\s*(NOS?|PCS?|PIECES?|SETS?|EA|UNITS?|MTRS?|MTR|KGS?|LTRS?|LTR|ROLLS?|BOXE?S?|PAIRS?)\b/gi

/** 3.1 / EN 10204 material certs and IACS class approval, seen in 738 bid titles. */
const CERTIFICATION = /\b(EN\s?10204(?:\s?3\.[12])?|3\.[12]\b(?:\s*MTC)?|MTC|IACS(?:\s+CLASS)?)\b/i

const PART_NUMBER = /\b(?:P\/?N|PART\s*(?:NO|NUMBER)|REF)\s*[:.#-]?\s*([A-Z0-9][A-Z0-9./-]{3,})\b/i

export type DraftLineFlag =
  | 'qty_not_stated'
  | 'unit_not_stated'
  | 'description_very_short'
  | 'title_sourced'

export type DraftEnquiryLine = {
  position: number
  description: string
  partNumber: string | null
  qty: number | null
  unit: string | null
  certification: string | null
  sourceKind: 'body' | 'title'
  /** Verbatim slice of the normalised paste this row came from. */
  sourceText: string
  flags: DraftLineFlag[]
}

export type PasteExtraction = {
  /** Title with any bid number / revision token split off. */
  title: string
  bidNo: string | null
  revision: string | null
  lines: DraftEnquiryLine[]
  /** Normalised text the offsets and sourceText refer to. */
  normalisedText: string
  extractorName: string
}

function parseQty(text: string): { qty: number | null; unit: string | null } {
  const re = new RegExp(QTY_UNIT.source, 'gi')
  let last: RegExpExecArray | null = null
  let m: RegExpExecArray | null
  // Take the LAST match: the measured shape puts quantity at the end
  // ("GASKET SET - 4 Nos."), while descriptions often carry sizes earlier.
  while ((m = re.exec(text)) !== null) last = m
  if (!last) return { qty: null, unit: null }

  const qty = Number(last[1]!.replace(',', '.'))
  return {
    qty: Number.isFinite(qty) ? qty : null,
    unit: last[2]!.toUpperCase(),
  }
}

function buildLine(
  raw: string,
  position: number,
  sourceKind: 'body' | 'title',
  preset?: { qty?: number; unit?: string },
): DraftEnquiryLine | null {
  const sourceText = raw.trim()
  if (!sourceText) return null

  const { qty, unit } = preset?.qty != null
    ? { qty: preset.qty, unit: preset.unit ?? null }
    : parseQty(sourceText)

  // Strip the trailing quantity clause out of the human-facing description,
  // but keep sourceText verbatim so the row stays auditable.
  let description = sourceText
  if (preset?.qty == null) {
    description = description.replace(new RegExp(QTY_UNIT.source + '\\s*\\.?\\s*$', 'i'), '').trim()
  }
  description = description.replace(/[\s\-–—:;,.]+$/, '').trim() || sourceText

  const flags: DraftLineFlag[] = []
  if (qty == null) flags.push('qty_not_stated')
  if (unit == null) flags.push('unit_not_stated')
  if (description.replace(/\s+/g, '').length < 6) flags.push('description_very_short')
  if (sourceKind === 'title') flags.push('title_sourced')

  const cert = CERTIFICATION.exec(sourceText)
  const part = PART_NUMBER.exec(sourceText)

  return {
    position,
    description,
    partNumber: part ? part[1]! : null,
    qty,
    unit,
    certification: cert ? cert[0]!.toUpperCase().replace(/\s+/g, ' ') : null,
    sourceKind,
    sourceText,
    flags,
  }
}

/**
 * Extract draft lines from a pasted enquiry.
 *
 * Strategy, in order:
 *   1. numbered items in the body — the dominant shape
 *   2. quantity markers packed into the title
 *   3. nothing; the caller shows an empty table and the user adds rows by hand
 *
 * Returning zero lines is a legitimate outcome, not an error. It is also the
 * signal for the portal-login case, where the mail genuinely carries no items.
 */
export function extractFromPaste(input: { rawText: string; title?: string }): PasteExtraction {
  const normalisedText = normaliseForParsing(input.rawText)
  const tokens = stripBidTokens(input.title?.trim() || normalisedText.split('\n')[0] || '')

  const numbered = splitNumberedItems(normalisedText)
  let lines: DraftEnquiryLine[] = numbered
    .map((item, i) => buildLine(item.text, i + 1, 'body'))
    .filter((l): l is DraftEnquiryLine => l !== null)

  if (lines.length === 0 && input.title) {
    // No titlePrefix here on purpose. When the items are packed INTO the title,
    // the title IS the source string, so `tokens.title` would be the whole packed
    // run and could never match as a prefix. There is no separate bid name to
    // strip, and guessing where it ends would eat real specification text —
    // "DOCK SPARES GASKET SET" is a worse description than it could be, but it is
    // never WRONG, and a human trims it. dropSelfRepeat still handles the
    // measured shape where the name is literally repeated before item one.
    lines = splitTitleItems(input.title)
      .map((item, i) =>
        buildLine(item.description, i + 1, 'title', { qty: item.qty, unit: item.unit }),
      )
      .filter((l): l is DraftEnquiryLine => l !== null)
  }

  return {
    title: tokens.title,
    bidNo: tokens.bidNo,
    revision: tokens.revision,
    lines: lines.map((l, i) => ({ ...l, position: i + 1 })),
    normalisedText,
    extractorName: PASTE_EXTRACTOR_VERSION,
  }
}
