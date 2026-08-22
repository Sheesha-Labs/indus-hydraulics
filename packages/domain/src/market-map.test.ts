import { describe, expect, it } from 'vitest'
import {
  corridorKm,
  formatLatTick,
  formatLonTick,
  graticuleStep,
  greatCircleKm,
  kmPerLonDegree,
  pickScaleBar,
  SCALE_BAR_STEPS,
  ticksBetween,
} from './market-map'
import { marketPageBySlug, primaryRoute } from './market-pages'

describe('greatCircleKm', () => {
  it('measures a known leg', () => {
    // Jebel Ali to Onne as the crow flies — about a quarter of the way round
    // the planet, and nothing like the distance a ship actually covers.
    expect(greatCircleKm([[55.03, 25.01], [7.15, 4.7]])).toBeCloseTo(5580, -2)
  })

  it('returns zero for a single point', () => {
    expect(greatCircleKm([[55.03, 25.01]])).toBe(0)
  })
})

describe('corridorKm', () => {
  it("measures Nigeria's lane the long way round the Cape", () => {
    // 13,910 km is the number printed in-frame. It is not authored anywhere —
    // it is summed from the 16 waypoints, which is the point: straighten the
    // route and the number has to move with it.
    const page = marketPageBySlug('nigeria')!
    expect(corridorKm(primaryRoute(page.map).points)).toBe(13910)
  })

  it('is more than twice the straight-line distance', () => {
    // The guard against someone "tidying" the waypoints into a direct line,
    // which would draw a corridor straight across the Sahara.
    const page = marketPageBySlug('nigeria')!
    const points = primaryRoute(page.map).points
    const direct = greatCircleKm([points[0]!, points[points.length - 1]!])
    expect(corridorKm(points)).toBeGreaterThan(direct * 2)
  })
})

describe('graticuleStep', () => {
  it('opens the interval as the frame widens', () => {
    expect(graticuleStep(40)).toBe(5)
    expect(graticuleStep(10)).toBe(2)
    expect(graticuleStep(4)).toBe(1)
    expect(graticuleStep(1.5)).toBe(0.5)
    expect(graticuleStep(0.4)).toBe(0.25)
  })

  it('never returns zero, which would hang the tick loop', () => {
    expect(graticuleStep(0)).toBeGreaterThan(0)
  })
})

describe('ticksBetween', () => {
  it('covers the span at the given interval', () => {
    expect(ticksBetween(2, 15, 5)).toEqual([5, 10, 15])
  })

  it('keeps fractional steps clean', () => {
    // Accumulated float error is what produces a label reading 7.000000000001.
    expect(ticksBetween(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75, 1])
  })

  it('handles a southern or western span', () => {
    expect(ticksBetween(-8, 2, 2)).toEqual([-8, -6, -4, -2, 0, 2])
  })
})

describe('tick labels', () => {
  it('writes hemispheres, and a bare zero on the lines', () => {
    expect(formatLonTick(5)).toBe('5°E')
    expect(formatLonTick(-5)).toBe('5°W')
    expect(formatLonTick(0)).toBe('0°')
    expect(formatLatTick(12)).toBe('12°N')
    expect(formatLatTick(-12)).toBe('12°S')
    expect(formatLatTick(0)).toBe('0°')
  })
})

describe('pickScaleBar', () => {
  it('picks the first rung that renders in the legible window', () => {
    // 2 px per km: 50 km draws 100 px, which is the first rung in [62, 170].
    const chosen = pickScaleBar((km) => km * 2)
    expect(chosen.km).toBe(50)
    expect(chosen.px).toBe(100)
  })

  it('runs the bar long rather than dropping it off a very wide frame', () => {
    // At 0.01 px/km nothing reaches 62 px, so the largest rung wins and the
    // bar is short but present — better than a frame with no scale at all.
    const chosen = pickScaleBar((km) => km * 0.01)
    expect(chosen.km).toBe(SCALE_BAR_STEPS[SCALE_BAR_STEPS.length - 1])
  })

  it('takes the smallest rung on a very tight frame', () => {
    const chosen = pickScaleBar((km) => km * 200)
    expect(chosen.km).toBe(SCALE_BAR_STEPS[0])
  })
})

describe('kmPerLonDegree', () => {
  it('shrinks with the cosine of latitude', () => {
    expect(kmPerLonDegree(0)).toBeCloseTo(111.32, 2)
    expect(kmPerLonDegree(60)).toBeCloseTo(55.66, 1)
  })
})
