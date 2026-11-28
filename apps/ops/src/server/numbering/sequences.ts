import 'server-only'
import { formatNumber, parseNumber, validatePattern, type ScopeKind } from '@indus/ops-core'
import { opsDb, Prisma, type $Enums } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import { gmailFor } from '../gmail/mailbox-client'
import type { GmailApi } from '../gmail/client'
import { raiseNotification } from '../notify/raise'
import { settingSubjectId } from '../settings/subject-id'
import { peek } from './allocate'
import { legacyEnquiryMax } from './enquiry-seed'

/**
 * Number sequences: seeding, evidence and continuity (S11-T08, board 214, ADR-15, C4, C6).
 *
 *   seedSequence        Owner only, with evidence; the next value must be above every source's highest. INDUS/Q is
 *                       never seeded here: it is seeded in the cutover batch (S21, C4).
 *   collectObservations what outside allocators have issued: sales@ and purchase@ Sent mail (subjects and
 *                       snippets, ≤ 500 messages a run, the read-only Gmail methods), the website admin (INDUS/Q and
 *                       ENQ). Zoho arrives with S20.
 *   checkContinuity     clear when the next number is above everything seen and seen nowhere; out of step otherwise.
 *   runContinuity       both, written to the sequence, with a notification when out of step.
 */
const DUBAI = { timeZone: 'Asia/Dubai' } as const

export function currentScope(kind: ScopeKind, now = new Date()): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      ...DUBAI,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(now)
      .map((x) => [x.type, x.value])
  ) as Record<string, string>
  if (kind === 'year') return p.year!
  if (kind === 'month') return `${p.year!.slice(2)}${p.month}`
  if (kind === 'day') return `${p.year!.slice(2)}-${p.month}-${p.day}`
  return ''
}

/** "Check now" on Settings › Numbering: one sequence, the same steps as the nightly run. */
export const NUMBERING_CHECK_REQUESTED = 'ops/numbering.check.requested' as const

export const QUOTATION_REFUSAL = 'INDUS/Q is seeded in the cutover batch (S21).'
const MAX_GMAIL_MESSAGES = 500

type SourceKey = $Enums.ExternalNumberSource
export interface SourceEvidence {
  source: SourceKey
  maxSeen: number | null
  maxFormatted: string | null
  lastSeenAt: string | null
  lastRef: string | null
  clashesWithNext: boolean
  note?: string
}
export interface ContinuityDetail {
  next: string | null
  nextValue: number | null
  perSource: SourceEvidence[]
  checkedScope: string
}
export type ContinuityState = 'clear' | 'out_of_step' | 'not_checked' | 'unseeded' | 'check_failed'

/** The literal prefix a sequence's numbers start with ("INDUS/Q", "ENQ-"), for the Gmail search. */
export function literalPrefix(pattern: string): string {
  return pattern.split('{')[0] ?? ''
}

// ── Seeding ───────────────────────────────────────────────────────────────────────────────────────────

export async function seedSequence(
  key: string,
  next: number,
  evidence: Record<string, unknown>,
  actor: { id: string; role: string }
): Promise<{ formatted: string }> {
  if (actor.role !== 'owner') throw new SafeError('Only the Owner seeds a number series.')
  if (key === 'quotation') throw new SafeError(QUOTATION_REFUSAL)
  const seq = await opsDb.numberSequence.findUnique({ where: { key } })
  if (!seq) throw new SafeError('That number series does not exist.')
  const scope = currentScope(seq.scopeKind as ScopeKind)
  const highest = await opsDb.externalNumberObservation.aggregate({
    where: { sequenceKey: key, scope },
    _max: { value: true },
  })
  const max = Number(highest._max.value ?? 0)
  if (next <= max)
    throw new SafeError(
      `${formatNumber(seq.pattern, max, scope, seq.scopeKind as ScopeKind, seq.padTo)} has already been used; start above it.`
    )
  const formatted = formatNumber(seq.pattern, next, scope, seq.scopeKind as ScopeKind, seq.padTo)
  await opsDb.$transaction(async (tx) => {
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: actor.id },
        subjectType: 'settings',
        subjectId: settingSubjectId(`number_sequence.${key}`),
        changes: [
          {
            field: `number_sequence.${key}.seed`,
            before: null,
            after: { next, formatted, scope },
            kind: 'settings',
          },
        ],
      },
      async (t) => {
        try {
          await t.$executeRaw`SELECT ops.seed_number_sequence(${key}, ${BigInt(next)}, ${JSON.stringify(evidence)}::jsonb, ${scope}, ${actor.id}::uuid)`
        } catch (e) {
          const msg = e instanceof Error ? e.message : ''
          if (/already issued up to/.test(msg))
            throw new SafeError('Operations has already issued numbers above that; start higher.')
          throw e
        }
        await t.numberSequence.update({
          where: { key },
          data: { continuityStatus: 'not_checked' },
        })
      }
    )
  })
  return { formatted }
}

