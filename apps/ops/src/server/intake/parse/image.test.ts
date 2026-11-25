import { describe, expect, it } from 'vitest'
import { fixture } from './fixtures'
import { parseImage, tooLowResolution } from './image'

describe('parseImage', () => {
  it('re-encodes as JPEG and reports the stated resolution', async () => {
    const doc = await parseImage(fixture('scan-96dpi.jpg'), 'image/jpeg')
    if (doc.kind !== 'image') throw new Error(doc.kind)
    expect(doc.dpi).toBe(96)
    expect(Buffer.from(doc.base64, 'base64').subarray(0, 3)).toEqual(
      Buffer.from([0xff, 0xd8, 0xff])
    )
    expect(tooLowResolution(doc)).toBe(true)
  })
  it('HEIC asks for JPEG or PDF', async () => {
    expect(await parseImage(new Uint8Array(), 'image/heic')).toMatchObject({
      kind: 'unsupported',
      ask: 'jpeg_or_pdf',
    })
  })
  it('resolution rule', () => {
    expect(tooLowResolution({ dpi: 300, width: 2000, height: 2800 })).toBe(false)
    expect(tooLowResolution({ dpi: null, width: 600, height: 400 })).toBe(true)
  })
})
