import { getStoreSettings } from '../../lib/store-settings'
import { resolveSearchIcon } from '../../lib/brand-identity'
import { serveBrandMark } from '../../lib/serve-brand-mark'
import { BASE_URL } from '../../lib/seo'

/**
 * The mark a search engine draws beside the result and in a knowledge panel:
 * "Search-result logo" from /admin/settings?tab=brand, falling back to the
 * favicon and then the header logo.
 *
 * See `serve-brand-mark.ts` for why this is served from our own origin at a
 * fixed path rather than linked straight to Supabase Storage.
 */
export async function GET(): Promise<Response> {
  const settings = await getStoreSettings()
  return serveBrandMark(resolveSearchIcon(settings, BASE_URL))
}