/** A pattern change: validated, affects only future numbers. Owner only. */
export async function setPattern(
  key: string,
  pattern: string,
  actor: { id: string; role: string }
): Promise<void> {
  if (actor.role !== 'owner') throw new SafeError('Only the Owner changes a number pattern.')
  const seq = await opsDb.numberSequence.findUniqueOrThrow({ where: { key } })
  const errors = validatePattern(pattern, seq.scopeKind as ScopeKind)
  if (errors.length) throw new SafeError(errors[0]!)
  if (seq.pattern === pattern) return
  await opsDb.$transaction((tx) =>
    writeTracked(
      tx,
      {
        actor: { kind: 'user', id: actor.id },
        subjectType: 'settings',
        subjectId: settingSubjectId(`number_sequence.${key}`),
        changes: [
          {
            field: `number_sequence.${key}.pattern`,
            before: seq.pattern,
            after: pattern,
            kind: 'settings',
          },
        ],
      },
      (t) =>
        t.numberSequence.update({
          where: { key },
          data: { pattern, continuityStatus: seq.seededAt ? 'not_checked' : 'unseeded' },
        })
    )
  )
}

/** C6: the Owner confirms the Round 1 numbering style of every awaiting sequence. */
export async function confirmRoundOneStyle(actor: {
  id: string
  role: string
}): Promise<{ count: number }> {
  if (actor.role !== 'owner') throw new SafeError('Only the Owner confirms the numbering style.')
  return opsDb.$transaction(async (tx) => {
    const rows = await tx.numberSequence.findMany({
      where: { signoffStatus: 'awaiting' },
      select: { key: true, pattern: true, revisionPattern: true },
    })
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: actor.id },
        subjectType: 'settings',
        subjectId: settingSubjectId('number_sequence.round_one'),
        changes: [
          {
            field: 'number_sequence.round_one_style',
            before: 'awaiting',
            after: rows,
            kind: 'settings',
          },
        ],
      },
      (t) =>
        t.numberSequence.updateMany({
          where: { signoffStatus: 'awaiting' },
          data: { signoffStatus: 'signed_off', signedOffById: actor.id, signedOffAt: new Date() },
        })
    )
    return { count: rows.length }
  })
}

// ── Evidence ──────────────────────────────────────────────────────────────────────────────────────────

export interface ObserveOptions {
  /** A Gmail client per mailbox (tests pass a fake). */
  gmail?: (mailboxId: string) => GmailApi
  now?: Date
}

/**
 * Record what outside allocators have issued in this sequence. Returns the Gmail units spent (list 5, get 5).
 * A Gmail failure is reported (the caller marks the check failed), never thrown past here.
 */
export async function collectObservations(
  key: string,
  opts: ObserveOptions = {}
): Promise<{ gmailUnits: number; gmailFailed: boolean; recorded: number }> {
  const seq = await opsDb.numberSequence.findUniqueOrThrow({ where: { key } })
  const kind = seq.scopeKind as ScopeKind
  let recorded = 0
  const record = async (
    o: { formatted: string; value: number; scope: string },
    source: SourceKey,
    sourceRef: string | null,
    at: Date
  ) => {
    const r = await opsDb.externalNumberObservation.createMany({
      data: [
        {
          sequenceKey: key,
          formatted: o.formatted,
          value: BigInt(o.value),
          scope: o.scope,
          source,
          sourceRef,
          observedAt: at,
        },
      ],
      skipDuplicates: true,
    })
    recorded += r.count
  }

  // (b) The website admin, while it still allocates.
  if (key === 'quotation') {
    const [row] = await opsDb.$queryRaw<
      Array<{ n: number }>
    >`SELECT ops.legacy_quote_number_max() AS n`
    const n = Number(row?.n ?? 0)
    if (n > 0)
      await record(
        { formatted: `INDUS/Q${n}`, value: n, scope: '' },
        'legacy_admin',
        'public.quotes',
        opts.now ?? new Date()
      )
  }
  if (key === 'enquiry') {
    const scope = currentScope('year', opts.now)
    const n = await legacyEnquiryMax(Number(scope))
    if (n > 0)
      await record(
        { formatted: formatNumber(seq.pattern, n, scope, kind, seq.padTo), value: n, scope },
        'legacy_admin',
        'public.enquiries',
        opts.now ?? new Date()
      )
  }

  // (a) Sent mail on the client and supplier mailboxes.
  const prefix = literalPrefix(seq.pattern)
  if (prefix.length < 2) return { gmailUnits: 0, gmailFailed: false, recorded }
  const mailboxes = await opsDb.mailbox.findMany({
    where: {
      role: { in: ['client', 'supplier'] },
      status: { in: ['live', 'behind', 'backfilling'] },
    },
    select: { id: true },
  })
  const after = seq.lastCheckedAt ? Math.floor(seq.lastCheckedAt.getTime() / 1000) - 86_400 : null
  let units = 0
  let failed = false
  let budget = MAX_GMAIL_MESSAGES
  for (const mb of mailboxes) {
    const gmail = (opts.gmail ?? ((id: string) => gmailFor(id, 'backfill')))(mb.id)
    try {
      let pageToken: string | undefined
      do {
        const list = await gmail.messages.list({
          q: `in:sent "${prefix}"${after ? ` after:${after}` : ''}`,
          maxResults: Math.min(100, budget),
          ...(pageToken ? { pageToken } : {}),
        })
        units += 5
        for (const m of list.messages ?? []) {
          if (budget-- <= 0 || !m.id) break
          const msg = await gmail.messages.get({
            id: m.id,
            format: 'metadata',
            metadataHeaders: ['Subject'],
          })
          units += 5
          const subject =
            msg.payload?.headers?.find((h) => h.name?.toLowerCase() === 'subject')?.value ?? ''
          const at = msg.internalDate
            ? new Date(Number(msg.internalDate))
            : (opts.now ?? new Date())
          for (const text of [subject, msg.snippet ?? '']) {
            const p = parseNumber(seq.pattern, text)
            if (p)
              await record(
                { formatted: p.formatted, value: p.value, scope: p.scope },
                'gmail_sent',
                m.id,
                at
              )
          }
        }
        pageToken = budget > 0 ? (list.nextPageToken ?? undefined) : undefined
      } while (pageToken)
    } catch {
      failed = true
    }
  }
  return { gmailUnits: units, gmailFailed: failed, recorded }
}

