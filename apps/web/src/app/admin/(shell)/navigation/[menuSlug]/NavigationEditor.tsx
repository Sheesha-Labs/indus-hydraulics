'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
  MENU_LINK_TYPE_LABELS,
  type MenuLinkType,
  type MenuLocation,
} from '@indus/domain'
import { deleteItem, publishMenu, reorderItems, unpublishMenu } from '../actions'
import ItemFormDialog, { type ItemFormInitial } from './ItemFormDialog'
import PromoFormDialog from './PromoFormDialog'

export interface EditorMenu {
  id: string
  slug: string
  name: string
  location: MenuLocation
  isPublished: boolean
  publishedAt: string | null
}

export interface EditorItem {
  id: string
  parentId: string | null
  position: number
  label: string
  iconName: string | null
  badge: string | null
  description: string | null
  linkType: MenuLinkType
  customUrl: string | null
  openInNewTab: boolean
  isVisible: boolean
  target: { id: string; label: string; sublabel: string | null } | null
  categoryId: string | null
  brandId: string | null
  industryId: string | null
  cmsPageId: string | null
  productId: string | null
  promoImageId: string | null
  promoImageUrl: string | null
  promoHeading: string | null
  promoBody: string | null
  promoLinkUrl: string | null
}

interface Props {
  menu: EditorMenu
  items: EditorItem[]
}

export default function NavigationEditor({ menu, items: initialItems }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<{ kind: 'item'; initial: ItemFormInitial } | { kind: 'promo'; itemId: string } | null>(null)

  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, EditorItem[]>()
    for (const it of items) {
      const arr = map.get(it.parentId) ?? []
      arr.push(it)
      map.set(it.parentId, arr)
    }
    for (const arr of map.values()) arr.sort((a, b) => a.position - b.position)
    return map
  }, [items])

  const roots = childrenByParent.get(null) ?? []

  function persistReorder(parentId: string | null, newOrder: EditorItem[]) {
    const ordering = newOrder.map((row, idx) => ({
      id: row.id,
      parentId,
      position: idx,
    }))
    startTransition(async () => {
      const result = await reorderItems({ menuId: menu.id, ordering })
      if (!result.success) {
        setError(result.message)
        router.refresh()
        return
      }
      setError(null)
    })
  }

  function reorderSiblings(parentId: string | null, fromId: string, toId: string) {
    const siblings = childrenByParent.get(parentId) ?? []
    const fromIdx = siblings.findIndex((s) => s.id === fromId)
    const toIdx = siblings.findIndex((s) => s.id === toId)
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return
    const reordered = arrayMove(siblings, fromIdx, toIdx)
    setItems((prev) => {
      const others = prev.filter((p) => p.parentId !== parentId)
      const updated = reordered.map((s, idx) => ({ ...s, position: idx }))
      return [...others, ...updated]
    })
    persistReorder(parentId, reordered)
  }

  function onDelete(id: string) {
    if (!confirm('Delete this item and all of its children?')) return
    startTransition(async () => {
      const result = await deleteItem(id)
      if (!result.success) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  function onPublishToggle() {
    startTransition(async () => {
      const result = menu.isPublished ? await unpublishMenu(menu.id) : await publishMenu(menu.id)
      if (!result.success) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">{menu.name}</h1>
          <p className="text-[13px] text-[var(--color-muted)] mt-1">
            {menu.isPublished
              ? `Published${menu.publishedAt ? ` ${new Date(menu.publishedAt).toLocaleString()}` : ''}`
              : 'Draft — not visible on the storefront yet'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setDialog({
                kind: 'item',
                initial: { menuId: menu.id, parentId: null },
              })
            }
            className="h-9 px-4 border border-[var(--color-border)] text-[13px]"
          >
            + Add column
          </button>
          <button
            type="button"
            onClick={onPublishToggle}
            disabled={pending}
            className="h-9 px-4 bg-[var(--color-accent)] text-white text-[13px] disabled:opacity-50"
          >
            {pending ? 'Saving…' : menu.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {error ? (
        <div role="alert" className="border border-[var(--color-danger)] bg-[oklch(0.98_0.04_30)] text-[13px] px-3 py-2">
          {error}
        </div>
      ) : null}

      <div className="bg-white border border-[var(--color-border)]">
        {roots.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-[var(--color-muted)]">
            No items yet — click <span className="font-medium">+ Add column</span> to begin.
          </div>
        ) : (
          <SortableTree
            parentId={null}
            ids={roots.map((r) => r.id)}
            onReorder={(from, to) => reorderSiblings(null, from, to)}
          >
            {roots.map((root) => (
              <ItemNode
                key={root.id}
                item={root}
                depth={0}
                childrenByParent={childrenByParent}
                onAddChild={(parentId) =>
                  setDialog({ kind: 'item', initial: { menuId: menu.id, parentId } })
                }
                onEdit={(item) =>
                  setDialog({
                    kind: 'item',
                    initial: {
                      menuId: menu.id,
                      parentId: item.parentId,
                      id: item.id,
                      label: item.label,
                      iconName: item.iconName,
                      badge: item.badge,
                      description: item.description,
                      linkType: item.linkType,
                      customUrl: item.customUrl,
                      openInNewTab: item.openInNewTab,
                      isVisible: item.isVisible,
                      target: item.target,
                    },
                  })
                }
                onEditPromo={(itemId) => setDialog({ kind: 'promo', itemId })}
                onDelete={onDelete}
                onReorder={(parentId, from, to) => reorderSiblings(parentId, from, to)}
              />
            ))}
          </SortableTree>
        )}
      </div>

      {dialog?.kind === 'item' ? (
        <ItemFormDialog
          initial={dialog.initial}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null)
            router.refresh()
          }}
        />
      ) : null}
      {dialog?.kind === 'promo' ? (
        <PromoFormDialog
          item={items.find((i) => i.id === dialog.itemId)!}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null)
            router.refresh()
          }}
        />
      ) : null}
    </div>
  )
}

