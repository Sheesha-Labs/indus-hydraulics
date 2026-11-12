import 'server-only'
import { BRAND } from '@indus/domain'
import { db, type Prisma } from '@indus/db'

import { getFooterSocials } from '../footer'
import { BASE_URL, crawlableImageUrl } from '../seo'
import { getStoreSettings } from '../store-settings'
import { emptyDesign, newBlock } from './blocks/document'
import { recordKey } from './blocks/render'
import type { Block, ImageValue, Props, RecordKind, RecordLayout, RecordsValue } from './blocks/types'
import type { CampaignDraft } from './campaign'
import { latestRecordIds, resolveRecords } from './records'
import { BUILT_IN_TEMPLATES, type BuiltInTemplateId } from './template-catalogue'

/**
 * The built-in templates behind "New newsletter". Each builds a whole draft —
 * blocks, colours, masthead and footer — and fills itself from the live site,
 * so it is close to sendable the moment it opens:
 *
 *  - six are built around ONE record the editor picks first (a product, a
 *    range, a brand, an industry, a blog article, a case study) and take that
 *    record's own photo, words and neighbours;
 *  - the rest fill their product, brand, article and case-study blocks with
 *    recent published records, which staff then swap in the designer.
 *
 * The look is Indus's: a navy masthead with the white logo, a blue-and-steel
 * stripe between bands, poster capitals or the serif for headlines, a navy
 * footer with the contact details and round social badges.
 *
 * Every fact comes from the database — the store settings (phone, email,
 * hours, the certification line, the year in the tagline), the case studies'
 * own outcomes and specs. Featured records are stored as ids and drawn live
 * at send time, so a template never freezes a price, a photo or a title.
 * What only staff can know (a holiday's dates, an offer's terms) is written
 * in [brackets]; the send gate refuses a newsletter that still has any.
 */

// ── Pieces ─────────────────────────────────────────────────────────────

function picture(storagePath: string | null | undefined, alt: string, mediaId?: string | null): ImageValue | null {
  const url = crawlableImageUrl(storagePath)
  if (!url) return null
  return { url: url.startsWith('/') ? `${BASE_URL}${url}` : url, alt, mediaId: mediaId ?? null }
}

const pick = (kind: RecordKind, rows: { id: string; label: string }[], layout: RecordLayout): RecordsValue | null =>
  rows.length ? { kind, ids: rows.map((r) => r.id), labels: rows.map((r) => r.label), layout } : null

async function latest(kind: RecordKind, n: number, layout: RecordLayout): Promise<RecordsValue | null> {
  return pick(kind, await latestRecordIds(kind, n), layout)
}

function records(heading: string, value: RecordsValue | null, buttonLabel: string, buttonUrl: string, extra: Props = {}): Block[] {
  return value ? [newBlock('records', { heading, intro: '', records: value, buttonLabel, buttonUrl, ...extra })] : []
}

/** Every category's top-level range, for spreading a pick across the catalogue. */
async function rootOf(): Promise<(id: string | null) => string | null> {
  const all = await db.category.findMany({ select: { id: true, parentId: true } })
  const parent = new Map(all.map((c) => [c.id, c.parentId]))
  return (id) => {
    let at = id
    for (let i = 0; at && parent.get(at) && i < 8; i++) at = parent.get(at) ?? null
    return at
  }
}

/**
 * Recently updated products that have a photograph — spread across the
 * catalogue first (one per top-level range, then one per category), so a
 * mailer is not six anchor chains from one import. `where` narrows the pool
 * (a category, a brand); `skip` leaves out ids already shown.
 */
async function freshProducts(n: number, o: { where?: Prisma.ProductWhereInput; skip?: string[]; withSummary?: boolean } = {}) {
  const root = await rootOf()
  const pool = await db.product.findMany({
    where: {
      status: 'active',
      images: { some: {} },
      ...(o.skip?.length ? { id: { notIn: o.skip } } : {}),
      ...(o.withSummary ? { descriptionShort: { not: null } } : {}),
      ...o.where,
    },
    orderBy: { updatedAt: 'desc' },
    take: Math.max(n * 30, 200),
    select: { id: true, title: true, categoryId: true },
  })
  const out: typeof pool = []
  for (const key of [(p: (typeof pool)[number]) => root(p.categoryId), (p: (typeof pool)[number]) => p.categoryId]) {
    const seen = new Set(out.map(key))
    for (const p of pool) {
      if (out.length >= n) break
      if (out.includes(p) || seen.has(key(p))) continue
      seen.add(key(p))
      out.push(p)
    }
  }
  for (const p of pool) if (out.length < n && !out.includes(p)) out.push(p)
  return out.slice(0, n).map((p) => ({ id: p.id, label: p.title }))
}

