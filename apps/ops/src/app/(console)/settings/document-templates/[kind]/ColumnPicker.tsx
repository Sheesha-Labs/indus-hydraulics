'use client'

import {
  columnLabel,
  PENDING_LINES,
  PENDING_NOTE,
  type DocKind,
  type KindColumns,
  type TemplateDefinition,
} from '@indus/ops-core'
import { Checkbox, Select } from '@indus/ops-ui/controls'

interface ColumnPickerProps {
  kind: DocKind
  columns: KindColumns | null
  def: TemplateDefinition
  readOnly: boolean
  onChange: (patch: Partial<TemplateDefinition>) => void
}

const LINES = ['auto', ...Array.from({ length: 20 }, (_, i) => String(i + 1))] as const

/**
 * Board 57's "Line table · columns": a Checkbox per column the kind's audience may print (client columns for
 * client documents, supplier columns for the RFQ and PO; required ones locked), lines on page 1, the note a
 * line without a price prints, and "Never print: Supplier, cost, margin", which is a rule, not a choice.
 */
export default function ColumnPicker({
  kind,
  columns,
  def,
  readOnly,
  onChange,
}: ColumnPickerProps) {
  function toggle(c: string, on: boolean) {
    if (!columns) return
    const chosen = new Set(on ? [...def.columns, c] : def.columns.filter((x) => x !== c))
    // Keep the kind's own order: the builder puts price columns last either way.
    onChange({ columns: columns.options.filter((x) => chosen.has(x)) })
  }
  const auto = def.linesOnFirstPage === 'auto'
  return (
    <section
      aria-labelledby="columns-eyebrow"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-[18px] py-4"
    >
      <h3 id="columns-eyebrow" className="io-eyebrow text-io-ink-3 m-0">
        Line table · columns
      </h3>
      {columns ? (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {columns.options.map((c) => {
            const required = columns.required.includes(c)
            return (
              <Checkbox
                key={c}
                label={columnLabel(kind, c)}
                checked={(def.columns as string[]).includes(c)}
                disabled={readOnly && !required}
                {...(required
                  ? { locked: { reason: 'This document always prints it' } }
                  : { onChange: (e) => toggle(c, e.currentTarget.checked) })}
              />
            )
          })}
        </div>
      ) : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">
          This layout prints a fixed table: #, description, quantity and package.
        </p>
      )}
      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-io-ink-2 text-[12px] font-medium">Lines on page 1</span>
          <Select
            size="md"
            aria-label="Lines on page 1"
            disabled={readOnly}
            value={auto ? 'auto' : String(def.linesOnFirstPage)}
            options={LINES.map((v) => ({ value: v, label: v === 'auto' ? 'Auto' : v }))}
            onChange={(e) =>
              onChange({
                linesOnFirstPage:
                  e.currentTarget.value === 'auto' ? 'auto' : Number(e.currentTarget.value),
              })
            }
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-io-ink-2 text-[12px] font-medium">Pending lines</span>
          <Select
            size="md"
            aria-label="Pending lines"
            disabled={readOnly || columns?.audience !== 'client'}
            value={def.pendingLines}
            options={PENDING_LINES.map((v) => ({ value: v, label: `“${PENDING_NOTE[v]}”` }))}
            onChange={(e) =>
              onChange({
                pendingLines: e.currentTarget.value as TemplateDefinition['pendingLines'],
              })
            }
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-io-ink-2 text-[12px] font-medium">Never print</span>
          <Select
            size="md"
            aria-label="Never print"
            disabled
            value="fixed"
            options={[
              {
                value: 'fixed',
                label:
                  columns?.audience === 'supplier'
                    ? 'Client, sell price'
                    : 'Supplier, cost, margin',
              },
            ]}
          />
        </label>
      </div>
    </section>
  )
}
