'use client'

import { useState, useTransition } from 'react'
import { Field, Input } from '@indus/ui'
import { ancestorPath, descendantIds } from '@indus/domain'

import { createCategory, updateCategory } from './actions'
import type { Cat, TemplateOption } from './types'

/**
 * Create / rename one category.
 *
 * Deliberately no "Position" box any more. Order is a drag on the tree, and the
 * integer field was both the slow path (one save per row to reorder a branch)
 * and a live hazard — `updateCategory` used to default a missing `position` to
 * 0, so a form without the box would have moved a category to the top of its
 * siblings as a side effect of fixing a typo. The action now treats an absent
 * position as "leave it alone"; this form relies on that.
 *
 * The Parent select stays. Drag is better for nudging something one level up or
 * into the branch next door; a picker is better for "this belongs under a
 * category 400 rows away", which is exactly the move a drag is worst at.
 */
export default function CategoryForm({
  parents,
  templates,
  existing,
  onDone,
}: {
  parents: Cat[]
  templates: TemplateOption[]
  existing?: Cat
  onDone: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = existing ? await updateCategory(formData) : await createCategory(formData)
      if (!result.success) {
        setError(result.message)
        return
      }
      onDone()
    })
  }

  // A category cannot be re-homed inside itself or anything beneath it. The
  // server rejects it either way, but an option that can only ever produce an
  // error does not belong in the list.
  const forbidden = existing
    ? new Set([existing.id, ...descendantIds(parents, existing.id)])
    : new Set<string>()

  const options = parents
    .filter((p) => !forbidden.has(p.id))
    .map((p) => ({ cat: p, label: ancestorPath(parents, p.id).map((a) => a.name).join(' › ') }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <form
      action={onSubmit}
      className="flex flex-col gap-4 rounded-[10px] border border-ih-border bg-ih-surface p-5"
    >
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[1fr_1fr_220px]">
        <Field label="Name *">
          <Input
            required
            name="name"
            defaultValue={existing?.name ?? ''}
            placeholder="Hydraulic Pumps"
            className="h-9 w-full rounded-lg border border-ih-border bg-ih-surface px-3 text-[13px]"
          />
        </Field>

        <Field
          label="Slug"
          hint={existing ? 'Changing this redirects the old URL' : 'Auto from name'}
        >
          <Input
            name="slug"
            defaultValue={existing?.slug ?? ''}
            placeholder="hydraulic-pumps"
            className="h-9 w-full rounded-lg border border-ih-border bg-ih-surface px-3 font-mono text-[12px]"
          />
        </Field>

        <Field label="Parent">
          <select
            name="parentId"
            defaultValue={existing?.parentId ?? ''}
            className="h-9 w-full rounded-lg border border-ih-border bg-ih-surface px-2 text-[12px]"
          >
            <option value="">— Top level —</option>
            {options.map(({ cat, label }) => (
              <option key={cat.id} value={cat.id}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <Field label="Default spec template" hint="Auto-applied to new products in this category">
          <select
            name="defaultSpecTemplateId"
            defaultValue={existing?.defaultSpecTemplateId ?? ''}
            className="h-9 w-full rounded-lg border border-ih-border bg-ih-surface px-2 text-[12px]"
          >
            <option value="">— None —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <label className="mt-[26px] flex h-9 items-center gap-2 whitespace-nowrap text-[12px] text-ih-ink-2">
          <Input type="checkbox" name="isPublished" defaultChecked={existing?.isPublished ?? false} />
          Published
        </label>

        <button
          type="submit"
          disabled={pending}
          className="mt-[26px] h-9 whitespace-nowrap rounded-lg bg-ih-accent px-4 text-[12px] font-medium text-ih-accent-fg hover:bg-ih-accent-hover disabled:opacity-50"
        >
          {pending ? 'Saving…' : existing ? 'Save' : 'Create'}
        </button>

        <button
          type="button"
          onClick={onDone}
          className="mt-[26px] h-9 whitespace-nowrap px-3 text-[12px] text-ih-muted hover:text-ih-ink"
        >
          Cancel
        </button>
      </div>

      {error && (
        <p className="text-[11.5px] text-ih-danger-ink" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
