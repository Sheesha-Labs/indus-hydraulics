import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { db } from '@indus/db'
import {
  getSubPageKind,
  isSubPageKind,
  marketsOrdered,
  releasedMarketPageSlugs,
  subPageContentKey,
} from '@indus/domain'
import AdminPageShell from '../../../../../../components/admin/AdminPageShell'
import { requireStaffRole } from '../../../../../../lib/staff-session'
import { ROLES } from '../../../../../../lib/rbac'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ kind: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind } = await params
  const def = getSubPageKind(kind)
  return { title: def ? `${def.label} — Pages & Blocks` : 'Pages & Blocks' }
}

/**
 * Every page of one sub-page kind.
 *
 * Live pages first, then the ones still held back. The split matters: 100-odd
 * markets are written and only a handful are public, so a flat list would bury
 * the pages an editor can actually affect today.
 */
export default async function SubPageKindIndex({ params }: Props) {
  await requireStaffRole(ROLES.CMS_WRITE)

  const { kind } = await params
  if (!isSubPageKind(kind)) notFound()
  const kindDef = getSubPageKind(kind)
  if (!kindDef) notFound()

  const released = new Set(releasedMarketPageSlugs())
  const markets = marketsOrdered()

  const edited = await db.pageContent.findMany({
    where: { kind },
    select: { key: true, updatedAt: true },
  })
  const editedByKey = new Map(edited.map((row) => [row.key, row.updatedAt]))

  const rows = markets.map((market) => ({
    slug: market.slug,
    name: market.name,
    code: market.countryCode,
    live: released.has(market.slug),
    updatedAt: editedByKey.get(subPageContentKey(kind, market.slug)) ?? null,
  }))

  const live = rows.filter((r) => r.live)
  const held = rows.filter((r) => !r.live)

  return (
    <AdminPageShell
      title={kindDef.label}
      breadcrumbs={
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1 text-ih-muted transition-colors hover:text-ih-ink"
        >
          <ChevronLeft size={12} strokeWidth={1.8} aria-hidden="true" />
          Pages &amp; Blocks
        </Link>
      }
      bodyClassName="flex flex-col gap-8"
    >
      <p className="max-w-[80ch] text-[13px] leading-[1.6] text-ih-ink-2">
        {kindDef.description}
      </p>

      <SubPageTable
        heading="Live"
        emptyMessage="No market page is public yet."
        rows={live}
        kind={kind}
      />
      <SubPageTable
        heading="Not yet released"
        emptyMessage="Every market is live."
        note="These render the plain layout until their regulatory copy clears forwarder review. Edits here save and apply the moment a market is released."
        rows={held}
        kind={kind}
      />
    </AdminPageShell>
  )
}

type Row = {
  slug: string
  name: string
  code: string
  live: boolean
  updatedAt: Date | null
}

function SubPageTable({
  heading,
  rows,
  kind,
  emptyMessage,
  note,
}: {
  heading: string
  rows: Row[]
  kind: string
  emptyMessage: string
  note?: string
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-[15px] font-medium tracking-[-0.01em]">
          {heading}{' '}
          <span className="font-mono text-[12px] text-ih-muted">· {rows.length}</span>
        </h2>
        {note ? (
          <p className="mt-1 max-w-[80ch] text-[12.5px] leading-[1.55] text-ih-muted">{note}</p>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ih-border bg-ih-surface-2 px-4 py-6 text-center text-[13px] text-ih-muted">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-ih-border">
          <div className="grid grid-cols-[1fr_70px_120px_70px] border-b border-ih-border bg-ih-bg px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
            <div>Market</div>
            <div>Code</div>
            <div className="text-right">Edited</div>
            <div />
          </div>
          {rows.map((row, i) => (
            <div
              key={row.slug}
              className={`grid grid-cols-[1fr_70px_120px_70px] items-center bg-ih-surface px-4 py-3 ${i > 0 ? 'border-t border-ih-border' : ''}`}
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-ih-ink">{row.name}</div>
                <div className="font-mono text-[11px] text-ih-muted">/markets/{row.slug}</div>
              </div>
              <div className="font-mono text-[11.5px] text-ih-muted">{row.code}</div>
              <div className="text-right font-mono text-[11.5px] text-ih-muted">
                {row.updatedAt
                  ? row.updatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                  : '—'}
              </div>
              <div className="flex justify-end">
                <Link
                  href={`/admin/pages/sub/${kind}/${row.slug}`}
                  className="font-mono text-[11px] text-ih-accent hover:underline"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
