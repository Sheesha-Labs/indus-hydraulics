import WizardSkeleton from '../../../../components/skeleton/WizardSkeleton'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Board 14 · New enquiry (T9 Wizard). S08 builds it. */
export default async function EnquiriesNewPage() {
  await requireOpsUser().catch(signInFor(`/enquiries/new`))
  return (
    <WizardSkeleton
      title="New enquiry"
      steps={['Source', 'Lines', 'Client']}
      sprint="S08"
      what="Board 14: type an enquiry in, or upload the client’s files to be read."
    />
  )
}
