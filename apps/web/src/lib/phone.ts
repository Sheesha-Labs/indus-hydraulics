import type { DialCountry } from '@indus/domain'

/**
 * Phone-number helpers shared by every phone field on the storefront — the
 * call-back prompt and the enquiry forms. Browser-safe: no server imports.
 */

export const GCC_ORDER = ['AE', 'SA', 'OM', 'KW', 'QA', 'BH'] as const
export const FALLBACK_COUNTRY: DialCountry = ['AE', '+971', 'United Arab Emirates']

/**
 * The dial-code select's order: the default first, then the GCC, then
 * everything else in the order given (the server sorts it by country name).
 */
export function orderCountries(countries: readonly DialCountry[], defaultIso: string): DialCountry[] {
  const byIso = new Map(countries.map((c) => [c[0], c] as const))
  if (!byIso.has(FALLBACK_COUNTRY[0])) byIso.set(FALLBACK_COUNTRY[0], FALLBACK_COUNTRY)
  const out: DialCountry[] = []
  const seen = new Set<string>()
  const push = (iso: string) => {
    const c = byIso.get(iso)
    if (c && !seen.has(iso)) {
      out.push(c)
      seen.add(iso)
    }
  }
  push(byIso.has(defaultIso) ? defaultIso : FALLBACK_COUNTRY[0])
  for (const iso of GCC_ORDER) push(iso)
  for (const c of countries) push(c[0])
  return out
}

/** Path of a country's 3:2 flag under apps/web/public/flags. */
export function flagSrc(iso: string): string {
  return `/flags/${iso.toLowerCase()}.svg`
}

/** Lower-case, accent-free text for matching ("Côte d'Ivoire" → "cote d'ivoire"). */
function fold(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/**
 * The country picker's search: by name (any word's start, accents ignored),
 * ISO code, or dial code with or without the "+". Order is kept, so the
 * default and the GCC stay on top of their matches.
 */
export function filterCountries(countries: readonly DialCountry[], query: string): DialCountry[] {
  const q = fold(query.trim())
  if (!q) return [...countries]
  const digits = q.replace(/^\+/, '').replace(/\s+/g, '')
  const isDial = /^\d+$/.test(digits)
  return countries.filter(([iso, dial, name]) => {
    if (isDial) return dial.replace(/\D/g, '').startsWith(digits)
    if (iso.toLowerCase() === q) return true
    const n = fold(name)
    return n.startsWith(q) || n.split(/[\s\-(]+/).some((w) => w.startsWith(q))
  })
}

/** Keep digits and spaces only — what the phone field accepts as typed. */
export function cleanPhoneInput(raw: string): string {
  return raw.replace(/[^\d\s]/g, '').replace(/\s{2,}/g, ' ').slice(0, 20)
}

/**
 * National digits + dial code → E.164, or null when it cannot be a real
 * number. A trunk "0" is dropped ("052 …" in the UAE is "+971 52 …"), as is a
 * repeated country code typed into the national field.
 */
export function toE164(dial: string, national: string): string | null {
  const cc = dial.replace(/\D/g, '')
  let digits = national.replace(/\D/g, '')
  if (!cc) return null
  if (digits.startsWith('00' + cc)) digits = digits.slice(2 + cc.length)
  digits = digits.replace(/^0+/, '')
  if (digits.length < 6 || digits.length > 14) return null
  if (cc.length + digits.length > 15) return null
  return `+${cc}${digits}`
}

/** "+971521234567" with dial "+971" → "+971 52 123 4567"-ish, for reading back. */
export function displayPhone(e164: string, dial: string): string {
  const cc = dial.replace(/\D/g, '')
  const rest = e164.replace(/^\+/, '').slice(cc.length)
  const groups = rest.length > 7 ? [rest.slice(0, 2), rest.slice(2, 5), rest.slice(5)] : [rest.slice(0, 3), rest.slice(3)]
  return `+${cc} ${groups.filter(Boolean).join(' ')}`
}

/** Must match GEO_COOKIE in proxy.ts, which writes it from the edge country header. */
export const GEO_COOKIE = 'ih_cc'

/** The visitor's country from the proxy's geo cookie, or null (server, no cookie, blocked storage). */
export function readGeoCountry(): string | null {
  try {
    const m = new RegExp(`(?:^|;\\s*)${GEO_COOKIE}=([A-Z]{2})(?:;|$)`).exec(document.cookie)
    return m?.[1] ?? null
  } catch {
    return null
  }
}

/**
 * The dial code a phone field opens on: the page's own country when it has
 * one (a market page), else the visitor's country from the geo cookie, else
 * the UAE. Only a country in `countries` counts.
 */
export function defaultPhoneCountry(
  countries: readonly DialCountry[],
  preferred?: string | null,
  geo: string | null = readGeoCountry(),
): string {
  for (const c of [preferred, geo]) {
    const iso = c?.toUpperCase()
    if (iso && countries.some((row) => row[0] === iso)) return iso
  }
  return FALLBACK_COUNTRY[0]
}

/**
 * What a form stores for a phone number: "+971 52 123 4567" when the digits
 * make a plausible number, else the dial code and what was typed, so nothing
 * the buyer entered is lost. Empty when nothing was typed.
 */
export function composePhone(dial: string, national: string): string {
  const typed = national.trim()
  if (!/\d/.test(typed)) return ''
  const e164 = toE164(dial, typed)
  return e164 ? displayPhone(e164, dial) : `${dial} ${typed}`.slice(0, 32)
}
