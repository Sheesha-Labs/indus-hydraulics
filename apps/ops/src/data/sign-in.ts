import 'server-only'
import { opsDb } from '@indus/ops-db'
import { inspectInvite, type InviteView } from '../server/access/invites'
import { inspectResetToken, type ResetTokenState } from '../server/access/reset'

/** Accept invitation (S03-T03): the link's state, the invited address and who sent it. */
export function inviteLinkState(token: string): Promise<InviteView> {
  return inspectInvite(token)
}

/** Page reads for board 77 (reset link, authenticator setup). Writes go through sign-in/actions.ts. */

/** The state of an emailed reset link: valid (and whether a code is asked), expired, used, unknown. */
export function resetLinkState(token: string): Promise<ResetTokenState> {
  return inspectResetToken(token)
}

/** The address the authenticator app labels the new entry with. */
export async function enrolmentAccountEmail(userId: string): Promise<string | null> {
  const user = await opsDb.user.findUnique({ where: { id: userId }, select: { email: true } })
  return user?.email ?? null
}
