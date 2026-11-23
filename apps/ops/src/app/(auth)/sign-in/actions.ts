'use server'

import type { Route } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import type {
  PasswordFormState,
  ResetFormState,
  SetupFormState,
  TwoFactorFormState,
} from '../../../components/auth/states'
import { AccessError, requireOpsUser } from '../../../lib/access'
import { signIn, signOut } from '../../../lib/auth'
import { linkToken } from '../../../lib/route-params'
import { SecondFactorError } from '../../../lib/password-provider'
import { clientIp } from '../../../lib/request-origin'
import { safeNextPath } from '../../../lib/safe-next-path'
import { beginEnrolment, confirmEnrolment, confirmedSince } from '../../../server/access/enrolment'
import { PASSWORD_PROBLEM_TEXT } from '../../../server/access/password'
import { newPending } from '../../../server/access/pending-2fa'
import {
  clearPendingCookie,
  rawPendingCookie,
  readPendingCookie,
  setPendingCookie,
} from '../../../server/access/pending-cookie'
import { completePasswordReset, requestPasswordReset } from '../../../server/access/reset'
import { passwordStep } from '../../../server/access/sign-in'
import { ipHash } from '../../../server/auth/session-store'

/**
 * Board 77's server actions. Sign-in happens before there is a user, so these are plain server
 * actions, not defineAction (which starts from the session). Every input is read from FormData as a
 * string and length-capped; nothing here logs an email, a password, a code or a token.
 */
const field = (form: FormData, name: string, max = 512): string => {
  const v = form.get(name)
  return typeof v === 'string' ? v.slice(0, max) : ''
}

async function meta() {
  const h = await headers()
  return { ipHash: ipHash(clientIp(h)), userAgent: h.get('user-agent') }
}

const landing = (form: FormData) => safeNextPath(field(form, 'next', 2048)) ?? '/today'

export async function signInWithGoogle(formData: FormData): Promise<void> {
  // prompt=select_account is set on the provider, so "Use another account" re-runs the picker.
  await signIn('google', { redirectTo: landing(formData) })
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/sign-in' })
}

/** Email + password. Success proves the password only: on to the second factor. */
export async function passwordSignIn(
  _previous: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const email = field(formData, 'email', 320)
  const password = field(formData, 'password', 1024)
  if (!email || !password) return { status: 'missing' }
  const outcome = await passwordStep({ email, password, meta: await meta() })
  switch (outcome.kind) {
    case 'ok':
      break
    case 'locked':
      return { status: 'locked', minutes: outcome.minutes }
    default:
      return { status: outcome.kind }
  }
  const next = safeNextPath(field(formData, 'next', 2048))
  await setPendingCookie(
    newPending({ uid: outcome.userId, purpose: 'signin', ...(next ? { next } : {}) })
  )
  redirect('/sign-in/two-factor')
}

/** The code (or a backup code) → the ops-password provider, which signs in only if it verifies. */
export async function verifySecondFactor(
  _previous: TwoFactorFormState,
  formData: FormData
): Promise<TwoFactorFormState> {
  const backup = field(formData, 'method') === 'backup'
  const value = field(formData, backup ? 'backupCode' : 'code', 64).trim()
  if (!value) return { status: 'missing' }
  const pending = await rawPendingCookie()
  const opened = await readPendingCookie('signin')
  if (!pending || !opened) redirect('/sign-in?error=expired')
  let landed: string
  try {
    landed = await signIn('ops-password', {
      pending,
      ...(backup ? { backupCode: value } : { code: value }),
      redirectTo: opened.next ?? '/today',
      redirect: false,
    })
  } catch (error) {
    if (!(error instanceof SecondFactorError)) throw error
    switch (error.code) {
      case 'wrong_code':
        return { status: 'wrong_code' }
      case 'rate_limited':
        return { status: 'rate_limited' }
      case 'locked':
        await clearPendingCookie()
        return redirect(`/sign-in?error=locked&minutes=${error.minutes ?? 15}`)
      default:
        await clearPendingCookie()
        return redirect('/sign-in?error=expired')
    }
  }
  await clearPendingCookie()
  redirect(afterSignIn(landed, opened.next))
}

/**
 * Where signIn() said to go: its own refusal (`/sign-in?error=…` from the signIn callback, e.g. an
 * account deactivated a moment ago) wins; otherwise the validated `next`.
 */
