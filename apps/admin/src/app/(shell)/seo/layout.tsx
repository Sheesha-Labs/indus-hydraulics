import { ROLES } from '../../../lib/rbac'
import { requireStaffRole } from '../../../lib/staff-session'
import SeoTabsNav from './SeoTabsNav'

/**
 * Shared shell for the SEO Operating System. Renders the tab nav and
 * enforces SEO_READ for everything underneath. Sub-pages do their own
 * SEO_WRITE / SEO_INFRASTRUCTURE checks at the action layer.
 */
export default async function SeoLayout({ children }: { children: React.ReactNode }) {
  await requireStaffRole(ROLES.SEO_READ)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">SEO &amp; Search</h1>
        <p className="text-[13px] text-[var(--color-muted)] mt-1">
          Central console for product, category, and content SEO across the storefront.
        </p>
      </div>

      <SeoTabsNav />
      {children}
    </div>
  )
}
