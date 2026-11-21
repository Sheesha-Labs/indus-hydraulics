import { describe, expect, it } from 'vitest'
import { OPS_CORE } from './index'

describe('@indus/ops-core', () => {
  it('exports its name', () => {
    expect(OPS_CORE).toBe('@indus/ops-core')
  })
})
