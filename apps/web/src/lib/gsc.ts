import { JWT } from 'google-auth-library'
import {
  buildGscRequest,
  hasMoreRows,
  parseGscRows,
  type GscApiRow,
  type GscDailyRow,
  type GscDimensionMode,
  type GscSyncWindow,
} from '@indus/domain'

/**
 * Search Console client — the network half.
 *
 * WHY A SERVICE ACCOUNT RATHER THAN OAUTH
 *
 * The dashboard page originally sketched an OAuth flow: consent screen,
 * callback, refresh token stored on a `GscConnection` row. That is the right
 * shape when you are reading somebody else's property on their behalf. This is
 * an unattended nightly job reading our own property, and for that OAuth is
 * strictly worse: a refresh token is a stored credential that can be revoked,
 * expire, or silently fail at 04:00 with nobody watching.
 *
 * A service account has no token to store and nothing to renew. The property
 * owner adds the service account's email as a user in Search Console, and the
 * only secret in the system is the key in the environment.
 *
 * The credential is read from the environment and never leaves this module.
 * Nothing here returns it, logs it, or puts it in an error message.
 */

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

export type GscConfig = {
  /**
   * Property as Search Console identifies it. Either a URL-prefix property
   * ("https://indushydraulics.com/", trailing slash included) or a domain
   * property ("sc-domain:indushydraulics.com"). These are different properties
   * with different data — a mismatch here returns 403, not empty results.
   */
  siteUrl: string
  clientEmail: string
  privateKey: string
}

export type GscConfigResult = { ok: true; config: GscConfig } | { ok: false; reason: string }

/**
 * Read and validate configuration.
 *
 * Returns a typed result rather than throwing so the admin dashboard can show
 * what is missing without a try/catch, and so the reason never carries any
 * part of the key itself.
 */
export function readGscConfig(): GscConfigResult {
  const siteUrl = process.env.GSC_SITE_URL?.trim()
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON?.trim()

  if (!siteUrl) return { ok: false, reason: 'GSC_SITE_URL is not set' }
  if (!raw) return { ok: false, reason: 'GSC_SERVICE_ACCOUNT_JSON is not set' }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, reason: 'GSC_SERVICE_ACCOUNT_JSON is not valid JSON' }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, reason: 'GSC_SERVICE_ACCOUNT_JSON is not an object' }
  }

  const { client_email: clientEmail, private_key: privateKey } = parsed as Record<string, unknown>

  if (typeof clientEmail !== 'string' || !clientEmail) {
    return { ok: false, reason: 'service account JSON has no client_email' }
  }
  if (typeof privateKey !== 'string' || !privateKey) {
    return { ok: false, reason: 'service account JSON has no private_key' }
  }

  return {
    ok: true,
    config: {
      siteUrl,
      clientEmail,
      // Environment variables flatten newlines. A key with literal \n in it
      // fails to parse with an error that says nothing useful about why.
      privateKey: privateKey.replace(/\\n/g, '\n'),
    },
  }
}

/** The service account address to add as a user in Search Console. */
export function gscServiceAccountEmail(): string | null {
  const result = readGscConfig()
  return result.ok ? result.config.clientEmail : null
}

function authClient(config: GscConfig): JWT {
  return new JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: [SCOPE],
  })
}

export type GscFetchPageResult = { rows: GscDailyRow[]; hasMore: boolean }

/**
 * One page of `searchanalytics.query`.
 *
 * Errors are rethrown with the status and Google's message, because the two
 * failures that actually happen here are both diagnosable from it: 403 means
 * the service account has not been added to the property, and 400 usually
 * means `GSC_SITE_URL` does not match the property exactly.
 */
export async function fetchGscPage(
  config: GscConfig,
  window: GscSyncWindow,
  mode: GscDimensionMode,
  startRow: number
): Promise<GscFetchPageResult> {
  const client = authClient(config)
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    config.siteUrl
  )}/searchAnalytics/query`

  const response = await client.request<{ rows?: GscApiRow[] }>({
    url: endpoint,
    method: 'POST',
    data: buildGscRequest(window, mode, startRow),
  })

  const rows = response.data?.rows ?? []
  return { rows: parseGscRows(rows, mode), hasMore: hasMoreRows(rows.length) }
}

/**
 * Every property this service account can actually see.
 *
 * WHY THIS EXISTS
 *
 * `checkGscAccess` can only say that one specific `siteUrl` was rejected, and
 * Google returns 403 both for "you are not on this property" and for "that
 * property is not in your list" — which are different problems with different
 * fixes, and the two get confused every time. Setting this up, the failure
 * mode was exactly that: a 403 that read as a permissions problem could just
 * as easily have been `sc-domain:` against a URL-prefix-only account.
 *
 * `sites.list` answers it outright. It needs no permission beyond the one the
 * credential already has, and what it returns IS the set of valid values for
 * `GSC_SITE_URL` — so the fix stops being a guess and becomes a copy-paste.
 *
 * An empty list is itself the answer: the service account has been added to
 * nothing at all, whatever the Search Console UI appeared to accept.
 */
export async function listGscSites(): Promise<
  | { ok: true; sites: Array<{ siteUrl: string; permissionLevel: string }> }
  | { ok: false; detail: string }
> {
  const result = readGscConfig()
  if (!result.ok) return { ok: false, detail: result.reason }

  try {
    const client = authClient(result.config)
    const response = await client.request<{
      siteEntry?: Array<{ siteUrl?: string; permissionLevel?: string }>
    }>({ url: 'https://searchconsole.googleapis.com/webmasters/v3/sites', method: 'GET' })

    return {
      ok: true,
      sites: (response.data?.siteEntry ?? [])
        .filter((e): e is { siteUrl: string; permissionLevel?: string } => Boolean(e.siteUrl))
        .map((e) => ({ siteUrl: e.siteUrl, permissionLevel: e.permissionLevel ?? 'unknown' })),
    }
  } catch (err) {
    const status =
      (err as { status?: number })?.status ??
      (err as { response?: { status?: number } })?.response?.status
    return { ok: false, detail: `Could not list properties${status ? ` (${status})` : ''}.` }
  }
}

/**
 * Verify the credential and the property without writing anything.
 *
 * Used by the dashboard so somebody setting this up gets a straight yes or no
 * instead of having to wait for the nightly run to not happen.
 */
export async function checkGscAccess(): Promise<{ ok: boolean; detail: string }> {
  const result = readGscConfig()
  if (!result.ok) return { ok: false, detail: result.reason }

  try {
    const client = authClient(result.config)
    await client.request({
      url: `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
        result.config.siteUrl
      )}`,
      method: 'GET',
    })
    return { ok: true, detail: `Connected to ${result.config.siteUrl}` }
  } catch (err) {
    const status =
      (err as { status?: number; response?: { status?: number } })?.status ??
      (err as { response?: { status?: number } })?.response?.status
    if (status === 403) {
      return {
        ok: false,
        detail: `Authenticated, but ${result.config.clientEmail} is not a user on ${result.config.siteUrl}. Add it in Search Console under Settings → Users and permissions.`,
      }
    }
    if (status === 404) {
      return {
        ok: false,
        detail: `Property ${result.config.siteUrl} not found. A URL-prefix property needs the trailing slash; a domain property is written sc-domain:example.com.`,
      }
    }
    return {
      ok: false,
      detail: `Search Console rejected the request${status ? ` (${status})` : ''}.`,
    }
  }
}
