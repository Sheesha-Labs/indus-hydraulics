import { PageHeader } from '@indus/ops-ui/shell'
import { T7Settings } from '@indus/ops-ui/templates'
import BudgetBanner from '../../../../components/cost/BudgetBanner'
import BudgetModes from '../../../../components/cost/BudgetModes'
import SpendBreakdown from '../../../../components/cost/SpendBreakdown'
import SpendMeter, { TopRuns } from '../../../../components/cost/SpendMeter'
import { getCostPage } from '../../../../data/ai-cost'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { requestTime } from '../../../../lib/request-time'

/**
 * Board 101 · Cost & limits (S07-T04, T7 full width): month to date against the budget with the projection,
 * the breakdown by purpose or model, the most expensive runs, and the limits (budget, research cap, what
 * happens when the budget is reached). The Owner edits; the Helper reads.
 */
export default async function AssistantCostPage() {
  const user = await requireOpsUser().catch(signInFor('/assistant/cost'))
  const cost = await getCostPage(user, requestTime())
  return (
    <T7Settings
      header={
        <PageHeader
          crumb="Assistant / Autopilot"
          title="Cost & limits"
          meta="AI usage, billed in USD"
        />
      }
    >
      <div data-built="cost" className="flex flex-col gap-[18px]">
        <BudgetBanner cost={cost} />
        <div className="grid grid-cols-[minmax(0,1fr)_514px] items-start gap-[18px]">
          <div className="flex min-w-0 flex-col gap-[18px]">
            <SpendMeter cost={cost} />
            <SpendBreakdown cost={cost} />
            <TopRuns runs={cost.topRuns} />
          </div>
          <BudgetModes cost={cost} />
        </div>
      </div>
    </T7Settings>
  )
}
