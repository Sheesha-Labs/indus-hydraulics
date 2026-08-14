import { requireAuthSecret, staffCookies } from '@indus/domain'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { cache } from 'react'
import { z } from 'zod'

// The `next-auth` module augmentation lives in src/types/next-auth.d.ts —
// one declaration for the whole program, shared verbatim with the storefront.

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const nextAuth = NextAuth({
  trustHost: true,
  // Explicit secret + explicit cookie names are what isolate this instance
  // from the customer one. See packages/domain/src/auth-cookies.ts — the
  // session cookie's name is @auth/core's HKDF salt, so a differing name makes
  // the two token families mutually undecryptable even under one secret.
  secret: requireAuthSecret('STAFF_AUTH_SECRET'),
  cookies: staffCookies,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { db } = await import('@indus/db')
        const { verify } = await import('./password')

        const staffUser = await db.staffUser.findUnique({
          where: { email: parsed.data.email },
        })

        if (!staffUser || !staffUser.isActive) return null

        // Lockout mirrors the customer side (apps/web/src/lib/auth.ts). Staff
        // previously had none — unlimited password guesses — which stops being
        // acceptable once /admin is reachable on the public domain.
        if (staffUser.lockedUntil && staffUser.lockedUntil > new Date()) return null

        const valid = await verify(parsed.data.password, staffUser.passwordHash ?? '')

        if (!valid) {
          const failedCount = staffUser.failedSignInCount + 1
          const lockedUntil = failedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null
          await db.staffUser.update({
            where: { id: staffUser.id },
            data: { failedSignInCount: failedCount, lockedUntil },
          })
          return null
        }

        await db.staffUser.update({
          where: { id: staffUser.id },
          data: { failedSignInCount: 0, lockedUntil: null, lastSignInAt: new Date() },
        })

        return {
          id: staffUser.id,
          email: staffUser.email,
          name: staffUser.name,
          role: staffUser.role as string,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // Converged with the storefront's 8h. This session now sits on the public
    // origin, where 12h would let one survive an unattended laptop overnight.
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.kind = 'staff'
        token.role = (user as unknown as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? '',
          role: (token.role as string) ?? '',
          kind: 'staff' as const,
          // Present for type-shape parity with the customer session; never
          // read on this surface, and never non-empty.
          accountId: '',
        },
      }
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
})

export const { handlers, signIn, signOut } = nextAuth

// Wrap auth() in React's per-request cache so layout + page calling it
// during the same render only decode the JWT once. NextAuth's auth() is
// idempotent within a request, so this is safe.
export const auth = cache(nextAuth.auth)
