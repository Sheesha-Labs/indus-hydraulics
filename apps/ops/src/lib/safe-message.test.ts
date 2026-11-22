import { describe, expect, it } from 'vitest'
import { AccessError } from './access-core'
import { SAFE_MESSAGES, SafeError, prismaErrorCode, safeMessage } from './safe-message'

/** A thrown Prisma known-request error, as the client builds it (code + meta + driver text). */
function prismaError(code: string) {
  return Object.assign(
    new Error(
      `Invalid \`prisma.user.create()\` invocation: Unique constraint failed on the fields: (\`email\`)`
    ),
    {
      name: 'PrismaClientKnownRequestError',
      code,
      meta: { target: ['email'] },
      clientVersion: '6.19.3',
    }
  )
}

describe('safeMessage', () => {
  it.each([
    ['P2002', SAFE_MESSAGES.duplicate],
    ['P2003', SAFE_MESSAGES.missingReference],
    ['P2025', SAFE_MESSAGES.gone],
    ['P2034', SAFE_MESSAGES.conflict],
    ['P2024', SAFE_MESSAGES.busy],
    ['P2028', SAFE_MESSAGES.busy],
    ['P1001', SAFE_MESSAGES.busy],
    ['P2010', SAFE_MESSAGES.generic],
  ])('maps %s to a plain sentence with no code, driver text or stack', (code, expected) => {
    const message = safeMessage(prismaError(code))
    expect(message).toBe(expected)
    expect(message).not.toMatch(/P\d{4}|prisma|constraint|invocation|\bat\s/i)
  })

  it('recognises an initialisation error by errorCode', () => {
    expect(prismaErrorCode({ errorCode: 'P1001' })).toBe('P1001')
    expect(safeMessage({ errorCode: 'P1001', message: "Can't reach database server" })).toBe(
      SAFE_MESSAGES.busy
    )
  })

  it('passes a SafeError through and maps access errors', () => {
    expect(safeMessage(new SafeError('This quotation has already been sent.'))).toBe(
      'This quotation has already been sent.'
    )
    expect(safeMessage(new AccessError('forbidden'))).toBe(SAFE_MESSAGES.forbidden)
    expect(safeMessage(new AccessError('unauthenticated'))).toBe(SAFE_MESSAGES.signedOut)
  })

  it('never echoes an arbitrary error', () => {
    expect(safeMessage(new Error('connect ECONNREFUSED 10.0.0.1:6543'))).toBe(SAFE_MESSAGES.generic)
    expect(safeMessage('boom')).toBe(SAFE_MESSAGES.generic)
    expect(safeMessage(null)).toBe(SAFE_MESSAGES.generic)
    expect(safeMessage({ code: 'ECONNRESET' })).toBe(SAFE_MESSAGES.generic)
  })
})
