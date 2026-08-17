'use client'

import { useState } from 'react'
import { pressureInAllUnits, type PressureUnit } from '@indus/domain'

const UNITS: Array<{ id: PressureUnit; label: string; hint: string }> = [
  { id: 'bar', label: 'bar', hint: 'European and GCC datasheets' },
  { id: 'psi', label: 'psi', hint: 'US and oilfield specifications' },
  { id: 'mpa', label: 'MPa', hint: 'ISO, CIS and Chinese datasheets' },
]

/**
 * Three-way pressure converter.
 *
 * Exists because the same hose is specified in bar on a European datasheet,
 * psi on an API document and MPa on a CIS one — and a buyer comparing two
 * quotes is doing this conversion by hand, usually on a phone.
 */
export default function PressureConverter() {
  const [raw, setRaw] = useState('350')
  const [unit, setUnit] = useState<PressureUnit>('bar')

  const parsed = Number.parseFloat(raw)
  const valid = Number.isFinite(parsed) && parsed >= 0
  const results = valid ? pressureInAllUnits(parsed, unit) : null

  return (
    <div className="rounded-lg border border-ih-border bg-ih-surface p-6">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="min-w-[160px] flex-1">
          <label
            htmlFor="pressure-value"
            className="mono mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted"
          >
            Pressure
          </label>
          <input
            id="pressure-value"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="h-10 w-full rounded-md border border-ih-border bg-white px-3 font-mono text-[15px] text-ih-ink"
          />
        </div>
        <div>
          <span className="mono mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
            Unit
          </span>
          <div className="flex gap-1" role="group" aria-label="Input unit">
            {UNITS.map((u) => (
              <button
                key={u.id}
                type="button"
                aria-pressed={unit === u.id}
                onClick={() => setUnit(u.id)}
                className={`mono h-10 rounded-md border px-3.5 text-[13px] ${
                  unit === u.id
                    ? 'border-ih-accent bg-ih-accent text-ih-accent-fg'
                    : 'border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {results ? (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {UNITS.map((u) => (
            <div key={u.id} className="rounded-md border border-ih-border bg-ih-surface-2 p-4">
              <dt className="mono mb-1 text-[10.5px] uppercase tracking-[0.12em] text-ih-muted">
                {u.label}
              </dt>
              <dd className="mono text-[22px] font-medium tabular-nums text-ih-ink">
                {formatPressure(results[u.id])}
              </dd>
              <p className="mt-1 text-[11.5px] leading-[1.4] text-ih-muted-2">{u.hint}</p>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-[13.5px] text-ih-muted" role="status">
          Enter a positive number to convert.
        </p>
      )}

      <p className="mt-4 border-t border-ih-border pt-3 text-[12px] leading-[1.5] text-ih-muted">
        Converts working pressure between units. It does <strong>not</strong> tell you whether a
        hose is rated for the result — take the rating for the specific grade and size from its
        datasheet.
      </p>
    </div>
  )
}

/** Four significant figures, without exponent notation on realistic values. */
function formatPressure(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  const decimals = value >= 1000 ? 0 : value >= 100 ? 1 : value >= 1 ? 2 : 4
  return value.toLocaleString('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}
