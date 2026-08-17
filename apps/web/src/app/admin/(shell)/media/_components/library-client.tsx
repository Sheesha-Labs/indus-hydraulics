'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { canTrash, deriveMediaState } from '@indus/domain'
import { ToastProvider, useToast } from '@indus/ui'

import { bulkTrashMedia } from '../actions'
import { MediaDetailDialog } from './detail-dialog'
import { MediaGrid, MediaList } from './media-items'
import { MediaBulkBar } from './row-actions'
import type { MediaDetail } from './types'

/**
 * Client shell for the library body.
 *
 * Owns the three things the server cannot: which file's detail panel is open,
 * the current selection, and the toast region. The filter chrome deliberately
 * stays server-rendered and link-driven — only the part that genuinely needs
 * state crosses the boundary.
 *
 * A page of rows is at most 48 small objects, so serialising them costs less
 * than a second round-trip would when the panel opens.
 */
export function MediaLibraryBody(props: {
  rows: MediaDetail[]
  view: 'grid' | 'list'
  canWrite: boolean
  canDestroy: boolean
  indexPartial: boolean
  trashed: boolean
}) {
  return (
    <ToastProvider>
      <Body {...props} />
    </ToastProvider>
  )
}

function Body({
  rows,
  view,
  canWrite,
  canDestroy,
  indexPartial,
  trashed,
}: {
  rows: MediaDetail[]
  view: 'grid' | 'list'
  canWrite: boolean
  canDestroy: boolean
  indexPartial: boolean
  trashed: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [openId, setOpenId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()

  // Resolved from the current rows rather than held in state, so a refresh
  // after a save shows the new values instead of the copy the dialog opened
  // with.
  const open = openId ? (rows.find((r) => r.id === openId) ?? null) : null

  // Which of the selection would actually be trashed. Computed here so the
  // bulk bar can say "3 will be skipped" before the click rather than after.
  const eligible = [...selected].filter((id) => {
    const row = rows.find((r) => r.id === id)
    if (!row) return false
    return canTrash({
      state: deriveMediaState(row.usages),
      indexPartial,
      usages: row.usages,
    }).allowed
  })

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function refresh() {
    setSelected(new Set())
    router.refresh()
  }

  function bulkTrash() {
    startTransition(async () => {
      const res = await bulkTrashMedia({ ids: eligible })
      if (!res.success) {
        toast({ title: 'Nothing was deleted.', description: res.message, tone: 'danger' })
        return
      }
      const { trashed: count, skipped } = res.data
      toast({
        title: `${count} ${count === 1 ? 'file' : 'files'} moved to trash.`,
        // Anything the server refused is named, so a bulk action never quietly
        // does less than it was asked to.
        description:
          skipped.length > 0
            ? `${skipped.length} skipped — became used since the page loaded.`
            : undefined,
        tone: skipped.length > 0 ? 'default' : 'success',
      })
      refresh()
    })
  }

  const rowProps = {
    rows,
    onOpen: setOpenId,
    indexPartial,
    canWrite,
    canDestroy,
    trashed,
    selected,
    onToggleSelect: toggle,
    onChanged: refresh,
  }

  return (
    <div className="flex flex-col gap-3">
      {canWrite && !trashed ? (
        <MediaBulkBar
          selectedCount={selected.size}
          eligibleCount={eligible.length}
          pending={pending}
          onClear={() => setSelected(new Set())}
          onTrash={bulkTrash}
        />
      ) : null}

      {view === 'list' ? <MediaList {...rowProps} /> : <MediaGrid {...rowProps} />}

      <MediaDetailDialog detail={open} canEdit={canWrite} onClose={() => setOpenId(null)} />
    </div>
  )
}
