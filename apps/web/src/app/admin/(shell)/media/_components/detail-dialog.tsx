'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import {
  formatBytesOrUnknown,
  MEDIA_USAGE_KIND_LABELS,
  mediaThumbnailSrc,
  sortUsages,
  summariseUsage,
  type MediaUsage,
} from '@indus/domain'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  Textarea,
  cn,
  useToast,
} from '@indus/ui'

import { updateMediaMeta } from '../actions'
import type { MediaDetail } from './types'

/**
 * The detail panel: everywhere a file is used, and the two fields worth
 * editing from here.
 *
 * Bazar's equivalent is read-only, which is why every asset in that system has
 * empty alt text — the only place to write it is inside a listing editor, so
 * nobody ever does. Alt text is a live accessibility and SEO signal, and the
 * media library is the one screen where someone is looking at a picture and
 * thinking about what it shows. Editing belongs here.
 */

export function MediaDetailDialog({
  detail,
  canEdit,
  onClose,
}: {
  detail: MediaDetail | null
  canEdit: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={detail !== null} onOpenChange={(open) => !open && onClose()}>
      {detail ? (
        // Remounts per file — otherwise the form state of the previously
        // opened file would persist into the next one.
        <DetailBody key={detail.id} detail={detail} canEdit={canEdit} onClose={onClose} />
      ) : null}
    </Dialog>
  )
}

function DetailBody({
  detail,
  canEdit,
  onClose,
}: {
  detail: MediaDetail
  canEdit: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()

  const [alt, setAlt] = useState(detail.alt ?? '')
  const [caption, setCaption] = useState(detail.caption ?? '')
  const [error, setError] = useState<string | null>(null)

  const dirty = alt !== (detail.alt ?? '') || caption !== (detail.caption ?? '')
  const usages = sortUsages(detail.usages)
  const thumb = mediaThumbnailSrc(detail)

  // Warn before losing an edit to a stray Escape or backdrop click. Radix hands
  // us the close intent, so this stays inside the component rather than
  // fighting the dialog for control of it.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  function save() {
    setError(null)
    startTransition(async () => {
      const res = await updateMediaMeta({ id: detail.id, alt, caption })
      if (!res.success) {
        // Field errors are more useful next to the control than in a toast.
        const first = res.fieldErrors ? Object.values(res.fieldErrors)[0]?.[0] : undefined
        setError(first ?? res.message)
        toast({ title: 'Could not save.', description: res.message, tone: 'danger' })
        return
      }
      toast({ title: 'Saved.', tone: 'success' })
      router.refresh()
      onClose()
    })
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="truncate" title={detail.originalFilename}>
          {detail.originalFilename}
        </DialogTitle>
        <DialogDescription>{summariseUsage(usages)}</DialogDescription>
      </DialogHeader>

      <DialogBody className="flex max-h-[62vh] flex-col gap-5 overflow-y-auto">
        <div className="flex gap-4">
          <div className="border-ih-border bg-ih-surface-2 h-28 w-36 flex-shrink-0 overflow-hidden rounded-md border">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt={detail.alt ?? ''} className="h-full w-full object-cover" />
            ) : (
              <span className="text-ih-muted-2 grid h-full w-full place-items-center text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
                {detail.kind}
              </span>
            )}
          </div>
          {/* content-start: the dl stretches to the thumbnail height as a flex child,
              and a grid defaults to align-content:stretch, which spread the rows apart. */}
          <dl className="grid min-w-0 flex-1 grid-cols-2 content-start gap-x-4 gap-y-2 text-[12px]">
            <Meta label="Type" value={detail.mimeType} mono />
            <Meta
              label="Size"
              value={formatBytesOrUnknown(detail.bytes)}
              mono
              hint={detail.bytes > 0 ? undefined : 'Not recorded at upload'}
            />
            <Meta
              label="Dimensions"
              value={detail.width && detail.height ? `${detail.width} × ${detail.height}` : '—'}
              mono
            />
            <Meta label="Uploaded" value={detail.createdAtLabel} mono />
            <Meta label="By" value={detail.uploadedByName ?? '—'} />
          </dl>
        </div>

        {/* ── Editable fields ─────────────────────────────────────────── */}
        <div className="border-ih-border flex flex-col gap-3 border-t pt-4">
          <Field
            label="Alt text"
            hint="Describes the image for screen readers and search engines. Leave blank only if it is purely decorative."
            error={error ?? undefined}
          >
            <Input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              disabled={!canEdit || pending}
              placeholder="Brass hydraulic hose fitting, 3/8 inch"
              maxLength={300}
            />
          </Field>
          <Field
            label="Caption"
            hint="Optional. Shown under the image where a surface supports it."
          >
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={!canEdit || pending}
              rows={2}
              maxLength={500}
            />
          </Field>
          {!canEdit ? (
            <p className="text-ih-muted text-[12px]">
              Your role can view the library but not edit file details.
            </p>
          ) : null}
        </div>

        {/* ── Usage list ──────────────────────────────────────────────── */}
        <div className="border-ih-border flex flex-col gap-2 border-t pt-4">
          <h3 className="text-ih-muted text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
            Where this is used
          </h3>
          {usages.length === 0 ? (
            <p className="text-ih-ink-2 text-[13px]">
              No record references this file. It can safely be deleted.
            </p>
          ) : (
            <ul className="divide-ih-border divide-y text-[13px]">
              {usages.map((u, i) => (
                <UsageRow key={`${u.kind}-${u.id}-${u.role}-${i}`} usage={u} />
              ))}
            </ul>
          )}
        </div>
      </DialogBody>

      <DialogFooter>
        <Button kind="ghost" size="sm" onClick={onClose} disabled={pending}>
          {dirty ? 'Discard' : 'Close'}
        </Button>
        {canEdit ? (
          <Button kind="primary" size="sm" onClick={save} loading={pending} disabled={!dirty}>
            Save changes
          </Button>
        ) : null}
      </DialogFooter>
    </DialogContent>
  )
}

