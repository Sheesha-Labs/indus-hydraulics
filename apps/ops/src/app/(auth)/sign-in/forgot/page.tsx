import Arrives from '../../../../components/skeleton/Arrives'

/** Reset your password (T11 sign-in card, the (auth) layout). S03 builds it. */
export default function SignInForgotPage() {
  return (
    <>
      <h1 className="io-display text-io-record">Reset your password</h1>
      <Arrives sprint="S03" what="Board 77: we email a reset link to your Indus address." />
    </>
  )
}
