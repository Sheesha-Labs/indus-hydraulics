'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * Guided thread identification.
 *
 * Deliberately asks about GEOMETRY — taper, thread angle, seat — and not about
 * dimensions. A wizard that asked for a thread OD would need a dimensional
 * table behind it, and a wrong row in that table sends someone a fitting that
 * does not fit. Geometry is checkable with a caliper and a pitch gauge, stable
 * across manufacturers, and cannot be silently wrong.
 *
 * It ends at a family, not a part number, and says so.
 */

type Answer = { label: string; next: string }
type Step = { id: string; question: string; help?: string; answers: Answer[] }
type Result = { id: string; family: string; detail: string; categorySlug?: string }

const STEPS: Record<string, Step> = {
  taper: {
    id: 'taper',
    question: 'Measure across the thread crests at the first thread and at the last. Does the diameter change?',
    help: 'This single measurement separates the two tapered families from everything else.',
    answers: [
      { label: 'It grows along the thread — tapered', next: 'taper-angle' },
      { label: 'It stays the same — parallel', next: 'seat' },
    ],
  },
  'taper-angle': {
    id: 'taper-angle',
    question: 'Put a pitch gauge on it. What is the thread angle?',
    help: 'A 55° gauge leaf sits flush on Whitworth threads; a 60° leaf sits flush on NPT.',
    answers: [
      { label: '55° — Whitworth form', next: 'result-bspt' },
      { label: '60°', next: 'result-npt' },
    ],
  },
  seat: {
    id: 'seat',
    question: 'Look at the sealing face. What is there?',
    help: 'On a parallel connection the seal is a separate feature — the threads only clamp.',
    answers: [
      { label: 'Flat face with an O-ring sitting in a groove', next: 'result-orfs' },
      { label: 'A cone, roughly 37°', next: 'result-jic' },
      { label: 'A cone, roughly 60°', next: 'result-bspp' },
      { label: 'A cone, roughly 24°', next: 'result-metric' },
      { label: 'A cone, roughly 30°', next: 'result-komatsu' },
      { label: 'Flat, with a bonded washer under the head', next: 'result-bspp-washer' },
    ],
  },
}

const RESULTS: Record<string, Result> = {
  'result-bspt': {
    id: 'result-bspt',
    family: 'BSP tapered (BSPT)',
    detail:
      'Tapered Whitworth thread, sealing on thread interference with a sealant. Governed by ISO 7-1. Each make deforms the threads slightly, so a joint broken several times may stop sealing.',
    categorySlug: 'bsp-hose-fittings',
  },
  'result-npt': {
    id: 'result-npt',
    family: 'NPT (or NPTF)',
    detail:
      'Tapered 60° thread on a 1:16 taper, per ASME B1.20.1, sealing on thread interference with a sealant. Do not attempt to mate it with BSP — the thread angles differ and the joint will leak.',
  },
  'result-orfs': {
    id: 'result-orfs',
    family: 'ORFS — O-ring face seal',
    detail:
      'Parallel thread, flat face, and the O-ring makes the entire seal. A missing or perished O-ring leaks no matter how much torque is applied, and over-torquing to chase it damages the face.',
    categorySlug: 'orfs-hose-fittings',
  },
  'result-jic': {
    id: 'result-jic',
    family: 'JIC 37° flare',
    detail:
      'Parallel thread with a 37° cone, sealing metal-to-metal on the flare. The most widely stocked family in the region.',
    categorySlug: 'jic-37-hose-fittings',
  },
  'result-bspp': {
    id: 'result-bspp',
    family: 'BSP parallel (BSPP), 60° cone',
    detail:
      'Parallel Whitworth thread with a 60° cone seat. Per ISO 228-1 the threads do not make the seal — the cone does. Common on British and Indian-built equipment.',
    categorySlug: 'bsp-hose-fittings',
  },
  'result-bspp-washer': {
    id: 'result-bspp-washer',
    family: 'BSP parallel (BSPP), bonded seal',
    detail:
      'Parallel Whitworth thread sealing on a bonded washer under the head rather than a cone. If it leaks, replace the washer before touching the torque.',
    categorySlug: 'bsp-hose-fittings',
  },
  'result-metric': {
    id: 'result-metric',
    family: 'Metric DIN 24° cone',
    detail:
      'Parallel metric thread with a 24° cone, per ISO 8434-1 — often called DIN 2353 in the trade. Light (L) and heavy (S) series share the seat angle but not the thread sizes, so confirm the series before ordering.',
    categorySlug: 'din-hose-fittings',
  },
  'result-komatsu': {
    id: 'result-komatsu',
    family: 'Komatsu 30° flare',
    detail:
      'Parallel thread with a 30° cone. Easily mistaken for JIC 37° by eye — they will thread together on some sizes and seal poorly, because the flare and seat make line contact instead of face contact.',
  },
}

