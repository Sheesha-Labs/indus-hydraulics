'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface SidebarTranslations {
  procurement: string
  dashboard: string
  myQuotes: string
  savedLists: string
  approvedOrders: string
  datasheetVault: string
  account: string
  profile: string
  companyAndTeam: string
  addresses: string
  notifications: string
  signOut: string
}

interface Props {
  locale: string
  userName: string
  userEmail: string
  t: SidebarTranslations
}

export default function AccountSidebar({ locale, userName, userEmail, t }: Props) {
  const pathname = usePathname()

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function isActive(path: string) {
    return pathname === path || pathname.startsWith(path + '/')
  }

  const navLink = (href: string, label: string, count?: number) => {
    const active = isActive(href)
    return (
      <Link
        href={href}
        className={`flex justify-between items-center px-3 py-2 text-[13px] transition-colors ${
          active
            ? 'bg-[var(--color-primary)] text-white'
            : 'text-[var(--color-body)] hover:bg-[var(--color-elevated)]'
        }`}
      >
        {label}
        {count !== undefined && (
          <span
            className={`font-mono text-[11px] ${
              active ? 'text-[oklch(0.7_0_0)]' : 'text-[var(--color-caption)]'
            }`}
          >
            {count}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className="sticky top-[130px]">
      {/* User card */}
      <div className="flex items-center gap-2.5 p-3.5 border border-[var(--color-border)] bg-[var(--color-elevated)] mb-4">
        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-white grid place-items-center font-semibold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[13px] truncate">{userName}</div>
          <div className="font-mono text-[10px] text-[var(--color-muted)] truncate">{userEmail}</div>
        </div>
      </div>

      <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-caption)] px-3 pb-1.5 uppercase">
        {t.procurement}
      </p>
      {navLink(`/${locale}/account`, t.dashboard)}
      {navLink(`/${locale}/account/quotes`, t.myQuotes, 7)}
      {navLink(`/${locale}/account/lists`, t.savedLists, 4)}
      {navLink(`/${locale}/account/orders`, t.approvedOrders, 23)}
      {navLink(`/${locale}/account/datasheets`, t.datasheetVault)}

      <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-caption)] px-3 pt-3.5 pb-1.5 uppercase">
        {t.account}
      </p>
      {navLink(`/${locale}/account/profile`, t.profile)}
      {navLink(`/${locale}/account/team`, t.companyAndTeam, 5)}
      {navLink(`/${locale}/account/addresses`, t.addresses)}
      {navLink(`/${locale}/account/notifications`, t.notifications)}

      <button
        onClick={() => signOut({ callbackUrl: `/${locale}/sign-in` })}
        className="w-full flex items-center px-3 py-2 text-[13px] text-[var(--color-muted)] hover:bg-[var(--color-elevated)] transition-colors text-left mt-1"
      >
        {t.signOut}
      </button>
    </aside>
  )
}
