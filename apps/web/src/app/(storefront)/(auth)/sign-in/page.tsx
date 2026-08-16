import type { Metadata } from 'next'
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
          <p className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-1.5">
            Customer Portal
          </p>
          <h1 className="text-[36px] font-semibold tracking-tight leading-tight mb-7">Sign in</h1>

          <SignInForm />

          <p className="mt-8 text-[13px] text-ih-muted">
            New to Indus Hydraulics?{' '}
            <a href={`/sign-up`} className="text-ih-accent font-medium hover:underline">
              Create a B2B account →
            </a>
          </p>
        </div>
      </section>

      {/* ── Right: Benefits panel ────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col justify-center bg-ih-navy px-16 py-16">
        <div className="max-w-[440px]">
          <p className="font-mono text-[11px] tracking-[0.16em] text-ih-accent uppercase mb-2">
            Why sign in
          </p>
          <h2 className="text-[28px] font-semibold text-white leading-snug tracking-tight mb-6">
            A live workspace for your hydraulics procurement.
          </h2>
          <ul className="flex flex-col gap-[18px] text-sm leading-relaxed">
            {BENEFITS.map((b, i) => (
              <li key={b.title} className="grid grid-cols-[24px_1fr] gap-3">
                <span className="font-mono text-ih-accent">0{i + 1}</span>
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
