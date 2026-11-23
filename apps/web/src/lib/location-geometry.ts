import 'server-only'

import { geoMercator, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'
import {
  HOSE_BAY_COORDS,
  hoseBayDistanceKm,
  serviceAreasOrdered,
  type ServiceArea,
} from '@indus/domain'
import { findCountryFeature } from './natural-earth'

/**
 * The UAE map on `/locations` and every `/locations/<slug>` page.
 *
 * Same rules as the market hero map (`market-geometry.ts`), for the same
 * reasons: the outline is Natural Earth 50m projected with d3-geo — never
 * traced — and the projection runs on the server only, so the browser gets
 * finished path strings and no topology.
 *
 * What it shows: the UAE outline, the edges of Oman and Saudi Arabia for
 * context, a marker per area we service, and the Dubai hose bay. On an area
 * page that area is highlighted and joined to the bay by a straight dashed
 * line — straight because the figure beside it is a straight-line distance,
 * and a line that looked like a route would claim one.
 *
 * Bytes: the neighbours are clipped to the frame by the projection itself
 * (`clipExtent`), so Saudi Arabia costs a few hundred bytes, not its whole
 * coastline.
 */

const WIDTH = 640
const HEIGHT = 440
const PAD = 26

/** Frame in degrees: the UAE plus a margin of Gulf and Oman, west → east. */
const FRAME = {
  type: 'Feature' as const,
  properties: {},
  geometry: {
    type: 'MultiPoint' as const,
    coordinates: [
      [51.55, 22.6],
      [56.45, 26.15],
    ],
  },
}

/**
 * Label offsets, in pixels from the marker. The four areas around the hose
 * bay sit within ~40 km of each other — a few pixels at this scale — so their
 * labels are pulled out into the Gulf on leader lines rather than left to
 * collide. Tuned by eye against the rendered frame; a new area gets the
 * default from its `labelSide`.
 */
const LABEL_OFFSETS: Record<string, readonly [number, number]> = {
  dubai: [-42, 21],
  sharjah: [-47, -21],
  ajman: [-44, -35],
  'umm-al-quwain': [-48, -39],
  'ras-al-khaimah': [15, -13],
  fujairah: [14, 30],
  'abu-dhabi': [-10, 26],
  habshan: [12, 22],
  'al-ain': [14, 18],
}

export type LocationMapMarker = {
  readonly slug: string
  readonly name: string
  readonly x: number
  readonly y: number
  readonly labelX: number
  readonly labelY: number
  readonly anchor: 'start' | 'end'
  /** Draw a leader line from the marker to the label. */
  readonly leader: boolean
  readonly active: boolean
}

export type LocationMapModel = {
  readonly width: number
  readonly height: number
  readonly uae: string
  readonly neighbours: readonly string[]
  readonly neighbourLabels: readonly { x: number; y: number; text: string }[]
  readonly bay: { readonly x: number; readonly y: number }
  readonly markers: readonly LocationMapMarker[]
  /** The bay → active-area segment; null on the hub and on the Dubai page. */
  readonly link: {
    readonly x1: number
    readonly y1: number
    readonly x2: number
    readonly y2: number
  } | null
  /** Straight-line km from the bay to the active area; null on the hub. */
  readonly km: number | null
  readonly ariaLabel: string
}

const modelCache = new Map<string, LocationMapModel | null>()

/**
 * Build the draw model. `activeSlug` null builds the hub map (every area
 * equal, no link). Returns null when Natural Earth cannot be read, and the
 * caller renders without a map rather than with a hole.
 */
export function buildLocationMapModel(activeSlug: string | null): LocationMapModel | null {
  const cacheKey = activeSlug ?? '*'
  if (modelCache.has(cacheKey)) return modelCache.get(cacheKey) ?? null

  const uaeFeature = findCountryFeature(['United Arab Emirates'])
  if (!uaeFeature) {
    modelCache.set(cacheKey, null)
    return null
  }

  const projection = geoMercator()
    .fitExtent(
      [
        [PAD, PAD],
        [WIDTH - PAD, HEIGHT - PAD],
      ],
      FRAME as unknown as GeoPermissibleObjects
    )
    .clipExtent([
      [0, 0],
      [WIDTH, HEIGHT],
    ])
  const path = geoPath(projection).digits(1)
  const project = (c: readonly [number, number]): [number, number] => {
    const p = projection([c[0], c[1]])
    return p ? [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10] : [Number.NaN, Number.NaN]
  }

  const neighbourNames = ['Oman', 'Saudi Arabia', 'Qatar']
  const neighbours = neighbourNames
    .map((name) => findCountryFeature([name]))
    .filter((f): f is NonNullable<typeof f> => f != null)
    .map((f) => path(f as unknown as GeoPermissibleObjects))
    .filter((d): d is string => d != null && d !== '')

  const areas = serviceAreasOrdered()
  const [bx, by] = project(HOSE_BAY_COORDS)

  const markers: LocationMapMarker[] = areas.map((area) => {
    const [x, y] = project(area.coords)
    const offset = LABEL_OFFSETS[area.slug] ?? (area.labelSide === 'left' ? [-10, 4] : [10, 4])
    const [dx, dy] = offset
    return {
      slug: area.slug,
      name: area.name === 'Habshan and Al Dhafra' ? 'Habshan · Al Dhafra' : area.name,
      x,
      y,
      labelX: Math.round((x + dx) * 10) / 10,
      labelY: Math.round((y + dy) * 10) / 10,
      anchor: dx < 0 ? 'end' : 'start',
      leader: Math.hypot(dx, dy) > 24,
      active: area.slug === activeSlug,
    }
  })

  const active: ServiceArea | undefined = areas.find((a) => a.slug === activeSlug)
  const activeMarker = markers.find((m) => m.active)
  const link =
    active && activeMarker && active.slug !== 'dubai'
      ? { x1: bx, y1: by, x2: activeMarker.x, y2: activeMarker.y }
      : null

  const model: LocationMapModel = {
    width: WIDTH,
    height: HEIGHT,
    uae: path(uaeFeature as unknown as GeoPermissibleObjects) ?? '',
    neighbours,
    neighbourLabels: [
      { ...pt(project([56.0, 23.25])), text: 'OMAN' },
      { ...pt(project([52.35, 22.85])), text: 'SAUDI ARABIA' },
      { ...pt(project([53.6, 25.55])), text: 'ARABIAN GULF' },
    ],
    bay: { x: bx, y: by },
    markers,
    link,
    km: active ? hoseBayDistanceKm(active) : null,
    ariaLabel: active
      ? `Map of the United Arab Emirates showing ${active.name} and the Dubai hose bay${
          active.slug === 'dubai'
            ? ''
            : `, about ${hoseBayDistanceKm(active)} km apart in a straight line`
        }, with the other areas we service.`
      : `Map of the United Arab Emirates showing the ${areas.length} areas we service on site and the Dubai hose bay.`,
  }
  modelCache.set(cacheKey, model)
  return model
}

function pt([x, y]: [number, number]): { x: number; y: number } {
  return { x, y }
}
