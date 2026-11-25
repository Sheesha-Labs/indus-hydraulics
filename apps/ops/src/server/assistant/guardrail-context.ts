import 'server-only'
import {
  GUARDRAIL_KINDS,
  overCap,
  parseGuardrailParams,
  workingHoursState,
  type GuardrailContext,
  type GuardrailKind,
  type GuardrailSetting,
} from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { holidaysFor, sentInCapDay } from '../mail-send/slot'
import { SETTINGS } from '../settings/registry'
import type { ActionDefinition, ActionRequest, Json } from './types'

/**
 * The facts guardrails look at for one run (S07-T01). Two parts:
 *
 *   the action's own facts   ActionDefinition.guardrailContext(request): a quotation's value, whether the
 *                            recipient is new, the client's credit hold, chaser counts … (what applies to it)
 *   the clock and the caps   for an action that emails someone: outside working hours / holiday / Ramadan
 *                            (workingHoursState over the guardrail rows and ops.holiday), over the mailbox's
 *                            daily cap (the same counter the send gate reads)
 *
 * The guardrail rows are cached for at most 60 seconds per server (board 100: "a change takes effect on the
 * next resolveLevel call, no cache longer than 60 s"); `forgetGuardrails()` clears it on save.
 */

let cache: { at: number; rows: GuardrailSetting[] } | null = null
const TTL_MS = 60_000

export function forgetGuardrails(): void {
  cache = null
}

function isKind(kind: string): kind is GuardrailKind {
  return (GUARDRAIL_KINDS as readonly string[]).includes(kind)
}

export async function loadGuardrails(
  db: Pick<Prisma.TransactionClient, 'guardrail'> = opsDb
): Promise<GuardrailSetting[]> {
  if (db === opsDb && cache && Date.now() - cache.at < TTL_MS) return cache.rows
  const rows = await db.guardrail.findMany({
    select: { key: true, kind: true, enabled: true, fixed: true, params: true },
    orderBy: { key: 'asc' },
  })
  const out = rows
    .filter((r) => isKind(r.kind))
    .map((r) => ({
      key: r.key,
      kind: r.kind as GuardrailKind,
      enabled: r.enabled,
      fixed: r.fixed,
      params: r.params,
    }))
  if (db === opsDb) cache = { at: Date.now(), rows: out }
  return out
}

function rowParams<K extends GuardrailKind>(rows: readonly GuardrailSetting[], kind: K) {
  const row = rows.find((r) => r.kind === kind && r.enabled)
  if (!row) return null
  const p = parseGuardrailParams(kind, row.params)
  return p.ok ? p.params : null
}

/** Outside hours / over the cap, for a run that would email someone from `mailboxId`. */
export async function clockContext(
  guardrails: readonly GuardrailSetting[],
  mailboxId: string | null | undefined,
  now: Date
): Promise<Pick<GuardrailContext, 'outsideHours' | 'overDailyCap'>> {
  const hours = rowParams(guardrails, 'working_hours')
  const calendar = rowParams(guardrails, 'holiday_calendar')
  const capOn = guardrails.some((g) => g.kind === 'daily_send_cap' && g.enabled)
  const [holidays, mailbox, timing] = await Promise.all([
    hours ? holidaysFor([calendar?.country ?? 'AE'], now, 2) : Promise.resolve([]),
    capOn && mailboxId
      ? opsDb.mailbox.findUnique({
          where: { id: mailboxId },
          select: {
            dailySendCap: true,
            syncState: { select: { sentToday: true, sentTodayDate: true } },
          },
        })
      : Promise.resolve(null),
    capOn && mailboxId
      ? opsDb.settingsEntry
          .findUnique({ where: { key: 'send.timing' }, select: { value: true } })
          .then((r) => {
            const p = SETTINGS['send.timing'].schema.safeParse(r?.value)
            return p.success ? p.data : null
          })
      : Promise.resolve(null),
  ])
  const outsideHours = hours ? workingHoursState(now, hours, calendar, holidays) : null
  const overDailyCap = mailbox
    ? overCap(sentInCapDay(mailbox.syncState, now, timing?.capReset), mailbox.dailySendCap)
    : false
  return { outsideHours, overDailyCap }
}

/** Everything the resolver needs for one run of `def`. */
export async function guardrailContextFor(
  def: ActionDefinition<Json, Json>,
  request: ActionRequest,
  now = new Date()
): Promise<{ ctx: GuardrailContext; guardrails: GuardrailSetting[] }> {
  const guardrails = await loadGuardrails()
  const [own, clock] = await Promise.all([
    def.guardrailContext ? def.guardrailContext(request) : Promise.resolve({}),
    def.external
      ? clockContext(guardrails, request.mailboxId, now)
      : Promise.resolve({} as Pick<GuardrailContext, 'outsideHours' | 'overDailyCap'>),
  ])
  return { ctx: { ...own, ...clock }, guardrails }
}

/**
 * The client a run concerns, for the credit-hold guardrail: the company itself, else the enquiry's client
 * (directly, or through the thread or message the action is about). Null when nothing names one.
 */
export async function recordCompanyId(request: ActionRequest): Promise<string | null> {
  const { subjectType, subjectId } = request
  if (subjectType === 'company') return subjectId
  let enquiryId = request.enquiryId ?? null
  if (!enquiryId && subjectType === 'mail_thread') {
    const t = await opsDb.mailThread.findUnique({
      where: { id: subjectId },
      select: { enquiryId: true },
    })
    enquiryId = t?.enquiryId ?? null
  }
  if (!enquiryId && subjectType === 'mail_message') {
    const m = await opsDb.mailMessage.findUnique({
      where: { id: subjectId },
      select: { thread: { select: { enquiryId: true } } },
    })
    enquiryId = m?.thread.enquiryId ?? null
  }
  if (subjectType === 'enquiry') enquiryId = subjectId
  if (!enquiryId) return null
  const e = await opsDb.enquiry.findUnique({ where: { id: enquiryId }, select: { clientId: true } })
  return e?.clientId ?? null
}

/** Credit hold of the client the run concerns (S07-T01: "client on credit hold asks on every send"). */
export async function creditHoldContext(
  request: ActionRequest
): Promise<Pick<GuardrailContext, 'clientOnCreditHold' | 'clientName'>> {
  const companyId = await recordCompanyId(request)
  if (!companyId) return {}
  const c = await opsDb.company.findUnique({
    where: { id: companyId },
    select: { name: true, clientProfile: { select: { creditHold: true } } },
  })
  return c ? { clientOnCreditHold: c.clientProfile?.creditHold ?? false, clientName: c.name } : {}
}
