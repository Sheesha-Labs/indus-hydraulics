import 'server-only'
import {
  SAMPLE_TERMS_CONTEXT,
  termsForDocument,
  NUMERIC_VARIABLES,
  isTermsVariable,
  parseVariables,
  resolveTerms,
  variableValueError,
  type ResolvedTerm,
  type TermsValues,
} from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import { settingSubjectId } from '../settings/subject-id'

/**
 * Terms presets (S11-T06, board 39): a named set of clauses with the values each prints with ("Oil & gas · TPI":
 * 30% advance, balance 60 days, DAP site …). One live preset is the default for new clients; a client's own
 * preset sits on its client profile and every document it gets picks it up. A change on one order is logged
 * there and never changes the preset.
 */
type Actor = { kind: 'user'; id: string }
export const presetSubjectId = (id: string) => settingSubjectId(`terms_preset.${id}`)

/** A preset's values for one clause: only variables the clause uses, each valid. */
export async function setPresetValues(
  tx: Prisma.TransactionClient,
  presetId: string,
  clauseId: string,
  values: TermsValues,
  actor: Actor
): Promise<TermsValues> {
  const link = await tx.termsPresetClause.findUnique({
    where: { presetId_clauseId: { presetId, clauseId } },
    select: { variableValues: true, clause: { select: { body: true, code: true } } },
  })
  if (!link) throw new SafeError('That clause is not in this preset.')
  const { names } = parseVariables(link.clause.body)
  const clean: TermsValues = {}
  for (const [k, v] of Object.entries(values)) {
    if (v === undefined || String(v).trim() === '') continue
    if (!isTermsVariable(k) || !names.includes(k))
      throw new SafeError(`{${k}} is not used by ${link.clause.code}.`)
    const bad = variableValueError(k, v)
    if (bad) throw new SafeError(bad)
    clean[k] = NUMERIC_VARIABLES.has(k) ? Number(String(v).trim()) : String(v).trim()
  }
  await writeTracked(
    tx,
    {
      actor,
      subjectType: 'settings',
      subjectId: presetSubjectId(presetId),
      changes: [
        {
          field: `terms_preset.${link.clause.code}.values`,
          before: link.variableValues,
          after: clean,
          kind: 'terms',
        },
      ],
    },
    (t) =>
      t.termsPresetClause.update({
        where: { presetId_clauseId: { presetId, clauseId } },
        data: { variableValues: clean as Prisma.InputJsonValue },
      })
  )
  return clean
}

/** Put a clause in a preset, or take it out. */
export async function setPresetClause(
  tx: Prisma.TransactionClient,
  presetId: string,
  clauseId: string,
  member: boolean,
  actor: Actor
): Promise<void> {
  const clause = await tx.termsClause.findUniqueOrThrow({
    where: { id: clauseId },
    select: { code: true, archivedAt: true },
  })
  const has = await tx.termsPresetClause.findUnique({
    where: { presetId_clauseId: { presetId, clauseId } },
    select: { presetId: true },
  })
  if (!!has === member) return
  if (member && clause.archivedAt) throw new SafeError('That clause is archived.')
  await writeTracked(
    tx,
    {
      actor,
      subjectType: 'settings',
      subjectId: presetSubjectId(presetId),
      changes: [
        { field: `terms_preset.${clause.code}`, before: !member, after: member, kind: 'terms' },
      ],
    },
    async (t) => {
      if (!member)
        await t.termsPresetClause.delete({ where: { presetId_clauseId: { presetId, clauseId } } })
      else {
        const max = await t.termsPresetClause.aggregate({
          where: { presetId },
          _max: { position: true },
        })
        await t.termsPresetClause.create({
          data: { presetId, clauseId, position: (max._max.position ?? 0) + 1 },
        })
      }
    }
  )
}

/** Exactly one live preset is the default for new clients. */
export async function setDefaultPreset(
  tx: Prisma.TransactionClient,
  presetId: string,
  actor: Actor
): Promise<void> {
  const before = await tx.termsPreset.findFirst({
    where: { isDefaultForNewClient: true, archivedAt: null },
    select: { id: true, name: true },
  })
  const target = await tx.termsPreset.findUniqueOrThrow({
    where: { id: presetId },
    select: { name: true, archivedAt: true },
  })
  if (target.archivedAt) throw new SafeError('That preset is archived.')
  if (before?.id === presetId) return
  await writeTracked(
    tx,
    {
      actor,
      subjectType: 'settings',
      subjectId: settingSubjectId('terms_preset.default'),
      changes: [
        { field: 'terms_preset.default', before: before?.name ?? null, after: target.name, kind: 'terms' },
      ],
    },
    async (t) => {
      await t.termsPreset.updateMany({
        where: { isDefaultForNewClient: true },
        data: { isDefaultForNewClient: false },
      })
      await t.termsPreset.update({ where: { id: presetId }, data: { isDefaultForNewClient: true } })
    }
  )
}

