import 'server-only'
import { randomInt } from 'node:crypto'
import { opsDb, type Prisma } from '@indus/ops-db'
import { hashSecret, verifySecret } from './password-policy'

/**
 * Ten single-use backup codes (ADR-05), `xxxx-xxxx` from an alphabet without look-alikes, shown
 * once and stored only as Argon2id hashes. Regenerating replaces every code.
 */
export const BACKUP_CODE_COUNT = 10
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

export function newBackupCode(): string {
  let out = ''
  for (let i = 0; i < 8; i++) out += ALPHABET[randomInt(ALPHABET.length)]
  return `${out.slice(0, 4)}-${out.slice(4)}`
}

/** Lower-cases and restores the dash, so "ABCD EFGH" and "abcdefgh" both match. */
export function normaliseBackupCode(raw: string): string | null {
  const compact = raw.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (compact.length !== 8) return null
  return `${compact.slice(0, 4)}-${compact.slice(4)}`
}

type Db = Pick<Prisma.TransactionClient, 'backupCode'>

export type PreparedBackupCodes = { codes: string[]; hashes: string[] }

/** Ten new codes and their hashes. Hash BEFORE opening a transaction: Argon2id takes time. */
export async function prepareBackupCodes(): Promise<PreparedBackupCodes> {
  const codes = Array.from({ length: BACKUP_CODE_COUNT }, newBackupCode)
  return { codes, hashes: await Promise.all(codes.map((c) => hashSecret(c))) }
}

/** Replaces every code of the user with the prepared ones (regenerate replaces all). */
export async function storeBackupCodes(
  userId: string,
  prepared: PreparedBackupCodes,
  db: Db = opsDb
): Promise<string[]> {
  await db.backupCode.deleteMany({ where: { userId } })
  await db.backupCode.createMany({
    data: prepared.hashes.map((codeHash) => ({ userId, codeHash })),
  })
  return prepared.codes
}

/** Replaces the user's codes with ten new ones and returns them in clear, to show once. */
export async function regenerateBackupCodes(userId: string, db: Db = opsDb): Promise<string[]> {
  return storeBackupCodes(userId, await prepareBackupCodes(), db)
}

/** Marks a matching unused code used. False for a wrong, malformed or already-used code. */
export async function consumeBackupCode(userId: string, raw: string): Promise<boolean> {
  const code = normaliseBackupCode(raw)
  if (!code) return false
  const unused = await opsDb.backupCode.findMany({
    where: { userId, usedAt: null },
    select: { id: true, codeHash: true },
  })
  for (const row of unused) {
    if (!(await verifySecret(row.codeHash, code))) continue
    // Conditional: of two requests racing with one code, only one marks it.
    const { count } = await opsDb.backupCode.updateMany({
      where: { id: row.id, usedAt: null },
      data: { usedAt: new Date() },
    })
    return count === 1
  }
  return false
}

export async function remainingBackupCodes(userId: string): Promise<number> {
  return opsDb.backupCode.count({ where: { userId, usedAt: null } })
}
