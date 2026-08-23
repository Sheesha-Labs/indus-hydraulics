/**
 * Field builders shared by every section definition.
 *
 * They exist so a section reads as a list of what an editor can change rather
 * than a wall of object literals, and so the lengths are consistent: a heading
 * is 160 characters everywhere, an eyebrow 60, a body 600.
 */
import type {
  ImageFieldDef,
  ListFieldDef,
  SelectFieldDef,
  SeedKey,
  SimpleFieldDef,
  ToggleFieldDef,
} from './types'

export const text = (
  key: string,
  label: string,
  extra: Partial<SimpleFieldDef> = {},
): SimpleFieldDef => ({ key, label, kind: 'text', max: 160, ...extra })

export const area = (
  key: string,
  label: string,
  extra: Partial<SimpleFieldDef> = {},
): SimpleFieldDef => ({
  key,
  label,
  kind: 'textarea',
  max: 600,
  optional: true,
  ...extra,
})

/**
 * Long-form prose that keeps its own markup — the policy pages' clauses, which
 * carry lists and bold runs the plain textarea would flatten. Sanitised on
 * save; see `sanitiseRichText`.
 */
export const richText = (
  key: string,
  label: string,
  extra: Partial<SimpleFieldDef> = {},
): SimpleFieldDef => ({
  key,
  label,
  kind: 'richtext',
  max: 12_000,
  optional: true,
  ...extra,
})

export const link = (
  key: string,
  label: string,
  extra: Partial<SimpleFieldDef> = {},
): SimpleFieldDef => ({
  key,
  label,
  kind: 'link',
  max: 240,
  optional: true,
  help: 'Internal path (/quote) or full URL.',
  ...extra,
})

export const image = (key: string, label: string, help?: string): ImageFieldDef => ({
  key,
  label,
  kind: 'image',
  // Spread rather than `help,` — `exactOptionalPropertyTypes` is on, so an
  // explicit `undefined` is not the same as an absent key.
  ...(help === undefined ? {} : { help }),
})

export const toggle = (key: string, label: string, help?: string): ToggleFieldDef => ({
  key,
  label,
  kind: 'toggle',
  ...(help === undefined ? {} : { help }),
})

export const select = (
  key: string,
  label: string,
  optionsKey: SeedKey,
  extra: Partial<Omit<SelectFieldDef, 'kind' | 'optionsKey'>> = {},
): SelectFieldDef => ({ key, label, kind: 'select', optionsKey, ...extra })

export const eyebrow = (extra: Partial<SimpleFieldDef> = {}) =>
  text('eyebrow', 'Eyebrow', { max: 80, optional: true, ...extra })

export const heading = (extra: Partial<SimpleFieldDef> = {}) =>
  text('heading', 'Heading', { ...extra })

export const body = (extra: Partial<SimpleFieldDef> = {}) => area('body', 'Body', { ...extra })

/** Label + link, the pair every call-to-action on the site is made of. */
export const ctaPair = (
  prefix = '',
  labelText = 'Button label',
): SimpleFieldDef[] => {
  const k = (n: string) => (prefix ? `${prefix}_${n}` : n)
  return [
    text(k('cta_label'), labelText, { max: 60, optional: true }),
    link(k('cta_href'), `${labelText.replace(/ label$/, '')} link`),
  ]
}

export const statList = (max = 6, label = 'Stats'): ListFieldDef => ({
  key: 'stats',
  label,
  kind: 'list',
  itemLabel: 'stat',
  max,
  fields: [
    text('value', 'Figure', { max: 40 }),
    text('label', 'Caption', { max: 60 }),
  ],
})

export const faqList = (max = 12): ListFieldDef => ({
  key: 'items',
  label: 'Questions',
  kind: 'list',
  itemLabel: 'question',
  max,
  fields: [
    text('q', 'Question', { max: 200 }),
    area('a', 'Answer', { max: 1200, optional: false }),
  ],
})

/**
 * A grid of value cards. Every card carries its own visibility toggle, so an
 * editor can drop one for a season without deleting the copy and retyping it
 * later.
 */
export const cardList = (
  key: string,
  label: string,
  opts: {
    itemLabel?: string
    max?: number
    help?: string
    seedKey?: SeedKey
    descMax?: number
    /** Adds an image picker to every card. */
    withImage?: boolean
    /** Adds a CTA label + link to every card. */
    withLink?: boolean
    /** Adds a short leading token — a year, an index number, a tag. */
    withTag?: string
  } = {},
): ListFieldDef => ({
  key,
  label,
  kind: 'list',
  itemLabel: opts.itemLabel ?? 'card',
  max: opts.max ?? 8,
  ...(opts.help === undefined ? {} : { help: opts.help }),
  ...(opts.seedKey === undefined ? {} : { seedKey: opts.seedKey }),
  fields: [
    toggle('enabled', 'Show this card'),
    ...(opts.withTag ? [text('tag', opts.withTag, { max: 40, optional: true })] : []),
    text('name', 'Title', { max: 120 }),
    area('desc', 'Description', { max: opts.descMax ?? 320, optional: false }),
    ...(opts.withLink
      ? [text('cta', 'Link label', { max: 60, optional: true }), link('href', 'Link')]
      : []),
    ...(opts.withImage ? [image('image', 'Image')] : []),
  ],
})
