import { adminPath, stripAdminPrefix } from '../../lib/admin-paths'

// Route label map for breadcrumb derivation. Mirrors the top-level entries
// in AdminSidebar — keep these in sync if a new admin section is added.
export const ROUTE_LABELS: Record<string, { section: string; label: string }> = {
  products: { section: 'Catalogue', label: 'Products' },
  categories: { section: 'Catalogue', label: 'Categories' },
  brands: { section: 'Catalogue', label: 'Brands' },
  'spec-templates': { section: 'Catalogue', label: 'Spec templates' },
  industries: { section: 'Catalogue', label: 'Industries' },
  media: { section: 'Catalogue', label: 'Media library' },
  rfqs: { section: 'Operations', label: 'RFQ Queue' },
  customers: { section: 'Operations', label: 'Accounts' },
  pages: { section: 'Content', label: 'Pages & Blocks' },
  navigation: { section: 'Content', label: 'Navigation' },
  footer: { section: 'Content', label: 'Footer' },
  seo: { section: 'Content', label: 'SEO & Search' },
  markets: { section: 'Content', label: 'Export markets' },
  users: { section: 'System', label: 'Users & Roles' },
  settings: { section: 'System', label: 'Settings' },
}

// Sub-segments we want a friendly label for. Anything not listed and not
// matching the ID pattern below gets title-cased.
const SUB_LABELS: Record<string, string> = {
  new: 'New',
  edit: 'Edit',
  import: 'Bulk import',
  blog: 'Blog',
  pages: 'Pages',
  master: 'Master pages',
  sub: 'Sub-pages',
  static: 'Standalone pages',
  hero: 'Homepage carousel',
  search: 'Search',
  audit: 'Audit',
  redirects: 'Redirects',
  robots: 'Robots',
  sitemap: 'Sitemap',
  health: 'Health',
  inspector: 'Inspector',
  'structured-data': 'Structured data',
  ai: 'AI',
  gsc: 'GSC',
  queries: 'Queries',
  synonyms: 'Synonyms',
  boosts: 'Boosts',
  chains: 'Chains',
  'not-found': 'Not found',
  quota: 'Quota',
  runs: 'Runs',
}

// Heuristic: skip dynamic-id-looking segments from breadcrumbs.
// CUID/UUID/long alphanumerics, pure numbers, or RFQ-style codes.
function isIdLike(segment: string): boolean {
  if (/^\d+$/.test(segment)) return true
  if (segment.length >= 16 && /^[a-z0-9-]+$/.test(segment)) return true
  if (/^[A-Z]{2,5}-[A-Z0-9-]+$/.test(segment)) return true
  return false
}

function titleCase(segment: string): string {
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export type Crumb = { label: string; href?: string }

export function deriveCrumbs(pathname: string): Crumb[] {
  // Read the path relative to /admin. Without this every pathname's first
  // segment is the literal 'admin', which is in no ROUTE_LABELS entry, so
  // every trail would silently collapse to a single "Admin" crumb.
  const segments = stripAdminPrefix(pathname).split('/').filter(Boolean)
  const first = segments[0]
  if (!first) return [{ label: 'Dashboard' }]

  const rest = segments.slice(1)
  const top = ROUTE_LABELS[first]
  if (!top) return [{ label: titleCase(first) }]

  const crumbs: Crumb[] = [{ label: top.section }]
  // The top-level item links back to itself only when we're deeper than it.
  crumbs.push(rest.length > 0 ? { label: top.label, href: adminPath(`/${first}`) } : { label: top.label })

  for (const seg of rest) {
    if (isIdLike(seg)) continue
    crumbs.push({ label: SUB_LABELS[seg] ?? titleCase(seg) })
  }

  return crumbs
}
