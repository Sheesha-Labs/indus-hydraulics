import NextAuth from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { headers } from 'next/headers'
import { after } from 'next/server'
import {
  opsCookieNames,
  opsCookieOptions,
  requireOpsSecret,
  secureCookiesEnabled,
} from './auth-cookies'
import { buildProviders } from './auth-providers'
import { checkGoogleProfile, type GoogleProfile } from './google-profile'
import { SecondFactorError, type PasswordCredentials } from './password-provider'
import { clientIp } from './request-origin'
import { noticeIfNewDevice, requestLocation } from '../server/access/devices'
import { clearInviteCookie, readInviteCookie } from '../server/access/invite-cookie'
import { acceptGoogleInvite } from '../server/access/invites'
import { endSession } from '../server/access/sessions'
import { domainOf, signInRefusal, type InviteSignInRefusal } from '../server/access/team-core'
import { secondFactorStep } from '../server/access/sign-in'
import {
  findActiveUserByEmail,
  findUserByEmail,
  ipHash,
  recordFailedSignIn,
  recordSignIn,
  type SignInRecord,
} from '../server/auth/session-store'

/**
 * The Indus Operations Auth.js instance (ADR-05). Its own secret, cookies and
 * users: a website-admin compromise must not become an Ops compromise. JWT
 * sessions of 8 hours carry sub, kind 'ops', role and sid; every guard rejects a
 * token without kind 'ops'. No next-auth/react anywhere.
 */
const SECURE = secureCookiesEnabled()
const DOMAIN = process.env.GOOGLE_WORKSPACE_DOMAIN ?? 'indushydraulics.me'

async function requestMeta() {
  const h = await headers()
  return { userAgent: h.get('user-agent'), ip: clientIp(h) }
}

/**
 * The Ops session this browser already holds, if any (signing in again, e.g. to change a password):
 * recordSignIn ends it, so one browser never lists as two devices. Decoded like the proxy does.
 */
async function previousSessionId(): Promise<string | null> {
  const secret = process.env.OPS_AUTH_SECRET
  if (!secret) return null
  const h = await headers()
  const cookieName = opsCookieNames(SECURE).session
  try {
    const token = await getToken({
      req: { headers: h },
      secret,
      cookieName,
      salt: cookieName,
      secureCookie: SECURE,
    })
    return token?.kind === 'ops' && typeof token.sid === 'string' ? token.sid : null
  } catch {
    return null
  }
}

/**
 * The new-device email (S03-T02) runs after the response: sign-in never waits on Resend, and a mail
 * failure never fails a sign-in.
 */
function scheduleNewDeviceNotice(userId: string, record: SignInRecord): void {
  const run = () =>
    noticeIfNewDevice({
      userId,
      sessionId: record.sid,
      deviceHash: record.deviceHash,
      deviceLabel: record.deviceLabel,
      city: record.city,
      at: record.at,
    }).catch((error: unknown) => {
      console.error('new-device notice failed', error instanceof Error ? error.name : 'unknown')
    })
  try {
    after(run)
  } catch {
    void run()
  }
}

function refuse(reason: string): string {
  return `/sign-in?error=${reason}`
}

type GoogleInviteProfile = GoogleProfile & { name?: string | null }

/**
 * The Google half of accepting an invitation: when the invite cookie is present, accept it for the
 * address Google verified (one transaction: the user row active, the invite accepted, auth_event
 * invite_accepted) and clear the cookie. 'accepted' signs in; a refusal code is shown only if the
 * ordinary checks would also refuse (an already-active person still signs in as usual).
 *
 * An invitation to a Workspace address still needs the Workspace account (the same `hd` check as any
 * sign-in); only an invitation the Owner sent outside the domain (the logged override) accepts a
 * verified Google account on that exact address.
 */
async function acceptInviteFromCookie(
  profile: GoogleInviteProfile | undefined
): Promise<'accepted' | InviteSignInRefusal | null> {
  const token = await readInviteCookie()
  if (!token) return null
  await clearInviteCookie()
  if (profile?.email_verified !== true || !profile.email) return 'email_unverified'
  // Not the Workspace account: the ordinary check below refuses it with its own reason.
  if (domainOf(profile.email) === DOMAIN.toLowerCase() && !checkGoogleProfile(profile, DOMAIN).ok) {
    return null
  }
  const outcome = await acceptGoogleInvite({
    token,
    email: profile.email,
    name: profile.name ?? null,
  })
  if (outcome.ok) return 'accepted'
  return outcome.reason === 'email_mismatch' ? 'invite_mismatch' : 'invite_invalid'
}

