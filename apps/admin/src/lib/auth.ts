import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { cache } from 'react'
import { z } from 'zod'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }
}

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const nextAuth = NextAuth({
  trustHost: true,
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

        const valid = await verify(parsed.data.password, staffUser.passwordHash ?? '')
        if (!valid) return null

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
    maxAge: 12 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
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
