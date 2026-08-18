import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from './lib/utils'

/**
 * NAMED `AdminSectionHead`, not `SectionHead`: `Surface.tsx` already exports a
 * `SectionHead` — the storefront's numbered, optionally-serif section head,
 * used by /design. Two of that name through one barrel is a duplicate-export
 * error, and renaming the storefront's is a storefront change nobody asked
 * for. Same reasoning as Panel-not-Card.
 *
 * Admin design language — FE-9. A heading for a section *inside* a card, in
 * the only two forms the language has.
 *
 * FE-9 is a rule about confusion, not about pixels. The admin has no visual
 * distinction today between "this section is called Pricing" and "this box is
 * called Price": the `.eyebrow` treatment is copy-pasted 81 times as a field
 * *label*, which is the one job FE-4 says it must never do. Publishing the
 * eyebrow only as a section head — and shipping the settings-panel head
 * beside it, so there is somewhere else to go — is what stops the two roles
 * collapsing into one string. There is deliberately no third variant and no
 * size prop; the four ad-hoc heading treatments this replaces were all
 * someone reaching for "a bit bigger than the last one".
 *
 * `variant="eyebrow"` applies the `.eyebrow` class from globals.css instead of
 * re-typing its five declarations. That is load-bearing, not tidiness: TY-4
 * records that `.mono` is unlayered and therefore beats a utility, so a
 * hand-typed `font-mono … tracking-[0.13em]` string silently loses its
 * tracking the moment someone also adds `.mono`. One entry point, and the
 * `[data-surface='admin']` override that drops it to 10px keeps working.
 *
 * The eyebrow form carries **no margin of its own**. A rail card is already a
 * `flex flex-col gap-4` and a form card a `gap-5` (FE-3); a head that also set
 * a margin would make that gap unpredictable per-card, which is how the
 * spacing drifted in the first place. The parent stack owns the spacing.
 *
 * The panel form is the opposite: FE-9 pins its `mb-4 pb-4` divider to the
 * head itself, so it is sized to sit as the first child of a card *above* the
 * gapped field stack rather than inside it — otherwise the 16px margin and the
 * 20px gap add to 36px:
 *
 *   <div className="rounded-lg border border-ih-border bg-ih-surface p-6">
 *     <SectionHead variant="panel" title="Notifications" description="…" />
 *     <div className="flex flex-col gap-5">{fields}</div>
 *   </div>
 *
 * `description` renders **below** the title row, not beside it, so the actions
 * slot never squeezes the prose into a column — and it is typed off the
 * eyebrow form entirely, because an eyebrow with a paragraph under it is the
 * panel head wearing the wrong clothes.
 *
 * FE-9 does not specify the actions slot. It takes FE-15's card-header-row
 * geometry (`flex items-center gap-3`), the nearest existing primitive, so a
 * head with a small Save reads identically to a card that owns its own
 * persistence.
 *
 * No `'use client'`: this is markup with no state, effects or handlers. A
 * client module's exports become client references, and a Server Component
 * calling one throws at request time.
 */
const adminSectionHeadVariants = cva('', {
  variants: {
    variant: {
      /** Sub-section head: rail cards and in-card groups. Spacing is the parent's. */
      eyebrow: '',
      /** Settings panel head: owns its own divider (FE-9). */
      panel: 'mb-4 border-b border-ih-border pb-4',
    },
  },
  defaultVariants: { variant: 'eyebrow' },
})

const sectionHeadTitleVariants = cva('min-w-0', {
  variants: {
    variant: {
      eyebrow: 'eyebrow',
      panel: 'text-[15px] font-medium tracking-tight',
    },
  },
  defaultVariants: { variant: 'eyebrow' },
})

/**
 * FE-9 does not name a heading level, but it does not get to be silent about
 * one either — a card whose only head is an eyebrow, rendered as `h3`, skips a
 * level and the document outline lies. Panel heads default to `h2` (the level
 * FE-9 writes) and eyebrows to `h3` (they sit under one); pass `level` where
 * the page's real outline disagrees. Never `h1` — NAV-12: one `<h1>` per page
 * and the topbar already owns it.
 */
const HEADING_TAG: Record<2 | 3 | 4, 'h2' | 'h3' | 'h4'> = { 2: 'h2', 3: 'h3', 4: 'h4' }

interface SectionHeadBaseProps {
  title: React.ReactNode
  /** Sits at the right of the title row. Typically one small Button or a link. */
  actions?: React.ReactNode
  level?: 2 | 3 | 4
  className?: string
}

/**
 * A discriminated union rather than one optional-everything shape, so
 * `description` on an eyebrow is a compile error instead of a third form.
 */
export type AdminSectionHeadProps =
  | (SectionHeadBaseProps & { variant?: 'eyebrow'; description?: never })
  | (SectionHeadBaseProps & { variant: 'panel'; description?: React.ReactNode })

export function AdminSectionHead({
  variant = 'eyebrow',
  title,
  description,
  actions,
  level,
  className,
}: AdminSectionHeadProps) {
  const Heading = HEADING_TAG[level ?? (variant === 'panel' ? 2 : 3)]

  return (
    <div className={cn(adminSectionHeadVariants({ variant }), className)}>
      <div className="flex items-center justify-between gap-3">
        <Heading className={sectionHeadTitleVariants({ variant })}>{title}</Heading>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {description ? (
        <p className="mt-1 text-[12.5px] leading-[1.55] text-ih-muted">{description}</p>
      ) : null}
    </div>
  )
}

export { adminSectionHeadVariants }
