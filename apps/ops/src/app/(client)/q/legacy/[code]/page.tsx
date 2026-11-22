import ClientSkeleton from '../../../../../components/skeleton/ClientSkeleton'
import { legacyQuoteCode, routeParam } from '../../../../../lib/route-params'

/** Your quotation (T12 client page). S21 builds it. No console session is read here; the token is the only credential and its sprint verifies it. */
export default async function QLegacyCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  routeParam(legacyQuoteCode, code)
  return (
    <ClientSkeleton
      eyebrow="Quotation"
      title="Your quotation"
      sprint="S21"
      what="Quotation links from the old website open here."
    />
  )
}
