/**
 * Page-section model — the content contract behind "Pages & Blocks".
 *
 * The marketing pages on this site are bespoke compositions, not generic
 * page-builder output. Replacing them with hero/strip/grid primitives would
 * throw away the design. So instead each *section* of each page is declared
 * here with the fields an editor may change, and the page components keep
 * their markup and take their copy from the database.
 *
 * A section definition carries its own defaults, which are the copy currently
 * hardcoded in the page. That means:
 *  - nothing changes visually until someone edits a field;
 *  - a section added in code shows up in the editor automatically;
 *  - "reset to defaults" is always available, per page.
 *
 * Nothing in this directory imports React, Prisma or Next. It is pure data +
 * pure functions so it can be unit-tested and so the same registry can be read
 * by the admin editor and by the storefront renderer.
 */

export type SimpleFieldKind = 'text' | 'textarea' | 'link' | 'richtext'

export type SimpleFieldDef = {
  key: string
  label: string
  kind: SimpleFieldKind
  help?: string
  /** Max length; also drives the editor's character counter. */
  max?: number
  /** Blank allowed. Defaults to true for everything but `text`. */
  optional?: boolean
}

export type ToggleFieldDef = {
  key: string
  label: string
  kind: 'toggle'
  help?: string
}

export type ImageFieldDef = {
  key: string
  label: string
  kind: 'image'
  help?: string
}

/**
 * A pick from live records rather than free text — a brand, an industry, a
 * category. Options come from the `seeds` the admin route supplies, and the
 * stored value is the record's slug, so a rename doesn't break the link.
 */
export type SelectFieldDef = {
  key: string
  label: string
  kind: 'select'
  optionsKey: SeedKey
  help?: string
  /** Placeholder for the empty option. */
  placeholder?: string
}

export type ListFieldDef = {
  key: string
  label: string
  kind: 'list'
  help?: string
  /** Singular noun for the add button — "stat", "value", "question". */
  itemLabel: string
  max: number
  fields: (SimpleFieldDef | ImageFieldDef | ToggleFieldDef | SelectFieldDef)[]
  /**
   * Live data this list mirrors. When the stored list is empty the editor
   * offers to seed it from the records the page is showing today, so an editor
   * can switch individual cards off without hand-typing the whole set.
   */
  seedKey?: SeedKey
}

export type SeedKey = 'brands' | 'industries' | 'categories' | 'markets'

export type FieldDef =
  | SimpleFieldDef
  | ImageFieldDef
  | ToggleFieldDef
  | SelectFieldDef
  | ListFieldDef

/** A picked media asset. `mediaId` null ⇒ the section keeps its built-in art. */
export type ImageValue = {
  mediaId: string | null
  alt: string | null
  /**
   * Public URL, resolved server-side from `mediaId` when the content is read.
   * NEVER stored — `mediaId` is the source of truth, so re-uploading or
   * renaming the file doesn't break the page.
   */
  url?: string | null
  /** Resolved alongside `url`, never stored. */
  width?: number | null
  height?: number | null
}

export type ItemValue = string | boolean | null | ImageValue

export type FieldValue =
  | string
  | boolean
  | null
  | ImageValue
  | Record<string, ItemValue>[]

export type SectionValues = Record<string, FieldValue>

export type SectionDef = {
  key: string
  label: string
  /** One line describing what the section is, shown in the editor. */
  description: string
  fields: FieldDef[]
  defaults: SectionValues
  /**
   * Sections that can't be hidden or moved — the hero, and anything the page
   * is structurally built around.
   */
  locked?: boolean
  /**
   * Whether the section is on for a page nobody has edited yet. Defaults to
   * true. Set false for a section the page keeps but doesn't lead with: the
   * editor still sees it, with its copy intact, and can switch it back on.
   */
  defaultEnabled?: boolean
  /**
   * Content the section pulls from elsewhere (products, brands, blog posts),
   * named so the editor can see what is *not* editable here.
   */
  dataNote?: string
}

export type MasterPageDef = {
  key: string
  label: string
  /** Public path, for the "View page" link. */
  path: string
  description: string
  sections: SectionDef[]
}

/** One section as stored in the database. */
export type StoredSection = {
  key: string
  enabled: boolean
  values: SectionValues
}

/** A section resolved for rendering: definition + effective values. */
export type ResolvedSection = {
  key: string
  def: SectionDef
  enabled: boolean
  values: SectionValues
}

export function isImageField(f: FieldDef): f is ImageFieldDef {
  return f.kind === 'image'
}

export function isListField(f: FieldDef): f is ListFieldDef {
  return f.kind === 'list'
}

export function isToggleField(f: FieldDef): f is ToggleFieldDef {
  return f.kind === 'toggle'
}

export function isSelectField(f: FieldDef): f is SelectFieldDef {
  return f.kind === 'select'
}

export function emptyImage(): ImageValue {
  return { mediaId: null, alt: null }
}
