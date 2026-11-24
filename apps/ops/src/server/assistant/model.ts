import 'server-only'
import { anthropicClient, anthropicTransport, type Transport } from '@indus/ops-ai'
import { env } from '../../lib/env'

/**
 * The production transport for `structuredCall` (S05-T01): the Messages API with OPS_ANTHROPIC_API_KEY.
 * Without the key (preview, or production before the Console workspace exists) every call fails with
 * AssistantNotConfiguredError, which the action records as a failure and /api/health reports.
 */
export class AssistantNotConfiguredError extends Error {
  constructor() {
    super('The Assistant has no Anthropic API key (OPS_ANTHROPIC_API_KEY)')
    this.name = 'AssistantNotConfiguredError'
  }
}

export function isAssistantConfigured(): boolean {
  return Boolean(env().OPS_ANTHROPIC_API_KEY)
}

export function assistantTransport(): Transport {
  const key = env().OPS_ANTHROPIC_API_KEY
  if (!key) throw new AssistantNotConfiguredError()
  return anthropicTransport(anthropicClient(key))
}
