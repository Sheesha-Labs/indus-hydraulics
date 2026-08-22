/**
 * Hero-map maths — the parts that are arithmetic rather than cartography.
 *
 * The projection itself needs d3-geo and Natural Earth topology, which are
 * server-only and live in `apps/web/src/lib/market-geometry.ts`. Everything
 * here is pure, dependency-free and unit-tested, because these are exactly the
 * rules that go quietly wrong: a tick interval that produces 340 labels, a
 * scale bar that reads 800 km on a 200 km frame, a corridor distance that
 * stops matching the line drawn under it.
 *
 * The governing rule for the whole map: NOTHING SHOWN IS AUTHORED. The
 * outline is real Natural Earth geometry, the distance is summed from the
 * route's own waypoints, the ticks and the scale bar are derived from the
 * frame. A content edit cannot leave the drawing saying one thing and the
 * caption another, because the caption is computed from the drawing.
 */

import type { LonLat } from './market-pages'

/** Mean Earth radius, km. The value d3-geo's unit sphere is scaled by. */
export const EARTH_RADIUS_KM = 6371

/**
 * Great-circle length of a polyline, in kilometres.
 *
 * Haversine per leg, summed. This is the same quantity `d3.geoDistance` gives
 * (the central angle on a unit sphere) times the radius — reimplemented here
 * so the domain package stays dependency-free and the result is testable
 * without pulling in a projection.
 *
 * Nigeria reads 13,910 km because its route genuinely rounds the Cape of Good
 * Hope. Straighten the waypoints and the number falls to about 6,000 and the
 * line crosses the Sahara. That is the point: the number is the geometry.
 */
export function greatCircleKm(points: readonly LonLat[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += legKm(points[i - 1]!, points[i]!)
  }
  return total
}

function legKm(a: LonLat, b: LonLat): number {
  const toRad = Math.PI / 180
  const lat1 = a[1] * toRad
  const lat2 = b[1] * toRad
  const dLat = lat2 - lat1
  const dLon = (b[0] - a[0]) * toRad
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * Math.asin(Math.min(1, Math.sqrt(h))) * EARTH_RADIUS_KM
}

/** Corridor distance as printed in-frame: kilometres rounded to the nearest 10. */
export function corridorKm(points: readonly LonLat[]): number {
  return Math.round(greatCircleKm(points) / 10) * 10
}

/**
 * Graticule and tick interval, in degrees, chosen from the frame's longitude
 * span so a wide frame does not draw 300 gridlines and a tight one does not
 * draw two.
 */
export function graticuleStep(lonSpan: number): number {
  if (lonSpan > 16) return 5
  if (lonSpan > 6) return 2
  if (lonSpan > 2) return 1
  if (lonSpan > 1) return 0.5
  return 0.25
}

/**
 * Tick values at `step` intervals covering `[from, to]`.
 *
 * Rounded to two decimals because the fractional steps (0.5, 0.25) otherwise
 * accumulate float error into labels like `7.000000000000001°`.
 */
export function ticksBetween(from: number, to: number, step: number): number[] {
  const out: number[] = []
  for (let i = Math.ceil(from / step); i * step <= to; i++) {
    const value = i * step
    out.push(Number.isInteger(value) ? value : Number(value.toFixed(2)))
  }
  return out
}

/** Longitude tick label. A bare `0°` on the prime meridian. */
export function formatLonTick(value: number): string {
  if (value === 0) return '0°'
  return `${Math.abs(value)}°${value < 0 ? 'W' : 'E'}`
}

/** Latitude tick label. A bare `0°` on the equator. */
export function formatLatTick(value: number): string {
  if (value === 0) return '0°'
  return `${Math.abs(value)}°${value < 0 ? 'S' : 'N'}`
}

/** Rungs the scale bar is allowed to land on, in km. */
export const SCALE_BAR_STEPS = [2, 5, 10, 20, 50, 100, 200, 400, 800] as const

/**
 * Pick the scale-bar length: the first rung that renders between 62 and 170
 * pixels wide. Below 62 the label does not fit under the bar; above 170 it
 * starts competing with the map.
 *
 * `measure` converts a distance in km to a width in pixels at the frame's
 * middle latitude — it is the caller's projection, which is why this function
 * takes it rather than importing one. If no rung lands in the window the
 * largest is returned, which is the correct behaviour for a frame wider than
 * 800 km: the bar runs long rather than vanishing.
 */
export function pickScaleBar(measure: (km: number) => number): { km: number; px: number } {
  for (const km of SCALE_BAR_STEPS) {
    const px = measure(km)
    if (px >= 62 && px <= 170) return { km, px }
  }
  // Nothing landed in the window, and the two ways that happens want opposite
  // answers. A frame narrower than 2 km overshoots on every rung, so take the
  // smallest; a frame wider than 800 km undershoots on every rung, so take the
  // largest. Returning whichever rung the loop happened to end on gets one of
  // those two cases backwards — an 800 KM bar drawn 3 px wide on a city map.
  const smallest = SCALE_BAR_STEPS[0]
  const largest = SCALE_BAR_STEPS[SCALE_BAR_STEPS.length - 1]!
  return measure(smallest) > 170 ? { km: smallest, px: measure(smallest) } : { km: largest, px: measure(largest) }
}

/**
 * Kilometres per degree of longitude at a given latitude. Used to size the
 * scale bar: a degree of longitude is 111.32 km at the equator and shrinks
 * with the cosine of latitude, so a bar measured at the frame's middle
 * latitude is honest for the middle of the frame and slightly off at its
 * edges — which is what every printed map does.
 */
export function kmPerLonDegree(latitude: number): number {
  return 111.32 * Math.cos((latitude * Math.PI) / 180)
}
