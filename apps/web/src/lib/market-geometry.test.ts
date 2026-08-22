import { describe, expect, it } from 'vitest'
import { marketPageBySlug, type MarketPage } from '@indus/domain'
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
