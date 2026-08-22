import { describe, expect, it } from 'vitest'
import { geoContains } from 'd3-geo'
import { feature } from 'topojson-client'
import rawTopology from 'world-atlas/countries-50m.json'
import { MARKET_PAGE_RECORDS, marketPageBySlug, type MarketPage } from '@indus/domain'
import { buildMarketMapModel } from './market-geometry'

/**
 * The hero map, against the real Natural Earth topology.
 *
 * These are not snapshot tests — a projection's exact path data is meaningless
 * to read and changes with any d3 upgrade. They assert the things that have
 * actually gone wrong on maps like this: geometry that silently fails to
 * match, markers projected outside the frame, a scale bar that renders too
 * small to label, and the corridor annotation drifting away from the line it
 * describes.
 */

const nigeria = marketPageBySlug('nigeria')!

describe('buildMarketMapModel', () => {
  const model = buildMarketMapModel(nigeria, 'Nigeria')!

  it('matches the country in Natural Earth', () => {
    // A null model means `geoNames` missed. It degrades to a labelled
    // placeholder rather than a broken frame, which is correct behaviour and
    // completely silent — so it is asserted rather than eyeballed.
    expect(model).not.toBeNull()
    expect(model.target.length).toBeGreaterThan(100)
  })

  it('draws both routes and marks the port', () => {
    expect(model.routes).toHaveLength(2)
    expect(model.routes.filter((r) => r.primary)).toHaveLength(1)
    expect(model.routes.every((r) => r.d.length > 0)).toBe(true)
  })

  it('places every marker inside the drawn frame', () => {
    const inFrame = (x: number, y: number) =>
      x >= model.pad && x <= model.width - model.pad && y >= model.pad && y <= model.height - model.pad
    expect(inFrame(model.crossing.x, model.crossing.y)).toBe(true)
    for (const city of model.cities) {
      expect(inFrame(city.x, city.y), `${city.label.text} is outside the frame`).toBe(true)
    }
  })

  it('plots only the cities the record asks for', () => {
    const plotted = nigeria.cities.filter((c) => c.plot)
    expect(model.cities).toHaveLength(plotted.length)
    expect(model.cities.map((c) => c.label.text)).toEqual(
      plotted.map((c) => c.name.toUpperCase())
    )
  })

  it('suppresses the origin marker and says so in the annotation', () => {
    /*
      Nigeria sets `fit: 'crossing'`, so the frame holds Nigeria and Onne —
      Dubai is 5,000 km outside it. The marker has to disappear, and the
      corridor annotation has to gain "FROM …" or the dashed line enters from
      the edge of the frame with nothing to explain it.
    */
    expect(model.origin).toBeNull()
    expect(model.corridor).toContain('FROM JEBEL ALI · DXB')
    expect(model.originLabel).toBe('JEBEL ALI · DXB')
  })

  it('prints the corridor distance the route actually traces', () => {
    // 13,910 km, because the route rounds the Cape of Good Hope. Straighten
    // the waypoints and this number must move with them.
    expect(model.corridorKm).toBe(13910)
    expect(model.corridor).toContain('13,910 KM')
  })

  it('renders a scale bar wide enough to carry its label', () => {
    expect(model.scaleBar.px).toBeGreaterThan(40)
    expect(model.scaleBar.px).toBeLessThan(model.width - model.pad * 2)
  })

  it('labels both axes without crowding the frame', () => {
    expect(model.lonTicks.length).toBeGreaterThan(2)
    expect(model.latTicks.length).toBeGreaterThan(2)
    expect(model.lonTicks.length).toBeLessThan(30)
    expect(model.latTicks.length).toBeLessThan(30)
  })

  it('keeps neighbour labels off the markers and out of the annotation box', () => {
    // Four suppression rules, each of which fixed a real collision. If any one
    // is removed a label lands on top of a marker or under the corridor text.
    for (const label of model.neighbourLabels) {
      expect(Math.hypot(label.x - model.crossing.x, label.y - model.crossing.y)).toBeGreaterThanOrEqual(68)
      const inAnnotationBox = label.x < model.pad + 300 && label.y < model.pad + 34
      expect(inAnnotationBox, `${label.text} sits under the corridor annotation`).toBe(false)
    }
  })

  it('describes the lane in words for assistive tech', () => {
    // The SVG is decorative-plus-informative. Everything it shows is also in
    // the manifest strip and the fact table, so one sentence is enough — but
    // it has to name the endpoints and the distance.
    expect(model.ariaLabel).toContain('Nigeria')
    expect(model.ariaLabel).toContain('13,910 km')
    expect(model.ariaLabel.toLowerCase()).toContain('jebel ali')
  })

  it('returns null rather than throwing when the country cannot be matched', () => {
    const unmatched: MarketPage = { ...nigeria, map: { ...nigeria.map, geoNames: ['Wakanda'] } }
    expect(buildMarketMapModel(unmatched, 'Wakanda')).toBeNull()
  })
})

