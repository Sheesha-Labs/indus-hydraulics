import NextAuth from 'next-auth'
import { headers } from 'next/headers'
import { opsCookieOptions, requireOpsSecret, secureCookiesEnabled } from './auth-cookies'
import { buildProviders } from './auth-providers'
import { checkGoogleProfile, type GoogleProfile } from './google-profile'
import { clientIp } from './request-origin'
import {
  findActiveUserByEmail,
  findUserByEmail,
  recordFailedSignIn,
  recordSignIn,
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

function refuse(reason: string): string {
  return `/sign-in?error=${reason}`
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
    },
    findActiveUserByEmail
  ),
  callbacks: {
    async signIn({ account, profile, user }) {
      const method = account?.provider === 'google' ? 'google' : 'password'
      let email = (user.email ?? '').toLowerCase()
      if (account?.provider === 'google') {
        const check = checkGoogleProfile((profile ?? {}) as GoogleProfile, DOMAIN)
        email = check.email
        if (!check.ok) {
          await recordFailedSignIn({ email, method, ...(await requestMeta()) })
          return refuse(check.reason)
        }
      }
      const row = email ? await findUserByEmail(email) : null
      // Invited (not yet accepted), suspended and removed users read the same
      // answer as unknown addresses: nothing else is revealed.
      if (!row || row.status !== 'active') {
        await recordFailedSignIn({ email, method, ...(await requestMeta()) })
        return refuse('not_invited')
      }
      return true
    },
    async jwt({ token, account, user }) {
      if (!account) return token
      const row = await findUserByEmail((user.email ?? '').toLowerCase())
      // A user who stopped being active between signIn and jwt gets no session.
      if (!row || row.status !== 'active') return null
      const method = account.provider === 'google' ? 'google' : 'password'
      const sid = await recordSignIn({ userId: row.id, method, ...(await requestMeta()) })
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
