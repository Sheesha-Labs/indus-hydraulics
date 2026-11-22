import { AuthTitle, TextLink } from '../../../../components/auth/AuthParts'
import TwoFactorForm from '../../../../components/auth/TwoFactorForm'
import { readPendingCookie } from '../../../../server/access/pending-cookie'

/**
 * Board 77 · 2FA code. Reached only from the password step, which leaves the sealed pending cookie;
 * without it (expired, or opened directly) the card says so and goes back to sign-in.
 */
export default async function SignInTwoFactorPage() {
  const pending = await readPendingCookie('signin')
  if (!pending) {
    return (
      <>
        <AuthTitle title="Enter the 6-digit code" />
        <p className="text-io-ink-2 text-center text-[13px] leading-[1.5]">
          This step follows your email and password, and it times out after 5 minutes.
        </p>
        <TextLink href="/sign-in">Back to sign in</TextLink>
      </>
    )
  }
  return (
    <>
      <AuthTitle title="Enter the 6-digit code" lead="From your authenticator app" />
      <TwoFactorForm />
    </>
  )
}