/** Compare the next number with everything seen. Reads only. */
export async function checkContinuity(
  key: string,
  now = new Date()
): Promise<{ status: ContinuityState; detail: ContinuityDetail }> {
  const seq = await opsDb.numberSequence.findUniqueOrThrow({ where: { key } })
  const scope = currentScope(seq.scopeKind as ScopeKind, now)
  if (!seq.seededAt)
    return {
      status: 'unseeded',
      detail: { next: null, nextValue: null, perSource: [], checkedScope: scope },
    }
  const next = await peek(opsDb, key, scope)
  const nextValue = next ? (parseNumber(seq.pattern, next)?.value ?? null) : null
  const [obs, issued] = await Promise.all([
    opsDb.externalNumberObservation.findMany({
      where: { sequenceKey: key, scope },
      orderBy: { value: 'desc' },
      select: { source: true, value: true, formatted: true, observedAt: true, sourceRef: true },
    }),
    opsDb.issuedNumber.findMany({
      where: { sequenceKey: key, scope, status: { in: ['issued', 'reserved'] } },
      select: { formatted: true },
    }),
  ])
  const ours = new Set(issued.map((i) => i.formatted))
  const sources: SourceKey[] = ['gmail_sent', 'legacy_admin', 'zoho']
  const perSource: SourceEvidence[] = sources.map((source) => {
    const seen = obs.filter((o) => o.source === source && !ours.has(o.formatted))
    const top = seen[0]
    const latest = [...seen].sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime())[0]
    const maxSeen = top?.value != null ? Number(top.value) : null
    return {
      source,
      maxSeen,
      maxFormatted: top?.formatted ?? null,
      lastSeenAt: latest?.observedAt.toISOString() ?? null,
      lastRef: latest?.sourceRef ?? null,
      clashesWithNext: maxSeen !== null && nextValue !== null && maxSeen >= nextValue,
      ...(source === 'zoho' ? { note: 'Not connected · arrives with S20' } : {}),
    }
  })
  const status: ContinuityState = perSource.some((s) => s.clashesWithNext) ? 'out_of_step' : 'clear'
  return { status, detail: { next, nextValue, perSource, checkedScope: scope } }
}

