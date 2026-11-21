/**
 * Sentry never receives mail bodies, request bodies, cookies or credentials
 * (ADR-24). Applied as beforeSend in every runtime.
 */
const SCRUB_KEYS = new Set([
  'body',
  'html',
  'text',
  'raw',
  'bodyhtml',
  'bodytext',
  'password',
  'totp',
  'token',
])

type Scrubbable = {
  request?: { data?: unknown; cookies?: unknown; headers?: Record<string, string> } | undefined
  extra?: Record<string, unknown> | undefined
  contexts?: Record<string, unknown> | undefined
}

function strip(value: unknown, depth = 0): unknown {
  if (depth > 8 || value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((v) => strip(v, depth + 1))
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SCRUB_KEYS.has(k.toLowerCase())) continue
    out[k] = strip(v, depth + 1)
  }
  return out
}

export function scrubEvent<E extends Scrubbable>(event: E): E {
  if (event.request) {
    delete event.request.data
    delete event.request.cookies
    if (event.request.headers) {
      for (const name of Object.keys(event.request.headers)) {
        if (['cookie', 'authorization'].includes(name.toLowerCase()))
          delete event.request.headers[name]
      }
    }
  }
  if (event.extra) event.extra = strip(event.extra) as Record<string, unknown>
  if (event.contexts) event.contexts = strip(event.contexts) as Record<string, unknown>
  return event
}
