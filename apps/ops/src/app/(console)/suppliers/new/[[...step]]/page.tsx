import WizardSkeleton from '../../../../../components/skeleton/WizardSkeleton'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { routeParam, wizardSteps } from '../../../../../lib/route-params'

/** Boards 50–52 · New supplier (T9 Wizard). S10 builds it. */
export default async function SuppliersNewStepPage({
  params,
}: {
  params: Promise<{ step?: string[] }>
}) {
  const { step } = await params
  await requireOpsUser().catch(
    signInFor(`/suppliers/new${step?.length ? `/${step.join('/')}` : ''}`)
  )
  routeParam(wizardSteps, step)
  return (
    <WizardSkeleton
      title="New supplier"
      steps={['Company', 'Documents', 'Vetting', 'Bank', 'Approve']}
      sprint="S10"
      what="Boards 50 to 52: add a supplier, vet it and record its line card."
    />
  )
}
