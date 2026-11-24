import 'server-only'
import { createHash } from 'node:crypto'
import { opsDb, Prisma, type $Enums } from '@indus/ops-db'
import {
  ASKED_BECAUSE,
  countedHits,
  mailboxCanSend,
  resolveLevel,
  type BudgetState,
  type ResolvedLevel,
} from '@indus/ops-core'
import { budgetState, monthKey, structuredCall, type BudgetMode } from '@indus/ops-ai'
import { basisHash as coreBasisHash, parseProposal } from '@indus/ops-core'
import { aiLedger } from './ai-ledger'
import { bumpCounters, setCounters } from './live-counter'
import { assistantTransport } from './model'
import { actionDefinition } from './registry'
import type { ActionRequestedData } from './request'
import { isAssistantPaused } from './state'
import type {
  ActionAi,
  ActionDefinition,
  EffectEvent,
  Json,
  ProposeOutcome,
  Verified,
  ProposalDraft,
} from './types'
import { allocateActionRef } from './action-number'
import { guardrailContextFor } from './guardrail-context'
import { SETTINGS } from '../settings/registry'
import { setActor } from './write-tracked'

/**
 * The action runner (S05-T02, ADR-09, 08-map-integrations §2.2): the steps `ops.assistant.run` executes, one
 * Inngest step each. Which steps touch the database:
 *
 *   resolve   DB read   def + setting (one query), pause row, budget row, mailbox status
 *   gather    DB read   the action's own reads; basisHash = sha256 of the sorted versions
 *   propose   no DB transaction: model calls through structuredCall (the ledger's short statements only)
 *   verify    no DB     deterministic checks
 *   decide    DB write  one transaction: allocate the ref, insert the immutable action (or return the
 *                       existing one for a replayed idempotency key)
 *   effect    DB write  one transaction: def.effect through writeTracked; running → done (or failed)
 *   record    DB write  live counters
 */

export class UnknownActionError extends Error {
  constructor(key: string) {
    super(`No action definition registered for "${key}"`)
    this.name = 'UnknownActionError'
  }
}

export function definitionOf(key: string): ActionDefinition<Json, Json> {
  const def = actionDefinition(key)
  if (!def) throw new UnknownActionError(key)
  return def
}

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')

/** sha256 of the sorted versions (ops-core basisHash; the same text the S05 runner hashed). */
export function basisHash(versions: Record<string, string | number>): string {
  return coreBasisHash(versions, sha256)
}

// ── resolve ──────────────────────────────────────────────────────────────────────────────

export type ResolveOutcome = ResolvedLevel & { purposeResearch: boolean }

export async function currentBudgetState(now: Date): Promise<BudgetState> {
  const row = await opsDb.aiBudget.findUnique({
    where: { month: new Date(`${monthKey(now)}T00:00:00Z`) },
    select: { limitUsd: true, spentUsd: true, mode: true },
  })
  if (!row) return 'ok'
  return budgetState({
    limitUsd: row.limitUsd.toFixed(4),
    spentUsd: row.spentUsd.toFixed(6),
    mode: row.mode as BudgetMode,
  })
}

let budgetCache: { at: number; month: string; value: BudgetState } | null = null
const BUDGET_TTL_MS = 60_000

/**
 * The month's budget state for display (the Assistant panel's box, S06-T08), read at most once a minute per
 * server. It never decides a model call: every call still reserves budget first (ai_budget_reserve), so a
 * minute-old "ok" cannot spend past the limit.
 */
export async function displayBudgetState(now = new Date()): Promise<BudgetState> {
  const month = monthKey(now)
  if (budgetCache && budgetCache.month === month && Date.now() - budgetCache.at < BUDGET_TTL_MS)
    return budgetCache.value
  const value = await currentBudgetState(now)
  budgetCache = { at: Date.now(), month, value }
  return value
}

/**
 * The Autopilot mode label (careful | balanced | hands_off | custom). Read straight from the row (one indexed
 * read; the settings cache is a request-time helper and the runner runs in Inngest steps). Only used when an
 * action has no setting row; Careful when the row is missing or unreadable.
 */
async function currentMode() {
  const row = await opsDb.settingsEntry.findUnique({
    where: { key: 'assistant.mode' },
    select: { value: true },
  })
  const parsed = SETTINGS['assistant.mode'].schema.safeParse(row?.value)
  return parsed.success ? parsed.data.mode : 'careful'
}

