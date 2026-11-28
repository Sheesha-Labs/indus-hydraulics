import 'server-only'
import {
  NUMERIC_VARIABLES,
  approvalRuleSchema,
  isTermsCategory,
  isTermsVariable,
  parseApprovalRule,
  parseVariables,
  TERMS_CATEGORIES,
  variableValueError,
  type ApprovalRule,
  type TermsCategory,
  type TermsValues,
} from '@indus/ops-core'
import { opsDb, Prisma, type $Enums } from '@indus/ops-db'
import { z } from 'zod'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import { settingSubjectId } from '../settings/subject-id'

/**
 * Offer-term clauses (S11-T06, board 39). Controlled wording, content not code. A clause belongs to one category,
 * has `{variables}` with defaults, may carry an approval rule (evaluated in code, ops-core/terms) and may be
 * locked. LOCKED WORDING IS NEVER CHANGED BY THE ASSISTANT: an Assistant actor that tries to change a locked
 * clause's title or body is refused here, whatever the caller; only a person may. Every change is versioned
 * (expectedVersion) and recorded on the clause's history.
 */
export type TermsActor = { kind: 'user'; id: string } | { kind: 'assistant'; actionId?: string | null }

export class ClauseLockedError extends SafeError {
  constructor() {
    super('This wording is locked: only a person can change it.')
  }
}

export const clauseSubjectId = (code: string) => settingSubjectId(`terms_clause.${code}`)

const valuesSchema = z.record(z.string(), z.union([z.string().max(80), z.number().int()]))

/** Defaults for the clause's variables: only variables the body uses, each a valid value. */
export function checkDefaults(body: string, defaults: TermsValues): TermsValues {
  const { names, unknown } = parseVariables(body)
  if (unknown.length) throw new SafeError(`{${unknown[0]}} is not a variable.`)
  const out: TermsValues = {}
  for (const [k, v] of Object.entries(defaults)) {
    if (v === undefined || v === '') continue
    if (!isTermsVariable(k) || !names.includes(k)) continue
    const bad = variableValueError(k, v)
    if (bad) throw new SafeError(bad)
    out[k] = NUMERIC_VARIABLES.has(k) ? Number(String(v).trim()) : String(v).trim()
  }
  return out
}

export const clauseInputSchema = z.object({
  category: z.enum(TERMS_CATEGORIES),
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(3).max(600),
  defaults: valuesSchema.default({}),
  approvalRule: approvalRuleSchema.nullable().default(null),
  locked: z.boolean().default(false),
})
export type ClauseInput = z.infer<typeof clauseInputSchema>

/** The next free code in a category: P6 after P5, DOC4 after DOC3. */
async function nextCode(tx: Prisma.TransactionClient, category: TermsCategory): Promise<string> {
  const prefix = CODE_PREFIX[category]
  const rows = await tx.termsClause.findMany({
    where: { code: { startsWith: prefix } },
    select: { code: true },
  })
  const n = rows
    .map((r) => new RegExp(`^${prefix}(\\d+)$`).exec(r.code)?.[1])
    .filter(Boolean)
    .map(Number)
  return `${prefix}${Math.max(0, ...n) + 1}`
}

const CODE_PREFIX: Record<TermsCategory, string> = {
  payment: 'P',
  delivery: 'D',
  lead_time: 'L',
  validity: 'V',
  make_origin: 'M',
  vat: 'T',
  documents: 'DOC',
  inspection: 'I',
  warranty: 'W',
  packing: 'K',
  disclaimer: 'X',
  cancellation: 'C',
}

const actorOf = (a: TermsActor) =>
  a.kind === 'user' ? { kind: 'user' as $Enums.ActorKind, id: a.id } : { kind: 'assistant' as $Enums.ActorKind }

export async function createClause(
  tx: Prisma.TransactionClient,
  input: ClauseInput & { sourceRef?: string | null },
  actor: TermsActor
): Promise<{ id: string; code: string }> {
  if (actor.kind !== 'user') throw new SafeError('Only a person adds a clause.')
  const defaults = checkDefaults(input.body, input.defaults)
  const code = await nextCode(tx, input.category)
  const position =
    ((await tx.termsClause.aggregate({ where: { category: input.category }, _max: { position: true } }))
      ._max.position ?? 0) + 1
  return writeTracked(
    tx,
    {
      actor: actorOf(actor),
      subjectType: 'settings',
      subjectId: clauseSubjectId(code),
      changes: [
        { field: `terms_clause.${code}`, before: null, after: { ...input, defaults }, kind: 'terms' },
      ],
    },
    (t) =>
      t.termsClause.create({
        data: {
          code,
          category: input.category,
          title: input.title,
          body: input.body,
          variables: defaults as Prisma.InputJsonValue,
          // A null JSON column is left out rather than written as Prisma.DbNull: under next dev DbNull is
          // matched by class identity and can serialise as {} (see write-tracked.ts).
          ...(input.approvalRule ? { approvalRule: input.approvalRule } : {}),
          locked: input.locked,
          position,
          sourceRef: input.sourceRef ?? null,
          signoffStatus: 'not_required',
        },
        select: { id: true, code: true },
      })
  )
}

