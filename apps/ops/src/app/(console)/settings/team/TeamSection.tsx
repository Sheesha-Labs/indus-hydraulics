import { formatDate } from '@indus/ops-ui/format'
import { Person } from '@indus/ops-ui/card'
import { Chip } from '@indus/ops-ui/status'
import { activityLabel } from '../../../../components/settings/team/labels'
import {
  InviteHelperButton,
  PermissionsButton,
  RemoveButton,
  ResendInviteButton,
  RevokeInviteButton,
  TransferOwnership,
} from '../../../../components/settings/team/TeamActions'
import type { PendingInvite, TeamMember } from '../../../../data/team'
import { firstName } from '../../../../lib/setup-steps'
import { openWorkSentence, type OpenWork } from '../../../../server/access/team-core'

type Props = {
  members: TeamMember[]
  invites: PendingInvite[]
  domain: string
  /** The Owner gets the controls; a Helper sees the same card read-only. */
  manage: boolean
  /** `?transfer=1`: the server checked the 10-minute sign-in and the dialog opens. */
  transferOpen: boolean
  helperWork: OpenWork
  now: Date
}

const ROW =
  'border-io-line grid grid-cols-[minmax(0,1fr)_120px_140px_260px] items-center gap-4 border-b px-4 py-3'

function peopleCount(n: number): string {
  return `${n} ${n === 1 ? 'person' : 'people'}`
}

/**
 * Board 84 "Team · n people and the Assistant" (S03-T03): each person with their role and activity, the
 * open invitation, and the note. The Owner's controls: Invite a helper (the page's one primary),
 * Transfer ownership on the Owner row, Permissions and Remove on the Helper row, Resend and Revoke on
 * an invitation.
 */
export default function TeamSection({
  members,
  invites,
  domain,
  manage,
  transferOpen,
  helperWork,
  now,
}: Props) {
  const owner = members.find((m) => m.role === 'owner') ?? null
  const helper = members.find((m) => m.role === 'helper') ?? null
  const ownerFirst = owner ? firstName(owner.name) : 'the Owner'
  const helperPerson = helper
    ? { id: helper.id, name: helper.name, firstName: firstName(helper.name) }
    : null
  const blocked = helper
    ? 'One helper at a time.'
    : invites.some((i) => !i.expired)
      ? 'An invite is open.'
      : undefined
  return (
    <section
      aria-labelledby="team-title"
      className="rounded-io-card border-io-line bg-io-card flex flex-col border"
    >
      <div className="border-io-line flex min-h-[61px] items-center justify-between gap-4 border-b px-4 py-3">
        <h2 id="team-title" className="io-eyebrow m-0">
          Team · {peopleCount(members.length)} and the Assistant
        </h2>
        {manage ? <InviteHelperButton domain={domain} disabled={blocked} /> : null}
      </div>
      <ul aria-label="People" className="m-0 flex list-none flex-col p-0">
        {members.map((m) => {
          const sub = [m.email, m.mailbox].filter(Boolean).join(' · ')
          const isOwner = m.role === 'owner'
          return (
            <li key={m.id} data-member={m.role} className={ROW}>
              <Person
                initials={m.initials}
                name={m.name}
                sub={sub}
                who={isOwner ? 'owner' : 'helper'}
              />
              <span>
                <Chip tone={isOwner ? 'n' : 'acc'} label={isOwner ? 'Owner' : 'Helper'} />
              </span>
              <span className="text-io-ink-3 text-[12.5px]">
                {m.lastSeenAt ? activityLabel(m.lastSeenAt, now) : 'Not signed in yet'}
              </span>
              <span className="flex flex-wrap items-center gap-2">
                {manage && isOwner ? (
                  <TransferOwnership
                    helper={helperPerson}
                    ownerFirstName={ownerFirst}
                    open={transferOpen}
                  />
                ) : null}
                {manage && !isOwner && helperPerson ? (
                  <>
                    <PermissionsButton helper={helperPerson} flags={m.flags} />
                    <RemoveButton
                      person={helperPerson}
                      consequence={openWorkSentence(ownerFirst, helperWork)}
                    />
                  </>
                ) : null}
              </span>
            </li>
          )
        })}
        {invites.map((i) => (
          <li key={i.id} data-invite={i.expired ? 'expired' : 'pending'} className={ROW}>
            <Person
              initials={i.email.slice(0, 2).toUpperCase()}
              name={i.email}
              sub={`Invited ${formatDate(i.createdAt, { now })} · ${i.expired ? 'expired' : 'expires'} ${formatDate(i.expiresAt, { now })}`}
              who="ext"
            />
            <span>
              <Chip tone="acc" label="Helper" />
            </span>
            <span className="text-io-ink-3 text-[12.5px]">{i.expired ? 'Expired' : 'Pending'}</span>
            <span className="flex flex-wrap items-center gap-2">
              {manage ? (
                <>
                  <ResendInviteButton inviteId={i.id} email={i.email} />
                  <RevokeInviteButton inviteId={i.id} email={i.email} />
                </>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-io-ink-3 m-0 px-4 py-3 text-[12px] leading-[1.45]">
        Invites must be @{domain} unless you override it. Transfer ownership asks you to sign in
        again.
      </p>
    </section>
  )
}
