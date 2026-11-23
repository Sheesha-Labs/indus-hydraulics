import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { PASSWORD_HISTORY, hashSecret, validateNewPassword } from './password-policy'

export {
  MIN_PASSWORD_LENGTH,
  PASSWORD_PROBLEM_TEXT,
  dummyVerify,
  hashSecret,
  validateNewPassword,
  verifySecret,
  type PasswordProblem,
} from './password-policy'

type Db = Pick<Prisma.TransactionClient, '$executeRaw'>

/**
 * Sets a new password in one statement: the hash, `passwordSetAt`, and the history (the previous
 * hash goes to the front, five kept). The caller has already run `validateNewPassword` against
 * `[passwordHash, ...passwordHistory]` (`checkNewPassword` below does both reads).
 */
export async function setPassword(userId: string, password: string, db: Db = opsDb): Promise<void> {
  await setPasswordHash(userId, await hashSecret(password), db)
}

/** The same with a hash computed earlier, so a transaction never waits on Argon2id. */
export async function setPasswordHash(userId: string, next: string, db: Db = opsDb): Promise<void> {
  await db.$executeRaw`
    UPDATE ops."user"
       SET "passwordHistory" = (
             CASE WHEN "passwordHash" IS NULL THEN "passwordHistory"
                  ELSE (ARRAY["passwordHash"] || "passwordHistory")[1:${PASSWORD_HISTORY}::int]
             END),
           "passwordHash" = ${next},
           "passwordSetAt" = now(),
           "updatedAt" = now()
     WHERE id = ${userId}::uuid`
}

/** The new-password rule for this user: their current hash and the last five count as used. */
export async function checkNewPassword(userId: string, password: string) {
  const user = await opsDb.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, passwordHash: true, passwordHistory: true },
  })
  const history = user
    ? [...(user.passwordHash ? [user.passwordHash] : []), ...user.passwordHistory]
    : []
  return validateNewPassword(password, history, user ? [user.email, user.name] : [])
}
