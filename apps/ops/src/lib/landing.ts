import { safeNextPath } from './safe-next-path'

/**
 * Where a person lands after signing in (S03-T07, 05-map-frontend §6, P01).
 *
 *   1. A safe `next` (same-origin path, not an auth page) wins: the proxy bounced them from there.
 *   2. Otherwise an Owner who has not seen the welcome, while setup is incomplete, goes to /welcome.
 *   3. Everyone else goes to /today.
 *
 * Pure, so the sign-in redirect, Today's first-run check and the /welcome guard share one rule.
 */
export type LandingInput = {
  role: 'owner' | 'helper'
  welcomeSeen: boolean
  setupDone: boolean
  next?: string | null | undefined
}

const AUTH_PREFIXES = ['/sign-in', '/api/auth'] as const

function isAuthPath(path: string): boolean {
  const pathname = path.split(/[?#]/, 1)[0] ?? path
  return AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/** A validated `next`, or null when it is missing, off-origin or an auth page. */
export function landingNext(next: string | null | undefined): string | null {
  const safe = safeNextPath(next)
  return safe && !isAuthPath(safe) ? safe : null
}

export function resolveLanding({ role, welcomeSeen, setupDone, next }: LandingInput): string {
  const target = landingNext(next)
  if (target) return target
  if (role === 'owner' && !welcomeSeen && !setupDone) return '/welcome'
  return '/today'
}
