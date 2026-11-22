import SubNav from '../../../../components/route/SubNav'
import SettingsSkeleton from '../../../../components/skeleton/SettingsSkeleton'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { SETTINGS_NAV } from '../../../../lib/settings-nav'

/** Board 100 · Guardrails (T7, with the settings sub-nav's Assistant group, C41). S07 builds it. */
export default async function AssistantGuardrailsPage() {
  await requireOpsUser().catch(signInFor(`/assistant/guardrails`))
  return (
    <SettingsSkeleton
      crumb="Assistant"
      title="Guardrails"
      subnav={<SubNav groups={SETTINGS_NAV} />}
      sprint="S07"
      what="Board 100: limits that override every action’s level."
    />
  )
}
