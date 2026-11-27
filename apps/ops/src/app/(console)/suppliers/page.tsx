import { ButtonLink, Choices } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { T1Index } from '@indus/ops-ui/templates'
import type { Route } from 'next'
import SaveViewButton from '../../../components/directory/SaveViewButton'
import SupplierFilters from '../../../components/directory/SupplierFilters'
import SupplierPreview from '../../../components/directory/SupplierPreview'
import SupplierTable from '../../../components/directory/SupplierTable'
import {
  getSupplierPreview,
  listSuppliers,
  REGIONS,
  SUPPLIER_TYPES,
  suppliersSearchSchema,
  supplierViews,
  TIER_WORD,
  TIERS,
  TYPE_WORD,
} from '../../../data/suppliers'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/**
 * Board 128 · Suppliers (T1b, S10-T03): "Suppliers · n", the search by name, domain or part number, Tier · Type ·
 * Region · Category filters, "Replies fast" and "Never replied", saved views (All, Proposed and the person's own),
 * the tier counts, and the 360 preview of the selected row. Primary "Add supplier", secondary "Import" (S20).
 */
export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireOpsUser().catch(signInFor('/suppliers'))
  const raw = await searchParams
  const sp = suppliersSearchSchema.parse(raw)
  const [list, views, preview] = await Promise.all([
    listSuppliers(sp),
    supplierViews(user.id),
    sp.selected ? getSupplierPreview(sp.selected, user) : Promise.resolve(null),
  ])
  const keep = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(sp))
      if (v && k !== 'cursor' && k !== 'selected' && v !== 'all') p.set(k, String(v))
    for (const [k, v] of Object.entries(patch)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    const s = p.toString()
    return (s ? `/suppliers?${s}` : '/suppliers') as Route
  }
  const viewHref = (v: string) =>
    v === 'all'
      ? ('/suppliers' as Route)
      : v === 'proposed'
        ? ('/suppliers?view=proposed' as Route)
        : (`/suppliers?${views.find((x) => x.id === v)?.queryText ?? ''}` as Route)
  const currentView =
    sp.view === 'proposed'
      ? 'proposed'
      : (views.find(
          (v) =>
            v.queryText ===
            new URLSearchParams(
              Object.entries(raw).flatMap(([k, v]) =>
                typeof v === 'string' && k !== 'selected' && k !== 'cursor' ? [[k, v]] : []
              )
            ).toString()
        )?.id ?? 'all')
  const counts = TIERS.filter((t) => list.tierCounts[t] > 0)
    .map((t) => `${TIER_WORD[t]} ${list.tierCounts[t]}`)
    .join(' · ')
  return (
    <T1Index
      header={
        <PageHeader
          crumb="Suppliers"
          title={`Suppliers · ${list.total}`}
          actions={
            <>
              <ButtonLink href={'/history-import' as Route}>Import</ButtonLink>
              <ButtonLink variant="primary" href={'/suppliers/new' as Route}>
                Add supplier
              </ButtonLink>
            </>
          }
          search={
            <SupplierFilters
              tiers={TIERS.map((t) => ({ value: t, label: TIER_WORD[t] }))}
              types={SUPPLIER_TYPES.filter((t) => t !== 'unknown').map((t) => ({
                value: t,
                label: TYPE_WORD[t]!,
              }))}
              regions={Object.entries(REGIONS).map(([value, r]) => ({ value, label: r.label }))}
              trades={list.trades}
            />
          }
          filters={
            <span className="flex items-center gap-2">
              <span className="text-io-ink-3 text-[12px]">Saved views</span>
              <Choices
                aria-label="Saved views"
                value={currentView}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'proposed', label: 'Proposed' },
                  ...views.map((v) => ({ value: v.id, label: v.name })),
                ]}
                hrefFor={viewHref}
              />
              <SaveViewButton />
            </span>
          }
          summary={counts || undefined}
        />
      }
      preview={preview ? <SupplierPreview p={preview} /> : undefined}
      previewLabel="Supplier preview"
    >
      <div data-built="suppliers">
        <SupplierTable
          list={list}
          selected={sp.selected}
          selectedHref={(id) => keep({ selected: id })}
          nextHref={list.nextCursor ? keep({ cursor: list.nextCursor }) : null}
          firstHref={sp.cursor ? keep({}) : null}
          empty={
            sp.q ||
            sp.tier ||
            sp.type ||
            sp.region ||
            sp.trade ||
            sp.fast ||
            sp.never ||
            sp.view === 'proposed'
              ? {
                  title: 'No supplier matches',
                  text: 'Clear a filter, or search by another name, domain or part number.',
                }
              : {
                  title: 'No suppliers yet',
                  text: 'Import from Gmail history (setup) or add one. Research adds Contact-only suppliers.',
                }
          }
        />
      </div>
    </T1Index>
  )
}
