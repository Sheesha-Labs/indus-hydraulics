import type { WeekendTable } from './working-day'

/**
 * Weekend days by country (S04-T06, 08-map-integrations §1.10, board 100). 0 = Sunday … 6 = Saturday. The live
 * table is the setting `calendar.country_weekends` (database content, signed off by the Owner); this constant is
 * its seeded default and the fallback when the row cannot be read. Pure.
 */
export const DEFAULT_COUNTRY_WEEKENDS: WeekendTable = {
  default: [6, 0],
  byCountry: {
    AE: [6, 0],
    SA: [5, 6],
    OM: [5, 6],
    KW: [5, 6],
    QA: [5, 6],
    BH: [5, 6],
    EG: [5, 6],
    IR: [4, 5],
  },
}

/** Country-code TLDs that are not the ISO code of the country they serve. */
const TLD_ALIASES: Readonly<Record<string, string>> = { uk: 'GB' }

/**
 * Fallback country from an address's top-level domain (`…@example.co.jp` → JP), or null for generic TLDs
 * (.com, .net, .org …). Used only when the recipient's company has no country.
 */
export function countryFromAddress(address: string): string | null {
  const domain = address.trim().toLowerCase().split('@')[1] ?? ''
  const tld = domain.split('.').at(-1) ?? ''
  if (!/^[a-z]{2}$/.test(tld)) return null
  return TLD_ALIASES[tld] ?? tld.toUpperCase()
}
