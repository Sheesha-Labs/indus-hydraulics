import type { PostalAddressLd } from '@indus/domain'

/**
 * Static office directory used by the contact page UI and the LocalBusiness
 * JSON-LD it emits. Multi-location StoreSettings is a deferred follow-up
 * (see schema.prisma StoreSettings comment), so this file is the interim
 * source of truth.
 *
 * NOTE: addresses below are the public mailing addresses for Indus
 * Hydraulics offices; phone numbers are placeholders pending the user
 * supplying live numbers. Once StoreSettings grows multi-location support,
 * delete this file and source from the DB instead.
 */

export type OfficeKind = 'hq' | 'branch'

export type Office = {
  /** Stable slug used in the JSON-LD @id and as a React key. */
  slug: string
  kind: OfficeKind
  city: string
  /** Banner shown above the city heading in the UI (e.g. "INDIA · HQ"). */
  flag: string
  /** ISO 3166-1 alpha-2 country code for JSON-LD. */
  countryCode: string
  address: PostalAddressLd
  /** Free-form display copy used by the existing UI ("Mon–Sat · 09:00–18:30 IST"). */
  hoursLabel: string
  /** Schema.org-shaped openingHours strings, e.g. ["Mo-Sa 09:00-18:30"]. */
  openingHours: string[]
  /** E.164 phone if known. Placeholder when null. */
  telephone: string | null
  email: string | null
}

export const OFFICES: Office[] = [
  {
    slug: 'mumbai-hq',
    kind: 'hq',
    city: 'Mumbai',
    flag: 'INDIA · HQ',
    countryCode: 'IN',
    address: {
      streetAddress: 'Andheri East',
      addressLocality: 'Mumbai',
      addressRegion: 'Maharashtra',
      postalCode: '400 059',
      addressCountry: 'IN',
    },
    hoursLabel: 'Mon–Sat · 09:00–18:30 IST',
    openingHours: ['Mo-Sa 09:00-18:30'],
    telephone: null,
    email: null,
  },
  {
    slug: 'delhi-ncr',
    kind: 'branch',
    city: 'Delhi NCR',
    flag: 'INDIA',
    countryCode: 'IN',
    address: {
      streetAddress: 'Sector 68, Gurugram',
      addressLocality: 'Gurugram',
      addressRegion: 'Haryana',
      postalCode: '122 018',
      addressCountry: 'IN',
    },
    hoursLabel: 'Mon–Sat · 09:00–18:30 IST',
    openingHours: ['Mo-Sa 09:00-18:30'],
    telephone: null,
    email: null,
  },
  {
    slug: 'dubai',
    kind: 'branch',
    city: 'Dubai',
    flag: 'UAE',
    countryCode: 'AE',
    address: {
      streetAddress: 'JAFZA · Jebel Ali',
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
    hoursLabel: 'Sun–Thu · 08:30–17:30 GST',
    openingHours: ['Su-Th 08:30-17:30'],
    telephone: null,
    email: null,
  },
  {
    slug: 'chennai',
    kind: 'branch',
    city: 'Chennai',
    flag: 'INDIA',
    countryCode: 'IN',
    address: {
      streetAddress: 'Ambattur Industrial Estate',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      postalCode: '600 058',
      addressCountry: 'IN',
    },
    hoursLabel: 'Mon–Sat · 09:00–18:30 IST',
    openingHours: ['Mo-Sa 09:00-18:30'],
    telephone: null,
    email: null,
  },
]

/** Convenience for the root-layout Org schema. */
export function areasServed(): string[] {
  return Array.from(new Set(OFFICES.map((o) => o.countryCode)))
}

/**
 * Format an office address as multi-line plain text for the contact page UI.
 * Equivalent to the previous hand-rolled "Andheri East\nMumbai 400 059\n…"
 * literals — keeps the visual presentation byte-identical when source data
 * matches. Empty fields collapse, so partially-populated branches still
 * render cleanly.
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
      return 'UAE'
    default:
      return code
  }
}
