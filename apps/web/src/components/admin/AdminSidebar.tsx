'use client'

import { usePathname } from 'next/navigation'
import { stripAdminPrefix } from '../../lib/admin-paths'
import Link from 'next/link'
import LogoMark from '../LogoMark'
import { adminSignOutAction } from '../../app/admin/sign-in/actions'
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
  Globe,
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
      { id: 'scraper', label: 'Competitor scraper', path: 'scraper', Icon: Globe },
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
  // Compare against the path relative to /admin: after the move every
  // pathname starts with '/admin', so a raw startsWith test would mark
  // nothing active.
  const pathname = stripAdminPrefix(usePathname() ?? '/')

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
      className="flex flex-col w-[236px] bg-ih-navy text-[oklch(0.84_0.02_250)] border-r border-ih-navy-2 sticky top-0 h-screen overflow-y-auto flex-shrink-0"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'oklch(0.355 0.062 252) transparent' }}
      aria-label="Primary admin navigation"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-ih-navy-2">
        <LogoMark size={30} onNavy />
        <div>
          <div className="font-serif text-[18px] leading-none text-white">Indus Hydraulics</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[oklch(0.7_0.03_250)]">
            ADMIN · v1.0.0
          </div>
        </div>
      </div>

      {/* Store indicator */}
      <div className="mx-3 my-3 px-3 py-2.5 bg-ih-navy-2/50 border border-ih-navy-2 rounded-md flex items-center gap-2.5 text-[12px]">
        <span className="w-2 h-2 rounded-full bg-ih-success flex-shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate font-medium text-white">indushydraulics.com</span>
        <span className="rounded-[3px] bg-ih-navy-2 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.06em] text-[oklch(0.86_0.02_250)]">
          LIVE
        </span>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto">
        {NAV_SECTIONS.map(({ section, items }) => (
          <div key={section} className="px-3 py-2">
            <p className="px-2.5 pb-1.5 pt-4 font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-[oklch(0.68_0.035_250)]">
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
                  className={`flex items-center gap-2.5 rounded-md px-[9px] py-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft ${
                    active
                      ? 'bg-ih-accent text-white'
                      : 'text-[oklch(0.84_0.02_250)] hover:bg-white/[0.07] hover:text-white'
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
      <div className="border-t border-ih-navy-2 p-3">
        <a
          href={process.env.NEXT_PUBLIC_STOREFRONT_URL ?? '/'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View storefront in a new tab"
          className="mb-1 flex items-center gap-2.5 rounded-md px-[9px] py-2 text-[13px] text-[oklch(0.84_0.02_250)] transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft"
        >
          <ExternalLink size={15} strokeWidth={1.6} aria-hidden="true" />
          <span>View storefront</span>
        </a>

        {/* User */}
        <div className="grid grid-cols-[32px_1fr_auto] group items-center gap-2.5 rounded-md px-2 py-2 hover:bg-white/[0.07]">
          <div className="w-8 h-8 rounded-full bg-ih-accent grid place-items-center text-white font-semibold text-[13px]">
            {initials}
          </div>
          <div>
            <div className="truncate text-[12px] font-medium leading-tight text-white">{userName}</div>
            <div className="truncate font-mono text-[10px] uppercase text-[oklch(0.7_0.03_250)]">{userRole}</div>
          </div>
          <button
            onClick={() => void adminSignOutAction()}
            aria-label="Sign out"
            className="rounded-sm p-1 text-[11px] text-[oklch(0.7_0.03_250)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft"
            title="Sign out"
          >
            <LogOut size={14} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
