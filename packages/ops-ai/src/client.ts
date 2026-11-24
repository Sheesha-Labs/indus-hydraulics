import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import type { CreateBody, Transport } from './structured-call'

/**
 * One Anthropic client per key per process (ADR-08). The key is passed in by the app from `env()`
 * (OPS_ANTHROPIC_API_KEY); this package never reads process.env.
 *
 * The SDK retries 408/409/429/5xx and dropped connections twice with backoff; anything still failing becomes
 * ProviderUnavailableError in structuredCall and the Inngest step retries it later.
 */
const clients = new Map<string, Anthropic>()

export function anthropicClient(apiKey: string): Anthropic {
  if (!apiKey) throw new Error('An Anthropic API key is required')
  let c = clients.get(apiKey)
  if (!c) {
    c = new Anthropic({ apiKey, maxRetries: 2, timeout: 10 * 60_000 })
    clients.set(apiKey, c)
  }
  return c
}

/** Above this `max_tokens` a request streams, so a long generation never hits the HTTP timeout. */
export const STREAM_ABOVE_MAX_TOKENS = 16_000

/** The transport structuredCall uses in production: the beta Messages endpoint (for `fallbacks`). */
export function anthropicTransport(client: Anthropic): Transport {
  return async (body: CreateBody) => {
    // `fallbacks` (server-side refusal fallback, beta server-side-fallback-2026-07-01) post-dates the pinned SDK
    // types; the SDK sends unknown body fields as given.
    const params = body as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming
    if (body.max_tokens > STREAM_ABOVE_MAX_TOKENS) {
      return client.beta.messages.stream(params).finalMessage()
    }
    return client.beta.messages.create(params)
  }
}
