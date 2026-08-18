'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Field,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@indus/ui'
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="flex h-8 items-center rounded-lg bg-ih-accent px-2.5 text-[14px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover"
        >
          {showCreate ? '× Cancel' : '+ New template'}
        </button>
      </div>

      {showCreate && <CreateTemplateForm onDone={() => setShowCreate(false)} />}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead numeric>Fields</TableHead>
            <TableHead numeric>Products</TableHead>
            <TableHead numeric>Categories</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-14 text-center">
                <p className="mb-3 text-ih-muted">
                  No templates yet. A template defines the typed schema for a category of
                  products — &quot;Hydraulic Hose&quot; defines bore, pressure and construction.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="inline-flex h-8 items-center rounded-lg bg-ih-accent px-2.5 text-[14px] font-medium text-ih-accent-fg hover:bg-ih-accent-hover"
                >
                  + Create your first template
                </button>
              </TableCell>
            </TableRow>
          ) : (
            templates.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Link
                    href={`/admin/spec-templates/${t.id}`}
                    className="font-medium text-ih-ink hover:text-ih-accent"
                  >
                    {t.name}
                  </Link>
                  {t.description && (
                    <div className="mt-0.5 line-clamp-1 text-[12px] text-ih-muted">
                      {t.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-[12px] text-ih-muted">{t.slug}</TableCell>
                <TableCell numeric>{t.fieldCount}</TableCell>
                <TableCell numeric>{t.productCount}</TableCell>
                <TableCell numeric>{t.categoryCount}</TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/spec-templates/${t.id}`}
                      className="text-[12px] text-ih-muted hover:text-ih-ink"
                    >
                      Edit
                    </Link>
                    <DeleteTemplateButton id={t.id} hasProducts={t.productCount > 0} />
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
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
    <form action={onSubmit} className="rounded-lg border border-ih-border bg-ih-surface p-5 grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <Input
            required
            name="name"
            placeholder="Hydraulic Hose"
          />
        </Field>
        <Field label="Slug" hint="Auto-generated from name">
          <Input
            name="slug"
            placeholder="hydraulic-hose"
          className="font-mono"
          />
        </Field>
      </div>
      <Field label="Description">
        <Textarea
          name="description"
          rows={2}
          placeholder="What kinds of products use this template?"
        />
      </Field>
      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 bg-ih-navy text-ih-bg text-[12px] font-medium hover:bg-ih-ink disabled:opacity-50"
        >
          {pending ? 'Creating…' : 'Create template'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-9 px-3 text-[12px] text-ih-muted hover:text-ih-ink"
        >
          Cancel
        </button>
        {error && (
          <span className="font-mono text-[11px] text-ih-danger-ink" role="alert">
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
        className="font-mono text-[11px] text-ih-muted hover:text-ih-danger-ink disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {pending ? '…' : 'Delete'}
      </button>
      {error && <span className="text-[11px] text-ih-danger-ink">{error}</span>}
    </>
  )
}
