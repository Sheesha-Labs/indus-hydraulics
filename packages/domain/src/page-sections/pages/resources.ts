import { area, eyebrow, heading, text } from '../fields'
import type { ListFieldDef, MasterPageDef } from '../types'

/** A label/value pair — the hero tiles and the navy manifest strip. */
const pairList = (key: string, label: string, itemLabel: string, max: number): ListFieldDef => ({
  key,
  label,
  kind: 'list',
  itemLabel,
  max,
  fields: [
    { key: 'label', label: 'Label', kind: 'text', max: 60 },
    { key: 'value', label: 'Value', kind: 'text', max: 80 },
  ],
})

const TOKEN_HELP =
  'Use {connectionTypes}, {crimpSettings}, {ratings}, {terms} and {references} for the live counts.'

/**
 * `/resources` — the hub for the reference pages.
 *
 * The copy is here; which reference pages exist is not. Each page is a template
 * over a frozen data set in `@indus/domain/resources`, so adding one is a deploy
 * regardless, and listing it in an editor would only invite a card that links
 * to nothing.
 *
 * The CTA section is read by every reference page as well as the hub, so the
 * "send us the part" band is edited once.
 */
export const RESOURCES_PAGE: MasterPageDef = {
  key: 'resources',
  label: 'Resources',
  path: '/resources',
  description: 'The hub for the thread chart, crimp specifications, pressure ratings and glossary.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Headline, standfirst and the four tiles beside them.',
      locked: true,
      fields: [
        eyebrow(),
        heading({ max: 120 }),
        text('heading_emphasis', 'Headline (italic ending)', { max: 100, optional: true }),
        area('body', 'Standfirst', { max: 700, help: TOKEN_HELP }),
        pairList('tiles', 'Tiles', 'tile', 4),
      ],
      defaults: {
        eyebrow: 'Reference library',
        heading: 'The charts we work from at the counter.',
        heading_emphasis: 'Published in full, free to use.',
        body: 'Thread dimensions for {connectionTypes} connection types, {crimpSettings} crimp settings, {ratings} published pressure ratings and {terms} defined terms. Every figure is an HTML table you can search, copy and cite — no PDFs, no sign-in, and each page says where its numbers come from.',
        tiles: [
          { label: 'Connection types charted', value: '{connectionTypes}' },
          { label: 'Crimp settings', value: '{crimpSettings}' },
          { label: 'Pressure ratings', value: '{ratings}' },
          { label: 'Terms defined', value: '{terms}' },
        ],
      },
    },
    {
      key: 'manifest',
      label: 'Manifest strip',
      description: 'The navy band of facts under the hero.',
      fields: [pairList('items', 'Facts', 'fact', 6)],
      defaults: {
        items: [
          { label: 'Units', value: 'Inch · mm' },
          { label: 'Pressure', value: 'psi · bar' },
          { label: 'Standards', value: 'SAE · ISO · ASME' },
          { label: 'Format', value: 'HTML tables, no PDFs' },
          { label: 'Access', value: 'Free · no sign-in' },
          { label: 'Checked', value: '{checked}' },
        ],
      },
    },
    {
      key: 'references',
      label: 'Reference pages',
      description: 'The four reference cards.',
      dataNote: 'The cards, their figures and their order come from the resources registry in code.',
      fields: [eyebrow(), heading({ max: 120 }), area('body', 'Introduction', { max: 400 })],
      defaults: {
        eyebrow: 'References',
        heading: 'Four references, each one a table you can check a part against.',
        body: 'Built from the published standards and the maker’s own figures, and cross-checked against each other. Where the sources disagreed, the page says which one won.',
      },
    },
    {
      key: 'calculators',
      label: 'Calculators and identifiers',
      description: 'The three existing tools under /tools.',
      dataNote: 'The tools listed are the ones under /tools; the list is in code.',
      fields: [eyebrow(), heading({ max: 120 }), area('body', 'Introduction', { max: 400 })],
      defaults: {
        eyebrow: 'Calculators',
        heading: 'For when the question is a conversion, not a lookup.',
        body: 'Three smaller tools that answer one question each.',
      },
    },
    {
      key: 'guides',
      label: 'Guides',
      description: 'Posts that use the charts.',
      dataNote: 'The posts are listed by slug in code; titles come from the blog, and an unpublished post drops out.',
      fields: [eyebrow(), heading({ max: 120 })],
      defaults: {
        eyebrow: 'Read with the charts',
        heading: 'The articles that explain what the numbers mean.',
      },
    },
    {
      key: 'cta',
      label: 'Closing call to action',
      description: 'The navy band on the hub and on every reference page.',
      dataNote:
        'Shown on all five pages. The WhatsApp, email and phone links build from System · Settings, and a button with no value set is dropped.',
      fields: [
        eyebrow(),
        heading({ max: 160 }),
        text('heading_emphasis', 'Heading (italic ending)', { max: 100, optional: true }),
        area('body', 'Body', { max: 600 }),
        {
          key: 'checklist',
          label: 'What to send',
          kind: 'list',
          itemLabel: 'item',
          max: 5,
          fields: [{ key: 'text', label: 'Item', kind: 'text', max: 120 }],
        },
        text('whatsapp_cta_label', 'WhatsApp button label', { max: 60, optional: true }),
        text('email_cta_label', 'Email button label', { max: 60, optional: true }),
        text('phone_prefix', 'Text before the phone number', { max: 60, optional: true }),
      ],
      defaults: {
        eyebrow: 'Still not sure',
        heading: 'If the chart does not settle it,',
        heading_emphasis: 'send us the part.',
        body: 'A photograph and two measurements are usually enough for us to name the fitting, the hose or the crimp setting, and quote the replacement the same day.',
        checklist: [
          { text: 'A photo of each end, with a rule or calipers in shot' },
          { text: 'The thread O.D. and the pitch, if you have a gauge' },
          { text: 'The text printed along the hose' },
          { text: 'What it connects to, and the working pressure' },
        ],
        whatsapp_cta_label: 'WhatsApp a photo',
        email_cta_label: 'Email the counter',
        phone_prefix: 'Or call',
      },
    },
  ],
}
