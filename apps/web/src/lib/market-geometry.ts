import 'server-only'

import { geoCentroid, geoDistance, geoGraticule, geoMercator, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'
import {
  corridorKm,
  formatLatTick,
  formatLonTick,
  graticuleStep,
  kmPerLonDegree,
  pickScaleBar,
  primaryRoute,
  ticksBetween,
  type LabelAnchor,
  type LonLat,
  type MarketMap,
  type MarketPage,
} from '@indus/domain'
import { countryFeatures, findCountryFeature, type CountryFeature } from './natural-earth'

/**
 * The hero map for `/markets/{slug}` — projection, collision rules and every
 * number printed on the frame.
 *
 * TWO NON-NEGOTIABLES, both learned the expensive way.
 *
 * 1. THE GEOMETRY IS REAL. Country outlines are Natural Earth 50m via
 *    `world-atlas`, projected with d3-geo. Never traced, never freehanded,
 *    never an image. Hand-drawn geography is reliably wrong about coastlines
 *    and enclaves and readers notice immediately.
 *
 *    Use the 50m file, NOT 110m. 110m drops small states entirely — Bahrain
 *    vanishes, which on a page selling freight into Bahrain is fatal.
 *
 * 2. THIS RUNS ON THE SERVER ONLY. The topology is ~700 KB and the projection
 *    is real work; both belong at build time. `/markets/[slug]` is statically
 *    generated per market, so this module executes once per market per build
 *    and the browser receives finished path strings. `server-only` makes the
 *    mistake a build error rather than a 700 KB regression nobody measures.
 *
 * The component that renders this model does no arithmetic at all. Everything
 * — tick intervals, the scale bar, label suppression, the corridor distance —
 * is decided here and handed over as coordinates, so the drawing and its
 * annotations cannot disagree.
 */

const WIDTH = 664
const HEIGHT = 524
/** Frame inset. The extra 18px on the fit keeps coastal labels off the rule. */
const PAD = 42

/** Neighbours are countries whose centroid is within this angle, in radians. */
const NEIGHBOUR_RADIUS = 0.46

export type MapLabel = {
  readonly x: number
  readonly y: number
  readonly text: string
  readonly anchor: LabelAnchor
}

export type MarketMapModel = {
  readonly width: number
  readonly height: number
  readonly pad: number
  /** Namespaced id fragment — several SVGs can share a page without clashing. */
  readonly uid: string
  readonly graticule: string | null
  readonly target: string
  readonly neighbours: readonly string[]
  readonly neighbourLabels: readonly MapLabel[]
  readonly routes: readonly { readonly d: string; readonly primary: boolean }[]
  readonly crossing: { readonly x: number; readonly y: number; readonly label: MapLabel }
  readonly cities: readonly { readonly x: number; readonly y: number; readonly label: MapLabel }[]
  /** Null when Dubai falls outside the frame — see `fit` in the data contract. */
  readonly origin: { readonly x: number; readonly y: number; readonly label: MapLabel } | null
  /**
   * The origin's name, always present even when its marker is suppressed —
   * the legend still has to say where the corridor comes from.
   */
  readonly originLabel: string
  readonly lonTicks: readonly { readonly x: number; readonly text: string }[]
  readonly latTicks: readonly { readonly y: number; readonly text: string }[]
  readonly scaleBar: { readonly km: number; readonly px: number }
  /** The in-frame corridor annotation, top left. */
  readonly corridor: string
  readonly corridorKm: number
  readonly primaryMode: string
  /** Legend wording for the crossing marker. */
  readonly crossingLegend: string
  readonly ariaLabel: string
}

/** Neighbour sets are stable per country; keyed by the target's own name. */
const neighbourCache = new Map<string, CountryFeature[]>()

/**
 * Build the finished draw model, or `null` when the country cannot be matched
 * in Natural Earth.
 *
 * A null return is a real possibility, not a defensive habit: Natural Earth's
 * `properties.name` is not always the trade name, which is why `geoNames` is
 * an array. The caller renders a labelled placeholder panel rather than an
 * empty frame, so a naming mismatch degrades to "no map" instead of a hole in
 * the page.
 */
export function buildMarketMapModel(page: MarketPage, countryName: string): MarketMapModel | null {
  const map = page.map
  const target = findCountryFeature(map.geoNames)
  if (!target) return null

  const anchor: LonLat = map.fit === 'crossing' ? map.crossing.coords : map.origin
  const focus = {
    type: 'FeatureCollection' as const,
    features: [
      target,
      { type: 'Feature' as const, properties: {}, geometry: { type: 'Point' as const, coordinates: anchor } },
    ],
  }

  const projection = geoMercator().fitExtent(
    [
      [PAD + 18, PAD + 18],
      [WIDTH - PAD - 18, HEIGHT - PAD - 18],
    ],
    focus as unknown as GeoPermissibleObjects
  )
  const path = geoPath(projection)
  const project = (c: LonLat): [number, number] => {
    const p = projection([c[0], c[1]])
    // d3 returns null for a coordinate the projection cannot place. Every
    // coordinate on this page is inside the Mercator domain, but the type is
    // honest and the fallback keeps a bad data row off the top-left corner.
    return p ?? [Number.NaN, Number.NaN]
  }

  // ── Frame bounds, in degrees ──
  const topLeft = projection.invert?.([PAD, PAD])
  const bottomRight = projection.invert?.([WIDTH - PAD, HEIGHT - PAD])
  if (!topLeft || !bottomRight) return null
  const [lonFrom, latTo] = topLeft
  const [lonTo, latFrom] = bottomRight
  const step = graticuleStep(lonTo - lonFrom)

  // ── Neighbours ──
  const targetCentroid = geoCentroid(target as unknown as GeoPermissibleObjects)
  const cacheKey = target.properties?.name ?? page.slug
  let near = neighbourCache.get(cacheKey)
  if (!near) {
    near = countryFeatures().filter(
      (f) =>
        f !== target &&
        geoDistance(geoCentroid(f as unknown as GeoPermissibleObjects), targetCentroid) < NEIGHBOUR_RADIUS
    )
    neighbourCache.set(cacheKey, near)
  }

  const originPoint = project(map.origin)
  const crossingPoint = project(map.crossing.coords)

  /*
    Four suppression rules for neighbour names, each of which fixed a real
    collision on a real market. Keep all four:

      1. Too small to carry a label at all.
      2. Too close to the frame edge — the label would be clipped by the rule.
      3. Too close to the origin or crossing marker, whose own labels win.
      4. Inside the top-left box where the corridor annotation sits.
  */
  const neighbourLabels: MapLabel[] = []
  for (const f of near) {
    const area = path.area(f as unknown as GeoPermissibleObjects)
    if (area < 2000) continue
    const centroid = geoCentroid(f as unknown as GeoPermissibleObjects)
    const [x, y] = project([centroid[0], centroid[1]])
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    if (x < PAD + 30 || x > WIDTH - PAD - 30 || y < PAD + 16 || y > HEIGHT - PAD - 16) continue
    if (Math.hypot(x - originPoint[0], y - originPoint[1]) < 68) continue
    if (Math.hypot(x - crossingPoint[0], y - crossingPoint[1]) < 68) continue
    if (x < PAD + 300 && y < PAD + 34) continue
    const name = f.properties?.name
    if (!name) continue
    neighbourLabels.push({ x, y, text: name.toUpperCase(), anchor: 'middle' })
  }

  // ── Origin marker, and whether it is in shot at all ──
  const originInFrame =
    originPoint[0] > PAD - 2 &&
    originPoint[0] < WIDTH - PAD + 2 &&
    originPoint[1] > PAD - 2 &&
    originPoint[1] < HEIGHT - PAD + 2

  const route = primaryRoute(map)
  const km = corridorKm(route.points)

  // ── Scale bar ──
  const midLat = (latFrom + latTo) / 2
  const scaleBar = pickScaleBar((barKm) => {
    const deltaLon = barKm / kmPerLonDegree(midLat)
    return Math.abs(project([lonFrom + deltaLon, midLat])[0] - project([lonFrom, midLat])[0])
  })

  const graticule = geoGraticule()
    .extent([
      [lonFrom - step, latFrom - step],
      [lonTo + step, latTo + step],
    ])
    .step([step, step])()

  return {
    width: WIDTH,
    height: HEIGHT,
    pad: PAD,
    uid: page.slug,
    graticule: path(graticule as unknown as GeoPermissibleObjects),
    target: path(target as unknown as GeoPermissibleObjects) ?? '',
    neighbours: near
      .map((f) => path(f as unknown as GeoPermissibleObjects))
      .filter((d): d is string => d != null),
    neighbourLabels,
    routes: map.routes.map((r) => ({
      d:
        path({
          type: 'LineString',
          coordinates: r.points as unknown as number[][],
        } as unknown as GeoPermissibleObjects) ?? '',
      primary: r.primary === true,
    })),
    crossing: {
      x: crossingPoint[0],
      y: crossingPoint[1],
      label: {
        x: crossingPoint[0] + (map.crossing.dx ?? 0),
        y: crossingPoint[1] + (map.crossing.dy ?? -11),
        text: map.crossing.name,
        anchor: map.crossing.anchor ?? 'middle',
      },
    },
    cities: page.cities
      .filter((c) => c.plot)
      .map((c) => {
        const [x, y] = project(c.coords)
        return {
          x,
          y,
          label: {
            x: x + (c.dx ?? 8),
            y: y + (c.dy ?? 3),
            text: c.name.toUpperCase(),
            anchor: c.anchor ?? 'start',
          },
        }
      }),
    origin: originInFrame
      ? { x: originPoint[0], y: originPoint[1], label: originLabel(originPoint, crossingPoint, map) }
      : null,
    originLabel: map.originLabel,
    lonTicks: ticksBetween(lonFrom, lonTo, step)
      .map((t) => ({ x: project([t, latFrom])[0], text: formatLonTick(t) }))
      .filter((t) => t.x >= PAD && t.x <= WIDTH - PAD),
    latTicks: ticksBetween(latFrom, latTo, step)
      .map((t) => ({ y: project([lonFrom, t])[1], text: formatLatTick(t) }))
      .filter((t) => t.y >= PAD && t.y <= HEIGHT - PAD),
    scaleBar,
    corridor: `${route.mode} · ${km.toLocaleString('en-GB')} KM${originInFrame ? '' : ` · FROM ${map.originLabel}`}`,
    corridorKm: km,
    primaryMode: route.mode,
    crossingLegend: map.crossing.legend ?? 'Border crossing',
    ariaLabel: describeLane(map, countryName, km, route.mode),
  }
}

/**
 * Place the origin label so it clears both the frame edge and the crossing
 * marker. Three cases, in this order: hard against the right or left edge, the
 * label flips inboard and sits level with the marker; otherwise it sits below
 * the marker, and moves above it when the crossing is further down the frame.
 */
function originLabel(
  origin: readonly [number, number],
  crossing: readonly [number, number],
  map: MarketMap
): MapLabel {
  const nearRight = origin[0] > WIDTH - PAD - 96
  const nearLeft = origin[0] < PAD + 96
  const clashes = Math.abs(origin[0] - crossing[0]) < 118 && Math.abs(origin[1] - crossing[1]) < 48
  const crossingIsBelow = crossing[1] > origin[1]
  const inboard = nearRight || nearLeft

  const x = nearRight ? origin[0] - 14 : nearLeft ? origin[0] + 14 : origin[0]
  const y = clashes
    ? crossingIsBelow
      ? origin[1] - (inboard ? 11 : 15)
      : origin[1] + (inboard ? 19 : 22)
    : inboard
      ? origin[1] + 4
      : origin[1] + 22

  return { x, y, text: map.originLabel, anchor: nearRight ? 'end' : nearLeft ? 'start' : 'middle' }
}

/**
 * The map in words, for the SVG's `aria-label`.
 *
 * The manifest strip and the hero fact table already carry every fact the map
 * shows, so a screen-reader user loses nothing by getting one sentence here
 * rather than a description of the drawing.
 */
function describeLane(map: MarketMap, countryName: string, km: number, mode: string): string {
  const destination = map.crossing.name.replace(/\s*·\s*/g, ', ').toLowerCase()
  return `Freight corridor from ${titleCase(map.originLabel)} to ${destination} in ${countryName} — ${km.toLocaleString('en-GB')} km by ${mode.toLowerCase()}.`
}

function titleCase(value: string): string {
  return value
    .split(/\s*·\s*/)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(', ')
}
