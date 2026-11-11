import 'server-only'
import { db } from '@indus/db'

import { BASE_URL, crawlableImageUrl } from '../seo'
import { getStoreSettings } from '../store-settings'
import { emptyDesign, newBlock } from './blocks/document'
import type { Block, ImageValue, RecordKind, RecordLayout, RecordsValue } from './blocks/types'
import type { CampaignDraft } from './campaign'
import { recordKey } from './blocks/render'
import { latestRecordIds, resolveRecords } from './records'
import { BUILT_IN_TEMPLATES, type BuiltInTemplateId } from './template-catalogue'

/**
 * The built-in templates behind "New newsletter": Bazar's set, in Indus
 * terms. Each one builds a whole draft — blocks, colours, a footer — and
 * fills itself from the live site, so it is close to sendable the moment it
 * opens:
 *
 *  - three are built around ONE record the editor picks first (a product
 *    launch, a brand spotlight, an industry focus) and take that record's own
 *    photo, words and related products;
 *  - the rest fill their product, brand and article blocks with the newest
 *    published records, which staff then swap in the designer.
 *
 * Featured records are stored as ids and drawn live at send time, so a
 * template never freezes a price, a photo or a title. Copy only staff can
 * know (an event's date and stand) is written in [brackets]; the send gate
 * refuses a newsletter that still has any.
 */

function picture(storagePath: string | null | undefined, alt: string, mediaId?: string | null): ImageValue | null {
  const url = crawlableImageUrl(storagePath)
  if (!url) return null
  return { url: url.startsWith('/') ? `${BASE_URL}${url}` : url, alt, mediaId: mediaId ?? null }
}

async function latest(kind: RecordKind, n: number, layout: RecordLayout): Promise<RecordsValue | null> {
  const picks = await latestRecordIds(kind, n)
  return picks.length ? { kind, ids: picks.map((p) => p.id), labels: picks.map((p) => p.label), layout } : null
}

function records(heading: string, value: RecordsValue | null, buttonLabel: string, buttonUrl: string, intro = ''): Block {
  return newBlock('records', { heading, intro, records: value, buttonLabel, buttonUrl })
}

/** Logo at the top, contact details and social links at the bottom — every block template has them. */
async function frame(): Promise<{ top: Block[]; bottom: Block[] }> {
  const s = await getStoreSettings()
  const place = [s.contactLocationLabel, s.registeredCity, s.registeredCountry].filter(Boolean)
  return {
    top: [newBlock('logo', { align: 'center' })],
    bottom: [
      newBlock('contact', {
        company: s.legalName ?? s.name,
        address: place.length ? [...new Set(place)].join(', ') : 'United Arab Emirates',
        phone: s.contactPhone ?? '',
        email: s.contactEmail ?? '',
      }),
      newBlock('social'),
    ],
  }
}

function draft(subject: string, preheader: string, blocks: Block[]): CampaignDraft {
  const design = emptyDesign()
  design.blocks = blocks
  return { subject, preheader, format: 'blocks', design, bodyHtml: '', audience: 'all', listIds: [] }
}

