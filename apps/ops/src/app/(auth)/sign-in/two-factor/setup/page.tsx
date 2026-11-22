import { Button } from '@indus/ops-ui/controls'
import QRCode from 'qrcode'
import { AuthTitle } from '../../../../../components/auth/AuthParts'
import SetupForm from '../../../../../components/auth/SetupForm'
import { enrolmentAccountEmail } from '../../../../../data/sign-in'
import { readPendingCookie } from '../../../../../server/access/pending-cookie'
import { formatManualKey, otpauthUri } from '../../../../../server/access/totp'
import { startTotpSetup } from '../../actions'

/**
 * Set up two-step verification (board 77's 2FA, enrolment side). Used by Settings › Security and by
 * invite acceptance (S03-T03), which start it with a sealed `enrol` pending cookie holding the new
 * secret. Without one, Start begins an enrolment for the signed-in person (a signed-out visitor is sent to
 * sign in first).
 */
export default async function SignInTwoFactorSetupPage() {
  const pending = await readPendingCookie('enrol')
  if (pending?.pendingSecret) {
    const email = await enrolmentAccountEmail(pending.uid)
    if (email) {
      const uri = otpauthUri(email, pending.pendingSecret)
      const svg = await QRCode.toString(uri, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' })
      const qr = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
      return (
        <>
          <AuthTitle title="Set up two-step verification" />
          <SetupForm qr={qr} manualKey={formatManualKey(pending.pendingSecret)} />
        </>
      )
    }
  }

  // No session read here (route-tree guard (f)): Start runs startTotpSetup, which requires one and
  // sends a signed-out visitor to sign in first.
  return (
    <>
      <AuthTitle title="Set up two-step verification" />
      <p className="text-io-ink-2 text-center text-[13px] leading-[1.5]">
        Password sign-in asks for a code from an authenticator app on your phone. Setting it up
        takes a minute.
      </p>
      <form action={startTotpSetup} className="flex flex-col">
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Start
        </Button>
      </form>
    </>
  )
}
