import { describe, expect, it } from 'vitest'
import { bboxOf, inkCoverage, TRIM_COVERAGE_THRESHOLD, type Bbox } from './image-trim'

/**
 * Build an RGBA buffer with an opaque rectangle painted into a transparent
 * canvas — the shape every artboard export actually has.
 */
function canvasWith(
  width: number,
  height: number,
  rect: { x: number; y: number; w: number; h: number },
  alpha = 255,
): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      data[(y * width + x) * 4 + 3] = alpha
    }
  }
  return data
}

describe('bboxOf', () => {
  it('finds the tightest box around the ink, exclusive on right/bottom', () => {
    const data = canvasWith(10, 10, { x: 3, y: 2, w: 4, h: 5 })
    expect(bboxOf(data, 10, 10)).toEqual({ left: 3, top: 2, right: 7, bottom: 7 })
  })

  it('returns null for a fully transparent canvas', () => {
    expect(bboxOf(new Uint8ClampedArray(8 * 8 * 4), 8, 8)).toBeNull()
  })

  it('returns the whole canvas when the ink already fills it', () => {
    const data = canvasWith(4, 4, { x: 0, y: 0, w: 4, h: 4 })
    expect(bboxOf(data, 4, 4)).toEqual({ left: 0, top: 0, right: 4, bottom: 4 })
  })

  it('handles a single opaque pixel', () => {
    const data = canvasWith(6, 6, { x: 5, y: 0, w: 1, h: 1 })
    expect(bboxOf(data, 6, 6)).toEqual({ left: 5, top: 0, right: 6, bottom: 1 })
  })

  /**
   * The reason the threshold exists at all. An antialiased export leaves a
   * near-zero alpha halo across the whole canvas; counted as ink, the bbox is
   * the full canvas again and the trim silently does nothing.
   */
  it('ignores an antialiasing halo below the alpha threshold', () => {
    const width = 10
    const height = 10
    const data = canvasWith(width, height, { x: 4, y: 4, w: 2, h: 2 })
    // Wash the whole canvas in alpha 3 — invisible, but non-zero.
    for (let i = 0; i < width * height; i++) {
      if (data[i * 4 + 3] === 0) data[i * 4 + 3] = 3
    }
    expect(bboxOf(data, width, height)).toEqual({ left: 4, top: 4, right: 6, bottom: 6 })
  })

  it('counts a halo as ink once the threshold is lowered under it', () => {
    const data = canvasWith(6, 6, { x: 2, y: 2, w: 2, h: 2 })
    data[3] = 3 // pixel (0,0) at alpha 3
    expect(bboxOf(data, 6, 6, 2)).toEqual({ left: 0, top: 0, right: 4, bottom: 4 })
  })

  it('treats a pixel exactly at the threshold as ink', () => {
    const data = canvasWith(4, 4, { x: 1, y: 1, w: 1, h: 1 }, 8)
    expect(bboxOf(data, 4, 4, 8)).toEqual({ left: 1, top: 1, right: 2, bottom: 2 })
  })
})

describe('inkCoverage', () => {
  it('reports the fraction of the canvas the ink covers', () => {
    const bbox: Bbox = { left: 0, top: 0, right: 5, bottom: 2 }
    expect(inkCoverage(bbox, 10, 10)).toBeCloseTo(0.1)
  })

  it('is 1 when the ink fills the canvas', () => {
    expect(inkCoverage({ left: 0, top: 0, right: 8, bottom: 8 }, 8, 8)).toBe(1)
  })

  it('is 0 for a zero-area canvas rather than dividing by zero', () => {
    expect(inkCoverage({ left: 0, top: 0, right: 0, bottom: 0 }, 0, 0)).toBe(0)
  })

  /**
   * The case that motivated the whole feature: a mark floating on a generous
   * artboard covers a small fraction of it, so `object-contain` spends most of
   * the header's logo slot drawing air.
   */
  it('flags a typical artboard export as worth trimming', () => {
    const data = canvasWith(1000, 1000, { x: 350, y: 350, w: 300, h: 300 })
    const bbox = bboxOf(data, 1000, 1000)!
    expect(inkCoverage(bbox, 1000, 1000)).toBeLessThan(TRIM_COVERAGE_THRESHOLD)
  })

  it('leaves art that already fills its canvas alone', () => {
    const data = canvasWith(100, 100, { x: 1, y: 1, w: 98, h: 98 })
    const bbox = bboxOf(data, 100, 100)!
    expect(inkCoverage(bbox, 100, 100)).toBeGreaterThanOrEqual(TRIM_COVERAGE_THRESHOLD)
  })
})
