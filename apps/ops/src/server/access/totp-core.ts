import { generateSecret, generateURI, generateSync, verifySync } from 'otplib'

/**
 * RFC 6238 TOTP for the password path's second factor (ADR-05, 07 §5.3): SHA-1, 6 digits, 30-second
 * steps, ±1 step accepted. Pure: no database, no key ring (totp.ts stores and guards replays).
 */
export const TOTP_ISSUER = 'Indus Operations'
const PERIOD = 30
const TOLERANCE_SECONDS = PERIOD // ±1 step

export function newTotpSecret(): string {
  return generateSecret()
}

export function otpauthUri(email: string, secret: string): string {
  return generateURI({ issuer: TOTP_ISSUER, label: email, secret })
}

/** Groups of four for typing the key by hand: "JBSW Y3DP EHPK 3PXP". */
export function formatManualKey(secret: string): string {
  return secret.replace(/(.{4})(?=.)/g, '$1 ')
}

export function isCodeShaped(code: string): boolean {
  return /^\d{6}$/.test(code)
}

/** Strips spaces and dashes people type or paste. */
export function normaliseCode(raw: string): string {
  return raw.replace(/[\s-]/g, '')
}

/**
 * The time step `code` belongs to (within ±1 step of `epochSeconds`), or null. `afterStep` refuses
 * any step at or below it (replay guard; the stored column is the authority, this is a pre-check).
 */
export function matchStep(
  secret: string,
  code: string,
  options: { epochSeconds?: number; afterStep?: number | null } = {}
): number | null {
  if (!isCodeShaped(code)) return null
  const result = verifySync({
    secret,
    token: code,
    epochTolerance: TOLERANCE_SECONDS,
    ...(options.epochSeconds === undefined ? {} : { epoch: options.epochSeconds }),
    ...(options.afterStep == null ? {} : { afterTimeStep: options.afterStep }),
  })
  // The functional API returns the TOTP or the HOTP result type; only TOTP's carries the step.
  return result.valid && 'timeStep' in result && typeof result.timeStep === 'number'
    ? result.timeStep
    : null
}

/** For tests and the setup page's own check: the code at a given time. */
export function codeAt(secret: string, epochSeconds: number): string {
  return generateSync({ secret, epoch: epochSeconds })
}
