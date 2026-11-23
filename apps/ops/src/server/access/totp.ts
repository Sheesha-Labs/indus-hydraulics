import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { additionalData, openText, seal } from '../../lib/crypto'
import { matchStep } from './totp-core'

export { formatManualKey, newTotpSecret, normaliseCode, otpauthUri } from './totp-core'

type Db = Pick<Prisma.TransactionClient, '$executeRaw'>

/** Additional data for a user's sealed TOTP secret: bound to that user row. */
const aad = (userId: string) => additionalData('totp', userId)

export function sealTotpSecret(userId: string, secret: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(Buffer.from(seal(secret, aad(userId)), 'utf8'))
}

export function openTotpSecret(userId: string, sealed: Uint8Array): string {
  return openText(Buffer.from(sealed).toString('utf8'), aad(userId))
}

export type TotpUser = {
  id: string
  totpSecretEnc: Uint8Array | null
  totpEnabledAt: Date | null
  totpLastStep: bigint | null
}

/**
 * Verifies a code for an enrolled user. Accepts only a time step greater than `totpLastStep` and
 * records it in the same conditional UPDATE, so two requests racing with one code cannot both win:
 * the second finds the step already taken and is refused as a replay.
 */
export async function verifyTotp(
  user: TotpUser,
  code: string,
  options: { epochSeconds?: number; db?: Db } = {}
): Promise<'ok' | 'wrong' | 'replayed' | 'not_enrolled'> {
  if (!user.totpEnabledAt || !user.totpSecretEnc) return 'not_enrolled'
  const secret = openTotpSecret(user.id, user.totpSecretEnc)
  const step = matchStep(
    secret,
    code,
    options.epochSeconds === undefined ? {} : { epochSeconds: options.epochSeconds }
  )
  if (step === null) return 'wrong'
  const db = options.db ?? opsDb
  const updated = await db.$executeRaw`
    UPDATE ops."user" SET "totpLastStep" = ${BigInt(step)}
     WHERE id = ${user.id}::uuid
       AND ("totpLastStep" IS NULL OR "totpLastStep" < ${BigInt(step)})`
  return updated === 1 ? 'ok' : 'replayed'
}

/**
 * Turns two-step verification on with a secret whose first code has just been verified at `step`
 * (the enrolment proof). The step is recorded so that same code cannot be replayed to sign in.
 */
export async function enableTotp(
  userId: string,
  secret: string,
  step: number,
  db: Db = opsDb
): Promise<void> {
  const sealed = Buffer.from(sealTotpSecret(userId, secret))
  await db.$executeRaw`
    UPDATE ops."user"
       SET "totpSecretEnc" = ${sealed}, "totpEnabledAt" = now(), "totpLastStep" = ${BigInt(step)},
           "updatedAt" = now()
     WHERE id = ${userId}::uuid`
}
