import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import AdminPageShell from '../../../../components/admin/AdminPageShell'
import { ADMIN_PREFIX } from '../../../../lib/admin-paths'

export const metadata: Metadata = { title: 'Customers — Indus Admin' }

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<{ status?: string; tier?: string; q?: string }>
}

const TIER_COLORS: Record<string, string> = {
  bronze: 'text-[oklch(0.55_0.1_55)] bg-[oklch(0.96_0.04_55)]',
  silver: 'text-[oklch(0.45_0.02_240)] bg-[oklch(0.94_0.01_240)]',
  gold: 'text-[oklch(0.55_0.13_80)] bg-[oklch(0.96_0.05_80)]',
  platinum: 'text-[oklch(0.4_0.08_220)] bg-[oklch(0.93_0.04_220)]',
}

const STATUS_COLORS: Record<string, string> = {
  prospect: 'text-[oklch(0.5_0.08_60)] bg-ih-warning-soft',
  active: 'text-ih-success-ink bg-ih-success-soft',
  at_risk: 'text-ih-danger-ink bg-ih-danger-soft',
  archived: 'text-ih-muted bg-ih-surface-2',
}

export default async function AdminCustomersPage({ params, searchParams }: Props) {
  await params
  const sp = await searchParams

  const statusFilter = sp.status ?? ''
  const tierFilter = sp.tier ?? ''
  const query = (sp.q ?? '').trim()

  const accounts = await db.account.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter as never } : {}),
      ...(tierFilter ? { tier: tierFilter as never } : {}),
      ...(query
        ? {
            OR: [
              { legalName: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
              { code: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      assignedRep: { select: { name: true } },
      _count: { select: { rfqs: true, contacts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  function filterUrl(overrides: Record<string, string | undefined>) {
    const base = {
      status: statusFilter || undefined,
      tier: tierFilter || undefined,
      q: query || undefined,
    }
    const merged = { ...base, ...overrides }
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return `${ADMIN_PREFIX}/customers${qs ? `?${qs}` : ''}`
  }

  return (
    <AdminPageShell
      title={'Customers'}
      actions={
        <Link
          href={`/admin/customers/new`}
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover flex h-9 items-center px-4 text-[12px] tabular-nums"
        >
          + New Account
        </Link>
      }
    >
      {/* Search + filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form
          method="GET"
          action={`/admin/customers`}
          className="border-ih-border bg-ih-surface flex h-9 rounded-md border"
        >
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by name or code…"
            className="text-ih-ink placeholder:text-ih-muted-2 w-52 bg-transparent px-3 text-[13px] focus:outline-none"
          />
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          {tierFilter && <input type="hidden" name="tier" value={tierFilter} />}
          <button
            type="submit"
            className="border-ih-border text-ih-muted hover:text-ih-ink border-l px-3 text-[11px] tabular-nums"
          >
            Search
          </button>
        </form>

        <div className="flex gap-1.5">
          {['', 'prospect', 'active', 'at_risk', 'archived'].map((s) => (
            <Link
              key={s}
              href={filterUrl({ status: s || undefined })}
              className={`rounded-lg border px-3 py-1.5 text-[11px] capitalize tabular-nums transition-colors ${
                statusFilter === s
                  ? 'border-ih-accent bg-ih-accent text-ih-accent-fg'
                  : 'border-ih-border text-ih-ink-2 hover:border-ih-accent'
              }`}
            >
              {s || 'All'}
            </Link>
          ))}
        </div>

        <div className="flex gap-1.5">
          {['', 'bronze', 'silver', 'gold', 'platinum'].map((t) => (
            <Link
              key={t}
              href={filterUrl({ tier: t || undefined })}
              className={`rounded-lg border px-3 py-1.5 text-[11px] capitalize tabular-nums transition-colors ${
                tierFilter === t
                  ? 'border-ih-accent bg-ih-accent text-ih-accent-fg'
                  : 'border-ih-border text-ih-ink-2 hover:border-ih-accent'
              }`}
            >
              {t || 'All Tiers'}
            </Link>
          ))}
        </div>

        <div className="text-ih-muted ml-auto text-[12px] tabular-nums">
          {accounts.length} accounts
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="border-ih-border rounded-lg border py-16 text-center">
          <p className="text-ih-muted">No accounts match these filters.</p>
        </div>
      ) : (
        <div className="border-ih-border overflow-hidden rounded-lg border">
          {/* Header */}
          <div className="bg-ih-bg border-ih-border text-ih-muted grid grid-cols-[1fr_80px_100px_120px_100px_80px_80px] border-b px-4 py-2.5 text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
            <div>Account</div>
            <div className="text-center">Tier</div>
            <div className="text-center">Status</div>
            <div>Rep</div>
            <div className="text-center">RFQs</div>
            <div className="text-center">Contacts</div>
            <div className="text-right">Joined</div>
          </div>

          {accounts.map((acc, i) => (
            <Link
              key={acc.id}
              href={`/admin/customers/${acc.id}`}
              className={`bg-ih-surface hover:bg-ih-surface-2 grid grid-cols-[1fr_80px_100px_120px_100px_80px_80px] items-center px-4 py-3.5 transition-colors ${i > 0 ? 'border-ih-border border-t' : ''}`}
            >
              <div>
                <div className="text-ih-ink text-[13px] font-medium">{acc.legalName}</div>
                <div className="text-ih-muted text-[11px] tabular-nums">{acc.code}</div>
              </div>
              <div className="flex justify-center">
                <span
                  className={`px-2 py-0.5 text-[11px] font-medium capitalize tabular-nums ${TIER_COLORS[acc.tier] ?? ''}`}
                >
                  {acc.tier}
                </span>
              </div>
              <div className="flex justify-center">
                <span
                  className={`px-2 py-0.5 text-[11px] font-medium capitalize tabular-nums ${STATUS_COLORS[acc.status] ?? ''}`}
                >
                  {acc.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-ih-ink-2 truncate text-[12px]">
                {acc.assignedRep?.name ?? <span className="text-ih-muted-2">Unassigned</span>}
              </div>
              <div className="text-ih-ink text-center text-[13px] tabular-nums">
                {acc._count.rfqs}
              </div>
              <div className="text-ih-ink text-center text-[13px] tabular-nums">
                {acc._count.contacts}
              </div>
              <div className="text-ih-muted text-right text-[12px] tabular-nums">
                {new Date(acc.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </AdminPageShell>
  )
}
