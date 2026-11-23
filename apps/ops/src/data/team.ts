import 'server-only'
import { opsDb } from '@indus/ops-db'
import { can, type HelperFlag, type OpsRole, type OpsUser } from '../lib/access'
import { env } from '../lib/env'
import { getSetting } from '../server/settings/get'
import { inviteState, signatureToText } from '../server/access/team-core'
import { mailboxLabel, type ShellMailbox } from './shell'

/**
 * Page reads for /settings/team's Team card, the permissions table and #profile (board 84, S03-T03).
 * Two queries (people with their latest session, open invitations) plus the cached pricing setting,
 * and a third only once anyone has a mailbox (S04). Writes go through settings/team/actions/team.ts.
 */
export type TeamMember = {
  id: string
  name: string
  initials: string
  email: string
  role: OpsRole
  mailbox: ShellMailbox
  /** The newest live session's last activity; null when they have never signed in. */
  lastSeenAt: Date | null
  flags: Record<HelperFlag, boolean>
}

export type PendingInvite = {
  id: string
  email: string
  createdAt: Date
  expiresAt: Date
  expired: boolean
}

export type MyProfile = {
  name: string
  phone: string | null
  signature: string
  mailbox: ShellMailbox
}

export type TeamPageData = {
  members: TeamMember[]
  invites: PendingInvite[]
  workspaceDomain: string
  /** The approval floor for "Approve below the n% floor"; null for someone who may not see margins. */
  floorPct: number | null
  me: MyProfile
  now: Date
}

export async function getTeamPage(user: OpsUser): Promise<TeamPageData> {
  const now = new Date()
  const [people, invites, pricing] = await Promise.all([
    opsDb.user.findMany({
      where: { status: 'active' },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        initials: true,
        email: true,
        role: true,
        phone: true,
        signatureHtml: true,
        primaryMailboxId: true,
        canSeeMargins: true,
        canSendSupplierMail: true,
        canEditChaserRules: true,
        sessions: {
          where: { revokedAt: null },
          orderBy: { lastSeenAt: 'desc' },
          take: 1,
          select: { lastSeenAt: true },
        },
      },
    }),
    opsDb.userInvite.findMany({
      where: { acceptedAt: null, revokedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, email: true, createdAt: true, expiresAt: true, acceptedAt: true, revokedAt: true },
    }),
    can(user, 'see_margins') ? getSetting('pricing.defaults') : Promise.resolve(null),
  ])

  const mailboxIds = people.map((p) => p.primaryMailboxId).filter((id): id is string => !!id)
  const mailboxes = mailboxIds.length
    ? await opsDb.mailbox.findMany({
        where: { id: { in: mailboxIds } },
        select: { id: true, address: true },
      })
    : []
  const mailboxOf = (id: string | null) =>
    mailboxLabel(mailboxes.find((m) => m.id === id)?.address)

  const members: TeamMember[] = people.map((p) => ({
    id: p.id,
    name: p.name,
    initials: p.initials,
    email: p.email,
    role: p.role,
    mailbox: mailboxOf(p.primaryMailboxId),
    lastSeenAt: p.sessions[0]?.lastSeenAt ?? null,
    flags: {
      canSeeMargins: p.canSeeMargins,
      canSendSupplierMail: p.canSendSupplierMail,
      canEditChaserRules: p.canEditChaserRules,
    },
  }))
  const self = people.find((p) => p.id === user.id)
  return {
    members,
    invites: invites.map((i) => ({
      id: i.id,
      email: i.email,
      createdAt: i.createdAt,
      expiresAt: i.expiresAt,
      expired: inviteState(i, now) === 'expired',
    })),
    workspaceDomain: env().GOOGLE_WORKSPACE_DOMAIN,
    floorPct: pricing ? pricing.floorPct : null,
    me: {
      name: self?.name ?? user.name,
      phone: self?.phone ?? null,
      signature: signatureToText(self?.signatureHtml),
      mailbox: mailboxOf(self?.primaryMailboxId ?? null),
    },
    now,
  }
}

/** Setup step 6: the Helper (active) and the open invitation, if any. */
export async function getInviteStep(): Promise<{
  helper: { name: string; email: string } | null
  invite: PendingInvite | null
  workspaceDomain: string
}> {
  const now = new Date()
  const [helper, invite] = await Promise.all([
    opsDb.user.findFirst({
      where: { role: 'helper', status: 'active' },
      select: { name: true, email: true },
    }),
    opsDb.userInvite.findFirst({
      where: { acceptedAt: null, revokedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, createdAt: true, expiresAt: true, acceptedAt: true, revokedAt: true },
    }),
  ])
  return {
    helper,
    invite: invite
      ? {
          id: invite.id,
          email: invite.email,
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt,
          expired: inviteState(invite, now) === 'expired',
        }
      : null,
    workspaceDomain: env().GOOGLE_WORKSPACE_DOMAIN,
  }
}
