import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { db } from '@indus/db'
import {
  deriveMediaState,
  formatBytes,
  MEDIA_FOLDER_ORDER,
  MEDIA_SORT_LABELS,
  mediaFolderFor,
  parseMediaSort,
  selectMediaPage,
  type MediaFolder,
  type MediaListItem,
  type MediaSort,
  type MediaState,
} from '@indus/domain'
import { Pagination } from '@indus/ui'

import AdminPageShell from '../../../../components/admin/AdminPageShell'
import { ADMIN_PREFIX } from '../../../../lib/admin-paths'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, hasRole } from '../../../../lib/rbac'
import { buildMediaUsageIndexFromDb } from '../../../../lib/queries/media-usage'
import {
  FolderRail,
  KindChips,
  StateTabs,
  ViewToggle,
  type MediaViewMode,
} from './_components/filters'
import { MediaLibraryBody } from './_components/library-client'
import { MediaEmptyState } from './_components/media-items'
import type { MediaDetail } from './_components/types'
import { MediaSearchBox, MediaSortSelect } from './_components/search-sort'
import { MediaUploadPanel } from './_components/upload'

export const metadata: Metadata = { title: 'Media library — Indus Admin' }

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<{
    q?: string
    kind?: string
    state?: string
    folder?: string
    sort?: string
    view?: string
    page?: string
    trash?: string
  }>
}

const KINDS = new Set(['image', 'document', 'cad'])
const STATES = new Set(['live', 'attached', 'internal', 'unused'])

