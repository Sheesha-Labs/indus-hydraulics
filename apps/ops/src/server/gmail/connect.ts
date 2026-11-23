import 'server-only'
import { randomBytes } from 'node:crypto'
import { canTransitionMailbox, type MailboxStatusValue } from '@indus/ops-core'
import { opsDb, type $Enums, type Prisma } from '@indus/ops-db'
import { can, type OpsUser } from '../../lib/access'
import { additionalData, openText, seal, sha256Hex, signState, verifyState } from '../../lib/crypto'
import { env } from '../../lib/env'
import { emitEvent } from '../../inngest/emit'
import {
  authorizeUrl,
  exchangeCode,
  googleEndpoints,
  grantedCapabilities,
  idTokenClaims,
  oauthClientConfig,
  pkcePair,
  revokeToken,
  type TokenResponse,
} from './oauth'
import { gmailFor } from './mailbox-client'
import { detectSendAs } from './send-as'
import { tokenColumns } from './tokens'

/**
 * The mailbox connect flow (S04-T02, board 86 / board 80, ADR-06, 08-map-integrations §1.2 flow B).
 *
 *   startConnect   → a single-use oauth_state row (SHA-256 of a 32-byte nonce, sealed PKCE verifier, 10 min)
 *                    and the Google URL with a signed state { n, u, r }.
 *   finishConnect  → verify the signature and the session user, claim the row once, exchange the code with the
 *                    verifier, read the granted account and scopes, and store sealed tokens. Outcomes are
 *                    states on board 86, not errors: wrong account, drafts only, blocked by admin.
 *
 * Nothing here talks to Gmail itself: labels, send-as, the watch and the backfill run after the event
 * `ops/mailbox.connected` (inngest/mailbox-connected.ts), so the callback stays fast.
 */
export type MailboxRole = $Enums.MailboxRole
export type ReturnTo = 'settings' | 'setup'

export const STATE_TTL_MS = 10 * 60 * 1000

export type StartResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'not_configured' | 'not_allowed' | 'not_workspace' }

/** Who may connect which role: the Owner any; the Helper only the Supplier mailbox, with canSendSupplierMail. */
export function mayConnect(user: OpsUser, role: MailboxRole): boolean {
  if (user.role === 'owner') return true
  return role === 'supplier' && can(user, 'send_supplier_mail')
}

export function workspaceDomain(): string {
  return env().GOOGLE_WORKSPACE_DOMAIN.toLowerCase()
}

/** Client and Supplier mailboxes must be on the Workspace domain; Read-only and Personal may be any account. */
export function roleNeedsWorkspace(role: MailboxRole): boolean {
  return role === 'client' || role === 'supplier'
}

export async function startConnect(input: {
  user: OpsUser
  role: MailboxRole
  address: string
  returnTo: ReturnTo
  backfillMonths?: number | null
}): Promise<StartResult> {
  if (!mayConnect(input.user, input.role)) return { ok: false, reason: 'not_allowed' }
  const address = input.address.trim().toLowerCase()
  if (roleNeedsWorkspace(input.role) && !address.endsWith(`@${workspaceDomain()}`)) {
    return { ok: false, reason: 'not_workspace' }
  }
  const config = oauthClientConfig()
  if (!config || !env().OPS_STATE_SECRET) return { ok: false, reason: 'not_configured' }

  const nonce = randomBytes(32).toString('base64url')
  const nonceHash = sha256Hex(nonce)
  const { verifier, challenge } = pkcePair()
  await opsDb.oauthState.create({
    data: {
      nonceHash,
      userId: input.user.id,
      role: input.role,
      address,
      codeVerifierEnc: seal(verifier, additionalData('oauth-pkce', nonceHash)),
      returnTo: input.returnTo,
      backfillMonths: input.backfillMonths ?? null,
      expiresAt: new Date(Date.now() + STATE_TTL_MS),
    },
  })
  const state = signState({ n: nonce, u: input.user.id, r: input.role })
  return {
    ok: true,
    url: authorizeUrl({
      config,
      endpoints: googleEndpoints(),
      state,
      challenge,
      loginHint: address,
    }),
  }
}

export type ConnectOutcome =
  | 'connected'
  | 'drafts_only'
  | 'wrong_account'
  | 'blocked_by_admin'
  | 'denied'
  | 'expired'
  | 'not_configured'
  | 'error'

export type FinishResult = {
  outcome: ConnectOutcome
  returnTo: ReturnTo
  role: MailboxRole | null
  mailboxId: string | null
}

