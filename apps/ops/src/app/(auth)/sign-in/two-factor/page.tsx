import Arrives from '../../../../components/skeleton/Arrives'

/** Two-step verification (T11 sign-in card, the (auth) layout). S03 builds it. */
export default function SignInTwoFactorPage() {
  return (
    <>
      <h1 className="io-display text-io-record">Two-step verification</h1>
      <Arrives sprint="S03" what="Board 77: enter the code from your authenticator app." />
    </>
  )
}
