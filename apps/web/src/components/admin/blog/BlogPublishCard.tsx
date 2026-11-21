'use client'

import { useState, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Archive, ArchiveRestore, CheckCircle2, ExternalLink, RotateCcw } from 'lucide-react'
import type { Result } from '../../../lib/result'
// Imported, never re-exported. Forwarding these from a `'use client'` module
// is how the list page came to call `displayStatus` across the RSC boundary.
import { STATUS_LABEL, STATUS_STYLE, type PublishStatus } from '../../../lib/blog-status'

type Props = {
  postId: string
  status: PublishStatus
  updatedAt: string
  publishedAt: string | null
  authorName: string | null
  categoryName: string | null
  readingMinutes: number | null
  publicUrl: string
  /** Set by the form after a successful save, shown as reassurance. */
  savedAt: string | null
  setPublished: (postId: string, published: boolean) => Promise<Result<{ message: string }>>
  setArchived: (postId: string, archived: boolean) => Promise<Result<{ message: string }>>
}

function fmt(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Status and the go-live controls, in the editor's right rail.
 *
 * Publish submits the content form rather than publishing on its own. The
 * server reads the row back to check a post has a title and a body before
 * putting it on the site, so publishing without saving first judges the
 * version on disk — an author who has just written the whole article and
 * presses Publish gets told the body is empty, and as far as the server is
 * concerned it is. Saving first is what makes the button mean what it says.
 */
export default function BlogPublishCard({
  postId,
  status,
  updatedAt,
  publishedAt,
  authorName,
  categoryName,
  readingMinutes,
  publicUrl,
  savedAt,
  setPublished,
  setArchived,
}: Props) {
  const router = useRouter()
  // The card renders inside the content form, so the save buttons are ordinary
  // submit buttons and this reports that form's own pending state. Reaching
  // for a `form="…"` association instead would break the moment the button
  // moved out of the form's DOM subtree — silently, with the click doing
  // nothing at all.
  const { pending: saving } = useFormStatus()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null)
  const busy = pending || saving

  function run(action: () => Promise<Result<{ message: string }>>) {
    setMessage(null)
    startTransition(async () => {
      const result = await action()
      if (result.success) {
        setMessage({ tone: 'success', text: result.data.message })
        router.refresh()
      } else {
        setMessage({ tone: 'danger', text: result.message })
      }
    })
  }

  return (
    <div className="border-ih-border bg-ih-surface flex flex-col gap-4 rounded-lg border p-5">
      <div className="text-ih-muted text-[10.5px] tracking-[0.13em] uppercase tabular-nums">
        Publish
      </div>

      <dl className="flex flex-col gap-2 text-[12.5px]">
        <Row label="Status">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ${STATUS_STYLE[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
        </Row>
        <Row label="Last edited">{savedAt ? `just now (${savedAt})` : fmt(updatedAt)}</Row>
        <Row label="Published">{fmt(publishedAt)}</Row>
        <Row label="Byline">{authorName ?? '—'}</Row>
        <Row label="Category">{categoryName ?? '—'}</Row>
        <Row label="Reading time">{readingMinutes ? `${readingMinutes} min` : '—'}</Row>
      </dl>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          name="publish"
          value="0"
          disabled={busy}
          className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 h-9 rounded-md border text-[13px] font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save draft'}
        </button>

        {status === 'published' ? (
          <>
            <button
              type="submit"
              name="publish"
              value="1"
              disabled={busy}
              className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover flex h-9 items-center justify-center gap-1.5 rounded-md text-[13px] font-medium transition-opacity disabled:opacity-50"
            >
              <CheckCircle2 size={14} strokeWidth={1.8} />
              Save &amp; update live post
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => setPublished(postId, false))}
              className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 flex h-9 items-center justify-center gap-1.5 rounded-md border text-[13px] font-medium transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} strokeWidth={1.8} />
              Revert to draft
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-ih-accent flex items-center justify-center gap-1 pt-0.5 text-center text-[11.5px] tabular-nums hover:underline"
            >
              View on the site
              <ExternalLink size={11} />
            </a>
          </>
        ) : (
          <button
            type="submit"
            name="publish"
            value="1"
            disabled={busy}
            className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover flex h-9 items-center justify-center gap-1.5 rounded-md text-[13px] font-medium transition-opacity disabled:opacity-50"
          >
            <CheckCircle2 size={14} strokeWidth={1.8} />
            Save &amp; publish
          </button>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => setArchived(postId, status !== 'archived'))}
          className="text-ih-muted hover:bg-ih-surface-2 hover:text-ih-ink flex h-9 items-center justify-center gap-1.5 rounded-md text-[13px] font-medium transition-colors disabled:opacity-50"
        >
          {status === 'archived' ? (
            <>
              <ArchiveRestore size={14} strokeWidth={1.8} />
              Unarchive
            </>
          ) : (
            <>
              <Archive size={14} strokeWidth={1.8} />
              Archive
            </>
          )}
        </button>
      </div>

      {message && (
        <p
          className={`text-[12px] ${
            message.tone === 'success' ? 'text-[color:var(--color-ih-success)]' : 'text-ih-danger'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ih-muted shrink-0">{label}</dt>
      <dd className="text-ih-ink-2 min-w-0 truncate text-right">{children}</dd>
    </div>
  )
}
