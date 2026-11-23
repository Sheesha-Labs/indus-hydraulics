import Arrives from '../../../../components/skeleton/Arrives'
import { isRecentSignIn, myDevices, mySecurity } from '../../../../data/team-security'
import { currentSessionId, requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import type { SecurityChange } from './actions/sessions'
import DevicesSection from './DevicesSection'
import SecuritySection from './SecuritySection'

type Props = { searchParams: Promise<{ security?: string }> }

/**
 * Board 84 · Team, profile and devices (T7). One page (decision: board 84 draws all four): Team and
 * permissions, then #profile, #devices and #security, which the sub-nav's People › Profile and Devices
 * and the avatar menu link to.
 *
 * S03-T02 fills #devices and #security (the bottom row's second and third cards). S03-T03 brings the
 * Team and permissions cards and #profile, and owns the final layout; the bottom row's grid is already
 * the board's three equal columns.
 */
export default async function SettingsTeamPage({ searchParams }: Props) {
  const user = await requireOpsUser().catch(signInFor('/settings/team'))
  const [query, sid] = await Promise.all([searchParams, currentSessionId()])
  const [devices, security] = await Promise.all([myDevices(user.id, sid), mySecurity(user.id, sid)])
  const now = security.readAt
  const asked: SecurityChange | null =
    query.security === 'password' || query.security === 'backup-codes' ? query.security : null
  const open = asked && isRecentSignIn(security.signedInAt, now) ? asked : null
  return (
    <div className="flex flex-col gap-4">
      <Arrives
        sprint="S03"
        what="Board 84: the team and what each person may do, and your profile."
      />
      <div className="grid grid-cols-3 items-start gap-4">
        <section id="profile" aria-labelledby="profile-title" className="min-w-0 scroll-mt-4">
          <h2 id="profile-title" className="text-io-card-title">
            Profile
          </h2>
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
