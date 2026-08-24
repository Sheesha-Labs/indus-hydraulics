'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StatusPill } from '@indus/ui'
import {
  MAX_CATEGORY_DEPTH,
  descendantIds,
  flattenTree,
  projectDrop,
  siblingIndexForDrop,
  type FlatCategory,
  type Projection,
} from '@indus/domain'

import type { Cat } from './types'

/**
 * One indent step, in pixels, and the width of one depth rung when dragging
 * sideways.
 *
 * The projection maths divides the horizontal drag delta by this, so the value
 * has to exist in JS. Tailwind cannot read a constant, so the rendered spacer
 * repeats it as `w-[26px]` in `IndentSpacer` — the one place it is duplicated.
 * Change both together: if the rendered rung is wider than the value the
 * projection divides by, a one-rung sideways drag reads as less than one level
 * and nesting starts to feel like it is ignoring you.
 */
const INDENT_PX = 26

export interface CategoryTreeProps {
  categories: Cat[]
  collapsed: ReadonlySet<string>
  onToggleCollapse: (id: string) => void
  /** Ids to show. Everything else is filtered out by the search box. */
  visibleIds: ReadonlySet<string> | null
  selectedIds: ReadonlySet<string>
  onToggleSelected: (id: string, shiftKey: boolean) => void
  onMove: (input: { id: string; newParentId: string | null; newIndex: number }) => void
  onEdit: (id: string) => void
  editingId: string | null
  /** Rolled-up product count per category, including descendants. */
  rollup: Map<string, number>
  /** Drag is disabled while a filter is active or a save is in flight. */
  dragDisabled: boolean
}