/** Published case studies with a photo, the featured one first. */
async function caseStudies(n: number, o: { where?: Prisma.ServiceCaseWhereInput; orderBy?: Prisma.ServiceCaseOrderByWithRelationInput[] } = {}) {
  return db.serviceCase.findMany({
    where: { status: 'published', heroImageId: { not: null }, ...o.where },
    orderBy: o.orderBy ?? [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
    take: n,
    select: {
      id: true,
      slug: true,
      title: true,
      topicLabel: true,
      category: true,
      heroImage: { select: { id: true, storagePath: true, alt: true } },
    },
  })
}

/** What each kind of case study says about the workshop — for the "what we take in" lists. Only kinds with a published case are used. */
const CASE_LINE: Record<string, string> = {
  bop_pressure_control: 'BOP and pressure-control recertification',
  cylinders: 'Cylinder strip-down, reseal and test',
  hoses: 'Hose assemblies, built and proof-tested',
  pumps: 'Pumps and power units rebuilt',
  valves_manifolds: 'Valves and manifolds repaired',
  ct_wireline: 'Coiled tubing and wireline equipment',
  wellhead: 'Wellhead equipment serviced',
  field_service: 'Field crews and well-control training',
  lab_forensics: 'Oil analysis to ISO 4406',
  custom_builds: 'Custom manifolds and one-off builds',
}

async function workshopLines(max = 6): Promise<{ text: string }[]> {
  const kinds = await db.serviceCase.groupBy({ by: ['category'], where: { status: 'published' }, _count: { _all: true }, orderBy: { _count: { category: 'desc' } } })
  return kinds
    .map((k) => CASE_LINE[k.category])
    .filter((l): l is string => Boolean(l))
    .slice(0, max)
    .map((text) => ({ text }))
}

/** Brands with a logo or photo, so a tile never shows a bare name. */
async function brandsWithPictures(n: number) {
  const rows = await db.brand.findMany({
    where: { isPublished: true, OR: [{ logoId: { not: null } }, { heroId: { not: null } }] },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    take: n,
    select: { id: true, name: true },
  })
  return pick('brand', rows.map((b) => ({ id: b.id, label: b.name })), 'tiles')
}

const firstTopic = (topic: string) => topic.split('·')[0]?.trim() || topic
/** "🇦🇪 UAE · Jebel Ali" → "UAE · Jebel Ali": inboxes draw flag emoji unevenly. */
const plainRegion = (r: string | null) => (r ?? '').replace(/[^\x20-\x7E·–—’]/g, '').trim()
const digits = (v: string | null | undefined) => (v ?? '').replace(/[^\d]/g, '')
const monthLabel = () => new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric', timeZone: 'Asia/Dubai' })
const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(' ', n - 1) > n - 30 ? s.lastIndexOf(' ', n - 1) : n - 1).replace(/[\s,.;:–—-]+$/, '')}…`)

const SOCIAL_NETWORK: Record<string, string> = { linkedin: 'linkedin', instagram: 'instagram', facebook: 'facebook', x: 'x', twitter: 'x', youtube: 'youtube', whatsapp: 'whatsapp' }

type Kit = Awaited<ReturnType<typeof kit>>

/** The store's own facts, and the masthead, stripe and footer every template shares. */
async function kit() {
  const [s, socials] = await Promise.all([getStoreSettings(), getFooterSocials()])
  const wa = digits(s.contactPhone)
  const whatsappUrl = wa.length >= 8 ? `https://wa.me/${wa}` : ''
  const since = /since (\d{4})/i.exec(s.tagline ?? '')?.[1] ?? null
  const place = [s.contactLocationLabel, s.registeredCity, s.registeredCountry].filter(Boolean)

  const mast = (o: { label?: string; title?: string; watermark?: string } = {}) =>
    newBlock('masthead', { label: o.label ?? '', title: o.title ?? '', watermark: o.watermark ?? '', padding: o.watermark ? 'm' : 's' })
  const stripe = (color: string = BRAND.accent, second: string = BRAND.steel) => newBlock('stripe', { color, height: 8, secondColor: second, secondHeight: 3 })

  const badges = [
    ...socials.map((x) => ({ network: SOCIAL_NETWORK[x.platform] ?? 'website', url: x.href })),
    ...(whatsappUrl ? [{ network: 'whatsapp', url: whatsappUrl }] : []),
    ...(s.contactEmail ? [{ network: 'email', url: `mailto:${s.contactEmail}` }] : []),
    { network: 'website', url: '/' },
  ].slice(0, 6)

  const footer = (accent: string = BRAND.accent): Block[] => [
    stripe(accent),
    newBlock('social', {
      items: badges,
      style: 'badges',
      badgeColor: BRAND.white,
      badgeTextColor: BRAND.navy,
      align: 'center',
      background: BRAND.navy,
      padding: 'm',
    }),
    // Name and address are in the legal band under it; this row is how to reach us.
    newBlock('contact', {
      company: '',
      address: place.length ? [...new Set(place)].join(', ') : '',
      phone: s.contactPhone ?? '',
      whatsapp: whatsappUrl ? (s.contactPhone ?? '') : '',
      email: s.contactEmail ?? '',
      links: [
        { label: 'Catalogue', url: '/c' },
        { label: 'Case studies', url: '/services' },
        { label: 'Blog', url: '/blog' },
        { label: 'Contact us', url: '/contact' },
      ],
      align: 'center',
      textColor: BRAND.onNavy,
      background: BRAND.navy,
      padding: 's',
    }),
  ]

  /** The figures every template may quote — only those the settings support. */
  const figures = [
    since ? { value: `Since ${since}`, label: 'Supplying the GCC' } : null,
    s.certificationLine ? { value: s.certificationLine.replace(/\s*certified\s*$/i, ''), label: 'Certified quality system' } : null,
    { value: 'Same day', label: 'Quote turnaround' },
    { value: 'GCC-wide', label: 'Delivery' },
  ].filter((x): x is { value: string; label: string } => x !== null)

  const desk = (o: { name: string; role: string; text: string; background?: string }) =>
    newBlock('person', {
      name: o.name,
      role: o.role,
      text: o.text,
      phone: s.contactPhone ?? '',
      whatsapp: whatsappUrl ? (s.contactPhone ?? '') : '',
      email: s.contactEmail ?? '',
      background: o.background ?? BRAND.surface2,
      padding: 'm',
    })

  return { s, whatsappUrl, since, mast, stripe, footer, figures, desk }
}

