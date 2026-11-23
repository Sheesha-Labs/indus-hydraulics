import 'server-only'
import { canTransitionMailbox, mailboxCanRead, type MailboxStatusValue } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { emitEvents } from '../../inngest/emit-batch'
import type { OpsEvent } from '../../inngest/emit'
import { isAssistantPaused } from '../assistant/pause'
import type { GmailApi, GmailHistory } from './client'
import { HistoryTooOldError } from './errors'
import { gmailFor, indusLabelIdsOf } from './mailbox-client'

/**
 * Incremental sync of one mailbox (S04-T04, 08-map-integrations §1.5, ADR-06).
 *
 *   1. paused (the mailbox by its owner, or "Pause everything") → record the notification only, stop;
 *   2. pages of history.list from the stored cursor (messageAdded, labelAdded, labelRemoved, 500 a page);
 *   3. new message ids (not DRAFT-only, not CHAT) → one `ops/gmail.message.fetch` event each, keyed
 *      `mailboxId:gmailId` so a repeat is a no-op; label changes made only to Indus/* labels are ignored (Ops's
 *      own labelling would otherwise loop), others go out as `ops/mail.labels.changed` for S05;
 *   4. the cursor moves to the response's historyId AFTER the fan-out, and only forward.
 *
 * A 404 (cursor older than Google keeps) runs the bounded resync: list ids since the last good sync minus a
 * day, fetch only ids not already stored, take the cursor from getProfile. Nothing is read twice (board 90).
 */
export type SyncReason = 'push' | 'poll' | 'connected' | 'reconnected'

export type SyncResult =
  | { kind: 'paused'; mailboxId: string }
  | { kind: 'unavailable'; mailboxId: string; status: string }
  | {
      kind: 'synced'
      mailboxId: string
      fetched: number
      labelChanges: number
      cursor: string
      pages: number
    }
  | { kind: 'resynced'; mailboxId: string; fetched: number; skippedKnown: number; cursor: string }

export type SyncDeps = {
  gmail?: GmailApi
  emit?: (events: readonly OpsEvent[]) => Promise<number>
  paused?: () => Promise<boolean>
  now?: () => Date
}

const HISTORY_TYPES = ['messageAdded', 'labelAdded', 'labelRemoved'] as const
const SKIP_ONLY = new Set(['DRAFT', 'CHAT'])

/** Cursors are decimal strings; compare as integers. */
export function isNewer(
  next: string | null | undefined,
  current: string | null | undefined
): boolean {
  if (!next || !/^\d+$/.test(next)) return false
  if (!current || !/^\d+$/.test(current)) return true
  return BigInt(next) > BigInt(current)
}

export function fetchEvent(
  mailboxId: string,
  gmailId: string,
  origin: 'live' | 'backfill'
): OpsEvent {
  return {
    name: 'ops/gmail.message.fetch',
    id: `${mailboxId}:${gmailId}`,
    data: { mailboxId, gmailId, origin },
  }
}

/** Ids worth fetching and label changes worth reporting from one page of history. */
export function readHistory(
  history: GmailHistory[],
  indusIds: ReadonlySet<string>
): { ids: string[]; labelChanges: Array<{ gmailId: string; added: string[]; removed: string[] }> } {
  const ids: string[] = []
  const seen = new Set<string>()
  const changes = new Map<string, { added: Set<string>; removed: Set<string> }>()
  for (const h of history) {
    for (const added of h.messagesAdded ?? []) {
      const m = added.message
      if (!m?.id || seen.has(m.id)) continue
      const labels = m.labelIds ?? []
      if (labels.includes('CHAT')) continue
      if (labels.length && labels.every((l) => SKIP_ONLY.has(l))) continue
      seen.add(m.id)
      ids.push(m.id)
    }
    const note = (
      gmailId: string | null | undefined,
      labels: string[] | null | undefined,
      side: 'added' | 'removed'
    ) => {
      const outside = (labels ?? []).filter((l) => !indusIds.has(l))
      if (!gmailId || !outside.length) return
      const entry = changes.get(gmailId) ?? { added: new Set<string>(), removed: new Set<string>() }
      for (const l of outside) entry[side].add(l)
      changes.set(gmailId, entry)
    }
    for (const a of h.labelsAdded ?? []) note(a.message?.id, a.labelIds, 'added')
    for (const r of h.labelsRemoved ?? []) note(r.message?.id, r.labelIds, 'removed')
  }
  return {
    ids,
    labelChanges: [...changes].map(([gmailId, c]) => ({
      gmailId,
      added: [...c.added],
      removed: [...c.removed],
    })),
  }
}

