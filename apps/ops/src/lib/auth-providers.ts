import Google from 'next-auth/providers/google'
import { testAuthProvider } from './test-auth-provider'

type ProviderEnv = {
  APP_ENV?: string | undefined
  OPS_E2E_AUTH?: string | undefined
  GOOGLE_OPS_CLIENT_ID?: string | undefined
  GOOGLE_OPS_CLIENT_SECRET?: string | undefined
  GOOGLE_WORKSPACE_DOMAIN?: string | undefined
}

/** Whether the test-only provider may be registered. Never in production. */
export function testProviderAllowed(env: ProviderEnv): boolean {
  return env.APP_ENV !== 'production' && env.OPS_E2E_AUTH === '1'
}

export function buildProviders(
  env: ProviderEnv,
  findActiveUserByEmail: Parameters<typeof testAuthProvider>[0]
) {
  const providers = [
    Google({
      clientId: env.GOOGLE_OPS_CLIENT_ID ?? '',
      clientSecret: env.GOOGLE_OPS_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope: 'openid email profile',
          // A hint for the account picker only; the signIn callback enforces the domain.
          hd: env.GOOGLE_WORKSPACE_DOMAIN ?? 'indushydraulics.me',
          prompt: 'select_account',
        },
      },
    }),
  ]
  if (testProviderAllowed(env)) return [...providers, testAuthProvider(findActiveUserByEmail)]
  return providers
}
