import { Button, ButtonLink } from '@indus/ops-ui/controls'
import { formatDate } from '@indus/ops-ui/format'
import { Banner } from '@indus/ops-ui/status'
import { AuthTitle, GoogleMark, OrRule } from '../../../../../components/auth/AuthParts'
import InviteAcceptForm from '../../../../../components/auth/InviteAcceptForm'
import { inviteLinkState } from '../../../../../data/sign-in'
import { linkToken, routeParam } from '../../../../../lib/route-params'
import { firstName } from '../../../../../lib/setup-steps'
import { continueInviteWithGoogle } from '../../actions'

const DEAD = {
  revoked: 'This invitation was withdrawn. Ask the Owner if you still need access.',
  used: 'This invitation has already been used. Sign in instead.',
  unknown: 'This invitation link does not work. Check you opened the whole link from the email.',
} as const

/**
 * Board 77 · Accept invitation (T11, the (auth) layout draws the card; S03-T03). "Join Indus
 * Operations", who invited them, Continue with Google (the one primary: it must be the invited
 * address), or set a password and then an authenticator. An expired link names its date and asks the
 * inviter to resend; a revoked, used or unknown link is a plain state with a sign-in link.
 */
export default async function SignInInviteTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const valid = routeParam(linkToken, token)
  const invite = await inviteLinkState(valid)

  if (invite.state === 'expired') {
    return (
      <>
        <AuthTitle title="Join Indus Operations" />
        <Banner tone="warn" className="px-3 py-2.5 text-[12.5px]">
          This invitation expired on {formatDate(invite.expiresAt)}. Ask{' '}
          {firstName(invite.inviterName)} to resend.
        </Banner>
        <ButtonLink href="/sign-in" size="lg" className="w-full">
          Go to sign-in
        </ButtonLink>
      </>
    )
  }
  if (invite.state !== 'valid') {
    return (
      <>
        <AuthTitle title="Join Indus Operations" />
        <Banner tone="info" className="px-3 py-2.5 text-[12.5px]">
          {DEAD[invite.state]}
        </Banner>
        <ButtonLink href="/sign-in" size="lg" className="w-full">
          Go to sign-in
        </ButtonLink>
      </>
    )
  }

  return (
    <>
      <AuthTitle
        title="Join Indus Operations"
        subtitle={`Invited by ${invite.inviterName} as ${invite.role === 'owner' ? 'Owner' : 'Helper'}`}
      />
      <form action={continueInviteWithGoogle} className="flex flex-col">
        <input type="hidden" name="token" value={valid} />
        <Button type="submit" size="lg" variant="primary" className="w-full gap-2.5 text-[14px]">
          <span className="bg-io-card rounded-io-pill flex p-[2px]">
            <GoogleMark />
          </span>
          Continue with Google
        </Button>
      </form>
      <p className="text-io-ink-3 -mt-1.5 text-center text-[12px] leading-[1.45]">
        Use the Google account for {invite.email}.
      </p>
      <OrRule />
      <InviteAcceptForm token={valid} />
    </>
  )
}
