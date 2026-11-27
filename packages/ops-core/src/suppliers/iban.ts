/**
 * IBANs (S10-T05, architecture §4.11). Pure. Validated with ISO 13616 mod-97; only the last four characters are ever
 * shown in clear ("•••• 1234"). The full IBAN lives only sealed in supplier_bank_account.ibanEnc.
 */

/** Upper-case without spaces or dashes ("gb… west-12…" → "GB…WEST12…"). */
export function normaliseIban(input: string): string {
  return input.replace(/[\s-]+/g, '').toUpperCase()
}

/** Country code, check digits, 11–30 alphanumerics, and mod-97 = 1. */
export function isValidIban(input: string): boolean {
  const iban = normaliseIban(input)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false
  const rearranged = iban.slice(4) + iban.slice(0, 4)
  let rem = 0
  for (const ch of rearranged) {
    const v = ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - 55) : ch
    for (const d of v) rem = (rem * 10 + Number(d)) % 97
  }
  return rem === 1
}

export function ibanLast4(input: string): string {
  return normaliseIban(input).slice(-4)
}

/** The only form an IBAN is ever displayed in. */
export function maskedIban(last4: string): string {
  return `•••• ${last4}`
}

/** Every IBAN-shaped string in a text that passes mod-97 (bank-change detection, board 132). */
export function findIbans(text: string): string[] {
  const out = new Set<string>()
  const re = /\b[A-Z]{2}\d{2}(?:[ -]?[A-Z0-9]{1,4}){3,9}/gi
  for (const m of text.matchAll(re)) {
    // The run can swallow a following word ("… 32 from"): keep the longest prefix that validates.
    const n = normaliseIban(m[0])
    for (let len = Math.min(n.length, 34); len >= 15; len--) {
      if (isValidIban(n.slice(0, len))) {
        out.add(n.slice(0, len))
        break
      }
    }
  }
  return [...out]
}

/** An IBAN from a country code and BBAN with its check digits computed (tests and fixtures build IBANs this way). */
export function ibanWithCheckDigits(country: string, bban: string): string {
  const base = normaliseIban(bban) + country.toUpperCase() + '00'
  let rem = 0
  for (const ch of base) {
    const v = ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - 55) : ch
    for (const d of v) rem = (rem * 10 + Number(d)) % 97
  }
  return `${country.toUpperCase()}${String(98 - rem).padStart(2, '0')}${normaliseIban(bban)}`
}
