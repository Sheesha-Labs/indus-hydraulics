import { NAV_DESTINATIONS, activeKeyFromPathname } from '@indus/ops-ui/shell/nav'
import {
  AuthFoot,
  AuthTitle,
  GoogleButton,
  Notice,
  OrRule,
} from '../../../components/auth/AuthParts'
import PasswordForm from '../../../components/auth/PasswordForm'
import { isGoogleRefusal, signInNotice } from '../../../components/auth/states'
import { env } from '../../../lib/env'
import { safeNextPath } from '../../../lib/safe-next-path'
import { companyLegalName } from '../../../server/access/auth-settings'

type Props = {
  searchParams: Promise<{ next?: string; error?: string; reason?: string; minutes?: string }>
}

/** "Return to Review": the page `next` points at, by its sidebar name. */
function pageLabel(next: string | null): string {
  if (!next) return 'Today'
  const key = activeKeyFromPathname(next)
  return NAV_DESTINATIONS.find((d) => d.key === key)?.label ?? 'where you were'
}

/**
 * Board 77 · Sign in (T11; the (auth) layout draws the card). Continue with Google is the one primary
 * and the main way in; email + password opens the authenticator step. Every refusal and every
 * redirect reason renders as a Banner inside the card (states.ts has the table).
 */
export default async function SignInPage({ searchParams }: Props) {
  const query = await searchParams
  const next = safeNextPath(query.next) ?? undefined
  const domain = env().GOOGLE_WORKSPACE_DOMAIN
  const notice = signInNotice(query, { domain, pageLabel: pageLabel(next ?? null) })
  const subtitle = await companyLegalName()
  return (
    <>
      <AuthTitle main title="Indus Operations" subtitle={subtitle || undefined} />
      <Notice notice={notice} />
      <GoogleButton
        next={next}
        primary
        label={isGoogleRefusal(query.error) ? 'Use another account' : 'Continue with Google'}
      />
      <OrRule />
      <PasswordForm next={next} />
      <AuthFoot>Only @{domain} accounts</AuthFoot>
    </>
  )
}
