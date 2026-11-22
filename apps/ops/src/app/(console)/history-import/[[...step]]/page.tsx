import WizardSkeleton from '../../../../components/skeleton/WizardSkeleton'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { routeParam, wizardSteps } from '../../../../lib/route-params'

/** Boards 116–121 · History import (T9 Wizard). S20 builds it. */
export default async function HistoryImportStepPage({
  params,
}: {
  params: Promise<{ step?: string[] }>
}) {
  const { step } = await params
  await requireOpsUser().catch(
    signInFor(`/history-import${step?.length ? `/${step.join('/')}` : ''}`)
  )
  routeParam(wizardSteps, step)
  return (
    <WizardSkeleton
      title="Bring in your history"
      steps={['Choose', 'Import', 'Review']}
      sprint="S20"
      what="Boards 116 to 121: import past enquiries, quotations and prices from Zoho Books and mail."
    />
  )
}
