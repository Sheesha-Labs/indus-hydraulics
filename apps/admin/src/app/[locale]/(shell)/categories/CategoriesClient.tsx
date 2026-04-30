'use client'

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
}

interface Props {
  locale: string
  categories: Cat[]
}

export default function CategoriesClient({ locale, categories }: Props) {
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
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="h-9 px-4 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90"
        >
          {showCreate ? '× Cancel' : '+ New category'}
        </button>
      </div>

      {showCreate && (
        <CategoryForm
          locale={locale}
          parents={categories}
          onDone={() => setShowCreate(false)}
        />
      )}

      {categories.length === 0 ? (
        <div className="py-16 border border-dashed border-[var(--color-border)] text-center">
          <p className="text-[var(--color-muted)]">No categories yet — create the first one above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-border)]">
          <div className="grid grid-cols-[1fr_140px_80px_80px_100px_120px] px-4 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
            <div>Name</div>
            <div>Slug</div>
            <div className="text-center">Position</div>
            <div className="text-center">Products</div>
            <div className="text-center">Status</div>
            <div className="text-right"></div>
          </div>

          {roots.map((root) => (
            <CategoryRows
              key={root.id}
              cat={root}
              children={childrenByParent[root.id] ?? []}
              depth={0}
              editingId={editingId}
              setEditingId={setEditingId}
              parents={categories}
              locale={locale}
            />
          ))}

          {/* Orphans (categories whose parent is missing) */}
          {categories
            .filter((c) => c.parentId && !categories.find((p) => p.id === c.parentId))
            .map((c) => (
              <CategoryRows
                key={c.id}
                cat={c}
                children={childrenByParent[c.id] ?? []}
                depth={0}
                editingId={editingId}
                setEditingId={setEditingId}
                parents={categories}
                locale={locale}
              />
            ))}
        </div>
      )}
    </div>
  )
}

function CategoryRows({
  cat,
  children,
  depth,
  editingId,
  setEditingId,
  parents,
  locale,
}: {
  cat: Cat
  children: Cat[]
  depth: number
  editingId: string | null
  setEditingId: (id: string | null) => void
  parents: Cat[]
  locale: string
}) {
  const isEditing = editingId === cat.id

  return (
    <>
      {isEditing ? (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-deep)] p-4">
          <CategoryForm
            locale={locale}
            parents={parents}
            existing={cat}
            onDone={() => setEditingId(null)}
          />
        </div>
      ) : (
        <div
          className={`grid grid-cols-[1fr_140px_80px_80px_100px_120px] px-4 py-3 items-center text-[13px] border-t border-[var(--color-border)]`}
          style={{ paddingLeft: `${16 + depth * 24}px` }}
        >
          <div className="text-[var(--color-primary)] font-medium">
            {depth > 0 && <span className="text-[var(--color-caption)] mr-2">└</span>}
            {cat.name}
          </div>
          <div className="font-mono text-[11px] text-[var(--color-muted)]">{cat.slug}</div>
          <div className="text-center font-mono text-[12px] text-[var(--color-muted)]">{cat.position}</div>
          <div className="text-center font-mono text-[12px] text-[var(--color-primary)]">
            {cat.productCount}
          </div>
          <div className="flex justify-center">
            <span
              className={`px-2 py-0.5 font-mono text-[10px] font-semibold ${
                cat.isPublished
                  ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]'
                  : 'text-[var(--color-muted)] bg-[var(--color-deep)]'
              }`}
            >
              {cat.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingId(cat.id)}
              className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            >
              Edit
            </button>
            <DeleteCategoryButton
              id={cat.id}
              locale={locale}
              hasChildren={cat.childCount > 0}
              hasProducts={cat.productCount > 0}
            />
          </div>
        </div>
      )}

      {children.map((child) => (
        <CategoryRows
          key={child.id}
          cat={child}
          children={[]}
          depth={depth + 1}
          editingId={editingId}
          setEditingId={setEditingId}
          parents={parents}
          locale={locale}
        />
      ))}
    </>
  )
}

function CategoryForm({
  locale,
  parents,
  existing,
  onDone,
}: {
  locale: string
  parents: Cat[]
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
      className="bg-white border border-[var(--color-border)] p-5 grid grid-cols-[1fr_180px_100px_100px_140px_auto_auto] gap-3 items-end"
    >
      <input type="hidden" name="locale" value={locale} />
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <Field label="Name *">
        <input
          required
          name="name"
          defaultValue={existing?.name ?? ''}
          placeholder="Hydraulic Pumps"
          className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
        />
      </Field>

      <Field label="Slug" hint="Auto from name">
        <input
          name="slug"
          defaultValue={existing?.slug ?? ''}
          placeholder="hydraulic-pumps"
          className="h-9 px-3 border border-[var(--color-border)] bg-white font-mono text-[12px]"
        />
      </Field>

      <Field label="Position">
        <input
          name="position"
          type="number"
          defaultValue={existing?.position ?? 0}
          className="h-9 px-3 border border-[var(--color-border)] bg-white font-mono text-[12px]"
        />
      </Field>

      <Field label="Parent">
        <select
          name="parentId"
          defaultValue={existing?.parentId ?? ''}
          className="h-9 px-2 border border-[var(--color-border)] bg-white text-[12px]"
        >
          <option value="">— None —</option>
          {parents
            .filter((p) => p.id !== existing?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </Field>

      <label className="flex items-center gap-2 h-9 text-[12px] text-[var(--color-body)]">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={existing?.isPublished ?? false}
        />
        Published
      </label>

      <button
        type="submit"
        disabled={pending}
        className="h-9 px-4 bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Saving…' : existing ? 'Save' : 'Create'}
      </button>

      <button
        type="button"
        onClick={onDone}
        className="h-9 px-3 text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
      >
        Cancel
      </button>

      {error && (
        <p className="col-span-full text-[11px] text-[oklch(0.5_0.18_25)] -mt-2" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

function DeleteCategoryButton({
  id,
  locale,
  hasChildren,
  hasProducts,
}: {
  id: string
  locale: string
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
            const result = await deleteCategory(id, locale)
            if (!result.success) setError(result.message)
          })
        }}
        className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[oklch(0.5_0.18_25)] disabled:opacity-30 disabled:hover:text-[var(--color-muted)] disabled:cursor-not-allowed"
      >
        {pending ? '…' : 'Delete'}
      </button>
      {error && <span className="text-[10px] text-[oklch(0.5_0.18_25)]">{error}</span>}
    </>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-[var(--color-body)]">{label}</span>
      {children}
      {hint && <span className="text-[10px] text-[var(--color-caption)]">{hint}</span>}
    </label>
  )
}
