'use client'

import { useState, useTransition } from 'react'
import { createIndustry, updateIndustry, deleteIndustry } from './actions'

type Industry = {
  id: string
  slug: string
  name: string
  description: string | null
  seoTitle: string | null
  seoDescription: string | null
  isPublished: boolean
  accountCount: number
}

interface Props {
  industries: Industry[]
}

export default function IndustriesClient({ industries }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="h-9 px-4 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90"
        >
          {showCreate ? '× Cancel' : '+ New industry'}
        </button>
      </div>

      {showCreate && <IndustryForm onDone={() => setShowCreate(false)} />}

      {industries.length === 0 ? (
        <div className="py-16 border border-dashed border-[var(--color-border)] text-center">
          <p className="text-[var(--color-muted)]">No industries yet — create the first one above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-border)]">
          <div className="grid grid-cols-[1fr_140px_80px_100px_120px] px-4 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
            <div>Name</div>
            <div>Slug</div>
            <div className="text-center">Accounts</div>
            <div className="text-center">Status</div>
            <div className="text-right" />
          </div>

          {industries.map((ind) => {
            const isEditing = editingId === ind.id
            return (
              <div key={ind.id}>
                {isEditing ? (
                  <div className="border-t border-[var(--color-border)] bg-[var(--color-deep)] p-4">
                    <IndustryForm existing={ind} onDone={() => setEditingId(null)} />
                  </div>
                ) : (
                  <div className="grid grid-cols-[1fr_140px_80px_100px_120px] px-4 py-3 items-center text-[13px] border-t border-[var(--color-border)]">
                    <div>
                      <div className="text-[var(--color-primary)] font-medium">{ind.name}</div>
                      {ind.description && (
                        <div className="text-[11px] text-[var(--color-muted)] mt-0.5 line-clamp-1">
                          {ind.description}
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--color-muted)]">{ind.slug}</div>
                    <div className="text-center font-mono text-[12px] text-[var(--color-primary)]">
                      {ind.accountCount}
                    </div>
                    <div className="flex justify-center">
                      <span
                        className={`px-2 py-0.5 font-mono text-[10px] font-semibold ${
                          ind.isPublished
                            ? 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]'
                            : 'text-[var(--color-muted)] bg-[var(--color-deep)]'
                        }`}
                      >
                        {ind.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(ind.id)}
                        className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                      >
                        Edit
                      </button>
                      <DeleteIndustryButton
                        id={ind.id}
                       
                        hasAccounts={ind.accountCount > 0}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function IndustryForm({
  existing,
  onDone,
}: {
  existing?: Industry
  onDone: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = existing ? await updateIndustry(formData) : await createIndustry(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      onDone()
    })
  }

  return (
    <form
      action={onSubmit}
      className="bg-white border border-[var(--color-border)] p-5 grid gap-3"
    >
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <input
            required
            name="name"
            defaultValue={existing?.name ?? ''}
            placeholder="Oil & Gas"
            className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
          />
        </Field>

        <Field label="Slug" hint="Auto-generated from name">
          <input
            name="slug"
            defaultValue={existing?.slug ?? ''}
            placeholder="oil-gas"
            className="h-9 px-3 border border-[var(--color-border)] bg-white font-mono text-[12px]"
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          name="description"
          defaultValue={existing?.description ?? ''}
          rows={2}
          className="px-3 py-2 border border-[var(--color-border)] bg-white text-[13px] resize-y"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="SEO title">
          <input
            name="seoTitle"
            defaultValue={existing?.seoTitle ?? ''}
            className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
          />
        </Field>
        <Field label="SEO description">
          <input
            name="seoDescription"
            defaultValue={existing?.seoDescription ?? ''}
            className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 h-9 text-[12px] text-[var(--color-body)]">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={existing?.isPublished ?? false}
        />
        Published (visible on storefront)
      </label>

      <div className="flex items-center gap-2 pt-2">
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
          <span className="font-mono text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
            {error}
          </span>
        )}
      </div>
    </form>
  )
}

function DeleteIndustryButton({
  id,
  hasAccounts,
}: {
  id: string
  hasAccounts: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      <button
        type="button"
        disabled={pending || hasAccounts}
        title={hasAccounts ? 'Cannot delete: accounts reference this industry' : 'Delete industry'}
        onClick={() => {
          if (!confirm('Delete this industry?')) return
          setError(null)
          startTransition(async () => {
            const res = await deleteIndustry(id)
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
