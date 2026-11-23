import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import type { OpsEvent } from '../../inngest/emit'
import { emitEvents } from '../../inngest/emit-batch'
import { getSetting } from '../settings/get'
import type { GmailApi } from './client'
import { gmailFor } from './mailbox-client'
import { parseAddress } from './mime'
import { etaMinutes, UNIT_COST } from './quota'
import { fetchEvent } from './sync'

/**
 * Reading 12 or 24 months of past mail (S04-T05, 08-map-integrations §1.7, board 86 step 4, board 85 backfill
 * line, C33). Driven by ops.gmail.backfill one bounded unit of work per run, newest month first:
 *
 *   counting  messages.list per month (ids only, 5 units a page) → backfillTotal
 *   fetching  the same lists again; ids already stored are skipped for free; the rest get a metadata read
 *             (20 units) and the exclusions (mailing lists, bulk, Indus/Ignore, the never-import senders)
 *             drop a message BEFORE the 60-unit full fetch; survivors go to ops.gmail.message.fetch with
 *             origin 'backfill'
 *
 * Progress and a live ETA live in mailbox_sync_state.backfillState (the board's "about 2 hours" is never
 * promised, C33). Backfilled rows carry origin 'backfill': nothing they contain can ever cause a send.
 */
export type BackfillWindow = { ym: string; after: number; before: number; count: number | null }
export type BackfillState = {
  months: number
  phase: 'counting' | 'fetching' | 'done' | 'paused'
  startedAt: string
  windows: BackfillWindow[]
  index: number
  pageToken: string | null
  listed: number
  queued: number
  skipped: number
  alreadyStored: number
  etaMinutes: number | null
  updatedAt: string
}

/** Units one surviving message costs end to end: metadata read + full read. */
export const UNITS_PER_MESSAGE = UNIT_COST['messages.get.metadata'] + UNIT_COST['messages.get.full']
const PAGE = 500
const METADATA_HEADERS = ['From', 'To', 'Subject', 'List-Id', 'List-Unsubscribe', 'Precedence']

