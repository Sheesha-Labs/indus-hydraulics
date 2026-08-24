'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Field, Input } from '@indus/ui'
import {
  ancestorPath,
  buildMoveOrdering,
  descendantIds,
  groupByParent,
  matchingWithAncestors,
} from '@indus/domain'

import CategoryTree from './CategoryTree'
import CategoryForm from './CategoryForm'
import {
  bulkMoveCategories,
  bulkSetPublished,
  deleteCategory,
  moveCategory,
} from './actions'
import type { Cat, TemplateOption } from './types'

interface Props {
  categories: Cat[]
  templates: TemplateOption[]
}

/**
 * Which branches are folded, remembered across navigations.
 *
 * 192 categories in one scroll is the thing that made the old page unusable, so
 * the default state matters: everything below the roots starts folded, and the
 * editor's own folding survives a save. Without persistence, every drag —
 * which triggers a `router.refresh()` — would spring the whole tree back open
 * and lose the reader's place.
 */
const COLLAPSE_STORAGE_KEY = 'indus.admin.categories.collapsed'

/*
 * Both accessors are wrapped, and not only against bad JSON.
 *
 * `window.localStorage` is absent or throws outright in more places than it
 * looks: Safari private browsing, an over-quota origin, embedded webviews with
 * storage disabled, and jsdom. An unguarded read or write there is a render
 * that throws, which takes the whole categories screen down to the error
 * boundary over a UI preference. Losing the fold state is the correct failure.
 */
function loadCollapsed(): Set<string> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage?.getItem(COLLAPSE_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === 'string')) : null
  } catch {
    return null
  }
}

function saveCollapsed(ids: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage?.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // Nothing to do and nothing worth telling the editor about.
  }
}

