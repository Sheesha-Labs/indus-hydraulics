import type { Session } from 'next-auth'

/**
 * Staff roles, ordered loosely by privilege. Mirrors `StaffRole` enum in
 * `packages/db/prisma/schema.prisma`.
 */
export const STAFF_ROLES = [
  'super_admin',
  'manager',
  'sales_rep',
  'engineer',
  'warehouse',
  'finance',
  'cms_editor',
] as const

export type StaffRole = (typeof STAFF_ROLES)[number]

/**
 * Runtime membership test. Needed because a session's `role` is a plain string
 * that may have been minted by the *customer* Auth.js instance, whose
 * `ContactRole` enum overlaps `StaffRole` on the literal `engineer`.
 */
export function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === 'string' && (STAFF_ROLES as readonly string[]).includes(value)
}

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
  /** Competitor scraper — discover + ingest competitor product images. */
  COMPETITOR_SCRAPE: ['super_admin', 'manager'] as const,
  /** RFQ engineering review (set price, lead time, status). */
  RFQ_REVIEW: ['super_admin', 'manager', 'engineer', 'sales_rep'] as const,
  /** B2B account management. */
  ACCOUNT_WRITE: ['super_admin', 'manager', 'sales_rep'] as const,
  /** CMS content (blog, pages, SEO meta, redirects). */
  CMS_WRITE: ['super_admin', 'manager', 'cms_editor'] as const,
  /** Read access to the SEO OS (inspector, audit, dashboards). */
  SEO_READ: ['super_admin', 'manager', 'sales_rep', 'engineer', 'cms_editor'] as const,
  /** Edit per-entity SEO meta (title/description/canonical/robots/OG). */
  SEO_WRITE: ['super_admin', 'manager', 'cms_editor'] as const,
  /** Robots.txt, redirects, canonical overrides, sitemap defaults, structured-data globals — high blast-radius. */
  SEO_INFRASTRUCTURE: ['super_admin', 'manager'] as const,
  /** Run AI generation (Claude API) — gated by per-user quota. */
  AI_GENERATE: ['super_admin', 'manager', 'cms_editor'] as const,
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
  // `kind === 'staff'` is asserted before the role comparison, so a customer
  // principal can never satisfy a permission group. This matters because
  // `ContactRole` and `StaffRole` share the literal `engineer`, which appears
  // in RFQ_REVIEW (sendQuote prices and emails quotes), SEO_READ and ANY_STAFF.
  // Hardening here rather than at the ~140 call sites means every one of them
  // inherits the check with no edit and no chance of being missed.
  if (!isStaffPrincipal(session)) {
    throw new AuthorizationError('Not authenticated')
  }
  const role = session.user.role as StaffRole
  if (!allowed.includes(role)) {
    throw new ForbiddenError(allowed, role)
  }
  return session as Session & { user: { id: string; role: StaffRole } }
}

/** Non-throwing variant — returns true/false. */
export function hasRole(
  session: Session | null,
  allowed: readonly StaffRole[]
): boolean {
  return isStaffPrincipal(session) && allowed.includes(session.user.role as StaffRole)
}

/**
 * Shared precondition for both guards above: minted by the staff Auth.js
 * instance, and carrying a role that exists in the staff enum.
 *
 * `kind` is required, not defaulted. Every decryptable token was minted after
 * the cookie split, so a legitimate staff session always carries it.
 */
function isStaffPrincipal(
  session: Session | null,
): session is Session & { user: { id: string; role: string; kind: 'staff' } } {
  const user = session?.user
  return !!user && !!user.id && user.kind === 'staff' && isStaffRole(user.role)
}
