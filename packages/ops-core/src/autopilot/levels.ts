import type { AutopilotLevel } from '../state/labels'
import type { ActionKey } from './keys'

/**
 * Autopilot levels (ADR-10). The stored vocabulary is `AUTOPILOT_LEVELS` (state/labels.ts, the
 * `ops."AutopilotLevel"` enum). Autonomy order runs off < suggest < draft_and_ask < do_and_tell <
 * do_quietly; `never` sits outside the order and means "no path at all" (only #32). The database
 * mirrors the order in `ops.autonomy_rank()` and enforces locks and caps in `ops.locked_level_guard()`.
 */

/** The ordered levels, least autonomous first. `never` is not among them. */
export const AUTONOMY_ORDER = [
  'off',
  'suggest',
  'draft_and_ask',
  'do_and_tell',
  'do_quietly',
] as const satisfies readonly AutopilotLevel[]

export type OrderedLevel = (typeof AUTONOMY_ORDER)[number]

export function isOrderedLevel(level: AutopilotLevel): level is OrderedLevel {
  return level !== 'never'
}

/** 0 (off) … 4 (do_quietly); null for `never`, which has no rank. */
export function autonomyRank(level: AutopilotLevel): number | null {
  return isOrderedLevel(level) ? AUTONOMY_ORDER.indexOf(level) : null
}

/**
 * Negative when `a` is less autonomous than `b`, 0 when equal, positive when more. `never` ranks below
 * everything (it allows nothing), so comparing with it is still total.
 */
export function compareLevels(a: AutopilotLevel, b: AutopilotLevel): number {
  return (autonomyRank(a) ?? -1) - (autonomyRank(b) ?? -1)
}

/** `level` is above `max` in autonomy order. */
export function isAbove(level: AutopilotLevel, max: AutopilotLevel): boolean {
  return compareLevels(level, max) > 0
}

/** The less autonomous of the two. */
export function lowerOf(a: AutopilotLevel, b: AutopilotLevel): AutopilotLevel {
  return compareLevels(a, b) <= 0 ? a : b
}

/**
 * Fixed rules (ADR-10, apps/ops/CLAUDE.md §9.2): code constants, never data. A row in the database
 * cannot loosen them; `validateLevel` and `presetLevels` read them first.
 */
export const FIXED_RULES = {
  send_quotation: 'draft_and_ask',
  supplier_pos: 'draft_and_ask',
  supplier_payments: 'never',
} as const satisfies Partial<Record<ActionKey, AutopilotLevel>>

/**
 * Every seeded row with a `lockedLevel`: the fixed rules plus the system actions that always ask
 * (§4.6, Appendix F.3). Code and the catalogue seed must agree (catalogue guard test).
 */
export const LOCKED_LEVELS = {
  ...FIXED_RULES,
  decide_equivalent: 'draft_and_ask',
  claim_draft: 'draft_and_ask',
  cancel_reissue_document: 'draft_and_ask',
  revert_change: 'draft_and_ask',
  bank_change_alert: 'do_and_tell',
} as const satisfies Partial<Record<ActionKey, AutopilotLevel>>

/**
 * Every seeded row with a `maxLevel`: the priced client sends #26, #27, #31 and the client-facing
 * system sends that may be lowered but never raised past Draft and ask.
 */
export const MAX_LEVELS = {
  order_ack_proforma: 'draft_and_ask',
  advance_reminders: 'draft_and_ask',
  payment_reminders: 'draft_and_ask',
  regret_client: 'draft_and_ask',
  correction_email: 'draft_and_ask',
  manual_reply: 'draft_and_ask',
} as const satisfies Partial<Record<ActionKey, OrderedLevel>>

export function fixedRule(key: string): AutopilotLevel | null {
  return (FIXED_RULES as Partial<Record<string, AutopilotLevel>>)[key] ?? null
}
