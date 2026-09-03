/**
 * Media usage — the rules that decide whether a file can be deleted.
 *
 * Phase 3 of 9 of the media library rebuild. Pure logic only: no Prisma, no
 * Supabase, no I/O. Phase 4 resolves these types against the database; this
 * module defines what the answers mean.
 *
 * ── The distinction the whole feature rests on ──────────────────────────────
 *
 * "Nothing uses this file" and "we could not work out what uses this file"
 * look identical if a failed lookup returns an empty array — and the first of
 * them is exactly what unlocks the delete button. So a source that throws is
 * recorded in `failedSources` and sets `partial`, which disables deletion
 * everywhere until the index can be built cleanly. Every future edit to this
 * file should preserve that: an unknown must never decay into a zero.
 *
 * ── Why kind and role are separate ──────────────────────────────────────────
 *
 * Twenty models reference `Media`, across thirty-odd distinct columns. Flat
 * kinds would give the UI thirty-odd labels to render and the reader thirty-odd
 * things to learn. Splitting "which record" (kind) from "which slot" (role)
 * gets it back to fifteen kinds and a free-text role, so a usage reads
 * "Product · Datasheet" or "Blog post · In body".
 */

// ── Kinds ───────────────────────────────────────────────────────────────────

/** The kind of record referencing a media file — i.e. what page it appears on. */
export type MediaUsageKind =
  | 'product'
  | 'category'
  | 'brand'
  | 'industry'
  | 'service_case'
  | 'blog_post'
  | 'blog_category'
  | 'blog_author'
  | 'cms_page'
  | 'navigation'
  | 'homepage'
  | 'site_settings'
  | 'rfq'
  | 'enquiry'
  | 'quote'
  | 'import'

/**
 * Display order in the detail panel. Roughly "most public and most numerous
 * first" — a file's product usages matter more to an editor than the import
 * job that happened to create it.
 */
export const MEDIA_USAGE_KIND_ORDER: readonly MediaUsageKind[] = [
  'product',
  'category',
  'brand',
  'industry',
  'service_case',
  'blog_post',
  'blog_category',
  'blog_author',
  'cms_page',
  'navigation',
  'homepage',
  'site_settings',
  'rfq',
  'enquiry',
  'quote',
  'import',
] as const

/**
 * Singular and plural spelled out per kind rather than derived.
 *
 * Bazar's equivalent runs an algorithm (`y`→`ies`, `s`→`ses`) over the label,
 * which is fine until a label needs an irregular plural or is already plural.
 * "Site settings" is invariant and "Category" needs `ies`; a table costs
 * nothing and cannot be wrong.
 */
export const MEDIA_USAGE_KIND_LABELS: Record<
  MediaUsageKind,
  { one: string; many: string }
> = {
  product: { one: 'product', many: 'products' },
  category: { one: 'category', many: 'categories' },
  brand: { one: 'brand', many: 'brands' },
  industry: { one: 'industry', many: 'industries' },
  service_case: { one: 'service case', many: 'service cases' },
  blog_post: { one: 'blog post', many: 'blog posts' },
  blog_category: { one: 'blog category', many: 'blog categories' },
  blog_author: { one: 'author', many: 'authors' },
  cms_page: { one: 'page', many: 'pages' },
  navigation: { one: 'navigation tile', many: 'navigation tiles' },
  homepage: { one: 'homepage slide', many: 'homepage slides' },
  site_settings: { one: 'site setting', many: 'site settings' },
  rfq: { one: 'RFQ', many: 'RFQs' },
  enquiry: { one: 'enquiry', many: 'enquiries' },
  quote: { one: 'quote', many: 'quotes' },
  import: { one: 'import', many: 'imports' },
}

/**
 * Kinds that are never public, whatever the record's status.
 *
 * A customer's RFQ attachment, a generated quote PDF and a bulk-import source
 * spreadsheet are all real usages — deleting them breaks something — but none
 * of them appears on the storefront, so they must not read as "Live".
 */
export const INTERNAL_MEDIA_USAGE_KINDS: ReadonlySet<MediaUsageKind> = new Set<MediaUsageKind>([
  'rfq',
  'enquiry',
  'quote',
  'import',
])

// ── A single usage ──────────────────────────────────────────────────────────

