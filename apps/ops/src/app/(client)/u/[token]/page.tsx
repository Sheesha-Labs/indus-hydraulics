import ClientSkeleton from '../../../../components/skeleton/ClientSkeleton'
import { linkToken, routeParam } from '../../../../lib/route-params'

/** Upload your documents (T12 client page). S10 builds it. No console session is read here; the token is the only credential and its sprint verifies it. */
export default async function UTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  routeParam(linkToken, token)
  return (
    <ClientSkeleton
      eyebrow="Supplier registration"
      title="Upload your documents"
      sprint="S10"
      what="Board 50: upload your company documents to register as a supplier."
    />
  )
}
