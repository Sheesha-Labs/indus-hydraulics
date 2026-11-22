import { Card } from '@indus/ops-ui/card'
import { T6Compare } from '@indus/ops-ui/templates'
import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/** Board 148 · Compare tab (T6 Compare grid in the T2 tab body). S16 builds it. */
export default async function EnquiriesRefComparePage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/compare`))
  routeParam(enquiryRef, ref)
  return (
    <T6Compare
      grid={<Arrives sprint="S16" what="Board 148: supplier quotes side by side on landed cost." />}
      aside={
        <Card eyebrow="Scenarios" text="Cheapest, fastest and fewest suppliers, with totals." />
      }
    />
  )
}
