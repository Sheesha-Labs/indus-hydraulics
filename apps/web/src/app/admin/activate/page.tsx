import { activationCopy, linkStateMessage } from '@indus/domain'
import type { Metadata } from 'next'
import Link from 'next/link'
import { findByToken, loadActivationLink } from '../../../lib/staff-invitations'
import ActivateForm from './ActivateForm'

export const metadata: Metadata = { title: 'Set your password — Admin' }

// Always fresh: a link's usability changes with the clock and with whether
// someone else just consumed it. A cached render would show a live form for a
// dead link.
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ token?: string }> }

/**
 * The set-your-password screen for both invitations and password resets.
 *
 * Public by necessity — the visitor has no session yet, which is exactly what
 * they are here to fix. `/admin/activate` is listed in the proxy's
 * ADMIN_PUBLIC_PATHS for that reason.
 *
 * The purpose comes from the invitation row, never from the query string, so
 * nobody can edit a URL to change what the page claims happened to them.
 */
export default async function ActivatePage({ searchParams }: Props) {
  const token = (await searchParams).token ?? ''
  const { invitation, state } = await loadActivationLink(token)

  return (
    <div className="grid min-h-screen place-items-center bg-[#0e1013] p-6">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-sm bg-[#f5f3ee] font-mono text-[14px] font-semibold text-[#111]">
            IH
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-ih-accent" />
          </div>
          <div>
            <div className="font-semibold leading-tight text-white">Indus Hydraulics</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b7079]">
              Admin Portal
            </div>
          </div>
        </div>

        {state.usable && invitation ? (
          <ActivatePanel invitation={invitation} token={token} />
        ) : (
          <DeadLinkPanel
            message={linkStateMessage(
              state.usable ? 'unknown' : state.reason,
              invitation?.purpose ?? 'invite',
            )}
          />
        )}

        <p className="mt-6 text-center font-mono text-[11px] text-[#3a3f47]">
          © {new Date().getFullYear()} Indus Hydraulics Pvt. Ltd.
        </p>
      </div>
    </div>
  )
}

function ActivatePanel({
  invitation,
  token,
}: {
  invitation: NonNullable<Awaited<ReturnType<typeof findByToken>>>
  token: string
}) {
  const copy = activationCopy(invitation.purpose, invitation.name)
  return (
    <div className="border border-[#2a2e35] bg-[#15181d] p-8">
      <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#6b7079]">
        {copy.eyebrow}
      </p>
      <h1 className="mb-1 text-[22px] font-semibold text-white">{copy.heading}</h1>
      <p className="mb-2 text-[13px] text-[#6b7079]">{copy.intro}</p>
      <p className="mb-7 font-mono text-[11px] text-[#6b7079]">{invitation.email}</p>

      <ActivateForm
        token={token}
        purpose={invitation.purpose}
        submitLabel={copy.submitLabel}
      />
    </div>
  )
}

function DeadLinkPanel({ message }: { message: string }) {
  return (
    <div className="border border-[#2a2e35] bg-[#15181d] p-8">
      <h1 className="mb-2 text-[22px] font-semibold text-white">Link not usable</h1>
      <p className="mb-7 text-[13px] leading-relaxed text-[#9aa0a8]">{message}</p>
      <Link
        href="/admin/forgot-password"
        className="inline-flex h-11 w-full items-center justify-center bg-ih-accent text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Request a new link
      </Link>
      <Link
        href="/admin/sign-in"
        className="mt-3 block text-center text-[13px] text-[#6b7079] transition-colors hover:text-[#9aa0a8]"
      >
        Back to sign in
      </Link>
    </div>
  )
}
