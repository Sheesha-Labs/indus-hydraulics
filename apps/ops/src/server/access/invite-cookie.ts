import 'server-only'
import { cookies } from 'next/headers'
import { secureCookiesEnabled } from '../../lib/auth-cookies'
import { additionalData, openText, seal } from '../../lib/crypto'

/**
 * The invitation being accepted with Google (S03-T03). "Continue with Google" on
 * /sign-in/invite/[token] seals the link token into this short-lived HttpOnly cookie, then starts the
 * Google sign-in; the signIn callback (lib/auth.ts) opens it, accepts the invite for the address Google
 * verified, and clears it. SameSite=Lax: it travels on the top-level redirect back from Google.
 */
export const INVITE_COOKIE_TTL_S = 15 * 60

const AAD = additionalData('invite-accept', 'v1')

export function inviteCookieName(secure = secureCookiesEnabled()): string {
  return `${secure ? '__Host-' : ''}indus.ops-invite`
}

function options(secure = secureCookiesEnabled()) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure,
    maxAge: INVITE_COOKIE_TTL_S,
  }
}

export async function setInviteCookie(token: string): Promise<void> {
  const jar = await cookies()
  jar.set(inviteCookieName(), seal(token, AAD), options())
}

/** The link token, or null when there is no cookie or it does not open. */
export async function readInviteCookie(): Promise<string | null> {
  const jar = await cookies()
  const raw = jar.get(inviteCookieName())?.value
  if (!raw) return null
  try {
    return openText(raw, AAD)
  } catch {
    return null
  }
}

export async function clearInviteCookie(): Promise<void> {
  const jar = await cookies()
  jar.set(inviteCookieName(), '', { ...options(), maxAge: 0 })
}
