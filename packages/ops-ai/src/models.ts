/**
 * The model registry (ADR-08). Action code never names a model: it names a route, and the route picks the
 * model, the default effort and the `ai_call.purpose` it is metered under. Prices live in `ops.ai_model_price`
 * (read through the ledger), never here.
 */

export const MODELS = {
  haiku: 'claude-haiku-5-5',
  sonnet: 'claude-sonnet-5-5',
  opus: 'claude-opus-5-5',
} as const

export type ModelId = (typeof MODELS)[keyof typeof MODELS]

/** `output_config.effort`. Haiku 5.5 and Opus 5.5 default to medium, so every route sets it explicitly. */
export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

/** Mirrors `ops."AiPurpose"` (apps/ops ai-ledger.test.ts asserts the two stay equal). */
export const AI_PURPOSES = [
  'read_mail',
  'classify',
  'extract',
  'research',
  'draft',
  'compare',
  'price',
  'summarise',
  'translate',
  'other',
] as const
export type AiPurpose = (typeof AI_PURPOSES)[number]

export type Route =
  | 'classify'
  | 'link'
  | 'ooo'
  | 'translate'
  | 'extract'
  | 'capture'
  | 'draft'
  | 'identity'
  | 'research'
  | 'compare'

export interface RouteSpec {
  model: ModelId
  effort: Effort
  purpose: AiPurpose
}

/**
 * Haiku for classification, link tie-breaks, auto-reply facts and translation; Sonnet for extraction,
 * capture, drafting and the identifier model check; Opus for research and Compare narratives (ADR-08).
 */
export const ROUTES: Readonly<Record<Route, RouteSpec>> = {
  classify: { model: MODELS.haiku, effort: 'low', purpose: 'classify' },
  link: { model: MODELS.haiku, effort: 'low', purpose: 'classify' },
  ooo: { model: MODELS.haiku, effort: 'low', purpose: 'read_mail' },
  translate: { model: MODELS.haiku, effort: 'low', purpose: 'translate' },
  extract: { model: MODELS.sonnet, effort: 'medium', purpose: 'extract' },
  capture: { model: MODELS.sonnet, effort: 'medium', purpose: 'extract' },
  draft: { model: MODELS.sonnet, effort: 'medium', purpose: 'draft' },
  identity: { model: MODELS.sonnet, effort: 'medium', purpose: 'other' },
  research: { model: MODELS.opus, effort: 'high', purpose: 'research' },
  compare: { model: MODELS.opus, effort: 'high', purpose: 'compare' },
}

/**
 * Whether the API's server-side refusal fallback (`fallbacks: "default"`) is available for a model. Haiku 5.5
 * has none, so a Haiku refusal is rerun once on Sonnet by `structuredCall` instead.
 */
export function supportsServerFallback(model: string): boolean {
  return model === MODELS.sonnet || model === MODELS.opus
}

/** Where a refused call goes for its one rerun, or null when the server fallback already handled it. */
export function refusalRerunModel(model: string): ModelId | null {
  return model === MODELS.haiku ? MODELS.sonnet : null
}

export function routeFor(route: Route): RouteSpec {
  return ROUTES[route]
}
