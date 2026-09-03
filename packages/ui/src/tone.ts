/**
 * The one tone vocabulary.
 *
 * Every component that colours by meaning — StatusPill, Callout, Toast — takes
 * these names and only these names. Before this existed there were three
 * vocabularies: StatusPill said `good`/`warn`, Callout said `success`/`warning`,
 * and Toast had no caution tone at all. Writing `warn` where `warning` belonged
 * was a compile error in one component and silently wrong in another, and Toast
 * simply could not express a warning.
 *
 * The names are the conventional web set rather than the shorter ones, because
 * `warn`/`warning` was the pair that actually caused the confusion and only one
 * of them can survive. Callout already used these, so this is also the smaller
 * migration.
 */
export const TONES = ['neutral', 'info', 'success', 'warning', 'danger', 'accent'] as const

export type Tone = (typeof TONES)[number]

/**
 * The old names, mapped to the new ones.
 *
 * Exported so a codemod and the guard test share one table rather than two
 * lists that can drift apart.
 */
export const LEGACY_TONE_ALIASES: Readonly<Record<string, Tone>> = {
  good: 'success',
  ok: 'success',
  warn: 'warning',
  error: 'danger',
  muted: 'neutral',
  note: 'neutral',
  default: 'neutral',
}

/** True when `value` is a current tone name. */
export function isTone(value: string): value is Tone {
  return (TONES as readonly string[]).includes(value)
}
