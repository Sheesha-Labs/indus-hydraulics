import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { db } from '@indus/db'
import { NAV_SURFACES, type MenuLocation } from '@indus/domain'
import { auth } from '../../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { loadNavMenuDraft } from '../../../../../lib/nav-editor-data'
import NavMenuScreen from '../../../../../components/admin/nav/NavMenuScreen'

type Props = { params: Promise<{ menuSlug: string }> }

/** Where on the storefront each surface can be looked at. */
const VIEW_HREF: Record<MenuLocation, string> = {
  primary_header: '/',
  primary_megamenu: '/c',
  footer_main: '/',
  footer_legal: '/',
  mobile_drawer: '/',
}

export default async function MenuEditorPage({ params }: Props) {
  requireRole(await auth(), ROLES.CMS_WRITE)
  const { menuSlug } = await params

  const menu = await db.navMenu.findUnique({
    where: { slug: menuSlug },
    select: { location: true },
  })
  if (!menu) notFound()

  const location = menu.location as MenuLocation

  // The two footer menus are not editable on their own: the footer is one
  // surface whose columns, legal links, contact block and copyright line are
  // saved together, and a half-footer screen would let this page and the
  // Footer screen disagree about what the footer is.
  if (location === 'footer_main' || location === 'footer_legal') {
    redirect('/admin/navigation/footer')
  }

  const draft = await loadNavMenuDraft(location)
  if (!draft) notFound()

  return (
    <NavMenuScreen
      menu={{
        id: draft.id,
        slug: draft.slug,
        name: draft.name,
        isPublished: draft.isPublished,
        publishedAt: draft.publishedAt,
      }}
      location={location}
      initialItems={draft.items}
      viewHref={VIEW_HREF[location] ?? '/'}
    />
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { menuSlug } = await params
  const menu = await db.navMenu.findUnique({
    where: { slug: menuSlug },
    select: { location: true },
  })
  const surface = menu ? NAV_SURFACES[menu.location as MenuLocation] : null
  return { title: `${surface?.title ?? 'Navigation'} — Indus Admin` }
}
