import { describe, expect, it } from 'vitest'
import { MARKETS, marketBySlug, type Market } from '@indus/domain'
import { buildMarketThumbnail } from './market-thumbnails'

/**
 * The 126 country silhouettes, against the real Natural Earth topology.
 *
 * Not snapshot tests — a projection's exact path data is unreadable and
 * changes with any d3 upgrade. These assert the things that actually go wrong
 * on a grid like this: a country that silently fails to match its geometry and
 * renders as a placeholder among 125 real maps, and each of the four framing
 * rules quietly regressing.
 *
 * HOW THE FRAMING RULES ARE OBSERVED. Rings that fall entirely off-canvas are
 * culled from the output, so the path alone cannot tell you whether rule 1
 * fired — a country fitted to its mainland and one fitted to its whole feature
 * both come back filling the frame. The decision is therefore recorded on the
 * model as `framedOn`, and that is what the rule-1 assertions read.
 *
 * The spot-checks are the handoff's own list, and between them they cover
 * every branch in `framingFeature` and the projection setup. If you change a
 * threshold, this is the file that tells you what it broke.
 */

const CANVAS = { width: 208, height: 132 }
/** The 36px inset applied to a small country — see rule 3. */
const INSET = 36
/** Curve control points can sit a hair outside the drawn shape. */
const SLOP = 1

type Extent = { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number }

/** Bounding box of an SVG path's points, good enough to measure framing. */
function extent(path: string): Extent {
  const numbers = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    xs.push(numbers[i]!)
    ys.push(numbers[i + 1]!)
  }
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
}

function thumb(slug: string) {
  const market = marketBySlug(slug)
  if (!market) throw new Error(`No market ${slug} — the registry moved under this test`)
  const built = buildMarketThumbnail(market)
  if (!built) throw new Error(`No thumbnail for ${slug}`)
  return built
}

/** Does the whole feature sit inside the card, or is something clipped away? */
function fitsInCanvas(slug: string): boolean {
  const e = extent(thumb(slug).path)
  return (
    e.minX >= -SLOP &&
    e.maxX <= CANVAS.width + SLOP &&
    e.minY >= -SLOP &&
    e.maxY <= CANVAS.height + SLOP
  )
}

/** Does the drawing stay inside the small-country inset band? */
function fitsInsetBand(slug: string): boolean {
  const e = extent(thumb(slug).path)
  return (
    e.minX >= INSET - SLOP &&
    e.maxX <= CANVAS.width - INSET + SLOP &&
    e.minY >= INSET - SLOP &&
    e.maxY <= CANVAS.height - INSET + SLOP
  )
}

describe('coverage', () => {
  /*
    THE ONE THAT MATTERS. Natural Earth's `properties.name` is not the trade
    name for a dozen of these, and a miss degrades to a labelled placeholder —
    correct behaviour, and completely silent. One placeholder in a grid of 126
    is conspicuous to a visitor and invisible in review.

    If this fails after a geometry-source change, the fix is an entry in
    MARKET_GEO_ALIASES, not a lowered expectation.
  */
  it('resolves a silhouette for every one of the destinations', () => {
    const missing = MARKETS.filter((m: Market) => buildMarketThumbnail(m) === null).map((m) => m.name)
    expect(missing).toEqual([])
  })

  it('draws real geometry, not a stub, for every destination', () => {
    const thin = MARKETS.map((m) => ({ name: m.name, path: buildMarketThumbnail(m)?.path ?? '' }))
      .filter((t) => t.path.length < 40)
      .map((t) => t.name)
    expect(thin).toEqual([])
  })

  it('draws every destination somewhere inside the card', () => {
    // Not the same as `fitsInCanvas`: this catches a projection that put the
    // whole country off-frame, which is what the antimeridian bug did before
    // the rotation fix.
    for (const market of MARKETS) {
      const e = extent(buildMarketThumbnail(market)!.path)
      expect(e.maxX, `${market.name} is drawn entirely left of the card`).toBeGreaterThan(0)
      expect(e.minX, `${market.name} is drawn entirely right of the card`).toBeLessThan(CANVAS.width)
      expect(e.maxY, `${market.name} is drawn entirely above the card`).toBeGreaterThan(0)
      expect(e.minY, `${market.name} is drawn entirely below the card`).toBeLessThan(CANVAS.height)
    }
  })

  it("keeps the canvas at the card aspect", () => {
    const built = thumb('nigeria')
    expect([built.width, built.height]).toEqual([CANVAS.width, CANVAS.height])
  })
})

