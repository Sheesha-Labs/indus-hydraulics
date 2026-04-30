import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import AccountSidebar from './AccountSidebar'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AccountLayout({ children, params }: Props) {
  const { locale } = await params
  const session = await auth()

  if (!session) {
    redirect(`/${locale}/sign-in`)
  }

  const t = await getTranslations({ locale, namespace: 'account' })

  return (
    <div className="max-w-[1360px] mx-auto px-8 py-8 grid grid-cols-[240px_1fr] gap-8 items-start">
      <AccountSidebar
        locale={locale}
        userName={session.user?.name ?? ''}
        userEmail={session.user?.email ?? ''}
        t={{
          procurement: t('nav.procurement'),
          dashboard: t('nav.dashboard'),
          myQuotes: t('nav.myQuotes'),
          savedLists: t('nav.savedLists'),
          approvedOrders: t('nav.approvedOrders'),
          datasheetVault: t('nav.datasheetVault'),
          account: t('nav.account'),
          profile: t('nav.profile'),
          companyAndTeam: t('nav.companyAndTeam'),
          addresses: t('nav.addresses'),
          notifications: t('nav.notifications'),
          signOut: t('nav.signOut'),
        }}
      />
      <main>{children}</main>
    </div>
  )
}
