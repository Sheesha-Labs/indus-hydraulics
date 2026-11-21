import { describe, expect, it } from 'vitest'
import { OPS_DB } from './index'

describe('@indus/ops-db', () => {
  it('exports its name', () => {
    expect(OPS_DB).toBe('@indus/ops-db')
  })
})
