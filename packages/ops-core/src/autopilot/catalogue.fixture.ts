import type { AutopilotLevel } from '../state/labels'
import { GUARDRAIL_DEFAULTS, type GuardrailSetting } from './guardrails'
import { ACTION_KEYS, CAREFUL_SEND_EXCEPTIONS, sendsExternally } from './keys'
import { LOCKED_LEVELS, MAX_LEVELS } from './levels'
import type { ActionDefLevels } from './presets'

/**
 * Test fixture: one definition per seeded action key, shaped like the catalogue seed (locks and caps from
 * levels.ts; Careful asks for every external action; #1–#3 Do quietly). Not exported from the package.
 */
const QUIET = new Set(['classify_mail', 'link_mail', 'label_gmail'])

export function catalogueDefs(): ActionDefLevels[] {
  return ACTION_KEYS.map((key) => {
    const lock = (LOCKED_LEVELS as Partial<Record<string, AutopilotLevel>>)[key] ?? null
    const max = (MAX_LEVELS as Partial<Record<string, AutopilotLevel>>)[key] ?? null
    const external = sendsExternally(key)
    const careful: AutopilotLevel =
      lock ??
      (QUIET.has(key)
        ? 'do_quietly'
        : external && !Object.hasOwn(CAREFUL_SEND_EXCEPTIONS, key)
          ? 'draft_and_ask'
          : 'do_and_tell')
    const balanced: AutopilotLevel = lock ?? max ?? (QUIET.has(key) ? 'do_quietly' : 'do_and_tell')
    const handsOff: AutopilotLevel = lock ?? max ?? 'do_quietly'
    return {
      key,
      configurable: lock === null,
      lockedLevel: lock,
      maxLevel: max,
      defaultCareful: careful,
      defaultBalanced: balanced,
      defaultHandsOff: handsOff,
    }
  })
}

/** Every seeded guardrail, enabled, with its default params. */
export function defaultGuardrails(enabled = true): GuardrailSetting[] {
  return GUARDRAIL_DEFAULTS.map((g) => ({
    key: g.key,
    kind: g.kind,
    enabled,
    fixed: g.fixed,
    params: g.params,
  }))
}
