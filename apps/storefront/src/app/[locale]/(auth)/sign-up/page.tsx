import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SignUpForm from './SignUpForm'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth' })
  return { title: t('createAccount') }
}

export default async function SignUpPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth' })

  return (
    <main className="py-12 px-6">
      <div className="max-w-[880px] mx-auto">
        <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase mb-1.5">
          {t('b2bSetup')}
        </p>
        <h1 className="text-[36px] font-semibold tracking-tight mb-1.5">
          {t('createAccount')}
        </h1>
        <p className="text-[var(--color-muted)] mb-8 max-w-xl">
          {t('createAccountSubtitle')}
        </p>

        <SignUpForm locale={locale} />

        <p className="mt-4 text-[13px] text-[var(--color-muted)] text-center">
          {t('alreadyHaveAccount')}{' '}
          <a href={`/${locale}/sign-in`} className="text-[var(--color-accent)] font-medium hover:underline">
            {t('signIn')} →
          </a>
        </p>
      </div>
    </main>
  )
}
