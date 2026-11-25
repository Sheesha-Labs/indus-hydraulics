import 'server-only'
import sharp from 'sharp'
import type { ParsedDocument } from './types'

/**
 * Images (S08-T01): auto-rotated from EXIF, re-encoded as JPEG with the long edge at most 2,000 px, metadata
 * stripped (sharp drops EXIF unless asked to keep it). The resolution is reported when the file states it, so
 * board 17 can say "<file> is 96 dpi". HEIC needs a codec Vercel's sharp build does not ship: the client is asked
 * for a JPEG or PDF.
 */
const LONG_EDGE = 2_000
/** Below this, part numbers are not read reliably (board 17 "Image too low resolution"). */
export const MIN_READABLE_DPI = 150
const MIN_READABLE_PIXELS = 800

export async function parseImage(bytes: Uint8Array, mime: string): Promise<ParsedDocument> {
  if (/heic|heif/i.test(mime))
    return {
      kind: 'unsupported',
      ask: 'jpeg_or_pdf',
      detail: 'HEIC photos are not read: send a JPEG or PDF',
    }
  try {
    const img = sharp(bytes, { failOn: 'error', limitInputPixels: 60_000_000 })
    const meta = await img.metadata()
    const out = await img
      .rotate()
      .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer({ resolveWithObject: true })
    return {
      kind: 'image',
      base64: out.data.toString('base64'),
      width: out.info.width,
      height: out.info.height,
      dpi: meta.density ?? null,
    }
  } catch (e) {
    return {
      kind: 'unreadable',
      detail: `Could not open the image (${(e as Error).message.slice(0, 80)})`,
    }
  }
}

/** Board 17 state 1: a scan too coarse to read part numbers from. */
export function tooLowResolution(p: {
  dpi: number | null
  width: number
  height: number
}): boolean {
  if (p.dpi !== null && p.dpi < MIN_READABLE_DPI) return true
  return Math.max(p.width, p.height) < MIN_READABLE_PIXELS
}
