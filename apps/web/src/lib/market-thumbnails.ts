import 'server-only'

import { geoArea, geoBounds, geoMercator, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects, GeoStream } from 'd3-geo'
import { marketGeoNames, releasedMarketPage, type Market } from '@indus/domain'
import { findCountryFeature, type CountryFeature } from './natural-earth'

/**
 * The 126 country silhouettes on `/markets`.
 *
 * Same visual grammar as the market pages' hero map — diagonal hatch,
 * over-traced outline — with the graticule, neighbours, cities, ticks, scale
 * bar and corridor stripped out. What remains is the silhouette plus, on a
 * market with a drawn lane, one accent dot at its port or border crossing.
 *
 * SERVER ONLY, AND THAT IS THE WHOLE PERFORMANCE STORY. The prototype fetched
 * ~700 KB of TopoJSON in the browser and ran 126 projections on the main
 * thread. Here the topology never leaves the build: this module projects each
 * country once in Node and the browser receives 126 finished path strings. On
 * a page that is otherwise pure static markup, that is the single most
 * valuable optimisation available, and `server-only` is what enforces it.
 *
 * Results are memoised per market slug because `/markets` renders every card
 * in one pass and Next may render the tree more than once per build.
 */

/** Card thumbnail canvas. Matches the 208px card at the 1440px design width. */
const WIDTH = 208
const HEIGHT = 132

/**
 * Output precision, in user units. The SVG is 208 wide and scales to roughly
 * card width, so 0.1 of a unit is about a tenth of a CSS pixel — an order of
 * magnitude below anything a display can resolve, and a large fraction of the
 * bytes. d3 defaults to 3 digits.
 */
const DIGITS = 1

/**
 * Shortest segment worth drawing, in user units.
 *
 * Russia's coastline is ~14,600 coordinate pairs and the United States' is
 * ~11,200. At 208 × 132 nobody can see a tenth of them: consecutive points
 * under half a pixel apart land on the same pixel. Dropping them is visually
 * lossless, and it is the single biggest lever on this page's weight —
 * untouched, the prerendered HTML was 6.7 MB.
 *
 * 0.4 is chosen to stay under half a CSS pixel at the card's rendered size,
 * which keeps it safe on a 2× display. Raising it does not buy much: 0.6 takes
 * the grid from 448 KB of path data to 374 KB, a 16% saving for a threshold
 * that can start to facet a coastline. Do not raise it for a rounding error.
 */
const MIN_SEGMENT = 0.4

/** How far outside the canvas a ring may sit and still be worth serialising. */
const CULL_MARGIN = 2

/*
  MEASURED AND REJECTED: also culling rings under a pixel or two across.

  The obvious next lever is dropping tiny islands — Canada's Arctic archipelago
  is the single heaviest outline on the page at ~38 KB. It does not pay. A 1px
  ring cull took the whole grid from 448 KB to 441 KB, and a 2.5px one, which
  removes islands a reader can actually see, only reached 427 KB. The weight is
  in mainland coastline, not in specks, and `MIN_SEGMENT` is what addresses
  that. Do not re-add a ring-size cull without measuring it again.
*/

export type MarketThumbnail = {
  readonly width: number
  readonly height: number
  /** Namespaced hatch-pattern id — 126 patterns in one document need unique ids. */
  readonly uid: string
  /**
   * The feature, thinned to what the canvas can resolve and with rings that
   * fall entirely off-canvas dropped. See `thinAndCull`.
   */
  readonly path: string
  /**
   * What the projection was fitted to. `dominant-landmass` means rule 1 fired
   * and the country's outlying territories are off-frame by design; `feature`
   * means the whole thing is in shot.
   *
   * Recorded rather than inferred because it is the only externally visible
   * trace of a decision the rest of the page depends on — once the off-canvas
   * rings are culled, the two cases are indistinguishable from the path alone.
   */
  readonly framedOn: 'feature' | 'dominant-landmass'
  /** Port or border crossing. Null for a market with no drawn lane. */
  readonly port: { readonly x: number; readonly y: number } | null
  readonly ariaLabel: string
}

const cache = new Map<string, MarketThumbnail | null>()

