import NextAuth, { type DefaultSession, type Session } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
import { z } from 'zod'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      accountId: string
      role: string
    } & DefaultSession['user']
  }
}

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
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
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID ?? '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? 'common'}/v2.0`,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
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
        },
      }
    },
  },
  pages: {
    signIn: '/en/sign-in',
    error: '/en/sign-in',
  },
})

/**
 * Wrapper around `auth()` that swallows JWT-decryption / session-shape errors.
 * Use this on public-facing routes where a stale or malformed cookie should be
 * treated as "signed-out" rather than crashing the layout. For routes that must
 * have a valid session (account/*, server actions), call `auth()` directly so
 * the redirect still fires.
 */
export async function safeAuth(): Promise<Session | null> {
  try {
    return await auth()
  } catch {
    return null
  }
}