function afterSignIn(location: string, next: string | undefined): Route {
  const url = new URL(location, 'http://ops.invalid')
  if (url.pathname === '/sign-in' && url.searchParams.has('error')) {
    return `/sign-in?error=${encodeURIComponent(url.searchParams.get('error') ?? '')}` as Route
  }
  // safeNextPath validated a same-origin path; typedRoutes cannot know a runtime string.
  return (safeNextPath(next) ?? '/today') as Route
}

/** Always the same answer; what happens (email or not) runs after the response. */
export async function requestReset(formData: FormData): Promise<void> {
  const email = field(formData, 'email', 320)
  const m = await meta()
  if (email) {
    after(async () => {
      try {
        await requestPasswordReset(email, { ipHash: m.ipHash })
      } catch (error) {
        // Logged without the address; the page has already answered.
        console.error('password reset request failed', error instanceof Error ? error.name : '')
      }
    })
  }
  redirect('/sign-in/forgot?sent=1')
}

export async function resetPassword(
  _previous: ResetFormState,
  formData: FormData
): Promise<ResetFormState> {
  const token = linkToken.safeParse(field(formData, 'token'))
  if (!token.success) redirect('/sign-in/forgot?link=unknown')
  const outcome = await completePasswordReset({
    token: token.data,
    password: field(formData, 'password', 1024),
    code: field(formData, 'code', 64),
    meta: await meta(),
  })
  if (!outcome.ok) {
    switch (outcome.error) {
      case 'link':
        return redirect(`/sign-in/forgot?link=${outcome.state}`)
      case 'password':
        return { status: 'password', message: PASSWORD_PROBLEM_TEXT[outcome.problem] }
      case 'code':
        return { status: 'code' }
      case 'locked':
        return { status: 'locked', minutes: outcome.minutes }
    }
  }
  if (!outcome.secondFactorVerified) redirect('/sign-in?reason=password_saved')
  // The reset just verified an authenticator code: that is this sign-in's second factor.
  const proof = newPending({ uid: outcome.userId, purpose: 'signin', proof: 'reset' })
  await setPendingCookie(proof)
  return finishWithProof()
}

async function finishWithProof(next = '/today'): Promise<never> {
  const pending = await rawPendingCookie()
  if (!pending) redirect('/sign-in?error=expired')
  let landed: string
  try {
    landed = await signIn('ops-password', { pending, redirectTo: next, redirect: false })
  } catch (error) {
    if (!(error instanceof SecondFactorError)) throw error
    await clearPendingCookie()
    redirect('/sign-in?error=expired')
  }
  await clearPendingCookie()
  redirect(afterSignIn(landed, next))
}

/** Settings › Security: a signed-in person starts enrolling an authenticator. */
export async function startTotpSetup(formData: FormData): Promise<void> {
  let user: Awaited<ReturnType<typeof requireOpsUser>>
  try {
    user = await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError) redirect('/sign-in?next=%2Fsign-in%2Ftwo-factor%2Fsetup')
    throw error
  }
  const next = safeNextPath(field(formData, 'next', 2048)) ?? '/settings/team#security'
  await setPendingCookie(beginEnrolment({ userId: user.id, next }))
  redirect('/sign-in/two-factor/setup')
}

/** The first code from the app confirms the new secret; the backup codes come back once. */
export async function confirmTotpSetup(
  _previous: SetupFormState,
  formData: FormData
): Promise<SetupFormState> {
  const pending = await readPendingCookie('enrol')
  if (!pending) return { status: 'expired' }
  const m = await meta()
  const result = await confirmEnrolment(pending, field(formData, 'code', 64), { meta: m })
  if (!result.ok) return { status: result.reason }
  // The cookie is left as it is: changing it here would re-render the page and drop the codes before
  // they are read. "I have saved these" (finishTotpSetup) moves on.
  return { status: 'done', backupCodes: result.backupCodes }
}

/** "I have saved these": back to where enrolment started, or (invite acceptance) signed in. */
export async function finishTotpSetup(): Promise<void> {
  const pending = await readPendingCookie('enrol')
  if (!pending) redirect('/sign-in?error=expired')
  if (!pending.signInAfter) {
    await clearPendingCookie()
    redirect((pending.next ?? '/settings/team') as Route)
  }
  if (!(await confirmedSince(pending))) redirect('/sign-in/two-factor/setup')
  await setPendingCookie(newPending({ uid: pending.uid, purpose: 'signin', proof: 'enrolment' }))
  await finishWithProof(pending.next ?? '/today')
}
