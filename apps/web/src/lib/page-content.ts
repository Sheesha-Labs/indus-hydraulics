import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import {
  attachMedia,
  collectMediaIds,
  getMasterPage,
  masterContentKey,
  parseStoredSections,
  resolveSections,
  subPageContentKey,
  subPageDef,
  type MasterPageDef,
  type ResolvedSection,
  type SectionValues,
  type SubPageKind,
} from '@indus/domain'
import { mediaUrl } from './media'

/**
 * Reading a page's section document on the storefront.
 *
 * Every function here is TOTAL. If the row does not exist, if the database is
 * unreachable, or if the stored document predates half the sections, the page
 * still renders — with the copy it shipped with. That is the whole contract:
 * turning a page over to the CMS must never introduce a way for it to render
 * empty.
 *
 * Reads are cached under the `page-content` tag, which the admin's save action
 * purges. Without the tag an edit would wait out the route's own revalidate
 * window — an hour on most of these pages.
 */

export type PageContent = {
  sections: ResolvedSection[]
  /** Values for one section, already merged with the defaults. Never null. */
  values: (key: string) => SectionValues
  /** Is this section switched on? Unknown keys read as on. */
  isOn: (key: string) => boolean
  /** Enabled section keys, in the editor's order — what drives the render. */
  order: string[]
  /** True when the page has never been saved (rendering pure defaults). */
  usingDefaults: boolean
}

function build(sections: ResolvedSection[], usingDefaults: boolean): PageContent {
  const byKey = new Map(sections.map((s) => [s.key, s]))
  return {
    sections,
    values: (key) => byKey.get(key)?.values ?? {},
    // A section the document has never heard of renders — a section added in
    // code should appear without needing someone to press Save first.
    isOn: (key) => (byKey.has(key) ? byKey.get(key)!.enabled : true),
    order: sections.filter((s) => s.enabled).map((s) => s.key),
    usingDefaults,
  }
}

/** Resolve a stored document against a definition and fill in media URLs. */
async function hydrate(def: MasterPageDef, stored: unknown): Promise<PageContent> {
  const parsed = parseStoredSections(stored)
  const sections = resolveSections(def, parsed)

  const ids = collectMediaIds(sections)
  if (ids.length > 0) {
    const rows = await db.media.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, storagePath: true, width: true, height: true },
    })
    const byId = new Map(rows.map((m) => [m.id, m]))
    attachMedia(sections, (id) => {
      const row = byId.get(id)
      return row ? { url: mediaUrl(row.storagePath), width: row.width, height: row.height } : null
    })
  }

  return build(sections, parsed === null)
}

const readDocument = unstable_cache(
  async (contentKey: string) => {
    const row = await db.pageContent.findUnique({
      where: { key: contentKey },
      select: { sections: true },
    })
    return row?.sections ?? null
  },
  ['page-content'],
  { revalidate: 300, tags: ['page-content'] },
)

/**
 * Content for one master page.
 *
 * Never throws and never returns nothing — if the query fails the page renders
 * exactly what it rendered before any of this existed.
 */
export async function getMasterPageContent(key: string): Promise<PageContent> {
  const def = getMasterPage(key)
  if (!def) throw new Error(`Unknown master page: ${key}`)
  try {
    return await hydrate(def, await readDocument(masterContentKey(key)))
  } catch (error) {
    console.error(`[page-content] failed to load master page "${key}"`, error)
    return build(resolveSections(def, null), true)
  }
}

/**
 * Content for one sub-page — a market landing, and later a brand page.
 *
 * Same total contract as the master pages: a failed read renders the template
 * exactly as it renders with no document at all, because every copy field on a
 * sub-page is an OVERRIDE and blank means "keep the built-in wording".
 */
export async function getSubPageContent(
  kind: SubPageKind,
  record: { name: string; slug: string },
): Promise<PageContent> {
  const def = subPageDef(kind, record)
  try {
    return await hydrate(def, await readDocument(subPageContentKey(kind, record.slug)))
  } catch (error) {
    console.error(`[page-content] failed to load ${kind} page "${record.slug}"`, error)
    return build(resolveSections(def, null), true)
  }
}

/** Admin-side read: uncached, so the editor never opens on a stale document. */
export async function getSubPageContentFresh(
  kind: SubPageKind,
  record: { name: string; slug: string },
): Promise<PageContent> {
  const def = subPageDef(kind, record)
  const row = await db.pageContent.findUnique({
    where: { key: subPageContentKey(kind, record.slug) },
    select: { sections: true },
  })
  return hydrate(def, row?.sections ?? null)
}

/** Admin-side read: uncached, so the editor never opens on a stale document. */
export async function getMasterPageContentFresh(key: string): Promise<PageContent> {
  const def = getMasterPage(key)
  if (!def) throw new Error(`Unknown master page: ${key}`)
  const row = await db.pageContent.findUnique({
    where: { key: masterContentKey(key) },
    select: { sections: true },
  })
  return hydrate(def, row?.sections ?? null)
}
