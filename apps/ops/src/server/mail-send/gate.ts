import 'server-only'
import {
  aliasAllowed,
  allRecipients,
  audienceForKind,
  capWindow,
  isPricedDocument,
  isPricedKind,
  mailboxCanSend,
  overCap,
} from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { env, type OpsEnv } from '../../lib/env'
import { isAssistantPaused } from '../assistant/pause'
import { raiseNotification } from '../notify/raise'
import { getSetting } from '../settings/get'
import { getStorage } from '../storage/storage'
import { gateHooks } from './hooks'
import { capDay, sentInCapDay } from './slot'
import { moveOutbound, PENDING } from './status'

/**
 * The send gate (S04-T06, ADR-07, 08-map-integrations §1.9), re-run immediately before the claim. In order:
 *
 *   1  status      only scheduled / held / waiting_for_mailbox rows go on      → stop 'not_pending'
 *   2  channel     Gmail rows only (system mail is sent by server/mail)        → stop 'wrong_channel'
 *   3  pause       "Pause everything" holds the send (C22)                     → held 'pause', wait ops/assistant.resumed
 *   4  mailbox     the row's own mailbox must be live with send; never another → waiting_for_mailbox, wait ops/mailbox.reconnected
 *   5  mailbox     paused by the Owner (board 89)                              → held 'pause', wait ops/mailbox.resumed
 *   6  alias       From must still be a verified send-as alias                 → failed 'alias_not_verified'
 *   7  cap         the mailbox's daily cap (resets 04:00 GST)                  → held 'cap', wait until the reset
 *   8  basis       S06 hook: the approval's basis_hash is still current        → superseded 'stale'
 *   9  person      a priced client email needs a PERSON's approval (G2)        → failed 'needs_person'
 *  10  identifier  supplier-bound rows need a passing identifier check (S12)   → failed 'identifier_check'
 *  11  extra       registered checks (guardrails, credit hold)                 → failed '<reason>'
 *  12  files       every attachment's stored file is present                   → failed 'attachment_missing'
 *  13  preview     outside production, any recipient not on OPS_SEND_ALLOWLIST → suppressed_preview, nothing sent
 *
 * A `stop` writes its terminal status here, so no row is left waiting with no run to finish it. A `go` returns a
 * held row to `scheduled` (the claim takes only `scheduled`).
 */
export type GateResult =
  | { kind: 'go' }
  | {
      kind: 'wait'
      reason: 'pause' | 'mailbox' | 'mailbox_paused' | 'cap'
      resumeEvent?: `ops/${string}`
      match?: string
      until?: string
    }
  | { kind: 'stop'; reason: string }

type Deps = {
  now?: () => Date
  env?: Pick<OpsEnv, 'APP_ENV' | 'OPS_SEND_ALLOWLIST'>
  /** Tests inject the pause state instead of writing the shared settings row. */
  isPaused?: () => Promise<boolean>
}

const PRICED_APPROVAL_STATES = ['approved', 'edited_approved'] as const

async function stop(
  outboundId: string,
  to: 'failed' | 'superseded' | 'suppressed_preview',
  reason: string
) {
  await moveOutbound(outboundId, PENDING, to, { failureReason: reason, holdReason: null })
  return { kind: 'stop', reason } as const
}

/** A person (not the Assistant, not a system actor) approved this priced email. */
async function approvedByPerson(row: {
  approvedById: string | null
  actionId: string | null
  createdById: string | null
}): Promise<boolean> {
  if (!row.approvedById) return false
  const user = await opsDb.user.findUnique({
    where: { id: row.approvedById },
    select: { status: true },
  })
  if (user?.status !== 'active') return false
  if (row.actionId) {
    const decision = await opsDb.assistantActionEvent.findFirst({
      where: {
        actionId: row.actionId,
        actorKind: 'user',
        actorId: row.approvedById,
        toState: { in: [...PRICED_APPROVAL_STATES] },
      },
      select: { id: true },
    })
    return !!decision
  }
  // Composed by hand: the person who wrote it is the person who approved it.
  return row.createdById === row.approvedById
}

async function filesPresent(files: Array<{ bucket: string; path: string; purgedAt: Date | null }>) {
  const storage = getStorage()
  for (const f of files) {
    if (f.purgedAt) return false
    const stream = await storage.openRead(
      f.bucket as Parameters<typeof storage.openRead>[0],
      f.path
    )
    if (!stream) return false
    await stream.cancel().catch(() => undefined)
  }
  return true
}

