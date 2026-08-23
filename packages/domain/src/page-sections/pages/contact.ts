import { area, ctaPair, eyebrow, faqList, heading, statList, text } from '../fields'
import type { MasterPageDef } from '../types'

/**
 * Icons the "How can we help?" tiles may carry.
 *
 * Declared as a fixed option set rather than a free-text field so the names an
 * editor can pick and the names the renderer can resolve are the same list —
 * a typo'd icon name would otherwise render as a blank square with no warning
 * anywhere.
 */
export const HELP_TILE_ICONS = [
  { value: 'quote', label: 'Quote / document' },
  { value: 'replacement', label: 'Replacement part' },
  { value: 'catalogue', label: 'Catalogue' },
  { value: 'brands', label: 'Brands' },
  { value: 'service', label: 'Repairs / service' },
  { value: 'industry', label: 'Industry' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'documents', label: 'Documents' },
] as const

export const CONTACT_PAGE: MasterPageDef = {
  key: 'contact',
  label: 'Contact',
  path: '/contact',
  description: 'How to reach us, and where an enquiry should go instead.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Headline, standfirst and the three response promises.',
      locked: true,
      fields: [
        eyebrow(),
        heading({ label: 'Headline (first part)', max: 120 }),
        text('heading_emphasis', 'Headline (italic ending)', {
          max: 80,
          optional: true,
          help: 'Set in italic serif, closing the sentence.',
        }),
        area('body', 'Standfirst', { max: 400 }),
        statList(3, 'Response promises'),
      ],
      defaults: {
        eyebrow: 'Contact · we pick up the phone',
        heading: 'Talk to a real',
        heading_emphasis: 'applications engineer.',
        body: 'Send us a circuit diagram, a part number, or a photo of the failure. We’ll respond within 4 business hours — often within minutes on WhatsApp.',
        stats: [
          { value: '< 15 min', label: 'WhatsApp reply' },
          { value: '4 hrs', label: 'Email response' },
          { value: '30 min', label: 'Plant-down callback' },
        ],
      },
    },
    {
      key: 'channels',
      label: 'Channels and form',
      description: 'The RFQ card beside the contact form.',
      dataNote:
        'The phone, WhatsApp, email and address themselves come from System · Settings, and a channel with no value set is dropped rather than shown blank.',
      fields: [
        text('rfq_heading', 'RFQ card heading', { max: 80 }),
        area('rfq_body', 'RFQ card body', { max: 320 }),
        ...ctaPair('rfq', 'RFQ button label'),
        text('hours_label', 'Opening-hours heading', { max: 60 }),
      ],
      defaults: {
        rfq_heading: 'Prefer to submit a formal RFQ?',
        rfq_body: 'Use the quote builder to add specific SKUs with quantities and we’ll respond with pricing within 4 business hours.',
        rfq_cta_label: 'Submit an RFQ →',
        rfq_cta_href: '/quote',
        hours_label: 'Opening hours',
      },
    },
    {
      key: 'office',
      label: 'Head office',
      description: 'The map panel and the note under it.',
      dataNote: 'The address, map pin and opening hours come from the office record in code.',
      fields: [
        area('note', 'Note under the map', {
          max: 320,
          help: 'Use {hours} for the live counter hours.',
        }),
      ],
      defaults: {
        note: 'Counter and warehouse: {hours}. Outside those hours, WhatsApp reaches the on-call engineer.',
      },
    },
    {
      key: 'help',
      label: 'How can we help?',
      description: 'The tile grid that routes an enquiry to the page that answers it.',
      fields: [
        eyebrow(),
        heading({ label: 'Heading (first part)', max: 160 }),
        text('heading_emphasis', 'Heading (italic ending)', { max: 80, optional: true }),
        area('body', 'Intro', { max: 320 }),
        {
          key: 'items',
          label: 'Tiles',
          kind: 'list',
          itemLabel: 'tile',
          max: 12,
          fields: [
            { key: 'enabled', label: 'Show this tile', kind: 'toggle' },
            { key: 'name', label: 'Label', kind: 'text', max: 80 },
            { key: 'desc', label: 'Sub-label', kind: 'text', max: 120 },
            { key: 'href', label: 'Link', kind: 'link', max: 240, optional: true },
            {
              key: 'icon',
              label: 'Icon',
              kind: 'select',
              options: HELP_TILE_ICONS,
              placeholder: 'Default arrow',
            },
          ],
        },
      ],
      defaults: {
        eyebrow: 'How can we help?',
        heading: 'Some answers don’t need',
        heading_emphasis: 'to wait for us.',
        body: 'Pick the route that matches your enquiry — or send the message anyway and we’ll point you at the right engineer.',
        items: [
          { enabled: true, name: 'Request a quote', desc: 'Add SKUs and quantities, priced within 4 hours', href: '/quote', icon: 'quote' },
          { enabled: true, name: 'Find a replacement part', desc: 'Cross-reference a competitor part number', href: '/replacement', icon: 'replacement' },
          { enabled: true, name: 'Browse the catalogue', desc: 'Hoses, fittings, valves, pumps, seals and lubricants', href: '/c', icon: 'catalogue' },
          { enabled: true, name: 'Brands we stock', desc: 'Bosch Rexroth, Parker, Atos, Hydac, Molykote and more', href: '/brands', icon: 'brands' },
          { enabled: true, name: 'Repairs and on-site service', desc: 'Cylinder, hose, pump and BOP jobs, written up as cases', href: '/services', icon: 'service' },
          { enabled: true, name: 'Your industry', desc: 'Oil and gas, marine, mining, steel, construction', href: '/industries', icon: 'industry' },
        ],
      },
    },
    {
      key: 'faq',
      label: 'FAQ',
      description: 'The questions asked before anyone fills the form.',
      dataNote:
        'These answers are published to Google as FAQ structured data, so they must match the visible text exactly — which they do, because both read this list.',
      fields: [eyebrow(), heading({ max: 160 }), area('body', 'Intro', { max: 320 }), faqList(14)],
      defaults: {
        eyebrow: 'Before you ask',
        heading: 'Frequently asked questions',
        body: 'Can’t find your answer? Call us or use WhatsApp — those are the fastest channels.',
        items: [
          { q: 'How fast do you respond to RFQs?', a: 'Routine RFQs within 1 business day. Priority within 4 working hours. Plant-down within 30 minutes, 24/7.' },
          { q: 'Do you supply to customers outside the UAE?', a: 'Yes — we ship across the GCC, wider MENA and beyond. Contact us for freight terms and lead times to your country.' },
          { q: 'Can I get a sample or trial unit?', a: 'For qualified projects above a threshold value, we can arrange trial units with a deposit. Speak to your sales engineer.' },
          { q: 'Do you offer on-site commissioning?', a: 'Yes, for hydraulic systems we supply. Our certified technicians cover major industrial sites across the UAE and partner regions.' },
          { q: 'What brands do you stock?', a: 'Bosch Rexroth, Parker Hannifin, Atos, Hydac, Stauff, Eaton Vickers, Sun Hydraulics, and more. Full brand list on our brands page.' },
        ],
      },
    },
  ],
}
