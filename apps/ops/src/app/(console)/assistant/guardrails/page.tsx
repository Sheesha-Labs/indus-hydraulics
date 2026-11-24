import { PageHeader } from '@indus/ops-ui/shell'
import { T7Settings } from '@indus/ops-ui/templates'
import GuardrailRows from '../../../../components/guardrails/GuardrailRow'
import LastTriggered from '../../../../components/guardrails/LastTriggered'
import { getGuardrailsPage } from '../../../../data/guardrails'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { requestTime } from '../../../../lib/request-time'

/**
 * Board 100 · Guardrails (S07-T03, T7 full width with the right pane): settings that override every action
 * level, their counts this month, the holiday calendar, the daily caps and the two fixed rules. The Owner
 * edits; the Helper reads.
 */
export default async function AssistantGuardrailsPage() {
  const user = await requireOpsUser().catch(signInFor('/assistant/guardrails'))
  const now = requestTime()
  const page = await getGuardrailsPage(user, now)
  return (
    <T7Settings
      header={
        <PageHeader
          crumb="Assistant / Autopilot"
          title="Guardrails"
          meta="Override every action level"
        />
      }
      aside={<LastTriggered items={page.last} now={now} />}
      asideLabel="How guardrails work"
    >
      <div data-built="guardrails">
        <GuardrailRows page={page} />
      </div>
    </T7Settings>
  )
}
