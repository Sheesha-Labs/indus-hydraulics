'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  updateSpecTemplate,
  addTemplateField,
  updateTemplateField,
  deleteTemplateField,
  reorderTemplateField,
} from '../actions'

type FieldRow = {
  id: string
  key: string
  label: string
  unit: string | null
  dataType: 'text' | 'number' | 'boolean' | 'select'
  options: string[] | null
  helpText: string | null
  isRequired: boolean
  isKeyFeature: boolean
  isQuickSpec: boolean
  group: string | null
  position: number
}

type ProductRow = {
  id: string
  sku: string
  title: string
  status: string
  categoryName: string | null
  updatedAt: string
}

type Template = {
  id: string
  slug: string
  name: string
  description: string | null
}

interface Props {
  template: Template
  fields: FieldRow[]
  products: ProductRow[]
  totalProductCount: number
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-ih-success-ink bg-ih-success-soft',
  draft: 'text-ih-muted bg-ih-surface-2',
  discontinued: 'text-ih-danger-ink bg-ih-danger-soft',
}

export default function TemplateEditorClient({
  template,
  fields,
  products,
  totalProductCount,
}: Props) {
  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <Section title="Template details">
        <BasicInfoForm template={template} />
      </Section>

      <Section title={`Fields (${fields.length})`}>
        <FieldManager templateId={template.id} fields={fields} />
      </Section>

      <Section title={`Products using this template (${totalProductCount})`}>
        <AttachedProductsList products={products} totalCount={totalProductCount} />
      </Section>
    </div>
  )
}

// ── Basic info form ────────────────────────────────────────────────────────

