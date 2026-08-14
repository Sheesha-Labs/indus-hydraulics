'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface Props {
  userName: string
  userEmail: string
  /** Live counts shown next to nav items. Pass 0 to hide the badge. */
  counts?: {
    quotes?: number
    lists?: number
    notifications?: number
  }
}

export default function AccountSidebar({ userName, userEmail, counts }: Props) {
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
    const showCount = typeof count === 'number' && count > 0
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
        {showCount && (
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

      {/*
        Sidebar previously also linked to /account/orders, /account/datasheets,
        /account/profile, /account/team — none of those routes exist yet, so
        their entries were removed to stop the 404s. Re-add when the
        corresponding feature lands. Hardcoded badge counts (7 / 4 / 23 / 5)
        were also removed; counts here are now driven by `counts` prop, which
        the layout fills from a single Prisma read.
      */}
      <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-caption)] px-3 pb-1.5 uppercase">
        Procurement
      </p>
      {navLink(`/account`, 'Dashboard')}
      {navLink(`/account/quotes`, 'My quotes', counts?.quotes)}
      {navLink(`/account/lists`, 'Saved lists', counts?.lists)}

      <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-caption)] px-3 pt-3.5 pb-1.5 uppercase">
        Account
      </p>
      {navLink(`/account/profile`, 'Profile')}
      {navLink(`/account/addresses`, 'Addresses')}
      {navLink(`/account/notifications`, 'Notifications', counts?.notifications)}

      <button
        onClick={() => signOut({ callbackUrl: `/sign-in` })}
        className="w-full flex items-center px-3 py-2 text-[13px] text-[var(--color-muted)] hover:bg-[var(--color-elevated)] transition-colors text-left mt-1"
      >
        Sign out
      </button>
    </aside>
  )
}
