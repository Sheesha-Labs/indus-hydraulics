import { area, ctaPair, eyebrow, heading, statList, text } from '../fields'
import type { MasterPageDef } from '../types'

export const INDUSTRIES_PAGE: MasterPageDef = {
  key: 'industries',
  label: 'Industries',
  path: '/industries',
  description: 'The industries index.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Eyebrow, headline and the paragraph beside it.',
      locked: true,
      fields: [eyebrow(), heading({ max: 200 }), area('body', 'Body', { max: 400 })],
      defaults: {
        eyebrow: 'INDUSTRIES WE SERVE',
        heading: 'Specialist supply for the industries that cannot stop.',
        body: 'From oil well to wind turbine, from underground mine to floating drydock — our engineers understand your application, not just your part number.',
      },
    },
    {
      key: 'stats',
      label: 'Figures strip',
      description: 'The four numbers under the hero.',
      fields: [statList(4, 'Figures')],
      defaults: {
        stats: [
          { value: '{industries}', label: 'Industries served' },
          { value: '{skus}', label: 'Live SKUs' },
          { value: '47', label: 'Countries shipped' },
          { value: '{years} yrs', label: 'Specialist experience' },
        ],
      },
    },
    {
      key: 'grid',
      label: 'Industry cards',
      description: 'The grid of published industries.',
      dataNote:
        'The cards are the published industries in the order set under Catalogue · Industries. Their names, taglines, chips and colours are edited there.',
      fields: [text('cta_label', 'Link text on a card', { max: 60 })],
      defaults: { cta_label: 'View solutions' },
    },
    {
      key: 'cta',
      label: 'Closing call to action',
      description: 'The band at the foot of the page.',
      fields: [
        heading({ max: 200 }),
        area('body', 'Body', { max: 320 }),
        ...ctaPair('primary', 'Primary button label'),
        ...ctaPair('secondary', 'Secondary button label'),
      ],
      defaults: {
        heading: 'Don’t see your industry listed?',
        body: 'We supply hydraulic components across many more applications. Send us your part number or specification.',
        primary_cta_label: 'Submit an RFQ →',
        primary_cta_href: '/quote',
        secondary_cta_label: 'Contact us',
        secondary_cta_href: '/contact',
      },
    },
  ],
}
