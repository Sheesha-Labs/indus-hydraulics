import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import { asFooterSocialPlatform } from '@indus/domain'
import { auth } from '../../../../../lib/admin-auth'
import { hasRole, ROLES, requireRole } from '../../../../../lib/rbac'
import { loadNavMenuDraft } from '../../../../../lib/nav-editor-data'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import FooterScreen, { type FooterScreenData } from './FooterScreen'

export const metadata: Metadata = { title: 'Footer — Indus Admin' }

/**
 * The footer, under Navigation.
 *
 * Was `/admin/footer`, a section of its own in the sidebar. That put the same
 * two menus behind two different screens — this one and the Navigation
 * editor — with different save semantics, which is the duplication this move
 * removes. `/admin/footer` now redirects here.
 */
export default async function FooterNavPage() {
  const session = await auth()
  requireRole(session, ROLES.CMS_WRITE)

  const [settings, columnsMenu, legalMenu, socials] = await Promise.all([
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
    loadNavMenuDraft('footer_main'),
    loadNavMenuDraft('footer_legal'),
    db.footerSocial.findMany({
      orderBy: { position: 'asc' },
      select: { label: true, platform: true, href: true, isVisible: true },
    }),
  ])

  if (!columnsMenu || !legalMenu) {
    return (
      <AdminPageShell title="Footer" breadcrumbs="Content · Navigation" sub="Everything below the page.">
        <p className="rounded-md border border-ih-border bg-ih-surface px-4 py-3 text-[13px]">
          The footer’s menus don’t exist yet. Create them from{' '}
          <Link href="/admin/navigation" className="text-ih-accent hover:underline">
            Navigation
          </Link>{' '}
          — locations “Footer — main” and “Footer — legal” — then reload this page.
        </p>
      </AdminPageShell>
    )
  }

  const data: FooterScreenData = {
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
    legal: { footerLegalLine: settings?.footerLegalLine ?? '' },
    socials: socials.map((social) => ({
      label: social.label,
      platform: asFooterSocialPlatform(social.platform),
      href: social.href,
      isVisible: social.isVisible,
    })),
    columnsMenuId: columnsMenu.id,
    columns: columnsMenu.items,
    legalMenuId: legalMenu.id,
    legalLinks: legalMenu.items,
  }

  return (
    <FooterScreen
      data={data}
      canEditSettings={hasRole(session, ROLES.SETTINGS_WRITE)}
      legalFallbackEntity={settings?.legalName || settings?.name || 'Indus Hydraulics'}
    />
  )
}
