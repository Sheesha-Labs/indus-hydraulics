import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { signPreviewToken, verifyPreviewToken } from './preview-token'

const SECRET = 'test-secret-do-not-use-in-prod-do-not-commit'

beforeAll(() => {
  process.env.PREVIEW_TOKEN_SECRET = SECRET
})

afterEach(() => {
  process.env.PREVIEW_TOKEN_SECRET = SECRET
})

describe('preview-token', () => {
  test('round-trips: token signed for a SKU verifies for the same SKU', () => {
    const token = signPreviewToken('IH-HH-001')
    const result = verifyPreviewToken(token, 'IH-HH-001')
    expect(result.valid).toBe(true)
  })

  test('rejects when the SKU does not match', () => {
    const token = signPreviewToken('IH-HH-001')
    const result = verifyPreviewToken(token, 'IH-HH-002')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('sku-mismatch')
  })

  test('rejects an expired token', () => {
    // Sign with a TTL of -1 ms so the token is already expired
    const token = signPreviewToken('IH-HH-001', -1)
    const result = verifyPreviewToken(token, 'IH-HH-001')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('expired')
  })

  test('rejects a tampered payload (signature mismatch)', () => {
    const token = signPreviewToken('IH-HH-001')
    const [, sig] = token.split('.')
    // Re-sign for a different SKU then steal the original signature.
    const evilToken = signPreviewToken('EVIL-SKU').split('.')[0] + '.' + sig
    const result = verifyPreviewToken(evilToken, 'EVIL-SKU')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('bad-signature')
  })

  test('rejects a malformed token (missing signature)', () => {
    const result = verifyPreviewToken('not-a-valid-token', 'IH-HH-001')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('malformed')
  })

  test('rejects when token is missing entirely', () => {
    expect(verifyPreviewToken(undefined, 'IH-HH-001').valid).toBe(false)
    expect(verifyPreviewToken(null, 'IH-HH-001').valid).toBe(false)
    expect(verifyPreviewToken('', 'IH-HH-001').valid).toBe(false)
  })

  test('signing throws when PREVIEW_TOKEN_SECRET is unset', () => {
    delete process.env.PREVIEW_TOKEN_SECRET
    expect(() => signPreviewToken('IH-HH-001')).toThrow(/PREVIEW_TOKEN_SECRET/)
  })

  test('a token signed with one secret does not verify under another', () => {
    const token = signPreviewToken('IH-HH-001')
    process.env.PREVIEW_TOKEN_SECRET = 'a-completely-different-secret'
    const result = verifyPreviewToken(token, 'IH-HH-001')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('bad-signature')
  })
})
