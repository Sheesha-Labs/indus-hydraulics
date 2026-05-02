import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import { MENU_LOCATION_LABELS, MENU_LOCATIONS, type MenuLocation } from '@indus/domain'
import AdminTopbar from '../../../components/AdminTopbar'
import CreateMenuButton from './CreateMenuButton'

export const metadata: Metadata = { title: 'Navigation — Indus Admin' }

type Props = { params: Promise<Record<string, never>> }

export default async function NavigationListPage({ params }: Props) {
  await params

  const menus = await db.navMenu.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { items: true } } },
  })

  const byLocation = new Map(menus.map((m) => [m.location, m]))
  const missingLocations = MENU_LOCATIONS.filter((loc) => !byLocation.has(loc))

  return (
    <>
      <AdminTopbar crumbs={[{ label: 'Content' }, { label: 'Navigation' }]} />
      <div className="px-8 py-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">Navigation menus</h1>
            <p className="text-[13px] text-[var(--color-muted)] mt-1">
              Manage every nav surface — header, megamenu, footer, and mobile drawer.
            </p>
          </div>
          {missingLocations.length > 0 ? <CreateMenuButton missing={missingLocations} /> : null}
        </div>

        <div className="bg-white border border-[var(--color-border)]">
          <div className="grid grid-cols-[1fr_180px_120px_140px_120px] px-4 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
            <div>Name</div>
            <div>Location</div>
            <div className="text-center">Items</div>
            <div className="text-center">Status</div>
            <div className="text-right"></div>
          </div>
          {menus.length === 0 ? (
            <div className="px-4 py-12 text-center text-[13px] text-[var(--color-muted)]">
              No menus yet — create one to get started.
            </div>
          ) : (
            menus.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-[1fr_180px_120px_140px_120px] items-center px-4 py-3 border-b border-[var(--color-border)] last:border-b-0 text-[13px]"
              >
                <div className="font-medium">{m.name}</div>
                <div className="font-mono text-[11px] text-[var(--color-muted)]">
                  {MENU_LOCATION_LABELS[m.location as MenuLocation]}
                </div>
                <div className="text-center">{m._count.items}</div>
                <div className="text-center">
                  <span
                    className={
                      m.isPublished
                        ? 'inline-block px-2 py-0.5 text-[11px] bg-[oklch(0.93_0.06_140)] text-[oklch(0.32_0.10_140)]'
                        : 'inline-block px-2 py-0.5 text-[11px] bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)]'
                    }
                  >
                    {m.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="text-right">
                  <Link
                    href={`/navigation/${m.slug}`}
                    className="text-[12px] text-[var(--color-accent)] hover:underline"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
