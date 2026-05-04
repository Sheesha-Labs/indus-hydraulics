import type { Metadata } from 'next'
import Link from 'next/link'
import SignInForm from './SignInForm'

export const metadata: Metadata = { title: 'Sign in' }

const BENEFITS = [
  {
    title: 'Track every RFQ',
    body: 'See engineer responses, lead-time updates, approval status — all in one view.',
  },
  {
    title: 'Re-order by SKU or list',
    body: 'Build saved lists per machine/line. One click to RFQ it again.',
  },
  {
    title: 'Contract pricing visible',
    body: 'Your tier rates, NDAs, payment terms — all live, no spreadsheets.',
  },
  {
    title: 'Datasheet vault',
    body: 'All PDFs, STEP files, service manuals — gated by your organisation only.',
  },
]

export default function SignInPage() {
  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-60px)]">
      {/* ── Left: Form ──────────────────────────────────────────────── */}
      <section className="flex flex-col justify-center px-8 py-16 lg:px-16">
        <div className="w-full max-w-[420px] mx-auto lg:ml-auto lg:mr-0">
          <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase mb-1.5">
            Customer Portal
          </p>
          <h1 className="text-[36px] font-semibold tracking-tight leading-tight mb-7">Sign in</h1>

          <SignInForm />

          <div className="flex items-center gap-3.5 my-6">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-caption)]">OR</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <Link
            href="/api/auth/signin/microsoft-entra-id"
            className="flex items-center justify-center gap-2.5 w-full h-11 border border-[var(--color-border)] bg-[var(--color-elevated)] text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-deep)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 21 21" fill="none" aria-hidden="true">
              <rect width="10" height="10" fill="#F25022" />
              <rect x="11" width="10" height="10" fill="#7FBA00" />
              <rect y="11" width="10" height="10" fill="#00A4EF" />
              <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
            </svg>
            Sign in with Microsoft 365
          </Link>

          <p className="mt-8 text-[13px] text-[var(--color-muted)]">
            New to Indus Hydraulics?{' '}
            <a href={`/sign-up`} className="text-[var(--color-accent)] font-medium hover:underline">
              Create a B2B account →
            </a>
          </p>
        </div>
      </section>

      {/* ── Right: Benefits panel ────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col justify-center bg-[var(--color-primary)] px-16 py-16">
        <div className="max-w-[440px]">
          <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-accent)] uppercase mb-2">
            Why sign in
          </p>
          <h2 className="text-[28px] font-semibold text-white leading-snug tracking-tight mb-6">
            A live workspace for your hydraulics procurement.
          </h2>
          <ul className="flex flex-col gap-[18px] text-sm leading-relaxed">
            {BENEFITS.map((b, i) => (
              <li key={b.title} className="grid grid-cols-[24px_1fr] gap-3">
                <span className="font-mono text-[var(--color-accent)]">0{i + 1}</span>
                <div>
                  <b className="text-white block mb-0.5">{b.title}</b>
                  <span className="text-[oklch(0.7_0_0)]">{b.body}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  )
}
