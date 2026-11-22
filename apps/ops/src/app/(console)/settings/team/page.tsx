import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

const SECTIONS = [
  { id: 'profile', title: 'Profile' },
  { id: 'devices', title: 'Devices' },
  { id: 'security', title: 'Security' },
] as const

/**
 * Board 84 · Team, profile and devices (T7). One page (decision: board 84 draws all four): Team and
 * permissions, then #profile, #devices and #security, which the sub-nav's People › Profile and Devices
 * and the avatar menu link to. S03 builds it.
 */
export default async function SettingsTeamPage() {
  await requireOpsUser().catch(signInFor('/settings/team'))
  return (
    <div className="flex flex-col gap-6">
      <Arrives
        sprint="S03"
        what="Board 84: the team and what each person may do, then your profile, devices and security."
      />
      {SECTIONS.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-4">
          <h2 id={`${s.id}-title`} className="text-io-card-title">
            {s.title}
          </h2>
        </section>
      ))}
    </div>
  )
}