export interface MediaUsage {
  kind: MediaUsageKind
  /** Id of the referencing record, for the admin deep-link. */
  id: string
  /** What an editor would call that record — product title, post headline. */
  label: string
  /** The slot it fills: "Datasheet", "Hero", "In body", "Favicon". */
  role: string
  /** Admin link to the record, or null when it has no editor of its own. */
  href: string | null
  /** On a published public surface right now. */
  live: boolean
  /** Never public — see INTERNAL_MEDIA_USAGE_KINDS. */
  internal: boolean
}

// ── The index ───────────────────────────────────────────────────────────────

export interface MediaUsageIndex {
  /** Media id → every usage found. Absent key means none were found. */
  byAsset: Map<string, MediaUsage[]>
  /**
   * Sources that threw while building the index. Non-empty means the picture
   * is incomplete and nothing may be deleted.
   */
  failedSources: string[]
  /** `failedSources.length > 0`, precomputed for readability at call sites. */
  partial: boolean
}

/** An index with nothing in it and nothing failed. */
export function emptyMediaUsageIndex(): MediaUsageIndex {
  return { byAsset: new Map(), failedSources: [], partial: false }
}

/**
 * Builds the index from resolved parts, keeping `partial` in step with
 * `failedSources` so the two can never disagree.
 */
export function buildMediaUsageIndex(
  byAsset: Map<string, MediaUsage[]>,
  failedSources: readonly string[] = []
): MediaUsageIndex {
  const failed = [...new Set(failedSources)].sort()
  return { byAsset, failedSources: failed, partial: failed.length > 0 }
}

// ── State ───────────────────────────────────────────────────────────────────

export type MediaState = 'live' | 'attached' | 'internal' | 'unused'

export const MEDIA_STATE_LABELS: Record<MediaState, string> = {
  live: 'Live',
  attached: 'Not live',
  internal: 'Internal',
  unused: 'Unused',
}

/** Hover copy for the state filter tabs. */
export const MEDIA_STATE_HINTS: Record<MediaState, string> = {
  live: 'On a published public page right now',
  attached: 'Attached only to drafts or unpublished records',
  internal: 'RFQ attachments, quote PDFs and import sources — never public',
  unused: 'Nothing references these — safe to trash',
}

/**
 * Order matters. `live` wins over everything, because one published usage is
 * enough to make a file dangerous to delete regardless of what else holds it.
 * `internal` requires *every* usage to be internal — a file on both a customer
 * RFQ and a draft product is "Not live", not "Internal".
 */
export function deriveMediaState(usages: readonly MediaUsage[]): MediaState {
  if (usages.length === 0) return 'unused'
  if (usages.some((u) => u.live)) return 'live'
  if (usages.every((u) => u.internal)) return 'internal'
  return 'attached'
}

export type MediaStateFilter = MediaState | 'all'

export function matchesStateFilter(state: MediaState, filter: MediaStateFilter): boolean {
  return filter === 'all' || state === filter
}

// ── Deletion ────────────────────────────────────────────────────────────────

export interface TrashDecision {
  allowed: boolean
  /** Why not, phrased for an editor. Null when allowed. */
  reason: string | null
}

/**
 * Per the product decision: an in-use file is never deletable, and a file whose
 * usage could not be fully checked is never deletable either.
 *
 * Note the ordering — `partial` is tested first. A file that looks unused under
 * a broken index is the exact case this guard exists for.
 */
export function canTrash(opts: {
  state: MediaState
  indexPartial: boolean
  usages?: readonly MediaUsage[]
}): TrashDecision {
  if (opts.indexPartial) {
    return {
      allowed: false,
      reason: "Usage couldn't be checked in full — reload before deleting anything.",
    }
  }
  if (opts.state !== 'unused') {
    const where = opts.usages?.length ? ` Used in ${summariseUsage(opts.usages)}.` : ''
    return { allowed: false, reason: `In use — detach it first.${where}` }
  }
  return { allowed: true, reason: null }
}

/**
 * Whether the storage object behind a media row may be removed when that row is
 * permanently deleted.
 *
 * This exists because `media.storagePath` is NOT unique and, as of the phase-2
 * migration, 227 of 665 rows share one with another row — a datasheet import
 * re-ran and minted a fresh row per run against the same uploaded file. Delete
 * the object for one of those rows and every sibling row 404s, including the
 * ones attached to live products.
 *
 * Bazar, which this feature is modelled on, has `storage_key` UNIQUE and so
 * never had to make this check. Copying its delete path without this would
 * break live datasheets.
 */
