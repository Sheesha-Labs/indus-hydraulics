import SubNav from '../../../../components/route/SubNav'
import SettingsSkeleton from '../../../../components/skeleton/SettingsSkeleton'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { SETTINGS_NAV } from '../../../../lib/settings-nav'

/** Board 98 · Autopilot (T7, with the settings sub-nav's Assistant group, C41). S07 builds it. */
export default async function AssistantAutopilotPage() {
  await requireOpsUser().catch(signInFor(`/assistant/autopilot`))
  return (
    <SettingsSkeleton
      crumb="Assistant"
      title="Autopilot"
      subnav={<SubNav groups={SETTINGS_NAV} />}
      sprint="S07"
      what="Board 98: how much the Assistant may do, action by action."
    />
  )
}
