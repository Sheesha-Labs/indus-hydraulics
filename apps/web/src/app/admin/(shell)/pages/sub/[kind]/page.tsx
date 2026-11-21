import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { db } from '@indus/db'
import { getSubPageKind, isSubPageKind, subPageContentKey } from '@indus/domain'
import AdminPageShell from '../../../../../../components/admin/AdminPageShell'
import { listSubPageRecords } from '../../../../../../lib/sub-page-records'
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
 * Live pages first, then the ones not yet public. The split matters: 100-odd
 * markets are written and only a handful are released, so a flat list would
 * bury the pages an editor can actually affect today. Brands split the same
 * way on `isPublished`.
 */
export default async function SubPageKindIndex({ params }: Props) {
  await requireStaffRole(ROLES.CMS_WRITE)

  const { kind } = await params
  if (!isSubPageKind(kind)) notFound()
  const kindDef = getSubPageKind(kind)
  if (!kindDef) notFound()

  const [records, edited] = await Promise.all([
    listSubPageRecords(kind),
    db.pageContent.findMany({ where: { kind }, select: { key: true, updatedAt: true } }),
  ])
  const editedByKey = new Map(edited.map((row) => [row.key, row.updatedAt]))

  const rows = records.map((record) => ({
    ...record,
    updatedAt: editedByKey.get(subPageContentKey(kind, record.slug)) ?? null,
  }))

  const live = rows.filter((r) => r.live)
  const held = rows.filter((r) => !r.live)

  const storefront = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com').replace(
    /\/$/,
    ''
  )

  return (
    <AdminPageShell
      title={kindDef.label}
      breadcrumbs={
        <Link
          href="/admin/pages"
          className="text-ih-muted hover:text-ih-ink inline-flex items-center gap-1 transition-colors"
        >
          <ChevronLeft size={12} strokeWidth={1.8} aria-hidden="true" />
          Pages &amp; Blocks
        </Link>
      }
      bodyClassName="flex flex-col gap-8"
    >
      <p className="text-ih-ink-2 max-w-[80ch] text-[13px] leading-[1.6]">{kindDef.description}</p>

      <SubPageTable
        heading="Live"
        emptyMessage={`No ${kindDef.itemLabel} is public yet.`}
        rows={live}
        kind={kind}
        pathPrefix={kindDef.publicPath}
        storefront={storefront}
      />
      <SubPageTable
        heading={kind === 'market' ? 'Not yet released' : 'Not published'}
        emptyMessage={`Every ${kindDef.itemLabel} is live.`}
        note={
          kind === 'market'
            ? 'These render the plain layout until their regulatory copy is signed off. Edits here save and apply the moment a market is released, and each one has a draft preview.'
            : 'These brands are unpublished, so their pages are not reachable. Edits here save and apply the moment a brand is published under Catalogue · Brands.'
        }
        rows={held}
        kind={kind}
        pathPrefix={kindDef.publicPath}
        storefront={storefront}
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
  pathPrefix,
  storefront,
  emptyMessage,
  note,
}: {
  heading: string
  rows: Row[]
  kind: string
  pathPrefix: string
  storefront: string
  emptyMessage: string
  note?: string
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-[15px] font-medium tracking-[-0.01em]">
          {heading} <span className="text-ih-muted text-[12px] tabular-nums">· {rows.length}</span>
        </h2>
        {note ? (
          <p className="text-ih-muted mt-1 max-w-[80ch] text-[12.5px] leading-[1.55]">{note}</p>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="border-ih-border bg-ih-surface-2 text-ih-muted rounded-lg border border-dashed px-4 py-6 text-center text-[13px]">
          {emptyMessage}
        </p>
      ) : (
        <div className="border-ih-border overflow-hidden rounded-lg border">
          <div className="border-ih-border bg-ih-bg text-ih-muted grid grid-cols-[1fr_70px_120px_70px] border-b px-4 py-2.5 text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
            <div>{kind === 'market' ? 'Market' : 'Brand'}</div>
            <div>Code</div>
            <div className="text-right">Edited</div>
            <div />
          </div>
          {rows.map((row, i) => (
            <div
              key={row.slug}
              className={`bg-ih-surface grid grid-cols-[1fr_70px_120px_70px] items-center px-4 py-3 ${i > 0 ? 'border-ih-border border-t' : ''}`}
            >
              {/* The NAME is the link to the editor, the way every other admin
                  list works (products, blog). A row whose only target was a
                  four-letter "Edit" at the far right read as inert — the thing
                  a reader points at is the title. */}
              <div className="min-w-0">
                <Link
                  href={`/admin/pages/sub/${kind}/${row.slug}`}
                  className="text-ih-ink hover:text-ih-accent block truncate text-[13px] font-medium"
                >
                  {row.name}
                </Link>
                <div className="text-ih-muted truncate text-[11px] tabular-nums">
                  {pathPrefix}/{row.slug}
                </div>
              </div>
              <div className="text-ih-muted text-[11.5px] tabular-nums">{row.code}</div>
              <div className="text-ih-muted text-right text-[11.5px] tabular-nums">
                {row.updatedAt
                  ? row.updatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                  : '—'}
              </div>
              {/* The trailing column is the PUBLIC page, not a second route to
                  the editor. Two links to the same place in one row is noise;
                  the one thing the row could not otherwise reach is the page
                  itself. Only for a page that is actually reachable, and
                  absolute — one app serves both surfaces, so a root-relative
                  storefront path from inside the console is the shape
                  `admin-path-prefix.test.ts` exists to catch. */}
              <div className="flex justify-end">
                {row.live ? (
                  <a
                    href={`${storefront}${pathPrefix}/${row.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ih-accent text-[11px] tabular-nums hover:underline"
                  >
                    View ↗
                  </a>
                ) : kind === 'market' ? (
                  /* A held market has no public page, but it does have a draft
                     preview — the one thing this row could not otherwise
                     reach now that markets have no admin section of their
                     own. */
                  <Link
                    href={`/admin/markets/${row.slug}`}
                    className="text-ih-accent text-[11px] tabular-nums hover:underline"
                  >
                    Draft
                  </Link>
                ) : (
                  <span className="text-ih-muted-2 text-[11px] tabular-nums">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
