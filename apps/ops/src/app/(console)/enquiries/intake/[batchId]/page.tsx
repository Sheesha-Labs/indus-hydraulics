import WizardSkeleton from '../../../../../components/skeleton/WizardSkeleton'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { recordId, routeParam } from '../../../../../lib/route-params'

/** Boards 15–16 · Intake batch (T9 Wizard). S08 builds it. */
export default async function EnquiriesIntakeBatchIdPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/intake/${batchId}`))
  routeParam(recordId, batchId)
  return (
    <WizardSkeleton
      title="Intake batch"
      steps={['Extract', 'Match', 'Create']}
      sprint="S08"
      what="Boards 15 and 16: check what was read from the files, then match it to a client."
    />
  )
}