export function canRemoveStorageObject(opts: { otherRowsSharingPath: number }): boolean {
  return opts.otherRowsSharingPath <= 0
}

// ── Presentation ────────────────────────────────────────────────────────────

/**
 * "2 products · 1 blog post". Counts per kind, in display order, never
 * enumerating individual records — the detail panel does that.
 */
export function summariseUsage(usages: readonly MediaUsage[]): string {
  if (usages.length === 0) return 'Not used anywhere'

  const counts = new Map<MediaUsageKind, number>()
  for (const u of usages) counts.set(u.kind, (counts.get(u.kind) ?? 0) + 1)

  return MEDIA_USAGE_KIND_ORDER.filter((k) => counts.has(k))
    .map((k) => {
      const n = counts.get(k) as number
      const label = MEDIA_USAGE_KIND_LABELS[k]
      return `${n} ${n === 1 ? label.one : label.many}`
    })
    .join(' · ')
}

/**
 * Live usages first, then by kind in display order, then by label.
 *
 * Returns a new array — callers pass React props straight in, and sorting in
 * place would mutate state and skip a re-render.
 */
export function sortUsages(usages: readonly MediaUsage[]): MediaUsage[] {
  const rank = new Map(MEDIA_USAGE_KIND_ORDER.map((k, i) => [k, i]))
  return [...usages].sort((a, b) => {
    if (a.live !== b.live) return a.live ? -1 : 1
    const ka = rank.get(a.kind) ?? Number.MAX_SAFE_INTEGER
    const kb = rank.get(b.kind) ?? Number.MAX_SAFE_INTEGER
    if (ka !== kb) return ka - kb
    return a.label.localeCompare(b.label)
  })
}

// ── Folders ─────────────────────────────────────────────────────────────────

/**
 * The library's left rail. Derived from what actually references a file, never
 * stored — so it cannot drift out of date and there is nothing to file.
 *
 * Bazar stores an enum chosen at upload instead, and its uploader always writes
 * `listings` regardless of the folder being viewed, so its rail disagrees with
 * reality the moment anyone uploads from anywhere else.
 */
export type MediaFolder =
  | 'products'
  | 'categories'
  | 'brands'
  | 'industries'
  | 'services'
  | 'blog'
  | 'pages'
  | 'navigation'
  | 'homepage'
  | 'site'
  | 'documents'
  | 'rfq'
  | 'unused'

export const MEDIA_FOLDER_ORDER: readonly MediaFolder[] = [
  'products',
  'categories',
  'brands',
  'industries',
  'services',
  'blog',
  'pages',
  'navigation',
  'homepage',
  'site',
  'documents',
  'rfq',
  'unused',
] as const

export const MEDIA_FOLDER_LABELS: Record<MediaFolder, string> = {
  products: 'Products',
  categories: 'Categories',
  brands: 'Brands',
  industries: 'Industries',
  services: 'Service cases',
  blog: 'Blog',
  pages: 'Pages',
  navigation: 'Navigation',
  homepage: 'Homepage',
  site: 'Site settings',
  documents: 'Documents',
  rfq: 'RFQ attachments',
  unused: 'Unused',
}

const KIND_TO_FOLDER: Record<MediaUsageKind, MediaFolder> = {
  product: 'products',
  category: 'categories',
  brand: 'brands',
  industry: 'industries',
  service_case: 'services',
  blog_post: 'blog',
  blog_category: 'blog',
  blog_author: 'blog',
  cms_page: 'pages',
  navigation: 'navigation',
  homepage: 'homepage',
  site_settings: 'site',
  rfq: 'rfq',
  enquiry: 'rfq',
  quote: 'documents',
  import: 'documents',
}

/**
 * Which folder a file appears under.
 *
 * A file can legitimately be used in several places; the rail has to pick one,
 * and it picks the most prominent — first in `MEDIA_USAGE_KIND_ORDER`. That
 * keeps a product photo that also appears in a blog post filed under Products,
 * which is where someone looking for it would go first.
 *
 * The one exception is a non-image on a product: a datasheet or STEP file is a
 * document, and filing it under Products would bury 341 photos under 41 PDFs.
 * `mediaKind` is the row's own `MediaKind`, not the usage.
 */
