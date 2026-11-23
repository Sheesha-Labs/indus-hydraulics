import { Banner } from '@indus/ops-ui/status'
import { getTeamPage } from '../../../../data/team'
import { isRecentSignIn, myDevices, mySecurity } from '../../../../data/team-security'
import { can, currentSessionId, requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { firstName } from '../../../../lib/setup-steps'
import { lastOwnerBanner } from '../../../../server/access/team-core'
import type { SecurityChange } from './actions/sessions'
import { beginTransfer } from './actions/team'
import DevicesSection from './DevicesSection'
import PermissionsTable from './PermissionsTable'
import ProfileSection from './ProfileSection'
import SecuritySection from './SecuritySection'
import TeamSection from './TeamSection'

type Props = {
  searchParams: Promise<{ security?: string; transfer?: string; guard?: string }>
}

/** Open work the Helper holds: zero until S12 builds supplier RFQs (team.ts countOpenWork). */
const NO_WORK = { supplierRfqs: 0, draftChasers: 0 }

/**
 * Board 84 · Team, profile and devices (T7, S03-T03 owns the layout). Top to bottom as the board draws
 * it: the Team card (Invite a helper is the page's one primary, Owner only), "What each role can do"
 * from the capability map, then the three-column row #profile · #devices · #security (S03-T02's
 * sections, unchanged). A Helper sees the same page read-only.
 *
 * 84b inside this page: the last-Owner banner (`?guard=last-owner`, or when Remove meets the guard).
 * (decision) "Invite a helper" sits in the Team card's head, where board 84 draws it, not in the
 * settings PageHeader (the settings layout renders one header for every settings page).
 */
export default async function SettingsTeamPage({ searchParams }: Props) {
  const user = await requireOpsUser().catch(signInFor('/settings/team'))
  const [query, sid] = await Promise.all([searchParams, currentSessionId()])
  const [team, devices, security] = await Promise.all([
    getTeamPage(user),
    myDevices(user.id, sid),
    mySecurity(user.id, sid),
  ])
  const now = security.readAt
  const asked: SecurityChange | null =
    query.security === 'password' || query.security === 'backup-codes' ? query.security : null
  const open = asked && isRecentSignIn(security.signedInAt, now) ? asked : null
  const manage = can(user, 'manage_team')
  const owner = team.members.find((m) => m.role === 'owner') ?? null
  const helper = team.members.find((m) => m.role === 'helper') ?? null
  const transferOpen = manage && query.transfer === '1' && isRecentSignIn(security.signedInAt, now)

  return (
    <div data-built="S03" className="flex flex-col gap-4 pb-6">
      {manage && query.guard === 'last-owner' && owner ? (
        <Banner
          tone="warn"
          announce
          actions={
            <form action={beginTransfer}>
              <button
                type="submit"
                className="io-focus rounded-io-tag text-[12.5px] font-medium underline underline-offset-2"
              >
                Transfer ownership
              </button>
            </form>
          }
        >
          {lastOwnerBanner(firstName(owner.name))}
        </Banner>
      ) : null}
      <div id="team" className="scroll-mt-4">
        <TeamSection
          members={team.members}
          invites={team.invites}
          domain={team.workspaceDomain}
          manage={manage}
          transferOpen={transferOpen}
          helperWork={NO_WORK}
          now={team.now}
        />
      </div>
      <PermissionsTable
        helper={helper ? { id: helper.id, name: helper.name, flags: helper.flags } : null}
        ownerName={owner?.name ?? null}
        floorPct={team.floorPct}
        manage={manage}
        helperWork={NO_WORK}
      />
      <div className="grid grid-cols-3 items-start gap-4">
        <section id="profile" aria-label="Profile" className="min-w-0 scroll-mt-4">
          <ProfileSection me={team.me} />
        </section>
        <section id="devices" aria-label="Devices and sessions" className="min-w-0 scroll-mt-4">
          <DevicesSection devices={devices} now={now} />
        </section>
        <section id="security" aria-label="Security" className="min-w-0 scroll-mt-4">
          <SecuritySection security={security} now={now} open={open} />
        </section>
      </div>
    </div>
  )
}
