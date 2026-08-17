'use client'

import { useState } from 'react'
import { ToastProvider } from '@indus/ui'

import { MediaDetailDialog } from './detail-dialog'
import { MediaGrid, MediaList } from './media-items'
import type { MediaDetail } from './types'

/**
 * Client shell for the library body.
 *
 * Exists to own three things the server cannot: which file's detail panel is
 * open, the toast region, and the click handlers on the cards. The filter
 * chrome deliberately stays server-rendered and link-driven — only the part
 * that genuinely needs state crosses the boundary.
 *
 * A page of rows is at most 48 small objects, so serialising them costs less
 * than a second round-trip would when the panel opens.
 */
export function MediaLibraryBody({
  rows,
  view,
  canEdit,
}: {
  rows: MediaDetail[]
  view: 'grid' | 'list'
  canEdit: boolean
}) {
  const [openId, setOpenId] = useState<string | null>(null)

  // Resolved from the current rows rather than held in state, so a router
  // refresh after a save shows the new values instead of the stale copy the
  // dialog was opened with.
  const open = openId ? (rows.find((r) => r.id === openId) ?? null) : null

  return (
    <ToastProvider>
      {view === 'list' ? (
        <MediaList rows={rows} onOpen={setOpenId} />
      ) : (
        <MediaGrid rows={rows} onOpen={setOpenId} />
      )}
      <MediaDetailDialog detail={open} canEdit={canEdit} onClose={() => setOpenId(null)} />
    </ToastProvider>
  )
}