/** Calendar months back from `now`, newest first, as Gmail search epochs (UTC month edges). */
export function monthWindows(months: number, now: Date): BackfillWindow[] {
  const out: BackfillWindow[] = []
  for (let i = 0; i < months; i += 1) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1))
    out.push({
      ym: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`,
      after: Math.floor(start.getTime() / 1000),
      before: Math.floor(Math.min(end.getTime(), now.getTime()) / 1000) + 1,
      count: null,
    })
  }
  return out
}

export function initialState(months: number, now: Date): BackfillState {
  return {
    months,
    phase: 'counting',
    startedAt: now.toISOString(),
    windows: monthWindows(months, now),
    index: 0,
    pageToken: null,
    listed: 0,
    queued: 0,
    skipped: 0,
    alreadyStored: 0,
    etaMinutes: null,
    updatedAt: now.toISOString(),
  }
}

/** Remaining messages × units per message, spent at the backfill bucket's rate. */
export function backfillEta(
  state: Pick<BackfillState, 'listed' | 'queued' | 'skipped' | 'alreadyStored'>,
  total: number | null
): number | null {
  if (total === null) return null
  const handled = state.queued + state.skipped + state.alreadyStored
  return etaMinutes(Math.max(0, total - handled) * UNITS_PER_MESSAGE, 'backfill')
}

export type Exclusions = { addresses: string[]; domains: string[] }

/** Why a past message is not imported, or null to fetch it in full. */
export function exclusionReason(
  headers: Record<string, string>,
  labelIds: readonly string[],
  ignoreLabelId: string | null,
  exclusions: Exclusions
): 'ignore_label' | 'mailing_list' | 'bulk' | 'excluded_sender' | null {
  if (ignoreLabelId && labelIds.includes(ignoreLabelId)) return 'ignore_label'
  if (headers['list-id'] || headers['list-unsubscribe']) return 'mailing_list'
  if (/^(bulk|list|junk)$/i.test((headers.precedence ?? '').trim())) return 'bulk'
  const from = parseAddress(headers.from ?? '').address
  const domain = from.split('@')[1] ?? ''
  if (exclusions.addresses.includes(from)) return 'excluded_sender'
  if (domain && exclusions.domains.some((d) => domain === d || domain.endsWith(`.${d}`)))
    return 'excluded_sender'
  return null
}

async function readState(mailboxId: string): Promise<BackfillState | null> {
  const row = await opsDb.mailboxSyncState.findUnique({
    where: { mailboxId },
    select: { backfillState: true },
  })
  return (row?.backfillState as BackfillState | null) ?? null
}

async function writeState(
  mailboxId: string,
  state: BackfillState,
  extra: Prisma.MailboxUpdateInput = {}
) {
  await opsDb.mailboxSyncState.update({
    where: { mailboxId },
    data: { backfillState: state as unknown as Prisma.InputJsonValue },
  })
  if (Object.keys(extra).length)
    await opsDb.mailbox.update({ where: { id: mailboxId }, data: extra })
}

export async function startBackfill(
  mailboxId: string,
  months: number,
  now = new Date()
): Promise<BackfillState> {
  const state = initialState(months, now)
  await opsDb.mailboxSyncState.upsert({
    where: { mailboxId },
    create: { mailboxId, backfillState: state as unknown as Prisma.InputJsonValue },
    update: { backfillState: state as unknown as Prisma.InputJsonValue, backfillPausedUntil: null },
  })
  await opsDb.mailbox.update({
    where: { id: mailboxId },
    data: { backfillMonths: months, backfillTotal: null, backfillDone: 0 },
  })
  return state
}

export async function pauseBackfill(mailboxId: string): Promise<void> {
  const state = await readState(mailboxId)
  if (!state || state.phase === 'done') return
  await writeState(mailboxId, { ...state, phase: 'paused', updatedAt: new Date().toISOString() })
}

/** Resume a paused backfill where it stopped (the caller re-sends ops/gmail.backfill.continue). */
export async function resumeBackfill(mailboxId: string): Promise<boolean> {
  const state = await readState(mailboxId)
  if (!state || state.phase !== 'paused') return false
  const total = (
    await opsDb.mailbox.findUnique({ where: { id: mailboxId }, select: { backfillTotal: true } })
  )?.backfillTotal
  await writeState(mailboxId, {
    ...state,
    phase: total == null ? 'counting' : 'fetching',
    updatedAt: new Date().toISOString(),
  })
  return true
}

export type StepDeps = {
  gmail?: GmailApi
  emit?: (events: readonly OpsEvent[]) => Promise<number>
  exclusions?: Exclusions
  now?: () => Date
}

/** One unit of work: one list page (counting), or one page of pre-filter and queueing (fetching). */
export async function backfillStep(
  mailboxId: string,
  deps: StepDeps = {}
): Promise<{ done: boolean; state: BackfillState | null }> {
  const now = deps.now ?? (() => new Date())
  const state = await readState(mailboxId)
  if (!state || state.phase === 'done' || state.phase === 'paused') return { done: true, state }
  const gmail = deps.gmail ?? gmailFor(mailboxId, 'backfill')
  const window = state.windows[state.index]
  if (!window) {
    const next: BackfillState =
      state.phase === 'counting'
        ? { ...state, phase: 'fetching', index: 0, pageToken: null, updatedAt: now().toISOString() }
        : { ...state, phase: 'done', etaMinutes: 0, updatedAt: now().toISOString() }
    if (state.phase === 'counting') {
      const total = state.windows.reduce((s, w) => s + (w.count ?? 0), 0)
      next.etaMinutes = backfillEta(next, total)
      await writeState(mailboxId, next, { backfillTotal: total })
    } else {
      await writeState(mailboxId, next)
    }
    return { done: next.phase === 'done', state: next }
  }

  const page = await gmail.messages.list({
    q: `after:${window.after} before:${window.before} -in:chats`,
    maxResults: PAGE,
    ...(state.pageToken ? { pageToken: state.pageToken } : {}),
  })
  const ids = (page.messages ?? []).map((m) => m.id).filter((id): id is string => !!id)
  const nextToken = page.nextPageToken ?? null
  const advance = (s: BackfillState): BackfillState =>
    nextToken ? { ...s, pageToken: nextToken } : { ...s, index: s.index + 1, pageToken: null }

  if (state.phase === 'counting') {
    const windows = state.windows.map((w, i) =>
      i === state.index ? { ...w, count: (w.count ?? 0) + ids.length } : w
    )
    const next = advance({
      ...state,
      windows,
      listed: state.listed + ids.length,
      updatedAt: now().toISOString(),
    })
    await writeState(mailboxId, next)
    return { done: false, state: next }
  }

  // fetching: skip what is already stored (no Gmail call), pre-filter the rest on metadata.
  const known = new Set(
    (
      await opsDb.mailMessage.findMany({
        where: { mailboxId, gmailMessageId: { in: ids } },
        select: { gmailMessageId: true },
      })
    ).map((r) => r.gmailMessageId)
  )
  const exclusions = deps.exclusions ?? (await getSetting('mail.backfill_exclusions'))
  const ignoreLabel = await opsDb.gmailLabel.findFirst({
    where: { mailboxId, name: (await getSetting('mail.label_names')).ignore },
    select: { gmailLabelId: true },
  })
  let skipped = 0
  const survivors: string[] = []
  for (const id of ids) {
    if (known.has(id)) continue
    const meta = await gmail.messages.get({
      id,
      format: 'metadata',
      metadataHeaders: METADATA_HEADERS,
    })
    const headers = Object.fromEntries(
      (meta.payload?.headers ?? []).map((h) => [(h.name ?? '').toLowerCase(), h.value ?? ''])
    )
    if (
      exclusionReason(headers, meta.labelIds ?? [], ignoreLabel?.gmailLabelId ?? null, exclusions)
    )
      skipped += 1
    else survivors.push(id)
  }
  if (survivors.length)
    await (deps.emit ?? emitEvents)(survivors.map((id) => fetchEvent(mailboxId, id, 'backfill')))
  const total =
    (await opsDb.mailbox.findUnique({ where: { id: mailboxId }, select: { backfillTotal: true } }))
      ?.backfillTotal ?? null
  const counted: BackfillState = {
    ...state,
    queued: state.queued + survivors.length,
    skipped: state.skipped + skipped,
    alreadyStored: state.alreadyStored + known.size,
    updatedAt: now().toISOString(),
  }
  counted.etaMinutes = backfillEta(counted, total)
  const next = advance(counted)
  await writeState(mailboxId, next)
  return { done: false, state: next }
}

/**
 * ADR-04 / CLAUDE.md §7.6: bulk work never runs within an hour of a storefront deploy or an IndexNow burst. The
 * person who deploys the storefront sets `ops.bulk_quiet_until` ({ until: ISO }); the backfill sleeps until it.
 */
export async function bulkQuietUntil(): Promise<string | null> {
  const row = await opsDb.settingsEntry.findUnique({
    where: { key: 'ops.bulk_quiet_until' },
    select: { value: true },
  })
  const until = (row?.value as { until?: unknown } | null)?.until
  if (typeof until !== 'string') return null
  return new Date(until).getTime() > Date.now() ? until : null
}
