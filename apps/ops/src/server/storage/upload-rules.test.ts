import { describe, expect, it } from 'vitest'
import {
  extensionFor,
  isKeyUnder,
  objectKey,
  objectPrefix,
  slugFilename,
  sniffMime,
  uploadRefusal,
} from './upload-rules'

const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 73, 72, 68, 82,
])
const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70, 0, 1, 1, 0, 0, 1])
const PDF = new TextEncoder().encode('%PDF-1.7\n%âãÏÓ\n')
const ID = '0193a5b2-7c1d-7e3f-8a9b-0c1d2e3f4a5b'

describe('sniffMime (magic bytes)', () => {
  it('knows PNG and JPEG', () => {
    expect(sniffMime(PNG)).toBe('image/png')
    expect(sniffMime(JPEG)).toBe('image/jpeg')
  })
  it('refuses anything else, and a truncated header', () => {
    expect(sniffMime(PDF)).toBeNull()
    expect(sniffMime(PNG.subarray(0, 4))).toBeNull()
    expect(sniffMime(new Uint8Array())).toBeNull()
  })
})

describe('object names', () => {
  it('slugs a person’s file name to ASCII, keeping no extension', () => {
    expect(slugFilename('Company Logo (final).PNG')).toBe('company-logo-final')
    expect(slugFilename('Ünïcödé façade.png')).toBe('unicode-facade')
    expect(slugFilename('../../etc/passwd')).toBe('etc-passwd')
    expect(slugFilename('.png')).toBe('file')
    expect(slugFilename('a'.repeat(200) + '.png')).toHaveLength(60)
  })

  it('takes the extension from the declared type, never a foreign one from the name', () => {
    expect(extensionFor('image/png', 'x.PNG')).toBe('png')
    expect(extensionFor('image/jpeg', 'x.jpeg')).toBe('jpeg')
    expect(extensionFor('image/jpeg', 'x.png.exe')).toBe('jpg')
  })

  it('builds <prefix>/<uuid>-<slug>.<ext> and recognises only that shape', () => {
    const prefix = objectPrefix(['company-profile', 'logo'])
    const key = objectKey(prefix, ID, 'Stamp v2.png', 'image/png')
    expect(key).toBe(`company-profile/logo/${ID}-stamp-v2.png`)
    expect(isKeyUnder(prefix, key)).toBe(true)
    expect(isKeyUnder('company-profile/stamp', key)).toBe(false)
    expect(isKeyUnder(prefix, `company-profile/logo/../stamp/${ID}-x.png`)).toBe(false)
    expect(isKeyUnder(prefix, `company-profile/logo/${ID}-x.png/extra`)).toBe(false)
  })

  it('refuses an unsafe path segment', () => {
    expect(() => objectPrefix(['company-profile', '../x'])).toThrow()
    expect(() => objectPrefix(['Company'])).toThrow()
  })
})

describe('uploadRefusal', () => {
  const ok = { kind: 'logo' as const, filename: 'logo.png', size: 2048, mime: 'image/png' }
  it('accepts a PNG or JPEG logo within the limit', () => {
    expect(uploadRefusal(ok, 20)).toBeNull()
    expect(uploadRefusal({ ...ok, mime: 'image/jpeg' }, 20)).toBeNull()
  })
  it('refuses an empty or oversize file', () => {
    expect(uploadRefusal({ ...ok, size: 0 }, 20)).toMatch(/empty/)
    expect(uploadRefusal({ ...ok, size: 20 * 1024 * 1024 + 1 }, 20)).toBe(
      'That file is over 20 MB.'
    )
    expect(uploadRefusal({ ...ok, size: 2 * 1024 * 1024 }, 1)).toBe('That file is over 1 MB.')
  })
  it('refuses a type outside the kind’s list (stamp and signatures are PNG only)', () => {
    expect(uploadRefusal({ ...ok, mime: 'application/pdf' }, 20)).toBe('Logo: use PNG or JPEG.')
    expect(uploadRefusal({ ...ok, kind: 'stamp', mime: 'image/jpeg' }, 20)).toBe('Stamp: use PNG.')
    expect(uploadRefusal({ ...ok, kind: 'signature', mime: 'image/svg+xml' }, 20)).toBe(
      'Signature: use PNG.'
    )
  })
})
