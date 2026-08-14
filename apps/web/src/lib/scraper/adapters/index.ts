/**
 * Adapter registry.
 *
 * `getAdapterForHost(hostname, ctx)` returns the first per-host adapter
 * whose `hostname` matches (exact, or trailing-domain match — `acme.com`
 * matches `shop.acme.com`). Falls back to the generic adapter.
 *
 * Per-host adapters belong in `adapters/<hostname>.ts`. Add the factory to
 * `HOST_ADAPTERS` below. Keep the file naming convention so they sort
 * alphabetically and stay easy to grep.
 */

import type { Adapter, ScraperContext } from '../types'
import { createGenericAdapter } from './_generic'

/**
 * `factory`-style registration so each adapter shares the same
 * `ScraperContext` instance the orchestrator built for the host.
 */
type AdapterFactory = (ctx: ScraperContext, hostname: string) => Adapter

const HOST_ADAPTERS: Array<{ matches: (host: string) => boolean; factory: AdapterFactory }> = [
  // Add per-host adapters here. e.g.:
  // { matches: hostMatches('acme-hydraulics.com'), factory: createAcmeAdapter },
]

export function getAdapterForHost(hostname: string, ctx: ScraperContext): Adapter {
  const lower = hostname.toLowerCase()
  for (const reg of HOST_ADAPTERS) {
    if (reg.matches(lower)) return reg.factory(ctx, lower)
  }
  return createGenericAdapter(ctx, lower)
}

/**
 * Helper for per-host registration — matches the exact hostname OR any
 * subdomain of it. Use in `HOST_ADAPTERS` entries.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function hostMatches(target: string): (host: string) => boolean {
  const lower = target.toLowerCase()
  return (host) => host === lower || host.endsWith(`.${lower}`)
}