export function mediaFolderFor(opts: {
  mediaKind: 'image' | 'document' | 'cad'
  usages: readonly MediaUsage[]
}): MediaFolder {
  if (opts.usages.length === 0) return 'unused'

  const rank = new Map(MEDIA_USAGE_KIND_ORDER.map((k, i) => [k, i]))
  const primary = [...opts.usages].sort(
    (a, b) =>
      (rank.get(a.kind) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.kind) ?? Number.MAX_SAFE_INTEGER)
  )[0]
  if (!primary) return 'unused'

  if (primary.kind === 'product' && opts.mediaKind !== 'image') return 'documents'
  return KIND_TO_FOLDER[primary.kind]
}

// ── Finding ids inside structured content ───────────────────────────────────

/**
 * Every media id embedded in a `bodyBlocks` document.
 *
 * Both `BlogPost.bodyBlocks` and `ServiceCase.bodyBlocks` are typed block
 * arrays, and `figure` is the only block that carries media — as `imageId`
 * (see `FigureBlockSchema` in service-case-blocks.ts). The walk is generic
 * rather than schema-driven on purpose: it survives junk, half-migrated rows
 * and blocks added later, and over-collecting is safe here because a spurious
 * id only ever *blocks* a delete.
 *
 * `galleryImageIds` on ServiceCase is a plain string array and is picked up by
 * the same walk.
 */
export function collectMediaIdsFromBlocks(blocks: unknown): string[] {
  const found = new Set<string>()

  const push = (v: unknown) => {
    if (typeof v === 'string') {
      const t = v.trim()
      if (t) found.add(t)
    }
  }

  const walk = (node: unknown, depth: number) => {
    // Deeply nested or self-referential JSON would otherwise recurse forever.
    // Real block documents are a handful of levels deep.
    if (depth > 32) return
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1)
      return
    }
    if (!node || typeof node !== 'object') return
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === 'imageId') push(value)
      else if (key === 'galleryImageIds' && Array.isArray(value)) value.forEach(push)
      else walk(value, depth + 1)
    }
  }

  walk(blocks, 0)
  return [...found]
}

/**
 * Every absolute URL mentioned in a legacy HTML body.
 *
 * `BlogPost.body` and `CmsPage.body` predate block editing and hold raw HTML
 * with `<img src="…">` pointing at full public storage URLs. There is no
 * foreign key, so the only way to know an image is in use is to read the text.
 *
 * This deliberately extracts *all* URLs rather than parsing `<img src>`,
 * because an image can also be referenced from `srcset`, `<source>`, a
 * `background-image`, or an `<a>` download link — and a missed reference here
 * means offering a live image for deletion, while a spurious one only blocks a
 * delete.
 *
 * The cost matters. Bazar compares every asset against every article body —
 * 1,000 articles × 200 assets is 200,000 substring scans per page load. Pull
 * the URLs out once into a set and intersect instead: O(bodies + assets).
 */
export function collectHtmlMediaUrls(html: string | null | undefined): string[] {
  if (!html) return []
  const out = new Set<string>()
  // Stops at whitespace, quotes, angle brackets and the parens that close a
  // css url(...). Everything else is fair game — storage keys contain dots,
  // dashes and slashes.
  const URLS = /https?:\/\/[^\s"'()<>\\]+/g
  for (const match of html.matchAll(URLS)) out.add(normaliseMediaUrl(match[0]))
  return [...out]
}

/**
 * Canonical form for comparing two references to the same object: no query
 * string, no fragment, no trailing slash, HTML entities decoded.
 *
 * `&amp;` matters — a URL written into an HTML attribute is entity-encoded, so
 * the raw text differs from the value stored in `media.storagePath` even when
 * both address the same file.
 */
export function normaliseMediaUrl(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '')
    .trim()
}

/**
 * Substring fallback for storage paths that are not absolute URLs.
 *
 * `media.storagePath` holds four different shapes (full public URL,
 * bucket-prefixed key, bare key, and the odd third-party URL an admin pasted).
 * Only the first is findable by URL extraction. This covers the rest.
 *
 * It is O(bodies × assets) — the cost `collectHtmlMediaUrls` exists to avoid —
 * so apply it only to the assets whose path is not a URL. In the current data
 * that is 2 rows out of 665.
 */
export function htmlMentionsStoragePath(html: string | null | undefined, storagePath: string): boolean {
  if (!html || !storagePath.trim()) return false
  return html.includes(storagePath.trim())
}

/** True when a storage path is an absolute URL, and so covered by the fast path. */
export function isAbsoluteMediaUrl(storagePath: string): boolean {
  return /^https?:\/\//.test(storagePath.trim())
}
