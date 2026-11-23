// Run by demo-auth.ts under bun: `bun reset-demo-auth.ts <email>...`. Local databases only (checked by the
// caller); clears passwords, authenticators, backup codes, reset links, locks and rate-limit windows.
import { opsDb } from '@indus/ops-db'

const emails = process.argv.slice(2)
const users = await opsDb.user.findMany({ where: { email: { in: emails } }, select: { id: true } })
const ids = users.map((u) => u.id)
await opsDb.backupCode.deleteMany({ where: { userId: { in: ids } } })
await opsDb.passwordResetToken.deleteMany({ where: { userId: { in: ids } } })
await opsDb.user.updateMany({
  where: { id: { in: ids } },
  data: {
    passwordHash: null,
    passwordHistory: [],
    passwordSetAt: null,
    totpSecretEnc: null,
    totpEnabledAt: null,
    totpLastStep: null,
    failedAttempts: 0,
    lockedUntil: null,
  },
})
await opsDb.$executeRaw`DELETE FROM ops.rate_limit_counter`
await opsDb.$disconnect()
