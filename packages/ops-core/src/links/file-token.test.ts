import { describe, expect, it } from 'vitest'
import {
  decodeFileToken,
  encodeFileToken,
  FILE_TOKEN_MAX_SECONDS,
  fileTokenClaims,
  fileTokenExpired,
} from './file-token'

const FID = '01920000-0000-7000-8000-000000000001'

describe('file tokens', () => {
  it('round-trips claims and clamps the lifetime to ten minutes', () => {
    const c = fileTokenClaims(FID, 1_000_000, 3600, 'k1')
    expect(c.exp - 1000).toBe(FILE_TOKEN_MAX_SECONDS)
    const t = encodeFileToken(c, 'sig')
    expect(decodeFileToken(t)?.claims).toEqual(c)
    expect(decodeFileToken(t)?.signature).toBe('sig')
  })

  it('rejects malformed tokens and other claim types', () => {
    for (const bad of [
      '',
      'a',
      'a.b.c',
      `${btoa('{"typ":"other"}')}.x`,
      `${btoa('{"typ":"ops-file","fid":"nope","exp":1,"kid":"k"}')}.x`,
    ])
      expect(decodeFileToken(bad)).toBeNull()
  })

  it('expires, and refuses a far-future expiry', () => {
    const c = fileTokenClaims(FID, 0, 60, 'k1')
    expect(fileTokenExpired(c, 30_000)).toBe(false)
    expect(fileTokenExpired(c, 60_000)).toBe(true)
    expect(fileTokenExpired({ ...c, exp: 10_000 }, 0)).toBe(true)
  })
})