/**
 * Build the silhouette, or `null` when the country cannot be matched in
 * Natural Earth.
 *
 * The card renders a labelled placeholder for null rather than an empty panel.
 * All 126 currently resolve — `market-thumbnails.test.ts` asserts it — but a
 * geometry-source change could break that, and a placeholder among 125 real
 * maps is conspicuous in a way one missing hero map is not.
 */
export function buildMarketThumbnail(market: Market): MarketThumbnail | null {
  const cached = cache.get(market.slug)
  if (cached !== undefined) return cached

  const built = compute(market)
  cache.set(market.slug, built)
  return built
}

function compute(market: Market): MarketThumbnail | null {
  const target = findCountryFeature(marketGeoNames(market))
  if (!target) return null

  const frame = framingFeature(target)
  const framedOn = frame === target ? ('feature' as const) : ('dominant-landmass' as const)

  /*
    THE FOUR FRAMING RULES. Each exists because something specific looked
    broken without it; the spot-checks in the test file cover every branch.

    3. Inset the frame for small countries — roughly anything under 4,000 km².
       Malta, Singapore, Bahrain and Luxembourg then sit in a quiet band rather
       than filling the card. 50m geometry has too few vertices to survive
       enlargement, and a tiny country rendering visibly tiny reads as
       deliberate cartography rather than a failure.
  */
  const pad = geoArea(frame as unknown as GeoPermissibleObjects) < 1e-4 ? 36 : 16

  /*
    4. Rotate for antimeridian crossings. Russia's dominant landmass crosses
       180°, so `geoBounds` reports a wrapping range (27°E → −170°) and any
       plain fit stretches it across the full globe width — it rendered
       100 × 29px in a 208 × 132 frame. Rotating the projection to the centre
       of the eastward span puts the country unwrapped in frame at 184 × 111.

       An earlier attempt built a four-corner lat/lon box for the eastern span
       instead. That does NOT work: d3-geo treats polygon edges as geodesics,
       and a 153°-wide rectangle with four vertices collapses. Rotation is the
       correct fix — do not replace it with a bounding box.
  */
  const bounds = geoBounds(frame as unknown as GeoPermissibleObjects)
  const rotation = bounds[1][0] < bounds[0][0] ? -((bounds[0][0] + bounds[1][0] + 360) / 2) : 0

  const projection = geoMercator()
    .rotate([rotation, 0])
    .fitExtent(
      [
        [pad, pad],
        [WIDTH - pad, HEIGHT - pad],
      ],
      frame as unknown as GeoPermissibleObjects
    )

  /*
    The path draws the WHOLE feature while the projection is fitted to a
    subset, so outlying territories fall outside the viewBox. That is intended
    — it keeps nearby islands like Corsica and Sicily while discarding French
    Guiana. The SVG viewport would clip them for free; the stream below drops
    them from the output instead, which is the same picture and far fewer
    bytes.

    THINNED AND CULLED, NOT SIMPLIFIED IN LON/LAT. Both reductions happen in
    projected space, downstream of the projection, because that is where
    visibility is actually decided — a degree of longitude is a different
    number of pixels in Norway than in Nigeria.

    Culling whole rings rather than clipping the path is deliberate. A
    `clipExtent` on the projection would insert boundary edges along the canvas
    rectangle, and the outline stroke would then draw a hard straight line down
    the side of any country that overflows the frame. Dropping only the rings
    that lie entirely outside the canvas — Alaska, Hawaii, the Azores, the
    Canaries, Svalbard, the Caribbean municipalities — changes no visible
    pixel, because the SVG viewport was clipping them anyway.
  */
  const thinned = { stream: (sink: GeoStream) => projection.stream(thinAndCull(sink)) }
  const path = geoPath(thinned).digits(DIGITS)(target as unknown as GeoPermissibleObjects)
  if (!path) return null

  /*
    `releasedMarketPage`, not the raw record. The dot marks a port on a lane the
    linked page publishes; a market still waiting on its forwarder sign-off
    serves the plain layout, which shows no lane at all. Marking a port for it
    would put a claim on the card that the page behind it does not make.
  */
  const page = releasedMarketPage(market.slug)
  const projected = page ? projection(page.map.crossing.coords as unknown as [number, number]) : null
  const port =
    projected && Number.isFinite(projected[0]) && Number.isFinite(projected[1])
      ? { x: projected[0], y: projected[1] }
      : null

  return {
    width: WIDTH,
    height: HEIGHT,
    uid: market.slug,
    path,
    framedOn,
    port,
    // The card's own text carries every fact; the outline needs no more than
    // naming. A longer description would be read aloud 126 times.
    ariaLabel: `Outline map of ${market.name.replace(/^the /, '')}`,
  }
}

