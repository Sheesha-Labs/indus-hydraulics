import type { Metadata } from 'next'
import ForgotPasswordForm from './ForgotPasswordForm'

export const metadata: Metadata = { title: 'Reset your password — Admin' }

/**
 * Staff password reset request.
 *
 * Public — the whole point is that the visitor cannot sign in. Listed in the
 * proxy's ADMIN_PUBLIC_PATHS alongside /admin/activate and /admin/sign-in.
 */
export default function AdminForgotPasswordPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--color-ih-navy)] p-6">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-sm bg-[#ffffff] text-[14px] font-medium text-[#111] tabular-nums">
            IH
            <span className="bg-ih-accent absolute -right-0.5 -bottom-0.5 h-2 w-2" />
          </div>
          <div>
            <div className="leading-tight font-medium text-white">Indus Hydraulics</div>
            <div className="text-[10.5px] tracking-[0.1em] text-[oklch(0.68_0.03_250)] uppercase tabular-nums">
              Admin Portal
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-ih-navy-2)] bg-[var(--color-ih-navy-2)] p-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
