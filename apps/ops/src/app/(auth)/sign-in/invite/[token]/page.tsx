import Arrives from '../../../../../components/skeleton/Arrives'
import { linkToken, routeParam } from '../../../../../lib/route-params'

/** Accept your invitation (T11 sign-in card, the (auth) layout). S03 builds it. */
export default async function SignInInviteTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  routeParam(linkToken, token)
  return (
    <>
      <h1 className="io-display text-io-record">Accept your invitation</h1>
      <Arrives sprint="S03" what="Board 84b: join Indus Operations from the Owner’s invitation." />
    </>
  )
}
