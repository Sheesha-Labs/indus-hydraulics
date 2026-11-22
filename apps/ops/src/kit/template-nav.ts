// Which sidebar row each template specimen marks active (/_kit/templates/<t>), as its board draws it.
// Pure and React-free: AppShell (a client component) reads it without pulling the specimens in.
// S02-T04 lists T1–T6; S02-T05 adds its boards below.
import type { NavKey } from '@indus/ops-ui/shell/nav'

export const TEMPLATE_SPECIMEN_NAV: Readonly<Record<string, NavKey>> = {
  t1a: 'quotations',
  t1b: 'suppliers',
  t2a: 'enquiries',
  t2b: 'orders',
  t3a: 'mail',
  t4a: 'review',
  t5a: 'enquiries',
  t6a: 'enquiries',
}

/**
 * The active row for a template specimen route, from the console layout's selected segments
 * (['_kit', 'templates', 't1a']); null anywhere else. Only consulted when the URL names no section.
 */
export function templateSpecimenNav(segments: readonly string[]): NavKey | null {
  const [kit, group, slug] = segments
  if ((kit !== '_kit' && kit !== '%5Fkit') || group !== 'templates' || !slug) return null
  return TEMPLATE_SPECIMEN_NAV[slug] ?? null
}