export default async function MediaLibraryPage({ params, searchParams }: Props) {
  await params
  const sp = await searchParams

  const trashed = sp.trash === '1'
  const query = (sp.q ?? '').trim()
  // Every searchParam is narrowed against a known set before it reaches a
  // query. The page this replaces cast `?kind=` straight into a Prisma enum
  // filter, so `?kind=garbage` threw a raw Prisma error into error.tsx.
  const kind = sp.kind && KINDS.has(sp.kind) ? (sp.kind as 'image' | 'document' | 'cad') : 'all'
  const state = sp.state && STATES.has(sp.state) ? (sp.state as MediaState) : 'all'
  const folder =
    sp.folder && (MEDIA_FOLDER_ORDER as readonly string[]).includes(sp.folder)
      ? (sp.folder as MediaFolder)
      : 'all'
  const sort = parseMediaSort(sp.sort)
  const view: MediaViewMode = sp.view === 'list' ? 'list' : 'grid'
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)

  // Both scopes are loaded because the rail shows a live Trash count while you
  // are outside it, and vice versa.
  const [rows, trashCount, session] = await Promise.all([
    db.media.findMany({
      where: trashed ? { deletedAt: { not: null } } : { deletedAt: null },
      select: {
        id: true,
        originalFilename: true,
        alt: true,
        caption: true,
        kind: true,
        bytes: true,
        createdAt: true,
        storagePath: true,
        mimeType: true,
        width: true,
        height: true,
        uploadedBy: { select: { name: true, email: true } },
      },
    }),
    db.media.count({ where: { deletedAt: { not: null } } }),
    auth(),
  ])
  // hasRole, not requireRole — a sales_rep should still be able to browse the
  // library and see where a file is used; they just cannot edit it.
  const canWrite = hasRole(session, ROLES.CATALOGUE_WRITE)
  // Permanent delete is the strictest tier — the only irreversible action on
  // this screen.
  const canDestroy = hasRole(session, ROLES.CATALOGUE_DELETE)

  // Usage is resolved for every row in scope, not just the page being shown:
  // the folder rail and the state tabs both count the whole library.
  const assets = rows.map((r) => ({ id: r.id, storagePath: r.storagePath }))
  const usageIndex = await buildMediaUsageIndexFromDb(assets)

  const decorated = rows.map((r) => {
    const usages = usageIndex.byAsset.get(r.id) ?? []
    const { uploadedBy, createdAt, ...rest } = r
    const detail: MediaDetail = {
      ...rest,
      createdAt,
      // Formatted server-side so the list and the dialog can never disagree
      // about a date, and so no locale-dependent string is produced during
      // hydration.
      createdAtLabel: createdAt.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      // Flattened to a name: serialising the staff row would put an internal
      // email address into the page for every asset.
      uploadedByName: uploadedBy?.name ?? uploadedBy?.email ?? null,
      state: deriveMediaState(usages),
      usages,
    }
    return {
      // `item` is what the list logic filters and sorts on; the row itself
      // carries everything the dialog needs.
      item: detail as MediaListItem,
      ...detail,
      usages,
      folder: mediaFolderFor({ mediaKind: r.kind, usages }),
    }
  })

  // Counts are of the whole scope, so they do not move as you filter — a rail
  // whose numbers changed on every click would be unusable for finding things.
  const folderCounts: Partial<Record<MediaFolder, number>> = {}
  const stateCounts: Record<MediaState | 'all', number> = {
    all: decorated.length,
    live: 0,
    attached: 0,
    internal: 0,
    unused: 0,
  }
  const kindCounts: Record<string, number> = { all: decorated.length, image: 0, document: 0, cad: 0 }
  let totalBytes = 0
  let reclaimableBytes = 0
  // A row whose size could not be measured still holds 0, and the total is
  // then a floor — saying so is better than quietly under-reporting it. The
  // 322 rows that were in that state were backfilled on 2026-08-17, so this
  // should now be 0 in practice; it is kept because a future measurement can
  // still fail. See packages/db/src/scripts/backfill-media-bytes.ts.
  //
  // Caveat on the two totals below: `bytes` is the file's size, which for an
  // externally-hosted datasheet is a vendor's file on a vendor's server. Those
  // rows count towards `totalBytes` and, when unused, `reclaimableBytes`, but
  // deleting them frees nothing of ours. Excluding them is a product decision
  // that has not been taken.
  let unknownSizeCount = 0

  for (const d of decorated) {
    folderCounts[d.folder] = (folderCounts[d.folder] ?? 0) + 1
    stateCounts[d.state]++
    kindCounts[d.item.kind] = (kindCounts[d.item.kind] ?? 0) + 1
    totalBytes += d.item.bytes
    if (d.item.bytes === 0) unknownSizeCount++
    if (d.state === 'unused') reclaimableBytes += d.item.bytes
  }

  const selected = selectMediaPage(decorated, {
    filters: { query, kind, state, folder, trashed },
    sort,
    page,
  })

  function buildUrl(overrides: Record<string, string | undefined>): string {
    const base: Record<string, string | undefined> = {
      q: query || undefined,
      kind: kind === 'all' ? undefined : kind,
      state: state === 'all' ? undefined : state,
      folder: folder === 'all' ? undefined : folder,
      sort: sort === 'newest' ? undefined : sort,
      view: view === 'grid' ? undefined : view,
      page: selected.page === 1 ? undefined : String(selected.page),
      trash: trashed ? '1' : undefined,
    }
    const qp = new URLSearchParams()
    for (const [k, v] of Object.entries({ ...base, ...overrides })) if (v) qp.set(k, v)
    const qs = qp.toString()
    return `${ADMIN_PREFIX}/media${qs ? `?${qs}` : ''}`
  }

  // selectMediaPage is generic over the row, so everything added above
  // survives the filter/sort/page pass.
  const visible: MediaDetail[] = selected.visible

  // Precomputed here because MediaSortSelect is a Client Component: a
  // `buildUrl` function cannot cross the RSC boundary.
  const sortOptions = (Object.keys(MEDIA_SORT_LABELS) as MediaSort[]).map((s) => ({
    value: s,
    label: MEDIA_SORT_LABELS[s],
    href: buildUrl({ sort: s === 'newest' ? undefined : s, page: undefined }),
  }))

  const isFiltered = Boolean(query) || kind !== 'all' || state !== 'all' || folder !== 'all'

  return (
    <AdminPageShell
      title={trashed ? 'Media library — Trash' : 'Media library'}
      sub={
        selected.total === 0
          ? 'No files'
          : `Showing ${selected.from.toLocaleString()}–${selected.to.toLocaleString()} of ${selected.total.toLocaleString()}`
      }
    >
      <div className="flex items-start gap-6">
        <FolderRail
          counts={folderCounts}
          active={folder}
          total={decorated.length}
          trashCount={trashCount}
          trashed={trashed}
          buildUrl={buildUrl}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <MediaSearchBox
              action={`${ADMIN_PREFIX}/media`}
              defaultValue={query}
              hidden={hiddenFilters({ kind, state, folder, sort, view, trashed })}
            />
            {trashed ? null : (
              <StateTabs counts={stateCounts} active={state} buildUrl={buildUrl} />
            )}
            <div className="ml-auto flex items-center gap-3">
              <MediaSortSelect value={sort} options={sortOptions} />
              <ViewToggle active={view} buildUrl={buildUrl} />
            </div>
          </div>

          <KindChips active={kind} counts={kindCounts} buildUrl={buildUrl} />

          {canWrite && !trashed ? <MediaUploadPanel /> : null}

          {usageIndex.partial ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md border border-ih-warning bg-ih-warning-soft px-3 py-2 text-[12.5px] text-[oklch(0.42_0.1_62)]"
            >
              <AlertTriangle size={13} strokeWidth={1.9} aria-hidden="true" className="mt-0.5 flex-shrink-0" />
              <span>
                Usage couldn&apos;t be read from{' '}
                <span className="font-mono">{usageIndex.failedSources.join(', ')}</span>. Files may
                look unused when they are not, so deleting stays disabled until this loads cleanly.
              </span>
            </p>
          ) : null}

          <p className="text-[12.5px] text-ih-muted">
            <span className="font-mono tabular-nums">{selected.total.toLocaleString()}</span> of{' '}
            <span className="font-mono tabular-nums">{decorated.length.toLocaleString()}</span> files
            {trashed ? ' in trash' : ''} ·{' '}
            <span className="font-mono tabular-nums">{formatBytes(totalBytes)}</span>
            {!trashed && reclaimableBytes > 0 ? (
              <>
                {' · '}
                <span className="font-mono tabular-nums">{formatBytes(reclaimableBytes)}</span>{' '}
                reclaimable
              </>
            ) : null}
            {unknownSizeCount > 0 ? (
              <>
                {' · '}
                <span title="These were uploaded without their size being recorded, so the total above is a floor.">
                  <span className="font-mono tabular-nums">{unknownSizeCount.toLocaleString()}</span>{' '}
                  of unknown size
                </span>
              </>
            ) : null}
          </p>

          {visible.length === 0 ? (
            <MediaEmptyState
              trashed={trashed}
              filtered={isFiltered}
              resetHref={`${ADMIN_PREFIX}/media${trashed ? '?trash=1' : ''}`}
            />
          ) : (
            <MediaLibraryBody
              rows={visible}
              view={view}
              canWrite={canWrite}
              canDestroy={canDestroy}
              indexPartial={usageIndex.partial}
              trashed={trashed}
            />
          )}

          <Pagination
            currentPage={selected.page}
            totalPages={selected.totalPages}
            buildUrl={(n) => buildUrl({ page: n === 1 ? undefined : String(n) })}
            linkComponent={Link}
          />
        </div>
      </div>
    </AdminPageShell>
  )
}

/** The filters the search form has to carry through its GET submit. */
function hiddenFilters(active: {
  kind: string
  state: string
  folder: string
  sort: string
  view: string
  trashed: boolean
}): Record<string, string> {
  const out: Record<string, string> = {}
  if (active.kind !== 'all') out.kind = active.kind
  if (active.state !== 'all') out.state = active.state
  if (active.folder !== 'all') out.folder = active.folder
  if (active.sort !== 'newest') out.sort = active.sort
  if (active.view !== 'grid') out.view = active.view
  if (active.trashed) out.trash = '1'
  return out
}
