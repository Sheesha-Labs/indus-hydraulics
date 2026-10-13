import { db } from '@indus/db'
import { interpolate, list, resourceTotals, RESOURCES_LAST_CHECKED, str, type CopyTokens } from '@indus/domain'
import { buildMailtoHref, buildWhatsappHref } from '@indus/ui'
import { getMasterPageContent, type PageContent } from './page-content'
import { getStoreSettings } from './store-settings'

/**
 * What the resources hub and every reference page share: the Pages & Blocks
 * document for `/resources`, the live counts its copy may quote, and the
 * contact block the closing band builds its buttons from.
 *
 * Total, like everything it calls: a failed read renders the defaults.
 */

export type ResourceCtaCopy = {
  eyebrow: string | null
  heading: string | null
  headingEmphasis: string | null
  body: string | null
  checklist: string[]
  whatsappLabel: string | null
  emailLabel: string | null
  phonePrefix: string | null
}

export type ResourceContact = {
  phone: string | null
  email: string | null
  whatsappHref: string | null
  mailtoHref: string
}

export type ResourcesShared = {
  content: PageContent
  /** Substitutes the live counts into an editable string. */
  t: (value: string | null) => string | null
  cta: ResourceCtaCopy
  contact: ResourceContact
}

export async function getResourcesShared(enquirySubject: string): Promise<ResourcesShared> {
  const [content, settings] = await Promise.all([getMasterPageContent('resources'), getStoreSettings()])
  const totals = resourceTotals()
  const tokens: CopyTokens = {
    connectionTypes: totals.connectionTypes,
    crimpSettings: totals.crimpSettings,
    ratings: totals.ratings,
    terms: totals.terms,
    references: totals.references,
    checked: RESOURCES_LAST_CHECKED,
  }
  const t = (value: string | null) => interpolate(value, tokens)

  const ctaValues = content.values('cta')
  const cta: ResourceCtaCopy = {
    eyebrow: t(str(ctaValues, 'eyebrow')),
    heading: t(str(ctaValues, 'heading')),
    headingEmphasis: t(str(ctaValues, 'heading_emphasis')),
    body: t(str(ctaValues, 'body')),
    checklist: list<{ text?: string }>(ctaValues, 'checklist')
      .map((row) => (row.text ?? '').trim())
      .filter((text) => text !== ''),
    whatsappLabel: str(ctaValues, 'whatsapp_cta_label'),
    emailLabel: str(ctaValues, 'email_cta_label'),
    phonePrefix: str(ctaValues, 'phone_prefix'),
  }

  return {
    content,
    t,
    cta,
    contact: {
      phone: settings.contactPhone,
      email: settings.contactEmail,
      whatsappHref: buildWhatsappHref(settings.contactPhone, enquirySubject),
      mailtoHref: buildMailtoHref(settings.contactEmail, enquirySubject),
    },
  }
}

export type ResourceGuide = {
  slug: string
  title: string
  category: string | null
  readingMinutes: number | null
}

/**
 * The posts the hub recommends, in the order given. A slug that is missing,
 * unpublished or deleted simply drops out — never a dead link — and a failed
 * query renders the section without them.
 */
export async function getResourceGuides(slugs: readonly string[]): Promise<ResourceGuide[]> {
  try {
    const rows = await db.blogPost.findMany({
      where: { slug: { in: [...slugs] }, status: 'published', deletedAt: null },
      select: { slug: true, title: true, readingMinutes: true, category: { select: { name: true } } },
    })
    const bySlug = new Map(rows.map((row) => [row.slug, row]))
    return slugs.flatMap((slug) => {
      const row = bySlug.get(slug)
      return row
        ? [{ slug: row.slug, title: row.title, category: row.category?.name ?? null, readingMinutes: row.readingMinutes }]
        : []
    })
  } catch (error) {
    console.error('[resources] failed to load guides', error)
    return []
  }
}
