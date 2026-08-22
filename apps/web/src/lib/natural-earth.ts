import 'server-only'

import { feature } from 'topojson-client'
import rawTopology from 'world-atlas/countries-50m.json'

/**
 * Natural Earth country geometry, decoded once per process.
 *
 * TWO NON-NEGOTIABLES, both inherited from the hero maps and both learned the
 * expensive way — see the docblock on `market-geometry.ts` for the full story.
 *
 * 1. THE GEOMETRY IS REAL. Natural Earth 50m via `world-atlas`, projected with
 *    d3-geo. Never traced, never freehanded, never an image.
 *
 *    Use the 50m file, NOT 110m. 110m drops small states entirely — Bahrain
 *    vanishes, which on a page selling freight into Bahrain is fatal.
 *
 * 2. THIS RUNS ON THE SERVER ONLY. The topology is ~700 KB and the projection
 *    is real work; both belong at build time. `server-only` makes importing it
 *    from a client component a build error rather than a 700 KB regression
 *    nobody measures.
 *
 * This module exists because there are now two consumers with very different
 * shapes: one hero map per market page, and 126 thumbnails on `/markets`. The
 * decode is ~240 features and the index page would otherwise repeat it. One
 * cache, one source of truth about which resolution we are on.
 */

export type CountryFeature = {
  type: 'Feature'
  properties: { name?: string } | null
  geometry: unknown
}

let cache: CountryFeature[] | null = null

export function countryFeatures(): CountryFeature[] {
  if (cache) return cache
  // The one cast the `unknown` declaration in types/world-atlas.d.ts buys. See
  // that file for why the JSON is not typed structurally.
  const topology = rawTopology as Parameters<typeof feature>[0]
  const objects = (topology as unknown as { objects: Record<string, object> }).objects
  const collection = feature(
    topology,
    objects.countries as Parameters<typeof feature>[1]
  ) as unknown as { features: CountryFeature[] }
  cache = collection.features
  return cache
}

/**
 * First feature matching any of `names`, best spelling first.
 *
 * Natural Earth's `properties.name` is not always the trade name — Ivory Coast
 * is `Côte d'Ivoire`, DR Congo is `Dem. Rep. Congo` — which is why callers
 * pass a list rather than a string. A null return is a real possibility, not a
 * defensive habit, and every caller renders a labelled placeholder for it.
 */
export function findCountryFeature(names: readonly string[]): CountryFeature | null {
  return (
    countryFeatures().find((f) => f.properties?.name != null && names.includes(f.properties.name)) ??
    null
  )
}
