'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, TriangleAlert } from 'lucide-react'
import { Button, FormFooter } from '@indus/ui'
import {
  diffNavDraft,
  isEmptyDiff,
  NAV_SURFACES,
  type MenuLocation,
  type NavDraftItem,
} from '@indus/domain'
import AdminPageShell from '../AdminPageShell'
import NavTreeEditor, { useUnsavedGuard } from './NavTreeEditor'
import { saveMenuTree, setMenuPublished } from '../../../app/admin/(shell)/navigation/tree-actions'

/**
 * One navigation surface, end to end: the tree, its publish state, and one
 * Save.
 *
 * The Footer lives on its own screen because it is more than a menu — it also
 * owns the brand block, the contact block, the social row and the copyright
 * line. Everything that is *only* a menu comes through here.
 */
export default function NavMenuScreen({
  menu,
  location,
  initialItems,
  viewHref,
}: {
  menu: { id: string; slug: string; name: string; isPublished: boolean; publishedAt: string | null }
  location: MenuLocation
  initialItems: NavDraftItem[]
  /** Where on the storefront this surface can be seen. */
  viewHref: string
}) {
  const router = useRouter()
  const surface = NAV_SURFACES[location]
  const [items, setItems] = useState(initialItems)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const diff = useMemo(() => diffNavDraft(initialItems, items), [initialItems, items])
  const isDirty = !isEmptyDiff(diff)
  useUnsavedGuard(isDirty)

  function onSave() {
    setError(null)
    startTransition(async () => {
      const result = await saveMenuTree({ menuId: menu.id, items })
      if (!result.success) {
        setError(result.message)
        return
      }
      setSavedAt(new Date().toLocaleTimeString())
      // Re-read so every created row picks up its real id. Without this the
      // next save would send `id: null` for rows that now exist and create
      // them a second time.
      router.refresh()
    })
  }

  function onPublishToggle() {
    setError(null)
    startTransition(async () => {
      const result = await setMenuPublished(menu.id, !menu.isPublished)
      if (!result.success) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  const counts = summarise(items)

  return (
    <AdminPageShell
      title={surface.title}
      breadcrumbs={
        <>
          <Link href="/admin/navigation" className="hover:text-ih-ink">
            Content · Navigation
          </Link>
        </>
      }
      sub={surface.renders}
      actions={
        <>
          <Link
            href={viewHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-ih-muted hover:text-ih-ink"
          >
            View on site <ExternalLink size={12} />
          </Link>
          <Button
            type="button"
            size="dense"
            kind={menu.isPublished ? 'outline' : 'primary'}
            onClick={onPublishToggle}
            disabled={pending}
          >
            {menu.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {surface.notWired ? (
          <p className="flex items-start gap-2 rounded-md border border-ih-danger bg-ih-danger-soft px-4 py-3 text-[13px] text-ih-danger-ink">
            <TriangleAlert size={15} className="mt-[2px] shrink-0" />
            <span>{surface.notWired}</span>
          </p>
        ) : !menu.isPublished ? (
          <p className="rounded-md border border-ih-border bg-ih-bg px-4 py-3 text-[13px] text-ih-muted">
            This menu is a draft — nothing here is on the storefront yet. Publish it when you are
            ready.
          </p>
        ) : null}

        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ih-muted">
          {counts}
        </div>

        <section className="rounded-lg border border-ih-border bg-ih-surface p-6">
          <NavTreeEditor surface={surface} items={items} onChange={setItems} />
        </section>

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-ih-danger bg-ih-danger-soft px-4 py-3 text-[13px] text-ih-danger-ink"
          >
            {error}
          </p>
        ) : null}

        <FormFooter
          sticky
          status={
            pending
              ? 'Saving…'
              : isDirty
                ? describeDiff(diff)
                : savedAt
                  ? `Saved at ${savedAt}`
                  : 'No changes'
          }
        >
          <Button type="button" kind="primary" onClick={onSave} disabled={pending || !isDirty}>
            Save changes
          </Button>
        </FormFooter>
      </div>
    </AdminPageShell>
  )
}

/**
 * "3 added · 12 changed · 1 removed", rather than a bare "Unsaved changes".
 *
 * With one Save covering a whole megamenu, the count is the only thing telling
 * an editor whether they are about to write the two renames they meant or the
 * two hundred rows a mis-drag moved.
 */
function describeDiff(diff: ReturnType<typeof diffNavDraft>): string {
  const parts: string[] = []
  if (diff.created.length) parts.push(`${diff.created.length} added`)
  if (diff.updated.length) parts.push(`${diff.updated.length} changed`)
  if (diff.deletedIds.length) parts.push(`${diff.deletedIds.length} removed`)
  return parts.length ? `Unsaved — ${parts.join(' · ')}` : 'Unsaved changes'
}

function summarise(items: NavDraftItem[]): string {
  const roots = items.filter((i) => i.parentUid === null).length
  const hidden = items.filter((i) => !i.isVisible).length
  const parts = [`${items.length} ${items.length === 1 ? 'item' : 'items'}`, `${roots} top level`]
  if (hidden > 0) parts.push(`${hidden} hidden`)
  return parts.join(' · ')
}
