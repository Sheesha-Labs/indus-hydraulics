import { describe, expect, it, vi } from 'vitest'

vi.mock('../../lib/env', () => ({
  env: () => ({
    APP_ENV: 'test',
    GOOGLE_OPS_CLIENT_ID: 'client-id',
    GOOGLE_OPS_CLIENT_SECRET: 'client-secret',
    NEXT_PUBLIC_OPS_BASE_URL: 'https://ops.example.test/',
    GOOGLE_WORKSPACE_DOMAIN: 'example.test',
  }),
}))

const oauth = await import('./oauth')

function jwt(claims: Record<string, unknown>): string {
  const part = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${part({ alg: 'RS256' })}.${part(claims)}.sig`
}

describe('mailbox OAuth (flow B)', () => {
  it('asks for the minimum scopes, offline, with consent, PKCE and a login hint', () => {
    const config = oauth.oauthClientConfig()!
    expect(config.redirectUri).toBe('https://ops.example.test/api/gmail/oauth/callback')
    const url = new URL(
      oauth.authorizeUrl({
        config,
        endpoints: oauth.googleEndpoints(),
        state: 's',
        challenge: 'c',
        loginHint: 'purchase@example.test',
      })
    )
    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth')
    const scope = url.searchParams.get('scope')!.split(' ')
    expect(scope).toEqual([
      'openid',
      'email',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels',
      'https://www.googleapis.com/auth/gmail.send',
    ])
    expect(
      scope.some(
        (s) =>
          s === 'https://mail.google.com/' || s.includes('gmail.settings') || s.includes('drive')
      )
    ).toBe(false)
    expect(url.searchParams.get('access_type')).toBe('offline')
    expect(url.searchParams.get('prompt')).toBe('consent')
    expect(url.searchParams.get('include_granted_scopes')).toBe('false')
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(url.searchParams.get('login_hint')).toBe('purchase@example.test')
  })

  it('derives the S256 challenge from the verifier', async () => {
    const { verifier, challenge } = oauth.pkcePair()
    const { createHash } = await import('node:crypto')
    expect(createHash('sha256').update(verifier).digest('base64url')).toBe(challenge)
    expect(verifier.length).toBeGreaterThanOrEqual(43)
  })

  it('reads the granting account from the id token', () => {
    expect(
      oauth.idTokenClaims(
        jwt({ email: 'Sales@Example.test', hd: 'example.test', email_verified: true })
      )
    ).toEqual({
      email: 'sales@example.test',
      hd: 'example.test',
      emailVerified: true,
    })
    expect(oauth.idTokenClaims('garbage')).toEqual({})
    expect(oauth.idTokenClaims(undefined)).toEqual({})
  })

  it('a grant without gmail.send is drafts only; without gmail.modify nothing can be read', () => {
    const full = oauth.grantedCapabilities(
      'openid email https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.send'
    )
    expect(full).toMatchObject({ canRead: true, canSend: true, canLabel: true, canDraft: true })
    const partial = oauth.grantedCapabilities(
      'openid email https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.labels'
    )
    expect(partial).toMatchObject({ canRead: true, canSend: false, canDraft: true })
    expect(
      oauth.grantedCapabilities('openid email https://www.googleapis.com/auth/gmail.send')
    ).toMatchObject({
      canRead: false,
    })
  })

  it('maps token endpoint failures to OAuthHttpError with Google’s error code', async () => {
    const fetchImpl = (async () =>
      Response.json({ error: 'invalid_grant' }, { status: 400 })) as unknown as typeof fetch
    await expect(
      oauth.refreshAccessToken(
        {
          config: oauth.oauthClientConfig()!,
          endpoints: oauth.googleEndpoints(),
          refreshToken: 'r',
        },
        fetchImpl
      )
    ).rejects.toMatchObject({ name: 'OAuthHttpError', error: 'invalid_grant', status: 400 })
  })
})
