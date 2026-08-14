'use client'

import { useState } from 'react'
import PlaceholderImage from './PlaceholderImage'
import type { ApproachStep } from '../../lib/services-config'

type Props = {
  steps: ApproachStep[]
}

/**
 * "How we work" — left-rail of 4 numbered steps (one active), right-side
 * preview panel showing the active step's detail + deliverable pills. Mirrors
 * the mock exactly: single-active state, hover non-active to highlight.
 */
export default function ApproachSteps({ steps }: Props) {
  // step 02 default-active per the mock; clamp into range so we never read undefined
  const [activeIdx, setActiveIdx] = useState(Math.min(1, steps.length - 1))
  const active = steps[activeIdx] ?? steps[0]
  if (!active) return null

  return (
    <section className="-mx-[var(--spacing-page-gutter)] border-y border-[var(--color-border)] bg-[var(--color-elevated)] px-[var(--spacing-page-gutter)] py-20">
      <div className="mx-auto max-w-[var(--spacing-max-w)]">
        <span className="eyebrow">HOW WE WORK · A LOOK INSIDE</span>
        <h2 className="my-3 mb-10 max-w-[700px] text-3xl font-semibold leading-[1.05] tracking-[-0.025em] sm:text-4xl">
          The same four steps run every service, every time — from a piston seal to a BOP recert.
        </h2>

        <div className="grid items-start gap-14 lg:grid-cols-[320px_1fr]">
          {/* Left: step list */}
          <div className="flex flex-col gap-1">
            {steps.map((step, i) => {
              const isActive = i === activeIdx
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-pressed={isActive}
                  className={`grid grid-cols-[32px_1fr] items-baseline gap-4 rounded-sm p-4 text-left ${
                    isActive
                      ? 'border border-[var(--color-border)] bg-[var(--color-surface)]'
                      : 'border border-transparent hover:bg-[var(--color-surface)]'
                  }`}
                >
                  <span className="mono pt-0.5 text-xs text-[var(--color-caption)]">
                    {step.number}
                  </span>
                  <span>
                    <h4
                      className={`mb-1 text-[16px] font-medium ${
                        isActive ? 'text-[var(--color-accent)]' : ''
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[13px] leading-[1.5] text-[var(--color-muted)]">
                      {step.body}
                    </p>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right: active preview */}
          <div className="overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)]">
            <PlaceholderImage
              storagePath={null}
              alt={active.preview.title}
              placeholderLabel={active.preview.placeholderLabel}
              className="aspect-video"
            />
            <div className="px-7 pb-7 pt-6">
              <span className="mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-accent)]">
                {active.preview.tagLabel}
              </span>
              <h3 className="my-2 mb-3 text-2xl font-semibold tracking-[-0.015em]">
                {active.preview.title}
              </h3>
              <p className="m-0 max-w-[620px] text-[15px] leading-relaxed text-[var(--color-body)]">
                {active.preview.body}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-border-2)] pt-4">
                {active.preview.deliverables.map((d) => (
                  <span
                    key={d}
                    className="mono rounded-sm border border-[var(--color-border)] px-2.5 py-1 text-[11px] tracking-[0.04em] text-[var(--color-body)]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
