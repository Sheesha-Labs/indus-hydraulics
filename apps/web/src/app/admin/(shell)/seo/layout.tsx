import { ROLES } from '../../../../lib/rbac'
import { requireStaffRole } from '../../../../lib/staff-session'
import AdminPageShell from '../../../../components/admin/AdminPageShell'
import SeoTabsNav from './SeoTabsNav'

/**
 * Shared shell for the SEO Operating System. Renders the tab nav and
 * enforces SEO_READ for everything underneath. Sub-pages do their own
 * SEO_WRITE / SEO_INFRASTRUCTURE checks at the action layer.
 */
export default async function SeoLayout({ children }: { children: React.ReactNode }) {
  await requireStaffRole(ROLES.SEO_READ)

  /*
    This layout owns the bar for all 18 SEO routes beneath it — none of them
    has an h1 of its own. Location comes from SeoTabsNav (11 tabs) and, under
    /search, SearchSubTabsNav (4 more), both of which mark the active tab; that
    is what replaces the breadcrumbs v2 removes.

    requireStaffRole stays ABOVE the bar. Rendering a title before the gate
    would leak the section name to a role that cannot open it.
  */
  return (
    <AdminPageShell
      title={'SEO & Search'}
      sub="Central console for product, category, and content SEO across the storefront."
    >
      <SeoTabsNav />
      {children}
    </AdminPageShell>
  )
}
