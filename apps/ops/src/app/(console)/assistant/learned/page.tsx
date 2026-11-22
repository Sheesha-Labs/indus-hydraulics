import SubNav from '../../../../components/route/SubNav'
import SettingsSkeleton from '../../../../components/skeleton/SettingsSkeleton'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { SETTINGS_NAV } from '../../../../lib/settings-nav'

/** Board 115 · What the Assistant has learned (T7, with the settings sub-nav's Assistant group, C41). S07 builds it. */
export default async function AssistantLearnedPage() {
  await requireOpsUser().catch(signInFor(`/assistant/learned`))
  return (
    <SettingsSkeleton
      crumb="Assistant"
      title="What the Assistant has learned"
      subnav={<SubNav groups={SETTINGS_NAV} />}
      sprint="S07"
      what="Board 115: the preferences it learned from your edits."
    />
  )
}