type Deps = {
  exchange?: typeof exchangeCode
  revoke?: typeof revokeToken
  emit?: typeof emitEvent
  sendAs?: (mailboxId: string) => Promise<void>
}

/** Read send-as aliases and the default signature into the mailbox row. */
export async function refreshSendAs(mailboxId: string): Promise<void> {
  const summary = await detectSendAs(gmailFor(mailboxId, 'live'))
  await opsDb.mailbox.update({
    where: { id: mailboxId },
    data: {
      sendAsAliases: summary.aliases,
      ...(summary.signatureHtml ? { signatureHtml: summary.signatureHtml } : {}),
    },
  })
}

const ADMIN_BLOCK_ERRORS = new Set(['admin_policy_enforced', 'org_internal', 'unauthorized_client'])

/** The callback's work, given the query parameters and the signed-in user (null when signed out). */
export async function finishConnect(
  params: { code?: string | null; state?: string | null; error?: string | null },
  sessionUserId: string | null,
  deps: Deps = {}
): Promise<FinishResult> {
  const fail = (
    outcome: ConnectOutcome,
    returnTo: ReturnTo = 'settings',
    role: MailboxRole | null = null
  ) => ({
    outcome,
    returnTo,
    role,
    mailboxId: null,
  })

  const payload = params.state
    ? verifyState<{ n?: unknown; u?: unknown; r?: unknown }>(params.state)
    : null
  if (!payload || typeof payload.n !== 'string' || typeof payload.u !== 'string')
    return fail('expired')
  if (!sessionUserId || payload.u !== sessionUserId) return fail('expired')

  // Claim the state once: a replayed, expired or foreign state claims nothing.
  const nonceHash = sha256Hex(payload.n)
  const claimed = await opsDb.oauthState.updateManyAndReturn({
    where: { nonceHash, userId: sessionUserId, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  })
  const row = claimed[0]
  if (!row) return fail('expired')
  const returnTo = (row.returnTo === 'setup' ? 'setup' : 'settings') as ReturnTo
  const role = row.role

  if (params.error) {
    if (ADMIN_BLOCK_ERRORS.has(params.error)) return fail('blocked_by_admin', returnTo, role)
    return fail('denied', returnTo, role)
  }
  if (!params.code) return fail('error', returnTo, role)

  const config = oauthClientConfig()
  if (!config) return fail('not_configured', returnTo, role)
  const endpoints = googleEndpoints()
  let tokens: TokenResponse
  try {
    tokens = await (deps.exchange ?? exchangeCode)({
      config,
      endpoints,
      code: params.code,
      verifier: openText(row.codeVerifierEnc, additionalData('oauth-pkce', nonceHash)),
    })
  } catch (error) {
    const code = (error as { error?: string }).error
    if (code && ADMIN_BLOCK_ERRORS.has(code)) return fail('blocked_by_admin', returnTo, role)
    return fail('error', returnTo, role)
  }

  const claims = idTokenClaims(tokens.id_token)
  const domain = workspaceDomain()
  const wrongAddress = !claims.email || claims.email !== row.address
  const wrongDomain = roleNeedsWorkspace(role) && claims.hd !== domain
  if (wrongAddress || wrongDomain) {
    // Store nothing, and give the fresh grant back.
    const revoke = deps.revoke ?? revokeToken
    await revoke({ endpoints, token: tokens.refresh_token ?? tokens.access_token })
    return fail('wrong_account', returnTo, role)
  }
  if (!tokens.refresh_token) return fail('error', returnTo, role)

  const caps = grantedCapabilities(tokens.scope)
  if (!caps.canRead) {
    const revoke = deps.revoke ?? revokeToken
    await revoke({ endpoints, token: tokens.refresh_token })
    return fail('denied', returnTo, role)
  }

  const mailboxId = await storeConnection({
    address: row.address,
    role,
    userId: sessionUserId,
    tokens,
    caps,
    grantedEmail: claims.email ?? row.address,
    backfillMonths: row.backfillMonths,
  })
  // Board 86 step 4 shows the signature and aliases at once: one cheap Gmail call here, best effort (the
  // ops/mailbox.connected job repeats it).
  await (deps.sendAs ?? refreshSendAs)(mailboxId).catch(() => undefined)
  await (deps.emit ?? emitEvent)({
    name: 'ops/mailbox.connected',
    id: `mailbox-connected:${mailboxId}:${nonceHash.slice(0, 16)}`,
    data: { mailboxId },
  })
  return { outcome: caps.canSend ? 'connected' : 'drafts_only', returnTo, role, mailboxId }
}

/** Create or reconnect the mailbox row and store the sealed tokens. Keeps historyId on reconnect. */
async function storeConnection(input: {
  address: string
  role: MailboxRole
  userId: string
  tokens: TokenResponse
  caps: ReturnType<typeof grantedCapabilities>
  grantedEmail: string
  backfillMonths: number | null
}): Promise<string> {
  return opsDb.$transaction(async (tx) => {
    const existing = await tx.mailbox.findUnique({
      where: { address: input.address },
      select: { id: true, status: true },
    })
    const base = {
      role: input.role,
      scopes: input.caps.scopes,
      canRead: input.caps.canRead,
      canDraft: input.caps.canDraft,
      canSend: input.caps.canSend,
      canLabel: input.caps.canLabel,
      grantedEmail: input.grantedEmail,
      connectedAt: new Date(),
      connectedById: input.userId,
      disconnectedAt: null,
      lastTokenError: null,
      statusReason: input.caps.canSend ? null : 'Drafts only · can’t send',
    }
    let id: string
    if (existing) {
      id = existing.id
      const from = existing.status as MailboxStatusValue
      await tx.mailbox.update({
        where: { id },
        data: {
          ...base,
          ...(from !== 'connecting' && canTransitionMailbox(from, 'connecting')
            ? { status: 'connecting' }
            : {}),
        },
      })
    } else {
      const created = await tx.mailbox.create({
        data: {
          ...base,
          address: input.address,
          displayName: input.address.split('@')[0] ?? input.address,
          ownerUserId: input.userId,
          status: 'connecting',
          dailySendCap: input.role === 'supplier' ? 80 : 40,
          ...(input.backfillMonths != null ? { backfillMonths: input.backfillMonths } : {}),
        },
        select: { id: true },
      })
      id = created.id
    }
    await tx.mailbox.update({ where: { id }, data: tokenColumns(id, input.tokens) })
    await tx.mailboxSyncState.upsert({
      where: { mailboxId: id },
      create: { mailboxId: id },
      update: {},
    })
    return id
  })
}

/**
 * Board 86 step 4 → 5: keep the send-as aliases ticked, store the past-mail range, and ask for the backfill.
 * Runs in the action's transaction (`tx`); the backfill event is sent after the writes.
 */
export async function confirmConnectedMailbox(
  input: { user: OpsUser; mailboxId: string; backfillMonths: 0 | 12 | 24; aliases: string[] },
  tx: Prisma.TransactionClient
): Promise<{ backfillRequested: boolean }> {
  const mailbox = await tx.mailbox.findUnique({
    where: { id: input.mailboxId },
    select: { role: true, address: true, sendAsAliases: true, status: true },
  })
  if (!mailbox || !mayConnect(input.user, mailbox.role)) {
    const { SafeError } = await import('../../lib/safe-message')
    throw new SafeError('That mailbox is not one you can set up.')
  }
  const known = new Set(mailbox.sendAsAliases.map((a) => a.toLowerCase()))
  const chosen = input.aliases.map((a) => a.toLowerCase()).filter((a) => known.has(a))
  // The mailbox's own address always stays: it is the account itself.
  const aliases = [...new Set([mailbox.address, ...chosen])]
  await tx.mailbox.update({
    where: { id: input.mailboxId },
    data: { sendAsAliases: aliases, backfillMonths: input.backfillMonths },
  })
  if (input.backfillMonths === 0) return { backfillRequested: false }
  const sent = await emitEvent({
    name: 'ops/gmail.backfill.requested',
    id: `backfill:${input.mailboxId}:${input.backfillMonths}`,
    data: { mailboxId: input.mailboxId, months: input.backfillMonths },
  })
  return { backfillRequested: sent }
}

/** Client and Supplier mailboxes that are connected (setup step 2 is done once one is). */
export async function countConnectedWorkMailboxes(): Promise<number> {
  return opsDb.mailbox.count({
    where: {
      role: { in: ['client', 'supplier'] },
      status: { notIn: ['disconnected', 'token_expired', 'revoked'] },
      refreshTokenEnc: { not: null },
    },
  })
}

/** Where the callback sends the person: step 4 of the modal on Mailboxes, or the setup step. */
export function callbackRedirect(result: FinishResult): string {
  const path = result.returnTo === 'setup' ? '/setup/mailboxes' : '/settings/mailboxes'
  const q = new URLSearchParams({
    connect: result.role ?? 'unknown',
    step: '4',
    outcome: result.outcome,
  })
  if (result.mailboxId) q.set('mailbox', result.mailboxId)
  return `${path}?${q.toString()}`
}
