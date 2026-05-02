import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { renderTemplate, type PromptContext } from '@indus/domain'

/**
 * Anthropic client + cost-aware caller for the SEO Suggest layer.
 *
 * Two model tiers:
 *   - claude-sonnet-4-6 — per-entity "Suggest" drawer (synchronous; quality matters)
 *   - claude-haiku-4-5  — bulk catalogue runs (chunked via Inngest in a follow-up)
 *
 * Both calls share an identical `systemPrompt` prefix per entity-kind +
 * field combination. We mark it with `cache_control: {type: 'ephemeral'}`
 * so repeated calls (e.g. one editor working through 20 products in a
 * sitting) hit the prompt cache and pay only ~10% of the input cost on
 * the cached prefix.
 *
 * Output is forced into a strict JSON schema via output_config.format —
 * the action layer parses it directly without regex gymnastics.
 *
 * Cost telemetry (input/output tokens, cache hits) is returned so the
 * caller can record an `AiSuggestion` row with accurate USD attribution.
 */

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }
    _client = new Anthropic({ apiKey })
  }
  return _client
}

// ── Models ──────────────────────────────────────────────────────────────────

export const AI_MODELS = {
  /** Per-entity Suggest drawer — quality + adaptive thinking. */
  quality: 'claude-sonnet-4-6',
  /** Bulk catalogue runs — cheaper, used by the Inngest fan-out (Phase 2). */
  bulk: 'claude-haiku-4-5',
} as const

export type AiModelKey = keyof typeof AI_MODELS

/**
 * Per-1M-token pricing (USD). Used to convert usage rows into
 * `costUsdMicros` for the audit/quota tables. Cache reads cost ~10% of
 * the base input rate; cache writes ~25% extra.
 *
 * Sourced from Anthropic public pricing as of 2026-04. Update if/when
 * the catalogue changes.
 */
const PRICING_PER_M: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6': { input: 3.0, output: 15.0 },
  'claude-haiku-4-5': { input: 1.0, output: 5.0 },
}

// ── Output schemas ──────────────────────────────────────────────────────────

/**
 * The drawer asks the model for one of these five fields per call. Each
 * has a tiny strict JSON schema — no free-form output, no markdown, no
 * preamble. Field names match the SEO column names in the Prisma model.
 */
export type AiSuggestField =
  | 'seoTitle'
  | 'seoDescription'
  | 'focusKeyword'
  | 'altText'
  | 'longDescription'

const FIELD_SCHEMAS: Record<AiSuggestField, { schema: Record<string, unknown>; key: string }> = {
  seoTitle: {
    key: 'title',
    schema: {
      type: 'object',
      properties: { title: { type: 'string' } },
      required: ['title'],
      additionalProperties: false,
    },
  },
  seoDescription: {
    key: 'description',
    schema: {
      type: 'object',
      properties: { description: { type: 'string' } },
      required: ['description'],
      additionalProperties: false,
    },
  },
  focusKeyword: {
    key: 'keyword',
    schema: {
      type: 'object',
      properties: { keyword: { type: 'string' } },
      required: ['keyword'],
      additionalProperties: false,
    },
  },
  altText: {
    key: 'alt',
    schema: {
      type: 'object',
      properties: { alt: { type: 'string' } },
      required: ['alt'],
      additionalProperties: false,
    },
  },
  longDescription: {
    key: 'description',
    schema: {
      type: 'object',
      properties: { description: { type: 'string' } },
      required: ['description'],
      additionalProperties: false,
    },
  },
}

// ── Public API ──────────────────────────────────────────────────────────────

export type GenerateInput = {
  /** Which field we're generating; selects the JSON schema + parsing key. */
  field: AiSuggestField
  /** System prompt (cached prefix) — typically `AiPromptTemplate.systemPrompt`. */
  systemPrompt: string
  /** User template with `{{var}}` placeholders. Rendered against `context`. */
  userTemplate: string
  /** Variables interpolated into the user template. */
  context: PromptContext
  /** Model tier; defaults to quality. */
  model?: AiModelKey
  /** Override max output; the JSON outputs are tiny so 600 is more than plenty. */
  maxTokens?: number
}

export type GenerateOutput = {
  /** The generated string (just the value of the schema's single field). */
  output: string
  /** Model that ran. */
  model: string
  inputTokens: number
  outputTokens: number
  cacheReadInputTokens: number
  cacheCreationInputTokens: number
  /** Cost in USD micros (1 USD = 1_000_000 micros). */
  costUsdMicros: number
}

/**
 * Generate one SEO suggestion. Sync, non-streaming — the JSON outputs
 * are small (≤ 320 chars typical), so streaming adds latency without
 * benefit.
 */
export async function generateSuggestion(input: GenerateInput): Promise<GenerateOutput> {
  const client = getClient()
  const modelKey = input.model ?? 'quality'
  const model = AI_MODELS[modelKey]
  const fieldSchema = FIELD_SCHEMAS[input.field]
  const userText = renderTemplate(input.userTemplate, input.context)

  const response = await client.messages.create({
    model,
    max_tokens: input.maxTokens ?? 600,
    // Adaptive thinking + medium effort: balances quality against latency
    // for short JSON outputs. Sonnet 4.6 supports both.
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: fieldSchema.schema },
    },
    system: [
      {
        type: 'text',
        text: input.systemPrompt,
        // Stable prefix → cached. Varies the user message only.
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userText }],
  })

  // Extract the JSON text block. With output_config.format set, the
  // assistant returns a single text block whose contents are valid JSON
  // matching our schema.
  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === 'text',
  )
  if (!textBlock) {
    throw new Error('AI response had no text block')
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(textBlock.text) as Record<string, unknown>
  } catch {
    throw new Error(`AI response was not valid JSON: ${textBlock.text.slice(0, 200)}`)
  }
  const value = parsed[fieldSchema.key]
  if (typeof value !== 'string') {
    throw new Error(`AI response missing required field "${fieldSchema.key}"`)
  }

  const usage = response.usage
  const costUsdMicros = computeCostMicros(model, usage)

  return {
    output: value.trim(),
    model,
    inputTokens: usage.input_tokens ?? 0,
    outputTokens: usage.output_tokens ?? 0,
    cacheReadInputTokens: usage.cache_read_input_tokens ?? 0,
    cacheCreationInputTokens: usage.cache_creation_input_tokens ?? 0,
    costUsdMicros,
  }
}

function computeCostMicros(model: string, usage: Anthropic.Usage): number {
  const rates = PRICING_PER_M[model]
  if (!rates) return 0
  // Cost in USD per 1M tokens → micros (1e6 micros = $1).
  // Cache reads cost ~10% of base input; cache creation ~25% extra.
  const baseInput = (usage.input_tokens ?? 0) * rates.input
  const cacheRead = (usage.cache_read_input_tokens ?? 0) * rates.input * 0.1
  const cacheWrite = (usage.cache_creation_input_tokens ?? 0) * rates.input * 1.25
  const output = (usage.output_tokens ?? 0) * rates.output
  // Convert from $/M tokens to micro-USD per token, then sum.
  const totalUsd = (baseInput + cacheRead + cacheWrite + output) / 1_000_000
  return Math.round(totalUsd * 1_000_000)
}
