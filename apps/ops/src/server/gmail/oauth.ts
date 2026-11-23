import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { env } from '../../lib/env'

/**
 * Mailbox OAuth, flow B of 08-map-integrations §1.2 (ADR-06): custom route handlers, not Auth.js. Per-mailbox
 * consent with an offline refresh token, PKCE (S256), a signed single-use state, `prompt=consent` so a
 * reconnect always yields a refresh token, and `login_hint` for the address chosen on step 1.
 *
 * Scopes are the minimum: gmail.modify (read, label, send; no permanent delete), gmail.labels and gmail.send
 * listed so the consent screen names them, and `openid email` to learn which account granted consent. Never
 * https://mail.google.com/, gmail.settings.*, Drive, Calendar or Contacts.
 *
 * Outside production, OPS_E2E_GOOGLE_ISSUER points every endpoint at the local mock issuer (S03-T07) so e2e
 * runs the real callback code.
 */
export const GMAIL_SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.send',
] as const

const SEND_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
]
const READ_SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
]

export type GoogleEndpoints = { authorize: string; token: string; revoke: string }

export function googleEndpoints(): GoogleEndpoints {
  const e = env()
  const issuer =
    e.APP_ENV !== 'production' ? e.OPS_E2E_GOOGLE_ISSUER?.replace(/\/$/, '') : undefined
  if (issuer) {
    return {
      authorize: `${issuer}/authorize`,
      token: `${issuer}/token`,
      revoke: `${issuer}/revoke`,
    }
  }
  return {
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    revoke: 'https://oauth2.googleapis.com/revoke',
  }
}

export type OAuthClientConfig = { clientId: string; clientSecret: string; redirectUri: string }

/** The OAuth client, or null when Google is not configured (connect then refuses with a plain sentence). */
export function oauthClientConfig(): OAuthClientConfig | null {
  const e = env()
  const mock = e.APP_ENV !== 'production' && e.OPS_E2E_GOOGLE_ISSUER
  const clientId = mock ? 'ops-e2e' : e.GOOGLE_OPS_CLIENT_ID
  const clientSecret = mock ? 'ops-e2e-secret' : e.GOOGLE_OPS_CLIENT_SECRET
  const base = e.NEXT_PUBLIC_OPS_BASE_URL?.replace(/\/$/, '')
  if (!clientId || !clientSecret || !base) return null
  return { clientId, clientSecret, redirectUri: `${base}/api/gmail/oauth/callback` }
}

/** PKCE: a 32-byte verifier and its S256 challenge. */
export function pkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function authorizeUrl(input: {
  config: OAuthClientConfig
  endpoints: GoogleEndpoints
  state: string
  challenge: string
  loginHint: string
}): string {
  const url = new URL(input.endpoints.authorize)
  const params: Record<string, string> = {
    client_id: input.config.clientId,
    redirect_uri: input.config.redirectUri,
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'false',
    login_hint: input.loginHint,
    code_challenge: input.challenge,
    code_challenge_method: 'S256',
    state: input.state,
  }
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return url.toString()
}

export type TokenResponse = {
  access_token: string
  expires_in?: number
  refresh_token?: string
  scope?: string
  id_token?: string
  token_type?: string
}

export class OAuthHttpError extends Error {
  constructor(
    readonly status: number,
    readonly error: string | undefined
  ) {
    super(`Google OAuth error ${status}${error ? ` (${error})` : ''}`)
    this.name = 'OAuthHttpError'
  }
}

type Fetch = typeof fetch

async function postForm(
  url: string,
  body: Record<string, string>,
  fetchImpl: Fetch
): Promise<TokenResponse> {
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
    signal: AbortSignal.timeout(15_000),
  })
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok)
    throw new OAuthHttpError(res.status, typeof json.error === 'string' ? json.error : undefined)
  if (typeof json.access_token !== 'string') throw new OAuthHttpError(res.status, 'no_access_token')
  return json as unknown as TokenResponse
}

export function exchangeCode(
  input: { config: OAuthClientConfig; endpoints: GoogleEndpoints; code: string; verifier: string },
  fetchImpl: Fetch = fetch
): Promise<TokenResponse> {
  return postForm(
    input.endpoints.token,
    {
      grant_type: 'authorization_code',
      code: input.code,
      code_verifier: input.verifier,
      client_id: input.config.clientId,
      client_secret: input.config.clientSecret,
      redirect_uri: input.config.redirectUri,
    },
    fetchImpl
  )
}

export function refreshAccessToken(
  input: { config: OAuthClientConfig; endpoints: GoogleEndpoints; refreshToken: string },
  fetchImpl: Fetch = fetch
): Promise<TokenResponse> {
  return postForm(
    input.endpoints.token,
    {
      grant_type: 'refresh_token',
      refresh_token: input.refreshToken,
      client_id: input.config.clientId,
      client_secret: input.config.clientSecret,
    },
    fetchImpl
  )
}

/** Revoke a token at Google. Best effort: a failure is reported, never thrown at the person. */
export async function revokeToken(
  input: { endpoints: GoogleEndpoints; token: string },
  fetchImpl: Fetch = fetch
): Promise<boolean> {
  try {
    const res = await fetchImpl(input.endpoints.revoke, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: input.token }).toString(),
      signal: AbortSignal.timeout(10_000),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * The claims of an ID token received directly from Google's token endpoint over TLS. Per OIDC Core §3.1.3.7
 * the TLS server validation stands in for signature checking when the token comes straight from the token
 * endpoint, so only the payload is read here.
 */
export function idTokenClaims(idToken: string | undefined): {
  email?: string
  hd?: string
  emailVerified?: boolean
} {
  if (!idToken) return {}
  const payload = idToken.split('.')[1]
  if (!payload) return {}
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<
      string,
      unknown
    >
    return {
      ...(typeof claims.email === 'string' ? { email: claims.email.toLowerCase() } : {}),
      ...(typeof claims.hd === 'string' ? { hd: claims.hd.toLowerCase() } : {}),
      ...(typeof claims.email_verified === 'boolean'
        ? { emailVerified: claims.email_verified }
        : {}),
    }
  } catch {
    return {}
  }
}

/** What the grant allows, from the token response's `scope` (space separated). */
export function grantedCapabilities(scope: string | undefined): {
  scopes: string[]
  canRead: boolean
  canSend: boolean
  canLabel: boolean
  canDraft: boolean
} {
  const scopes = (scope ?? '').split(/\s+/).filter(Boolean)
  const has = (list: string[]) => list.some((s) => scopes.includes(s))
  const canRead = has(READ_SCOPES)
  return {
    scopes,
    canRead,
    canSend: has(SEND_SCOPES) && scopes.includes('https://www.googleapis.com/auth/gmail.send'),
    canLabel: has([
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels',
    ]),
    canDraft: canRead,
  }
}
