import type { $Enums, Prisma } from '@indus/ops-db'
import type { ActionOrigin } from '@indus/ops-core'
import type { AiPurpose, Route, StructuredCallInput, StructuredResult } from '@indus/ops-ai'

/**
 * One Assistant action, from classifying an email to drafting a quotation (S05-T02, ADR-09). The runner
 * (runner.ts) calls these in order, each in its own Inngest step:
 *
 *   gather    DB reads only: the input and the versions of everything it read (→ basisHash)
 *   propose   model calls only (through `ai`), no DB transaction open
 *   verify    deterministic checks in code; decides confidence and anything Unsure
 *   toProposal  the immutable proposal the log, Review and Why? show
 *   effect    one DB transaction; every business-data change goes through writeTracked
 *   undo      optional, for an internal effect inside its undo window
 *
 * Inputs and outputs cross Inngest step boundaries, so they must be plain JSON.
 */

export type Json = Prisma.InputJsonValue

export type CheckStatus = 'pass' | 'warn' | 'fail'
export interface Check {
  label: string
  status: CheckStatus
  detail?: string
}

export interface UnsureItem {
  /** What is unsure, e.g. "company" or "classification". */
  field: string
  why: string
}

export interface ProposalReason {
  text: string
  /** `ops.source_span` ids the reason cites (S05-T04 resolves quotes into spans). */
  spanIds?: string[]
}

export interface ProposalOption {
  key: string
  label: string
  consequence: string
}

export interface ProposalDraft {
  headline: string
  reasons: ProposalReason[]
  preview?: Json | null
  checks: Check[]
  confidence: $Enums.Confidence
  unsureAbout?: string | null
  onApproveText?: string | null
  options?: ProposalOption[] | null
}

export interface Verified<Out> {
  out: Out
  checks: Check[]
  confidence: $Enums.Confidence
  unsure?: UnsureItem[]
}

export interface ActionRequest {
  actionKey: string
  subjectType: $Enums.RecordType
  subjectId: string
  enquiryId?: string | null
  /** What started it: 'mail.synced', 'person', 'cron' … */
  trigger: string
  origin: ActionOrigin
  /** Changes when the subject changes, so a new version is a new action (idempotency key). */
  sourceVersion: string | number
  /** For external actions: the mailbox the effect would use. */
  mailboxId?: string | null
}

export interface GatherContext {
  request: ActionRequest
}

/** The model helper `propose` receives: structuredCall with the ledger, transport and ids already bound. */
export interface ActionAi {
  call<T>(
    args: Pick<
      StructuredCallInput<T>,
      'system' | 'user' | 'zod' | 'jsonSchema' | 'maxTokens' | 'promptVersion' | 'model' | 'effort'
    > & { route: Route; purpose?: AiPurpose }
  ): Promise<StructuredResult<T>>
}

export interface EffectContext {
  actionId: string
  ref: string
  request: ActionRequest
  level: $Enums.AutopilotLevel
}

export interface EffectResult {
  /** A one-line note for the activity trail. */
  note?: string
  /** False when the effect cannot be undone (an email that left). */
  undoable?: boolean
}

export interface ActionDefinition<In extends Json = Json, Out extends Json = Json> {
  key: string
  /** The autopilot group, for logs. */
  group: $Enums.AutopilotGroup
  aiPurpose: AiPurpose
  /** The effect reaches outside Indus (email). External effects go through the send queue. */
  external: boolean
  /** Runs of the same group share a per-group budget of attention (logs, counters). */
  concurrencyGroup: string
  surface: 'review' | 'mail_unsure' | 'hint'
  /** Model work the action will do, for the run's estimate (logs only; the ledger reserves per call). */
  estimate(input: In): { chars: number; maxTokens: number }
  gather(ctx: GatherContext): Promise<{ input: In; versions: Record<string, string | number> }>
  propose(input: In, ai: ActionAi): Promise<ProposeOutcome<Out>>
  verify(out: Out, input: In): Promise<Verified<Out>>
  toProposal(verified: Verified<Out>, input: In): ProposalDraft
  effect(
    tx: Prisma.TransactionClient,
    verified: Verified<Out>,
    ctx: EffectContext
  ): Promise<EffectResult>
  undo?(tx: Prisma.TransactionClient, action: { id: string; output: Out }): Promise<void>
}

/** What `propose` returns: the output, or why there is none (budget, refusal, invalid, max_tokens). */
export type ProposeOutcome<Out> =
  | {
      ok: true
      out: Out
      costUsd: string
      model: string | null
      promptVersion: string | null
      callIds: string[]
    }
  | { ok: false; reason: string; detail: string; costUsd: string; callIds: string[] }
