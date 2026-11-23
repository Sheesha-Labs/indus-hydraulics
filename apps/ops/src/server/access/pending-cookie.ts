import 'server-only'
import { cookies } from 'next/headers'
import {
  openPending,
  pendingCookieName,
  pendingCookieOptions,
  sealPending,
  type PendingPurpose,
  type PendingTwoFactor,
} from './pending-2fa'

/** The pending-2FA cookie through next/headers. Set and clear only from a server action. */
export async function setPendingCookie(payload: PendingTwoFactor): Promise<void> {
  const jar = await cookies()
  jar.set(pendingCookieName(), sealPending(payload), pendingCookieOptions())
}

/** The sealed value as the browser sent it (for the Credentials provider), or null. */
export async function rawPendingCookie(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(pendingCookieName())?.value ?? null
}

export async function readPendingCookie(
  purpose?: PendingPurpose
): Promise<PendingTwoFactor | null> {
  return openPending(await rawPendingCookie(), purpose ? { purpose } : {})
}

export async function clearPendingCookie(): Promise<void> {
  const jar = await cookies()
  // Same attributes as when set: a __Host- cookie is only replaced by a Secure, Path=/ Set-Cookie.
  jar.set(pendingCookieName(), '', { ...pendingCookieOptions(), maxAge: 0 })
}
