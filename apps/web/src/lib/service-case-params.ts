import type { ServiceCaseCategory } from '@indus/db'

/**
 * The `category` and `sort` query parameters for /services, parsed.
 *
 * Split out of service-cases.ts, which is `server-only` — the chips and the
 * sort control now run in the browser so that /services can be cached, and a
 * client component cannot import from a server-only module at all.
 *
 * `@indus/db` is imported for TYPES ONLY here, so nothing of Prisma reaches
 * the browser bundle.
 */

export type ServiceCaseSort = 'recent' | 'savings' | 'tat'

export const SERVICE_CASE_CATEGORIES: readonly ServiceCaseCategory[] = [
  'cylinders',
  'hoses',
  'pumps',
  'valves_manifolds',
  'bop_pressure_control',
  'ct_wireline',
  'wellhead',
  'field_service',
  'lab_forensics',
  'custom_builds',
]

export function parseSort(raw: string | string[] | undefined): ServiceCaseSort {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v === 'savings' || v === 'tat' || v === 'recent') return v
  return 'recent'
}

export function parseCategory(raw: string | string[] | undefined): ServiceCaseCategory | null {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (!v) return null
  return (SERVICE_CASE_CATEGORIES as readonly string[]).includes(v)
    ? (v as ServiceCaseCategory)
    : null
}
