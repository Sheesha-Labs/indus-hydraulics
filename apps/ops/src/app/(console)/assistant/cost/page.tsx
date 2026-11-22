import SubNav from '../../../../components/route/SubNav'
import SettingsSkeleton from '../../../../components/skeleton/SettingsSkeleton'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { SETTINGS_NAV } from '../../../../lib/settings-nav'

/** Board 101 · Cost and limits (T7, with the settings sub-nav's Assistant group, C41). S07 builds it. */
export default async function AssistantCostPage() {
  await requireOpsUser().catch(signInFor(`/assistant/cost`))
  return (
    <SettingsSkeleton
      crumb="Assistant"
      title="Cost and limits"
      subnav={<SubNav groups={SETTINGS_NAV} />}
      sprint="S07"
      what="Board 101: AI usage and the monthly cap, billed in USD."
    />
  )
}