function SortableTree({
  ids,
  onReorder,
  children,
}: {
  parentId: string | null
  ids: string[]
  onReorder: (fromId: string, toId: string) => void
  children: React.ReactNode
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorder(String(active.id), String(over.id))
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

interface ItemNodeProps {
  item: EditorItem
  depth: number
  childrenByParent: Map<string | null, EditorItem[]>
  onAddChild: (parentId: string) => void
  onEdit: (item: EditorItem) => void
  onEditPromo: (itemId: string) => void
  onDelete: (id: string) => void
  onReorder: (parentId: string | null, fromId: string, toId: string) => void
}

function ItemNode({
  item,
  depth,
  childrenByParent,
  onAddChild,
  onEdit,
  onEditPromo,
  onDelete,
  onReorder,
}: ItemNodeProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const children = childrenByParent.get(item.id) ?? []
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }
  const targetSummary = (() => {
    if (item.linkType === 'custom_url') return item.customUrl ?? '—'
    if (item.linkType === 'none') return '(label only)'
    if (item.target) return item.target.sublabel ?? item.target.label
    return '⚠ unlinked'
  })()

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="grid grid-cols-[28px_1fr_140px_120px_220px] items-center px-3 py-2 border-b border-[var(--color-border)] last:border-b-0 text-[13px]"
      >
        <button
          type="button"
          aria-label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing text-[var(--color-muted)] hover:text-[var(--color-primary)]"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <div style={{ paddingLeft: `${depth * 20}px` }} className="flex items-center gap-2 min-w-0">
          <span className="font-medium truncate">{item.label}</span>
          {item.badge ? (
            <span className="px-1.5 py-0.5 text-[10px] bg-[var(--color-accent)] text-white">{item.badge}</span>
          ) : null}
          {!item.isVisible ? (
            <span className="text-[10px] text-[var(--color-muted)] font-mono uppercase">hidden</span>
          ) : null}
        </div>
        <div className="font-mono text-[11px] text-[var(--color-muted)]">
          {MENU_LINK_TYPE_LABELS[item.linkType]}
        </div>
        <div className="font-mono text-[11px] text-[var(--color-muted)] truncate">{targetSummary}</div>
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => onAddChild(item.id)}
            className="h-7 px-2 text-[11px] border border-[var(--color-border)] hover:bg-[var(--color-surface)]"
          >
            + Child
          </button>
          {depth === 0 ? (
            <button
              type="button"
              onClick={() => onEditPromo(item.id)}
              className="h-7 px-2 text-[11px] border border-[var(--color-border)] hover:bg-[var(--color-surface)]"
            >
              Promo
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="h-7 px-2 text-[11px] border border-[var(--color-border)] hover:bg-[var(--color-surface)]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="h-7 px-2 text-[11px] border border-[var(--color-border)] text-[var(--color-danger)] hover:bg-[var(--color-surface)]"
          >
            Delete
          </button>
        </div>
      </div>

      {children.length > 0 ? (
        <SortableTree
          parentId={item.id}
          ids={children.map((c) => c.id)}
          onReorder={(fromId, toId) => onReorder(item.id, fromId, toId)}
        >
          {children.map((child) => (
            <ItemNode
              key={child.id}
              item={child}
              depth={depth + 1}
              childrenByParent={childrenByParent}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onEditPromo={onEditPromo}
              onDelete={onDelete}
              onReorder={onReorder}
            />
          ))}
        </SortableTree>
      ) : null}
    </>
  )
}