function BasicInfoForm({ template }: { template: Template }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function onSubmit(formData: FormData) {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await updateSpecTemplate(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <form action={onSubmit} className="rounded-lg border border-ih-border bg-ih-surface p-5 grid gap-3">
      <input type="hidden" name="id" value={template.id} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <input
            required
            name="name"
            defaultValue={template.name}
            className="h-9 px-3 rounded-lg border border-ih-border bg-ih-surface text-[13px]"
          />
        </Field>
        <Field label="Slug *">
          <input
            required
            name="slug"
            defaultValue={template.slug}
            className="h-9 px-3 rounded-lg border border-ih-border bg-ih-surface font-mono text-[12px]"
          />
        </Field>
      </div>
      <Field label="Description">
        <textarea
          name="description"
          defaultValue={template.description ?? ''}
          rows={2}
          className="px-3 py-2 rounded-lg border border-ih-border bg-ih-surface text-[13px] resize-y"
        />
      </Field>
      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 bg-ih-navy text-ih-bg text-[12px] font-medium hover:bg-ih-ink disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save details'}
        </button>
        {saved && <span className="font-mono text-[11px] text-ih-success-ink">✓ Saved</span>}
        {error && (
          <span className="font-mono text-[11px] text-ih-danger-ink" role="alert">
            {error}
          </span>
        )}
      </div>
    </form>
  )
}

// ── Field manager ──────────────────────────────────────────────────────────

function FieldManager({
  templateId,
  fields,
}: {
  templateId: string
  fields: FieldRow[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] text-ih-muted -mt-2">
        Each field becomes a typed input on the product editor. Toggle <b>Key feature</b> to render it
        as a bullet at the top of the product page; toggle <b>Quick spec</b> to put it in the 6-cell
        spec table.
      </p>

      {fields.length === 0 ? (
        <div className="py-10 rounded-lg border border-ih-border text-center">
          <p className="text-ih-muted mb-3 text-[13px]">No fields yet.</p>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex h-9 px-4 items-center bg-ih-accent text-ih-accent-fg text-[13px] font-medium hover:bg-ih-accent-hover"
          >
            + Add first field
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-ih-border bg-ih-surface">
          <div className="grid grid-cols-[40px_1fr_140px_120px_80px_140px_100px] px-4 py-2.5 bg-ih-bg border-b border-ih-border font-mono text-[10.5px] tracking-[0.1em] uppercase text-ih-muted">
            <div />
            <div>Label / key</div>
            <div>Group</div>
            <div>Type</div>
            <div className="text-center">Unit</div>
            <div className="text-center">Flags</div>
            <div className="text-right" />
          </div>

          {fields.map((f, i) => {
            const isEditing = editingId === f.id
            return (
              <div key={f.id}>
                {isEditing ? (
                  <div className="border-t border-ih-border bg-ih-surface-2 p-4">
                    <FieldForm
                     
                      templateId={templateId}
                      existing={f}
                      onDone={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-[40px_1fr_140px_120px_80px_140px_100px] px-4 py-3 items-center text-[13px] border-t border-ih-border">
                    <div className="flex flex-col gap-0.5">
                      <ReorderButton
                        templateId={templateId}
                        fieldId={f.id}
                       
                        direction="up"
                        disabled={i === 0}
                      />
                      <ReorderButton
                        templateId={templateId}
                        fieldId={f.id}
                       
                        direction="down"
                        disabled={i === fields.length - 1}
                      />
                    </div>
                    <div>
                      <div className="text-ih-ink font-medium">{f.label}</div>
                      <div className="text-[11px] text-ih-muted font-mono mt-0.5">{f.key}</div>
                    </div>
                    <div className="text-[12px] text-ih-ink-2">
                      {f.group ?? <span className="text-ih-muted-2">General</span>}
                    </div>
                    <div className="font-mono text-[11px] text-ih-muted">{f.dataType}</div>
                    <div className="text-center font-mono text-[11px] text-ih-muted">
                      {f.unit ?? '—'}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {f.isKeyFeature && <Pill tone="ok">Key</Pill>}
                      {f.isQuickSpec && <Pill tone="info">Quick</Pill>}
                      {f.isRequired && <Pill tone="warn">Req</Pill>}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(f.id)}
                        className="font-mono text-[11px] text-ih-muted hover:text-ih-ink"
                      >
                        Edit
                      </button>
                      <DeleteFieldButton fieldId={f.id} templateId={templateId} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {fields.length > 0 && !showAdd && !editingId && (
        <div>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="h-9 px-4 bg-ih-accent text-ih-accent-fg text-[12px] font-medium hover:bg-ih-accent-hover"
          >
            + Add field
          </button>
        </div>
      )}

      {showAdd && (
        <FieldForm templateId={templateId} onDone={() => setShowAdd(false)} />
      )}
    </div>
  )
}

function FieldForm({
  templateId,
  existing,
  onDone,
}: {
  templateId: string
  existing?: FieldRow
  onDone: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [dataType, setDataType] = useState<FieldRow['dataType']>(existing?.dataType ?? 'text')
  const [isKeyFeature, setIsKeyFeature] = useState<boolean>(existing?.isKeyFeature ?? false)
  const [isQuickSpec, setIsQuickSpec] = useState<boolean>(existing?.isQuickSpec ?? false)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = existing ? await updateTemplateField(formData) : await addTemplateField(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      onDone()
    })
  }

  return (
    <form action={onSubmit} className="rounded-lg border border-ih-border bg-ih-surface p-5 grid gap-3">
      <input type="hidden" name="templateId" value={templateId} />
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Label *" hint="Display name shown to admins and customers">
          <input
            required
            name="label"
            defaultValue={existing?.label ?? ''}
            placeholder="Operating pressure"
            className="h-9 px-3 rounded-lg border border-ih-border bg-ih-surface text-[13px]"
          />
        </Field>
        <Field
          label="Key"
          hint={
            existing
              ? 'Locked once products use this field — only editable while unreferenced.'
              : 'Auto-generated from label (machine name)'
          }
        >
          <input
            name="key"
            defaultValue={existing?.key ?? ''}
            placeholder="operating_pressure"
            className="h-9 px-3 rounded-lg border border-ih-border bg-ih-surface font-mono text-[12px]"
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Data type">
          <select
            name="dataType"
            value={dataType}
            onChange={(e) => setDataType(e.target.value as FieldRow['dataType'])}
            className="h-9 px-2 rounded-lg border border-ih-border bg-ih-surface text-[13px]"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Yes / No</option>
            <option value="select">Select (dropdown)</option>
          </select>
        </Field>
        <Field label="Unit" hint="e.g. bar, mm, kg">
          <input
            name="unit"
            defaultValue={existing?.unit ?? ''}
            placeholder="bar"
            className="h-9 px-3 rounded-lg border border-ih-border bg-ih-surface font-mono text-[12px]"
          />
        </Field>
        <Field label="Group" hint="Section header in the tech-specs tab">
          <input
            name="group"
            defaultValue={existing?.group ?? ''}
            placeholder="Hydraulic performance"
            className="h-9 px-3 rounded-lg border border-ih-border bg-ih-surface text-[13px]"
          />
        </Field>
      </div>

      {dataType === 'select' && (
        <Field label="Options *" hint="One per line">
          <textarea
            name="options"
            defaultValue={existing?.options?.join('\n') ?? ''}
            rows={4}
            placeholder={'1-wire\n2-wire\nspiral'}
            className="px-3 py-2 rounded-lg border border-ih-border bg-ih-surface text-[13px] font-mono resize-y"
          />
        </Field>
      )}

      <Field label="Help text" hint="Optional — shown under the input on the product editor">
        <input
          name="helpText"
          defaultValue={existing?.helpText ?? ''}
          className="h-9 px-3 rounded-lg border border-ih-border bg-ih-surface text-[13px]"
        />
      </Field>

      <div className="grid grid-cols-[1fr_auto] gap-6 pt-1 items-center">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <label className="flex items-center gap-1.5 text-[12px] text-ih-ink-2">
            <input
              type="checkbox"
              name="isRequired"
              defaultChecked={existing?.isRequired ?? false}
            />
            Required
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-ih-ink-2">
            <input
              type="checkbox"
              name="isKeyFeature"
              checked={isKeyFeature}
              onChange={(e) => setIsKeyFeature(e.target.checked)}
            />
            Key feature (PDP bullet)
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-ih-ink-2">
            <input
              type="checkbox"
              name="isQuickSpec"
              checked={isQuickSpec}
              onChange={(e) => setIsQuickSpec(e.target.checked)}
            />
            Quick spec (top-of-PDP table)
          </label>
        </div>
        <PdpZonePreview isKeyFeature={isKeyFeature} isQuickSpec={isQuickSpec} />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 bg-ih-navy text-ih-bg text-[12px] font-medium hover:bg-ih-ink disabled:opacity-50"
        >
          {pending ? 'Saving…' : existing ? 'Save field' : 'Add field'}
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

/**
 * Mini wireframe of the storefront PDP. The "Key feature" zone (top of the
 * info column, bullet list) and the "Quick spec" zone (6-cell grid below it)
 * highlight in the accent colour when the matching toggle is on, so admins
 * can see at a glance where the field will land.
 */
function PdpZonePreview({
  isKeyFeature,
  isQuickSpec,
}: {
  isKeyFeature: boolean
  isQuickSpec: boolean
}) {
  const off = 'rounded-lg border border-ih-border bg-ih-surface-2'
  const onHi =
    'border border-ih-accent bg-[oklch(0.96_0.06_70)] ring-1 ring-ih-accent'
  return (
    <div className="flex items-start gap-3">
      <div className="w-[180px] rounded-lg border border-ih-border bg-ih-surface p-2 flex flex-col gap-1.5 select-none">
        <div className="flex gap-2">
          {/* Image placeholder */}
          <div className="w-[72px] h-[80px] bg-ih-surface-2 border border-ih-border shrink-0" />
          {/* Info column */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="h-1.5 w-2/3 bg-ih-border" />
            <div className="h-1 w-1/2 bg-[var(--color-ih-border)]" />
            <div className="h-px bg-[var(--color-ih-border)] my-0.5" />
            {/* Key feature zone — bullets */}
            <div className={`p-1 ${isKeyFeature ? onHi : off}`}>
              <div className="flex flex-col gap-0.5">
                <div className="h-1 w-full bg-ih-border" />
                <div className="h-1 w-4/5 bg-ih-border" />
                <div className="h-1 w-3/4 bg-ih-border" />
              </div>
            </div>
            {/* Quick spec zone — 6-cell grid */}
            <div className={`p-1 grid grid-cols-3 gap-px ${isQuickSpec ? onHi : off}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 bg-ih-surface" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 pt-0.5 text-[10.5px] font-mono tracking-[0.04em] text-ih-muted min-w-[120px]">
        <div className="font-medium text-ih-muted-2 uppercase mb-0.5">
          Renders here
        </div>
        <div className={isKeyFeature ? 'text-ih-accent font-medium' : ''}>
          {isKeyFeature ? '● Key-feature bullet' : '○ Key feature off'}
        </div>
        <div className={isQuickSpec ? 'text-ih-accent font-medium' : ''}>
          {isQuickSpec ? '● Quick-spec cell' : '○ Quick spec off'}
        </div>
        {!isKeyFeature && !isQuickSpec && (
          <div className="text-ih-muted-2 mt-1 leading-[1.3] normal-case font-sans">
            Field still appears in the Description tab spec table.
          </div>
        )}
      </div>
    </div>
  )
}

function ReorderButton({
  templateId,
  fieldId,
  direction,
  disabled,
}: {
  templateId: string
  fieldId: string
  direction: 'up' | 'down'
  disabled: boolean
}) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending || disabled}
      onClick={() =>
        startTransition(async () => {
          await reorderTemplateField(fieldId, direction, templateId)
        })
      }
      title={direction === 'up' ? 'Move up' : 'Move down'}
      className="font-mono text-[11px] text-ih-muted hover:text-ih-ink disabled:opacity-30"
    >
      {direction === 'up' ? '↑' : '↓'}
    </button>
  )
}

function DeleteFieldButton({
  fieldId,
  templateId,
}: {
  fieldId: string
  templateId: string
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !confirm(
              'Delete this field? Existing values on products will become "additional specs" rather than vanish.',
            )
          )
            return
          setError(null)
          startTransition(async () => {
            const res = await deleteTemplateField(fieldId, templateId)
            if (!res.success) setError(res.message)
          })
        }}
        className="font-mono text-[11px] text-ih-muted hover:text-ih-danger-ink disabled:opacity-30"
      >
        {pending ? '…' : 'Delete'}
      </button>
      {error && <span className="text-[11px] text-ih-danger-ink">{error}</span>}
    </>
  )
}

// ── Attached products ──────────────────────────────────────────────────────

function AttachedProductsList({
  products,
  totalCount,
}: {
  products: ProductRow[]
  totalCount: number
}) {
  if (totalCount === 0) {
    return (
      <p className="text-[13px] text-ih-muted py-4">
        No products use this template yet. When you create or edit a product and pick this template,
        it will show up here.
      </p>
    )
  }

  return (
    <div className="rounded-lg border border-ih-border bg-ih-surface">
      <div className="grid grid-cols-[140px_1fr_140px_100px_100px] px-4 py-2.5 bg-ih-bg border-b border-ih-border font-mono text-[10.5px] tracking-[0.1em] uppercase text-ih-muted">
        <div>SKU</div>
        <div>Title</div>
        <div>Category</div>
        <div className="text-center">Status</div>
        <div className="text-right">Updated</div>
      </div>

      {products.map((p) => (
        <Link
          key={p.id}
          href={`/admin/products/${p.id}/edit`}
          className="grid grid-cols-[140px_1fr_140px_100px_100px] px-4 py-3 items-center text-[13px] border-t border-ih-border hover:bg-ih-surface-2 transition-colors"
        >
          <div className="font-mono text-[12px] text-ih-muted truncate">{p.sku}</div>
          <div className="text-ih-ink font-medium truncate">{p.title}</div>
          <div className="text-[12px] text-ih-ink-2 truncate">
            {p.categoryName ?? <span className="text-ih-muted-2">—</span>}
          </div>
          <div className="flex justify-center">
            <span className={`px-2 py-0.5 font-mono text-[11px] font-medium capitalize ${STATUS_COLORS[p.status] ?? ''}`}>
              {p.status}
            </span>
          </div>
          <div className="text-right font-mono text-[11px] text-ih-muted">
            {new Date(p.updatedAt).toLocaleDateString()}
          </div>
        </Link>
      ))}

      {totalCount > products.length && (
        <div className="px-4 py-3 border-t border-ih-border text-[12px] text-ih-muted">
          Showing first {products.length} of {totalCount}.
        </div>
      )}
    </div>
  )
}

// ── Bits ────────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[14px] font-medium mb-3 text-ih-ink">{title}</h2>
      {children}
    </div>
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
      <span className="text-[11px] font-medium text-ih-ink-2">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ih-muted-2">{hint}</span>}
    </label>
  )
}

function Pill({ children, tone }: { children: React.ReactNode; tone: 'ok' | 'warn' | 'info' }) {
  const cls =
    tone === 'ok'
      ? 'text-ih-success-ink bg-ih-success-soft'
      : tone === 'warn'
        ? 'text-[oklch(0.5_0.15_60)] bg-[oklch(0.97_0.04_60)]'
        : 'text-ih-accent bg-[oklch(0.96_0.05_240)]'
  return (
    <span className={`inline-block px-1.5 py-0.5 font-mono text-[10.5px] font-medium uppercase ${cls}`}>
      {children}
    </span>
  )
}
