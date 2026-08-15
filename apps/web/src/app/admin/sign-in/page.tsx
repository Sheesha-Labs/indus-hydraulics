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
    <div className="min-h-screen bg-[#0e1013] flex items-center justify-center p-6">
      <div className="w-full max-w-[380px]">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-10 h-10 bg-[#f5f3ee] grid place-items-center font-mono font-semibold text-[14px] text-[#111] rounded-sm">
            IH
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[oklch(0.62_0.16_45)]" />
          </div>
          <div>
            <div className="font-semibold text-white leading-tight">Indus Hydraulics</div>
            <div className="font-mono text-[10px] tracking-[0.1em] text-[#6b7079] uppercase">
              Admin Portal
            </div>
          </div>
        </div>

        <div className="bg-[#15181d] border border-[#2a2e35] p-8">
          <h1 className="text-[22px] font-semibold text-white mb-1">Staff sign in</h1>
          <p className="text-[13px] text-[#6b7079] mb-7">
            This portal is for Indus Hydraulics staff only.
          </p>

          <AdminSignInForm next={next} />

          <a
            href="/admin/forgot-password"
            className="mt-5 block text-center text-[13px] text-[#6b7079] transition-colors hover:text-[#9aa0a8]"
          >
            Forgot your password?
          </a>
        </div>

        <p className="text-center font-mono text-[11px] text-[#3a3f47] mt-6">
          © {new Date().getFullYear()} Indus Hydraulics Pvt. Ltd.
        </p>
      </div>
    </div>
  )
}
