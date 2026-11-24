import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { apiSchema } from './api-schema'

describe('apiSchema', () => {
  it('drops the bounds structured outputs refuse, keeps the shape', () => {
    const zs = z.object({
      a: z.array(z.string().min(2).max(9)).max(2),
      b: z.number().min(0).max(1),
      c: z.array(z.object({ d: z.enum(['x', 'y']) })).min(1),
    })
    const s = JSON.stringify(apiSchema(z.toJSONSchema(zs)))
    for (const k of ['maxItems', 'minLength', 'maxLength', 'minimum', 'maximum'])
      expect(s).not.toContain(k)
    expect(s).toContain('"minItems":1')
    expect(s).toContain('"enum":["x","y"]')
    expect(s).toContain('"additionalProperties":false')
  })
})
