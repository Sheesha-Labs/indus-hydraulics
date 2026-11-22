import ClientSkeleton from '../../../../../components/skeleton/ClientSkeleton'
import { linkToken, routeParam } from '../../../../../lib/route-params'

/** Accept the quotation (T12 client page). S18 builds it. No console session is read here; the token is the only credential and its sprint verifies it. */
export default async function QTokenAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  routeParam(linkToken, token)
  return (
    <ClientSkeleton
      eyebrow="Quotation"
      title="Accept the quotation"
      sprint="S18"
      what="Board 229: accept with your name, PO number and delivery address."
    />
  )
}
