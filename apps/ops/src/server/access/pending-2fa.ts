import { randomBytes } from 'node:crypto'
import { secureCookiesEnabled } from '../../lib/auth-cookies'
import { CryptoError, additionalData, openText, seal, type KeyRing } from '../../lib/crypto'

/**
 * The pending two-factor state between the password step and the code step (ADR-05, 07 §5.3).
 *
 * A short-lived cookie holding an AES-GCM sealed `{ uid, purpose, exp, nonce, … }`: the browser can
 * carry it but neither read nor forge it. `signin` says "this person proved the password; ask for the
 * second factor". `enrol` holds a NEW, not yet confirmed TOTP secret until its first code verifies
 * (Settings › Security, invite acceptance). It is never a session: the Credentials provider still
 * requires a code or a backup code (or, after enrolment, the enrolment proof) before it signs in.
 *
 * `__Host-` needs HTTPS, so plain-http local development uses the bare name (as auth-cookies.ts).
 */
export type PendingPurpose = 'signin' | 'enrol'

export type PendingTwoFactor = {
  uid: string
  purpose: PendingPurpose
  /** Epoch milliseconds. */
  exp: number
  nonce: string
  /** Where to land after signing in (already validated with safeNextPath). */
  next?: string
  /** enrol: the unconfirmed base32 secret. */
  pendingSecret?: string
  /** enrol: sign in once the first code verifies (invite acceptance) instead of returning. */
  signInAfter?: boolean
  /**
   * signin: set only by the server right after an enrolment or a password reset verified an
   * authenticator code: that code was the second factor. Single use (sign-in.ts spends the nonce).
   */
  proof?: 'enrolment' | 'reset'
}

export const PENDING_TTL_MS = 5 * 60 * 1000

export function pendingCookieName(secure = secureCookiesEnabled()): string {
  return `${secure ? '__Host-' : ''}indus.ops-2fa`
}

export function pendingCookieOptions(secure = secureCookiesEnabled()) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure,
    maxAge: PENDING_TTL_MS / 1000,
  }
}

const AAD = additionalData('pending-2fa', 'v1')

export function newPending(
  input: Omit<PendingTwoFactor, 'exp' | 'nonce'>,
  now = Date.now()
): PendingTwoFactor {
  return { ...input, exp: now + PENDING_TTL_MS, nonce: randomBytes(12).toString('base64url') }
}

export function sealPending(payload: PendingTwoFactor, ring?: KeyRing): string {
  return seal(JSON.stringify(payload), AAD, ring)
}

/**
 * Opens a sealed value and checks its shape, expiry and (when given) purpose. Null for anything
 * tampered, expired, sealed under an unknown key, or of the wrong purpose.
 */
export function openPending(
  value: string | null | undefined,
  options: { purpose?: PendingPurpose; now?: number; ring?: KeyRing } = {}
): PendingTwoFactor | null {
  if (!value) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(openText(value, AAD, options.ring))
  } catch (error) {
    if (error instanceof CryptoError || error instanceof SyntaxError) return null
    throw error
  }
  if (!parsed || typeof parsed !== 'object') return null
  const p = parsed as Partial<PendingTwoFactor>
  if (typeof p.uid !== 'string' || typeof p.exp !== 'number' || typeof p.nonce !== 'string') {
    return null
  }
  if (p.purpose !== 'signin' && p.purpose !== 'enrol') return null
  if (options.purpose && p.purpose !== options.purpose) return null
  if (p.exp <= (options.now ?? Date.now())) return null
  if (p.purpose === 'enrol' && typeof p.pendingSecret !== 'string') return null
  if (
    p.proof !== undefined &&
    (p.purpose !== 'signin' || !['enrolment', 'reset'].includes(p.proof))
  ) {
    return null
  }
  return p as PendingTwoFactor
}
