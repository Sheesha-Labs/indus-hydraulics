import Google from 'next-auth/providers/google'
import { passwordProvider, type AuthorizePassword } from './password-provider'
import { testAuthProvider } from './test-auth-provider'

type ProviderEnv = {
  APP_ENV?: string | undefined
  OPS_E2E_AUTH?: string | undefined
  GOOGLE_OPS_CLIENT_ID?: string | undefined
  GOOGLE_OPS_CLIENT_SECRET?: string | undefined
  GOOGLE_WORKSPACE_DOMAIN?: string | undefined
  OPS_E2E_GOOGLE_ISSUER?: string | undefined
}

/** Whether the test-only provider may be registered. Never in production. */
export function testProviderAllowed(env: ProviderEnv): boolean {
  return env.APP_ENV !== 'production' && env.OPS_E2E_AUTH === '1'
}

/**
 * The e2e stand-in for Google: a local OIDC issuer (S03-T07). Never in production, whatever the env says.
 */
export function mockGoogleIssuer(env: ProviderEnv): string | null {
  if (env.APP_ENV === 'production' || !env.OPS_E2E_GOOGLE_ISSUER) return null
  return env.OPS_E2E_GOOGLE_ISSUER.replace(/\/$/, '')
}

/**
 * Google (the main way in), password + authenticator (the fallback, every environment, S03-T01) and,
 * outside production with OPS_E2E_AUTH=1 only, the test provider.
 */
export function buildProviders(
  env: ProviderEnv,
  findActiveUserByEmail: Parameters<typeof testAuthProvider>[0],
  authorizePassword: AuthorizePassword
) {
  const issuer = mockGoogleIssuer(env)
  const providers = [
    Google({
      clientId: issuer ? 'ops-e2e' : (env.GOOGLE_OPS_CLIENT_ID ?? ''),
      clientSecret: issuer ? 'ops-e2e-secret' : (env.GOOGLE_OPS_CLIENT_SECRET ?? ''),
      // Same provider id ('google') and the same signIn callback: only the issuer differs in e2e.
      ...(issuer ? { issuer } : {}),
      authorization: {
        params: {
          scope: 'openid email profile',
          // A hint for the account picker only; the signIn callback enforces the domain.
          hd: env.GOOGLE_WORKSPACE_DOMAIN ?? 'indushydraulics.me',
          prompt: 'select_account',
        },
      },
    }),
    passwordProvider(authorizePassword),
  ]
  if (testProviderAllowed(env)) return [...providers, testAuthProvider(findActiveUserByEmail)]
  return providers
}
