import Arrives from '../../../../../components/skeleton/Arrives'

/** Set up two-step verification (T11 sign-in card, the (auth) layout). S03 builds it. */
export default function SignInTwoFactorSetupPage() {
  return (
    <>
      <h1 className="io-display text-io-record">Set up two-step verification</h1>
      <Arrives
        sprint="S03"
        what="Board 77: scan the code, then confirm with the first six digits."
      />
    </>
  )
}
