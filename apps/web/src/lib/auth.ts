import { customerCookies, requireAuthSecret } from '@indus/domain'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

// The `next-auth` module augmentation lives in src/types/next-auth.d.ts —
// one declaration for the whole program, shared verbatim with the admin app.

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // Explicit secret + explicit cookie names are what isolate this instance
  // from the staff one. See packages/domain/src/auth-cookies.ts — the session
  // cookie's name is @auth/core's HKDF salt, so a differing name makes the two
  // token families mutually undecryptable even under one secret.
  secret: requireAuthSecret('CUSTOMER_AUTH_SECRET'),
  cookies: customerCookies,
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

        const contact = await db.accountContact.findUnique({
          where: { email: parsed.data.email },
          include: { account: true },
        })

        if (!contact || !contact.isActive) return null

        if (contact.lockedUntil && contact.lockedUntil > new Date()) {
          return null
        }

        const valid = await verify(parsed.data.password, contact.passwordHash ?? '')

        if (!valid) {
          const failedCount = contact.failedSignInCount + 1
          const lockedUntil = failedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null
          await db.accountContact.update({
            where: { id: contact.id },
            data: { failedSignInCount: failedCount, lockedUntil },
          })
          return null
        }

        await db.accountContact.update({
          where: { id: contact.id },
          data: { failedSignInCount: 0, lockedUntil: null, lastSignInAt: new Date() },
        })

        return {
          id: contact.id,
          email: contact.email,
          name: `${contact.firstName} ${contact.lastName}`,
          accountId: contact.accountId,
          role: contact.role as string,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.kind = 'customer'
        token.accountId = (user as unknown as { accountId: string }).accountId
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
          accountId: (token.accountId as string) ?? '',
          role: (token.role as string) ?? '',
          kind: 'customer' as const,
        },
      }
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
})