function UsageRow({ usage }: { usage: MediaUsage }) {
  return (
    <li className="flex items-center gap-3 py-2">
      {/* Fixed-width mono eyebrow. That column is what makes a mixed list of
          products, blog posts and RFQs scannable rather than a wall of text. */}
      <span className="text-ih-muted w-24 flex-shrink-0 text-[10.5px] tracking-[0.09em] uppercase tabular-nums">
        {MEDIA_USAGE_KIND_LABELS[usage.kind].one}
      </span>
      <span className="min-w-0 flex-1 truncate" title={usage.label}>
        {usage.href ? (
          <Link
            href={usage.href}
            className="text-ih-ink-2 hover:text-ih-accent inline-flex items-center gap-1 transition-colors"
          >
            <span className="truncate">{usage.label}</span>
            <ExternalLink
              size={10}
              strokeWidth={1.8}
              aria-hidden="true"
              className="flex-shrink-0"
            />
          </Link>
        ) : (
          // ServiceCase, BlogCategory and BlogAuthor have no admin editor, so
          // there is nowhere honest to send the user.
          <span className="text-ih-ink-2">{usage.label}</span>
        )}
      </span>
      <span className="text-ih-muted flex-shrink-0 text-[11.5px]">{usage.role}</span>
      <span
        className={cn(
          'inline-flex h-5 flex-shrink-0 items-center rounded-full px-1.5 text-[10.5px]',
          usage.live
            ? 'bg-ih-success-soft text-[oklch(0.38_0.09_150)]'
            : 'bg-ih-surface-2 text-ih-muted'
        )}
      >
        {usage.live ? 'Live' : usage.internal ? 'Internal' : 'Not live'}
      </span>
    </li>
  )
}

function Meta({
  label,
  value,
  mono = false,
  hint,
}: {
  label: string
  value: string
  mono?: boolean
  hint?: string
}) {
  return (
    <div className="min-w-0">
      <dt className="text-ih-muted text-[10.5px] tracking-[0.09em] uppercase tabular-nums">
        {label}
      </dt>
      <dd
        className={cn('text-ih-ink-2 truncate', mono && 'text-[11.5px] tabular-nums')}
        title={hint}
      >
        {value}
      </dd>
    </div>
  )
}
