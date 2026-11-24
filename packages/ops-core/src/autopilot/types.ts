import type { AutopilotMode } from './presets'

/**
 * Shared Autopilot types (S07-T01, ADR-10, 08-map §2.3). Pure data: the server reads the rows and the
 * calendar, ops-core decides.
 */

/** Where the work came from. Only live (and a person's own manual request) may cause an effect. */
export type ActionOrigin = 'live' | 'backfill' | 'import' | 'manual'

/** The month's AI budget as the reservation function sees it (ops-ai budgetState). */
export type BudgetState = 'ok' | 'warn80' | 'research_paused' | 'hard_stop'

/** Careful, Balanced, Hands-off, or Custom once any row differs from its preset (D17). */
export type AutopilotModeOrCustom = AutopilotMode | 'custom'

/**
 * Why an action does not run at all:
 *   origin    history (backfill, import) never causes an effect (S20 has its own path)
 *   never     fixed at Never (#32), or refused by a rule (pricing under the hard minimum)
 *   off       switched off in Autopilot
 *   escalate  a rule says stop and ask a person to act (#13 after the last chaser)
 *   paused    the Owner paused the Assistant
 *   budget    the AI budget (hard stop, research paused) or the per-enquiry research cap
 */
export type BlockReason = 'origin' | 'never' | 'off' | 'escalate' | 'paused' | 'budget'

/** A send that keeps its level but waits for its slot. */
export type QueueReason = 'working_hours' | 'cap'
