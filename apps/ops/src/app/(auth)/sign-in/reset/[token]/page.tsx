import { ButtonLink } from '@indus/ops-ui/controls'
import { Banner } from '@indus/ops-ui/status'
import { AuthTitle } from '../../../../../components/auth/AuthParts'
import ResetForm from '../../../../../components/auth/ResetForm'
import { linkToken, routeParam } from '../../../../../lib/route-params'
import { resetLinkState } from '../../../../../data/sign-in'

const DEAD: Record<'expired' | 'used' | 'unknown', string> = {
  expired: 'This link has expired. Reset links work for 30 minutes.',
  used: 'This link has already been used. Each reset link works once.',
  unknown: 'This link does not work.',
}

/**
 * Board 77 · Set new password, from the emailed link. The token is looked up by its sha256; an
 * expired, used or unknown link offers a new one. The authenticator code is asked when the account
 * has one (it always has, for password sign-in).
 */
export default async function SignInResetTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const valid = routeParam(linkToken, token)
  const link = await resetLinkState(valid)
  if (link.state !== 'valid') {
    return (
      <>
        <AuthTitle title="Choose a new password" />
        <Banner tone="warn" className="px-3 py-2.5 text-[12.5px]">
          {DEAD[link.state]}
        </Banner>
        <ButtonLink href="/sign-in/forgot" size="lg" className="w-full">
          Send a new link
        </ButtonLink>
      </>
    )
  }
  return (
    <>
      <AuthTitle title="Choose a new password" />
      <ResetForm token={valid} needsCode={link.needsCode} />
    </>
  )
}
