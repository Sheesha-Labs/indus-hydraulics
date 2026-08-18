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
  Textarea,
} from '@indus/ui'
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="flex h-8 items-center rounded-lg bg-ih-accent px-2.5 text-[14px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover"
        >
          {showCreate ? '× Cancel' : '+ New industry'}
        </button>
      </div>

      {showCreate && <IndustryForm onDone={() => setShowCreate(false)} />}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead numeric>Accounts</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {industries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-14 text-center text-ih-muted">
                No industries yet — create the first one above.
              </TableCell>
            </TableRow>
          ) : (
            industries.map((ind) =>
              editingId === ind.id ? (
                <TableRow key={ind.id}>
                  <TableCell colSpan={5} className="bg-ih-surface-2 p-4">
                    <IndustryForm existing={ind} onDone={() => setEditingId(null)} />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={ind.id}>
                  <TableCell>
                    <div className="font-medium text-ih-ink">{ind.name}</div>
                    {ind.description && (
                      <div className="mt-0.5 line-clamp-1 text-[12px] text-ih-muted">
                        {ind.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[12px] text-ih-muted">{ind.slug}</TableCell>
                  <TableCell numeric>{ind.accountCount}</TableCell>
                  <TableCell className="text-center">
                    <StatusPill tone={ind.isPublished ? 'good' : 'muted'}>
                      {ind.isPublished ? 'Published' : 'Draft'}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(ind.id)}
                        className="text-[12px] text-ih-muted hover:text-ih-ink"
                      >
                        Edit
                      </button>
                      <Link
                        href={`/admin/industries/${ind.id}/edit`}
                        className="text-[12px] text-ih-muted hover:text-ih-ink"
                        title="Open dedicated SEO editor"
                      >
                        SEO
                      </Link>
                      <DeleteIndustryButton id={ind.id} hasAccounts={ind.accountCount > 0} />
                    </span>
                  </TableCell>
                </TableRow>
              )
            )
          )}
        </TableBody>
      </Table>
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
      className="rounded-lg border border-ih-border bg-ih-surface p-5 grid gap-3"
    >
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <Input
            required
            name="name"
            defaultValue={existing?.name ?? ''}
            placeholder="Oil & Gas"
          />
        </Field>

        <Field label="Slug" hint="Auto-generated from name">
          <Input
            name="slug"
            defaultValue={existing?.slug ?? ''}
            placeholder="oil-gas"
          className="font-mono"
          />
        </Field>
      </div>

      <Field label="Description">
        <Textarea
          name="description"
          defaultValue={existing?.description ?? ''}
          rows={2}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="SEO title">
          <Input
            name="seoTitle"
            defaultValue={existing?.seoTitle ?? ''}
          />
        </Field>
        <Field label="SEO description">
          <Input
            name="seoDescription"
            defaultValue={existing?.seoDescription ?? ''}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 h-9 text-[12px] text-ih-ink-2">
        <Input
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
          className="h-9 px-4 bg-ih-navy text-ih-bg text-[12px] font-medium hover:bg-ih-ink disabled:opacity-50"
        >
          {pending ? 'Saving…' : existing ? 'Save' : 'Create'}
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
        className="font-mono text-[11px] text-ih-muted hover:text-ih-danger-ink disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {pending ? '…' : 'Delete'}
      </button>
      {error && <span className="text-[11px] text-ih-danger-ink">{error}</span>}
    </>
  )
}
