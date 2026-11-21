import Credentials from 'next-auth/providers/credentials'

/**
 * Test-only sign-in: signs in a seeded, active user by email with no password,
 * for the e2e and visual suites. Registered only outside production with
 * OPS_E2E_AUTH=1 (auth-providers.ts), and env.ts refuses OPS_E2E_AUTH in
 * production, so it cannot exist there.
 */
export function testAuthProvider(
  findActiveUserByEmail: (
    email: string
  ) => Promise<{ id: string; email: string; name: string } | null>
) {
  return Credentials({
    id: 'ops-test',
    name: 'Test sign-in',
    credentials: { email: { label: 'Email', type: 'email' } },
    async authorize(credentials) {
      const email =
        typeof credentials?.email === 'string' ? credentials.email.trim().toLowerCase() : ''
      if (!email) return null
      return findActiveUserByEmail(email)
    },
  })
}
