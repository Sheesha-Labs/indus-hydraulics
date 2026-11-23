'use server'

import type { Route } from 'next'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { currentSessionId, requireOpsUser } from '../../../../../lib/access'
import { signOut } from '../../../../../lib/auth'
import { defineAction } from '../../../../../lib/define-action'
import { env } from '../../../../../lib/env'
import { signInFor } from '../../../../../lib/page-access'
import { authSettings } from '../../../../../server/access/auth-settings'
import {
  createInvite,
  resendInvite,
  revokeInvite,
  sendInviteEmail,
  type CreatedInvite,
} from '../../../../../server/access/invites'
import { isRecentSignIn, sessionSignedInAt } from '../../../../../server/access/sessions'
import {
  LastOwnerError,
  removeUser,
  transferOwnership,
  updateHelperPermissions,
} from '../../../../../server/access/team'

/**
 * Settings › Team (board 84, 84b; S03-T03). Every action is Owner only (`roles: ['owner']` and the
 * `manage_team` capability), so a Helper is refused by defineAction before anything runs; the services
 * check the role again. Writes go through the action's transaction (`ctx.withTx`); the invitation
 * email goes out after it commits.
 */
const TEAM = '/settings/team'

function revalidateTeam(): void {
  revalidatePath(TEAM)
  revalidatePath('/setup/invite')
}

/** Send the link after the commit. A mail failure never undoes the invite: Resend is there for it. */
async function emailInvite(created: CreatedInvite, inviterName: string) {
  try {
    return (await sendInviteEmail(created, inviterName)).status
  } catch (error) {
    console.error('invite email failed', error instanceof Error ? error.name : 'unknown')
    return 'failed' as const
  }
}

const flags = z.object({
  canSeeMargins: z.boolean(),
  canSendSupplierMail: z.boolean(),
  canEditChaserRules: z.boolean(),
})

/** Invite a helper (Team card, setup step 6). */
export const inviteHelperAction = defineAction({
  name: 'team.invite',
  schema: z.object({
    email: z.email('Enter an email address.').max(320),
    overrideDomain: z.boolean().default(false),
  }),
  roles: ['owner'],
  capability: 'manage_team',
  handler: async (input, ctx) => {
    // Settings before the transaction: with one pooled connection, a read inside it would wait.
    const { inviteDays } = await authSettings()
    const workspaceDomain = env().GOOGLE_WORKSPACE_DOMAIN
    const created = await ctx.withTx((tx) =>
      createInvite(tx, ctx.user, input, { workspaceDomain, inviteDays })
    )
    const mail = await emailInvite(created, ctx.user.name)
    revalidateTeam()
    return {
      inviteId: created.inviteId,
      email: created.email,
      expiresAt: created.expiresAt.toISOString(),
      mail,
    }
  },
})

/** Resend: a new link and expiry; the old link stops working. */
export const resendInviteAction = defineAction({
  name: 'team.invite_resend',
  schema: z.object({ inviteId: z.uuid() }),
  roles: ['owner'],
  capability: 'manage_team',
  handler: async ({ inviteId }, ctx) => {
    const { inviteDays } = await authSettings()
    const created = await ctx.withTx((tx) => resendInvite(tx, ctx.user, inviteId, { inviteDays }))
    const mail = await emailInvite(created, ctx.user.name)
    revalidateTeam()
    return { inviteId: created.inviteId, expiresAt: created.expiresAt.toISOString(), mail }
  },
})

export const revokeInviteAction = defineAction({
  name: 'team.invite_revoke',
  schema: z.object({ inviteId: z.uuid() }),
  roles: ['owner'],
  capability: 'manage_team',
  handler: async ({ inviteId }, ctx) => {
    const outcome = await ctx.withTx((tx) => revokeInvite(tx, ctx.user, inviteId))
    revalidateTeam()
    return { outcome }
  },
})

/** Permissions: the Helper's three toggles, version-checked on what the page showed. */
export const updatePermissionsAction = defineAction({
  name: 'team.permissions',
  schema: z.object({ userId: z.uuid(), next: flags, expected: flags }),
  roles: ['owner'],
  capability: 'manage_team',
  handler: async (input, ctx) => {
    const saved = await ctx.withTx((tx) => updateHelperPermissions(tx, ctx.user, input))
    revalidatePath(TEAM)
    return saved
  },
})

/**
 * Remove: status removed, sessions revoked, open work to the Owner. The only Owner is never removed:
 * that refusal comes back as data (`last_owner`), so the page can show the 84b banner.
 */
export const removeHelperAction = defineAction({
  name: 'team.remove',
  schema: z.object({ userId: z.uuid() }),
  roles: ['owner'],
  capability: 'manage_team',
  handler: async ({ userId }, ctx) => {
    try {
      const removed = await ctx.withTx((tx) => removeUser(tx, ctx.user, userId))
      revalidateTeam()
      return { outcome: 'removed' as const, ...removed }
    } catch (error) {
      if (error instanceof LastOwnerError) {
        return { outcome: 'last_owner' as const, message: error.message }
      }
      throw error
    }
  },
})

/**
 * "Transfer ownership": opens the confirm when this browser signed in within 10 minutes, else signs in
 * again first (`reason=reauth_transfer`) and comes back to it.
 */
export async function beginTransfer(): Promise<void> {
  const user = await requireOpsUser(['owner']).catch(signInFor(TEAM))
  const back = `${TEAM}?transfer=1#team`
  const signedInAt = await sessionSignedInAt(user.id, await currentSessionId())
  if (!isRecentSignIn(signedInAt)) {
    redirect(`/sign-in?reason=reauth_transfer&next=${encodeURIComponent(back)}` as Route)
  }
  redirect(back as Route)
}

/**
 * Hand ownership to the Helper. Re-checks the 10-minute sign-in here (the page's check is only for
 * drawing the dialog). Both people's sessions end; the client then calls `endAfterTransfer`.
 */
export const transferOwnershipAction = defineAction({
  name: 'team.transfer',
  schema: z.object({ toUserId: z.uuid() }),
  roles: ['owner'],
  capability: 'manage_team',
  handler: async ({ toUserId }, ctx) => {
    const signedInAt = await sessionSignedInAt(ctx.user.id, await currentSessionId())
    const done = await ctx.withTx((tx) => transferOwnership(tx, ctx.user, { toUserId, signedInAt }))
    revalidatePath(TEAM)
    return done
  },
})

/** After a transfer this browser's session has ended: clear it and say why on the sign-in card. */
export async function endAfterTransfer(): Promise<void> {
  await signOut({ redirectTo: '/sign-in?reason=ownership_transferred' })
}