export async function resolveRun(
  data: ActionRequestedData,
  now = new Date()
): Promise<ResolveOutcome> {
  const def = definitionOf(data.actionKey)
  const row = await opsDb.autopilotActionDef.findUnique({
    where: { key: data.actionKey },
    select: {
      key: true,
      configurable: true,
      lockedLevel: true,
      maxLevel: true,
      defaultCareful: true,
      defaultBalanced: true,
      defaultHandsOff: true,
      setting: { select: { level: true, rules: true } },
    },
  })
  if (!row) throw new UnknownActionError(data.actionKey)
  const [paused, budget, mailbox, mode, guard] = await Promise.all([
    isAssistantPaused(),
    currentBudgetState(now),
    def.external && data.mailboxId
      ? opsDb.mailbox.findUnique({ where: { id: data.mailboxId }, select: { status: true } })
      : Promise.resolve(null),
    currentMode(),
    guardrailContextFor(def, data, now),
  ])
  const research = def.aiPurpose === 'research'
  const resolved = resolveLevel({
    def: row,
    external: def.external,
    research,
    configuredLevel: row.setting?.level ?? null,
    rules: (row.setting?.rules as Record<string, unknown> | null) ?? null,
    mode,
    ctx: guard.ctx,
    guardrails: guard.guardrails,
    state: {
      origin: data.origin,
      paused,
      budget,
      mailboxLive: mailbox ? mailboxCanSend(mailbox.status) : !def.external,
    },
  })
  return { ...resolved, purposeResearch: research }
}

// ── gather ───────────────────────────────────────────────────────────────────────────────

export async function gatherRun(
  data: ActionRequestedData
): Promise<{ input: Json; versions: Record<string, string | number>; basisHash: string }> {
  const def = definitionOf(data.actionKey)
  const { input, versions } = await def.gather({ request: data })
  return { input, versions, basisHash: basisHash(versions) }
}

// ── propose ──────────────────────────────────────────────────────────────────────────────

export function actionAi(data: ActionRequestedData): ActionAi {
  return {
    call: (args) =>
      structuredCall({
        ...args,
        enquiryId: data.enquiryId ?? null,
        actionId: null,
        ledger: aiLedger,
        transport: assistantTransport(),
      }),
  }
}

export async function proposeRun(
  data: ActionRequestedData,
  input: Json,
  ai: ActionAi = actionAi(data)
): Promise<ProposeOutcome<Json>> {
  return definitionOf(data.actionKey).propose(input, ai)
}

// ── verify ───────────────────────────────────────────────────────────────────────────────

export async function verifyRun(
  data: ActionRequestedData,
  out: Json,
  input: Json
): Promise<Verified<Json>> {
  return definitionOf(data.actionKey).verify(out, input)
}

// ── decide ───────────────────────────────────────────────────────────────────────────────

export interface DecideInput {
  data: ActionRequestedData
  resolved: ResolvedLevel
  basisHash: string
  input: Json
  proposal:
    | {
        ok: true
        verified: Verified<Json>
        costUsd: string
        model: string | null
        promptVersion: string | null
        callIds: string[]
      }
    | { ok: false; reason: string; detail: string; costUsd: string; callIds: string[] }
}

export interface Decided {
  actionId: string
  ref: string
  state: $Enums.ActionState
  created: boolean
}

const ASKS = new Set<$Enums.AutopilotLevel>(['suggest', 'draft_and_ask'])

/** proposed for Suggest / Draft and ask or anything Unsure; running for Do and tell / Do quietly. */
export function initialState(
  level: $Enums.AutopilotLevel,
  unsure: boolean
): 'proposed' | 'running' {
  return ASKS.has(level) || unsure ? 'proposed' : 'running'
}

