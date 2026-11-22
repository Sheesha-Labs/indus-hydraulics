import { Card } from '@indus/ops-ui/card'
import { T5Document } from '@indus/ops-ui/templates'
import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/** Board 156 · Quotation tab (T5 Document on well; the cockpit drops its rail and gutter for it). S17 builds it. */
export default async function EnquiriesRefQuotationPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}/quotation`))
  routeParam(enquiryRef, ref)
  return (
    <T5Document
      well={
        <div className="flex w-full items-start justify-center p-6">
          <Arrives sprint="S17" what="Board 156: the INDUS/Q quotation on paper." />
        </div>
      }
      side={
        <Card
          eyebrow="Checks and cover email"
          text="Price checks, VAT and the cover email to the client."
        />
      }
    />
  )
}
