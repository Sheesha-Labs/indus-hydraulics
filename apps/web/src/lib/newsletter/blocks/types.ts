/**
 * A block-built newsletter: a page of email blocks (a hero, a heading, a row
 * of features, an "at a glance" table…), each with its own fields, colours
 * and images, stored as one JSON document on the campaign or on a saved
 * template.
 *
 * Ported from Bazar (lib/newsletter/blocks) without its Arabic edition — Indus
 * is English-only, so there are no `_ar` twins and nothing is drawn right to
 * left. Its "featured records" block shows Indus records instead: products,
 * categories, blog articles, industries and brands.
 *
 * Pure types — the designer imports them on the client.
 */

/** An image chosen from (or uploaded to) the media library, or pasted as an https URL. */
export type ImageValue = { url: string; alt?: string; mediaId?: string | null }

export const RECORD_KINDS = ['product', 'category', 'article', 'industry', 'brand'] as const
export type RecordKind = (typeof RECORD_KINDS)[number]

export const RECORD_LAYOUTS = ['list', 'grid', 'cards'] as const
export type RecordLayout = (typeof RECORD_LAYOUTS)[number]

/** Stored value of a records field: ids, never copied words. labels = what the editor showed when picked (for "missing record" messages). */
export type RecordsValue = { kind: RecordKind; ids: string[]; labels: string[]; layout: RecordLayout }

export type Props = Record<string, unknown>

export type Block = { id: string; type: string; props: Props }

export const FONT_CHOICES = ['serif', 'sans'] as const
export type FontChoice = (typeof FONT_CHOICES)[number]

/** The page every block sits on. */
export type DesignSettings = {
  /** Behind the 600px column (what a wide inbox shows either side). */
  pageBackground: string
  /** The column itself, where a block has no background of its own. */
  contentBackground: string
  textColor: string
  headingColor: string
  mutedColor: string
  linkColor: string
  /** Default button fill and text. A block can set its own. */
  buttonColor: string
  buttonTextColor: string
  headingFont: FontChoice
  bodyFont: FontChoice
}

export type Design = { version: 1; settings: DesignSettings; blocks: Block[] }

type Base = { key: string; label: string; help?: string }

export type ScalarFieldDef =
  | (Base & { kind: 'text'; placeholder?: string; max?: number })
  | (Base & { kind: 'textarea'; placeholder?: string; max?: number })
  | (Base & { kind: 'url'; placeholder?: string })
  | (Base & { kind: 'color'; allowBlank?: boolean })
  | (Base & { kind: 'image' })
  | (Base & { kind: 'select'; options: readonly { value: string; label: string }[] })
  | (Base & { kind: 'number'; min: number; max: number; step?: number; unit?: string })
  | (Base & { kind: 'toggle' })

export type FieldDef =
  | ScalarFieldDef
  | (Base & {
      kind: 'items'
      /** "Feature", "Row" — what one item is called in the editor. */
      itemLabel: string
      min: number
      max: number
      fields: ScalarFieldDef[]
    })
  | (Base & { kind: 'records' })

export const BLOCK_CATEGORIES = [
  'Headers',
  'Text',
  'Images',
  'Columns',
  'Lists & details',
  'Calls to action',
  'From the site',
  'Spacing',
] as const
export type BlockCategory = (typeof BLOCK_CATEGORIES)[number]

export type BlockDef = {
  type: string
  label: string
  category: BlockCategory
  description: string
  fields: FieldDef[]
  defaults: Props
}

/** A ready-made variant of a block: its props laid over the block's defaults. */
export type BlockPreset = {
  id: string
  type: string
  label: string
  description: string
  props: Props
}
