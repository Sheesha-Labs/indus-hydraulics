import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { canTransitionMailbox, type MailboxStatusValue } from '@indus/ops-core'
import { additionalData, openText, seal, sealedKeyId } from '../../lib/crypto'
import { MailboxUnavailableError } from './errors'
import {
  googleEndpoints,
  oauthClientConfig,
  OAuthHttpError,
  refreshAccessToken,
  type TokenResponse,
} from './oauth'

/**
 * Mailbox tokens (S04-T02, 08-map-integrations §1.3, ADR-06). Refresh and access tokens are sealed with the
 * rotating key ring (lib/crypto.ts, AES-256-GCM, key id inside the sealed value) and bound to their row and
 * kind by the additional data `gmail-refresh:<mailboxId>` / `gmail-access:<mailboxId>`, so a ciphertext cannot
 * be moved between mailboxes or fields. A database dump alone yields nothing.
 *
 * Tokens are never logged, never returned to the browser, never put in a prompt.
 */
export const REFRESH_AAD = (mailboxId: string) => additionalData('gmail-refresh', mailboxId)
export const ACCESS_AAD = (mailboxId: string) => additionalData('gmail-access', mailboxId)

/** Refresh when fewer than five minutes remain. */
const MIN_REMAINING_MS = 5 * 60 * 1000

export function sealToBytes(
  value: string,
  aad: string
): { bytes: Uint8Array<ArrayBuffer>; keyId: string | null } {
  const sealed = seal(value, aad)
  return { bytes: new Uint8Array(Buffer.from(sealed, 'utf8')), keyId: sealedKeyId(sealed) }
}

export function openFromBytes(bytes: Uint8Array, aad: string): string {
  return openText(Buffer.from(bytes).toString('utf8'), aad)
}

/** Columns to write after a successful exchange or refresh. */
export function tokenColumns(mailboxId: string, tokens: TokenResponse, now = Date.now()) {
  const access = sealToBytes(tokens.access_token, ACCESS_AAD(mailboxId))
  const columns: Prisma.MailboxUpdateInput = {
    accessTokenEnc: access.bytes,
    accessExpiresAt: new Date(now + (tokens.expires_in ?? 3600) * 1000),
    tokenKeyId: access.keyId,
    lastTokenError: null,
  }
  if (tokens.refresh_token) {
    columns.refreshTokenEnc = sealToBytes(tokens.refresh_token, REFRESH_AAD(mailboxId)).bytes
  }
  return columns
}

type Deps = {
  refresh?: typeof refreshAccessToken
  now?: () => number
  /** Called once when a refresh fails with invalid_grant (S04-T08: the locked "mailbox disconnected" notice). */
  onDisconnected?: (mailboxId: string) => Promise<void>
}

let disconnectedHook: ((mailboxId: string) => Promise<void>) | undefined

/** Tests replace what happens when a mailbox loses its token (default: notify/mailbox.ts, S04-T08). */
export function setDisconnectedHook(
  hook: ((mailboxId: string) => Promise<void>) | undefined
): void {
  disconnectedHook = hook
}

/** The locked "mailbox disconnected" notification; loaded lazily so tokens.ts stays below the notify layer. */
async function defaultDisconnectedHook(mailboxId: string): Promise<void> {
  const { notifyMailboxDisconnected } = await import('../notify/mailbox')
  await notifyMailboxDisconnected(mailboxId)
}

/**
 * Google refused the mailbox's access (a 401 after a fresh token, or invalid_grant): token_expired, the cached
 * access token dropped, and the locked notification raised once. Idempotent.
 */
export async function markTokenExpired(mailboxId: string, reason = 'unauthorized'): Promise<void> {
  const row = await opsDb.mailbox.findUnique({ where: { id: mailboxId }, select: { status: true } })
  if (!row) return
  const from = row.status as MailboxStatusValue
  await opsDb.mailbox.update({
    where: { id: mailboxId },
    data: {
      lastTokenError: reason,
      accessTokenEnc: null,
      accessExpiresAt: null,
      ...(canTransitionMailbox(from, 'token_expired')
        ? { status: 'token_expired', statusReason: 'Google no longer accepts the saved access' }
        : {}),
    },
  })
  await (disconnectedHook ?? defaultDisconnectedHook)(mailboxId).catch(() => undefined)
}