/**
 * What the projection is fitted to — usually the country, sometimes just its
 * dominant landmass.
 *
 * 1. Fit to the dominant landmass, not the whole feature. Without this, any
 *    country with distant outlying territories shrinks to a smudge: the United
 *    States framed with Alaska and Hawaii, France with the overseas
 *    départements, the Netherlands with its Caribbean municipalities, South
 *    Africa with the Prince Edward Islands, Norway with Svalbard, Portugal
 *    with the Azores, Spain with the Canaries.
 *
 *    The 55% threshold is what protects genuinely archipelagic countries.
 *    Indonesia's largest polygon is ~22% of its area and the Philippines' is
 *    ~33%, so both fall back to the whole-feature fit and keep their shape.
 *    DO NOT RAISE THIS THRESHOLD without re-checking those two.
 *
 * 2. Skip the substitution for micro-states — fewer than 25 coordinate pairs
 *    in the dominant polygon. At 50m, Malta's main island is around a dozen
 *    points; substituting it blew it up to 176px wide, where it rendered as a
 *    plain hexagon, and clipped Gozo out of frame entirely. The country
 *    stopped reading as an archipelago and started reading as a bug.
 */
function framingFeature(target: CountryFeature): CountryFeature {
  const geometry = target.geometry as { type?: string; coordinates?: number[][][][] }
  if (geometry.type !== 'MultiPolygon' || !geometry.coordinates || geometry.coordinates.length < 2) {
    return target
  }

  let best: CountryFeature | null = null
  let bestArea = -1
  let total = 0

  for (const coordinates of geometry.coordinates) {
    const polygon: CountryFeature = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates },
    }
    const area = geoArea(polygon as unknown as GeoPermissibleObjects)
    total += area
    if (area > bestArea) {
      bestArea = area
      best = polygon
    }
  }

  if (!best || total <= 0 || bestArea / total < 0.55) return target

  const rings = (best.geometry as { coordinates: number[][][] }).coordinates
  const points = rings.reduce((n, ring) => n + ring.length, 0)
  return points >= 25 ? best : target
}

/**
 * A projection stream wrapper that drops sub-pixel detail and off-canvas rings.
 *
 * Points are buffered per ring so the ring's bounding box is known by the time
 * `lineEnd` decides whether to emit it at all. A ring that never comes within
 * `CULL_MARGIN` of the canvas is discarded whole; anything that touches the
 * frame is emitted in full, thinned but never clipped.
 *
 * Chebyshev distance rather than Euclidean: it is a comparison and two
 * absolute values instead of a square root, run several million times per
 * build, and at this threshold the two agree on everything that matters.
 */
function thinAndCull(sink: GeoStream): GeoStream {
  let xs: number[] = []
  let ys: number[] = []
  let lastX = Number.NaN
  let lastY = Number.NaN
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  return {
    polygonStart() {
      sink.polygonStart()
    },
    polygonEnd() {
      sink.polygonEnd()
    },
    lineStart() {
      xs = []
      ys = []
      lastX = Number.NaN
      lastY = Number.NaN
      minX = Infinity
      maxX = -Infinity
      minY = Infinity
      maxY = -Infinity
    },
    point(x: number, y: number) {
      if (
        xs.length > 0 &&
        Math.abs(x - lastX) < MIN_SEGMENT &&
        Math.abs(y - lastY) < MIN_SEGMENT
      ) {
        return
      }
      xs.push(x)
      ys.push(y)
      lastX = x
      lastY = y
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    },
    lineEnd() {
      const onCanvas =
        maxX >= -CULL_MARGIN &&
        minX <= WIDTH + CULL_MARGIN &&
        maxY >= -CULL_MARGIN &&
        minY <= HEIGHT + CULL_MARGIN
      // A one-point ring draws nothing whether it is emitted or not.
      if (onCanvas && xs.length > 1) {
        sink.lineStart()
        for (let i = 0; i < xs.length; i += 1) sink.point(xs[i]!, ys[i]!)
        sink.lineEnd()
      }
      xs = []
      ys = []
    },
    sphere() {
      sink.sphere?.()
    },
  }
}