/** A navy poster band: upper-case headline with ==marked== words in steel. */
function poster(heading: string, o: { eyebrow?: string; size?: 'l' | 'xl'; highlight?: string } = {}): Block {
  return newBlock('heading', {
    eyebrow: o.eyebrow ?? '',
    heading,
    size: o.size ?? 'xl',
    caps: true,
    highlightColor: o.highlight ?? BRAND.steel,
    align: 'center',
    textColor: BRAND.white,
    background: BRAND.navy,
    padding: 'l',
  })
}

function closing(k: Kit, o: { heading?: string; text?: string; secondary?: [string, string] | null; highlight?: string } = {}): Block {
  return newBlock('cta-band', {
    heading: o.heading ?? 'Can’t find ==the part?==',
    caps: true,
    highlightColor: o.highlight ?? BRAND.steel,
    text: o.text ?? 'Send us the part number, a nameplate photo or the old part. Our engineers match it and quote the same day.',
    primaryLabel: 'Request a quote',
    primaryUrl: '/contact',
    secondaryLabel: o.secondary === null ? '' : (o.secondary?.[0] ?? (k.whatsappUrl ? 'WhatsApp us' : 'Browse the catalogue')),
    secondaryUrl: o.secondary === null ? '' : (o.secondary?.[1] ?? (k.whatsappUrl || '/c')),
  })
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

/** A heading with ==marks== on its accent phrase, if the phrase is in it. */
function marked(title: string, accent: string | null | undefined): string {
  const a = accent?.trim()
  return a && title.includes(a) ? title.replace(a, `==${a}==`) : title
}

export class TemplateRecordMissing extends Error {}

// ── The templates ──────────────────────────────────────────────────────

export async function builtInTemplateDraft(id: BuiltInTemplateId, recordId?: string): Promise<CampaignDraft> {
  const meta = BUILT_IN_TEMPLATES.find((t) => t.id === id)
  if (!meta) throw new TemplateRecordMissing('That template does not exist.')
  if ('needs' in meta && meta.needs && !recordId) throw new TemplateRecordMissing(`Pick a ${meta.needs} first.`)

  switch (id) {
    // ── Products & ranges ──

    case 'product-news': {
      const k = await kit()
      const rows = await freshProducts(5, { withSummary: true })
      const tiles = await freshProducts(5, { skip: rows.map((r) => r.id) })
      return draft(`Product news — ${monthLabel()}`, `New this month: ${rows.slice(0, 3).map((r) => r.label).join(', ')}`.slice(0, 160), [
        k.mast({ label: 'This month’s selection', title: 'Hydraulics & fluid power', watermark: 'Product news' }),
        k.stripe(),
        newBlock('heading', { eyebrow: monthLabel(), heading: 'New on the site this month', size: 'm', align: 'center', background: BRAND.surface2, padding: 'm' }),
        ...records('', pick('product', rows, 'rows'), '', '', { itemLabel: 'Discover', background: BRAND.surface2, padding: 's' }),
        newBlock('heading', { heading: 'Don’t miss…', size: 'm', align: 'center', background: BRAND.surface2, padding: 'm' }),
        ...records('', await latest('article', 1, 'cards'), 'More from the blog', '/blog', { background: BRAND.surface2, padding: 's' }),
        ...records('More new arrivals', pick('product', tiles, 'tiles'), 'And many other products…', '/c', { align: 'center', background: BRAND.surface2, padding: 'l' }),
        ...k.footer(),
      ])
    }

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
      const related = p.categoryId ? await freshProducts(4, { where: { categoryId: p.categoryId }, skip: [p.id] }) : []
      const k = await kit()
      return draft(`New: ${p.title}`, p.descriptionShort?.slice(0, 160) ?? `${p.title}, from Indus Hydraulics.`, [
        k.mast({ label: p.brand?.name ? `New from ${p.brand.name}` : 'Product launch', title: p.category?.name ?? '' }),
        k.stripe(),
        newBlock('hero', {
          image: picture(img?.media.storagePath, img?.alt ?? img?.media.alt ?? p.title, img?.media.id),
          logo: 'none',
          eyebrow: p.brand?.name ? `New from ${p.brand.name}` : 'Just launched',
          heading: p.title,
          text: p.descriptionShort ?? '',
          buttonLabel: 'View the product',
          buttonUrl: `/p/${p.slug}`,
          overlayOpacity: 60,
        }),
        ...records('', { kind: 'product', ids: [p.id], labels: [p.title], layout: 'rows' }, '', '', { itemLabel: 'Full specification', background: BRAND.surface2 }),
        ...records(
          p.category ? `More in ${p.category.name}` : 'More like it',
          pick('product', related, 'grid'),
          p.category ? `Browse ${p.category.name}` : 'View the catalogue',
          p.category ? `/c/${p.category.slug}` : '/c',
        ),
        closing(k, { heading: 'Want it ==quoted?==', text: 'Send us the part number and quantity — we reply with price and lead time.' }),
        ...k.footer(),
      ])
    }

    case 'category-showcase': {
      const c = await db.category.findFirst({
        where: { id: recordId, isPublished: true },
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          parentId: true,
          image: { select: { id: true, storagePath: true, alt: true } },
          children: { where: { isPublished: true }, select: { id: true, children: { where: { isPublished: true }, select: { id: true } } } },
        },
      })
      if (!c) throw new TemplateRecordMissing('That category is not published any more.')
      const tree = [c.id, ...c.children.flatMap((ch) => [ch.id, ...ch.children.map((g) => g.id)])]
      const rows = await freshProducts(3, { where: { categoryId: { in: tree } }, withSummary: true })
      const tiles = await freshProducts(5, { where: { categoryId: { in: tree } }, skip: rows.map((r) => r.id) })
      const siblings = await db.category.findMany({
        where: { isPublished: true, parentId: c.parentId, id: { not: c.id }, imageId: { not: null } },
        orderBy: { name: 'asc' },
        take: 4,
        select: { id: true, name: true },
      })
      const k = await kit()
      return draft(`${c.name}: what we supply`, c.shortDescription?.slice(0, 160) ?? `${c.name} from Indus Hydraulics.`, [
        k.mast({ label: 'Range in focus', title: monthLabel() }),
        k.stripe(),
        newBlock('hero', {
          image: picture(c.image?.storagePath, c.image?.alt ?? c.name, c.image?.id),
          logo: 'none',
          eyebrow: 'Range in focus',
          heading: c.name,
          caps: true,
          text: c.shortDescription ?? '',
          buttonLabel: 'Browse the range',
          buttonUrl: `/c/${c.slug}`,
          overlayOpacity: 60,
          height: c.image ? 'l' : 's',
        }),
        ...records('From the range', pick('product', rows, 'rows'), '', '', { itemLabel: 'View product', align: 'center', background: BRAND.surface2 }),
        ...records('', pick('product', tiles, 'tiles'), `All ${c.name}`, `/c/${c.slug}`, { background: BRAND.surface2, padding: 's' }),
        newBlock('steps', { eyebrow: 'How to order', heading: 'Three steps to a ==quote==', highlightColor: BRAND.accent }),
        ...records('Related ranges', pick('category', siblings.map((x) => ({ id: x.id, label: x.name })), 'grid'), 'All categories', '/c', { background: BRAND.surface2 }),
        closing(k),
        ...k.footer(),
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
      const products = await freshProducts(4, { where: { brandId: b.id } })
      const stats = [
        b.partnerSince ? { value: String(b.partnerSince), label: 'Supplying since' } : null,
        b.fastestLeadTime ? { value: b.fastestLeadTime, label: 'Fastest lead time' } : null,
        b.country ? { value: b.country, label: 'Made in' } : null,
      ].filter((x): x is { value: string; label: string } => x !== null)
      const k = await kit()
      return draft(`${b.name}, from Indus Hydraulics`, `What we stock from ${b.name} and how fast it ships.`, [
        k.mast({ label: b.isAuthorizedDistributor ? 'Authorised distributor' : 'Brand spotlight', title: b.name }),
        k.stripe(),
        newBlock('hero', {
          image: picture(b.hero?.storagePath, b.hero?.alt ?? b.name, b.hero?.id),
          logo: 'none',
          eyebrow: b.isAuthorizedDistributor ? 'Authorised distributor' : 'Brand spotlight',
          heading: b.name,
          caps: true,
          text: '',
          buttonLabel: `See ${b.name}`,
          buttonUrl: `/brands/${b.slug}`,
          height: b.hero ? 'l' : 's',
        }),
        ...(b.description ? [newBlock('text', { text: b.description.slice(0, 600), size: 'l', padding: 'm' })] : []),
        ...(stats.length >= 2 ? [newBlock('stats', { heading: '', items: stats.slice(0, 4), background: BRAND.navy, textColor: BRAND.onNavy, valueColor: BRAND.white })] : []),
        ...records(`New from ${b.name}`, pick('product', products, 'grid'), `All ${b.name} products`, `/brands/${b.slug}`),
        closing(k),
        ...k.footer(),
      ])
    }

    case 'featured-products': {
      const k = await kit()
      const grid = await freshProducts(4)
      return draft('', '', [
        k.mast({ label: 'Featured', title: monthLabel() }),
        k.stripe(),
        newBlock('heading', { eyebrow: 'Featured this month', heading: 'Picked by our team', size: 'l', align: 'center', padding: 'm' }),
        newBlock('text', { text: '[Why these, and who they are for.]', align: 'center' }),
        ...records('', pick('product', grid, 'grid'), 'View the catalogue', '/c'),
        ...records('Brands we supply', await brandsWithPictures(5), 'All brands', '/brands', { align: 'center', background: BRAND.surface2 }),
        closing(k),
        ...k.footer(),
      ])
    }

    // ── Services & case studies ──

    case 'service-spotlight': {
      const k = await kit()
      const cases = await caseStudies(4)
      const lead = cases[0]
      return draft('Repaired, tested, certified — the Indus workshop', 'Cylinders, hoses, pumps and pressure-control equipment, rebuilt and tested with the paperwork.', [
        k.mast({ label: 'Workshop & field services', title: 'Repair · Test · Certify' }),
        k.stripe(),
        poster('Repaired. Tested. ==Certified.==', { eyebrow: 'The Indus workshop' }),
        ...(lead?.heroImage
          ? [newBlock('image', { image: picture(lead.heroImage.storagePath, lead.heroImage.alt ?? lead.title, lead.heroImage.id), alt: lead.heroImage.alt ?? lead.title, link: `/services/${lead.slug}`, fullBleed: true, background: BRAND.navy })]
          : []),
        k.stripe(),
        newBlock('section', {
          heading: 'One workshop for the whole circuit',
          size: 'm',
          text: 'When a cylinder weeps, a hose bursts or a stack comes due for recertification, our workshop strips it, rebuilds it and pressure-tests it — and it comes back with the paperwork.',
          buttonLabel: 'Request a service',
          buttonUrl: '/contact',
          background: BRAND.surface2,
        }),
        newBlock('checklist', {
          heading: 'What we ==take in==',
          caps: true,
          highlightColor: BRAND.steel,
          items: await workshopLines(),
          style: 'pills',
          markColor: BRAND.accent,
          buttonLabel: 'Talk to an engineer',
          buttonUrl: '/contact',
          buttonColor: BRAND.white,
          buttonTextColor: BRAND.navy,
        }),
        k.stripe(),
        ...(cases.length >= 2
          ? [
              newBlock('image-grid', {
                heading: 'From the ==workshop floor==',
                caps: true,
                highlightColor: BRAND.accent,
                items: cases
                  .slice(0, cases.length >= 4 ? 4 : 2)
                  .map((c) => ({ image: picture(c.heroImage?.storagePath, c.heroImage?.alt ?? c.title, c.heroImage?.id), alt: c.heroImage?.alt ?? c.title, caption: firstTopic(c.topicLabel), link: `/services/${c.slug}` })),
              }),
            ]
          : []),
        newBlock('steps', {
          eyebrow: 'How a repair runs',
          heading: 'From your yard and ==back again==',
          highlightColor: BRAND.accent,
          items: [
            { title: 'Send photos', text: 'The nameplate, the fault and when you need it back.' },
            { title: 'Strip and quote', text: 'We open it up and quote the repair, not a guess.' },
            { title: 'Rebuild and test', text: 'Seals, parts and a pressure test to the standard.' },
            { title: 'Back with papers', text: 'Test report and certificate in the box.' },
          ],
        }),
        closing(k, { heading: 'Need it ==back next month?==', text: 'Send photos and the nameplate. An engineer replies the same day.', secondary: ['See case studies', '/services'] }),
        ...k.footer(),
      ])
    }

    case 'case-study': {
      const c = await db.serviceCase.findFirst({
        where: { id: recordId, status: 'published' },
        select: {
          id: true,
          slug: true,
          caseNumber: true,
          category: true,
          topicLabel: true,
          region: true,
          title: true,
          titleAccent: true,
          deck: true,
          cardOneLiner: true,
          heroImageCaption: true,
          heroImage: { select: { id: true, storagePath: true, alt: true } },
          cardOutcomePills: true,
          specsAtGlance: true,
          pullQuoteText: true,
          pullQuoteAuthor: true,
          pullQuoteRole: true,
          pullQuoteLocation: true,
          ctaCardTitle: true,
          ctaCardBody: true,
        },
      })
      if (!c) throw new TemplateRecordMissing('That case study is not published any more.')
      const outcomes = (Array.isArray(c.cardOutcomePills) ? c.cardOutcomePills : [])
        .map((x) => (x && typeof x === 'object' && 'label' in x ? String((x as { label: unknown }).label) : ''))
        .filter(Boolean)
        .slice(0, 6)
      const specs = (Array.isArray(c.specsAtGlance) ? c.specsAtGlance : [])
        .map((x) => (x && typeof x === 'object' ? { label: String((x as { label?: unknown }).label ?? ''), value: String((x as { value?: unknown }).value ?? '') } : null))
        .filter((x): x is { label: string; value: string } => Boolean(x?.label && x.value))
        .slice(0, 10)
      const more = await caseStudies(2, { where: { id: { not: c.id }, category: c.category } })
      const moreIds = more.length >= 2 ? more : [...more, ...(await caseStudies(2 - more.length, { where: { id: { notIn: [c.id, ...more.map((m) => m.id)] } } }))]
      const k = await kit()
      const topics = c.topicLabel
        .split('·')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 3)
      return draft(`From the workshop: ${clip(c.title, 90)}`, clip(c.cardOneLiner || c.deck, 150), [
        newBlock('topbar', { items: topics.map((text) => ({ text })), url: `/services/${c.slug}`, background: BRAND.accent }),
        k.mast({ label: `Case study${c.caseNumber ? ` ${c.caseNumber}` : ''}`, title: plainRegion(c.region) }),
        k.stripe(),
        newBlock('heading', {
          eyebrow: 'From the workshop',
          heading: marked(c.title, c.titleAccent),
          size: 'm',
          highlightColor: BRAND.steel,
          align: 'start',
          textColor: BRAND.white,
          background: BRAND.navy,
          padding: 'l',
        }),
        ...(c.heroImage
          ? [
              newBlock('image', {
                image: picture(c.heroImage.storagePath, c.heroImage.alt ?? c.title, c.heroImage.id),
                alt: c.heroImage.alt ?? c.title,
                caption: c.heroImageCaption ?? '',
                link: `/services/${c.slug}`,
                fullBleed: true,
                padding: 'none',
              }),
            ]
          : []),
        newBlock('text', { text: c.deck, size: 'l', padding: 'm' }),
        ...(outcomes.length
          ? [
              newBlock('checklist', {
                heading: 'The ==outcome==',
                caps: true,
                highlightColor: BRAND.steel,
                items: outcomes.map((text) => ({ text })),
                style: 'tiles',
                markColor: BRAND.accent,
                pillColor: BRAND.navy2,
                pillTextColor: BRAND.white,
                padding: 'm',
              }),
            ]
          : []),
        ...(specs.length ? [newBlock('key-values', { heading: 'At a glance', items: specs })] : []),
        ...(c.pullQuoteText
          ? [
              newBlock('quote', {
                quote: c.pullQuoteText,
                author: c.pullQuoteAuthor ?? '',
                role: [c.pullQuoteRole, c.pullQuoteLocation ? c.pullQuoteLocation.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase()) : ''].filter(Boolean).join(', '),
                padding: 'l',
              }),
            ]
          : []),
        closing(k, {
          heading: c.ctaCardTitle ?? 'Need the ==same done?==',
          text: c.ctaCardBody ?? 'Send photos and the nameplate. An engineer replies the same day.',
          secondary: ['Read the full case study', `/services/${c.slug}`],
        }),
        ...records('More from the workshop', pick('service', moreIds.map((m) => ({ id: m.id, label: m.title })), 'rows'), 'All case studies', '/services', {
          itemLabel: 'Read the case study',
          background: BRAND.surface2,
        }),
        ...k.footer(),
      ])
    }

    case 'rapid-response': {
      const k = await kit()
      const fast = await caseStudies(2, { where: { durationDays: { not: null } }, orderBy: [{ durationDays: 'asc' }] })
      return draft('Line down? Here is how fast we move', 'Send a photo of the nameplate — an engineer matches it, quotes it and tells you when it can be on site.', [
        k.mast({ label: 'Breakdown support', title: k.s.contactPhone ?? '' }),
        k.stripe(),
        newBlock('hero', {
          image: null,
          logo: 'none',
          eyebrow: 'Breakdown support',
          heading: 'Line down? ==We move fast.==',
          caps: true,
          highlightColor: BRAND.steel,
          text: 'Send us a photo of the nameplate or the failed part. An engineer matches it, quotes it and tells you when it can be on site.',
          buttonLabel: k.whatsappUrl ? 'WhatsApp the workshop' : 'Contact the workshop',
          buttonUrl: k.whatsappUrl || '/contact',
          height: 'm',
        }),
        k.stripe(),
        newBlock('steps', {
          eyebrow: 'What happens next',
          heading: 'Four steps back to ==running==',
          highlightColor: BRAND.accent,
          items: [
            { title: 'Send a photo', text: 'Nameplate, part number or the failed part.' },
            { title: 'We match it', text: 'An engineer identifies the part or the repair.' },
            { title: 'Price and timing', text: 'A quote and when it can be with you.' },
            { title: 'Back running', text: 'A new part, a rebuild or a matched equivalent.' },
          ],
        }),
        newBlock('checklist', { heading: 'What we ==turn round==', caps: true, highlightColor: BRAND.steel, items: await workshopLines(), style: 'pills', markColor: BRAND.accent }),
        ...records('Recent turnarounds', pick('service', fast.map((m) => ({ id: m.id, label: m.title })), 'rows'), 'All case studies', '/services', {
          itemLabel: 'How we did it',
          background: BRAND.surface2,
        }),
        k.desk({ name: 'Indus service desk', role: 'Workshop and field service', text: k.s.contactHours ? `Office hours ${k.s.contactHours}. Send the photo any time — it is the first thing we look at.` : 'Send the photo any time — it is the first thing we look at.', background: '' }),
        ...k.footer(),
      ])
    }

    // ── Offers & alerts ──

    case 'stock-alert': {
      const k = await kit()
      const rows = await freshProducts(4, { withSummary: true })
      return draft('On the shelf now — ready to ship', '[Which items are in stock, and until when]', [
        newBlock('topbar', { items: [{ text: 'On the shelf now' }, { text: 'Ships this week' }, { text: 'While stock lasts' }], background: BRAND.warning, textColor: BRAND.navy }),
        k.mast({ label: 'Stock alert', title: monthLabel(), watermark: 'In stock' }),
        poster('On the shelf. ==Ready to ship.==', { highlight: BRAND.warning, size: 'l' }),
        k.stripe(BRAND.warning, BRAND.navy2),
        newBlock('text', { text: '[Which items, how many of each, and until when.]', align: 'center', background: BRAND.surface2, padding: 'm' }),
        ...records('', pick('product', rows, 'rows'), '', '', { itemLabel: 'See the part', background: BRAND.surface2, padding: 's' }),
        newBlock('spacer', { height: 24, background: BRAND.surface2 }),
        newBlock('checklist', {
          heading: 'Why order ==from stock==',
          caps: true,
          highlightColor: BRAND.warning,
          items: [{ text: 'No factory lead time' }, { text: 'Quoted the same day' }, { text: 'Shipped across the GCC' }, { text: 'Certificate of conformity with every order' }],
          style: 'bars',
          markColor: BRAND.accent,
        }),
        k.stripe(BRAND.warning, BRAND.navy2),
        closing(k, {
          heading: 'Need it ==this week?==',
          highlight: BRAND.warning,
          text: 'Send the part number and quantity — we confirm stock and price the same day.',
        }),
        ...k.footer(BRAND.warning),
      ])
    }

    case 'offer': {
      const k = await kit()
      return draft('', '', [
        k.mast({ label: 'This month', title: 'Offer' }),
        k.stripe(),
        newBlock('hero', {
          logo: 'none',
          eyebrow: 'This month',
          heading: '[What is on offer]',
          caps: true,
          text: '[Who it is for and why now]',
          buttonLabel: 'Request a quote',
          buttonUrl: '/contact',
        }),
        newBlock('offer', {
          badge: '[Badge — e.g. 10% off]',
          heading: '[The offer in one line]',
          text: '[What is included, and how to claim it]',
          terms: '[Validity and conditions]',
          records: pick('product', await freshProducts(4), 'grid'),
          background: BRAND.surface2,
        }),
        closing(k),
        ...k.footer(),
      ])
    }

    // ── Know-how & industries ──

    case 'engineering-guide': {
      const a = await db.blogPost.findFirst({
        where: { id: recordId, status: 'published', deletedAt: null },
        select: { id: true, slug: true, title: true, excerpt: true, categoryId: true, category: { select: { name: true } }, hero: { select: { id: true, storagePath: true, alt: true } } },
      })
      if (!a) throw new TemplateRecordMissing('That article is not published any more.')
      const related = await db.blogPost.findMany({
        where: { status: 'published', deletedAt: null, id: { not: a.id }, ...(a.categoryId ? { categoryId: a.categoryId } : {}) },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: { id: true, title: true },
      })
      const k = await kit()
      return draft(a.title, a.excerpt?.slice(0, 160) ?? '', [
        k.mast({ label: 'Engineering notes', title: a.category?.name ?? monthLabel(), watermark: 'Know-how' }),
        k.stripe(),
        ...(a.hero ? [newBlock('image', { image: picture(a.hero.storagePath, a.hero.alt ?? a.title, a.hero.id), alt: a.hero.alt ?? a.title, link: `/blog/${a.slug}`, fullBleed: true })] : []),
        newBlock('heading', { eyebrow: 'From our engineers', heading: a.title, size: 'l', padding: 'm' }),
        ...(a.excerpt ? [newBlock('text', { text: a.excerpt, size: 'l' })] : []),
        newBlock('button', { label: 'Read the full guide', url: `/blog/${a.slug}`, align: 'start', padding: 'm' }),
        newBlock('checklist', {
          heading: 'Key ==takeaways==',
          caps: true,
          highlightColor: BRAND.accent,
          items: [{ text: '[First takeaway]' }, { text: '[Second takeaway]' }, { text: '[Third takeaway]' }, { text: '[Fourth takeaway]' }],
          style: 'tiles',
          markColor: BRAND.accent,
          pillColor: BRAND.white,
          pillTextColor: BRAND.ink,
          textColor: BRAND.ink,
          background: BRAND.surface2,
          padding: 'm',
        }),
        ...records('Related reading', pick('article', related.map((r) => ({ id: r.id, label: r.title })), 'list'), 'All articles', '/blog'),
        k.desk({ name: 'Ask an engineer', role: 'Indus engineering desk', text: 'Not sure the guide covers your case? Send us the duty, the pressure and a photo — we will tell you what fits.' }),
        ...k.footer(),
      ])
    }

    case 'industry-focus': {
      const i = await db.industry.findFirst({
        where: { id: recordId, isPublished: true },
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          description: true,
          featuredCategorySlugs: true,
          featuredProductSkus: true,
          hero: { select: { id: true, storagePath: true, alt: true } },
        },
      })
      if (!i) throw new TemplateRecordMissing('That industry is not published any more.')
      // The industry page's own picks, in its order; the newest records when it has none.
      const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
      const slugs = strings(i.featuredCategorySlugs)
      const skus = strings(i.featuredProductSkus)
      const [cats, prods] = await Promise.all([
        slugs.length ? db.category.findMany({ where: { slug: { in: slugs }, isPublished: true }, select: { id: true, name: true, slug: true } }) : [],
        skus.length ? db.product.findMany({ where: { sku: { in: skus }, status: 'active' }, select: { id: true, title: true, sku: true } }) : [],
      ])
      const ranges = slugs.flatMap((sl) => cats.filter((c) => c.slug === sl)).slice(0, 6).map((c) => ({ id: c.id, label: c.name }))
      const featured = skus.flatMap((sk) => prods.filter((p) => p.sku === sk)).slice(0, 5).map((p) => ({ id: p.id, label: p.title }))
      const k = await kit()
      return draft(`Supplying ${i.name}`, i.tagline ?? `What we stock for ${i.name}.`, [
        k.mast({ label: 'Industry focus', title: i.name }),
        k.stripe(),
        newBlock('hero', {
          image: picture(i.hero?.storagePath, i.hero?.alt ?? i.name, i.hero?.id),
          logo: 'none',
          eyebrow: 'Industry focus',
          heading: i.name,
          caps: true,
          text: i.tagline ?? '',
          buttonLabel: 'See what we supply',
          buttonUrl: `/industries/${i.slug}`,
          height: i.hero ? 'l' : 's',
        }),
        ...(i.description ? [newBlock('text', { text: i.description.slice(0, 600), padding: 'm' })] : []),
        ...records('What we supply for it', ranges.length ? pick('category', ranges, 'list') : await latest('category', 6, 'list'), 'Browse the catalogue', '/c', {
          background: BRAND.surface2,
        }),
        ...records('Featured products', pick('product', featured, 'tiles'), `All of ${i.name}`, `/industries/${i.slug}`, { align: 'center' }),
        ...records('Guides from our engineers', await latest('article', 3, 'list'), 'Read more on the blog', '/blog'),
        closing(k),
        ...k.footer(),
      ])
    }

    // ── Company news ──

    case 'bulletin': {
      const k = await kit()
      const month = monthLabel()
      const [grid, lead] = await Promise.all([freshProducts(4), caseStudies(1)])
      return draft(`The Indus Bulletin — ${month}`, 'New stock, a case study from the workshop and engineering notes.', [
        k.mast({ label: 'The Indus Bulletin', title: month, watermark: 'Bulletin' }),
        k.stripe(),
        newBlock('list', {
          heading: 'In this issue',
          size: 's',
          items: [{ text: 'New on the site' }, { text: 'Indus in figures' }, { text: 'From the workshop' }, { text: 'Engineering notes' }, { text: 'Brands we supply' }, { text: 'Tip of the month' }],
          columns: '2',
          marker: 'rule',
          padding: 'm',
        }),
        ...records('New on the site', pick('product', grid, 'grid'), 'View the catalogue', '/c'),
        newBlock('stats', { heading: '', items: k.figures.slice(0, 3), background: BRAND.navy, textColor: BRAND.onNavy, valueColor: BRAND.white }),
        ...records('From the workshop', pick('service', lead.map((m) => ({ id: m.id, label: m.title })), 'rows'), 'All case studies', '/services', {
          itemLabel: 'Read the case study',
          background: BRAND.surface2,
        }),
        ...records('Engineering notes', await latest('article', 3, 'list'), 'All articles', '/blog'),
        ...records('Brands we supply', await brandsWithPictures(5), 'All brands', '/brands', { align: 'center', background: BRAND.surface2 }),
        newBlock('quote', {
          quote: 'Most hose failures we see start at the fitting. Match the fitting series to the hose and crimp to the maker’s chart.',
          author: 'Indus workshop',
          role: 'Tip of the month',
          padding: 'l',
        }),
        closing(k),
        ...k.footer(),
      ])
    }

    case 'welcome': {
      const k = await kit()
      const ranges = await db.category.findMany({
        where: { isPublished: true, parentId: null, imageId: { not: null } },
        // The biggest ranges, by how many listings sit directly under them or one level down.
        orderBy: [{ children: { _count: 'desc' } }, { name: 'asc' }],
        take: 5,
        select: { id: true, name: true },
      })
      return draft(`Welcome to ${k.s.name}`, k.s.tagline ?? 'Who we are, what we stock and how to get a part priced.', [
        k.mast({ label: 'Welcome to', title: k.s.name, watermark: 'Welcome' }),
        k.stripe(),
        newBlock('heading', { heading: 'Thanks for ==joining us==', size: 'xl', align: 'center', highlightColor: BRAND.accent, padding: 'm' }),
        newBlock('text', {
          text: `${k.s.tagline ? `${k.s.tagline} ` : ''}Here is what we do, and the quickest way to get a part priced.`,
          size: 'l',
          align: 'center',
        }),
        newBlock('stats', { heading: '', items: k.figures.slice(0, 3), background: BRAND.navy, textColor: BRAND.onNavy, valueColor: BRAND.white }),
        ...records('Find your range', pick('category', ranges.map((r) => ({ id: r.id, label: r.name })), 'tiles'), 'Browse the catalogue', '/c', {
          align: 'center',
          background: BRAND.surface2,
        }),
        newBlock('steps', { eyebrow: 'Getting a price', heading: 'Three steps to a ==quote==', highlightColor: BRAND.accent }),
        k.desk({ name: 'Indus sales team', role: 'Hydraulics and fluid power', text: 'Reply to this email with any part number and we will come back with a price.' }),
        ...k.footer(),
      ])
    }

    case 'event-invitation': {
      const k = await kit()
      return draft('', '', [
        k.mast({ label: 'You are invited', title: '[Event name]' }),
        k.stripe(),
        newBlock('hero', {
          logo: 'none',
          eyebrow: 'You are invited',
          heading: '[Event name]',
          caps: true,
          text: '[One line on why to come]',
          buttonLabel: 'Book a meeting',
          buttonUrl: '/contact',
        }),
        newBlock('key-values', {
          heading: 'The details',
          items: [
            { label: 'Dates', value: '[Dates]' },
            { label: 'Venue', value: '[Venue, city]' },
            { label: 'Where to find us', value: '[Hall and stand]' },
          ],
        }),
        newBlock('text', { text: '[What you will show, and who from the team will be there]', padding: 'm' }),
        ...records('What we are bringing', pick('product', await freshProducts(4), 'grid'), 'View the catalogue', '/c', { background: BRAND.surface2 }),
        newBlock('button', { label: 'Book a meeting', url: '/contact', align: 'center', padding: 'm' }),
        ...k.footer(),
      ])
    }

    case 'office-notice': {
      const k = await kit()
      return draft('[Holiday] office hours', 'When we are closed, and who to call for a breakdown.', [
        k.mast({ label: 'Notice', title: '[Holiday name]' }),
        k.stripe(),
        poster('[Holiday] ==office hours==', { size: 'l' }),
        newBlock('text', { text: '[Which days we are closed, and when we are back.]', size: 'l', align: 'center', padding: 'm' }),
        newBlock('key-values', {
          heading: 'Our hours',
          items: [
            { label: '[Day, date]', value: 'Closed' },
            { label: '[Day, date]', value: 'Closed' },
            { label: '[Day, date] onwards', value: k.s.contactHours ?? '[Normal hours]' },
          ],
        }),
        k.desk({ name: 'Breakdown while we are closed?', role: 'Indus service desk', text: 'Send a photo of the nameplate and the part number on WhatsApp — it is the first thing we read when we are back.', background: '' }),
        ...k.footer(),
      ])
    }

    case 'announcement': {
      const k = await kit()
      return draft('', '', [
        k.mast(),
        k.stripe(),
        newBlock('heading', { heading: '[Headline]', size: 'l', padding: 'm' }),
        newBlock('text', { text: '[Write what has changed, what it means for customers, and what they should do next.]' }),
        newBlock('button', { label: 'Contact us', url: '/contact', align: 'start', padding: 'm' }),
        ...k.footer(),
      ])
    }

    case 'build-your-own': {
      const k = await kit()
      return draft('', '', [k.mast(), k.stripe(), ...k.footer()])
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
          products.length ? `<h2>New on the site</h2><ul>${products.map((p) => item('product', p.id)).join('')}</ul>` : '',
          articles.length ? `<h2>From the blog</h2><ul>${articles.map((a) => item('article', a.id)).join('')}</ul>` : '',
          '<p>Need a part quoted? Reply to this email with the part number and quantity.</p>',
        ].join(''),
      )
    }
  }
}