/**
 * `ops-password`'s authorize: the sealed pending value from the password step plus a TOTP code or a
 * backup code (server/access/sign-in.ts). Never a password alone. Failures (and the lock they may
 * trigger) are recorded there; the thrown code becomes the two-factor page's state.
 */
async function authorizePassword(credentials: PasswordCredentials) {
  const meta = await requestMeta()
  const outcome = await secondFactorStep({
    ...credentials,
    meta: { ipHash: ipHash(meta.ip), userAgent: meta.userAgent },
  })
  if (!outcome.ok) throw new SecondFactorError(outcome.reason, outcome.minutes)
  return outcome.user
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  basePath: '/api/auth',
  secret: requireOpsSecret(),
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  cookies: opsCookieOptions(SECURE),
  pages: { signIn: '/sign-in', error: '/sign-in' },
  providers: buildProviders(
    {
      APP_ENV: process.env.APP_ENV,
      OPS_E2E_AUTH: process.env.OPS_E2E_AUTH,
      GOOGLE_OPS_CLIENT_ID: process.env.GOOGLE_OPS_CLIENT_ID,
      GOOGLE_OPS_CLIENT_SECRET: process.env.GOOGLE_OPS_CLIENT_SECRET,
      GOOGLE_WORKSPACE_DOMAIN: process.env.GOOGLE_WORKSPACE_DOMAIN,
      OPS_E2E_GOOGLE_ISSUER: process.env.OPS_E2E_GOOGLE_ISSUER,
    },
    findActiveUserByEmail,
    authorizePassword
  ),
  events: {
    // Sign out ends this browser's user_session row (auth_event sign_out), so Devices stops listing it.
    async signOut(message) {
      const sid = 'token' in message ? message.token?.sid : undefined
      if (typeof sid !== 'string') return
      try {
        await endSession(sid)
      } catch (error) {
        console.error(
          'ending the session on sign-out failed',
          error instanceof Error ? error.name : ''
        )
      }
    },
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      const method = account?.provider === 'google' ? 'google' : 'password'
      let email = (user.email ?? '').toLowerCase()
      // Accepting an invitation with Google (S03-T03): only when this browser carries the invite
      // cookie from /sign-in/invite/[token]. Without it nothing below changes.
      let inviteRefusal: InviteSignInRefusal | null = null
      if (account?.provider === 'google') {
        const invite = await acceptInviteFromCookie(profile as GoogleInviteProfile | undefined)
        if (invite === 'accepted') return true
        if (invite) inviteRefusal = invite
      }
      if (account?.provider === 'google') {
        const check = checkGoogleProfile((profile ?? {}) as GoogleProfile, DOMAIN)
        email = check.email
        if (!check.ok) {
          await recordFailedSignIn({ email, method, ...(await requestMeta()) })
          return refuse(inviteRefusal ?? check.reason)
        }
      }
      const row = email ? await findUserByEmail(email) : null
      const refusal = signInRefusal(row, method)
      if (refusal) {
        await recordFailedSignIn({ email, method, ...(await requestMeta()) })
        return refuse(refusal === 'not_invited' && inviteRefusal ? inviteRefusal : refusal)
      }
      return true
    },
    async jwt({ token, account, user }) {
      if (!account) return token
      const row = await findUserByEmail((user.email ?? '').toLowerCase())
      // A user who stopped being active between signIn and jwt gets no session.
      if (!row || row.status !== 'active') return null
      const method = account.provider === 'google' ? 'google' : 'password'
      const record = await recordSignIn({
        userId: row.id,
        method,
        ...(await requestMeta()),
        location: requestLocation(await headers()),
        previousSid: await previousSessionId(),
      })
      scheduleNewDeviceNotice(row.id, record)
      const sid = record.sid
      return {
        sub: row.id,
        kind: 'ops',
        role: row.role,
        sid,
        name: row.name,
        initials: row.initials,
      }
    },
    async session({ session, token }) {
      if (token.kind !== 'ops' || !token.sub || !token.role || !token.sid) {
        return { ...session, user: undefined as never, sid: '' }
      }
      return {
        expires: session.expires,
        user: {
          id: token.sub,
          role: token.role,
          name: token.name ?? '',
          initials: token.initials ?? '',
        },
        sid: token.sid,
      } as typeof session
    },
  },
}))
