import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import { MENU_LOCATION_LABELS, type MenuLinkType, type MenuLocation } from '@indus/domain'
import NavigationEditor, { type EditorItem, type EditorMenu } from './NavigationEditor'

export const metadata: Metadata = { title: 'Edit menu — Indus Admin' }

type Props = { params: Promise<{ menuSlug: string }> }

export default async function MenuEditorPage({ params }: Props) {
  const { menuSlug } = await params

  const menu = await db.navMenu.findUnique({
    where: { slug: menuSlug },
    include: {
      items: {
        orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          industry: { select: { id: true, name: true, slug: true } },
          cmsPage: { select: { id: true, title: true, slug: true } },
          product: { select: { id: true, title: true, sku: true } },
          promoImage: { select: { id: true, storagePath: true } },
        },
      },
    },
  })

  if (!menu) notFound()

  const editorMenu: EditorMenu = {
    id: menu.id,
    slug: menu.slug,
    name: menu.name,
    location: menu.location as MenuLocation,
    isPublished: menu.isPublished,
    publishedAt: menu.publishedAt ? menu.publishedAt.toISOString() : null,
  }

  const items: EditorItem[] = menu.items.map((it) => {
    const target = (() => {
      switch (it.linkType as MenuLinkType) {
        case 'category':
          return it.category ? { id: it.category.id, label: it.category.name, sublabel: `/c/${it.category.slug}` } : null
        case 'brand':
          return it.brand ? { id: it.brand.id, label: it.brand.name, sublabel: `/brands/${it.brand.slug}` } : null
        case 'industry':
          return it.industry ? { id: it.industry.id, label: it.industry.name, sublabel: `/industries/${it.industry.slug}` } : null
        case 'cms_page':
          return it.cmsPage ? { id: it.cmsPage.id, label: it.cmsPage.title, sublabel: `/${it.cmsPage.slug}` } : null
        case 'product':
          return it.product ? { id: it.product.id, label: it.product.title, sublabel: it.product.sku } : null
        default:
          return null
      }
    })()

    return {
      id: it.id,
      parentId: it.parentId,
      position: it.position,
      label: it.label,
      iconName: it.iconName,
      badge: it.badge,
      description: it.description,
      linkType: it.linkType as MenuLinkType,
      customUrl: it.customUrl,
      openInNewTab: it.openInNewTab,
      isVisible: it.isVisible,
      target,
      categoryId: it.categoryId,
      brandId: it.brandId,
      industryId: it.industryId,
      cmsPageId: it.cmsPageId,
      productId: it.productId,
      promoImageId: it.promoImageId,
      promoImageUrl: it.promoImage?.storagePath ?? null,
      promoHeading: it.promoHeading,
      promoBody: it.promoBody,
      promoLinkUrl: it.promoLinkUrl,
    }
  })

  return (
    // No wrapper: NavigationEditor renders AdminPageShell, and the 60px bar has
    // to be a direct child of the layout column or it renders inset. The
    // location label moves into the bar's subtitle, alongside the publish state.
    <NavigationEditor
      menu={editorMenu}
      items={items}
      locationLabel={MENU_LOCATION_LABELS[editorMenu.location]}
    />
  )
}
