import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  decodeFileToken,
  encodeFileToken,
  fileTokenBody,
  fileTokenClaims,
  fileTokenExpired,
} from '@indus/ops-core'
import { keyRingFromEnv, type KeyRing } from '../../lib/crypto'

/**
 * Signing and checking the scoped file tokens of /api/files (S11-T04, ADR-21). The HMAC key is derived from the
 * rotating key ring OPS_TOKEN_KEYS (the same ring that seals stored secrets, under its own label, so the two
 * uses never share key material); the token names its key id, so a token signed before a rotation verifies
 * until it expires. No new secret.
 */
function macKey(ring: KeyRing, kid: string): Buffer | null {
  const raw = ring.keys[kid]
  if (!raw) return null
  return createHmac('sha256', Buffer.from(raw, 'base64')).update('ops-file-token/v1').digest()
}

const b64url = (b: Buffer) => b.toString('base64url')

export function signFileToken(
  fileId: string,
  ttlSeconds = 300,
  now = Date.now(),
  ring = keyRingFromEnv()
): string {
  const claims = fileTokenClaims(fileId, now, ttlSeconds, ring.active)
  const key = macKey(ring, ring.active)!
  return encodeFileToken(
    claims,
    b64url(createHmac('sha256', key).update(fileTokenBody(claims)).digest())
  )
}

export type FileTokenCheck =
  { ok: true; fileId: string } | { ok: false; reason: 'malformed' | 'signature' | 'expired' }

export function verifyFileToken(
  token: string,
  now = Date.now(),
  ring = keyRingFromEnv()
): FileTokenCheck {
  const t = decodeFileToken(token)
  if (!t) return { ok: false, reason: 'malformed' }
  const key = macKey(ring, t.claims.kid)
  if (!key) return { ok: false, reason: 'signature' }
  const expected = createHmac('sha256', key).update(t.body).digest()
  const given = Buffer.from(t.signature, 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected))
    return { ok: false, reason: 'signature' }
  if (fileTokenExpired(t.claims, now)) return { ok: false, reason: 'expired' }
  return { ok: true, fileId: t.claims.fid }
}
