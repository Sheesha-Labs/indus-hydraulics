import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'

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
  prospect: 'text-[oklch(0.5_0.08_60)] bg-[oklch(0.96_0.04_60)]',
  active: 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]',
  at_risk: 'text-[oklch(0.5_0.12_25)] bg-[oklch(0.96_0.04_25)]',
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
    return `/customers${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="px-8 py-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Customers</h1>
        <Link
          href={`/admin/customers/new`}
          className="h-9 px-4 flex items-center bg-ih-accent text-white font-mono text-[12px] hover:opacity-90"
        >
          + New Account
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form method="GET" action={`/customers`} className="flex border border-ih-border bg-ih-surface h-9">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by name or code…"
            className="w-52 px-3 bg-transparent text-[13px] text-ih-ink placeholder:text-ih-muted-2 focus:outline-none"
          />
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          {tierFilter && <input type="hidden" name="tier" value={tierFilter} />}
          <button type="submit" className="px-3 border-l border-ih-border font-mono text-[11px] text-ih-muted hover:text-ih-ink">
            Search
          </button>
        </form>

        <div className="flex gap-1.5">
          {['', 'prospect', 'active', 'at_risk', 'archived'].map((s) => (
            <Link
              key={s}
              href={filterUrl({ status: s || undefined })}
              className={`px-3 py-1.5 font-mono text-[11px] border transition-colors capitalize ${
                statusFilter === s
                  ? 'border-ih-accent bg-ih-accent text-white'
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
              className={`px-3 py-1.5 font-mono text-[11px] border transition-colors capitalize ${
                tierFilter === t
                  ? 'border-ih-accent bg-ih-accent text-white'
                  : 'border-ih-border text-ih-ink-2 hover:border-ih-accent'
              }`}
            >
              {t || 'All Tiers'}
            </Link>
          ))}
        </div>

        <div className="ml-auto font-mono text-[12px] text-ih-muted">{accounts.length} accounts</div>
      </div>

      {accounts.length === 0 ? (
        <div className="py-16 border border-dashed border-ih-border text-center">
          <p className="text-ih-muted">No accounts match these filters.</p>
        </div>
      ) : (
        <div className="border border-ih-border">
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_100px_120px_100px_80px_80px] px-4 py-2.5 bg-ih-bg border-b border-ih-border font-mono text-[10px] tracking-[0.1em] uppercase text-ih-muted">
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
              className={`grid grid-cols-[1fr_80px_100px_120px_100px_80px_80px] px-4 py-3.5 items-center bg-ih-surface hover:bg-ih-surface-2 transition-colors ${i > 0 ? 'border-t border-ih-border' : ''}`}
            >
              <div>
                <div className="text-[13px] font-semibold text-ih-ink">{acc.legalName}</div>
                <div className="font-mono text-[11px] text-ih-muted">{acc.code}</div>
              </div>
              <div className="flex justify-center">
                <span className={`px-2 py-0.5 font-mono text-[10px] font-semibold capitalize ${TIER_COLORS[acc.tier] ?? ''}`}>
                  {acc.tier}
                </span>
              </div>
              <div className="flex justify-center">
                <span className={`px-2 py-0.5 font-mono text-[10px] font-semibold capitalize ${STATUS_COLORS[acc.status] ?? ''}`}>
                  {acc.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-[12px] text-ih-ink-2 truncate">
                {acc.assignedRep?.name ?? <span className="text-ih-muted-2">Unassigned</span>}
              </div>
              <div className="text-center font-mono text-[13px] text-ih-ink">{acc._count.rfqs}</div>
              <div className="text-center font-mono text-[13px] text-ih-ink">{acc._count.contacts}</div>
              <div className="text-right font-mono text-[12px] text-ih-muted">
                {new Date(acc.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
