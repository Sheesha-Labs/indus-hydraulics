'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image as ImageIcon,
  ClipboardList,
  Users,
  FileText,
  Search,
  UserCog,
  Settings,
  ExternalLink,
  LogOut,
  Award,
  LayoutTemplate,
  Menu as MenuIcon,
  type LucideIcon,
} from 'lucide-react'

interface Props {
  userName: string
  userRole: string
}

type NavItem = {
  id: string
  label: string
  path: string
  Icon: LucideIcon
}

const NAV_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Overview',
    items: [{ id: 'dashboard', label: 'Dashboard', path: '', Icon: LayoutDashboard }],
  },
  {
    section: 'Catalogue',
    items: [
      { id: 'products', label: 'Products', path: 'products', Icon: Package },
      { id: 'categories', label: 'Categories', path: 'categories', Icon: FolderTree },
      { id: 'brands', label: 'Brands', path: 'brands', Icon: Award },
      { id: 'spec-templates', label: 'Spec templates', path: 'spec-templates', Icon: LayoutTemplate },
      { id: 'industries', label: 'Industries', path: 'industries', Icon: ImageIcon },
      { id: 'media', label: 'Media library', path: 'media', Icon: ImageIcon },
    ],
  },
  {
    section: 'Operations',
    items: [
      { id: 'rfqs', label: 'RFQ Queue', path: 'rfqs', Icon: ClipboardList },
      { id: 'customers', label: 'Accounts', path: 'customers', Icon: Users },
    ],
  },
  {
    section: 'Content',
    items: [
      { id: 'cms', label: 'Pages & Blog', path: 'cms', Icon: FileText },
      { id: 'navigation', label: 'Navigation', path: 'navigation', Icon: MenuIcon },
      { id: 'seo', label: 'SEO & Search', path: 'seo', Icon: Search },
    ],
  },
  {
    section: 'System',
    items: [
      { id: 'users', label: 'Users & Roles', path: 'users', Icon: UserCog },
      { id: 'settings', label: 'Settings', path: 'settings', Icon: Settings },
    ],
  },
]

export default function AdminSidebar({ userName, userRole }: Props) {
  const pathname = usePathname()

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function isActive(path: string) {
    if (path === '') return pathname === '/'
    return pathname.startsWith(`/${path}`)
  }

  return (
    <aside
      className="flex flex-col w-[248px] bg-[#111418] text-[#d4d0c6] border-r border-[#1f2329] sticky top-0 h-screen overflow-y-auto flex-shrink-0"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#1f2329 transparent' }}
      aria-label="Primary admin navigation"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#1f2329]">
        <div className="relative w-8 h-8 bg-[#f5f3ee] grid place-items-center font-mono font-semibold text-[12px] text-[#111] rounded-sm flex-shrink-0">
          IH
          <span className="absolute -bottom-0.5 -right-0.5 w-[7px] h-[7px] bg-[oklch(0.62_0.16_45)]" />
        </div>
        <div>
          <div className="font-semibold text-[14px] text-[#f5f3ee] leading-tight">Indus Hydraulics</div>
          <div className="font-mono text-[9px] tracking-[0.1em] text-[#6b7079] uppercase mt-0.5">
            ADMIN · v1.0.0
          </div>
        </div>
      </div>

      {/* Store indicator */}
      <div className="mx-3 my-3 px-3 py-2.5 bg-[#15181d] border border-[#1f2329] rounded-sm flex items-center gap-2.5 text-[12px]">
        <span className="w-2 h-2 rounded-full bg-[#16a34a] flex-shrink-0" aria-hidden="true" />
        <span className="text-[#f5f3ee] font-medium flex-1 truncate">indushydraulics.com</span>
        <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#2a2e35] rounded-sm text-[#b6bac1] tracking-[0.06em]">
          LIVE
        </span>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto">
        {NAV_SECTIONS.map(({ section, items }) => (
          <div key={section} className="px-3 py-2">
            <p className="font-mono text-[10px] tracking-[0.12em] text-[#5b6068] uppercase px-2.5 py-1">
              {section}
            </p>
            {items.map(({ id, label, path, Icon }) => {
              const active = isActive(path)
              return (
                <Link
                  key={id}
                  href={path ? `/${path}` : '/'}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-[13px] rounded-sm border-l-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.16_45)] ${
                    active
                      ? 'bg-[#15181d] text-[#f5f3ee] border-l-[oklch(0.62_0.16_45)]'
                      : 'text-[#b6bac1] border-l-transparent hover:bg-[#15181d] hover:text-[#f0ece3]'
                  }`}
                >
                  <Icon
                    size={15}
                    strokeWidth={1.6}
                    className={active ? 'opacity-100' : 'opacity-70'}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1f2329] p-3">
        <a
          href={process.env.NEXT_PUBLIC_STOREFRONT_URL ?? '/'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View storefront in a new tab"
          className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-[#b6bac1] hover:bg-[#15181d] hover:text-[#f0ece3] rounded-sm transition-colors mb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.16_45)]"
        >
          <ExternalLink size={15} strokeWidth={1.6} aria-hidden="true" />
          <span>View storefront</span>
        </a>

        {/* User */}
        <div className="grid grid-cols-[32px_1fr_auto] gap-2.5 items-center px-2 py-2 rounded-sm hover:bg-[#15181d] group">
          <div className="w-8 h-8 rounded-full bg-[oklch(0.62_0.16_45)] grid place-items-center text-white font-semibold text-[13px]">
            {initials}
          </div>
          <div>
            <div className="text-[12px] text-[#f0ece3] font-medium leading-tight truncate">{userName}</div>
            <div className="font-mono text-[10px] text-[#6b7079] uppercase truncate">{userRole}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: `/sign-in` })}
            aria-label="Sign out"
            className="text-[#5b6068] hover:text-[#f0ece3] text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.16_45)] rounded-sm p-1"
            title="Sign out"
          >
            <LogOut size={14} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
