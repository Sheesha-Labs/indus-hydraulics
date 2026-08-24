'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import LogoMark from '../LogoMark'
import { ADMIN_PREFIX, stripAdminPrefix } from '../../lib/admin-paths'
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
  Newspaper,
  type LucideIcon,
} from 'lucide-react'

interface Props {
  userName: string
  userRole: string
}

/**
 * The role, said the way a person would. The rail used to print the raw enum
 * in mono uppercase — `SUPER_ADMIN` — which is a database value, not a job.
 */
const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super admin',
  manager: 'Manager',
  sales_rep: 'Sales',
  engineer: 'Engineer',
  warehouse: 'Warehouse',
  finance: 'Finance',
  cms_editor: 'Content editor',
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
      { id: 'blog', label: 'Blog Editor', path: 'blog', Icon: Newspaper },
      { id: 'pages', label: 'Pages & Blocks', path: 'pages', Icon: FileText },
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
    /*
      A LIGHT rail, not the navy panel this used to be.

      The navy sidebar put the heaviest block on screen next to the lightest,
      so the eye landed on the furniture rather than the work. On a surface
      ground the only saturated thing left in the chrome is the ACTIVE item,
      which is exactly what should be drawing the eye. Navy did not leave the
      product — it moved from the whole panel onto the one pill that means
      "you are here".

      This is also what makes the ink ramp usable in here: on navy every label
      needed its own lifted oklch() literal (six of them lived in this file),
      because --color-ih-ink-2 is unreadable on a dark ground. On surface the
      ordinary tokens apply and the literals are gone.
    */
    <aside
      /*
        `h-screen` + `sticky top-0`, and the NAV scrolls inside it — not the
        rail as a whole. Sixteen links plus the brand block are taller than a
        900px viewport, so a rail that simply grows pushes its own footer below
        the fold, and the content column's `md:overflow-hidden` means there is
        no page scroll to reach it with. Sign out became unreachable on a
        laptop. Pinning the rail and scrolling the middle keeps the brand and
        the footer fixed, which is also where a reader expects them.
      */
      className="hidden w-[240px] flex-col gap-1 border-r border-ih-border bg-ih-surface px-3.5 py-5 md:sticky md:top-0 md:flex md:h-screen"
      aria-label="Primary admin navigation"
    >
      {/* Brand. No bottom border — the nav's own group labels do the dividing. */}
      <div className="px-2.5 pb-5">
        <Link href={ADMIN_PREFIX} className="flex items-center gap-2.5">
          <LogoMark size={30} />
          <span className="min-w-0">
            <span className="block truncate font-serif text-[18px] leading-none text-ih-ink">
              Indus Hydraulics
            </span>
            <span className="mt-1 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-ih-muted-2">
              Admin · v1.0.0
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {NAV_SECTIONS.map(({ section, items }) => (
          <div key={section}>
            <p className="px-2.5 pb-1.5 pt-3.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-ih-muted-2">
              {section}
            </p>
            {items.map(({ id, label, path, Icon }) => {
              const active = isActive(path)
              return (
                <Link
                  key={id}
                  href={path ? `${ADMIN_PREFIX}/${path}` : ADMIN_PREFIX}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2.5 rounded px-2.5 py-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft ${
                    active
                      ? 'bg-ih-navy font-medium text-ih-bg'
                      : 'text-ih-ink-2 hover:bg-ih-surface-2'
                  }`}
                >
                  <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* The only divider left in the rail. */}
      <div className="mt-auto flex flex-col gap-1 border-t border-ih-border pt-4">
        <a
          href={process.env.NEXT_PUBLIC_STOREFRONT_URL ?? '/'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View storefront in a new tab"
          className="flex items-center gap-2.5 rounded px-2.5 py-2 text-[13px] text-ih-ink-2 transition-colors hover:bg-ih-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft"
        >
          <ExternalLink size={15} strokeWidth={1.6} aria-hidden="true" />
          <span>View storefront</span>
        </a>

        <div className="grid grid-cols-[32px_1fr_auto] items-center gap-2.5 rounded px-2.5 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ih-accent-soft font-mono text-[11.5px] font-medium text-ih-accent">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] font-medium leading-tight text-ih-ink">
              {userName}
            </span>
            <span className="block truncate text-[11px] text-ih-muted">
              {ROLE_LABELS[userRole] ?? userRole}
            </span>
          </span>
          <button
            onClick={() => void adminSignOutAction()}
            aria-label="Sign out"
            title="Sign out"
            className="grid h-7 w-7 place-items-center rounded text-ih-muted transition-colors hover:bg-ih-surface-2 hover:text-ih-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft"
          >
            <LogOut size={14} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
