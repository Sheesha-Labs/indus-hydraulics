import 'server-only'
import {
  anthropicBatchTransport,
  anthropicClient,
  anthropicTransport,
  type BatchTransport,
  type Transport,
} from '@indus/ops-ai'
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

/** The Message Batches transport for the nightly learner (S07-T05); null without the key. */
export function assistantBatchTransport(): BatchTransport | null {
  const key = env().OPS_ANTHROPIC_API_KEY
  return key ? anthropicBatchTransport(anthropicClient(key)) : null
}