/**
 * Where the lanes actually go.
 *
 * The data contract's rule is "never route through Iran or Russia without an
 * export-compliance ruling", and it is a rule about the drawn line, not just
 * the prose: these maps are published, and a corridor traced across a
 * sanctioned jurisdiction is a claim about how the goods travel.
 *
 * Tested with real polygons and `geoContains`, not a latitude/longitude box.
 * A box cannot tell Iranian soil from the Strait of Hormuz — and every vessel
 * leaving the Gulf transits Hormuz, so a box flags 23 innocent sea lanes and
 * teaches everyone to ignore it.
 */
describe('lane routing through sanctioned territory', () => {
  const topology = rawTopology as Parameters<typeof feature>[0]
  const objects = (topology as unknown as { objects: Record<string, object> }).objects
  const features = (
    feature(topology, objects.countries as Parameters<typeof feature>[1]) as unknown as {
      features: { properties: { name?: string } | null }[]
    }
  ).features

  const polygonFor = (name: string) => {
    const match = features.find((f) => f.properties?.name === name)
    expect(match, `Natural Earth has no feature named ${name}`).toBeDefined()
    return match as unknown as Parameters<typeof geoContains>[0]
  }

  const WATCHED = ['Iran', 'Russia', 'Belarus'] as const

  function crossings(filter: (mode: string) => boolean) {
    const out: string[] = []
    for (const page of MARKET_PAGE_RECORDS) {
      for (const route of page.map.routes) {
        if (!filter(route.mode)) continue
        for (const country of WATCHED) {
          const hit = route.points.some((p) => geoContains(polygonFor(country), [p[0], p[1]]))
          if (hit) out.push(`${page.slug} · ${route.mode} · ${country}`)
        }
      }
    }
    return out
  }

  it('never draws a SURFACE route across Iran, Russia or Belarus', () => {
    /*
      The rule that matters, and the reason the Caspian markets are routed the
      long way round: down the Gulf, round Arabia, up the Red Sea, through
      Suez, across the Mediterranean and the Black Sea to Poti, then east by
      rail and ferry to Baku and Aktau. Nineteen waypoints to avoid a border.
    */
    expect(crossings((mode) => !mode.includes('AIR'))).toEqual([])
  })

  it('pins the three air legs that DO overfly Iran', () => {
    /*
      KNOWN AND UNRESOLVED. The Caspian air legs are drawn straight over
      Iranian airspace. Commercial overflight is routine and is not the same
      act as moving goods through a jurisdiction — but the contract's wording
      does not distinguish the two, and these lines are published.

      All three markets are `released: false`, so nothing is live. This
      assertion exists to stop the pattern spreading to a fourth market while
      the compliance ruling is outstanding: adding one fails here, which is
      the moment to ask rather than the moment to discover.
    */
    expect(crossings((mode) => mode.includes('AIR')).sort()).toEqual([
      'azerbaijan · AIR · Iran',
      'kazakhstan · AIR · Iran',
      'uzbekistan · AIR · Iran',
    ])

    for (const slug of ['kazakhstan', 'azerbaijan', 'uzbekistan']) {
      expect(marketPageBySlug(slug)?.released, `${slug} must stay unreleased`).toBe(false)
    }
  })
})

/**
 * Every written record has to project, not just the released ones — otherwise
 * a market's map is first checked on the day it goes live.
 */
describe('all 46 records project a map', () => {
  it('matches Natural Earth geometry for every one', () => {
    const failed = MARKET_PAGE_RECORDS.filter(
      (page) => buildMarketMapModel(page, page.slug) === null
    ).map((p) => p.slug)
    expect(failed).toEqual([])
  })

  it('places the crossing marker inside the frame on every one', () => {
    for (const page of MARKET_PAGE_RECORDS) {
      const model = buildMarketMapModel(page, page.slug)!
      const { crossing, pad, width, height } = model
      expect(crossing.x, page.slug).toBeGreaterThanOrEqual(pad)
      expect(crossing.x, page.slug).toBeLessThanOrEqual(width - pad)
      expect(crossing.y, page.slug).toBeGreaterThanOrEqual(pad)
      expect(crossing.y, page.slug).toBeLessThanOrEqual(height - pad)
    }
  })

  it('shows the origin marker only on the three lanes fitted to it', () => {
    const shown = MARKET_PAGE_RECORDS.filter(
      (page) => buildMarketMapModel(page, page.slug)!.origin !== null
    ).map((p) => p.slug)
    expect(shown.sort()).toEqual(['iraq', 'oman', 'saudi-arabia'])
  })

  it('appends the origin to the corridor annotation whenever the marker is hidden', () => {
    // Otherwise the dashed line enters from the edge of the frame unexplained.
    for (const page of MARKET_PAGE_RECORDS) {
      const model = buildMarketMapModel(page, page.slug)!
      if (model.origin === null) {
        expect(model.corridor, page.slug).toContain(`FROM ${model.originLabel}`)
      } else {
        expect(model.corridor, page.slug).not.toContain('FROM')
      }
    }
  })
})
