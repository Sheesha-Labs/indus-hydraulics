'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Settings2,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '@indus/ui'
import {
  collectSubtree,
  isBeyondRenderedDepth,
  MENU_LINK_TYPES,
  MENU_LINK_TYPE_LABELS,
  navLevelNoun,
  type MenuLinkType,
  type NavDraftItem,
  type NavSurface,
} from '@indus/domain'
import LinkTargetPicker, { type PickerTarget } from './LinkTargetPicker'

/**
 * One editor for every navigation surface.
 *
 * This is the Footer editor's language — inline fields, a drag handle per row,
 * a visibility toggle, one Save — generalised to an arbitrary tree and
 * parameterised by `NavSurface` so a megamenu row reads "Section" and a footer
 * row reads "Column".
 *
 * ── What it replaces, and why ──
 *
 * The previous per-menu editor rendered every item as a row of a flat table,
 * always fully expanded, and sent each field edit through a modal that saved
 * and refetched on close. At the footer's fifteen rows that is merely slow. At
 * the megamenu's 323 it is unusable: the page is one 323-row table with no way
 * to collapse a section, and renaming three links is three dialogs and three
 * full-page refreshes.
 *
 * So: collapse by default, edit in place, save once.
 *
 * ── Collapse is a correctness feature, not a nicety ──
 *
 * Rows are only mounted when their ancestors are expanded. A megamenu opens as
 * six rows rather than 323, and an editor working on one section never pays
 * for the other five.
 */

export interface NavTreeEditorHandle {
  items: NavDraftItem[]
  isDirty: boolean
}

export default function NavTreeEditor({
  surface,
  items,
  onChange,
  emptyHint,
  addLabel,
}: {
  surface: NavSurface
  items: NavDraftItem[]
  onChange: (next: NavDraftItem[]) => void
  /** Shown when the tree has no rows at all. */
  emptyHint?: string
  /** Overrides the "Add <noun>" label on the root-level button. */
  addLabel?: string
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  const childrenOf = useMemo(() => {
    const map = new Map<string | null, NavDraftItem[]>()
    for (const item of items) {
      const list = map.get(item.parentUid) ?? []
      list.push(item)
      map.set(item.parentUid, list)
    }
    return map
  }, [items])

  const roots = childrenOf.get(null) ?? []

  const toggle = useCallback((uid: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(uid)) next.delete(uid)
      else next.add(uid)
      return next
    })
  }, [])

  /**
   * Insert a row directly after the last descendant of `parentUid`, so tree
   * order is preserved.
   *
   * Appending to the end of the array would put a new child of the FIRST
   * section after the last row of the LAST one. `flattenDraft` numbers by
   * parent so the saved positions would still be right — but the editor would
   * draw the new row in the wrong place until the next reload, and the diff
   * would report every row in between as moved.
   */
  function addChild(parentUid: string | null) {
    const created: NavDraftItem = {
      id: null,
      uid: `new-${Math.abs(hashSeed(items.length, parentUid ?? 'root'))}-${items.length}`,
      parentUid,
      label: '',
      linkType: 'custom_url',
      customUrl: '',
      categoryId: null,
      brandId: null,
      industryId: null,
      cmsPageId: null,
      productId: null,
      iconName: null,
      badge: null,
      description: null,
      openInNewTab: false,
      isVisible: true,
      promoImageId: null,
      promoHeading: null,
      promoBody: null,
      promoLinkUrl: null,
    }
    if (parentUid === null) {
      onChange([...items, created])
      return
    }
    const subtree = new Set(collectSubtree(items, parentUid))
    let lastIndex = -1
    items.forEach((item, index) => {
      if (subtree.has(item.uid)) lastIndex = index
    })
    const next = [...items]
    next.splice(lastIndex + 1, 0, created)
    onChange(next)
    setExpanded((prev) => new Set(prev).add(parentUid))
  }

  function patch(uid: string, changes: Partial<NavDraftItem>) {
    onChange(items.map((item) => (item.uid === uid ? { ...item, ...changes } : item)))
  }

  function remove(uid: string) {
    // The whole subtree goes. The database would cascade anyway; dropping the
    // descendants here too stops them lingering as rows pointing at a parent
    // that is no longer in the draft.
    const doomed = new Set(collectSubtree(items, uid))
    onChange(items.filter((item) => !doomed.has(item.uid)))
  }

  /**
   * Reorder within one parent.
   *
   * The array is rebuilt in full tree order afterwards, not spliced in place.
   * `flattenDraft` derives every position from array order, so a sibling list
   * reordered on its own while the surrounding array still held the old
   * sequence would display one order and save another — the kind of bug that
   * only shows up after a reload.
   */
  function reorderSiblings(parentUid: string | null, fromUid: string, toUid: string) {
    const siblings = childrenOf.get(parentUid) ?? []
    const from = siblings.findIndex((s) => s.uid === fromUid)
    const to = siblings.findIndex((s) => s.uid === toUid)
    if (from < 0 || to < 0 || from === to) return

    const reordered = arrayMove(siblings, from, to)
    const listFor = (uid: string | null) =>
      uid === parentUid ? reordered : (childrenOf.get(uid) ?? [])

    const rebuilt: NavDraftItem[] = []
    const walk = (parent: string | null) => {
      for (const node of listFor(parent)) {
        rebuilt.push(node)
        walk(node.uid)
      }
    }
    walk(null)
    onChange(rebuilt)
  }

  const rootNoun = navLevelNoun(surface, 0)

  return (
    <div className="flex flex-col gap-3">
      {roots.length === 0 ? (
        <p className="rounded-md border border-dashed border-ih-border px-4 py-8 text-center text-[13px] text-ih-muted">
          {emptyHint ?? `No ${rootNoun.toLowerCase()}s yet.`}
        </p>
      ) : (
        <NavLevel
          parentUid={null}
          rows={roots}
          depth={0}
          surface={surface}
          childrenOf={childrenOf}
          expanded={expanded}
          onToggle={toggle}
          onPatch={patch}
          onRemove={remove}
          onAddChild={addChild}
          onReorder={reorderSiblings}
        />
      )}

      <div>
        <Button
          type="button"
          size="dense-sm"
          icon={<Plus size={13} />}
          onClick={() => addChild(null)}
        >
          {addLabel ?? `Add ${rootNoun.toLowerCase()}`}
        </Button>
      </div>
    </div>
  )
}