export async function decideRun(d: DecideInput, now = new Date()): Promise<Decided> {
  const def = definitionOf(d.data.actionKey)
  const existing = await opsDb.assistantAction.findUnique({
    where: { idempotencyKey: d.data.idempotencyKey },
    select: { id: true, ref: true, state: true },
  })
  if (existing)
    return { actionId: existing.id, ref: existing.ref, state: existing.state, created: false }

  const p = d.proposal
  const draft = p.ok ? def.toProposal(p.verified, d.input) : null
  // S06-T01: the proposal must fit its kind's schema, or nothing is shown from it.
  const invalid = draft ? proposalProblem(def.key, def.surface, draft) : null
  const asks = p.ok ? def.alwaysAsk : undefined
  const state: $Enums.ActionState = invalid
    ? 'failed'
    : p.ok
      ? asks
        ? 'proposed'
        : initialState(
            d.resolved.level,
            (p.verified.unsure?.length ?? 0) > 0 || p.verified.confidence === 'unsure'
          )
      : 'failed'
  const levelReasons = asks
    ? [...d.resolved.reasons, `${ASKED_BECAUSE}${asks.reason}`]
    : d.resolved.reasons
  // S07-T01: every guardrail that fired is on the row and counted on board 100 (rules are not counted).
  const counted = countedHits(d.resolved)
  const guardrailKeys = [
    ...new Set([...counted.map((h) => h.key), ...(asks ? [asks.guardrail] : [])]),
  ]
  const inputs = {
    request: { ...d.data },
    aiCallIds: p.callIds,
  } as unknown as Prisma.InputJsonValue

  try {
    return await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'assistant' })
      const num = { formatted: await allocateActionRef(tx, now) }
      const row = await tx.assistantAction.create({
        data: {
          ref: num.formatted,
          actionKey: d.data.actionKey,
          levelAtTime: d.resolved.level,
          guardrails: guardrailKeys,
          enquiryId: d.data.enquiryId ?? null,
          subjectType: d.data.subjectType,
          subjectId: d.data.subjectId,
          headline: draft?.headline ?? `Could not ${def.key.replaceAll('_', ' ')}`,
          reasons: (draft?.reasons ?? [
            { text: p.ok ? '' : p.detail },
          ]) as unknown as Prisma.InputJsonValue,
          preview: draft?.preview ? (draft.preview as Prisma.InputJsonValue) : Prisma.DbNull,
          checks: (draft?.checks ?? []) as unknown as Prisma.InputJsonValue,
          confidence: draft?.confidence ?? null,
          unsureAbout: draft?.unsureAbout ?? null,
          onApproveText: draft?.onApproveText ?? null,
          options: draft?.options
            ? (draft.options as unknown as Prisma.InputJsonValue)
            : Prisma.DbNull,
          inputs,
          output: p.ok ? (p.verified.out as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
          state,
          failureReason: invalid ? `proposal: ${invalid}`.slice(0, 300) : p.ok ? null : p.reason,
          costUsd: p.costUsd,
          basisHash: d.basisHash,
          idempotencyKey: d.data.idempotencyKey,
          origin: d.data.origin,
          model: p.ok ? p.model : null,
          promptVersion: p.ok ? p.promptVersion : null,
          levelReasons: levelReasons as unknown as Prisma.InputJsonValue,
          surface: def.surface,
          redraftOfId: d.data.redraftOfId ?? null,
          correctionOfId: d.data.correctionOfId ?? null,
        },
        select: { id: true, ref: true, state: true },
      })
      if (counted.length > 0) {
        await tx.guardrailTrigger.createMany({
          data: counted.map((h) => ({
            guardrailKey: h.key,
            actionId: row.id,
            actionKey: d.data.actionKey,
            effect: h.effect,
            text: h.text,
            at: now,
          })),
        })
      }
      // S06: the card this redraft replaces points at it.
      if (d.data.redraftOfId) {
        await tx.assistantAction.updateMany({
          where: { id: d.data.redraftOfId, supersededById: null },
          data: { supersededById: row.id },
        })
      }
      return { actionId: row.id, ref: row.ref, state: row.state, created: true }
    })
  } catch (e) {
    // Two runs raced past the read above: the unique idempotency key kept one. Return it.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const row = await opsDb.assistantAction.findUniqueOrThrow({
        where: { idempotencyKey: d.data.idempotencyKey },
        select: { id: true, ref: true, state: true },
      })
      return { actionId: row.id, ref: row.ref, state: row.state, created: false }
    }
    throw e
  }
}

/** Why a drafted proposal does not fit its kind (S06-T01), or null. */
export function proposalProblem(
  actionKey: string,
  surface: string,
  draft: ProposalDraft
): string | null {
  const out = parseProposal(actionKey, {
    headline: draft.headline,
    reasons: draft.reasons,
    checks: draft.checks,
    confidence: draft.confidence,
    unsureAbout: draft.unsureAbout ?? null,
    options: draft.options ?? null,
    onApproveText: draft.onApproveText ?? null,
    preview: draft.preview ?? null,
    surface,
  })
  return out.ok ? null : `${out.kind}: ${out.error}`
}

