/**
 * Signed access token for /quote/[code] viewer.
 *
 * Lets a recipient who isn't logged in (e.g. a procurement manager who got
 * the quote email forwarded to them) view the read-only RFQ status page +
 * download the quote PDF without an account.
 *
 * Token is HMAC-signed against QUOTE_TOKEN_SECRET. Default TTL = 60 days
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

/**
 * Signing and verification secrets for quote-access tokens.
 *
 * These used to share PREVIEW_TOKEN_SECRET with the 15-minute product-preview
 * tokens, which meant a token of one kind passed the other's HMAC check and
 * was rejected only because the payload's key name differed. Two very
 * different blast radii — a 15-minute draft-product preview versus 60-day read
 * access to a customer's pricing and terms — should not turn on a JSON key.
 *
 * Rotation is split across sign and verify on purpose. Signing always uses the
 * new secret, so every token minted from now on is properly separated. Verify
 * accepts the legacy secret as well, because 60-day links are already sitting
 * in customers' inboxes and a plain `??` fallback would silently invalidate
 * every one of them the moment QUOTE_TOKEN_SECRET was set.
 *
 * Remove `PREVIEW_TOKEN_SECRET` from VERIFY_SECRETS — and the legacy-`typ`
 * tolerance below — after 2026-10-14, by which point every pre-split token has
 * expired.
 */
function signingSecret(): string {
  const secret = process.env.QUOTE_TOKEN_SECRET ?? process.env.PREVIEW_TOKEN_SECRET
  if (!secret) throw new Error('QUOTE_TOKEN_SECRET (or legacy PREVIEW_TOKEN_SECRET) env var is not set')
  return secret
}

function verificationSecrets(): string[] {
  const secrets = [process.env.QUOTE_TOKEN_SECRET, process.env.PREVIEW_TOKEN_SECRET].filter(
    (s): s is string => !!s,
  )
  if (secrets.length === 0) {
    throw new Error('QUOTE_TOKEN_SECRET (or legacy PREVIEW_TOKEN_SECRET) env var is not set')
  }
  return [...new Set(secrets)]
}

/** Constant-time signature check against every accepted secret. */
function signatureMatches(payload: string, sig: string): boolean {
  const given = fromB64url(sig)
  let matched = false
  for (const secret of verificationSecrets()) {
    const expected = createHmac('sha256', secret).update(payload).digest()
    // No early return: keep the work constant across secrets.
    if (given.length === expected.length && timingSafeEqual(given, expected)) matched = true
  }
  return matched
}

/** Token type tag, checked immediately after the signature. See signingSecret(). */
const TOKEN_TYPE = 'quote'

export type QuoteAccessTokenReason =
  | 'missing'
  | 'malformed'
  | 'bad-signature'
  | 'expired'
  | 'rfq-mismatch'
  | 'wrong-type'

/**
 * Sign a token granting read access to /quote/[rfqCode].
 *
 * @param rfqCode  e.g. "RFQ-2026-0001"
 * @param ttlMs    defaults to 60 days
 */
export function signQuoteAccessToken(rfqCode: string, ttlMs: number = DEFAULT_TTL_MS): string {
  const exp = Date.now() + ttlMs
  const payload = b64url(Buffer.from(JSON.stringify({ typ: TOKEN_TYPE, rfq: rfqCode, exp })))
  const sig = b64url(createHmac('sha256', signingSecret()).update(payload).digest())
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
  if (!signatureMatches(payload, sig)) {
    return { valid: false, reason: 'bad-signature' }
  }
  let parsed: { typ?: string; rfq: string; exp: number }
  try {
    parsed = JSON.parse(fromB64url(payload).toString('utf8'))
  } catch {
    return { valid: false, reason: 'malformed' }
  }
  // `undefined` is tolerated for now: tokens minted before the split carry no
  // `typ`, and they are live in customers' inboxes for up to 60 days. Tighten
  // to a strict equality check after 2026-10-14. A token tagged as some *other*
  // type is rejected outright — that is the case this guard exists for.
  if (parsed.typ !== undefined && parsed.typ !== TOKEN_TYPE) {
    return { valid: false, reason: 'wrong-type' }
  }
  if (typeof parsed.exp !== 'number' || Date.now() > parsed.exp) {
    return { valid: false, reason: 'expired' }
  }
  if (parsed.rfq !== rfqCode) return { valid: false, reason: 'rfq-mismatch' }
  return { valid: true }
}