/** Deterministic, so a re-render never reshuffles a pending row's key. */
function hashSeed(length: number, seed: string): number {
  let hash = length * 2654435761
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return hash
}

// ─── One sortable level ─────────────────────────────────────────────────────

function NavLevel({
  parentUid,
  rows,
  depth,
  surface,
  childrenOf,
  expanded,
  onToggle,
  onPatch,
  onRemove,
  onAddChild,
  onReorder,
}: {
  parentUid: string | null
  rows: NavDraftItem[]
  depth: number
  surface: NavSurface
  childrenOf: Map<string | null, NavDraftItem[]>
  expanded: Set<string>
  onToggle: (uid: string) => void
  onPatch: (uid: string, changes: Partial<NavDraftItem>) => void
  onRemove: (uid: string) => void
  onAddChild: (parentUid: string | null) => void
  onReorder: (parentUid: string | null, fromUid: string, toUid: string) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorder(parentUid, String(active.id), String(over.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={rows.map((r) => r.uid)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <NavRow
              key={row.uid}
              item={row}
              depth={depth}
              surface={surface}
              childrenOf={childrenOf}
              expanded={expanded}
              onToggle={onToggle}
              onPatch={onPatch}
              onRemove={onRemove}
              onAddChild={onAddChild}
              onReorder={onReorder}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

// ─── One row ────────────────────────────────────────────────────────────────

const FIELD =
  'h-9 px-3 border border-ih-border bg-ih-bg text-[13px] rounded-sm outline-none focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft'

function NavRow({
  item,
  depth,
  surface,
  childrenOf,
  expanded,
  onToggle,
  onPatch,
  onRemove,
  onAddChild,
  onReorder,
}: {
  item: NavDraftItem
  depth: number
  surface: NavSurface
  childrenOf: Map<string | null, NavDraftItem[]>
  expanded: Set<string>
  onToggle: (uid: string) => void
  onPatch: (uid: string, changes: Partial<NavDraftItem>) => void
  onRemove: (uid: string) => void
  onAddChild: (parentUid: string | null) => void
  onReorder: (parentUid: string | null, fromUid: string, toUid: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.uid,
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const children = childrenOf.get(item.uid) ?? []
  const isOpen = expanded.has(item.uid)
  const noun = navLevelNoun(surface, depth)
  const childNoun = navLevelNoun(surface, depth + 1)
  const unrendered = isBeyondRenderedDepth(surface, depth)
  const canHaveChildren =
    surface.renderedDepth === null || depth < surface.renderedDepth || children.length > 0

  const needsPicker = item.linkType !== 'none' && item.linkType !== 'custom_url'
  const pickerValue: PickerTarget | null = currentTargetId(item)
    ? { id: currentTargetId(item)!, label: item.label || '(selected)', sublabel: null }
    : null

  return (
    <li
      ref={setNodeRef}
      className={
        unrendered
          ? 'rounded-md border border-dashed border-ih-border bg-ih-bg'
          : 'rounded-md border border-ih-border bg-ih-bg'
      }
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="flex items-center gap-2 px-2 py-2">
        <button
          type="button"
          aria-label={`Reorder ${item.label || noun} — press space, then arrow keys`}
          className="inline-flex h-7 w-5 shrink-0 cursor-grab items-center justify-center text-ih-muted hover:text-ih-ink active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <GripVertical size={14} />
        </button>

        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => onToggle(item.uid)}
            aria-expanded={isOpen}
            aria-label={isOpen ? `Collapse ${item.label || noun}` : `Expand ${item.label || noun}`}
            className="inline-flex h-7 w-6 shrink-0 items-center justify-center rounded-md text-ih-muted hover:text-ih-ink"
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="sr-only">
              {children.length} {children.length === 1 ? childNoun : `${childNoun}s`}
            </span>
          </button>
        ) : (
          <span className="h-7 w-6 shrink-0" />
        )}

        <input
          aria-label={`${noun} label`}
          placeholder={noun}
          maxLength={80}
          value={item.label}
          onChange={(e) => onPatch(item.uid, { label: e.target.value })}
          className={`${FIELD} min-w-0 flex-1 ${depth === 0 ? 'font-medium' : ''}`}
        />

        <select
          aria-label={`${item.label || noun} link type`}
          value={item.linkType}
          onChange={(e) => {
            const linkType = e.target.value as MenuLinkType
            onPatch(item.uid, {
              linkType,
              customUrl: linkType === 'custom_url' ? item.customUrl : null,
              categoryId: null,
              brandId: null,
              industryId: null,
              cmsPageId: null,
              productId: null,
            })
          }}
          className={`${FIELD} w-[148px] shrink-0`}
        >
          {MENU_LINK_TYPES.map((type) => (
            <option key={type} value={type}>
              {MENU_LINK_TYPE_LABELS[type]}
            </option>
          ))}
        </select>

        {children.length > 0 ? (
          <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ih-muted">
            {children.length}
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          aria-label={`More options for ${item.label || noun}`}
          title="Badge, description, icon, new-tab"
          className={
            showAdvanced
              ? 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ih-accent'
              : 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ih-muted hover:text-ih-ink'
          }
        >
          <Settings2 size={14} />
        </button>

        <button
          type="button"
          onClick={() => onPatch(item.uid, { isVisible: !item.isVisible })}
          aria-pressed={!item.isVisible}
          aria-label={item.isVisible ? `Hide ${item.label || noun}` : `Show ${item.label || noun}`}
          title={item.isVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
          className={
            item.isVisible
              ? 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ih-muted hover:text-ih-ink'
              : 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ih-danger-ink'
          }
        >
          {item.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>

        <button
          type="button"
          onClick={() => onRemove(item.uid)}
          aria-label={`Remove ${item.label || noun}`}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ih-muted hover:text-ih-danger-ink"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Where this row points. */}
      <div className="px-2 pb-2 pl-[52px]">
        {item.linkType === 'custom_url' ? (
          <input
            aria-label={`${item.label || noun} URL`}
            placeholder="/c/hydraulic-pumps or https://…"
            maxLength={2048}
            value={item.customUrl ?? ''}
            onChange={(e) => onPatch(item.uid, { customUrl: e.target.value })}
            className={`${FIELD} w-full`}
          />
        ) : needsPicker ? (
          <LinkTargetPicker
            linkType={item.linkType}
            value={pickerValue}
            onChange={(target) =>
              onPatch(item.uid, {
                ...targetPatch(item.linkType, target?.id ?? null),
                label: item.label || (target?.label ?? ''),
              })
            }
          />
        ) : (
          <p className="text-[12px] text-ih-muted">Heading only — not a link.</p>
        )}

        {unrendered ? (
          <p className="mt-2 flex items-start gap-1.5 text-[12px] text-ih-danger-ink">
            <TriangleAlert size={13} className="mt-[2px] shrink-0" />
            <span>
              Saved, but never shown. {surface.title} draws{' '}
              {(surface.renderedDepth ?? 0) + 1}{' '}
              {(surface.renderedDepth ?? 0) + 1 === 1 ? 'level' : 'levels'}; this one is deeper.
            </span>
          </p>
        ) : null}
      </div>

      {showAdvanced ? (
        <AdvancedFields item={item} surface={surface} depth={depth} onPatch={onPatch} />
      ) : null}

      {isOpen && children.length > 0 ? (
        <div className="border-t border-ih-border px-2 py-2 pl-6">
          <NavLevel
            parentUid={item.uid}
            rows={children}
            depth={depth + 1}
            surface={surface}
            childrenOf={childrenOf}
            expanded={expanded}
            onToggle={onToggle}
            onPatch={onPatch}
            onRemove={onRemove}
            onAddChild={onAddChild}
            onReorder={onReorder}
          />
        </div>
      ) : null}

      {canHaveChildren ? (
        <div className={children.length > 0 && isOpen ? 'px-2 pb-2 pl-6' : 'px-2 pb-2 pl-[52px]'}>
          <Button
            type="button"
            size="dense-xs"
            kind="ghost"
            icon={<Plus size={12} />}
            onClick={() => onAddChild(item.uid)}
          >
            Add {childNoun.toLowerCase()}
          </Button>
        </div>
      ) : null}
    </li>
  )
}

// ─── The fields nobody needs most of the time ───────────────────────────────

/**
 * Badge, description, icon, new-tab and the promo tile.
 *
 * These were two separate modal dialogs. Across all five live menus every one
 * of these columns is null on every row — so the dialogs cost two files and a
 * round trip each to edit fields nobody has ever used. Folded into a
 * disclosure: still reachable, no longer in the way.
 */
function AdvancedFields({
  item,
  surface,
  depth,
  onPatch,
}: {
  item: NavDraftItem
  surface: NavSurface
  depth: number
  onPatch: (uid: string, changes: Partial<NavDraftItem>) => void
}) {
  return (
    <div className="border-t border-ih-border px-2 py-3 pl-[52px]">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-ih-muted">
            Badge
          </span>
          <input
            maxLength={20}
            value={item.badge ?? ''}
            onChange={(e) => onPatch(item.uid, { badge: e.target.value || null })}
            className={FIELD}
            placeholder="New"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-ih-muted">
            Description
          </span>
          <input
            maxLength={280}
            value={item.description ?? ''}
            onChange={(e) => onPatch(item.uid, { description: e.target.value || null })}
            className={FIELD}
            placeholder="One line under the label"
          />
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-[13px]">
        <input
          type="checkbox"
          checked={item.openInNewTab}
          onChange={(e) => onPatch(item.uid, { openInNewTab: e.target.checked })}
          className="h-4 w-4 rounded-[3px] border-ih-border"
        />
        Open in a new tab
      </label>

      {surface.supportsPromo && depth === 0 ? (
        <div className="mt-3 flex flex-col gap-3 border-t border-ih-border pt-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-ih-muted">
            Promo tile
          </span>
          <input
            maxLength={120}
            value={item.promoHeading ?? ''}
            onChange={(e) => onPatch(item.uid, { promoHeading: e.target.value || null })}
            className={FIELD}
            placeholder="Heading"
          />
          <input
            maxLength={280}
            value={item.promoBody ?? ''}
            onChange={(e) => onPatch(item.uid, { promoBody: e.target.value || null })}
            className={FIELD}
            placeholder="Body"
          />
          <input
            maxLength={2048}
            value={item.promoLinkUrl ?? ''}
            onChange={(e) => onPatch(item.uid, { promoLinkUrl: e.target.value || null })}
            className={FIELD}
            placeholder="/c/something"
          />
          <p className="text-[12px] text-ih-muted">
            The promo image is set from the Media library — not editable here yet.
          </p>
        </div>
      ) : null}
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function currentTargetId(item: NavDraftItem): string | null {
  switch (item.linkType) {
    case 'category':
      return item.categoryId
    case 'brand':
      return item.brandId
    case 'industry':
      return item.industryId
    case 'cms_page':
      return item.cmsPageId
    case 'product':
      return item.productId
    default:
      return null
  }
}

function targetPatch(linkType: MenuLinkType, id: string | null): Partial<NavDraftItem> {
  return {
    categoryId: linkType === 'category' ? id : null,
    brandId: linkType === 'brand' ? id : null,
    industryId: linkType === 'industry' ? id : null,
    cmsPageId: linkType === 'cms_page' ? id : null,
    productId: linkType === 'product' ? id : null,
  }
}

/**
 * Warn before a reload or a close throws away unsaved edits.
 *
 * The editor this replaces persisted every change immediately, so there was
 * nothing to lose. One Save for a screenful of megamenu edits changes that,
 * and losing twenty renames to a stray Cmd-R is the obvious way this design
 * gets worse than what it replaced.
 */
export function useUnsavedGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
