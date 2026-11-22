import { Card } from '@indus/ops-ui/card'
import { PageHeader } from '@indus/ops-ui/shell'
import { T2Record } from '@indus/ops-ui/templates'
import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { recordId, routeParam } from '../../../../../lib/route-params'

/**
 * Board 22 · Lead detail (T2 record cockpit, lead variant: no enquiry tabs and no stage track, so a page
 * header in the header slot). S09 builds it, with Convert to enquiry (board 23).
 */
export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/leads/${id}`))
  routeParam(recordId, id)
  return (
    <T2Record
      header={<PageHeader crumb="Enquiries / Leads" title="Lead" />}
      strip={null}
      rail={<Card eyebrow="Lead facts" text="Who asked, for what, and how they reached us." />}
    >
      <Arrives
        sprint="S09"
        what="Boards 22 and 23: the lead’s material specs, and converting it to an enquiry."
      />
    </T2Record>
  )
}