/** Collect, check and write the result on the sequence; a notification when it is out of step. */
export async function runContinuity(
  key: string,
  opts: ObserveOptions = {}
): Promise<{ status: ContinuityState; gmailUnits: number }> {
  const seq = await opsDb.numberSequence.findUniqueOrThrow({
    where: { key },
    select: { seededAt: true, label: true, continuityStatus: true },
  })
  if (!seq.seededAt) {
    await opsDb.numberSequence.update({
      where: { key },
      data: { continuityStatus: 'unseeded', lastCheckedAt: opts.now ?? new Date() },
    })
    return { status: 'unseeded', gmailUnits: 0 }
  }
  const collected = await collectObservations(key, opts)
  const { status: checked, detail } = await checkContinuity(key, opts.now)
  const status: ContinuityState =
    collected.gmailFailed && checked === 'clear' ? 'check_failed' : checked
  await opsDb.numberSequence.update({
    where: { key },
    data: {
      continuityStatus: status,
      lastCheckedAt: opts.now ?? new Date(),
      continuityDetail: {
        ...detail,
        gmailUnits: collected.gmailUnits,
      } as unknown as Prisma.InputJsonValue,
      ...(status === 'out_of_step' ? { outOfStepAt: opts.now ?? new Date() } : {}),
    },
  })
  if (status === 'out_of_step') {
    const clash = detail.perSource.find((s) => s.clashesWithNext)
    await raiseNotification({
      event: 'other',
      severity: 'warning',
      title: `${seq.label} numbers are out of step`,
      body: `${clash?.maxFormatted ?? 'A number'} has been used outside Operations; the next would be ${detail.next}. Settings › Numbering.`,
      dedupeKey: `numbering:${key}:out_of_step`,
      actionUrl: '/settings/numbering',
    })
  }
  return { status, gmailUnits: collected.gmailUnits }
}

// ── Board 214 read ────────────────────────────────────────────────────────────────────────────────────

/** The series board 214 lists, in its order (C6 Round 1, then the internal ones). */
export const BOARD_SEQUENCES = [
  'quotation',
  'enquiry',
  'supplier_rfq',
  'supplier_po',
  'order_ack',
  'proforma',
  'tax_invoice',
  'credit_note',
  'delivery_note',
  'packing_list',
  'order',
  'lead',
  'tender_query',
] as const

export interface SequenceRow {
  key: string
  label: string
  pattern: string
  revisionPattern: string | null
  scopeKind: ScopeKind
  next: string | null
  seeded: boolean
  continuity: ContinuityState
  lastCheckedAt: string | null
  detail: ContinuityDetail | null
  signoffStatus: string
  seedEvidence: unknown
}

/** One read of the sequences, then peek_number per row (a STABLE function, no locks). */
export async function listSequences(now = new Date()): Promise<SequenceRow[]> {
  const rows = await opsDb.numberSequence.findMany({
    where: { key: { in: [...BOARD_SEQUENCES] } },
  })
  const out: SequenceRow[] = []
  for (const key of BOARD_SEQUENCES) {
    const r = rows.find((x) => x.key === key)
    if (!r) continue
    const scope = r.scopeKind === 'parent' ? '' : currentScope(r.scopeKind as ScopeKind, now)
    const next = r.seededAt && r.scopeKind !== 'parent' ? await peek(opsDb, key, scope) : null
    out.push({
      key,
      label: r.label,
      pattern: r.pattern,
      revisionPattern: r.revisionPattern,
      scopeKind: r.scopeKind as ScopeKind,
      next,
      seeded: !!r.seededAt,
      continuity: r.continuityStatus as ContinuityState,
      lastCheckedAt: r.lastCheckedAt?.toISOString() ?? null,
      detail: (r.continuityDetail as ContinuityDetail | null) ?? null,
      signoffStatus: r.signoffStatus,
      seedEvidence: r.seedEvidence,
    })
  }
  return out
}

/** The proposed next number for a seed: one above the highest number any source has seen. */
export async function proposeSeed(
  key: string,
  now = new Date()
): Promise<{ next: number; formatted: string; perSource: { source: string; max: number }[] }> {
  const seq = await opsDb.numberSequence.findUniqueOrThrow({ where: { key } })
  const scope = currentScope(seq.scopeKind as ScopeKind, now)
  const [obs, issued] = await opsDb.$transaction([
    opsDb.externalNumberObservation.groupBy({
      by: ['source'],
      where: { sequenceKey: key, scope },
      _max: { value: true },
      orderBy: { source: 'asc' },
    }),
    opsDb.issuedNumber.aggregate({ where: { sequenceKey: key, scope }, _max: { value: true } }),
  ])
  const perSource = obs.map((o) => ({ source: o.source, max: Number(o._max?.value ?? 0) }))
  const max = Math.max(0, Number(issued._max.value ?? 0), ...perSource.map((p) => p.max))
  const next = max + 1
  return {
    next,
    formatted: formatNumber(seq.pattern, next, scope, seq.scopeKind as ScopeKind, seq.padTo),
    perSource,
  }
}

/** The next number a document kind would print, for previews ("INDUS/OA1001"); null while unseeded. */
export async function nextNumberFor(sequenceKey: string, now = new Date()): Promise<string | null> {
  const seq = await opsDb.numberSequence.findUnique({
    where: { key: sequenceKey },
    select: { scopeKind: true, seededAt: true },
  })
  if (!seq?.seededAt || seq.scopeKind === 'parent') return null
  return peek(opsDb, sequenceKey, currentScope(seq.scopeKind as ScopeKind, now))
}
