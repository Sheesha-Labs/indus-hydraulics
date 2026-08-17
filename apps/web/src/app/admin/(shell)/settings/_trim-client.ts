'use client'

import { bboxOf, inkCoverage, MAX_EDGE, TRIM_COVERAGE_THRESHOLD } from '../../../../lib/image-trim'

export type TrimResult =
  | {
      status: 'trimmed'
      file: File
      /** Fraction of the original canvas the ink covered, 0–1. */
      coverage: number
      /** Dimensions of the file handed back. */
      width: number
      height: number
    }
  | { status: 'unchanged'; reason: 'already-tight' | 'blank' | 'not-raster' }
  | { status: 'error'; message: string }

/**
 * Crop a brand image down to its opaque bounds, in the browser, before it goes
 * anywhere near the upload action.
 *
 * Runs client-side because that is where the bytes already are and because
 * `canvas` is the cheapest correct cropper available — doing it server-side
 * would mean adding a raster-image dependency to the Next server for a job the
 * browser does natively. An image already in the library is re-fetched for the
 * same treatment; Supabase serves public-bucket objects with
 * `access-control-allow-origin: *`, so the canvas does not taint and
 * `getImageData` is allowed.
 *
 * Always re-encodes as PNG: the input is brand art with an alpha channel, and
 * JPEG would fill the transparency with black.
 */
export async function trimTransparentPadding(
  source: File | string,
  filename: string,
): Promise<TrimResult> {
  try {
    const blob =
      typeof source === 'string' ? await (await fetch(source, { mode: 'cors' })).blob() : source

    if (!blob.type.startsWith('image/') || blob.type === 'image/svg+xml')
      return { status: 'unchanged', reason: 'not-raster' }

    const bitmap = await createImageBitmap(blob)
    const { width, height } = bitmap

    const read = document.createElement('canvas')
    read.width = width
    read.height = height
    const readCtx = read.getContext('2d', { willReadFrequently: true })
    if (!readCtx) {
      bitmap.close()
      return { status: 'error', message: 'Could not read the image.' }
    }
    readCtx.drawImage(bitmap, 0, 0)

    const bbox = bboxOf(readCtx.getImageData(0, 0, width, height).data, width, height)
    if (!bbox) {
      bitmap.close()
      return { status: 'unchanged', reason: 'blank' }
    }

    const coverage = inkCoverage(bbox, width, height)
    const w = bbox.right - bbox.left
    const h = bbox.bottom - bbox.top

    // Nothing to crop and nothing to shrink: leave the operator's export
    // exactly as they made it rather than re-encoding it for no gain.
    if (coverage >= TRIM_COVERAGE_THRESHOLD && Math.max(w, h) <= MAX_EDGE) {
      bitmap.close()
      return { status: 'unchanged', reason: 'already-tight' }
    }

    // Cap the long edge on the way out. No surface draws this above ~130 CSS px
    // even at 3x, and the favicon is served straight from Storage without
    // passing through the image optimizer — so a 1500px source is bytes every
    // visitor pays for and nobody sees.
    const scale = Math.min(1, MAX_EDGE / Math.max(w, h))
    const outW = Math.max(1, Math.round(w * scale))
    const outH = Math.max(1, Math.round(h * scale))

    const out = document.createElement('canvas')
    out.width = outW
    out.height = outH
    const outCtx = out.getContext('2d')
    if (!outCtx) {
      bitmap.close()
      return { status: 'error', message: 'Could not crop the image.' }
    }
    outCtx.imageSmoothingQuality = 'high'
    outCtx.drawImage(bitmap, bbox.left, bbox.top, w, h, 0, 0, outW, outH)
    bitmap.close()

    const cropped = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png'))
    if (!cropped) return { status: 'error', message: 'Could not encode the crop.' }

    return {
      status: 'trimmed',
      coverage,
      width: outW,
      height: outH,
      file: new File([cropped], pngName(filename), { type: 'image/png' }),
    }
  } catch (e) {
    return {
      status: 'error',
      message: e instanceof Error ? e.message : 'Could not trim the image.',
    }
  }
}

/** `artboard-9.png` → `artboard-9-trimmed.png`, whatever the input extension. */
function pngName(filename: string): string {
  const stem = filename.replace(/\.[^./\\]+$/, '') || 'logo'
  return `${stem}-trimmed.png`
}