describe('rule 1 — fit the dominant landmass, not the whole feature', () => {
  /*
    Without this, a country with distant outlying territories shrinks to a
    smudge: the United States framed with Alaska and Hawaii, France with the
    overseas départements, the Netherlands with its Caribbean municipalities,
    South Africa with the Prince Edward Islands, Norway with Svalbard, Portugal
    with the Azores, Spain with the Canaries, Ecuador with the Galápagos.

    Each of these is fitted to its mainland, so the outliers project outside
    the canvas and are clipped by the SVG viewport. That clipping IS the rule
    working — if this ever passes as "fits in canvas", the substitution stopped
    happening and every one of these cards went tiny.
  */
  it.each([
    'united-states',
    'france',
    'netherlands',
    'south-africa',
    'norway',
    'portugal',
    'spain',
    'ecuador',
  ])('frames %s on its mainland', (slug) => {
    expect(thumb(slug).framedOn).toBe('dominant-landmass')
    // And the mainland then genuinely fills the card rather than sitting in a
    // corner of a frame sized for territories that are no longer drawn.
    const e = extent(thumb(slug).path)
    expect(Math.max(e.width, e.height)).toBeGreaterThan(90)
  })

  it('leaves genuinely archipelagic countries on the whole-feature fit', () => {
    /*
      Indonesia's largest polygon is ~22% of its area and the Philippines' is
      ~33%, so both fall below the 55% threshold and keep their shape. RAISING
      THE THRESHOLD BREAKS EXACTLY THESE TWO, which is why the constant carries
      a warning.
    */
    expect(thumb('indonesia').framedOn, 'Indonesia lost its archipelago').toBe('feature')
    expect(thumb('philippines').framedOn, 'the Philippines lost its archipelago').toBe('feature')
    // Nothing was culled, so the whole archipelago is inside the card.
    expect(fitsInCanvas('indonesia')).toBe(true)
    expect(fitsInCanvas('philippines')).toBe(true)
  })
})

describe('rule 2 — skip the substitution for micro-states', () => {
  it('keeps Malta reading as an archipelago', () => {
    /*
      At 50m, Malta's main island is around a dozen coordinate pairs.
      Substituting it as the frame blew it up to 176px wide, where it rendered
      as a plain hexagon, and clipped Gozo out of frame entirely. Under 25
      points the substitution is skipped: every island stays in shot, and the
      country renders small rather than as one enormous blob.
    */
    const malta = thumb('malta')
    const islands = malta.path.match(/M/g)?.length ?? 0
    expect(malta.framedOn, 'Malta was substituted despite being a micro-state').toBe('feature')
    expect(islands, 'Malta drew as a single island').toBeGreaterThanOrEqual(2)
    expect(fitsInCanvas('malta'), 'Malta lost Gozo off-frame').toBe(true)
    expect(extent(malta.path).width, 'Malta blew up to the substituted width').toBeLessThan(140)
  })
})

describe('rule 3 — inset the frame for small countries', () => {
  /*
    Roughly anything under 4,000 km² gets a 36px pad instead of 16px, so it
    sits in a quiet band rather than filling the card. 50m geometry has too few
    vertices to survive enlargement, and a tiny country rendering visibly tiny
    reads as deliberate cartography rather than a failure.
  */
  it.each(['malta', 'singapore', 'bahrain', 'luxembourg'])('insets %s', (slug) => {
    expect(fitsInsetBand(slug)).toBe(true)
  })

  it.each(['germany', 'nigeria', 'kenya', 'chile'])('does not inset %s', (slug) => {
    // An ordinary country uses the 16px pad and therefore paints into the band
    // the inset would have kept clear.
    expect(fitsInsetBand(slug)).toBe(false)
  })
})

