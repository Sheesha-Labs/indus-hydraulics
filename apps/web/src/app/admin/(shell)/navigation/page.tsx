import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, TriangleAlert } from 'lucide-react'
import { db } from '@indus/db'
import { MENU_LOCATIONS, NAV_SURFACES, type MenuLocation } from '@indus/domain'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import CreateMenuButton from './CreateMenuButton'
import AdminPageShell from '../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Navigation — Indus Admin' }

/**
 * The navigation hub: one card per surface, in the order a visitor meets them.
 *
 * This was a table of `nav_menus` rows — name, location, item count, a
 * Published pill and an Edit link. That is the schema's view of the feature,
 * and it left an editor to work out for themselves that "Footer — main" is the
 * link columns and "Footer — legal" is the small print, that "Mobile drawer"
 * is read by nothing at all, and that the megamenu's third level is the last
 * one anybody sees.
 *
 * Each card now says what the surface draws, in a visitor's terms, and warns
 * where the answer is "nothing".
 */
export default async function NavigationHubPage() {
  requireRole(await auth(), ROLES.CMS_WRITE)

  const menus = await db.navMenu.findMany({
    select: {
      id: true,
      slug: true,
      location: true,
      isPublished: true,
      _count: { select: { items: true } },
    },
  })
  const byLocation = new Map(menus.map((m) => [m.location as MenuLocation, m]))
  const missing = MENU_LOCATIONS.filter((loc) => !byLocation.has(loc))

  // Footer-main and footer-legal are two menus behind one screen, so the
  // footer appears once and carries the count of both.
  const footerMain = byLocation.get('footer_main')
  const footerLegal = byLocation.get('footer_legal')

  const cards: {
    key: string
    href: string
    title: string
    renders: string
    count: number | null
    isPublished: boolean | null
    warning?: string
  }[] = [
    card('primary_header', byLocation),
    card('primary_megamenu', byLocation),
    {
      key: 'footer',
      href: '/admin/navigation/footer',
      title: 'Footer',
      renders:
        'Everything below the page — brand blurb, link columns, contact details, social profiles and the copyright line.',
      count:
        footerMain || footerLegal
          ? (footerMain?._count.items ?? 0) + (footerLegal?._count.items ?? 0)
          : null,
      isPublished:
        footerMain && footerLegal ? footerMain.isPublished && footerLegal.isPublished : null,
    },
    card('mobile_drawer', byLocation),
  ]

  return (
    <AdminPageShell
      title="Navigation"
      breadcrumbs="Content · Navigation"
      sub="Every menu on the site, and what each one draws."
      actions={missing.length > 0 ? <CreateMenuButton missing={missing} /> : null}
    >
      <div className="flex flex-col gap-3">
        {cards.map((entry) => (
          <Link
            key={entry.key}
            href={entry.href}
            className="group flex items-start gap-4 rounded-lg border border-ih-border bg-ih-surface p-5 transition-colors hover:border-ih-accent"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[15px] font-medium tracking-tight">{entry.title}</h2>
                {entry.isPublished === false ? (
                  <span className="rounded-full border border-ih-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">
                    Draft
                  </span>
                ) : null}
                {entry.count === null ? (
                  <span className="rounded-full border border-ih-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">
                    Not created
                  </span>
                ) : null}
              </div>
              <p className="mt-1 max-w-[70ch] text-[13px] leading-relaxed text-ih-ink-2">
                {entry.renders}
              </p>
              {entry.warning ? (
                <p className="mt-2 flex items-start gap-1.5 text-[12.5px] text-ih-danger-ink">
                  <TriangleAlert size={13} className="mt-[2px] shrink-0" />
                  <span>{entry.warning}</span>
                </p>
              ) : null}
              {entry.count !== null ? (
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ih-muted">
                  {entry.count} {entry.count === 1 ? 'item' : 'items'}
                </p>
              ) : null}
            </div>
            <ChevronRight
              size={16}
              className="mt-1 shrink-0 text-ih-muted transition-colors group-hover:text-ih-accent"
            />
          </Link>
        ))}
      </div>
    </AdminPageShell>
  )
}

function card(
  location: MenuLocation,
  byLocation: Map<MenuLocation, { slug: string; isPublished: boolean; _count: { items: number } }>,
) {
  const surface = NAV_SURFACES[location]
  const menu = byLocation.get(location)
  return {
    key: location,
    href: menu ? `/admin/navigation/${menu.slug}` : '/admin/navigation',
    title: surface.title,
    renders: surface.renders,
    count: menu ? menu._count.items : null,
    isPublished: menu ? menu.isPublished : null,
    warning: surface.notWired,
  }
}
