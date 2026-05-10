import type { PostalAddressLd } from '@indus/domain'

/**
 * Static office directory used by the contact page UI and the LocalBusiness
 * JSON-LD it emits. Multi-location StoreSettings is a deferred follow-up
 * (see schema.prisma StoreSettings comment), so this file is the interim
 * source of truth.
 *
 * Currently Indus Hydraulics has one verified physical office (Dubai HQ).
 * Add additional locations to this array only after the addresses, phone
 * numbers, and emails have been confirmed — emitting LocalBusiness JSON-LD
 * for unverified locations risks Google penalising the site for false
 * business presence.
 */

export type OfficeKind = 'hq' | 'branch'

export type Office = {
  /** Stable slug used in the JSON-LD @id and as a React key. */
  slug: string
  kind: OfficeKind
  city: string
  /** Banner shown above the city heading in the UI (e.g. "UAE · HQ"). */
  flag: string
  /** ISO 3166-1 alpha-2 country code for JSON-LD. */
  countryCode: string
  address: PostalAddressLd
  /** Free-form display copy used by the existing UI ("Mon–Fri · 09:00–18:00 GST"). */
  hoursLabel: string
  /** Schema.org-shaped openingHours strings, e.g. ["Mo-Fr 09:00-18:00"]. */
  openingHours: string[]
  /** E.164 phone if known. Placeholder when null. */
  telephone: string | null
  email: string | null
}

export const OFFICES: Office[] = [
  {
    slug: 'dubai-hq',
    kind: 'hq',
    city: 'Dubai',
    flag: 'UAE · HQ',
    countryCode: 'AE',
    address: {
      streetAddress: 'Office No 310, Al Hilal Bank Building, Al Nahda Street, Al Quasis-2',
      addressLocality: 'Dubai',
      postalCode: '87556',
      addressCountry: 'AE',
    },
    hoursLabel: 'Mon–Fri · 09:00–18:00 GST',
    openingHours: ['Mo-Fr 09:00-18:00'],
    telephone: '+971 52 2477942',
    email: 'sales@indushydraulics.me',
  },
]

/** Convenience for the root-layout Org schema. */
export function areasServed(): string[] {
  return Array.from(new Set(OFFICES.map((o) => o.countryCode)))
}

/**
 * Format an office address as multi-line plain text for the contact page UI.
 * Empty fields collapse, so partially-populated branches still render cleanly.
 */
export function formatOfficeAddress(office: Office): string {
  const a = office.address
  const cityLine = [a.addressLocality, a.postalCode].filter(Boolean).join(' ')
  const regionLine = [a.addressRegion, regionToCountryName(a.addressCountry)].filter(Boolean).join(', ')
  return [a.streetAddress, cityLine, regionLine].filter((s) => s && s.length > 0).join('\n')
}

function regionToCountryName(code: string | null | undefined): string | null {
  if (!code) return null
  switch (code) {
    case 'IN':
      return 'India'
    case 'AE':
      return 'United Arab Emirates'
    default:
      return code
  }
}
