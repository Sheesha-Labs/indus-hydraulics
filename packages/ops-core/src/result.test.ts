import { describe, expect, it } from 'vitest'
import { err, isOk, ok, type Result } from './result'

describe('Result', () => {
  it('ok carries data; ok() carries nothing', () => {
    expect(ok({ fileId: 'f1' })).toEqual({ success: true, data: { fileId: 'f1' } })
    const empty: Result = ok()
    expect(empty).toEqual({ success: true, data: undefined })
  })

  it('err carries a safe message and drops empty field errors', () => {
    expect(err('Check the highlighted fields.', { unitPrice: 'Enter a price' })).toEqual({
      success: false,
      error: 'Check the highlighted fields.',
      fieldErrors: { unitPrice: 'Enter a price' },
    })
    expect(err('That didn’t go through.', {})).toEqual({
      success: false,
      error: 'That didn’t go through.',
    })
    expect('fieldErrors' in err('No fields')).toBe(false)
  })

  it('a failure is assignable to a result of any data type', () => {
    const failure = err('No')
    const a: Result<{ fileId: string }> = failure
    const b: Result<number> = failure
    expect(a).toBe(b)
    // @ts-expect-error a failure has no data to read
    expect(failure.data).toBeUndefined()
  })

  it('isOk narrows to the data', () => {
    const r: Result<{ fileId: string }> = ok({ fileId: 'f2' })
    if (!isOk(r)) throw new Error('expected ok')
    const id: string = r.data.fileId
    expect(id).toBe('f2')
    expect(isOk(err('No'))).toBe(false)
  })
})