export default function CategoriesClient({ categories: serverCategories, templates }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  /**
   * The tree as drawn, which runs ahead of the server during a move.
   *
   * A drag has to land instantly or it reads as broken, but the write is a
   * round-trip. This holds the optimistic result; if the action fails it is
   * dropped and the row visibly snaps home, which is the correct feedback for
   * "that move was rejected".
   *
   * It is stamped with the `serverCategories` array it was derived FROM, and
   * expires by comparison during render rather than through an effect. A fresh
   * payload arrives with a new array identity, `base` stops matching, and the
   * optimistic rows are ignored on that same render — no second pass, and no
   * window in which the server's truth and the drawn tree disagree. Clearing it
   * from an effect instead left one render where a stale optimistic layer sat
   * on top of newer data, which is exactly when the next drag would compute its
   * indices against a tree that no longer exists.
   */
  const [optimistic, setOptimistic] = useState<{ base: Cat[]; rows: Cat[] } | null>(null)
  const categories = optimistic?.base === serverCategories ? optimistic.rows : serverCategories

  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const [collapseReady, setCollapseReady] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  /*
   * Adopt the saved fold once, after hydration.
   *
   * This has to be an effect, and it has to set state. `localStorage` does not
   * exist while the server renders, so reading it in a lazy `useState`
   * initialiser gives the server one tree and the client a different one — a
   * hydration mismatch whose symptom is React discarding the server HTML and
   * re-rendering the page. Rendering the deterministic default first and
   * adopting the preference afterwards is the pattern that avoids that, and one
   * extra render on mount is the price.
   *
   * `react-hooks/set-state-in-effect` is disabled for exactly that reason. The
   * rule is right about the general case — the other setState-in-effect on this
   * component was removed rather than silenced — but "read a client-only
   * preference after hydration" is the case it cannot express.
   */
  useEffect(() => {
    const stored = loadCollapsed()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(
      stored ?? new Set(serverCategories.filter((c) => c.parentId === null).map((c) => c.id)),
    )
    setCollapseReady(true)
    // Mount-only on purpose: re-running on every `serverCategories` change
    // would re-fold branches the editor just opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!collapseReady) return
    saveCollapsed(collapsed)
  }, [collapsed, collapseReady])

  /** Products per category including every descendant. */
  const rollup = useMemo(() => {
    const byParent = groupByParent(categories)
    const totals = new Map<string, number>()
    function total(id: string, seen: Set<string>): number {
      const cached = totals.get(id)
      if (cached !== undefined) return cached
      const self = categories.find((c) => c.id === id)?.productCount ?? 0
      let sum = self
      for (const child of byParent.get(id) ?? []) {
        if (seen.has(child.id)) continue
        sum += total(child.id, new Set([...seen, child.id]))
      }
      totals.set(id, sum)
      return sum
    }
    for (const c of categories) total(c.id, new Set([c.id]))
    return totals
  }, [categories])

  const visibleIds = useMemo(
    () => (query.trim() ? matchingWithAncestors(categories, query) : null),
    [categories, query],
  )

  // A search that keeps its matches folded away has found nothing useful, so
  // filtering forces every surviving branch open.
  const effectiveCollapsed = useMemo(
    () => (visibleIds ? new Set<string>() : collapsed),
    [visibleIds, collapsed],
  )

  const navGaps = useMemo(
    () => categories.filter((c) => c.isPublished && c.navItemCount === 0),
    [categories],
  )

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelected = useCallback(
    (id: string, withSubtree: boolean) => {
      setSelected((prev) => {
        const next = new Set(prev)
        // Shift-click takes the whole branch. Moving a parent without its
        // children is almost never the intent, and doing it one row at a time
        // through 44 grandchildren is the workflow this page exists to end.
        const ids = withSubtree ? [id, ...descendantIds(categories, id)] : [id]
        const turningOn = !next.has(id)
        for (const each of ids) {
          if (turningOn) next.add(each)
          else next.delete(each)
        }
        return next
      })
    },
    [categories],
  )

  const runMove = useCallback(
    (input: { id: string; newParentId: string | null; newIndex: number }) => {
      const ordering = buildMoveOrdering({
        nodes: categories,
        activeId: input.id,
        newParentId: input.newParentId,
        newIndex: input.newIndex,
      })
      if (ordering.length === 0) return

      const patch = new Map(ordering.map((row) => [row.id, row]))
      setOptimistic({
        base: serverCategories,
        rows: categories.map((c) => {
          const row = patch.get(c.id)
          return row ? { ...c, parentId: row.parentId, position: row.position } : c
        }),
      })
      setError(null)
      setNotice(null)

      startTransition(async () => {
        const result = await moveCategory(input)
        if (!result.success) {
          // Drop the optimistic layer: the row springs back to where the server
          // still has it, alongside the reason.
          setOptimistic(null)
          setError(result.message)
          return
        }
        // `router.refresh()` re-runs the server component and lands a fresh
        // payload, which clears `optimistic` through the effect above. Counts
        // and the megamenu-gap markers are server-derived, so they would
        // otherwise stay stale after a move.
        router.refresh()
      })
    },
    [categories, serverCategories, router],
  )

  function runBulkPublish(isPublished: boolean) {
    const ids = [...selected]
    if (ids.length === 0) return
    setError(null)
    startTransition(async () => {
      const result = await bulkSetPublished({ ids, isPublished })
      if (!result.success) {
        setError(result.message)
        return
      }
      setNotice(
        `${result.data.count} ${result.data.count === 1 ? 'category' : 'categories'} ${
          isPublished ? 'published' : 'unpublished'
        }.`,
      )
      setSelected(new Set())
      router.refresh()
    })
  }

  function runBulkMove(newParentId: string | null) {
    const ids = [...selected]
    if (ids.length === 0) return
    setError(null)
    startTransition(async () => {
      const result = await bulkMoveCategories({ ids, newParentId })
      if (!result.success) {
        setError(result.message)
        return
      }
      setNotice(
        result.data.count === 0
          ? 'Everything selected was already there.'
          : `${result.data.count} ${result.data.count === 1 ? 'category' : 'categories'} moved.`,
      )
      setSelected(new Set())
      router.refresh()
    })
  }

  function runBulkDelete() {
    const ids = [...selected]
    const blocked = ids.filter((id) => {
      const cat = categories.find((c) => c.id === id)
      return !cat || cat.childCount > 0 || cat.productCount > 0
    })
    if (blocked.length > 0) {
      setError(
        `${blocked.length} of the selected categories still have products or sub-categories and cannot be deleted.`,
      )
      return
    }
    if (!confirm(`Delete ${ids.length} categor${ids.length === 1 ? 'y' : 'ies'}?`)) return
    setError(null)
    startTransition(async () => {
      for (const id of ids) {
        const result = await deleteCategory(id)
        if (!result.success) {
          setError(result.message)
          router.refresh()
          return
        }
      }
      setNotice(`${ids.length} deleted.`)
      setSelected(new Set())
      router.refresh()
    })
  }

  const editing = editingId ? categories.find((c) => c.id === editingId) ?? null : null

  return (
    <div className="flex flex-col gap-4">
      {/* ─── toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Find a category" className="min-w-[240px] flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or slug…"
            className="h-9 w-full rounded-lg border border-ih-border bg-ih-surface px-3 text-[13px]"
          />
        </Field>

        <button
          type="button"
          onClick={() => setCollapsed(new Set())}
          className="h-9 rounded-lg border border-ih-border px-3 text-[12px] text-ih-ink-2 hover:bg-ih-surface-2"
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={() =>
            setCollapsed(new Set(categories.filter((c) => c.childCount > 0).map((c) => c.id)))
          }
          className="h-9 rounded-lg border border-ih-border px-3 text-[12px] text-ih-ink-2 hover:bg-ih-surface-2"
        >
          Collapse all
        </button>
        {!showCreate && (
          <button
            type="button"
            onClick={() => {
              setShowCreate(true)
              setEditingId(null)
            }}
            className="h-9 rounded-lg bg-ih-accent px-3 text-[13px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover"
          >
            + New category
          </button>
        )}
      </div>

      {/* ─── megamenu coverage ───────────────────────────────────────── */}
      {navGaps.length > 0 && (
        <p className="rounded-[6px] border border-ih-warning bg-ih-warning-soft px-3 py-2 text-[12px] text-ih-warning-ink">
          <b className="font-medium">
            {navGaps.length} live {navGaps.length === 1 ? 'category is' : 'categories are'} not in
            the megamenu.
          </b>{' '}
          They are indexable and reachable by URL, but nothing in the header links to them.
          Re-nesting a category here never moves it in the menu — the two trees are edited
          separately.{' '}
          <Link href="/admin/navigation" className="underline">
            Open the navigation editor
          </Link>
        </p>
      )}

      {showCreate && (
        <CategoryForm
          parents={categories}
          templates={templates}
          onDone={() => {
            setShowCreate(false)
            router.refresh()
          }}
        />
      )}

      {editing && (
        <CategoryForm
          parents={categories}
          templates={templates}
          existing={editing}
          onDone={() => {
            setEditingId(null)
            router.refresh()
          }}
        />
      )}

      {error && (
        <p className="rounded-[6px] border border-ih-danger bg-ih-danger-soft px-3 py-2 text-[12px] text-ih-danger-ink" role="alert">
          {error}
        </p>
      )}
      {notice && !error && (
        <p className="rounded-[6px] border border-ih-success bg-ih-success-soft px-3 py-2 text-[12px] text-ih-success-ink">
          {notice}
        </p>
      )}

      {/* ─── bulk bar ────────────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-[6px] border border-ih-border bg-ih-surface-2 px-3 py-2">
          <span className="font-mono text-[11.5px] text-ih-ink-2">{selected.size} selected</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulkPublish(true)}
            className="h-8 rounded-[4px] border border-ih-border bg-ih-surface px-2.5 text-[12px] hover:bg-ih-surface-3 disabled:opacity-50"
          >
            Publish
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulkPublish(false)}
            className="h-8 rounded-[4px] border border-ih-border bg-ih-surface px-2.5 text-[12px] hover:bg-ih-surface-3 disabled:opacity-50"
          >
            Unpublish
          </button>

          <label className="flex items-center gap-1.5 text-[12px] text-ih-ink-2">
            Move under
            <select
              disabled={pending}
              defaultValue=""
              onChange={(e) => {
                const value = e.target.value
                e.currentTarget.value = ''
                if (value === '') return
                runBulkMove(value === '__root__' ? null : value)
              }}
              className="h-8 rounded-[4px] border border-ih-border bg-ih-surface px-2 text-[12px]"
            >
              <option value="">Choose…</option>
              <option value="__root__">— Top level —</option>
              {categories
                .filter((c) => !selected.has(c.id))
                .map((c) => ({ cat: c, path: ancestorPath(categories, c.id) }))
                .sort((a, b) =>
                  a.path.map((p) => p.name).join(' › ').localeCompare(b.path.map((p) => p.name).join(' › ')),
                )
                .map(({ cat, path }) => (
                  <option key={cat.id} value={cat.id}>
                    {path.map((p) => p.name).join(' › ')}
                  </option>
                ))}
            </select>
          </label>

          <button
            type="button"
            disabled={pending}
            onClick={runBulkDelete}
            className="h-8 rounded-[4px] px-2.5 text-[12px] text-ih-muted hover:text-ih-danger-ink disabled:opacity-50"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto h-8 px-2 text-[12px] text-ih-muted hover:text-ih-ink"
          >
            Clear
          </button>
        </div>
      )}

      {query.trim() && (
        <p className="text-[11.5px] text-ih-muted">
          Dragging is off while a search is active — the rows around a drop target would not be
          the ones you can see.{' '}
          <button type="button" onClick={() => setQuery('')} className="underline">
            Clear the search
          </button>{' '}
          to rearrange.
        </p>
      )}

      <CategoryTree
        categories={categories}
        collapsed={effectiveCollapsed}
        onToggleCollapse={toggleCollapse}
        visibleIds={visibleIds}
        selectedIds={selected}
        onToggleSelected={toggleSelected}
        onMove={runMove}
        onEdit={(id) => {
          setEditingId(id)
          setShowCreate(false)
        }}
        editingId={editingId}
        rollup={rollup}
        dragDisabled={pending || !!query.trim()}
      />

      <p className="text-[11.5px] text-ih-muted">
        Drag a row up or down to reorder it, or sideways to nest it under the row above. Keyboard:
        tab to a handle, press space, then use the arrow keys and space again to drop. Moving a
        category never changes its web address — only renaming it does.
      </p>
    </div>
  )
}
