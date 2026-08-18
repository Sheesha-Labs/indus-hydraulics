'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { BlogBlockSchema, type BlogBlockInput } from '@indus/domain'
import { newRow } from './block-fields'
import type { BlockFormSpec, Field, ScalarField } from './block-fields'

type Props = {
  spec: BlockFormSpec
  value: BlogBlockInput
  onCancel: () => void
  onSave: (next: BlogBlockInput) => void
}

type Draft = Record<string, unknown>

/**
 * The editing surface for one structured block.
 *
 * Generic over `block-fields.ts` rather than one component per block type, and
 * validated by `BlogBlockSchema` on save — the same schema the server re-runs
 * and the renderer trusts. Saving an invalid block would be worse than a
 * blocked dialog: `parseBlogBlocks` drops it on the way out, so the block
 * would simply vanish from the article with nothing said.
 *
 * Hand-rolled overlay: no dialog primitive is installed here, so the focus
 * trap, Escape handling and focus restoration are this component's own job
 * (CLAUDE.md §10.5).
 */
export default function BlockFormDialog({ spec, value, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState<Draft>(() => structuredClone(value) as Draft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const idPrefix = useId()

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null
    const timer = window.setTimeout(
      () => dialogRef.current?.querySelector<HTMLElement>('input, textarea, select')?.focus(),
      0,
    )
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
      if (event.key !== 'Tab') return
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, select, textarea',
      )
      const first = focusables?.[0]
      const last = focusables?.[focusables.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function close() {
    onCancel()
    returnFocusRef.current?.focus()
  }

  function set(key: string, next: unknown) {
    setDraft((cur) => ({ ...cur, [key]: next }))
  }

  function save() {
    setErrors({})
    setFormError(null)
    // Empty optional fields are stripped rather than stored as "": the schema
    // treats an empty string as a value for some fields and as a failure for
    // others, and a stored "" renders as a blank heading on the article.
    const cleaned = stripEmpty(draft)
    const parsed = BlogBlockSchema.safeParse(cleaned)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) fieldErrors[path] = readable(issue)
      }
      setErrors(fieldErrors)
      const count = Object.keys(fieldErrors).length
      setFormError(
        count === 1
          ? Object.values(fieldErrors)[0] ?? 'Something is missing.'
          : `${count} fields need attention.`,
      )
      return
    }
    onSave(cleaned as BlogBlockInput)
    returnFocusRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ih-navy/40 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${idPrefix}-title`}
        className="flex max-h-[88vh] w-full max-w-[720px] flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-ih-border px-5 py-3.5">
          <div>
            <h2 id={`${idPrefix}-title`} className="text-[15px] font-medium text-ih-ink">
              {spec.label}
            </h2>
            <p className="mt-0.5 max-w-[60ch] text-[12px] text-ih-muted">{spec.purpose}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ih-muted hover:bg-ih-surface-2 hover:text-ih-ink"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          {spec.fields.map((field) => (
            <FieldView
              key={field.key}
              field={field}
              idPrefix={idPrefix}
              value={draft[field.key]}
              draft={draft}
              errors={errors}
              onChange={(next) => set(field.key, next)}
              onChangeKey={set}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-ih-border px-5 py-3">
          <span className="text-[12px] text-ih-danger">{formError}</span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={close}
              className="h-9 rounded-md border border-ih-border px-4 text-[13px] font-medium text-ih-ink-2 transition-colors hover:bg-ih-surface-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="h-9 rounded-md bg-ih-accent px-4 text-[13px] font-medium text-ih-accent-fg transition-opacity hover:bg-ih-accent-hover"
            >
              Done
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Zod's own wording, made answerable.
 *
 * A blank required field is stripped before validation, so Zod reports it as
 * "expected string, received undefined" — true, and no help at all to someone
 * who just needs to know the field is required.
 */
function readable(issue: {
  code: string
  message: string
  origin?: string
  minimum?: number | bigint
  maximum?: number | bigint
}): string {
  if (issue.code === 'invalid_type') return 'Required.'
  if (issue.code === 'too_small') {
    const min = Number(issue.minimum ?? 0)
    if (issue.origin === 'array') return `Add at least ${min}.`
    return min <= 1 ? 'Required.' : `Too short — at least ${min} characters.`
  }
  if (issue.code === 'too_big') {
    const max = Number(issue.maximum ?? 0)
    return issue.origin === 'array' ? `At most ${max}.` : `Too long — ${max} characters maximum.`
  }
  return issue.message
}

// ── Fields ────────────────────────────────────────────────────────────────

function FieldView({
  field,
  idPrefix,
  value,
  draft,
  errors,
  onChange,
  onChangeKey,
}: {
  field: Field
  idPrefix: string
  value: unknown
  draft: Draft
  errors: Record<string, string>
  onChange: (next: unknown) => void
  onChangeKey: (key: string, next: unknown) => void
}) {
  const id = `${idPrefix}-${field.key}`
  // Zod reports issue paths as `phases.0.rows.1.task`, so error lookup is keyed
  // the same way all the way down rather than being reassembled per level.
  const error = errors[field.key]

  if (field.kind === 'matrix') {
    return (
      <MatrixField
        idPrefix={idPrefix}
        label={field.label}
        hint={field.hint}
        columns={(draft.columns as string[]) ?? []}
        rows={(draft.rows as Array<{ cells: string[]; highlight?: boolean }>) ?? []}
        error={errors.rows ?? errors.columns}
        onColumns={(next) => onChangeKey('columns', next)}
        onRows={(next) => onChangeKey('rows', next)}
      />
    )
  }

  if (field.kind === 'strings') {
    const items = Array.isArray(value) ? (value as string[]) : []
    return (
      <fieldset className="flex flex-col gap-2">
        <Legend label={field.label} hint={field.hint} />
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <label htmlFor={`${id}-${i}`} className="sr-only">
              {field.itemLabel} {i + 1}
            </label>
            <input
              id={`${id}-${i}`}
              value={item}
              placeholder={field.placeholder}
              onChange={(e) => {
                const next = [...items]
                next[i] = e.target.value
                onChange(next)
              }}
              className="h-9 flex-1 rounded-md border border-ih-border bg-ih-bg px-2.5 text-[13px] outline-none focus:border-ih-accent"
            />
            <RemoveButton
              disabled={items.length <= field.min}
              label={`Remove ${field.itemLabel.toLowerCase()} ${i + 1}`}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            />
          </div>
        ))}
        <AddButton
          disabled={items.length >= field.max}
          label={`Add ${field.itemLabel.toLowerCase()}`}
          onClick={() => onChange([...items, ''])}
        />
        <FieldError message={error} />
      </fieldset>
    )
  }

  if (field.kind === 'rows') {
    const rows = Array.isArray(value) ? (value as Draft[]) : []
    return (
      <fieldset className="flex flex-col gap-3">
        <Legend label={field.label} hint={field.hint} />
        {rows.map((row, i) => (
          <div key={i} className="rounded-md border border-ih-border bg-ih-bg p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-ih-muted">
                {field.itemLabel} {i + 1}
              </span>
              <RemoveButton
                disabled={rows.length <= field.min}
                label={`Remove ${field.itemLabel.toLowerCase()} ${i + 1}`}
                onClick={() => onChange(rows.filter((_, j) => j !== i))}
              />
            </div>
            <div className="flex flex-col gap-2.5">
              {field.fields.map((sub) => (
                <ScalarFieldView
                  key={sub.key}
                  field={sub}
                  id={`${id}-${i}-${sub.key}`}
                  value={row[sub.key]}
                  error={errors[`${field.key}.${i}.${sub.key}`]}
                  onChange={(next) => {
                    const copy = [...rows]
                    copy[i] = { ...row, [sub.key]: next }
                    onChange(copy)
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        <AddButton
          disabled={rows.length >= field.max}
          label={`Add ${field.itemLabel.toLowerCase()}`}
          onClick={() => onChange([...rows, newRow(field.fields)])}
        />
        <FieldError message={error} />
      </fieldset>
    )
  }

  if (field.kind === 'object') {
    const obj = (value && typeof value === 'object' ? value : {}) as Draft
    return (
      <fieldset className="flex flex-col gap-2.5 rounded-md border border-ih-border bg-ih-bg p-3">
        <Legend label={field.label} hint={field.hint} />
        {field.fields.map((sub) => (
          <ScalarFieldView
            key={sub.key}
            field={sub}
            id={`${id}-${sub.key}`}
            value={obj[sub.key]}
            error={errors[`${field.key}.${sub.key}`]}
            onChange={(next) => onChange({ ...obj, [sub.key]: next })}
          />
        ))}
      </fieldset>
    )
  }

  if (field.kind === 'groups') {
    const groups = Array.isArray(value) ? (value as Draft[]) : []
    const setGroup = (i: number, next: Draft) => {
      const copy = [...groups]
      copy[i] = next
      onChange(copy)
    }
    return (
      <fieldset className="flex flex-col gap-3">
        <Legend label={field.label} hint={field.hint} />
        {groups.map((group, i) => {
          const nested = Array.isArray(group[field.nested.key])
            ? (group[field.nested.key] as Draft[])
            : []
          return (
            <div key={i} className="rounded-md border border-ih-border bg-ih-bg p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-ih-muted">
                  {field.itemLabel} {i + 1}
                </span>
                <RemoveButton
                  disabled={groups.length <= field.min}
                  label={`Remove ${field.itemLabel.toLowerCase()} ${i + 1}`}
                  onClick={() => onChange(groups.filter((_, j) => j !== i))}
                />
              </div>

              <div className="flex flex-col gap-2.5">
                {field.fields.map((sub) => (
                  <ScalarFieldView
                    key={sub.key}
                    field={sub}
                    id={`${id}-${i}-${sub.key}`}
                    value={group[sub.key]}
                    error={errors[`${field.key}.${i}.${sub.key}`]}
                    onChange={(next) => setGroup(i, { ...group, [sub.key]: next })}
                  />
                ))}
              </div>

              {/* The nested list is indented and rule-bordered so the two
                  levels stay legible — a flat stack of task cards inside a
                  stack of phase cards reads as one long list. */}
              <div className="mt-3 flex flex-col gap-2 border-l-2 border-ih-border pl-3">
                {nested.map((row, j) => (
                  <div key={j} className="rounded-md border border-ih-border bg-ih-surface p-2.5">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-ih-muted-2">
                        {field.nested.itemLabel} {j + 1}
                      </span>
                      <RemoveButton
                        disabled={nested.length <= field.nested.min}
                        label={`Remove ${field.nested.itemLabel.toLowerCase()} ${j + 1} of ${field.itemLabel.toLowerCase()} ${i + 1}`}
                        onClick={() =>
                          setGroup(i, {
                            ...group,
                            [field.nested.key]: nested.filter((_, k) => k !== j),
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      {field.nested.fields.map((sub) => (
                        <ScalarFieldView
                          key={sub.key}
                          field={sub}
                          id={`${id}-${i}-${field.nested.key}-${j}-${sub.key}`}
                          value={row[sub.key]}
                          error={
                            errors[`${field.key}.${i}.${field.nested.key}.${j}.${sub.key}`]
                          }
                          onChange={(next) => {
                            const rows = [...nested]
                            rows[j] = { ...row, [sub.key]: next }
                            setGroup(i, { ...group, [field.nested.key]: rows })
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <AddButton
                  disabled={nested.length >= field.nested.max}
                  label={`Add ${field.nested.itemLabel.toLowerCase()}`}
                  onClick={() =>
                    setGroup(i, {
                      ...group,
                      [field.nested.key]: [...nested, newRow(field.nested.fields)],
                    })
                  }
                />
              </div>
            </div>
          )
        })}
        <AddButton
          disabled={groups.length >= field.max}
          label={`Add ${field.itemLabel.toLowerCase()}`}
          onClick={() =>
            onChange([
              ...groups,
              { ...newRow(field.fields), [field.nested.key]: [newRow(field.nested.fields)] },
            ])
          }
        />
        <FieldError message={error} />
      </fieldset>
    )
  }

  return <ScalarFieldView field={field} id={id} value={value} error={error} onChange={onChange} />
}

function ScalarFieldView({
  field,
  id,
  value,
  error,
  onChange,
}: {
  field: ScalarField
  id: string
  value: unknown
  error?: string
  onChange: (next: unknown) => void
}) {
  const text = typeof value === 'string' ? value : ''

  // The checkbox puts its label beside the control rather than above it, and
  // wraps nothing — `htmlFor` still carries the association, so clicking the
  // words toggles the box.
  if (field.kind === 'checkbox') {
    return (
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          // An absent value means the schema's default applies on save, so the
          // box has to show that default rather than reading as unticked.
          checked={value === undefined ? field.default : value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded-[3px] border-ih-border accent-[var(--color-ih-accent)]"
        />
        <label htmlFor={id} className="text-[12.5px] text-ih-ink-2">
          {field.label}
        </label>
        {field.hint ? <span className="text-[11px] text-ih-muted-2">{field.hint}</span> : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted"
      >
        {field.label}
        {'required' in field && field.required ? ' *' : ''}
      </label>
      {field.kind === 'select' ? (
        <select
          id={id}
          value={text || field.default}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-ih-border bg-ih-surface px-2 text-[13px] outline-none focus:border-ih-accent"
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.kind === 'textarea' ? (
        <textarea
          id={id}
          rows={field.rows ?? 3}
          value={text}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-y rounded-md border border-ih-border bg-ih-bg px-2.5 py-2 text-[13px] leading-[1.6] outline-none focus:border-ih-accent"
        />
      ) : (
        <input
          id={id}
          value={text}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`h-9 w-full rounded-md border border-ih-border bg-ih-bg px-2.5 text-[13px] outline-none focus:border-ih-accent ${
            'mono' in field && field.mono ? 'font-mono text-[12px]' : ''
          }`}
        />
      )}
      {'hint' in field && field.hint ? (
        <span className="text-[11px] text-ih-muted-2">{field.hint}</span>
      ) : null}
      <FieldError message={error} />
    </div>
  )
}

/**
 * Columns and rows together, because the schema rejects a row whose cell count
 * differs from the column count — editing them apart is how you get a table
 * that will not save and no clear reason why. Adding a column adds a cell to
 * every row here, and removing one takes it back out.
 */
function MatrixField({
  idPrefix,
  label,
  hint,
  columns,
  rows,
  error,
  onColumns,
  onRows,
}: {
  idPrefix: string
  label: string
  hint?: string
  columns: string[]
  rows: Array<{ cells: string[]; highlight?: boolean }>
  error?: string
  onColumns: (next: string[]) => void
  onRows: (next: Array<{ cells: string[]; highlight?: boolean }>) => void
}) {
  function addColumn() {
    onColumns([...columns, ''])
    onRows(rows.map((r) => ({ ...r, cells: [...r.cells, ''] })))
  }
  function removeColumn(index: number) {
    onColumns(columns.filter((_, i) => i !== index))
    onRows(rows.map((r) => ({ ...r, cells: r.cells.filter((_, i) => i !== index) })))
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <Legend label={label} hint={hint} />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-1">
          <thead>
            <tr>
              {columns.map((col, c) => (
                <th key={c} className="p-0 align-top">
                  <label htmlFor={`${idPrefix}-col-${c}`} className="sr-only">
                    Column {c + 1} heading
                  </label>
                  <span className="flex items-center gap-1">
                    <input
                      id={`${idPrefix}-col-${c}`}
                      value={col}
                      placeholder={`Column ${c + 1}`}
                      onChange={(e) => {
                        const next = [...columns]
                        next[c] = e.target.value
                        onColumns(next)
                      }}
                      className="h-8 w-full rounded-md border border-ih-border bg-ih-surface-2 px-2 text-[12px] font-medium outline-none focus:border-ih-accent"
                    />
                    <RemoveButton
                      disabled={columns.length <= 2}
                      label={`Remove column ${c + 1}`}
                      onClick={() => removeColumn(c)}
                    />
                  </span>
                </th>
              ))}
              <th className="w-8 p-0" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {columns.map((_, c) => (
                  <td key={c} className="p-0">
                    <label htmlFor={`${idPrefix}-cell-${r}-${c}`} className="sr-only">
                      Row {r + 1}, column {c + 1}
                    </label>
                    <input
                      id={`${idPrefix}-cell-${r}-${c}`}
                      value={row.cells[c] ?? ''}
                      onChange={(e) => {
                        const next = rows.map((x) => ({ ...x, cells: [...x.cells] }))
                        const cells = next[r]?.cells
                        if (!cells) return
                        while (cells.length < columns.length) cells.push('')
                        cells[c] = e.target.value
                        onRows(next)
                      }}
                      className="h-8 w-full rounded-md border border-ih-border bg-ih-bg px-2 text-[12.5px] outline-none focus:border-ih-accent"
                    />
                  </td>
                ))}
                <td className="p-0 text-right">
                  <RemoveButton
                    disabled={rows.length <= 1}
                    label={`Remove row ${r + 1}`}
                    onClick={() => onRows(rows.filter((_, i) => i !== r))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <AddButton disabled={columns.length >= 8} label="Add column" onClick={addColumn} />
        <AddButton
          disabled={rows.length >= 60}
          label="Add row"
          onClick={() => onRows([...rows, { cells: columns.map(() => '') }])}
        />
      </div>
      <FieldError message={error} />
    </fieldset>
  )
}

function Legend({ label, hint }: { label: string; hint?: string }) {
  return (
    <legend className="flex flex-col gap-0.5">
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
        {label}
      </span>
      {hint ? <span className="text-[11px] text-ih-muted-2">{hint}</span> : null}
    </legend>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className="text-[11.5px] text-ih-danger">{message}</span>
}

function AddButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 items-center gap-1.5 self-start rounded-md border border-ih-border px-2.5 text-[12px] text-ih-ink-2 transition-colors hover:bg-ih-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Plus size={12} strokeWidth={1.9} />
      {label}
    </button>
  )
}

function RemoveButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ih-muted transition-colors hover:bg-ih-danger-soft hover:text-ih-danger disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ih-muted"
    >
      <Trash2 size={13} strokeWidth={1.7} />
    </button>
  )
}

/**
 * Drop empty optional fields before validating.
 *
 * An untouched optional input holds `''`. Some fields accept that and store a
 * blank heading on the article; others reject it and the author gets an error
 * on a field they deliberately left alone.
 */
function stripEmpty(draft: Draft): Draft {
  const out: Draft = {}
  for (const [key, value] of Object.entries(draft)) {
    if (value === '' || value === undefined || value === null) continue
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // A fixed nested object (`problem_solution.problem`). Stripped rather
      // than passed through, so its blank optional fields behave like every
      // other field's — and if it ends up empty the schema says which of its
      // members is required, which is the message the author needs.
      out[key] = stripEmpty(value as Draft)
      continue
    }
    if (Array.isArray(value)) {
      out[key] = value
        .map((item) =>
          item && typeof item === 'object' && !Array.isArray(item)
            ? stripEmpty(item as Draft)
            : item,
        )
        .filter((item) => {
          // A row the author added and never filled in is not a validation
          // failure, it is a row they changed their mind about.
          if (item && typeof item === 'object') return Object.keys(item).length > 0
          // `cells` is the one string array where a blank is meaningful: a
          // comparison table's rows must carry exactly one cell per column,
          // so dropping the empty ones makes the table ragged and unsavable.
          return key === 'cells' || item !== ''
        })
      continue
    }
    out[key] = value
  }
  return out
}
