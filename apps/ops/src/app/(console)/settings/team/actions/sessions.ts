'use server'

import type { Route } from 'next'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { currentSessionId, requireOpsUser } from '../../../../../lib/access'
import { defineAction } from '../../../../../lib/define-action'
import { signInFor } from '../../../../../lib/page-access'
import { SafeError } from '../../../../../lib/safe-message'
import { prepareBackupCodes, storeBackupCodes } from '../../../../../server/access/backup-codes'
import {
  PASSWORD_PROBLEM_TEXT,
  checkNewPassword,
  hashSecret,
  setPasswordHash,
} from '../../../../../server/access/password'
import {
  isRecentSignIn,
  revokeAllSessions,
  revokeSession,
  sessionSignedInAt,
} from '../../../../../server/access/sessions'

/**
 * Settings › Team #devices and #security (board 84, S03-T02). Every action reads the person from the
 * session (defineAction → requireOpsUser, which refuses a revoked session at once) and acts on their own
 * rows; the Owner may also end someone else's session by id (the Team table, S03-T03).
 */
const TEAM = '/settings/team'

/** Devices › Sign out: end one other session. */
export const signOutDeviceAction = defineAction({
  name: 'sessions.sign_out_device',
  schema: z.object({ sessionId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async ({ sessionId }, ctx) => {
    if (sessionId === (await currentSessionId())) {
      throw new SafeError('That is the device you are using. Use Sign out in your profile menu.')
    }
    const outcome = await ctx.withTx((tx) =>
      revokeSession(tx, { sessionId, actor: { id: ctx.user.id, role: ctx.user.role } })
    )
    revalidatePath(TEAM)
    return { outcome }
  },
})

/** Devices › Sign out everywhere: every session of this person except the one asking. */
export const signOutEverywhereAction = defineAction({
  name: 'sessions.sign_out_everywhere',
  schema: z.object({}),
  roles: ['owner', 'helper'],
  handler: async (_input, ctx) => {
    const except = await currentSessionId()
    const ended = await ctx.withTx((tx) =>
      revokeAllSessions(tx, ctx.user.id, {
        except,
        actorId: ctx.user.id,
        reason: 'signed_out_everywhere',
      })
    )
    revalidatePath(TEAM)
    return { ended }
  },
})

export type SecurityChange = 'password' | 'backup-codes'

const PANEL: Record<SecurityChange, Route> = {
  password: '/settings/team?security=password#security' as Route,
  'backup-codes': '/settings/team?security=backup-codes#security' as Route,
}

/**
 * "Set or change password" / "Regenerate backup codes": open the panel when this browser signed in
 * within the last 10 minutes, else sign in again first and come back to it (`reason=reauth`).
 */
export async function beginSecurityChange(formData: FormData): Promise<void> {
  const raw = formData.get('change')
  const change: SecurityChange = raw === 'backup-codes' ? 'backup-codes' : 'password'
  const user = await requireOpsUser().catch(signInFor(TEAM))
  const signedInAt = await sessionSignedInAt(user.id, await currentSessionId())
  if (!isRecentSignIn(signedInAt)) {
    redirect(`/sign-in?reason=reauth&next=${encodeURIComponent(PANEL[change])}` as Route)
  }
  redirect(PANEL[change])
}

async function requireRecentSignIn(userId: string): Promise<string | null> {
  const sid = await currentSessionId()
  if (!isRecentSignIn(await sessionSignedInAt(userId, sid))) {
    throw new SafeError('For your security, sign in again before changing this.')
  }
  return sid
}

/**
 * Set or change the password (needs a recent sign-in). The policy is T01's (12+ characters, zxcvbn ≥ 3,
 * not one of the last five). Saving signs out this person's other devices, like a reset does.
 */
export const changePasswordAction = defineAction({
  name: 'security.change_password',
  schema: z.object({ password: z.string().min(1, 'Enter a new password.').max(1024) }),
  roles: ['owner', 'helper'],
  handler: async ({ password }, ctx) => {
    const sid = await requireRecentSignIn(ctx.user.id)
    const policy = await checkNewPassword(ctx.user.id, password)
    if (!policy.ok) throw new SafeError(PASSWORD_PROBLEM_TEXT[policy.problem])
    // Argon2id before the transaction: it takes time and the transaction holds the only connection.
    const hash = await hashSecret(password)
    const signedOut = await ctx.withTx(async (tx) => {
      await setPasswordHash(ctx.user.id, hash, tx)
      await tx.authEvent.create({
        data: { userId: ctx.user.id, kind: 'password_set', method: 'password' },
      })
      return revokeAllSessions(tx, ctx.user.id, {
        except: sid,
        actorId: ctx.user.id,
        reason: 'password_changed',
      })
    })
    revalidatePath(TEAM)
    return { signedOut }
  },
})

/** Ten new backup codes replace every old one (needs a recent sign-in and an authenticator). */
export const regenerateBackupCodesAction = defineAction({
  name: 'security.regenerate_backup_codes',
  schema: z.object({}),
  roles: ['owner', 'helper'],
  handler: async (_input, ctx) => {
    await requireRecentSignIn(ctx.user.id)
    const prepared = await prepareBackupCodes()
    const codes = await ctx.withTx(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: ctx.user.id },
        select: { totpEnabledAt: true },
      })
      if (!user?.totpEnabledAt) {
        throw new SafeError('Set up the authenticator first: backup codes come with it.')
      }
      return storeBackupCodes(ctx.user.id, prepared, tx)
    })
    revalidatePath(TEAM)
    return { codes }
  },
})
