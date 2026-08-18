import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

/**
 * Admin design language — CP-5, the KPI / stat tile.
 *
 * This exists to end seven near-identical local tiles across seven admin
 * pages, which between them shipped four prop shapes and numerals at
 * mono-24-semibold, mono-26-semibold, sans-28-semibold and sans-16-semibold.
 * CP-5 settles it: ONE numeral treatment — Instrument Serif at 32px in navy —
 * because a KPI should read as brand rather than as body text, and the serif
 * is the entire visual difference between this admin and a generic dashboard.
 *
 * ⚠ NO `'use client'`, deliberately, and it must stay that way. There is no
 * state, no effect and no handler here — it is markup and (optionally) a link.
 * A client module's exports become client references, so a Server Component
 * calling one throws at request time while build, typecheck and unit tests all
 * still pass. That is the failure that took /admin/products and /admin/media
 * down once already (see the same warning in Pagination.tsx). Keeping this a
 * Server Component is also what lets `linkComponent` be a function prop: it
 * never has to cross the RSC boundary.
 *
 * Three judgement calls the design document does not make for us:
 *
 *  - **`font-serif`, not the `.serif` class.** `.serif` is unlayered in
 *    globals.css and pins `letter-spacing: -0.01em`, so it beats any
 *    `tracking-[…]` utility on the same element — exactly the trap globals.css
 *    documents for `.mono`. CP-5 asks for `tracking-[-0.02em]` on the value,
 *    so the family comes from the Tailwind utility, as it does in
 *    `SectionHead` (Surface.tsx). `font-normal` because Instrument Serif ships
 *    400 only and a synthesised bold is not a weight this language has.
 *
 *  - **Status *ink* tokens for the delta.** CP-5 predates the Unit 1
 *    `--color-ih-*-ink` tokens and names `text-ih-accent` for up. Accent is
 *    the interactive signal in this product; spending it on an ambient number
 *    makes a static tile look clickable. Up/down/flat take
 *    success-ink / danger-ink / muted.
 *
 *  - **`hint` at 11.5px sans.** CP-5 does not spec a hint. 11.5px muted is the
 *    TY-6 row for field hints and card sub-descriptions (FE-4), which is the
 *    nearest thing in the system; hint is prose, so it is never mono (TY-3).
 *
 * The tile does not lay itself out. CP-5's `grid grid-cols-2 md:grid-cols-4
 * gap-4` belongs to the caller.
 */

/**
 * The reading of the movement, NOT the sign of the number.
 *
 * A metric whose fall is a win — bounce rate, time-to-quote, open RFQ age —
 * passes `up` alongside a delta of "−12%". Inferring tone from the sign is the
 * bug this prop exists to prevent: it paints every improvement on those
 * metrics red, and an admin full of red deltas is one nobody reads.
 */
export type KpiDeltaDirection = 'up' | 'down' | 'flat'

const kpiDeltaVariants = cva('mt-2 font-mono text-[11px] tabular-nums', {
  variants: {
    deltaDirection: {
      up: 'text-ih-success-ink',
      down: 'text-ih-danger-ink',
      flat: 'text-ih-muted',
    },
  },
  defaultVariants: { deltaDirection: 'flat' },
})

/**
 * The shape this needs from a link. `next/link` satisfies it.
 *
 * `packages/ui` carries no Next dependency on purpose, so the default is a
 * plain anchor and a full document navigation. Admin surfaces should always
 * pass `linkComponent={Link}`.
 *
 * Every optional member spells `| undefined` explicitly because this
 * workspace runs `exactOptionalPropertyTypes`.
 */
export type KpiTileLinkComponent = React.ComponentType<{
  href: string
  className?: string | undefined
  children?: React.ReactNode | undefined
}>

export interface KpiTileProps extends VariantProps<typeof kpiDeltaVariants> {
  /** Mono uppercase micro-label. Human words, not a machine value. */
  label: React.ReactNode
  /** The numeral. Pre-formatted by the caller — this does no formatting. */
  value: React.ReactNode
  /** Movement line, e.g. "+18 vs last week". */
  delta?: React.ReactNode | undefined
  /** One line of context under the number. Prose, so sans. */
  hint?: React.ReactNode | undefined
  /** Makes the WHOLE tile a link — the label and numeral are the hit area. */
  href?: string | undefined
  /** Pass `next/link` in App Router surfaces. Defaults to a plain anchor. */
  linkComponent?: KpiTileLinkComponent | undefined
  className?: string | undefined
}

export function KpiTile({
  label,
  value,
  delta,
  deltaDirection,
  hint,
  href,
  linkComponent,
  className,
}: KpiTileProps) {
  const body = (
    <>
      <div className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ih-muted">{label}</div>
      <div className="mt-1 font-serif text-[32px] font-normal leading-none tracking-[-0.02em] tabular-nums text-ih-navy">
        {value}
      </div>
      {delta ? <div className={kpiDeltaVariants({ deltaDirection })}>{delta}</div> : null}
      {hint ? (
        <p className={cn('text-[11.5px] leading-snug text-ih-muted', delta ? 'mt-1.5' : 'mt-2')}>{hint}</p>
      ) : null}
    </>
  )

  // CP-1: 1px border, 10px radius, surface fill, no shadow. CP-2: p-5 is the
  // padding for a tile-sized box.
  const shell = 'rounded-lg border border-ih-border bg-ih-surface p-5'

  if (href === undefined) {
    return <div className={cn(shell, className)}>{body}</div>
  }

  // CP-3: a clickable card's hover affordance is a border darken — not a
  // shadow and not a fill. This admin has almost no shadows, so hover-raise
  // has to be expressed in the one line weight the page already has.
  const Link = linkComponent ?? 'a'
  return (
    <Link
      href={href}
      className={cn(
        shell,
        'block transition-colors hover:border-ih-border-strong',
        'outline-none focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft',
        className
      )}
    >
      {body}
    </Link>
  )
}

export { kpiDeltaVariants }
