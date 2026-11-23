import { Button } from '@indus/ops-ui/controls'
import { Banner } from '@indus/ops-ui/status'
import AuthField from '../../../../components/auth/AuthField'
import { AuthTitle, TextLink } from '../../../../components/auth/AuthParts'
import { TEXT } from '../../../../components/auth/states'
import { requestReset } from '../actions'

type Props = { searchParams: Promise<{ sent?: string; link?: string }> }

const LINK_STATE: Record<string, string> = {
  expired: 'That link has expired. Send a new one below.',
  used: 'That link has already been used. Send a new one below.',
  unknown: 'That link does not work. Send a new one below.',
}

/**
 * Board 77 · Forgot password. The answer is always the board's sentence, whoever the address belongs
 * to; what actually happens (a reset link, the Google-only reminder by email, or nothing) runs after
 * the response (server/access/reset.ts). An expired or used link lands here offering a new one.
 */
export default async function SignInForgotPage({ searchParams }: Props) {
  const { sent, link } = await searchParams
  const linkState = link ? (LINK_STATE[link] ?? LINK_STATE.unknown) : null
  return (
    <>
      <AuthTitle title="Reset your password" />
      {linkState && !sent ? (
        <Banner tone="warn" className="px-3 py-2.5 text-[12.5px]">
          {linkState}
        </Banner>
      ) : null}
      <form action={requestReset} className="flex flex-col gap-3.5">
        <AuthField
          id="forgot-email"
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          required
          spellCheck={false}
        />
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Send link
        </Button>
      </form>
      {sent ? (
        <Banner tone="info" className="px-3 py-2.5 text-[12.5px]">
          {TEXT.forgotSent}
        </Banner>
      ) : null}
      <TextLink href="/sign-in">Back to sign in</TextLink>
    </>
  )
}
