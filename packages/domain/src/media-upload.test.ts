import { describe, expect, test } from 'vitest'
import {
  checkMediaUpload,
  isMintedMediaKey,
  MAX_MEDIA_UPLOAD_BYTES,
  MEDIA_UPLOAD_ACCEPT,
  MEDIA_UPLOAD_TYPES,
  mediaStorageKey,
  suggestAltFromFilename,
} from './media-upload'

const UUID = '0f9c2a41-7b3e-4d51-9a2f-1c8e5b6d7a90'

describe('checkMediaUpload', () => {
  test('accepts every declared type', () => {
    for (const [type, { kind, ext }] of Object.entries(MEDIA_UPLOAD_TYPES)) {
      const res = checkMediaUpload({ filename: `a.${ext}`, contentType: type, bytes: 1024 })
      expect(res.ok, type).toBe(true)
      if (res.ok) {
        expect(res.kind).toBe(kind)
        expect(res.ext).toBe(ext)
      }
    }
  })

  test('tolerates the parameters browsers append to a content type', () => {
    expect(checkMediaUpload({ filename: 'a.png', contentType: 'image/png; charset=binary', bytes: 10 }).ok).toBe(true)
    expect(checkMediaUpload({ filename: 'a.png', contentType: 'IMAGE/PNG', bytes: 10 }).ok).toBe(true)
  })

  test('rejects an empty file', () => {
    const res = checkMediaUpload({ filename: 'a.png', contentType: 'image/png', bytes: 0 })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.message).toMatch(/empty/i)
  })

  test('rejects a file over the limit and says how big it was', () => {
    const res = checkMediaUpload({
      filename: 'huge.png',
      contentType: 'image/png',
      bytes: MAX_MEDIA_UPLOAD_BYTES + 1,
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.message).toMatch(/25 MB/)
  })

  test('accepts a file exactly on the limit', () => {
    expect(
      checkMediaUpload({ filename: 'a.png', contentType: 'image/png', bytes: MAX_MEDIA_UPLOAD_BYTES }).ok
    ).toBe(true)
  })

  test('rejects SVG — it is a scriptable document served from our own origin', () => {
    const res = checkMediaUpload({ filename: 'x.svg', contentType: 'image/svg+xml', bytes: 100 })
    expect(res.ok).toBe(false)
  })

  test('rejects executables and unknown types', () => {
    for (const type of ['application/x-msdownload', 'text/html', 'application/zip', '', 'image/png/../..']) {
      expect(checkMediaUpload({ filename: 'x', contentType: type, bytes: 10 }).ok, type).toBe(false)
    }
  })

  test('ignores the filename extension entirely', () => {
    // The declared type decides. A .png named file that is really HTML is
    // rejected; a .txt named file that is really a PNG is accepted.
    expect(checkMediaUpload({ filename: 'evil.png', contentType: 'text/html', bytes: 10 }).ok).toBe(false)
    expect(checkMediaUpload({ filename: 'photo.txt', contentType: 'image/png', bytes: 10 }).ok).toBe(true)
  })

  test('the accept attribute lists exactly the allowed types', () => {
    expect(MEDIA_UPLOAD_ACCEPT.split(',').sort()).toEqual(Object.keys(MEDIA_UPLOAD_TYPES).sort())
  })
})

describe('mediaStorageKey', () => {
  test('is dated, uuid-named and carries the extension', () => {
    expect(mediaStorageKey({ uuid: UUID, ext: 'png', now: new Date('2026-08-17T12:00:00Z') })).toBe(
      `library/2026-08/${UUID}.png`
    )
  })

  test('zero-pads the month', () => {
    expect(mediaStorageKey({ uuid: UUID, ext: 'pdf', now: new Date('2026-01-05T00:00:00Z') })).toContain(
      'library/2026-01/'
    )
  })

  test('uses UTC, so the folder does not depend on server timezone', () => {
    // 31 Dec 23:00 UTC is 1 Jan locally in some zones; the key must not move.
    expect(mediaStorageKey({ uuid: UUID, ext: 'png', now: new Date('2026-12-31T23:00:00Z') })).toContain(
      'library/2026-12/'
    )
  })

  test('every minted key passes its own verifier', () => {
    for (const { ext } of Object.values(MEDIA_UPLOAD_TYPES)) {
      const key = mediaStorageKey({ uuid: UUID, ext, now: new Date('2026-08-17T00:00:00Z') })
      expect(isMintedMediaKey(key), key).toBe(true)
    }
  })
})

describe('isMintedMediaKey', () => {
  test('rejects a key this server did not mint', () => {
    for (const key of [
      'products/SKU-1/photo.png',              // another prefix
      'library/2026-08/photo.png',             // not a uuid
      `library/2026-08/${UUID}`,               // no extension
      `library/08-2026/${UUID}.png`,           // wrong date shape
      `../library/2026-08/${UUID}.png`,        // traversal
      `library/2026-08/../../secrets/${UUID}.png`,
      `library/2026-08/${UUID}.png/../evil`,
      '',
    ]) {
      expect(isMintedMediaKey(key), key).toBe(false)
    }
  })

  test('is anchored at both ends', () => {
    const good = `library/2026-08/${UUID}.png`
    expect(isMintedMediaKey(good)).toBe(true)
    expect(isMintedMediaKey(`x${good}`)).toBe(false)
    // `${good}x` is the case that caught a real weakness: with a generic
    // [a-z0-9]{2,5} extension class, "pngx" read as a valid extension.
    expect(isMintedMediaKey(`${good}x`)).toBe(false)
    expect(isMintedMediaKey(`\n${good}`)).toBe(false)
    expect(isMintedMediaKey(`${good}\n`)).toBe(false)
  })

  test('only the extensions we actually issue are accepted', () => {
    for (const ext of ['exe', 'html', 'svg', 'php', 'js', 'pngx', 'p']) {
      expect(isMintedMediaKey(`library/2026-08/${UUID}.${ext}`), ext).toBe(false)
    }
  })
})

describe('suggestAltFromFilename', () => {
  test('turns a filename into a readable starting point', () => {
    expect(suggestAltFromFilename('HP001_brass-fitting.png')).toBe('HP001 brass fitting')
    expect(suggestAltFromFilename('2SN Hyd Hose EC210.png')).toBe('2SN Hyd Hose EC210')
  })

  test('handles a name with no extension and collapses runs of separators', () => {
    expect(suggestAltFromFilename('a__b--c')).toBe('a b c')
    expect(suggestAltFromFilename('plain')).toBe('plain')
  })

  test('bounds the length', () => {
    expect(suggestAltFromFilename(`${'x'.repeat(400)}.png`).length).toBeLessThanOrEqual(120)
  })
})
