/**
 * Pages & Blocks — the section registry behind the admin's page editor.
 *
 * See `./types.ts` for the shape and `./resolve.ts` for the merge rules.
 */
export * from './types'
export * from './fields'
export * from './resolve'
export * from './tokens'
export { MASTER_PAGES, HELP_TILE_ICONS } from './pages'
import { MASTER_PAGES } from './pages'
import type { MasterPageDef } from './types'

/**
 * A master page's content lives in one `page_content` row, keyed
 * `master/<key>`. The prefix keeps the master documents distinguishable from
 * the per-record sub-page documents that share the table.
 */
export const MASTER_KEY_PREFIX = 'master/'

export function masterContentKey(key: string): string {
  return `${MASTER_KEY_PREFIX}${key}`
}

export function getMasterPage(key: string): MasterPageDef | null {
  return MASTER_PAGES.find((p) => p.key === key) ?? null
}

export function isMasterPageKey(key: string): boolean {
  return MASTER_PAGES.some((p) => p.key === key)
}
