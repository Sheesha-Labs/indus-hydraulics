/**
 * The bank block printed on client documents (S11-T07, open item 1). Its wording is the Owner's real block as
 * it appears on the Zoho estimates clients already receive: read from one of those PDFs by this deterministic
 * parser, reviewed and confirmed by the Owner. Nothing about the block lives in code or fixtures (ADR-01): the
 * tests build their IBANs at run time.
 */

/** ISO 13616 mod-97: the IBAN's check digits are right. Spaces are ignored. */
export function ibanValid(raw: string): boolean {
  const s = raw.replace(/\s+/g, '').toUpperCase()
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false
  const moved = s.slice(4) + s.slice(0, 4)
  let rem = 0
  for (const ch of moved) {
    const v = /\d/.test(ch) ? ch : String(ch.charCodeAt(0) - 55)
    for (const d of v) rem = (rem * 10 + Number(d)) % 97
  }
  return rem === 1
}

/** The IBAN for a country and account part with its check digits computed (tests, and a typed-in check). */
export function withCheckDigits(country: string, bban: string): string {
  const probe = `${country.toUpperCase()}00${bban.replace(/\s+/g, '').toUpperCase()}`
  for (let d = 2; d <= 98; d++) {
    const iban = `${probe.slice(0, 2)}${String(d).padStart(2, '0')}${probe.slice(4)}`
    if (ibanValid(iban)) return iban
  }
  throw new RangeError('no check digits')
}

/** Groups of four: "AE000000000000000000000" → "AE00 0000 0000 0000 0000 000". */
export function formatIban(raw: string): string {
  return raw
    .replace(/\s+/g, '')
    .toUpperCase()
    .replace(/(.{4})(?=.)/g, '$1 ')
}

export interface ParsedBankBlock {
  /** The block's lines exactly as printed, in order (what the document prints). */
  printLines: string[]
  bankName: string | null
  accountName: string | null
  iban: string | null
  ibanValid: boolean
  swift: string | null
  branch: string | null
  currency: string | null
}

const IBAN_RE = /\b([A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){2,7}(?: ?[A-Z0-9]{1,3})?)\b/
const SWIFT_RE = /\b([A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)\b/
const CCY_RE = /\b(AED|USD|EUR|GBP|SAR|OMR|KWD|QAR|BHD|INR|CNY|JPY|CHF)\b/

const labelled = (line: string, labels: RegExp): string | null => {
  const m = new RegExp(`^\\s*(?:${labels.source})\\s*[:.-]?\\s*(.+)$`, 'i').exec(line)
  return m?.[1]?.trim() || null
}

/**
 * Find the bank block in a document's text: the lines from a "Bank" heading or label down to the IBAN /
 * SWIFT lines (at most 8). Fields are read from "Label: value" lines where present; the IBAN is checked
 * with mod-97. Null when no IBAN is found anywhere near a bank line.
 */
export function parseBankBlock(text: string): ParsedBankBlock | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  const ibanAt = lines.findIndex(
    (l) => IBAN_RE.test(l.toUpperCase()) && /iban|a\/c|account|^[A-Z]{2}\d{2}/i.test(l)
  )
  if (ibanAt < 0) return null
  // Walk up to the block's start: a "bank" line within the 6 lines above the IBAN.
  let start = ibanAt
  for (let i = ibanAt; i >= Math.max(0, ibanAt - 6); i--) if (/bank/i.test(lines[i]!)) start = i
  // A heading line ("Bank details") is not printed as a line of the block.
  if (/^bank(ing)?\s+(details|information|account)s?:?$/i.test(lines[start]!)) start++
  let end = ibanAt
  for (let i = ibanAt + 1; i < Math.min(lines.length, ibanAt + 4); i++)
    if (/swift|bic|branch|currency|routing|sort code/i.test(lines[i]!)) end = i
    else break
  const block = lines.slice(start, end + 1).slice(0, 8)
  const iban = (IBAN_RE.exec(lines[ibanAt]!.toUpperCase())?.[1] ?? '').replace(/\s+/g, '')
  const swiftLine = block.find((l) => /swift|bic/i.test(l))
  const swift = swiftLine
    ? (SWIFT_RE.exec(swiftLine.toUpperCase().replace(/(SWIFT|BIC)\W*(CODE)?/g, ' '))?.[1] ?? null)
    : null
  const bankName =
    block
      .map((l) => labelled(l, /bank(?:\s*name)?/))
      .find((v) => v && !IBAN_RE.test(v.toUpperCase())) ??
    block.find((l) => /bank/i.test(l) && !/[:]/.test(l)) ??
    null
  const accountName =
    block
      .map((l) => labelled(l, /(?:account|a\/c)\s*(?:name|title)|beneficiary(?:\s*name)?/))
      .find(Boolean) ?? null
  const branch = block.map((l) => labelled(l, /branch/)).find(Boolean) ?? null
  const currency =
    block
      .map((l) => labelled(l, /currency/))
      .find(Boolean)
      ?.toUpperCase()
      .slice(0, 3) ??
    block.map((l) => CCY_RE.exec(l.toUpperCase())?.[1]).find(Boolean) ??
    null
  return {
    printLines: block,
    bankName,
    accountName,
    iban: iban || null,
    ibanValid: iban ? ibanValid(iban) : false,
    swift,
    branch,
    currency,
  }
}
