import type { Metadata } from 'next'
import ForgotPasswordForm from './ForgotPasswordForm'

export const metadata: Metadata = { title: 'Reset your password' }

export default function ForgotPasswordPage() {
  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-60px)]">
      <section className="flex flex-col justify-center px-8 py-16 lg:px-16">
        <div className="w-full max-w-[420px] mx-auto lg:ml-auto lg:mr-0">
          <ForgotPasswordForm />
        </div>
      </section>

      <aside className="hidden lg:flex flex-col justify-center bg-[var(--color-primary)] px-16 py-16">
        <SecurityPanel />
      </aside>
    </main>
  )
}

function SecurityPanel() {
  return (
    <div className="max-w-[440px]">
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-accent)] uppercase mb-2">
        SECURITY MATTERS
      </p>
      <h2 className="text-[28px] font-semibold text-white leading-snug tracking-tight mb-6">
        Your contract pricing, datasheet vault and order history stay protected.
      </h2>
      <ul className="flex flex-col gap-4 text-[13px] leading-relaxed">
        {[
          'Reset links are single-use and expire after 60 minutes',
          'Resets are logged and your account manager is notified',
          'SSO accounts (Microsoft 365) reset through your IT team',
          'For account lockouts, call +91 22 6614 0200 Mon–Sat 09:00–19:00 IST',
        ].map((item) => (
          <li key={item} className="grid grid-cols-[24px_1fr] gap-3">
            <span className="font-mono text-[var(--color-accent)]">↪</span>
            <span className="text-[oklch(0.78_0_0)]">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-12 pt-6 border-t border-[oklch(0.3_0_0)]">
        <p className="font-mono text-[10px] tracking-[0.14em] text-[oklch(0.6_0_0)] uppercase mb-2.5">
          Trouble signing in?
        </p>
        <p className="text-[oklch(0.78_0_0)] text-[13px] leading-relaxed">
          Reach{' '}
          <a href="mailto:portal-support@indushydraulics.com" className="text-white hover:underline">
            portal-support@indushydraulics.com
          </a>{' '}
          with your account ID and we&apos;ll get you back in within one business hour.
        </p>
      </div>
    </div>
  )
}
