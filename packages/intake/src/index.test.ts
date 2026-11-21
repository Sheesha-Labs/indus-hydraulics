import { describe, expect, it } from 'vitest'
import { INTAKE } from './index'

describe('@indus/intake', () => {
  it('exports its name', () => {
    expect(INTAKE).toBe('@indus/intake')
  })
})
