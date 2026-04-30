import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SignInForm from './SignInForm'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth' })
  return { title: t('signIn') }
}

export default async function SignInPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth' })

  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-60px)]">
      {/* ── Left: Form ──────────────────────────────────────────────── */}
      <section className="flex flex-col justify-center px-8 py-16 lg:px-16">
        <div className="w-full max-w-[420px] mx-auto lg:ml-auto lg:mr-0">
          <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase mb-1.5">
            {t('customerPortal')}
          </p>
          <h1 className="text-[36px] font-semibold tracking-tight leading-tight mb-7">
            {t('signIn')}
          </h1>

          <SignInForm locale={locale} />

          <div className="flex items-center gap-3.5 my-6">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-caption)]">OR</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <a
            href="/api/auth/signin/microsoft-entra-id"
            className="flex items-center justify-center gap-2.5 w-full h-11 border border-[var(--color-border)] bg-[var(--color-elevated)] text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-deep)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 21 21" fill="none" aria-hidden="true">
              <rect width="10" height="10" fill="#F25022" />
              <rect x="11" width="10" height="10" fill="#7FBA00" />
              <rect y="11" width="10" height="10" fill="#00A4EF" />
              <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
            </svg>
            {t('signInWithMicrosoft')}
          </a>

          <p className="mt-8 text-[13px] text-[var(--color-muted)]">
            {t('noAccount')}{' '}
            <a href={`/${locale}/sign-up`} className="text-[var(--color-accent)] font-medium hover:underline">
              {t('createB2BAccount')} →
            </a>
          </p>
        </div>
      </section>

      {/* ── Right: Benefits panel ────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col justify-center bg-[var(--color-primary)] px-16 py-16">
        <div className="max-w-[440px]">
          <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-accent)] uppercase mb-2">
            {t('whySignIn')}
          </p>
          <h2 className="text-[28px] font-semibold text-white leading-snug tracking-tight mb-6">
            {t('benefitsHeadline')}
          </h2>
          <ul className="flex flex-col gap-[18px] text-sm leading-relaxed">
            {([1, 2, 3, 4] as const).map((n) => (
              <li key={n} className="grid grid-cols-[24px_1fr] gap-3">
                <span className="font-mono text-[var(--color-accent)]">0{n}</span>
                <div>
                  <b className="text-white block mb-0.5">{t(`benefit${n}Title`)}</b>
                  <span className="text-[oklch(0.7_0_0)]">{t(`benefit${n}Body`)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  )
}
