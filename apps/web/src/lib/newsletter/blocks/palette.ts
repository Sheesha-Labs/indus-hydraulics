import { BRAND } from '@indus/domain'

// Email has no CSS variables, so the colour pickers offer the brand tokens as
// literal hex — the same conversions packages/domain/src/brand-colors.ts makes
// for every email and PDF. Lower-case, because that is how normaliseDesign
// stores a colour.

/** The swatches the colour fields offer first. */
export const INDUS_SWATCHES: readonly { value: string; label: string }[] = [
  { value: BRAND.navy, label: 'Navy' },
  { value: BRAND.navy2, label: 'Navy, lighter' },
  { value: BRAND.accent, label: 'Accent blue' },
  { value: BRAND.steel, label: 'Steel blue' },
  { value: BRAND.accentSoft, label: 'Pale blue' },
  { value: BRAND.steelSoft, label: 'Pale steel' },
  { value: BRAND.ink, label: 'Ink' },
  { value: BRAND.ink2, label: 'Body text' },
  { value: BRAND.muted, label: 'Muted' },
  { value: BRAND.border, label: 'Hairline' },
  { value: BRAND.surface2, label: 'Light grey' },
  { value: BRAND.bg, label: 'Paper' },
  { value: BRAND.white, label: 'White' },
  { value: BRAND.warning, label: 'Amber' },
]
