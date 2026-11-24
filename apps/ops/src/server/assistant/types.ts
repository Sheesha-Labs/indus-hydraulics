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
  detail?: string | undefined
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
  /** S06: a redraft of this action (Reject and redraft, Redraft on a stale card). */
  redraftOfId?: string | null
  /** S06: the person's reason, for the redraft. */
  hint?: string | null
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

/** An event to send once the effect's transaction has committed (never from inside it). */
export interface EffectEvent {
  name: `ops/${string}`
  id?: string
  data: Record<string, string | number | boolean | null>
}

export interface EffectResult {
  /** A one-line note for the activity trail. */
  note?: string
  /** False when the effect cannot be undone (an email that left). */
  undoable?: boolean
  /** Sent by the runner after commit, in their own step. */
  emit?: EffectEvent[]
}

/**
 * The email an external action sends once a person approves it (S05-T07). Data only: the approval (S06
 * decisions) hands it to scheduleSend outside any transaction, with idempotency key `${actionId}:${version}`.
 */
export interface OutboundDraft {
  kind: $Enums.OutboundKind
  mailboxId: string
  to: string[]
  cc?: string[]
  subject: string
  bodyHtml: string
  bodyText: string
  /** A reply in this thread (same mailbox); null for a new message. */
  threadId: string | null
  inReplyToRfcId?: string | null
  referencesRfcIds?: string[]
  enquiryId?: string | null
  companyId?: string | null
  contactId?: string | null
  subjectType?: $Enums.RecordType | null
  subjectId?: string | null
}

/** In and Out must be plain JSON (they cross Inngest steps); not enforced by type so interfaces can be used. */
export interface ActionDefinition<In = Json, Out = Json> {
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
  /**
   * For a proposal (Review card or Unsure item): what the record shows while it waits for a person, e.g. a
   * message marked Unsure. Same rules as effect: one transaction, writeTracked.
   */
  onProposed?(
    tx: Prisma.TransactionClient,
    verified: Verified<Out>,
    ctx: EffectContext
  ): Promise<EffectResult>
  /** After every run: recount the live counters this action affects. */
  afterRecord?(): Promise<void>
  /**
   * A guardrail that always applies (e.g. the first email to anyone new): the action is proposed whatever
   * its level, and the guardrail is recorded on the row.
   */
  alwaysAsk?: { guardrail: string; reason: string }
  /** S06-T02: several may be approved at once from the BatchBar (chasers, Sure captures). Never a quotation. */
  batchable?: boolean
  /** External actions: the email to schedule on approval. */
  outbound?(verified: Verified<Out>, input: In): OutboundDraft | null
  /**
   * S06-T01: the same version keys `gather` returned, read again now (cheap reads only). Absent: the action is
   * never stale. A different hash means the record changed after drafting: approval is blocked until Redraft.
   */
  currentVersions?(request: ActionRequest): Promise<Record<string, string | number>>
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
