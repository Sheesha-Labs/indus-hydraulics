import Arrives from '../../../../../components/skeleton/Arrives'
import { linkToken, routeParam } from '../../../../../lib/route-params'

/** Choose a new password (T11 sign-in card, the (auth) layout). S03 builds it. */
export default async function SignInResetTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  routeParam(linkToken, token)
  return (
    <>
      <h1 className="io-display text-io-record">Choose a new password</h1>
      <Arrives sprint="S03" what="Board 77: set a new password from the emailed link." />
    </>
  )
}