function rich(subject: string, bodyHtml: string): CampaignDraft {
  return { subject, preheader: '', format: 'rich', design: null, bodyHtml, audience: 'all', listIds: [] }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export class TemplateRecordMissing extends Error {}

export async function builtInTemplateDraft(id: BuiltInTemplateId, recordId?: string): Promise<CampaignDraft> {
  const meta = BUILT_IN_TEMPLATES.find((t) => t.id === id)
  if (!meta) throw new TemplateRecordMissing('That template does not exist.')
  if ('needs' in meta && meta.needs && !recordId) throw new TemplateRecordMissing(`Pick a ${meta.needs} first.`)

  switch (id) {
    case 'product-launch': {
      const p = await db.product.findFirst({
        where: { id: recordId, status: 'active' },
        select: {
          id: true,
          slug: true,
          title: true,
          descriptionShort: true,
          categoryId: true,
          brand: { select: { name: true } },
          category: { select: { name: true, slug: true } },
          images: { orderBy: { position: 'asc' }, take: 1, select: { alt: true, media: { select: { id: true, storagePath: true, alt: true } } } },
        },
      })
      if (!p) throw new TemplateRecordMissing('That product is not published any more.')
      const img = p.images[0]
      const related = p.categoryId
        ? await db.product.findMany({
            where: { categoryId: p.categoryId, status: 'active', id: { not: p.id } },
            orderBy: { updatedAt: 'desc' },
            take: 4,
            select: { id: true, title: true },
          })
        : []
      const { top, bottom } = await frame()
      return draft(`New in stock: ${p.title}`, p.descriptionShort?.slice(0, 160) ?? `${p.title}, in stock in the UAE.`, [
        ...top,
        newBlock('hero', {
          image: picture(img?.media.storagePath, img?.alt ?? img?.media.alt ?? p.title, img?.media.id),
          logo: 'none',
          eyebrow: p.brand?.name ? `New from ${p.brand.name}` : 'New in stock',
          heading: p.title,
          text: p.descriptionShort ?? '',
          buttonLabel: 'View the product',
          buttonUrl: `/p/${p.slug}`,
        }),
        newBlock('records', {
          heading: 'Featured',
          records: { kind: 'product', ids: [p.id], labels: [p.title], layout: 'list' },
          buttonLabel: '',
          buttonUrl: '',
        }),
        ...(related.length
          ? [
              records(
                p.category ? `More in ${p.category.name}` : 'More like it',
                { kind: 'product', ids: related.map((r) => r.id), labels: related.map((r) => r.title), layout: 'grid' },
                p.category ? `Browse ${p.category.name}` : 'View the catalogue',
                p.category ? `/c/${p.category.slug}` : '/c',
              ),
            ]
          : []),
        newBlock('cta-band', { heading: 'Want it quoted?', text: 'Send us the part number and quantity — we reply with price and lead time.' }),
        ...bottom,
      ])
    }

    case 'brand-spotlight': {
      const b = await db.brand.findFirst({
        where: { id: recordId, isPublished: true },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          country: true,
          partnerSince: true,
          fastestLeadTime: true,
          isAuthorizedDistributor: true,
          hero: { select: { id: true, storagePath: true, alt: true } },
        },
      })
      if (!b) throw new TemplateRecordMissing('That brand is not published any more.')
      const products = await db.product.findMany({
        where: { brandId: b.id, status: 'active' },
        orderBy: { updatedAt: 'desc' },
        take: 4,
        select: { id: true, title: true },
      })
      const stats = [
        b.partnerSince ? { value: String(b.partnerSince), label: 'Supplying since' } : null,
        b.fastestLeadTime ? { value: b.fastestLeadTime, label: 'Fastest lead time' } : null,
        b.country ? { value: b.country, label: 'Made in' } : null,
      ].filter((x): x is { value: string; label: string } => x !== null)
      const { top, bottom } = await frame()
      return draft(`${b.name}, from Indus Hydraulics`, `What we stock from ${b.name} and how fast it ships.`, [
        ...top,
        newBlock('hero', {
          image: picture(b.hero?.storagePath, b.hero?.alt ?? b.name, b.hero?.id),
          logo: 'none',
          eyebrow: b.isAuthorizedDistributor ? 'Authorised distributor' : 'Brand spotlight',
          heading: b.name,
          text: '',
          buttonLabel: `See ${b.name}`,
          buttonUrl: `/brands/${b.slug}`,
        }),
        ...(b.description ? [newBlock('text', { text: b.description.slice(0, 600) })] : []),
        ...(stats.length >= 2 ? [newBlock('stats', { heading: '', items: stats.slice(0, 4) })] : []),
        ...(products.length
          ? [
              records(
                `New from ${b.name}`,
                { kind: 'product', ids: products.map((p) => p.id), labels: products.map((p) => p.title), layout: 'grid' },
                `All ${b.name} products`,
                `/brands/${b.slug}`,
              ),
            ]
          : []),
        newBlock('cta-band'),
        ...bottom,
      ])
    }

    case 'industry-focus': {
      const i = await db.industry.findFirst({
        where: { id: recordId, isPublished: true },
        select: { id: true, slug: true, name: true, tagline: true, description: true, hero: { select: { id: true, storagePath: true, alt: true } } },
      })
      if (!i) throw new TemplateRecordMissing('That industry is not published any more.')
      const { top, bottom } = await frame()
      return draft(`Supplying ${i.name}`, i.tagline ?? `What we stock for ${i.name}.`, [
        ...top,
        newBlock('hero', {
          image: picture(i.hero?.storagePath, i.hero?.alt ?? i.name, i.hero?.id),
          logo: 'none',
          eyebrow: 'Industry focus',
          heading: i.name,
          text: i.tagline ?? '',
          buttonLabel: 'See what we supply',
          buttonUrl: `/industries/${i.slug}`,
        }),
        ...(i.description ? [newBlock('text', { text: i.description.slice(0, 600) })] : []),
        records('Popular ranges', await latest('category', 6, 'grid'), 'Browse the catalogue', '/c'),
        records('Guides from our engineers', await latest('article', 3, 'list'), 'Read more on the blog', '/blog'),
        newBlock('cta-band'),
        ...bottom,
      ])
    }

    case 'featured-products': {
      const { top, bottom } = await frame()
      return draft('', '', [
        ...top,
        newBlock('heading', { eyebrow: 'Ex-stock in the UAE', heading: 'New in stock', size: 'l', align: 'center' }),
        newBlock('text', { text: 'Just landed in our UAE warehouse and ready to ship across the GCC.', align: 'center' }),
        records('', await latest('product', 6, 'grid'), 'View the catalogue', '/c'),
        records('Brands we supply', await latest('brand', 4, 'grid'), 'All brands', '/brands'),
        newBlock('cta-band'),
        ...bottom,
      ])
    }

    case 'offer': {
      const { top, bottom } = await frame()
      return draft('', '', [
        ...top,
        newBlock('hero', { logo: 'none', eyebrow: 'This month', heading: '[What is on offer]', text: '[Who it is for and why now]', buttonLabel: 'Request a quote', buttonUrl: '/contact' }),
        newBlock('offer', {
          badge: '[Badge — e.g. 10% off]',
          heading: '[The offer in one line]',
          text: '[What is included, and how to claim it]',
          terms: '[Validity and conditions]',
          records: await latest('product', 4, 'grid'),
        }),
        newBlock('cta-band'),
        ...bottom,
      ])
    }

    case 'event-invitation': {
      const { top, bottom } = await frame()
      return draft('', '', [
        ...top,
        newBlock('hero', { logo: 'none', eyebrow: 'You are invited', heading: '[Event name]', text: '[One line on why to come]', buttonLabel: 'Book a meeting', buttonUrl: '/contact' }),
        newBlock('key-values', {
          heading: 'The details',
          items: [
            { label: 'Dates', value: '[Dates]' },
            { label: 'Venue', value: '[Venue, city]' },
            { label: 'Where to find us', value: '[Hall and stand]' },
          ],
        }),
        newBlock('text', { text: '[What you will show, and who from the team will be there]' }),
        records('What we are bringing', await latest('product', 4, 'grid'), 'View the catalogue', '/c'),
        newBlock('button', { label: 'Book a meeting', url: '/contact', align: 'center' }),
        ...bottom,
      ])
    }

    case 'announcement': {
      const { top, bottom } = await frame()
      return draft('', '', [
        ...top,
        newBlock('heading', { heading: '[Headline]', size: 'l' }),
        newBlock('text', { text: '[Write what has changed, what it means for customers, and what they should do next.]' }),
        newBlock('button', { label: 'Contact us', url: '/contact' }),
        ...bottom,
      ])
    }

    case 'build-your-own': {
      const { top, bottom } = await frame()
      return draft('', '', [...top, ...bottom])
    }

    case 'rich-blank':
      return rich('', '')

    case 'rich-letter':
      return rich('', '<p>Hello,</p><p>[Write your message.]</p><p>Best regards,<br>The Indus Hydraulics team</p>')

    case 'rich-digest': {
      const [products, articles] = await Promise.all([latestRecordIds('product', 6), latestRecordIds('article', 3)])
      const found = await resolveRecords([
        { kind: 'product', ids: products.map((p) => p.id) },
        { kind: 'article', ids: articles.map((a) => a.id) },
      ])
      const item = (kind: RecordKind, id: string) => {
        const r = found.get(recordKey(kind, id))
        return r ? `<li><a href="${esc(r.url)}">${esc(r.title)}</a>${r.subtitle ? ` — ${esc(r.subtitle)}` : ''}</li>` : ''
      }
      return rich(
        '',
        [
          '<p>Hello,</p><p>Here is what is new at Indus Hydraulics this month.</p>',
          products.length ? `<h2>New in stock</h2><ul>${products.map((p) => item('product', p.id)).join('')}</ul>` : '',
          articles.length ? `<h2>From the blog</h2><ul>${articles.map((a) => item('article', a.id)).join('')}</ul>` : '',
          '<p>Need a part quoted? Reply to this email with the part number and quantity.</p>',
        ].join(''),
      )
    }
  }
}
