'use client'

import { useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { ChevronDown, Eye, EyeOff, GripVertical, Lock, RotateCcw, Save } from 'lucide-react'
import type { SectionDef, SectionValues, StoredSection } from '@indus/domain'
import { Button, ToastProvider, cn, useToast } from '@indus/ui'

import { FieldEditor, type Seeds } from './section-fields'

export type EditorSection = {
  key: string
  def: SectionDef
  enabled: boolean
  values: SectionValues
}

export type SaveResult =
  | { status: 'ok'; message: string }
  | { status: 'invalid'; message: string; issues: string[] }
  | { status: 'error'; message: string }

export type SectionActions = {
  save: (id: string, sections: StoredSection[]) => Promise<SaveResult>
  reset: (id: string) => Promise<SaveResult>
}

/**
 * The section editor.
 *
 * One component drives every page. What a page can hold is declared in the
 * registry (`@indus/domain/page-sections`), and the editor renders whatever is
 * declared — so a section added in code shows up here with no work, and a
 * field added to a section grows a control by itself.
 *
 * `actions` is injected rather than imported so the same editor can drive
 * master pages and, later, record-backed sub-pages without a second copy.
 */
export default function SectionEditor(props: {
  /** Master-page key, or the record slug for a sub-page. */
  pageId: string
  pageLabel: string
  path: string
  initial: EditorSection[]
  seeds: Seeds
  usingDefaults: boolean
  actions: SectionActions
  /** Sub-pages whose anchor navigation depends on document order set false. */
  allowReorder?: boolean
}) {
  return (
    <ToastProvider>
      <Editor {...props} />
    </ToastProvider>
  )
}

function Editor({
  pageId,
  pageLabel,
  path,
  initial,
  seeds,
  usingDefaults,
  actions,
  allowReorder = true,
}: {
  pageId: string
  pageLabel: string
  path: string
  initial: EditorSection[]
  seeds: Seeds
  usingDefaults: boolean
  actions: SectionActions
  allowReorder?: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [sections, setSections] = useState(initial)
  const [open, setOpen] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [pending, startTransition] = useTransition()
  const dndId = useId()

  const sensors = useSensors(
    // 4px of slop, so a click on the handle is still a click.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function update(next: EditorSection[]) {
    setSections(next)
    setDirty(true)
  }

  function patch(key: string, values: Partial<EditorSection>) {
    update(sections.map((s) => (s.key === key ? { ...s, ...values } : s)))
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = sections.findIndex((s) => s.key === active.id)
    const to = sections.findIndex((s) => s.key === over.id)
    if (from < 0 || to < 0) return
    update(arrayMove(sections, from, to))
  }

  function onSave() {
    startTransition(async () => {
      const payload: StoredSection[] = sections.map((s) => ({
        key: s.key,
        enabled: s.enabled,
        values: s.values,
      }))
      const result = await actions.save(pageId, payload)
      if (result.status === 'ok') {
        toast({ title: result.message, tone: 'success' })
        setDirty(false)
        router.refresh()
      } else if (result.status === 'invalid') {
        toast({
          title: result.message,
          description: result.issues.slice(0, 4).join('\n'),
          tone: 'danger',
        })
      } else {
        toast({ title: 'That did not save.', description: result.message, tone: 'danger' })
      }
    })
  }

  function onReset() {
    if (
      !confirm(
        `Reset ${pageLabel} to the wording it ships with? Every edit on this page is discarded.`,
      )
    )
      return
    startTransition(async () => {
      const result = await actions.reset(pageId)
      if (result.status === 'ok') {
        toast({ title: 'Reset to the shipped wording.', tone: 'success' })
        setDirty(false)
        router.refresh()
      } else {
        toast({ title: 'That did not reset.', description: result.message, tone: 'danger' })
      }
    })
  }

  const hidden = sections.filter((s) => !s.enabled).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="mr-auto text-[12.5px] text-ih-muted">
          {sections.length} sections
          {hidden > 0 ? ` · ${hidden} hidden` : ''}
          {usingDefaults ? ' · never edited — showing the wording from the design' : ''}
          {dirty ? ' · unsaved changes' : ''}
        </p>
        <Button type="button" kind="ghost" size="dense" onClick={onReset} disabled={pending}>
          <RotateCcw size={13} strokeWidth={1.8} aria-hidden="true" />
          Reset to defaults
        </Button>
        <Button
          type="button"
          kind="primary"
          size="dense"
          onClick={onSave}
          disabled={pending || !dirty}
        >
          <Save size={13} strokeWidth={1.8} aria-hidden="true" />
          {pending ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.key)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2">
            {sections.map((section, index) => (
              <SectionRow
                key={section.key}
                section={section}
                index={index}
                path={path}
                seeds={seeds}
                allowReorder={allowReorder}
                expanded={open === section.key}
                onToggleExpand={() => setOpen(open === section.key ? null : section.key)}
                onToggleEnabled={() => patch(section.key, { enabled: !section.enabled })}
                onValues={(values) => patch(section.key, { values })}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SectionRow({
  section,
  index,
  expanded,
  onToggleExpand,
  onToggleEnabled,
  onValues,
  seeds,
  path,
  allowReorder,
}: {
  section: EditorSection
  index: number
  expanded: boolean
  onToggleExpand: () => void
  onToggleEnabled: () => void
  onValues: (v: SectionValues) => void
  seeds: Seeds
  path: string
  allowReorder: boolean
}) {
  const pinned = section.def.locked === true || !allowReorder
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.key,
    disabled: pinned,
  })

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className={cn(
        'rounded-lg border border-ih-border bg-ih-surface',
        !section.enabled && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {pinned ? (
          <span
            className="inline-flex h-7 w-7 items-center justify-center text-ih-muted-2"
            title={
              allowReorder
                ? 'This section is fixed in place'
                : 'Section order is fixed by the page template'
            }
          >
            <Lock size={13} strokeWidth={1.7} aria-hidden="true" />
          </span>
        ) : (
          <button
            type="button"
            className="inline-flex h-7 w-7 cursor-grab items-center justify-center rounded text-ih-muted transition-colors hover:text-ih-ink active:cursor-grabbing focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft"
            aria-label={`Reorder ${section.def.label}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} strokeWidth={1.7} aria-hidden="true" />
          </button>
        )}

        <span className="w-5 font-mono text-[10.5px] text-ih-muted-2">{index + 1}</span>

        <button type="button" onClick={onToggleExpand} className="min-w-0 flex-1 text-left">
          <span className="text-[13.5px] font-medium text-ih-ink">{section.def.label}</span>
          <span className="block truncate text-[11.5px] text-ih-muted">
            {section.def.description}
          </span>
        </button>

        {section.def.fields.length === 0 ? (
          <span className="text-[11px] text-ih-muted-2">No editable copy</span>
        ) : null}

        <button
          type="button"
          onClick={onToggleEnabled}
          disabled={section.def.locked === true}
          aria-label={section.enabled ? 'Hide section' : 'Show section'}
          title={
            section.def.locked === true
              ? 'This section can’t be hidden'
              : section.enabled
                ? 'Hide this section on the live page'
                : 'Show this section on the live page'
          }
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded text-ih-muted transition-colors hover:text-ih-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft',
            section.def.locked === true && 'cursor-not-allowed opacity-40',
          )}
        >
          {section.enabled ? (
            <Eye size={13} strokeWidth={1.7} aria-hidden="true" />
          ) : (
            <EyeOff size={13} strokeWidth={1.7} aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={expanded ? 'Collapse' : 'Expand'}
          aria-expanded={expanded}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-ih-muted transition-colors hover:text-ih-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft"
        >
          <ChevronDown
            size={14}
            strokeWidth={1.7}
            aria-hidden="true"
            className={cn('transition-transform', expanded && 'rotate-180')}
          />
        </button>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-3.5 border-t border-ih-border px-3 py-3.5">
          {section.def.dataNote ? (
            <p className="rounded-md bg-ih-surface-2 px-2.5 py-2 text-[11.5px] leading-[1.5] text-ih-muted">
              {section.def.dataNote}
            </p>
          ) : null}
          {section.def.fields.length === 0 ? (
            <p className="text-[12.5px] text-ih-muted">
              Nothing to edit here — this section renders live data. You can still reorder it or
              hide it from <span className="font-mono text-ih-ink-2">{path}</span>.
            </p>
          ) : (
            section.def.fields.map((field) => (
              <FieldEditor
                key={field.key}
                field={field}
                value={section.values[field.key]}
                seeds={seeds}
                onChange={(v) => onValues({ ...section.values, [field.key]: v })}
              />
            ))
          )}
        </div>
      ) : null}
    </li>
  )
}
