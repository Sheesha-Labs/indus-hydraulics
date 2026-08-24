import type { Metadata } from 'next'
import AdminSignInForm from './AdminSignInForm'
import { safeNextPath } from '../../../lib/safe-next-path'

export const metadata: Metadata = { title: 'Sign in — Admin' }

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<{ next?: string }>
}

export default async function AdminSignInPage({ params, searchParams }: Props) {
  await params
  // The proxy attaches ?next= when it bounces a deep link. Neither sign-in
  // page has ever read it, so those links were silently dropped.
  const next = safeNextPath((await searchParams).next) ?? undefined

  return (
    <div className="min-h-screen bg-[var(--color-ih-navy)] flex items-center justify-center p-6">
      <div className="w-full max-w-[380px]">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-10 h-10 bg-[#ffffff] grid place-items-center font-mono font-medium text-[14px] text-[#111] rounded-sm">
            IH
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-ih-accent" />
          </div>
          <div>
            <div className="font-medium text-white leading-tight">Indus Hydraulics</div>
            <div className="font-mono text-[10.5px] tracking-[0.1em] text-[oklch(0.68_0.03_250)] uppercase">
              Admin Portal
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-ih-navy-2)] border border-[var(--color-ih-navy-2)] p-8">
          <h1 className="text-[22px] font-medium text-white mb-1">Staff sign in</h1>
          <p className="text-[13px] text-[oklch(0.68_0.03_250)] mb-7">
            This portal is for Indus Hydraulics staff only.
          </p>

          <AdminSignInForm next={next} />

          <a
            href="/admin/forgot-password"
            className="mt-5 block text-center text-[13px] text-[oklch(0.68_0.03_250)] transition-colors hover:text-[oklch(0.75_0.02_250)]"
          >
            Forgot your password?
          </a>
        </div>

        <p className="text-center font-mono text-[11px] text-[oklch(0.62_0.03_250)] mt-6">
          © {new Date().getFullYear()} Indus Hydraulics
        </p>
      </div>
    </div>
  )
}
