import ClientSkeleton from '../../../../components/skeleton/ClientSkeleton'
import { linkToken, routeParam } from '../../../../lib/route-params'

/** Your document (T12 client page). S18 builds it. No console session is read here; the token is the only credential and its sprint verifies it. */
export default async function DTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  routeParam(linkToken, token)
  return (
    <ClientSkeleton
      eyebrow="Document"
      title="Your document"
      sprint="S18"
      what="Board 230: an order acknowledgement, proforma, invoice or delivery note."
    />
  )
}
