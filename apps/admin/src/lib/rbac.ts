import type { Session } from 'next-auth'

/**
 * Staff roles, ordered loosely by privilege. Mirrors `StaffRole` enum in
 * `packages/db/prisma/schema.prisma`.
 */
export type StaffRole =
  | 'super_admin'
  | 'manager'
  | 'sales_rep'
  | 'engineer'
  | 'warehouse'
  | 'finance'
  | 'cms_editor'

/**
 * Common permission groups. Each constant is the set of roles permitted to
 * perform that family of actions. Keep these small and named — call sites
 * should reference one of these rather than passing role literals inline.
 */
export const ROLES = {
  /** Anyone signed-in to the admin app. */
  ANY_STAFF: ['super_admin', 'manager', 'sales_rep', 'engineer', 'warehouse', 'finance', 'cms_editor'] as const,
  /** Catalogue mutations (product/category/brand/industry/media write). */
  CATALOGUE_WRITE: ['super_admin', 'manager'] as const,
  /** Destructive deletes — strictest tier. */
  CATALOGUE_DELETE: ['super_admin', 'manager'] as const,
  /** RFQ engineering review (set price, lead time, status). */
  RFQ_REVIEW: ['super_admin', 'manager', 'engineer', 'sales_rep'] as const,
  /** B2B account management. */
  ACCOUNT_WRITE: ['super_admin', 'manager', 'sales_rep'] as const,
  /** CMS content (blog, pages, SEO meta, redirects). */
  CMS_WRITE: ['super_admin', 'manager', 'cms_editor'] as const,
  /** Store-wide settings (email templates, store name, default terms). */
  SETTINGS_WRITE: ['super_admin', 'manager'] as const,
  /** Staff user CRUD. */
  USERS_WRITE: ['super_admin'] as const,
} satisfies Record<string, readonly StaffRole[]>

export class AuthorizationError extends Error {
  readonly code = 'UNAUTHORIZED'
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class ForbiddenError extends Error {
  readonly code = 'FORBIDDEN'
  constructor(public readonly required: readonly string[], public readonly actual: string | null) {
    super(`Requires one of: ${required.join(', ')} (have: ${actual ?? 'none'})`)
    this.name = 'ForbiddenError'
  }
}

/**
 * Throw if the session is missing or doesn't belong to one of `allowed`.
 * Use at the top of every server action.
 *
 * @example
 *   const session = await requireRole(await auth(), ROLES.CATALOGUE_DELETE)
 *   await db.product.delete({ where: { id } })
 */
export function requireRole(
  session: Session | null,
  allowed: readonly StaffRole[]
): Session & { user: { id: string; role: StaffRole } } {
  if (!session?.user?.id) {
    throw new AuthorizationError('Not authenticated')
  }
  const role = (session.user as { role?: string }).role as StaffRole | undefined
  if (!role || !allowed.includes(role)) {
    throw new ForbiddenError(allowed, role ?? null)
  }
  return session as Session & { user: { id: string; role: StaffRole } }
}

/** Non-throwing variant — returns true/false. */
export function hasRole(
  session: Session | null,
  allowed: readonly StaffRole[]
): boolean {
  const role = session?.user?.role as StaffRole | undefined
  return !!role && allowed.includes(role)
}
