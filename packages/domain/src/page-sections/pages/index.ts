import type { MasterPageDef } from '../types'
import { HOME_PAGE } from './home'
import { ABOUT_PAGE } from './about'

/**
 * Every master page, in the order the admin index lists them.
 *
 * A page appears here once its storefront route actually READS its content.
 * Declaring one earlier would give an editor a form whose saves change
 * nothing, which is worse than the page not being listed at all.
 */
export const MASTER_PAGES: readonly MasterPageDef[] = [HOME_PAGE, ABOUT_PAGE]

export { HOME_PAGE, ABOUT_PAGE }
