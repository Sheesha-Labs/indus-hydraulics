import { describe, expect, it } from 'vitest'
import {
  BACKUP_CODE_COUNT,
  newBackupCode,
  normaliseBackupCode,
  prepareBackupCodes,
} from './backup-codes'
import { minutesRemaining, isLocked } from './lockout'
import { verifySecret } from './password-policy'

describe('backup codes', () => {
  it('are xxxx-xxxx from an alphabet without look-alikes', () => {
    for (let i = 0; i < 200; i++)
      expect(newBackupCode()).toMatch(/^[a-hjkmnp-z2-9]{4}-[a-hjkmnp-z2-9]{4}$/)
  })

  it('normalise case, spaces and a missing dash; refuse other lengths', () => {
    expect(normaliseBackupCode('ABCD EFGH')).toBe('abcd-efgh')
    expect(normaliseBackupCode('abcdefgh')).toBe('abcd-efgh')
    expect(normaliseBackupCode('abc-defgh9')).toBeNull()
  })

  it('come ten at a time, distinct, stored only as Argon2id hashes', async () => {
    const { codes, hashes } = await prepareBackupCodes()
    expect(codes).toHaveLength(BACKUP_CODE_COUNT)
    expect(new Set(codes).size).toBe(BACKUP_CODE_COUNT)
    expect(hashes.every((h) => h.startsWith('$argon2id$'))).toBe(true)
    expect(hashes.some((h) => codes.some((c) => h.includes(c)))).toBe(false)
    expect(await verifySecret(hashes[0]!, codes[0]!)).toBe(true)
  })
})

describe('lock arithmetic', () => {
  const now = new Date('2026-11-22T10:00:00Z')
  it('rounds the minutes left up, never below one', () => {
    expect(minutesRemaining(new Date(now.getTime() + 15 * 60_000), now)).toBe(15)
    expect(minutesRemaining(new Date(now.getTime() + 14 * 60_000 + 1_000), now)).toBe(15)
    expect(minutesRemaining(new Date(now.getTime() + 13 * 60_000 + 59_000), now)).toBe(14)
    expect(minutesRemaining(new Date(now.getTime() + 1_000), now)).toBe(1)
  })
  it('is locked only until lockedUntil', () => {
    expect(isLocked(null, now)).toBe(false)
    expect(isLocked(new Date(now.getTime() + 1), now)).toBe(true)
    expect(isLocked(now, now)).toBe(false)
  })
})