export const clausePatchSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  body: z.string().trim().min(3).max(600).optional(),
  defaults: valuesSchema.optional(),
  approvalRule: approvalRuleSchema.nullable().optional(),
  locked: z.boolean().optional(),
})
export type ClausePatch = z.infer<typeof clausePatchSchema>

/**
 * Change a clause. The Assistant may never change a locked clause's wording (title, body) nor unlock it. A
 * person's change signs off a seeded clause (ADR-28: the Owner has now chosen the wording).
 */
export async function updateClause(
  tx: Prisma.TransactionClient,
  id: string,
  patch: ClausePatch,
  expectedVersion: number,
  actor: TermsActor
): Promise<{ version: number }> {
  const c = await tx.termsClause.findUnique({ where: { id } })
  if (!c || c.archivedAt) throw new SafeError('That clause is no longer here.')
  if (actor.kind !== 'user') {
    const wording =
      (patch.title !== undefined && patch.title !== c.title) ||
      (patch.body !== undefined && patch.body !== c.body) ||
      patch.locked === false
    if (c.locked && wording) throw new ClauseLockedError()
  }
  if (c.version !== expectedVersion)
    throw new SafeError('Someone changed this clause a moment ago. Open it again.')
  const body = patch.body ?? c.body
  const defaults = checkDefaults(body, patch.defaults ?? ((c.variables ?? {}) as TermsValues))
  const before = {
    title: c.title,
    body: c.body,
    defaults: c.variables,
    approvalRule: c.approvalRule,
    locked: c.locked,
  }
  const after = {
    title: patch.title ?? c.title,
    body,
    defaults,
    approvalRule: patch.approvalRule === undefined ? c.approvalRule : patch.approvalRule,
    locked: patch.locked ?? c.locked,
  }
  const signoff =
    actor.kind === 'user' && c.signoffStatus === 'awaiting'
      ? { signoffStatus: 'signed_off' as const, signedOffById: actor.id, signedOffAt: new Date() }
      : {}
  await writeTracked(
    tx,
    {
      actor: actorOf(actor),
      ...(actor.kind === 'assistant' && actor.actionId ? { actionId: actor.actionId } : {}),
      subjectType: 'settings',
      subjectId: clauseSubjectId(c.code),
      changes: [{ field: `terms_clause.${c.code}`, before, after, kind: 'terms' }],
    },
    async (t) => {
      const moved = await t.termsClause.updateMany({
        where: { id, version: expectedVersion },
        data: {
          title: after.title,
          body: after.body,
          variables: defaults as Prisma.InputJsonValue,
          ...(after.approvalRule
            ? { approvalRule: after.approvalRule as Prisma.InputJsonValue }
            : {}),
          locked: after.locked,
          version: { increment: 1 },
          ...signoff,
        },
      })
      if (moved.count !== 1)
        throw new SafeError('Someone changed this clause a moment ago. Open it again.')
      // Clearing the rule: plain SQL NULL (no Prisma.DbNull, see above).
      if (!after.approvalRule)
        await t.$executeRaw`UPDATE ops.terms_clause SET "approvalRule" = NULL WHERE id = ${id}::uuid`
    }
  )
  return { version: expectedVersion + 1 }
}

/** "Lock wording so the Assistant cannot change it" for a whole category (board 39's switch). */
export async function setCategoryLock(
  tx: Prisma.TransactionClient,
  category: TermsCategory,
  locked: boolean,
  actor: { kind: 'user'; id: string }
): Promise<{ count: number }> {
  const rows = await tx.termsClause.findMany({
    where: { category, archivedAt: null, locked: !locked },
    select: { id: true, code: true },
  })
  for (const r of rows)
    await writeTracked(
      tx,
      {
        actor: actorOf(actor),
        subjectType: 'settings',
        subjectId: clauseSubjectId(r.code),
        changes: [
          { field: `terms_clause.${r.code}.locked`, before: !locked, after: locked, kind: 'terms' },
        ],
      },
      (t) =>
        t.termsClause.update({ where: { id: r.id }, data: { locked, version: { increment: 1 } } })
    )
  return { count: rows.length }
}

