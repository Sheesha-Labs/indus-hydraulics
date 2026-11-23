import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'
import { env } from './env'

/**
 * Symmetric sealing for secrets Ops stores or hands to the browser (architecture §4.11, ADR-06):
 * TOTP secrets, the pending two-factor cookie, later mailbox refresh tokens.
 *
 * AES-256-GCM with the rotating key ring `OPS_TOKEN_KEYS` (JSON `{ kid: base64 32-byte key }`) and
 * `OPS_TOKEN_KEY_ACTIVE`. A sealed value is `v1.<kid>.<iv>.<ciphertext+tag>` (base64url), so a value
 * sealed under an older key still opens after the active key moves on. The additional data binds the
 * value to what it is for (`purpose:rowId`): a ciphertext copied onto another row, or presented as
 * another purpose, fails authentication.
 */
export type KeyRing = { keys: Readonly<Record<string, string>>; active: string }

export class CryptoError extends Error {
  constructor(message = 'sealed value could not be opened') {
    super(message)
    this.name = 'CryptoError'
  }
}

const VERSION = 'v1'
const IV_BYTES = 12
const TAG_BYTES = 16

/** The ring from the environment. Throws (no value in the message) when it is not configured. */
export function keyRingFromEnv(): KeyRing {
  const e = env()
  if (!e.OPS_TOKEN_KEYS || !e.OPS_TOKEN_KEY_ACTIVE) {
    throw new CryptoError('OPS_TOKEN_KEYS and OPS_TOKEN_KEY_ACTIVE are required')
  }
  return { keys: e.OPS_TOKEN_KEYS, active: e.OPS_TOKEN_KEY_ACTIVE }
}

function keyBytes(ring: KeyRing, kid: string): Buffer {
  const raw = ring.keys[kid]
  if (!raw) throw new CryptoError()
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) throw new CryptoError()
  return key
}

/** Additional data: `purpose:rowId`. Both parts are required so nothing is sealed unbound. */
export function additionalData(purpose: string, rowId: string): string {
  if (!purpose || !rowId) throw new CryptoError('purpose and row id are required')
  return `${purpose}:${rowId}`
}

export function seal(plaintext: string | Uint8Array, aad: string, ring = keyRingFromEnv()): string {
  const kid = ring.active
  const key = keyBytes(ring, kid)
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  cipher.setAAD(Buffer.from(aad, 'utf8'))
  const body = Buffer.concat([
    cipher.update(typeof plaintext === 'string' ? Buffer.from(plaintext, 'utf8') : plaintext),
    cipher.final(),
    cipher.getAuthTag(),
  ])
  return [VERSION, kid, iv.toString('base64url'), body.toString('base64url')].join('.')
}

/** Opens a sealed value. Any tampering, wrong purpose or unknown key throws CryptoError. */
export function open(sealed: string, aad: string, ring = keyRingFromEnv()): Buffer {
  const parts = sealed.split('.')
  if (parts.length !== 4 || parts[0] !== VERSION) throw new CryptoError()
  const [, kid, ivPart, bodyPart] = parts as [string, string, string, string]
  const key = keyBytes(ring, kid)
  const iv = Buffer.from(ivPart, 'base64url')
  const body = Buffer.from(bodyPart, 'base64url')
  if (iv.length !== IV_BYTES || body.length < TAG_BYTES) throw new CryptoError()
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAAD(Buffer.from(aad, 'utf8'))
    decipher.setAuthTag(body.subarray(body.length - TAG_BYTES))
    return Buffer.concat([
      decipher.update(body.subarray(0, body.length - TAG_BYTES)),
      decipher.final(),
    ])
  } catch {
    throw new CryptoError()
  }
}

export function openText(sealed: string, aad: string, ring = keyRingFromEnv()): string {
  return open(sealed, aad, ring).toString('utf8')
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

/** A URL-safe random token, e.g. for a reset link. 32 bytes = 43 characters. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

/** Constant-time string comparison (different lengths compare unequal without leaking where). */
export function safeEqual(a: string, b: string): boolean {
  const left = createHash('sha256').update(a, 'utf8').digest()
  const right = createHash('sha256').update(b, 'utf8').digest()
  return timingSafeEqual(left, right) && a.length === b.length
}
