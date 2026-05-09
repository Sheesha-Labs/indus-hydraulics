import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'

export type ResolvedStoreSettings = {
  name: string
  tagline: string | null
  logoUrl: string | null
  certificationLine: string | null
  contactPhone: string | null
  contactEmail: string | null
  contactHours: string | null
  contactLocationLabel: string | null
  /** Legal entity name from StoreSettings.legalName. Used in Org JSON-LD. */
  legalName: string | null
  /** Registered address fields, used to assemble PostalAddress JSON-LD. */
  registeredAddressLines: string[]
  registeredCity: string | null
  registeredCountry: string | null
  registeredCountryCode: string | null
  registeredPoBox: string | null
}

const FALLBACK: ResolvedStoreSettings = {
  name: 'Indus Hydraulics',
  tagline: null,
  logoUrl: null,
  certificationLine: null,
  contactPhone: null,
  contactEmail: null,
  contactHours: null,
  contactLocationLabel: null,
  legalName: null,
  registeredAddressLines: [],
  registeredCity: null,
  registeredCountry: null,
  registeredCountryCode: null,
  registeredPoBox: null,
}

// Persistent cross-request cache. Admin should call revalidateTag('store-settings')
// after any StoreSettings mutation so changes propagate immediately.
const loadStoreSettings = unstable_cache(
  async (): Promise<ResolvedStoreSettings> => {
    const row = await db.storeSettings
      .findFirst({
        select: {
          name: true,
          tagline: true,
          certificationLine: true,
          contactPhone: true,
          contactEmail: true,
          contactHours: true,
          contactLocationLabel: true,
          logoMedia: { select: { storagePath: true } },
          legalName: true,
          registeredAddressLines: true,
          registeredCity: true,
          registeredCountry: true,
          registeredCountryCode: true,
          registeredPoBox: true,
        },
      })
      .catch(() => null)
    if (!row) return FALLBACK
    const lines = Array.isArray(row.registeredAddressLines)
      ? (row.registeredAddressLines as unknown[]).filter((l): l is string => typeof l === 'string')
      : []
    return {
      name: row.name,
      tagline: row.tagline,
      logoUrl: row.logoMedia?.storagePath ?? null,
      certificationLine: row.certificationLine,
      contactPhone: row.contactPhone,
      contactEmail: row.contactEmail,
      contactHours: row.contactHours,
      contactLocationLabel: row.contactLocationLabel,
      legalName: row.legalName,
      registeredAddressLines: lines,
      registeredCity: row.registeredCity,
      registeredCountry: row.registeredCountry,
      registeredCountryCode: row.registeredCountryCode,
      registeredPoBox: row.registeredPoBox,
    }
  },
  ['store-settings'],
  { revalidate: 300, tags: ['store-settings'] },
)

// React cache() outer for per-request de-duplication.
export const getStoreSettings = cache(loadStoreSettings)