/** Make a clause its category's default (one per live category). */
export async function setDefaultClause(tx: Prisma.TransactionClient, id: string): Promise<void> {
  const c = await tx.termsClause.findUniqueOrThrow({ where: { id }, select: { category: true } })
  await tx.termsClause.updateMany({
    where: { category: c.category, isDefault: true },
    data: { isDefault: false },
  })
  await tx.termsClause.update({ where: { id }, data: { isDefault: true } })
}

/** Archive a clause; one still in a preset cannot go. */
export async function archiveClause(
  tx: Prisma.TransactionClient,
  id: string,
  actor: { kind: 'user'; id: string }
): Promise<void> {
  const c = await tx.termsClause.findUniqueOrThrow({
    where: { id },
    select: { code: true, _count: { select: { presets: true } } },
  })
  if (c._count.presets > 0) throw new SafeError('Take it out of its presets first.')
  await writeTracked(
    tx,
    {
      actor: actorOf(actor),
      subjectType: 'settings',
      subjectId: clauseSubjectId(c.code),
      changes: [{ field: `terms_clause.${c.code}.archived`, before: false, after: true, kind: 'terms' }],
    },
    (t) =>
      t.termsClause.update({ where: { id }, data: { archivedAt: new Date(), isDefault: false } })
  )
}

// ── Reads ─────────────────────────────────────────────────────────────────────────────────────────────

export interface ClauseView {
  id: string
  code: string
  category: TermsCategory
  title: string
  body: string
  defaults: TermsValues
  approvalRule: ApprovalRule | null
  locked: boolean
  isDefault: boolean
  sourceRef: string | null
  version: number
  signoffStatus: string
  /** Names of the presets that hold it, and their values for it. */
  presets: { id: string; name: string; values: TermsValues }[]
}

export interface PresetView {
  id: string
  name: string
  description: string | null
  isDefaultForNewClient: boolean
  signoffStatus: string
  clauseCodes: string[]
  clients: { id: string; name: string }[]
  clientCount: number
}

/** Board 39 in two reads: clauses with their presets, and presets with their clients. */
export async function getTermsLibrary(): Promise<{
  clauses: ClauseView[]
  presets: PresetView[]
  counts: Record<TermsCategory, number>
}> {
  const [clauses, presets] = await opsDb.$transaction([
    opsDb.termsClause.findMany({
      where: { archivedAt: null },
      orderBy: [{ category: 'asc' }, { position: 'asc' }, { code: 'asc' }],
      include: {
        presets: { select: { variableValues: true, preset: { select: { id: true, name: true, archivedAt: true } } } },
      },
    }),
    opsDb.termsPreset.findMany({
      where: { archivedAt: null },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      include: {
        clauses: { orderBy: { position: 'asc' }, select: { clause: { select: { code: true } } } },
        clients: {
          orderBy: { company: { name: 'asc' } },
          take: 3,
          select: { company: { select: { id: true, name: true } } },
        },
        _count: { select: { clients: true } },
      },
    }),
  ])
  const counts = Object.fromEntries(TERMS_CATEGORIES.map((c) => [c, 0])) as Record<TermsCategory, number>
  const views: ClauseView[] = []
  for (const c of clauses) {
    if (!isTermsCategory(c.category)) continue
    counts[c.category]++
    views.push({
      id: c.id,
      code: c.code,
      category: c.category,
      title: c.title,
      body: c.body,
      defaults: (c.variables ?? {}) as TermsValues,
      approvalRule: parseApprovalRule(c.approvalRule),
      locked: c.locked,
      isDefault: c.isDefault,
      sourceRef: c.sourceRef,
      version: c.version,
      signoffStatus: c.signoffStatus,
      presets: c.presets
        .filter((p) => !p.preset.archivedAt)
        .map((p) => ({ id: p.preset.id, name: p.preset.name, values: (p.variableValues ?? {}) as TermsValues })),
    })
  }
  return {
    clauses: views,
    counts,
    presets: presets.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      isDefaultForNewClient: p.isDefaultForNewClient,
      signoffStatus: p.signoffStatus,
      clauseCodes: p.clauses.map((x) => x.clause.code),
      clients: p.clients.map((x) => x.company),
      clientCount: p._count.clients,
    })),
  }
}