export async function sendGate(outboundId: string, deps: Deps = {}): Promise<GateResult> {
  const now = (deps.now ?? (() => new Date()))()
  const e = deps.env ?? env()
  const row = await opsDb.outboundEmail.findUnique({
    where: { id: outboundId },
    select: {
      id: true,
      channel: true,
      kind: true,
      status: true,
      mailboxId: true,
      fromAlias: true,
      toAddresses: true,
      ccAddresses: true,
      bccAddresses: true,
      approvedById: true,
      actionId: true,
      createdById: true,
      basisHash: true,
      identifierCheck: true,
      mailbox: {
        select: {
          id: true,
          address: true,
          status: true,
          canSend: true,
          pausedAt: true,
          sendAsAliases: true,
          dailySendCap: true,
          syncState: { select: { sentToday: true, sentTodayDate: true } },
        },
      },
      attachments: {
        select: {
          documentId: true,
          file: { select: { bucket: true, path: true, purgedAt: true } },
        },
      },
    },
  })
  if (!row) return { kind: 'stop', reason: 'not_found' }

  // 1–2
  if (!PENDING.includes(row.status)) return { kind: 'stop', reason: 'not_pending' }
  if (row.channel !== 'gmail' || !row.mailbox) return stop(outboundId, 'failed', 'wrong_channel')
  const mailbox = row.mailbox

  // 3 Pause everything (C22): held, then re-gated on resume.
  if (await (deps.isPaused ?? isAssistantPaused)()) {
    // A row already waiting for its mailbox keeps waiting (waiting → held is not a forward move).
    if (row.status === 'scheduled') {
      await moveOutbound(outboundId, ['scheduled'], 'held', { holdReason: 'pause' })
    }
    return { kind: 'wait', reason: 'pause', resumeEvent: 'ops/assistant.resumed' }
  }

  // 4 The row's own mailbox, never another (board 87 "Waiting for sales@").
  if (!mailboxCanSend(mailbox.status) || !mailbox.canSend) {
    if (row.status !== 'waiting_for_mailbox') {
      await moveOutbound(outboundId, ['scheduled', 'held'], 'waiting_for_mailbox', {
        holdReason: 'mailbox',
      })
    }
    return {
      kind: 'wait',
      reason: 'mailbox',
      resumeEvent: 'ops/mailbox.reconnected',
      match: 'data.mailboxId',
    }
  }

  // 5 Mailbox paused by the Owner.
  if (mailbox.pausedAt) {
    // A row already waiting for its mailbox keeps waiting (waiting → held is not a forward move).
    if (row.status === 'scheduled') {
      await moveOutbound(outboundId, ['scheduled'], 'held', { holdReason: 'pause' })
    }
    return {
      kind: 'wait',
      reason: 'mailbox_paused',
      resumeEvent: 'ops/mailbox.resumed',
      match: 'data.mailboxId',
    }
  }

  // 6 From alias, re-checked at send time.
  const alias = row.fromAlias ?? mailbox.address
  if (!aliasAllowed(alias, [mailbox.address, ...mailbox.sendAsAliases])) {
    return stop(outboundId, 'failed', 'alias_not_verified')
  }

  // 7 Daily cap.
  const { capReset } = await getSetting('send.timing')
  if (overCap(sentInCapDay(mailbox.syncState, now, capReset), mailbox.dailySendCap)) {
    const until = capWindow(now, capReset).next
    if (row.status === 'scheduled') {
      await moveOutbound(outboundId, ['scheduled'], 'held', {
        holdReason: 'cap',
        sendSlotAt: until,
      })
    }
    await raiseNotification({
      event: 'other',
      severity: 'warning',
      title: `Sending limit reached for ${mailbox.address}`,
      body: 'Emails wait and go after the limit resets at 04:00 GST.',
      dedupeKey: `send_cap:${mailbox.id}:${capDay(now, capReset).toISOString().slice(0, 10)}`,
      subjectType: 'mailbox',
      subjectId: mailbox.id,
      audience: 'all',
    })
    return { kind: 'wait', reason: 'cap', until: until.toISOString() }
  }

  const hooks = gateHooks()
  const hookInput = { outboundId, kind: row.kind, basisHash: row.basisHash }

  // 8 Stale approval (S06).
  if (row.basisHash && hooks.basis) {
    const current = await hooks.basis(hookInput)
    if (current !== null && current !== row.basisHash)
      return stop(outboundId, 'superseded', 'stale')
  }

  // 9 Priced client sends need a person (coverage gap G2).
  const audience = audienceForKind(row.kind)
  if (audience === 'client') {
    const docIds = row.attachments.map((a) => a.documentId).filter((d): d is string => !!d)
    const docs = docIds.length
      ? await opsDb.document.findMany({ where: { id: { in: docIds } }, select: { kind: true } })
      : []
    const priced = isPricedKind(row.kind) || docs.some((d) => isPricedDocument(d.kind))
    if (priced && !(await approvedByPerson(row))) return stop(outboundId, 'failed', 'needs_person')
  }

  // 10 Identifier check for supplier-bound mail (ADR-13).
  if (audience === 'supplier' || audience === 'forwarder') {
    const result = hooks.identifier
      ? await hooks.identifier(hookInput)
      : { passed: (row.identifierCheck as { passed?: unknown } | null)?.passed === true }
    if (!result.passed) return stop(outboundId, 'failed', 'identifier_check')
  }

  // 11 Registered checks.
  for (const [name, check] of hooks.extra) {
    const reason = await check(hookInput)
    if (reason) return stop(outboundId, 'failed', `${name}:${reason}`)
  }

  // 12 Attachments present.
  if (!(await filesPresent(row.attachments.map((a) => a.file)))) {
    return stop(outboundId, 'failed', 'attachment_missing')
  }

  // 13 Outside production only allow-listed recipients get mail.
  if (e.APP_ENV !== 'production') {
    const allow = new Set(e.OPS_SEND_ALLOWLIST ?? [])
    const recipients = allRecipients({
      to: row.toAddresses,
      cc: row.ccAddresses,
      bcc: row.bccAddresses,
    })
    if (!recipients.every((r) => allow.has(r.toLowerCase()))) {
      return stop(outboundId, 'suppressed_preview', 'suppressed_preview')
    }
  }

  if (row.status !== 'scheduled') {
    await moveOutbound(outboundId, ['held', 'waiting_for_mailbox'], 'scheduled', {
      holdReason: null,
    })
  }
  return { kind: 'go' }
}
