import type { Metadata } from 'next'
import Link from 'next/link'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata: Metadata = { title: 'Choose a new password' }

type Props = {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const sp = await searchParams
  const token = sp.token ?? ''

  if (!token) {
    return (
      <main className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-60px)]">
        <section className="flex flex-col justify-center px-8 py-16 lg:px-16">
          <div className="w-full max-w-[420px] mx-auto lg:ml-auto lg:mr-0">
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)] mb-2">
              CUSTOMER PORTAL
            </p>
            <h1 className="text-[36px] font-semibold tracking-tight mb-3">Reset link missing</h1>
            <p className="text-[14px] text-[var(--color-muted)] leading-[1.6] mb-6">
              This page needs a token from your reset email. Open the most recent password-reset email we sent and click the button there, or request a new link.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center h-10 px-4 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90"
            >
              Request a new link →
            </Link>
          </div>
        </section>
        <aside className="hidden lg:block bg-[var(--color-primary)]" />
      </main>
    )
  }

  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-60px)]">
      <section className="flex flex-col justify-center px-8 py-16 lg:px-16">
        <div className="w-full max-w-[420px] mx-auto lg:ml-auto lg:mr-0">
          <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)] mb-2">
            CUSTOMER PORTAL
          </p>
          <h1 className="text-[36px] font-semibold tracking-tight mb-3">Choose a new password</h1>
          <p className="text-[14px] text-[var(--color-muted)] leading-[1.6] mb-6">
            Pick a password at least 10 characters long. The link expires 60 minutes after you requested it and can only be used once.
          </p>
          <ResetPasswordForm token={token} />
        </div>
      </section>
      <aside className="hidden lg:block bg-[var(--color-primary)]" />
    </main>
  )
}
