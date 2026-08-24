import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import { asLogoStyle, DEFAULT_LOGO_STYLE, type LogoStyle } from './brand-identity'
import { mediaUrl } from './media'

export type ResolvedStoreSettings = {
  name: string
  tagline: string | null
  logoUrl: string | null
  /** How the header logo relates to the typeset wordmark. */
  logoStyle: LogoStyle
  /** Reversed lockup for the navy footer. Never falls back to `logoUrl`. */
  footerLogoUrl: string | null
  /** Browser-tab icon. Null falls back to the bundled app/favicon.ico. */
  faviconUrl: string | null
  /** Square mark for SERP rows and knowledge panels. Falls back favicon → logo. */
  searchLogoUrl: string | null
  certificationLine: string | null
  contactPhone: string | null
  contactEmail: string | null
  contactHours: string | null
  contactLocationLabel: string | null
  /**
   * The footer's bottom-bar line, as the editor typed it — `{year}` still
   * unsubstituted. Resolve it with `resolveFooterLegalLine` from
   * `@indus/domain`; null there yields a correct line from `legalName`.
   */
  footerLegalLine: string | null
  /** Legal entity name from StoreSettings.legalName. Used in Org JSON-LD. */
  legalName: string | null
  /** Registered address fields, used to assemble PostalAddress JSON-LD. */
  registeredAddressLines: string[]
  registeredCity: string | null
  registeredCountry: string | null
  registeredCountryCode: string | null
  registeredPoBox: string | null
}

/**
 * A stored `Media.storagePath` as a URL a browser or a crawler can fetch.
 *
 * Supabase Storage hands back a full public URL for the images bucket, which
 * `mediaUrl` passes through untouched; the older R2-era rows hold a relative
 * key, which it prefixes. Resolving here rather than at each call site is what
 * stops the header, the footer, the icon links and the Organization JSON-LD
 * from disagreeing about the same file.
 */
function toUrl(storagePath: string | null | undefined): string | null {
  return storagePath ? mediaUrl(storagePath) : null
}

const FALLBACK: ResolvedStoreSettings = {
  name: 'Indus Hydraulics',
  tagline: null,
  logoUrl: null,
  logoStyle: DEFAULT_LOGO_STYLE,
  footerLogoUrl: null,
  faviconUrl: null,
  searchLogoUrl: null,
  certificationLine: null,
  contactPhone: null,
  contactEmail: null,
  contactHours: null,
  contactLocationLabel: null,
  footerLegalLine: null,
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
          footerLegalLine: true,
          logoMedia: { select: { storagePath: true } },
          logoStyle: true,
          footerLogoMedia: { select: { storagePath: true } },
          faviconMedia: { select: { storagePath: true } },
          searchLogoMedia: { select: { storagePath: true } },
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
      // Absolutised here rather than at each call site. `mediaUrl` is a
      // passthrough for the full public URLs Supabase Storage hands back, and
      // only prefixes the legacy R2 paths — so it is safe on both, and doing
      // it once means the header, the footer, the icon links and the JSON-LD
      // cannot end up disagreeing about the same file.
      logoUrl: toUrl(row.logoMedia?.storagePath),
      logoStyle: asLogoStyle(row.logoStyle),
      footerLogoUrl: toUrl(row.footerLogoMedia?.storagePath),
      faviconUrl: toUrl(row.faviconMedia?.storagePath),
      searchLogoUrl: toUrl(row.searchLogoMedia?.storagePath),
      certificationLine: row.certificationLine,
      contactPhone: row.contactPhone,
      contactEmail: row.contactEmail,
      contactHours: row.contactHours,
      contactLocationLabel: row.contactLocationLabel,
      footerLegalLine: row.footerLegalLine,
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
