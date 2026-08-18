'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { createBrand, updateBrand, deleteBrand } from './actions'
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

type Brand = {
  id: string
  slug: string
  name: string
  country: string | null
  description: string | null
  isAuthorizedDistributor: boolean
  seoTitle: string | null
  seoDescription: string | null
  isPublished: boolean
  productCount: number
}

interface Props {
  brands: Brand[]
}

export default function BrandsClient({ brands }: Props) {
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
          {showCreate ? '× Cancel' : '+ New brand'}
        </button>
      </div>

      {showCreate && <BrandForm onDone={() => setShowCreate(false)} />}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[34%]">Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Country</TableHead>
            <TableHead className="text-center">Auth.</TableHead>
            <TableHead numeric>Products</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-14 text-center text-ih-muted">
                No brands yet — create the first one above.
              </TableCell>
            </TableRow>
          ) : (
            brands.map((b) =>
              editingId === b.id ? (
                /*
                  The edit form replaces the row in place, spanning every
                  column. A <tr> is the only child a <tbody> may have, so the
                  form cannot sit beside the row — it has to BE one.
                */
                <TableRow key={b.id}>
                  <TableCell colSpan={7} className="bg-ih-surface-2 p-4">
                    <BrandForm existing={b} onDone={() => setEditingId(null)} />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="font-medium text-ih-ink">{b.name}</div>
                    {b.description && (
                      <div className="mt-0.5 line-clamp-1 text-[12px] text-ih-muted">
                        {b.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[12px] text-ih-muted">{b.slug}</TableCell>
                  <TableCell className="text-ih-ink-2">
                    {b.country ?? <span className="text-ih-muted-2">—</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    {b.isAuthorizedDistributor ? (
                      <StatusPill tone="info">Auth</StatusPill>
                    ) : (
                      <span className="text-ih-muted-2">—</span>
                    )}
                  </TableCell>
                  <TableCell numeric>{b.productCount}</TableCell>
                  <TableCell className="text-center">
                    <StatusPill tone={b.isPublished ? 'good' : 'muted'}>
                      {b.isPublished ? 'Published' : 'Draft'}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(b.id)}
                        className="text-[12px] text-ih-muted hover:text-ih-ink"
                      >
                        Edit
                      </button>
                      <Link
                        href={`/admin/brands/${b.id}/edit`}
                        className="text-[12px] text-ih-muted hover:text-ih-ink"
                        title="Open dedicated SEO editor"
                      >
                        SEO
                      </Link>
                      <DeleteBrandButton id={b.id} hasProducts={b.productCount > 0} />
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

function BrandForm({
  existing,
  onDone,
}: {
  existing?: Brand
  onDone: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = existing ? await updateBrand(formData) : await createBrand(formData)
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
      className="bg-ih-surface border border-ih-border p-5 grid gap-3"
    >
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <Input
            required
            name="name"
            defaultValue={existing?.name ?? ''}
            placeholder="Bosch Rexroth"
          />
        </Field>

        <Field label="Slug" hint="Auto-generated from name">
          <Input
            name="slug"
            defaultValue={existing?.slug ?? ''}
            placeholder="bosch-rexroth"
          className="font-mono"
          />
        </Field>
      </div>

      <Field label="Country">
        <Input
          name="country"
          defaultValue={existing?.country ?? ''}
          placeholder="Germany"
        />
      </Field>

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
          name="isAuthorizedDistributor"
          defaultChecked={existing?.isAuthorizedDistributor ?? false}
        />
        Authorized distributor (shows trust badge on storefront)
      </label>

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

function DeleteBrandButton({
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
        title={hasProducts ? 'Cannot delete: products reference this brand' : 'Delete brand'}
        onClick={() => {
          if (!confirm('Delete this brand?')) return
          setError(null)
          startTransition(async () => {
            const res = await deleteBrand(id)
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
