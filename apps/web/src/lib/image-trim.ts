/**
 * Trimming the transparent margin off brand art.
 *
 * Design exports arrive on a square artboard with the mark floating in the
 * middle of it, so most of every box the art is drawn in is empty.
 * `object-contain` fits the *canvas*, not the ink — which is why a 44px header
 * slot can render a 13px glyph and the logo reads as tiny no matter how large
 * the box gets. The favicon is worse and cannot be fixed by sizing at all: the
 * browser draws it at 16px and we do not control that number, so the only
 * lever is the file itself.
 *
 * So the padding comes off once, at upload, rather than being compensated for
 * at each of the surfaces that draw the art. `bboxOf` is the part worth
 * testing; the canvas plumbing around it (see `_trim-client.ts`, which needs a
 * DOM) is not.
 */

export type Bbox = { left: number; top: number; right: number; bottom: number }

/**
 * Tightest box containing every pixel at or above `threshold` alpha, or null
 * when the image is fully transparent.
 *
 * `right`/`bottom` are exclusive, matching canvas rect conventions.
 *
 * The threshold exists because antialiased edges leave a halo of alpha 1–4
 * that is invisible but would defeat the trim entirely: one stray near-zero
 * pixel in a corner and the bbox is the whole canvas again.
 */
export function bboxOf(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold = 8,
): Bbox | null {
  let left = width
  let top = height
  let right = 0
  let bottom = 0
  let found = false

  for (let y = 0; y < height; y++) {
    const row = y * width * 4
    for (let x = 0; x < width; x++) {
      if (data[row + x * 4 + 3]! < threshold) continue
      found = true
      if (x < left) left = x
      if (x >= right) right = x + 1
      if (y < top) top = y
      if (y >= bottom) bottom = y + 1
    }
  }

  return found ? { left, top, right, bottom } : null
}

/**
 * How much of the canvas the ink actually covers, 0–1. Drives both the decision
 * to trim and the wording of the toast the operator sees.
 */
export function inkCoverage(bbox: Bbox, width: number, height: number): number {
  const area = width * height
  if (area <= 0) return 0
  return ((bbox.right - bbox.left) * (bbox.bottom - bbox.top)) / area
}

/**
 * Below this, the file is mostly padding and trimming is a visible win. Art
 * that already fills 92% of its canvas is left alone — re-encoding it would
 * cost quality for nothing.
 */
export const TRIM_COVERAGE_THRESHOLD = 0.92

/** Long-edge ceiling for trimmed brand art, in pixels. */
export const MAX_EDGE = 512
