'use client'

import Link from 'next/link'
import {
  Field,
  Input,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@indus/ui'
import { useState, useTransition } from 'react'
import { createCategory, updateCategory, deleteCategory } from './actions'

type Cat = {
  id: string
  parentId: string | null
  slug: string
  name: string
  position: number
  isPublished: boolean
  productCount: number
  childCount: number
  defaultSpecTemplateId: string | null
  defaultSpecTemplateName: string | null
}

type TemplateOption = {
  id: string
  name: string
  slug: string
}

interface Props {
  categories: Cat[]
  templates: TemplateOption[]
}

export default function CategoriesClient({ categories, templates }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const roots = categories.filter((c) => !c.parentId)
  const childrenByParent: Record<string, Cat[]> = {}
  for (const c of categories) {
    if (c.parentId) {
      if (!childrenByParent[c.parentId]) childrenByParent[c.parentId] = []
      childrenByParent[c.parentId]!.push(c)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        {!showCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex h-8 items-center rounded-lg bg-ih-accent px-2.5 text-[14px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover"
          >
            + New category
          </button>
        )}
      </div>

      {showCreate && (
        <CategoryForm
         
          parents={categories}
          templates={templates}
          onDone={() => setShowCreate(false)}
        />
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead numeric>Pos</TableHead>
            <TableHead numeric>Prod</TableHead>
            <TableHead>Default template</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-14 text-center text-ih-muted">
                No categories yet — create the first one above.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {roots.map((root) => (
                <CategoryRows
                  key={root.id}
                  cat={root}
                  childrenByParent={childrenByParent}
                  depth={0}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  parents={categories}
                  templates={templates}
                />
              ))}

              {/* Orphans (categories whose parent is missing) */}
              {categories
                .filter((c) => c.parentId && !categories.find((p) => p.id === c.parentId))
                .map((c) => (
                  <CategoryRows
                    key={c.id}
                    cat={c}
                    childrenByParent={childrenByParent}
                    depth={0}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    parents={categories}
                    templates={templates}
                  />
                ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * Depth indent, as a class rather than an inline style.
 *
 * The tree was indenting with `style={{ paddingLeft: 16 + depth * 24 }}`,
 * which CLAUDE.md §2.1 bans and Tailwind could not have produced from a
 * runtime value anyway. A small map covers the depths this tree actually
 * reaches; anything deeper clamps to the last entry rather than losing its
 * indent entirely.
 *
 * The padding goes on the label INSIDE the cell, not on the cell. TableCell
 * carries `first:pl-4`, and a `pl-10` on the same element does not beat it:
 * they are different Tailwind variants, so tailwind-merge cannot dedupe them
 * and the `first:` rule still applies. Putting it on the cell rendered all 161
 * child categories flush with their parents — a flat tree that type-checked,
 * linted and built, and was only visible by measuring the computed padding.
 */
const DEPTH_INDENT = ['pl-0', 'pl-6', 'pl-12', 'pl-[72px]'] as const

function CategoryRows({
  cat,
  childrenByParent,
  depth,
  editingId,
  setEditingId,
  parents,
  templates,
}: {
  cat: Cat
  /**
   * The whole parent → children index, not this row's children.
   *
   * This used to take a `subRows` array, and the recursive call passed `[]` —
   * so a category three levels down existed, had products, and was reachable
   * on the storefront, but never appeared on this page at all. Eight of them
   * did (Industrial Hoses › Metallic Hoses › PTFE Hoses and its siblings), and
   * the only symptom was a row count that quietly did not match the header.
   * Passing the index down means depth is bounded by the data, not by the
   * component.
   */
  childrenByParent: Record<string, Cat[]>
  depth: number
  editingId: string | null
  setEditingId: (id: string | null) => void
  parents: Cat[]
  templates: TemplateOption[]
}) {
  const isEditing = editingId === cat.id

  return (
    <>
      {isEditing ? (
        <TableRow>
          <TableCell colSpan={7} className="bg-ih-surface-2 p-4">
          <CategoryForm
           
            parents={parents}
            templates={templates}
            existing={cat}
            onDone={() => setEditingId(null)}
          />
          </TableCell>
        </TableRow>
      ) : (
        <TableRow>
          <TableCell>
            <span
              className={`block font-medium text-ih-ink ${DEPTH_INDENT[Math.min(depth, 3)]}`}
            >
              {depth > 0 && <span className="mr-2 text-ih-muted-2">└</span>}
              {cat.name}
            </span>
          </TableCell>
          <TableCell className="font-mono text-[12px] text-ih-muted">{cat.slug}</TableCell>
          <TableCell numeric className="text-ih-muted">{cat.position}</TableCell>
          <TableCell numeric>{cat.productCount}</TableCell>
          <TableCell className="text-ih-ink-2">
            {cat.defaultSpecTemplateName ?? <span className="text-ih-muted-2">—</span>}
          </TableCell>
          <TableCell className="text-center">
            <StatusPill tone={cat.isPublished ? 'good' : 'muted'}>
              {cat.isPublished ? 'Published' : 'Draft'}
            </StatusPill>
          </TableCell>
          <TableCell className="text-right">
            <span className="inline-flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingId(cat.id)}
                className="text-[12px] text-ih-muted hover:text-ih-ink"
              >
                Edit
              </button>
              <Link
                href={`/admin/categories/${cat.id}/edit`}
                className="text-[12px] text-ih-muted hover:text-ih-ink"
                title="Open dedicated SEO editor"
              >
                SEO
              </Link>
              <DeleteCategoryButton
                id={cat.id}
                hasChildren={cat.childCount > 0}
                hasProducts={cat.productCount > 0}
              />
            </span>
          </TableCell>
        </TableRow>
      )}

      {(childrenByParent[cat.id] ?? []).map((child) => (
        <CategoryRows
          key={child.id}
          cat={child}
          childrenByParent={childrenByParent}
          depth={depth + 1}
          editingId={editingId}
          setEditingId={setEditingId}
          parents={parents}
          templates={templates}
        />
      ))}
    </>
  )
}

/**
 * "Hoses & Fittings › Ferrules" for the parent picker.
 *
 * A flat list of names is ambiguous the moment the tree is three deep: several
 * series categories read almost identically, and the picker gave no way to tell
 * which branch one sat on. Walking up by parentId is bounded by `all.length`
 * so a cycle in the data cannot hang the render — the server's own cycle check
 * should prevent one, but this runs on whatever the DB actually holds.
 */
function categoryPath(cat: Cat, all: Cat[]): string {
  const byId = new Map(all.map((c) => [c.id, c]))
  const names = [cat.name]
  let cursor = cat.parentId
  for (let hops = 0; cursor && hops < all.length; hops++) {
    const parent = byId.get(cursor)
    if (!parent) break
    names.unshift(parent.name)
    cursor = parent.parentId
  }
  return names.join(' › ')
}

function CategoryForm({
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

  return (
    <form
      action={onSubmit}
      className="rounded-lg border border-ih-border bg-ih-surface p-5 flex flex-col gap-4"
    >
      {existing && <input type="hidden" name="id" value={existing.id} />}

      {/* Row 1: Name, Slug, Position, Parent */}
      <div className="grid grid-cols-[1fr_1fr_80px_180px] gap-3 items-start">
        <Field label="Name *">
          <Input
            required
            name="name"
            defaultValue={existing?.name ?? ''}
            placeholder="Hydraulic Pumps"
            className="h-9 px-3 rounded-lg border border-ih-border bg-ih-surface text-[13px] w-full"
          />
        </Field>

        <Field label="Slug" hint="Auto from name">
          <Input
            name="slug"
            defaultValue={existing?.slug ?? ''}
            placeholder="hydraulic-pumps"
            className="h-9 px-3 rounded-lg border border-ih-border bg-ih-surface font-mono text-[12px] w-full"
          />
        </Field>

        <Field label="Position">
          <Input
            name="position"
            type="number"
            defaultValue={existing?.position ?? 0}
            className="h-9 px-3 rounded-lg border border-ih-border bg-ih-surface font-mono text-[12px] w-full"
          />
        </Field>

        <Field label="Parent">
          <select
            name="parentId"
            defaultValue={existing?.parentId ?? ''}
            className="h-9 px-2 rounded-lg border border-ih-border bg-ih-surface text-[12px] w-full"
          >
            <option value="">— None —</option>
            {parents
              .filter((p) => p.id !== existing?.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {categoryPath(p, parents)}
                </option>
              ))}
          </select>
        </Field>
      </div>

      {/* Row 2: Default spec template, Published, actions — items-start aligns to label row; action items add label-height spacer to drop down to input row */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-start">
        <Field label="Default spec template" hint="Auto-applied to new products in this category">
          <select
            name="defaultSpecTemplateId"
            defaultValue={existing?.defaultSpecTemplateId ?? ''}
            className="h-9 px-2 rounded-lg border border-ih-border bg-ih-surface text-[12px] w-full"
          >
            <option value="">— None —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex items-center gap-2 h-9 mt-[26px] text-[12px] text-ih-ink-2 whitespace-nowrap">
          <Input
            type="checkbox"
            name="isPublished"
            defaultChecked={existing?.isPublished ?? false}
          />
          Published
        </label>

        <button
          type="submit"
          disabled={pending}
          className="h-9 mt-[26px] px-4 bg-ih-navy text-ih-bg text-[12px] font-medium hover:bg-ih-ink disabled:opacity-50 whitespace-nowrap"
        >
          {pending ? 'Saving…' : existing ? 'Save' : 'Create'}
        </button>

        <button
          type="button"
          onClick={onDone}
          className="h-9 mt-[26px] px-3 text-[12px] text-ih-muted hover:text-ih-ink whitespace-nowrap"
        >
          Cancel
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-ih-danger-ink" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

function DeleteCategoryButton({
  id,
  hasChildren,
  hasProducts,
}: {
  id: string
  hasChildren: boolean
  hasProducts: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const blocked = hasChildren || hasProducts

  return (
    <>
      <button
        type="button"
        disabled={pending || blocked}
        title={
          hasChildren
            ? 'Cannot delete: has child categories'
            : hasProducts
            ? 'Cannot delete: has products attached'
            : 'Delete category'
        }
        onClick={() => {
          if (!confirm('Delete this category?')) return
          setError(null)
          startTransition(async () => {
            const result = await deleteCategory(id)
            if (!result.success) setError(result.message)
          })
        }}
        className="font-mono text-[11px] text-ih-muted hover:text-ih-danger-ink disabled:opacity-30 disabled:hover:text-ih-muted disabled:cursor-not-allowed"
      >
        {pending ? '…' : 'Delete'}
      </button>
      {error && <span className="text-[11px] text-ih-danger-ink">{error}</span>}
    </>
  )
}
