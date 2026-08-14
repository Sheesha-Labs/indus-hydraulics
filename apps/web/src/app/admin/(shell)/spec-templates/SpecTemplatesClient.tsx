'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createSpecTemplate, deleteSpecTemplate } from './actions'

type TemplateRow = {
  id: string
  slug: string
  name: string
  description: string | null
  fieldCount: number
  productCount: number
  categoryCount: number
}

interface Props {
  templates: TemplateRow[]
}

export default function SpecTemplatesClient({ templates }: Props) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="h-9 px-4 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90"
        >
          {showCreate ? '× Cancel' : '+ New template'}
        </button>
      </div>

      {showCreate && <CreateTemplateForm onDone={() => setShowCreate(false)} />}

      {templates.length === 0 ? (
        <div className="py-16 border border-dashed border-[var(--color-border)] text-center">
          <p className="text-[var(--color-muted)] mb-3">
            No templates yet. Templates define the typed schema for a category of products
            (e.g. &quot;Hydraulic Hose&quot; defines bore, pressure, and construction fields).
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex h-9 px-4 items-center bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90"
          >
            + Create your first template
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-border)]">
          <div className="grid grid-cols-[1fr_140px_80px_100px_100px_100px] px-4 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
            <div>Name</div>
            <div>Slug</div>
            <div className="text-center">Fields</div>
            <div className="text-center">Products</div>
            <div className="text-center">Categories</div>
            <div className="text-right" />
          </div>

          {templates.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-[1fr_140px_80px_100px_100px_100px] px-4 py-3 items-center text-[13px] border-t border-[var(--color-border)] hover:bg-[var(--color-deep)] transition-colors"
            >
              <div>
                <Link
                  href={`/admin/spec-templates/${t.id}`}
                  className="text-[var(--color-primary)] font-medium hover:text-[var(--color-accent)]"
                >
                  {t.name}
                </Link>
                {t.description && (
                  <div className="text-[11px] text-[var(--color-muted)] mt-0.5 line-clamp-1">
                    {t.description}
                  </div>
                )}
              </div>
              <div className="font-mono text-[11px] text-[var(--color-muted)]">{t.slug}</div>
              <div className="text-center font-mono text-[12px] text-[var(--color-primary)]">
                {t.fieldCount}
              </div>
              <div className="text-center font-mono text-[12px] text-[var(--color-primary)]">
                {t.productCount}
              </div>
              <div className="text-center font-mono text-[12px] text-[var(--color-primary)]">
                {t.categoryCount}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/spec-templates/${t.id}`}
                  className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  Edit
                </Link>
                <DeleteTemplateButton id={t.id} hasProducts={t.productCount > 0} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateTemplateForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await createSpecTemplate(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      onDone()
    })
  }

  return (
    <form action={onSubmit} className="bg-white border border-[var(--color-border)] p-5 grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <input
            required
            name="name"
            placeholder="Hydraulic Hose"
            className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
          />
        </Field>
        <Field label="Slug" hint="Auto-generated from name">
          <input
            name="slug"
            placeholder="hydraulic-hose"
            className="h-9 px-3 border border-[var(--color-border)] bg-white font-mono text-[12px]"
          />
        </Field>
      </div>
      <Field label="Description">
        <textarea
          name="description"
          rows={2}
          placeholder="What kinds of products use this template?"
          className="px-3 py-2 border border-[var(--color-border)] bg-white text-[13px] resize-y"
        />
      </Field>
      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Creating…' : 'Create template'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-9 px-3 text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
        >
          Cancel
        </button>
        {error && (
          <span className="font-mono text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
            {error}
          </span>
        )}
      </div>
    </form>
  )
}

function DeleteTemplateButton({
  id,
  hasProducts,
}: {
  id: string
  hasProducts: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      <button
        type="button"
        disabled={pending || hasProducts}
        title={hasProducts ? 'Cannot delete: products use this template' : 'Delete template'}
        onClick={() => {
          if (!confirm('Delete this template?')) return
          setError(null)
          startTransition(async () => {
            const res = await deleteSpecTemplate(id)
            if (!res.success) setError(res.message)
          })
        }}
        className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[oklch(0.5_0.18_25)] disabled:opacity-30 disabled:cursor-not-allowed"
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