describe('rule 4 — rotate for antimeridian crossings', () => {
  it('draws Russia unwrapped and in frame', () => {
    /*
      Russia's dominant landmass crosses 180°, so `geoBounds` reports a
      wrapping range (27°E → −170°) and any plain fit stretches it across the
      full globe width — it rendered 100 × 29px in a 208 × 132 frame. Rotating
      the projection to the centre of the eastward span fixes it.

      Both dimensions are asserted: the failure mode is a wide, flat smear, so
      the height is the half that actually caught it.
    */
    const e = extent(thumb('russia').path)
    expect(e.width).toBeGreaterThan(150)
    expect(e.height).toBeGreaterThan(80)
  })
})

describe('port dot', () => {
  it('marks the crossing on a market with a drawn lane', () => {
    const nigeria = thumb('nigeria')
    expect(nigeria.port).not.toBeNull()
    // Onne is on Nigeria's southern coast, so the dot belongs in the lower
    // half of the frame and inside it.
    expect(nigeria.port!.x).toBeGreaterThan(0)
    expect(nigeria.port!.x).toBeLessThan(CANVAS.width)
    expect(nigeria.port!.y).toBeGreaterThan(CANVAS.height / 2)
    expect(nigeria.port!.y).toBeLessThan(CANVAS.height)
  })

  it('is absent where no lane has been drawn', () => {
    // The dot is a claim about a plotted route. Without the plot there is no
    // claim, and guessing a port from the country centroid would be a lie
    // rendered at 2.1px.
    expect(thumb('brazil').port).toBeNull()
  })
})

describe('identity', () => {
  it('namespaces the hatch pattern per market', () => {
    // 126 patterns share one document; duplicate SVG ids resolve to whichever
    // the browser saw first, so every card would take the first hatch.
    const uids = MARKETS.map((m) => buildMarketThumbnail(m)?.uid).filter(Boolean)
    expect(new Set(uids).size).toBe(MARKETS.length)
  })

  it('labels the outline without the article', () => {
    expect(thumb('united-states').ariaLabel).toBe('Outline map of United States')
  })
})

describe('payload', () => {
  /*
    126 silhouettes ship inline in one static HTML document, so path length is
    a page-weight budget, not a curiosity. Before the projected-space thinning
    the prerendered page was 6.7 MB — Russia alone carried ~14,600 coordinate
    pairs that render inside a 208px card.

    These ceilings are deliberately generous; they exist to fail loudly if the
    thinning is ever removed or the resolution raised, not to police a few
    hundred bytes.
  */
  it('keeps the heaviest outlines under a sane ceiling', () => {
    // Canada's Arctic archipelago is the worst case on the page at ~38 KB,
    // Russia the next at ~25 KB. Untinned they were an order of magnitude more.
    expect(thumb('canada').path.length).toBeLessThan(50_000)
    expect(thumb('russia').path.length).toBeLessThan(35_000)
  })

  it('keeps the whole grid inside its page-weight budget', () => {
    // ~448 KB measured. The ceiling is generous on purpose: it is here to fail
    // loudly if the thinning is removed, not to police a few hundred bytes.
    const total = MARKETS.reduce((n, m) => n + (buildMarketThumbnail(m)?.path.length ?? 0), 0)
    expect(total).toBeLessThan(700_000)
  })

  it('drops rings that fall entirely off the canvas', () => {
    // Alaska, Hawaii and the Pacific territories are outside a frame fitted to
    // the contiguous states, so none of their geometry should be serialised.
    const e = extent(thumb('united-states').path)
    expect(e.minX).toBeGreaterThan(-CANVAS.width)
    expect(e.maxX).toBeLessThan(CANVAS.width * 2)
  })
})
