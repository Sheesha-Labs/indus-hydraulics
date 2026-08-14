import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { requireStaff } from '../../../lib/staff-session'
import { db } from '@indus/db'
import Link from 'next/link'

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
    <div className="px-8 py-6 pb-16">
      <div className="flex justify-between items-end gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">
            Good {timeOfDay}, {firstName}
          </h1>
          <p className="text-[13px] text-[var(--color-muted)] mt-1">{dateStr}</p>
        </div>
        <Link
          href={`/admin/products/new`}
          className="h-9 px-4 flex items-center bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90"
        >
          + Add product
        </Link>
      </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          <KpiCard label="Products" value={String(productCount)} delta="Total catalogue" />
          <KpiCard label="Open RFQs" value={String(openRfqs)} delta="In progress" />
          <KpiCard label="Accounts" value={String(customerCount)} delta="B2B customers" />
          <KpiCard label="Media assets" value={String(mediaCount)} delta="Total files" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mb-4">
          <Card>
            <CardHead
              title="Most recently updated products"
              subtitle="Last edited"
              action={
                <Link href={`/admin/products`} className="text-[13px] text-[var(--color-accent)] hover:underline">
                  View all →
                </Link>
              }
            />
            <div className="overflow-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                    {['Product', 'SKU', 'Status', 'Updated'].map((h, i) => (
                      <th key={h} className={`px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] text-[var(--color-muted)] uppercase ${i === 3 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-muted)]">
                        No products yet.{' '}
                        <Link href={`/admin/products/new`} className="text-[var(--color-accent)] hover:underline">
                          Add your first product →
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    recentProducts.map((product) => (
                      <tr key={product.id} className="border-b border-[var(--color-border-2)] hover:bg-[var(--color-surface)]">
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="font-medium hover:text-[var(--color-accent)] transition-colors"
                          >
                            {product.title}
                          </Link>
                          {product.brand && (
                            <div className="text-[11px] text-[var(--color-muted)]">{product.brand.name}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-muted)]">{product.sku}</td>
                        <td className="px-4 py-3">
                          <StatusPill status={product.status} />
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[11px] text-[var(--color-muted)]">
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
                <p className="text-[var(--color-muted)] py-4 text-center">No recent activity.</p>
              ) : (
                recentActivity.map((act) => (
                  <div key={act.id}>
                    <span className="font-semibold text-[var(--color-primary)]">{act.account.displayName}</span>
                    {' — '}
                    <span className="text-[var(--color-muted)]">{act.verb.replace(/_/g, ' ')}</span>
                    {' · '}
                    <span className="font-mono text-[11px] text-[var(--color-caption)]">{timeAgo(act.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-4">
          {productsWithoutDatasheets > 0 && (
            <Alert type="warn">
              <b>{productsWithoutDatasheets} active product{productsWithoutDatasheets !== 1 ? 's' : ''} missing datasheets</b> — upload specs to improve RFQ conversion.{' '}
              <Link href={`/admin/products`} className="underline">Review →</Link>
            </Alert>
          )}
          {productsWithoutDatasheets === 0 && (
            <Alert type="ok">
              <b>All active products have datasheets</b> — catalogue is complete.
            </Alert>
          )}
          <Alert type="info">
            <b>Open RFQ queue</b> — {openRfqs} RFQs await engineer review.{' '}
            <Link href={`/admin/rfqs`} className="underline">Open queue →</Link>
          </Alert>
          <Alert type="ok">
            <b>System healthy</b> — all services running normally.
          </Alert>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: 'Add product', href: `/products/new`, icon: '+' },
            { label: 'Bulk import', href: `/products/import`, icon: '↑' },
            { label: 'RFQ queue', href: `/rfqs`, icon: '▤' },
            { label: 'Customer accounts', href: `/customers`, icon: '◎' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3.5 border border-[var(--color-border)] bg-white hover:bg-[var(--color-surface)] transition-colors text-[13px] font-medium"
            >
              <span className="font-mono text-[var(--color-muted)] text-base">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
  )
}

function KpiCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="bg-white border border-[#e6e1d5] p-4 flex flex-col gap-1.5">
      <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">{label}</p>
      <p className="font-mono text-[26px] font-semibold tracking-tight leading-none">{value}</p>
      <p className="font-mono text-[11px] text-[var(--color-caption)]">{delta}</p>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-[#e6e1d5]">{children}</div>
}

function CardHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-3 px-4 py-3.5 border-b border-[#efebe1]">
      <div>
        <h3 className="font-semibold text-[14px]">{title}</h3>
        {subtitle && <p className="text-[12px] text-[var(--color-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function Alert({ type, children }: { type: 'warn' | 'info' | 'ok'; children: React.ReactNode }) {
  const styles = {
    warn: 'border-[oklch(0.7_0.15_80)] bg-[oklch(0.98_0.02_80)] text-[oklch(0.5_0.15_60)]',
    info: 'border-[oklch(0.6_0.1_240)] bg-[oklch(0.97_0.02_240)] text-[oklch(0.4_0.1_240)]',
    ok: 'border-[oklch(0.55_0.12_150)] bg-[oklch(0.97_0.02_150)] text-[oklch(0.4_0.12_150)]',
  }
  return (
    <div className={`flex items-start gap-3 px-4 py-3 border text-[13px] leading-relaxed ${styles[type]}`}>
      {children}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-[oklch(0.95_0.04_150)] text-[oklch(0.45_0.12_150)]',
    draft: 'bg-[var(--color-deep)] text-[var(--color-muted)]',
    discontinued: 'bg-[oklch(0.95_0.02_25)] text-[oklch(0.5_0.1_25)]',
  }
  return (
    <span className={`font-mono text-[10px] tracking-[0.06em] uppercase px-2 py-0.5 ${styles[status] ?? styles['draft'] ?? ''}`}>
      {status}
    </span>
  )
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}
