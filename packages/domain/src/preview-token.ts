import { createHmac, timingSafeEqual } from 'node:crypto'

const DEFAULT_TTL_MS = 15 * 60 * 1000 // 15 minutes

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

/**
 * Token type tag, checked immediately after the signature.
 *
 * Preview tokens and quote-access tokens shared one secret and one wire
 * format, so a quote token passed this module's HMAC check and was rejected
 * only because the payload's key happened to be `rfq` rather than `sku` —
 * domain separation resting on a JSON key name. `typ` makes it explicit, and
 * the secrets are split besides.
 *
 * Enforced strictly here: this token's TTL is 15 minutes, so no untagged
 * token minted before this change can still be within its validity window.
 */
const TOKEN_TYPE = 'preview'

export function signPreviewToken(sku: string, ttlMs: number = DEFAULT_TTL_MS): string {
  const exp = Date.now() + ttlMs
  const payload = b64url(Buffer.from(JSON.stringify({ typ: TOKEN_TYPE, sku, exp })))
  const sig = b64url(createHmac('sha256', getSecret()).update(payload).digest())
  return `${payload}.${sig}`
}

export function verifyPreviewToken(
  token: string | undefined | null,
  sku: string,
): {
  valid: boolean
  reason?: 'missing' | 'malformed' | 'bad-signature' | 'expired' | 'sku-mismatch' | 'wrong-type'
} {
  if (!token) return { valid: false, reason: 'missing' }
  const parts = token.split('.')
  if (parts.length !== 2) return { valid: false, reason: 'malformed' }
  const [payload, sig] = parts as [string, string]
  const expectedSig = createHmac('sha256', getSecret()).update(payload).digest()
  const givenSig = fromB64url(sig)
  if (givenSig.length !== expectedSig.length || !timingSafeEqual(givenSig, expectedSig)) {
    return { valid: false, reason: 'bad-signature' }
  }
  let parsed: { typ?: string; sku: string; exp: number }
  try {
    parsed = JSON.parse(fromB64url(payload).toString('utf8'))
  } catch {
    return { valid: false, reason: 'malformed' }
  }
  if (parsed.typ !== TOKEN_TYPE) return { valid: false, reason: 'wrong-type' }
  if (typeof parsed.exp !== 'number' || Date.now() > parsed.exp) {
    return { valid: false, reason: 'expired' }
  }
  if (parsed.sku !== sku) return { valid: false, reason: 'sku-mismatch' }
  return { valid: true }
}
