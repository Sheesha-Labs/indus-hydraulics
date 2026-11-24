// Assistant kit types (05-map-frontend §3.11). One ProposalCard renders every Assistant proposal (ADR-09);
// these props replace the kit's string props (why "text~evidence", checks "ok~text~right", options …).
import type { Result } from '@indus/ops-core'
import type { ReactNode } from 'react'
import type { Confidence, FileType, LinkSpec } from '../types'

// The verbs return the shared Result<T> every defineAction returns (CLAUDE.md §6.2).
export type { Result } from '@indus/ops-core'

/** Opens /why/[evidenceId]; the @drawer slot intercepts it from S02. */
export interface EvidenceLink {
  label: string
  evidenceId: string
}
export interface WhyReason {
  text: ReactNode
  evidence?: EvidenceLink
}
export interface CheckItem {
  key: string
  mark: 'ok' | 'warn' | 'bad' | 'n'
  text: ReactNode
  right?: ReactNode
}
export interface PreviewLine {
  key: string
  text: ReactNode
  kind?: 'plain' | 'bold' | 'muted' | 'link'
  href?: string
}
export interface OptionItem {
  value: string
  title: string
  sub?: string
  tag?: string
  suggested?: boolean
}

export type ProposalState = 'open' | 'approved' | 'rejected' | 'collapsed'
export type AutonomyLevel = 'Off' | 'Suggest' | 'Draft and ask' | 'Do and tell' | 'Do quietly'

/** When Later brings the card back. Presets are resolved on the server against the working calendar. */
export type LaterUntil = 'in-1h' | 'tomorrow-0900' | 'monday-0900' | Date

export interface ProposalActionsInput {
  /** The four verbs, as server actions bound to the proposal id and version by the page. */
  approve: (input: {
    optionValue?: string
    toggle?: boolean
    /** (decision) The selected reason chip on a card with `reasonChips`; the plan's input had no slot for it. */
    chip?: string
  }) => Promise<Result<{ undoRemainingMs?: number }>>
  /** Opens the editor surface (RFQ drafts, quotation). */
  edit?: { href: string }
  /** `redraft`: "Reject and redraft" asks the Assistant for a new draft with the reason (board 103). */
  reject: (input: { reason: string; chip?: string; redraft?: boolean }) => Promise<Result<void>>
  later: (input: { until: LaterUntil }) => Promise<Result<void>>
  undo?: () => Promise<Result<void>>
  /** (decision) Reopens a rejected card; the Reopen button shows only when it is given. */
  reopen?: () => Promise<Result<void>>
}

export interface ProposalCardProps {
  /** Assistant action id, e.g. A-26-11-20-0001. */
  id: string
  /** Action tag: "Send supplier RFQs". */
  type: string
  /** "ENQ-2026-0001 · IH-RFQ-2611-P01". */
  record?: LinkSpec
  /** "Asks you" | "Does it, tells you" | "Locked · you send". A locked level never approves from the keyboard. */
  level?: { label: string; locked?: boolean }
  /** Shown as "12 min", relative, updated client-side each minute. */
  createdAt: Date
  /** Verb + object. */
  headline: string
  /** 2–4 reasons. */
  why?: WhyReason[]
  preview?: { title: string; lines: PreviewLine[] }
  /** Qualification signals (P15). */
  signals?: CheckItem[]
  checks?: CheckItem[]
  toggle?: { name: string; label: string; defaultOn: boolean }
  /** Kit chipsK/chips. */
  reasonChips?: { label: string; options: { value: string; label: string }[]; value?: string }
  aside?: ReactNode
  /** Kit optionsK/options/chosen. */
  options?: { legend?: string; items: OptionItem[]; value?: string }
  confidence?: { level: Confidence; reason?: string }
  onApproveText?: { label?: string; text: string }
  state: ProposalState
  /**
   * Who decided and when. (decision) `undoRemainingMs` is the server's figure for a card rendered inside
   * its undo window, so a reloaded approved card still shows Undo; omitted once the window has closed.
   */
  decided?: { by: string; at: Date; note?: string; undoRemainingMs?: number }
  compact?: boolean
  raised?: boolean
  /** The four verbs. Quotation cards set batchable=false; only chasers batch (behaviour.md). */
  actions: ProposalActionsInput
  /** "Approve and send", "Review and send" (collapsed quotation). Default "Approve". */
  approveLabel?: string
  /**
   * Approve shows but cannot be pressed (board 110: the card changed under you; choose a version first). The
   * other verbs stay; ⌘↵ does nothing.
   */
  approveDisabled?: boolean
  batchable?: boolean
  /** Helper read-only (money and quotation cards): every action is hidden. The server enforces it too. */
  readOnly?: boolean
  /** Footer note on the right of an open card. */
  note?: string
  className?: string
}

export interface ConfidenceLineProps {
  level: Confidence
  reason?: string
  className?: string
}
export interface OptionCardProps extends OptionItem {
  name: string
  checked: boolean
  onChange: (v: string) => void
  className?: string
}
export interface HighlightProps {
  text: string
  match: string
  active?: boolean
  /** Where the match starts in `text` (a resolved span's offset); default: its first occurrence. */
  at?: number
}
export interface SourceQuoteProps {
  fileType: FileType
  doc: string
  meta?: string
  text: string
  match: string
  /** Where the match starts in `text`; default: its first occurrence. */
  matchAt?: number
  location: string
  openHref: string
  /** The span a Why? reason link opened (accent outline); default true. */
  active?: boolean
  className?: string
}
export interface UnsureRowProps {
  question: string
  reason?: string
  /** Default: Decide (primary) and Not now, wired to onDecide / onNotNow. */
  actions?: ReactNode
  onDecide?: () => void
  onNotNow?: () => void
  className?: string
}
