import 'server-only'
import { fetchBatchResults, submitBatch, type BatchTransport } from '@indus/ops-ai'
import {
  groupSignals,
  learnedPreferencesSchema,
  lintPreferenceText,
  usableCandidates,
  valueRecord,
  preferenceBlock,
  rankPreferences,
  type LearnedPreferences,
  type SignalGroup,
} from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { z } from 'zod'
import { aiLedger } from './ai-ledger'
import { assistantBatchTransport } from './model'
import { learnUser, PROMPT_VERSION, SYSTEM_PARTS } from './prompts/learn-preferences.v1'

/**
 * Learned preferences (S07-T05, 08-map §2.10, D18):
 *
 *   buildPreferenceBlock   the ≤ 12 active preferences that apply to a run, for the user turn after the cached
 *                          system prefix (the system blocks never change). Never an input to resolveLevel,
 *                          verify or the send gate.
 *   startLearning          nightly: unconsumed signals → deterministic groups (≥ 3) → one Message Batches
 *                          submission (Haiku, learn-preferences@1), budget reserved first
 *   applyLearnBatches      every 10 minutes while a batch is open: results → lint → Preference rows (source
 *                          learned, strength = occurrences, evidence to the actions); a duplicate of an active
 *                          preference strengthens it; the group's signals are marked consumed
 */

const MODEL = 'claude-haiku-5-5'
const SIGNALS_PER_NIGHT = 2000

export async function buildPreferenceBlock(target: {
  actionKey: string
  companyId?: string | null
  mailboxId?: string | null
  tradeId?: string | null
}): Promise<string> {
  const rows = await opsDb.preference.findMany({
    where: {
      active: true,
      disabledAt: null,
      OR: [{ actionKey: null }, { actionKey: target.actionKey }],
    },
    orderBy: { updatedAt: 'desc' },
    take: 200,
    select: {
      id: true,
      scope: true,
      kind: true,
      description: true,
      companyId: true,
      tradeId: true,
      mailboxId: true,
      actionKey: true,
      strength: true,
      updatedAt: true,
    },
  })
  const kindFilter =
    target.actionKey === 'classify_mail'
      ? rows.filter((r) => r.kind === 'classification_rule')
      : rows
  return preferenceBlock(rankPreferences(kindFilter, target))
}

interface StoredGroup {
  customId: string
  key: string
  actionKey: string | null
  companyId: string | null
  mailboxId: string | null
  kind: string
  signalIds: string[]
  actionIds: string[]
}

function detailOf(payload: unknown): string {
  const text = JSON.stringify(payload ?? {})
  return text.length > 400 ? `${text.slice(0, 400)}…` : text
}

export async function startLearning(
  now = new Date(),
  deps: { transport?: BatchTransport | null } = {}
): Promise<{
  groups: number
  batchId: string | null
  skipped?: 'no_key' | 'no_groups' | 'budget'
}> {
  const signals = await opsDb.preferenceSignal.findMany({
    where: { consumedAt: null },
    orderBy: { createdAt: 'asc' },
    take: SIGNALS_PER_NIGHT,
    select: {
      id: true,
      kind: true,
      actionKey: true,
      actionId: true,
      companyId: true,
      mailboxId: true,
      payload: true,
      createdAt: true,
    },
  })
  // Signals already in an open batch are not sent twice.
  const open = await opsDb.preferenceLearnBatch.findMany({
    where: { status: { in: ['submitted', 'in_progress', 'ended'] } },
    select: { signalIds: true },
  })
  const inFlight = new Set(open.flatMap((b) => b.signalIds))
  const groups = groupSignals(signals.filter((s) => !inFlight.has(s.id)))
  if (!groups.length) return { groups: 0, batchId: null, skipped: 'no_groups' }
  const transport = deps.transport === undefined ? assistantBatchTransport() : deps.transport
  if (!transport) return { groups: groups.length, batchId: null, skipped: 'no_key' }
  const byId = new Map(signals.map((s) => [s.id, s]))
  const stored: StoredGroup[] = groups.map((g: SignalGroup, i) => ({
    customId: `g${i + 1}`,
    key: g.key,
    actionKey: g.actionKey,
    companyId: g.companyId,
    mailboxId: g.mailboxId,
    kind: g.kind,
    signalIds: g.signalIds,
    actionIds: g.actionIds,
  }))
  const jsonSchema = z.toJSONSchema(learnedPreferencesSchema) as Record<string, unknown>
  const out = await submitBatch({
    purpose: 'other',
    ledger: aiLedger,
    transport,
    now,
    requests: groups.map((g, i) => ({
      customId: `g${i + 1}`,
      params: {
        model: MODEL,
        maxTokens: 800,
        effort: 'low',
        system: SYSTEM_PARTS,
        jsonSchema,
        user: learnUser({
          actionKey: g.actionKey,
          scope: g.companyId ? 'counterparty' : g.mailboxId ? 'mailbox' : 'everyone',
          summary: g.summary,
          signals: g.signalIds.map((id) => ({
            id,
            kind: byId.get(id)?.kind ?? g.kind,
            detail: detailOf(byId.get(id)?.payload),
          })),
        }),
      },
    })),
  })
  if (!out.ok)
    return {
      groups: groups.length,
      batchId: null,
      skipped: out.reason === 'budget' ? 'budget' : 'no_groups',
    }
  await opsDb.preferenceLearnBatch.create({
    data: {
      anthropicBatchId: out.batchId,
      status: 'submitted',
      signalIds: groups.flatMap((g) => g.signalIds),
      groups: {
        reservationId: out.reservationId,
        groups: stored,
      } as unknown as Prisma.InputJsonValue,
      submittedAt: now,
    },
  })
  return { groups: groups.length, batchId: out.batchId }
}

