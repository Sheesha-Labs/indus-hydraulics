'use client'

import { useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import BrandLockup from '../BrandLockup'
import type { LogoStyle } from '../../lib/brand-identity'
import { ADMIN_PREFIX, stripAdminPrefix } from '../../lib/admin-paths'
import { adminSignOutAction } from '../../app/admin/sign-in/actions'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image as ImageIcon,
  ClipboardList,
  Factory,
  Inbox,
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
  Mail,
  type LucideIcon,
  Wrench,
  ChevronRight,
} from 'lucide-react'

interface Props {
  userName: string
  userRole: string
  /** The storefront's own logo (Settings → brand), so admin and site match. */
  logoUrl: string | null
  logoStyle: LogoStyle
  brandName: string
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

const OVERVIEW: NavItem[] = [{ id: 'dashboard', label: 'Dashboard', path: '', Icon: LayoutDashboard }]

/**
 * The folding groups. Twenty links in five flat groups were taller than a
 * laptop viewport, so the rail scrolled. Folded, the rail shows the group
 * names plus the one group you are working in, and fits without a scrollbar.
 */
const GROUPS: { section: string; items: NavItem[] }[] = [
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
      { id: 'enquiries', label: 'Enquiries', path: 'enquiries', Icon: Inbox },
      { id: 'rfqs', label: 'RFQ Queue', path: 'rfqs', Icon: ClipboardList },
      { id: 'suppliers', label: 'Suppliers', path: 'suppliers', Icon: Factory },
      { id: 'customers', label: 'Accounts', path: 'customers', Icon: Users },
    ],
  },
  {
    section: 'Content',
    items: [
      { id: 'blog', label: 'Blog Editor', path: 'blog', Icon: Newspaper },
      { id: 'services', label: 'Service cases', path: 'services', Icon: Wrench },
      { id: 'pages', label: 'Pages & Blocks', path: 'pages', Icon: FileText },
      { id: 'newsletter', label: 'Newsletter', path: 'newsletter', Icon: Mail },
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

export default function AdminSidebar({ userName, userRole, logoUrl, logoStyle, brandName }: Props) {
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

  const activeSection = GROUPS.find(({ items }) => items.some((item) => isActive(item.path)))?.section

  // The reader's open/closed choices live in localStorage. The server
  // snapshot is null, so the first render (server and client alike) opens
  // only the group holding the current page and hydration matches.
  const saved = parseSections(useSyncExternalStore(subscribeOpenSections, readOpenSections, () => null)) ?? []

  // The current page's group is always open — unless the reader folded it
  // while on that page. That exception lasts until they move to another group.
  const [closedActive, setClosedActive] = useState<string | null>(null)
  const [prevActive, setPrevActive] = useState(activeSection)
  if (prevActive !== activeSection) {
    setPrevActive(activeSection)
    setClosedActive(null)
  }

  const openSections =
    activeSection && closedActive !== activeSection && !saved.includes(activeSection)
      ? [...saved, activeSection]
      : saved

  function toggle(section: string) {
    const rest = saved.filter((s) => s !== section)
    if (openSections.includes(section)) {
      writeOpenSections(rest)
      if (section === activeSection) setClosedActive(section)
    } else {
      writeOpenSections([...rest, section])
      if (section === activeSection) setClosedActive(null)
    }
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
        The groups now fold (see GROUPS), so by default the nav fits and this
        scroll is only a fallback when a reader opens every group on a short
        screen.
      */
      className="hidden w-[240px] flex-col gap-1 border-r border-ih-border bg-ih-surface px-3.5 py-5 md:sticky md:top-0 md:flex md:h-screen"
      aria-label="Primary admin navigation"
    >
      {/*
        Brand: the storefront's own logo, from the same Settings field the
        site header renders — so a logo change in Settings changes both, and
        the admin can never drift to a placeholder mark again. It used to be
        the generic LogoMark beside "Indus Hydraulics · Admin · v1.0.0", which
        matched nothing a customer ever sees. "Admin panel" sits under it so
        the rail still says which side of the site you are on.
        No bottom border — the nav's own group labels do the dividing.
      */}
      <div className="px-2.5 pb-5">
        <Link
          href={ADMIN_PREFIX}
          aria-label={`${brandName} admin panel — dashboard`}
          className="flex flex-col items-start gap-2 rounded-md focus-visible:shadow-[0_0_0_3px_var(--color-ih-accent-soft)] focus-visible:outline-none"
        >
          <BrandLockup logoUrl={logoUrl} logoStyle={logoStyle} name={brandName} surface="header" />
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ih-muted">
            Admin panel
          </span>
        </Link>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto [scrollbar-width:thin]">
        {/* Dashboard is a single link, not a group: nothing to fold. */}
        {OVERVIEW.map((item) => (
          <NavLink key={item.id} item={item} active={isActive(item.path)} />
        ))}

        {GROUPS.map(({ section, items }) => {
          const open = openSections.includes(section)
          const holdsActive = items.some((item) => isActive(item.path))
          const panelId = `admin-nav-${section.toLowerCase()}`
          return (
            <div key={section} className="pt-1">
              <button
                type="button"
                onClick={() => toggle(section)}
                aria-expanded={open}
                aria-controls={panelId}
                className="group flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-ih-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft"
              >
                <span
                  className={`flex-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] ${
                    holdsActive && !open ? 'text-ih-ink' : 'text-ih-muted-2'
                  }`}
                >
                  {section}
                </span>
                {/* A folded group that holds the current page says so. */}
                {holdsActive && !open ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-ih-navy" aria-hidden="true" />
                ) : null}
                <ChevronRight
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className={`text-ih-muted-2 transition-transform duration-150 motion-reduce:transition-none group-hover:text-ih-ink-2 ${
                    open ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {/*
                grid-rows 0fr → 1fr animates to the content's natural height
                without measuring it. `inert` takes a folded group's links out
                of the tab order and the accessibility tree.
              */}
              <div
                id={panelId}
                inert={!open}
                className={`grid transition-[grid-template-rows] duration-200 ease-[ease] motion-reduce:transition-none ${
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="flex min-h-0 flex-col gap-0.5 overflow-hidden">
                  {items.map((item) => (
                    <NavLink key={item.id} item={item} active={isActive(item.path)} />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
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

function NavLink({ item: { label, path, Icon }, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={path ? `${ADMIN_PREFIX}/${path}` : ADMIN_PREFIX}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft ${
        active ? 'bg-ih-navy font-medium text-ih-bg' : 'text-ih-ink-2 hover:bg-ih-surface-2'
      }`}
    >
      <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  )
}

const OPEN_SECTIONS_KEY = 'ih-admin-nav-open'
const listeners = new Set<() => void>()

function subscribeOpenSections(onChange: () => void) {
  listeners.add(onChange)
  // Another admin tab folding a group updates this one too.
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** The raw string, so the snapshot compares stably. Storage can be absent or throw. */
function readOpenSections(): string | null {
  try {
    return window.localStorage.getItem(OPEN_SECTIONS_KEY)
  } catch {
    return null
  }
}

function parseSections(raw: string | null): string[] | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : null
  } catch {
    return null
  }
}

function writeOpenSections(sections: string[]) {
  try {
    window.localStorage.setItem(OPEN_SECTIONS_KEY, JSON.stringify(sections))
  } catch {
    // Not remembered; the rail still works for this render.
  }
  listeners.forEach((notify) => notify())
}