// ── effect ───────────────────────────────────────────────────────────────────────────────

async function internalUndoMinutes(): Promise<number> {
  const row = await opsDb.settingsEntry.findUnique({
    where: { key: 'assistant.internal_undo_minutes' },
    select: { value: true },
  })
  const v = (row?.value as { minutes?: unknown } | null)?.minutes
  return typeof v === 'number' && v > 0 && v <= 60 ? v : 5
}

export type EffectOutcome = {
  state: 'done' | 'failed' | 'skipped'
  failureReason?: string
  emit?: EffectEvent[]
}

/** Runs the effect of a `running` action once. Any other state is skipped, so a retried step never repeats it. */
export async function effectRun(actionId: string, now = new Date()): Promise<EffectOutcome> {
  const action = await opsDb.assistantAction.findUniqueOrThrow({
    where: { id: actionId },
    select: {
      id: true,
      ref: true,
      actionKey: true,
      state: true,
      levelAtTime: true,
      output: true,
      checks: true,
      confidence: true,
      inputs: true,
    },
  })
  if (action.state !== 'running') return { state: 'skipped' }
  const def = definitionOf(action.actionKey)
  const request = (action.inputs as unknown as { request: ActionRequestedData }).request
  const verified: Verified<Json> = {
    out: action.output as unknown as Json,
    checks: (action.checks as Verified<Json>['checks'] | null) ?? [],
    confidence: action.confidence ?? 'likely',
  }
  const undoMinutes = def.external ? 0 : await internalUndoMinutes()

  try {
    return await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'assistant' })
      const result = await def.effect(tx, verified, {
        actionId: action.id,
        ref: action.ref,
        request,
        level: action.levelAtTime,
      })
      const undoable = !def.external && result.undoable !== false
      const emit = result.emit ?? []
      await tx.assistantAction.update({
        where: { id: action.id },
        data: {
          state: 'done',
          doneAt: now,
          undoUntil: undoable ? new Date(now.getTime() + undoMinutes * 60_000) : null,
        },
      })
      return emit.length ? { state: 'done' as const, emit } : { state: 'done' as const }
    })
  } catch (e) {
    const failureReason = e instanceof Error ? e.message.slice(0, 300) : 'The effect failed'
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'assistant' })
      await tx.assistantAction.updateMany({
        where: { id: action.id, state: 'running' },
        data: { state: 'failed', failureReason },
      })
    })
    return { state: 'failed', failureReason }
  }
}

/** For a new `proposed` action whose definition has onProposed: what the record shows while it waits. */
export async function proposedRun(actionId: string): Promise<{ emit: EffectEvent[] }> {
  const action = await opsDb.assistantAction.findUniqueOrThrow({
    where: { id: actionId },
    select: {
      id: true,
      ref: true,
      actionKey: true,
      state: true,
      levelAtTime: true,
      output: true,
      checks: true,
      confidence: true,
      inputs: true,
    },
  })
  const def = definitionOf(action.actionKey)
  if (action.state !== 'proposed' || !def.onProposed) return { emit: [] }
  const request = (action.inputs as unknown as { request: ActionRequestedData }).request
  const verified: Verified<Json> = {
    out: action.output as unknown as Json,
    checks: (action.checks as Verified<Json>['checks'] | null) ?? [],
    confidence: action.confidence ?? 'unsure',
  }
  const onProposed = def.onProposed.bind(def)
  return opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'assistant' })
    const r = await onProposed(tx, verified, {
      actionId: action.id,
      ref: action.ref,
      request,
      level: action.levelAtTime,
    })
    return { emit: r.emit ?? [] }
  })
}

// ── record ───────────────────────────────────────────────────────────────────────────────

export async function recordRun(outcome: {
  skipped?: boolean
  surface?: string
  actionKey?: string
}): Promise<void> {
  if (outcome.skipped) {
    await bumpCounters(['assistant.skipped'])
    return
  }
  const after = outcome.actionKey ? actionDefinition(outcome.actionKey)?.afterRecord : undefined
  if (after) await after()
  if (outcome.surface === 'review') {
    const pending = await opsDb.assistantAction.count({
      where: { surface: 'review', state: { in: ['proposed', 'later'] } },
    })
    await setCounters({ 'review.pending': pending })
  }
}
