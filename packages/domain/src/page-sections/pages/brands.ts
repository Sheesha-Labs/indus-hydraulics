import { area, eyebrow, heading, text } from '../fields'
import type { MasterPageDef } from '../types'

export const BRANDS_PAGE: MasterPageDef = {
  key: 'brands',
  label: 'Brands',
  path: '/brands',
  description: 'The brand index.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Eyebrow, headline and the paragraph under it.',
      locked: true,
      fields: [
        eyebrow({ max: 120, help: 'Use {brands} for the live count.' }),
        heading({ max: 160 }),
        area('body', 'Body', { max: 500 }),
      ],
      defaults: {
        eyebrow: '{brands} Authorised partnerships · OEM sourcing',
        heading: 'Our brands',
        body: 'Authorised distributor, importer or channel partner for the brands below. We supply genuine parts only — every SKU is OEM-traceable with batch certificates on request.',
      },
    },
    {
      key: 'grid',
      label: 'Brand cards',
      description: 'The grid of published brands.',
      dataNote:
        'The cards are the published brands, alphabetically. Their names, countries, blurbs and logos are edited under Catalogue · Brands.',
      fields: [
        text('cta_authorised', 'Link text on an authorised-distributor card', { max: 60 }),
        text('cta_default', 'Link text on every other card', { max: 60 }),
        text('empty_message', 'Message when no brand is published', { max: 160, optional: true }),
      ],
      defaults: {
        cta_authorised: 'Authorised distributor →',
        cta_default: 'View products →',
        empty_message: 'No brands published yet.',
      },
    },
  ],
}
