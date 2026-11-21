import type { Metadata } from 'next'
import Link from 'next/link'
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

  // eslint-disable-next-line react/purity -- Server Component: reading the clock at render is intended here.
  const year = new Date().getFullYear()
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-ih-navy)] p-6">
      <div className="w-full max-w-[380px]">
        {/* Brand */}
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
          <h1 className="mb-1 text-[22px] font-medium text-white">Staff sign in</h1>
          <p className="mb-7 text-[13px] text-[oklch(0.68_0.03_250)]">
            This portal is for Indus Hydraulics staff only.
          </p>

          <AdminSignInForm next={next} />

          <Link
            href="/admin/forgot-password"
            className="mt-5 block text-center text-[13px] text-[oklch(0.68_0.03_250)] transition-colors hover:text-[oklch(0.75_0.02_250)]"
          >
            Forgot your password?
          </Link>
        </div>

        <p className="mt-6 text-center text-[11px] text-[oklch(0.62_0.03_250)] tabular-nums">
          © {year} Indus Hydraulics
        </p>
      </div>
    </div>
  )
}
