import { test as base, expect, type APIRequestContext } from '@playwright/test'

/**
 * `signedInAs('owner' | 'helper')`: a session through the test provider (`ops-test`, OPS_E2E_AUTH=1, never in
 * production) for the demo users `packages/ops-db/src/seed.ts` creates with SEED_DEMO=1. A failed sign-in
 * fails the test: a signed-in suite that skips itself proves nothing.
 */
export const DEMO_EMAILS = {
  owner: process.env.OPS_E2E_OWNER_EMAIL ?? 'owner@example.test',
  helper: process.env.OPS_E2E_HELPER_EMAIL ?? 'helper@example.test',
} as const

export type DemoUser = keyof typeof DEMO_EMAILS

export async function signInByEmail(request: APIRequestContext, email: string) {
  const { csrfToken } = (await (await request.get('/api/auth/csrf')).json()) as {
    csrfToken: string
  }
  return request.post('/api/auth/callback/ops-test', {
    form: { csrfToken, email },
    maxRedirects: 0,
  })
}

export const test = base.extend<{ signedInAs: (who: DemoUser) => Promise<void> }>({
  // Playwright's fixture callback, named `provide` so the React hooks lint does not read it as `use()`.
  signedInAs: async ({ page }, provide) => {
    await provide(async (who) => {
      const res = await signInByEmail(page.context().request, DEMO_EMAILS[who])
      expect(res.status(), `sign-in as ${who}`).toBe(302)
      expect(res.headers()['location'] ?? '', `sign-in as ${who}`).not.toContain('error=')
    })
  },
})

export { expect }
