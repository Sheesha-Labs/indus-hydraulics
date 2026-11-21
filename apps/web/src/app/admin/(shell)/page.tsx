import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { requireStaff } from '../../../lib/staff-session'
import { db } from '@indus/db'
import Link from 'next/link'
import { ADMIN_PREFIX } from '../../../lib/admin-paths'
import AdminPageShell from '../../../components/admin/AdminPageShell'

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
  { revalidate: 60, tags: ['admin:dashboard'] }
)

export default async function AdminDashboardPage({ params }: Props) {
  await params
  // Was `await auth()` with every read optional-chained — i.e. no guard at all.
  const session = await requireStaff()

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'
  // eslint-disable-next-line react/purity -- Server Component: reading the clock at render is intended here.
  const now = new Date()
  const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'
  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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
      title={
        <>
          Good {timeOfDay}, {firstName}
        </>
      }
      sub={dateStr}
      actions={
        <Link
          href={`${ADMIN_PREFIX}/products/new`}
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover flex h-9 items-center rounded-md px-4 text-[13px] font-medium transition-opacity"
        >
          + Add product
        </Link>
      }
    >
      {/* KPI grid */}
      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard label="Products" value={String(productCount)} delta="Total catalogue" />
        <KpiCard label="Open RFQs" value={String(openRfqs)} delta="In progress" />
        <KpiCard label="Accounts" value={String(customerCount)} delta="B2B customers" />
        <KpiCard label="Media assets" value={String(mediaCount)} delta="Total files" />
      </div>

      {/* Main grid */}
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHead
            title="Most recently updated products"
            subtitle="Last edited"
            action={
              <Link href={`/admin/products`} className="text-ih-accent text-[13px] hover:underline">
                View all →
              </Link>
            }
          />
          <div className="overflow-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-ih-bg border-ih-border border-b">
                  {['Product', 'SKU', 'Status', 'Updated'].map((h, i) => (
                    <th
                      key={h}
                      className={`text-ih-muted px-4 py-2.5 text-[11px] tracking-[0.08em] uppercase tabular-nums ${i === 3 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-ih-muted px-4 py-8 text-center">
                      No products yet.{' '}
                      <Link href={`/admin/products/new`} className="text-ih-accent hover:underline">
                        Add your first product →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  recentProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-ih-border hover:bg-ih-bg border-b last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="hover:text-ih-accent font-medium transition-colors"
                        >
                          {product.title}
                        </Link>
                        {product.brand && (
                          <div className="text-ih-muted text-[11px]">{product.brand.name}</div>
                        )}
                      </td>
                      <td className="text-ih-muted px-4 py-3 text-[12px] tabular-nums">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={product.status} />
                      </td>
                      <td className="text-ih-muted px-4 py-3 text-right text-[11px] tabular-nums">
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
          <div className="flex flex-col gap-3 px-4 py-3 text-[12px]">
            {recentActivity.length === 0 ? (
              <p className="text-ih-muted py-4 text-center">No recent activity.</p>
            ) : (
              recentActivity.map((act) => (
                <div key={act.id}>
                  <span className="text-ih-ink font-medium">{act.account.displayName}</span>
                  {' — '}
                  <span className="text-ih-muted">{act.verb.replace(/_/g, ' ')}</span>
                  {' · '}
                  <span className="text-ih-muted-2 text-[11px] tabular-nums">
                    {timeAgo(act.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Alerts */}
      <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-3">
        {productsWithoutDatasheets > 0 && (
          <Alert type="warn">
            <b>
              {productsWithoutDatasheets} active product{productsWithoutDatasheets !== 1 ? 's' : ''}{' '}
              missing datasheets
            </b>{' '}
            — upload specs to improve RFQ conversion.{' '}
            <Link href={`/admin/products`} className="underline">
              Review →
            </Link>
          </Alert>
        )}
        {productsWithoutDatasheets === 0 && (
          <Alert type="ok">
            <b>All active products have datasheets</b> — catalogue is complete.
          </Alert>
        )}
        <Alert type="info">
          <b>Enquiries</b> — {openRfqs} website RFQs await engineer review.{' '}
          <Link href={`/admin/enquiries`} className="underline">
            Open enquiries →
          </Link>
        </Alert>
        <Alert type="ok">
          <b>System healthy</b> — all services running normally.
        </Alert>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Add product', href: `${ADMIN_PREFIX}/products/new`, icon: '+' },
          { label: 'Bulk import', href: `${ADMIN_PREFIX}/products/import`, icon: '↑' },
          { label: 'RFQ queue', href: `${ADMIN_PREFIX}/rfqs`, icon: '▤' },
          { label: 'Customer accounts', href: `${ADMIN_PREFIX}/customers`, icon: '◎' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border-ih-border bg-ih-surface hover:border-ih-border-strong focus-visible:border-ih-accent flex items-center gap-3 rounded-lg border px-4 py-3.5 text-[13px] font-medium transition-[border-color,box-shadow] hover:shadow-sm focus-visible:shadow-[0_0_0_3px_var(--color-ih-accent-soft)] focus-visible:outline-none"
          >
            <span className="text-ih-muted text-base tabular-nums">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </AdminPageShell>
  )
}

function KpiCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="border-ih-border bg-ih-surface flex flex-col gap-1.5 rounded-lg border p-5">
      <p className="text-ih-muted text-[10.5px] tracking-[0.1em] uppercase tabular-nums">{label}</p>
      <p className="text-[22px] leading-none font-medium tracking-tight tabular-nums">{value}</p>
      <p className="text-ih-muted-2 text-[11px] tabular-nums">{delta}</p>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  // overflow-hidden so the table's tinted header row follows the corners.
  return (
    <div className="border-ih-border bg-ih-surface overflow-hidden rounded-lg border">
      {children}
    </div>
  )
}

function CardHead({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="border-ih-border flex items-center justify-between gap-3 border-b px-4 py-3.5">
      <div>
        <h3 className="text-[14px] font-medium">{title}</h3>
        {subtitle && <p className="text-ih-muted mt-0.5 text-[12px]">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function Alert({ type, children }: { type: 'warn' | 'info' | 'ok'; children: React.ReactNode }) {
  const styles = {
    // Tokens, not oklch literals (CLAUDE.md §2.2): soft fill, a hairline in
    // the same hue, ink for the text — the Bazar note treatment.
    warn: 'border-ih-warning-line bg-ih-warning-soft text-ih-warning-ink',
    info: 'border-ih-accent-line bg-ih-accent-soft text-ih-info-ink',
    ok: 'border-ih-success/30 bg-ih-success-soft text-ih-success-ink',
  }
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-[13px] leading-relaxed ${styles[type]}`}
    >
      {children}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-[oklch(0.95_0.04_150)] text-[oklch(0.45_0.12_150)]',
    draft: 'bg-ih-surface-2 text-ih-muted',
    discontinued: 'bg-[oklch(0.95_0.02_25)] text-ih-danger-ink',
  }
  return (
    <span
      className={`rounded-[3px] px-2 py-0.5 text-[10.5px] tracking-[0.06em] uppercase tabular-nums ${styles[status] ?? styles['draft'] ?? ''}`}
    >
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
