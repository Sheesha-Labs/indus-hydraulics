import ClientSkeleton from '../../../../../components/skeleton/ClientSkeleton'
import { linkToken, routeParam } from '../../../../../lib/route-params'

/** Ask for changes (T12 client page). S18 builds it. No console session is read here; the token is the only credential and its sprint verifies it. */
export default async function QTokenChangesPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  routeParam(linkToken, token)
  return (
    <ClientSkeleton
      eyebrow="Quotation"
      title="Ask for changes"
      sprint="S18"
      what="Board 229: ask for changes to lines, with a message and files."
    />
  )
}