/**
 * A current access token for the mailbox. Refreshes under a transaction-scoped advisory lock per mailbox, so two
 * concurrent steps never both refresh. `invalid_grant` marks the mailbox token_expired and throws
 * MailboxUnavailableError (Inngest does not retry it).
 */
export async function getAccessToken(mailboxId: string, deps: Deps = {}): Promise<string> {
  const now = deps.now ?? Date.now
  const fast = await opsDb.mailbox.findUnique({
    where: { id: mailboxId },
    select: { status: true, accessTokenEnc: true, accessExpiresAt: true },
  })
  if (!fast) throw new MailboxUnavailableError(mailboxId, 'not_connected')
  if (
    fast.status === 'token_expired' ||
    fast.status === 'revoked' ||
    fast.status === 'disconnected'
  ) {
    throw new MailboxUnavailableError(
      mailboxId,
      fast.status === 'revoked' ? 'revoked' : 'token_expired'
    )
  }
  if (
    fast.accessTokenEnc &&
    fast.accessExpiresAt &&
    fast.accessExpiresAt.getTime() - now() > MIN_REMAINING_MS
  ) {
    return openFromBytes(fast.accessTokenEnc, ACCESS_AAD(mailboxId))
  }

  const config = oauthClientConfig()
  if (!config) throw new MailboxUnavailableError(mailboxId, 'not_configured')
  const refresh = deps.refresh ?? refreshAccessToken

  let expired = false
  const token = await opsDb.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`gmail-token:${mailboxId}`}))`
      const row = await tx.mailbox.findUnique({
        where: { id: mailboxId },
        select: {
          status: true,
          refreshTokenEnc: true,
          accessTokenEnc: true,
          accessExpiresAt: true,
        },
      })
      if (!row?.refreshTokenEnc) throw new MailboxUnavailableError(mailboxId, 'not_connected')
      // Another step refreshed while this one waited for the lock.
      if (
        row.accessTokenEnc &&
        row.accessExpiresAt &&
        row.accessExpiresAt.getTime() - now() > MIN_REMAINING_MS
      ) {
        return openFromBytes(row.accessTokenEnc, ACCESS_AAD(mailboxId))
      }
      try {
        const fresh = await refresh({
          config,
          endpoints: googleEndpoints(),
          refreshToken: openFromBytes(row.refreshTokenEnc, REFRESH_AAD(mailboxId)),
        })
        await tx.mailbox.update({
          where: { id: mailboxId },
          data: tokenColumns(mailboxId, fresh, now()),
        })
        return fresh.access_token
      } catch (error) {
        if (
          error instanceof OAuthHttpError &&
          (error.error === 'invalid_grant' || error.status === 401)
        ) {
          const from = row.status as MailboxStatusValue
          await tx.mailbox.update({
            where: { id: mailboxId },
            data: {
              lastTokenError: 'invalid_grant',
              accessTokenEnc: null,
              accessExpiresAt: null,
              ...(canTransitionMailbox(from, 'token_expired')
                ? {
                    status: 'token_expired',
                    statusReason: 'Google no longer accepts the saved access',
                  }
                : {}),
            },
          })
          expired = true
          return null
        }
        await tx.mailbox.update({
          where: { id: mailboxId },
          data: {
            lastTokenError:
              error instanceof OAuthHttpError ? (error.error ?? `http_${error.status}`) : 'network',
          },
        })
        throw error
      }
    },
    { timeout: 25_000 }
  )
  if (expired || token === null) {
    const hook = deps.onDisconnected ?? disconnectedHook ?? defaultDisconnectedHook
    await hook(mailboxId).catch(() => undefined)
    throw new MailboxUnavailableError(mailboxId, 'token_expired')
  }
  return token
}
