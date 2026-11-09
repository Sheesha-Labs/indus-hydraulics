import 'server-only'

import { MARKETS, marketPageBySlug, marketCountryName } from '@indus/domain'
import type { CallbackCountry } from './rules'

/**
 * The dial-code select's options: every export market that has a dialling
 * prefix on its market page, plus the UAE, sorted by country name.
 *
 * Built on the server and handed to the prompt as a compact [ISO, dial] list
 * (about a kilobyte) so the browser never loads the market records. The
 * client then moves the visitor's market and the GCC to the top
 * (`orderCountries`).
 */
export function callbackCountries(): CallbackCountry[] {
  const rows = new Map<string, { name: string; dial: string }>()
  rows.set('AE', { name: 'United Arab Emirates', dial: '+971' })
  for (const market of MARKETS) {
    const iso = market.countryCode.toUpperCase()
    const dial = marketPageBySlug(market.slug)?.dialCode
    if (!dial || !/^\+\d{1,4}$/.test(dial) || rows.has(iso)) continue
    rows.set(iso, { name: marketCountryName(market), dial })
  }
  return [...rows.entries()]
    .sort((a, b) => a[1].name.localeCompare(b[1].name, 'en'))
    .map(([iso, r]) => [iso, r.dial] as const)
}

/** ISO code for a market slug — the default dial code on /markets/{slug}. */
export function marketIso(slug: string): string | null {
  return MARKETS.find((m) => m.slug === slug)?.countryCode.toUpperCase() ?? null
}
