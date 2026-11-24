/**
 * The JSON schema structured outputs accept (S07, found by the first live eval run): no numerical constraints
 * (minimum, maximum, exclusive bounds, multipleOf), no string lengths, no item-count bounds beyond minItems 0 or
 * 1, and every object closed with `additionalProperties: false`. The full Zod schema still validates the answer
 * in code, so the dropped bounds are enforced after the call, as the SDK's own helpers do.
 */
const DROP = new Set([
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  'minLength',
  'maxLength',
  'maxItems',
  'uniqueItems',
  'minProperties',
  'maxProperties',
])

export function apiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(apiSchema)
  if (!schema || typeof schema !== 'object') return schema
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(schema as Record<string, unknown>)) {
    if (DROP.has(k)) continue
    if (k === 'minItems' && typeof v === 'number' && v > 1) continue
    out[k] = apiSchema(v)
  }
  if (out.type === 'object' && out.properties && out.additionalProperties === undefined)
    out.additionalProperties = false
  return out
}
