import 'server-only'

import { DIAL_COUNTRIES, type DialCountry } from '@indus/domain'

/**
 * The dial codes the call-back action accepts — every country, the same list
 * the browser's picker shows (`DIAL_COUNTRIES`). The dial code is looked up
 * here from the submitted ISO, never taken from the browser.
 */
export function callbackCountries(): readonly DialCountry[] {
  return DIAL_COUNTRIES
}