const CREATED_FROM: Record<string, string> = {
  edit: 'edit',
  reject: 'reject',
  override: 'override',
  unsure_choice: 'unsure_choice',
  sent_mail: 'sent_mail',
}

export interface ApplyReport {
  batches: number
  created: number
  strengthened: number
  dropped: Array<{ description: string; reason: string }>
}

/** Writes one learned candidate (or strengthens the active duplicate). Returns what happened. */
export async function writeLearned(
  tx: Prisma.TransactionClient,
  group: Pick<
    StoredGroup,
    'actionKey' | 'companyId' | 'mailboxId' | 'kind' | 'signalIds' | 'actionIds'
  >,
  p: LearnedPreferences['preferences'][number]
): Promise<'created' | 'strengthened' | { dropped: string }> {
  const why = lintPreferenceText(p.description)
  if (why) return { dropped: why }
  const companyScoped = p.scope === 'client' || p.scope === 'supplier'
  const where = {
    active: true,
    disabledAt: null,
    scope: p.scope,
    kind: p.kind,
    actionKey: group.actionKey,
    companyId: companyScoped ? group.companyId : null,
    mailboxId: p.scope === 'mailbox' ? group.mailboxId : null,
  }
  const same = await tx.preference.findFirst({
    where: { ...where, description: { equals: p.description, mode: 'insensitive' } },
    select: { id: true },
  })
  const occurrences = group.signalIds.length
  if (same) {
    await tx.preference.update({
      where: { id: same.id },
      data: { strength: { increment: occurrences }, evidenceCount: { increment: occurrences } },
    })
    if (group.actionIds.length)
      await tx.preferenceEvidence.createMany({
        data: group.actionIds.map((actionId) => ({ preferenceId: same.id, actionId })),
        skipDuplicates: true,
      })
    return 'strengthened'
  }
  const row = await tx.preference.create({
    data: {
      ...where,
      description: p.description,
      value: valueRecord(p.value) as Prisma.InputJsonValue,
      source: 'learned',
      createdFrom: CREATED_FROM[group.kind] ?? 'edit',
      strength: occurrences,
      evidenceCount: occurrences,
    },
    select: { id: true },
  })
  if (group.actionIds.length)
    await tx.preferenceEvidence.createMany({
      data: group.actionIds.map((actionId) => ({ preferenceId: row.id, actionId })),
      skipDuplicates: true,
    })
  return 'created'
}

export async function applyLearnBatches(
  now = new Date(),
  deps: { transport?: BatchTransport | null } = {}
): Promise<ApplyReport> {
  const report: ApplyReport = { batches: 0, created: 0, strengthened: 0, dropped: [] }
  const open = await opsDb.preferenceLearnBatch.findMany({
    where: {
      status: { in: ['submitted', 'in_progress', 'ended'] },
      anthropicBatchId: { not: null },
    },
    orderBy: { submittedAt: 'asc' },
    take: 5,
  })
  if (!open.length) return report
  const transport = deps.transport === undefined ? assistantBatchTransport() : deps.transport
  if (!transport) return report
  for (const b of open) {
    const meta = b.groups as unknown as { reservationId: string | null; groups: StoredGroup[] }
    let res
    try {
      res = await fetchBatchResults({
        batchId: b.anthropicBatchId!,
        reservationId: meta.reservationId ?? null,
        purpose: 'other',
        promptVersion: PROMPT_VERSION,
        zod: learnedPreferencesSchema,
        ledger: aiLedger,
        transport,
        now,
      })
    } catch (e) {
      await opsDb.preferenceLearnBatch.update({
        where: { id: b.id },
        data: {
          status: 'failed',
          endedAt: now,
          error: e instanceof Error ? e.message.slice(0, 300) : 'error',
        },
      })
      continue
    }
    if (!res.results) {
      if (b.status === 'submitted')
        await opsDb.preferenceLearnBatch.update({
          where: { id: b.id },
          data: { status: 'in_progress' },
        })
      continue
    }
    report.batches += 1
    const byCustom = new Map(meta.groups.map((g) => [g.customId, g]))
    await opsDb.$transaction(async (tx) => {
      for (const r of res.results!) {
        const g = byCustom.get(r.customId)
        if (!g || !r.ok) continue
        for (const p of usableCandidates(r.data)) {
          // Evidence must come from this group; anything else is not evidence.
          const evidence = p.evidenceSignalIds.filter((id) => g.signalIds.includes(id))
          if (!evidence.length) {
            report.dropped.push({
              description: p.description,
              reason: 'no evidence from the group',
            })
            continue
          }
          const out = await writeLearned(tx, g, p)
          if (out === 'created') report.created += 1
          else if (out === 'strengthened') report.strengthened += 1
          else report.dropped.push({ description: p.description, reason: out.dropped })
        }
      }
      await tx.preferenceSignal.updateMany({
        where: { id: { in: b.signalIds } },
        data: { consumedAt: now },
      })
      await tx.preferenceLearnBatch.update({
        where: { id: b.id },
        data: {
          status: 'applied',
          endedAt: now,
          ...(report.dropped.length
            ? { error: `dropped: ${report.dropped.map((d) => d.reason).join('; ')}`.slice(0, 500) }
            : {}),
        },
      })
    })
  }
  return report
}
