'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, ArchiveRestore, Loader2, RotateCcw, Trash2 } from 'lucide-react'
import {
  deleteBlogPostPermanently,
  restoreBlogPost,
  setBlogPostArchived,
  trashBlogPost,
} from './actions'
import type { Result } from '../../../../lib/result'

type Props = {
  id: string
  title: string
  archived: boolean
  trashed: boolean
  /** Whether this staff role may destroy a trashed post for good. */
  canDestroy: boolean
}

/**
 * Per-row action cluster. Icon buttons rather than a menu: there are at most
 * two actions per row and a row of icons is one click, where a dropdown is
 * two plus a hover target the founder has to find.
 *
 * The error path renders inline next to the row instead of a toast — this
 * console has no toaster mounted, and an alert() for "Already archived" is
 * heavier than the mistake.
 */
export default function BlogRowActions({ id, title, archived, trashed, canDestroy }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function run(action: () => Promise<Result<{ message: string }>>) {
    setBusy(true)
    setError(null)
    startTransition(async () => {
      const result = await action()
      setBusy(false)
      if (result.success) router.refresh()
      else setError(result.message)
    })
  }

  if (busy) {
    return (
      <span className="flex justify-end">
        <Loader2 size={14} className="animate-spin text-ih-muted" aria-label="Working" />
      </span>
    )
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <span className="inline-flex items-center gap-1">
        {trashed ? (
          <>
            <IconButton label="Restore as draft" onClick={() => run(() => restoreBlogPost(id))}>
              <RotateCcw size={14} strokeWidth={1.7} />
            </IconButton>
            {canDestroy && (
              <IconButton
                label="Delete permanently"
                danger
                onClick={() => {
                  if (
                    !window.confirm(
                      `Permanently delete "${title}"? The post and its content are gone for good.`,
                    )
                  )
                    return
                  run(() => deleteBlogPostPermanently(id))
                }}
              >
                <Trash2 size={14} strokeWidth={1.7} />
              </IconButton>
            )}
          </>
        ) : (
          <>
            <IconButton
              label={archived ? 'Unarchive (back to draft)' : 'Archive'}
              onClick={() => run(() => setBlogPostArchived(id, !archived))}
            >
              {archived ? (
                <ArchiveRestore size={14} strokeWidth={1.7} />
              ) : (
                <Archive size={14} strokeWidth={1.7} />
              )}
            </IconButton>
            <IconButton label="Move to trash" danger onClick={() => run(() => trashBlogPost(id))}>
              <Trash2 size={14} strokeWidth={1.7} />
            </IconButton>
          </>
        )}
      </span>
      {error && <span className="text-right text-[11px] text-ih-danger">{error}</span>}
    </span>
  )
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-md text-ih-muted transition-colors ${
        danger
          ? 'hover:bg-ih-danger-soft hover:text-ih-danger'
          : 'hover:bg-ih-surface-2 hover:text-ih-ink'
      }`}
    >
      {children}
    </button>
  )
}
