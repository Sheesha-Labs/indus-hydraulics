/**
 * Signed access token for /quote/[code] viewer.
 *
 * Lets a recipient who isn't logged in (e.g. a procurement manager who got
 * the quote email forwarded to them) view the read-only RFQ status page +
 * download the quote PDF without an account.
 *
 * Token is HMAC-signed against PREVIEW_TOKEN_SECRET. Default TTL = 60 days
 * (long enough to outlast the quote validity window).
 *
 * Pattern mirrors `signPreviewToken` (which is SKU-scoped); we keep it in a
 * separate function rather than generalising both, so each callsite has a
 * clear domain noun.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

const DEFAULT_TTL_MS = 60 * 24 * 60 * 60 * 1000 // 60 days

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64')
}

function getSecret(): string {
  const secret = process.env.PREVIEW_TOKEN_SECRET
  if (!secret) throw new Error('PREVIEW_TOKEN_SECRET env var is not set')
  return secret
}

export type QuoteAccessTokenReason = 'missing' | 'malformed' | 'bad-signature' | 'expired' | 'rfq-mismatch'

/**
 * Sign a token granting read access to /quote/[rfqCode].
 *
 * @param rfqCode  e.g. "RFQ-2026-0001"
 * @param ttlMs    defaults to 60 days
 */
export function signQuoteAccessToken(rfqCode: string, ttlMs: number = DEFAULT_TTL_MS): string {
  const exp = Date.now() + ttlMs
  const payload = b64url(Buffer.from(JSON.stringify({ rfq: rfqCode, exp })))
  const sig = b64url(createHmac('sha256', getSecret()).update(payload).digest())
  return `${payload}.${sig}`
}

/**
 * Verify a quote access token. Returns `{ valid: true }` if the token is
 * well-formed, signature checks out, hasn't expired, and matches the
 * expected rfqCode. Otherwise `{ valid: false, reason }`.
 */
export function verifyQuoteAccessToken(
  token: string | undefined | null,
  rfqCode: string,
): { valid: true } | { valid: false; reason: QuoteAccessTokenReason } {
  if (!token) return { valid: false, reason: 'missing' }
  const parts = token.split('.')
  if (parts.length !== 2) return { valid: false, reason: 'malformed' }
  const [payload, sig] = parts as [string, string]
  const expectedSig = createHmac('sha256', getSecret()).update(payload).digest()
  const givenSig = fromB64url(sig)
  if (givenSig.length !== expectedSig.length || !timingSafeEqual(givenSig, expectedSig)) {
    return { valid: false, reason: 'bad-signature' }
  }
  let parsed: { rfq: string; exp: number }
  try {
    parsed = JSON.parse(fromB64url(payload).toString('utf8'))
  } catch {
    return { valid: false, reason: 'malformed' }
  }
  if (typeof parsed.exp !== 'number' || Date.now() > parsed.exp) {
    return { valid: false, reason: 'expired' }
  }
  if (parsed.rfq !== rfqCode) return { valid: false, reason: 'rfq-mismatch' }
  return { valid: true }
}
