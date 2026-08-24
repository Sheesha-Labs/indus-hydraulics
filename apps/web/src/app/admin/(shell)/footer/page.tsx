import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { db } from '@indus/db'
import { asFooterSocialPlatform, type MenuLinkType } from '@indus/domain'
import { auth } from '../../../../lib/admin-auth'
import { hasRole, ROLES, requireRole } from '../../../../lib/rbac'
import AdminPageShell from '../../../../components/admin/AdminPageShell'
import FooterEditor, { type FooterEditorData } from './FooterEditor'

export const metadata: Metadata = { title: 'Footer — Indus Admin' }

/**
 * The site footer, editable on one screen.
 *
 * Everything the footer draws was already in the database, but spread across
 * two screens named after their storage rather than the surface: link columns
 * in Navigation (one row in a list of five menus), brand and contact details
 * in Settings. Nobody looking to fix a phone number in the footer would find
 * either. Two more pieces were not editable at all — the copyright line was a
 * literal in `SiteFooter.tsx`, and the social profiles behind the Organization
 * JSON-LD's `sameAs` were a Vercel env var.
 *
 * Navigation keeps its own editor for these two menus; this screen writes the
 * same rows. That is deliberate — an editor who thinks in nav menus and an
 * editor who thinks in "the footer" both get there, and neither view can hold
 * a version of the footer the other cannot see.
 */
export default async function FooterAdminPage() {
  const session = await auth()
  requireRole(session, ROLES.CMS_WRITE)

  const [settings, mainMenu, legalMenu, socials] = await Promise.all([
    db.storeSettings.findFirst({
      select: {
        tagline: true,
        certificationLine: true,
        contactLocationLabel: true,
        contactPhone: true,
        contactEmail: true,
        contactHours: true,
        footerLegalLine: true,
        legalName: true,
        name: true,
      },
    }),
    db.navMenu.findUnique({
      where: { location: 'footer_main' },
      select: {
        id: true,
        items: {
          orderBy: [{ position: 'asc' }],
          select: {
            id: true,
            parentId: true,
            position: true,
            label: true,
            linkType: true,
            customUrl: true,
            openInNewTab: true,
            isVisible: true,
            categoryId: true,
            brandId: true,
            industryId: true,
            cmsPageId: true,
            productId: true,
            category: { select: { name: true, slug: true } },
            brand: { select: { name: true, slug: true } },
            industry: { select: { name: true, slug: true } },
            cmsPage: { select: { title: true, slug: true } },
            product: { select: { title: true, sku: true } },
          },
        },
      },
    }),
    db.navMenu.findUnique({
      where: { location: 'footer_legal' },
      select: {
        id: true,
        items: {
          orderBy: [{ position: 'asc' }],
          select: {
            id: true,
            label: true,
            customUrl: true,
            openInNewTab: true,
            isVisible: true,
          },
        },
      },
    }),
    db.footerSocial.findMany({
      orderBy: { position: 'asc' },
      select: { id: true, label: true, platform: true, href: true, isVisible: true },
    }),
  ])

  const items = mainMenu?.items ?? []
  const roots = items.filter((i) => i.parentId === null)
  const childrenOf = (parentId: string) =>
    items.filter((i) => i.parentId === parentId).sort((a, b) => a.position - b.position)

  const data: FooterEditorData = {
    brand: {
      tagline: settings?.tagline ?? '',
      certificationLine: settings?.certificationLine ?? '',
    },
    contact: {
      contactLocationLabel: settings?.contactLocationLabel ?? '',
      contactPhone: settings?.contactPhone ?? '',
      contactEmail: settings?.contactEmail ?? '',
      contactHours: settings?.contactHours ?? '',
    },
    legal: {
      footerLegalLine: settings?.footerLegalLine ?? '',
      links: (legalMenu?.items ?? []).map((i) => ({
        label: i.label,
        customUrl: i.customUrl ?? '',
        openInNewTab: i.openInNewTab,
        isVisible: i.isVisible,
      })),
    },
    columns: roots
      .sort((a, b) => a.position - b.position)
      .map((column) => ({
        label: column.label,
        isVisible: column.isVisible,
        links: childrenOf(column.id).map((link) => ({
          label: link.label,
          linkType: link.linkType as MenuLinkType,
          customUrl: link.customUrl ?? '',
          categoryId: link.categoryId,
          brandId: link.brandId,
          industryId: link.industryId,
          cmsPageId: link.cmsPageId,
          productId: link.productId,
          // Resolved server-side so the picker can show "Hydraulic Pumps"
          // instead of a uuid on first paint. A target whose record was
          // deleted resolves to null and the row renders as unlinked — the
          // same thing the storefront does with it.
          target: resolveTargetLabel(link),
          openInNewTab: link.openInNewTab,
          isVisible: link.isVisible,
        })),
      })),
    socials: socials.map((s) => ({
      label: s.label,
      platform: asFooterSocialPlatform(s.platform),
      href: s.href,
      isVisible: s.isVisible,
    })),
  }

  const linkCount = data.columns.reduce((n, c) => n + c.links.length, 0)
  const menusMissing = !mainMenu || !legalMenu
  const legalPreview = settings?.legalName || settings?.name || 'Indus Hydraulics'

  return (
    <AdminPageShell
      title="Footer"
      breadcrumbs="Content · Footer"
      sub="Everything below the page, on every public route."
      actions={
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-ih-muted hover:text-ih-ink"
        >
          View on site <ExternalLink size={12} />
        </Link>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-ih-muted">
          {data.columns.length} {data.columns.length === 1 ? 'column' : 'columns'} · {linkCount}{' '}
          {linkCount === 1 ? 'link' : 'links'} · {data.socials.length} social ·{' '}
          {data.legal.links.length} legal
        </div>

        {menusMissing ? (
          <p className="border border-ih-border bg-ih-surface px-4 py-3 text-[13px]">
            The footer’s nav menus don’t exist yet. Create them under{' '}
            <Link href="/admin/navigation" className="text-ih-accent hover:underline">
              Navigation
            </Link>{' '}
            (locations “Footer — main” and “Footer — legal”), then reload this page.
          </p>
        ) : (
          <FooterEditor
            data={data}
            canEditSettings={hasRole(session, ROLES.SETTINGS_WRITE)}
            legalFallbackEntity={legalPreview}
          />
        )}
      </div>
    </AdminPageShell>
  )
}

/** The human name for whatever a link points at, or null if it points nowhere. */
function resolveTargetLabel(link: {
  linkType: string
  category: { name: string; slug: string } | null
  brand: { name: string; slug: string } | null
  industry: { name: string; slug: string } | null
  cmsPage: { title: string; slug: string } | null
  product: { title: string; sku: string } | null
}): { label: string; sublabel: string | null } | null {
  switch (link.linkType as MenuLinkType) {
    case 'category':
      return link.category ? { label: link.category.name, sublabel: `/c/${link.category.slug}` } : null
    case 'brand':
      return link.brand ? { label: link.brand.name, sublabel: `/brands/${link.brand.slug}` } : null
    case 'industry':
      return link.industry
        ? { label: link.industry.name, sublabel: `/industries/${link.industry.slug}` }
        : null
    case 'cms_page':
      return link.cmsPage ? { label: link.cmsPage.title, sublabel: `/${link.cmsPage.slug}` } : null
    case 'product':
      return link.product ? { label: link.product.title, sublabel: link.product.sku } : null
    default:
      return null
  }
}
