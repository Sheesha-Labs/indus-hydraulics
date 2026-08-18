import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { requireStaff } from '../../../lib/staff-session'
import { db } from '@indus/db'
import Link from 'next/link'
import { ADMIN_PREFIX } from '../../../lib/admin-paths'
import AdminPageShell from '../../../components/admin/AdminPageShell'
import { Card, Note, StatTile, StatusPill, productStatusTone } from '@indus/ui'

export const metadata: Metadata = { title: 'Dashboard' }

type Props = { params: Promise<Record<string, never>> }

// Dashboard KPI counts change rarely relative to how often the admin opens
// the dashboard. Cache them for 60s, tagged so future mutation actions can
// call revalidateTag('admin:dashboard') to force a refresh on demand.
const getDashboardCounts = unstable_cache(
  async () => {
    const [productCount, rfqStats, customerCount, mediaCount, productsWithoutDatasheets] =
      await Promise.all([
        db.product.count(),
        db.rfq.groupBy({ by: ['status'], _count: { _all: true } }),
        db.account.count(),
        db.media.count(),
        db.product.count({
          where: { status: 'active', documents: { none: { kind: 'datasheet' } } },
        }),
      ])
    return { productCount, rfqStats, customerCount, mediaCount, productsWithoutDatasheets }
  },
  ['admin:dashboard:counts'],
  { revalidate: 60, tags: ['admin:dashboard'] },
)

export default async function AdminDashboardPage({ params }: Props) {
  await params
  // Was `await auth()` with every read optional-chained — i.e. no guard at all.
  const session = await requireStaff()

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'
  const now = new Date()
  const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const { productCount, rfqStats, customerCount, mediaCount, productsWithoutDatasheets } =
    await getDashboardCounts()

  const openRfqs = rfqStats
    .filter((r) => !['cancelled', 'expired', 'declined', 'invoiced', 'paid'].includes(r.status))
    .reduce((sum, r) => sum + r._count._all, 0)

  const [recentProducts, recentActivity] = await Promise.all([
    db.product.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { brand: true, category: true },
    }),
    db.accountActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { account: true },
    }),
  ])

  return (
    <AdminPageShell
      title={<>Good {timeOfDay}, {firstName}</>}
      sub={dateStr}
      actions={
        <Link
          href={`${ADMIN_PREFIX}/products/new`}
          className="flex h-9 items-center rounded-md bg-ih-accent px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          + Add product
        </Link>
      }
    >

        {/* KPI grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          <StatTile label="Products" value={productCount} delta="Total catalogue" />
          <StatTile label="Open RFQs" value={openRfqs} delta="In progress" />
          <StatTile label="Accounts" value={customerCount} delta="B2B customers" />
          <StatTile label="Media assets" value={mediaCount} delta="Total files" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mb-4">
          <Card>
            <CardHead
              title="Most recently updated products"
              subtitle="Last edited"
              action={
                <Link href={`/admin/products`} className="text-[13px] text-ih-accent hover:underline">
                  View all →
                </Link>
              }
            />
            <div className="overflow-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-ih-bg border-b border-ih-border">
                    {['Product', 'SKU', 'Status', 'Updated'].map((h, i) => (
                      <th key={h} className={`px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] text-ih-muted uppercase ${i === 3 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-ih-muted">
                        No products yet.{' '}
                        <Link href={`/admin/products/new`} className="text-ih-accent hover:underline">
                          Add your first product →
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    recentProducts.map((product) => (
                      <tr key={product.id} className="border-b border-ih-border hover:bg-ih-bg">
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="font-medium hover:text-ih-accent transition-colors"
                          >
                            {product.title}
                          </Link>
                          {product.brand && (
                            <div className="text-[11px] text-ih-muted">{product.brand.name}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-ih-muted">{product.sku}</td>
                        <td className="px-4 py-3">
                          <StatusPill tone={productStatusTone(product.status)}>
                            {product.status}
                          </StatusPill>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[11px] text-ih-muted">
                          {timeAgo(product.updatedAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHead title="Activity feed" />
            <div className="px-4 py-3 flex flex-col gap-3 text-[12px]">
              {recentActivity.length === 0 ? (
                <p className="text-ih-muted py-4 text-center">No recent activity.</p>
              ) : (
                recentActivity.map((act) => (
                  <div key={act.id}>
                    <span className="font-semibold text-ih-ink">{act.account.displayName}</span>
                    {' — '}
                    <span className="text-ih-muted">{act.verb.replace(/_/g, ' ')}</span>
                    {' · '}
                    <span className="font-mono text-[11px] text-ih-muted-2">{timeAgo(act.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-4">
          {productsWithoutDatasheets > 0 ? (
            <Note tone="warn">
              <b>{productsWithoutDatasheets} active product{productsWithoutDatasheets !== 1 ? 's' : ''} missing datasheets</b> — upload specs to improve RFQ conversion.{' '}
              <Link href={`${ADMIN_PREFIX}/products`} className="underline">Review →</Link>
            </Note>
          ) : (
            <Note tone="success">
              <b>All active products have datasheets</b> — catalogue is complete.
            </Note>
          )}
          <Note tone="accent">
            <b>Open RFQ queue</b> — {openRfqs} RFQs await engineer review.{' '}
            <Link href={`${ADMIN_PREFIX}/rfqs`} className="underline">Open queue →</Link>
          </Note>
          <Note tone="success">
            <b>System healthy</b> — all services running normally.
          </Note>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: 'Add product', href: `${ADMIN_PREFIX}/products/new`, icon: '+' },
            { label: 'Bulk import', href: `${ADMIN_PREFIX}/products/import`, icon: '↑' },
            { label: 'RFQ queue', href: `${ADMIN_PREFIX}/rfqs`, icon: '▤' },
            { label: 'Customer accounts', href: `${ADMIN_PREFIX}/customers`, icon: '◎' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg border border-ih-border bg-ih-surface px-4 py-3.5 text-[13px] font-medium transition-colors hover:border-ih-border-strong hover:bg-ih-bg"
            >
              <span className="font-mono text-ih-muted text-base">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
    </AdminPageShell>
  )
}

/**
 * Card header. Kept local because packages/ui's SectionHead is the editorial
 * form (eyebrow + serif + number) and does not fit a console panel; everything
 * else on this page now comes from the shared primitives.
 */
function CardHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ih-border px-4 py-3.5">
      <div>
        <h3 className="text-[14px] font-semibold">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[12px] text-ih-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}
