import { CredentialsSignin } from 'next-auth'
import { describe, expect, it, vi } from 'vitest'
import { SecondFactorError, passwordProvider } from './password-provider'

type Authorize = (c: Record<string, unknown>) => Promise<unknown>
const authorizeOf = (p: ReturnType<typeof passwordProvider>) =>
  (p as unknown as { options: { authorize: Authorize } }).options.authorize

describe('ops-password provider', () => {
  it('never takes a password: its fields are the pending value and the codes', () => {
    const p = passwordProvider(vi.fn())
    const fields = Object.keys(
      (p as unknown as { options: { credentials: Record<string, unknown> } }).options.credentials
    )
    expect(fields.sort()).toEqual(['backupCode', 'code', 'pending'])
  })

  it('refuses without the pending value from the password step', async () => {
    const inner = vi.fn()
    const authorize = authorizeOf(passwordProvider(inner))
    await expect(authorize({ code: '123456', password: 'whatever' })).rejects.toBeInstanceOf(
      SecondFactorError
    )
    expect(inner).not.toHaveBeenCalled()
  })

  it('passes the pending value and the code on, and nothing else', async () => {
    const inner = vi.fn(async () => ({
      id: 'u',
      email: 'owner@example.test',
      name: 'Owner Example',
    }))
    const authorize = authorizeOf(passwordProvider(inner))
    await authorize({ pending: 'sealed', code: '123456', password: 'ignored' })
    expect(inner).toHaveBeenCalledWith({ pending: 'sealed', code: '123456', backupCode: undefined })
  })

  it('reports a fixed code that Auth.js carries to the caller', () => {
    const e = new SecondFactorError('locked', 14)
    expect(e).toBeInstanceOf(CredentialsSignin)
    expect(e.code).toBe('locked')
    expect(e.minutes).toBe(14)
  })
})
