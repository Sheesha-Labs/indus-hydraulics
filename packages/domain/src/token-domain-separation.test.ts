import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { signPreviewToken, verifyPreviewToken } from './preview-token'
import { signQuoteAccessToken, verifyQuoteAccessToken } from './quote-access-token'

/**
 * Cross-type replay between the two HMAC token families.
 *
 * They used to share PREVIEW_TOKEN_SECRET and an identical wire format, so a
 * quote token passed the preview verifier's signature check and failed only
 * because the payload's key was `rfq` instead of `sku`. Domain separation
 * rested on a JSON key name. These tests pin the explicit `typ` guard and the
 * split secret.
 */

/** Narrow the discriminated union so `.reason` is addressable in assertions. */
function quoteFailure(result: ReturnType<typeof verifyQuoteAccessToken>): string {
  return result.valid ? 'UNEXPECTEDLY_VALID' : result.reason
}

const PREVIEW_SECRET = 'preview-secret-value-that-is-long-enough'
const QUOTE_SECRET = 'quote-secret-value-that-is-different-and-long'

let prevPreview: string | undefined
let prevQuote: string | undefined

beforeEach(() => {
  prevPreview = process.env.PREVIEW_TOKEN_SECRET
  prevQuote = process.env.QUOTE_TOKEN_SECRET
  process.env.PREVIEW_TOKEN_SECRET = PREVIEW_SECRET
  process.env.QUOTE_TOKEN_SECRET = QUOTE_SECRET
})

afterEach(() => {
  if (prevPreview === undefined) delete process.env.PREVIEW_TOKEN_SECRET
  else process.env.PREVIEW_TOKEN_SECRET = prevPreview
  if (prevQuote === undefined) delete process.env.QUOTE_TOKEN_SECRET
  else process.env.QUOTE_TOKEN_SECRET = prevQuote
})

describe('each token still works for its own purpose', () => {
  test('preview token round-trips', () => {
    expect(verifyPreviewToken(signPreviewToken('IH-AP71'), 'IH-AP71')).toEqual({ valid: true })
  })

  test('quote token round-trips', () => {
    expect(verifyQuoteAccessToken(signQuoteAccessToken('RFQ-2026-0001'), 'RFQ-2026-0001')).toEqual({ valid: true })
  })

  test('each still rejects a mismatched subject', () => {
    expect(verifyPreviewToken(signPreviewToken('IH-AP71'), 'IH-OTHER').valid).toBe(false)
    expect(verifyQuoteAccessToken(signQuoteAccessToken('RFQ-1'), 'RFQ-2').valid).toBe(false)
  })
})

describe('cross-type replay is rejected', () => {
  test('a quote token is not a preview token', () => {
    const quote = signQuoteAccessToken('RFQ-2026-0001')
    expect(verifyPreviewToken(quote, 'RFQ-2026-0001').valid).toBe(false)
  })

  test('a preview token is not a quote token', () => {
    const preview = signPreviewToken('IH-AP71')
    expect(verifyQuoteAccessToken(preview, 'IH-AP71').valid).toBe(false)
  })

  test('the split secret alone blocks replay, even if typ were forged', () => {
    // Signed under the quote secret, presented to the preview verifier, which
    // uses PREVIEW_TOKEN_SECRET — the signature cannot match.
    const quote = signQuoteAccessToken('RFQ-2026-0001')
    expect(verifyPreviewToken(quote, 'RFQ-2026-0001').reason).toBe('bad-signature')
  })

  test('the typ guard alone blocks replay, even under one shared secret', () => {
    // Simulates the pre-split configuration: both families on one secret.
    process.env.QUOTE_TOKEN_SECRET = PREVIEW_SECRET
    const quote = signQuoteAccessToken('RFQ-2026-0001')
    // Signature now checks out, so `typ` is what stops it.
    expect(verifyPreviewToken(quote, 'RFQ-2026-0001').reason).toBe('wrong-type')
  })
})

describe('60-day links already in customer inboxes keep working', () => {
  test('a legacy token verifies even after QUOTE_TOKEN_SECRET is rotated in', () => {
    // The case a plain `??` fallback would break: the new secret IS set, so a
    // single-secret verifier would use it and reject every outstanding link.
    // Verification accepts both; signing uses only the new one.
    const legacy = signQuoteAccessTokenWithoutTyp('RFQ-2026-0001', PREVIEW_SECRET)
    expect(process.env.QUOTE_TOKEN_SECRET).toBe(QUOTE_SECRET)
    expect(verifyQuoteAccessToken(legacy, 'RFQ-2026-0001')).toEqual({ valid: true })
  })

  test('legacy tokens still verify before the rotation too', () => {
    delete process.env.QUOTE_TOKEN_SECRET
    const legacy = signQuoteAccessTokenWithoutTyp('RFQ-2026-0001', PREVIEW_SECRET)
    expect(verifyQuoteAccessToken(legacy, 'RFQ-2026-0001')).toEqual({ valid: true })
  })

  test('new tokens are signed with the NEW secret, not the legacy one', () => {
    // Proves the rotation actually happens rather than the fallback masking it.
    const fresh = signQuoteAccessToken('RFQ-2026-0002')
    const before = process.env.PREVIEW_TOKEN_SECRET
    delete process.env.PREVIEW_TOKEN_SECRET
    expect(verifyQuoteAccessToken(fresh, 'RFQ-2026-0002')).toEqual({ valid: true })
    process.env.PREVIEW_TOKEN_SECRET = before
  })

  test('but a token tagged as another type is still rejected', () => {
    delete process.env.QUOTE_TOKEN_SECRET
    const preview = signPreviewToken('IH-AP71')
    expect(quoteFailure(verifyQuoteAccessToken(preview, 'IH-AP71'))).toBe('wrong-type')
  })

  test('a token signed with neither secret is rejected', () => {
    const forged = signQuoteAccessTokenWithoutTyp('RFQ-2026-0001', 'some-other-secret-entirely')
    expect(quoteFailure(verifyQuoteAccessToken(forged, 'RFQ-2026-0001'))).toBe('bad-signature')
  })
})

/** Reproduces the pre-split payload shape: no `typ` key. */
function signQuoteAccessTokenWithoutTyp(rfqCode: string, secret: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHmac } = require('node:crypto') as typeof import('node:crypto')
  const b64url = (buf: Buffer) =>
    buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const exp = Date.now() + 60 * 24 * 60 * 60 * 1000
  const payload = b64url(Buffer.from(JSON.stringify({ rfq: rfqCode, exp })))
  const sig = b64url(createHmac('sha256', secret).update(payload).digest())
  return `${payload}.${sig}`
}