async function setStatus(
  mailboxId: string,
  from: MailboxStatusValue,
  to: MailboxStatusValue,
  reason: string | null
) {
  if (from === to || !canTransitionMailbox(from, to)) return
  await opsDb.mailbox.update({
    where: { id: mailboxId },
    data: { status: to, statusReason: reason },
  })
}

export async function syncMailbox(
  input: { mailboxId: string; reason: SyncReason; notifiedHistoryId?: string | null },
  deps: SyncDeps = {}
): Promise<SyncResult> {
  const now = deps.now ?? (() => new Date())
  const emit = deps.emit ?? emitEvents
  const mailbox = await opsDb.mailbox.findUnique({
    where: { id: input.mailboxId },
    select: { id: true, status: true, pausedAt: true, syncState: true },
  })
  if (!mailbox) return { kind: 'unavailable', mailboxId: input.mailboxId, status: 'missing' }
  const status = mailbox.status as MailboxStatusValue

  const paused =
    mailbox.pausedAt !== null || status === 'paused' || (await (deps.paused ?? isAssistantPaused)())
  if (paused) {
    // Mail keeps arriving in Gmail; nothing is lost. The cursor stays put so resume catches up from here.
    await opsDb.mailboxSyncState.upsert({
      where: { mailboxId: mailbox.id },
      create: { mailboxId: mailbox.id, lastPushAt: now() },
      update: { lastPushAt: now() },
    })
    return { kind: 'paused', mailboxId: mailbox.id }
  }
  if (!mailboxCanRead(status)) return { kind: 'unavailable', mailboxId: mailbox.id, status }

  const gmail = deps.gmail ?? gmailFor(mailbox.id, 'live')
  const cursor = mailbox.syncState?.historyId ?? null
  if (!cursor) {
    // Never synced (the watch has not stored a starting point yet): start from now.
    const profile = await gmail.getProfile()
    await writeCursor(mailbox.id, profile.historyId ?? null, now())
    return {
      kind: 'synced',
      mailboxId: mailbox.id,
      fetched: 0,
      labelChanges: 0,
      cursor: profile.historyId ?? '',
      pages: 0,
    }
  }

  try {
    const indusIds = await indusLabelIdsOf(mailbox.id)
    let pageToken: string | undefined
    let latest = cursor
    let fetched = 0
    let labelChanges = 0
    let pages = 0
    do {
      const page = await gmail.history.list({
        startHistoryId: cursor,
        historyTypes: [...HISTORY_TYPES],
        maxResults: 500,
        ...(pageToken ? { pageToken } : {}),
      })
      pages += 1
      const { ids, labelChanges: changes } = readHistory(page.history ?? [], indusIds)
      const events: OpsEvent[] = ids.map((id) => fetchEvent(mailbox.id, id, 'live'))
      for (const c of changes) {
        events.push({
          name: 'ops/mail.labels.changed',
          id: `labels:${mailbox.id}:${c.gmailId}:${page.historyId ?? ''}`,
          data: { mailboxId: mailbox.id, gmailId: c.gmailId, added: c.added, removed: c.removed },
        })
      }
      if (events.length) await emit(events)
      fetched += ids.length
      labelChanges += changes.length
      if (isNewer(page.historyId, latest)) latest = page.historyId as string
      pageToken = page.nextPageToken ?? undefined
    } while (pageToken)

    // After the fan-out, forward only: a replayed old notification never moves the cursor back.
    await writeCursor(mailbox.id, latest, now())
    if (status === 'behind' || status === 'resyncing')
      await setStatus(mailbox.id, status, 'live', null)
    return { kind: 'synced', mailboxId: mailbox.id, fetched, labelChanges, cursor: latest, pages }
  } catch (error) {
    if (!(error instanceof HistoryTooOldError)) throw error
    return resync(
      { mailboxId: mailbox.id, status, lastGood: mailbox.syncState?.lastSuccessfulSyncAt ?? null },
      gmail,
      emit,
      now
    )
  }
}

