import 'server-only'
import { opsDb } from '@indus/ops-db'
import { listSessions, type SessionListItem } from '../server/access/sessions'

export { isRecentSignIn } from '../server/access/sessions'

/**
 * Page reads for /settings/team #devices and #security (board 84, S03-T02). Always the signed-in
 * person's own rows: a Helper sees only their sessions and their security state. Writes go through
 * settings/team/actions/sessions.ts.
 */
export type DeviceRow = SessionListItem

export type SignInRecordView = { at: Date; method: 'google' | 'password' | null; city: string | null }

export type SecurityState = {
  totpOn: boolean
  hasPassword: boolean
  backupCodesLeft: number
  lastSignIn: SignInRecordView | null
  beforeThat: SignInRecordView | null
  /** When this browser's session signed in (the re-authentication window starts here). */
  signedInAt: Date | null
  /** The server clock for this read: the page's "now" for every relative time it prints. */
  readAt: Date
}

export function myDevices(userId: string, currentSid: string | null): Promise<DeviceRow[]> {
  return listSessions(userId, currentSid)
}

/** One Prisma read: two-step state, unused backup codes, the last two sign-ins, this session's start. */
export async function mySecurity(userId: string, currentSid: string | null): Promise<SecurityState> {
  const user = await opsDb.user.findUnique({
    where: { id: userId },
    select: {
      totpEnabledAt: true,
      passwordHash: true,
      _count: { select: { backupCodes: { where: { usedAt: null } } } },
      authEvents: {
        where: { kind: 'sign_in' },
        orderBy: { at: 'desc' },
        take: 2,
        select: { at: true, method: true, city: true },
      },
      sessions: { where: { id: { in: currentSid ? [currentSid] : [] } }, select: { createdAt: true } },
    },
  })
  const [last, before] = user?.authEvents ?? []
  return {
    totpOn: !!user?.totpEnabledAt,
    hasPassword: !!user?.passwordHash,
    backupCodesLeft: user?._count.backupCodes ?? 0,
    lastSignIn: last ?? null,
    beforeThat: before ?? null,
    signedInAt: user?.sessions[0]?.createdAt ?? null,
    readAt: new Date(),
  }
}
