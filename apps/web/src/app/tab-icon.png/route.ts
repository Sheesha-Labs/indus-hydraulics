import { getStoreSettings } from '../../lib/store-settings'
import { resolveTabIcon } from '../../lib/brand-identity'
import { serveBrandMark } from '../../lib/serve-brand-mark'
import { BASE_URL } from '../../lib/seo'

/**
 * The tab-strip favicon: "Favicon" from /admin/settings?tab=brand, falling
 * back to the search mark and then the header logo — the mirror of
 * /brand-icon.png's chain, so whichever single file an operator uploads, both
 * links resolve.
 *
 * Named `/tab-icon.png` and not `/favicon.png` on purpose: `favicon` is close
 * enough to Next's `app/favicon.ico` metadata convention to invite confusion
 * about which mechanism is emitting the link, and this one is emitted by
 * `buildIconMetadata` alone.
 *
 * See `serve-brand-mark.ts` for why this is served from our own origin at a
 * fixed path rather than linked straight to Supabase Storage.
 */
export async function GET(): Promise<Response> {
  const settings = await getStoreSettings()
  return serveBrandMark(resolveTabIcon(settings, BASE_URL))
}