async function writeCursor(mailboxId: string, next: string | null, at: Date) {
  const state = await opsDb.mailboxSyncState.findUnique({
    where: { mailboxId },
    select: { historyId: true },
  })
  await opsDb.mailboxSyncState.upsert({
    where: { mailboxId },
    create: {
      mailboxId,
      historyId: next,
      lastSuccessfulSyncAt: at,
      lastIncrementalAt: at,
      lagSeconds: 0,
    },
    update: {
      ...(isNewer(next, state?.historyId) ? { historyId: next } : {}),
      lastSuccessfulSyncAt: at,
      lastIncrementalAt: at,
      lagSeconds: 0,
      errorCount: 0,
      lastError: null,
    },
  })
}

/** Bounded resync after a 404: only ids not already stored, then the cursor from getProfile. */
async function resync(
  input: { mailboxId: string; status: MailboxStatusValue; lastGood: Date | null },
  gmail: GmailApi,
  emit: (events: readonly OpsEvent[]) => Promise<number>,
  now: () => Date
): Promise<SyncResult> {
  await setStatus(
    input.mailboxId,
    input.status,
    'resyncing',
    'Catching up after a gap in Google’s history'
  )
  const from = new Date(
    (input.lastGood ?? new Date(now().getTime() - 7 * 86_400_000)).getTime() - 86_400_000
  )
  await opsDb.mailboxSyncState.update({
    where: { mailboxId: input.mailboxId },
    data: { resyncFrom: from },
  })
  const q = `after:${Math.floor(from.getTime() / 1000)}`
  let pageToken: string | undefined
  let fetched = 0
  let skippedKnown = 0
  do {
    const page = await gmail.messages.list({
      q,
      maxResults: 500,
      ...(pageToken ? { pageToken } : {}),
    })
    const ids = (page.messages ?? []).map((m) => m.id).filter((id): id is string => !!id)
    const known = new Set(
      (
        await opsDb.mailMessage.findMany({
          where: { mailboxId: input.mailboxId, gmailMessageId: { in: ids } },
          select: { gmailMessageId: true },
        })
      ).map((r) => r.gmailMessageId)
    )
    const fresh = ids.filter((id) => !known.has(id))
    skippedKnown += ids.length - fresh.length
    if (fresh.length) await emit(fresh.map((id) => fetchEvent(input.mailboxId, id, 'live')))
    fetched += fresh.length
    pageToken = page.nextPageToken ?? undefined
  } while (pageToken)

  const profile = await gmail.getProfile()
  // A resync REPLACES the cursor Google forgot: the 404 proved it is unusable, so forward-only does not apply.
  await opsDb.mailboxSyncState.update({
    where: { mailboxId: input.mailboxId },
    data: {
      historyId: profile.historyId ?? null,
      lastSuccessfulSyncAt: now(),
      lastIncrementalAt: now(),
      lagSeconds: 0,
    },
  })
  await setStatus(input.mailboxId, 'resyncing', 'live', null)
  return {
    kind: 'resynced',
    mailboxId: input.mailboxId,
    fetched,
    skippedKnown,
    cursor: profile.historyId ?? '',
  }
}
