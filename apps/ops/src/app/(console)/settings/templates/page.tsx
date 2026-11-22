import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › templates (T7 body; the layout draws the header and sub-nav). S34 builds it. */
export default async function SettingsTemplatesPage() {
  await requireOpsUser().catch(signInFor(`/settings/templates`))
  return <Arrives sprint="S34" what="Board 216: the email templates the Assistant drafts from." />
}