export default function ThreadIdentifier() {
  const [stepId, setStepId] = useState('taper')
  const [trail, setTrail] = useState<string[]>([])

  const result = RESULTS[stepId]
  const step = STEPS[stepId]

  function choose(next: string) {
    setTrail((t) => [...t, stepId])
    setStepId(next)
  }

  function back() {
    setTrail((t) => {
      const previous = t.at(-1)
      if (previous) setStepId(previous)
      return t.slice(0, -1)
    })
  }

  function restart() {
    setTrail([])
    setStepId('taper')
  }

  return (
    <div className="rounded-lg border border-ih-border bg-ih-surface p-6">
      {step && (
        <>
          <p className="mono mb-2 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
            Step {trail.length + 1}
          </p>
          <h2 className="mb-2 text-[19px] font-semibold leading-[1.3] text-ih-ink">
            {step.question}
          </h2>
          {step.help && <p className="mb-4 text-[13.5px] leading-[1.5] text-ih-muted">{step.help}</p>}
          <div className="flex flex-col gap-2">
            {step.answers.map((a) => (
              <button
                key={a.next}
                type="button"
                onClick={() => choose(a.next)}
                className="rounded-md border border-ih-border bg-ih-surface-2 px-4 py-3 text-left text-[14.5px] text-ih-ink transition-colors hover:border-ih-accent hover:text-ih-accent"
              >
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}

      {result && (
        <>
          <p className="mono mb-2 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
            Most likely
          </p>
          <h2 className="mb-2 text-[24px] font-semibold tracking-[-0.01em] text-ih-ink">
            {result.family}
          </h2>
          <p className="mb-4 text-[14.5px] leading-[1.6] text-ih-ink-2">{result.detail}</p>
          <div className="flex flex-wrap gap-2">
            {result.categorySlug && (
              <Link
                href={`/c/${result.categorySlug}`}
                className="mono inline-flex h-10 items-center rounded-md bg-ih-accent px-4 text-[12px] uppercase tracking-[0.08em] text-ih-accent-fg hover:opacity-90"
              >
                Browse this range
              </Link>
            )}
            <Link
              href="/quote"
              className="mono inline-flex h-10 items-center rounded-md border border-ih-border px-4 text-[12px] uppercase tracking-[0.08em] text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent"
            >
              Send a photo instead
            </Link>
          </div>
        </>
      )}

      <div className="mt-5 flex gap-3 border-t border-ih-border pt-4">
        {trail.length > 0 && (
          <button
            type="button"
            onClick={back}
            className="mono text-[12px] text-ih-accent hover:underline"
          >
            ← Back
          </button>
        )}
        {trail.length > 0 && (
          <button
            type="button"
            onClick={restart}
            className="mono text-[12px] text-ih-muted hover:text-ih-ink"
          >
            Start again
          </button>
        )}
      </div>

      <p className="mt-4 text-[12px] leading-[1.5] text-ih-muted">
        This narrows a fitting to a <strong>family</strong>, not a part number. Size and series
        still need measuring, and on a port you cannot easily re-machine it is worth confirming
        before you commit the joint.
      </p>
    </div>
  )
}
