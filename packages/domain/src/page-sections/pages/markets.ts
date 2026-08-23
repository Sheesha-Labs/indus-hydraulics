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

export const MARKETS_PAGE: MasterPageDef = {
  key: 'markets',
  label: 'Export markets',
  path: '/markets',
  description: 'The hub for every export-market page.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Headline, standfirst, the two buttons and the four tiles beside them.',
      locked: true,
      fields: [
        eyebrow(),
        heading({ max: 120 }),
        area('body', 'Standfirst', {
          max: 700,
          help: 'Use {markets} and {regions} for the live counts.',
        }),
        text('primary_cta_label', 'Primary button label', { max: 60, optional: true }),
        text('whatsapp_cta_label', 'WhatsApp button label', { max: 60, optional: true }),
        pairList('tiles', 'Tiles', 'tile', 4),
      ],
      defaults: {
        eyebrow: 'Export from Dubai',
        heading: 'Export markets',
        body: 'We ship hydraulic hose, fittings, adapters, valves and industrial hose from our Dubai warehouse to {markets} destinations. Every lane below is a real one: a named origin, a named port or border crossing, and documents prepared here before the goods leave. Follow any country through for its transit times, conformity set and delivery cities.',
        primary_cta_label: 'Request an export quote',
        whatsapp_cta_label: 'WhatsApp the export desk',
        tiles: [
          { label: 'Destinations served', value: '{markets}' },
          { label: 'Regions', value: '{regions}' },
          { label: 'Stated transit bands', value: '{transitBands}' },
          { label: 'Origin', value: 'Jebel Ali' },
        ],
      },
    },
    {
      key: 'manifest',
      label: 'Manifest strip',
      description: 'The navy band of six facts under the hero.',
      fields: [
        pairList('items', 'Facts', 'fact', 8),
      ],
      defaults: {
        items: [
          { label: 'Origin', value: 'Jebel Ali · Dubai' },
          { label: 'Modes', value: 'Road · Sea · Air' },
          { label: 'Incoterms', value: 'DAP · CIF · FOB · EXW' },
          { label: 'Docs prepared', value: 'Before dispatch, in Dubai' },
          { label: 'Quoted in', value: 'AED · USD · EUR' },
          // {hours} is the export desk's opening hours from System · Settings.
          { label: 'Export desk', value: '{hours}' },
        ],
      },
    },
    {
      key: 'regions',
      label: 'Regional sections',
      description: 'The eleven regional bands of country cards.',
      dataNote:
        'The regions and the countries in them come from the market registry in code. Adding a market is a content change made there, not here.',
      fields: [],
      defaults: {},
    },
    {
      key: 'cta',
      label: 'Closing call to action',
      description: 'The navy band and the enquiry form beside it.',
      dataNote:
        'The WhatsApp, email and phone links build from the values in System · Settings, and a button with no value set is dropped rather than shipped dead.',
      fields: [
        eyebrow(),
        heading({ max: 160 }),
        area('body', 'Body', { max: 700 }),
        text('whatsapp_cta_label', 'WhatsApp button label', { max: 60, optional: true }),
        text('email_cta_label', 'Email button label', { max: 60, optional: true }),
        text('phone_prefix', 'Text before the phone number', { max: 60, optional: true }),
        text('phone_suffix', 'Text after the phone number', { max: 60, optional: true }),
      ],
      defaults: {
        eyebrow: 'Next step',
        heading: 'Not seeing your country?',
        // The second sentence is the compliance line. It is said once, in the
        // register of how we quote, rather than badged onto individual market
        // cards — badging read as a political statement about those countries.
        body: 'Tell us the destination and the part numbers and we will quote the lane, the documents and the freight together. Where a market needs counterparty and end-use screening we say so before quoting rather than after.',
        whatsapp_cta_label: 'WhatsApp us',
        email_cta_label: 'Email the export desk',
        phone_prefix: 'Plant-down? Call',
        phone_suffix: '— 24/7',
      },
    },
  ],
}