export async function createPreset(
  tx: Prisma.TransactionClient,
  input: { name: string; description: string | null; clauseIds: string[] },
  actor: Actor
): Promise<{ id: string }> {
  const taken = await tx.termsPreset.findUnique({ where: { name: input.name }, select: { id: true } })
  if (taken) throw new SafeError('A preset with that name already exists.')
  const max = await tx.termsPreset.aggregate({ _max: { position: true } })
  const p = await tx.termsPreset.create({
    data: {
      name: input.name,
      description: input.description,
      position: (max._max.position ?? 0) + 1,
      clauses: {
        create: input.clauseIds.map((clauseId, i) => ({ clauseId, position: i + 1 })),
      },
    },
    select: { id: true },
  })
  await writeTracked(
    tx,
    {
      actor,
      subjectType: 'settings',
      subjectId: presetSubjectId(p.id),
      changes: [{ field: 'terms_preset', before: null, after: input, kind: 'terms' }],
    },
    async () => undefined
  )
  return p
}

/**
 * Give clients this preset (client_profile.termsPresetId), each change tracked on the client's own history.
 * Clients that already have it are left alone; a company without a client profile is refused.
 */
export async function assignPresetToClients(
  tx: Prisma.TransactionClient,
  presetId: string,
  companyIds: readonly string[],
  actor: Actor
): Promise<{ changed: number }> {
  const preset = await tx.termsPreset.findUniqueOrThrow({
    where: { id: presetId },
    select: { name: true, archivedAt: true },
  })
  if (preset.archivedAt) throw new SafeError('That preset is archived.')
  const rows = await tx.clientProfile.findMany({
    where: { companyId: { in: [...companyIds] } },
    select: { companyId: true, termsPresetId: true, termsPreset: { select: { name: true } } },
  })
  if (rows.length !== new Set(companyIds).size)
    throw new SafeError('Only clients can be given a terms preset.')
  let changed = 0
  for (const r of rows) {
    if (r.termsPresetId === presetId) continue
    changed++
    await writeTracked(
      tx,
      {
        actor,
        subjectType: 'company',
        subjectId: r.companyId,
        changes: [
          {
            field: 'client_profile.termsPreset',
            before: r.termsPreset?.name ?? null,
            after: preset.name,
            kind: 'terms',
          },
        ],
      },
      (t) =>
        t.clientProfile.update({ where: { companyId: r.companyId }, data: { termsPresetId: presetId } })
    )
  }
  return { changed }
}

/** A preset's terms resolved for a document (ops-core resolveTerms), from one read. */
export async function resolvePresetTerms(
  presetId: string,
  context: TermsValues = {},
  overrides: Readonly<Record<string, TermsValues>> = {}
): Promise<ResolvedTerm[]> {
  const p = await opsDb.termsPreset.findUnique({
    where: { id: presetId },
    select: {
      clauses: {
        where: { clause: { archivedAt: null } },
        select: {
          position: true,
          variableValues: true,
          clause: {
            select: {
              code: true,
              title: true,
              category: true,
              body: true,
              locked: true,
              approvalRule: true,
              variables: true,
            },
          },
        },
      },
    },
  })
  if (!p) throw new SafeError('That preset is no longer here.')
  return resolveTerms(
    {
      clauses: p.clauses.map((x) => ({
        ...x.clause,
        defaults: (x.clause.variables ?? {}) as TermsValues,
        values: (x.variableValues ?? {}) as TermsValues,
        position: x.position,
      })),
    },
    overrides,
    context
  )
}

/** The default preset's id (new clients, and previews without a client). */
export async function defaultPresetId(): Promise<string | null> {
  const p = await opsDb.termsPreset.findFirst({
    where: { isDefaultForNewClient: true, archivedAt: null },
    select: { id: true },
  })
  return p?.id ?? null
}

/**
 * The default preset's terms as a client document prints them, on a sample enquiry (Settings › Document
 * templates preview). Null when there is no default preset.
 */
export async function previewTerms(): Promise<{ label: string; text: string }[] | null> {
  const id = await defaultPresetId()
  if (!id) return null
  return termsForDocument(await resolvePresetTerms(id, SAMPLE_TERMS_CONTEXT))
}