export default function CategoryTree({
  categories,
  collapsed,
  onToggleCollapse,
  visibleIds,
  selectedIds,
  onToggleSelected,
  onMove,
  onEdit,
  editingId,
  rollup,
  dragDisabled,
}: CategoryTreeProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [projection, setProjection] = useState<Projection | null>(null)

  const flat = useMemo(() => flattenTree(categories, collapsed), [categories, collapsed])

  /*
   * Filtering hides rows but must not renumber them.
   *
   * `flattenTree` runs against the full set first and the filter is applied
   * afterwards, so a visible row keeps the depth it has in the real tree. Doing
   * it the other way — flattening a filtered array — produces depths computed
   * against parents that are no longer present, and the indent then describes a
   * tree that does not exist. Drag is disabled while filtering for the same
   * reason: the neighbour rows the projection reads would be the wrong ones.
   */
  const rows = useMemo(
    () => (visibleIds ? flat.filter((r) => visibleIds.has(r.node.id)) : flat),
    [flat, visibleIds],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 4px, matching the navigation editor. Below this a click on the row's
      // own buttons registers as a drag.
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeRow = activeId ? flat.find((r) => r.node.id === activeId) ?? null : null

  /** Rows travelling with the drag — hidden from the list while it is in flight. */
  const draggingIds = useMemo(
    () => (activeId ? new Set([activeId, ...descendantIds(categories, activeId)]) : new Set<string>()),
    [activeId, categories],
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
    setProjection(null)
  }

  function handleDragMove(event: DragMoveEvent) {
    const id = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null
    if (!overId) {
      setProjection(null)
      return
    }
    setProjection(
      projectDrop({
        items: flat,
        nodes: categories,
        activeId: id,
        overId,
        offsetX: event.delta.x,
        indentWidth: INDENT_PX,
      }),
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const id = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null
    const landed = projection

    setActiveId(null)
    setProjection(null)

    if (!overId || !landed) return

    const newIndex = siblingIndexForDrop({
      items: flat,
      activeId: id,
      overId,
      parentId: landed.parentId,
    })
    onMove({ id, newParentId: landed.parentId, newIndex })
  }

  function handleDragCancel() {
    setActiveId(null)
    setProjection(null)
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-ih-border py-14 text-center text-[13px] text-ih-muted">
        {visibleIds ? 'No categories match that search.' : 'No categories yet.'}
      </p>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={rows.map((r) => r.node.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          role="tree"
          aria-label="Category tree"
          className="overflow-hidden rounded-[10px] border border-ih-border"
        >
          {rows.map((row) => (
            <CategoryRow
              key={row.node.id}
              row={row}
              depth={
                // While dragging, the hovered row shows the depth it WOULD
                // land at, so the indent itself is the drop preview. Without
                // this the only feedback for a sideways drag is the cursor.
                row.node.id === activeId && projection ? projection.depth : row.depth
              }
              isDragging={draggingIds.has(row.node.id)}
              isSelected={selectedIds.has(row.node.id)}
              isEditing={editingId === row.node.id}
              collapsed={collapsed.has(row.node.id)}
              onToggleCollapse={onToggleCollapse}
              onToggleSelected={onToggleSelected}
              onEdit={onEdit}
              rolledUp={rollup.get(row.node.id) ?? 0}
              dragDisabled={dragDisabled}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeRow ? (
          <div className="flex items-center gap-2 rounded-[6px] border border-ih-accent bg-ih-surface px-3 py-2 text-[13px] font-medium text-ih-ink shadow-lg">
            <span aria-hidden="true" className="font-mono text-[11px] text-ih-muted-2">
              ⠿
            </span>
            {activeRow.node.name}
            {activeRow.hasChildren && (
              <span className="font-mono text-[11px] text-ih-muted">
                +{descendantIds(categories, activeRow.node.id).length}
              </span>
            )}
            {projection && (
              <span className="font-mono text-[11px] text-ih-accent">
                → level {projection.depth + 1}
                {projection.depth >= MAX_CATEGORY_DEPTH ? ' (max)' : ''}
              </span>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function CategoryRow({
  row,
  depth,
  isDragging,
  isSelected,
  isEditing,
  collapsed,
  onToggleCollapse,
  onToggleSelected,
  onEdit,
  rolledUp,
  dragDisabled,
}: {
  row: FlatCategory<Cat>
  depth: number
  isDragging: boolean
  isSelected: boolean
  isEditing: boolean
  collapsed: boolean
  onToggleCollapse: (id: string) => void
  onToggleSelected: (id: string, shiftKey: boolean) => void
  onEdit: (id: string) => void
  rolledUp: number
  dragDisabled: boolean
}) {
  const cat = row.node
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSelfDragging,
  } = useSortable({ id: cat.id, disabled: dragDisabled })

  // `transform` is the only inline style in this file and it cannot be a class:
  // it is a per-frame pixel offset produced by the drag. CLAUDE.md §2.1 bans
  // `style=` precisely because Tailwind cannot express runtime values — which
  // is the same reason this one is unavoidable. @dnd-kit owns it.
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  // A published category the megamenu never links to is live and indexable but
  // unreachable by clicking. That is worth a marker on the row, not just a
  // number in a summary strip.
  const orphanedFromNav = cat.isPublished && cat.navItemCount === 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="treeitem"
      // The name as data, so a test (or anything scanning the DOM) can key off
      // it without scraping a cell that also carries the "N inside" badge.
      data-category-name={cat.name}
      aria-level={depth + 1}
      aria-selected={isSelected}
      aria-expanded={row.hasChildren ? !collapsed : undefined}
      className={[
        'flex items-center gap-2 border-b border-ih-border px-3 py-2 last:border-b-0',
        isSelfDragging ? 'opacity-40' : '',
        isDragging && !isSelfDragging ? 'opacity-40' : '',
        isSelected ? 'bg-ih-accent-soft' : 'bg-ih-surface hover:bg-ih-surface-2',
        isEditing ? 'bg-ih-surface-2' : '',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={isSelected}
        aria-label={`Select ${cat.name}`}
        onChange={(e) =>
          onToggleSelected(cat.id, (e.nativeEvent as MouseEvent).shiftKey ?? false)
        }
        className="h-3.5 w-3.5 shrink-0 rounded-[3px] border border-ih-border-strong"
      />

      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={dragDisabled}
        aria-label={`Reorder ${cat.name}`}
        title={
          dragDisabled
            ? 'Clear the search to rearrange categories'
            : 'Drag to reorder · drag sideways to re-nest'
        }
        className="shrink-0 cursor-grab px-1 font-mono text-[12px] text-ih-muted-2 hover:text-ih-ink disabled:cursor-not-allowed disabled:opacity-30"
      >
        ⠿
      </button>

      {/*
        Indent as a sized spacer rather than a padding class.
        The old table indented with a `pl-*` map on the label, which collided
        with TableCell's `first:pl-4` and rendered 161 child categories flush
        with their parents — a flat tree that type-checked and built clean. A
        spacer element cannot be overridden by a competing variant.
      */}
      <span aria-hidden="true" className="shrink-0" data-indent-depth={depth}>
        <IndentSpacer depth={depth} />
      </span>

      {row.hasChildren ? (
        <button
          type="button"
          onClick={() => onToggleCollapse(cat.id)}
          aria-label={collapsed ? `Expand ${cat.name}` : `Collapse ${cat.name}`}
          className="h-5 w-5 shrink-0 rounded-[4px] font-mono text-[10px] text-ih-muted hover:bg-ih-surface-2 hover:text-ih-ink"
        >
          {collapsed ? '▸' : '▾'}
        </button>
      ) : (
        <span aria-hidden="true" className="h-5 w-5 shrink-0" />
      )}

      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ih-ink">
        {cat.name}
        {row.hasChildren && collapsed && (
          <span className="ml-2 font-mono text-[11px] font-normal text-ih-muted-2">
            {cat.childCount} inside
          </span>
        )}
      </span>

      <span className="hidden w-[190px] shrink-0 truncate font-mono text-[11px] text-ih-muted lg:block">
        {cat.slug}
      </span>

      <span
        className="w-[86px] shrink-0 text-right font-mono text-[11px] text-ih-ink-2"
        title={`${cat.productCount} directly in this category, ${rolledUp} including sub-categories`}
      >
        {cat.productCount}
        {rolledUp > cat.productCount && (
          <span className="text-ih-muted-2"> / {rolledUp}</span>
        )}
      </span>

      <span className="w-[92px] shrink-0 text-center">
        <StatusPill tone={cat.isPublished ? 'good' : 'muted'}>
          {cat.isPublished ? 'Live' : 'Draft'}
        </StatusPill>
      </span>

      <span className="w-[76px] shrink-0 text-center">
        {orphanedFromNav ? (
          <Link
            href="/admin/navigation"
            title="Live, but no megamenu item links to it — customers cannot click through to this category"
            className="font-mono text-[10.5px] text-ih-warning-ink hover:underline"
          >
            no menu
          </Link>
        ) : (
          <span aria-hidden="true" className="font-mono text-[11px] text-ih-muted-2">
            —
          </span>
        )}
      </span>

      <span className="flex w-[150px] shrink-0 items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={() => onEdit(cat.id)}
          className="text-[12px] text-ih-muted hover:text-ih-ink"
        >
          Edit
        </button>
        <Link
          href={`/admin/categories/${cat.id}/edit`}
          className="text-[12px] text-ih-muted hover:text-ih-ink"
          title="SEO editor"
        >
          SEO
        </Link>
        <a
          href={`/c/${cat.slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-[12px] text-ih-muted hover:text-ih-ink"
          title="Open this category on the storefront"
        >
          View
        </a>
      </span>
    </div>
  )
}

/**
 * A fixed-width spacer per depth rung.
 *
 * Rendered as N stacked 26px blocks rather than one computed width, because a
 * computed width is either an inline style (banned) or a Tailwind class built
 * from a runtime value (produces no CSS). `MAX_CATEGORY_DEPTH` bounds the loop,
 * and the cap is enforced server-side, so this cannot run away.
 */
function IndentSpacer({ depth }: { depth: number }) {
  const rungs = Math.max(0, Math.min(depth, MAX_CATEGORY_DEPTH))
  if (rungs === 0) return null
  return (
    <span className="flex">
      {Array.from({ length: rungs }, (_, i) => (
        <span key={i} className="block w-[26px] border-l border-ih-border" />
      ))}
    </span>
  )
}
